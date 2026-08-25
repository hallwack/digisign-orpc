import { and, asc, count, desc, eq, gte, ilike, isNull, lte } from "drizzle-orm";

import type { KeyDataTableRequestSchema, KeyDataTableResponseSchema, SignatureMetadataSchema } from "@digisign/types";

import { db } from "..";
import { registerKeyPair } from "../libs/crypto-envelope/register";
import { InternalError, NotFoundError, ValidationError } from "../libs/errors";
import { combinedKeys, generateKeys, verifyEddsa, verifyRsa } from "../libs/key-libs";
import { lowerSql } from "../libs/parse";
import { generateId } from "../libs/random";
import { parseSlug } from "../libs/slug";
import { keyEncryptionMaterialTable, keyTable } from "../tables";

export class KeyService {
  static async getAllKeys(userId: string) {
    const keys = await db.query.keyTable.findMany({
      columns: {
        id: true,
        userId: true,
        keyName: true,
      },
      where: (keyTable, { eq, and, isNull }) => and(eq(keyTable.userId, userId), isNull(keyTable.revokedAt)),
    });

    return keys;
  }

  static async getKeyDataTable(params: KeyDataTableRequestSchema, userId: string): Promise<KeyDataTableResponseSchema> {
    try {
      const offset = (params.page - 1) * params.perPage;

      // Build where conditions
      const whereConditions = [eq(keyTable.userId, userId), isNull(keyTable.revokedAt)];

      if (params.keyName) {
        whereConditions.push(ilike(keyTable.keyName, `%${params.keyName}%`));
      }

      // Add created_at date range filter
      if (params.createdAt.length > 0) {
        if (params.createdAt[0]) {
          const startDate = new Date(params.createdAt[0]);
          startDate.setHours(0, 0, 0, 0);
          whereConditions.push(gte(keyTable.createdAt, startDate));
        }

        if (params.createdAt[1]) {
          const endDate = new Date(params.createdAt[1]);
          endDate.setHours(23, 59, 59, 999);
          whereConditions.push(lte(keyTable.createdAt, endDate));
        }
      }

      const where = and(...whereConditions);

      // Build order by
      const orderBy =
        params.sort.length > 0
          ? params.sort.map((item) => (item.desc ? desc(keyTable[item.id]) : asc(keyTable[item.id])))
          : [desc(keyTable.createdAt)]; // Default sort by created_at desc

      // Execute transaction to get both data and count
      const result = await db.transaction(async (ctx) => {
        const data = await ctx
          .select({
            id: keyTable.id,
            userId: keyTable.userId,
            keyName: keyTable.keyName,
            publicKeyRsa: keyTable.publicKeyRsa,
            publicKeyEddsa: keyTable.publicKeyEddsa,
            createdAt: keyTable.createdAt,
            revokedAt: keyTable.revokedAt,
          })
          .from(keyTable)
          .where(where)
          .orderBy(...orderBy)
          .limit(params.perPage)
          .offset(offset);

        const totalResult = await ctx.select({ count: count() }).from(keyTable).where(where);

        const total = totalResult[0]?.count ?? 0;

        return { data, total };
      });

      const pageCount = Math.ceil(result.total / params.perPage);

      return {
        data: result.data.map((item) => ({
          ...item,
          createdAt: item.createdAt ?? null,
        })),
        pageCount,
        total: result.total,
        page: params.page,
        perPage: params.perPage,
      };
    } catch (error) {
      console.error("Error fetching document datalist:", error);
      throw new InternalError("Failed to fetch document datalist");
    }
  }

  static async createKey(keyName: string, userId: string, passphrase: string) {
    const id = generateId();

    const { publicKeyRsa, encryptedRsa, publicKeyEddsa, encryptedEddsa, kdfParams } = await registerKeyPair({
      passphrase,
    });

    await db.transaction(async (tx) => {
      await tx.insert(keyTable).values({
        id,
        keyName,
        publicKeyRsa,
        publicKeyEddsa,
        userId,
      });

      await tx.insert(keyEncryptionMaterialTable).values({
        keyId: id,
        encryptedPrivateKeyRsa: encryptedRsa.ciphertext,
        privateKeyRsaNonce: encryptedRsa.nonce,
        privateKeyRsaAuthTag: encryptedRsa.authTag,
        encryptedPrivateKeyEddsa: encryptedEddsa.ciphertext,
        privateKeyEddsaNonce: encryptedEddsa.nonce,
        privateKeyEddsaAuthTag: encryptedEddsa.authTag,
        kdfSalt: kdfParams.kdfSalt,
        kdfMemoryCost: kdfParams.kdfMemoryCost,
        kdfTimeCost: kdfParams.kdfTimeCost,
        kdfParallelism: kdfParams.kdfParallelism,
      });
    });

    return { id, keyName, publicKeyRsa, publicKeyEddsa };
  }

  static async regenerateKey(keyId: string, userId: string) {
    const existingKey = await db.query.keyTable.findFirst({
      where: (keyTable, { and, eq }) => and(eq(keyTable.id, keyId), eq(keyTable.userId, userId)),
    });
    if (!existingKey) throw new NotFoundError("Key not found or unauthorized");

    await db.update(keyTable).set({ revokedAt: new Date() }).where(eq(keyTable.id, keyId));

    const { publicKeyRsa, privateKeyRsa, publicKeyEddsa, privateKeyEddsa } = generateKeys();
    const id = generateId();

    const key = await db.insert(keyTable).values({
      id,
      userId,
      keyName: existingKey.keyName,
      publicKeyRsa,
      publicKeyEddsa,
    });
    if (!key) throw new InternalError("Failed to create key");

    const sanitizedKeyName = existingKey!.keyName.replace(/\s+/g, "-");
    const fileName = `${sanitizedKeyName}-private-keys.pem`;
    const combinedPrivateKey = combinedKeys(id, privateKeyRsa, privateKeyEddsa);

    return {
      fileData: Buffer.from(combinedPrivateKey).toString("base64"),
      fileName,
      mimeType: "application/x-pem-file",
    };
  }

  static async deleteKey(params: string) {
    const { id } = parseSlug(params);
    if (!id) throw new ValidationError("Invalid key ID");

    const checkKey = await db.query.keyTable.findFirst({
      where: (keyTable, { eq, and, isNull }) => and(eq(lowerSql(keyTable.id), id), isNull(keyTable.revokedAt)),
    });
    if (!checkKey) throw new NotFoundError("Key not found or already revoked");

    const isKeyUsed = await db.query.signatureTable.findFirst({
      where: (signatureTable, { eq }) => eq(signatureTable.keyId, checkKey.id),
    });

    if (!isKeyUsed) {
      const deleteData = await db.delete(keyTable).where(eq(keyTable.id, checkKey.id)).returning();
      if (!deleteData || deleteData.length === 0) throw new InternalError("Failed to delete key");
    } else {
      const updateDataToDeleted = await db
        .update(keyTable)
        .set({ revokedAt: new Date() })
        .where(eq(lowerSql(keyTable.id), id))
        .returning();
      if (!updateDataToDeleted || updateDataToDeleted.length === 0) throw new InternalError("Failed to revoke key");
    }

    return {
      message: "Key revoked successfully",
    };
  }

  static async verifyKey({ documentHash, documentId, rsaSignature, eddsaSignature }: SignatureMetadataSchema) {
    const signature = await db.query.signatureTable.findFirst({
      where: (signatureTable, { eq }) => eq(signatureTable.documentId, documentId),
    });
    if (!signature) throw new NotFoundError("Signature not found");

    const key = await db.query.keyTable.findFirst({
      where: (keyTable, { eq }) => eq(keyTable.id, signature.keyId),
    });
    if (!key) throw new NotFoundError("Key not found");

    const validRsa = verifyRsa(documentHash, rsaSignature, key.publicKeyRsa);
    const validEddsa = verifyEddsa(documentHash, eddsaSignature, key.publicKeyEddsa);

    return {
      validRsa,
      validEddsa,
      overallValid: validRsa && validEddsa,
      keyId: key?.id || null,
      keyName: key?.keyName || null,
    };
  }
}
