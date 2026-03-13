import { createFileRoute } from "@tanstack/react-router";

import { orpc } from "@/utils/orpc";

import DocumentSignForm from "./-components/document-sign-form";

export const Route = createFileRoute("/dashboard/document/sign")({
  component: DashboardDocumentSignPageComponent,
  staticData: {
    breadcrumb: { label: "Sign Document" },
  },
  loader: async ({ context: { queryClient } }) => {
    const documents = await queryClient.fetchQuery(orpc.document.getAll.queryOptions());
    return { documents };
  },
});

function DashboardDocumentSignPageComponent() {
  const { documents } = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Sign Document</h1>

      <DocumentSignForm documents={documents} />
    </div>
  );
}
