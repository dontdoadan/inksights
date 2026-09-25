import { runAudit, type AuditDependencies, type AuditStepKey } from "./orchestrator.ts";

function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }

function deps(overrides: Partial<AuditDependencies> = {}, sourceTypes = ["transaction_ledger"]): AuditDependencies & { calls: string[]; statuses: string[] } {
  const calls: string[] = []; const statuses: string[] = [];
  return {
    calls, statuses,
    async loadAudit(id) { return { id, mode: "B", sourceTypes }; },
    async lockAudit() { return true; },
    async runStep(_audit, step) { calls.push(step); return { status: "success" }; },
    async markAuditStatus(_id, status) { statuses.push(status); },
    ...overrides,
  };
}

Deno.test("orchestrator preserves dependency order", async () => {
  const d=deps(); const result=await runAudit("audit-1",d);
  assert(result.status==="completed","expected completion");
  const expected:AuditStepKey[]=["quality","transaction_metrics","website","search_visibility","findings","diagnosis","opportunities","recommendations","report_manifest","qa"];
  assert(JSON.stringify(d.calls)===JSON.stringify(expected),`unexpected order ${d.calls.join(",")}`);
  assert(d.calls.indexOf("diagnosis")>d.calls.indexOf("findings"),"diagnosis must follow findings");
  assert(d.calls.indexOf("report_manifest")>d.calls.indexOf("recommendations"),"report must follow recommendations");
});

Deno.test("critical transaction integrity failure blocks report", async () => {
  const d=deps({ async runStep(_audit,step){ d.calls.push(step); return step==="quality"?{status:"failed",errorCode:"transaction_integrity"}:{status:"success"}; } });
  const result=await runAudit("audit-2",d);
  assert(result.status==="failed","critical failure must fail audit");
  assert(!d.calls.includes("report_manifest"),"report must not run after critical failure");
  assert(d.statuses.at(-1)==="failed","audit must be marked failed");
});

Deno.test("non-critical search failure degrades to coverage warning and continues", async () => {
  const d=deps({ async runStep(_audit,step){ d.calls.push(step); return step==="search_visibility"?{status:"failed",errorCode:"provider_unavailable"}:{status:"success"}; } });
  const result=await runAudit("audit-3",d);
  assert(result.status==="completed","search failure should not block otherwise valid audit");
  assert(result.coverageWarnings.some((w)=>w.includes("search_visibility")),"coverage warning required");
  assert(d.calls.includes("report_manifest")&&d.calls.includes("qa"),"pipeline should continue to report and QA");
});

Deno.test("mode B transactions-only skips fake transaction-independent source engines only when explicitly non-applicable", async () => {
  const d=deps({},["website_snapshot"]); const result=await runAudit("audit-4",d);
  assert(result.steps.find((s)=>s.key==="quality")?.result.status==="skipped","quality should skip without transaction source");
  assert(result.steps.find((s)=>s.key==="transaction_metrics")?.result.status==="skipped","transaction metrics should skip without transaction source");
  assert(!d.calls.includes("quality")&&!d.calls.includes("transaction_metrics"),"skipped engines must not execute");
});

Deno.test("concurrent active audit does not execute engines", async () => {
  const d=deps({ async lockAudit(){ return false; } }); const result=await runAudit("audit-5",d);
  assert(result.status==="already_running","expected lock result");
  assert(d.calls.length===0,"no engines may run without lock");
});
