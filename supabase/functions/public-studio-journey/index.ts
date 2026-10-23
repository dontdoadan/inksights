import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.110.1";
import { CONSENT_VERSION, VERSION, STAGES, evaluateStage, sameReplay } from "./journey-policy.mjs";

// Review branch only. Never deploy without authorising the public endpoint and secret configuration.
const allowedOrigins = new Set([
  "https://getinksights.co.uk",
  "https://www.getinksights.co.uk",
  "http://localhost:3000",
  "http://localhost:5173",
]);
const MAX_BYTES = 12000;
const MAX_SESSION_EVENTS = 80;
const tokenPattern = /^[A-Za-z0-9_-]{43}$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const safeHeaders = (origin: string | null) => ({
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "Vary": "Origin",
  "X-Content-Type-Options": "nosniff",
  "Access-Control-Allow-Origin": origin && allowedOrigins.has(origin) ? origin : "null",
  "Access-Control-Allow-Headers": "content-type,apikey,authorization",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
});
const sha256 = async (raw:string) => {
  const digest = await crypto.subtle.digest("SHA-256",new TextEncoder().encode(raw));
  return [...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,"0")).join("");
};
const makeToken = () => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"");
};
const send = (origin:string|null,status:number,body:unknown) =>
  new Response(JSON.stringify(body), {status,headers:safeHeaders(origin)});
const owns = (data: unknown, key: string) =>
  !!data && typeof data === "object" && !Array.isArray(data) && Object.prototype.hasOwnProperty.call(data,key);
type Stored = {
  id: string;
  tool_key: string;
  submitted_at: string;
  normalized_inputs: { answer?: unknown; step?: string; journey_hash?: string };
  result_snapshot: unknown;
  submission_key?: string;
};
function project(rows:Stored[]) {
  const history: Record<string,{normalized:unknown;result:unknown;submittedAt:string;submissionId:string}>={};
  for(const item of rows){
    const step=item.normalized_inputs?.step;
    if(STAGES.includes(step) && item.tool_key === "unified_studio_journey_"+step){
      history[step]={normalized:item.normalized_inputs.answer,result:item.result_snapshot,
        submittedAt:item.submitted_at,submissionId:item.id};
    }
  }
  return history;
}
async function consumeRateLimit(request:Request,client:ReturnType<typeof createClient>,secret:string){
  const address=request.headers.get("cf-connecting-ip")||
    request.headers.get("x-real-ip")||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"unknown";
  // The dedicated salt is an explicit deployment prerequisite, not a public key.
  const salt=Deno.env.get("PUBLIC_RATE_LIMIT_SALT");
  if(!salt || salt.length<24)throw new Error("Rate limit salt unavailable");
  const keyHash=await sha256(salt+":unified_journey:"+address);
  const windowStartedAt=new Date(Math.floor(Date.now()/3600000)*3600000).toISOString();
  const {data,error}=await client.rpc("consume_public_endpoint_rate_limit",{
    p_endpoint:"public_studio_journey",
    p_key_hash:keyHash,
    p_window_started_at:windowStartedAt,
    p_max_requests:20,
  });
  if(error)throw new Error("Rate limit unavailable");
  return data===true;
}

Deno.serve(async(req:Request)=>{
  const origin=req.headers.get("origin");
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers:safeHeaders(origin)});
  if(origin&&!allowedOrigins.has(origin))return send(origin,403,{error:"Origin not allowed."});
  if(req.method!=="POST")return send(origin,405,{error:"Method not allowed."});
  if(!req.headers.get("content-type")?.toLowerCase().includes("application/json"))
    return send(origin,415,{error:"JSON required."});
  if(Number(req.headers.get("content-length")||0)>MAX_BYTES)
    return send(origin,413,{error:"Request too large."});

  let data:Record<string,unknown>;
  try {
    const raw=await req.text();
    if(new TextEncoder().encode(raw).byteLength>MAX_BYTES)return send(origin,413,{error:"Request too large."});
    const parsed=JSON.parse(raw);
    if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))throw new Error("Invalid input");
    data=parsed;
  }catch{return send(origin,400,{error:"Invalid JSON."});}
  const action=data.action;
  if(action!=="profile"&&action!=="submit")return send(origin,422,{error:"Invalid action."});
  const step=data.step;
  if(action==="submit"&&(typeof step!=="string"||!STAGES.includes(step)))
    return send(origin,422,{error:"Invalid stage."});
  const existingToken=data.sessionToken;
  if(existingToken!=null&&(typeof existingToken!=="string"||!tokenPattern.test(existingToken)))
    return send(origin,401,{error:"Invalid session."});
  if(!existingToken&&(action==="profile"||step!=="growth"))
    return send(origin,401,{error:"Start the Growth Check first."});
  if(action==="submit"&&(typeof data.submissionKey!=="string"||!uuidPattern.test(data.submissionKey)))
    return send(origin,422,{error:"A unique submission identifier is required."});

  const token=existingToken||makeToken();
  const journeyHash=await sha256(token);
  const supabaseUrl=Deno.env.get("SUPABASE_URL")||"";
  const secret=Deno.env.get("SUPABASE_SECRET_KEY")||Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
  if(!supabaseUrl||!secret)return send(origin,503,{error:"Assessment service not configured."});
  const client=createClient(supabaseUrl,secret,{auth:{persistSession:false,autoRefreshToken:false}});
  try{
    if(!await consumeRateLimit(req,client,secret))return send(origin,429,{error:"Too many requests. Please try later."});
    const {data:records,error:readError}=await client.from("public_tool_submissions")
      .select("id,tool_key,submitted_at,normalized_inputs,result_snapshot")
      .like("tool_key","unified_studio_journey_%")
      .eq("normalized_inputs->>journey_hash",journeyHash)
      .order("submitted_at",{ascending:true})
      .limit(MAX_SESSION_EVENTS+1);
    if(readError)throw new Error("Journey lookup failed");
    if((records?.length||0)>MAX_SESSION_EVENTS)
      return send(origin,409,{error:"Assessment history limit reached. Please contact INKSIGHTS for assistance."});
    const history=project((records||[]) as Stored[]);
    if(action==="profile"){
      if(!history.growth)return send(origin,404,{error:"No saved assessment found."});
      return send(origin,200,{history,assessmentType:"UNVERIFIED_PUBLIC_SESSION"});
    }
    let evaluated:ReturnType<typeof evaluateStage>;
    try {
      evaluated=evaluateStage(step as string,data.input,history);
    }catch(err) {
      return send(origin,422,{error:err instanceof Error?err.message:"Invalid assessment input."});
    }
    const growth=step==="growth"?evaluated.normalized:history.growth?.normalized;
    if(!growth || typeof growth!=="object" || !owns(growth,"studio"))throw new Error("Missing studio context");
    const studio=(growth as {studio:{name:string,area:string,website:string|null}}).studio;
    const normalizedInputs={journey_hash:journeyHash,step,answer:evaluated.normalized,provenance:"SELF_REPORTED",calculation_version:VERSION};
    const row={
      tool_key:"unified_studio_journey_"+step,
      tool_version:VERSION,
      dataset_version:null,
      studio_name:studio.name,
      studio_website:studio.website,
      area:studio.area,
      normalized_inputs:normalizedInputs,
      result_snapshot:evaluated.result,
      submission_key:data.submissionKey,
      quality_status:"unverified_self_report",
      source_type:"public_self_report",
      consent_version:CONSENT_VERSION,
      studio_id:null,
    };
    const {data:saved,error:writeError}=await client.from("public_tool_submissions")
      .insert(row).select("id,result_snapshot,submitted_at").single();
    if(!writeError && saved?.id)
      return send(origin,200,{sessionToken:token,submissionId:saved.id,result:saved.result_snapshot,source:"SAVED_UNVERIFIED"});
    if(writeError?.code!=="23505")throw new Error("Journey save failed");
    const {data:duplicate,error:duplicateError}=await client.from("public_tool_submissions")
      .select("id,tool_key,tool_version,consent_version,normalized_inputs,result_snapshot")
      .eq("submission_key",data.submissionKey).maybeSingle();
    if(duplicateError||!duplicate)throw new Error("Replay lookup failed");
    if(!sameReplay(duplicate,{stage:step,journeyHash,answer:evaluated.normalized}))
      return send(origin,409,{error:"This submission identifier was already used for different answers."});
    return send(origin,200,{sessionToken:token,submissionId:duplicate.id,result:duplicate.result_snapshot,source:"SAVED_UNVERIFIED"});
  }catch(err){
    console.error("journey persistence error",err instanceof Error?err.message:"unknown");
    return send(origin,503,{error:"Unable to save or retrieve the assessment. Please retry."});
  }
});