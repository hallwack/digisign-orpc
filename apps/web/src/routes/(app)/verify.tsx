import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangleIcon, CheckIcon, FileIcon, Loader2Icon, UploadIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { documentFileUploadSchema } from "@digisign/types";

import BreadcrumbHeader from "@/components/breadcrumb-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/(app)/verify")({
  component: VerifyPageComponent,
  staticData: {
    breadcrumb: { label: "Verifikasi" },
  },
  head: () => ({
    meta: [
      { title: "Verifikasi Dokumen - Veridoc" },
      {
        name: "description",
        content: "Verifikasi dokumen Anda",
      },
    ],
  }),
});

const statusMap = {
  VALID: {
    icon: CheckIcon,
    alertClass:
      "bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-50 border-green-200 dark:border-green-900",
    alertTitle: "Dokumen Terverifikasi Asli",
  },
  INVALID: {
    icon: XIcon,
    alertClass: "bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-50 border-red-200 dark:border-red-900",
    alertTitle: "Dokumen Tidak Valid",
  },
  WARNING: {
    icon: AlertTriangleIcon,
    alertClass:
      "bg-yellow-50 dark:bg-yellow-950/70 text-yellow-900 dark:text-yellow-100 border-yellow-200 dark:border-yellow-600",
    alertTitle: "Validitas Dokumen Diragukan",
  },
};

function VerifyPageComponent() {
  const mutation = useMutation(
    orpc.document.verify.mutationOptions({
      onSuccess: (data) => {
        console.log("Document verification result:", data);
        const signerName = data.dataDetails?.userData?.name || "User";
        if (data.isAuthentic) {
          toast.success(data.message);
        } else {
          toast.error(`Dokumen tidak valid. Ditandatangani oleh ${signerName}.`);
        }
      },
      onError: (error) => {
        console.error("Document verification failed:", error);
        toast.error("Gagal melakukan verifikasi dokumen. Silakan coba lagi.");
      },
    }),
  );

  const form = useForm({
    defaultValues: {
      file: null as unknown as File,
    },
    validators: {
      onSubmit: documentFileUploadSchema,
    },
    onSubmit: ({ value }) => {
      mutation.mutate(value);
    },
  });

  const responseData = mutation.data;
  const statusKey = responseData?.status as keyof typeof statusMap | undefined;
  const config = statusKey ? statusMap[statusKey] : statusMap.VALID;
  const StatusIcon = config.icon;

  const dataDetails = responseData?.dataDetails;
  const cryptoDetails = responseData?.cryptoDetails;
  const userData = dataDetails?.userData;
  const signatureData = dataDetails?.signatureData;
  const documentData = dataDetails?.documentData;

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
                className="space-y-6 pt-4"
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
                <Button type="submit" disabled={mutation.isPending} className="w-full cursor-pointer">
                  {mutation.isPending ? "Memverifikasi..." : "Submit"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hasil Verifikasi</CardTitle>
              <CardDescription>Ringkasan detail kriptografi dan validitas dokumen</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent>
              {!responseData && !mutation.isPending ? (
                <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                  <FileIcon className="h-12 w-12 opacity-20" />
                  <p className="text-sm">
                    Silakan unggah dan submit dokumen untuk melihat hasil verifikasinya di sini.
                  </p>
                </div>
              ) : mutation.isPending ? (
                <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                  <Loader2Icon className="h-12 w-12 animate-spin" />
                  <p className="animate-pulse text-sm">Sedang membedah struktur kriptografi...</p>
                </div>
              ) : responseData ? (
                <div className="animate-in fade-in zoom-in-95 space-y-6 pt-4 duration-300">
                  <Alert className={cn(config.alertClass)}>
                    <StatusIcon className="h-4 w-4" />
                    <AlertTitle>{config.alertTitle}</AlertTitle>
                    <AlertDescription className="">{responseData.message}</AlertDescription>
                  </Alert>

                  {dataDetails && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold">Informasi Penandatangan</h5>
                        <div className="bg-muted/30 rounded-md border p-3 text-sm">
                          <div className="grid grid-cols-3 gap-y-2">
                            <span className="text-muted-foreground">Nama</span>
                            <span className="col-span-2 font-medium">{userData?.name || "N/A"}</span>

                            <span className="text-muted-foreground">Email</span>
                            <span className="col-span-2">{userData?.email || "N/A"}</span>

                            <span className="text-muted-foreground">Waktu Sign</span>
                            <span className="col-span-2">
                              {signatureData?.signedAt ? formatDate(new Date(signatureData.signedAt)) : "N/A"}
                            </span>

                            <span className="text-muted-foreground">Nama File</span>
                            <span className="col-span-2">{documentData?.fileName || "N/A"}</span>

                            <span className="text-muted-foreground">Title</span>
                            <span className="col-span-2">{documentData?.title || "N/A"}</span>

                            <span className="text-muted-foreground">Deskripsi</span>
                            <span className="col-span-2">{documentData?.description || "N/A"}</span>

                            <span className="text-muted-foreground">Hash Dokumen</span>
                            <span className="col-span-2 break-all">{documentData?.hash || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {cryptoDetails && (
                    <div className="space-y-3">
                      <h5 className="text-sm font-semibold">Kecepatan Komputasi (Milidetik)</h5>
                      <div className="bg-muted/30 rounded-md border p-4 text-sm">
                        {signatureData && (
                          <div className="mb-4">
                            <div className="text-muted-foreground mb-2 font-semibold">
                              Pembuatan Tanda Tangan (Frontend)
                            </div>

                            <div className="flex items-center justify-between py-1">
                              <span className="text-muted-foreground">RSA 2048</span>
                              <span className="font-mono">
                                {/* Diperbaiki: Menambah fallback (?? 0) sebelum .toFixed */}
                                {(signatureData.rsaSigningDuration ?? 0).toFixed(2)} ms
                              </span>
                            </div>

                            <div className="flex items-center justify-between py-1">
                              <span className="text-muted-foreground">EdDSA (Ed25519)</span>
                              <span className="font-mono">
                                {(signatureData.eddsaSigningDuration ?? 0).toFixed(2)} ms
                              </span>
                            </div>

                            <div className="mt-1 flex items-center justify-between py-1 font-medium">
                              <span className="text-muted-foreground">Total Waktu Signing</span>
                              <span className="font-mono">{(signatureData.signingDuration ?? 0).toFixed(2)} ms</span>
                            </div>

                            <Separator className="my-3" />
                          </div>
                        )}

                        <div>
                          <div className="text-muted-foreground mb-2 font-semibold">Validasi Keaslian (Backend)</div>

                          <div className="flex items-center justify-between py-1">
                            <span className="text-muted-foreground">RSA 2048</span>
                            <div className="flex items-center gap-3">
                              <span className="font-mono">
                                {(cryptoDetails.rsaVerificationTimeMs ?? 0).toFixed(2)} ms
                              </span>
                              <span
                                className={cn(
                                  "font-medium",
                                  cryptoDetails.rsaValid
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400",
                                )}
                              >
                                {cryptoDetails.rsaValid ? "Valid" : "Invalid"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between py-1">
                            <span className="text-muted-foreground">EdDSA (Ed25519)</span>
                            <div className="flex items-center gap-3">
                              <span className="font-mono">
                                {(cryptoDetails.eddsaVerificationTimeMs ?? 0).toFixed(2)} ms
                              </span>
                              <span
                                className={cn(
                                  "font-medium",
                                  cryptoDetails.eddsaValid
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400",
                                )}
                              >
                                {cryptoDetails.eddsaValid ? "Valid" : "Invalid"}
                              </span>
                            </div>
                          </div>

                          <div className="mt-1 flex items-center justify-between py-1 font-medium">
                            <span className="text-muted-foreground">Total Waktu Verifikasi</span>
                            <span className="font-mono">
                              {(cryptoDetails.totalVerificationTimeMs ?? 0).toFixed(2)} ms
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
