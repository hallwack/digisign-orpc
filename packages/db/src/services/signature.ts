import { join, resolve } from "node:path";

import type { DocumentSignSchema } from "@digisign/types";

import { db } from "..";
import { parsePemSections } from "../libs/key-libs";
import { convertToSlug } from "../libs/slug";

export class SignatureService {
  static async signDocument(form: DocumentSignSchema) {
    const privateKeyFile = Buffer.from(await form.privateKey.arrayBuffer()).toString("utf8");

    const { id: keyId, eddsaKey, rsaKey } = parsePemSections(privateKeyFile);

    if (!keyId) {
      throw new Error("Invalid key ID");
    }

    if (!rsaKey || !eddsaKey) {
      throw new Error("Invalid keys");
    }

    const document = await db.query.documentTable.findFirst({
      where: (documentTable, { eq }) => eq(documentTable.id, form.documentId),
    });

    if (!document) {
      throw new Error("Document not found");
    }

    const dirName = convertToSlug(`${document.title}-${document.id}`);

    const filePath = join("public", "documents", dirName);

    await appendSignature(filePath, document.fileName, {
      documentHash: document.hash,
      documentId: document.id,
      eddsaSignature: signEddsa(document.hash, eddsaKey),
      rsaSignature: signRsa(document.hash, rsaKey),
      createdAt: new Date().toISOString(),
    });

    const { name: documentName, content: documentContent } = await getDocumentByName(filePath, "signed");

    const signature = await db.insert(signatureTable).values({
      id: generateId(15),
      keyId,
      documentId: document.id,
      rsaSignature: rsaKey,
      eddsaSignature: eddsaKey,
      signedAt: new Date(),
    });

    if (!signature) {
      throw new HTTPException(500, {
        message: "Failed to sign document",
      });
    }

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
