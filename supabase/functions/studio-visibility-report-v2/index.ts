import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "https://getinksights.co.uk",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

function cleanText(value: unknown, max = 300) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max);
}

function normaliseUrl(value: unknown) {
  const raw = cleanText(value, 500);
  if (!raw) return null;
  const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Website must use http or https.");
  return url.toString().replace(/\/$/, "");
}

function hostname(value: string) { return new URL(value).hostname.replace(/^www\./, "").toLowerCase(); }

function csv(text: string) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [] as Record<string,string>[];
  const split = (line: string) => line.split(";").map(v => v.replace(/^"|"$/g, "").trim());
  const headers = split(lines[0]);
  return lines.slice(1).map(line => Object.fromEntries(split(line).map((v,i) => [headers[i] ?? `c${i}`, v])));
}

async function semrush(path: string, key: string) {
  const res = await fetch(`https://api.semrush.com/${path}`);
  const text = await res.text();
  if (!res.ok || /ERROR/i.test(text.slice(0, 100))) throw new Error(`Semrush request failed: ${text.slice(0, 240)}`);
  return text;
}

async function websiteSnapshot(url: string) {
  const observedAt = new Date().toISOString();
  const res = await fetch(url, { redirect: "follow", headers: { "user-agent": "INKSIGHT-Visibility-Check/1.0" } });
  const html = await res.text();
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() || null;
  const description = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1]?.trim() || null;
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()).filter(Boolean).slice(0, 10);
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] || null;
  const robotsUrl = new URL("/robots.txt", url).toString();
  const sitemapUrl = new URL("/sitemap.xml", url).toString();
  const [robots, sitemap] = await Promise.allSettled([fetch(robotsUrl), fetch(sitemapUrl)]);
  return {
    http_status: res.status,
    final_url: res.url,
    title,
    meta_description: description,
    h1s,
    canonical,
    robots_available: robots.status === "fulfilled" && robots.value.ok,
    sitemap_available: sitemap.status === "fulfilled" && sitemap.value.ok,
    observed_at: observedAt,
  };
}

function keywordSet(area: string, services: string[]) {
  const base = [
    `tattoo ${area}`,
    `tattoo studio ${area}`,
    `tattoo artist ${area}`,
    `tattoo shop ${area}`,
    `best tattoo studio ${area}`,
  ];
  const serviceTerms = services.slice(0, 5).map(s => `${s} tattoo ${area}`);
  return [...new Set([...base, ...serviceTerms].map(v => v.toLowerCase().replace(/\s+/g, " ").trim()))].slice(0, 10);
}

function intent(keyword: string) {
  if (/\b(book|appointment|near me)\b/i.test(keyword)) return "transactional";
  if (/\b(best|studio|shop|artist)\b/i.test(keyword)) return "commercial";
  return "local";
}

function positionOpportunity(rank: number | null) {
  if (rank === null) return 100;
  if (rank >= 51) return 95;
  if (rank >= 21) return 85;
  if (rank >= 11) return 75;
  if (rank >= 6) return 45;
  if (rank >= 4) return 25;
  return 10;
}

function localScore(keyword: string, area: string) { return keyword.toLowerCase().includes(area.toLowerCase()) ? 100 : 50; }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    if (cleanText(body.website_honeypot)) return json({ ok: false, error: "Invalid submission." }, 400);
    const studioName = cleanText(body.studio_name, 160);
    const contactName = cleanText(body.contact_name, 120);
    const email = cleanText(body.email, 254).toLowerCase();
    const area = cleanText(body.area, 120);
    const website = normaliseUrl(body.website);
    const artists = Number(body.artist_count);
    const services = Array.isArray(body.services) ? body.services.map((s: unknown) => cleanText(s, 80)).filter(Boolean).slice(0, 10) : [];
    if (!studioName || !contactName || !/^\S+@\S+\.\S+$/.test(email) || !area || !website || !Number.isInteger(artists) || artists < 3) {
      return json({ ok: false, error: "Please provide a valid studio name, name, email, area, website and an artist count of 3 or more." }, 400);
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const token = `${crypto.randomUUID().replaceAll("-", "")}${crypto.randomUUID().replaceAll("-", "")}`;
    const { data: studio, error: studioError } = await supabase.from("visibility_studios").insert({
      studio_name: studioName,
      website_url: website,
      town: area,
      artist_count: artists,
      location_count: 1,
      average_booking_value_pence: null,
      monthly_search_to_booking_rate: null,
      status: "report_requested",
    }).select("id").single();
    if (studioError) throw studioError;

    const { data: run, error: runError } = await supabase.from("visibility_report_runs").insert({
      studio_id: studio.id,
      report_version: "v2",
      status: "collecting",
      visibility_score: null,
      score_components: {},
      search_demand: {},
      current_visibility: {},
      competitor_intelligence: {},
      opportunity_summary: {},
      commercial_opportunity: {},
      action_plan: {},
      methodology: { evidence: "verified_external_data + studio_submitted_data", financials: "not calculated without first-party attribution" },
      qa_checks: {},
      data_classification: "verified_external_plus_studio_submitted",
      approval_required: true,
      public_token: token,
      contact_name: contactName,
      contact_email: email,
      input_summary: { area, artist_count: artists, services },
    }).select("id").single();
    if (runError) throw runError;

    const websiteData = await websiteSnapshot(website);
    await supabase.from("visibility_observations").insert({ studio_id: studio.id, observation_type: "website_snapshot", entity_name: website, source_provider: "studio_website", source_reference: websiteData.final_url, observed_at: websiteData.observed_at, raw_data: websiteData });

    const semrushKey = Deno.env.get("SEMRUSH_API_KEY_V3");
    const keywords = keywordSet(area, services.length ? services : ["fine line", "blackwork", "realism"]);
    let rows: Array<Record<string,string>> = [];
    let providerStatus = "not_configured";
    if (semrushKey) {
      const db = "uk";
      const phrase = encodeURIComponent(keywords.join(";"));
      const metrics = await semrush(`?type=phrase_these&key=${encodeURIComponent(semrushKey)}&phrase=${phrase}&export_columns=Ph,Nq,Cp,Co,Nr,In,Kd&database=${db}` , semrushKey);
      const metricRows = csv(metrics);
      for (const m of metricRows) {
        const kw = m.Keyword || m.Ph;
        const organic = await semrush(`?type=phrase_organic&key=${encodeURIComponent(semrushKey)}&phrase=${encodeURIComponent(kw)}&export_columns=Dn,Ur,Po&database=${db}&display_limit=100`, semrushKey);
        const organicRows = csv(organic);
        const domain = hostname(website);
        const own = organicRows.find(r => hostname(String(r.Domain || "")) === domain);
        const rank = own ? Number(own.Po) : null;
        const volume = Number(m["Search Volume"] || m.Nq || 0);
        const cpc = Number(m.CPC || m.Cp || 0);
        const kd = m["Keyword Difficulty"] || m.Kd || null;
        const commercial = /transactional/i.test(String(m.In || "")) ? 100 : /commercial/i.test(String(m.In || "")) ? 90 : intent(kw) === "commercial" ? 90 : 85;
        const demand = volume > 0 ? Math.min(100, Math.round((Math.log10(volume + 1) / 5) * 100)) : 0;
        const local = localScore(kw, area);
        const pos = positionOpportunity(rank);
        const lsos = Math.round((demand * 0.25 + commercial * 0.2 + local * 0.2 + pos * 0.35) * 10) / 10;
        rows.push({ keyword: kw, search_volume: String(volume), cpc: String(cpc), keyword_difficulty: String(kd ?? ""), current_rank: rank === null ? "" : String(rank), intent: intent(kw), demand_score: String(demand), commercial_intent_score: String(commercial), local_relevance_score: String(local), position_opportunity_score: String(pos), lsos_score: String(lsos), target_url: own?.Url || "" });
      }
      providerStatus = "semrush_verified";
    }

    if (rows.length) {
      await supabase.from("visibility_keywords").insert(rows.map(r => ({ studio_id: studio.id, keyword: r.keyword, normalized_keyword: r.keyword, keyword_group: "initial_local_sample", search_intent: r.intent, search_volume: Number(r.search_volume), cpc_pence: Math.round(Number(r.cpc) * 100), keyword_difficulty: r.keyword_difficulty ? Number(r.keyword_difficulty) : null, current_rank: r.current_rank ? Number(r.current_rank) : null, target_url: r.target_url || null, observed_at: new Date().toISOString(), source_provider: "semrush_v3", raw_data: r })));
      await supabase.from("visibility_opportunities").insert(rows.map((r, i) => ({ studio_id: studio.id, keyword_id: null, opportunity_type: "search_visibility", title: r.keyword, description: `Verified UK search observation for ${r.keyword}.`, demand_score: Number(r.demand_score), commercial_intent_score: Number(r.commercial_intent_score), local_relevance_score: Number(r.local_relevance_score), position_opportunity_score: Number(r.position_opportunity_score), conversion_potential_score: 50, lsos_score: Number(r.lsos_score), estimated_monthly_clicks: null, estimated_monthly_enquiries: null, estimated_monthly_revenue_pence: null, priority: i + 1, recommended_action: Number(r.current_rank || 101) > 10 ? "Assess and improve the relevant service/location page." : "Monitor ranking and protect the current position.", status: "open", evidence: { provider: "Semrush", observed_at: new Date().toISOString(), keyword: r.keyword, search_volume: Number(r.search_volume), rank: r.current_rank ? Number(r.current_rank) : null } })));
    }

    const volumes = rows.map(r => Number(r.search_volume));
    const ranks = rows.map(r => r.current_rank ? Number(r.current_rank) : null);
    const ranked = ranks.filter((r): r is number => r !== null);
    const top10 = ranked.filter(r => r <= 10).length;
    const visibilityScore = rows.length ? Math.round((top10 / rows.length) * 100) : null;
    const opportunities = rows.sort((a,b) => Number(b.lsos_score) - Number(a.lsos_score)).slice(0, 5).map(r => ({ keyword: r.keyword, search_volume: Number(r.search_volume), current_rank: r.current_rank ? Number(r.current_rank) : null, lsos_score: Number(r.lsos_score) }));
    const finalStatus = rows.length ? "published" : "published";
    await supabase.from("visibility_report_runs").update({
      status: finalStatus,
      visibility_score: visibilityScore,
      score_components: { tracked_keywords: rows.length, top_10_share: rows.length ? Math.round((top10 / rows.length) * 100) : null, total_search_volume: rows.length ? volumes.reduce((a,b) => a+b, 0) : null },
      executive_summary: rows.length ? "This report contains verified Semrush UK search observations and a verified website snapshot. Scores are INKSIGHT indices derived from those observations; they are not claims of lost revenue." : "This report contains a verified website snapshot. Search-market measurements are not included because the search-data provider is not configured.",
      search_demand: { provider: providerStatus, keywords: rows.map(r => ({ keyword: r.keyword, search_volume: Number(r.search_volume) })) },
      current_visibility: { provider: providerStatus, rankings: rows.map(r => ({ keyword: r.keyword, rank: r.current_rank ? Number(r.current_rank) : null, url: r.target_url || null })) },
      opportunity_summary: { top_opportunities: opportunities },
      commercial_opportunity: { status: "not_calculated", reason: "No revenue opportunity is calculated without first-party attribution and explicit conversion data." },
      action_plan: { actions: opportunities.map((r, i) => ({ priority: i + 1, action: Number(r.current_rank || 101) > 10 ? `Assess the page ranking for ${r.keyword}.` : `Protect and monitor the current ranking for ${r.keyword}.`, evidence: r })) },
      methodology: { provider: providerStatus, geography: "UK national database", search_set: "10-keyword initial local sample", scoring: "Demand 25% + commercial intent 20% + local relevance 20% + position opportunity 35%; conversion potential displayed separately and not used to imply revenue.", revenue: "not calculated" },
      qa_checks: { website_http_status: websiteData.http_status, website_title_present: Boolean(websiteData.title), semrush_rows: rows.length, financial_assumptions_used: false },
      data_classification: rows.length ? "verified_external_plus_studio_submitted" : "verified_website_plus_studio_submitted",
      approval_required: false,
      published_at: new Date().toISOString(),
    }).eq("id", run.id);

    return json({ ok: true, reportId: run.id, publicToken: token, status: "published", provider: providerStatus, reportUrl: `https://getinksights.co.uk/studio-visibility-report?reportId=${run.id}&token=${token}` });
  } catch (error) {
    console.error(error);
    return json({ ok: false, error: error instanceof Error ? error.message : "Unable to generate the report." }, 500);
  }
});
