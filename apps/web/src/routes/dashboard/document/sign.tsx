import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/document/sign")({
  component: DashboardDocumentSignPageComponent,
});

function DashboardDocumentSignPageComponent() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Upload Document</h1>

    </div>
  );
}
