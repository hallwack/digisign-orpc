import { toast } from "sonner";

interface ORPCErrorResponse {
  message?: string;
  data: {
    description: string;
  };
}

const DURATION = 5000;

export function handleError(error: unknown, fallbackTitle = "Terjadi Kesalahan") {
  console.error("[System Error]", error);

  const errorTitles: Record<string, string> = {
    ValidationError: "Kesalahan Validasi",
    NotFoundError: "Data Tidak Ditemukan",
    UnauthorizedError: "Akses Ditolak",
    InternalServerError: "Masalah Server",
    DrizzleError: "Kesalahan Database",
  };

  const err = error as ORPCErrorResponse;

  const backendErrorName = err?.message;
  const backendDescription = err?.data?.description;

  const title = backendErrorName && errorTitles[backendErrorName] ? errorTitles[backendErrorName] : fallbackTitle;
  const description = backendDescription || err.message || "Silakan hubungi administrator.";

  return toast.error(title, {
    description: description,
    duration: DURATION,
  });
}
