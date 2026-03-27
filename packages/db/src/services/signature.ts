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

    const verification = verifyHybridSignature({
      hashHex: document.hash,
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

    const defaultReturn = {
      status: "INVALID", // VALID, INVALID, WARNING
      isAuthentic: false,
      message: "",
      extractedMetadata,
      dataDetails: null,
      cryptoDetails: null,
    };

    if (!extractedMetadata.hasSignature || !extractedMetadata.signatureData) {
      return {
        ...defaultReturn,
        status: "INVALID",
        message: "Peringatan: Tidak ditemukan metadata tanda tangan digital yang valid pada dokumen ini.",
      };
    }

    const fileSignatureData = extractedMetadata.signatureData;

    const isContentIntact = extractedMetadata.currentPhysicalHash === fileSignatureData.documentHash;
    if (!isContentIntact) {
      return {
        ...defaultReturn,
        // PERBAIKAN PESAN BUG:
        status: "INVALID",
        message:
          "Peringatan: Integritas dokumen terkompromi. Isi dokumen telah dimodifikasi atau diubah setelah ditandatangani.",
      };
    }

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
        status: "INVALID",
        message: "Data tanda tangan, pengguna, atau dokumen tidak ditemukan di dalam sistem database.",
      };
    }

    const { user: userData, key: keyData, document: documentData, signature: signatureData } = result;

    const cryptoVerification = verifyHybridSignature({
      hashHex: extractedMetadata.currentPhysicalHash,
      rsaSignatureBase64: fileSignatureData.rsaSignature,
      rsaPublicKeyPem: keyData.publicKeyRsa,
      eddsaSignatureBase64: fileSignatureData.eddsaSignature,
      eddsaPublicKeyPem: keyData.publicKeyEddsa,
    });

    let finalIsAuthentic = cryptoVerification.isAuthentic;
    let finalMessage = "Status: VALID. Dokumen utuh dan tanda tangan kriptografi terverifikasi.";
    let finalStatus = "VALID";

    // 5. PENGECEKAN VALIDITAS HISTORIS (KUNCI DICABUT)
    if (finalIsAuthentic && keyData.revokedAt !== null) {
      // Menggunakan .getTime() agar komparasi tanggal lebih akurat di TypeScript/NodeJS
      const signedTime = signatureData.signedAt ? new Date(signatureData.signedAt).getTime() : 0;
      const revokedTime = new Date(keyData.revokedAt).getTime();

      if (signedTime > revokedTime) {
        // SKENARIO ILEGAL: Ditandatangani SETELAH kunci mati
        finalIsAuthentic = false;
        finalStatus = "INVALID";
        finalMessage =
          "Status: TIDAK SAH. Secara kriptografi valid, namun dokumen ini ditandatangani SETELAH kunci publik pemiliknya dicabut (Revoked). Ini mengindikasikan penyalahgunaan kunci.";
      } else {
        // SKENARIO SAH: Ditandatangani SEBELUM kunci mati (Validitas Historis)
        finalStatus = "WARNING";
        finalMessage =
          "Status: VALID (Dengan Catatan). Dokumen ini sah karena ditandatangani pada saat kunci masih aktif. Catatan: Kunci publik ini sekarang telah dicabut (Revoked) oleh pemiliknya.";
      }
    } else if (!finalIsAuthentic) {
      finalStatus = "INVALID";
      finalMessage = `Status: TIDAK SAH. Gagal pada validasi kriptografi. RSA Valid: ${cryptoVerification.rsaValid}. EdDSA Valid: ${cryptoVerification.eddsaValid}`;
    }

    if (finalIsAuthentic && documentData.deletedAt !== null) {
      // Kita HANYA menambahkan (append) pesan tambahan, TANPA mengubah finalIsAuthentic.
      finalStatus = finalStatus === "VALID" ? "WARNING" : finalStatus; // Jika sudah INVALID, tetap INVALID. Jika VALID, naikkan ke WARNING.
      finalMessage +=
        " (Catatan Sistem: Salinan dokumen ini telah diarsipkan/dihapus dari antarmuka utama oleh pihak penandatangan, namun validitas hukum dan tanda tangannya tetap berlaku penuh).";
    }

    return {
      status: finalStatus,
      isAuthentic: finalIsAuthentic,
      message: finalMessage,
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
