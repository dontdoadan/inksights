import type { GoldenAuditReportManifest } from "./report.ts";

export type QaCheckInput = {
  checkKey: string;
  status: "pass" | "fail" | "warning" | "not_applicable";
  severity: "info" | "warning" | "error" | "critical";
  message: string;
  evidence: Record<string, unknown>;
};

export type QaInput = {
  manifest: GoldenAuditReportManifest;
  metrics: Array<{ id:string; metric_key:string; value_numeric:number|null; measurement_status:string; evidence_classification:string; provenance:Record<string,unknown>; required_source?:string|null }>;
  opportunities: Array<{ id:string; evidence_classification:string; impact_low:number|null; impact_high:number|null; assumptions:unknown }>;
  runs: Array<{ engine_key:string; status:string; error_code?:string|null }>;
  requiredSections: Array<keyof GoldenAuditReportManifest["sections"]>;
  renderedMetricValues?: Record<string, number>;
};

function hasContent(value: unknown): boolean {
  return Boolean(value && typeof value === "object" && Object.keys(value as Record<string,unknown>).length);
}

export function runReportQa(input: QaInput): { passed:boolean; checks:QaCheckInput[] } {
  const checks:QaCheckInput[]=[];
  const badProvenance=input.metrics.filter((m)=>["measured","estimated"].includes(m.measurement_status)&&m.value_numeric!==null&&!hasContent(m.provenance));
  checks.push({checkKey:"metric_provenance",status:badProvenance.length?"fail":"pass",severity:badProvenance.length?"critical":"info",message:badProvenance.length?`${badProvenance.length} material metrics lack provenance.`:"Material metrics carry provenance.",evidence:{metric_ids:badProvenance.map((m)=>m.id)}});

  const badMeasured=input.metrics.filter((m)=>m.measurement_status==="not_measurable"&&m.value_numeric!==null);
  checks.push({checkKey:"unsupported_metrics",status:badMeasured.length?"fail":"pass",severity:badMeasured.length?"critical":"info",message:badMeasured.length?"One or more not-measurable metrics contain numeric values.":"Unsupported operational metrics remain explicitly unmeasured.",evidence:{metric_ids:badMeasured.map((m)=>m.id)}});

  const modelledMoney=input.opportunities.filter((o)=>o.evidence_classification==="MODELLED"&&(o.impact_low!==null||o.impact_high!==null)&&!hasContent(o.assumptions));
  checks.push({checkKey:"modelled_money_assumptions",status:modelledMoney.length?"fail":"pass",severity:modelledMoney.length?"critical":"info",message:modelledMoney.length?"Modelled monetary impact lacks explicit assumptions.":"Any modelled monetary impact has explicit assumptions.",evidence:{opportunity_ids:modelledMoney.map((o)=>o.id)}});

  const criticalFailed=input.runs.filter((r)=>["quality","transaction_metrics","findings","diagnosis","opportunities","recommendations","report_manifest"].includes(r.engine_key)&&r.status==="failed");
  checks.push({checkKey:"critical_engine_runs",status:criticalFailed.length?"fail":"pass",severity:criticalFailed.length?"critical":"info",message:criticalFailed.length?"A critical audit engine failed.":"No critical pre-publication engine failure is present.",evidence:{engines:criticalFailed.map((r)=>({engine:r.engine_key,error:r.error_code??null}))}});

  const missingSections=input.requiredSections.filter((section)=>!Array.isArray(input.manifest.sections[section]));
  checks.push({checkKey:"required_sections",status:missingSections.length?"fail":"pass",severity:missingSections.length?"error":"info",message:missingSections.length?"Required report sections are missing.":"Required report sections are structurally present.",evidence:{sections:missingSections}});

  const conflicting:string[]=[];
  if(input.renderedMetricValues){ for(const metric of input.metrics){ const rendered=input.renderedMetricValues[metric.id]; if(rendered!==undefined&&metric.value_numeric!==null&&Number(rendered)!==Number(metric.value_numeric)) conflicting.push(metric.id); } }
  checks.push({checkKey:"rendered_metric_reconciliation",status:conflicting.length?"fail":"pass",severity:conflicting.length?"critical":"info",message:conflicting.length?"Rendered metric values conflict with canonical metrics.":"Rendered metric values reconcile where supplied.",evidence:{metric_ids:conflicting}});

  const searchFailures=input.runs.filter((r)=>r.engine_key==="search_visibility"&&["failed","blocked","partial"].includes(r.status));
  checks.push({checkKey:"search_coverage",status:searchFailures.length?"warning":"pass",severity:searchFailures.length?"warning":"info",message:searchFailures.length?"Search evidence coverage is reduced and must be disclosed.":"Search evidence step completed without a coverage warning.",evidence:{count:searchFailures.length}});

  const passed=!checks.some((check)=>check.status==="fail"&&["critical","error"].includes(check.severity));
  return {passed,checks};
}
