import type { ReactNode } from "react";
import { EvidenceBadge } from "./EvidenceBadge";
import type { AuditBundle, Finding, Metric, PublishedReportBundle } from "../types";

type ReportData = AuditBundle | PublishedReportBundle;
const money=(value:number|null|undefined)=>typeof value==="number"?new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(value/100):"—";
const number=(value:number|null|undefined)=>typeof value==="number"?new Intl.NumberFormat("en-GB",{maximumFractionDigits:1}).format(value):"—";
const valueFor=(m:Metric)=>m.measurement_status==="not_measurable"?"Not measurable":m.unit==="GBP_pence"?money(m.value_numeric):m.unit==="percent"?`${number(m.value_numeric)}%`:m.value_numeric!=null?number(m.value_numeric):m.value_text||"—";

function coverageWarnings(data:ReportData):string[]{
  if(!("report" in data)) return [];
  const raw=data.report.manifest["coverage_warnings"];
  return Array.isArray(raw)?raw.filter((item):item is string=>typeof item==="string"):[];
}

function modelledImpact(low:number|null,high:number|null,unit:string|null){
  if(low==null&&high==null) return null;
  if(unit==="GBP_pence") return `${money(low)}${high!=null?` – ${money(high)}`:""}`;
  const left=low==null?"—":number(low); const right=high==null?"":` – ${number(high)}`;
  return `${left}${right}${unit?` ${unit}`:""}`;
}

export function AuditReport({data,clientView=false}:{data:ReportData;clientView?:boolean}){
  const primary=data.diagnoses[0];
  const warnings=coverageWarnings(data);
  return <article className="audit-report mx-auto max-w-6xl space-y-8 text-foreground">
    <header className="rounded-[2rem] border border-border/60 bg-ink p-7 md:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-mint">INKSIGHTS · Studio Intelligence Audit</p><h1 className="mt-3 font-display text-4xl font-black tracking-tight text-ice md:text-6xl">{data.studio.name}</h1><p className="mt-3 text-sm text-muted-foreground">Audit v{data.audit.audit_version} · Mode {data.audit.mode} · {data.audit.period_start||"period pending"} → {data.audit.period_end||"ongoing"}</p></div><div className="rounded-2xl border border-border bg-ink-deep px-4 py-3 text-right"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">QA status</p><p className="mt-1 text-sm font-black text-mint">{data.audit.qa_status.toUpperCase()}</p></div></div>
      {primary?<div className="mt-8 rounded-2xl border border-mint/20 bg-mint/[0.04] p-5"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-mint">Executive diagnosis</p><h2 className="mt-2 text-xl font-black text-ice">{primary.title}</h2><p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">{primary.statement}</p><p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Diagnosis · {primary.confidence} confidence</p></div>:null}
    </header>

    {warnings.length?<section className="rounded-3xl border border-amber-400/20 bg-amber-400/[0.04] p-6"><h2 className="font-display text-xl font-black text-ice">Coverage warnings</h2><ul className="mt-3 space-y-2 text-sm text-amber-100">{warnings.map(w=><li key={w}>• {w}</li>)}</ul></section>:null}

    <Section title="Data confidence & commercial baseline" eyebrow="01 · Baseline"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{data.metrics.slice(0,18).map(m=><div key={m.id} className="rounded-2xl border border-border/60 bg-ink-deep p-4"><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground">{m.metric_key.replaceAll("_"," ")}</p><p className="mt-2 font-display text-2xl font-black text-ice">{valueFor(m)}</p>{m.measurement_status==="not_measurable"?<p className="mt-2 text-xs leading-5 text-muted-foreground">{m.not_measurable_reason}<br/>Required: {m.required_source}</p>:null}<div className="mt-3"><EvidenceBadge classification={m.evidence_classification} confidence={m.confidence}/></div></div>)}</div></Section>

    <Section title="Client intelligence" eyebrow="02 · Customers"><div className="grid gap-4 md:grid-cols-2">{data.findings.filter(f=>/client|reactiv|payment/i.test(`${f.finding_key} ${f.title} ${f.statement}`)).map(f=><FindingCard key={f.id} f={f}/>)}</div></Section>
    <Section title="Website, customer journey & visibility" eyebrow="03 · Market evidence"><div className="grid gap-4 md:grid-cols-2">{data.evidence.filter(e=>/website|search|visibility|robots|cta|portfolio|competitor/i.test(`${e.evidence_type} ${e.title} ${e.summary}`)).slice(0,14).map(e=><div key={e.id} className="rounded-2xl border border-border/60 bg-ink-deep p-5"><p className="font-bold text-ice">{e.title}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{e.summary}</p><div className="mt-4"><EvidenceBadge classification={e.classification} confidence={e.confidence}/></div></div>)}</div></Section>

    <Section title="Constraint diagnosis" eyebrow="04 · Diagnosis"><div className="space-y-4">{data.diagnoses.map((d,i)=><div key={d.id} className="rounded-2xl border border-border/60 bg-ink-deep p-5"><div className="flex items-start gap-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint/10 font-black text-mint">{i+1}</span><div><h3 className="font-black text-ice">{d.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{d.statement}</p><p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{d.constraint_type.replaceAll("_"," ")} · {d.confidence} confidence</p></div></div></div>)}</div></Section>

    <Section title="Opportunity register" eyebrow="05 · Priorities"><div className="space-y-4">{data.opportunities.map((o,i)=>{const impact=modelledImpact(o.impact_low,o.impact_high,o.impact_unit); return <div key={o.id} className="grid gap-4 rounded-2xl border border-border/60 bg-ink-deep p-5 md:grid-cols-[1fr_140px]"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-mint">Priority {i+1}</p><h3 className="mt-2 text-xl font-black text-ice">{o.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{o.mechanism}</p>{impact?<p className="mt-3 text-sm font-bold text-ice">Modelled impact: {impact}</p>:null}<div className="mt-4"><EvidenceBadge classification={o.evidence_classification} confidence={o.confidence}/></div></div><div className="rounded-xl border border-border bg-ink p-4 text-center"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Opportunity score</p><p className="mt-2 font-display text-4xl font-black text-mint">{number(o.overall_score)}</p><p className="mt-1 text-[10px] text-muted-foreground">{o.assumptions.score_version||"opportunity-score-v1"}</p></div></div>})}</div></Section>

    <Section title="Top recommendations & 90-day plan" eyebrow="06 · Action"><div className="grid gap-4 lg:grid-cols-3">{data.recommendations.map(r=><div key={r.id} className="rounded-2xl border border-border/60 bg-ink-deep p-5"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-mint">Days {r.phase}</p><h3 className="mt-2 text-lg font-black text-ice">{r.title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{r.action}</p><p className="mt-3 text-xs leading-5 text-muted-foreground"><strong className="text-ice">Rationale:</strong> {r.rationale}</p><p className="mt-3 text-xs text-muted-foreground">Owner: {r.owner_role||"Studio + INKSIGHTS"}{r.target_metric_key?` · KPI: ${r.target_metric_key}`:""}</p></div>)}</div></Section>

    <Section title="Evidence appendix" eyebrow="07 · Audit trail"><div className="space-y-3">{data.evidence.map(e=><div key={e.id} className="rounded-xl border border-border/60 bg-ink-deep p-4"><div className="flex flex-wrap items-center justify-between gap-3"><p className="font-semibold text-ice">{e.title}</p><EvidenceBadge classification={e.classification} confidence={e.confidence}/></div><p className="mt-2 text-xs leading-5 text-muted-foreground">{e.summary}</p><p className="mt-2 text-[10px] text-muted-foreground">Observed: {e.observed_at?new Date(e.observed_at).toLocaleString("en-GB"):"—"} · Evidence ID {e.id}</p></div>)}</div></Section>

    {clientView?<footer className="pb-8 text-center text-xs text-muted-foreground">Generated from canonical INKSIGHTS audit intelligence. Evidence classifications and limitations are intentionally preserved.</footer>:null}
  </article>;
}

function Section({eyebrow,title,children}:{eyebrow:string;title:string;children:ReactNode}){return <section className="rounded-3xl border border-border/60 bg-ink p-6 md:p-8"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-mint">{eyebrow}</p><h2 className="mt-2 mb-6 font-display text-2xl font-black text-ice md:text-3xl">{title}</h2>{children}</section>}
function FindingCard({f}:{f:Finding}){return <div className="rounded-2xl border border-border/60 bg-ink-deep p-5"><h3 className="font-black text-ice">{f.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{f.statement}</p><div className="mt-4"><EvidenceBadge classification={f.classification} confidence={f.confidence}/></div></div>}
