import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowDownToLine, CheckCircle2, Database, FileSpreadsheet, LoaderCircle, RefreshCw, ShieldCheck, UploadCloud } from "lucide-react";
import {
  autoMapClientHeaders,
  parseCsv,
  validateClientCsv,
  type ClientCsvField,
  type ClientCsvMapping,
  type CsvParseResult,
} from "@/lib/tool-factory/csv-import";
import {
  createBusinessWorkspace,
  getMyBusinessWorkspaces,
  getRevenueRecoveryOpportunities,
  importRevenueRecoveryClients,
  runRevenueRecoveryAnalysis,
} from "@/lib/revenue-recovery.functions";

type Workspace = Awaited<ReturnType<typeof getMyBusinessWorkspaces>>[number];
type Opportunity = Awaited<ReturnType<typeof getRevenueRecoveryOpportunities>>[number];

const FIELD_OPTIONS: Array<{ key: ClientCsvField; label: string; required?: boolean }> = [
  { key: "sourceRecordId", label: "Source client ID", required: true },
  { key: "displayName", label: "Client display name" },
  { key: "lastCompletedBookingAt", label: "Last completed booking date" },
  { key: "completedSessions", label: "Completed sessions" },
  { key: "futureBookingAt", label: "Next / future booking date" },
  { key: "marketingPermissionState", label: "Marketing permission state" },
  { key: "hasContactRoute", label: "Contact route available" },
];

const OPPORTUNITY_LABELS: Record<string, string> = {
  unconverted_enquiry: "Unconverted enquiry",
  inactive_project: "Inactive project",
  lapsed_client: "Lapsed client",
  outstanding_balance: "Outstanding balance",
  unfilled_capacity: "Unfilled capacity",
};

function formatMoney(minor: number | null) {
  if (minor == null) return "Not estimated";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(minor / 100);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB");
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function RevenueRecoveryPanel() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [parsed, setParsed] = useState<CsvParseResult | null>(null);
  const [mapping, setMapping] = useState<ClientCsvMapping | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const validation = useMemo(
    () => parsed && mapping ? validateClientCsv(parsed, mapping) : null,
    [parsed, mapping],
  );

  async function loadWorkspaceData(selected: Workspace) {
    setWorkspace(selected);
    const rows = await getRevenueRecoveryOpportunities({ data: { workspaceId: selected.id } });
    setOpportunities(rows);
  }

  async function load() {
    setLoading(true);
    setError("");
    try {
      const items = await getMyBusinessWorkspaces();
      setWorkspaces(items);
      if (items.length) {
        await loadWorkspaceData(items[0]);
      } else {
        setWorkspace(null);
        setOpportunities([]);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load Revenue Recovery.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleCreateWorkspace(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const created = await createBusinessWorkspace({
        data: { displayName: workspaceName, businessType: "tattoo_studio" },
      });
      setWorkspaceName("");
      setNotice("Workspace created. Revenue Recovery is enabled in trial mode.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Workspace could not be created.");
    } finally {
      setBusy(false);
    }
  }

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.currentTarget.files?.[0] ?? null;
    setFile(selected);
    setParsed(null);
    setMapping(null);
    setNotice("");
    setError("");
    if (!selected) return;
    if (!selected.name.toLowerCase().endsWith(".csv") || selected.size > 8 * 1024 * 1024) {
      setError("Choose a CSV file no larger than 8 MB.");
      setFile(null);
      return;
    }
    try {
      const result = parseCsv(await selected.text());
      if (result.rows.length > 5000) throw new Error("The CSV exceeds the 5,000-row MVP limit.");
      setParsed(result);
      setMapping(autoMapClientHeaders(result.headers));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The CSV could not be read.");
      setFile(null);
    }
  }

  function updateMapping(field: ClientCsvField, header: string) {
    setMapping((current) => current ? { ...current, [field]: header || null } : current);
  }

  async function handleImport() {
    if (!workspace || !file || !parsed || !mapping || !validation || !validation.validRows.length) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const raw = await file.text();
      const contentSha256 = await sha256(raw + "\n--mapping-v1--\n" + JSON.stringify(mapping));
      const result = await importRevenueRecoveryClients({
        data: {
          workspaceId: workspace.id,
          sourceSystem: "csv",
          fileName: file.name,
          contentSha256,
          rowsTotal: parsed.rows.length,
          rowsInvalid: validation.errors.length,
          clients: validation.validRows,
        },
      });
      const analysis = await runRevenueRecoveryAnalysis({ data: { workspaceId: workspace.id } });
      const rows = await getRevenueRecoveryOpportunities({ data: { workspaceId: workspace.id } });
      setOpportunities(rows);
      setNotice(
        result.status === "already_imported"
          ? "This file and mapping were already imported. The existing analysis was reused."
          : `Imported ${result.rowsImported} client rows; ${result.rowsRejected} invalid rows were skipped. ${analysis.summary ? "Analysis refreshed." : "Analysis complete."}`,
      );
      setFile(null);
      setParsed(null);
      setMapping(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Import or analysis failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleReanalyse() {
    if (!workspace) return;
    setBusy(true);
    setError("");
    try {
      await runRevenueRecoveryAnalysis({ data: { workspaceId: workspace.id } });
      setOpportunities(await getRevenueRecoveryOpportunities({ data: { workspaceId: workspace.id } }));
      setNotice("Analysis refreshed using the current imported records.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Analysis could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-6 rounded-3xl border border-border/60 bg-ink-elev/40 p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-mint text-xs font-bold uppercase tracking-[0.18em]">
            <Database className="h-4 w-4" /> Business Tool Factory
          </div>
          <h2 className="mt-2 font-display text-2xl md:text-3xl font-black">Studio Revenue Recovery</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Import client records, identify inactive relationships and prioritise evidence-backed recovery opportunities.
          </p>
        </div>
        {workspace ? (
          <div className="flex flex-col items-start gap-1 text-xs text-muted-foreground md:items-end">
            <span className="rounded-full border border-mint/30 bg-mint/10 px-3 py-1 font-semibold text-mint">Workspace active</span>
            <span>{workspace.display_name} · {workspace.role}</span>
          </div>
        ) : null}
      </div>

      {error ? (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      ) : null}
      {notice ? (
        <div role="status" className="flex items-start gap-2 rounded-xl border border-mint/30 bg-mint/10 p-3 text-sm text-mint">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {notice}
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground"><LoaderCircle className="h-4 w-4 animate-spin" /> Loading workspace…</div>
      ) : !workspace ? (
        <form onSubmit={handleCreateWorkspace} className="max-w-xl space-y-3 rounded-2xl border border-border/60 bg-background/30 p-5">
          <div>
            <h3 className="font-semibold">Create your studio workspace</h3>
            <p className="mt-1 text-sm text-muted-foreground">Your account will become the workspace owner. Data is isolated from every other studio.</p>
          </div>
          <input
            value={workspaceName}
            onChange={(event) => setWorkspaceName(event.currentTarget.value)}
            required
            minLength={2}
            maxLength={160}
            placeholder="Studio name"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-mint"
          />
          <button type="submit" disabled={busy || workspaceName.trim().length < 2} className="rounded-full bg-mint px-5 py-2.5 text-sm font-bold text-ink-deep disabled:opacity-50">
            {busy ? "Creating…" : "Create workspace"}
          </button>
        </form>
      ) : (
        <>
          {workspaces.length > 1 ? (
            <label className="block max-w-sm text-xs text-muted-foreground">
              Active workspace
              <select
                value={workspace.id}
                onChange={(event) => {
                  const selected = workspaces.find((item) => item.id === event.currentTarget.value);
                  if (selected) void loadWorkspaceData(selected);
                }}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                {workspaces.map((item) => <option key={item.id} value={item.id}>{item.display_name}</option>)}
              </select>
            </label>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/60 bg-background/30 p-4">
              <p className="text-xs text-muted-foreground">Detected opportunities</p>
              <p className="mt-1 font-display text-3xl font-black">{opportunities.length}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/30 p-4">
              <p className="text-xs text-muted-foreground">Evidence-backed value</p>
              <p className="mt-1 font-display text-xl font-bold">Separated from estimates</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/30 p-4">
              <p className="text-xs text-muted-foreground">Outbound actions</p>
              <p className="mt-1 font-display text-xl font-bold">Disabled</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-4 rounded-2xl border border-border/60 bg-background/30 p-5">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-mint" />
                <h3 className="font-semibold">Import client CSV</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                First importer supports client history. Email addresses and phone numbers are not stored. Map a source client ID and optional booking-history columns.
              </p>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-background/40 px-4 py-8 text-center hover:border-mint/60">
                <UploadCloud className="h-7 w-7 text-mint" />
                <span className="text-sm font-semibold">{file?.name ?? "Choose a CSV file"}</span>
                <span className="text-xs text-muted-foreground">CSV · up to 8 MB · maximum 5,000 rows</span>
                <input type="file" accept=".csv,text/csv" onChange={handleFile} className="sr-only" />
              </label>

              {parsed && mapping && validation ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-mint/10 p-3"><strong className="block text-lg text-mint">{validation.validRows.length}</strong>Valid rows</div>
                    <div className="rounded-xl bg-red-500/10 p-3"><strong className="block text-lg text-red-300">{validation.errors.length}</strong>Rows to review</div>
                  </div>
                  <div className="space-y-2">
                    {FIELD_OPTIONS.map((field) => (
                      <label key={field.key} className="grid grid-cols-[1fr_1fr] items-center gap-2 text-xs">
                        <span className="text-muted-foreground">{field.label}{field.required ? " *" : ""}</span>
                        <select
                          value={mapping[field.key] ?? ""}
                          onChange={(event) => updateMapping(field.key, event.currentTarget.value)}
                          className="min-w-0 rounded-lg border border-border bg-background px-2 py-2 text-foreground"
                        >
                          <option value="">Do not import</option>
                          {parsed.headers.map((header) => <option key={header} value={header}>{header}</option>)}
                        </select>
                      </label>
                    ))}
                  </div>
                  {validation.errors.length ? (
                    <div className="max-h-24 overflow-auto rounded-lg bg-red-500/5 p-3 text-xs text-red-200">
                      {validation.errors.slice(0, 5).map((item) => <p key={item.rowNumber}>{item.message}</p>)}
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleImport}
                    disabled={busy || !validation.validRows.length || !mapping.sourceRecordId}
                    className="w-full rounded-full bg-mint px-5 py-3 text-sm font-bold text-ink-deep disabled:opacity-50"
                  >
                    {busy ? "Importing and analysing…" : `Import ${validation.validRows.length} valid rows`}
                  </button>
                </div>
              ) : null}
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-mint" />
                Workspace access is checked on the server. No messages are sent and no bookings or payments are changed.
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-border/60 bg-background/30 p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">Recovery queue</h3>
                <button type="button" onClick={handleReanalyse} disabled={busy} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs font-semibold hover:border-mint disabled:opacity-50">
                  <RefreshCw className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} /> Reanalyse
                </button>
              </div>
              {opportunities.length ? (
                <div className="max-h-[520px] space-y-3 overflow-auto pr-1">
                  {opportunities.map((item) => (
                    <article key={item.id} className="rounded-xl border border-border/60 bg-background/50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-mint">{OPPORTUNITY_LABELS[item.opportunity_type] ?? item.opportunity_type}</span>
                        <span className="rounded-full bg-mint/10 px-2 py-1 text-[10px] font-bold text-mint">Priority {item.priority_score}</span>
                      </div>
                      <h4 className="mt-2 text-sm font-semibold">{item.title}</h4>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.explanation}</p>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-3 text-xs">
                        <span className="font-semibold">{formatMoney(item.value_base_minor)}</span>
                        <span className="text-muted-foreground">{item.value_classification} · {Math.round(item.confidence * 100)}% confidence</span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{item.recommended_action}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                  <Database className="mx-auto h-7 w-7 text-muted-foreground" />
                  <p className="mt-3 text-sm font-semibold">No opportunities yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">Import a client CSV to begin. The first analysis will identify lapsed clients where the data supports it.</p>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            This is an early MVP. The first import supports client history only. Enquiries, projects, bookings, payment reconciliation and capacity imports are next. Modelled opportunity is never reported as recovered revenue.
          </p>
        </>
      )}
    </section>
  );
}
