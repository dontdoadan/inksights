import { supabase } from "@/integrations/supabase/client";
import type { Audit, AuditBundle, AuditRun, Diagnosis, Evidence, Finding, Metric, Opportunity, PublishedReportBundle, Recommendation, ReportVersion, Studio } from "./types";

function config(){
  const url=(import.meta.env["VITE_SUPABASE_URL"] || process.env["SUPABASE_URL"] || "").replace(/\/$/,"");
  const key=import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || process.env["SUPABASE_PUBLISHABLE_KEY"] || "";
  if(!url || !key) throw new Error("Supabase public configuration is unavailable");
  return {url,key};
}

async function accessToken(){ const {data}=await supabase.auth.getSession(); if(!data.session?.access_token) throw new Error("Authentication required"); return data.session.access_token; }

async function restRows<T>(table:string,params:Record<string,string>,token:string):Promise<T[]>{
  const {url,key}=config(); const query=new URLSearchParams(params);
  const response=await fetch(`${url}/rest/v1/${table}?${query.toString()}`,{headers:{apikey:key,Authorization:`Bearer ${token}`,Accept:"application/json"}});
  if(!response.ok) throw new Error(`${table}: ${response.status}`);
  return await response.json() as T[];
}

export async function loadAudits():Promise<Array<Audit & { studio?:Studio }>>{
  const token=await accessToken();
  const audits=await restRows<Audit>("audits",{select:"*",order:"created_at.desc"},token);
  const studioIds=[...new Set(audits.map(a=>a.studio_id))];
  const studios=studioIds.length?await restRows<Studio>("studios",{select:"*",id:`in.(${studioIds.join(",")})`},token):[];
  const byId=new Map(studios.map(s=>[s.id,s]));
  return audits.map(a=>({...a,studio:byId.get(a.studio_id)}));
}

export async function loadAuditBundle(auditId:string):Promise<AuditBundle>{
  const token=await accessToken();
  const [audit]=await restRows<Audit>("audits",{select:"*",id:`eq.${auditId}`,limit:"1"},token); if(!audit) throw new Error("Audit not found");
  const [studioRows,metrics,evidence,findings,diagnoses,opportunities,recommendations,runs,reports]=await Promise.all([
    restRows<Studio>("studios",{select:"*",id:`eq.${audit.studio_id}`,limit:"1"},token),
    rowsFor<Metric>("audit_metrics",auditId,"metric_key.asc",token), rowsFor<Evidence>("audit_evidence",auditId,"created_at.asc",token),
    rowsFor<Finding>("audit_findings",auditId,"materiality.desc",token), rowsFor<Diagnosis>("audit_diagnoses",auditId,"rank.asc",token),
    rowsFor<Opportunity>("audit_opportunities",auditId,"overall_score.desc",token), rowsFor<Recommendation>("audit_recommendations",auditId,"sequence.asc",token),
    rowsFor<AuditRun>("audit_runs",auditId,"started_at.asc",token), rowsFor<ReportVersion>("report_versions",auditId,"version.desc",token),
  ]);
  const studio=studioRows[0]; if(!studio) throw new Error("Studio not found");
  return {studio,audit,metrics,evidence,findings,diagnoses,opportunities,recommendations,runs,reports};
}

function rowsFor<T>(table:string,auditId:string,order:string,token:string){ return restRows<T>(table,{select:"*",audit_id:`eq.${auditId}`,order},token); }

export async function loadPublishedReport(token:string):Promise<PublishedReportBundle>{
  if(!/^[0-9a-f]{64}$/.test(token)) throw new Error("Invalid report token");
  const {url}=config();
  const response=await fetch(`${url}/functions/v1/golden-audit-report`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"read",token})});
  const payload=await response.json() as {ok?:boolean;error?:string} & Partial<PublishedReportBundle>;
  if(!response.ok || !payload.ok) throw new Error(payload.error || "Report unavailable");
  return payload as PublishedReportBundle;
}
