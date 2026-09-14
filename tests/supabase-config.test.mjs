import test from 'node:test';
import assert from 'node:assert/strict';

async function loadResolver() {
  try {
    return await import('../src/integrations/supabase/config.mjs');
  } catch (error) {
    assert.fail(`Supabase config resolver must be importable: ${error}`);
  }
}

test('uses canonical public Supabase config when deployment env is absent', async () => {
  const { resolveSupabaseConfig, CANONICAL_SUPABASE_URL, CANONICAL_SUPABASE_PUBLISHABLE_KEY } = await loadResolver();
  assert.deepEqual(resolveSupabaseConfig({}, undefined), {
    url: CANONICAL_SUPABASE_URL,
    publishableKey: CANONICAL_SUPABASE_PUBLISHABLE_KEY,
  });
});

test('uses a complete deployment override when both public values are supplied', async () => {
  const { resolveSupabaseConfig } = await loadResolver();
  assert.deepEqual(
    resolveSupabaseConfig(
      {
        VITE_SUPABASE_URL: 'https://example.supabase.co',
        VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example',
      },
      undefined,
    ),
    {
      url: 'https://example.supabase.co',
      publishableKey: 'sb_publishable_example',
    },
  );
});

test('never combines a partial deployment override with canonical credentials', async () => {
  const { resolveSupabaseConfig, CANONICAL_SUPABASE_URL, CANONICAL_SUPABASE_PUBLISHABLE_KEY } = await loadResolver();
  assert.deepEqual(
    resolveSupabaseConfig({ VITE_SUPABASE_URL: 'https://wrong-project.supabase.co' }, undefined),
    {
      url: CANONICAL_SUPABASE_URL,
      publishableKey: CANONICAL_SUPABASE_PUBLISHABLE_KEY,
    },
  );
});
