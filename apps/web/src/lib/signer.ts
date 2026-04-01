import { ed25519 } from "@noble/curves/ed25519.js";
import forge from "node-forge";

import type { PemResultSchema } from "@digisign/types";

export function parsePemSections(pem: string): PemResultSchema {
  const regex = /-----BEGIN ([A-Z0-9 ]+)-----([\s\S]*?)-----END \1-----/g;

  const result: PemResultSchema = {};

  let match;
  while ((match = regex.exec(pem)) !== null) {
    if (!match[1] || !match[2]) {
      throw new Error("Invalid PEM format: Missing label or body");
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

export function signRsa(payload: string, privateKeyPem: string): string {
  // 1. Change PEM into private key object
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

  // 2. Create a SHA-256 message digest from the hash (which is already a hex string)
  const md = forge.md.sha256.create();

  // 3. Update the message digest with the utf8 string directly!
  md.update(payload, "utf8");

  // 4. Sign the message digest using the RSA private key
  const signatureBytes = privateKey.sign(md);

  // 5. Encode the signature bytes to base64 for easier handling
  return forge.util.encode64(signatureBytes);
}

function getEd25519PrivateKeyFromPem(pem: string): Uint8Array {
  // Remove PEM headers and footers, and decode the base64 content
  const b64 = pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");

  // Decode the base64 string to get the raw bytes
  const binaryString = atob(b64);

  // Convert the binary string to a Uint8Array
  const rawBytes = Uint8Array.from(binaryString, (c) => c.charCodeAt(0));

  // The key is inside PEM PKCS#8 format, that has 48 bytes of header before the actual 32-byte key
  // First 16 bytes are the PKCS#8 header, then 32 bytes of the actual Ed25519 private key
  return rawBytes.slice(-32);
}

export function signEddsa(payload: string, privateKeyPem: string): string {
  // 1. Extract the raw Ed25519 private key bytes from the PEM
  const privateKeyBytes = getEd25519PrivateKeyFromPem(privateKeyPem);

  // 2. Convert the payload string to a Uint8Array (message hash) using UTF-8 encoding
  const messageHashBytes = new TextEncoder().encode(payload)

  // 3. Sign the message hash using the Ed25519 private key
  const signatureUint8Array = ed25519.sign(messageHashBytes, privateKeyBytes);

  // 4. Encode the signature bytes to base64 for easier handling
  const binaryString = String.fromCharCode(...signatureUint8Array);
  return btoa(binaryString);
}
