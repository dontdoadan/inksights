import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type ScoringModel = { id: string; model_key: "public_presence" | "verified_commercial"; name: string; version: number };
type ScoreSnapshot = {
  id: string;
  model_id: string;
  score: number | null;
  coverage: number;
  evidence_quality: number | null;
  status: "scored" | "insufficient_data";
  scored_at: string;
};
type ProfileAnswer = { field_key: string };

const MODEL_KEYS = ["public_presence", "verified_commercial"] as const;
const FALLBACK_LABELS = {
  public_presence: "Public Presence Score",
  verified_commercial: "Verified Commercial Performance Score",
};

async function tenantRead<T>(table: string, params: Record<string, string>, token: string): Promise<T[]> {
  const apiUrl = supabase.supabaseUrl;
  const key = supabase.supabaseKey;
  const result = await fetch(`${apiUrl}/rest/v1/${table}?${new URLSearchParams(params)}`, {
    headers: { apikey: key, Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  });
  if (!result.ok) throw new Error(`Scoring profile read failed (${result.status}).`);
  return (await result.json()) as T[];
}

export function StudioScoringPanel({ studioId }: { studioId: string }) {
  const [models, setModels] = useState<ScoringModel[]>([]);
  const [snapshots, setSnapshots] = useState<ScoreSnapshot[]>([]);
  const [answerCount, setAnswerCount] = useState<number | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "unavailable">("loading");

  useEffect(() => {
    let active = true;
    setState("loading");
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Authentication required");
        const [modelRows, snapshotRows, answers] = await Promise.all([
          tenantRead<ScoringModel>("studio_scoring_models", {
            select: "id,model_key,name,version", status: "eq.active", order: "version.desc",
          }, session.access_token),
          tenantRead<ScoreSnapshot>("studio_scoring_snapshots", {
            select: "id,model_id,score,coverage,evidence_quality,status,scored_at",
            studio_id: `eq.${studioId}`, order: "scored_at.desc", limit: "50",
          }, session.access_token),
          tenantRead<ProfileAnswer>("studio_profile_answers", {
            select: "field_key", studio_id: `eq.${studioId}`,
          }, session.access_token),
        ]);
        if (!active) return;
        setModels(modelRows);
        setSnapshots(snapshotRows);
        setAnswerCount(answers.length);
        setState("ready");
      } catch {
        if (active) setState("unavailable");
      }
    })();
    return () => { active = false; };
  }, [studioId]);

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
        Missing evidence is never counted as zero and studio-reported figures are not automatically verified.
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
                {scored ? `${Math.round(snapshot.score!)} / 100` : "Not yet scored"}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                {snapshot
                  ? `${Math.round(snapshot.coverage * 100)}% evidence coverage · ${scored ? "validated score" : "insufficient evidence"} · model v${model?.version ?? "—"}`
                  : "No approved assessment has been calculated."}
              </p>
              {scored && snapshot?.evidence_quality !== null && snapshot?.evidence_quality !== undefined ? (
                <p className="mt-2 text-xs text-muted-foreground">Evidence confidence: {Math.round(snapshot.evidence_quality * 100)}%</p>
              ) : null}
            </div>
          );
        })}
      </div>
      <p className="mt-5 text-xs text-muted-foreground">
        Saved canonical profile fields: {answerCount ?? "—"}. Existing answers can be reused during authenticated onboarding; a reviewed identity link is required to attach anonymous tool submissions.
      </p>
    </section>
  );
}
