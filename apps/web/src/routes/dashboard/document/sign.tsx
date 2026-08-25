import { createFileRoute } from "@tanstack/react-router";

import { orpc } from "@/utils/orpc";

import DocumentSignForm from "./-components/document-sign-form";

export const Route = createFileRoute("/dashboard/document/sign")({
  component: DashboardDocumentSignPageComponent,
  staticData: {
    breadcrumb: { label: "Tandatangan Dokumen" },
  },
  loader: async ({ context: { queryClient } }) => {
    const documents = await queryClient.fetchQuery(orpc.document.all.queryOptions());
    const keys = await queryClient.fetchQuery(orpc.key.all.queryOptions());
    return { documents, keys };
  },
});

function DashboardDocumentSignPageComponent() {
  const { documents, keys } = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Tandatangan Dokumen</h1>

      <DocumentSignForm documents={documents} keys={keys} />
    </div>
  );
}
