/* eslint-disable @typescript-eslint/no-explicit-any -- knowledge tables/functions land with the paired migration before generated Supabase types are refreshed */
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Database, ShieldCheck, GitBranch, ArrowUpRight, BrainCircuit } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type KnowledgeRow = {
  id: string;
  knowledge_key: string;
  title: string;
  knowledge_type: string;
  domain: string | null;
  truth_state: string;
  authority_level: string;
  status: string;
  summary: string | null;
  canonical_uri: string | null;
  source_system_key: string | null;
  source_version: string | null;
  last_verified_at: string | null;
  score: number;
};

const db = supabase as any;

export const Route = createFileRoute("/_authenticated/knowledge")({
  component: KnowledgeConsole,
  head: () => ({
    meta: [
      { title: "Knowledge — INKSIGHTS" },
      { name: "robots", content: "noindex,nofollow" },
      {
        name: "description",
        content: "Founder-only INKSIGHTS knowledge and control plane.",
      },
    ],
  }),
});

const QUICK = [
  "Search Intelligence",
  "current product offer and pricing",
  "brand authority and report template",
  "studio intelligence methodology",
  "current architecture and production blockers",
];

function KnowledgeConsole() {
  const [role, setRole] = useState<string | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);
  const [query, setQuery] = useState("Search Intelligence");
  const [results, setResults] = useState<KnowledgeRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");
  const [counts, setCounts] = useState({ total: 0, current: 0, proposed: 0 });

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!active || !auth.user) {
        setLoadingRole(false);
        return;
      }
      const { data } = await db
        .from("platform_admins")
        .select("role, active")
        .eq("user_id", auth.user.id)
        .maybeSingle();
      if (active && data?.active && ["owner", "admin"].includes(data.role)) setRole(data.role);
      setLoadingRole(false);
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!role) return;
    void loadCounts();
    void runSearch("Search Intelligence");
  }, [role]);

  async function loadCounts() {
    const [total, current, proposed] = await Promise.all([
      db.from("knowledge_items").select("id", { count: "exact", head: true }),
      db.from("knowledge_items").select("id", { count: "exact", head: true }).eq("truth_state", "current").eq("status", "active"),
      db.from("knowledge_items").select("id", { count: "exact", head: true }).eq("truth_state", "proposed").eq("status", "active"),
    ]);
    setCounts({
      total: total.count ?? 0,
      current: current.count ?? 0,
      proposed: proposed.count ?? 0,
    });
  }

  async function runSearch(next = query) {
    const value = next.trim();
    if (!value) return;
    setQuery(value);
    setSearching(true);
    setMessage("");
    const { data, error } = await db.rpc("search_knowledge", {
      p_query: value,
      p_domain: null,
      p_truth_states: ["current", "intended", "proposed"],
      p_limit: 20,
    });
    if (error) {
      setMessage(error.message);
      setResults([]);
    } else {
      setResults((data ?? []) as KnowledgeRow[]);
      if ((data ?? []).length === 0) setMessage("No governed match found. Treat this as UNKNOWN, not proof that the capability does not exist.");
    }
    setSearching(false);
  }

  if (loadingRole) {
    return <div className="min-h-screen bg-ink-deep text-foreground p-10">Checking access…</div>;
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-ink-deep text-foreground p-10">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-ink p-8">
          <h1 className="font-display text-3xl font-black text-ice">Founder knowledge is restricted.</h1>
          <p className="mt-3 text-muted-foreground">An active platform owner/admin role is required.</p>
          <Link to="/dashboard" className="mt-6 inline-flex text-mint hover:underline">Return to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-deep text-foreground">
      <header className="border-b border-border/50 bg-ink-deep/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-mint">Founder control plane</p>
            <h1 className="mt-1 font-display text-2xl font-black text-ice">INKSIGHTS Knowledge</h1>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/dashboard" className="text-muted-foreground hover:text-mint">Dashboard</Link>
            <Link to="/workspace" className="text-muted-foreground hover:text-mint">Workspace</Link>
            <span className="rounded-full border border-mint/30 bg-mint/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-mint">{role}</span>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-6 py-10">
        <section className="grid gap-4 md:grid-cols-3">
          <Stat icon={<Database className="h-5 w-5" />} label="Indexed knowledge" value={counts.total} />
          <Stat icon={<ShieldCheck className="h-5 w-5" />} label="Current truth" value={counts.current} />
          <Stat icon={<GitBranch className="h-5 w-5" />} label="Proposed / review" value={counts.proposed} />
        </section>

        <section className="rounded-3xl border border-border bg-ink p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-mint/20 bg-mint/5 p-3 text-mint"><BrainCircuit /></div>
            <div>
              <h2 className="font-display text-3xl font-black text-ice">Ask the system, not the chat history.</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Search current governed knowledge. CURRENT and canonical/active sources rank above candidate material. A zero-result search is a data gap, not proof of absence.
              </p>
            </div>
          </div>

          <form
            className="mt-7 flex flex-col gap-3 md:flex-row"
            onSubmit={(event) => { event.preventDefault(); void runSearch(); }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-2xl border border-border bg-ink-deep py-4 pl-12 pr-4 text-ice outline-none transition focus:border-mint"
                placeholder="What do we already know or have built?"
              />
            </div>
            <button disabled={searching} className="rounded-2xl bg-mint px-6 py-4 font-bold text-ink-deep disabled:opacity-60">
              {searching ? "Searching…" : "Search knowledge"}
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK.map((item) => (
              <button key={item} type="button" onClick={() => void runSearch(item)} className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-mint/50 hover:text-mint">
                {item}
              </button>
            ))}
          </div>
        </section>

        {message ? <p className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm text-amber-100">{message}</p> : null}

        <section className="space-y-3">
          {results.map((item) => (
            <article key={item.id} className="rounded-2xl border border-border bg-ink p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{item.truth_state}</Badge>
                    <Badge>{item.authority_level}</Badge>
                    {item.domain ? <Badge>{item.domain}</Badge> : null}
                    <span className="text-xs text-muted-foreground">{item.knowledge_type}</span>
                  </div>
                  <h3 className="mt-3 font-display text-xl font-black text-ice">{item.title}</h3>
                  {item.summary ? <p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted-foreground">{item.summary}</p> : null}
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>{item.knowledge_key}</span>
                    {item.source_system_key ? <span>source: {item.source_system_key}</span> : null}
                    {item.source_version ? <span>v{item.source_version}</span> : null}
                    {item.last_verified_at ? <span>verified {new Date(item.last_verified_at).toLocaleDateString("en-GB")}</span> : null}
                    <span>score {Number(item.score).toFixed(2)}</span>
                  </div>
                </div>
                {item.canonical_uri ? (
                  <a href={item.canonical_uri} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-mint/30 px-3 py-2 text-xs font-bold text-mint hover:bg-mint/5">
                    Canonical source <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-border/70 bg-ink-elev/30 p-5 text-sm text-muted-foreground">
          <strong className="text-ice">Operating rule:</strong> before designing something new, use the MCP capability check against live ops state. Search results support decisions; they do not replace the owning live system when current implementation state matters.
        </section>
      </main>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-ink p-5">
      <div className="flex items-center gap-2 text-mint">{icon}<span className="text-xs font-bold uppercase tracking-[0.14em]">{label}</span></div>
      <div className="mt-3 font-display text-4xl font-black text-ice">{value}</div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground">{children}</span>;
}
