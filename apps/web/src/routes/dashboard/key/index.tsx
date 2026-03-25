import { createFileRoute } from "@tanstack/react-router";

import KeyDataTable from "./-components/key-datatable";

export const Route = createFileRoute("/dashboard/key/")({
  component: DashboardKeyIndexPageComponent,
});

function DashboardKeyIndexPageComponent() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Key</h1>

      <KeyDataTable />
    </div>
  );
}
