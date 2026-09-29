import type { Confidence, EvidenceClassification } from "./metrics.ts";
import type { DiagnosisInput } from "./diagnosis.ts";

export const OPPORTUNITY_SCORE_VERSION = "opportunity-score-v1";

export type OpportunityInput = {
  diagnosisTitle: string;
  diagnosisConstraintType: string;
  title: string;
  mechanism: string;
  impactScore: number;
  confidenceScore: number;
  easeScore: number;
  speedScore: number;
  costRiskScore: number;
  overallScore: number;
  scoreVersion: string;
  impactLow?: number;
  impactHigh?: number;
  impactUnit?: string;
  evidenceClassification: EvidenceClassification;
  confidence: Confidence;
  assumptions: string[];
};

export type RecommendationInput = {
  opportunityTitle: string;
  title: string;
  rationale: string;
  action: string;
  ownerRole: string;
  targetMetricKey?: string;
  priority: number;
  sequence: number;
  phase: "0-30" | "31-60" | "61-90";
};

function bound(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function scoreOpportunity(x: { impact: number; confidence: number; ease: number; speed: number; costRisk: number }): number {
  return Math.round(
    bound(x.impact) * 0.35 +
    bound(x.confidence) * 0.25 +
    bound(x.ease) * 0.15 +
    bound(x.speed) * 0.15 +
    (100 - bound(x.costRisk)) * 0.10,
  );
}

function confidenceScore(confidence: Confidence): number {
  return confidence === "HIGH" ? 90 : confidence === "MEDIUM" ? 70 : 45;
}

export function generateOpportunities(diagnoses: DiagnosisInput[]): OpportunityInput[] {
  const opportunities: OpportunityInput[] = [];
  for (const diagnosis of diagnoses) {
    if (diagnosis.constraintType === "client_reactivation") {
      const parts = { impact: 75, confidence: confidenceScore(diagnosis.confidence), ease: 80, speed: 85, costRisk: 20 };
      opportunities.push({
        diagnosisTitle: diagnosis.title,
        diagnosisConstraintType: diagnosis.constraintType,
        title: "Reactivate the existing client asset",
        mechanism: "Prioritise previously monetised clients for permission-aware, personalised project reactivation before increasing cold acquisition spend.",
        impactScore: parts.impact,
        confidenceScore: parts.confidence,
        easeScore: parts.ease,
        speedScore: parts.speed,
        costRiskScore: parts.costRisk,
        overallScore: scoreOpportunity(parts),
        scoreVersion: OPPORTUNITY_SCORE_VERSION,
        evidenceClassification: "CALCULATED",
        confidence: diagnosis.confidence,
        assumptions: ["Contactability and lawful communication permissions must be verified before outreach.", "No monetary uplift is claimed until an intervention is measured."],
      });
    }
    if (diagnosis.constraintType === "digital_acquisition_readiness") {
      const parts = { impact: 70, confidence: confidenceScore(diagnosis.confidence), ease: 65, speed: 70, costRisk: 25 };
      opportunities.push({
        diagnosisTitle: diagnosis.title,
        diagnosisConstraintType: diagnosis.constraintType,
        title: "Make the acquisition journey measurable before scaling traffic",
        mechanism: "Restore indexability when appropriate, replace placeholder proof and implement a structured enquiry path with conversion instrumentation.",
        impactScore: parts.impact,
        confidenceScore: parts.confidence,
        easeScore: parts.ease,
        speedScore: parts.speed,
        costRiskScore: parts.costRisk,
        overallScore: scoreOpportunity(parts),
        scoreVersion: OPPORTUNITY_SCORE_VERSION,
        evidenceClassification: "OBSERVED",
        confidence: diagnosis.confidence,
        assumptions: ["Changes should be verified against the current live website before implementation.", "Traffic should not be materially scaled before enquiry instrumentation is working."],
      });
    }
    if (diagnosis.constraintType === "capacity_context") {
      const parts = { impact: 85, confidence: confidenceScore(diagnosis.confidence), ease: 45, speed: 45, costRisk: 35 };
      opportunities.push({
        diagnosisTitle: diagnosis.title,
        diagnosisConstraintType: diagnosis.constraintType,
        title: "Align demand generation with real delivery capacity",
        mechanism: "Define the amount and timing of future bookable capacity before setting acquisition targets, then use deposits/waitlist scheduling to sell future capacity rather than creating unserviceable immediate demand.",
        impactScore: parts.impact,
        confidenceScore: parts.confidence,
        easeScore: parts.ease,
        speedScore: parts.speed,
        costRiskScore: parts.costRisk,
        overallScore: scoreOpportunity(parts),
        scoreVersion: OPPORTUNITY_SCORE_VERSION,
        evidenceClassification: "VERIFIED",
        confidence: diagnosis.confidence,
        assumptions: ["Available capacity is a business constraint, not a demand metric.", "Capacity targets must be supplied or measured before utilisation can be calculated."],
      });
    }
  }
  return opportunities.sort((a, b) => b.overallScore - a.overallScore);
}

export function generateRecommendations(opportunities: OpportunityInput[]): RecommendationInput[] {
  const sorted = [...opportunities].sort((a, b) => b.overallScore - a.overallScore);
  return sorted.flatMap((opportunity, index) => {
    const priority = index + 1;
    if (opportunity.diagnosisConstraintType === "client_reactivation") {
      return [{ opportunityTitle: opportunity.title, title: "Build and run a measured client-reactivation intervention", rationale: "The dormant-client metric identifies an existing monetised audience, but value must be proven through actual responses, deposits and revenue rather than inferred from historic spend.", action: "Verify contactability and permissions, segment the dormant cohort by recency/value, launch a small personalised reactivation batch, and track contacted → response → qualified project → deposit → realised revenue.", ownerRole: "studio_owner", targetMetricKey: "reactivation_deposit_conversion", priority, sequence: priority, phase: "0-30" as const }];
    }
    if (opportunity.diagnosisConstraintType === "digital_acquisition_readiness") {
      return [{ opportunityTitle: opportunity.title, title: "Repair the digital proof and enquiry measurement layer", rationale: "The observed website currently weakens discoverability, proof and funnel measurement, so additional traffic would be difficult to evaluate or optimise.", action: "Resolve intentional/unintentional noindex, replace placeholder portfolio content, add a structured enquiry form, and instrument enquiry submission as a measurable event before scaling paid acquisition.", ownerRole: "studio_owner", targetMetricKey: "qualified_enquiries", priority, sequence: priority, phase: "0-30" as const }];
    }
    if (opportunity.diagnosisConstraintType === "capacity_context") {
      return [
        { opportunityTitle: opportunity.title, title: "Define the capacity envelope", rationale: "Revenue trends cannot be interpreted or acquisition targets set accurately without a realistic view of bookable future delivery capacity.", action: "Document bookable days/hours for the next 90 days and the amount of future work that can be accepted without compromising delivery.", ownerRole: "studio_owner", targetMetricKey: "available_capacity", priority, sequence: priority, phase: "0-30" as const },
        { opportunityTitle: opportunity.title, title: "Match future deposits to available capacity", rationale: "Once capacity is explicit, demand can be sold into future dates without treating immediate tattooing availability as unlimited.", action: "Use consultation/deposit/waitlist rules to sell future capacity within the defined envelope and review booked-vs-available capacity monthly.", ownerRole: "studio_owner", targetMetricKey: "booked_capacity", priority, sequence: priority + 10, phase: "31-60" as const },
      ];
    }
    return [];
  }).sort((a, b) => a.sequence - b.sequence);
}
