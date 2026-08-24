import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  useEffect(() => {
    const dest = sessionStorage.getItem("inksight:next") || "/dashboard";
    sessionStorage.removeItem("inksight:next");
    let cancelled = false;
    const finalize = async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) {
        navigate({ to: dest });
      } else {
        // Wait for auth state
        const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
          if (session) {
            sub.subscription.unsubscribe();
            navigate({ to: dest });
          }
        });
      }
    };
    finalize();
    return () => { cancelled = true; };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-ink-deep text-foreground flex items-center justify-center">
      <p className="text-muted-foreground">Finishing sign-in…</p>
    </div>
  );
}
