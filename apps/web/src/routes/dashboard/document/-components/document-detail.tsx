import { Link } from "@tanstack/react-router";
import {
  CheckCircle2Icon,
  CheckIcon,
  DownloadIcon,
  KeyIcon,
  PencilIcon,
  ShieldCheckIcon,
  ShieldXIcon,
  TrashIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import type { DocumentDetailResponseSchema } from "@digisign/types";

import CopyButton from "@/components/copy-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatDateSpecific } from "@/lib/format";
import { base64ToBlob, cn, downloadBlob } from "@/lib/utils";
import { client } from "@/utils/orpc";

const fileExtensionColors: Record<string, string> = {
  pdf: "bg-red-100 text-red-800 border-red-300",
  docx: "bg-blue-100 text-blue-800 border-blue-300",
  xlsx: "bg-green-100 text-green-800 border-green-300",
};

const mimeType: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export default function DocumentDetail({ detail }: { detail: DocumentDetailResponseSchema }) {
  const extension = detail.fileName.split(".").pop()?.toLowerCase() ?? "file";
  const fileMimeType = mimeType[extension] || "application/octet-stream";
  const colorClasses = fileExtensionColors[extension.toLowerCase()] || "bg-primary/10 text-primary border-primary/20";

  const [api] = useState(() => client);

  const [downloadType, setDownloadType] = useState<"original" | "signed" | null>(null);

  const handleDownloadDocument = async (type: "original" | "signed") => {
    try {
      setDownloadType(type);

      const response =
        type === "original"
          ? await api.document.downloadOriginal({ id: detail.id })
          : await api.document.downloadSigned({ id: detail.id });

      if (response) {
        const blob = base64ToBlob(response.fileBuffer, response.mimeType);
        downloadBlob(blob, response.fileName);
        toast.success("Download dimulai");
      }
    } catch (error) {
      console.error("Download gagal", error);
      toast.error("Download gagal. Silahkan coba lagi.");
    } finally {
      setDownloadType(null);
    }
  };

  return (
    <div className="@container/detail-layout">
      <div className="flex flex-col gap-6 @[900px]/detail-layout:flex-row">
        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {/* Status Card */}
          <div className="@container/status-card">
            {detail.signature === null ? (
              <Alert className="bg-destructive/10 text-destructive dark:bg-destructive/10 dark:text-descructive flex flex-col items-center justify-between gap-4! border-none p-6 @[360px]/status-card:flex-row @[360px]/status-card:items-center">
                <div className="flex flex-col justify-between gap-4 @[480px]/status-card:flex-row @[480px]/status-card:items-center">
                  <div className="flex items-center gap-6">
                    <ShieldXIcon className="h-10 w-10" />
                    <div className="space-y-1">
                      <AlertTitle className="text-base font-semibold">Belum Ditandatangan</AlertTitle>
                      <AlertDescription className="text-xs">
                        Mohon segera tandatangani dokumen ini untuk memastikan keaslian dan integritasnya. Klik tombol
                        "Tandatangani Sekarang" di bawah untuk memulai proses penandatanganan digital.
                      </AlertDescription>
                    </div>
                  </div>
                </div>
              </Alert>
            ) : (
              <Alert className="flex flex-col items-center justify-between gap-4! border-none bg-green-600/10 p-6 text-green-600 @[360px]/status-card:flex-row @[360px]/status-card:items-center dark:bg-green-400/10 dark:text-green-400">
                <div className="flex flex-col justify-between gap-4 @[480px]/status-card:flex-row @[480px]/status-card:items-center">
                  <div className="flex items-center gap-6">
                    <ShieldCheckIcon className="h-10 w-10" />
                    <div className="space-y-1">
                      <AlertTitle className="text-base font-semibold">Sudah Ditandatangani</AlertTitle>
                      <AlertDescription className="text-xs">
                        Tandatangan RSA dan EdDSA Valid · {formatDateSpecific(detail.signature.signedAt ?? "")}
                      </AlertDescription>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    nativeButton={false}
                    render={
                      <Link to="/dashboard/document/verify">
                        <CheckCircle2Icon />
                        Verifikasi Sekarang
                      </Link>
                    }
                  />
                </div>
              </Alert>
            )}
          </div>

          {/* Informasi Dokumen */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Dokumen</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="@container/doc-info space-y-6">
              <div className="grid grid-cols-1 gap-4 @[640px]/doc-info:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">ID Dokumen</span>
                  <div className="flex flex-col items-start justify-between gap-2 @[300px]/doc-info:flex-row @[300px]/doc-info:items-center">
                    <code className="text-foreground font-mono text-sm">{detail.id}</code>
                    <CopyButton text={detail.id} />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">ID User</span>
                  <div className="flex flex-col items-start justify-between gap-2 @[300px]/doc-info:flex-row @[300px]/doc-info:items-center">
                    <code className="text-foreground font-mono text-sm">{detail.userId}</code>
                    <CopyButton text={detail.userId} />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Nama File</span>
                  <span className="text-foreground text-sm">{detail.fileName}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Ukuran File</span>
                  <span className="text-foreground text-sm">{detail.fileSize}</span>
                </div>

                {detail.signature !== null && (
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Ukuran File Setelah Ditandatangani</span>
                    <span className="text-foreground text-sm">{detail.fileSizeSigned}</span>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Dibuat Pada</span>
                  <span className="text-foreground text-sm">{formatDateSpecific(detail.createdAt ?? "")}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Format</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                        colorClasses,
                      )}
                    >
                      {extension.toUpperCase()}
                    </span>
                    <span className="text-muted-foreground text-xs">{fileMimeType}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">
                    Document Hash{" "}
                    <span className="text-muted-foreground/60">(document_hash · SHA-256 Content-Based)</span>
                  </span>
                  <CopyButton
                    text={detail.hash}
                    render={
                      <button className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs transition-colors">
                        <svg
                          width="11"
                          height="11"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <rect x="9" y="9" width="13" height="13" rx="2" />
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                        </svg>
                        Salin
                      </button>
                    }
                  />
                </div>
                <div className="bg-muted border-border text-foreground rounded-md border px-3 py-2.5 font-mono text-xs leading-relaxed break-all">
                  {detail.hash}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Riwayat Tanda Tangan */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Tanda Tangan</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="@container/sig-entry space-y-6">
              {detail.signature !== null ? (
                <>
                  <div className="bg-muted border-border @container/sig-fields overflow-hidden rounded-lg border">
                    <div className="divide-border grid grid-cols-1 divide-y">
                      <div className="divide-border grid grid-cols-1 divide-y @[420px]/sig-fields:grid-cols-[140px_1fr] @[420px]/sig-fields:divide-x @[420px]/sig-fields:divide-y-0">
                        <div className="flex items-center p-3">
                          <p className="text-muted-foreground">Nama</p>
                        </div>
                        <div className="text-foreground p-3 font-mono">{detail.user.name}</div>
                      </div>

                      <div className="divide-border grid grid-cols-1 divide-y @[420px]/sig-fields:grid-cols-[140px_1fr] @[420px]/sig-fields:divide-x @[420px]/sig-fields:divide-y-0">
                        <div className="flex items-center p-3">
                          <p className="text-muted-foreground">ID Tanda Tangan</p>
                        </div>
                        <div className="text-foreground p-3 font-mono">{detail.signature.id}</div>
                      </div>

                      <div className="divide-border grid grid-cols-1 divide-y @[420px]/sig-fields:grid-cols-[140px_1fr] @[420px]/sig-fields:divide-x @[420px]/sig-fields:divide-y-0">
                        <div className="flex items-center p-3">
                          <p className="text-muted-foreground">ID Kunci</p>
                        </div>
                        <div className="text-foreground p-3 font-mono">{detail.signature.keyId}</div>
                      </div>

                      <div className="divide-border grid grid-cols-1 divide-y @[420px]/sig-fields:grid-cols-[140px_1fr] @[420px]/sig-fields:divide-x @[420px]/sig-fields:divide-y-0">
                        <div className="flex items-center p-3">
                          <p className="text-muted-foreground">Signature RSA</p>
                        </div>
                        <div className="flex items-start justify-between gap-2 p-3">
                          <code
                            id="eddsaSig"
                            className="text-foreground line-clamp-6 flex-1 font-mono text-xs leading-relaxed break-all"
                          >
                            {detail.signature.rsaSignature}
                          </code>
                        </div>
                      </div>

                      <div className="divide-border grid grid-cols-1 divide-y @[420px]/sig-fields:grid-cols-[140px_1fr] @[420px]/sig-fields:divide-x @[420px]/sig-fields:divide-y-0">
                        <div className="flex items-center p-3">
                          <p className="text-muted-foreground">Signature EdDSA</p>
                        </div>
                        <div className="flex items-start justify-between gap-2 p-3">
                          <code
                            id="eddsaSig"
                            className="text-foreground line-clamp-3 flex-1 font-mono text-xs leading-relaxed break-all"
                          >
                            {detail.signature.eddsaSignature}
                          </code>
                        </div>
                      </div>

                      <div className="divide-border grid grid-cols-1 divide-y @[420px]/sig-fields:grid-cols-[140px_1fr] @[420px]/sig-fields:divide-x @[420px]/sig-fields:divide-y-0">
                        <div className="flex items-center p-3">
                          <p className="text-muted-foreground">Ditandatangani Pada</p>
                        </div>
                        <div className="text-foreground p-3 font-mono">
                          {formatDateSpecific(detail.signature.signedAt ?? "")}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-12 text-center">
                  <div className="bg-muted border-border mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border">
                    <PencilIcon />
                  </div>
                  <p className="text-foreground mb-1 text-sm font-medium">Belum Ditandatangani</p>
                  <p className="text-muted-foreground mb-4 text-xs">Dokumen ini belum memiliki tanda tangan digital.</p>
                  <Link
                    to="/dashboard/document/sign"
                    className="bg-primary text-primary-foreground inline-flex h-9 items-center gap-2 rounded-md px-4 text-sm font-medium transition-opacity hover:opacity-90"
                  >
                    Tandatangani Sekarang
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Aside */}
        <div className="flex shrink-0 flex-col gap-5 @[900px]/detail-layout:w-72">
          {/* Key Used */}
          {detail.signature !== null && (
            <Card>
              <CardHeader>
                <CardTitle>Key yang Digunakan</CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="space-y-6">
                <div className="mb-4 flex items-start gap-3">
                  <div className="bg-primary/10 border-primary/20 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
                    <KeyIcon size={16} className="stroke-primary" />
                  </div>
                  <div>
                    <p className="text-card-foreground text-sm font-semibold">{detail.signature.key.keyName}</p>
                    <code className="text-muted-foreground block font-mono text-xs text-wrap">
                      {detail.signature.key.id}
                    </code>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="bg-muted flex items-center justify-between rounded-md px-3 py-2">
                    <span className="text-muted-foreground text-xs">Public Key RSA</span>
                    {detail.signature.key.publicKeyRsa ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                        <CheckIcon size={10} />
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                        <XIcon size={10} />
                        Non-Aktif
                      </span>
                    )}
                  </div>
                  <div className="bg-muted flex items-center justify-between rounded-md px-3 py-2">
                    <span className="text-muted-foreground text-xs">Public Key EdDSA</span>
                    {detail.signature.key.publicKeyEddsa ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                        <CheckIcon size={10} />
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                        <XIcon size={10} />
                        Non-Aktif
                      </span>
                    )}
                  </div>
                  <div className="bg-muted flex items-center justify-between rounded-md px-3 py-2">
                    <span className="text-muted-foreground text-xs">Dibuat Pada</span>
                    <span className="text-foreground text-xs">{formatDate(detail.signature.key.createdAt ?? "")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Aksi</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-1">
              <Button
                variant="ghost"
                className="hover:bg-primary/10! h-auto w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium"
                nativeButton={false}
                render={
                  <Link to="/dashboard/document/sign">
                    <div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
                      <PencilIcon className="text-primary h-4 w-4" />
                    </div>
                    Tandatangan Dokumen
                  </Link>
                }
              />

              <Button
                variant="ghost"
                className="hover:bg-accent h-auto w-full cursor-pointer justify-start gap-3 px-3 py-2.5 text-left text-sm font-medium whitespace-normal"
                onClick={() => handleDownloadDocument("original")}
                disabled={downloadType === "original"}
              >
                <div className="bg-muted-foreground/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
                  <DownloadIcon className="stroke-muted-foreground h-4 w-4" />
                </div>
                {downloadType === "original" ? "Mengunduh..." : "Unduh Dokumen Asli"}
              </Button>

              {detail.signature !== null && (
                <Button
                  variant="ghost"
                  className="hover:bg-accent h-auto w-full cursor-pointer justify-start gap-3 px-3 py-2.5 text-left text-sm font-medium whitespace-normal"
                  onClick={() => handleDownloadDocument("signed")}
                  disabled={downloadType === "signed"}
                >
                  <div className="bg-muted-foreground/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
                    <DownloadIcon className="stroke-muted-foreground h-4 w-4" />
                  </div>
                  {downloadType === "signed" ? "Mengunduh..." : "Unduh Dokumen yang Ditandatangani"}
                </Button>
              )}

              <Button
                variant="ghost"
                className="hover:bg-accent h-auto w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium"
                nativeButton={false}
                render={
                  <Link to="/dashboard/document/verify">
                    <div className="bg-muted-foreground/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
                      <CheckCircle2Icon className="stroke-muted-foreground h-4 w-4" />
                    </div>
                    Verifikasi Dokumen
                  </Link>
                }
              />

              <Separator />

              <Button
                variant="ghost"
                className="hover:bg-destructive/10! text-destructive! hover:text-destructive h-auto w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium"
              >
                <div className="bg-destructive/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
                  <TrashIcon className="stroke-destructive h-4 w-4" />
                </div>
                Hapus Dokumen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
