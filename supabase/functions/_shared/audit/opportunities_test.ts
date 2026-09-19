import { generateOpportunities, generateRecommendations, OPPORTUNITY_SCORE_VERSION, scoreOpportunity } from "./opportunities.ts";
import type { DiagnosisInput } from "./diagnosis.ts";

function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }

Deno.test("opportunity score uses bounded versioned components", () => {
  const score=scoreOpportunity({impact:100,confidence:100,ease:100,speed:100,costRisk:0});
  assert(score===100,"perfect bounded opportunity should score 100");
  const bounded=scoreOpportunity({impact:120,confidence:120,ease:120,speed:120,costRisk:-10});
  assert(bounded===100,"inputs must be bounded to 0-100");
});

Deno.test("opportunities retain scoring components and do not invent monetary impact", () => {
  const diagnoses:DiagnosisInput[]=[{title:"Historical client value is under-activated",statement:"Dormant cohort exists",constraintType:"client_reactivation",confidence:"MEDIUM",rank:1,findingKeys:["dormant_client_asset"]}];
  const opportunities=generateOpportunities(diagnoses);
  const opportunity=opportunities[0];
  assert(opportunity.scoreVersion===OPPORTUNITY_SCORE_VERSION,"expected score version");
  assert(typeof opportunity.overallScore==="number","expected score");
  assert(opportunity.impactLow===undefined&&opportunity.impactHigh===undefined,"monetary impact must remain absent without a model");
  assert(opportunity.evidenceClassification==="CALCULATED","expected calculated opportunity evidence");
});

Deno.test("recommendations are downstream of opportunities and phased", () => {
  const diagnoses:DiagnosisInput[]=[
    {title:"Historical client value is under-activated",statement:"Dormant cohort",constraintType:"client_reactivation",confidence:"MEDIUM",rank:1,findingKeys:["f1"]},
    {title:"Available operating capacity materially constrains interpretation",statement:"Capacity",constraintType:"capacity_context",confidence:"HIGH",rank:2,findingKeys:["f2"]},
  ];
  const opportunities=generateOpportunities(diagnoses);
  const recommendations=generateRecommendations(opportunities);
  assert(recommendations.length>=2,"expected actionable recommendations");
  for(const recommendation of recommendations){
    assert(opportunities.some((o)=>o.title===recommendation.opportunityTitle),"recommendation must link to an opportunity");
    assert(["0-30","31-60","61-90"].includes(recommendation.phase),"expected 90-day phase");
    assert(Boolean(recommendation.ownerRole),"owner role required");
  }
  assert(recommendations.some((r)=>r.phase==="31-60"),"capacity workflow should include a second phase");
});
