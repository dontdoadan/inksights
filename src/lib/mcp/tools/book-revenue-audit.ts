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
  name: "book_revenue_audit",
  title: "Book a Revenue Audit",
  description:
    "Submit a Revenue Audit request as the signed-in user. INKSIGHT reviews these requests and follows up within 48 hours.",
  inputSchema: {
    full_name: z.string().min(1).max(120),
    email: z.string().email(),
    studio_name: z.string().max(120).optional(),
    phone: z.string().max(40).optional(),
    notes: z.string().max(2000).optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { data, error } = await supabaseForUser(ctx)
      .from("audit_submissions")
      .insert({ ...input, user_id: ctx.getUserId() })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [
        {
          type: "text",
          text: `Audit request submitted. INKSIGHT will be in touch within 48 hours.`,
        },
      ],
      structuredContent: { submission: data },
    };
  },
});
