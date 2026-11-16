
import { createClient } from "npm:@supabase/supabase-js@2.79.0";
const SENDER="daniel@getinksights.co.uk";
const ZOHO_ACCOUNT_ID="410903000000002002";
const ZOHO_MAIL_API="https://mail.zoho.eu";
const ZOHO_ACCOUNTS_API="https://accounts.zoho.eu";
const ADMIN_TABLE="platform_admins";
const OUTBOX="inksights_mail_outbox", INBOX="inksights_mail_inbox";
const SUPPRESS="inksights_mail_suppressions", EVENTS="inksights_mail_events";
const SYNC="inksights_mail_sync_state";
const json=(status:number,payload:unknown)=>new Response(JSON.stringify(payload),{status,headers:{"content-type":"application/json","cache-control":"no-store"}});
const error=(status:number,message:string)=>json(status,{error:message});
const cleanEmail=(s:unknown)=>typeof s==="string"?s.trim().toLowerCase():"";
const validEmail=(s:string)=>/^[^\s@,;<>]+@[^\s@,;<>]+\.[a-z]{2,}$/i.test(s)&&s.length<=254;
const digest=async(r:Record<string,unknown>)=>{
 const raw=[String(r.recipient??"").trim().toLowerCase(),String(r.subject??""),String(r.body??"")].join("\n");
 const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(raw));
 return Array.from(new Uint8Array(b)).map(v=>v.toString(16).padStart(2,"0")).join("");
};
function svc(){
 const url=Deno.env.get("SUPABASE_URL");
 const key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||(()=>{try{return JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}").default}catch{return ""}})();
 if(!url||!key)throw new Error("Supabase server secret unavailable");
 return createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}});
}
function ready(){return !!(Deno.env.get("ZOHO_CLIENT_ID")&&Deno.env.get("ZOHO_CLIENT_SECRET")&&Deno.env.get("ZOHO_REFRESH_TOKEN"))}
async function getZohoToken(){
 if(!ready())throw new Error("Zoho OAuth credentials not configured");
 const payload=new URLSearchParams({grant_type:"refresh_token",client_id:Deno.env.get("ZOHO_CLIENT_ID")!,client_secret:Deno.env.get("ZOHO_CLIENT_SECRET")!,refresh_token:Deno.env.get("ZOHO_REFRESH_TOKEN")!});
 const rsp=await fetch(ZOHO_ACCOUNTS_API+"/oauth/v2/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:payload,signal:AbortSignal.timeout(12000)});
 const obj=await rsp.json().catch(()=>({}));
 if(!rsp.ok||!obj.access_token)throw new Error("Zoho OAuth token refresh rejected");
 return obj.access_token as string;
}
async function zoho(path:string,method:"GET"|"POST",body?:Record<string,unknown>){
 const token=await getZohoToken();
 const rsp=await fetch(ZOHO_MAIL_API+path,{method,headers:{"Authorization":"Zoho-oauthtoken "+token,"Accept":"application/json",...(body?{"Content-Type":"application/json"}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(17000)});
 const data=await rsp.json().catch(()=>({}));
 if(!rsp.ok||Number(data?.status?.code??200)>=400)throw new Error("Zoho Mail API request failed (HTTP "+rsp.status+")");
 return data;
}
async function audit(db:ReturnType<typeof svc>,event_type:string,outbox_id:string|null,actor_id:string|null,details:Record<string,unknown>={}){
 const {error:e}=await db.from(EVENTS).insert({event_type,outbox_id,actor_id,details});
 if(e)throw new Error("Audit log unavailable");
}
async function suppressed(db:ReturnType<typeof svc>,address:string){
 const {data,error:e}=await db.from(SUPPRESS).select("email").eq("email",address).maybeSingle();
 if(e)throw new Error("Suppression lookup unavailable");
 return !!data;
}
async function getRow(db:ReturnType<typeof svc>,id:unknown){
 if(typeof id!=="string"||!/^[0-9a-f-]{36}$/i.test(id))return null;
 const {data,error:e}=await db.from(OUTBOX).select("*").eq("id",id).maybeSingle();
 if(e)throw new Error("Outbox lookup unavailable");
 return data;
}
async function pollInbox(db:ReturnType<typeof svc>,actor:string){
 if(!ready())return {ok:false,reason:"zoho_secrets_missing"};
 const {data:sync,error:se}=await db.from(SYNC).select("*").eq("mailbox",SENDER).single();
 if(se||!sync)throw new Error("Sync cursor unavailable");
 // Explicit baseline: never import the entire historic personal mailbox.
 if(!sync.initialized){
  const {error:e}=await db.from(SYNC).update({initialized:true,last_polled_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("mailbox",SENDER).eq("initialized",false);
  if(e)throw new Error("Sync baseline failed");
  await audit(db,"inbox_baseline",null,actor,{});
  return {ok:true,initialised:true,imported:0};
 }
 const cursor=new Date(sync.last_polled_at??0).getTime();
 const startedAt=Date.now();
 const folders=await zoho("/api/accounts/"+ZOHO_ACCOUNT_ID+"/folders","GET");
 const entries=Array.isArray(folders.data)?folders.data:[];
 const inbox=entries.find((f:Record<string,unknown>)=>String(f.folderType??"").toLowerCase()==="inbox"||String(f.folderName??"").toLowerCase()==="inbox");
 if(!inbox?.folderId)throw new Error("Zoho inbox folder could not be resolved");
 const listing=await zoho("/api/accounts/"+ZOHO_ACCOUNT_ID+"/messages/view?"+new URLSearchParams({folderId:String(inbox.folderId),limit:"100",start:"1",sortBy:"date",sortorder:"false"}),"GET");
 const entriesMsg=Array.isArray(listing.data)?listing.data:[];
 let imported=0,matched=0;
 const ordered=entriesMsg.sort((a:Record<string,unknown>,b:Record<string,unknown>)=>Number(a.receivedTime??a.sentDateInGMT??0)-Number(b.receivedTime??b.sentDateInGMT??0));
 for(const mail of ordered){
  const messageId=String(mail.messageId??"");
  const timestamp=Number(mail.receivedTime??mail.sentDateInGMT??0);
  const from=cleanEmail(mail.fromAddress??mail.sender);
  if(!messageId||!validEmail(from)||!Number.isFinite(timestamp)||timestamp<=cursor||timestamp>startedAt)continue;
  const {data:possible,error:pe}=await db.from(OUTBOX).select("id").eq("status","sent").ilike("recipient",from).lte("sent_at",new Date(timestamp).toISOString()).order("sent_at",{ascending:false}).limit(1);
  if(pe)throw new Error("Outreach correlation failed");
  const match=possible?.[0]?.id??null;
  if(!match && from!==SENDER)continue; // Only track conversations related to sent outreach.
  const {error:ie,data:ins}=await db.from(INBOX).upsert({zoho_message_id:messageId,zoho_thread_id:String(mail.threadId??""),folder_id:String(inbox.folderId),sender:from,recipient:String(mail.toAddress??""),subject:String(mail.subject??"").slice(0,250),preview:String(mail.summary??"").slice(0,500),received_at:new Date(timestamp).toISOString(),matched_outbox_id:match,is_test:from===SENDER,updated_at:new Date().toISOString()},{onConflict:"zoho_message_id",ignoreDuplicates:true}).select("id");
  if(ie)throw new Error("Inbox save failed");
  if(ins?.length){imported++;if(match)matched++;}
 }
 // If inbox is saturated, do not advance the cursor and silently lose older replies.
 if(entriesMsg.length>=100)throw new Error("Inbox batch saturated; cursor deliberately unchanged");
 const {error:ce}=await db.from(SYNC).update({last_polled_at:new Date(startedAt).toISOString(),updated_at:new Date().toISOString()}).eq("mailbox",SENDER);
 if(ce)throw new Error("Sync cursor save failed");
 await audit(db,"inbox_polled",null,actor,{imported,matched});
 return {ok:true,imported,matched};
}
Deno.serve(async(req:Request)=>{
 if(req.method!=="POST")return error(405,"POST only");
 const bearer=(req.headers.get("Authorization")||"").match(/^Bearer\s+(.+)$/i)?.[1];
 if(!bearer)return error(401,"Authenticated INKSIGHTS administrator required");
 let db:ReturnType<typeof svc>;
 try{db=svc()}catch{return error(503,"Backend configuration unavailable")}
 const {data:{user},error:ue}=await db.auth.getUser(bearer);
 if(ue||!user)return error(401,"Invalid or expired user token");
 const {data:admin,error:ae}=await db.from(ADMIN_TABLE).select("user_id").eq("user_id",user.id).eq("active",true).maybeSingle();
 if(ae||!admin)return error(403,"INKSIGHTS platform administrator required");
 let p:Record<string,unknown>;
 try{p=await req.json();if(!p||Array.isArray(p)||typeof p!=="object")throw Error()}catch{return error(400,"Invalid JSON body")}
 const action=String(p.action??"");
 try {
 if(action==="health")return json(200,{status:"deployed",zoho_credentials_configured:ready(),mailbox:SENDER,external_sending_enabled:Deno.env.get("ZOHO_EXTERNAL_SEND_ENABLED")==="true"});
 if(action==="list"){
  const table=p.box==="inbox"?INBOX:OUTBOX;
  const {data,error:e}=await db.from(table).select("*").order("created_at",{ascending:false}).limit(50);
  if(e)throw new Error("List unavailable");return json(200,{records:data});
 }
 if(action==="create"){
  const recipient=cleanEmail(p.recipient),subject=String(p.subject??"").trim(),body=String(p.body??"").trim();
  const is_test=p.is_test===true;
  const purpose=is_test?"test":"outreach";
  if(!validEmail(recipient)||!subject||subject.length>250||!body||body.length>25000)return error(400,"Invalid recipient, subject or body");
  if(is_test && recipient!==SENDER)return error(400,"Test messages must target the INKSIGHTS mailbox");
  const idem=typeof p.idempotency_key==="string"&&p.idempotency_key.length>=10&&p.idempotency_key.length<=160?p.idempotency_key:null;
  const row={recipient,subject,body,is_test,purpose,studio_id:typeof p.studio_id==="string"?p.studio_id:null,hubspot_contact_id:typeof p.hubspot_contact_id==="string"?p.hubspot_contact_id:null,idempotency_key:idem};
  const {data,error:e}=await db.from(OUTBOX).insert(row).select("id,status,recipient,is_test").single();
  if(e)return error(e.code==="23505"?409:400,"Outbox record could not be created");
  await audit(db,"created",data.id,user.id,{is_test});
  return json(201,{record:data});
 }
 if(action==="draft"){
  const row=await getRow(db,p.id);
  if(!row)return error(404,"Message not found");
  if(!["pending","drafted","failed"].includes(row.status))return error(409,"Message is not draftable in this state");
  if(!ready())return error(503,"Zoho OAuth secrets are not configured");
  const result=await zoho("/api/accounts/"+ZOHO_ACCOUNT_ID+"/messages","POST",{mode:"draft",fromAddress:SENDER,toAddress:row.recipient,subject:row.subject,content:row.body,mailFormat:"plaintext",encoding:"UTF-8",askReceipt:"no"});
  const msg=String(result.data?.mailId??result.data?.messageId??"");
  const {error:e}=await db.from(OUTBOX).update({status:"drafted",zoho_draft_id:msg,updated_at:new Date().toISOString()}).eq("id",row.id).eq("status",row.status);
  if(e)throw new Error("Zoho draft created but database write failed; review Zoho Drafts before retry");
  await audit(db,"zoho_draft_created",row.id,user.id,{zoho_draft_id:msg});
  return json(200,{status:"drafted",id:row.id,zoho_draft_id:msg});
 }
 if(action==="approve"){
  const row=await getRow(db,p.id);
  if(!row)return error(404,"Message not found");
  if(!["pending","drafted"].includes(row.status))return error(409,"Not awaiting approval");
  if(p.confirmation!=="I_APPROVE_THIS_EXACT_EMAIL"||p.recipient!==row.recipient||p.subject!==row.subject||p.body!==row.body)return error(403,"Exact recipient, subject, body and confirmation must be supplied");
  const eligibility=String(p.eligibility??"unverified");
  if(!row.is_test && !["verified_corporate","consent_verified"].includes(eligibility))return error(403,"Marketing eligibility has not been verified");
  if(!row.is_test && (typeof p.eligibility_evidence!=="string"||p.eligibility_evidence.trim().length<12))return error(403,"Eligibility evidence required");
  if(p.suppression_clear!==true||await suppressed(db,row.recipient))return error(403,"Suppression check not clear");
  const approved_digest=await digest(row),now=new Date().toISOString();
  const {data:updated,error:e}=await db.from(OUTBOX).update({status:"approved",approved_by:user.id,approved_at:now,approved_digest,eligibility:row.is_test?"unverified":eligibility,eligibility_evidence:row.is_test?"Internal self-test":String(p.eligibility_evidence),suppression_checked_at:now,updated_at:now}).eq("id",row.id).eq("status",row.status).select("id,status").single();
  if(e||!updated)return error(409,"Approval changed concurrently");
  await audit(db,"approved",row.id,user.id,{eligibility:row.is_test?"internal_test":eligibility});
  return json(200,{record:updated});
 }
 if(action==="send"){
  const row=await getRow(db,p.id);
  if(!row)return error(404,"Message not found");
  if(p.confirmation!=="SEND_THIS_APPROVED_MESSAGE")return error(403,"Per-message sending confirmation required");
  if(row.status!=="approved"||!row.approved_by||!row.approved_at||!row.approved_digest||row.approved_digest!==await digest(row))return error(403,"Exact message has no valid approval");
  if(!row.suppression_checked_at||Date.now()-Date.parse(row.suppression_checked_at)>86400000)return error(403,"Suppression clearance has expired");
  if(await suppressed(db,row.recipient))return error(403,"Recipient is suppressed");
  if(row.is_test&&row.recipient!==SENDER)return error(403,"Test send may only go to own mailbox");
  if(!row.is_test&&(Deno.env.get("ZOHO_EXTERNAL_SEND_ENABLED")!=="true"))return error(403,"External outreach sending disabled");
  if(!row.is_test&&!["verified_corporate","consent_verified"].includes(row.eligibility))return error(403,"Eligibility not verified");
  if(!ready())return error(503,"Zoho OAuth secrets are not configured");
  // Claim atomically: duplicated requests must never send twice.
  const {data:claimed,error:ce}=await db.from(OUTBOX).update({status:"sending",attempt_count:row.attempt_count+1,updated_at:new Date().toISOString()}).eq("id",row.id).eq("status","approved").select("id").maybeSingle();
  if(ce||!claimed)return error(409,"Message is already claimed or sent");
  try {
   await audit(db,"send_attempt_claimed",row.id,user.id,{is_test:row.is_test});
   const result=await zoho("/api/accounts/"+ZOHO_ACCOUNT_ID+"/messages","POST",{fromAddress:SENDER,toAddress:row.recipient,subject:row.subject,content:row.body,mailFormat:"plaintext",encoding:"UTF-8",askReceipt:"no"});
   const msg=String(result.data?.mailId??result.data?.messageId??"");
   const {error:ue}=await db.from(OUTBOX).update({status:"sent",sent_at:new Date().toISOString(),zoho_message_id:msg,updated_at:new Date().toISOString()}).eq("id",row.id).eq("status","sending");
   if(ue)throw new Error("Zoho accepted the message but the status update failed");
   await audit(db,"sent",row.id,user.id,{zoho_message_id:msg});
   return json(200,{status:"sent",id:row.id,zoho_message_id:msg});
  }catch{
   await db.from(OUTBOX).update({status:"unknown",last_error:"Send outcome indeterminate. Inspect Zoho Sent before taking further action.",updated_at:new Date().toISOString()}).eq("id",row.id).eq("status","sending");
   return error(502,"Zoho send outcome uncertain; do not retry automatically");
  }
 }
 if(action==="poll")return json(200,await pollInbox(db,user.id));
 if(action==="suppress"){
  const email=cleanEmail(p.email);
  if(!validEmail(email)||p.confirmation!=="SUPPRESS_THIS_ADDRESS")return error(400,"Invalid suppression request");
  const reason=["opt_out","bounce","manual","legal_hold"].includes(String(p.reason))?String(p.reason):"manual";
  const {error:e}=await db.from(SUPPRESS).upsert({email,reason,source:"admin_zoho_mail_ops"},{onConflict:"email"});
  if(e)throw new Error("Suppression write failed");
  await audit(db,"recipient_suppressed",null,user.id,{reason});
  return json(200,{status:"suppressed",email});
 }
 return error(400,"Unsupported action");
 }catch(e){
  console.error("INKSIGHTS mail operation failed",String(e instanceof Error?e.message:e).slice(0,200));
  return error(503,e instanceof Error&&e.message==="Zoho OAuth credentials not configured"?"Zoho OAuth credentials not configured":"Operation could not be completed safely");
 }
});
