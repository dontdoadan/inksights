import { ArrowRight, ExternalLink, ShieldCheck } from "lucide-react";
import type { AcquisitionSnapshot } from "../model";

export function AcquisitionSnapshotView({ snapshot }: { snapshot: AcquisitionSnapshot }) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-border/70 bg-ink shadow-2xl shadow-black/20">
      <header className="relative overflow-hidden border-b border-border/60 bg-ink-deep px-6 py-8 md:px-10 md:py-11">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(0,229,209,.12),transparent_34%)]" />
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-mint">INKSIGHTS · Studio Intelligence Snapshot</p>
            <span className="inline-flex items-center gap-2 rounded-full border border-mint/25 bg-mint/[0.06] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-mint">
              <ShieldCheck className="h-3.5 w-3.5" /> Public evidence
            </span>
          </div>
          <h1 className="mt-7 max-w-5xl font-display text-4xl font-black tracking-tight text-ice md:text-6xl">
            {snapshot.studio.name}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
            A bounded first-pass review of publicly observable search and website signals. It is designed to show where a deeper commercial diagnosis may be justified—not to manufacture a problem.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {snapshot.studio.location ? <span className="rounded-full border border-border px-3 py-2">{snapshot.studio.location}</span> : null}
            <a href={snapshot.studio.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 transition hover:border-mint/50 hover:text-mint">
              {snapshot.studio.website.replace(/^https?:\/\//, "")} <ExternalLink className="h-3 w-3" />
            </a>
            <span className="rounded-full border border-border px-3 py-2">
              Observed {new Date(snapshot.generatedAt).toLocaleDateString("en-GB")}
            </span>
          </div>
        </div>
      </header>

      <div className="px-6 py-8 md:px-10 md:py-10">
        <section>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-mint">What stood out</p>
          <h2 className="mt-2 max-w-3xl font-display text-3xl font-black text-ice md:text-4xl">
            A few evidence-backed signals worth looking at.
          </h2>
          <div className="mt-7 grid gap-5">
            {snapshot.findings.map((finding, index) => (
              <div key={finding.title} className="rounded-3xl border border-border/70 bg-ink-deep p-6 md:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-4">
                    <span className="font-mono text-sm font-bold text-mint/60">0{index + 1}</span>
                    <div>
                      <h3 className="font-display text-xl font-black text-ice md:text-2xl">{finding.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-ice/90">{finding.observation}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge>{finding.classification}</Badge>
                    <Badge>{finding.confidence}</Badge>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-mint/15 bg-mint/[0.035] p-5">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-mint">Potential implication</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{finding.potentialImplication}</p>
                </div>

                {finding.evidence.length ? (
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {finding.evidence.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-border/60 bg-ink p-4">
                        <p className="text-xs font-bold text-ice">{item.title}</p>
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.summary}</p>
                        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                          {item.sourceProvider || "public source"}
                          {item.observedAt ? " · " + new Date(item.observedAt).toLocaleDateString("en-GB") : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-border/70 bg-ink-deep p-6 md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-mint">Scope & evidence boundary</p>
          <p className="mt-4 text-sm leading-relaxed text-ice">{snapshot.scope.searchScope}</p>
          <ul className="mt-5 space-y-3">
            {snapshot.scope.limitations.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-mint/70" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 overflow-hidden rounded-3xl border border-mint/25 bg-[radial-gradient(circle_at_85%_15%,rgba(0,229,209,.16),transparent_42%)] p-7 md:p-9">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-mint">Next step</p>
          <h2 className="mt-3 max-w-3xl font-display text-3xl font-black text-ice md:text-4xl">{snapshot.cta.title}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">{snapshot.cta.body}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="/offers/studio-intelligence-audit"
              className="inline-flex items-center gap-2 rounded-full bg-mint px-5 py-3 text-sm font-black text-ink-deep transition hover:bg-mint-soft"
            >
              View the {snapshot.cta.foundingValidationPrice} audit <ArrowRight className="h-4 w-4" />
            </a>
            <span className="text-xs text-muted-foreground">One-off founding validation price · no guaranteed rankings or revenue claims.</span>
          </div>
        </section>
      </div>
    </article>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground">
      {children}
    </span>
  );
}
