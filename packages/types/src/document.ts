import z from "zod";

import { createPaginationSchema, dateQuerySchema, documentFileSchema, documentKeySchema, idSchema } from "./utils";

export const documentSchema = z.object({
  id: idSchema,
  userId: idSchema,
  hash: z.string().max(255),
  fileName: z.string().max(255),
  title: z.string().min(1, "Title cannot be empty").max(255),
  description: z.string().min(1, "Description cannot be empty"),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

// --- Request Schema ---
export const documentSortFields = z.enum(["createdAt", "signedAt", "updatedAt", "title", "fileName"]);

export const documentInsertSchema = documentSchema.pick({
  title: true,
  description: true,
});

export const documentDataTableRequestSchema = createPaginationSchema(documentSortFields).extend({
  title: z.string().optional(),
  createdAt: dateQuerySchema,
  updatedAt: dateQuerySchema,
  signedAt: dateQuerySchema,
});

export const documentUploadSchema = documentSchema
  .pick({
    title: true,
    description: true,
  })
  .extend({
    file: documentFileSchema,
  });

export const documentIdSchema = z.object({
  id: idSchema,
});

export const documentSignSchema = z.object({
  documentId: idSchema,
  privateKey: documentKeySchema,
});

export const documentFileUploadSchema = z.object({
  file: documentFileSchema,
});

export const documentVerifySchema = z.object({
  document: documentFileSchema,
});

// --- Response Schema ---
export const documentTableItemSchema = documentSchema.extend({
  signedAt: z.date().nullable(),
});

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

export type DocumentTableItemSchema = z.infer<typeof documentTableItemSchema>;
export type DocumentDataTableRequestSchema = z.infer<typeof documentDataTableRequestSchema>;
export type DocumentDataTableResponseSchema = z.infer<typeof documentDataTableResponseSchema>;
export type DocumentSignResponseSchema = z.infer<typeof documentSignResponseSchema>;
export type DocumentSignSchema = z.infer<typeof documentSignSchema>;
export type DocumentUploadSchema = z.infer<typeof documentUploadSchema>;
export type DocumentFileUploadSchema = z.infer<typeof documentFileUploadSchema>;
export type GetAllDocumentResponseSchema = z.infer<typeof getAllDocumentResponseSchema>;
