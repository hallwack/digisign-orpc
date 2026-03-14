import { and, eq } from "drizzle-orm";
import { join, resolve } from "node:path";

import type { DocumentFileUploadSchema, DocumentSignSchema } from "@digisign/types";

import { db } from "..";
import { getDocumentByName } from "../libs/document";
import { generateId } from "../libs/random";
import { appendSignature, verifyDocumentSignature, verifyHybridSignature } from "../libs/signature";
import { convertToSlug } from "../libs/slug";
import { documentTable, keyTable, signatureTable, userTable } from "../tables";

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
    const extractedMetadata = await verifyDocumentSignature(form.file);

    const defaultReturn = {
      isAuthentic: false,
      message: "",
      extractedMetadata,
      dataDetails: null,
      cryptoDetails: null,
    };

    if (!extractedMetadata.hasSignature || !extractedMetadata.signatureData) {
      return {
        ...defaultReturn,
        message: "No valid signature metadata found in the document.",
      };
    }

    const fileSignatureData = extractedMetadata.signatureData;

    const [result] = await db
      .select({
        signature: signatureTable,
        key: keyTable,
        document: documentTable,
        user: userTable,
      })
      .from(signatureTable)
      .innerJoin(keyTable, eq(signatureTable.keyId, keyTable.id))
      .innerJoin(userTable, eq(keyTable.userId, userTable.id))
      .innerJoin(documentTable, eq(signatureTable.documentId, documentTable.id))
      .where(and(eq(keyTable.id, fileSignatureData.keyId), eq(documentTable.id, fileSignatureData.documentId)));

    if (!result) {
      return {
        ...defaultReturn,
        message: "Signature record or associated key/user not found in the database.",
      };
    }

    const {
      user: userData,
      key: keyData,
      document: documentData,
      signature: signatureData,
    } = result;

    const cryptoVerification = verifyHybridSignature({
      hashHex: extractedMetadata.currentPhysicalHash,
      rsaSignatureBase64: fileSignatureData.rsaSignature,
      rsaPublicKeyPem: keyData.publicKeyRsa,
      eddsaSignatureBase64: fileSignatureData.eddsaSignature,
      eddsaPublicKeyPem: keyData.publicKeyEddsa,
    });

    return {
      isAuthentic: cryptoVerification.isAuthentic,
      message: cryptoVerification.isAuthentic
        ? "Document signature is valid."
        : `Document signature is invalid. RSA Valid: ${cryptoVerification.rsaValid}. EdDSA Valid: ${cryptoVerification.eddsaValid}`,
      extractedMetadata,
      dataDetails: {
        userData,
        keyData,
        documentData,
        signatureData,
      },
      cryptoDetails: {
        rsaValid: cryptoVerification.rsaValid,
        eddsaValid: cryptoVerification.eddsaValid,
        totalVerificationTimeMs: cryptoVerification.totalVerificationTime,
        rsaVerificationTimeMs: cryptoVerification.rsaVerificationTime,
        eddsaVerificationTimeMs: cryptoVerification.eddsaVerificationTime,
      },
    };
  }
}
