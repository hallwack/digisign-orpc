import { z } from "zod";

import { createPaginationSchema, dateQuerySchema } from "./utils";

export const keySchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
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

// --- Response Schema ---
export const keyTableItemSchema = keySchema;

export const keyDataTableResponseSchema = z.object({
  data: z.array(keyTableItemSchema),
  pageCount: z.number(),
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
});

export const createKeySchema = z.object({
  keyName: z.string().min(1, { message: "Key name is required" }),
});

export const createKeyResponseSchema = z.object({
  fileData: z.string().describe("Base64 encoded PEM file content"),
  fileName: z.string().describe("Suggested filename for download"),
  mimeType: z.string().describe("MIME type of the file").default("application/x-pem-file"),
});

export const keyIdSchema = z.object({
  id: z.string().min(1, { message: "Key ID is required" }),
});

export type KeyTableItem = z.infer<typeof keyTableItemSchema>;
export type KeyDataTableRequest = z.infer<typeof keyDataTableRequestSchema>;
export type KeyDataTableResponse = z.infer<typeof keyDataTableResponseSchema>;
export type CreateKeySchema = z.infer<typeof createKeySchema>;
export type KeyIdSchema = z.infer<typeof keyIdSchema>;
