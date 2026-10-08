import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, Loader2, Radar, RefreshCw, Search } from "lucide-react";
import { loadProspects, runProspectScan, type ProspectListItem } from "@/features/prospect/queries";

export const Route = createFileRoute("/_authenticated/prospects")({
  component: ProspectsPage,
  head: () => ({ meta: [{ title: "Prospect Intelligence — INKSIGHTS" }] }),
});

function ProspectsPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ProspectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setRows(await loadProspects());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRunning(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await runProspectScan({
        studio_name: String(form.get("studio_name") || ""),
        website: String(form.get("website") || ""),
        address: String(form.get("address") || ""),
        postcode: String(form.get("postcode") || ""),
        town: String(form.get("town") || ""),
        gbp_url: String(form.get("gbp_url") || ""),
      });
      const auditId = result.auditId || result.audit?.id;
      if (!auditId) throw new Error("Prospect scan completed without an audit id.");
      await navigate({ to: "/prospects/$auditId", params: { auditId } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prospect scan failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink-deep px-5 py-8 text-foreground md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-mint">INKSIGHTS · Acquisition system</p>
            <h1 className="mt-2 font-display text-4xl font-black text-ice md:text-5xl">Prospect Intelligence</h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Turn public studio evidence into a controlled internal dossier and a sendable Studio Intelligence Snapshot. Unknowns stay unknown; outbound is held when the evidence is weak.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/workspace" className="rounded-full border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:text-mint">Workspace</Link>
            <button onClick={() => void refresh()} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:text-mint">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
          </div>
        </div>

        <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <form onSubmit={submit} className="rounded-3xl border border-mint/20 bg-ink p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl border border-mint/20 bg-mint/[0.07] p-3 text-mint"><Radar className="h-5 w-5" /></div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-mint">New studio scan</p>
                <h2 className="mt-2 font-display text-2xl font-black text-ice">Start with the strongest identifiers you have.</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  A website is the strongest current route. If it is omitted, INKSIGHTS will attempt a conservative public-web resolution and stop rather than attach the wrong studio.
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-2">
              <Field name="studio_name" label="Studio name" placeholder="e.g. Example Tattoo" />
              <Field name="website" label="Website" placeholder="https://exampletattoo.co.uk" />
              <Field name="town" label="Town / city" placeholder="Croydon" />
              <Field name="postcode" label="Postcode" placeholder="CR0 1AA" />
              <div className="md:col-span-2"><Field name="address" label="Address" placeholder="Optional trading address" /></div>
              <div className="md:col-span-2"><Field name="gbp_url" label="Google Business Profile / Maps URL" placeholder="Optional public profile link" /></div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button disabled={running} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-mint px-5 py-2.5 text-sm font-black text-ink-deep transition hover:bg-mint-soft disabled:opacity-50">
                {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {running ? "Running intelligence…" : "Analyse studio"}
              </button>
              <span className="text-xs text-muted-foreground">Public evidence only · no customer contact is triggered by a scan.</span>
            </div>
            {error ? <p className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/[0.04] p-4 text-sm text-red-200">{error}</p> : null}
          </form>

          <aside className="rounded-3xl border border-border/70 bg-ink p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-mint">Control rules</p>
            <ol className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <li><b className="text-ice">01.</b> Resolve identity before diagnosis.</li>
              <li><b className="text-ice">02.</b> Preserve source, timestamp and confidence.</li>
              <li><b className="text-ice">03.</b> Provider-scoped search observations are not Google rankings.</li>
              <li><b className="text-ice">04.</b> No public evidence means no invented revenue leakage.</li>
              <li><b className="text-ice">05.</b> HOLD prospects do not receive an outbound snapshot.</li>
            </ol>
          </aside>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-mint">Prospect queue</p>
              <h2 className="mt-1 font-display text-2xl font-black text-ice">Prioritised by evidence, not guesswork.</h2>
            </div>
            <span className="rounded-full border border-border bg-ink px-3 py-1.5 text-xs text-muted-foreground">{rows.length} audits</span>
          </div>

          <div className="mt-5 space-y-3">
            {loading ? <p className="text-sm text-muted-foreground">Loading prospects…</p> : null}
            {!loading && !rows.length ? (
              <div className="rounded-3xl border border-dashed border-border p-8 text-sm text-muted-foreground">No Prospect Intelligence audits yet. Run the first controlled studio scan above.</div>
            ) : null}
            {rows.map((row) => (
              <Link
                key={row.audit.id}
                to="/prospects/$auditId"
                params={{ auditId: row.audit.id }}
                className="grid gap-4 rounded-2xl border border-border/60 bg-ink p-5 transition hover:border-mint/40 md:grid-cols-[minmax(0,1fr)_auto_auto]"
              >
                <div>
                  <p className="font-display text-xl font-black text-ice">{row.studio?.name || row.audit.studio_id}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {row.studio?.primary_location || "Location not established"} · {row.audit.status} · {new Date(row.audit.created_at).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Metric label="Priority" value={row.priority} strong />
                  <Metric label="Score" value={row.score == null ? "—" : String(Math.round(row.score))} />
                  <Metric label="Confidence" value={row.confidence} />
                </div>
                <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                  {row.snapshotReady ? <span className="rounded-full border border-mint/25 bg-mint/[0.06] px-3 py-1.5 text-mint">Snapshot ready</span> : null}
                  <ArrowRight className="h-4 w-4 text-mint" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ name, label, placeholder }: { name: string; label: string; placeholder?: string }) {
  return (
    <label className="block text-sm font-semibold text-ice">
      {label}
      <input
        name={name}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-border bg-ink-deep px-4 py-3 font-normal text-ice outline-none transition placeholder:text-muted-foreground/60 focus:border-mint/60"
      />
    </label>
  );
}

function Metric({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="min-w-[74px] rounded-2xl border border-border bg-ink-deep px-3 py-2 text-center">
      <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-muted-foreground">{label}</p>
      <p className={"mt-1 text-sm font-black " + (strong ? "text-mint" : "text-ice")}>{value}</p>
    </div>
  );
}
