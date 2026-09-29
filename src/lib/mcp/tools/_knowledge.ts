/* eslint-disable @typescript-eslint/no-explicit-any -- paired knowledge migration lands before generated Supabase types are refreshed */
type KnowledgeSearchInput = {
  query: string;
  domain?: string;
  truthStates?: string[];
  limit?: number;
};

export async function searchKnowledge(client: any, input: KnowledgeSearchInput) {
  const { data, error } = await client.rpc("search_knowledge", {
    p_query: input.query,
    p_domain: input.domain ?? null,
    p_truth_states: input.truthStates ?? ["current", "intended", "proposed"],
    p_limit: input.limit ?? 12,
  });

  if (error) throw error;
  return data ?? [];
}

function safeTerm(query: string) {
  return query
    .replace(/[^a-zA-Z0-9\s_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

export async function findCapabilityEvidence(query: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const db = supabaseAdmin as any;
  const term = safeTerm(query);
  if (!term) return { assets: [], systems: [], workflows: [] };
  const pattern = `%${term}%`;

  const [assetsResult, systemsResult, workflowsResult] = await Promise.all([
    db
      .from("ops_assets")
      .select("asset_key,title,asset_type,category,status,review_status,canonical_uri,github_repo,github_path,supabase_reference,version,last_verified_at,metadata")
      .or(`title.ilike.${pattern},asset_key.ilike.${pattern},category.ilike.${pattern}`)
      .order("last_verified_at", { ascending: false, nullsFirst: false })
      .limit(12),
    db
      .from("ops_systems")
      .select("system_key,name,category,canonical_role,status,environment,base_url,verified_at,metadata")
      .or(`name.ilike.${pattern},system_key.ilike.${pattern},canonical_role.ilike.${pattern}`)
      .limit(8),
    db
      .from("ops_workflows")
      .select("workflow_key,name,purpose,status,automation_level,version,metadata")
      .or(`name.ilike.${pattern},workflow_key.ilike.${pattern},purpose.ilike.${pattern}`)
      .limit(8),
  ]);

  for (const result of [assetsResult, systemsResult, workflowsResult]) {
    if (result.error) throw result.error;
  }

  return {
    assets: assetsResult.data ?? [],
    systems: systemsResult.data ?? [],
    workflows: workflowsResult.data ?? [],
  };
}
