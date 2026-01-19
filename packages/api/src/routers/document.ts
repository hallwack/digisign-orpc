import { documentUploadSchema } from "@digisign/db/schemas/document";
import { DocumentService } from "@digisign/db/services/document";

import { protectedProcedure } from "..";

export const documentRouter = {
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
      return DocumentService.uploadDocument(input, context.session?.user.id);
    }),
};
