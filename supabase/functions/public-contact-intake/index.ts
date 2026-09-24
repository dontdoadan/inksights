import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  allowedCorsOrigin,
  clean,
  isAllowedOrigin,
  validateContactPayload,
} from "./contact-policy.mjs";

function cors(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": allowedCorsOrigin(origin),
    "Access-Control-Allow-Headers":
      "content-type,apikey,authorization,x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Cache-Control": "no-store",
    "Content-Type": "application/json",
    Vary: "Origin",
  };
}

function response(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), { status, headers: cors(origin) });
}

function serviceKey() {
  const raw = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (raw) {
    const keys = JSON.parse(raw) as Record<string, string>;
    const key = keys.default ?? Object.values(keys)[0];
    if (key) return key;
  }
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!legacy) throw new Error("Server credential is unavailable.");
  return legacy;
}

async function digest(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function rest(path: string, init: RequestInit = {}) {
  const key = serviceKey();
  const authorization = key.startsWith("sb_secret_") ? {} : { Authorization: `Bearer ${key}` };
  const result = await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: key, ...authorization, "Content-Type": "application/json", ...(init.headers || {}) },
  });
  const text = await result.text();
  if (!result.ok) {
    console.error("REST failure", result.status, text.slice(0, 500));
    throw new Error("The request could not be stored.");
  }
  return text ? JSON.parse(text) : null;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return response({ error: "Method not allowed" }, 405, origin);
  if (!isAllowedOrigin(origin)) return response({ error: "Origin not allowed" }, 403, origin);
  if (Number(req.headers.get("content-length") || "0") > 32768) return response({ error: "Request too large" }, 413, origin);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return response({ error: "Invalid JSON" }, 400, origin); }

  const validated = validateContactPayload(body);
  if (!validated.ok) return response({ error: validated.error }, 400, origin);
  if (validated.honeypot) return response({ ok: true }, 200, origin);

  try {
    const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    const fingerprint = await digest(`${ip}|contact|${Deno.env.get("RATE_LIMIT_SALT") || "inksights-contact-v1"}`);
    const windowStartedAt = new Date(Math.floor(Date.now() / 3_600_000) * 3_600_000).toISOString();
    const rateLimitAllowed = await rest("rpc/consume_public_endpoint_rate_limit", {
      method: "POST",
      body: JSON.stringify({
        p_endpoint: "public-contact-intake",
        p_key_hash: fingerprint,
        p_window_started_at: windowStartedAt,
        p_max_requests: 5,
      }),
    });
    if (rateLimitAllowed !== true) return response({ error: "Too many messages. Try again later." }, 429, origin);

    const { name, email, studio_name, location, phone, website, topic, message } = validated.value;
    const metadata = {
      page_path: clean(body.page_path, 500) || "/contact",
      referrer: clean(body.referrer, 1000) || null,
      user_agent: clean(req.headers.get("user-agent"), 500) || null,
    };
    const inserted = await rest("public_contact_requests", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        name, email, studio_name, location, phone, website, topic, message,
        consent_at: new Date().toISOString(),
        source: "website_contact",
        data_classification: "external_unverified",
        business_key: "inksights_b2b",
        platform_key: "inksights_b2b",
        metadata,
      }),
    });
    const contact = Array.isArray(inserted) ? inserted[0] : null;
    if (!contact?.id) return response({ error: "The request could not be stored." }, 500, origin);

    // Operational event: no message body, name, email or phone is copied into telemetry.
    // This event must never make a successfully persisted enquiry look failed to the visitor.
    try {
      await rest("integration_events", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          event_type: "lead.created",
          occurred_at: new Date().toISOString(),
          source_system: "website",
          source_event_id: contact.id,
          idempotency_key: `website_contact:${contact.id}`,
          correlation_id: contact.id,
          contact_ref: contact.id,
          processing_status: "received",
          payload: {
            event_kind: "contact_submitted",
            topic,
            page_path: metadata.page_path,
            source: "website_contact",
          },
        }),
      });
    } catch (eventError) {
      console.error(
        "Operational event persistence failed",
        eventError instanceof Error ? eventError.message : String(eventError),
      );
    }

    // CRM sync is server-to-server and non-blocking for the visitor: the enquiry remains
    // successfully captured even if HubSpot is temporarily unavailable.
    try {
      const key = serviceKey();
      const syncResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/hubspot-sync-v1`, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ source_type: "public_contact_request", source_id: contact.id }),
      });
      if (!syncResponse.ok) console.error("HubSpot sync request failed", syncResponse.status, (await syncResponse.text()).slice(0, 300));
    } catch (syncError) {
      console.error("HubSpot sync dispatch failed", syncError instanceof Error ? syncError.message : String(syncError));
    }

    return response({
      ok: true,
      contact_request_id: contact.id,
      message: "Your message has been recorded. INKSIGHTS will reply using the email provided.",
    }, 200, origin);
  } catch (error) {
    console.error("public-contact-intake failure", error instanceof Error ? error.message : String(error));
    return response({ error: "The request could not be stored." }, 500, origin);
  }
});
