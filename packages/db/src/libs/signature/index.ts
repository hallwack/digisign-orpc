import crypto from "node:crypto";
import path from "node:path";

import type { DocumentVerificationResultSchema, SignatureMetadataSchema } from "@digisign/types";

import { SUPPORTED_EXTENSIONS } from "./constant";
import { OfficeSignature } from "./office";
import { PdfSignature } from "./pdf";
import { isSupportedExtension, validateSignatureMetadata } from "./utils";

export async function verifyDocumentSignature(file: File): Promise<DocumentVerificationResultSchema> {
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
    let signatureData: SignatureMetadataSchema | undefined;

    switch (extension) {
      case ".pdf":
        metadata = await PdfSignature.extractMetadata(fileBuffer);
        break;

      case ".docx":
      case ".xlsx":
        metadata = await OfficeSignature.extractMetadata(fileBuffer);
        break;

      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }

    // Check if the metadata contains signature information
    if (metadata) {
      const normalizeMetadata: Record<string, string> = {};
      for (const [key, value] of Object.entries(metadata)) {
        const camelCaseKey = key.charAt(0).toLowerCase() + key.slice(1);
        normalizeMetadata[camelCaseKey] = value;
      }
      const validationResult = validateSignatureMetadata(normalizeMetadata);

      if (validationResult.hasSignature && validationResult.signatureData) {
        hasSignature = true;
        signatureData = validationResult.signatureData;
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

export async function appendSignature(filePath: string, docName: string, metaData: SignatureMetadataSchema) {
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

    const requiredFields: (keyof SignatureMetadataSchema)[] = [
      "documentHash",
      "documentId",
      "keyId",
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
        await PdfSignature.appendMetadata(filePath, docName, metaData);
        break;

      case ".docx":
      case ".xlsx":
        await OfficeSignature.appendMetadata(filePath, docName, metaData);
        break;

      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
  } catch (error) {
    throw new Error(`Failed to append signature: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export function verifyHybridSignature({
  hashHex,
  rsaSignatureBase64,
  rsaPublicKeyPem,
  eddsaSignatureBase64,
  eddsaPublicKeyPem,
}: {
  hashHex: string;
  rsaSignatureBase64: string;
  rsaPublicKeyPem: string;
  eddsaSignatureBase64: string;
  eddsaPublicKeyPem: string;
}) {
  try {
    const dataToVerify = Buffer.from(hashHex, "hex");

    const startVerifyingTime = performance.now();

    const startRsaVerifyingTime = performance.now();
    const rsaValid = crypto.verify("SHA256", dataToVerify, rsaPublicKeyPem, Buffer.from(rsaSignatureBase64, "base64"));
    const endRsaVerifyingTime = performance.now();
    const rsaVerificationTime = endRsaVerifyingTime - startRsaVerifyingTime;

    const startEddsaVerifyingTime = performance.now();
    const eddsaValid = crypto.verify(
      undefined,
      dataToVerify,
      eddsaPublicKeyPem,
      Buffer.from(eddsaSignatureBase64, "base64"),
    );
    const endEddsaVerifyingTime = performance.now();
    const eddsaVerificationTime = endEddsaVerifyingTime - startEddsaVerifyingTime;

    const endVerifyingTime = performance.now();
    const totalVerificationTime = endVerifyingTime - startVerifyingTime;
    return {
      rsaValid,
      eddsaValid,
      isAuthentic: rsaValid && eddsaValid,
      totalVerificationTime,
      rsaVerificationTime,
      eddsaVerificationTime,
    };
  } catch (error) {
    console.error("Error verifying hybrid signature:", error);
    return {
      rsaValid: false,
      eddsaValid: false,
      isAuthentic: false,
      totalVerificationTime: 0,
      rsaVerificationTime: 0,
      eddsaVerificationTime: 0,
    };
  }
}
