import { createClient } from "npm:@supabase/supabase-js@2";
import { CONSENT_VERSION, DATASET_VERSION, validatePricingSubmission, isSamePricingSubmission } from "./pricing-policy.mjs";

const origins = new Set(["https://getinksights.co.uk","https://www.getinksights.co.uk","http://localhost:3000","http://localhost:5173"]);
const MAX_BODY_BYTES = 12_000;
const MAX_HOURLY_SUBMISSIONS = 30;

function reply(status: number, body: unknown, origin: string) {
  return new Response(JSON.stringify(body), { status, headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": origins.has(origin) ? origin : "https://getinksights.co.uk",
    "Access-Control-Allow-Headers": "content-type,apikey,authorization,x-client-info",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Cache-Control": "no-store",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff",
  } });
}

async function rateLimit(request: Request, supabase: ReturnType<typeof createClient>) {
  // Never persist the originating IP or service credential: persist a salted digest.
  // A legitimate proxy's first forwarded address is used only for throttling.
  const clientAddress = request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") || "unknown";
  const salt = Deno.env.get("PUBLIC_RATE_LIMIT_SALT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!salt) throw new Error("Missing public intake rate-limit salt");
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(salt + ":" + clientAddress));
  const keyHash = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
  const windowStart = new Date(Math.floor(Date.now() / 3_600_000) * 3_600_000).toISOString();
  const { data, error } = await supabase.rpc("consume_public_endpoint_rate_limit", {
    p_endpoint: "public_pricing_benchmark_submit",
    p_key_hash: keyHash,
    p_window_started_at: windowStart,
    p_max_requests: MAX_HOURLY_SUBMISSIONS,
  });
  if (error) throw new Error("Intake rate-limit service unavailable");
  return data === true;
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("origin") || "";
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: {
    "Access-Control-Allow-Origin": origins.has(origin) ? origin : "https://getinksights.co.uk",
    "Access-Control-Allow-Headers": "content-type,apikey,authorization,x-client-info",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Vary":"Origin",
  }});
  if (request.method !== "POST") return reply(405, { error:"Method not allowed" }, origin);
  if (origin && !origins.has(origin)) return reply(403, { error:"Origin not allowed" }, origin);
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json"))
    return reply(415, { error:"JSON is required" }, origin);
  if (Number(request.headers.get("content-length") || 0) > MAX_BODY_BYTES)
    return reply(413, { error:"Submission too large" }, origin);

  let input: unknown;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return reply(413, { error:"Submission too large" }, origin);
    input = JSON.parse(raw);
  } catch {
    return reply(400, { error:"Invalid JSON" }, origin);
  }

  const checked = validatePricingSubmission(input);
  if (!checked.ok) return reply(422, { error:checked.error }, origin);
  const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth:{persistSession:false},
  });

  try {
    const allowed = await rateLimit(request, client);
    if (!allowed) return reply(429, { error:"Too many submissions. Please try again later." }, origin);

    const row = {
      tool_key:"pricing_benchmark", tool_version:"1", dataset_version:DATASET_VERSION,
      normalized_inputs:checked.normalized,
      result_snapshot:checked.result,
      submission_key:checked.submissionKey,
      consent_version:CONSENT_VERSION,
    };
    // Insert-only is critical: conflicting retries must never mutate the original row.
    const { data:saved, error } = await client.from("public_tool_submissions")
      .insert(row).select("id,result_snapshot,normalized_inputs,consent_version").single();
    if (!error && saved?.id) {
      return reply(200, { submissionId:saved.id, result:saved.result_snapshot }, origin);
    }
    if (error?.code !== "23505") {
      console.error("pricing intake persistence failed", error?.code || "no_row");
      return reply(503, { error:"Unable to save submission. Please retry." }, origin);
    }
    // A genuine duplicate retry returns the *original* durable result and ID.
    const existing = await client.from("public_tool_submissions")
      .select("id,result_snapshot,normalized_inputs,consent_version")
      .eq("submission_key", checked.submissionKey).maybeSingle();
    if (existing.error || !existing.data) {
      console.error("pricing duplicate lookup failed", existing.error?.code || "no_row");
      return reply(503, { error:"Unable to verify previous submission. Please retry." }, origin);
    }
    if (!isSamePricingSubmission(existing.data, checked)) {
      return reply(409, { error:"Submission identifier already belongs to different input." }, origin);
    }
    return reply(200, { submissionId:existing.data.id, result:existing.data.result_snapshot }, origin);
  } catch (error) {
    console.error("pricing intake failed", error instanceof Error ? error.name : "unknown");
    return reply(503, { error:"Unable to save submission. Please retry." }, origin);
  }
});
