export const CANONICAL_SUPABASE_URL = 'https://ukaxsqwnkoqbbsufpzga.supabase.co';
export const CANONICAL_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_bKJm5Kfsci_E3DapEE7Wtw_01B48CQI';

function nonEmpty(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function resolveSupabaseConfig(viteEnv = {}, processEnv = undefined) {
  const viteUrl = nonEmpty(viteEnv?.VITE_SUPABASE_URL);
  const viteKey = nonEmpty(viteEnv?.VITE_SUPABASE_PUBLISHABLE_KEY);
  if (viteUrl && viteKey) {
    return { url: viteUrl, publishableKey: viteKey };
  }

  const serverUrl = nonEmpty(processEnv?.SUPABASE_URL);
  const serverKey = nonEmpty(processEnv?.SUPABASE_PUBLISHABLE_KEY);
  if (serverUrl && serverKey) {
    return { url: serverUrl, publishableKey: serverKey };
  }

  return {
    url: CANONICAL_SUPABASE_URL,
    publishableKey: CANONICAL_SUPABASE_PUBLISHABLE_KEY,
  };
}