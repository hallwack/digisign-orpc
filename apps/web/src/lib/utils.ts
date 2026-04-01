import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseSlug(slug: string) {
  const parts = slug.split("-");
  const documentId = parts.pop();
  const title = parts.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

  return { title, documentId };
}

export function downloadBlob(blob: Blob, filename: string) {
  if (blob.size === 0) {
    throw new Error("File yang diterima kosong.");
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function base64ToBlob(base64: string, mimeType: string): Blob {
  try {
    const pureBase64 = base64.includes(",") ? base64.split(",")[1] : base64;

    const binary = atob(pureBase64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return new Blob([bytes], { type: mimeType });
  } catch (error) {
    throw new Error(`Gagal mengonversi base64 ke Blob: ${error instanceof Error ? error.message : String(error)}`);
  }
}
