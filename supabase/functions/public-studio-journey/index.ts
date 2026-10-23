import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.110.1";
import { CONSENT_VERSION, VERSION, STAGES, evaluateStage } from "./journey-policy.mjs";
import { projectJourneyHistory } from "./projection-policy.mjs";

// Requires approved session-ledger migration; not an owner-verification mechanism by itself.
const ORIGINS=new Set(["https://getinksights.co.uk","https://www.getinksights.co.uk","http://localhost:3000","http://localhost:5173"]);
const MAX_BYTES=12000,MAX_STEPS=80;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TOKEN=/^[a-zA-Z0-9_-]{43}$/;
type Obj=Record<string,unknown>;
function headers(origin:string|null){return {"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Vary":"Origin","Access-Control-Allow-Origin":origin&&ORIGINS.has(origin)?origin:"null","Access-Control-Allow-Methods":"POST,OPTIONS","Access-Control-Allow-Headers":"content-type,apikey,authorization"};}
function respond(origin:string|null,status:number,body:unknown){return new Response(JSON.stringify(body),{status,headers:headers(origin)});}
async function hash(s:string){const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return Array.from(new Uint8Array(digest)).map(n=>n.toString(16).padStart(2,"0")).join("");}
function newToken(){const b=new Uint8Array(32);crypto.getRandomValues(b);return btoa(String.fromCharCode(...b)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"");}
function secretKey(){
  const value=Deno.env.get("SUPABASE_SECRET_KEYS");
  if(value){try{const keys=JSON.parse(value) as Record<string,string>;const key=keys.default||Object.values(keys).find(Boolean);if(key)return key;}catch{}}
  return Deno.env.get("SUPABASE_SECRET_KEY")||Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
}
async function rateLimit(request:Request,db:ReturnType<typeof createClient>){
  const salt=Deno.env.get("PUBLIC_RATE_LIMIT_SALT")||"";
  if(salt.length<24)throw Error("rate-limit salt not configured");
  const ip=request.headers.get("cf-connecting-ip")||request.headers.get("x-real-ip")||request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"unknown";
  const keyHash=await hash(salt+":studio-journey:"+ip);
  const start=new Date(Math.floor(Date.now()/3600000)*3600000).toISOString();
  const {data,error}=await db.rpc("consume_public_endpoint_rate_limit",{p_endpoint:"public_studio_journey",p_key_hash:keyHash,p_window_started_at:start,p_max_requests:30});
  if(error)throw Error("rate-limit not available");
  return data===true;
}
async function historyFor(db:ReturnType<typeof createClient>,sessionId:string){
  const {data,error}=await db.from("studio_journey_steps")
    .select("stage,submitted_at,submission:public_tool_submissions!studio_journey_steps_submission_id_fkey(id,normalized_inputs,result_snapshot)")
    .eq("session_id",sessionId).order("submitted_at",{ascending:true}).order("submission_id",{ascending:true}).limit(MAX_STEPS+1);
  if(error)throw Error("history lookup failed");
  if((data?.length||0)>MAX_STEPS)throw Error("session history limit");
  return projectJourneyHistory(data||[]);
}
async function resolveSession(db:ReturnType<typeof createClient>,token:unknown){
  if(typeof token!=="string"||!TOKEN.test(token))return null;
  const {data,error}=await db.from("studio_journey_sessions")
    .select("id,expires_at,revoked_at,claimed_user_id,studio_id,consent_version")
    .eq("token_hash",await hash(token)).maybeSingle();
  if(error||!data||data.revoked_at||Date.parse(data.expires_at)<=Date.now())return null;
  return data as {id:string;expires_at:string;claimed_user_id:string|null;studio_id:string|null};
}
async function userFrom(db:ReturnType<typeof createClient>,req:Request){
  const header=req.headers.get("authorization")||"";
  if(!/^Bearer [a-zA-Z0-9._-]{50,4096}$/.test(header))return null;
  const {data,error}=await db.auth.getUser(header.slice(7));
  return error?null:data.user;
}
Deno.serve(async(request:Request)=>{
  const origin=request.headers.get("origin");
  if(request.method==="OPTIONS")return new Response(null,{status:204,headers:headers(origin)});
  if(origin&&!ORIGINS.has(origin))return respond(origin,403,{error:"Origin not allowed"});
  if(request.method!=="POST")return respond(origin,405,{error:"Method not allowed"});
  if(!request.headers.get("content-type")?.toLowerCase().includes("application/json"))return respond(origin,415,{error:"JSON required"});
  if(Number(request.headers.get("content-length")||0)>MAX_BYTES)return respond(origin,413,{error:"Payload too large"});
  let body:Obj;
  try{const raw=await request.text();if(new TextEncoder().encode(raw).byteLength>MAX_BYTES)return respond(origin,413,{error:"Payload too large"});const parsed=JSON.parse(raw);if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))throw Error();body=parsed;}
  catch{return respond(origin,400,{error:"Invalid JSON"});}
  const action=body.action;
  if(!["start","profile","submit","claim","mine","linked_profile","revoke"].includes(String(action)))return respond(origin,422,{error:"Unknown action"});
  const url=Deno.env.get("SUPABASE_URL"),key=secretKey();
  if(!url||!key)return respond(origin,503,{error:"Assessment service unavailable"});
  const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  try{
    if(!await rateLimit(request,db))return respond(origin,429,{error:"Too many submissions"});
    if(action==="start"){
      const existing=await resolveSession(db,body.sessionToken);
      if(existing)return respond(origin,200,{sessionToken:body.sessionToken,expiresAt:existing.expires_at});
      if(body.sessionToken)return respond(origin,401,{error:"Session invalid or expired"});
      const token=newToken();
      const {data,error}=await db.from("studio_journey_sessions").insert({token_hash:await hash(token),consent_version:CONSENT_VERSION}).select("id,expires_at").single();
      if(error||!data?.id)throw Error("session creation failed");
      return respond(origin,200,{sessionToken:token,expiresAt:data.expires_at});
    }
    if(action==="mine"){
      const user=await userFrom(db,request);if(!user)return respond(origin,401,{error:"Sign in to view profiles"});
      const {data,error}=await db.from("studio_journey_sessions").select("id,studio_id,claimed_at,expires_at")
        .eq("claimed_user_id",user.id).order("claimed_at",{ascending:false}).limit(40);
      if(error)throw Error("linked profile lookup failed");
      return respond(origin,200,{linkedProfiles:data||[]});
    }
    if(action==="linked_profile"){
      const user=await userFrom(db,request);
      if(!user)return respond(origin,401,{error:"Sign in to access this studio"});
      if(typeof body.sessionId!=="string"||!UUID.test(body.sessionId))
        return respond(origin,422,{error:"Invalid linked profile"});
      const {data:linked,error:linkError}=await db.from("studio_journey_sessions")
        .select("id,studio_id,claimed_user_id").eq("id",body.sessionId)
        .eq("claimed_user_id",user.id).is("revoked_at",null).maybeSingle();
      if(linkError||!linked?.studio_id)return respond(origin,404,{error:"Linked studio not found"});
      const {data:member,error:memberError}=await db.from("studio_members")
        .select("studio_id").eq("user_id",user.id).eq("studio_id",linked.studio_id)
        .eq("active",true).maybeSingle();
      if(memberError||!member)return respond(origin,403,{error:"Current studio membership required"});
      const history=await historyFor(db,linked.id);
      // Purchase status is returned only to the verified account user and their
      // currently active studio membership. No purchaser email or card data leaks.
      const {data:orders,error:orderError}=await db.from("orders")
        .select("id,status,amount_total,currency,created_at")
        .eq("offer_slug","studio-intelligence-audit")
        .eq("metadata->>journey_session_id",linked.id)
        .order("created_at",{ascending:false}).limit(5);
      if(orderError)throw Error("purchase lookup failed");
      const purchase=(orders||[]).find(o=>o.status==="paid"&&o.amount_total===39500&&o.currency==="gbp")||null;
      const {data:grants,error:grantsError}=await db.from("si_report_access")
        .select("report_id").eq("user_id",user.id).limit(100);
      if(grantsError)throw Error("report access lookup failed");
      let publishedReports:{reportId:string;auditId:string;version:number}[]=[];
      const grantIds=(grants||[]).map(g=>g.report_id);
      if(grantIds.length){
        const {data:reports,error:reportError}=await db.from("report_versions")
          .select("id,audit_id,version,status").in("id",grantIds).eq("status","published");
        if(reportError)throw Error("report lookup failed");
        const auditIds=[...new Set((reports||[]).map(r=>r.audit_id))];
        if(auditIds.length){
          const {data:audits,error:auditError}=await db.from("audits")
            .select("id,studio_id").in("id",auditIds).eq("studio_id",linked.studio_id);
          if(auditError)throw Error("report studio authorisation failed");
          const allowed=new Set((audits||[]).map(a=>a.id));
          publishedReports=(reports||[]).filter(r=>allowed.has(r.audit_id))
            .map(r=>({reportId:r.id,auditId:r.audit_id,version:r.version}));
        }
      }
      return respond(origin,200,{history,studioId:linked.studio_id,memberAccess:true,
        purchase:purchase?{paid:true,orderId:purchase.id,amountPence:purchase.amount_total,currency:"gbp"}:{paid:false},
        publishedReports,evidence:"SELF_REPORTED"});
    }
    const session=await resolveSession(db,body.sessionToken);
    if(!session)return respond(origin,401,{error:"Session invalid or expired"});
    if(action==="revoke"){
      const {error}=await db.from("studio_journey_sessions").update({revoked_at:new Date().toISOString()}).eq("id",session.id);
      if(error)throw Error("revoke failed");
      return respond(origin,200,{revoked:true});
    }
    if(action==="claim"){
      const user=await userFrom(db,request);
      if(!user)return respond(origin,401,{error:"Sign in to connect your studio"});
      if(typeof body.studioId!=="string"||!UUID.test(body.studioId))return respond(origin,422,{error:"Invalid studio"});
      if(session.claimed_user_id&&session.claimed_user_id!==user.id)return respond(origin,403,{error:"Session belongs to another account"});
      if(session.studio_id&&session.studio_id!==body.studioId)return respond(origin,409,{error:"Session already linked"});
      const {data:member,error:memberError}=await db.from("studio_members").select("studio_id")
        .eq("studio_id",body.studioId).eq("user_id",user.id).eq("active",true).in("role",["owner","admin"]).maybeSingle();
      if(memberError||!member)return respond(origin,403,{error:"Verified studio owner/admin membership required"});
      const history=await historyFor(db,session.id);
      if(!history.growth)return respond(origin,409,{error:"Complete and save your Growth Check first"});
      if(session.claimed_user_id===user.id&&session.studio_id===body.studioId)return respond(origin,200,{linked:true,studioId:body.studioId,evidence:"SELF_REPORTED"});
      const {data:claimed,error:claimError}=await db.from("studio_journey_sessions")
        .update({claimed_user_id:user.id,studio_id:body.studioId,claimed_at:new Date().toISOString()})
        .eq("id",session.id).is("claimed_user_id",null).is("revoked_at",null).select("studio_id").maybeSingle();
      if(claimError)throw Error("claim failed");
      if(!claimed)return respond(origin,409,{error:"Session claimed by another request"});
      // Never overwrite existing studio name, canonical data, verified metrics or report permissions.
      return respond(origin,200,{linked:true,studioId:body.studioId,evidence:"SELF_REPORTED"});
    }
    const history=await historyFor(db,session.id);
    if(action==="profile")return respond(origin,200,{history,studioId:session.studio_id,ownerVerified:!!session.claimed_user_id,
      expiresAt:session.expires_at,evidence:"SELF_REPORTED"});
    if(typeof body.step!=="string"||!STAGES.includes(body.step)||typeof body.submissionKey!=="string"||!UUID.test(body.submissionKey))
      return respond(origin,422,{error:"Invalid stage or submission identifier"});
    let calc:ReturnType<typeof evaluateStage>;
    try{calc=evaluateStage(body.step,body.input,history);}catch(error){
      return respond(origin,422,{error:error instanceof Error?error.message:"Invalid stage input"});}
    const growth=body.step==="growth"?calc.normalized:history.growth?.normalized;
    if(!growth||typeof growth!=="object"||!Object.prototype.hasOwnProperty.call(growth,"studio"))
      return respond(origin,409,{error:"Saved Growth Check required"});
    const studio=(growth as {studio:{name:string;area:string;website:string|null}}).studio;
    const normalized={session_id:session.id,step:body.step,answer:calc.normalized,provenance:"SELF_REPORTED",calculation_version:VERSION};
    const {data:rows,error:saveError}=await db.rpc("persist_studio_journey_stage",{
      p_session_id:session.id,p_submission_key:body.submissionKey,p_stage:body.step,p_version:VERSION,
      p_consent_version:CONSENT_VERSION,p_studio_name:studio.name,p_website:studio.website,p_area:studio.area,
      p_normalized_inputs:normalized,p_result_snapshot:calc.result,
    });
    if(saveError){if(saveError.code==="23505")return respond(origin,409,{error:"Duplicate key with changed answers"});throw Error("save RPC failure");}
    if(!Array.isArray(rows)||rows.length!==1||!rows[0]?.submission_id)throw Error("save not acknowledged");
    return respond(origin,200,{submissionId:rows[0].submission_id,result:rows[0].saved_result,
      source:"DURABLY_SAVED",sessionExpiresAt:session.expires_at});
  }catch(error){console.error("public studio journey error",error instanceof Error?error.message:"unknown");
    return respond(origin,503,{error:"We could not save or retrieve your assessment. Please retry."});}
});