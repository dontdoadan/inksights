import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { assertPublicNetworkTarget, validatePublicUrl } from "./security.ts";

const ALLOWED_ORIGINS = new Set(["https://getinksights.co.uk", "https://www.getinksights.co.uk"]);
const CORS = {
  "Access-Control-Allow-Origin": "https://getinksights.co.uk",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};
const MAX_BODY_BYTES = 64 * 1024;
const MAX_HTML_BYTES = 2_000_000;
const MAX_REDIRECTS = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: CORS });
const clean = (value: unknown, max = 300) => String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max);
const list = (value: unknown) => Array.isArray(value) ? [...new Set(value.map(v => clean(v, 80)).filter(Boolean))].slice(0, 12) : [];

function trustedOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  return Boolean(origin && ALLOWED_ORIGINS.has(origin));
}

function clientKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("cf-connecting-ip")?.trim() || "unknown";
}

async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, "0")).join("");
}

async function consumeRateLimit(sb: ReturnType<typeof createClient>, req: Request): Promise<boolean> {
  const now = Date.now();
  const windowStartedAt = new Date(Math.floor(now / RATE_LIMIT_WINDOW_MS) * RATE_LIMIT_WINDOW_MS).toISOString();
  const keyHash = await sha256(`${clientKey(req)}|studio-visibility-report-v2`);
  const result = await sb.rpc("consume_public_endpoint_rate_limit", {
    p_endpoint: "studio-visibility-report-v2",
    p_key_hash: keyHash,
    p_window_started_at: windowStartedAt,
    p_max_requests: 5,
  });
  if (result.error) throw new Error("rate_limit_unavailable");
  return result.data === true;
}

async function readLimitedText(response: Response, maxBytes: number): Promise<string> {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new Error("website_response_too_large");
      }
      text += decoder.decode(value, { stream: true });
    }
    return text + decoder.decode();
  } finally {
    reader.releaseLock();
  }
}

async function snapshot(site: URL) {
  let current = site;
  let response: Response | null = null;
  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    await assertPublicNetworkTarget(current);
    response = await fetch(current, {
      redirect: "manual",
      headers: { "user-agent": "INKSIGHTS-Visibility-Check/1.3" },
      signal: AbortSignal.timeout(10000),
    });
    if (![301, 302, 303, 307, 308].includes(response.status)) break;
    const location = response.headers.get("location");
    await response.body?.cancel();
    if (!location) throw new Error("website_redirect_invalid");
    current = validatePublicUrl(new URL(location, current).toString());
    if (redirectCount === MAX_REDIRECTS) throw new Error("website_redirect_limit");
  }

  if (!response) throw new Error("website_fetch_failed");
  const observedAt = new Date().toISOString();
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (contentType && !contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
    await response.body?.cancel();
    throw new Error("website_not_html");
  }

  const html = (await readLimitedText(response, MAX_HTML_BYTES));
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() || null;
  const description = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1]?.trim() || null;
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()).filter(Boolean).slice(0, 10);
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] || null;
  const probe = async (path: string) => {
    try {
      const target = validatePublicUrl(new URL(path, current).toString());
      await assertPublicNetworkTarget(target);
      const result = await fetch(target, { redirect: "manual", signal: AbortSignal.timeout(3000), headers: { "user-agent": "INKSIGHTS-Visibility-Check/1.3" } });
      const ok = result.ok;
      await result.body?.cancel();
      return ok;
    } catch {
      return false;
    }
  };
  const [robotsAvailable, sitemapAvailable] = await Promise.all([probe("/robots.txt"), probe("/sitemap.xml")]);
  return { http_status: response.status, final_url: current.toString(), title, meta_description: description, h1s, canonical, robots_available: robotsAvailable, sitemap_available: sitemapAvailable, observed_at: observedAt };
}

function normalise(value: string) { return value.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim(); }

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
  if (!trustedOrigin(req)) return json({ ok: false, error: "Invalid request origin." }, 403);

  let studioId: string | null = null;
  try {
    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (contentLength > MAX_BODY_BYTES) return json({ ok: false, error: "Submission is too large." }, 413);
    const rawBody = await req.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) return json({ ok: false, error: "Submission is too large." }, 413);
    const body = JSON.parse(rawBody);
    if (clean(body.website_honeypot)) return json({ ok: false, error: "Invalid submission." }, 400);

    const studioName = clean(body.studio_name, 160), contactName = clean(body.contact_name, 120), email = clean(body.email, 254).toLowerCase(), area = clean(body.area, 120), website = validatePublicUrl(body.website), artists = Number(body.artist_count);
    const services = list(body.services), styles = list(body.styles), subjects = list(body.subjects), bodyAreas = list(body.body_areas), problemNeeds = list(body.problem_needs), customerTypes = list(body.customer_types);
    if (!studioName || !contactName || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !area || !Number.isInteger(artists) || artists < 3) return json({ ok: false, error: "Please provide a valid studio name, name, email, area and an artist count of 3 or more." }, 400);

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    if (!await consumeRateLimit(sb, req)) return json({ ok: false, error: "Too many requests. Please try again later." }, 429);
    await assertPublicNetworkTarget(website);
    const websiteData = await snapshot(website);
    const token = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");

    const studioInsert = await sb.from("visibility_studios").insert({ studio_name: studioName, website_url: website.toString().replace(/\/$/, ""), town: area, artist_count: artists, location_count: 1, average_booking_value_pence: null, monthly_search_to_booking_rate: null, status: "collecting" }).select("id").single();
    if (studioInsert.error) throw new Error(`studio_insert: ${studioInsert.error.message}`);
    studioId = studioInsert.data.id;
    const inputSummary = { area, artist_count: artists, services, styles, subjects, body_areas: bodyAreas, problem_needs: problemNeeds, customer_types: customerTypes };
    const runInsert = await sb.from("visibility_report_runs").insert({ studio_id: studioId, report_version: "v2", status: "analysing", score_components: {}, search_demand: {}, current_visibility: {}, competitor_intelligence: {}, opportunity_summary: {}, commercial_opportunity: { status: "not_calculated" }, action_plan: {}, methodology: { provider: "website_plus_provider_pipeline", search_data: "pending" }, qa_checks: {}, data_classification: "verified_client", approval_required: true, public_token: token, contact_name: contactName, contact_email: email, input_summary: inputSummary }).select("id").single();
    if (runInsert.error) throw new Error(`report_insert: ${runInsert.error.message}`);
    const runId = runInsert.data.id;
    for (const [dimension, values] of [["style", styles], ["subject", subjects], ["body_area", bodyAreas], ["problem_need", problemNeeds], ["customer_type", customerTypes]] as [string, string[]][]) {
      if (!values.length) continue;
      const capInsert = await sb.from("visibility_studio_capabilities").upsert(values.map(value => ({ studio_id: studioId, dimension, value, normalized_value: normalise(value), source_type: "studio_submitted", evidence: { report_run_id: runId } })), { onConflict: "studio_id,dimension,normalized_value" });
      if (capInsert.error) throw new Error(`capability_${dimension}: ${capInsert.error.message}`);
    }
    const observationInsert = await sb.from("visibility_observations").insert({ studio_id: studioId, observation_type: "website", entity_name: website.toString(), source_provider: "studio_website", source_reference: websiteData.final_url, observed_at: websiteData.observed_at, raw_data: { ...websiteData, kind: "homepage_snapshot" } });
    if (observationInsert.error) throw new Error(`website_observation: ${observationInsert.error.message}`);
    const ssuCount = await sb.from("visibility_search_universe").select("id", { count: "exact", head: true }).eq("studio_id", studioId);
    if (ssuCount.error) throw new Error(`ssu_count: ${ssuCount.error.message}`);
    const update = await sb.from("visibility_report_runs").update({ status: "analysing", executive_summary: "This report contains a studio-specific search universe and a source-measured website snapshot. Search demand, rankings and revenue are measured only when a configured provider and first-party attribution source are available.", search_demand: { provider: "pending", generated_searches: ssuCount.count ?? 0 }, current_visibility: { provider: "pending", rankings_measured: 0 }, opportunity_summary: { status: "candidate_unverified", search_universe_count: ssuCount.count ?? 0 }, commercial_opportunity: { status: "not_calculated", reason: "First-party attribution and conversion data are not connected." }, action_plan: { actions: [] }, methodology: { provider: "website_plus_provider_pipeline", search_universe: "studio-specific generated candidates", revenue: "not calculated" }, qa_checks: { website_http_status: websiteData.http_status, website_title_present: Boolean(websiteData.title), ssu_count: ssuCount.count ?? 0, financial_assumptions_used: false }, data_classification: "verified_client", approval_required: true }).eq("id", runId);
    if (update.error) throw new Error(`report_update: ${update.error.message}`);
    const functionUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/search-intelligence-v1`;
    EdgeRuntime.waitUntil(fetch(functionUrl, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}` }, body: JSON.stringify({ report_run_id: runId }) }).catch(error => console.error("search-intelligence-trigger", error)));
    return json({ ok: true, reportId: runId, publicToken: token, status: "analysing", provider: "website_plus_provider_pipeline", searchUniverseCount: ssuCount.count ?? 0, searchPipeline: "started", reportUrl: `https://getinksights.co.uk/studio-visibility-report?reportId=${runId}&token=${token}` });
  } catch (error) {
    console.error(error);
    if (studioId) {
      try {
        const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
        await sb.from("visibility_studios").delete().eq("id", studioId);
      } catch (cleanupError) {
        console.error("visibility-cleanup", cleanupError);
      }
    }
    return json({ ok: false, error: "Unable to generate the report.", studioId }, 500);
  }
});
