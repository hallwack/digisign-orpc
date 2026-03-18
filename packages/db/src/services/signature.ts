import { and, eq } from "drizzle-orm";
import path, { join, resolve } from "node:path";

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

    const isContentIntact = extractedMetadata.currentPhysicalHash === fileSignatureData.documentHash;
    if (!isContentIntact) {
      return {
        ...defaultReturn,
        message:
          "Document content is intact and matches the original hash. No tampering detected. Proceeding to cryptographic verification.",
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
        message: "Signature record or associated key/user not found in the database.",
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
    let finalMessage = "Document signature is valid and content is intact.";

    // Cek ketika signature valid tapi key sudah direvoke
    if (finalIsAuthentic && keyData.revokedAt !== null) {
      // Jika dokumen ditandatangani sebelum key direvoke, maka masih dianggap valid tapi dengan catatan bahwa key sudah direvoke
      if ((signatureData.signedAt !== null && signatureData?.signedAt) > keyData.revokedAt) {
        // Jika dokumen ditandatangani setelah key direvoke, maka dianggap tidak valid
        finalIsAuthentic = false;
        finalMessage =
          "Document signature is valid and content is intact. However, the signing key was revoked after this document was signed.";
      } else {
        // Jika dokumen ditandatangani sebelum key direvoke, maka masih dianggap valid tapi dengan catatan bahwa key sudah direvoke
        finalMessage =
          "Valid document signature and content, but the signing key has been revoked. Please check the key's revocation date against the document's signing date for more details.";
      }
      // Catatan: Dalam kasus ini, kita masih menganggap signature valid karena secara kriptografi signature tersebut valid untuk dokumen tersebut. Namun, kita memberikan catatan bahwa key yang digunakan untuk menandatangani sudah direvoke, sehingga pengguna harus memeriksa tanggal penandatanganan dokumen terhadap tanggal revokasi key untuk menentukan apakah signature tersebut dapat dipercaya atau tidak.
    } else if (!finalIsAuthentic) {
      finalMessage = `Document signature is invalid. RSA Valid: ${cryptoVerification.rsaValid}. EdDSA Valid: ${cryptoVerification.eddsaValid}`;
    }

    return {
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
    if (!document) throw new Error("Document not found or unauthorized");

    const newKeyRecord = await db.query.keyTable.findFirst({
      where: (keyTable, { and, eq }) => and(eq(keyTable.id, form.keyId), eq(keyTable.userId, userId)),
    });
    if (!newKeyRecord) throw new Error("Public key not found or unauthorized");
    if (newKeyRecord.revokedAt !== null) throw new Error("Public key has been revoked");

    const dirName = convertToSlug(`${document.title}-${document.id}`);
    const storagePath = resolve(process.cwd(), "../../storage/documents");
    const filePath = join(storagePath, dirName);

    const extension = path.extname(document.fileName);
    const baseName = path.basename(document.fileName, extension);
    const signedFileName = `${baseName}-signed${extension}`;

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

    if (!updatedSignature || updatedSignature.length === 0) {
      throw new Error("Failed to update signature in database");
    }

    return {
      fileData: Buffer.from(documentContent).toString("base64"),
      fileName: documentName,
      mimeType: "application/octet-stream",
    };
  }
}
