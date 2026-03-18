import { DocumentService } from "@digisign/db/services/document";
import { SignatureService } from "@digisign/db/services/signature";
import {
  documentDataTableRequestSchema,
  documentFileUploadSchema,
  documentIdSchema,
  documentSignSchema,
  documentUploadSchema,
} from "@digisign/types";

import { protectedProcedure, publicProcedure } from "..";

export const documentRouter = {
  getAll: protectedProcedure
    .route({
      path: "/document",
      method: "GET",
      tags: ["Document"],
      summary: "Get All Documents",
      description: "Retrieve all documents for the authenticated user",
    })
    .handler(async ({ context }) => {
      return DocumentService.getAllDocuments(context.session.user.id);
    }),
  datalist: protectedProcedure
    .route({
      path: "/document/datalist",
      method: "GET",
      tags: ["Document"],
      summary: "Get Document Datalist",
      description: "Retrieve datalist of documents for the authenticated user",
    })
    .input(documentDataTableRequestSchema)
    .handler(async ({ input, context }) => {
      return DocumentService.getDocumentDataTable(input, context.session.user.id);
    }),
  upload: protectedProcedure
    .route({
      path: "/document/upload",
      method: "POST",
      inputStructure: "detailed",
      tags: ["Document"],
      summary: "Upload Document",
      description: "Upload new document with logic check",
    })
    .input(documentUploadSchema)
    .handler(async ({ input, context }) => {
      return DocumentService.uploadDocument(input, context.session.user.id);
    }),
  sign: protectedProcedure
    .route({
      path: "/document/sign",
      method: "POST",
      inputStructure: "detailed",
      tags: ["Document"],
      summary: "Sign Document",
      description: "Sign a document by ID",
    })
    .input(documentSignSchema)
    .handler(async ({ input }) => {
      return SignatureService.signDocument(input);
    }),
  verify: publicProcedure
    .route({
      path: "/document/verify",
      method: "POST",
      inputStructure: "detailed",
      tags: ["Document"],
      summary: "Verify Document",
      description: "Verify a document by file",
    })
    .input(documentFileUploadSchema)
    .handler(async ({ input }) => {
      return SignatureService.verifyDocument(input);
    }),
  delete: protectedProcedure
    .route({
      path: "/document",
      method: "DELETE",
      inputStructure: "detailed",
      tags: ["Document"],
      summary: "Delete Document",
      description: "Delete a document by ID",
    })
    .input(documentIdSchema)
    .handler(async ({ input }) => {
      return DocumentService.deleteDocumentById(input.id);
    }),
};
