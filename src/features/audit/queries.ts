import { supabase } from "@/integrations/supabase/client";
import type { Audit, AuditBundle, AuditRun, Diagnosis, Evidence, Finding, Metric, Opportunity, PublishedReportBundle, Recommendation, ReportVersion, Studio } from "./types";

async function must<T>(promise: PromiseLike<{ data:T|null; error:{message:string}|null }>, label:string):Promise<T>{
  const { data, error } = await promise;
  if (error || !data) throw new Error(`${label}: ${error?.message ?? "not found"}`);
  return data;
}

export async function loadAudits():Promise<Array<Audit & { studio?:Studio }>>{
  const { data, error } = await supabase.from("audits").select("*,studios(*)").order("created_at",{ascending:false});
  if (error) throw new Error(error.message);
  return (data ?? []).map((row:any)=>({ ...row, studio: row.studios })) as Array<Audit & { studio?:Studio }>;
}

export async function loadAuditBundle(auditId:string):Promise<AuditBundle>{
  const audit = await must<Audit>(supabase.from("audits").select("*").eq("id",auditId).single(),"audit");
  const [studio,metrics,evidence,findings,diagnoses,opportunities,recommendations,runs,reports] = await Promise.all([
    must<Studio>(supabase.from("studios").select("*").eq("id",audit.studio_id).single(),"studio"),
    selectMany<Metric>("audit_metrics",auditId,"metric_key"),
    selectMany<Evidence>("audit_evidence",auditId,"created_at"),
    selectMany<Finding>("audit_findings",auditId,"materiality",false),
    selectMany<Diagnosis>("audit_diagnoses",auditId,"rank"),
    selectMany<Opportunity>("audit_opportunities",auditId,"overall_score",false),
    selectMany<Recommendation>("audit_recommendations",auditId,"sequence"),
    selectMany<AuditRun>("audit_runs",auditId,"started_at"),
    selectMany<ReportVersion>("report_versions",auditId,"version",false),
  ]);
  return {studio,audit,metrics,evidence,findings,diagnoses,opportunities,recommendations,runs,reports};
}

async function selectMany<T>(table:string,auditId:string,order:string,ascending=true):Promise<T[]>{
  const { data, error } = await supabase.from(table as any).select("*").eq("audit_id",auditId).order(order,{ascending});
  if (error) throw new Error(`${table}: ${error.message}`);
  return (data ?? []) as T[];
}

export async function loadPublishedReport(token:string):Promise<PublishedReportBundle>{
  if(!/^[0-9a-f]{64}$/.test(token)) throw new Error("Invalid report token");
  const base=(import.meta.env["VITE_SUPABASE_URL"] || process.env["SUPABASE_URL"] || "").replace(/\/$/,"");
  if(!base) throw new Error("Supabase public configuration is unavailable");
  const response=await fetch(`${base}/functions/v1/golden-audit-report`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"read",token})});
  const payload=await response.json();
  if(!response.ok || !payload?.ok) throw new Error(payload?.error || "Report unavailable");
  return payload as PublishedReportBundle;
}
