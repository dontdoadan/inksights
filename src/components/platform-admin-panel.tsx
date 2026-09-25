/* eslint-disable @typescript-eslint/no-explicit-any -- generic CMS CRUD spans newly migrated tables until generated Supabase types are refreshed */
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type FieldKind = "text" | "textarea" | "number" | "boolean" | "json" | "select";
type Field = { name: string; label: string; kind: FieldKind; options?: string[] };
type ResourceKey = "pages" | "articles" | "navigation" | "faqs" | "settings";

type ResourceConfig = {
  label: string;
  table: string;
  primaryKey: "id" | "key";
  titleField: string;
  createdBy?: boolean;
  fields: Field[];
};

const cmsClient = supabase as any;

const resources: Record<ResourceKey, ResourceConfig> = {
  pages: {
    label: "Pages",
    table: "cms_pages",
    primaryKey: "id",
    titleField: "title",
    createdBy: true,
    fields: [
      { name: "slug", label: "Slug", kind: "text" },
      { name: "title", label: "Title", kind: "text" },
      { name: "page_type", label: "Page type", kind: "select", options: ["page","landing","legal","resource"] },
      { name: "status", label: "Status", kind: "select", options: ["draft","published","archived"] },
      { name: "excerpt", label: "Excerpt", kind: "textarea" },
      { name: "seo_title", label: "SEO title", kind: "text" },
      { name: "seo_description", label: "SEO description", kind: "textarea" },
      { name: "canonical_path", label: "Canonical path", kind: "text" },
      { name: "content", label: "Content JSON", kind: "json" },
    ],
  },
  articles: {
    label: "Articles",
    table: "cms_articles",
    primaryKey: "id",
    titleField: "title",
    createdBy: true,
    fields: [
      { name: "slug", label: "Slug", kind: "text" },
      { name: "title", label: "Title", kind: "text" },
      { name: "status", label: "Status", kind: "select", options: ["draft","published","archived"] },
      { name: "category", label: "Category", kind: "text" },
      { name: "excerpt", label: "Excerpt", kind: "textarea" },
      { name: "seo_title", label: "SEO title", kind: "text" },
      { name: "seo_description", label: "SEO description", kind: "textarea" },
      { name: "body", label: "Body JSON", kind: "json" },
    ],
  },
  navigation: {
    label: "Navigation",
    table: "cms_navigation",
    primaryKey: "id",
    titleField: "label",
    createdBy: true,
    fields: [
      { name: "area", label: "Area", kind: "select", options: ["header","footer","utility"] },
      { name: "label", label: "Label", kind: "text" },
      { name: "href", label: "Href", kind: "text" },
      { name: "sort_order", label: "Sort order", kind: "number" },
      { name: "visible", label: "Visible", kind: "boolean" },
      { name: "open_in_new_tab", label: "Open in new tab", kind: "boolean" },
    ],
  },
  faqs: {
    label: "FAQs",
    table: "cms_faqs",
    primaryKey: "id",
    titleField: "question",
    createdBy: true,
    fields: [
      { name: "scope", label: "Scope", kind: "text" },
      { name: "question", label: "Question", kind: "text" },
      { name: "answer", label: "Answer", kind: "textarea" },
      { name: "sort_order", label: "Sort order", kind: "number" },
      { name: "status", label: "Status", kind: "select", options: ["draft","published","archived"] },
    ],
  },
  settings: {
    label: "Site settings",
    table: "cms_site_settings",
    primaryKey: "key",
    titleField: "key",
    fields: [
      { name: "key", label: "Key", kind: "text" },
      { name: "description", label: "Description", kind: "textarea" },
      { name: "is_public", label: "Publicly readable", kind: "boolean" },
      { name: "value", label: "Value JSON", kind: "json" },
    ],
  },
};

const defaultValue = (field: Field) => {
  if (field.kind === "boolean") return false;
  if (field.kind === "number") return 0;
  if (field.kind === "json") return {};
  if (field.kind === "select") return field.options?.[0] ?? "";
  return "";
};

export function PlatformAdminPanel() {
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [active, setActive] = useState<ResourceKey>("pages");
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const config = resources[active];

  useEffect(() => {
    let live = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!live || !auth.user) {
        setLoading(false);
        return;
      }
      setUserId(auth.user.id);
      const { data } = await cmsClient
        .from("platform_admins")
        .select("role, active")
        .eq("user_id", auth.user.id)
        .maybeSingle();
      if (live && data?.active) setRole(data.role);
      setLoading(false);
    })();
    return () => { live = false; };
  }, []);

  const isExisting = useMemo(() => {
    if (!selectedKey) return false;
    return rows.some((row) => String(row[config.primaryKey]) === selectedKey);
  }, [rows, selectedKey, config.primaryKey]);

  const loadRows = useCallback(async () => {
    setMessage("");
    const { data, error } = await cmsClient.from(config.table).select("*").limit(100);
    if (error) {
      setMessage(error.message);
      return;
    }
    const list = (data ?? []) as Record<string, any>[];
    setRows(list);
    if (selectedKey) {
      const current = list.find((row) => String(row[config.primaryKey]) === selectedKey);
      if (current) setDraft(current);
    }
  }, [config.primaryKey, config.table, selectedKey]);

  useEffect(() => {
    if (!role) return;
    void loadRows();
  }, [loadRows, role]);

  function startNew() {
    const next: Record<string, any> = {};
    for (const field of config.fields) next[field.name] = defaultValue(field);
    setSelectedKey(null);
    setDraft(next);
    setMessage("");
  }

  function selectRow(row: Record<string, any>) {
    setSelectedKey(String(row[config.primaryKey]));
    setDraft(row);
    setMessage("");
  }

  function normalizedPayload() {
    const payload: Record<string, any> = {};
    for (const field of config.fields) {
      let value = draft[field.name];
      if (field.kind === "number") value = Number(value || 0);
      if (field.kind === "json" && typeof value === "string") value = JSON.parse(value || "{}");
      payload[field.name] = value;
    }
    payload.updated_at = new Date().toISOString();
    if (userId) payload.updated_by = userId;
    if (!isExisting && config.createdBy && userId) payload.created_by = userId;
    if ((active === "pages" || active === "articles") && payload.status === "published" && !draft.published_at) {
      payload.published_at = new Date().toISOString();
    }
    return payload;
  }

  async function save() {
    try {
      setSaving(true);
      setMessage("");
      const payload = normalizedPayload();
      const query = cmsClient.from(config.table);
      const result = isExisting
        ? await query.update(payload).eq(config.primaryKey, selectedKey)
        : await query.insert(payload);
      if (result.error) throw result.error;
      setMessage("Saved.");
      await loadRows();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!isExisting || !selectedKey) return;
    if (!window.confirm("Delete this item? This cannot be undone.")) return;
    const { error } = await cmsClient.from(config.table).delete().eq(config.primaryKey, selectedKey);
    if (error) {
      setMessage(error.message);
      return;
    }
    setSelectedKey(null);
    setDraft({});
    setMessage("Deleted.");
    await loadRows();
  }

  if (loading) return null;
  if (!role) return null;

  return (
    <section className="mt-12 border-t border-border/60 pt-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">Platform administration</p>
          <h2 className="mt-2 font-display text-3xl font-black text-ice">Content control plane</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Publish and maintain site content without editing application source. Access is enforced by Supabase RLS and platform-admin role.
          </p>
        </div>
        <span className="w-fit rounded-full border border-mint/30 bg-mint/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-mint">
          {role}
        </span>
      </div>

      <div className="mt-7 flex flex-wrap gap-2">
        {(Object.keys(resources) as ResourceKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => { setActive(key); setSelectedKey(null); setDraft({}); }}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              active === key ? "bg-mint text-ink-deep" : "border border-border text-muted-foreground hover:border-mint/50 hover:text-mint"
            }`}
          >
            {resources[key].label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-2xl border border-border bg-ink p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-lg font-black text-ice">{config.label}</h3>
            <button type="button" onClick={startNew} className="rounded-full bg-mint px-3 py-2 text-xs font-bold text-ink-deep">
              New
            </button>
          </div>
          <div className="mt-4 max-h-[520px] space-y-2 overflow-auto pr-1">
            {rows.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">No items yet.</p>
            ) : rows.map((row) => {
              const key = String(row[config.primaryKey]);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => selectRow(row)}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    selectedKey === key ? "border-mint/60 bg-mint/5" : "border-border bg-ink-deep hover:border-mint/30"
                  }`}
                >
                  <div className="truncate text-sm font-bold text-ice">{String(row[config.titleField] ?? key)}</div>
                  {"status" in row ? <div className="mt-1 text-xs uppercase tracking-[0.12em] text-muted-foreground">{String(row.status)}</div> : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-ink p-5 md:p-7">
          {!selectedKey && Object.keys(draft).length === 0 ? (
            <div className="flex min-h-[260px] items-center justify-center text-center">
              <div>
                <h3 className="font-display text-2xl font-black text-ice">Select an item or create a new one.</h3>
                <p className="mt-2 text-sm text-muted-foreground">Changes remain draft until you explicitly publish content via its status field.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-5 md:grid-cols-2">
                {config.fields.map((field) => (
                  <AdminField
                    key={field.name}
                    field={field}
                    value={draft[field.name]}
                    disabled={isExisting && config.primaryKey === field.name}
                    onChange={(value) => setDraft((current) => ({ ...current, [field.name]: value }))}
                  />
                ))}
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button disabled={saving} type="button" onClick={save} className="rounded-full bg-mint px-5 py-3 text-sm font-bold text-ink-deep disabled:opacity-60">
                  {saving ? "Saving…" : "Save"}
                </button>
                {isExisting ? (
                  <button type="button" onClick={remove} className="rounded-full border border-red-400/40 px-5 py-3 text-sm font-bold text-red-300">
                    Delete
                  </button>
                ) : null}
                {message ? <span className="text-sm text-muted-foreground">{message}</span> : null}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function AdminField({
  field,
  value,
  disabled,
  onChange,
}: {
  field: Field;
  value: any;
  disabled?: boolean;
  onChange: (value: any) => void;
}) {
  const common = "mt-2 w-full rounded-xl border border-border bg-ink-deep px-4 py-3 text-sm text-ice outline-none transition focus:border-mint disabled:opacity-60";
  const displayValue = field.kind === "json"
    ? (typeof value === "string" ? value : JSON.stringify(value ?? {}, null, 2))
    : (value ?? "");

  return (
    <label className={field.kind === "textarea" || field.kind === "json" ? "md:col-span-2 text-sm font-semibold text-ice" : "text-sm font-semibold text-ice"}>
      {field.label}
      {field.kind === "textarea" || field.kind === "json" ? (
        <textarea
          rows={field.kind === "json" ? 9 : 5}
          value={String(displayValue)}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className={common}
        />
      ) : field.kind === "select" ? (
        <select value={String(displayValue)} disabled={disabled} onChange={(event) => onChange(event.target.value)} className={common}>
          {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : field.kind === "boolean" ? (
        <span className="mt-3 flex min-h-12 items-center gap-3 rounded-xl border border-border bg-ink-deep px-4">
          <input type="checkbox" checked={Boolean(value)} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
          <span className="text-sm font-normal text-muted-foreground">{value ? "Enabled" : "Disabled"}</span>
        </span>
      ) : (
        <input
          type={field.kind === "number" ? "number" : "text"}
          value={String(displayValue)}
          disabled={disabled}
          onChange={(event) => onChange(field.kind === "number" ? Number(event.target.value) : event.target.value)}
          className={common}
        />
      )}
    </label>
  );
}
