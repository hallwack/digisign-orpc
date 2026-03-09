import z from "zod";

/**
 * HELPER: Untuk menangani parsing array date dari query string (DataTable)
 * Agar kode tidak repetitif (DRY)
 */
export const dateQuerySchema = z
  .string()
  .optional()
  .transform((val) => {
    if (!val) return [];
    try {
      const parsed = JSON.parse(val);
      const timestamps = z.array(z.coerce.number()).parse(parsed);
      return timestamps.map((ts) => new Date(ts));
    } catch {
      return [];
    }
  });

/**
 * HELPER: Validasi File/Blob yang kompatibel dengan Server (Bun) dan Browser
 */
export const fileSchema = z
  .custom<Blob | File>((val) => val instanceof Blob || val instanceof File, "Document is required")
  .refine(
    (file) =>
      [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
      ].includes(file.type),
    { message: "Invalid document file type (PDF, Word, or Excel only)" },
  );

export const documentKeySchema = z
  .instanceof(File, { message: "Private key is required" })
  .refine((file) => file.name.endsWith(".pem"), {
    message: "Private key must be a .pem file",
  });

export const documentFileSchema = z.instanceof(File, { message: "Document is required" }).refine(
  (file) =>
    [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/msword", // .doc
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/vnd.ms-excel", // .xls
    ].includes(file.type),
  { message: "Invalid document file type (PDF, Word, or Excel only)" },
);

export const idSchema = z
  .string()
  .length(32)
  .regex(/^[a-zA-Z0-9]+$/, "Invalid ID Format");

export const createPaginationSchema = <T extends z.ZodEnum<any>>(sortEnum: T) =>
  z.object({
    page: z.coerce.number().int().positive().default(1),
    perPage: z.coerce.number().int().positive().max(100).default(5),
    sort: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return [];
        try {
          const parsed = JSON.parse(val);
          const sortItem = z.object({
            id: sortEnum,
            desc: z.boolean().default(false),
          });
          return z.array(sortItem).parse(parsed);
        } catch {
          return [];
        }
      }),
    filters: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        try {
          return JSON.parse(val);
        } catch {
          return undefined;
        }
      }),
  });

export const createDataTableResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    pageCount: z.number(),
    total: z.number(),
    page: z.number(),
    perPage: z.number(),
  });
