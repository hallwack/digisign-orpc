import { and, eq } from "drizzle-orm";
import { existsSync, rmSync } from "node:fs";
import path, { join, resolve } from "node:path";

import type { DocumentFileUploadSchema, DocumentSignSchema } from "@digisign/types";

import { db } from "..";
import { getDocumentByName } from "../libs/document";
import { InternalError, NotFoundError, ValidationError } from "../libs/errors";
import { generateId } from "../libs/random";
import { appendSignature, verifyDocumentSignature, verifyHybridSignature } from "../libs/signature";
import { convertToSlug } from "../libs/slug";
import { documentTable, keyTable, signatureTable, userTable } from "../tables";

type VerificationStatus = "VALID" | "INVALID" | "WARNING";

const MESSAGE = {
  // F-03: Metadata signature tidak ditemukan
  NO_SIGNATURE: "INVALID: Tidak ditemukan metadata tanda tangan digital yang valid pada dokumen ini.",

  // F-05: Replay attack — documentId tidak dikenal di database
  REPLAY_ATTACK: "INVALID: Terdeteksi kemungkinan replay attack. Metadata tanda tangan tidak berasal dari dokumen ini.",

  // F-02: Konten dokumen dimanipulasi setelah signing
  CONTENT_TAMPERED:
    "INVALID: Integritas dokumen terkompromi. Isi dokumen telah dimodifikasi atau diubah setelah ditandatangani.",

  // F-04: keyId atau documentId tidak ditemukan di database
  NOT_FOUND: "INVALID: Data tanda tangan, pengguna, atau dokumen tidak ditemukan di dalam sistem database.",

  // F-04b: Signature dipalsukan — RSA/EdDSA gagal verifikasi kriptografi
  CRYPTO_FAILED: (rsaValid: boolean, eddsaValid: boolean) =>
    `INVALID: Gagal pada validasi kriptografi. RSA Valid: ${rsaValid}. EdDSA Valid: ${eddsaValid}.`,

  // F-01: Dokumen valid
  VALID: "VALID: Dokumen utuh dan tanda tangan kriptografi terverifikasi.",

  // F-06: Kunci dicabut, dokumen ditandatangani SEBELUM revocation
  KEY_REVOKED_HISTORICAL:
    "WARNING: Dokumen ini sah karena ditandatangani pada saat kunci masih aktif. Catatan: Kunci publik ini sekarang telah dicabut (Revoked) oleh pemiliknya.",

  // F-07: Kunci dicabut, dokumen ditandatangani SETELAH revocation
  KEY_REVOKED_ILLEGAL:
    "INVALID: Secara kriptografi valid, namun dokumen ini ditandatangani SETELAH kunci publik pemiliknya dicabut (Revoked). Ini mengindikasikan penyalahgunaan kunci.",

  // Dokumen dihapus dari sistem (append ke pesan utama)
  DOC_ARCHIVED:
    " (Catatan Sistem: Salinan dokumen ini telah diarsipkan/dihapus dari antarmuka utama oleh pihak penandatangan, namun validitas hukum dan tanda tangannya tetap berlaku penuh).",
} as const;

export class SignatureService {
  static async signDocument(form: DocumentSignSchema) {
    const document = await db.query.documentTable.findFirst({
      where: (documentTable, { eq }) => eq(documentTable.id, form.documentId),
    });
    if (!document) throw new NotFoundError("Document not found");

    const publicKeyRecord = await db.query.keyTable.findFirst({
      where: (keyTable, { eq }) => eq(keyTable.id, form.keyId),
    });
    if (!publicKeyRecord) throw new NotFoundError("Public key not found");
    if (publicKeyRecord.revokedAt !== null) throw new ValidationError("Public key has been revoked");

    const payload = `${document.id}|${document.hash}`;

    const verification = verifyHybridSignature({
      payload,
      rsaSignatureBase64: form.rsaPrivateKey,
      rsaPublicKeyPem: publicKeyRecord.publicKeyRsa,
      eddsaSignatureBase64: form.eddsaPrivateKey,
      eddsaPublicKeyPem: publicKeyRecord.publicKeyEddsa,
    });

    if (!verification.isAuthentic)
      throw new ValidationError(
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
    if (!signatureRecord) throw new InternalError("Failed to sign document");

    return {
      fileData: Buffer.from(documentContent).toString("base64"),
      fileName: documentName,
      mimeType: "application/octet-stream",
    };
  }

  static async verifyDocument(form: DocumentFileUploadSchema) {
    const extractedMetadata = await verifyDocumentSignature(form.file);

    const buildResult = (
      status: VerificationStatus,
      isAuthentic: boolean,
      message: string,
      details: {
        dataDetails?: any;
        cryptoDetails?: any;
      } = {},
    ) => ({
      status,
      isAuthentic,
      message,
      extractedMetadata,
      dataDetails: details.dataDetails ?? null,
      cryptoDetails: details.cryptoDetails ?? null,
    });

    if (!extractedMetadata.hasSignature || !extractedMetadata.signatureData)
      return buildResult("INVALID", false, MESSAGE.NO_SIGNATURE);

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

    if (!result) return buildResult("INVALID", false, MESSAGE.NOT_FOUND);

    const { user: userData, key: keyData, document: documentData, signature: signatureData } = result;

    const isContentIntact = extractedMetadata.currentPhysicalHash === documentData.hash;
    if (!isContentIntact) {
      const message = MESSAGE.REPLAY_ATTACK;

      return buildResult("INVALID", false, message);
    }

    const payloadCurrent = `${fileSignatureData.documentId}|${extractedMetadata.currentPhysicalHash}`;

    const crypto = verifyHybridSignature({
      payload: payloadCurrent,
      rsaSignatureBase64: fileSignatureData.rsaSignature,
      rsaPublicKeyPem: keyData.publicKeyRsa,
      eddsaSignatureBase64: fileSignatureData.eddsaSignature,
      eddsaPublicKeyPem: keyData.publicKeyEddsa,
    });

    const cryptoDetails = {
      rsaValid: crypto.rsaValid,
      eddsaValid: crypto.eddsaValid,
      totalVerificationTimeMs: crypto.totalVerificationTime,
      rsaVerificationTimeMs: crypto.rsaVerificationTime,
      eddsaVerificationTimeMs: crypto.eddsaVerificationTime,
    };

    const dataDetails = {
      userData,
      keyData,
      documentData,
      signatureData,
    };

    if (!crypto.isAuthentic)
      return buildResult("INVALID", false, MESSAGE.CRYPTO_FAILED(crypto.rsaValid, crypto.eddsaValid), {
        dataDetails,
        cryptoDetails,
      });

    if (keyData.revokedAt !== null) {
      const signedTime = signatureData.signedAt ? new Date(signatureData.signedAt).getTime() : 0;
      const revokedTime = new Date(keyData.revokedAt).getTime();

      if (signedTime > revokedTime)
        return buildResult("INVALID", false, MESSAGE.KEY_REVOKED_ILLEGAL, { dataDetails, cryptoDetails });

      return buildResult("WARNING", true, MESSAGE.KEY_REVOKED_HISTORICAL, { dataDetails, cryptoDetails });
    }

    const isArchived = documentData.deletedAt !== null;

    const finalMessage = isArchived ? MESSAGE.VALID + MESSAGE.DOC_ARCHIVED : MESSAGE.VALID;

    const finalStatus: VerificationStatus = isArchived ? "WARNING" : "VALID";

    return buildResult(finalStatus, true, finalMessage, {
      dataDetails,
      cryptoDetails,
    });
  }

  static async resignDocument(form: DocumentSignSchema, userId: string) {
    const document = await db.query.documentTable.findFirst({
      where: (documentTable, { and, eq }) =>
        and(eq(documentTable.id, form.documentId), eq(documentTable.userId, userId)),
    });
    if (!document) throw new NotFoundError("Document not found or unauthorized");

    const existingSignature = await db.query.signatureTable.findFirst({
      where: (signatureTable, { eq }) => eq(signatureTable.documentId, document.id),
    });
    if (!existingSignature) throw new NotFoundError("Document has not been signed yet");

    const newKeyRecord = await db.query.keyTable.findFirst({
      where: (keyTable, { and, eq }) => and(eq(keyTable.id, form.keyId), eq(keyTable.userId, userId)),
    });
    if (!newKeyRecord) throw new NotFoundError("Public key not found or unauthorized");
    if (newKeyRecord.revokedAt !== null) throw new ValidationError("Public key has been revoked");

    const dirName = convertToSlug(`${document.title}-${document.id}`);
    const storagePath = resolve(process.cwd(), "../../storage/documents");
    const filePath = join(storagePath, dirName);

    const extension = path.extname(document.fileName);
    const baseName = path.basename(document.fileName, extension);
    const signedFileName = `${baseName}-signed${extension}`;
    const signedFilePath = join(filePath, signedFileName);

    if (existsSync(signedFilePath)) {
      rmSync(signedFilePath, { force: true });
      console.log(`Existing signed file ${signedFileName} removed before re-signing.`);
    }

    await appendSignature(filePath, signedFileName, {
      documentHash: document.hash,
      documentId: document.id,
      keyId: form.keyId,
      eddsaSignature: form.eddsaPrivateKey,
      rsaSignature: form.rsaPrivateKey,
      createdAt: new Date().toISOString(),
    });

    const { name: documentName, content: documentContent } = await getDocumentByName(filePath, "signed");

    const updatedSignature = await db
      .update(signatureTable)
      .set({
        keyId: form.keyId,
        rsaSignature: form.rsaPrivateKey,
        eddsaSignature: form.eddsaPrivateKey,
        signingDuration: form.signingTime,
        rsaSigningDuration: form.rsaSigningTime,
        eddsaSigningDuration: form.eddsaSigningTime,
        signedAt: new Date(),
      })
      .where(eq(signatureTable.documentId, document.id))
      .returning();
    if (!updatedSignature || updatedSignature.length === 0)
      throw new InternalError("Failed to update signature in database");

    return {
      fileData: Buffer.from(documentContent).toString("base64"),
      fileName: documentName,
      mimeType: "application/octet-stream",
    };
  }
}
