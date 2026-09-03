import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Json = Record<string, unknown>;
type SearchRow = { id: string; studio_id: string; report_run_id: string; query: string; canonical_query: string; category: string | null; service: string | null; style: string | null; subject: string | null; body_area: string | null; problem_need: string | null; customer_type: string | null; location: string | null; demand: number; commercial_intent: number; local_relevance: number; ranking_opportunity: number; conversion_potential: number; studio_relevance: number; capability: number; lsos: number };

const CORS = { "Access-Control-Allow-Origin": "https://getinksights.co.uk", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS", "Content-Type": "application/json" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: CORS });
const clean = (v: unknown, max = 500) => String(v ?? "").trim().replace(/\s+/g, " ").slice(0, max);
const domainOf = (url: string | null) => { try { return new URL(url ?? "").hostname.replace(/^www\./, "").toLowerCase(); } catch { return ""; } };

async function dfs(path: string, body: unknown, login: string, password: string) {
  const auth = btoa(`${login}:${password}`);
  const response = await fetch(`https://api.dataforseo.com/v3/${path}`, { method: "POST", headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const text = await response.text();
  let data: Json; try { data = JSON.parse(text); } catch { throw new Error(`dataforseo_invalid_response:${response.status}`); }
  if (!response.ok || data.status_code !== 20000) throw new Error(`dataforseo_error:${response.status}:${clean(data.status_message, 240)}`);
  return data;
}

function demandScore(volume: number) { return Math.max(0, Math.min(100, 20 + Math.log(Math.max(volume, 1) + 1) * 12)); }
function intentFor(row: SearchRow) { return Number(row.commercial_intent ?? 55); }
function lso(d: number, i: number, l: number, p: number, c: number, r: number, cap: number) { return Math.round(Math.max(0, Math.min(100, (d*i*l*p*c*r*cap) / 1e12)) * 100) / 100; }

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
  let pipelineId: string | null = null;
  try {
    const body = await req.json();
    const reportRunId = clean(body.report_run_id, 80);
    if (!reportRunId) return json({ ok: false, error: "report_run_id is required" }, 400);
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const run = await sb.from("visibility_report_runs").select("id,studio_id,status").eq("id", reportRunId).single();
    if (run.error) throw new Error(`report_lookup:${run.error.message}`);
    const studio = await sb.from("visibility_studios").select("id,studio_name,website_url,town").eq("id", run.data.studio_id).single();
    if (studio.error) throw new Error(`studio_lookup:${studio.error.message}`);
    const provider = (Deno.env.get("SEARCH_DATA_PROVIDER") ?? "dataforseo").toLowerCase();
    const login = Deno.env.get("DATAFORSEO_LOGIN") ?? "";
    const password = Deno.env.get("DATAFORSEO_PASSWORD") ?? "";
    const pipeline = await sb.from("visibility_pipeline_runs").insert({ studio_id: studio.data.id, report_run_id: reportRunId, provider, stage: "search_intelligence", status: "started", input_payload: { provider } }).select("id").single();
    if (pipeline.error) throw new Error(`pipeline_insert:${pipeline.error.message}`); pipelineId = pipeline.data.id;
    if (provider !== "dataforseo" || !login || !password) {
      await sb.from("visibility_pipeline_runs").update({ status: "blocked", error_message: provider === "dataforseo" ? "DATAFORSEO_LOGIN/DATAFORSEO_PASSWORD not configured" : `Provider ${provider} is not configured`, completed_at: new Date().toISOString() }).eq("id", pipelineId);
      return json({ ok: false, status: "blocked", provider, reason: "provider_credentials_missing", pipelineRunId: pipelineId }, 503);
    }
    const rows = await sb.from("visibility_search_universe").select("id,studio_id,report_run_id,query,canonical_query,category,service,style,subject,body_area,problem_need,customer_type,location,demand,commercial_intent,local_relevance,ranking_opportunity,conversion_potential,studio_relevance,capability,lsos").eq("report_run_id", reportRunId).eq("semantic_valid", true).limit(1000);
    if (rows.error) throw new Error(`search_universe_lookup:${rows.error.message}`);
    const searches = (rows.data ?? []) as SearchRow[];
    if (!searches.length) throw new Error("search_universe_empty");
    const now = new Date().toISOString();
    const chunks: SearchRow[][] = [];
    for (let i = 0; i < searches.length; i += 1000) chunks.push(searches.slice(i, i + 1000));
    let volumeWritten = 0;
    for (const chunk of chunks) {
      const api = await dfs("keywords_data/google_ads/search_volume/live", [{ keywords: chunk.map(x => x.query), language_code: "en", location_name: `${studio.data.town}, United Kingdom`, include_serp_info: false }], login, password);
      const task = (api.tasks as Json[] | undefined)?.[0];
      const result = (task?.result as Json[] | undefined)?.[0];
      const items = (result?.items as Json[] | undefined) ?? [];
      await sb.from("visibility_provider_observations").insert({ pipeline_run_id: pipelineId, report_run_id: reportRunId, studio_id: studio.data.id, provider: "dataforseo", endpoint: "keywords_data/google_ads/search_volume/live", request_payload: { keyword_count: chunk.length, location_name: `${studio.data.town}, United Kingdom`, language_code: "en" }, response_payload: { status_code: api.status_code, task_status_code: task?.status_code, cost: task?.cost, result_count: items.length }, response_status: 200, units_consumed: Number(task?.cost ?? api.cost ?? 0), observed_at: now });
      for (const item of items) {
        const keyword = clean(item.keyword, 500).toLowerCase();
        const match = chunk.find(x => x.query === keyword || x.canonical_query === keyword);
        if (!match) continue;
        const volume = Number(item.search_volume ?? 0);
        const cpc = Number(item.cpc ?? 0);
        const competition = Number(item.competition ?? 0);
        const d = demandScore(volume);
        const update = await sb.from("visibility_search_universe").update({ demand: d, dimension_values: { provider: "dataforseo", search_volume: volume, cpc_usd: cpc, competition, monthly_searches: item.monthly_searches ?? [] }, updated_at: now }).eq("id", match.id);
        if (update.error) throw new Error(`volume_update:${update.error.message}`);
        const keywordUpsert = await sb.from("visibility_keywords").upsert({ studio_id: studio.data.id, keyword: match.query, keyword_group: match.category === "service" ? "service" : match.category === "style" ? "style" : match.category === "area" ? "area" : "other", search_intent: Number(match.commercial_intent) >= 75 ? "commercial" : "mixed", search_volume: volume, cpc_pence: Math.round(cpc * 100), source_provider: "dataforseo", observed_at: now, raw_data: { competition, monthly_searches: item.monthly_searches ?? [] } }, { onConflict: "studio_id,normalized_keyword,observed_at" });
        if (keywordUpsert.error) throw new Error(`keyword_upsert:${keywordUpsert.error.message}`);
        volumeWritten++;
      }
    }

    const top = [...searches].sort((a,b) => Number(b.lsos) - Number(a.lsos)).slice(0, 30);
    let serpWritten = 0; let competitorDomains = new Set<string>(); let bestRanks: number[] = [];
    for (const row of top) {
      const api = await dfs("serp/google/organic/live/regular", [{ keyword: row.query, location_name: `${studio.data.town}, United Kingdom`, language_code: "en", device: "desktop", depth: 10 }], login, password);
      const task = (api.tasks as Json[] | undefined)?.[0]; const result = (task?.result as Json[] | undefined)?.[0]; const items = (result?.items as Json[] | undefined) ?? [];
      const studioDomain = domainOf(studio.data.website_url); let rank: number | null = null; let localPack = false;
      const observations = [];
      for (const item of items) {
        const pos = Number(item.rank_absolute ?? item.rank_group ?? 0); const domain = domainOf(clean(item.domain ?? item.url));
        const isStudio = Boolean(studioDomain && domain === studioDomain); if (isStudio && rank === null) rank = pos;
        if (domain && !isStudio && pos <= 10) competitorDomains.add(domain);
        if (String(item.type ?? "").includes("local_pack")) localPack = true;
        observations.push({ studio_id: studio.data.id, report_run_id: reportRunId, search_universe_id: row.id, query: row.query, database: "google.co.uk", result_position: pos || null, result_type: clean(item.type, 80), domain: clean(item.domain, 500) || null, url: clean(item.url, 1000) || null, title: clean(item.title, 500) || null, is_studio: isStudio, is_competitor: !isStudio && Boolean(domain), source_provider: "dataforseo", observed_at: now, raw_data: item });
      }
      if (observations.length) { const ins = await sb.from("visibility_serp_observations").insert(observations); if (ins.error) throw new Error(`serp_insert:${ins.error.message}`); serpWritten += observations.length; }
      const p = rank === null ? 100 : rank <= 3 ? 15 : rank <= 10 ? 55 : rank <= 20 ? 80 : 100;
      const l = lso(demandScore(1), intentFor(row), Number(row.local_relevance), p, Number(row.conversion_potential), Number(row.studio_relevance), Number(row.capability));
      const upd = await sb.from("visibility_search_universe").update({ current_position: rank, competitor_position: items.find((x: Json) => Number(x.rank_absolute ?? 0) > 0 && domainOf(clean(x.domain ?? x.url)) !== studioDomain)?.rank_absolute ?? null, serp_features: { local_pack_present: localPack, top10_results: items.slice(0,10).map((x: Json) => ({ rank: x.rank_absolute, domain: x.domain, type: x.type })) }, lsos: l, status: rank !== null && rank <= 10 ? "defend" : "opportunity", updated_at: now }).eq("id", row.id);
      if (upd.error) throw new Error(`serp_update:${upd.error.message}`);
      if (rank !== null) bestRanks.push(rank);
    }
    for (const domain of [...competitorDomains].slice(0, 25)) {
      await sb.from("visibility_competitor_observations").insert({ studio_id: studio.data.id, report_run_id: reportRunId, competitor_name: domain, domain, query: "SERP-derived competitor", rank: null, visibility_share: null, keyword_overlap: 0, source_provider: "dataforseo", observed_at: now, raw_data: { derived_from: "top_lso_serps" } });
    }
    const avgRank = bestRanks.length ? Math.round((bestRanks.reduce((a,b)=>a+b,0)/bestRanks.length)*10)/10 : null;
    const final = await sb.from("visibility_pipeline_runs").update({ status: "success", records_read: searches.length, records_written: volumeWritten + serpWritten, output_payload: { volume_keywords: volumeWritten, serp_observations: serpWritten, competitor_domains: competitorDomains.size, observed_studio_ranks: bestRanks.length, average_observed_rank: avgRank }, completed_at: new Date().toISOString() }).eq("id", pipelineId);
    if (final.error) throw new Error(`pipeline_update:${final.error.message}`);
    await sb.from("visibility_report_runs").update({ status: "qa", search_demand: { provider: "dataforseo", keywords_measured: volumeWritten, generated_candidates: searches.length }, current_visibility: { provider: "dataforseo", serp_queries: top.length, observed_ranks: bestRanks.length, average_rank: avgRank }, competitor_intelligence: { provider: "dataforseo", competitor_domains: [...competitorDomains].slice(0,25) }, methodology: { provider: "dataforseo", demand: "Google Ads-derived search volume", serp: "Google organic SERP observations", revenue: "not calculated until first-party conversion/booking attribution is connected" } }).eq("id", reportRunId);
    return json({ ok: true, status: "success", provider: "dataforseo", reportRunId, pipelineRunId: pipelineId, keywordsMeasured: volumeWritten, serpQueries: top.length, serpObservations: serpWritten, competitorDomains: [...competitorDomains].slice(0,25) });
  } catch (error) {
    if (pipelineId) { try { const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!); await sb.from("visibility_pipeline_runs").update({ status: "failed", error_message: error instanceof Error ? error.message : "unknown_error", completed_at: new Date().toISOString() }).eq("id", pipelineId); } catch {} }
    console.error(error); return json({ ok: false, status: "failed", error: error instanceof Error ? error.message : "Unable to run search intelligence.", pipelineRunId: pipelineId }, 500);
  }
});
