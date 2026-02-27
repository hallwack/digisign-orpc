import z from "zod";

import { createPaginationSchema, dateQuerySchema, documentFileSchema, documentKeySchema, idSchema } from "./utils";

export const documentSchema = z.object({
  id: idSchema,
  userId: idSchema,
  hash: z.string().max(255),
  fileName: z.string().max(255),
  title: z.string().min(1, "Title cannot be empty").max(255),
  description: z.string().min(1, "Description cannot be empty"),
  createdAt: z.date().or(z.iso.datetime()),
  updatedAt: z.date().or(z.iso.datetime()),
});

// --- Request Schema ---
export const documentSortFields = z.enum(["createdAt", "updatedAt", "title", "fileName"]);

export const documentInsertSchema = documentSchema.pick({
  title: true,
  description: true,
});

export const documentDataTableRequestSchema = createPaginationSchema(documentSortFields).extend({
  title: z.string().optional(),
  createdAt: dateQuerySchema.optional(),
  updatedAt: dateQuerySchema.optional(),
  signedAt: dateQuerySchema.optional(),
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

export const documentVerifySchema = z.object({
  document: documentFileSchema,
});

// --- Response Schema ---
export const documentTableItemSchema = documentSchema;

export const documentDataTableResponseSchema = z.object({
  data: z.array(documentTableItemSchema),
  pageCount: z.number(),
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
});

export const signatureMetadataSchema = z.object({
  documentHash: z.string(),
  documentId: idSchema,
  rsaSignature: z.string(),
  eddsaSignature: z.string(),
  createdAt: z.date().or(z.iso.datetime()),
})

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
