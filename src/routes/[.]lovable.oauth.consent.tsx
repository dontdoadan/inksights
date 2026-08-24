import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Beta Supabase OAuth API — typed wrapper (real implementation lives on supabase.auth).
type AuthDetails = {
  redirect_url?: string;
  redirect_to?: string;
  client?: { name?: string; client_id?: string; redirect_uri?: string };
  scope?: string;
};
type OauthLike = {
  getAuthorizationDetails(id: string): Promise<{ data: AuthDetails | null; error: Error | null }>;
  approveAuthorization(id: string): Promise<{ data: AuthDetails | null; error: Error | null }>;
  denyAuthorization(id: string): Promise<{ data: AuthDetails | null; error: Error | null }>;
};
const oauth = () => (supabase.auth as unknown as { oauth: OauthLike }).oauth;

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/auth", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauth().getAuthorizationDetails(authorizationId);
    if (error) throw error;
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="min-h-screen bg-ink-deep text-foreground flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="font-display font-black text-3xl">Authorization failed</h1>
        <p className="mt-3 text-muted-foreground text-sm">
          {String((error as Error)?.message ?? error)}
        </p>
      </div>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientName = details?.client?.name ?? "an AI client";

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error } = approve
      ? await oauth().approveAuthorization(authorization_id)
      : await oauth().denyAuthorization(authorization_id);
    if (error) { setBusy(false); setError(error.message); return; }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) { setBusy(false); setError("No redirect returned by the authorization server."); return; }
    window.location.href = target;
  }

  return (
    <main className="min-h-screen bg-ink-deep text-foreground font-sans flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-border/60 bg-ink-elev/50 p-8">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="h-8 w-8 rounded-md bg-mint flex items-center justify-center">
            <div className="h-3.5 w-3.5 rounded-full bg-ink-deep" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            INK<span className="text-mint">SIGHT</span>
          </span>
        </div>
        <h1 className="font-display font-black text-3xl">
          Connect <span className="text-mint">{clientName}</span> to your account
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This lets {clientName} use INKSIGHT tools as you — reading your saved
          scenarios, running the growth-model calculators, and submitting audit
          requests on your behalf.
        </p>

        <ul className="mt-6 space-y-2 text-sm">
          <li className="flex gap-2"><span className="text-mint">✓</span> Read your saved growth-model scenarios</li>
          <li className="flex gap-2"><span className="text-mint">✓</span> Create and update scenarios</li>
          <li className="flex gap-2"><span className="text-mint">✓</span> Run the growth-model calculators</li>
          <li className="flex gap-2"><span className="text-mint">✓</span> Submit Revenue Audit requests as you</li>
        </ul>

        <p className="mt-6 text-xs text-muted-foreground">
          This does not bypass INKSIGHT's permissions or backend policies.
        </p>

        {error ? <p className="mt-4 text-sm text-red-400" role="alert">{error}</p> : null}

        <div className="mt-8 flex gap-3">
          <button
            onClick={() => decide(true)}
            disabled={busy}
            className="flex-1 rounded-full bg-mint text-ink-deep px-5 py-3 font-bold hover:bg-mint-soft transition-colors disabled:opacity-50"
          >
            Approve
          </button>
          <button
            onClick={() => decide(false)}
            disabled={busy}
            className="flex-1 rounded-full border border-border px-5 py-3 font-bold hover:border-mint hover:text-mint transition-colors disabled:opacity-50"
          >
            Deny
          </button>
        </div>
      </div>
    </main>
  );
}
