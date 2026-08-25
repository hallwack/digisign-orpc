import crypto from "node:crypto";

import { NotFoundError } from "./errors";

interface PemResult {
  id?: string;
  rsaKey?: string;
  eddsaKey?: string;
}

export function generateKeys() {
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

  return { publicKeyRsa, privateKeyRsa, publicKeyEddsa, privateKeyEddsa };
}

export function combinedKeys(id: string, rsaKey: string, eddsaKey: string) {
  const cleanerapperKey = (key: string) =>
    key
      .split("\n")
      .filter((line) => !line.includes("BEGIN PRIVATE KEY") && !line.includes("END PRIVATE KEY"))
      .join("\n")
      .trim();

  return [
    "-----BEGIN PRIVATE KEY ID-----",
    cleanerapperKey(id),
    "-----END PRIVATE KEY ID-----",
    "",
    "-----BEGIN RSA PRIVATE KEY-----",
    cleanerapperKey(rsaKey),
    "-----END RSA PRIVATE KEY-----",
    "",
    "-----BEGIN EDDSA PRIVATE KEY-----",
    cleanerapperKey(eddsaKey),
    "-----END EDDSA PRIVATE KEY-----",
  ].join("\n");
}

export function parseCombinedKeys(pemText: string) {
  const rsaMatch = pemText.match(/-----BEGIN RSA PRIVATE KEY-----([\s\S]*?)-----END RSA PRIVATE KEY-----/);

  const eddsaMatch = pemText.match(/-----BEGIN EDDSA PRIVATE KEY-----([\s\S]*?)-----END EDDSA PRIVATE KEY-----/);

  if (!rsaMatch || !eddsaMatch || !rsaMatch[1] || !eddsaMatch[1]) {
    throw new NotFoundError("Invalid PEM format: RSA or EDDSA key not found");
  }

  return { rsaKey: rsaMatch[1].trim(), eddsaKey: eddsaMatch[1].trim() };
}

export function parsePemSections(pem: string): PemResult {
  const regex = /-----BEGIN ([A-Z0-9 ]+)-----([\s\S]*?)-----END \1-----/g;

  const result: PemResult = {};

  let match;
  while ((match = regex.exec(pem)) !== null) {
    if (!match[1] || !match[2]) {
      throw new NotFoundError("Invalid PEM format: Missing label or body");
    }

    const label = match[1].trim();
    const body = match[2].trim();

    switch (label) {
      case "PRIVATE KEY ID":
        result.id = body;
        break;

      case "RSA PRIVATE KEY":
        result.rsaKey = `-----BEGIN RSA PRIVATE KEY-----\n${body}\n-----END RSA PRIVATE KEY-----`;
        break;

      case "EDDSA PRIVATE KEY":
        result.eddsaKey = `-----BEGIN PRIVATE KEY-----\n${body}\n-----END PRIVATE KEY-----`;
        break;
    }
  }

  return result;
}

export function signRsa(payload: string, privateKey: string): string {
  return crypto
    .sign(
      "sha256",
      Buffer.from(payload, "utf8"), // hash sudah dalam hex
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
    )
    .toString("base64");
}

export function signEddsa(payload: string, privateKey: string): string {
  return crypto
    .sign(
      null, // Ed25519 tidak butuh algoritma hash tambahan
      Buffer.from(payload, "utf8"),
      privateKey,
    )
    .toString("base64");
}

export function verifyRsa(hash: string, signature: string, publicKeyPem: string): boolean {
  console.log("Public Key PEM:", publicKeyPem);

  return crypto.verify("sha256", Buffer.from(hash, "hex"), { key: publicKeyPem }, Buffer.from(signature, "base64"));
}

export function verifyEddsa(hash: string, signature: string, publicKeyPem: string): boolean {
  console.log("Public Key PEM:", publicKeyPem);

  return crypto.verify(null, Buffer.from(hash, "hex"), { key: publicKeyPem }, Buffer.from(signature, "base64"));
}
