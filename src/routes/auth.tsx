import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search.next === "string" ? search.next : "",
  }),
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign in — INKSIGHTS" },
      { name: "description", content: "Sign in to your INKSIGHTS studio dashboard." },
    ],
  }),
});

function sanitizeNext(next: string): string {
  if (!next || !next.startsWith("/")) return "/dashboard";
  if (next.startsWith("//")) return "/dashboard";
  return next;
}

function AuthPage() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const dest = sanitizeNext(next);

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studioName, setStudioName] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: dest });
    });
  }, [dest, navigate]);

  async function handleEmail(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${dest}`,
            data: { full_name: fullName, studio_name: studioName },
          },
        });
        if (signUpError) throw signUpError;

        if (data.session && data.user) {
          const { error: profileError } = await supabase.from("profiles").upsert({
            id: data.user.id,
            studio_name: studioName || null,
            full_name: fullName || null,
            updated_at: new Date().toISOString(),
          });
          if (profileError) throw profileError;
          navigate({ to: dest });
        } else {
          setError("Check your inbox to confirm your email, then sign in.");
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        navigate({ to: dest });
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    setError(null);
    try {
      sessionStorage.setItem("inksights:next", dest);
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/auth/callback`,
      });
      if (result.error) throw result.error;
      if (!result.redirected) navigate({ to: dest });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-deep px-6 py-16 font-sans text-foreground">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-mint">
            <div className="h-3.5 w-3.5 rounded-full bg-ink-deep" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight">
            INK<span className="text-mint">SIGHTS</span>
          </span>
        </Link>

        <div className="rounded-3xl border border-border/60 bg-ink-elev/50 p-8">
          <h1 className="font-display text-3xl font-black">
            {mode === "signin" ? "Welcome back" : "Create your studio account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to access your dashboard and saved growth-model scenarios."
              : "Save your growth-model scenarios and track your Revenue Audit."}
          </p>

          <button
            onClick={handleGoogle}
            disabled={busy}
            className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full bg-ice px-5 py-3 font-bold text-ink-deep transition-colors hover:bg-white disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="mt-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border/60" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border/60" />
          </div>

          <form onSubmit={handleEmail} className="mt-6 space-y-3">
            {mode === "signup" ? (
              <>
                <input
                  type="text"
                  placeholder="Your name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="w-full rounded-full border border-border bg-ink-deep px-5 py-3 text-ice focus:border-mint focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Studio name"
                  value={studioName}
                  onChange={(event) => setStudioName(event.target.value)}
                  className="w-full rounded-full border border-border bg-ink-deep px-5 py-3 text-ice focus:border-mint focus:outline-none"
                />
              </>
            ) : null}
            <input
              type="email"
              required
              placeholder="you@studio.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-full border border-border bg-ink-deep px-5 py-3 text-ice focus:border-mint focus:outline-none"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-full border border-border bg-ink-deep px-5 py-3 text-ice focus:border-mint focus:outline-none"
            />
            {error ? (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center rounded-full bg-mint px-5 py-3 font-bold text-ink-deep transition-colors hover:bg-mint-soft disabled:opacity-50"
            >
              {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New to INKSIGHTS?" : "Already have an account?"}{" "}
            <button
              className="font-semibold text-mint hover:underline"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
              }}
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-mint">
            ← Back to INKSIGHTS
          </Link>
        </p>
      </div>
    </div>
  );
}
