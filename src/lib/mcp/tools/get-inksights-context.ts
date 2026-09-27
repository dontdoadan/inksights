import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requirePlatformAdmin, toolError } from "./_admin";
import { findCapabilityEvidence, searchKnowledge } from "./_knowledge";

export default defineTool({
  name: "get_inksights_context",
  title: "Get governed INKSIGHTS context",
  description:
    "One-call founder context pack for an INKSIGHTS task. Returns relevant governed knowledge plus existing-capability evidence so an AI session can start grounded without manual file uploads or repeated explanation.",
  inputSchema: {
    task: z.string().min(3).max(1200),
    domain: z.string().max(80).optional(),
    limit: z.number().int().min(3).max(25).default(15),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ task, domain, limit }, ctx) => {
    const auth = await requirePlatformAdmin(ctx);
    if (!auth.ok) return toolError(auth.message);

    try {
      const [knowledge, capability] = await Promise.all([
        searchKnowledge(auth.supabase as any, {
          query: task,
          domain,
          truthStates: ["current", "intended", "proposed"],
          limit,
        }),
        findCapabilityEvidence(task),
      ]);

      const current = knowledge.filter((item: any) => item.truth_state === "current");
      const intended = knowledge.filter((item: any) => item.truth_state === "intended");
      const proposed = knowledge.filter((item: any) => item.truth_state === "proposed");

      await (auth.supabase as any).from("knowledge_query_log").insert({
        user_id: ctx.getUserId(),
        query_text: task,
        intent: "context_pack",
        filters: { domain: domain ?? null },
        result_keys: knowledge.map((row: any) => row.knowledge_key),
        result_count: knowledge.length,
        source: "mcp",
      });

      return {
        content: [
          {
            type: "text",
            text: `Prepared a governed context pack with ${current.length} CURRENT, ${intended.length} INTENDED and ${proposed.length} PROPOSED knowledge item(s).`,
          },
        ],
        structuredContent: {
          task,
          current,
          intended,
          proposed,
          existing_capability_evidence: capability,
          operating_rules: [
            "CURRENT truth outranks intended/proposed material.",
            "Live owning-system readback outranks stale snapshots for current technical or operational state.",
            "Prefer IMPROVE/REPAIR/CONNECT/VERIFY/CONSOLIDATE/PRODUCTISE over BUILD when an adequate capability already exists.",
            "Conversation memory is working context, not canonical storage.",
          ],
        },
      };
    } catch (error) {
      return toolError(error instanceof Error ? error.message : "Context retrieval failed");
    }
  },
});
