import { generateDiagnoses, generateFindings, type StoredEvidence } from "./diagnosis.ts";
import type { AuditMetricInput } from "./metrics.ts";

function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }
const calc = (metricKey:string,valueNumeric:number,confidence:"HIGH"|"MEDIUM"|"LOW"="MEDIUM"):AuditMetricInput => ({ metricKey,valueNumeric,evidenceClassification:"CALCULATED",confidence,measurementStatus:"measured",calculationVersion:"test",provenance:{} });

Deno.test("revenue decline cannot become demand decline when availability constrains delivery and no demand evidence exists", () => {
  const metrics=[calc("recorded_payment_value_2021",2500000,"HIGH"),calc("recorded_payment_value_2026",70000,"HIGH")];
  const findings=generateFindings({metrics,evidence:[],context:{material_owner_availability_constraint:true}});
  const diagnoses=generateDiagnoses({findings,metrics,evidence:[],context:{material_owner_availability_constraint:true}});
  assert(findings.some((f)=>f.findingKey==="capacity_context_gate"),"expected capacity context gate");
  assert(diagnoses.some((d)=>d.constraintType==="capacity_context"),"expected capacity diagnosis");
  assert(!diagnoses.some((d)=>d.constraintType==="demand_decline"),"must not diagnose demand decline");
});

Deno.test("dormant client finding uses metric value and inherits confidence", () => {
  const metric=calc("dormant_historical_clients",42,"MEDIUM");
  const findings=generateFindings({metrics:[metric],evidence:[],context:{}});
  const finding=findings.find((f)=>f.findingKey==="dormant_client_asset");
  assert(finding?.classification==="CALCULATED","expected calculated finding");
  assert(finding?.confidence==="MEDIUM","expected inherited confidence");
  assert(finding?.statement.includes("42"),"statement should derive count from metric");
});

Deno.test("observed noindex placeholder portfolio and mailto-only path support digital readiness finding", () => {
  const evidence:StoredEvidence[]=[
    {id:"e1",evidenceType:"website_indexability",summary:"noindex",classification:"OBSERVED",confidence:"HIGH",provenance:{noindex:true}},
    {id:"e2",evidenceType:"website_proof",summary:"placeholder",classification:"OBSERVED",confidence:"MEDIUM",provenance:{placeholder_portfolio:true}},
    {id:"e3",evidenceType:"website_enquiry_path",summary:"mailto",classification:"OBSERVED",confidence:"MEDIUM",provenance:{cta_types:["mailto"]}},
  ];
  const findings=generateFindings({metrics:[],evidence,context:{}});
  const finding=findings.find((f)=>f.findingKey==="digital_acquisition_readiness");
  assert(finding?.classification==="OBSERVED","expected observed finding");
  assert(finding?.evidenceIds.length===3,"expected all three source evidence records linked");
  assert(finding?.statement.includes("non-indexable")&&finding.statement.includes("placeholder")&&finding.statement.includes("mailto-only"),"finding must state only observed conditions");
});
