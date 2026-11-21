import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";

function allowedOrigin(origin: string | null): string {
  if (!origin) return "https://getinksights.co.uk";
  try {
    const url = new URL(origin);
    const host = url.hostname.toLowerCase();
    if (host === "getinksights.co.uk" || host.endsWith(".getinksights.co.uk") || host.endsWith(".vercel.app")) return origin;
  } catch { /* invalid origin */ }
  return "https://getinksights.co.uk";
}
function headers(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": allowedOrigin(origin),
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    Vary: "Origin",
  };
}
function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), { status, headers: headers(origin) });
}
const clean = (value: unknown, max = 500) => String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max);
const cleanMessage = (value: unknown) => String(value ?? "").trim().replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").slice(0, 1800);

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { status: 204, headers: headers(origin) });
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405, origin);
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
    return json({ ok: false, error: "Recovery service is not configured." }, 503, origin);
  }
  const authorization = req.headers.get("authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) return json({ ok: false, error: "Authentication required." }, 401, origin);

  try {
    const token = authorization.slice(7);
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData.user) return json({ ok: false, error: "Invalid session." }, 401, origin);

    const body = await req.json() as Record<string, unknown>;
    const studioId = clean(body.studio_id, 80);
    const opportunityId = clean(body.opportunity_id, 80);
    if (!studioId || !opportunityId) {
      return json({ ok: false, error: "A valid studio and opportunity are required." }, 400, origin);
    }
    const service = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: membership, error: membershipError } = await service
      .from("studio_members")
      .select("studio_id,role,active")
      .eq("studio_id", studioId)
      .eq("user_id", authData.user.id)
      .eq("active", true)
      .maybeSingle();
    if (membershipError || !membership || !["owner", "admin", "member"].includes(membership.role)) {
      return json({ ok: false, error: "You do not have permission to draft recovery messages for this studio." }, 403, origin);
    }
    const { data: opportunity, error: opportunityError } = await service
      .from("recovery_opportunities")
      .select("id,studio_id,record_id,category,status,estimated_value_pence,evidence,recommendation")
      .eq("id", opportunityId).eq("studio_id", studioId).maybeSingle();
    if (opportunityError || !opportunity) return json({ ok: false, error: "Recovery opportunity not found." }, 404, origin);
    if (["dismissed", "paid"].includes(opportunity.status)) return json({ ok: false, error: "This opportunity is no longer eligible for contact." }, 409, origin);
    const { data: sourceRecord, error: sourceError } = await service
      .from("recovery_records")
      .select("id,studio_id,record_type,client_name,client_email,client_phone,data")
      .eq("id", opportunity.record_id).eq("studio_id", studioId).maybeSingle();
    if (sourceError || !sourceRecord) return json({ ok: false, error: "Source record not found." }, 404, origin);
    const evidence = (opportunity.evidence ?? {}) as Record<string, unknown>;
    const sourceData = (sourceRecord.data ?? {}) as Record<string, unknown>;
    const hasContact = Boolean(sourceRecord.client_email || sourceRecord.client_phone);
    const documentedMarketingConsent = sourceData.marketing_consent === true && Boolean(sourceData.marketing_consent_at) && Boolean(sourceData.marketing_consent_source);
    const documentedContactPermission = sourceData.contact_permission === true && Boolean(sourceData.contact_permission_at) && Boolean(sourceData.contact_permission_source);
    if (!hasContact || sourceData.do_not_contact === true || (!documentedContactPermission && !documentedMarketingConsent)) {
      return json({ ok: false, error: "Documented contact permission and a usable contact detail are required." }, 403, origin);
    }
    const category = String(opportunity.category);
    if (!["inactive_project", "unconverted_enquiry", "inactive_client"].includes(category)) {
      return json({ ok: false, error: "Unsupported recovery category." }, 400, origin);
    }
    if (category === "inactive_client" && !documentedMarketingConsent) {
      return json({ ok: false, error: "Reactivation requires traceable marketing consent." }, 403, origin);
    }
    if (!OPENAI_API_KEY) return json({ ok: false, error: "AI drafting is not configured yet. Add OPENAI_API_KEY to the Supabase function secrets." }, 503, origin);

    const context = {
      client_first_name: (() => { const first = clean(sourceRecord.client_name, 80).split(" ")[0]; return first.includes("@") ? "there" : first; })(),
      project_name: clean(sourceData.project_name, 120),
      evidence_summary: clean(JSON.stringify(evidence), 700),
      recommended_action: clean(opportunity.recommendation, 500),
    };
    if (!context.client_first_name || !context.evidence_summary || !context.recommended_action) {
      return json({ ok: false, error: "Insufficient evidence to draft a personalised message." }, 400, origin);
    }

    const system = [
      "You write concise, respectful client communications for a premium UK tattoo studio.",
      "Create one individual message for studio staff to review. Do not send it.",
      "Never invent a discount, price, appointment slot, promise, deadline, or prior conversation.",
      "Do not pressure the recipient, imply urgency, or expose internal revenue estimates.",
      "For an inactive client, only draft a reactivation message when marketing permission has already been confirmed by the calling application.",
      "For enquiries and ongoing projects, keep the message relevant to the existing conversation or project.",
      "Return JSON only with exactly two string fields: subject and message.",
    ].join(" ");
    const user = JSON.stringify({ recovery_category: category, ...context });
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        temperature: 0.35,
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
      }),
      signal: AbortSignal.timeout(20000),
    });
    const result = await response.json() as Record<string, any>;
    if (!response.ok) {
      console.error("OpenAI recovery draft failed", response.status, clean(result.error?.message, 240));
      return json({ ok: false, error: "AI drafting could not complete. Please try again." }, 502, origin);
    }
    const content = result.choices?.[0]?.message?.content;
    let draft: Record<string, unknown>;
    try { draft = JSON.parse(String(content ?? "")); }
    catch { return json({ ok: false, error: "AI returned an invalid draft. Please try again." }, 502, origin); }
    const subject = clean(draft.subject, 120);
    const message = cleanMessage(draft.message);
    if (!subject || !message || message.length < 30) return json({ ok: false, error: "AI returned an incomplete draft. Please try again." }, 502, origin);
    return json({ ok: true, subject, message, model: "gpt-4.1-mini" }, 200, origin);
  } catch (error) {
    console.error("revenue-recovery-assist error", error instanceof Error ? error.message : String(error));
    return json({ ok: false, error: "The recovery assistant is temporarily unavailable." }, 500, origin);
  }
});
