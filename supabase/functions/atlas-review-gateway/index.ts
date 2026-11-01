import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function allowed(origin:string|null) {
  if(!origin)return false;
  try {
    const u=new URL(origin);
    return u.protocol==="https:" && (u.hostname==="getinksights.co.uk"
      || u.hostname==="www.getinksights.co.uk"
      || /^inksight-main(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(u.hostname));
  } catch{return false;}
}
function headers(origin:string|null){return {"Content-Type":"application/json","Cache-Control":"no-store","Vary":"Origin",
  "Access-Control-Allow-Origin":allowed(origin)?origin!:"https://getinksights.co.uk",
  "Access-Control-Allow-Headers":"content-type,authorization,apikey,x-client-info","Access-Control-Allow-Methods":"POST,OPTIONS"};}
function respond(origin:string|null,status:number,obj:unknown){return new Response(JSON.stringify(obj),{status,headers:headers(origin)});}
function key(){
  const raw=Deno.env.get("SUPABASE_SECRET_KEYS");
  if(raw){const keys=JSON.parse(raw) as Record<string,string>;const k=keys.default??Object.values(keys)[0];if(k)return k;}
  const fallback=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!fallback)throw Error("Missing service key");
  return fallback;
}
async function rest(path:string,init:RequestInit={}){
  const k=key();const r=await fetch(Deno.env.get("SUPABASE_URL")+"/rest/v1/"+path,{
    ...init,headers:{apikey:k,...(k.startsWith("sb_secret_")?{}:{Authorization:"Bearer "+k}),
      "Content-Type":"application/json",...(init.headers||{})}});
  const s=await r.text();
  if(!r.ok)throw Error("Backend review failed ("+r.status+")");
  return s?JSON.parse(s):null;
}
Deno.serve(async(req:Request)=>{
  const origin=req.headers.get("origin");
  if(req.method==="OPTIONS")return new Response("",{status:204,headers:headers(origin)});
  if(req.method!=="POST")return respond(origin,405,{ok:false,error:"Method not allowed"});
  if(!allowed(origin))return respond(origin,403,{ok:false,error:"Origin not allowed"});
  if(Number(req.headers.get("content-length")||0)>12000)return respond(origin,413,{ok:false,error:"Request too large"});
  const token=req.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];
  if(!token)return respond(origin,401,{ok:false,error:"Sign in required"});
  try{
    const authResponse=await fetch(Deno.env.get("SUPABASE_URL")+"/auth/v1/user",{
      headers:{apikey:key(),Authorization:"Bearer "+token}});
    if(!authResponse.ok)return respond(origin,401,{ok:false,error:"Session expired or invalid"});
    const user=await authResponse.json();
    if(!UUID.test(user?.id||""))return respond(origin,401,{ok:false,error:"Invalid account"});
    const admins=await rest("platform_admins?select=user_id,role,active&user_id=eq."+encodeURIComponent(user.id)+"&active=eq.true&limit=1");
    const admin=Array.isArray(admins)?admins[0]:null;
    if(!admin||!["owner","admin"].includes(admin.role))return respond(origin,403,{ok:false,error:"Reviewer permission required"});

    const body=await req.json() as Record<string,unknown>;
    if(body.action==="list"){
      const claims=await rest("atlas_claim_requests?select=id,user_id,studio_id,proposed_studio_name,proposed_town,proposed_website,authority_role,verification_method,evidence_note,status,created_at&status=in.(pending,needs_evidence)&order=created_at.asc&limit=75");
      return respond(origin,200,{ok:true,claims});
    }
    if(body.action==="list_profiles") {
      const [profiles,drafts]=await Promise.all([
        rest("atlas_profiles?select=id,studio_id,name,town,listing_status,premises_verified_at,premises_verified_until,latitude,longitude,public_address&order=updated_at.desc&limit=100"),
        rest("atlas_profile_drafts?select=id,studio_id,status,about,website_url,instagram_url,styles,proposed_public_address,created_at&status=eq.pending_review&limit=100"),
      ]);
      return respond(origin,200,{ok:true,profiles,drafts});
    }
    if(body.action==="publication") {
      const profile=typeof body.profile_id==="string"?body.profile_id:"";
      const decision=typeof body.decision==="string"?body.decision:"";
      const note=typeof body.evidence_summary==="string"?body.evidence_summary.trim():"";
      if(!UUID.test(profile)||!["publish","suspend","approve_draft","reject_draft"].includes(decision)||note.length<40||note.length>2000)
        return respond(origin,400,{ok:false,error:"Profile, decision and at least 40 characters of review evidence are required."});
      const source=typeof body.source_url==="string"&&body.source_url.startsWith("https://")?body.source_url:null;
      const draft=typeof body.draft_id==="string"&&UUID.test(body.draft_id)?body.draft_id:null;
      const latitude=typeof body.latitude==="number"&&Number.isFinite(body.latitude)?body.latitude:null;
      const longitude=typeof body.longitude==="number"&&Number.isFinite(body.longitude)?body.longitude:null;
      const address=typeof body.public_address==="string"?body.public_address.trim().slice(0,300):null;
      const result=await rest("rpc/atlas_admin_review_publication",{method:"POST",body:JSON.stringify({
        p_actor_id:user.id,p_profile_id:profile,p_action:decision,p_evidence_note:note,p_source_url:source,
        p_latitude:latitude,p_longitude:longitude,p_public_address:address,
        p_owner_public_location_confirmed:body.owner_public_location_confirmed===true,p_draft_id:draft,
      })});
      return respond(origin,200,{ok:true,result});
    }
    if(body.action!=="review")return respond(origin,400,{ok:false,error:"Unsupported action"});
    const claimId=typeof body.claim_id==="string"?body.claim_id:"";
    const decision=typeof body.decision==="string"?body.decision:"";
    const note=typeof body.evidence_summary==="string"?body.evidence_summary.trim():"";
    const canonical=typeof body.existing_studio_id==="string"&&UUID.test(body.existing_studio_id)?body.existing_studio_id:null;
    const visibility=typeof body.existing_visibility_id==="string"&&UUID.test(body.existing_visibility_id)?body.existing_visibility_id:null;
    if(!UUID.test(claimId)||!["approve","reject","needs_evidence"].includes(decision)||note.length<30||note.length>2000)
      return respond(origin,400,{ok:false,error:"A claim, decision and evidence note of at least 30 characters are required"});
    if(decision==="approve"&&body.authority_confirmed!==true)
      return respond(origin,400,{ok:false,error:"Independent authority verification is required"});
    const result=await rest("rpc/atlas_admin_review_claim",{method:"POST",
      body:JSON.stringify({
        p_claim_id:claimId,p_actor_id:user.id,p_decision:decision,p_authority_confirmed:body.authority_confirmed===true,
        p_evidence_summary:note,p_existing_studio_id:canonical,p_existing_visibility_id:visibility,
      })});
    return respond(origin,200,{ok:true,result});
  }catch(error){
    console.error("Atlas reviewer operation failed",error instanceof Error?error.message:String(error));
    return respond(origin,500,{ok:false,error:"Review could not be completed. Check whether this claim has been reviewed already, then retry."});
  }
});