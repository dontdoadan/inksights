export type EvidenceClass = "VERIFIED" | "OBSERVED" | "CALCULATED" | "MODELLED" | "HYPOTHESIS";
export type Confidence = "HIGH" | "MEDIUM" | "LOW";

export type Studio = { id:string; name:string; slug:string; website_url:string|null; primary_location:string|null; internal_validation:boolean };
export type Audit = { id:string; studio_id:string; audit_version:string; mode:"A"|"B"|"C"; status:string; period_start:string|null; period_end:string|null; context:Record<string,unknown>; qa_status:string; report_status:string; created_at:string; completed_at:string|null };
export type Metric = { id:string; metric_key:string; value_numeric:number|null; value_text:string|null; unit:string|null; period_start:string|null; period_end:string|null; evidence_classification:EvidenceClass; confidence:Confidence; measurement_status:string; not_measurable_reason:string|null; required_source:string|null; provenance:Record<string,unknown> };
export type Evidence = { id:string; evidence_type:string; title:string; summary:string; classification:EvidenceClass; confidence:Confidence; provenance:Record<string,unknown>; observed_at:string|null; created_at:string };
export type Finding = { id:string; finding_key:string; title:string; statement:string; classification:EvidenceClass; confidence:Confidence; materiality:number; status:string; provenance:Record<string,unknown> };
export type Diagnosis = { id:string; diagnosis_key:string; title:string; statement:string; classification:EvidenceClass; confidence:Confidence; rank:number; status:string; provenance:Record<string,unknown> };
export type Opportunity = { id:string; opportunity_key:string; title:string; description:string; overall_score:number; impact_score:number; confidence_score:number; ease_score:number; speed_score:number; cost_risk_score:number; score_version:string; estimated_impact_pence:number|null; impact_assumptions:Record<string,unknown>; status:string; provenance:Record<string,unknown> };
export type Recommendation = { id:string; opportunity_id:string; title:string; action:string; mechanism:string; owner:string|null; target_metric:string|null; phase:string; sequence:number; status:string; provenance:Record<string,unknown> };
export type AuditRun = { id:string; engine_key:string; status:string; started_at:string|null; completed_at:string|null; input_summary:Record<string,unknown>; output_summary:Record<string,unknown>; error_code:string|null; error_message:string|null; retry_count:number };
export type ReportVersion = { id:string; audit_id:string; version:number; status:string; generated_at:string; qa_status:string; manifest:Record<string,unknown>; pdf_storage_path:string|null };

export type AuditBundle = { studio:Studio; audit:Audit; metrics:Metric[]; evidence:Evidence[]; findings:Finding[]; diagnoses:Diagnosis[]; opportunities:Opportunity[]; recommendations:Recommendation[]; runs:AuditRun[]; reports:ReportVersion[] };
export type PublishedReportBundle = Omit<AuditBundle,"reports"> & { report:ReportVersion & { pdf_available?:boolean } };
