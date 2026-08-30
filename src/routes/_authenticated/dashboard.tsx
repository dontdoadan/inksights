import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Scenario = {
  id: string;
  name: string;
  inputs: Record<string, number>;
  results: Record<string, number>;
  updated_at: string;
};

type Submission = {
  id: string;
  full_name: string;
  email: string;
  studio_name: string | null;
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
  head: () => ({ meta: [{ title: "Studio Dashboard — INKSIGHT" }] }),
});

const gbp = (n: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);

function Dashboard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    setEmail(userData.user?.email ?? "");
    const uid = userData.user?.id;
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
        .from("audit_submissions")
        .select("id, full_name, email, studio_name, status, created_at")
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
    await supabase.from("profiles").update(next).eq("id", uid);
    load();
  }

  async function deleteScenario(id: string) {
    await supabase.from("scenarios").delete().eq("id", id);
    setScenarios((s) => s.filter((x) => x.id !== id));
  }

  return (
    <div className="min-h-screen bg-ink-deep text-foreground font-sans">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-ink-deep/70 border-b border-border/40">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-mint flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-ink-deep" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              INK<span className="text-mint">SIGHT</span>
            </span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/growth-model" className="text-muted-foreground hover:text-mint">
              Growth Model
            </Link>
            <span className="text-muted-foreground hidden md:inline">{email}</span>
            <button
              onClick={handleSignOut}
              className="rounded-full border border-border px-4 py-1.5 hover:border-mint hover:text-mint transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12 space-y-12">
        <section>
          <h1 className="font-display font-black text-4xl md:text-5xl">
            {profile?.studio_name ? profile.studio_name : "Studio Dashboard"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your growth-model scenarios, audit submissions, and studio profile.
          </p>
        </section>

        {loading ? <p className="text-muted-foreground">Loading…</p> : null}

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-2xl">Saved scenarios</h2>
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
            <div className="grid sm:grid-cols-2 gap-4">
              {scenarios.map((s) => (
                <div key={s.id} className="rounded-2xl border border-border/60 bg-ink-elev/40 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display font-bold text-lg">{s.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Updated {new Date(s.updated_at).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteScenario(s.id)}
                      className="text-xs text-muted-foreground hover:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                  {typeof s.results?.totalYr === "number" ? (
                    <p className="mt-4 font-display font-black text-2xl text-mint">
                      {gbp(s.results.totalYr)}
                    </p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    extra annual studio revenue (modelled)
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-display font-bold text-2xl mb-4">Revenue audit requests</h2>
          {submissions.length === 0 ? (
            <p className="text-muted-foreground text-sm">No audit requests yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-ink-elev/40 text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3">Date</th>
                    <th className="text-left px-4 py-3">Studio</th>
                    <th className="text-left px-4 py-3">Contact</th>
                    <th className="text-left px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="border-t border-border/40">
                      <td className="px-4 py-3">
                        {new Date(sub.created_at).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-4 py-3">{sub.studio_name || "—"}</td>
                      <td className="px-4 py-3">
                        {sub.full_name} · {sub.email}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-mint/10 text-mint px-2 py-0.5 text-xs font-semibold">
                          {sub.status}
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
          <h2 className="font-display font-bold text-2xl mb-4">Studio profile</h2>
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
  onSave: (p: Partial<Profile>) => void;
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
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          studio_name: studioName || null,
          full_name: fullName || null,
          location: location || null,
          artist_count: artistCount === "" ? null : Number(artistCount),
        });
      }}
      className="rounded-2xl border border-border/60 bg-ink-elev/40 p-6 grid sm:grid-cols-2 gap-4"
    >
      <label className="text-sm space-y-1.5">
        <span className="text-muted-foreground">Your name</span>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-full bg-ink-deep border border-border px-4 py-2.5 text-ice focus:outline-none focus:border-mint"
        />
      </label>
      <label className="text-sm space-y-1.5">
        <span className="text-muted-foreground">Studio name</span>
        <input
          value={studioName}
          onChange={(e) => setStudioName(e.target.value)}
          className="w-full rounded-full bg-ink-deep border border-border px-4 py-2.5 text-ice focus:outline-none focus:border-mint"
        />
      </label>
      <label className="text-sm space-y-1.5">
        <span className="text-muted-foreground">Location</span>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full rounded-full bg-ink-deep border border-border px-4 py-2.5 text-ice focus:outline-none focus:border-mint"
        />
      </label>
      <label className="text-sm space-y-1.5">
        <span className="text-muted-foreground">Number of artists</span>
        <input
          type="number"
          min={0}
          value={artistCount}
          onChange={(e) => setArtistCount(e.target.value === "" ? "" : Number(e.target.value))}
          className="w-full rounded-full bg-ink-deep border border-border px-4 py-2.5 text-ice focus:outline-none focus:border-mint"
        />
      </label>
      <div className="sm:col-span-2">
        <button
          type="submit"
          className="rounded-full bg-mint text-ink-deep px-5 py-2.5 font-bold hover:bg-mint-soft transition-colors"
        >
          Save profile
        </button>
      </div>
    </form>
  );
}
