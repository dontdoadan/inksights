import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type StudioChoice = { id: string; name: string };

export function StudioSubmissionClaim({ submissionId, submissionKey }: {
  submissionId: string;
  submissionKey: string | null;
}) {
  const [choices, setChoices] = useState<StudioChoice[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setStatus("idle");
    setNotice("");
    setChoices([]);
    setSelectedId("");
  }, [submissionId, submissionKey]);

  async function saveToStudio() {
    if (status === "saving" || status === "saved" || !submissionKey) return;
    setNotice("");
    setStatus("saving");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setNotice("Sign in to INKSIGHTS, then return to this page to attach your saved result.");
        return;
      }

      const { data: memberships, error: membershipError } = await supabase
        .from("studio_members").select("studio_id").eq("active", true);
      if (membershipError || !memberships?.length) {
        setNotice("Your account has no verified studio membership yet. Claim or verify a studio in your workspace first.");
        return;
      }

      let studioId = selectedId;
      if (!studioId) {
        if (memberships.length === 1) studioId = memberships[0].studio_id;
        else {
          const ids = memberships.map((m) => m.studio_id);
          const { data: studios } = await supabase.from("visibility_studios")
            .select("id,studio_name").in("id", ids);
          const next = (studios ?? []).map((item) => ({ id: item.id, name: item.studio_name }));
          setChoices(next);
          setNotice("Select which of your studios owns this result, then save it.");
          return;
        }
      }
      if (!memberships.some((member) => member.studio_id === studioId)) {
        setNotice("The selected studio is not linked to your account.");
        return;
      }
      const { data, error } = await supabase.functions.invoke("studio-claim-tool-submission", {
        body: { studioId, submissionId, submissionKey },
      });
      if (error || !data || data.ok !== true) {
        throw new Error("The result could not be linked. Your saved result remains available on this page.");
      }
      setSelectedId(studioId);
      setStatus("saved");
      setNotice("Saved against your canonical studio profile as an unverified tool submission.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to link this result.");
    } finally {
      setStatus((current) => current === "saved" ? current : "idle");
    }
  }

  return (
    <div className="mt-5 rounded-xl border border-mint/25 bg-mint/[0.04] p-5">
      <p className="text-sm font-bold text-ice">Keep this result in your studio profile</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Already have an INKSIGHTS studio account? Link this submitted result to your secure profile without entering it again.
        It remains labelled self-reported until verified.
      </p>
      {choices.length > 1 && status !== "saved" ? (
        <label className="mt-4 block text-sm text-ice">
          Select your verified studio
          <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}
            className="mt-2 block w-full rounded-lg border border-border bg-ink px-3 py-2 text-ice">
            <option value="">Choose a studio</option>
            {choices.map((studio) => <option key={studio.id} value={studio.id}>{studio.name}</option>)}
          </select>
        </label>
      ) : null}
      <button type="button" onClick={saveToStudio} disabled={status !== "idle" || !submissionKey}
        className="mt-4 rounded-full border border-mint/50 px-5 py-3 text-sm font-semibold text-mint disabled:opacity-60">
        {status === "saving" ? "Saving…" : status === "saved" ? "Saved to studio" : "Save to my studio profile"}
      </button>
      {notice ? <p className="mt-3 text-sm text-muted-foreground" role="status">{notice}</p> : null}
    </div>
  );
}
