import { createFileRoute } from "@tanstack/react-router";

import DocumentDataTable from "./-components/document-datatable";

export const Route = createFileRoute("/dashboard/document/")({
  component: DashboardDocumentIndexPageComponent,
  staticData: {
    breadcrumb: { label: "Dokumen" },
  },
});

function DashboardDocumentIndexPageComponent() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dokumen</h1>

      <DocumentDataTable />
    </div>
  );
}
