export type EvidenceClass = "VERIFIED" | "OBSERVED" | "CALCULATED" | "MODELLED" | "HYPOTHESIS";
export type Confidence = "HIGH" | "MEDIUM" | "LOW";
export type Materiality = "low" | "medium" | "high" | "critical";
export type ProspectPriority = "A" | "B" | "C" | "HOLD";

export type ProspectEvidence = {
  id: string;
  evidence_type: string;
  title: string;
  summary: string;
  classification: EvidenceClass;
  confidence: Confidence;
  provenance: Record<string, unknown>;
  observed_at: string | null;
};

export type ProspectIdentity = {
  studioId: string;
  candidateId: string;
  name: string;
  websiteUrl: string;
  location: string | null;
  postcode: string | null;
  address: string | null;
  gbpUrl: string | null;
  identityConfidence: number;
  matchMethod: "exact_website" | "exact_postcode_name" | "manual_review";
  contactName?: string | null;
  contactEmail?: string | null;
};

export type DerivedProspectFinding = {
  key: string;
  title: string;
  statement: string;
  potentialImplication: string;
  category: "search_visibility" | "website_conversion" | "website_discoverability" | "competitive_presence" | "evidence_readiness";
  classification: EvidenceClass;
  confidence: Confidence;
  materiality: Materiality;
  evidenceIds: string[];
};

export type ProspectScoreFactors = {
  evidence_readiness: number;
  addressable_opportunity: number;
  inksights_fit: number;
  public_maturity_signal: number;
  contactability: number;
};

export type ProspectScore = {
  version: "prospect-score-v1";
  value: number;
  priority: ProspectPriority;
  confidence: Confidence;
  factors: ProspectScoreFactors;
  weights: ProspectScoreFactors;
  qualificationReason: string;
};

export type AcquisitionSnapshot = {
  schema: "acquisition-snapshot/1.0";
  studio: {
    name: string;
    website: string;
    location: string | null;
  };
  generatedAt: string;
  score: {
    value: number;
    priority: ProspectPriority;
    confidence: Confidence;
    label: "INKSIGHTS prospect priority";
    note: string;
  };
  findings: Array<{
    title: string;
    observation: string;
    potentialImplication: string;
    classification: EvidenceClass;
    confidence: Confidence;
    evidence: Array<{
      id: string;
      title: string;
      summary: string;
      observedAt: string | null;
      sourceProvider: string | null;
    }>;
  }>;
  scope: {
    publicEvidenceOnly: true;
    searchScope: string;
    limitations: string[];
  };
  cta: {
    title: string;
    body: string;
    offer: "Studio Intelligence Audit";
    foundingValidationPrice: string;
  };
};

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

function asArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function asNumber(value: unknown): number | null {
  const result = Number(value);
  return Number.isFinite(result) ? result : null;
}

function evidenceOf(evidence: ProspectEvidence[], type: string) {
  return evidence.filter((item) => item.evidence_type === type);
}

export function deriveProspectFindings(evidence: ProspectEvidence[]): DerivedProspectFinding[] {
  const findings: DerivedProspectFinding[] = [];
  const indexability = evidenceOf(evidence, "website_indexability")[0];
  const metadata = evidenceOf(evidence, "website_metadata")[0];
  const enquiry = evidenceOf(evidence, "website_enquiry_path")[0];
  const proof = evidenceOf(evidence, "website_proof")[0];
  const search = evidenceOf(evidence, "search_observation");
  const competitors = evidenceOf(evidence, "competitor_observation");

  if (indexability?.provenance["noindex"] === true) {
    findings.push({
      key: "prospect_website_noindex",
      title: "The inspected page is marked noindex",
      statement: "The observed page tells compliant search engines not to index it.",
      potentialImplication: "If this directive is unintended on an important discovery page, relevant search demand may be unable to reach the studio through that page.",
      category: "website_discoverability",
      classification: "OBSERVED",
      confidence: "HIGH",
      materiality: "high",
      evidenceIds: [indexability.id],
    });
  }

  if (proof?.provenance["placeholder_portfolio"] === true) {
    findings.push({
      key: "prospect_placeholder_proof",
      title: "Placeholder portfolio language was observed",
      statement: "The inspected website contains a configured placeholder portfolio signal rather than complete proof of work.",
      potentialImplication: "Prospective clients may have less evidence to judge fit, style and trust before making an enquiry.",
      category: "website_conversion",
      classification: "OBSERVED",
      confidence: "MEDIUM",
      materiality: "high",
      evidenceIds: [proof.id],
    });
  }

  if (enquiry) {
    const ctas = asArray(enquiry.provenance["cta_types"]);
    const structured = ctas.includes("form") || ctas.includes("whatsapp");
    if (!structured && (ctas.length === 0 || ctas.includes("mailto") || ctas.includes("telephone"))) {
      findings.push({
        key: "prospect_enquiry_path",
        title: "A structured enquiry route was not observed",
        statement: ctas.length
          ? `The inspected page exposed ${ctas.join(", ")} contact signals, but no structured form or WhatsApp enquiry route was observed.`
          : "No supported enquiry CTA type was observed on the inspected page.",
        potentialImplication: "A less structured enquiry path can make qualification, response tracking and conversion measurement harder.",
        category: "website_conversion",
        classification: "OBSERVED",
        confidence: "MEDIUM",
        materiality: "medium",
        evidenceIds: [enquiry.id],
      });
    }
  }

  if (metadata) {
    const title = String(metadata.provenance["title"] ?? "").trim();
    const description = String(metadata.provenance["meta_description"] ?? "").trim();
    if (!title || !description) {
      findings.push({
        key: "prospect_metadata_gap",
        title: "Core homepage metadata is incomplete",
        statement: `The inspected page had ${title ? "a title" : "no observed title"} and ${description ? "a meta description" : "no observed meta description"}.`,
        potentialImplication: "Incomplete metadata can reduce how clearly the studio communicates relevance when the page is discovered in search or shared.",
        category: "website_discoverability",
        classification: "OBSERVED",
        confidence: "HIGH",
        materiality: "medium",
        evidenceIds: [metadata.id],
      });
    }
  }

  if (search.length >= 2) {
    const missing = search.filter((item) => item.provenance["observed_position"] == null);
    const missingRate = missing.length / search.length;
    if (missing.length >= 2 && missingRate >= 0.5) {
      findings.push({
        key: "prospect_search_sample_gap",
        title: "The studio was absent from much of the sampled search set",
        statement: `The studio was not observed in the retained provider result set for ${missing.length} of ${search.length} sampled studio-relevant searches.`,
        potentialImplication: "People using similar searches may encounter other domains before this studio. This is a provider-scoped observation, not a Google ranking or a measurement of monthly demand.",
        category: "search_visibility",
        classification: "OBSERVED",
        confidence: "HIGH",
        materiality: missingRate >= 0.67 ? "high" : "medium",
        evidenceIds: missing.slice(0, 5).map((item) => item.id),
      });
    }
  }

  const recurring = competitors
    .map((item) => ({
      item,
      overlap: asNumber(item.provenance["query_overlap"]) ?? 0,
    }))
    .filter(({ overlap }) => overlap >= 2)
    .sort((a, b) => b.overlap - a.overlap);

  if (recurring.length) {
    const top = recurring.slice(0, 3);
    findings.push({
      key: "prospect_competing_domains",
      title: "Recurring competing domains were observed",
      statement: `${top.length} domain${top.length === 1 ? "" : "s"} repeatedly appeared across the bounded search sample: ${top.map(({ item }) => String(item.provenance["domain"] ?? item.title)).join(", ")}.`,
      potentialImplication: "Repeated competing-result presence is a useful signal for deeper market and positioning analysis, but each domain still requires entity QA before being described as a direct tattoo-studio competitor.",
      category: "competitive_presence",
      classification: "OBSERVED",
      confidence: "MEDIUM",
      materiality: "medium",
      evidenceIds: top.map(({ item }) => item.id),
    });
  }

  if (!findings.length) {
    const supporting = [...evidence].slice(0, 3).map((item) => item.id);
    findings.push({
      key: "prospect_insufficient_material_public_finding",
      title: "The bounded public scan did not establish a material constraint",
      statement: "The current public evidence does not support a strong acquisition or commercial diagnosis.",
      potentialImplication: "The prospect should not be approached with a manufactured problem. A deeper Studio Intelligence Audit would require additional evidence before making a stronger claim.",
      category: "evidence_readiness",
      classification: "OBSERVED",
      confidence: "MEDIUM",
      materiality: "low",
      evidenceIds: supporting,
    });
  }

  return findings;
}

function materialityScore(materiality: Materiality): number {
  if (materiality === "critical") return 100;
  if (materiality === "high") return 85;
  if (materiality === "medium") return 60;
  return 30;
}

function confidenceFactor(confidence: Confidence): number {
  if (confidence === "HIGH") return 1;
  if (confidence === "MEDIUM") return 0.72;
  return 0.45;
}

export function scoreProspect(
  identity: ProspectIdentity,
  evidence: ProspectEvidence[],
  findings: DerivedProspectFinding[],
): ProspectScore {
  const websiteEvidence = evidence.filter((item) => item.evidence_type.startsWith("website_"));
  const searchEvidence = evidenceOf(evidence, "search_observation");
  const enquiry = evidenceOf(evidence, "website_enquiry_path")[0];
  const metadata = evidenceOf(evidence, "website_metadata")[0];
  const instrumentation = evidenceOf(evidence, "website_instrumentation")[0];
  const ctas = asArray(enquiry?.provenance["cta_types"]);

  const evidenceReadiness = clamp(
    identity.identityConfidence * 30 +
      (websiteEvidence.length >= 4 ? 30 : websiteEvidence.length >= 2 ? 20 : websiteEvidence.length ? 10 : 0) +
      (searchEvidence.length >= 4 ? 30 : searchEvidence.length >= 2 ? 20 : searchEvidence.length ? 10 : 0) +
      (identity.location || identity.postcode || identity.address ? 10 : 0),
  );

  const actionable = findings.filter((item) => item.key !== "prospect_insufficient_material_public_finding");
  const topFindingScores = actionable
    .map((item) => materialityScore(item.materiality) * confidenceFactor(item.confidence))
    .sort((a, b) => b - a)
    .slice(0, 3);
  const addressableOpportunity = clamp(
    topFindingScores.length ? topFindingScores.reduce((sum, value) => sum + value, 0) / topFindingScores.length : 20,
  );

  const inksightsFit = clamp(
    actionable.some((item) => item.category === "search_visibility" || item.category === "competitive_presence")
      ? 95
      : actionable.some((item) => item.category.startsWith("website_"))
        ? 85
        : 45,
  );

  const metadataComplete = Boolean(
    String(metadata?.provenance["title"] ?? "").trim() &&
      String(metadata?.provenance["meta_description"] ?? "").trim(),
  );
  const analyticsSignals = asArray(instrumentation?.provenance["analytics_signals"]);
  const hasJsonLd = instrumentation?.provenance["json_ld"] === true;
  const publicMaturitySignal = clamp(
    40 +
      (metadataComplete ? 20 : 0) +
      (ctas.includes("form") || ctas.includes("whatsapp") ? 20 : ctas.length ? 10 : 0) +
      (hasJsonLd || analyticsSignals.length ? 20 : 0),
  );

  const contactability = clamp(
    identity.contactEmail
      ? 100
      : ctas.includes("form") || ctas.includes("whatsapp")
        ? 80
        : ctas.includes("mailto")
          ? 65
          : ctas.includes("telephone")
            ? 50
            : 20,
  );

  const weights: ProspectScoreFactors = {
    evidence_readiness: 25,
    addressable_opportunity: 35,
    inksights_fit: 20,
    public_maturity_signal: 10,
    contactability: 10,
  };
  const factors: ProspectScoreFactors = {
    evidence_readiness: evidenceReadiness,
    addressable_opportunity: addressableOpportunity,
    inksights_fit: inksightsFit,
    public_maturity_signal: publicMaturitySignal,
    contactability,
  };

  const value = clamp(
    factors.evidence_readiness * 0.25 +
      factors.addressable_opportunity * 0.35 +
      factors.inksights_fit * 0.2 +
      factors.public_maturity_signal * 0.1 +
      factors.contactability * 0.1,
  );

  const insufficient = evidenceReadiness < 50 || actionable.length === 0;
  const priority: ProspectPriority = insufficient
    ? "HOLD"
    : value >= 80
      ? "A"
      : value >= 65
        ? "B"
        : value >= 50
          ? "C"
          : "HOLD";
  const confidence: Confidence = evidenceReadiness >= 75 ? "HIGH" : evidenceReadiness >= 50 ? "MEDIUM" : "LOW";

  return {
    version: "prospect-score-v1",
    value,
    priority,
    confidence,
    factors,
    weights,
    qualificationReason: insufficient
      ? "Evidence readiness or observable opportunity is insufficient for confident outbound."
      : `Priority ${priority} reflects public evidence readiness, addressable opportunity, INKSIGHTS fit, public maturity signals and contactability. It is not a revenue forecast.`,
  };
}

export function buildAcquisitionSnapshot(
  identity: ProspectIdentity,
  score: ProspectScore,
  findings: DerivedProspectFinding[],
  evidence: ProspectEvidence[],
  offer: { price: string },
  generatedAt = new Date().toISOString(),
): AcquisitionSnapshot {
  const evidenceById = new Map(evidence.map((item) => [item.id, item]));
  const selected = findings
    .filter((item) => item.key !== "prospect_insufficient_material_public_finding")
    .slice(0, 3);

  const snapshotFindings = (selected.length ? selected : findings.slice(0, 1)).map((finding) => ({
    title: finding.title,
    observation: finding.statement,
    potentialImplication: finding.potentialImplication,
    classification: finding.classification,
    confidence: finding.confidence,
    evidence: finding.evidenceIds
      .map((id) => evidenceById.get(id))
      .filter((item): item is ProspectEvidence => Boolean(item))
      .map((item) => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        observedAt: item.observed_at,
        sourceProvider:
          typeof item.provenance["source_provider"] === "string"
            ? item.provenance["source_provider"]
            : typeof item.provenance["source_reference"] === "string"
              ? "studio_website"
              : null,
      })),
  }));

  const searchProviders = [...new Set(
    evidenceOf(evidence, "search_observation")
      .map((item) => item.provenance["source_provider"])
      .filter((item): item is string => typeof item === "string"),
  )];

  return {
    schema: "acquisition-snapshot/1.0",
    studio: {
      name: identity.name,
      website: identity.websiteUrl,
      location: identity.location,
    },
    generatedAt,
    score: {
      value: score.value,
      priority: score.priority,
      confidence: score.confidence,
      label: "INKSIGHTS prospect priority",
      note: "Internal prioritisation index derived from observed public evidence. It is not an industry benchmark, revenue forecast or client performance score.",
    },
    findings: snapshotFindings,
    scope: {
      publicEvidenceOnly: true,
      searchScope: searchProviders.length
        ? `Bounded provider-scoped web observations: ${searchProviders.join(", ")}. These are not relabelled as Google rankings unless the source explicitly supports that claim.`
        : "No reliable external search observation was available during this scan.",
      limitations: [
        "This snapshot uses public evidence only and does not include the studio's booking, revenue, capacity or retention data.",
        "No monthly search volume, lost revenue or ROI is claimed unless independently measured.",
        "Observed competing domains require entity verification before they are treated as direct business competitors.",
        "A full Studio Intelligence Audit may confirm, reject or reprioritise these preliminary observations.",
      ],
    },
    cta: {
      title: "This is the snapshot. The full audit goes further.",
      body: "The Studio Intelligence Audit connects the strongest available evidence into a prioritised diagnosis and action plan, then identifies what should be measured next.",
      offer: "Studio Intelligence Audit",
      foundingValidationPrice: offer.price,
    },
  };
}
