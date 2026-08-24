import z from "zod";

export const encryptedKeyMaterial = z.object({
  ciphertext: z.string(),
  nonce: z.string(),
  authTag: z.string(),
  kdfSalt: z.string(),
  kdfMemoryCost: z.number(),
  kdfTimeCost: z.number(),
  kdfParallelism: z.number(),
});

export const keyPairPlaintext = z.object({
  rsaPrivateKeyPem: z.string(),
  eddsaPrivateKeyPem: z.string(),
});

export const registerKeyPairResult = z.object({
  publicKeyRsa: z.string(),
  publicKeyEddsa: z.string(),
  encryptedRsaPrivateKey: encryptedKeyMaterial,
  encryptedEddsaPrivateKey: encryptedKeyMaterial,
});

export type EncryptedKeyMaterial = z.infer<typeof encryptedKeyMaterial>;
export type KeyPairPlaintext = z.infer<typeof keyPairPlaintext>;
export type RegisterKeyPairResult = z.infer<typeof registerKeyPairResult>;
