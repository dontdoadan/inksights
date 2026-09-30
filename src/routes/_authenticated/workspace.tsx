import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/workspace")({
  beforeLoad: () => {
    throw redirect({ to: "/os" });
  },
  component: () => null,
  head: () => ({
    meta: [
      { title: "Workspace — INKSIGHTS" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});
