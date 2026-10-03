import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SB = Deno.env.get("SUPABASE_URL") || "";
const WEBHOOK_CONFIG_KEY = "stripe_checkout_webhook_signing_secret_v1";
const AUDIT_PAYMENT_LINK_ID = "plink_1UG09jCX6YhLOssgBDzdEF5X";
const AUDIT_PRICE_ID = "price_1UG09NCX6YhLOssgi93xsGnH";
const AUDIT_OFFER = "studio-intelligence-audit";
const MAX_BODY_BYTES = 256_000;
const TOLERANCE_SECONDS = 300;

function serviceKeys() {
  const values: string[] = [];
  const raw = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (raw) {
    try {
      const keys = JSON.parse(raw) as Record<string, string>;
      values.push(...Object.values(keys).filter(Boolean));
    } catch {
      console.error("SUPABASE_SECRET_KEYS could not be parsed.");
    }
  }
  for (const key of [Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"), Deno.env.get("SUPABASE_SECRET_KEY")]) {
    if (key) values.push(key);
  }
  return [...new Set(values)];
}

function serviceKey() {
  return serviceKeys()[0] || "";
}

function headers(key: string, prefer = "return=representation") {
  const authorization = key.startsWith("sb_secret_") ? {} : { Authorization: `Bearer ${key}` };
  return { apikey: key, ...authorization, "Content-Type": "application/json", Prefer: prefer };
}

async function rest(path: string, init: RequestInit = {}) {
  const key = serviceKey();
  if (!key) throw new Error("Supabase server credential unavailable.");
  const response = await fetch(`${SB}/rest/v1/${path}`, {
    ...init,
    headers: { ...headers(key), ...(init.headers || {}) },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Supabase REST ${response.status}: ${text.slice(0, 500)}`);
  return text ? JSON.parse(text) : null;
}

function clean(value: unknown, max = 500) {
  return String(value ?? "").trim().replace(/[\u0000-\u001F\u007F]/g, "").slice(0, max);
}

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function hex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function webhookSecret() {
  const rows = await rest(
    `integration_runtime_config?config_key=eq.${encodeURIComponent(WEBHOOK_CONFIG_KEY)}&select=config_value&limit=1`,
    { method: "GET" },
  ) as Array<{ config_value: string }>;
  const value = clean(rows?.[0]?.config_value, 500);
  if (!value || !value.startsWith("whsec_")) throw new Error("Stripe webhook signing secret unavailable.");
  return value;
}

async function verifySignature(payload: string, signatureHeader: string, secret: string) {
  const fields = signatureHeader.split(",").map((item) => item.trim());
  const timestamp = fields.find((item) => item.startsWith("t="))?.slice(2) || "";
  const signatures = fields.filter((item) => item.startsWith("v1=")).map((item) => item.slice(3));
  if (!/^\d+$/.test(timestamp) || signatures.length === 0) return false;

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(timestamp)) > TOLERANCE_SECONDS) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${payload}`),
  );
  const expected = hex(digest);
  return signatures.some((candidate) => timingSafeEqual(candidate, expected));
}

function customField(session: Record<string, any>, key: string) {
  const field = Array.isArray(session.custom_fields)
    ? session.custom_fields.find((item: any) => item?.key === key || item?.label?.custom?.toLowerCase?.() === key.toLowerCase())
    : null;
  return clean(field?.text?.value || field?.numeric?.value || field?.dropdown?.value, 180);
}

function studioName(session: Record<string, any>) {
  return clean(
    session.collected_information?.business_name ||
      session.metadata?.studio_name ||
      customField(session, "business name") ||
      customField(session, "studio name") ||
      session.customer_details?.name,
    180,
  );
}

async function upsertOrder(session: Record<string, any>, paid: boolean) {
  const metadata = session.metadata && typeof session.metadata === "object" ? session.metadata : {};
  const body = {
    stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
    stripe_session_id: clean(session.id, 120),
    stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
    stripe_subscription_id: typeof session.subscription === "string" ? session.subscription : null,
    stripe_product_id: clean(metadata.product_id, 120) || null,
    stripe_price_id: clean(metadata.price_id, 120) || AUDIT_PRICE_ID,
    offer_slug: AUDIT_OFFER,
    amount_total: Number.isFinite(session.amount_total) ? session.amount_total : null,
    currency: clean(session.currency, 20).toLowerCase() || "gbp",
    status: paid ? "paid" : "pending",
    customer_email: clean(session.customer_details?.email || session.customer_email, 254).toLowerCase() || null,
    metadata: {
      ...metadata,
      source: "stripe_payment_link",
      payment_link: clean(session.payment_link, 120) || null,
      payment_status: clean(session.payment_status, 40) || null,
      checkout_status: clean(session.status, 40) || null,
    },
    updated_at: new Date().toISOString(),
  };
  return rest("orders?on_conflict=stripe_session_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(body),
  });
}

async function ensureContactAndCrm(session: Record<string, any>) {
  const sessionId = clean(session.id, 120);
  const email = clean(session.customer_details?.email || session.customer_email, 254).toLowerCase();
  const name = clean(
    session.collected_information?.individual_name ||
      session.customer_details?.name ||
      studioName(session),
    120,
  );
  const studio = studioName(session) || name;
  if (!sessionId || !email || !name) {
    console.error("Paid audit checkout missing contact identity", { sessionId, hasEmail: Boolean(email), hasName: Boolean(name) });
    return null;
  }

  const existing = await rest(
    `public_contact_requests?metadata->>stripe_session_id=eq.${encodeURIComponent(sessionId)}&select=id,hubspot_synced_at&limit=1`,
    { method: "GET" },
  );
  let contact = Array.isArray(existing) ? existing[0] : null;

  if (!contact?.id) {
    const inserted = await rest("public_contact_requests", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        name,
        email,
        studio_name: studio || null,
        topic: "studio-intelligence-audit",
        message: "Paid Studio Intelligence Audit purchase received via Stripe. Begin onboarding and information request.",
        source: "stripe_checkout",
        status: "new",
        consent_at: new Date().toISOString(),
        data_classification: "external_unverified",
        business_key: "inksights_b2b",
        platform_key: "inksights_b2b",
        metadata: {
          stripe_session_id: sessionId,
          stripe_payment_link_id: clean(session.payment_link, 120) || null,
          stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
          payment_status: clean(session.payment_status, 40),
          amount_total: Number.isFinite(session.amount_total) ? session.amount_total : null,
          currency: clean(session.currency, 20).toLowerCase() || null,
          page_path: "/offers/studio-intelligence-audit",
          source: "stripe_payment_link",
        },
        is_test: false,
        test_reason: null,
      }),
    });
    contact = Array.isArray(inserted) ? inserted[0] : null;
  }

  if (!contact?.id) throw new Error("Could not create or resolve paid audit contact.");

  try {
    await rest("integration_events", {
      method: "POST",
      headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
      body: JSON.stringify({
        event_type: "payment.completed",
        occurred_at: new Date().toISOString(),
        source_system: "stripe",
        source_event_id: sessionId,
        idempotency_key: `stripe_checkout_paid:${sessionId}`,
        correlation_id: sessionId,
        contact_ref: contact.id,
        processing_status: "received",
        payload: {
          event_kind: "studio_intelligence_audit_paid",
          offer: AUDIT_OFFER,
          payment_link: clean(session.payment_link, 120) || null,
          amount_total: Number.isFinite(session.amount_total) ? session.amount_total : null,
          currency: clean(session.currency, 20).toLowerCase() || null,
        },
      }),
    });
  } catch (eventError) {
    console.error("Payment integration event persistence failed", eventError instanceof Error ? eventError.message : String(eventError));
  }

  try {
    const key = serviceKey();
    const sync = await fetch(`${SB}/functions/v1/hubspot-sync-v1`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        source_type: "public_contact_request",
        source_id: contact.id,
      }),
    });
    if (!sync.ok) console.error("HubSpot sync request failed", sync.status, (await sync.text()).slice(0, 400));
  } catch (syncError) {
    console.error("HubSpot sync dispatch failed", syncError instanceof Error ? syncError.message : String(syncError));
  }

  return contact.id;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return response({ error: "Method not allowed" }, 405);
  const contentLength = Number(req.headers.get("content-length") || "0");
  if (contentLength > MAX_BODY_BYTES) return response({ error: "Payload too large" }, 413);

  const signature = req.headers.get("stripe-signature") || "";
  if (!signature) return response({ error: "Missing Stripe signature" }, 400);

  const payload = await req.text();
  if (payload.length > MAX_BODY_BYTES) return response({ error: "Payload too large" }, 413);

  try {
    const secret = await webhookSecret();
    if (!(await verifySignature(payload, signature, secret))) {
      console.error("Stripe webhook signature verification failed.");
      return response({ error: "Invalid signature" }, 400);
    }

    const event = JSON.parse(payload) as Record<string, any>;
    if (event.livemode !== true) return response({ received: true, skipped: "non_live_event" }, 200);
    if (!["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(clean(event.type, 100))) {
      return response({ received: true, skipped: "event_type" }, 200);
    }

    const session = event.data?.object as Record<string, any>;
    if (!session?.id || session.object !== "checkout.session") return response({ error: "Invalid Checkout Session payload" }, 400);

    const metadataOffer = clean(session.metadata?.offer_slug || session.metadata?.offer, 100);
    const isAuditCheckout = clean(session.payment_link, 120) === AUDIT_PAYMENT_LINK_ID || metadataOffer === "studio_intelligence_audit" || metadataOffer === AUDIT_OFFER;
    if (!isAuditCheckout) return response({ received: true, skipped: "unrelated_checkout" }, 200);

    const paid = event.type === "checkout.session.async_payment_succeeded" || session.payment_status === "paid";
    await upsertOrder(session, paid);

    let contactRequestId: string | null = null;
    if (paid) contactRequestId = await ensureContactAndCrm(session);

    return response({
      received: true,
      event_id: clean(event.id, 120),
      session_id: clean(session.id, 120),
      paid,
      contact_request_id: contactRequestId,
    });
  } catch (error) {
    console.error("stripe-checkout-webhook-v1 failure", error instanceof Error ? error.message : String(error));
    return response({ error: "Webhook processing failed" }, 500);
  }
});
