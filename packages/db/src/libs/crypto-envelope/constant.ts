export const KDF_DEFAULTS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
  algorithm: "argon2id" as const, // Argon2id
}

export const AES_ALGORITHM = "aes-256-gcm"
export const NONCE_LENGTH = 12 // 96 bits
export const SALT_LENGTH = 16 // 128 bits
export const KEY_LENGTH = 32 // 256 bits
