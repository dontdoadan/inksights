import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { mapSearchObservation } from "../_shared/audit/evidence.ts";
import { isServiceRoleAuthorization, validateUuid } from "../golden-audit-ingest/security.ts";

const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json","cache-control":"no-store"}});
const clean=(value:unknown,max=300)=>String(value??"").trim().replace(/\s+/g," ").slice(0,max);
const domainOf=(value:string|null|undefined)=>{ try{return new URL(value??"").hostname.replace(/^www\./,"").toLowerCase();}catch{return "";} };

function buildQueries(studio:{name:string;primary_location:string|null;website_url:string|null}){
  const location=clean(studio.primary_location,100);
  const base=[
    studio.name,
    location?`tattoo studio ${location}`:"tattoo studio",
    location?`tattoo artist ${location}`:"tattoo artist",
    location?`black and grey tattoo ${location}`:"black and grey tattoo",
    location?`realism tattoo ${location}`:"realism tattoo",
    location?`custom tattoo ${location}`:"custom tattoo",
  ];
  return [...new Set(base.map((q)=>clean(q,180)).filter(Boolean))].slice(0,8);
}

async function brave(query:string,key:string){
  const params=new URLSearchParams({q:query,country:"gb",search_lang:"en",count:"10",safesearch:"moderate"});
  const response=await fetch(`https://api.search.brave.com/res/v1/web/search?${params}`,{headers:{Accept:"application/json","X-Subscription-Token":key},signal:AbortSignal.timeout(12_000)});
  const data=await response.json() as Record<string,unknown>;
  if(!response.ok) throw new Error(`brave_search:${response.status}`);
  const web=(data.web??{}) as Record<string,unknown>; const items=Array.isArray(web.results)?web.results as Record<string,unknown>[]:[];
  return items.slice(0,10).map((item,index)=>({position:index+1,url:clean(item.url,1000)||null,domain:domainOf(clean(item.url,1000)),title:clean(item.title,500)||null}));
}

Deno.serve(async(req)=>{
  if(req.method!=="POST") return json({ok:false,error:"method_not_allowed"},405);
  if(!isServiceRoleAuthorization(req.headers.get("authorization"))) return json({ok:false,error:"service_role_required"},403);
  const sb=createClient(Deno.env.get("SUPABASE_URL")??"",Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")??Deno.env.get("SUPABASE_SECRET_KEY")??"");
  let runId:string|null=null;
  try{
    const body=await req.json(); const auditId=validateUuid(body.audit_id,"audit_id");
    const audit=await sb.from("audits").select("id,studio_id").eq("id",auditId).single(); if(audit.error) throw new Error(`audit_lookup:${audit.error.message}`);
    const studio=await sb.from("studios").select("id,name,website_url,primary_location").eq("id",audit.data.studio_id).single(); if(studio.error) throw new Error(`studio_lookup:${studio.error.message}`);
    const run=await sb.from("audit_runs").insert({audit_id:auditId,engine_key:"search_intelligence",status:"started",input_summary:{provider:"brave"}}).select("id").single(); if(run.error) throw new Error(`run_insert:${run.error.message}`); runId=run.data.id;
    const key=Deno.env.get("BRAVE_SEARCH_API_KEY")??"";
    if(!key){ await sb.from("audit_runs").update({status:"blocked",completed_at:new Date().toISOString(),error_code:"provider_not_configured",error_message:"BRAVE_SEARCH_API_KEY is not configured"}).eq("id",runId); return json({ok:false,status:"blocked",error:"provider_not_configured",run_id:runId},503); }
    const queries=buildQueries(studio.data); const studioDomain=domainOf(studio.data.website_url); const observedAt=new Date().toISOString();
    const observations:Array<{query:string;position:number|null;url:string|null;domain:string|null;results:unknown[]}> = [];
    const competitorCounts=new Map<string,{count:number;best:number}>();
    for(const query of queries){
      const results=await brave(query,key); const own=results.find((r)=>studioDomain&&r.domain===studioDomain)??null;
      observations.push({query,position:own?.position??null,url:own?.url??null,domain:own?.domain??null,results});
      for(const result of results){ if(!result.domain||result.domain===studioDomain) continue; const current=competitorCounts.get(result.domain)??{count:0,best:999}; current.count+=1; current.best=Math.min(current.best,result.position); competitorCounts.set(result.domain,current); }
    }
    const source=await sb.from("audit_sources").insert({audit_id:auditId,source_type:"search_observation",source_name:"brave_search_sample",observed_at:observedAt,metadata:{provider:"brave",query_count:queries.length,queries}}).select("id").single(); if(source.error) throw new Error(`source_insert:${source.error.message}`);
    const evidence=observations.map((obs)=>mapSearchObservation({query:obs.query,provider:"brave",database:"brave_web_gb",position:obs.position,url:obs.url,domain:obs.domain,observedAt})).map((e)=>({audit_id:auditId,source_id:source.data.id,evidence_type:e.evidenceType,title:e.title,summary:e.summary,classification:e.classification,confidence:e.confidence,provenance:e.provenance,observed_at:e.observedAt}));
    const competitors=[...competitorCounts.entries()].sort((a,b)=>b[1].count-a[1].count||a[1].best-b[1].best).slice(0,10);
    for(const [domain,stats] of competitors){ evidence.push({audit_id:auditId,source_id:source.data.id,evidence_type:"competitor_observation",title:`Observed competitor: ${domain}`,summary:`${domain} appeared in ${stats.count} of ${queries.length} retained Brave query samples; best observed position ${stats.best}.`,classification:"OBSERVED",confidence:"MEDIUM",provenance:{source_provider:"brave",database:"brave_web_gb",domain,query_overlap:stats.count,best_observed_position:stats.best,selection_rationale:"bounded recurring-domain overlap across studio-specific query sample"},observed_at:observedAt}); }
    const inserted=await sb.from("audit_evidence").insert(evidence); if(inserted.error) throw new Error(`evidence_insert:${inserted.error.message}`);
    await sb.from("audit_runs").update({status:"success",completed_at:new Date().toISOString(),output_summary:{provider:"brave",queries:queries.length,evidence_records:evidence.length,competitors:competitors.length,studio_domain:studioDomain||null}}).eq("id",runId);
    return json({ok:true,run_id:runId,source_id:source.data.id,provider:"brave",queries:queries.length,evidence_records:evidence.length,competitors:competitors.length});
  }catch(error){ const message=error instanceof Error?error.message:String(error); console.error("golden-audit-search",message); if(runId) await sb.from("audit_runs").update({status:"failed",completed_at:new Date().toISOString(),error_code:message.split(":",1)[0],error_message:message.slice(0,1000)}).eq("id",runId); return json({ok:false,error:"search_audit_failed"},500); }
});
