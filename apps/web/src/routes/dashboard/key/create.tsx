import { createFileRoute } from "@tanstack/react-router";
import KeyCreateForm from "./-components/key-create-form";

export const Route = createFileRoute("/dashboard/key/create")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Create Key</h1>

      <KeyCreateForm />
    </div>
  );
}
