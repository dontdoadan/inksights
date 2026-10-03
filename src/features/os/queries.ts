import { supabase } from "@/integrations/supabase/client";
import type { FounderSnapshot } from "./types";

export async function loadFounderSnapshot(): Promise<FounderSnapshot> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) {
    throw new Error("Authentication required");
  }

  const response = await fetch("/api/internal/founder-snapshot", {
    headers: {
      Authorization: `Bearer ${data.session.access_token}`,
      Accept: "application/json",
    },
    credentials: "same-origin",
  });

  const payload = (await response.json().catch(() => ({}))) as FounderSnapshot & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error || `Founder snapshot failed (${response.status})`);
  }

  return payload;
}
