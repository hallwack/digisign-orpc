import { inflateRawSync, inflateSync, unzipSync } from "node:zlib";
import { PDFName } from "pdf-lib";

import { InternalError } from "../errors";

export function asciiHexDecode(s: string): Uint8Array {
  s = s.replace(/\s+/g, "");
  const endIdx = s.indexOf(">");
  if (endIdx !== -1) s = s.slice(0, endIdx);
  if (s.length % 2 === 1) s += "0";
  const out = new Uint8Array(s.length / 2);
  for (let i = 0; i < s.length; i += 2) out[i / 2] = parseInt(s.substring(i, i + 2), 16);
  return out;
}

export function ascii85Decode(s: string): Uint8Array {
  s = s.replace(/\s+/g, "");
  const start = s.indexOf("<~");
  const end = s.indexOf("~>");
  if (start >= 0 && end > start) s = s.substring(start + 2, end);
  const out: number[] = [];
  for (let i = 0; i < s.length; ) {
    const ch = s[i];
    if (ch === "z") {
      out.push(0, 0, 0, 0);
      i++;
      continue;
    }
    const chunk = s.substring(i, i + 5);
    if (chunk.length < 5) {
      const padded = chunk.padEnd(5, "u");
      let acc = 0;
      for (let j = 0; j < 5; j++) acc = acc * 85 + (padded.charCodeAt(j) - 33);
      const bytes = [(acc >> 24) & 0xff, (acc >> 16) & 0xff, (acc >> 8) & 0xff, acc & 0xff];
      for (let k = 0; k < chunk.length - 1; k++) out.push(bytes[k]!);
      break;
    } else {
      let acc = 0;
      for (let j = 0; j < 5; j++) acc = acc * 85 + (chunk.charCodeAt(j) - 33);
      out.push((acc >> 24) & 0xff, (acc >> 16) & 0xff, (acc >> 8) & 0xff, acc & 0xff);
      i += 5;
    }
  }
  return new Uint8Array(out);
}

export function runLengthDecode(src: Uint8Array): Uint8Array {
  const out: number[] = [];
  let i = 0;
  while (i < src.length) {
    const len = src[i++];
    if (len === 128) break; // EOD
    if (len! <= 127) {
      const copyLen = len! + 1;
      for (let k = 0; k < copyLen; k++) out.push(src[i++]!);
    } else {
      const repCount = 257 - len!;
      const val = src[i++];
      for (let k = 0; k < repCount; k++) out.push(val!);
    }
  }
  return new Uint8Array(out);
}

export async function decodeMetadataStreamToXml(metadataStream: any): Promise<string | null> {
  if (!metadataStream) return null;

  // Try convenience readers first (pdf-lib sometimes exposes getters)
  try {
    if (typeof metadataStream.getContentsString === "function") {
      const s = metadataStream.getContentsString();
      if (s && (s.includes("<?xpacket") || s.includes("<x:xmpmeta") || s.includes("<rdf:RDF"))) {
        return s;
      }
    }
  } catch {
    // ignore
  }

  // Raw bytes
  let bytes = Buffer.from(metadataStream.contents || metadataStream.getContents?.() || []);

  // Extract filters (if any)
  const filterObj = metadataStream.dict?.get?.(PDFName.of("Filter"));
  let filters: string[] = [];
  if (filterObj) {
    const fStr = String(filterObj);
    filters = fStr
      .replace(/[\[\]]/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .map((s) => s.replace(/^\//, ""));
  }

  const decodeErrors: string[] = [];

  // If no explicit filters, still try to detect zlib header and inflate
  if (filters.length === 0) {
    // quick heuristic: if starts with zlib header
    const h = bytes.subarray(0, 2).toString("hex");
    if (["789c", "7801", "78da"].includes(h)) {
      try {
        const out = inflateSync(bytes);
        return Buffer.from(out).toString("utf8");
      } catch (e: any) {
        decodeErrors.push(`inflateSync(no-filters) failed: ${e.message}`);
        // will fall through to general attempts below
      }
    }
  }

  // decode in reverse order (PDF applies filters left->right when encoding)
  for (let i = filters.length - 1; i >= 0; i--) {
    const f = filters[i];
    try {
      if (f === "FlateDecode") {
        // try multiple variants
        try {
          bytes = Buffer.from(inflateSync(bytes));
        } catch (e1: any) {
          decodeErrors.push(`inflateSync failed: ${e1.message}`);
          try {
            bytes = Buffer.from(inflateRawSync(bytes));
          } catch (e2: any) {
            decodeErrors.push(`inflateRawSync failed: ${e2.message}`);
            try {
              bytes = Buffer.from(unzipSync(bytes));
            } catch (e3: any) {
              decodeErrors.push(`unzipSync failed: ${e3.message}`);
              // Try header-scan fallback: find zlib header inside buffer
              const headers = [Buffer.from([0x78, 0x9c]), Buffer.from([0x78, 0x01]), Buffer.from([0x78, 0xda])];
              let worked = false;
              for (const header of headers) {
                const idx = bytes.indexOf(header);
                if (idx > 0) {
                  try {
                    const attempt = inflateSync(bytes.subarray(idx));
                    bytes = Buffer.from(attempt);
                    worked = true;
                    break;
                  } catch (eh: any) {
                    decodeErrors.push(`inflateSync(slice@${idx}) failed: ${eh.message}`);
                  }
                }
              }
              if (!worked) throw new InternalError("FlateDecode attempts all failed: " + decodeErrors.join(" | "));
            }
          }
        }
      } else if (f === "ASCII85Decode") {
        const s = Buffer.from(bytes).toString("latin1");
        bytes = Buffer.from(ascii85Decode(s));
      } else if (f === "ASCIIHexDecode") {
        const s = Buffer.from(bytes).toString("latin1");
        bytes = Buffer.from(asciiHexDecode(s));
      } else if (f === "RunLengthDecode") {
        bytes = Buffer.from(runLengthDecode(new Uint8Array(bytes)));
      } else if (f === "LZWDecode") {
        throw new InternalError(
          "Encountered LZWDecode. Node.js has no built-in LZW decoder — add a package or decode earlier filters first.",
        );
      } else {
        throw new InternalError(`Unsupported filter: ${f}`);
      }
    } catch (err: any) {
      throw new InternalError(`Failed decoding filter ${f}: ${err.message}\nTrace: ${decodeErrors.join(" | ")}`);
    }
  }

  // final string
  const xmlStr = bytes.toString("utf8");
  if (!xmlStr.includes("<?xpacket") && !xmlStr.includes("<x:xmpmeta") && !xmlStr.includes("<rdf:RDF")) {
    console.warn("Decoded stream does not look like XMP. Preview (hex):", bytes.subarray(0, 64).toString("hex"));
  }
  return xmlStr;
}
