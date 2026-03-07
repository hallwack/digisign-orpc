import { type SignatureMetadataSchema, signatureMetadataSchema } from "@digisign/types";

import { SUPPORTED_EXTENSIONS } from "./constant";

export function isSupportedExtension(extension: string): extension is (typeof SUPPORTED_EXTENSIONS)[number] {
  return SUPPORTED_EXTENSIONS.includes(extension as any);
}

export function createSignedFileName(originalName: string, extension: string): string {
  return `${originalName}-signed.${extension}`;
}

export function validateSignatureMetadata(metadata: Record<string, string>): {
  hasSignature: boolean;
  signatureData?: SignatureMetadataSchema;
} {
  const result = signatureMetadataSchema.safeParse(metadata);

  if (!result.success) {
    return { hasSignature: false, signatureData: undefined };
  }

  return {
    hasSignature: true,
    signatureData: result.data,
  };
}
