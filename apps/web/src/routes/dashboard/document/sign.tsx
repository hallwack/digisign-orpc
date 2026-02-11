import { createFileRoute } from "@tanstack/react-router";

import { orpc } from "@/utils/orpc";

import SignDocumentForm from "./-components/sign-document-form";

export const Route = createFileRoute("/dashboard/document/sign")({
  component: DashboardDocumentSignPageComponent,
  loader: async ({ context: { queryClient } }) => {
    const documents = await queryClient.ensureQueryData(orpc.document.getAll.queryOptions());
    return { documents };
  },
});

function DashboardDocumentSignPageComponent() {
  const { documents } = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Sign Document</h1>

      <SignDocumentForm documents={documents} />
    </div>
  );
}
