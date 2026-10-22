import { createClient } from "npm:@supabase/supabase-js@2.110.1";
import { CONSENT_VERSION, TOOL_VERSION, validateToolkitInput, isSameToolkitSubmission } from "./toolkit-policy.mjs";

const ORIGINS = new Set(["https://getinksights.co.uk","https://www.getinksights.co.uk","http://localhost:3000","http://localhost:5173"]);
const MAX_BODY_BYTES = 28_000;
const MAX_HOURLY_SUBMISSIONS = 15;

function headers(origin: string) {
  return {
    "Content-Type":"application/json; charset=utf-8",
    "Access-Control-Allow-Origin":ORIGINS.has(origin) ? origin : "https://getinksights.co.uk",
    "Access-Control-Allow-Methods":"POST,OPTIONS",
    "Access-Control-Allow-Headers":"content-type,apikey,authorization,x-client-info",
    "Cache-Control":"no-store",
    "Vary":"Origin",
    "X-Content-Type-Options":"nosniff",
  };
}
function reply(status: number, body: unknown, origin: string) {
  return new Response(JSON.stringify(body), {status,headers:headers(origin)});
}
async function consumeRateLimit(request:Request, client:ReturnType<typeof createClient>) {
  const address = request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const salt = Deno.env.get("PUBLIC_RATE_LIMIT_SALT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!salt) throw new Error("Rate limit salt not configured");
  const digest = await crypto.subtle.digest("SHA-256",new TextEncoder().encode(salt+":"+address));
  const keyHash = [...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,"0")).join("");
  const windowStartedAt = new Date(Math.floor(Date.now()/3_600_000)*3_600_000).toISOString();
  const {data,error} = await client.rpc("consume_public_endpoint_rate_limit",{
    p_endpoint:"public_studio_toolkit_submit",p_key_hash:keyHash,p_window_started_at:windowStartedAt,p_max_requests:MAX_HOURLY_SUBMISSIONS,
  });
  if(error) throw new Error("Rate limit unavailable");
  return data===true;
}

Deno.serve(async(request:Request)=>{
  const origin=request.headers.get("origin")||"";
  if(request.method==="OPTIONS") return new Response(null,{status:204,headers:headers(origin)});
  if(request.method!=="POST")return reply(405,{error:"Method not allowed."},origin);
  if(origin&&!ORIGINS.has(origin))return reply(403,{error:"Origin not allowed."},origin);
  if(!request.headers.get("content-type")?.toLowerCase().includes("application/json"))return reply(415,{error:"JSON required."},origin);
  if(Number(request.headers.get("content-length")||0)>MAX_BODY_BYTES)return reply(413,{error:"Submission too large."},origin);

  let input:unknown;
  try {
    const raw=await request.text();
    if(new TextEncoder().encode(raw).length>MAX_BODY_BYTES)return reply(413,{error:"Submission too large."},origin);
    input=JSON.parse(raw);
  }catch{return reply(400,{error:"Invalid JSON."},origin)}
  const checked=validateToolkitInput(input);
  if(!checked.ok)return reply(422,{error:checked.error},origin);

  const url=Deno.env.get("SUPABASE_URL");
  const secret=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!url||!secret)return reply(503,{error:"The assessment service is temporarily unavailable."},origin);
  const client=createClient(url,secret,{auth:{persistSession:false}});

  try {
    if(!await consumeRateLimit(request,client))return reply(429,{error:"Too many submissions. Please try again later."},origin);
    const row={
      tool_key:checked.toolKey,
      tool_version:TOOL_VERSION,
      dataset_version:null,
      studio_name:checked.normalized.studio.name,
      studio_website:checked.normalized.studio.website,
      area:checked.normalized.studio.area,
      // No automatic canonical studio_id assignment from a self-reported name.
      normalized_inputs:checked.normalized,
      result_snapshot:checked.result,
      submission_key:checked.submissionKey,
      quality_status:"unverified_self_report",
      source_type:"public_self_report",
      consent_version:CONSENT_VERSION,
    };
    // Insert-only. Results are disclosed only after durable persistence.
    const {data:saved,error}=await client.from("public_tool_submissions")
      .insert(row).select("id,result_snapshot").single();
    if(!error&&saved?.id)return reply(200,{submissionId:saved.id,result:saved.result_snapshot},origin);
    if(error?.code!=="23505"){
      console.error("toolkit submission store failed",error?.code||"no_row");
      return reply(503,{error:"We could not save your result. Please retry."},origin);
    }
    const existing=await client.from("public_tool_submissions")
      .select("id,tool_key,tool_version,consent_version,normalized_inputs,result_snapshot")
      .eq("submission_key",checked.submissionKey).maybeSingle();
    if(existing.error||!existing.data)return reply(503,{error:"We could not verify the previous submission. Please retry."},origin);
    if(!isSameToolkitSubmission(existing.data,checked))return reply(409,{error:"That submission identifier belongs to different answers."},origin);
    return reply(200,{submissionId:existing.data.id,result:existing.data.result_snapshot},origin);
  }catch(error){
    console.error("toolkit intake error",error instanceof Error?error.name:"unknown");
    return reply(503,{error:"We could not save your result. Please retry."},origin);
  }
});
