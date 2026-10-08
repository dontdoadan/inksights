import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/internal/prospect-intelligence")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handleProspectInternalRequest } = await import("@/features/prospect/server");
        return handleProspectInternalRequest(request);
      },
    },
  },
});
