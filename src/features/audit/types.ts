export type EvidenceClass = "VERIFIED" | "OBSERVED" | "CALCULATED" | "MODELLED" | "HYPOTHESIS";
export type Confidence = "HIGH" | "MEDIUM" | "LOW";
export type Materiality = "low" | "medium" | "high" | "critical";
export type RecommendationPhase = "0-30" | "31-60" | "61-90";

export type Studio = { id:string; name:string; slug:string; website_url:string|null; primary_location:string|null; internal_validation:boolean };
export type Audit = { id:string; studio_id:string; audit_version:string; mode:"A"|"B"|"C"; status:string; period_start:string|null; period_end:string|null; context:Record<string,unknown>; qa_status:string; report_status:string; created_at:string; completed_at:string|null };
export type Metric = { id:string; metric_key:string; value_numeric:number|null; value_text:string|null; unit:string|null; period_start:string|null; period_end:string|null; evidence_classification:EvidenceClass; confidence:Confidence; measurement_status:string; not_measurable_reason:string|null; required_source:string|null; calculation_version:string; provenance:Record<string,unknown> };
export type Evidence = { id:string; evidence_type:string; title:string; summary:string; classification:EvidenceClass; confidence:Confidence; provenance:Record<string,unknown>; observed_at:string|null; created_at:string };
export type Finding = { id:string; finding_key:string; title:string; statement:string; category:string; classification:EvidenceClass; confidence:Confidence; materiality:Materiality; status:string; created_at:string };
export type Diagnosis = { id:string; audit_id:string; title:string; statement:string; constraint_type:string; confidence:Confidence; rank:number; created_at:string };
export type OpportunityAssumptions = { score_version?:string; items?:string[] } & Record<string,unknown>;
export type Opportunity = { id:string; audit_id:string; diagnosis_id:string|null; title:string; mechanism:string; impact_score:number; confidence_score:number; ease_score:number; speed_score:number; cost_score:number; overall_score:number; impact_low:number|null; impact_high:number|null; impact_unit:string|null; evidence_classification:EvidenceClass; confidence:Confidence; assumptions:OpportunityAssumptions; created_at:string };
export type Recommendation = { id:string; audit_id:string; opportunity_id:string|null; title:string; rationale:string; action:string; owner_role:string|null; target_metric_key:string|null; priority:number; sequence:number; phase:RecommendationPhase; created_at:string };
export type AuditRun = { id:string; engine_key:string; status:string; started_at:string|null; completed_at:string|null; input_hash:string|null; input_summary:Record<string,unknown>; output_summary:Record<string,unknown>; error_code:string|null; error_message:string|null; retry_count:number };
export type ReportVersion = { id:string; audit_id:string; version:number; status:string; generated_at:string; qa_status:string; manifest:Record<string,unknown>; pdf_storage_path:string|null };

export type AuditBundle = { studio:Studio; audit:Audit; metrics:Metric[]; evidence:Evidence[]; findings:Finding[]; diagnoses:Diagnosis[]; opportunities:Opportunity[]; recommendations:Recommendation[]; runs:AuditRun[]; reports:ReportVersion[] };
export type PublishedReportBundle = Omit<AuditBundle,"reports"> & { report:ReportVersion & { pdf_available?:boolean } };
