import { createFileRoute } from "@tanstack/react-router";

import DocumentDataTable from "./-components/document-datatable";

export const Route = createFileRoute("/dashboard/document/")({
  component: DashboardDocumentIndexPageComponent,
});

function DashboardDocumentIndexPageComponent() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Document</h1>

      <DocumentDataTable />
    </div>
  );
}
