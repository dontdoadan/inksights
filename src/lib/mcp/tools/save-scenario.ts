import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "save_scenario",
  title: "Save or update a scenario",
  description:
    "Create a new growth-model scenario, or update an existing one when `id` is provided. Stores calculator inputs and (optional) results for the signed-in user.",
  inputSchema: {
    id: z.string().uuid().optional().describe("Existing scenario ID to update."),
    name: z.string().min(1).max(120),
    audience: z.enum(["studio", "investor"]).default("studio"),
    inputs: z.record(z.string(), z.union([z.number(), z.string(), z.boolean()])),
    results: z.record(z.string(), z.number()).optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  handler: async ({ id, name, audience, inputs, results }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const sb = supabaseForUser(ctx);
    const payload = { name, audience, inputs, results: results ?? {} };
    const { data, error } = id
      ? await sb.from("scenarios").update(payload).eq("id", id).select().single()
      : await sb
          .from("scenarios")
          .insert({ ...payload, user_id: ctx.getUserId() })
          .select()
          .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `${id ? "Updated" : "Saved"} scenario '${name}'.` }],
      structuredContent: { scenario: data },
    };
  },
});
