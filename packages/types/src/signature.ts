import { z } from "zod";

import { idSchema } from "./utils";

export const signatureMetadataSchema = z.object({
  documentHash: z.string(),
  documentId: idSchema,
  keyId: idSchema,
  rsaSignature: z.string(),
  eddsaSignature: z.string(),
  createdAt: z.iso.datetime(),
});

export const customOfficePropertySchema = z.object({
  $: z.object({
    fmtid: z.string(),
    pid: z.number(),
    name: z.string(),
  }),
  "vt:lpwstr": z.array(z.string()),
});

export const customXmlStructureSchema = z.object({
  Properties: z.object({
    $: z.object({
      xmlns: z.string(),
      "xmlns:vt": z.string(),
    }),
    property: z.array(customOfficePropertySchema),
  }),
});

export const documentVerificationResultSchema = z.object({
  fileType: z.string(),
  metadata: z.record(z.string(), z.string()).nullable(),
  hasSignature: z.boolean(),
  signatureData: signatureMetadataSchema.optional(),
  currentPhysicalHash: z.string(),
});

export const pemResultSchema = z.object({
  id: idSchema.optional(),
  rsaKey: z.string().optional(),
  eddsaKey: z.string().optional(),
});

export type SignatureMetadataSchema = z.infer<typeof signatureMetadataSchema>;
export type CustomOfficePropertySchema = z.infer<typeof customOfficePropertySchema>;
export type CustomXmlStructureSchema = z.infer<typeof customXmlStructureSchema>;
export type DocumentVerificationResultSchema = z.infer<typeof documentVerificationResultSchema>;
export type PemResultSchema = z.infer<typeof pemResultSchema>;
