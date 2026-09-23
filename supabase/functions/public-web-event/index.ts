import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SB = Deno.env.get("SUPABASE_URL") || "";
const KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SECRET_KEY") || "";

const EXACT_ORIGINS = new Set([
  "https://getinksights.co.uk",
  "https://www.getinksights.co.uk",
  "http://localhost:5173",
  "http://localhost:8080",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8080",
]);
const PREVIEW_HOST = /^inksight-main(?:-[a-z0-9-]+)?-inksights\.vercel\.app$/i;
const ALLOWED_EVENTS = new Set([
  "page_view",
  "cta_clicked",
  "diagnostic_started",
  "diagnostic_completed",
  "contact_started",
  "contact_submitted",
  "checkout_started",
  "payment_completed",
  "form_error",
  "checkout_error",
]);
const PII_KEYS = /(email|e-mail|name|phone|message|address|postcode|password|token|secret|card|studio_name)/i;

function clean(value: unknown, max = 500) {
  return String(value ?? "").trim().replace(/[\u0000-\u001F\u007F]/g, "").slice(0, max);
}
function isAllowedOrigin(origin: string | null) {
  if (!origin) return true;
  if (EXACT_ORIGINS.has(origin)) return true;
  try {
    const u = new URL(origin);
    return u.protocol === "https:" && u.port === "" && PREVIEW_HOST.test(u.hostname);
  } catch {
    return false;
  }
}
function cors(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin && isAllowedOrigin(origin) ? origin : "https://getinksights.co.uk",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    Vary: "Origin",
  };
}
function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), { status, headers: cors(origin) });
}
async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function safeProperties(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const out: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>).slice(0, 20)) {
    if (PII_KEYS.test(key)) continue;
    if (value == null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      out[clean(key, 80)] = typeof value === "string" ? clean(value, 300) : value as number | boolean | null;
    }
  }
  return out;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405, origin);
  if (!isAllowedOrigin(origin)) return json({ error: "Origin not allowed" }, 403, origin);
  if (!SB || !KEY) return json({ error: "Analytics service unavailable" }, 503, origin);
  if (Number(req.headers.get("content-length") || "0") > 8192) return json({ error: "Request too large" }, 413, origin);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400, origin); }

  const eventName = clean(body.event_name, 80);
  const pagePath = clean(body.page_path, 500);
  if (!ALLOWED_EVENTS.has(eventName) || !pagePath.startsWith("/")) return json({ error: "Invalid event" }, 400, origin);

  const forwarded = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  const keyHash = await sha256(`public-web-event:${forwarded}`);
  const windowStartedAt = new Date(Math.floor(Date.now() / 60_000) * 60_000).toISOString();
  const rateRes = await fetch(`${SB}/rest/v1/rpc/consume_public_endpoint_rate_limit`, {
    method: "POST",
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      p_endpoint: "public-web-event",
      p_key_hash: keyHash,
      p_window_started_at: windowStartedAt,
      p_max_requests: 120,
    }),
  });
  if (!rateRes.ok || await rateRes.json() !== true) return json({ error: "Rate limited" }, 429, origin);

  const insert = await fetch(`${SB}/rest/v1/website_events`, {
    method: "POST",
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      event_name: eventName,
      page_path: pagePath,
      referrer: clean(body.referrer, 1000) || null,
      session_id: clean(body.session_id, 120) || null,
      properties: safeProperties(body.properties),
      consent_type: "analytics",
      business_key: "inksights_b2b",
    }),
  });
  if (!insert.ok) {
    console.error("website_events insert failed", insert.status, (await insert.text()).slice(0, 400));
    return json({ error: "Event not recorded" }, 500, origin);
  }
  return json({ ok: true }, 200, origin);
});
