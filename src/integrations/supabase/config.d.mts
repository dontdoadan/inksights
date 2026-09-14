export const CANONICAL_SUPABASE_URL: string;
export const CANONICAL_SUPABASE_PUBLISHABLE_KEY: string;

export interface SupabasePublicConfig {
  url: string;
  publishableKey: string;
}

export function resolveSupabaseConfig(
  viteEnv?: {
    VITE_SUPABASE_URL?: unknown;
    VITE_SUPABASE_PUBLISHABLE_KEY?: unknown;
  },
  processEnv?: {
    SUPABASE_URL?: unknown;
    SUPABASE_PUBLISHABLE_KEY?: unknown;
  },
): SupabasePublicConfig;