import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/tools/tattoo-pain-chart-reality-check")({
  beforeLoad: () => {
    throw redirect({ to: "/resources" });
  },
  component: () => null,
});
