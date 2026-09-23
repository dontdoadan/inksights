import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/offers")({
  component: OffersLayout,
});

function OffersLayout() {
  return <Outlet />;
}
