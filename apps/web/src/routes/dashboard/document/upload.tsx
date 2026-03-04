import { createFileRoute } from "@tanstack/react-router";
import DocumentUploadForm from "./-components/document-upload-form";

export const Route = createFileRoute("/dashboard/document/upload")({
  component: DashboardDocumentUploadPageComponent,
});

function DashboardDocumentUploadPageComponent() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Upload Document</h1>

      <DocumentUploadForm />
    </div>
  );
}
