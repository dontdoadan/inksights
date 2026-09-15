import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/guides/grey-line-healing-week-by-week")({
  beforeLoad: () => {
    throw redirect({ to: "/resources" });
  },
  component: () => null,
});
