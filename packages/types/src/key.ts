import { z } from "zod";

import { createPaginationSchema, dateQuerySchema, idSchema } from "./utils";

export const passphraseSchema = z
  .string()
  .min(12, "Passphrase must be at least 12 characters long")
  .max(128, "Passphrase must be at most 128 characters long");

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

export const keyInsertSchema = keySchema
  .pick({
    keyName: true,
  })
  .extend({
    passphrase: passphraseSchema,
  });

export const keyRegenerateSchema = keySchema
  .pick({
    id: true,
  })
  .extend({
    passphrase: passphraseSchema,
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

export const createKeySchema = keySchema
  .pick({
    keyName: true,
  })
  .extend({
    passphrase: passphraseSchema,
  });

export const createKeyResponseSchema = z.object({
  id: idSchema,
  keyName: z.string(),
  publicKeyRsa: z.string(),
  publicKeyEddsa: z.string(),
  createdAt: z.date().nullable(),
});

export const keyIdSchema = keySchema.pick({
  id: true,
});

export const keyIdActionSchema = z.object({
  id: z.string(),
});

export const getAllKeyResponseSchema = z.array(
  keySchema.pick({
    id: true,
    userId: true,
    keyName: true,
  }),
);

export type KeyTableItemSchema = z.infer<typeof keyTableItemSchema>;
export type KeyRegenerateSchema = z.infer<typeof keyRegenerateSchema>;
export type KeyDataTableRequestSchema = z.infer<typeof keyDataTableRequestSchema>;
export type KeyDataTableResponseSchema = z.infer<typeof keyDataTableResponseSchema>;
export type CreateKeySchema = z.infer<typeof createKeySchema>;
export type KeyIdSchema = z.infer<typeof keyIdSchema>;
export type GetAllKeyResponseSchema = z.infer<typeof getAllKeyResponseSchema>;
