/* eslint-disable @typescript-eslint/no-explicit-any -- paired knowledge migration lands before generated Supabase types are refreshed */
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requirePlatformAdmin, toolError } from "./_admin";
import { searchKnowledge } from "./_knowledge";

export default defineTool({
  name: "search_knowledge",
  title: "Search INKSIGHTS knowledge",
  description:
    "Search the founder-only INKSIGHTS knowledge index. Results preserve truth state, authority, provenance and canonical source links so chats do not rely on memory or uploaded project files.",
  inputSchema: {
    query: z.string().min(1).max(500),
    domain: z.string().max(80).optional(),
    truth_states: z
      .array(z.enum(["current", "intended", "proposed", "historical", "unknown"]))
      .max(5)
      .default(["current", "intended", "proposed"]),
    limit: z.number().int().min(1).max(25).default(12),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, domain, truth_states, limit }, ctx) => {
    const auth = await requirePlatformAdmin(ctx);
    if (!auth.ok) return toolError(auth.message);

    try {
      const results = await searchKnowledge(auth.supabase as any, {
        query,
        domain,
        truthStates: truth_states,
        limit,
      });

      await (auth.supabase as any).from("knowledge_query_log").insert({
        user_id: ctx.getUserId(),
        query_text: query,
        intent: "knowledge_search",
        filters: { domain: domain ?? null, truth_states },
        result_keys: results.map((row: any) => row.knowledge_key),
        result_count: results.length,
        source: "mcp",
      });

      return {
        content: [{ type: "text", text: `Found ${results.length} governed INKSIGHTS knowledge item(s).` }],
        structuredContent: {
          query,
          results,
          interpretation_rule:
            "CURRENT + canonical/active authority outranks INTENDED/PROPOSED material. Follow canonical_uri/source_system_key for current system truth.",
        },
      };
    } catch (error) {
      return toolError(error instanceof Error ? error.message : "Knowledge search failed");
    }
  },
});
