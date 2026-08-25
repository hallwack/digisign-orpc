import crypto from "node:crypto";

import type { RegisterKeyPairResult } from "@digisign/types";

import { InternalError, ValidationError } from "../errors";
import { KDF_DEFAULTS, SALT_LENGTH } from "./constant";
import { Envelope } from "./envelope";

export async function registerKeyPair({ passphrase }: { passphrase: string }): Promise<RegisterKeyPairResult> {
  if (!passphrase || passphrase.length < 8) {
    throw new ValidationError("Passphrase must be at least 8 characters long");
  }

  const { publicKey: publicKeyRsa, privateKey: privateKeyRsa } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  const { publicKey: publicKeyEddsa, privateKey: privateKeyEddsa } = crypto.generateKeyPairSync("ed25519", {
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  try {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const kek = await Envelope.deriveKek(passphrase, salt, KDF_DEFAULTS);

    const encryptedRsa = Envelope.encryptWithKek(privateKeyRsa, kek);
    const encryptedEddsa = Envelope.encryptWithKek(privateKeyEddsa, kek);
    kek.fill(0);

    return {
      publicKeyRsa,
      publicKeyEddsa,
      encryptedRsa,
      encryptedEddsa,
      kdfParams: {
        kdfSalt: salt.toString("base64"),
        kdfMemoryCost: KDF_DEFAULTS.memoryCost,
        kdfTimeCost: KDF_DEFAULTS.timeCost,
        kdfParallelism: KDF_DEFAULTS.parallelism,
      },
    };
  } catch (error) {
    throw new InternalError(`Failed to encrypt key pair: ${error}`);
  }
}
