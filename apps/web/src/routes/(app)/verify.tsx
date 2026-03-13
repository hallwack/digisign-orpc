import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CheckIcon, FileIcon, UploadIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import BreadcrumbHeader from "@/components/breadcrumb-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/(app)/verify")({
  component: VerifyPageComponent,
  staticData: {
    breadcrumb: { label: "Verify" },
  },
});

const statusMap = {
  valid: {
    icon: CheckIcon,
    alertClass:
      "bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-50 border-green-200 dark:border-green-900",
  },
  invalid: {
    icon: XIcon,
    alertClass: "bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-50 border-red-200 dark:border-red-900",
  },
};

function VerifyPageComponent() {
  const mutation = useMutation(
    orpc.document.verify.mutationOptions({
      onSuccess: (data) => {
        console.log("Data", data);
        if (data.isAuthentic) {
          toast.success(
            `Document is signed by ${data.user?.name} and is ${data.cryptoDetails?.rsaValid && data.cryptoDetails?.eddsaValid ? "valid" : "invalid"}.`,
          );
        }
      },
      onError: (error) => {
        console.error("Document verification failed:", error);
        toast.error("Document verification failed. Please try again.");
      },
    }),
  );

  const form = useForm({
    defaultValues: {
      file: null as unknown as File,
    },
    onSubmit: async ({ value }) => {
      console.log("File to verify:", value);
      mutation.mutate(value);
    },
  });

  return (
    <main className="mx-auto min-h-screen max-w-300 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-6">
        <BreadcrumbHeader />

        <div className="space-y-4">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">Verifikasi Dokumen</h1>
          <p className="text-muted-foreground max-w-lg text-sm">
            Unggah dokumen Anda untuk diverifikasi keaslian dan validitasnya secara otomatis dalam hitungan detik.
          </p>
        </div>

        <div className="@container/content space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Dokumen</CardTitle>
              <CardDescription>Format yang diterima: PDF, DOCX, XLSX — Maks. 10 MB</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  form.handleSubmit();
                }}
                className="space-y-6"
              >
                <form.Field
                  name="file"
                  children={(field) => {
                    const file = field.state.value;

                    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                      const selectedFile = e.target.files?.[0];
                      if (selectedFile) {
                        field.handleChange(selectedFile);
                      }
                    };

                    const handleRemoveFile = () => {
                      field.handleChange(null as unknown as File);
                    };

                    return (
                      <div className="space-y-4">
                        {!file ? (
                          <div className="upload-zone border-input bg-muted/30 relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors">
                            <input
                              type="file"
                              id="fileInput"
                              accept=".pdf,.xlsx,.docx"
                              className="absolute inset-0 cursor-pointer opacity-0"
                              onChange={handleFileChange}
                              onBlur={field.handleBlur}
                            />
                            <div className="border-border bg-background mb-3 flex h-11 w-11 items-center justify-center rounded-full border shadow-sm">
                              <UploadIcon size={20} />
                            </div>
                            <p className="text-foreground text-sm font-medium">Klik atau seret file ke sini</p>
                            <p className="text-muted-foreground mt-1 text-xs">Pilih file dari perangkat Anda</p>
                            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                              {["PDF", "XLSX", "DOCX"].map((ext) => (
                                <span
                                  key={ext}
                                  className="bg-secondary text-secondary-foreground inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
                                >
                                  {ext}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div
                            id="fileChip"
                            className="border-border bg-muted/40 flex items-center gap-3 rounded-lg border p-3"
                          >
                            <div className="border-border bg-background flex h-9 w-9 shrink-0 items-center justify-center rounded-md border shadow-sm">
                              <FileIcon size={16} className="text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{file.name}</p>
                              <p className="text-muted-foreground text-xs">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                            <Button
                              type="button"
                              onClick={handleRemoveFile}
                              variant="destructive"
                              size="icon"
                              className="cursor-pointer"
                            >
                              <XIcon size={12} />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
                <Button type="submit" className="w-full">
                  Submit
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hasil Verifikasi</CardTitle>
              <CardDescription>Format yang diterima: PDF, DOCX, XLSX — Maks. 10 MB</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent></CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
