import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Json = Record<string, unknown>;
type SearchRow = {
  id: string;
  query: string;
  canonical_query: string;
  dimension_values?: Json | null;
};
type SearchResult = {
  position: number;
  url: string;
  domain: string;
  title: string | null;
};

const PROVIDER = "duckduckgo_html";
const DATABASE = "duckduckgo_web_gb";
const MAX_QUERIES = 12;
const MAX_RESULTS = 15;
const CORS = {
  "Access-Control-Allow-Origin": "https://getinksights.co.uk",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: CORS });
const clean = (value: unknown, max = 500) =>
  String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max);
const canonical = (value: unknown) => clean(value, 500).toLowerCase();
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function domainOf(url: string | null): string {
  try {
    return new URL(url ?? "").hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function decodeHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#(\d+);/g, (_, value) => {
      const code = Number(value);
      return Number.isFinite(code) ? String.fromCodePoint(code) : "";
    })
    .replace(/\s+/g, " ")
    .trim();
}

function unwrapDuckDuckGoUrl(rawHref: string): string | null {
  const href = rawHref.replace(/&amp;/gi, "&").trim();
  try {
    const candidate = new URL(href, "https://html.duckduckgo.com");
    if (candidate.hostname.endsWith("duckduckgo.com") && candidate.pathname.startsWith("/l/")) {
      const uddg = candidate.searchParams.get("uddg");
      if (uddg) {
        const decoded = decodeURIComponent(uddg);
        const target = new URL(decoded);
        return ["http:", "https:"].includes(target.protocol) ? target.toString() : null;
      }
    }
    return ["http:", "https:"].includes(candidate.protocol) ? candidate.toString() : null;
  } catch {
    return null;
  }
}

function parseDuckDuckGo(html: string): SearchResult[] {
  const results: SearchResult[] = [];
  const anchorPattern = /<a[^>]*class=["'][^"']*result__a[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = anchorPattern.exec(html)) && results.length < MAX_RESULTS) {
    const url = unwrapDuckDuckGoUrl(match[1]);
    if (!url) continue;
    const domain = domainOf(url);
    if (!domain || domain.endsWith("duckduckgo.com")) continue;
    results.push({
      position: results.length + 1,
      url,
      domain,
      title: clean(decodeHtml(match[2]), 500) || null,
    });
  }
  return results;
}

async function duckDuckGoSearch(query: string): Promise<{ status: number; results: SearchResult[] }> {
  const params = new URLSearchParams({ q: query, kl: "uk-en" });
  const response = await fetch(`https://html.duckduckgo.com/html/?${params.toString()}`, {
    method: "GET",
    redirect: "follow",
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-GB,en;q=0.9",
      Referer: "https://html.duckduckgo.com/",
      "User-Agent": "Mozilla/5.0 (compatible; INKSIGHTS/1.0; +https://getinksights.co.uk)",
    },
    signal: AbortSignal.timeout(12_000),
  });
  const html = await response.text();
  if (!response.ok) throw new Error(`duckduckgo_http_${response.status}`);
  const results = parseDuckDuckGo(html);
  if (!results.length) {
    const challenge = /anomaly|captcha|bot|challenge/i.test(html) ? "_bot_challenge" : "";
    throw new Error(`duckduckgo_no_results${challenge}`);
  }
  return { status: response.status, results };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);

  let pipelineId: string | null = null;
  try {
    const body = await req.json() as Json;
    const reportRunId = clean(body.report_run_id, 80);
    const publicToken = clean(body.public_token, 160);
    if (!reportRunId || !publicToken) {
      return json({ ok: false, error: "report_run_id and public_token are required" }, 400);
    }

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const report = await sb
      .from("visibility_report_runs")
      .select("id,studio_id,status,public_token")
      .eq("id", reportRunId)
      .eq("public_token", publicToken)
      .single();
    if (report.error || !report.data) return json({ ok: false, error: "Invalid report" }, 404);
    if (!["analysing", "qa"].includes(report.data.status)) {
      return json({ ok: false, error: "Report is not eligible for fallback collection" }, 409);
    }

    const existing = await sb
      .from("visibility_pipeline_runs")
      .select("id,status")
      .eq("report_run_id", reportRunId)
      .eq("provider", PROVIDER)
      .in("status", ["started", "partial", "success"])
      .limit(1);
    if (existing.error) throw new Error(`fallback_check:${existing.error.message}`);
    if ((existing.data ?? []).length) {
      return json({ ok: true, status: existing.data![0].status, alreadyProcessed: true }, 200);
    }

    const studio = await sb
      .from("visibility_studios")
      .select("id,studio_name,website_url,town")
      .eq("id", report.data.studio_id)
      .single();
    if (studio.error) throw new Error(`studio_lookup:${studio.error.message}`);

    const universe = await sb
      .from("visibility_search_universe")
      .select("id,query,canonical_query,dimension_values")
      .eq("report_run_id", reportRunId)
      .eq("semantic_valid", true)
      .limit(MAX_QUERIES);
    if (universe.error) throw new Error(`search_universe_lookup:${universe.error.message}`);
    const searches = (universe.data ?? []) as SearchRow[];
    if (!searches.length) throw new Error("search_universe_empty");

    const pipe = await sb.from("visibility_pipeline_runs").insert({
      studio_id: studio.data.id,
      report_run_id: reportRunId,
      provider: PROVIDER,
      stage: "search_intelligence_fallback",
      status: "started",
      input_payload: {
        provider: PROVIDER,
        query_count: searches.length,
        reason: "No configured primary search provider",
      },
    }).select("id").single();
    if (pipe.error) throw new Error(`pipeline_insert:${pipe.error.message}`);
    pipelineId = pipe.data.id;

    const observedAt = new Date().toISOString();
    const studioDomain = domainOf(studio.data.website_url);
    const competitorCounts = new Map<string, { queries: Set<string>; bestPosition: number | null }>();
    let queriesObserved = 0;
    let resultsWritten = 0;
    let studioPositionsObserved = 0;
    const failures: Array<{ query: string; error: string }> = [];

    for (const row of searches) {
      try {
        const found = await duckDuckGoSearch(row.query);
        queriesObserved += 1;

        const providerObservation = await sb.from("visibility_provider_observations").insert({
          pipeline_run_id: pipelineId,
          report_run_id: reportRunId,
          studio_id: studio.data.id,
          provider: PROVIDER,
          endpoint: "html_search",
          request_payload: { query: row.query, region: "uk-en", max_results: MAX_RESULTS },
          response_payload: { result_count: found.results.length },
          response_status: found.status,
          units_consumed: 0,
          observed_at: observedAt,
        });
        if (providerObservation.error) throw new Error(`provider_observation:${providerObservation.error.message}`);

        let providerStudioPosition: number | null = null;
        const serpRows = found.results.map((result) => {
          const isStudio = Boolean(studioDomain && result.domain === studioDomain);
          if (isStudio && providerStudioPosition === null) providerStudioPosition = result.position;
          if (!isStudio) {
            const entry = competitorCounts.get(result.domain) ?? { queries: new Set<string>(), bestPosition: null };
            entry.queries.add(row.query);
            entry.bestPosition = entry.bestPosition === null
              ? result.position
              : Math.min(entry.bestPosition, result.position);
            competitorCounts.set(result.domain, entry);
          }
          return {
            studio_id: studio.data.id,
            report_run_id: reportRunId,
            search_universe_id: row.id,
            query: row.query,
            database: DATABASE,
            result_position: result.position,
            result_type: "web",
            domain: result.domain,
            url: result.url,
            title: result.title,
            is_studio: isStudio,
            is_competitor: !isStudio,
            source_provider: PROVIDER,
            observed_at: observedAt,
            raw_data: { provider: PROVIDER, scope: "provider_specific_web_result" },
          };
        });

        const inserted = await sb.from("visibility_serp_observations").insert(serpRows);
        if (inserted.error) throw new Error(`serp_insert:${inserted.error.message}`);
        resultsWritten += serpRows.length;
        if (providerStudioPosition !== null) studioPositionsObserved += 1;

        const dimensions = {
          ...(row.dimension_values ?? {}),
          serp_observed: true,
          serp_provider: PROVIDER,
          serp_database: DATABASE,
          provider_position: providerStudioPosition,
          demand_measured: false,
        };
        const updated = await sb.from("visibility_search_universe").update({
          dimension_values: dimensions,
          serp_features: {
            provider: PROVIDER,
            database: DATABASE,
            provider_position: providerStudioPosition,
            result_count: found.results.length,
            note: "DuckDuckGo web-result observation. This is not a Google ranking and does not quantify search volume.",
          },
          lsos: 0,
          status: "candidate",
          updated_at: observedAt,
        }).eq("id", row.id);
        if (updated.error) throw new Error(`search_universe_update:${updated.error.message}`);
      } catch (error) {
        failures.push({
          query: row.query,
          error: error instanceof Error ? error.message : "unknown_error",
        });
      }
      await sleep(250);
    }

    if (!queriesObserved) {
      throw new Error(`fallback_no_queries_observed:${failures.map((item) => item.error).join(",").slice(0, 400)}`);
    }

    const competitorDomains = [...competitorCounts.entries()]
      .sort((a, b) => b[1].queries.size - a[1].queries.size)
      .slice(0, 25)
      .map(([domain, info]) => ({
        domain,
        query_overlap: info.queries.size,
        best_observed_position: info.bestPosition,
      }));

    for (const competitor of competitorDomains) {
      const info = competitorCounts.get(competitor.domain)!;
      const inserted = await sb.from("visibility_competitor_observations").insert({
        studio_id: studio.data.id,
        report_run_id: reportRunId,
        competitor_name: competitor.domain,
        domain: competitor.domain,
        query: [...info.queries].join(" | "),
        rank: competitor.best_observed_position,
        visibility_share: searches.length
          ? Math.round((competitor.query_overlap / searches.length) * 10000) / 100
          : null,
        keyword_overlap: competitor.query_overlap,
        source_provider: PROVIDER,
        observed_at: observedAt,
        raw_data: {
          scope: "provider_specific_web_result",
          note: "Observed competing result domain; not yet verified as a tattoo-studio business entity.",
        },
      });
      if (inserted.error) throw new Error(`competitor_insert:${inserted.error.message}`);
    }

    const pipelineStatus = failures.length ? "partial" : "partial";
    await sb.from("visibility_pipeline_runs").update({
      status: pipelineStatus,
      records_read: searches.length,
      records_written: resultsWritten + competitorDomains.length,
      output_payload: {
        queries_attempted: searches.length,
        queries_observed: queriesObserved,
        result_observations: resultsWritten,
        observed_studio_positions: studioPositionsObserved,
        competing_domains: competitorDomains.length,
        failures,
        demand_status: "not_quantified",
      },
      completed_at: new Date().toISOString(),
    }).eq("id", pipelineId);

    const reportUpdate = await sb.from("visibility_report_runs").update({
      status: "qa",
      search_demand: {
        provider: "not_quantified",
        measured: false,
        generated_candidates: searches.length,
        note: "Absolute monthly search demand has not been measured. No demand score or LSOS is presented.",
      },
      current_visibility: {
        provider: PROVIDER,
        database: DATABASE,
        queries_observed: queriesObserved,
        observed_results: resultsWritten,
        observed_studio_positions: studioPositionsObserved,
        google_rankings_measured: false,
        note: "Provider-specific DuckDuckGo web observations; not represented as Google rankings.",
      },
      competitor_intelligence: {
        provider: PROVIDER,
        competing_result_domains: competitorDomains,
        note: "Domains are observed competing search results and require business-identity QA before being described as direct studio competitors.",
      },
      commercial_opportunity: {
        status: "not_calculated",
        reason: "Search demand and first-party conversion/booking attribution are not connected.",
      },
      methodology: {
        provider: PROVIDER,
        demand: "not quantified",
        serp: "DuckDuckGo HTML web-result observations used as a no-credential fallback",
        ranking_scope: "provider-specific observation; not Google rank",
        lsos: "not scored because absolute demand is unmeasured",
        revenue: "not calculated until first-party attribution is connected",
      },
      qa_checks: {
        provider_run_completed: true,
        pipeline_status: pipelineStatus,
        search_provider_configured: true,
        fallback_provider: PROVIDER,
        demand_quantified: false,
        google_rankings_measured: false,
        queries_attempted: searches.length,
        queries_observed: queriesObserved,
        observed_results: resultsWritten,
        observed_studio_positions: studioPositionsObserved,
        failed_queries: failures.length,
        financial_assumptions_used: false,
      },
    }).eq("id", reportRunId);
    if (reportUpdate.error) throw new Error(`report_update:${reportUpdate.error.message}`);

    return json({
      ok: true,
      status: pipelineStatus,
      provider: PROVIDER,
      reportRunId,
      pipelineRunId: pipelineId,
      queriesObserved,
      resultsWritten,
      studioPositionsObserved,
      competitorDomains,
      failures,
    });
  } catch (error) {
    if (pipelineId) {
      try {
        const sb = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        );
        await sb.from("visibility_pipeline_runs").update({
          status: "failed",
          error_message: error instanceof Error ? error.message : "unknown_error",
          completed_at: new Date().toISOString(),
        }).eq("id", pipelineId);
      } catch {
        // Do not mask the primary failure.
      }
    }
    console.error(error);
    return json({
      ok: false,
      status: "failed",
      error: error instanceof Error ? error.message : "Unable to run fallback search intelligence.",
      pipelineRunId: pipelineId,
    }, 500);
  }
});