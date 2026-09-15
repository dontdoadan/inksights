import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/guides/full-sleeve-cost-uk")({
  beforeLoad: () => {
    throw redirect({ to: "/resources" });
  },
  component: () => null,
});
