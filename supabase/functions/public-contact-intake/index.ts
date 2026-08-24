import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const allowedOrigins = new Set([
  "https://getinkcare.co.uk",
  "https://www.getinkcare.co.uk",
  "https://inkcare-growth-engine.inkcareoncodex.chatgpt.site",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
]);

function cors(origin: string | null) {
  const allowed = origin && allowedOrigins.has(origin)
    ? origin
    : "https://getinkcare.co.uk";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers":
      "content-type,apikey,authorization,x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Cache-Control": "no-store",
    "Content-Type": "application/json",
    Vary: "Origin",
  };
}

function response(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: cors(origin),
  });
}

function clean(value: unknown, max = 500) {
  return String(value ?? "")
    .trim()
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .slice(0, max);
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
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function rest(path: string, init: RequestInit = {}) {
  const key = serviceKey();
  const authorization = key.startsWith("sb_secret_")
    ? {}
    : { Authorization: `Bearer ${key}` };
  const result = await fetch(
    `${Deno.env.get("SUPABASE_URL")}/rest/v1/${path}`,
    {
      ...init,
      headers: {
        apikey: key,
        ...authorization,
        "Content-Type": "application/json",
        ...(init.headers || {}),
      },
    },
  );
  const text = await result.text();
  if (!result.ok) {
    console.error("REST failure", result.status, text.slice(0, 500));
    throw new Error("The request could not be stored.");
  }
  return text ? JSON.parse(text) : null;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors(origin) });
  }
  if (req.method !== "POST") {
    return response({ error: "Method not allowed" }, 405, origin);
  }
  if (origin && !allowedOrigins.has(origin)) {
    return response({ error: "Origin not allowed" }, 403, origin);
  }
  if (Number(req.headers.get("content-length") || "0") > 32768) {
    return response({ error: "Request too large" }, 413, origin);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return response({ error: "Invalid JSON" }, 400, origin);
  }

  if (clean(body.company_url, 200)) {
    return response({ ok: true }, 200, origin);
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 254).toLowerCase();
  const studioName = clean(body.studio_name, 180) || null;
  const topic = clean(body.topic, 80);
  const message = clean(body.message, 3000);
  const consent = body.consent === true;
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!name || !validEmail || !topic || message.length < 10 || !consent) {
    return response(
      {
        error:
          "Name, valid email, topic, message and consent are required.",
      },
      400,
      origin,
    );
  }

  const ip = (req.headers.get("x-forwarded-for") || "unknown")
    .split(",")[0]
    .trim();
  const fingerprint = await digest(
    `${ip}|contact|${Deno.env.get("RATE_LIMIT_SALT") || "inkcare"}`,
  );
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const recent = await rest(
    `growth_rate_limits?select=id&fingerprint=eq.${encodeURIComponent(fingerprint)}&action=eq.contact&window_start=gte.${encodeURIComponent(since)}`,
  );
  if (Array.isArray(recent) && recent.length >= 5) {
    return response(
      { error: "Too many messages. Try again later." },
      429,
      origin,
    );
  }
  await rest("growth_rate_limits", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ fingerprint, action: "contact" }),
  });

  const metadata = {
    page_path: clean(body.page_path, 500) || "/contact",
    referrer: clean(body.referrer, 1000) || null,
    user_agent: clean(req.headers.get("user-agent"), 500) || null,
  };
  const inserted = await rest("public_contact_requests", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      name,
      email,
      studio_name: studioName,
      topic,
      message,
      consent_at: new Date().toISOString(),
      source: "website_contact",
      metadata,
    }),
  });
  const contact = Array.isArray(inserted) ? inserted[0] : null;
  if (!contact?.id) {
    return response(
      { error: "The request could not be stored." },
      500,
      origin,
    );
  }

  await rest("communication_outbox", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify([
      {
        channel: "email",
        template_key: "public_contact_acknowledgement",
        recipient: email,
        subject: "INKCARE received your message",
        payload: { contact_request_id: contact.id, name, topic },
      },
      {
        channel: "email",
        template_key: "public_contact_internal_notification",
        recipient: "contact@getinkcare.co.uk",
        subject: `New INKCARE website message: ${topic}`,
        payload: {
          contact_request_id: contact.id,
          name,
          email,
          studio_name: studioName,
          topic,
          message,
        },
      },
    ]),
  });

  return response(
    {
      ok: true,
      contact_request_id: contact.id,
      message:
        "Your message has been recorded. INKCARE will reply using the email provided.",
    },
    200,
    origin,
  );
});
