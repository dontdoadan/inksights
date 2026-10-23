// INKSIGHTS journey materialised view: pure projection, no database access.
// Newer observations supersede displays, but never mutate stored source records.
import { VERSION, STAGES } from "./journey-policy.mjs";

export function projectJourneyHistory(rows) {
  const history = {};
  const sorted = [...rows].sort((a,b) =>
    a.submitted_at === b.submitted_at
      ? String(a.submission_id || "").localeCompare(String(b.submission_id || ""))
      : String(a.submitted_at).localeCompare(String(b.submitted_at)));
  for (const row of sorted) {
    const submission = row.submission, stage = row.stage;
    if (!submission || !STAGES.includes(stage)) continue;
    const inputs = submission.normalized_inputs;
    if (inputs?.step !== stage || inputs?.calculation_version !== VERSION) continue;
    if (stage === "growth") {
      delete history.revenue;
      delete history.visibility;
      delete history.summary;
    }
    if (stage === "revenue" || stage === "visibility") delete history.summary;
    history[stage] = {
      normalized: inputs.answer,
      result: submission.result_snapshot,
      submissionId: submission.id,
      submittedAt: row.submitted_at,
    };
  }
  return history;
}
