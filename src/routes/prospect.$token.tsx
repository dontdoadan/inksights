import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AcquisitionSnapshotView } from "@/features/prospect/components/AcquisitionSnapshotView";
import type { AcquisitionSnapshot } from "@/features/prospect/model";

export const Route = createFileRoute("/prospect/$token")({
  component: ProspectSnapshotPage,
  head: () => ({
    meta: [
      { title: "Studio Intelligence Snapshot — INKSIGHTS" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function ProspectSnapshotPage() {
  const { token } = Route.useParams();
  const [snapshot, setSnapshot] = useState<AcquisitionSnapshot | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/public/prospect-snapshot?token=${encodeURIComponent(token)}`, {
      headers: { accept: "application/json" },
      signal: controller.signal,
      credentials: "same-origin",
    })
      .then(async (response) => {
        const data = await response.json() as { ok?: boolean; snapshot?: AcquisitionSnapshot; error?: string };
        if (!response.ok || !data.snapshot) throw new Error(data.error || "Snapshot unavailable");
        return data.snapshot;
      })
      .then(setSnapshot)
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Snapshot unavailable");
      });
    return () => controller.abort();
  }, [token]);

  if (error) {
    return (
      <main className="min-h-screen bg-ink-deep px-5 py-20 text-center text-foreground">
        <div className="mx-auto max-w-xl rounded-3xl border border-border bg-ink p-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-mint">INKSIGHTS</p>
          <h1 className="mt-4 font-display text-3xl font-black text-ice">Snapshot unavailable</h1>
          <p className="mt-4 text-sm text-muted-foreground">This secure snapshot link is invalid, superseded or no longer available.</p>
        </div>
      </main>
    );
  }

  if (!snapshot) {
    return <main className="min-h-screen bg-ink-deep p-8 text-muted-foreground">Loading Studio Intelligence Snapshot…</main>;
  }

  return (
    <main className="min-h-screen bg-ink-deep px-4 py-6 text-foreground md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        <AcquisitionSnapshotView snapshot={snapshot} />
      </div>
    </main>
  );
}
