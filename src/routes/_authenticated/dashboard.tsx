import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Scenario = {
  id: string;
  name: string;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
  updated_at: string;
};

type Submission = {
  id: string;
  name: string;
  email: string;
  studio_name: string;
  status: string;
  created_at: string;
};

type Profile = {
  full_name: string | null;
  studio_name: string | null;
  location: string | null;
  artist_count: number | null;
  onboarding_stage: string;
};

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Studio Dashboard — INKSIGHTS" }] }),
});

const gbp = (n: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);

function scenarioUplift(results: Record<string, unknown>) {
  const canonical = results.combinedRevenueUplift;
  if (typeof canonical === "number") return canonical;

  const legacy = results.totalYr;
  return typeof legacy === "number" ? legacy : null;
}

function Dashboard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const currentEmail = userData.user?.email ?? "";
    const uid = userData.user?.id;
    setEmail(currentEmail);

    if (!uid) {
      setLoading(false);
      return;
    }

    const [{ data: p }, { data: s }, { data: sub }] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, studio_name, location, artist_count, onboarding_stage")
        .eq("id", uid)
        .maybeSingle(),
      supabase
        .from("scenarios")
        .select("id, name, inputs, results, updated_at")
        .order("updated_at", { ascending: false }),
      supabase
        .from("revenue_audit_leads")
        .select("id, name, email, studio_name, status, created_at")
        .eq("email", currentEmail)
        .order("created_at", { ascending: false }),
    ]);

    setProfile(p as Profile | null);
    setScenarios((s ?? []) as Scenario[]);
    setSubmissions((sub ?? []) as Submission[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  async function saveProfile(next: Partial<Profile>) {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) return;

    const { error } = await supabase.from("profiles").upsert({
      id: uid,
      ...next,
      updated_at: new Date().toISOString(),
    });

    if (!error) await load();
  }

  async function deleteScenario(id: string) {
    const { error } = await supabase.from("scenarios").delete().eq("id", id);
    if (!error) setScenarios((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="min-h-screen bg-ink-deep text-foreground font-sans">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-ink-deep/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-mint">
              <div className="h-3 w-3 rounded-full bg-ink-deep" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              INK<span className="text-mint">SIGHTS</span>
            </span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/growth-model" className="text-muted-foreground hover:text-mint">
              Growth Model
            </Link>
            <span className="hidden text-muted-foreground md:inline">{email}</span>
            <button
              onClick={handleSignOut}
              className="rounded-full border border-border px-4 py-1.5 transition-colors hover:border-mint hover:text-mint"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-12 px-6 py-12">
        <section>
          <h1 className="font-display text-4xl font-black md:text-5xl">
            {profile?.studio_name ? profile.studio_name : "Studio Dashboard"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your growth-model scenarios, revenue audit requests and studio profile.
          </p>
        </section>

        {loading ? <p className="text-muted-foreground">Loading…</p> : null}

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">Saved scenarios</h2>
            <Link to="/growth-model" className="text-sm text-mint hover:underline">
              + Build a new scenario
            </Link>
          </div>
          {scenarios.length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-ink-elev/40 p-8 text-center">
              <p className="text-muted-foreground">
                No scenarios saved yet. Head to the{" "}
                <Link to="/growth-model" className="text-mint hover:underline">
                  Growth Model
                </Link>{" "}
                page and save one — it will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {scenarios.map((scenario) => {
                const uplift = scenarioUplift(scenario.results);
                return (
                  <div
                    key={scenario.id}
                    className="rounded-2xl border border-border/60 bg-ink-elev/40 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-lg font-bold">{scenario.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Updated {new Date(scenario.updated_at).toLocaleDateString("en-GB")}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteScenario(scenario.id)}
                        className="text-xs text-muted-foreground hover:text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                    {uplift !== null ? (
                      <p className="mt-4 font-display text-2xl font-black text-mint">
                        {gbp(uplift)}
                      </p>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                      extra annual studio revenue (modelled)
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 font-display text-2xl font-bold">Your revenue audit requests</h2>
          {submissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No audit requests yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-ink-elev/40 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Studio</th>
                    <th className="px-4 py-3 text-left">Contact</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="border-t border-border/40">
                      <td className="px-4 py-3">
                        {new Date(submission.created_at).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-4 py-3">{submission.studio_name}</td>
                      <td className="px-4 py-3">
                        {submission.name} · {submission.email}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-mint/10 px-2 py-0.5 text-xs font-semibold text-mint">
                          {submission.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 font-display text-2xl font-bold">Studio profile</h2>
          <ProfileForm profile={profile} onSave={saveProfile} />
        </section>
      </main>
    </div>
  );
}

function ProfileForm({
  profile,
  onSave,
}: {
  profile: Profile | null;
  onSave: (profile: Partial<Profile>) => void;
}) {
  const [studioName, setStudioName] = useState(profile?.studio_name ?? "");
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [location, setLocation] = useState(profile?.location ?? "");
  const [artistCount, setArtistCount] = useState<number | "">(profile?.artist_count ?? "");

  useEffect(() => {
    setStudioName(profile?.studio_name ?? "");
    setFullName(profile?.full_name ?? "");
    setLocation(profile?.location ?? "");
    setArtistCount(profile?.artist_count ?? "");
  }, [profile]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          studio_name: studioName || null,
          full_name: fullName || null,
          location: location || null,
          artist_count: artistCount === "" ? null : Number(artistCount),
        });
      }}
      className="grid gap-4 rounded-2xl border border-border/60 bg-ink-elev/40 p-6 sm:grid-cols-2"
    >
      <label className="space-y-1.5 text-sm">
        <span className="text-muted-foreground">Your name</span>
        <input
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className="w-full rounded-full border border-border bg-ink-deep px-4 py-2.5 text-ice focus:border-mint focus:outline-none"
        />
      </label>
      <label className="space-y-1.5 text-sm">
        <span className="text-muted-foreground">Studio name</span>
        <input
          value={studioName}
          onChange={(event) => setStudioName(event.target.value)}
          className="w-full rounded-full border border-border bg-ink-deep px-4 py-2.5 text-ice focus:border-mint focus:outline-none"
        />
      </label>
      <label className="space-y-1.5 text-sm">
        <span className="text-muted-foreground">Location</span>
        <input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          className="w-full rounded-full border border-border bg-ink-deep px-4 py-2.5 text-ice focus:border-mint focus:outline-none"
        />
      </label>
      <label className="space-y-1.5 text-sm">
        <span className="text-muted-foreground">Number of artists</span>
        <input
          type="number"
          min={0}
          value={artistCount}
          onChange={(event) =>
            setArtistCount(event.target.value === "" ? "" : Number(event.target.value))
          }
          className="w-full rounded-full border border-border bg-ink-deep px-4 py-2.5 text-ice focus:border-mint focus:outline-none"
        />
      </label>
      <div className="sm:col-span-2">
        <button
          type="submit"
          className="rounded-full bg-mint px-5 py-2.5 font-bold text-ink-deep transition-colors hover:bg-mint-soft"
        >
          Save profile
        </button>
      </div>
    </form>
  );
}
