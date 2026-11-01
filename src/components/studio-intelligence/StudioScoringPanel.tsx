import { type FormEvent, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { resolveSupabaseConfig } from "@/integrations/supabase/config.mjs";

type ScoringModel = { id: string; model_key: "public_presence" | "verified_commercial"; name: string; version: number };
type ScoreSnapshot = {
  id: string; model_id: string; score: number | null; coverage: number;
  evidence_quality: number | null; status: "scored" | "insufficient_data"; scored_at: string;
};
type ProfileAnswer = {
  field_key: string; value_json: unknown; verification_status: "unverified" | "verified" | "disputed";
  measurement_start: string | null;
};
const MODEL_KEYS = ["public_presence", "verified_commercial"] as const;
const FALLBACK_LABELS = {
  public_presence: "Public Presence Score",
  verified_commercial: "Verified Commercial Performance Score",
};
const QUESTIONS = [
  { key: "monthly_qualified_enquiries", label: "Qualified enquiries", hint: "Only genuine client enquiries", step: "1", max: 100000 },
  { key: "monthly_paid_bookings_from_month_enquiries_from_month_enquiries", label: "Converted enquiries", hint: "Those same enquiries that resulted in a paid booking", step: "1", max: 100000 },
  { key: "monthly_sellable_artist_hours", label: "Available artist hours", hint: "Total hours offered for paid tattoo work", step: "0.5", max: 100000 },
  { key: "monthly_billable_artist_hours", label: "Booked billable hours", hint: "Actual paid tattooing time", step: "0.5", max: 100000 },
  { key: "monthly_tattoo_revenue_gbp", label: "Tattoo revenue (£)", hint: "Gross tattoo service revenue, not including tips", step: "0.01", max: 100000000 },
] as const;
type FieldKey = (typeof QUESTIONS)[number]["key"];
type InputValues = Partial<Record<FieldKey, string>>;

function publicConfig() {
  const processEnv = typeof process !== "undefined" ? process.env : undefined;
  return resolveSupabaseConfig(import.meta.env, processEnv);
}

async function tenantRead<T>(table: string, params: Record<string, string>, token: string): Promise<T[]> {
  const { url, publishableKey } = publicConfig();
  const result = await fetch(`${url}/rest/v1/${table}?${new URLSearchParams(params)}`, {
    headers: { apikey: publishableKey, Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  });
  if (!result.ok) throw new Error(`Scoring profile read failed (${result.status}).`);
  return (await result.json()) as T[];
}

export function StudioScoringPanel({ studioId }: { studioId: string }) {
  const [models, setModels] = useState<ScoringModel[]>([]);
  const [snapshots, setSnapshots] = useState<ScoreSnapshot[]>([]);
  const [answers, setAnswers] = useState<ProfileAnswer[]>([]);
  const [inputs, setInputs] = useState<InputValues>({});
  const [reportingMonth, setReportingMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [state, setState] = useState<"loading" | "ready" | "unavailable">("loading");
  const [saving, setSaving] = useState(false);
  const [noticeAccepted, setNoticeAccepted] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setState("loading");
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Authentication required");
        const [modelRows, snapshotRows, savedAnswers] = await Promise.all([
          tenantRead<ScoringModel>("studio_scoring_models", {
            select: "id,model_key,name,version", status: "eq.active", order: "version.desc",
          }, session.access_token),
          tenantRead<ScoreSnapshot>("studio_scoring_snapshots", {
            select: "id,model_id,score,coverage,evidence_quality,status,scored_at",
            studio_id: `eq.${studioId}`, order: "scored_at.desc", limit: "50",
          }, session.access_token),
          tenantRead<ProfileAnswer>("studio_profile_answers", {
            select: "field_key,value_json,verification_status,measurement_start",
            studio_id: `eq.${studioId}`,
          }, session.access_token),
        ]);
        if (!active) return;
        setModels(modelRows);
        setSnapshots(snapshotRows);
        setAnswers(savedAnswers);
        const initial: InputValues = {};
        for (const question of QUESTIONS) {
          const saved = savedAnswers.find((answer) => answer.field_key === question.key);
          if (saved && typeof saved.value_json === "number") initial[question.key] = String(saved.value_json);
        }
        setInputs(initial);
        const latestPeriod = savedAnswers.find((answer) => QUESTIONS.some((q) => q.key === answer.field_key))?.measurement_start;
        if (latestPeriod) setReportingMonth(latestPeriod.slice(0, 7));
        setState("ready");
      } catch {
        if (active) setState("unavailable");
      }
    })();
    return () => { active = false; };
  }, [studioId]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaveNotice(null);
    if (!noticeAccepted) {
      setSaveNotice("Please acknowledge how studio measurements will be used before submitting."); return;
    }
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(reportingMonth)) {
      setSaveNotice("Select a valid reporting month."); return;
    }
    const normalized = QUESTIONS.flatMap((question) => {
      const raw = inputs[question.key]?.trim() ?? "";
      if (raw === "") return [];
      const value = Number(raw);
      return [{ key: question.key, value, max: question.max, step: Number(question.step) }];
    });
    if (!normalized.length) { setSaveNotice("Enter at least one measurement."); return; }
    if (normalized.some(({ value, max, step }) =>
      !Number.isFinite(value) || value < 0 || value > max || Math.abs(value / step - Math.round(value / step)) > 1e-7
    )) {
      setSaveNotice("Enter non-negative figures within the stated ranges."); return;
    }
    const get = (key: FieldKey) => normalized.find((item) => item.key === key)?.value;
    if (get("monthly_qualified_enquiries") !== undefined && get("monthly_paid_bookings_from_month_enquiries_from_month_enquiries") !== undefined &&
      get("monthly_paid_bookings_from_month_enquiries")! > get("monthly_qualified_enquiries")!) {
      setSaveNotice("Converted enquiries cannot exceed their original qualified enquiry cohort."); return;
    }
    if (get("monthly_sellable_artist_hours") !== undefined && get("monthly_billable_artist_hours") !== undefined &&
      get("monthly_billable_artist_hours")! > get("monthly_sellable_artist_hours")!) {
      setSaveNotice("Booked billable hours cannot exceed available hours."); return;
    }
    const [year, month] = reportingMonth.split("-").map(Number);
    const start = `${reportingMonth}-01`;
    const end = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
    const changes = normalized.filter(({ key, value }) =>
      !answers.some((answer) => answer.field_key === key && answer.value_json === value &&
        answer.measurement_start === start));
    if (!changes.length) { setSaveNotice("These measurements are already saved."); return; }
    const locked = changes.filter(({ key }) =>
      answers.some((answer) => answer.field_key === key && answer.verification_status !== "unverified"));
    if (locked.length) {
      setSaveNotice("Reviewed or disputed fields cannot be changed here. Contact INKSIGHTS to request a correction."); return;
    }
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Your session has expired. Please sign in again.");
      const rows = changes.map(({ key, value }) => ({
        studio_id: studioId, field_key: key, value_json: value,
        source_type: "studio_reported", verification_status: "unverified",
        measurement_start: start, measurement_end: end,
        data_notice_version: "2026-11-profile-v1", notice_acknowledged_at: new Date().toISOString(),
        answered_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      const { url, publishableKey } = publicConfig();
      const response = await fetch(`${url}/rest/v1/studio_profile_answers?on_conflict=studio_id,field_key`, {
        method: "POST",
        headers: {
          apikey: publishableKey, Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify(rows),
      });
      if (!response.ok) throw new Error("Unable to save. Ensure your studio membership is active and no reviewed fields have changed.");
      const saved = await tenantRead<ProfileAnswer>("studio_profile_answers", {
        select: "field_key,value_json,verification_status,measurement_start", studio_id: `eq.${studioId}`,
      }, session.access_token);
      setAnswers(saved);
      setSaveNotice("Measurements saved to this studio's canonical profile as unverified self-reported data.");
    } catch (error) {
      setSaveNotice(error instanceof Error ? error.message : "Profile save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (state === "loading") {
    return <p className="mt-6 rounded-2xl border border-border bg-ink p-5 text-sm text-muted-foreground">Loading studio scoring profiles…</p>;
  }
  if (state === "unavailable") {
    return <p className="mt-6 rounded-2xl border border-border bg-ink p-5 text-sm text-muted-foreground">Scoring profiles are not yet available for this studio. No score has been inferred.</p>;
  }

  return (
    <section className="mt-6 rounded-3xl border border-border/60 bg-ink p-7 md:p-9" aria-labelledby="studio-scoring-heading">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">Evidence-gated commercial intelligence</p>
      <h2 id="studio-scoring-heading" className="mt-2 font-display text-2xl font-black text-ice">Studio scoring profiles</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Public presence and verified commercial performance are independent assessments of the same studio identity.
        Missing evidence is never counted as zero. Self-reported figures are not automatically verified.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {MODEL_KEYS.map((key) => {
          const model = models.find((entry) => entry.model_key === key);
          const snapshot = model ? snapshots.find((entry) => entry.model_id === model.id) : undefined;
          const scored = snapshot?.status === "scored" && snapshot.score !== null;
          return (
            <div key={key} className="rounded-2xl border border-border bg-ink-deep p-6">
              <p className="text-sm font-bold text-ice">{model?.name || FALLBACK_LABELS[key]}</p>
              <p className="mt-4 font-display text-4xl font-black text-mint">
                {scored ? `${Math.round(snapshot?.score ?? 0)} / 100` : "Not yet scored"}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                {snapshot
                  ? `${Math.round(snapshot.coverage * 100)}% evidence coverage · ${scored ? "validated score" : "insufficient evidence"} · model v${model?.version ?? "—"}`
                  : "No approved assessment has been calculated."}
              </p>
              {scored && snapshot?.evidence_quality != null
                ? <p className="mt-2 text-xs text-muted-foreground">Evidence confidence: {Math.round(snapshot.evidence_quality * 100)}%</p> : null}
            </div>
          );
        })}
      </div>
      <form onSubmit={saveProfile} className="mt-7 rounded-2xl border border-border bg-ink-deep p-5 md:p-6">
        <h3 className="text-lg font-bold text-ice">Progressive studio profile</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Previously saved values are prefilled. Submit only updated or new figures. These are stored as self-reported
          measurements and require verification before contributing to the verified scoring model.
        </p>
        <div className="mt-5">
          <label htmlFor="profile-reporting-month" className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reporting month</label>
          <input id="profile-reporting-month" type="month" value={reportingMonth} onChange={(e) => setReportingMonth(e.target.value)}
            className="mt-2 rounded-lg border border-border bg-ink px-3 py-2 text-ice"/>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {QUESTIONS.map((question) => {
            const existing = answers.find((answer) => answer.field_key === question.key);
            const locked = existing?.verification_status === "verified" || existing?.verification_status === "disputed";
            return (
              <label key={question.key} className="block rounded-xl border border-border/50 p-4">
                <span className="text-sm font-semibold text-ice">{question.label}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{question.hint}</span>
                <input type="number" min="0" max={question.max} step={question.step} disabled={locked}
                  value={inputs[question.key] ?? ""} onChange={(event) =>
                    setInputs((current) => ({ ...current, [question.key]: event.target.value }))}
                  className="mt-3 w-full rounded-lg border border-border bg-ink px-3 py-2 text-ice disabled:opacity-50"
                  aria-label={question.label}/>
                <span className="mt-2 block text-xs text-muted-foreground">
                  {existing ? `Saved · ${existing.verification_status}` : "Not yet supplied"}
                </span>
              </label>
            );
          })}
        </div>
        <label className="mt-5 flex items-start gap-3 text-sm text-muted-foreground">
          <input type="checkbox" checked={noticeAccepted} onChange={(event) => setNoticeAccepted(event.target.checked)}
            className="mt-1 accent-emerald-300" />
          <span>I understand that INKSIGHTS will store and analyse these studio measurements to produce business
            intelligence and, subject to the stated privacy terms, de-identified aggregated benchmarks.
            This does not provide marketing consent. Read the <a className="underline text-mint" href="/privacy">privacy notice</a>.
          </span>
        </label>
        {saveNotice ? <p role="status" className="mt-4 text-sm text-muted-foreground">{saveNotice}</p> : null}
        <button type="submit" disabled={saving}
          className="mt-5 rounded-full bg-mint px-6 py-3 text-sm font-bold text-ink-deep disabled:opacity-50">
          {saving ? "Saving…" : "Submit studio measurements"}
        </button>
      </form>
      <p className="mt-4 text-xs text-muted-foreground">
        Stored profile fields: {answers.length}. Public tool submissions without an authenticated studio membership
        remain separate until the studio identity has been independently confirmed.
      </p>
    </section>
  );
}
