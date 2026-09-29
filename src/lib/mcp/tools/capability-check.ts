/* eslint-disable @typescript-eslint/no-explicit-any -- paired knowledge migration lands before generated Supabase types are refreshed */
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requirePlatformAdmin, toolError } from "./_admin";
import { findCapabilityEvidence, searchKnowledge } from "./_knowledge";

export default defineTool({
  name: "check_existing_capability",
  title: "Check existing INKSIGHTS capability",
  description:
    "Run the mandatory Existing Capability Check before proposing a new INKSIGHTS system, feature, workflow, integration or automation. Searches the live ops control plane plus the normalized knowledge index.",
  inputSchema: {
    capability: z.string().min(2).max(200),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ capability }, ctx) => {
    const auth = await requirePlatformAdmin(ctx);
    if (!auth.ok) return toolError(auth.message);

    try {
      const [live, knowledge] = await Promise.all([
        findCapabilityEvidence(capability),
        searchKnowledge(auth.supabase as any, {
          query: capability,
          truthStates: ["current", "intended", "proposed"],
          limit: 12,
        }),
      ]);

      const liveCount = live.assets.length + live.systems.length + live.workflows.length;
      const currentKnowledge = knowledge.filter((item: any) => item.truth_state === "current");
      const exists = liveCount > 0 || currentKnowledge.length > 0;

      return {
        content: [
          {
            type: "text",
            text: exists
              ? "Existing INKSIGHTS capability evidence was found. Extend/repair/connect/verify/productise before considering a net-new build."
              : "No matching capability was found in the indexed/live control surfaces. Absence is not yet proven; inspect the owning system before authorising BUILD.",
          },
        ],
        structuredContent: {
          capability,
          exists,
          live_control_plane: live,
          knowledge,
          required_classification: exists
            ? ["IMPROVE", "REPAIR", "CONNECT", "VERIFY", "CONSOLIDATE", "PRODUCTISE", "REPLACE", "RETIRE"]
            : ["UNKNOWN", "BUILD-after-owning-system-check"],
          guardrail:
            "Never infer absence from a blueprint, chat history, or a zero-result knowledge search alone.",
        },
      };
    } catch (error) {
      return toolError(error instanceof Error ? error.message : "Capability check failed");
    }
  },
});
