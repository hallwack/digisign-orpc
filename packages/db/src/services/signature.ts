import { join } from "node:path";

import type { DocumentFileUploadSchema, DocumentSignSchema } from "@digisign/types";

import { db } from "..";
import { getDocumentByName } from "../libs/document";
import { generateId } from "../libs/random";
import { appendSignature, verifyDocumentSignature } from "../libs/signature";
import { convertToSlug } from "../libs/slug";
import { signatureTable } from "../tables";

export class SignatureService {
  static async signDocument(form: DocumentSignSchema) {
    const document = await db.query.documentTable.findFirst({
      where: (documentTable, { eq }) => eq(documentTable.id, form.documentId),
    });

    if (!document) throw new Error("Document not found");

    const dirName = convertToSlug(`${document.title}-${document.id}`);

    const filePath = join("public", "documents", dirName);

    await appendSignature(filePath, document.fileName, {
      documentHash: document.hash,
      documentId: document.id,
      keyId: form.keyId,
      eddsaSignature: form.eddsaPrivateKey,
      rsaSignature: form.rsaPrivateKey,
      createdAt: new Date().toISOString(),
    });

    const { name: documentName, content: documentContent } = await getDocumentByName(filePath, "signed");

    const signature = await db.insert(signatureTable).values({
      id: generateId(15),
      keyId: form.keyId,
      documentId: document.id,
      rsaSignature: form.rsaPrivateKey,
      eddsaSignature: form.eddsaPrivateKey,
      signedAt: new Date(),
    });

    if (!signature) throw new Error("Failed to sign document");

    return {
      fileData: Buffer.from(documentContent).toString("base64"),
      fileName: documentName,
      mimeType: "application/octet-stream",
    };
  }

  static async verifyDocument(form: DocumentFileUploadSchema) {
    const verifiedDocument = await verifyDocumentSignature(form.file);

    return verifiedDocument;
  }
}
