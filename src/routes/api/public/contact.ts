import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const origin = request.headers.get("origin");
        const allowedOrigins = new Set(["https://getinksights.co.uk", "https://www.getinksights.co.uk"]);
        if (origin && !allowedOrigins.has(origin)) return json({ ok: false, error: "Origin not allowed." }, 403);

        const contentType = request.headers.get("content-type") || "";
        if (!contentType.toLowerCase().includes("application/json")) return json({ ok: false, error: "Content-Type must be application/json." }, 415);

        let body: Record<string, unknown>;
        try {
          body = await request.json();
        } catch {
          return json({ ok: false, error: "Invalid request." }, 400);
        }

        const name = String(body.name || "").trim();
        const email = String(body.email || "").trim().toLowerCase();
        const studioName = String(body.studio_name || "").trim();
        const topic = String(body.topic || "").trim();
        const message = String(body.message || "").trim();
        const consent = body.consent === true;
        const honeypot = String(body.company_url || "").trim();

        if (honeypot) return json({ ok: true, suppressed: true });
        if (!name || name.length > 120 || !/^\S+@\S+\.\S+$/.test(email) || !topic || !message || message.length < 10 || message.length > 10000 || !consent) {
          return json({ ok: false, error: "Please complete the required fields." }, 400);
        }

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin
            .from("enquiries")
            .insert({
              name,
              email,
              brief: message,
              project_type: topic,
              source: "website_contact",
              status: "new",
              consent_at: new Date().toISOString(),
            })
            .select("id")
            .single();

          if (error || !data?.id) {
            console.error("Contact enquiry persistence failed:", error);
            return json({ ok: false, error: "The message could not be recorded right now. Please try again." }, 503);
          }

          return json({ ok: true, enquiry_id: data.id }, 200);
        } catch (error) {
          console.error("Contact intake failed:", error instanceof Error ? error.message : String(error));
          return json({ ok: false, error: "The message could not be recorded right now. Please try again." }, 503);
        }
      },
    },
  },
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
