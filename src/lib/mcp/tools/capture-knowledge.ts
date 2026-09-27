import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requirePlatformAdmin, toolError } from "./_admin";

export default defineTool({
  name: "capture_knowledge_candidate",
  title: "Capture INKSIGHTS knowledge candidate",
  description:
    "Capture durable-looking learning as PROPOSED/supporting knowledge for later governance review. This tool never promotes content directly to CURRENT or canonical authority.",
  inputSchema: {
    title: z.string().min(3).max(240),
    summary: z.string().min(3).max(1200),
    body: z.string().min(1).max(30000),
    domain: z.string().min(1).max(80),
    knowledge_type: z.string().min(1).max(80),
    canonical_uri: z.string().url().optional(),
    source_system_key: z.string().max(80).optional(),
    source_version: z.string().max(80).optional(),
    tags: z.array(z.string().max(60)).max(20).default([]),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    const auth = await requirePlatformAdmin(ctx);
    if (!auth.ok) return toolError(auth.message);

    const knowledgeKey = `candidate:${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const { data, error } = await (auth.supabase as any)
      .from("knowledge_items")
      .insert({
        knowledge_key: knowledgeKey,
        business_key: "inksights",
        title: input.title,
        knowledge_type: input.knowledge_type,
        domain: input.domain,
        truth_state: "proposed",
        authority_level: "supporting",
        status: "active",
        sensitivity: "internal",
        scope_type: "global",
        summary: input.summary,
        body: input.body,
        canonical_uri: input.canonical_uri ?? null,
        source_system_key: input.source_system_key ?? null,
        source_version: input.source_version ?? null,
        tags: input.tags,
        provenance: {
          captured_via: "mcp",
          captured_by: ctx.getUserId(),
          captured_at: now,
        },
        metadata: {
          promotion_required: true,
          promotion_rule: "Knowledge Curator review required before CURRENT/canonical promotion.",
        },
        created_by: ctx.getUserId(),
        updated_by: ctx.getUserId(),
      })
      .select("id, knowledge_key, title, truth_state, authority_level, domain, created_at")
      .single();

    if (error) return toolError(error.message);

    return {
      content: [{ type: "text", text: "Knowledge candidate captured as PROPOSED. It is not canonical." }],
      structuredContent: {
        item: data,
        next_gate:
          "Review provenance, evidence, conflicts and canonical destination before promotion.",
      },
    };
  },
});
