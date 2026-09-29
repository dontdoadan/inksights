import { runReportQa } from "./qa.ts";
import { buildReportManifest } from "./report.ts";

function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }
const manifest=buildReportManifest({studioId:"s",auditId:"a",auditVersion:"1.1",periodStart:null,periodEnd:null,metricIds:["m1"],evidenceIds:["e1"],findingIds:["f1"],diagnosisIds:["d1"],opportunityIds:["o1"],recommendationIds:["r1"],coverageWarnings:[]});
const sections=["commercial_baseline_metric_ids","evidence_ids","finding_ids","diagnosis_ids","opportunity_ids","recommendation_ids"] as const;

Deno.test("QA blocks measured material metrics without provenance", () => {
  const qa=runReportQa({manifest,metrics:[{id:"m1",metric_key:"recorded_payment_value",value_numeric:100,measurement_status:"measured",evidence_classification:"CALCULATED",provenance:{}}],opportunities:[],runs:[],requiredSections:[...sections]});
  assert(!qa.passed,"missing provenance must block");
  assert(qa.checks.find((c)=>c.checkKey==="metric_provenance")?.status==="fail","expected provenance failure");
});

Deno.test("QA blocks numeric values on not-measurable metrics", () => {
  const qa=runReportQa({manifest,metrics:[{id:"m1",metric_key:"retention_rate",value_numeric:55,measurement_status:"not_measurable",evidence_classification:"CALCULATED",provenance:{reason:"bad"}}],opportunities:[],runs:[],requiredSections:[...sections]});
  assert(!qa.passed,"unsupported measured value must block");
});

Deno.test("QA blocks modelled money without assumptions", () => {
  const qa=runReportQa({manifest,metrics:[],opportunities:[{id:"o1",evidence_classification:"MODELLED",impact_low:100,impact_high:200,assumptions:{}}],runs:[],requiredSections:[...sections]});
  assert(!qa.passed,"modelled money without assumptions must block");
});

Deno.test("QA blocks critical engine failure but permits disclosed search coverage warning", () => {
  const failed=runReportQa({manifest,metrics:[],opportunities:[],runs:[{engine_key:"quality",status:"failed",error_code:"integrity"}],requiredSections:[...sections]});
  assert(!failed.passed,"critical engine failure must block");
  const partial=runReportQa({manifest,metrics:[],opportunities:[],runs:[{engine_key:"search_visibility",status:"partial",error_code:"provider_unavailable"}],requiredSections:[...sections]});
  assert(partial.passed,"noncritical search coverage warning may publish");
  assert(partial.checks.find((c)=>c.checkKey==="search_coverage")?.status==="warning","expected visible warning");
});

Deno.test("QA detects rendered values that disagree with canonical metrics", () => {
  const qa=runReportQa({manifest,metrics:[{id:"m1",metric_key:"recorded_payment_value",value_numeric:100,measurement_status:"measured",evidence_classification:"CALCULATED",provenance:{source:"x"}}],opportunities:[],runs:[],requiredSections:[...sections],renderedMetricValues:{m1:200}});
  assert(!qa.passed,"conflicting rendered value must block");
});
