import { z } from 'zod';

export const signatureMetadataSchema = z.object({
  documentHash: z.string(),
  documentId: z.string(),
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
});

export type SignatureMetadata = z.infer<typeof signatureMetadataSchema>;
export type CustomOfficeProperty = z.infer<typeof customOfficePropertySchema>;
export type CustomXmlStructure = z.infer<typeof customXmlStructureSchema>;
export type DocumentVerificationResult = z.infer<typeof documentVerificationResultSchema>;
