import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

type JsonRecord = Record<string, unknown>;
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const jsonResponse = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...corsHeaders, "Content-Type": "application/json" },
});

function getAdminKey(): string {
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacy) return legacy;
  const raw = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (!raw) throw new Error("No Supabase server-side key is available.");
  const keys = JSON.parse(raw) as Record<string, string>;
  const key = keys.default ?? Object.values(keys)[0];
  if (!key) throw new Error("SUPABASE_SECRET_KEYS does not contain a usable key.");
  return key;
}

function base64Url(input: Uint8Array | string): string {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeServiceAccount(raw: string): JsonRecord {
  try { return JSON.parse(raw) as JsonRecord; }
  catch { return JSON.parse(atob(raw)) as JsonRecord; }
}

async function serviceAccountAccessToken(raw: string): Promise<string> {
  const account = decodeServiceAccount(raw);
  const clientEmail = String(account.client_email ?? "");
  const privateKeyPem = String(account.private_key ?? "");
  if (!clientEmail || !privateKeyPem) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is missing client_email or private_key.");
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64Url(JSON.stringify({
    iss: clientEmail, scope: "https://www.googleapis.com/auth/webmasters.readonly",
    aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600,
  }));
  const unsigned = `${header}.${payload}`;
  const stripped = privateKeyPem.replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "").replace(/\s+/g, "");
  const der = Uint8Array.from(atob(stripped), (char) => char.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const signature = new Uint8Array(await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" }, key, new TextEncoder().encode(unsigned)));
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${base64Url(signature)}` }),
  });
  const payloadJson = await response.json() as JsonRecord;
  if (!response.ok) throw new Error(`Google service-account token exchange failed: ${JSON.stringify(payloadJson)}`);
  return String(payloadJson.access_token);
}

async function refreshTokenAccessToken(): Promise<string> {
  const clientId = Deno.env.get("GOOGLE_GSC_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_GSC_CLIENT_SECRET");
  const refreshToken = Deno.env.get("GOOGLE_GSC_REFRESH_TOKEN");
  if (!clientId || !clientSecret || !refreshToken) throw new Error("Google OAuth refresh-token credentials are incomplete.");
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret,
      refresh_token: refreshToken, grant_type: "refresh_token" }),
  });
  const payload = await response.json() as JsonRecord;
  if (!response.ok) throw new Error(`Google refresh-token exchange failed: ${JSON.stringify(payload)}`);
  return String(payload.access_token);
}

async function googleAccessToken(): Promise<string> {
  const serviceAccount = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
  return serviceAccount ? await serviceAccountAccessToken(serviceAccount) : await refreshTokenAccessToken();
}

function settledDate(daysAgo: number): string {
  const date = new Date(); date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

async function fetchSearchAnalytics(accessToken: string, siteUrl: string,
  startDate: string, endDate: string, dimensions: string[]): Promise<Array<JsonRecord>> {
  const endpoint = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
  const rows: Array<JsonRecord> = []; const rowLimit = 25_000;
  for (let startRow = 0; startRow < 100_000; startRow += rowLimit) {
    const response = await fetch(endpoint, {
      method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ startDate, endDate, dimensions, rowLimit, startRow, dataState: "final", type: "web" }),
    });
    const payload = await response.json() as JsonRecord;
    if (!response.ok) throw new Error(`Search Console query failed (${response.status}): ${JSON.stringify(payload)}`);
    const page = Array.isArray(payload.rows) ? payload.rows as Array<JsonRecord> : [];
    rows.push(...page); if (page.length < rowLimit) break;
  }
  return rows;
}

function chunk<T>(values: T[], size = 500): T[][] {
  const output: T[][] = [];
  for (let index = 0; index < values.length; index += size) output.push(values.slice(index, index + size));
  return output;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "POST required." }, 405);
  const startedAt = Date.now(); const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (!supabaseUrl) return jsonResponse({ error: "SUPABASE_URL is unavailable." }, 500);
  const supabase = createClient(supabaseUrl, getAdminKey(), { auth: { persistSession: false, autoRefreshToken: false } });
  let input: JsonRecord = {}; try { input = await req.json() as JsonRecord; } catch { input = {}; }
  const action = String(input.action ?? "sync");
  const siteUrl = String(input.siteUrl ?? "sc-domain:getinkcare.co.uk");
  const requestedDays = Number(input.days ?? 10);
  const syncDays = Number.isFinite(requestedDays) ? Math.min(90, Math.max(1, Math.trunc(requestedDays))) : 10;
  const dryRun = Deno.env.get("INKCARE_SEARCH_DRY_RUN") !== "false";
  const credentialsPresent = Boolean(Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON") ||
    (Deno.env.get("GOOGLE_GSC_CLIENT_ID") && Deno.env.get("GOOGLE_GSC_CLIENT_SECRET") && Deno.env.get("GOOGLE_GSC_REFRESH_TOKEN")));
  const { data: property, error: propertyError } = await supabase.from("seo_properties")
    .select("id,site_url,status,metadata").eq("site_url", siteUrl).maybeSingle();
  if (propertyError) return jsonResponse({ error: propertyError.message }, 500);
  if (!property) return jsonResponse({ error: `Unknown Search Console property: ${siteUrl}` }, 404);
  if (action === "health") return jsonResponse({ module: "INKCARE Search Intelligence", property: property.site_url,
    propertyStatus: property.status, dryRun, credentialsPresent, ready: credentialsPresent && !dryRun,
    storage: "INKCARE Supabase" });

  const externalRunId = crypto.randomUUID();
  const { data: syncRun, error: runError } = await supabase.from("command_centre_sync_runs").insert({
    provider: "google_search_console", run_type: "search_intelligence_sync", external_run_id: externalRunId,
    status: "started", details: { siteUrl, syncDays, dryRun },
  }).select("id").single();
  if (runError) return jsonResponse({ error: runError.message }, 500);

  async function failSync(code: string, message: string, status = 500): Promise<Response> {
    await Promise.all([
      supabase.from("command_centre_sync_runs").update({ status: "failed", error_count: 1,
        completed_at: new Date().toISOString(), error_summary: message, details: { siteUrl, syncDays, dryRun, code } }).eq("id", syncRun.id),
      supabase.from("command_centre_connector_health").upsert({ provider: "google_search_console",
        account_reference: siteUrl, account_name: "INKCARE",
        connection_status: code === "GSC_AUTH_REQUIRED" ? "disconnected" : "critical", sync_status: "failed",
        last_attempt_at: new Date().toISOString(), response_time_ms: Date.now() - startedAt,
        error_count: 1, warning_count: code === "GSC_AUTH_REQUIRED" ? 1 : 0, last_error_code: code,
        last_error_message: message, catalogue_status: "ready", mapping_status: "ready",
        credentials_status: code === "GSC_AUTH_REQUIRED" ? "required" : "invalid",
        metadata: { module: "INKCARE Search Intelligence", dryRun }, updated_at: new Date().toISOString(),
      }, { onConflict: "provider" }),
      supabase.from("seo_properties").update({ status: code === "GSC_AUTH_REQUIRED" ? "awaiting_authorization" : "error",
        metadata: { ...((property.metadata as JsonRecord | null) ?? {}), credentials_required: code === "GSC_AUTH_REQUIRED", last_error: message } }).eq("id", property.id),
    ]);
    return jsonResponse({ ok: false, code, error: message, dryRun }, status);
  }
  if (dryRun || !credentialsPresent) return await failSync("GSC_AUTH_REQUIRED",
    dryRun ? "Search Console sync is deployed in DRY_RUN mode. Add credentials and set INKCARE_SEARCH_DRY_RUN=false."
      : "Google Search Console read-only credentials are missing.", 409);

  try {
    const accessToken = await googleAccessToken();
    const endDate = settledDate(3); const startDate = settledDate(syncDays + 2);
    const [queryRows, pageRows] = await Promise.all([
      fetchSearchAnalytics(accessToken, siteUrl, startDate, endDate, ["date","query","page","country","device"]),
      fetchSearchAnalytics(accessToken, siteUrl, startDate, endDate, ["date","page","country","device"]),
    ]);
    const queryRecords = queryRows.map((row) => {
      const keys = Array.isArray(row.keys) ? row.keys.map(String) : [];
      return { property_id: property.id, data_date: keys[0], query: keys[1] ?? "", page_url: keys[2] ?? "",
        country: keys[3] ?? "", device: keys[4] ?? "", search_type: "web", clicks: Number(row.clicks ?? 0),
        impressions: Number(row.impressions ?? 0), ctr: Number(row.ctr ?? 0), avg_position: Number(row.position ?? 0),
        raw_data: row, ingested_at: new Date().toISOString() };
    }).filter((row) => row.data_date && row.query);
    const pageRecords = pageRows.map((row) => {
      const keys = Array.isArray(row.keys) ? row.keys.map(String) : [];
      return { property_id: property.id, data_date: keys[0], page_url: keys[1] ?? "", country: keys[2] ?? "",
        device: keys[3] ?? "", search_type: "web", clicks: Number(row.clicks ?? 0), impressions: Number(row.impressions ?? 0),
        ctr: Number(row.ctr ?? 0), avg_position: Number(row.position ?? 0), raw_data: row, ingested_at: new Date().toISOString() };
    }).filter((row) => row.data_date && row.page_url);
    let written = 0;
    for (const batch of chunk(queryRecords)) {
      const { error } = await supabase.from("seo_query_daily").upsert(batch,
        { onConflict: "property_id,data_date,query,page_url,country,device,search_type" });
      if (error) throw new Error(`Query upsert failed: ${error.message}`); written += batch.length;
    }
    for (const batch of chunk(pageRecords)) {
      const { error } = await supabase.from("seo_page_daily").upsert(batch,
        { onConflict: "property_id,data_date,page_url,country,device,search_type" });
      if (error) throw new Error(`Page upsert failed: ${error.message}`); written += batch.length;
    }
    const now = new Date().toISOString();
    await supabase.from("seo_properties").update({ status: "active", last_sync_at: now,
      last_successful_date: endDate, metadata: { ...((property.metadata as JsonRecord | null) ?? {}), domain: "getinkcare.co.uk",
        search_type: "web", credentials_required: false,
        latest_sync: { startDate, endDate, queryRows: queryRecords.length, pageRows: pageRecords.length } } }).eq("id", property.id);
    const { error: opportunityError } = await supabase.rpc("seo_refresh_opportunities");
    if (opportunityError) throw new Error(`Opportunity refresh failed: ${opportunityError.message}`);
    const { error: metricError } = await supabase.rpc("seo_publish_command_centre_metrics");
    if (metricError) throw new Error(`Metric publication failed: ${metricError.message}`);
    await Promise.all([
      supabase.from("command_centre_connector_health").upsert({ provider: "google_search_console",
        account_reference: siteUrl, account_name: "INKCARE", connection_status: "healthy", sync_status: "success",
        last_attempt_at: now, last_success_at: now, last_event_at: now, response_time_ms: Date.now() - startedAt,
        error_count: 0, warning_count: 0, last_error_code: null, last_error_message: null,
        catalogue_status: "ready", mapping_status: "ready", credentials_status: "valid",
        metadata: { module: "INKCARE Search Intelligence", latestDataDate: endDate,
          queryRows: queryRecords.length, pageRows: pageRecords.length }, updated_at: now }, { onConflict: "provider" }),
      supabase.from("command_centre_sync_runs").update({ status: "success", records_read: queryRows.length + pageRows.length,
        records_written: written, completed_at: now, details: { siteUrl, startDate, endDate,
          queryRows: queryRecords.length, pageRows: pageRecords.length, durationMs: Date.now() - startedAt } }).eq("id", syncRun.id),
      supabase.from("command_centre_alerts").update({ status: "resolved", resolved_at: now, last_detected_at: now })
        .eq("alert_key", "gsc_authorization_required"),
    ]);
    return jsonResponse({ ok: true, property: siteUrl, startDate, endDate, queryRows: queryRecords.length,
      pageRows: pageRecords.length, recordsWritten: written, durationMs: Date.now() - startedAt });
  } catch (error) {
    return await failSync("GSC_SYNC_FAILED", error instanceof Error ? error.message : String(error), 500);
  }
});