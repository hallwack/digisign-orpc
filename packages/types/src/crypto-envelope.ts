import z from "zod";

export const cipherResult = z.object({
  ciphertext: z.string(),
  nonce: z.string(),
  authTag: z.string(),
});

export const kdfParams = z.object({
  kdfSalt: z.string(),
  kdfMemoryCost: z.number(),
  kdfTimeCost: z.number(),
  kdfParallelism: z.number(),
});

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
  encryptedRsa: cipherResult,
  encryptedEddsa: cipherResult,
  kdfParams: kdfParams,
});

export type CipherResult = z.infer<typeof cipherResult>;
export type KdfParams = z.infer<typeof kdfParams>;
export type EncryptedKeyMaterial = z.infer<typeof encryptedKeyMaterial>;
export type KeyPairPlaintext = z.infer<typeof keyPairPlaintext>;
export type RegisterKeyPairResult = z.infer<typeof registerKeyPairResult>;
