import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/document")({
  staticData: {
    breadcrumb: { label: "Dokumen" },
  },
  component: () => <Outlet />,
});
