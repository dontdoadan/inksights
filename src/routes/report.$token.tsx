import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuditReport } from "@/features/audit/components/AuditReport";
import { loadPublishedReport } from "@/features/audit/queries";
import type { PublishedReportBundle } from "@/features/audit/types";

export const Route=createFileRoute("/report/$token")({component:PublishedReportPage,head:()=>({meta:[{title:"Studio Intelligence Audit — INKSIGHTS"},{name:"robots",content:"noindex,nofollow"}]})});

function PublishedReportPage(){
  const {token}=Route.useParams(); const [data,setData]=useState<PublishedReportBundle|null>(null); const [error,setError]=useState("");
  useEffect(()=>{loadPublishedReport(token).then(setData).catch(e=>setError(e instanceof Error?e.message:String(e)));},[token]);
  if(error) return <main className="min-h-screen bg-ink-deep px-5 py-20 text-center text-foreground"><div className="mx-auto max-w-xl rounded-3xl border border-border bg-ink p-8"><p className="text-xs font-black uppercase tracking-[0.18em] text-mint">INKSIGHTS</p><h1 className="mt-4 font-display text-3xl font-black text-ice">Report unavailable</h1><p className="mt-4 text-sm text-muted-foreground">This secure report link is invalid, unpublished or no longer available.</p></div></main>;
  if(!data) return <main className="min-h-screen bg-ink-deep p-8 text-muted-foreground">Loading secure report…</main>;
  return <main className="min-h-screen bg-ink-deep px-4 py-6 text-foreground md:px-8 md:py-10"><style>{`@media print{body{background:#fff!important}.report-actions{display:none!important}.audit-report{max-width:none!important}.audit-report section,.audit-report header{break-inside:avoid;background:#fff!important;color:#111!important;border-color:#ddd!important}.audit-report h1,.audit-report h2,.audit-report h3,.audit-report p,.audit-report span{color:#111!important}}`}</style><div className="report-actions mx-auto mb-5 flex max-w-6xl items-center justify-between gap-3 rounded-2xl border border-border/60 bg-ink px-4 py-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-mint">Secure INKSIGHTS report</p><p className="mt-1 text-xs text-muted-foreground">Report v{data.report.version} · QA {data.report.qa_status}</p></div><button onClick={()=>window.print()} className="rounded-full bg-mint px-4 py-2 text-xs font-black text-ink-deep">Print / Save PDF</button></div><AuditReport data={data} clientView/></main>;
}
