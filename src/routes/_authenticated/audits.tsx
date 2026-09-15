import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadAudits } from "@/features/audit/queries";
import type { Audit, Studio } from "@/features/audit/types";

export const Route=createFileRoute("/_authenticated/audits")({component:AuditsPage,head:()=>({meta:[{title:"Audits — INKSIGHTS"}]})});

function AuditsPage(){
  const [rows,setRows]=useState<Array<Audit & {studio?:Studio}>>([]); const [error,setError]=useState(""); const [loading,setLoading]=useState(true);
  useEffect(()=>{loadAudits().then(setRows).catch(e=>setError(e instanceof Error?e.message:String(e))).finally(()=>setLoading(false));},[]);
  return <main className="min-h-screen bg-ink-deep px-5 py-10 text-foreground md:px-8"><div className="mx-auto max-w-6xl"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-mint">INKSIGHTS · Internal</p><h1 className="mt-2 font-display text-4xl font-black text-ice">Studio Intelligence Audits</h1><p className="mt-3 text-sm text-muted-foreground">Canonical audit runs, QA status and report readiness.</p></div><Link to="/workspace" className="rounded-full border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:text-mint">Workspace</Link></div>
  <div className="mt-8 space-y-3">{loading?<p className="text-sm text-muted-foreground">Loading audits…</p>:null}{error?<p className="rounded-2xl border border-red-400/20 bg-red-400/[0.04] p-4 text-sm text-red-200">{error}</p>:null}{!loading&&!error&&!rows.length?<p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">No audits are visible for this account.</p>:rows.map(row=><Link key={row.id} to="/audits/$auditId" params={{auditId:row.id}} className="grid gap-4 rounded-2xl border border-border/60 bg-ink p-5 transition hover:border-mint/40 md:grid-cols-[1fr_auto]"><div><p className="font-display text-xl font-black text-ice">{row.studio?.name||row.studio_id}</p><p className="mt-2 text-xs text-muted-foreground">v{row.audit_version} · Mode {row.mode} · {row.status} · created {new Date(row.created_at).toLocaleDateString("en-GB")}</p></div><div className="flex items-center gap-2 text-xs"><span className="rounded-full border border-border bg-ink-deep px-3 py-1.5 text-muted-foreground">QA {row.qa_status}</span><span className="rounded-full border border-mint/20 bg-mint/[0.06] px-3 py-1.5 font-bold text-mint">{row.report_status}</span></div></Link>)}</div></div></main>;
}
