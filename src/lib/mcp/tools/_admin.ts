import { createClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";

export function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function requirePlatformAdmin(ctx: ToolContext) {
  if (!ctx.isAuthenticated()) {
    return { ok: false as const, message: "Not authenticated" };
  }

  const supabase = supabaseForUser(ctx);
  const { data, error } = await supabase
    .from("platform_admins")
    .select("role, active")
    .eq("user_id", ctx.getUserId())
    .maybeSingle();

  if (error) return { ok: false as const, message: error.message };
  if (!data?.active || !["owner", "admin"].includes(data.role)) {
    return { ok: false as const, message: "Founder/admin access required" };
  }

  return { ok: true as const, supabase, role: data.role };
}

export function toolError(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true };
}
