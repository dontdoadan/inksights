import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildReportManifest } from "../_shared/audit/report.ts";
import { runReportQa } from "../_shared/audit/qa.ts";
import { isServiceRoleAuthorization, validateUuid } from "../golden-audit-ingest/security.ts";

const SB_URL=Deno.env.get("SUPABASE_URL")??"";
const KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")??Deno.env.get("SUPABASE_SECRET_KEY")??"";
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","access-control-allow-origin":"https://getinksights.co.uk"}});

async function sha256(value:string){ const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value)); return Array.from(new Uint8Array(digest)).map((b)=>b.toString(16).padStart(2,"0")).join(""); }
function token(){ const bytes=crypto.getRandomValues(new Uint8Array(32)); return Array.from(bytes).map((b)=>b.toString(16).padStart(2,"0")).join(""); }

async function loadModel(sb:ReturnType<typeof createClient>,auditId:string){
  const audit=await sb.from("audits").select("id,studio_id,audit_version,mode,status,period_start,period_end,context,qa_status,report_status,created_at,completed_at").eq("id",auditId).single(); if(audit.error) throw new Error(`audit:${audit.error.message}`);
  const studio=await sb.from("studios").select("id,name,slug,website_url,primary_location,internal_validation").eq("id",audit.data.studio_id).single(); if(studio.error) throw new Error(`studio:${studio.error.message}`);
  const [metrics,evidence,findings,diagnoses,opportunities,recommendations,runs]=await Promise.all([
    sb.from("audit_metrics").select("*").eq("audit_id",auditId).order("metric_key"),
    sb.from("audit_evidence").select("id,evidence_type,title,summary,classification,confidence,provenance,observed_at,created_at").eq("audit_id",auditId).order("created_at"),
    sb.from("audit_findings").select("*").eq("audit_id",auditId).order("materiality",{ascending:false}),
    sb.from("audit_diagnoses").select("*").eq("audit_id",auditId).order("rank"),
    sb.from("audit_opportunities").select("*").eq("audit_id",auditId).order("overall_score",{ascending:false}),
    sb.from("audit_recommendations").select("*").eq("audit_id",auditId).order("sequence"),
    sb.from("audit_runs").select("id,engine_key,status,started_at,completed_at,input_summary,output_summary,error_code,error_message,retry_count").eq("audit_id",auditId).order("started_at"),
  ]);
  for(const result of [metrics,evidence,findings,diagnoses,opportunities,recommendations,runs]) if(result.error) throw new Error(`report_data:${result.error.message}`);
  return {audit:audit.data,studio:studio.data,metrics:metrics.data??[],evidence:evidence.data??[],findings:findings.data??[],diagnoses:diagnoses.data??[],opportunities:opportunities.data??[],recommendations:recommendations.data??[],runs:runs.data??[]};
}

Deno.serve(async(req)=>{
  if(req.method==="OPTIONS") return new Response("ok",{headers:{"access-control-allow-origin":"https://getinksights.co.uk","access-control-allow-methods":"POST, OPTIONS","access-control-allow-headers":"content-type, authorization"}});
  if(req.method!=="POST") return json({ok:false,error:"method_not_allowed"},405);
  const sb=createClient(SB_URL,KEY);
  try{
    const body=await req.json() as Record<string,unknown>; const action=String(body.action??"");
    if(action==="read"){
      const supplied=String(body.token??"").trim(); if(!/^[0-9a-f]{64}$/.test(supplied)) return json({ok:false,error:"invalid_report_token"},403);
      const hash=await sha256(supplied);
      const report=await sb.from("report_versions").select("id,audit_id,version,status,generated_at,qa_status,manifest,pdf_storage_path").eq("secure_token_hash",hash).eq("status","published").maybeSingle();
      if(report.error||!report.data) return json({ok:false,error:"report_not_found"},404);
      const model=await loadModel(sb,report.data.audit_id);
      return json({ok:true,report:{id:report.data.id,version:report.data.version,status:report.data.status,generated_at:report.data.generated_at,qa_status:report.data.qa_status,pdf_available:Boolean(report.data.pdf_storage_path),manifest:report.data.manifest},...model});
    }

    if(!isServiceRoleAuthorization(req.headers.get("authorization"))) return json({ok:false,error:"service_role_required"},403);
    const auditId=validateUuid(body.audit_id,"audit_id");

    if(action==="generate"){
      const model=await loadModel(sb,auditId);
      const coverageWarnings=model.runs.filter((r)=>["partial","blocked"].includes(r.status)||(r.status==="failed"&&["website","search_visibility"].includes(r.engine_key))).map((r)=>`${r.engine_key}: ${r.error_code??r.status}`);
      const manifest=buildReportManifest({studioId:model.studio.id,auditId,auditVersion:model.audit.audit_version,periodStart:model.audit.period_start,periodEnd:model.audit.period_end,metricIds:model.metrics.map((x)=>x.id),evidenceIds:model.evidence.map((x)=>x.id),findingIds:model.findings.map((x)=>x.id),diagnosisIds:model.diagnoses.map((x)=>x.id),opportunityIds:model.opportunities.map((x)=>x.id),recommendationIds:model.recommendations.map((x)=>x.id),coverageWarnings});
      const manifestHash=await sha256(JSON.stringify(manifest));
      const latest=await sb.from("report_versions").select("version,manifest_hash,id,status").eq("audit_id",auditId).order("version",{ascending:false}).limit(1).maybeSingle(); if(latest.error) throw new Error(`report_version:${latest.error.message}`);
      if(latest.data?.manifest_hash===manifestHash) return json({ok:true,report_version_id:latest.data.id,version:latest.data.version,reused:true});
      const version=(latest.data?.version??0)+1;
      const inserted=await sb.from("report_versions").insert({audit_id:auditId,version,status:"draft",qa_status:"pending",manifest,manifest_hash:manifestHash}).select("id,version").single(); if(inserted.error) throw new Error(`report_insert:${inserted.error.message}`);
      return json({ok:true,report_version_id:inserted.data.id,version:inserted.data.version,reused:false});
    }

    if(action==="qa"){
      const model=await loadModel(sb,auditId);
      const report=await sb.from("report_versions").select("id,version,manifest").eq("audit_id",auditId).in("status",["draft","qa","client_ready"]).order("version",{ascending:false}).limit(1).single(); if(report.error) throw new Error(`report_lookup:${report.error.message}`);
      const qa=runReportQa({manifest:report.data.manifest,metrics:model.metrics,opportunities:model.opportunities,runs:model.runs,requiredSections:["commercial_baseline_metric_ids","evidence_ids","finding_ids","diagnosis_ids","opportunity_ids","recommendation_ids"]});
      await sb.from("qa_checks").delete().eq("report_version_id",report.data.id);
      const inserted=await sb.from("qa_checks").insert(qa.checks.map((c)=>({audit_id:auditId,report_version_id:report.data.id,check_key:c.checkKey,status:c.status,severity:c.severity,message:c.message,evidence:c.evidence}))); if(inserted.error) throw new Error(`qa_insert:${inserted.error.message}`);
      const nextStatus=qa.passed?"client_ready":"qa"; const reportUpdate=await sb.from("report_versions").update({status:nextStatus,qa_status:qa.passed?"passed":"failed"}).eq("id",report.data.id); if(reportUpdate.error) throw new Error(reportUpdate.error.message);
      await sb.from("audits").update({qa_status:qa.passed?"passed":"failed",report_status:nextStatus}).eq("id",auditId);
      return json({ok:qa.passed,passed:qa.passed,report_version_id:report.data.id,checks:qa.checks},qa.passed?200:422);
    }

    if(action==="publish"){
      const report=await sb.from("report_versions").select("id,version,status").eq("audit_id",auditId).eq("status","client_ready").order("version",{ascending:false}).limit(1).single(); if(report.error) throw new Error(`report_not_client_ready:${report.error.message}`);
      const publicToken=token(); const hash=await sha256(publicToken);
      const updated=await sb.from("report_versions").update({status:"published",secure_token_hash:hash,web_slug:`audit-${report.data.id}`}).eq("id",report.data.id); if(updated.error) throw new Error(updated.error.message);
      await sb.from("audits").update({report_status:"published"}).eq("id",auditId);
      return json({ok:true,report_version_id:report.data.id,version:report.data.version,token:publicToken,report_url:`https://getinksights.co.uk/report/${publicToken}`});
    }

    return json({ok:false,error:"unsupported_action"},400);
  }catch(error){ const message=error instanceof Error?error.message:String(error); console.error("golden-audit-report",message); return json({ok:false,error:"report_service_failed",detail:message.slice(0,240)},500); }
});
