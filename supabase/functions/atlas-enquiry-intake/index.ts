import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ALLOWED_HOST = /^(getinksights\.co\.uk|www\.getinksights\.co\.uk|inksight-main(?:-[a-z0-9-]+)?\.vercel\.app|localhost)$/i;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const toText = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max + 1) : "";
function allowed(origin: string | null) {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    return (url.protocol === "https:" || (url.protocol === "http:" && url.hostname === "localhost"))
      && ALLOWED_HOST.test(url.hostname);
  } catch { return false; }
}
function headers(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": allowed(origin) ? origin! : "https://getinksights.co.uk",
    "Access-Control-Allow-Headers": "content-type,authorization,apikey,x-client-info",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Cache-Control": "no-store",
    "Content-Type": "application/json",
    "Vary": "Origin",
  };
}
function reply(origin: string | null, status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: headers(origin) });
}
function serviceKey() {
  const raw = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (raw) {
    const keys = JSON.parse(raw) as Record<string, string>;
    const key = keys.default ?? Object.values(keys)[0];
    if (key) return key;
  }
  const fallback = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!fallback) throw new Error("Missing service credentials");
  return fallback;
}
async function rest(path: string, init: RequestInit = {}) {
  const key = serviceKey();
  const response = await fetch(Deno.env.get("SUPABASE_URL") + "/rest/v1/" + path, {
    ...init,
    headers: { apikey: key, ...(key.startsWith("sb_secret_") ? {} : { Authorization: "Bearer " + key }), "Content-Type": "application/json", ...(init.headers || {}) },
  });
  const output = await response.text();
  if (!response.ok) throw new Error("Backend request failed: " + response.status);
  return output ? JSON.parse(output) : null;
}
async function fingerprint(input: string) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buffer)).map(x => x.toString(16).padStart(2, "0")).join("");
}
Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("", { status: 204, headers: headers(origin) });
  if (req.method !== "POST") return reply(origin, 405, { ok: false, error: "Method not allowed." });
  if (!allowed(origin)) return reply(origin, 403, { ok: false, error: "Origin not allowed." });
  if (Number(req.headers.get("content-length") || 0) > 12000) return reply(origin, 413, { ok: false, error: "Request too large." });

  let body: Record<string, unknown>;
  try {
    body = await req.json() as Record<string, unknown>;
  } catch { return reply(origin, 400, { ok: false, error: "Invalid request format." }); }
  // Silent honeypot: avoid recording or acknowledging unsolicited bot content.
  if (toText(body.website_honeypot, 500)) return reply(origin, 200, { ok: true });

  const profileId = toText(body.profile_id, 40);
  const customerName = toText(body.name, 120);
  const customerEmail = toText(body.email, 254).toLowerCase();
  const brief = toText(body.brief, 3000);
  if (!UUID.test(profileId) || customerName.length < 2 || customerName.length > 120
    || !EMAIL.test(customerEmail) || customerEmail.length > 254 || brief.length < 20
    || brief.length > 3000 || body.consent !== true) {
    return reply(origin, 400, { ok: false, error: "Please complete the required fields and privacy acknowledgement." });
  }
  try {
    const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    const hashedIp = await fingerprint(ip + "|atlas-enquiry|" + (Deno.env.get("RATE_LIMIT_SALT") || "atlas-v1"));
    const windowStart = new Date(Math.floor(Date.now() / 3600000) * 3600000).toISOString();
    const allowance = await rest("rpc/consume_public_endpoint_rate_limit", {
      method: "POST",
      body: JSON.stringify({
        p_endpoint: "atlas-enquiry-intake",
        p_key_hash: hashedIp,
        p_window_started_at: windowStart,
        p_max_requests: 3,
      }),
    });
    if (allowance !== true) return reply(origin, 429, { ok: false, error: "Too many enquiries. Try again later." });

    const studio = await rest("atlas_profiles?select=id,studio_id,listing_status,premises_verified_at,published_at&id=eq." + encodeURIComponent(profileId) + "&limit=1");
    const profile = Array.isArray(studio) ? studio[0] : null;
    if (!profile || profile.listing_status !== "published" || !profile.premises_verified_at || !profile.published_at)
      return reply(origin, 404, { ok: false, error: "This studio is not currently accepting Atlas enquiries." });

    const isTest = /\[qa test\]|\bqa e2e\b/i.test(customerName + " " + brief);
    const inserted = await rest("atlas_customer_enquiries", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        studio_id: profile.studio_id,
        profile_id: profile.id,
        customer_name: customerName,
        customer_email: customerEmail,
        tattoo_brief: brief,
        consent_version: "atlas-privacy-2026-11-v1",
        privacy_notice_accepted_at: new Date().toISOString(),
        marketing_opt_in: false,
        status: "received",
        is_test: isTest,
      }),
    });
    const item = Array.isArray(inserted) ? inserted[0] : null;
    if (!item?.id) throw new Error("Persistence returned no identifier");
    // Never claim delivery: verified studio users can read via atlas-owner-inbox once approved.
    return reply(origin, 200, { ok: true, enquiry_id: item.id, delivery_status: "recorded" });
  } catch (error) {
    console.error("atlas enquiry intake error", error instanceof Error ? error.message : String(error));
    return reply(origin, 500, { ok: false, error: "We could not record the enquiry." });
  }
});