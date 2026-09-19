import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuditReport } from "@/features/audit/components/AuditReport";
import { AuditRunTimeline } from "@/features/audit/components/AuditRunTimeline";
import { loadAuditBundle } from "@/features/audit/queries";
import type { AuditBundle } from "@/features/audit/types";

export const Route=createFileRoute("/_authenticated/audits/$auditId")({component:AuditPage,head:()=>({meta:[{title:"Audit — INKSIGHTS"}]})});

function AuditPage(){
  const {auditId}=Route.useParams(); const [data,setData]=useState<AuditBundle|null>(null); const [error,setError]=useState("");
  useEffect(()=>{loadAuditBundle(auditId).then(setData).catch(e=>setError(e instanceof Error?e.message:String(e)));},[auditId]);
  if(error) return <main className="min-h-screen bg-ink-deep p-8 text-red-200">{error}</main>;
  if(!data) return <main className="min-h-screen bg-ink-deep p-8 text-muted-foreground">Loading audit…</main>;
  const latest=data.reports[0];
  return <main className="min-h-screen bg-ink-deep px-5 py-8 text-foreground md:px-8"><div className="mx-auto max-w-[1500px]"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><Link to="/audits" className="rounded-full border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:text-mint">← Audits</Link><span className="text-xs text-muted-foreground">{data.studio.internal_validation?"INTERNAL VALIDATION":"CLIENT"}</span></div><div className="flex gap-2 text-xs"><span className="rounded-full border border-border bg-ink px-3 py-2 text-muted-foreground">Audit {data.audit.status}</span><span className="rounded-full border border-mint/30 bg-mint/10 px-3 py-2 font-bold text-mint">QA {data.audit.qa_status}</span>{latest?<span className="rounded-full border border-border bg-ink px-3 py-2 text-muted-foreground">Report v{latest.version} · {latest.status}</span>:null}</div></div>
  <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"><AuditReport data={data}/><aside className="xl:sticky xl:top-6 xl:self-start"><div className="rounded-3xl border border-border/60 bg-ink p-5"><p className="text-xs font-black uppercase tracking-[0.16em] text-mint">Run timeline</p><div className="mt-5"><AuditRunTimeline runs={data.runs}/></div></div></aside></div></div></main>;
}
