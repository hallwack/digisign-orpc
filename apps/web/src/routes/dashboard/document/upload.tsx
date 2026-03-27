import { createFileRoute } from "@tanstack/react-router";

import DocumentUploadForm from "./-components/document-upload-form";

export const Route = createFileRoute("/dashboard/document/upload")({
  component: DashboardDocumentUploadPageComponent,
  staticData: {
    breadcrumb: { label: "Unggah Dokumen" },
  },
});

function DashboardDocumentUploadPageComponent() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Unggah Dokumen</h1>

      <DocumentUploadForm />
    </div>
  );
}
