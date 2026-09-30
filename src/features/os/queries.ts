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


async function founderRequest(method: "POST" | "PATCH", body: Record<string, unknown>) {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) throw new Error("Authentication required");

  const response = await fetch("/api/internal/founder-snapshot", {
    method,
    headers: {
      Authorization: `Bearer ${data.session.access_token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({})) as { error?: string };
  if (!response.ok) throw new Error(payload.error || `Workspace update failed (${response.status})`);
  return payload;
}

export async function updateFounderAction(
  key: string,
  status: "open" | "in_progress" | "done",
  completionEvidence?: string,
) {
  return founderRequest("PATCH", {
    kind: "action",
    key,
    status,
    completion_evidence: completionEvidence,
  });
}

export async function updateFounderPriority(key: string, status: "active" | "done") {
  return founderRequest("PATCH", { kind: "priority", key, status });
}

export async function createFounderAction(input: {
  title: string;
  owner?: string;
  deadline?: string | null;
}) {
  return founderRequest("POST", input);
}
