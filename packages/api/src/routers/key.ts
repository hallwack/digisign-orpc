import { KeyService } from "@digisign/db/services/key";
import { keyDataTableRequestSchema, keyIdActionSchema, keyInsertSchema, keyRegenerateSchema } from "@digisign/types";

import { protectedProcedure } from "..";

export const keyRouter = {
  all: protectedProcedure
    .route({
      path: "/key",
      method: "GET",
      tags: ["Key"],
      summary: "Get All Keys",
      description: "Retrieve all keys for the authenticated user",
    })
    .handler(async ({ context }) => {
      return KeyService.getAllKeys(context.session.user.id);
    }),
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
      return KeyService.createKey(input.keyName, context.session.user.id, input.passphrase);
    }),
  regenerate: protectedProcedure
    .route({
      path: "/key/regenerate",
      method: "POST",
      tags: ["Key"],
      summary: "Regenerate Key",
      description:
        "Regenerate an existing key for documents. This will delete the existing key and create a new one with the same name.",
    })
    .input(keyRegenerateSchema)
    .handler(async ({ input, context }) => {
      return KeyService.regenerateKey(input.id, context.session.user.id);
    }),
  delete: protectedProcedure
    .route({
      path: "/key",
      method: "DELETE",
      tags: ["Key"],
      summary: "Delete Key",
      description:
        "Delete an existing key for documents. This will permanently delete the key and it cannot be recovered.",
    })
    .input(keyIdActionSchema)
    .handler(async ({ input }) => {
      return KeyService.deleteKey(input.id);
    }),
};
