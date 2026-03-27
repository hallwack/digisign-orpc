import { relations } from "drizzle-orm";
import { pgTable, real, text, timestamp } from "drizzle-orm/pg-core";

import { userTable } from "./auth";

export const documentTable = pgTable("documents", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  hash: text("hash").notNull(),
  fileName: text("file_name").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).defaultNow(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", {
    withTimezone: true,
    mode: "date",
  }),
});

export const signatureTable = pgTable("signatures", {
  id: text("id").primaryKey(),
  documentId: text("document_id")
    .notNull()
    .references(() => documentTable.id, {
      onDelete: "cascade",
    }),
  keyId: text("key_id")
    .notNull()
    .references(() => keyTable.id, { onDelete: "cascade" }),
  rsaSignature: text("rsa_signature").notNull(),
  eddsaSignature: text("eddsa_signature").notNull(),
  signingDuration: real("signing_duration").notNull().default(0),
  rsaSigningDuration: real("rsa_signing_duration").notNull().default(0),
  eddsaSigningDuration: real("eddsa_signing_duration").notNull().default(0),
  signedAt: timestamp("signed_at", {
    withTimezone: true,
    mode: "date",
  }).defaultNow(),
});

export const keyTable = pgTable("keys", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  keyName: text("key_name").notNull(),
  publicKeyRsa: text("public_key_rsa").notNull(),
  publicKeyEddsa: text("public_key_eddsa").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).defaultNow(),
  revokedAt: timestamp("revoked_at", {
    withTimezone: true,
    mode: "date",
  }),
});

export const keyTableRelations = relations(keyTable, ({ one }) => ({
  signature: one(signatureTable, {
    fields: [keyTable.id],
    references: [signatureTable.keyId],
  }),
  user: one(userTable, {
    fields: [keyTable.userId],
    references: [userTable.id],
  }),
}));

export const documentTableRelations = relations(documentTable, ({ one }) => ({
  user: one(userTable, {
    fields: [documentTable.userId],
    references: [userTable.id],
  }),
  signature: one(signatureTable, {
    fields: [documentTable.id],
    references: [signatureTable.documentId],
  }),
}));

export const signatureTableRelations = relations(signatureTable, ({ one }) => ({
  document: one(documentTable, {
    fields: [signatureTable.documentId],
    references: [documentTable.id],
  }),
  key: one(keyTable, {
    fields: [signatureTable.keyId],
    references: [keyTable.id],
  }),
}));
