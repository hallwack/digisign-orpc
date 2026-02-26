import z from "zod";

import { dateQuerySchema, documentFileSchema, documentKeySchema } from "./utils";

export const documentSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  hash: z.string().max(255),
  fileName: z.string().max(255),
  title: z.string().min(1, "Title cannot be empty").max(255),
  description: z.string().min(1, "Description cannot be empty"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const documentInsertSchema = documentSchema.omit({
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
  createdAt: dateQuerySchema,
  updatedAt: dateQuerySchema,
  signedAt: dateQuerySchema,
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

export const documentUploadSchema = documentInsertSchema.extend({
  file: documentFileSchema,
});

export const documentIdSchema = z.object({
  id: documentSchema.shape.id,
});

export const documentSignSchema = z.object({
  documentId: documentSchema.shape.id,
  privateKey: documentKeySchema,
});

export const documentVerifySchema = z.object({
  document: documentFileSchema,
});

export const documentTableItemSchema = documentSchema;

export const documentDataTableResponseSchema = z.object({
  data: z.array(documentTableItemSchema),
  pageCount: z.number(),
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
});

export const documentShowResponseSchema = documentSchema.extend({
  fileSize: z.string().optional(),
});

export const documentSignResponseSchema = z.object({
  fileData: z.string(),
  fileName: z.string(),
  mimeType: z.string().default("application/pdf"),
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
