import { DocumentService } from "@digisign/db/services/document";
import { SignatureService } from "@digisign/db/services/signature";
import {
  documentDataTableRequestSchema,
  documentFileUploadSchema,
  documentIdActionSchema,
  documentIdSchema,
  documentSignSchema,
  documentUploadSchema,
} from "@digisign/types";

import { protectedProcedure, publicProcedure } from "..";

export const documentRouter = {
  all: protectedProcedure
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
  detail: protectedProcedure
    .route({
      path: "/document/{id}",
      method: "GET",
      tags: ["Document"],
      summary: "Get Document Detail",
      description: "Retrieve detailed information of a document by ID",
    })
    .input(documentIdSchema)
    .handler(async ({ input }) => {
      return DocumentService.getDocumentById(input.id);
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
  resign: protectedProcedure
    .route({
      path: "/document/resign",
      method: "POST",
      inputStructure: "detailed",
      tags: ["Document"],
      summary: "Resign Document",
      description: "Resign a document by ID",
    })
    .input(documentSignSchema)
    .handler(async ({ input, context }) => {
      return SignatureService.resignDocument(input, context.session.user.id);
    }),
  downloadOriginal: protectedProcedure
    .route({
      path: "/document/{id}/download/original",
      method: "GET",
      tags: ["Document"],
      summary: "Download Original Document",
      description: "Download the original document file by ID",
    })
    .input(documentIdSchema)
    .handler(async ({ input }) => {
      return DocumentService.downloadOriginalDocument(input.id);
    }),
  downloadSigned: protectedProcedure
    .route({
      path: "/document/{id}/download/signed",
      method: "GET",
      tags: ["Document"],
      summary: "Download Signed Document",
      description: "Download the signed document file by ID",
    })
    .input(documentIdSchema)
    .handler(async ({ input }) => {
      return DocumentService.downloadSignedDocument(input.id);
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
    .input(documentIdActionSchema)
    .handler(async ({ input }) => {
      return DocumentService.deleteDocumentById(input.id);
    }),
};
