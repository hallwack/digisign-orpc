import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/document")({
  component: DashboardDocumentPageComponent,
});

function DashboardDocumentPageComponent() {
  return <Outlet />;
}
