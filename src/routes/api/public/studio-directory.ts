import { createFileRoute } from "@tanstack/react-router";

type RegistryRow = {
  id: string; name: string | null; address: string | null; postcode: string | null;
  town: string | null; latitude: number | null; longitude: number | null;
  website_url: string | null; payload: Record<string, unknown> | null;
};
function site(value: string | null) {
  if (!value) return null;
  try { const u = new URL(value); return ["https:", "http:"].includes(u.protocol) ? u.href : null; }
  catch { return null; }
}
function asPublic(row: RegistryRow) {
  const p = row.payload ?? {};
  const geocoded = typeof row.latitude === "number" && typeof row.longitude === "number";
  if (!row.name || !row.postcode || !geocoded ||
      row.latitude! < 49 || row.latitude! > 59 || row.longitude! < -9 || row.longitude! > 3 ||
      p.directory_publication_status !== "public_observed_location_reviewed" ||
      p.directory_location_precision !== "postcode_centroid_approximate" ||
      !site(row.website_url)) return null;
  return {
    id: row.id, name: row.name, area: row.town || "", address: row.address || "",
    postcode: row.postcode, latitude: row.latitude!, longitude: row.longitude!,
    website: site(row.website_url), locationPrecision: "postcode_centroid_approximate" as const,
    listingStatus: "observed_unclaimed" as const,
    ownerVerified: false,
    reviewedAt: typeof p.directory_review_date === "string" ? p.directory_review_date : null,
  };
}
export const Route = createFileRoute("/api/public/studio-directory")({
  server: { handlers: { GET: async () => {
    try {
      // Service key stays on the server; only explicit, non-personal public fields are returned.
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data, error } = await supabaseAdmin
        .from("studio_candidates")
        .select("id,name,address,postcode,town,latitude,longitude,website_url,payload")
        .contains("payload", { directory_publication_status: "public_observed_location_reviewed" })
        .limit(100);
      if (error) throw error;
      const studios = ((data || []) as RegistryRow[])
        .map(asPublic).filter((row): row is NonNullable<typeof row> => row !== null)
        .sort((a,b) => a.name.localeCompare(b.name));
      return new Response(JSON.stringify({ studios, total: studios.length, snapshot: "public_observed_location" }), {
        status: 200, headers: { "content-type":"application/json; charset=utf-8",
          "cache-control":"public,max-age=0,s-maxage=120", "x-content-type-options":"nosniff" },
      });
    } catch (err) {
      console.error("Studio directory read failure", err instanceof Error ? err.message : "unknown");
      return new Response(JSON.stringify({ error:"Studio directory temporarily unavailable." }), {
        status:503,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"},
      });
    }
  } } },
});
