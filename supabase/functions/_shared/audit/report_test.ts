import { buildReportManifest, reportManifestContainsAuthoritativeValues } from "./report.ts";

function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }

Deno.test("report manifest references canonical record IDs without duplicating authoritative values", () => {
  const manifest=buildReportManifest({studioId:"s1",auditId:"a1",auditVersion:"1.1",periodStart:"2020-01-01",periodEnd:"2026-05-30",metricIds:["m1"],evidenceIds:["e1"],findingIds:["f1"],diagnosisIds:["d1"],opportunityIds:["o1"],recommendationIds:["r1"],coverageWarnings:["Search provider unavailable"]});
  assert(manifest.audit_id==="a1","audit id required");
  assert(manifest.sections.commercial_baseline_metric_ids[0]==="m1","metric reference required");
  assert(manifest.coverage_warnings.length===1,"coverage warning required");
  assert(!reportManifestContainsAuthoritativeValues(manifest),"manifest must not duplicate canonical numeric values or transaction rows");
});
