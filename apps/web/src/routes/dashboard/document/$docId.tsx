import { createFileRoute, notFound } from "@tanstack/react-router";

import DocumentDetail from "./-components/document-detail";

export const Route = createFileRoute("/dashboard/document/$docId")({
  component: DashboardDocumentDetailPageComponent,
  staticData: {
    breadcrumb: {
      label: ({ loaderData }: { loaderData: { title: string } }) => loaderData.title ?? "Detail Document",
    },
  },
  loader: async ({ params, context: { queryClient, orpc } }) => {
    try {
      const detail = await queryClient.fetchQuery(
        orpc.document.detail.queryOptions({
          input: {
            id: params.docId,
          },
        }),
      );
      if (!detail) throw notFound();
      return detail;
    } catch (error) {
      throw notFound();
    }
  },
  notFoundComponent: () => {
    return <div>Document not found!</div>;
  },
});

function DashboardDocumentDetailPageComponent() {
  const detail = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{detail.title}</h1>

      <DocumentDetail detail={detail} />
    </div>
  );
}
