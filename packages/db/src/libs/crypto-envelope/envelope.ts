import { hash } from "@node-rs/argon2";
import crypto from "node:crypto";

import type { CipherResult } from "@digisign/types";

import { AES_ALGORITHM, KEY_LENGTH, NONCE_LENGTH } from "./constant";

export const Envelope = {
  async deriveKek(
    passphrase: string,
    salt: Buffer,
    params: { memoryCost: number; timeCost: number; parallelism: number },
  ): Promise<Buffer> {
    try {
      const derived = await hash(passphrase, {
        salt,
        memoryCost: params.memoryCost,
        timeCost: params.timeCost,
        parallelism: params.parallelism,
        outputLen: KEY_LENGTH,
        algorithm: 2,
      });

      return Buffer.isBuffer(derived) ? derived : Buffer.from(derived);
    } catch (error) {
      throw new Error(`Failed to derive KEK: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  encryptWithKek(privateKeyPem: string, kek: Buffer): CipherResult {
    const nonce = crypto.randomBytes(NONCE_LENGTH);
    const cipher = crypto.createCipheriv(AES_ALGORITHM, kek, nonce);
    const cipherText = Buffer.concat([cipher.update(privateKeyPem, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
      ciphertext: cipherText.toString("base64"),
      nonce: nonce.toString("base64"),
      authTag: authTag.toString("base64"),
    };
  },

  decryptWithKek(material: CipherResult, kek: Buffer): string {
    const nonce = Buffer.from(material.nonce, "base64");
    const authTag = Buffer.from(material.authTag, "base64");
    const cipherText = Buffer.from(material.ciphertext, "base64");

    const decipher = crypto.createDecipheriv(AES_ALGORITHM, kek, nonce);
    decipher.setAuthTag(authTag);

    const plaintext = Buffer.concat([decipher.update(cipherText), decipher.final()]);

    return plaintext.toString("utf8");
  },
};
