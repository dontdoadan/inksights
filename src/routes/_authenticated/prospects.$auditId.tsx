import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clipboard, ExternalLink, Loader2, Send, ShieldAlert } from "lucide-react";
import { AuditReport } from "@/features/audit/components/AuditReport";
import { AuditRunTimeline } from "@/features/audit/components/AuditRunTimeline";
import {
  handoffProspectToCrm,
  loadProspectBundle,
  publishProspectSnapshot,
} from "@/features/prospect/queries";
import type { AuditBundle } from "@/features/audit/types";

export const Route = createFileRoute("/_authenticated/prospects/$auditId")({
  component: ProspectDetailPage,
  head: () => ({ meta: [{ title: "Prospect Dossier — INKSIGHTS" }] }),
});

function ProspectDetailPage() {
  const { auditId } = Route.useParams();
  const [data, setData] = useState<AuditBundle | null>(null);
  const [error, setError] = useState("");
  const [snapshotBusy, setSnapshotBusy] = useState(false);
  const [crmBusy, setCrmBusy] = useState(false);
  const [snapshotUrl, setSnapshotUrl] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    loadProspectBundle(auditId)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, [auditId]);

  const score = useMemo(
    () => data?.metrics.find((metric) => metric.metric_key === "prospect_acquisition_score") ?? null,
    [data],
  );
  const priority = String(score?.provenance?.["priority"] ?? "PENDING");
  const qualificationReason = String(score?.provenance?.["qualification_reason"] ?? "");
  const factors = (score?.provenance?.["factors"] ?? {}) as Record<string, number>;
  const prospectFindings = data?.findings.filter((finding) => finding.finding_key.startsWith("prospect_")) ?? [];
  const identity = (data?.audit.context?.["prospect_identity"] ?? {}) as Record<string, unknown>;

  async function generateSnapshot() {
    setSnapshotBusy(true);
    setStatusMessage("");
    try {
      const result = await publishProspectSnapshot(auditId);
      const url = window.location.origin + result.snapshotPath;
      setSnapshotUrl(url);
      setStatusMessage("A new secure snapshot link was generated. Any previous snapshot link for this audit was superseded.");
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : "Snapshot generation failed");
    } finally {
      setSnapshotBusy(false);
    }
  }

  async function crmHandoff(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setCrmBusy(true);
    setStatusMessage("");
    try {
      const result = await handoffProspectToCrm(
        auditId,
        String(form.get("contact_name") || ""),
        String(form.get("contact_email") || ""),
        String(form.get("phone") || ""),
      );
      const dealId = result.hubspot?.deal_id ? ` Deal ${result.hubspot.deal_id}.` : "";
      setStatusMessage(`Prospect handed to HubSpot successfully.${dealId}`);
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : "CRM handoff failed");
    } finally {
      setCrmBusy(false);
    }
  }

  if (error) return <main className="min-h-screen bg-ink-deep p-8 text-red-200">{error}</main>;
  if (!data) return <main className="min-h-screen bg-ink-deep p-8 text-muted-foreground">Loading prospect dossier…</main>;

  return (
    <main className="min-h-screen bg-ink-deep px-5 py-8 text-foreground md:px-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/prospects" className="rounded-full border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:text-mint">← Prospects</Link>
            <span className="text-xs font-black uppercase tracking-[0.14em] text-mint">Internal acquisition dossier</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <Pill label="Priority" value={priority} mint />
            <Pill label="Score" value={score?.value_numeric == null ? "—" : String(Math.round(score.value_numeric))} />
            <Pill label="Confidence" value={score?.confidence || "—"} />
            <Pill label="Audit" value={data.audit.status} />
          </div>
        </div>

        <section className="mb-6 rounded-3xl border border-mint/20 bg-ink p-6 md:p-8">
          <div className="grid gap-7 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,.9fr)]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-mint">Acquisition decision</p>
              <h1 className="mt-2 font-display text-4xl font-black text-ice">{data.studio.name}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {qualificationReason || "Prospect scoring is pending."}
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  ["Evidence", factors.evidence_readiness],
                  ["Opportunity", factors.addressable_opportunity],
                  ["INKSIGHTS fit", factors.inksights_fit],
                  ["Public maturity", factors.public_maturity_signal],
                  ["Contactability", factors.contactability],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-2xl border border-border bg-ink-deep p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground">{label}</p>
                    <p className="mt-2 font-display text-2xl font-black text-ice">{typeof value === "number" ? Math.round(value) : "—"}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-border/70 bg-ink-deep p-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-mint">Identity state</p>
              <dl className="mt-4 space-y-3 text-sm">
                <Row label="Website" value={data.studio.website_url || "Unknown"} />
                <Row label="Location" value={data.studio.primary_location || "Unknown"} />
                <Row label="Candidate" value={String(identity["candidateId"] ?? "—")} />
                <Row label="Match method" value={String(identity["matchMethod"] ?? "—")} />
                <Row label="Identity confidence" value={identity["identityConfidence"] == null ? "—" : String(Math.round(Number(identity["identityConfidence"]) * 100)) + "%"} />
              </dl>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <AuditReport data={data} />
          <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
            <div className="rounded-3xl border border-border/70 bg-ink p-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-mint">Outbound snapshot</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Generates a curated public-evidence preview. Priority HOLD, weak identity or insufficient findings are deliberately blocked.
              </p>
              <button
                onClick={() => void generateSnapshot()}
                disabled={snapshotBusy}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-mint px-4 py-3 text-sm font-black text-ink-deep disabled:opacity-50"
              >
                {snapshotBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                Generate Studio Intelligence Snapshot
              </button>
              {snapshotUrl ? (
                <div className="mt-4 rounded-2xl border border-mint/20 bg-mint/[0.04] p-4">
                  <p className="break-all text-xs text-muted-foreground">{snapshotUrl}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => navigator.clipboard.writeText(snapshotUrl)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-bold text-ice hover:text-mint"
                    >
                      <Clipboard className="h-3.5 w-3.5" /> Copy
                    </button>
                    <a target="_blank" rel="noreferrer" href={snapshotUrl} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-bold text-ice hover:text-mint">
                      Open <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              ) : null}
            </div>

            <form onSubmit={crmHandoff} className="rounded-3xl border border-border/70 bg-ink p-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-mint">CRM handoff</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Only do this after identifying a real decision-maker. The scan itself never contacts the studio.
              </p>
              <div className="mt-4 space-y-3">
                <Input name="contact_name" label="Decision-maker name" defaultValue={String(identity["contactName"] ?? "")} required />
                <Input name="contact_email" type="email" label="Email" defaultValue={String(identity["contactEmail"] ?? "")} required />
                <Input name="phone" label="Phone (optional)" />
              </div>
              <button
                disabled={crmBusy || priority === "HOLD"}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-mint/30 bg-mint/[0.06] px-4 py-3 text-sm font-black text-mint disabled:cursor-not-allowed disabled:opacity-40"
              >
                {crmBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Add qualified prospect to HubSpot
              </button>
              {priority === "HOLD" ? (
                <p className="mt-3 flex gap-2 text-xs leading-relaxed text-amber-200">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" /> HOLD prospects are blocked from CRM handoff until stronger evidence is established.
                </p>
              ) : null}
            </form>

            {statusMessage ? (
              <div className="rounded-2xl border border-mint/20 bg-mint/[0.04] p-4 text-sm leading-relaxed text-muted-foreground">
                <CheckCircle2 className="mb-2 h-4 w-4 text-mint" /> {statusMessage}
              </div>
            ) : null}

            <div className="rounded-3xl border border-border/70 bg-ink p-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-mint">Run timeline</p>
              <div className="mt-5"><AuditRunTimeline runs={data.runs} /></div>
            </div>

            <div className="rounded-3xl border border-border/70 bg-ink p-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-mint">Prospect findings</p>
              <div className="mt-4 space-y-3">
                {prospectFindings.map((finding) => (
                  <div key={finding.id} className="rounded-2xl border border-border bg-ink-deep p-4">
                    <p className="text-sm font-bold text-ice">{finding.title}</p>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{finding.statement}</p>
                    <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.13em] text-mint">{finding.classification} · {finding.confidence}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Pill({ label, value, mint = false }: { label: string; value: string; mint?: boolean }) {
  return <span className={"rounded-full border px-3 py-2 " + (mint ? "border-mint/30 bg-mint/10 font-bold text-mint" : "border-border bg-ink text-muted-foreground")}>{label} {value}</span>;
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="grid grid-cols-[110px_1fr] gap-3"><dt className="text-muted-foreground">{label}</dt><dd className="break-all text-ice">{value}</dd></div>;
}

function Input({ name, label, type = "text", defaultValue = "", required = false }: { name: string; label: string; type?: string; defaultValue?: string; required?: boolean }) {
  return (
    <label className="block text-xs font-bold text-ice">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="mt-2 w-full rounded-xl border border-border bg-ink-deep px-3 py-2.5 font-normal text-ice outline-none focus:border-mint/60"
      />
    </label>
  );
}
