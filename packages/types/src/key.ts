import { z } from "zod";

import { createPaginationSchema, dateQuerySchema, idSchema } from "./utils";

export const keySchema = z.object({
  id: idSchema,
  userId: idSchema,
  keyName: z.string().min(1, "Key name is required"),
  publicKeyRsa: z.string().min(1),
  publicKeyEddsa: z.string().min(1),
  createdAt: z.date().nullable(),
  revokedAt: z.date().nullable(),
});

// --- Request Schema ---
const keySortFields = z.enum(["createdAt", "revokedAt", "keyName", "id"]);

export const keyDataTableRequestSchema = createPaginationSchema(keySortFields).extend({
  keyName: z.string().optional(),
  createdAt: dateQuerySchema,
  revokedAt: dateQuerySchema,
});

export const keyInsertSchema = keySchema.pick({
  keyName: true,
});

export const keyRegenerateSchema = keySchema.pick({
  id: true,
});

// --- Response Schema ---
export const keyTableItemSchema = keySchema;

export const keyDataTableResponseSchema = z.object({
  data: z.array(keyTableItemSchema),
  pageCount: z.number(),
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
});

export const createKeySchema = keySchema.pick({
  keyName: true,
});

export const createKeyResponseSchema = z.object({
  fileData: z.string().describe("Base64 encoded PEM file content"),
  fileName: z.string().describe("Suggested filename for download"),
  mimeType: z.string().describe("MIME type of the file").default("application/x-pem-file"),
});

export const keyIdSchema = keySchema.pick({
  id: true,
});

export type KeyTableItemSchema = z.infer<typeof keyTableItemSchema>;
export type KeyRegenerateSchema = z.infer<typeof keyRegenerateSchema>;
export type KeyDataTableRequestSchema = z.infer<typeof keyDataTableRequestSchema>;
export type KeyDataTableResponseSchema = z.infer<typeof keyDataTableResponseSchema>;
export type CreateKeySchema = z.infer<typeof createKeySchema>;
export type KeyIdSchema = z.infer<typeof keyIdSchema>;
