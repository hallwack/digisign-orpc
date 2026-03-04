import { createFileRoute } from "@tanstack/react-router";

import DocumentDataTable from "./-components/document-datatable";

export const Route = createFileRoute("/dashboard/document/")({
  component: DashboardDocumentIndexPageComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      page: search.page as number | undefined,
      perPage: search.perPage as number | undefined,
      sort: search.sort as string | undefined,
      filters: search.filters as string | undefined,
      title: search.title as string | undefined,
      createdAt: search.createdAt as string | undefined,
      signedAt: search.signedAt as string | undefined,
    };
  },
});

function DashboardDocumentIndexPageComponent() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Document</h1>

      <DocumentDataTable />
    </div>
  );
}
