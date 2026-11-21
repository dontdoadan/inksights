import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { TOOL_PRODUCTS } from "@/lib/tool-factory/product-registry";
import type { ClientCsvRow } from "@/lib/tool-factory/csv-import";

type WorkspaceRow = {
  id: string;
  display_name: string;
  business_type: string;
  currency_code: string;
  status: string;
};

async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function requireWorkspaceRole(
  admin: Awaited<ReturnType<typeof getAdmin>>,
  workspaceId: string,
  userId: string,
  allowedRoles: string[] = ["owner", "admin", "manager", "analyst"],
) {
  const { data, error } = await admin
    .from("bt_workspace_members")
    .select("role,active")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .eq("active", true)
    .maybeSingle();

  if (error || !data || !allowedRoles.includes(data.role)) {
    throw new Error("You do not have access to this workspace.");
  }
  return data.role;
}

export const getMyBusinessWorkspaces = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = context.userId as string;
    const admin = await getAdmin();

    const { data: memberships, error: membershipError } = await admin
      .from("bt_workspace_members")
      .select("workspace_id,role")
      .eq("user_id", userId)
      .eq("active", true);

    if (membershipError) throw new Error("Unable to load workspace membership.");
    if (!memberships?.length) return [];

    const workspaceIds = memberships.map((membership) => membership.workspace_id);
    const [{ data: workspaces, error: workspaceError }, { data: products, error: productError }] =
      await Promise.all([
        admin
          .from("bt_workspaces")
          .select("id,display_name,business_type,currency_code,status")
          .in("id", workspaceIds),
        admin
          .from("bt_workspace_products")
          .select("workspace_id,product_key,product_version,status")
          .in("workspace_id", workspaceIds),
      ]);

    if (workspaceError || productError) throw new Error("Unable to load workspace details.");

    return (workspaces ?? []).map((workspace) => ({
      ...workspace,
      role: memberships.find((membership) => membership.workspace_id === workspace.id)?.role ?? "analyst",
      products: (products ?? []).filter((product) => product.workspace_id === workspace.id),
    }));
  });

export const createBusinessWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { displayName: string; businessType?: string }) => {
    const displayName = data.displayName.trim();
    if (displayName.length < 2 || displayName.length > 160) {
      throw new Error("Workspace name must be between 2 and 160 characters.");
    }
    const businessType = data.businessType?.trim() || "tattoo_studio";
    if (!/^[a-z][a-z0-9_]{1,39}$/.test(businessType)) {
      throw new Error("Invalid business type.");
    }
    return { displayName, businessType };
  })
  .handler(async ({ data, context }) => {
    const userId = context.userId as string;
    const admin = await getAdmin();

    const { data: existingMembership, error: existingError } = await admin
      .from("bt_workspace_members")
      .select("workspace_id")
      .eq("user_id", userId)
      .eq("active", true)
      .limit(1)
      .maybeSingle();

    if (existingError) throw new Error("Unable to verify existing workspace.");
    if (existingMembership) {
      throw new Error("This account already has an active workspace. Select it instead of creating another.");
    }

    const { data: workspace, error: workspaceError } = await admin
      .from("bt_workspaces")
      .insert({
        display_name: data.displayName,
        business_type: data.businessType,
        created_by: userId,
      })
      .select("id,display_name,business_type,currency_code,status")
      .single();

    if (workspaceError || !workspace) throw new Error("Workspace could not be created.");

    const { error: memberError } = await admin.from("bt_workspace_members").insert({
      workspace_id: workspace.id,
      user_id: userId,
      role: "owner",
      active: true,
    });

    if (memberError) {
      await admin.from("bt_workspaces").delete().eq("id", workspace.id);
      throw new Error("Workspace owner membership could not be created.");
    }

    const { error: productError } = await admin.from("bt_workspace_products").insert({
      workspace_id: workspace.id,
      product_key: TOOL_PRODUCTS.revenueRecovery.key,
      product_version: TOOL_PRODUCTS.revenueRecovery.version,
      status: "trial",
      settings: { import_version: "clients-csv-v1" },
    });

    if (productError) {
      await admin.from("bt_workspaces").delete().eq("id", workspace.id);
      throw new Error("Revenue Recovery could not be activated for this workspace.");
    }

    return { ...workspace, role: "owner" };
  });

export const getRevenueRecoveryOpportunities = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: { workspaceId: string }) => {
    if (!/^[0-9a-f-]{36}$/i.test(data.workspaceId)) throw new Error("Invalid workspace.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const userId = context.userId as string;
    const admin = await getAdmin();
    await requireWorkspaceRole(admin, data.workspaceId, userId);

    const { data: opportunities, error } = await admin
      .from("rr_opportunities")
      .select("id,opportunity_type,title,explanation,recommended_action,value_base_minor,value_classification,confidence,priority_score,status,detected_at")
      .eq("workspace_id", data.workspaceId)
      .order("priority_score", { ascending: false })
      .limit(100);

    if (error) throw new Error("Unable to load recovery opportunities.");
    return opportunities ?? [];
  });

export const importRevenueRecoveryClients = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: {
    workspaceId: string;
    sourceSystem: string;
    fileName: string;
    contentSha256: string;
    rowsTotal: number;
    rowsInvalid: number;
    clients: ClientCsvRow[];
  }) => {
    if (!/^[0-9a-f-]{36}$/i.test(data.workspaceId)) throw new Error("Invalid workspace.");
    if (!/^[a-z][a-z0-9_]{1,39}$/i.test(data.sourceSystem)) throw new Error("Invalid source system.");
    if (!/^[a-f0-9]{64}$/i.test(data.contentSha256)) throw new Error("Invalid file checksum.");
    if (!Array.isArray(data.clients) || data.clients.length < 1 || data.clients.length > 5000) {
      throw new Error("Import must contain between 1 and 5,000 valid client rows.");
    }
    if (data.fileName.length > 180) throw new Error("File name is too long.");
    if (!Number.isInteger(data.rowsTotal) || data.rowsTotal < data.clients.length || data.rowsTotal > 5000) throw new Error("Invalid total row count.");
    if (!Number.isInteger(data.rowsInvalid) || data.rowsInvalid < 0 || data.rowsTotal !== data.clients.length + data.rowsInvalid) throw new Error("Invalid row validation counts.");
    const seen = new Set<string>();
    for (const client of data.clients) {
      if (!Number.isInteger(client.source_row_number) || client.source_row_number < 2 || client.source_row_number > data.rowsTotal + 1) throw new Error("Invalid source row number.");
      if (!client.source_record_id || client.source_record_id.length > 180 || seen.has(client.source_record_id)) {
        throw new Error("Client source IDs must be present, unique and no longer than 180 characters.");
      }
      seen.add(client.source_record_id);
      if (client.display_name && client.display_name.length > 180) throw new Error("Client display names must be 180 characters or fewer.");
      if (client.last_completed_booking_at && !Number.isFinite(Date.parse(client.last_completed_booking_at))) throw new Error("Invalid last booking date.");
      if (client.future_booking_at && !Number.isFinite(Date.parse(client.future_booking_at))) throw new Error("Invalid future booking date.");
      if (!Number.isInteger(client.completed_sessions) || client.completed_sessions < 0) {
        throw new Error("Completed session counts must be non-negative whole numbers.");
      }
      if (!["unknown", "permitted", "not_permitted", "suppressed"].includes(client.marketing_permission_state)) {
        throw new Error("Invalid marketing permission state.");
      }
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    const userId = context.userId as string;
    const admin = await getAdmin();
    await requireWorkspaceRole(admin, data.workspaceId, userId, ["owner", "admin", "manager"]);

    const { data: existingJob, error: existingJobError } = await admin
      .from("bt_import_jobs")
      .select("id,status,rows_total")
      .eq("workspace_id", data.workspaceId)
      .eq("product_key", TOOL_PRODUCTS.revenueRecovery.key)
      .eq("content_sha256", data.contentSha256.toLowerCase())
      .maybeSingle();

    if (existingJobError) throw new Error("Unable to check import history.");
    if (existingJob?.status === "imported") {
      return { importJobId: existingJob.id, status: "already_imported", rowsImported: existingJob.rows_total };
    }

    let importJobId = existingJob?.id;
    if (importJobId) {
      await admin.from("bt_import_rows").delete().eq("workspace_id", data.workspaceId).eq("import_job_id", importJobId);
      const { error } = await admin.from("bt_import_jobs").update({
        status: "validating",
        rows_total: data.rowsTotal,
        rows_valid: data.clients.length,
        rows_invalid: data.rowsInvalid,
        rows_duplicate: 0,
        completed_at: null,
      }).eq("id", importJobId).eq("workspace_id", data.workspaceId);
      if (error) throw new Error("Unable to resume the previous import.");
    } else {
      const { data: job, error } = await admin
        .from("bt_import_jobs")
        .insert({
          workspace_id: data.workspaceId,
          product_key: TOOL_PRODUCTS.revenueRecovery.key,
          source_system: data.sourceSystem,
          source_filename: data.fileName.replace(/[\r\n]/g, "").slice(0, 180),
          content_sha256: data.contentSha256.toLowerCase(),
          mapping_version: "clients-csv-v1",
          status: "validating",
          rows_total: data.rowsTotal,
          rows_valid: data.clients.length,
          rows_invalid: data.rowsInvalid,
          rows_duplicate: 0,
          created_by: userId,
        })
        .select("id")
        .single();
      if (error || !job) throw new Error("Unable to create import job.");
      importJobId = job.id;
    }

    const stagedRows = await Promise.all(data.clients.map(async (client, index) => {
      const digest = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(JSON.stringify(client)),
      );
      const rowHash = Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
      return {
        workspace_id: data.workspaceId,
        import_job_id: importJobId,
        row_number: client.source_row_number,
        mapped_payload: client as unknown as import("@/integrations/supabase/types").Json,
        row_status: "valid" as const,
        validation_errors: [],
        source_record_id: client.source_record_id,
        row_hash: rowHash,
      };
    }));

    const { error: stageError } = await admin.from("bt_import_rows").insert(stagedRows);
    if (stageError) {
      await admin.from("bt_import_jobs").update({ status: "failed" }).eq("id", importJobId);
      throw new Error("Import staging failed. No success has been recorded.");
    }

    const canonicalRows = data.clients.map((client) => ({
      workspace_id: data.workspaceId,
      source_system: data.sourceSystem,
      source_record_id: client.source_record_id,
      display_name: client.display_name,
      last_completed_booking_at: client.last_completed_booking_at,
      completed_sessions: client.completed_sessions,
      future_booking_at: client.future_booking_at,
      marketing_permission_state: client.marketing_permission_state,
      has_contact_route: client.has_contact_route,
    }));

    const { error: clientError } = await admin
      .from("rr_clients")
      .upsert(canonicalRows, { onConflict: "workspace_id,source_system,source_record_id" });

    if (clientError) {
      await admin.from("bt_import_jobs").update({ status: "failed" }).eq("id", importJobId);
      throw new Error("Client records could not be committed. The import is marked failed for safe retry.");
    }

    const { error: completeError } = await admin
      .from("bt_import_jobs")
      .update({ status: "imported", completed_at: new Date().toISOString() })
      .eq("id", importJobId)
      .eq("workspace_id", data.workspaceId);

    if (completeError) throw new Error("Records were imported, but the import job could not be marked complete.");

    const { error: auditError } = await admin.from("bt_audit_events").insert({
      workspace_id: data.workspaceId,
      product_key: TOOL_PRODUCTS.revenueRecovery.key,
      actor_id: userId,
      actor_type: "user",
      event_key: "clients_csv_imported",
      target_type: "import_job",
      target_id: importJobId,
      event_data: { row_count: data.clients.length, source_system: data.sourceSystem, mapping_version: "clients-csv-v1" },
    });

    if (auditError) console.error("Revenue Recovery import audit event failed", { code: auditError.code });
    return { importJobId, status: "imported", rowsImported: data.clients.length, rowsRejected: data.rowsInvalid, auditLogged: !auditError };
  });
