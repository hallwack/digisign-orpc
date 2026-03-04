import { DocumentService } from "@digisign/db/services/document";
import { documentDataTableRequestSchema, documentIdSchema, documentUploadSchema } from "@digisign/types";

import { protectedProcedure } from "..";

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
