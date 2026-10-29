import { createClient } from "npm:@supabase/supabase-js@2";
import { CONSENT_VERSION, MODEL_VERSION, validateScenario, isSameScenario } from "./simulator-policy.mjs";

const ORIGINS = new Set([
  "https://getinksights.co.uk",
  "https://www.getinksights.co.uk",
  "http://localhost:3000",
  "http://localhost:5173",
  ...(Deno.env.get("SIMULATOR_PREVIEW_ORIGINS") || "").split(",").map(s => s.trim()).filter(Boolean),
]);
const MAX_BYTES = 12000;
const MAX_PER_HOUR = 25;

function cors(origin: string) {
  return {
    "Access-Control-Allow-Origin": ORIGINS.has(origin) ? origin : "https://getinksights.co.uk",
    "Access-Control-Allow-Headers": "authorization,apikey,content-type,x-client-info",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Cache-Control": "no-store",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff",
  };
}
function json(status: number, result: unknown, origin: string) {
  return new Response(JSON.stringify(result), {
    status, headers:{...cors(origin), "Content-Type":"application/json; charset=utf-8"},
  });
}
async function consumeLimit(request: Request, client: ReturnType<typeof createClient>) {
  // Requires an operator-controlled salt and the existing atomic rate-limit RPC.
  const salt = Deno.env.get("PUBLIC_RATE_LIMIT_SALT");
  if (!salt) throw new Error("Public rate-limit salt not configured");
  const addr = request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") || "unknown";
  const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(salt+":"+addr));
  const hash=Array.from(new Uint8Array(digest)).map(n=>n.toString(16).padStart(2,"0")).join("");
  const hour=new Date(Math.floor(Date.now()/3600000)*3600000).toISOString();
  const {data,error}=await client.rpc("consume_public_endpoint_rate_limit",{
    p_endpoint:"public_commercial_simulator_submit",
    p_key_hash:hash, p_window_started_at:hour, p_max_requests:MAX_PER_HOUR,
  });
  if (error) throw new Error("Rate limit unavailable");
  return data===true;
}

async function verifiedStudio(request: Request, client: ReturnType<typeof createClient>, studioId: string|null) {
  const bearer=request.headers.get("authorization") || "";
  if (!studioId && !bearer) return null;
  if (studioId && !bearer.startsWith("Bearer ")) throw new Error("studio_unauthorized");
  if (!bearer) return null;
  const token=bearer.slice(7).trim();
  // Never trust a client-supplied studio UUID, token claims, or studio name.
  const {data,error}=await client.auth.getUser(token);
  if (error || !data.user) throw new Error("invalid_session");
  if (!studioId) return null;
  const {data:membership,error:membershipError}=await client.from("studio_members")
    .select("studio_id").eq("user_id",data.user.id).eq("studio_id",studioId).eq("active",true).maybeSingle();
  if (membershipError || !membership) throw new Error("studio_unauthorized");
  // The intake table's foreign key targets public.studios, not visibility_studios.
  const {data:canonical,error:canonicalError}=await client.from("studios")
    .select("id").eq("id",studioId).maybeSingle();
  if (canonicalError || !canonical) throw new Error("studio_not_canonical");
  return studioId;
}

Deno.serve(async (request: Request) => {
  const origin=request.headers.get("origin") || "";
  if (request.method==="OPTIONS") {
    if (!ORIGINS.has(origin)) return new Response(null,{status:403,headers:cors(origin)});
    return new Response(null,{status:204,headers:cors(origin)});
  }
  if (request.method!=="POST") return json(405,{error:"Method not allowed"},origin);
  if (origin && !ORIGINS.has(origin)) return json(403,{error:"Origin not allowed"},origin);
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) return json(415,{error:"JSON required"},origin);
  if (Number(request.headers.get("content-length")||0)>MAX_BYTES) return json(413,{error:"Submission too large"},origin);

  let parsed: unknown;
  try {
    const raw=await request.text();
    if (new TextEncoder().encode(raw).length>MAX_BYTES) return json(413,{error:"Submission too large"},origin);
    parsed=JSON.parse(raw);
  } catch { return json(400,{error:"Invalid JSON"},origin); }

  const checked=validateScenario(parsed);
  if (!checked.ok) return json(422,{error:checked.error},origin);

  const serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const url=Deno.env.get("SUPABASE_URL") || "";
  if (!serviceKey || !url) return json(503,{error:"Service unavailable"},origin);
  const client=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});

  try {
    if (!(await consumeLimit(request,client))) return json(429,{error:"Too many requests"},origin);
    const studioId=await verifiedStudio(request,client,checked.requestedStudioId);
    const row={
      tool_key:checked.toolKey,
      tool_version:"1",
      dataset_version:MODEL_VERSION,
      normalized_inputs:checked.normalized,
      result_snapshot:{...checked.results,classification:"modelled",model_version:MODEL_VERSION},
      studio_name:checked.studioName,
      studio_website:checked.studioWebsite,
      studio_id:studioId,
      submission_key:checked.submissionKey,
      consent_version:CONSENT_VERSION,
      quality_status:"unverified_self_report",
      source_type:"public_self_report",
    };
    const {data:saved,error}=await client.from("public_tool_submissions")
      .insert(row).select("id,result_snapshot,studio_id").single();
    if (!error && saved) return json(200,{
      ok:true,submissionId:saved.id,result:saved.result_snapshot,
      studioLinked:Boolean(saved.studio_id),classification:"modelled",
    },origin);
    if (error?.code!=="23505") {
      console.error("commercial simulator insert",error?.code||"empty_response");
      return json(503,{error:"Could not store the scenario. Please retry."},origin);
    }
    const {data:existing,error:readError}=await client.from("public_tool_submissions")
      .select("id,tool_key,tool_version,consent_version,normalized_inputs,result_snapshot,studio_id,studio_name,studio_website")
      .eq("submission_key",checked.submissionKey).maybeSingle();
    if (readError||!existing) return json(503,{error:"Could not verify previous submission"},origin);
    if (!isSameScenario(existing,checked,studioId)) return json(409,{error:"Submission key belongs to different inputs"},origin);
    return json(200,{ok:true,submissionId:existing.id,result:existing.result_snapshot,
      studioLinked:Boolean(existing.studio_id),classification:"modelled"},origin);
  } catch (error) {
    const message=error instanceof Error?error.message:"unknown";
    if (message==="invalid_session") return json(401,{error:"Please sign in again"},origin);
    if (message==="studio_unauthorized") return json(403,{error:"Studio membership could not be verified"},origin);
    if (message==="studio_not_canonical") return json(422,{error:"Studio profile requires verification before linking"},origin);
    console.error("commercial simulator intake",error instanceof Error?error.name:"unknown");
    return json(503,{error:"Scenario unavailable. Please retry."},origin);
  }
});
