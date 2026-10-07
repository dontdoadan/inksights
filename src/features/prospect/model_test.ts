import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { buildAcquisitionSnapshot, deriveProspectFindings, scoreProspect, type ProspectEvidence, type ProspectIdentity } from "./model.ts";

const identity: ProspectIdentity = {
  studioId: "00000000-0000-4000-8000-000000000001",
  candidateId: "00000000-0000-4000-8000-000000000002",
  name: "Signal Tattoo",
  websiteUrl: "https://signaltattoo.example",
  location: "Croydon",
  postcode: "CR0 1AA",
  address: "1 Example Road, Croydon",
  gbpUrl: null,
  identityConfidence: 0.98,
  matchMethod: "exact_website",
};

const evidence: ProspectEvidence[] = [
  {
    id: "e1",
    evidence_type: "website_indexability",
    title: "Website indexability",
    summary: "No noindex directive observed.",
    classification: "OBSERVED",
    confidence: "HIGH",
    provenance: { noindex: false, source_reference: "https://signaltattoo.example" },
    observed_at: "2026-10-08T12:00:00Z",
  },
  {
    id: "e2",
    evidence_type: "website_metadata",
    title: "Website metadata",
    summary: "Title observed; meta description not observed.",
    classification: "OBSERVED",
    confidence: "HIGH",
    provenance: { title: "Signal Tattoo", meta_description: null, source_reference: "https://signaltattoo.example" },
    observed_at: "2026-10-08T12:00:00Z",
  },
  {
    id: "e3",
    evidence_type: "website_enquiry_path",
    title: "Enquiry path signals",
    summary: "Observed CTA types: mailto.",
    classification: "OBSERVED",
    confidence: "MEDIUM",
    provenance: { cta_types: ["mailto"], source_reference: "https://signaltattoo.example" },
    observed_at: "2026-10-08T12:00:00Z",
  },
  {
    id: "e4",
    evidence_type: "website_proof",
    title: "Portfolio/proof signals",
    summary: "No placeholder portfolio signal observed.",
    classification: "OBSERVED",
    confidence: "MEDIUM",
    provenance: { placeholder_portfolio: false, source_reference: "https://signaltattoo.example" },
    observed_at: "2026-10-08T12:00:00Z",
  },
  {
    id: "e5",
    evidence_type: "website_instrumentation",
    title: "Structured data and analytics signals",
    summary: "JSON-LD observed.",
    classification: "OBSERVED",
    confidence: "MEDIUM",
    provenance: { json_ld: true, analytics_signals: [] },
    observed_at: "2026-10-08T12:00:00Z",
  },
  ...["tattoo studio croydon", "tattoo artist croydon", "realism tattoo croydon", "custom tattoo croydon"].map((query, index) => ({
    id: `s${index + 1}`,
    evidence_type: "search_observation",
    title: `Search observation: ${query}`,
    summary: "The studio was not observed in the retained provider result set for this query.",
    classification: "OBSERVED" as const,
    confidence: "HIGH" as const,
    provenance: { query, source_provider: "brave", database: "brave_web_gb", observed_position: null },
    observed_at: "2026-10-08T12:05:00Z",
  })),
];

Deno.test("prospect model derives truthful public findings and prioritisation", () => {
  const findings = deriveProspectFindings(evidence);
  assert(findings.some((finding) => finding.key === "prospect_search_sample_gap"));
  assert(findings.some((finding) => finding.key === "prospect_enquiry_path"));
  assert(findings.some((finding) => finding.key === "prospect_metadata_gap"));

  const score = scoreProspect(identity, evidence, findings);
  assert(score.value >= 50);
  assert(score.priority !== "HOLD");
  assertEquals(score.version, "prospect-score-v1");
  assertEquals(score.weights.addressable_opportunity, 35);
});

Deno.test("prospect model holds outreach when evidence does not establish an opportunity", () => {
  const thinEvidence = evidence.slice(0, 1);
  const findings = deriveProspectFindings(thinEvidence);
  const score = scoreProspect(identity, thinEvidence, findings);
  assertEquals(findings[0].key, "prospect_insufficient_material_public_finding");
  assertEquals(score.priority, "HOLD");
  assertEquals(score.confidence, "LOW");
});

Deno.test("acquisition snapshot contains limits and never presents prospect score as revenue", () => {
  const findings = deriveProspectFindings(evidence);
  const score = scoreProspect(identity, evidence, findings);
  const snapshot = buildAcquisitionSnapshot(identity, score, findings, evidence, { price: "£395 one-off" }, "2026-10-08T13:00:00Z");
  assertEquals(snapshot.schema, "acquisition-snapshot/1.0");
  assert(snapshot.scope.publicEvidenceOnly);
  assert(snapshot.scope.limitations.some((line) => /lost revenue/i.test(line)));
  assert(snapshot.score.note.toLowerCase().includes("not an industry benchmark"));
  assertEquals(snapshot.cta.foundingValidationPrice, "£395 one-off");
});
