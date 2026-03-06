import path from "node:path";

import { SUPPORTED_EXTENSIONS } from "./constant";
import { isSupportedExtension } from "./encoder";
import { appendOfficeFileMetadata, appendPdfMetadata } from "./signer";
import { extractOfficeMetadata, extractPdfMetadata } from "./verifier";
import type { DocumentVerificationResult, SignatureMetadata } from "@digisign/types";

export async function verifyDocumentSignature(file: File): Promise<DocumentVerificationResult> {
  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const extension = path.extname(file.name).toLowerCase();

    if (!isSupportedExtension(extension)) {
      throw new Error(
        `Unsupported file extension: ${extension}. Supported extensions are: ${SUPPORTED_EXTENSIONS.join(", ")}`,
      );
    }

    let metadata: Record<string, string> | null = null;
    let hasSignature = false;
    let signatureData: SignatureMetadata | undefined;

    switch (extension) {
      case ".pdf":
        metadata = await extractPdfMetadata(fileBuffer);
        break;

      case ".docx":
      case ".xlsx":
        metadata = await extractOfficeMetadata(fileBuffer);
        break;

      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }

    // Check if the metadata contains signature information
    if (metadata) {
      const requiredSignatureFields = ["documentHash", "documentId", "rsaSignature", "eddsaSignature", "createdAt"];

      // Check for both camelCase and PascalCase variants
      const hasAllFields = requiredSignatureFields.every((field) => {
        const camelCase = metadata![field];
        const pascalCase = metadata![field.charAt(0).toUpperCase() + field.slice(1)];
        return (camelCase && typeof camelCase === "string") || (pascalCase && typeof pascalCase === "string");
      });

      if (hasAllFields) {
        hasSignature = true;
        signatureData = {
          documentHash: metadata.documentHash || metadata.DocumentHash,
          documentId: metadata.documentId || metadata.DocumentId,
          rsaSignature: metadata.rsaSignature || metadata.RSASignature,
          eddsaSignature: metadata.eddsaSignature || metadata.EDDSASignature,
          createdAt: metadata.createdAt || metadata.CreatedAt,
        };
      }
    }

    return {
      fileType: extension,
      metadata,
      hasSignature,
      signatureData,
    };
  } catch (error) {
    throw new Error(`Failed to verify document signature: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function appendSignature(filePath: string, docName: string, metaData: SignatureMetadata) {
  try {
    if (!filePath || !docName || !metaData) {
      throw new Error("Missing required parameters");
    }

    const extension = path.extname(docName).toLowerCase();

    if (!isSupportedExtension(extension)) {
      throw new Error(
        `Unsupported file extension: ${extension}. Supported extensions are: ${SUPPORTED_EXTENSIONS.join(", ")}`,
      );
    }

    const requiredFields: (keyof SignatureMetadata)[] = [
      "documentHash",
      "documentId",
      "rsaSignature",
      "eddsaSignature",
      "createdAt",
    ];

    for (const field of requiredFields) {
      if (!metaData[field] || typeof metaData[field] !== "string") {
        throw new Error(`Missing required metadata field: ${field}`);
      }
    }

    switch (extension) {
      case ".pdf":
        await appendPdfMetadata(filePath, docName, metaData);
        break;

      case ".docx":
      case ".xlsx":
        await appendOfficeFileMetadata(filePath, docName, metaData);
        break;

      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
  } catch (error) {
    throw new Error(`Failed to append signature: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
