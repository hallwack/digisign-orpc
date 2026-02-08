import { createFileRoute } from "@tanstack/react-router";
import UploadDocumentForm from "./-components/upload-document-form";

export const Route = createFileRoute("/dashboard/document/upload")({
  component: DashboardDocumentUploadPageComponent,
});

function DashboardDocumentUploadPageComponent() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Upload Document</h1>

      <UploadDocumentForm />
    </div>
  );
}
