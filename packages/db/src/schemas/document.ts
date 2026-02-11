import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { documentTable } from "../tables";

export const documentSchema = createSelectSchema(documentTable);

export const documentInsertSchema = createInsertSchema(documentTable, {
  title: (schema) => schema.min(1, "Title cannot be empty"),
  description: (schema) => schema.min(1, "Description cannot be empty"),
}).omit({
  id: true,
  userId: true,
  fileName: true,
  hash: true,
  createdAt: true,
  updatedAt: true,
});

const documentSortFields = documentSchema.keyof().options;

const documentSortItemSchema = z.object({
  id: z.enum(documentSortFields),
  desc: z.boolean().optional(),
});

export const documentDataTableRequestSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(1).max(100).default(10),
  sort: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return [];
      try {
        const parsed = JSON.parse(val);
        return z.array(documentSortItemSchema).parse(parsed);
      } catch {
        return [];
      }
    }),
  title: z.string().optional(),
  createdAt: z
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
    }),
  updatedAt: z
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
    }),
  signedAt: z
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
    }),
  filters: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      try {
        return JSON.parse(val);
      } catch (err) {
        return err;
      }
    }),
});

export const documentTableItemSchema = documentSchema;

export const documentDataTableResponseSchema = z.object({
  data: z.array(documentTableItemSchema),
  pageCount: z.number(),
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
});

const fileSchema = z.instanceof(File).refine(
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

export const documentUploadSchema = documentInsertSchema.extend({
  file: z.instanceof(File, { message: "Document is required" }).refine(
    (file) =>
      [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        "application/msword", // .doc
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
        "application/vnd.ms-excel", // .xls
      ].includes(file.type),
    { message: "Invalid document file type (PDF, Word, or Excel only)" },
  ),
  title: z.string().min(1, { message: "Document title is required" }),
  description: z.string().min(1, { message: "Document description is required" }),
});

export const documentIdSchema = z.object({
  id: documentSchema.shape.id,
});

export const documentShowResponseSchema = documentSchema.extend({
  fileSize: z.string().optional(),
});

export const documentSignSchema = z.object({
  documentId: documentSchema.shape.id,
  privateKey: z.instanceof(File).refine((file) => file.name.endsWith(".pem"), {
    message: "Private key must be a .pem file",
  }),
});

export const documentSignResponseSchema = z.object({
  fileData: z.string(),
  fileName: z.string(),
  mimeType: z.string().default("application/pdf"),
});

export const documentVerifySchema = z.object({
  document: fileSchema,
});

export const getAllDocumentResponseSchema = z.array(
  documentSchema.pick({
    id: true,
    userId: true,
    fileName: true,
    title: true,
  }),
);

export type DocumentTableItem = z.infer<typeof documentTableItemSchema>;
export type DocumentDataTableRequest = z.infer<typeof documentDataTableRequestSchema>;
export type DocumentDataTableResponse = z.infer<typeof documentDataTableResponseSchema>;
export type DocumentUploadSchema = z.infer<typeof documentUploadSchema>;
export type GetAllDocumentResponse = z.infer<typeof getAllDocumentResponseSchema>;
