export const CANONICAL_SUPABASE_URL: string;
export const CANONICAL_SUPABASE_PUBLISHABLE_KEY: string;

export interface SupabasePublicConfig {
  url: string;
  publishableKey: string;
}

export function resolveSupabaseConfig(
  viteEnv?: object,
  processEnv?: object,
): SupabasePublicConfig;