import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Historical sandbox payment proof harness.
// It is intentionally disabled and retained only so GitHub matches the
// deployed Supabase function inventory. It is not part of production checkout.
Deno.serve(() => new Response("Sandbox proof endpoint disabled", { status: 410 }));
