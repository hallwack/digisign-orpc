import { KeyService } from "@digisign/db/services/key";
import { keyDataTableRequestSchema, keyInsertSchema } from "@digisign/types";

import { protectedProcedure } from "..";

export const keyRouter = {
  datalist: protectedProcedure
    .route({
      path: "/key/datalist",
      method: "GET",
      tags: ["Key"],
      summary: "Get Key Datalist",
      description: "Retrieve datalist of keys for the authenticated user",
    })
    .input(keyDataTableRequestSchema)
    .handler(async ({ input, context }) => {
      return KeyService.getKeyDataTable(input, context.session.user.id);
    }),
  create: protectedProcedure
    .route({
      path: "/key",
      method: "POST",
      tags: ["Key"],
      summary: "Create Key",
      description: "Create a new key for the authenticated user",
    })
    .input(keyInsertSchema)
    .handler(async ({ input, context }) => {
      return KeyService.createKey(input.keyName, context.session.user.id);
    }),
};
