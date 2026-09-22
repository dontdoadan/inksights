import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BarChart3, Check, Copy, Database, MapPin, Search, Target, TrendingUp, Users } from "lucide-react";

export const Route = createFileRoute("/design-system")({
  component: DesignSystem,
  head: () => ({
    meta: [
      { title: "INKSIGHTS Design System v1" },
      { name: "description", content: "Canonical coded visual-delivery system for INKSIGHTS." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@600;700;800;900&display=swap" },
    ],
  }),
});

const C = {
  navy: "#0B1F3B",
  mint: "#2ED3A6",
  white: "#F8FAFC",
  grey: "#CBD5E1",
  black: "#0F172A",
  muted: "#64748B",
};

const nav = [
  ["overview", "Overview"],
  ["foundations", "Foundations"],
  ["brand", "Brand"],
  ["visual-language", "Visual Language"],
  ["components", "Components"],
  ["icons", "Icons"],
  ["patterns", "Patterns"],
  ["report-system", "Report System"],
  ["templates", "Templates"],
  ["unit-two", "Unit Two Benchmark"],
] as const;

const evidence = [
  ["VERIFIED", "bg-[#B8F4E5]", "Confirmed by appropriate first-party or authoritative evidence."],
  ["OBSERVED", "bg-[#DDF7F0]", "Directly observed in a named public or operational source."],
  ["CALCULATED", "bg-[#DDE8F3]", "Deterministic calculation from known inputs."],
  ["MODELLED", "bg-[#E8EAF0]", "Scenario or estimate with explicit assumptions."],
  ["HYPOTHESIS", "bg-white border border-[#CBD5E1]", "Proposition requiring validation."],
  ["HISTORICAL FIRSTHAND", "bg-[#F1F5F9] border border-[#CBD5E1]", "Prior firsthand knowledge requiring current confirmation."],
] as const;

const componentNames = [
  "Evidence badges", "Buttons", "KPI card", "Signal card", "Finding card", "Diagnosis card",
  "Opportunity card", "Recommendation card", "Evidence card", "Process step", "Data request",
  "Quote / callout", "Section marker", "Report header", "Report footer", "Next action panel",
];

const archetypes = [
  "Cover", "Executive Summary", "Studio Profile", "Key Signals", "Evidence", "Finding / Diagnosis",
  "Opportunity", "Method / Process", "Data Request", "30 / 60 / 90 Action Plan", "Outcome / Case Study", "Brand Close",
];

const templates = [
  ["Studio Growth Check", "Acquisition / indicative", "Public evidence + user-supplied answers"],
  ["Studio Intelligence Snapshot", "Pre-sales / owner validation", "Public evidence + hypotheses"],
  ["Full Studio Intelligence Audit", "Paid diagnostic", "First-party + public evidence"],
  ["Intervention Plan", "Execution", "Validated diagnosis + selected opportunity"],
  ["Outcome / Case Study", "Proof", "Baseline + intervention + measured outcome"],
  ["Evidence Brief", "Research", "Verified external evidence + explicit inference labels"],
];

function SignalMark({ className = "" }: { className?: string }) {
  return <span className={`inline-flex h-8 items-end gap-1 ${className}`} aria-label="INKSIGHTS signal mark">
    <i className="block h-3.5 w-2 rounded-full bg-[#A9F3E3]" />
    <i className="block h-5.5 w-2 rounded-full bg-[#2ED3A6]" />
    <i className="block h-8 w-2 rounded-full bg-[#42E0B8]" />
  </span>;
}

function Wordmark({ reverse = false }: { reverse?: boolean }) {
  return <div className="flex items-center gap-3">
    <SignalMark />
    <div>
      <div className={`font-black tracking-[-0.05em] text-xl ${reverse ? "text-white" : "text-[#0F172A]"}`} style={{ fontFamily: "Poppins, sans-serif" }}>
        INK<span className="text-[#2ED3A6]">SIGHTS</span>
      </div>
      <div className={`mt-0.5 text-[7px] font-bold tracking-[0.24em] ${reverse ? "text-white/75" : "text-[#64748B]"}`}>GROWTH INTELLIGENCE FOR UK TATTOO STUDIOS</div>
    </div>
  </div>;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#2ED3A6]">{children}</div>;
}

function Section({ id, eyebrow, title, intro, children }: { id: string; eyebrow: string; title: string; intro: string; children: React.ReactNode }) {
  return <section id={id} className="scroll-mt-24 border-b border-slate-200 px-5 py-16 md:px-10 xl:px-14">
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_0.7fr] lg:items-end">
        <div><Eyebrow>{eyebrow}</Eyebrow><h2 className="text-3xl font-black tracking-[-0.04em] text-[#0F172A] md:text-5xl" style={{ fontFamily: "Poppins, sans-serif" }}>{title}</h2></div>
        <p className="max-w-2xl text-sm leading-7 text-[#64748B] md:text-base">{intro}</p>
      </div>
      {children}
    </div>
  </section>;
}

function EvidenceBadge({ label }: { label: string }) {
  const item = evidence.find((x) => x[0] === label) ?? evidence[4];
  return <span className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-extrabold tracking-[0.08em] text-[#0F172A] ${item[1]}`}>{label}</span>;
}

function Swatch({ name, hex }: { name: string; hex: string }) {
  const copy = () => navigator.clipboard?.writeText(hex);
  return <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="h-28 rounded-2xl border border-slate-200" style={{ background: hex }} />
    <h3 className="mt-4 font-bold text-[#0F172A]">{name}</h3>
    <div className="mt-1 font-mono text-xs text-[#64748B]">{hex}</div>
    <button onClick={copy} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold hover:border-[#2ED3A6]"><Copy className="h-3.5 w-3.5" /> Copy</button>
  </div>;
}

function SignalCard({ number = "01", title = "Enquiry routing and attribution", text = "Central enquiries and artist-direct contacts make attribution worth measuring." }) {
  return <div className="grid overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm sm:grid-cols-[145px_1fr]">
    <div className="flex items-end bg-[#0B1F3B] p-6 font-black text-5xl text-[#2ED3A6]" style={{ fontFamily: "Poppins, sans-serif" }}>{number}</div>
    <div className="p-6"><h3 className="text-xl font-black text-[#0F172A]" style={{ fontFamily: "Poppins, sans-serif" }}>{title}</h3><p className="mt-3 text-sm leading-6 text-[#64748B]">{text}</p></div>
  </div>;
}

function ProcessStep({ n, title, text }: { n: string; title: string; text: string }) {
  return <div className="flex items-center gap-4">
    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#2ED3A6] font-black text-[#0F172A]">{n}</div>
    <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-4"><div className="font-bold text-[#0F172A]">{title}</div><div className="mt-1 text-xs text-[#64748B]">{text}</div></div>
  </div>;
}

function ReportThumb({ name, dark = false }: { name: string; dark?: boolean }) {
  return <div>
    <div className={`aspect-[210/297] rounded-2xl border p-5 shadow-xl ${dark ? "border-[#1D405A] bg-[#0B1F3B] text-white" : "border-slate-200 bg-white text-[#0F172A]"}`}>
      <div className="h-1 w-11 rounded-full bg-[#2ED3A6]" />
      <div className={`mt-3 text-[8px] font-bold tracking-[0.18em] ${dark ? "text-white/55" : "text-[#64748B]"}`}>INKSIGHTS / REPORT SYSTEM</div>
      <div className="mt-3 text-lg font-black" style={{ fontFamily: "Poppins, sans-serif" }}>{name}</div>
      <div className={`mt-2 text-[9px] ${dark ? "text-white/55" : "text-[#64748B]"}`}>Editorial hierarchy · evidence-safe structure</div>
      {[1,2,3].map((x) => <div key={x} className={`mt-2 h-10 rounded-lg border ${dark ? "border-[#28475F]" : "border-slate-200"}`} />)}
    </div>
    <div className="mt-2 text-sm font-bold">{name}</div>
  </div>;
}

function UnitPage({ n, title, body, dark = false, children }: { n: number; title: string; body: React.ReactNode; dark?: boolean; children?: React.ReactNode }) {
  return <div>
    <div className={`relative aspect-[210/297] overflow-hidden rounded-2xl border p-6 shadow-xl ${dark ? "border-[#1D405A] bg-[#0B1F3B] text-white" : "border-slate-200 bg-white text-[#0F172A]"}`}>
      <div className="absolute right-5 top-5 text-[8px] font-bold tracking-[0.16em]">UNIT TWO · 0{n}</div>
      <div className="mt-1 text-[8px] font-extrabold tracking-[0.2em] text-[#2ED3A6]">{n === 1 ? "PUBLIC / PRE-SALES INTELLIGENCE ONLY" : "INKSIGHTS"}</div>
      <div className="mt-5 text-2xl font-black leading-[1.03]" style={{ fontFamily: "Poppins, sans-serif" }}>{title}</div>
      <div className={`mt-3 text-[10px] leading-5 ${dark ? "text-white/70" : "text-[#64748B]"}`}>{body}</div>
      {children}
    </div>
    <div className="mt-2 text-sm font-bold">{n}. {title}</div>
  </div>;
}

function DesignSystem() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => componentNames.filter((x) => x.toLowerCase().includes(query.toLowerCase())), [query]);

  return <div className="min-h-screen bg-[#F3F6F8] text-[#0F172A]" style={{ fontFamily: "Inter, sans-serif" }}>
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 overflow-y-auto bg-[#0B1F3B] p-6 text-white xl:block">
      <Wordmark reverse />
      <div className="mt-8 text-[9px] font-bold tracking-[0.18em] text-white/35">DESIGN SYSTEM</div>
      <nav className="mt-3 space-y-1">
        {nav.map(([id, label]) => <a key={id} href={`#${id}`} className="block rounded-xl px-3 py-2.5 text-sm text-white/70 hover:bg-[#2ED3A6]/10 hover:text-white">{label}</a>)}
      </nav>
      <div className="mt-8 rounded-2xl border border-[#2ED3A6]/20 bg-[#2ED3A6]/5 p-4 text-[11px] leading-5 text-white/65">
        <b className="text-white">Canonical hierarchy</b><br />Approved Brand System → Tokens → Components → Reports/Templates → Canva derivatives.
      </div>
    </aside>

    <main className="xl:pl-72">
      <div id="overview" className="px-4 py-5 md:px-8 xl:px-12">
        <div className="relative mx-auto grid min-h-[430px] max-w-7xl overflow-hidden rounded-[32px] bg-[#0B1F3B] p-8 text-white shadow-2xl md:grid-cols-[1.15fr_0.85fr] md:items-end md:p-14">
          <div className="absolute -right-32 -top-64 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(46,211,166,.34),transparent_68%)]" />
          <div className="relative z-10"><Eyebrow>INKSIGHTS / DESIGN SYSTEM v1</Eyebrow><h1 className="text-5xl font-black leading-[0.92] tracking-[-0.05em] md:text-7xl" style={{ fontFamily: "Poppins, sans-serif" }}>Intelligence,<br /><span className="text-[#2ED3A6]">made visible.</span></h1><p className="mt-6 max-w-2xl text-base leading-7 text-white/70">The canonical coded visual-delivery system for INKSIGHTS.</p></div>
          <div className="relative z-10 mt-10 border-l border-white/15 pl-6 md:mt-0"><SignalMark /><h3 className="mt-5 text-xl font-black" style={{ fontFamily: "Poppins, sans-serif" }}>Source of truth</h3><p className="text-sm leading-6 text-white/60">Approved Brand System → Design Tokens → Components → Reports & Templates → Canva derivatives.</p><div className="mt-4"><EvidenceBadge label="OBSERVED" /></div><div className="mt-2 text-[10px] font-bold tracking-[0.12em] text-white/55">CANVA IS DOWNSTREAM ONLY</div></div>
        </div>
      </div>

      <Section id="foundations" eyebrow="FOUNDATIONS" title="Precision before decoration." intro="A deliberately constrained palette, spacing system and editorial grid keep every output recognisably INKSIGHTS.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Swatch name="Deep Navy" hex={C.navy} /><Swatch name="Signal Mint" hex={C.mint} /><Swatch name="Clean White" hex={C.white} /><Swatch name="Cool Grey" hex={C.grey} /><Swatch name="Ink Black" hex={C.black} /><Swatch name="Muted" hex={C.muted} />
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6"><Eyebrow>TYPOGRAPHY</Eyebrow><div className="text-5xl font-black tracking-[-0.04em]" style={{ fontFamily: "Poppins, sans-serif" }}>Poppins</div><p>Display / headings · 600–900</p><div className="mt-5 text-2xl font-bold">Inter</div><p>Body / UI · 400–800</p><div className="mt-5 font-mono text-xs text-[#64748B]">Display 36–42pt · Page 24–28pt · Key 14–18pt · Body 10–11pt · Metadata 8.5–9.5pt</div></div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6"><Eyebrow>SPACING / GRID</Eyebrow><h3 className="font-black" style={{ fontFamily: "Poppins, sans-serif" }}>4 / 8 / 12 / 16 / 24 / 32 / 48</h3><p>Cards 16–24 · sections 24–40 · title-to-content 24–32.</p><div className="mt-5 grid h-32 grid-cols-12 gap-1.5">{Array.from({ length: 12 }).map((_,i) => <div key={i} className="rounded-md bg-[#DDF7F0]" />)}</div><p className="text-xs">12-column editorial grid · approximately 20–22mm outer margins for A4 portrait.</p></div>
        </div>
        <div className="mt-6 rounded-r-2xl border-l-4 border-[#2ED3A6] bg-[#ECFAF6] p-5 text-sm"><b>Signal Mint communicates meaning.</b> Use it for signals, evidence cues, progression and next actions — not decoration.</div>
      </Section>

      <Section id="brand" eyebrow="BRAND" title="Recognisable without decoration." intro="The signal mark and wordmark stay simple so the wider editorial system can carry the personality.">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-slate-200"><div className="grid min-h-56 place-items-center bg-white p-8"><Wordmark /></div><div className="border-t border-slate-200 bg-white p-4 text-sm font-bold">Primary lockup</div></div>
          <div className="overflow-hidden rounded-3xl border border-[#1D405A]"><div className="grid min-h-56 place-items-center bg-[#0B1F3B] p-8"><Wordmark reverse /></div><div className="border-t border-slate-200 bg-white p-4 text-sm font-bold">Reverse lockup</div></div>
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-2"><div className="rounded-3xl border border-slate-200 bg-white p-6"><h3 className="font-black">Clear space</h3><div className="mt-4 border-2 border-dashed border-[#2ED3A6] p-12"><Wordmark /></div><p className="text-sm">Maintain at least the tallest signal-bar width around the complete lockup.</p></div><div className="rounded-3xl border border-slate-200 bg-white p-6"><h3 className="font-black">Usage discipline</h3><p><b>Do:</b> preserve proportions, approved colour combinations and generous space.</p><p><b>Don’t:</b> stretch, add effects, recolour arbitrarily, crowd the lockup or use generic gradients.</p></div></div>
      </Section>

      <Section id="visual-language" eyebrow="VISUAL LANGUAGE" title="Signals, not decoration." intro="Intelligence-system structure with premium editorial pacing, rather than a generic SaaS dashboard.">
        <div className="grid gap-5 md:grid-cols-2">
          <div><div className="relative h-56 overflow-hidden rounded-3xl bg-[#0B1F3B]"><div className="absolute -bottom-10 left-0 h-24 w-96 -rotate-45 rounded-full bg-[#123B57]" /><div className="absolute bottom-8 left-32 h-24 w-96 -rotate-45 rounded-full bg-gradient-to-r from-[#17506A] to-[#2ED3A6] opacity-70" /></div><h3 className="mt-3 font-black">Signal ribbons</h3></div>
          <div><div className="h-56 rounded-3xl bg-white" style={{ backgroundImage: "radial-gradient(#CBD5E1 1.5px, transparent 1.5px)", backgroundSize: "18px 18px" }} /><h3 className="mt-3 font-black">Dot matrix</h3></div>
          <div><div className="relative h-56 overflow-hidden rounded-3xl bg-[#0B1F3B]"><div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(46,211,166,.7),rgba(46,211,166,.12)_48%,transparent_70%)]" /></div><h3 className="mt-3 font-black">Mint signal orb</h3></div>
          <div className="rounded-3xl bg-[#0B1F3B] p-7 text-white"><Eyebrow>PHOTOGRAPHY</Eyebrow><h3 className="text-2xl font-black" style={{ fontFamily: "Poppins, sans-serif" }}>Editorial. Architectural. Evidence-safe.</h3><p className="text-sm leading-6 text-white/65">Supporting photography must never be presented as evidence of the studio being analysed unless it is actually sourced evidence.</p></div>
        </div>
      </Section>

      <Section id="components" eyebrow="COMPONENTS" title="Meaning, made reusable." intro="Components communicate information type, provenance and action — not just branding.">
        <div className="mb-6 rounded-r-2xl border-l-4 border-[#2ED3A6] bg-[#ECFAF6] p-5 text-sm"><b>Evidence rule:</b> never turn a public signal into a confirmed internal business problem.</div>
        <div className="relative mb-6"><Search className="absolute left-4 top-3.5 h-4 w-4 text-[#64748B]" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search components…" className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 outline-none focus:border-[#2ED3A6]" /></div>
        <div className="grid gap-5 lg:grid-cols-2">
          {filtered.map((name) => <div key={name} className="overflow-hidden rounded-3xl border border-slate-200 bg-[#EEF3F6]">
            <div className="grid min-h-56 place-items-center p-7">
              {name === "Evidence badges" ? <div className="flex flex-wrap gap-2">{evidence.map((x) => <EvidenceBadge key={x[0]} label={x[0]} />)}</div> :
               name === "Buttons" ? <div className="flex flex-wrap gap-2"><button className="rounded-full bg-[#0B1F3B] px-5 py-3 font-bold text-white">Primary →</button><button className="rounded-full bg-[#2ED3A6] px-5 py-3 font-bold text-[#0F172A]">Secondary →</button><button className="rounded-full border border-[#CBD5E1] bg-white px-5 py-3 font-bold">Ghost →</button></div> :
               name === "KPI card" ? <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6"><Eyebrow>PUBLIC SIGNAL</Eyebrow><div className="text-5xl font-black" style={{ fontFamily: "Poppins, sans-serif" }}>10</div><div className="font-bold">Artists listed</div><div className="mt-1 text-xs text-[#64748B]">Observed publicly</div></div> :
               name === "Signal card" ? <SignalCard /> :
               name === "Process step" ? <ProcessStep n="01" title="Public intelligence" text="Analyse online data and market context." /> :
               <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6"><Eyebrow>{name}</Eyebrow><h3 className="font-black" style={{ fontFamily: "Poppins, sans-serif" }}>{name}</h3><p className="text-sm">Reusable semantic INKSIGHTS component using the canonical token system.</p></div>}
            </div><div className="border-t border-slate-200 bg-white p-4 text-sm font-bold">{name}</div>
          </div>)}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{evidence.map((x) => <div key={x[0]} className="rounded-3xl border border-slate-200 bg-white p-5"><EvidenceBadge label={x[0]} /><p className="mt-4 text-sm leading-6">{x[2]}</p></div>)}</div>
      </Section>

      <Section id="icons" eyebrow="ICONOGRAPHY" title="One coherent symbol language." intro="Rounded geometry, restrained stroke weight and Signal Mint only where meaning requires it.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[[BarChart3,"Insights"],[Target,"Strategy"],[Users,"People"],[TrendingUp,"Growth"],[Check,"Results"],[MapPin,"Location"],[Check,"Evidence"],[Database,"Data"]].map(([Icon,name]) => { const I = Icon as typeof BarChart3; return <div key={String(name)} className="rounded-3xl border border-slate-200 bg-white p-6 text-center"><I className="mx-auto h-11 w-11 stroke-[1.7] text-[#0F172A]" /><h3 className="mt-4 font-black">{String(name)}</h3></div> })}
        </div>
      </Section>

      <Section id="patterns" eyebrow="PATTERNS" title="Texture with restraint." intro="Patterns create recognition and rhythm without competing with evidence.">
        <div className="grid gap-5 md:grid-cols-2"><div className="relative h-56 overflow-hidden rounded-3xl bg-[#0B1F3B]"><div className="absolute -bottom-10 left-0 h-24 w-96 -rotate-45 rounded-full bg-[#123B57]" /><div className="absolute bottom-8 left-32 h-24 w-96 -rotate-45 rounded-full bg-gradient-to-r from-[#17506A] to-[#2ED3A6] opacity-70" /></div><div className="h-56 rounded-3xl bg-white" style={{ backgroundImage: "radial-gradient(#CBD5E1 1.5px, transparent 1.5px)", backgroundSize: "18px 18px" }} /></div>
      </Section>

      <Section id="report-system" eyebrow="REPORT SYSTEM" title="Designed intelligence, not styled documents." intro="A reusable A4 portrait system creates deliberate pacing between signal, evidence, diagnosis and action.">
        <div className="mb-8 grid gap-4 md:grid-cols-3"><div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="font-black">A4 portrait</h3><p className="text-sm">12-column grid · 20–22mm outer margins.</p></div><div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="font-black">Spacing</h3><p className="text-sm">Cards 16–24 · sections 24–40 · title/content 24–32.</p></div><div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="font-black">Tables</h3><p className="text-sm">Top-align; 10–14pt vertical padding; turn long cells into cards.</p></div></div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{archetypes.map((x,i) => <ReportThumb key={x} name={x} dark={[0,2,11].includes(i)} />)}</div>
      </Section>

      <Section id="templates" eyebrow="TEMPLATES" title="One family. Different evidence thresholds." intro="Each template has a defined role in the commercial and evidence journey.">
        <div className="grid gap-5 lg:grid-cols-2">{templates.map((x) => <div key={x[0]} className="rounded-3xl border border-slate-200 bg-white p-6"><Eyebrow>{x[1]}</Eyebrow><h3 className="text-xl font-black" style={{ fontFamily: "Poppins, sans-serif" }}>{x[0]}</h3><p className="text-sm">{x[2]}</p><EvidenceBadge label="OBSERVED" /></div>)}</div>
      </Section>

      <Section id="unit-two" eyebrow="UNIT TWO BENCHMARK" title="Public intelligence, clearly bounded." intro="The approved client-report direction without pretending public evidence is a completed Full Studio Intelligence Audit.">
        <div className="mb-8 rounded-r-2xl border-l-4 border-[#2ED3A6] bg-[#ECFAF6] p-5 text-sm"><b>PUBLIC / PRE-SALES INTELLIGENCE ONLY.</b> No first-party Unit Two operational dataset exists here and no defensible economic opportunity value is claimed.</div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <UnitPage n={1} title="UNIT TWO" body={<>Intelligence Snapshot<br /><br />Independent analysis. Real opportunities.</>} dark><div className="absolute bottom-7"><SignalMark /><div className="mt-2 text-[8px] tracking-[0.16em] text-white/55">BRIGHTON, UK</div></div></UnitPage>
          <UnitPage n={2} title="A strong studio. A clearer next question." body="10 artists listed publicly · Brighton · multiple visible commercial streams."><div className="mt-4 rounded-xl border border-slate-200 p-3 text-[9px]">4 public evidence records · 3 pre-sales findings · 3 active diagnoses</div></UnitPage>
          <UnitPage n={3} title="Studio Profile" body={<>John Craig · owner/founder<br />Central studio matching + artist-direct contact<br />Individual artist pricing<br />Active recruitment<br />Guest spots, seminars/classes, aftercare products</>} dark />
          <UnitPage n={4} title="Three Key Signals" body="Areas worth validating — not confirmed commercial problems."><div className="mt-3 space-y-2"><div className="rounded-xl border border-slate-200 p-2"><b className="text-[#2ED3A6]">01</b> Enquiry routing & attribution</div><div className="rounded-xl border border-slate-200 p-2"><b className="text-[#2ED3A6]">02</b> Capacity & recruitment economics</div><div className="rounded-xl border border-slate-200 p-2"><b className="text-[#2ED3A6]">03</b> Revenue mix & diversification</div></div></UnitPage>
          <UnitPage n={5} title="Public Evidence" body="What can currently be observed from public sources."><div className="mt-3 space-y-2">{["10 artists listed publicly","Central matching + artist-direct contact","Active artist recruitment","Guest spots, seminars/classes, aftercare"].map((x) => <div key={x} className="rounded-xl border border-slate-200 p-2"><EvidenceBadge label="OBSERVED" /><div className="mt-1 text-[9px]">{x}</div></div>)}</div></UnitPage>
          <UnitPage n={6} title="From Insight to Impact" body="The pathway from public intelligence to measured outcome."><div className="mt-3 space-y-1.5">{["Public intelligence","Validate with owner","Gather studio data","Full Studio Intelligence Audit","Prioritise intervention","Measure outcome"].map((x,i) => <div key={x} className="rounded-lg border border-slate-200 p-2 text-[9px]"><b className="text-[#2ED3A6]">0{i+1}</b> {x}</div>)}</div></UnitPage>
          <UnitPage n={7} title="Owner Validation" body="Confirm the operating/workstation model; clarify enquiries, deposits and bookings; confirm the minimum operational data available." dark><div className="mt-4 rounded-xl border border-[#28475F] p-3"><EvidenceBadge label="HISTORICAL FIRSTHAND" /><div className="mt-2 text-[9px] text-white/65">Requires current confirmation.</div></div></UnitPage>
          <UnitPage n={8} title="Next Steps" body={<>01 Initial discussion<br />02 Share key data<br />03 Full Audit v1</>}><div className="mt-4 rounded-xl border border-slate-200 p-3 text-[9px]"><b>Do not claim yet:</b><br />poor conversion · spare capacity · lost revenue · monetary opportunity</div></UnitPage>
          <UnitPage n={9} title="Real insights. Real growth." body="Clearer data. Smarter decisions. Stronger studios." dark><div className="absolute bottom-7"><Wordmark reverse /></div></UnitPage>
        </div>
      </Section>

      <footer className="px-5 py-10 text-center text-xs text-[#64748B] md:px-10">INKSIGHTS Design System v1 · Approved Brand System → Tokens → Components → Reports/Templates → Canva derivatives.</footer>
    </main>
  </div>;
}
