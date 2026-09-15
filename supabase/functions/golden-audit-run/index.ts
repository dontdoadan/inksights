import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { assessTransactionQuality } from "../_shared/audit/quality.ts";
import { calculateMissingOperationalMetrics, calculateTransactionMetrics, toAuditMetricRow, type AuditMetricInput } from "../_shared/audit/metrics.ts";
import { generateDiagnoses, generateFindings, type StoredEvidence } from "../_shared/audit/diagnosis.ts";
import { generateOpportunities, generateRecommendations } from "../_shared/audit/opportunities.ts";
import { isServiceRoleAuthorization, validateUuid } from "../golden-audit-ingest/security.ts";
import { runAudit, type AuditDependencies, type AuditSnapshot, type AuditStepKey, type StepResult } from "./orchestrator.ts";

const SB_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SECRET_KEY") ?? "";
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});

async function hashJson(value: unknown): Promise<string> {
  const encoded=new TextEncoder().encode(JSON.stringify(value));
  const digest=await crypto.subtle.digest("SHA-256",encoded);
  return Array.from(new Uint8Array(digest)).map((b)=>b.toString(16).padStart(2,"0")).join("");
}

function transactionFromDb(row: Record<string,unknown>, index:number) {
  return {
    sourceRow:index+1,
    date:String(row.transaction_date),
    rawClient:String(row.raw_reference??""),
    normalisedClient:String(row.canonical_label??row.raw_reference??"").trim().toLowerCase(),
    amountPence:Number(row.amount_pence??0),
    currency:"GBP" as const,
    sourceRowKey:String(row.source_row_key??`${index}`),
  };
}

Deno.serve(async(req)=>{
  if(req.method!=="POST") return json({ok:false,error:"method_not_allowed"},405);
  if(!isServiceRoleAuthorization(req.headers.get("authorization"))) return json({ok:false,error:"service_role_required"},403);
  const sb=createClient(SB_URL,SERVICE_KEY);
  try{
    const body=await req.json(); const auditId=validateUuid(body.audit_id,"audit_id");

    async function loadAudit(id:string):Promise<AuditSnapshot>{
      const audit=await sb.from("audits").select("id,mode").eq("id",id).single(); if(audit.error) throw new Error(`audit_lookup:${audit.error.message}`);
      const sources=await sb.from("audit_sources").select("source_type").eq("audit_id",id); if(sources.error) throw new Error(`source_lookup:${sources.error.message}`);
      return {id:audit.data.id,mode:audit.data.mode,sourceTypes:[...new Set((sources.data??[]).map((x)=>x.source_type))]};
    }

    async function stepInput(audit:AuditSnapshot,step:AuditStepKey):Promise<Record<string,unknown>>{
      const auditRow=await sb.from("audits").select("id,mode,period_start,period_end,context,studio_id").eq("id",audit.id).single(); if(auditRow.error) throw new Error(auditRow.error.message);
      const sourceRows=await sb.from("audit_sources").select("id,source_type,source_hash,observed_at,ingested_at").eq("audit_id",audit.id).order("ingested_at"); if(sourceRows.error) throw new Error(sourceRows.error.message);
      const metricRows=step==="findings"||step==="diagnosis"||step==="opportunities"||step==="recommendations"||step==="report_manifest"||step==="qa" ? await sb.from("audit_metrics").select("metric_key,value_numeric,value_text,measurement_status,confidence,calculation_version,provenance").eq("audit_id",audit.id).order("metric_key") : {data:[] as unknown[],error:null};
      const evidenceRows=step==="findings"||step==="diagnosis"||step==="opportunities"||step==="recommendations"||step==="report_manifest"||step==="qa" ? await sb.from("audit_evidence").select("id,evidence_type,classification,confidence,observed_at,provenance").eq("audit_id",audit.id).order("created_at") : {data:[] as unknown[],error:null};
      if(metricRows.error) throw new Error(metricRows.error.message); if(evidenceRows.error) throw new Error(evidenceRows.error.message);
      return {step,audit:auditRow.data,sources:sourceRows.data??[],metrics:metricRows.data??[],evidence:evidenceRows.data??[]};
    }

    async function executeWithRun(audit:AuditSnapshot,step:AuditStepKey,work:(input:Record<string,unknown>)=>Promise<StepResult>):Promise<StepResult>{
      const input=await stepInput(audit,step); const inputHash=await hashJson(input);
      const cached=await sb.from("audit_runs").select("id,status,output_summary").eq("audit_id",audit.id).eq("engine_key",step).eq("input_hash",inputHash).eq("status","success").order("completed_at",{ascending:false}).limit(1).maybeSingle();
      if(cached.error) throw new Error(`cache_lookup:${cached.error.message}`);
      if(cached.data) return {status:"success",output:{...(cached.data.output_summary??{}),reused:true}};
      const run=await sb.from("audit_runs").insert({audit_id:audit.id,engine_key:step,status:"started",input_hash:inputHash,input_summary:{hash:inputHash,source_count:Array.isArray(input.sources)?input.sources.length:0}}).select("id").single();
      if(run.error) throw new Error(`run_insert:${run.error.message}`);
      try{
        const result=await work(input);
        await sb.from("audit_runs").update({status:result.status==="partial"?"partial":result.status==="blocked"?"blocked":result.status==="failed"?"failed":"success",completed_at:new Date().toISOString(),output_summary:result.output??{},error_code:result.errorCode??null,error_message:result.warning??null}).eq("id",run.data.id);
        return result;
      }catch(error){ const message=error instanceof Error?error.message:String(error); await sb.from("audit_runs").update({status:"failed",completed_at:new Date().toISOString(),error_code:message.split(":",1)[0],error_message:message.slice(0,1000)}).eq("id",run.data.id); throw error; }
    }

    const deps:AuditDependencies={
      loadAudit,
      async lockAudit(id){ const result=await sb.rpc("lock_golden_audit_run",{p_audit_id:id}); if(result.error) throw new Error(`audit_lock:${result.error.message}`); return result.data===true; },
      async markAuditStatus(id,status){ const update:Record<string,unknown>={status}; if(status==="completed") update.completed_at=new Date().toISOString(); const result=await sb.from("audits").update(update).eq("id",id); if(result.error) throw new Error(`audit_status:${result.error.message}`); },
      async runStep(audit,step){
        return await executeWithRun(audit,step,async()=>{
          if(step==="quality"||step==="transaction_metrics"){
            const transactions=await sb.from("transactions").select("transaction_date,amount_pence,raw_reference,source_row_key,client_id,clients(canonical_label)").eq("studio_id",(await sb.from("audits").select("studio_id").eq("id",audit.id).single()).data?.studio_id??"").order("transaction_date");
            if(transactions.error) throw new Error(`transactions:${transactions.error.message}`);
            const rows=(transactions.data??[]).map((r,index)=>transactionFromDb({...r,canonical_label:(r.clients as {canonical_label?:string}|null)?.canonical_label},index));
            const rejected=await sb.from("audit_raw_records").select("source_row,raw_payload,parse_error").eq("audit_id",audit.id).eq("parse_status","rejected"); if(rejected.error) throw new Error(`rejected:${rejected.error.message}`);
            const rejectedRows=(rejected.data??[]).map((r)=>({sourceRow:r.source_row??0,raw:JSON.stringify(r.raw_payload),reason:r.parse_error??"rejected"}));
            const quality=assessTransactionQuality(rows,rejectedRows);
            if(step==="quality"){
              if(quality.checks.some((c)=>c.status==="fail")) return {status:"failed",errorCode:"transaction_quality_failed",output:{quality}};
              return {status:"success",output:{quality}};
            }
            const auditRow=await sb.from("audits").select("period_start,period_end").eq("id",audit.id).single(); if(auditRow.error) throw new Error(auditRow.error.message);
            const periodStart=auditRow.data.period_start??quality.minDate; const periodEnd=auditRow.data.period_end??quality.maxDate;
            if(!periodStart||!periodEnd) return {status:"failed",errorCode:"transaction_period_missing"};
            const sourceIds=(await sb.from("audit_sources").select("id").eq("audit_id",audit.id).eq("source_type","transaction_ledger")).data?.map((x)=>x.id)??[];
            const metrics=[...calculateTransactionMetrics(rows,{periodStart,periodEnd,reactivationWindowStart:`${Number(periodEnd.slice(0,4))-1}-01-01`,partialYears:quality.partialYears,sourceIds,identityConfidence:quality.potentialDuplicateRows?"MEDIUM":"HIGH"}),...calculateMissingOperationalMetrics(audit.sourceTypes)];
            const del=await sb.from("audit_metrics").delete().eq("audit_id",audit.id); if(del.error) throw new Error(`metrics_delete:${del.error.message}`);
            const ins=await sb.from("audit_metrics").insert(metrics.map((m)=>toAuditMetricRow(audit.id,m))); if(ins.error) throw new Error(`metrics_insert:${ins.error.message}`);
            return {status:"success",output:{metric_count:metrics.length,not_measurable:metrics.filter((m)=>m.measurementStatus==="not_measurable").map((m)=>m.metricKey)}};
          }
          if(step==="website"||step==="search_visibility"){
            const fn=step==="website"?"golden-audit-website":"golden-audit-search";
            const response=await fetch(`${SB_URL}/functions/v1/${fn}`,{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${SERVICE_KEY}`},body:JSON.stringify({audit_id:audit.id})});
            const payload=await response.json() as Record<string,unknown>;
            if(response.ok&&payload.ok===true) return {status:"success",output:payload};
            if(step==="search_visibility"&&(payload.status==="blocked"||response.status===503)) return {status:"partial",errorCode:String(payload.error??"search_unavailable"),warning:"Search provider evidence is unavailable; report must disclose reduced search coverage.",output:payload};
            return {status:"failed",errorCode:String(payload.error??`${fn}_failed`),output:payload};
          }
          if(step==="findings"){
            const metricsDb=await sb.from("audit_metrics").select("*").eq("audit_id",audit.id); if(metricsDb.error) throw new Error(metricsDb.error.message);
            const evidenceDb=await sb.from("audit_evidence").select("*").eq("audit_id",audit.id); if(evidenceDb.error) throw new Error(evidenceDb.error.message);
            const auditDb=await sb.from("audits").select("context").eq("id",audit.id).single(); if(auditDb.error) throw new Error(auditDb.error.message);
            const metrics=(metricsDb.data??[]).map((m)=>({metricKey:m.metric_key,valueNumeric:m.value_numeric==null?undefined:Number(m.value_numeric),valueText:m.value_text??undefined,unit:m.unit??undefined,periodStart:m.period_start??undefined,periodEnd:m.period_end??undefined,evidenceClassification:m.evidence_classification,confidence:m.confidence,measurementStatus:m.measurement_status,notMeasurableReason:m.not_measurable_reason??undefined,requiredSource:m.required_source??undefined,calculationVersion:m.calculation_version,provenance:m.provenance??{}})) as AuditMetricInput[];
            const evidence=(evidenceDb.data??[]).map((e)=>({id:e.id,evidenceType:e.evidence_type,summary:e.summary,classification:e.classification,confidence:e.confidence,provenance:e.provenance??{}})) as StoredEvidence[];
            const findings=generateFindings({metrics,evidence,context:auditDb.data.context??{}});
            const existing=await sb.from("audit_findings").select("id").eq("audit_id",audit.id); if(existing.error) throw new Error(existing.error.message); const ids=(existing.data??[]).map((x)=>x.id); if(ids.length) await sb.from("audit_finding_evidence").delete().in("finding_id",ids);
            const del=await sb.from("audit_findings").delete().eq("audit_id",audit.id); if(del.error) throw new Error(del.error.message);
            for(const finding of findings){ const inserted=await sb.from("audit_findings").insert({audit_id:audit.id,finding_key:finding.findingKey,title:finding.title,statement:finding.statement,category:finding.category,classification:finding.classification,confidence:finding.confidence,materiality:finding.materiality,status:"validated"}).select("id").single(); if(inserted.error) throw new Error(inserted.error.message); if(finding.evidenceIds.length){ const links=await sb.from("audit_finding_evidence").insert(finding.evidenceIds.map((evidence_id)=>({finding_id:inserted.data.id,evidence_id}))); if(links.error) throw new Error(links.error.message); } }
            return {status:"success",output:{finding_count:findings.length}};
          }
          if(step==="diagnosis"){
            const f=await sb.from("audit_findings").select("*").eq("audit_id",audit.id); const m=await sb.from("audit_metrics").select("*").eq("audit_id",audit.id); const e=await sb.from("audit_evidence").select("*").eq("audit_id",audit.id); const a=await sb.from("audits").select("context").eq("id",audit.id).single(); if(f.error||m.error||e.error||a.error) throw new Error("diagnosis_inputs_failed");
            const findings=(f.data??[]).map((x)=>({findingKey:x.finding_key,title:x.title,statement:x.statement,category:x.category,classification:x.classification,confidence:x.confidence,materiality:x.materiality,evidenceIds:[],metricKeys:[]}));
            const metrics=(m.data??[]).map((x)=>({metricKey:x.metric_key,valueNumeric:x.value_numeric==null?undefined:Number(x.value_numeric),evidenceClassification:x.evidence_classification,confidence:x.confidence,measurementStatus:x.measurement_status,calculationVersion:x.calculation_version,provenance:x.provenance??{}})) as AuditMetricInput[];
            const evidence=(e.data??[]).map((x)=>({id:x.id,evidenceType:x.evidence_type,summary:x.summary,classification:x.classification,confidence:x.confidence,provenance:x.provenance??{}})) as StoredEvidence[];
            const diagnoses=generateDiagnoses({findings,metrics,evidence,context:a.data.context??{}});
            await sb.from("audit_recommendations").delete().eq("audit_id",audit.id); await sb.from("audit_opportunities").delete().eq("audit_id",audit.id); await sb.from("audit_diagnoses").delete().eq("audit_id",audit.id);
            if(diagnoses.length){ const ins=await sb.from("audit_diagnoses").insert(diagnoses.map((d)=>({audit_id:audit.id,title:d.title,statement:d.statement,constraint_type:d.constraintType,confidence:d.confidence,rank:d.rank}))); if(ins.error) throw new Error(ins.error.message); }
            return {status:"success",output:{diagnosis_count:diagnoses.length}};
          }
          if(step==="opportunities"){
            const d=await sb.from("audit_diagnoses").select("*").eq("audit_id",audit.id).order("rank"); if(d.error) throw new Error(d.error.message);
            const diagnoses=(d.data??[]).map((x)=>({title:x.title,statement:x.statement,constraintType:x.constraint_type,confidence:x.confidence,rank:x.rank,findingKeys:[]})); const opportunities=generateOpportunities(diagnoses);
            await sb.from("audit_recommendations").delete().eq("audit_id",audit.id); await sb.from("audit_opportunities").delete().eq("audit_id",audit.id);
            for(const o of opportunities){ const diagnosis=d.data?.find((x)=>x.title===o.diagnosisTitle&&x.constraint_type===o.diagnosisConstraintType); const ins=await sb.from("audit_opportunities").insert({audit_id:audit.id,diagnosis_id:diagnosis?.id??null,title:o.title,mechanism:o.mechanism,impact_score:o.impactScore,confidence_score:o.confidenceScore,ease_score:o.easeScore,speed_score:o.speedScore,cost_score:o.costRiskScore,overall_score:o.overallScore,impact_low:o.impactLow??null,impact_high:o.impactHigh??null,impact_unit:o.impactUnit??null,evidence_classification:o.evidenceClassification,confidence:o.confidence,assumptions:{score_version:o.scoreVersion,items:o.assumptions}}); if(ins.error) throw new Error(ins.error.message); }
            return {status:"success",output:{opportunity_count:opportunities.length}};
          }
          if(step==="recommendations"){
            const o=await sb.from("audit_opportunities").select("*,audit_diagnoses(title,constraint_type,confidence)").eq("audit_id",audit.id).order("overall_score",{ascending:false}); if(o.error) throw new Error(o.error.message);
            const inputs=(o.data??[]).map((x)=>{ const d=x.audit_diagnoses as {title?:string;constraint_type?:string;confidence?:"HIGH"|"MEDIUM"|"LOW"}|null; return {diagnosisTitle:d?.title??"",diagnosisConstraintType:d?.constraint_type??"",title:x.title,mechanism:x.mechanism,impactScore:Number(x.impact_score),confidenceScore:Number(x.confidence_score),easeScore:Number(x.ease_score),speedScore:Number(x.speed_score),costRiskScore:Number(x.cost_score),overallScore:Number(x.overall_score),scoreVersion:String((x.assumptions as Record<string,unknown>)?.score_version??"opportunity-score-v1"),evidenceClassification:x.evidence_classification,confidence:x.confidence,assumptions:Array.isArray((x.assumptions as Record<string,unknown>)?.items)?(x.assumptions as {items:string[]}).items:[]}; });
            const recommendations=generateRecommendations(inputs); await sb.from("audit_recommendations").delete().eq("audit_id",audit.id);
            for(const r of recommendations){ const opportunity=o.data?.find((x)=>x.title===r.opportunityTitle); const ins=await sb.from("audit_recommendations").insert({audit_id:audit.id,opportunity_id:opportunity?.id??null,title:r.title,rationale:r.rationale,action:r.action,owner_role:r.ownerRole,target_metric_key:r.targetMetricKey??null,priority:r.priority,sequence:r.sequence}); if(ins.error) throw new Error(ins.error.message); }
            return {status:"success",output:{recommendation_count:recommendations.length}};
          }
          if(step==="report_manifest"||step==="qa"){
            const response=await fetch(`${SB_URL}/functions/v1/golden-audit-report`,{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${SERVICE_KEY}`},body:JSON.stringify({audit_id:audit.id,action:step==="report_manifest"?"generate":"qa"})});
            const payload=await response.json() as Record<string,unknown>; if(response.ok&&payload.ok===true) return {status:"success",output:payload}; return {status:"failed",errorCode:String(payload.error??"report_stage_failed"),output:payload};
          }
          return {status:"failed",errorCode:"unknown_step"};
        });
      },
    };

    const result=await runAudit(auditId,deps);
    return json({ok:result.status==="completed",...result},result.status==="failed"?500:result.status==="already_running"?409:200);
  }catch(error){ const message=error instanceof Error?error.message:String(error); console.error("golden-audit-run",message); return json({ok:false,error:"audit_run_failed",detail:message.slice(0,240)},500); }
});
