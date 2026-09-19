import type { AuditMetricInput, Confidence, EvidenceClassification } from "./metrics.ts";

export type StoredEvidence = {
  id: string;
  evidenceType: string;
  summary: string;
  classification: EvidenceClassification;
  confidence: Confidence;
  provenance: Record<string, unknown>;
};

export type AuditContext = {
  material_owner_availability_constraint?: boolean;
  [key: string]: unknown;
};

export type FindingInput = {
  findingKey: string;
  title: string;
  statement: string;
  category: string;
  classification: EvidenceClassification;
  confidence: Confidence;
  materiality: "low" | "medium" | "high" | "critical";
  evidenceIds: string[];
  metricKeys: string[];
  contextKeys?: string[];
};

export type DiagnosisInput = {
  title: string;
  statement: string;
  constraintType: string;
  confidence: Confidence;
  rank: number;
  findingKeys: string[];
};

function metricByKey(metrics: AuditMetricInput[], key: string) {
  return metrics.find((metric) => metric.metricKey === key);
}

export function generateFindings(input: {
  metrics: AuditMetricInput[];
  evidence: StoredEvidence[];
  context: AuditContext;
}): FindingInput[] {
  const findings: FindingInput[] = [];
  const dormant = metricByKey(input.metrics, "dormant_historical_clients");
  if (dormant?.measurementStatus === "measured" && typeof dormant.valueNumeric === "number" && dormant.valueNumeric > 0) {
    findings.push({ findingKey:"dormant_client_asset", title:"Dormant historical client asset", statement:`${Math.round(dormant.valueNumeric)} conservatively resolved historical client identities are inactive within the configured reactivation window. This is a reactivation signal, not guaranteed recoverable revenue.`, category:"client_economics", classification:"CALCULATED", confidence:dormant.confidence, materiality:dormant.valueNumeric>=20?"high":"medium", evidenceIds:[], metricKeys:[dormant.metricKey], contextKeys:[] });
  }

  const noindex=input.evidence.find((e)=>e.evidenceType==="website_indexability"&&e.provenance.noindex===true);
  const proof=input.evidence.find((e)=>e.evidenceType==="website_proof"&&e.provenance.placeholder_portfolio===true);
  const enquiry=input.evidence.find((e)=>{if(e.evidenceType!=="website_enquiry_path")return false;const ctas=Array.isArray(e.provenance.cta_types)?e.provenance.cta_types:[];return ctas.includes("mailto")&&!ctas.includes("form")});
  if(noindex&&proof&&enquiry){findings.push({findingKey:"digital_acquisition_readiness",title:"Digital acquisition journey is not yet ready to scale",statement:"The inspected website is currently non-indexable, contains placeholder portfolio proof, and exposes a mailto-only enquiry path without an observed structured form. These observed conditions limit discoverability, conversion instrumentation and confidence before traffic is scaled.",category:"digital_acquisition",classification:"OBSERVED",confidence:"HIGH",materiality:"high",evidenceIds:[noindex.id,proof.id,enquiry.id],metricKeys:[],contextKeys:[]});}

  const yearMetrics=input.metrics.filter((m)=>/^recorded_payment_value_\d{4}$/.test(m.metricKey)&&m.measurementStatus==="measured"&&typeof m.valueNumeric==="number").sort((a,b)=>a.metricKey.localeCompare(b.metricKey));
  if(yearMetrics.length>=2){const first=yearMetrics[0];const latest=yearMetrics[yearMetrics.length-1];const declined=(latest.valueNumeric??0)<(first.valueNumeric??0)*0.5;if(declined&&input.context.material_owner_availability_constraint===true){findings.push({findingKey:"capacity_context_gate",title:"Recent revenue trend is capacity-confounded",statement:"Recorded payment value has declined materially across the observed periods, but a material owner-availability constraint is recorded. The revenue trend therefore cannot by itself establish a demand decline.",category:"operating_context",classification:"VERIFIED",confidence:"HIGH",materiality:"critical",evidenceIds:[],metricKeys:[first.metricKey,latest.metricKey],contextKeys:["material_owner_availability_constraint"]});}}
  return findings;
}

export function generateDiagnoses(input:{findings:FindingInput[];metrics:AuditMetricInput[];evidence:StoredEvidence[];context:AuditContext}):DiagnosisInput[]{
  const diagnoses:DiagnosisInput[]=[];const byKey=new Map(input.findings.map((finding)=>[finding.findingKey,finding]));const capacityGate=byKey.get("capacity_context_gate");const dormant=byKey.get("dormant_client_asset");const digital=byKey.get("digital_acquisition_readiness");
  if(capacityGate)diagnoses.push({title:"Available operating capacity materially constrains interpretation",statement:"The current evidence does not support diagnosing weak demand from revenue decline because material owner availability limits are present. Acquisition recommendations must therefore be subordinate to realistic delivery capacity.",constraintType:"capacity_context",confidence:"HIGH",rank:1,findingKeys:[capacityGate.findingKey]});
  if(dormant)diagnoses.push({title:"Historical client value is under-activated",statement:"The existing customer asset contains a measurable dormant cohort, creating a lower-friction reactivation opportunity before relying exclusively on cold acquisition.",constraintType:"client_reactivation",confidence:dormant.confidence,rank:capacityGate?2:1,findingKeys:[dormant.findingKey]});
  if(digital)diagnoses.push({title:"Digital acquisition infrastructure is not ready for scale",statement:"Observed website conditions create discoverability, proof and measurement weaknesses that should be corrected before significant acquisition traffic is scaled.",constraintType:"digital_acquisition_readiness",confidence:digital.confidence,rank:capacityGate?(dormant?3:2):(dormant?2:1),findingKeys:[digital.findingKey]});
  return diagnoses.sort((a,b)=>a.rank-b.rank);
}
