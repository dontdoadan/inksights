import type { AuditRun } from "../types";

const tone=(status:string)=>status==="success"?"text-mint":status==="failed"?"text-red-300":status==="partial"||status==="blocked"?"text-amber-300":"text-muted-foreground";
const stamp=(value:string|null)=>value?new Date(value).toLocaleString("en-GB",{dateStyle:"medium",timeStyle:"short"}):"—";

export function AuditRunTimeline({runs}:{runs:AuditRun[]}){
  if(!runs.length) return <p className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">No engine runs recorded yet.</p>;
  return <div className="space-y-3">{runs.map((run)=><div key={run.id} className="rounded-2xl border border-border/60 bg-ink-deep p-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-bold text-ice">{run.engine_key.replaceAll("_"," ")}</p><p className="mt-1 text-xs text-muted-foreground">{stamp(run.started_at)} → {stamp(run.completed_at)}</p></div><span className={`text-xs font-black uppercase tracking-[0.12em] ${tone(run.status)}`}>{run.status}</span></div>
    {run.error_message?<p className="mt-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.05] p-3 text-xs text-amber-100">{run.error_code?`${run.error_code}: `:""}{run.error_message}</p>:null}
    {Object.keys(run.output_summary??{}).length?<p className="mt-3 text-[11px] text-muted-foreground">Output: {Object.entries(run.output_summary).slice(0,4).map(([k,v])=>`${k}=${String(v)}`).join(" · ")}</p>:null}
  </div>)}</div>;
}
