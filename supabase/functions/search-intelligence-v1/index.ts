import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Json = Record<string, unknown>;
type SearchRow = {
  id: string;
  query: string;
  canonical_query: string;
  demand: number;
  commercial_intent: number;
  local_relevance: number;
  conversion_potential: number;
  studio_relevance: number;
  capability: number;
  dimension_values?: Json | null;
};
type NormalizedResult = {
  position: number | null;
  url: string | null;
  domain: string | null;
  title: string | null;
  result_type: string;
  raw: unknown;
};
type ExternalObservation = {
  query: string;
  database?: string;
  results: Array<{
    position?: number | null;
    url?: string | null;
    domain?: string | null;
    title?: string | null;
    result_type?: string | null;
  }>;
  demand?: {
    kind?: "absolute_search_volume" | "relative_index" | "observed_presence";
    value?: number | null;
    source?: string | null;
    period?: string | null;
  };
};

const CORS = {
  "Access-Control-Allow-Origin": "https://getinksights.co.uk",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: CORS });
const clean = (v: unknown, max = 500) => String(v ?? "").trim().replace(/\s+/g, " ").slice(0, max);
const canonical = (v: unknown) => clean(v, 500).toLowerCase();
const domainOf = (url: string | null) => {
  try { return new URL(url ?? "").hostname.replace(/^www\./, "").toLowerCase(); } catch { return ""; }
};
const demandScore = (volume: number) => Math.round(Math.max(0, Math.min(100, 20 + Math.log(Math.max(volume, 0) + 1) * 12)) * 100) / 100;
const rankOpportunity = (rank: number | null) => rank === null ? 100 : rank <= 3 ? 15 : rank <= 10 ? 55 : rank <= 20 ? 80 : 100;
const lso = (d: number, i: number, l: number, p: number, c: number, r: number, cap: number) =>
  Math.round(Math.max(0, Math.min(100, (d * i * l * p * c * r * cap) / 1e12)) * 100) / 100;

async function dfs(path: string, body: unknown, login: string, password: string) {
  const auth = btoa(`${login}:${password}`);
  const response = await fetch(`https://api.dataforseo.com/v3/${path}`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  let data: Json;
  try { data = JSON.parse(text); } catch { throw new Error(`dataforseo_invalid_response:${response.status}`); }
  if (!response.ok || data.status_code !== 20000) throw new Error(`dataforseo_error:${response.status}:${clean(data.status_message, 240)}`);
  return data;
}

async function braveSearch(query: string, apiKey: string): Promise<{ status: number; results: NormalizedResult[] }> {
  const params = new URLSearchParams({ q: query, country: "gb", search_lang: "en", count: "20", safesearch: "moderate" });
  const response = await fetch(`https://api.search.brave.com/res/v1/web/search?${params.toString()}`, {
    headers: { Accept: "application/json", "X-Subscription-Token": apiKey },
    signal: AbortSignal.timeout(12_000),
  });
  const data = await response.json() as Json;
  if (!response.ok) throw new Error(`brave_search_error:${response.status}:${clean((data as Json).message, 180)}`);
  const web = (data.web ?? {}) as Json;
  const items = Array.isArray(web.results) ? web.results as Json[] : [];
  return {
    status: response.status,
    results: items.map((item, index) => {
      const url = clean(item.url, 1000) || null;
      return {
        position: index + 1,
        url,
        domain: clean(item.profile && typeof item.profile === "object" ? (item.profile as Json).long_name : "", 500) || domainOf(url),
        title: clean(item.title, 500) || null,
        result_type: "web",
        raw: { age: item.age ?? null, language: item.language ?? null, subtype: item.subtype ?? null },
      };
    }),
  };
}

function normalizeExternal(value: unknown): ExternalObservation[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).flatMap((raw) => {
    if (!raw || typeof raw !== "object") return [];
    const row = raw as Json;
    const query = clean(row.query, 500);
    if (!query || !Array.isArray(row.results)) return [];
    const results = (row.results as unknown[]).slice(0, 50).flatMap((result) => {
      if (!result || typeof result !== "object") return [];
      const r = result as Json;
      const positionRaw = Number(r.position ?? 0);
      return [{
        position: Number.isFinite(positionRaw) && positionRaw > 0 ? Math.trunc(positionRaw) : null,
        url: clean(r.url, 1000) || null,
        domain: clean(r.domain, 500) || null,
        title: clean(r.title, 500) || null,
        result_type: clean(r.result_type, 80) || "web",
      }];
    });
    const demand = row.demand && typeof row.demand === "object" ? row.demand as ExternalObservation["demand"] : undefined;
    return [{ query, database: clean(row.database, 120) || "external_web_observation", results, demand }];
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
  let pipelineId: string | null = null;
  try {
    const body = await req.json() as Json;
    const reportRunId = clean(body.report_run_id, 80);
    if (!reportRunId) return json({ ok: false, error: "report_run_id is required" }, 400);

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const run = await sb.from("visibility_report_runs").select("id,studio_id,status").eq("id", reportRunId).single();
    if (run.error) throw new Error(`report_lookup:${run.error.message}`);
    const studio = await sb.from("visibility_studios").select("id,studio_name,website_url,town").eq("id", run.data.studio_id).single();
    if (studio.error) throw new Error(`studio_lookup:${studio.error.message}`);

    const rows = await sb.from("visibility_search_universe")
      .select("id,query,canonical_query,demand,commercial_intent,local_relevance,conversion_potential,studio_relevance,capability,dimension_values")
      .eq("report_run_id", reportRunId).eq("semantic_valid", true).limit(1000);
    if (rows.error) throw new Error(`search_universe_lookup:${rows.error.message}`);
    const searches = (rows.data ?? []) as SearchRow[];
    if (!searches.length) throw new Error("search_universe_empty");

    const external = normalizeExternal(body.observations);
    const requestedProvider = (clean(body.provider, 80) || "auto").toLowerCase();
    const dfsLogin = Deno.env.get("DATAFORSEO_LOGIN") ?? "";
    const dfsPassword = Deno.env.get("DATAFORSEO_PASSWORD") ?? "";
    const braveKey = Deno.env.get("BRAVE_SEARCH_API_KEY") ?? "";
    let provider = requestedProvider;
    if (provider === "auto") {
      provider = external.length ? "external_observation" : (dfsLogin && dfsPassword) ? "dataforseo" : braveKey ? "brave" : "none";
    }
    if (provider === "external" || provider === "research_web") provider = "external_observation";

    const pipe = await sb.from("visibility_pipeline_runs").insert({
      studio_id: studio.data.id,
      report_run_id: reportRunId,
      provider,
      stage: "search_intelligence",
      status: "started",
      input_payload: { provider, requested_provider: requestedProvider, query_count: searches.length },
    }).select("id").single();
    if (pipe.error) throw new Error(`pipeline_insert:${pipe.error.message}`);
    pipelineId = pipe.data.id;

    if (provider === "none") {
      const reason = "No automated search provider is configured. Supply normalized external observations or configure a provider adapter.";
      await sb.from("visibility_pipeline_runs").update({ status: "blocked", error_message: reason, completed_at: new Date().toISOString() }).eq("id", pipelineId);
      await sb.from("visibility_report_runs").update({
        status: "analysing",
        search_demand: { provider: "not_quantified", measured: false },
        current_visibility: { provider: "pending_external_observation", rankings_measured: 0 },
        qa_checks: { search_provider_configured: false, provider_blocked_reason: reason, financial_assumptions_used: false },
      }).eq("id", reportRunId);
      return json({ ok: false, status: "blocked", provider, reason, pipelineRunId: pipelineId }, 503);
    }

    if (provider === "dataforseo") {
      if (!dfsLogin || !dfsPassword) throw new Error("DATAFORSEO_LOGIN/DATAFORSEO_PASSWORD not configured");
      const now = new Date().toISOString();
      const location = `${studio.data.town}, United Kingdom`;
      const api = await dfs("keywords_data/google_ads/search_volume/live", [{ keywords: searches.map((x) => x.query), language_code: "en", location_name: location, include_serp_info: false }], dfsLogin, dfsPassword);
      const task = (api.tasks as Json[] | undefined)?.[0];
      const result = (task?.result as Json[] | undefined)?.[0];
      const items = (result?.items as Json[] | undefined) ?? [];
      await sb.from("visibility_provider_observations").insert({ pipeline_run_id: pipelineId, report_run_id: reportRunId, studio_id: studio.data.id, provider: "dataforseo", endpoint: "keywords_data/google_ads/search_volume/live", request_payload: { keyword_count: searches.length, location_name: location, language_code: "en" }, response_payload: { status_code: api.status_code, task_status_code: task?.status_code, cost: task?.cost, result_count: items.length }, response_status: 200, units_consumed: Number(task?.cost ?? api.cost ?? 0), observed_at: now });
      let volumeWritten = 0;
      for (const item of items) {
        const keyword = canonical(item.keyword);
        const match = searches.find((x) => canonical(x.query) === keyword || canonical(x.canonical_query) === keyword);
        if (!match) continue;
        const volume = Number(item.search_volume ?? 0);
        const d = demandScore(volume);
        const upd = await sb.from("visibility_search_universe").update({ demand: d, dimension_values: { ...(match.dimension_values ?? {}), demand_measured: true, demand_provider: "dataforseo", search_volume: volume, cpc_usd: Number(item.cpc ?? 0), competition: Number(item.competition ?? 0), monthly_searches: item.monthly_searches ?? [] }, updated_at: now }).eq("id", match.id);
        if (upd.error) throw new Error(`volume_update:${upd.error.message}`);
        match.demand = d;
        match.dimension_values = { ...(match.dimension_values ?? {}), demand_measured: true, search_volume: volume };
        volumeWritten++;
      }

      const top = [...searches].sort((a, b) => Number(b.demand) - Number(a.demand)).slice(0, 30);
      const studioDomain = domainOf(studio.data.website_url);
      const competitorDomains = new Set<string>();
      const ranks: number[] = [];
      let serpWritten = 0;
      for (const row of top) {
        const api2 = await dfs("serp/google/organic/live/regular", [{ keyword: row.query, location_name: location, language_code: "en", device: "desktop", depth: 10 }], dfsLogin, dfsPassword);
        const task2 = (api2.tasks as Json[] | undefined)?.[0];
        const result2 = (task2?.result as Json[] | undefined)?.[0];
        const serps = (result2?.items as Json[] | undefined) ?? [];
        let rank: number | null = null;
        const obs = serps.map((item) => {
          const pos = Number(item.rank_absolute ?? item.rank_group ?? 0) || null;
          const domain = domainOf(clean(item.domain ?? item.url));
          const isStudio = Boolean(studioDomain && domain === studioDomain);
          if (isStudio && rank === null) rank = pos;
          if (domain && !isStudio && pos && pos <= 10) competitorDomains.add(domain);
          return { studio_id: studio.data.id, report_run_id: reportRunId, search_universe_id: row.id, query: row.query, database: "google.co.uk", result_position: pos, result_type: clean(item.type, 80), domain: clean(item.domain, 500) || null, url: clean(item.url, 1000) || null, title: clean(item.title, 500) || null, is_studio: isStudio, is_competitor: !isStudio && Boolean(domain), source_provider: "dataforseo", observed_at: now, raw_data: item };
        });
        if (obs.length) {
          const ins = await sb.from("visibility_serp_observations").insert(obs);
          if (ins.error) throw new Error(`serp_insert:${ins.error.message}`);
          serpWritten += obs.length;
        }
        const measuredDemand = Boolean((row.dimension_values ?? {}).demand_measured);
        const score = measuredDemand ? lso(Number(row.demand), Number(row.commercial_intent), Number(row.local_relevance), rankOpportunity(rank), Number(row.conversion_potential), Number(row.studio_relevance), Number(row.capability)) : 0;
        const upd = await sb.from("visibility_search_universe").update({ current_position: rank, ranking_opportunity: rankOpportunity(rank), serp_features: { provider: "dataforseo", database: "google.co.uk", top10_results: serps.slice(0, 10).map((x) => ({ rank: x.rank_absolute, domain: x.domain, type: x.type })) }, lsos: score, status: measuredDemand ? (rank !== null && rank <= 10 ? "defend" : "opportunity") : "candidate", updated_at: now }).eq("id", row.id);
        if (upd.error) throw new Error(`serp_update:${upd.error.message}`);
        if (rank !== null) ranks.push(rank);
      }
      for (const domain of [...competitorDomains].slice(0, 25)) {
        const ins = await sb.from("visibility_competitor_observations").insert({ studio_id: studio.data.id, report_run_id: reportRunId, competitor_name: domain, domain, query: "SERP-derived competitor", rank: null, visibility_share: null, keyword_overlap: 0, source_provider: "dataforseo", observed_at: now, raw_data: { derived_from: "top_demand_serps" } });
        if (ins.error) throw new Error(`competitor_insert:${ins.error.message}`);
      }
      const avg = ranks.length ? Math.round(ranks.reduce((a, b) => a + b, 0) / ranks.length * 10) / 10 : null;
      await sb.from("visibility_pipeline_runs").update({ status: "success", records_read: searches.length, records_written: volumeWritten + serpWritten, output_payload: { volume_keywords: volumeWritten, serp_queries: top.length, serp_observations: serpWritten, competitor_domains: competitorDomains.size, observed_studio_ranks: ranks.length, average_observed_rank: avg }, completed_at: new Date().toISOString() }).eq("id", pipelineId);
      await sb.from("visibility_report_runs").update({ status: "qa", search_demand: { provider: "dataforseo", keywords_measured: volumeWritten, generated_candidates: searches.length }, current_visibility: { provider: "dataforseo", database: "google.co.uk", serp_queries: top.length, observed_ranks: ranks.length, average_rank: avg }, competitor_intelligence: { provider: "dataforseo", competitor_domains: [...competitorDomains].slice(0, 25) }, commercial_opportunity: { status: "not_calculated", reason: "First-party conversion/booking attribution is not connected." }, methodology: { provider: "dataforseo", demand: "Google Ads-derived search volume", serp: "Google organic SERP observations", revenue: "not calculated until first-party attribution is connected" }, qa_checks: { provider_run_completed: true, demand_quantified: true, google_rankings_measured: true, keywords_measured: volumeWritten, serp_queries: top.length, observed_ranks: ranks.length } }).eq("id", reportRunId);
      return json({ ok: true, status: "success", provider: "dataforseo", reportRunId, pipelineRunId: pipelineId, keywordsMeasured: volumeWritten, serpQueries: top.length, serpObservations: serpWritten, competitorDomains: [...competitorDomains].slice(0, 25) });
    }

    const sourceProvider = provider === "brave" ? "brave" : (clean(body.source_provider, 120) || "research_web");
    const now = new Date().toISOString();
    const searchByCanonical = new Map(searches.flatMap((row) => [[canonical(row.query), row], [canonical(row.canonical_query), row]]));
    const sourceObservations: Array<{ query: string; database: string; results: NormalizedResult[]; demand?: ExternalObservation["demand"] }> = [];
    if (provider === "brave") {
      if (!braveKey) throw new Error("BRAVE_SEARCH_API_KEY not configured");
      for (const row of searches.slice(0, 30)) {
        const found = await braveSearch(row.query, braveKey);
        await sb.from("visibility_provider_observations").insert({ pipeline_run_id: pipelineId, report_run_id: reportRunId, studio_id: studio.data.id, provider: "brave", endpoint: "web/search", request_payload: { query: row.query, country: "gb", language: "en", count: 20 }, response_payload: { result_count: found.results.length }, response_status: found.status, units_consumed: 1, observed_at: now });
        sourceObservations.push({ query: row.query, database: "brave_web_gb", results: found.results });
      }
    } else {
      if (!external.length) throw new Error("external_observations_required");
      for (const observation of external) {
        const row = searchByCanonical.get(canonical(observation.query));
        if (!row) continue;
        const normalized = observation.results.map((result) => {
          const url = result.url || null;
          return { position: result.position ?? null, url, domain: (result.domain || domainOf(url) || "").replace(/^www\./, "").toLowerCase() || null, title: result.title || null, result_type: result.result_type || "web", raw: result };
        });
        await sb.from("visibility_provider_observations").insert({ pipeline_run_id: pipelineId, report_run_id: reportRunId, studio_id: studio.data.id, provider: sourceProvider, endpoint: "normalized_external_observation", request_payload: { query: observation.query }, response_payload: { result_count: normalized.length, demand: observation.demand ?? null }, response_status: 200, units_consumed: 0, observed_at: now });
        sourceObservations.push({ query: observation.query, database: observation.database || "external_web_observation", results: normalized, demand: observation.demand });
      }
    }

    const studioDomain = domainOf(studio.data.website_url);
    const competitorCounts = new Map<string, { count: number; bestRank: number | null; queries: Set<string> }>();
    let serpWritten = 0;
    let observedStudioPositions = 0;
    let numericDemandMeasurements = 0;
    for (const observation of sourceObservations) {
      const row = searchByCanonical.get(canonical(observation.query));
      if (!row) continue;
      let providerStudioPosition: number | null = null;
      const rowsToInsert = observation.results.map((result) => {
        const domain = (result.domain || domainOf(result.url) || "").replace(/^www\./, "").toLowerCase();
        const isStudio = Boolean(studioDomain && domain === studioDomain);
        if (isStudio && providerStudioPosition === null) providerStudioPosition = result.position;
        if (domain && !isStudio && result.position && result.position <= 20) {
          const entry = competitorCounts.get(domain) ?? { count: 0, bestRank: null, queries: new Set<string>() };
          entry.count += 1;
          entry.bestRank = entry.bestRank === null ? result.position : Math.min(entry.bestRank, result.position);
          entry.queries.add(row.query);
          competitorCounts.set(domain, entry);
        }
        return { studio_id: studio.data.id, report_run_id: reportRunId, search_universe_id: row.id, query: row.query, database: observation.database, result_position: result.position, result_type: result.result_type, domain: domain || null, url: result.url, title: result.title, is_studio: isStudio, is_competitor: !isStudio && Boolean(domain), raw_data: result.raw, source_provider: sourceProvider, observed_at: now };
      });
      if (rowsToInsert.length) {
        const inserted = await sb.from("visibility_serp_observations").insert(rowsToInsert);
        if (inserted.error) throw new Error(`serp_insert:${inserted.error.message}`);
        serpWritten += rowsToInsert.length;
      }
      if (providerStudioPosition !== null) observedStudioPositions++;

      let measuredDemandScore: number | null = null;
      let measuredDemand: Json | null = null;
      const demand = observation.demand;
      if (demand?.kind === "absolute_search_volume" && Number.isFinite(Number(demand.value)) && Number(demand.value) >= 0) {
        const volume = Number(demand.value);
        measuredDemandScore = demandScore(volume);
        measuredDemand = { demand_measured: true, demand_kind: "absolute_search_volume", search_volume: volume, demand_source: clean(demand.source, 120) || sourceProvider, demand_period: clean(demand.period, 120) || null };
        numericDemandMeasurements++;
      } else if (demand) {
        measuredDemand = { demand_measured: false, demand_kind: clean(demand.kind, 80), demand_signal: Number.isFinite(Number(demand.value)) ? Number(demand.value) : null, demand_source: clean(demand.source, 120) || sourceProvider, demand_period: clean(demand.period, 120) || null };
      }
      const dimensionValues = { ...(row.dimension_values ?? {}), ...(measuredDemand ?? {}), serp_observed: true, serp_provider: sourceProvider, serp_database: observation.database, provider_position: providerStudioPosition };
      const updatePayload: Json = { dimension_values: dimensionValues, serp_features: { provider: sourceProvider, database: observation.database, provider_position: providerStudioPosition, result_count: observation.results.length, note: provider === "brave" ? "Brave web result position; not a Google ranking" : "External web observation; not a Google ranking unless the source explicitly states Google" }, updated_at: now };
      if (measuredDemandScore !== null) {
        updatePayload.demand = measuredDemandScore;
        updatePayload.lsos = lso(measuredDemandScore, Number(row.commercial_intent), Number(row.local_relevance), rankOpportunity(providerStudioPosition), Number(row.conversion_potential), Number(row.studio_relevance), Number(row.capability));
        updatePayload.status = providerStudioPosition !== null && providerStudioPosition <= 10 ? "defend" : "opportunity";
      } else {
        updatePayload.lsos = 0;
        updatePayload.status = "candidate";
      }
      const updated = await sb.from("visibility_search_universe").update(updatePayload).eq("id", row.id);
      if (updated.error) throw new Error(`search_universe_update:${updated.error.message}`);
    }

    for (const [domain, info] of [...competitorCounts.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 25)) {
      const inserted = await sb.from("visibility_competitor_observations").insert({ studio_id: studio.data.id, report_run_id: reportRunId, competitor_name: domain, domain, query: [...info.queries].join(" | "), rank: info.bestRank, visibility_share: sourceObservations.length ? Math.round((info.queries.size / sourceObservations.length) * 10000) / 100 : null, keyword_overlap: info.queries.size, source_provider: sourceProvider, observed_at: now, raw_data: { occurrence_count: info.count, query_count: info.queries.size, database_scope: [...new Set(sourceObservations.map((item) => item.database))] } });
      if (inserted.error) throw new Error(`competitor_insert:${inserted.error.message}`);
    }

    const competitorDomains = [...competitorCounts.entries()].sort((a, b) => b[1].queries.size - a[1].queries.size).slice(0, 25).map(([domain, info]) => ({ domain, query_overlap: info.queries.size, best_observed_position: info.bestRank }));
    const pipelineStatus = numericDemandMeasurements === sourceObservations.length && sourceObservations.length > 0 ? "success" : "partial";
    await sb.from("visibility_pipeline_runs").update({ status: pipelineStatus, records_read: sourceObservations.length, records_written: serpWritten + competitorDomains.length, output_payload: { serp_queries: sourceObservations.length, serp_observations: serpWritten, competitor_domains: competitorDomains.length, observed_studio_positions: observedStudioPositions, demand_measurements: numericDemandMeasurements, demand_status: numericDemandMeasurements ? "partially_or_fully_quantified" : "not_quantified" }, completed_at: new Date().toISOString() }).eq("id", pipelineId);
    await sb.from("visibility_report_runs").update({
      status: "qa",
      search_demand: { provider: numericDemandMeasurements ? sourceProvider : "not_quantified", measured: numericDemandMeasurements > 0, keywords_measured: numericDemandMeasurements, generated_candidates: searches.length, note: numericDemandMeasurements ? "Only explicitly sourced quantitative demand values are scored." : "Absolute monthly search demand has not been measured; no demand score is presented." },
      current_visibility: { provider: sourceProvider, database: [...new Set(sourceObservations.map((item) => item.database))], serp_queries: sourceObservations.length, observed_results: serpWritten, observed_studio_positions: observedStudioPositions, google_rankings_measured: false, note: "Provider-specific web observations; not represented as Google rankings." },
      competitor_intelligence: { provider: sourceProvider, competitor_domains: competitorDomains },
      commercial_opportunity: { status: "not_calculated", reason: "First-party conversion/booking attribution is not connected." },
      methodology: { provider: sourceProvider, demand: numericDemandMeasurements ? "Only explicit quantitative demand observations are scored" : "not quantified", serp: provider === "brave" ? "Brave Search API web observations" : "normalized external web observations", ranking_scope: "provider-specific observation; not Google rank", lsos: numericDemandMeasurements ? "calculated only where absolute demand was independently measured" : "not scored because demand is unmeasured", revenue: "not calculated until first-party attribution is connected" },
      qa_checks: { provider_run_completed: true, pipeline_status: pipelineStatus, demand_quantified: numericDemandMeasurements > 0, google_rankings_measured: false, serp_queries: sourceObservations.length, observed_results: serpWritten, observed_studio_positions: observedStudioPositions, lsos_scored_keywords: numericDemandMeasurements },
    }).eq("id", reportRunId);

    return json({ ok: true, status: pipelineStatus, provider: sourceProvider, reportRunId, pipelineRunId: pipelineId, serpQueries: sourceObservations.length, serpObservations: serpWritten, demandMeasurements: numericDemandMeasurements, observedStudioPositions, competitorDomains });
  } catch (error) {
    if (pipelineId) {
      try {
        const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
        await sb.from("visibility_pipeline_runs").update({ status: "failed", error_message: error instanceof Error ? error.message : "unknown_error", completed_at: new Date().toISOString() }).eq("id", pipelineId);
      } catch { /* do not mask primary failure */ }
    }
    console.error(error);
    return json({ ok: false, status: "failed", error: error instanceof Error ? error.message : "Unable to run search intelligence.", pipelineRunId: pipelineId }, 500);
  }
});
