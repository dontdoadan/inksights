import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SB = Deno.env.get("SUPABASE_URL") || "";
const DEFAULT_DEAL_PIPELINE = "default";
const DEFAULT_NEW_LEAD_STAGE = "6160204007";
const DEFAULT_PAID_BOOKED_STAGE = "6161522919";

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
  const response = await fetch(`${SB}/rest/v1/${path}`, {
    ...init,
    headers: { ...headers(key), ...(init.headers || {}) },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Supabase REST ${response.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

function clean(value: unknown, max = 500) {
  return String(value ?? "").trim().replace(/[\u0000-\u001F\u007F]/g, "").slice(0, max);
}

function explicitTestReason(...values: unknown[]) {
  const value = values.map((item) => String(item ?? "")).join(" ").toLowerCase();
  if (/\[qa test\]/.test(value) || /\bqa e2e\b/.test(value)) return "explicit_qa_marker";
  if (/\[test\]/.test(value) || /\btest studio\b/.test(value)) return "explicit_test_marker";
  if (/\bclient zero\b/.test(value) || /\bsample-studio\b/.test(value) || /\bdemo tattoo studio\b/.test(value)) return "known_test_fixture";
  return null;
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { first_name: parts[0] || "", last_name: "" };
  return { first_name: parts[0], last_name: parts.slice(1).join(" ") };
}

function domainFromWebsite(value: string | null | undefined) {
  const raw = clean(value, 500);
  if (!raw) return "";
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return url.hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return "";
  }
}

async function runtimeConfig() {
  const rows = await rest(
    "integration_runtime_config?config_key=in.(make_hubspot_sync_url,make_hubspot_sync_token,hubspot_deal_pipeline,hubspot_stage_new_lead,hubspot_stage_paid_booked)&select=config_key,config_value",
    { method: "GET" },
  ) as Array<{ config_key: string; config_value: string }>;
  const map = Object.fromEntries(rows.map((row) => [row.config_key, row.config_value]));
  if (!map.make_hubspot_sync_url || !map.make_hubspot_sync_token) {
    throw new Error("HubSpot sync runtime configuration is incomplete.");
  }
  return {
    url: map.make_hubspot_sync_url,
    token: map.make_hubspot_sync_token,
    dealPipeline: map.hubspot_deal_pipeline || DEFAULT_DEAL_PIPELINE,
    newLeadStage: map.hubspot_stage_new_lead || DEFAULT_NEW_LEAD_STAGE,
    paidBookedStage: map.hubspot_stage_paid_booked || DEFAULT_PAID_BOOKED_STAGE,
  };
}

async function recordAttempt(table: string, id: string, error: string | null = null) {
  await rest(`${table}?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      hubspot_sync_attempts: undefined,
      hubspot_last_attempt_at: new Date().toISOString(),
      hubspot_sync_error: error,
    }),
  });
  // Increment separately so retries stay observable without requiring a database function.
  await rest(`${table}?id=eq.${encodeURIComponent(id)}&select=hubspot_sync_attempts`, { method: "GET" })
    .then(async (rows) => {
      const current = Number(rows?.[0]?.hubspot_sync_attempts || 0);
      await rest(`${table}?id=eq.${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ hubspot_sync_attempts: current + 1 }),
      });
    });
}


async function syncProspectAudit(sourceId: string) {
  const idempotencyKey = `prospect_hubspot_sync:${sourceId}`;
  const prior = await rest(
    `integration_events?idempotency_key=eq.${encodeURIComponent(idempotencyKey)}&select=event_id,processing_status,contact_ref,opportunity_ref,payload,attempt_count&limit=1`,
    { method: "GET" },
  ) as Array<Record<string, any>>;
  const existing = prior?.[0];
  if (existing?.processing_status === "processed" && existing.contact_ref && existing.opportunity_ref) {
    return new Response(JSON.stringify({
      ok: true,
      already_synced: true,
      contact_id: existing.contact_ref,
      deal_id: existing.opportunity_ref,
      company_id: existing.payload?.company_id || null,
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  const audits = await rest(
    `audits?id=eq.${encodeURIComponent(sourceId)}&audit_type=eq.prospect_intelligence&select=id,studio_id,context&limit=1`,
    { method: "GET" },
  ) as Array<Record<string, any>>;
  const audit = audits?.[0];
  if (!audit) throw new Error("Prospect audit source record not found.");

  const studios = await rest(
    `studios?id=eq.${encodeURIComponent(String(audit.studio_id))}&select=id,name,website_url,primary_location,internal_validation&limit=1`,
    { method: "GET" },
  ) as Array<Record<string, any>>;
  const studio = studios?.[0];
  if (!studio) throw new Error("Prospect studio record not found.");
  if (studio.internal_validation === true || explicitTestReason(studio.name)) {
    return new Response(JSON.stringify({ ok: true, skipped: true, reason: "test_record" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const context = audit.context && typeof audit.context === "object" ? audit.context as Record<string, any> : {};
  const contact = context.prospect_contact && typeof context.prospect_contact === "object"
    ? context.prospect_contact as Record<string, any>
    : {};
  const name = clean(contact.name, 120);
  const email = clean(contact.email, 254).toLowerCase();
  const phone = clean(contact.phone, 80);
  if (!name || !/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(email)) {
    throw new Error("Prospect CRM handoff requires a valid named contact and email.");
  }

  const config = await runtimeConfig();
  const studioName = clean(studio.name, 180);
  const website = clean(studio.website_url, 500);
  const location = clean(studio.primary_location, 180);
  const companyDomain = domainFromWebsite(website);
  const { first_name, last_name } = splitName(name);
  const dealName = `${studioName} — Prospect Intelligence follow-up — ${sourceId.slice(0, 8)}`;
  const score = context.prospect_score && typeof context.prospect_score === "object"
    ? context.prospect_score as Record<string, any>
    : {};

  const now = new Date().toISOString();
  if (!existing) {
    await rest("integration_events", {
      method: "POST",
      body: JSON.stringify({
        event_type: "lead.created",
        occurred_at: now,
        source_system: "inksights_prospect_intelligence",
        source_event_id: sourceId,
        idempotency_key: idempotencyKey,
        correlation_id: sourceId,
        studio_id: audit.studio_id,
        contact_ref: email,
        processing_status: "received",
        attempt_count: 1,
        payload: {
          contact_name: name,
          contact_email: email,
          studio_name: studioName,
          prospect_score: score,
          audit_id: sourceId,
        },
      }),
    });
  } else {
    await rest(`integration_events?event_id=eq.${encodeURIComponent(String(existing.event_id))}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        processing_status: "received",
        attempt_count: Number(existing.attempt_count || 0) + 1,
        error_code: null,
        error_detail: null,
        updated_at: now,
      }),
    });
  }

  try {
    const makeResponse = await fetch(config.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sync_token: config.token,
        sync_version: "v1",
        source_type: "prospect_audit",
        source_id: sourceId,
        email,
        name,
        first_name,
        last_name,
        studio_name: studioName,
        location,
        phone,
        website,
        company_domain: companyDomain,
        company_lookup: companyDomain || studioName,
        topic: "studio-intelligence-audit",
        primary_problem: "Evidence-backed public acquisition constraint identified by INKSIGHTS Prospect Intelligence",
        source: "prospect_intelligence_v1",
        page_path: "",
        referrer: "",
        audit_id: sourceId,
        deal_name: dealName,
        deal_amount: 0,
        deal_pipeline: config.dealPipeline,
        deal_stage: config.newLeadStage,
      }),
    });
    const responseText = await makeResponse.text();
    let makeResult: Record<string, any> = {};
    try { makeResult = responseText ? JSON.parse(responseText) : {}; } catch { makeResult = {}; }
    if (!makeResponse.ok || makeResult.ok !== true || !makeResult.contact_id || !makeResult.deal_id) {
      throw new Error(`Make/HubSpot sync failed: ${makeResponse.status} ${responseText.slice(0, 300)}`);
    }

    await rest(`integration_events?idempotency_key=eq.${encodeURIComponent(idempotencyKey)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        processing_status: "processed",
        contact_ref: String(makeResult.contact_id),
        opportunity_ref: String(makeResult.deal_id),
        payload: {
          contact_name: name,
          contact_email: email,
          studio_name: studioName,
          prospect_score: score,
          audit_id: sourceId,
          company_id: makeResult.company_id ? String(makeResult.company_id) : null,
          synced_at: new Date().toISOString(),
        },
        error_code: null,
        error_detail: null,
        updated_at: new Date().toISOString(),
      }),
    });

    return new Response(JSON.stringify({
      ok: true,
      contact_id: makeResult.contact_id,
      company_id: makeResult.company_id || null,
      deal_id: makeResult.deal_id,
      synced_at: new Date().toISOString(),
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await rest(`integration_events?idempotency_key=eq.${encodeURIComponent(idempotencyKey)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        processing_status: "failed",
        error_code: "hubspot_sync_failed",
        error_detail: message.slice(0, 1000),
        updated_at: new Date().toISOString(),
      }),
    });
    throw error;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });

  const key = serviceKey();
  if (!key) return new Response(JSON.stringify({ error: "Server credential unavailable" }), { status: 503, headers: { "Content-Type": "application/json" } });
  const auth = req.headers.get("authorization") || "";
  const presented = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!presented || !serviceKeys().includes(presented)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json" } }); }

  const sourceType = clean(body.source_type, 80);
  const sourceId = clean(body.source_id, 100);
  if (!sourceId || !["public_contact_request", "revenue_audit_lead", "prospect_audit"].includes(sourceType)) {
    return new Response(JSON.stringify({ error: "Invalid source" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  if (sourceType === "prospect_audit") {
    try {
      return await syncProspectAudit(sourceId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("hubspot-sync-v1 prospect failure", message);
      return new Response(JSON.stringify({ ok: false, error: "HubSpot sync failed" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const table = sourceType === "public_contact_request" ? "public_contact_requests" : "revenue_audit_leads";

  try {
    const select = sourceType === "public_contact_request"
      ? "id,name,email,studio_name,location,phone,website,topic,source,metadata,is_test,test_reason,hubspot_contact_id,hubspot_company_id,hubspot_deal_id,hubspot_synced_at,hubspot_sync_attempts"
      : "id,name,email,studio_name,website,area,primary_problem,source,source_context,is_test,test_reason,hubspot_contact_id,hubspot_company_id,hubspot_deal_id,hubspot_synced_at,hubspot_sync_attempts";

    const rows = await rest(`${table}?id=eq.${encodeURIComponent(sourceId)}&select=${select}&limit=1`, { method: "GET" });
    const record = rows?.[0];
    if (!record) throw new Error("Source record not found.");

    const testReason = record.is_test === true
      ? clean(record.test_reason, 200) || "explicit_test_record"
      : explicitTestReason(record.name, record.studio_name);
    if (testReason) {
      return new Response(JSON.stringify({
        ok: true,
        skipped: true,
        reason: "test_record",
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    if (record.hubspot_synced_at && record.hubspot_contact_id && record.hubspot_deal_id) {
      return new Response(JSON.stringify({
        ok: true,
        already_synced: true,
        contact_id: record.hubspot_contact_id,
        company_id: record.hubspot_company_id,
        deal_id: record.hubspot_deal_id,
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    await recordAttempt(table, sourceId);

    const config = await runtimeConfig();
    const name = clean(record.name, 120);
    const email = clean(record.email, 254).toLowerCase();
    const studioName = clean(record.studio_name, 180) || name;
    const website = clean(record.website, 500);
    const companyDomain = domainFromWebsite(website);
    const { first_name, last_name } = splitName(name);
    const location = clean(sourceType === "public_contact_request" ? record.location : record.area, 180);
    const topic = clean(sourceType === "public_contact_request" ? record.topic : "revenue-audit", 100);
    const primaryProblem = clean(sourceType === "revenue_audit_lead" ? record.primary_problem : record.topic, 180);
    const pagePath = clean(record.metadata?.page_path || "", 500);
    const referrer = clean(record.metadata?.referrer || "", 1000);
    const auditId = clean(body.audit_id, 100);
    const sourceLabel = sourceType === "public_contact_request" ? "website_contact" : "revenue_audit_v1";
    const dealAmount = topic === "studio-intelligence-audit" ? 395 : 0;
    const dealStage = topic === "studio-intelligence-audit" ? config.paidBookedStage : config.newLeadStage;
    const dealName = `${studioName} — ${topic === "studio-intelligence-audit" ? "Studio Intelligence Audit" : sourceType === "revenue_audit_lead" ? "Revenue Audit follow-up" : "Website enquiry"} — ${sourceId.slice(0, 8)}`;

    const makeResponse = await fetch(config.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sync_token: config.token,
        sync_version: "v1",
        source_type: sourceType,
        source_id: sourceId,
        email,
        name,
        first_name,
        last_name,
        studio_name: studioName,
        location,
        phone: clean(record.phone, 80),
        website,
        company_domain: companyDomain,
        company_lookup: companyDomain || studioName,
        topic,
        primary_problem: primaryProblem,
        source: sourceLabel,
        page_path: pagePath,
        referrer,
        audit_id: auditId,
        deal_name: dealName,
        deal_amount: dealAmount,
        deal_pipeline: config.dealPipeline,
        deal_stage: dealStage,
      }),
    });

    const responseText = await makeResponse.text();
    let makeResult: Record<string, unknown> = {};
    try { makeResult = responseText ? JSON.parse(responseText) : {}; } catch { makeResult = {}; }

    if (!makeResponse.ok || makeResult.ok !== true || !makeResult.contact_id || !makeResult.deal_id) {
      throw new Error(`Make/HubSpot sync failed: ${makeResponse.status} ${responseText.slice(0, 300)}`);
    }

    const syncedAt = new Date().toISOString();
    await rest(`${table}?id=eq.${encodeURIComponent(sourceId)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        hubspot_contact_id: String(makeResult.contact_id),
        hubspot_company_id: makeResult.company_id ? String(makeResult.company_id) : null,
        hubspot_deal_id: String(makeResult.deal_id),
        hubspot_synced_at: syncedAt,
        hubspot_sync_error: null,
      }),
    });

    return new Response(JSON.stringify({
      ok: true,
      contact_id: makeResult.contact_id,
      company_id: makeResult.company_id || null,
      deal_id: makeResult.deal_id,
      synced_at: syncedAt,
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("hubspot-sync-v1 failure", message);
    try {
      await rest(`${table}?id=eq.${encodeURIComponent(sourceId)}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          hubspot_last_attempt_at: new Date().toISOString(),
          hubspot_sync_error: message.slice(0, 1000),
        }),
      });
    } catch (secondary) {
      console.error("Failed to persist HubSpot sync error", secondary instanceof Error ? secondary.message : String(secondary));
    }
    return new Response(JSON.stringify({ ok: false, error: "HubSpot sync failed" }), { status: 502, headers: { "Content-Type": "application/json" } });
  }
});
