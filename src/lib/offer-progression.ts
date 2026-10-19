/**
 * The free Growth Check measures commercial scenarios, not search rankings.
 * Recommend the limited Visibility Fix only when the visitor also submitted
 * a relevant visibility self-assessment. Never turn self-reported gaps into
 * verified claims, and never imply that a paid fix guarantees bookings.
 */
export type GrowthCheckHandoff = {
  source?: string;
  visibilityScore?: string;
  weakestArea?: string;
  primaryOpportunity?: string;
};

export type NextCommercialStep = {
  offerSlug: "72-hour-visibility-fix" | "studio-intelligence-audit";
  name: string;
  price: string;
  reason: string;
  buttonLabel: string;
  evidenceNote: string;
};

const visibilityRelatedAreas = new Set(["local-discovery", "website", "trust", "conversion"]);

export function recommendNextCommercialStep(input: GrowthCheckHandoff): NextCommercialStep {
  const score = Number(input.visibilityScore);
  const eligibleSelfAssessment =
    input.source === "visibility-scorecard" &&
    visibilityRelatedAreas.has(input.weakestArea ?? "") &&
    typeof input.visibilityScore === "string" &&
    input.visibilityScore.trim() !== "" &&
    Number.isFinite(score) &&
    score < 85;

  if (eligibleSelfAssessment) {
    return {
      offerSlug: "72-hour-visibility-fix",
      name: "72-Hour Studio Visibility Fix",
      price: "£249 one-off",
      reason:
        "Your earlier visibility self-check flagged a possible public-facing weakness. A focused review can determine whether a small correction is appropriate before a wider commercial audit.",
      buttonLabel: "Check eligibility for the £249 fix",
      evidenceNote:
        "The visibility scorecard was self-reported; it does not verify a search-ranking problem or lost bookings. Scope and access must be confirmed before a fix is accepted.",
    };
  }

  return {
    offerSlug: "studio-intelligence-audit",
    name: "Studio Intelligence Audit",
    price: "£395 one-off",
    reason:
      "Your operating figures point to a broader commercial question. A structured audit can test the estimate against supporting evidence, identify the primary constraint and prioritise the next intervention.",
    buttonLabel: "Explore the £395 Intelligence Audit",
    evidenceNote:
      "The Growth Check estimate is modelled from self-reported figures. No uplift, leakage or return on investment has been verified.",
  };
}
