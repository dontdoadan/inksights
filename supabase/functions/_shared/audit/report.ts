export type ReportManifestInput = {
  studioId: string;
  auditId: string;
  auditVersion: string;
  periodStart: string | null;
  periodEnd: string | null;
  metricIds: string[];
  evidenceIds: string[];
  findingIds: string[];
  diagnosisIds: string[];
  opportunityIds: string[];
  recommendationIds: string[];
  coverageWarnings: string[];
};

export type GoldenAuditReportManifest = {
  schema: "golden-audit-report-manifest-v1";
  studio_id: string;
  audit_id: string;
  audit_version: string;
  reporting_period: { start: string | null; end: string | null };
  sections: {
    commercial_baseline_metric_ids: string[];
    evidence_ids: string[];
    finding_ids: string[];
    diagnosis_ids: string[];
    opportunity_ids: string[];
    recommendation_ids: string[];
  };
  coverage_warnings: string[];
};

export function buildReportManifest(input: ReportManifestInput): GoldenAuditReportManifest {
  return {
    schema: "golden-audit-report-manifest-v1",
    studio_id: input.studioId,
    audit_id: input.auditId,
    audit_version: input.auditVersion,
    reporting_period: { start: input.periodStart, end: input.periodEnd },
    sections: {
      commercial_baseline_metric_ids: [...input.metricIds],
      evidence_ids: [...input.evidenceIds],
      finding_ids: [...input.findingIds],
      diagnosis_ids: [...input.diagnosisIds],
      opportunity_ids: [...input.opportunityIds],
      recommendation_ids: [...input.recommendationIds],
    },
    coverage_warnings: [...input.coverageWarnings],
  };
}

export function reportManifestContainsAuthoritativeValues(manifest: GoldenAuditReportManifest): boolean {
  const text = JSON.stringify(manifest);
  return /"value_numeric"|"amount_pence"|"metric_value"|"transaction_date"/.test(text);
}
