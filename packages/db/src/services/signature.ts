import { eq } from "drizzle-orm";
import { join, resolve } from "node:path";

import type { DocumentFileUploadSchema, DocumentSignSchema } from "@digisign/types";

import { db } from "..";
import { getDocumentByName } from "../libs/document";
import { generateId } from "../libs/random";
import { appendSignature, verifyDocumentSignature, verifyHybridSignature } from "../libs/signature";
import { convertToSlug } from "../libs/slug";
import { keyTable, signatureTable, userTable } from "../tables";

export class SignatureService {
  static async signDocument(form: DocumentSignSchema) {
    const document = await db.query.documentTable.findFirst({
      where: (documentTable, { eq }) => eq(documentTable.id, form.documentId),
    });

    if (!document) throw new Error("Document not found");

    const publicKeyRecord = await db.query.keyTable.findFirst({
      where: (keyTable, { eq }) => eq(keyTable.id, form.keyId),
    });

    if (!publicKeyRecord) throw new Error("Public key not found");

    const verification = verifyHybridSignature({
      hashHex: document.hash,
      rsaSignatureBase64: form.rsaPrivateKey,
      rsaPublicKeyPem: publicKeyRecord.publicKeyRsa,
      eddsaSignatureBase64: form.eddsaPrivateKey,
      eddsaPublicKeyPem: publicKeyRecord.publicKeyEddsa,
    });

    if (!verification.isAuthentic)
      throw new Error(
        `Invalid digital signature. RSA Valid: ${verification.rsaValid}. EdDSA Valid: ${verification.eddsaValid}`,
      );

    const dirName = convertToSlug(`${document.title}-${document.id}`);
    const storagePath = resolve(process.cwd(), "../../storage/documents");
    const filePath = join(storagePath, dirName);

    await appendSignature(filePath, document.fileName, {
      documentHash: document.hash,
      documentId: document.id,
      keyId: form.keyId,
      eddsaSignature: form.eddsaPrivateKey,
      rsaSignature: form.rsaPrivateKey,
      createdAt: new Date().toISOString(),
    });

    const { name: documentName, content: documentContent } = await getDocumentByName(filePath, "signed");

    const signatureRecord = await db.insert(signatureTable).values({
      id: generateId(),
      keyId: form.keyId,
      documentId: document.id,
      rsaSignature: form.rsaPrivateKey,
      eddsaSignature: form.eddsaPrivateKey,
      signingDuration: form.signingTime,
      rsaSigningDuration: form.rsaSigningTime,
      eddsaSigningDuration: form.eddsaSigningTime,
      signedAt: new Date(),
    });

    if (!signatureRecord) throw new Error("Failed to sign document");

    return {
      fileData: Buffer.from(documentContent).toString("base64"),
      fileName: documentName,
      mimeType: "application/octet-stream",
    };
  }

  static async verifyDocument(form: DocumentFileUploadSchema) {
    const extractedData = await verifyDocumentSignature(form.file);

    if (!extractedData.hasSignature || !extractedData.signatureData) {
      return {
        isAuthentic: false,
        message: "No valid signature metadata found in the document.",
        documentData: extractedData,
        cryptoDetails: null,
        user: null,
      };
    }

    const { signatureData } = extractedData;

    const [result] = await db
      .select({ key: keyTable, user: userTable })
      .from(keyTable)
      .innerJoin(userTable, eq(keyTable.userId, userTable.id))
      .where(eq(keyTable.id, signatureData.keyId));

    const publicKeyRecord = result?.key;
    if (!publicKeyRecord) {
      return {
        isAuthentic: false,
        message: "Public key associated with the signature not found.",
        documentData: extractedData,
        cryptoDetails: null,
        user: null,
      };
    }

    const userData = result?.user;
    if (!userData) {
      return {
        isAuthentic: false,
        mesage: "User associated with the signature not found.",
        documentData: extractedData,
        cryptoDetails: null,
        user: null,
      };
    }

    const cryptoVerification = verifyHybridSignature({
      hashHex: signatureData.documentHash,
      rsaSignatureBase64: signatureData.rsaSignature,
      rsaPublicKeyPem: publicKeyRecord.publicKeyRsa,
      eddsaSignatureBase64: signatureData.eddsaSignature,
      eddsaPublicKeyPem: publicKeyRecord.publicKeyEddsa,
    });

    return {
      isAuthentic: cryptoVerification.isAuthentic,
      message: cryptoVerification.isAuthentic
        ? "Document signature is valid."
        : `Document signature is invalid. RSA Valid: ${cryptoVerification.rsaValid}. EdDSA Valid: ${cryptoVerification.eddsaValid}`,
      documentData: extractedData,
      cryptoDetails: {
        rsaValid: cryptoVerification.rsaValid,
        eddsaValid: cryptoVerification.eddsaValid,
        totalVerificationTimeMs: cryptoVerification.totalVerificationTime,
        rsaVerificationTimeMs: cryptoVerification.rsaVerificationTime,
        eddsaVerificationTimeMs: cryptoVerification.eddsaVerificationTime,
      },
      user: userData,
    };
  }
}
