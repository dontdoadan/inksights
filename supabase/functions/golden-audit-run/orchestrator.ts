export type AuditMode = "A" | "B" | "C";
export type StepStatus = "success" | "partial" | "failed" | "blocked" | "skipped";

export type AuditStepKey =
  | "quality"
  | "transaction_metrics"
  | "website"
  | "search_visibility"
  | "findings"
  | "diagnosis"
  | "opportunities"
  | "recommendations"
  | "report_manifest"
  | "qa";

export type AuditSnapshot = {
  id: string;
  mode: AuditMode;
  sourceTypes: string[];
};

export type StepResult = {
  status: StepStatus;
  output?: Record<string, unknown>;
  warning?: string;
  errorCode?: string;
};

export type AuditDependencies = {
  loadAudit(auditId: string): Promise<AuditSnapshot>;
  lockAudit(auditId: string): Promise<boolean>;
  runStep(audit: AuditSnapshot, step: AuditStepKey): Promise<StepResult>;
  markAuditStatus(auditId: string, status: "failed" | "diagnosing" | "reporting" | "qa" | "completed"): Promise<void>;
};

export type AuditRunResult = {
  auditId: string;
  status: "completed" | "failed" | "already_running";
  steps: Array<{ key: AuditStepKey; result: StepResult }>;
  coverageWarnings: string[];
};

const ORDER: AuditStepKey[] = [
  "quality",
  "transaction_metrics",
  "website",
  "search_visibility",
  "findings",
  "diagnosis",
  "opportunities",
  "recommendations",
  "report_manifest",
  "qa",
];

const CRITICAL = new Set<AuditStepKey>([
  "quality",
  "transaction_metrics",
  "findings",
  "diagnosis",
  "opportunities",
  "recommendations",
  "report_manifest",
  "qa",
]);

function applicable(audit: AuditSnapshot, step: AuditStepKey): boolean {
  const hasTransactions = audit.sourceTypes.includes("transaction_ledger");
  if (step === "quality" || step === "transaction_metrics") return hasTransactions;
  return true;
}

export async function runAudit(auditId: string, deps: AuditDependencies): Promise<AuditRunResult> {
  const audit = await deps.loadAudit(auditId);
  const locked = await deps.lockAudit(auditId);
  if (!locked) return { auditId, status: "already_running", steps: [], coverageWarnings: [] };

  const steps: AuditRunResult["steps"] = [];
  const coverageWarnings: string[] = [];

  for (const step of ORDER) {
    if (!applicable(audit, step)) {
      steps.push({ key: step, result: { status: "skipped", output: { reason: "source_not_available" } } });
      continue;
    }

    if (step === "diagnosis") await deps.markAuditStatus(auditId, "diagnosing");
    if (step === "report_manifest") await deps.markAuditStatus(auditId, "reporting");
    if (step === "qa") await deps.markAuditStatus(auditId, "qa");

    let result: StepResult;
    try {
      result = await deps.runStep(audit, step);
    } catch (error) {
      result = {
        status: "failed",
        errorCode: error instanceof Error ? error.message.slice(0, 120) : "step_failed",
      };
    }
    steps.push({ key: step, result });

    if (result.warning) coverageWarnings.push(`${step}: ${result.warning}`);
    if (result.status === "partial" || result.status === "blocked") {
      coverageWarnings.push(`${step}: ${result.errorCode ?? result.status}`);
    }
    if (result.status === "failed" && CRITICAL.has(step)) {
      await deps.markAuditStatus(auditId, "failed");
      return { auditId, status: "failed", steps, coverageWarnings };
    }
    if (result.status === "failed" && !CRITICAL.has(step)) {
      coverageWarnings.push(`${step}: ${result.errorCode ?? "non_critical_failure"}`);
    }
  }

  const qa = steps.find((entry) => entry.key === "qa")?.result;
  if (!qa || qa.status !== "success") {
    await deps.markAuditStatus(auditId, "failed");
    return { auditId, status: "failed", steps, coverageWarnings };
  }

  await deps.markAuditStatus(auditId, "completed");
  return { auditId, status: "completed", steps, coverageWarnings };
}
