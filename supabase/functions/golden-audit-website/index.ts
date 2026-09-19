import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { mapWebsiteEvidence } from "../_shared/audit/evidence.ts";
import { isServiceRoleAuthorization, validateUuid } from "../golden-audit-ingest/security.ts";
import { assertPublicNetworkTarget, validatePublicUrl } from "../studio-visibility-report-v2/security.ts";

const MAX_HTML_BYTES = 2_000_000;
const MAX_REDIRECTS = 3;
const json = (body: unknown, status=200) => new Response(JSON.stringify(body), { status, headers:{"content-type":"application/json","cache-control":"no-store"} });

async function readLimitedText(response: Response): Promise<string> {
  if (!response.body) return "";
  const reader=response.body.getReader(); const decoder=new TextDecoder(); let total=0; let text="";
  try {
    while(true){ const {done,value}=await reader.read(); if(done) break; total+=value.byteLength; if(total>MAX_HTML_BYTES){ await reader.cancel(); throw new Error("website_response_too_large"); } text+=decoder.decode(value,{stream:true}); }
    return text+decoder.decode();
  } finally { reader.releaseLock(); }
}

async function fetchHtml(input: string) {
  let current=validatePublicUrl(input); let response: Response|null=null;
  for(let redirects=0; redirects<=MAX_REDIRECTS; redirects+=1){
    await assertPublicNetworkTarget(current);
    response=await fetch(current,{redirect:"manual",headers:{"user-agent":"INKSIGHTS-Golden-Audit/1.0"},signal:AbortSignal.timeout(10_000)});
    if(![301,302,303,307,308].includes(response.status)) break;
    const location=response.headers.get("location"); await response.body?.cancel();
    if(!location) throw new Error("website_redirect_invalid");
    current=validatePublicUrl(new URL(location,current).toString());
    if(redirects===MAX_REDIRECTS) throw new Error("website_redirect_limit");
  }
  if(!response) throw new Error("website_fetch_failed");
  const contentType=(response.headers.get("content-type")??"").toLowerCase();
  if(contentType && !contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")){ await response.body?.cancel(); throw new Error("website_not_html"); }
  const html=await readLimitedText(response); const observedAt=new Date().toISOString();
  const cleanText=(value:string|null|undefined)=>value?.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim()||null;
  const title=cleanText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]);
  const metaDescription=html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1]?.trim()||null;
  const canonical=html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1]?.trim()||null;
  const robotsMeta=html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i)?.[1]?.trim()||null;
  const noindex=Boolean(robotsMeta && /(?:^|[,\s])noindex(?:$|[,\s])/i.test(robotsMeta));
  const hasJsonLd=/<script[^>]+type=["']application\/ld\+json["']/i.test(html);
  const ctaTypes=[
    /href=["']mailto:/i.test(html)?"mailto":null,
    /href=["'](?:https?:\/\/)?(?:wa\.me|api\.whatsapp\.com)/i.test(html)?"whatsapp":null,
    /<form\b/i.test(html)?"form":null,
    /href=["']tel:/i.test(html)?"telephone":null,
  ].filter((value):value is string=>Boolean(value));
  const placeholderPortfolio=/(portfolio image|replace (?:this|these) (?:image|images)|placeholder (?:portfolio|image)|coming soon)/i.test(html);
  const analyticsSignals=[
    /googletagmanager\.com|gtag\(/i.test(html)?"google_tag":null,
    /connect\.facebook\.net.*fbevents|fbq\(/i.test(html)?"meta_pixel":null,
    /plausible\.io/i.test(html)?"plausible":null,
  ].filter((value):value is string=>Boolean(value));
  return { sourceReference:current.toString(), observedAt, httpStatus:response.status, title, metaDescription, canonical, robotsMeta, noindex, hasJsonLd, ctaTypes, placeholderPortfolio, analyticsSignals };
}

Deno.serve(async(req)=>{
  if(req.method!=="POST") return json({ok:false,error:"method_not_allowed"},405);
  if(!isServiceRoleAuthorization(req.headers.get("authorization"))) return json({ok:false,error:"service_role_required"},403);
  const sb=createClient(Deno.env.get("SUPABASE_URL")??"",Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")??Deno.env.get("SUPABASE_SECRET_KEY")??"");
  let runId:string|null=null;
  try{
    const body=await req.json(); const auditId=validateUuid(body.audit_id,"audit_id");
    const audit=await sb.from("audits").select("id,studio_id").eq("id",auditId).single(); if(audit.error) throw new Error(`audit_lookup:${audit.error.message}`);
    const studio=await sb.from("studios").select("id,website_url").eq("id",audit.data.studio_id).single(); if(studio.error) throw new Error(`studio_lookup:${studio.error.message}`); if(!studio.data.website_url) throw new Error("website_missing");
    const run=await sb.from("audit_runs").insert({audit_id:auditId,engine_key:"website_intelligence",status:"started",input_summary:{website_url:studio.data.website_url}}).select("id").single(); if(run.error) throw new Error(`run_insert:${run.error.message}`); runId=run.data.id;
    const snapshot=await fetchHtml(studio.data.website_url);
    const source=await sb.from("audit_sources").insert({audit_id:auditId,source_type:"website_snapshot",source_name:"studio_homepage",source_uri:snapshot.sourceReference,observed_at:snapshot.observedAt,metadata:snapshot}).select("id").single(); if(source.error) throw new Error(`source_insert:${source.error.message}`);
    const evidence=mapWebsiteEvidence(snapshot).map((item)=>({ audit_id:auditId,source_id:source.data.id,evidence_type:item.evidenceType,title:item.title,summary:item.summary,classification:item.classification,confidence:item.confidence,provenance:item.provenance,observed_at:item.observedAt }));
    const inserted=await sb.from("audit_evidence").insert(evidence); if(inserted.error) throw new Error(`evidence_insert:${inserted.error.message}`);
    await sb.from("audit_runs").update({status:"success",completed_at:new Date().toISOString(),output_summary:{source_id:source.data.id,evidence_records:evidence.length,http_status:snapshot.httpStatus}}).eq("id",runId);
    return json({ok:true,run_id:runId,source_id:source.data.id,evidence_records:evidence.length});
  }catch(error){ const message=error instanceof Error?error.message:String(error); console.error("golden-audit-website",message); if(runId) await sb.from("audit_runs").update({status:"failed",completed_at:new Date().toISOString(),error_code:message.split(":",1)[0],error_message:message.slice(0,1000)}).eq("id",runId); return json({ok:false,error:"website_audit_failed"},500); }
});
