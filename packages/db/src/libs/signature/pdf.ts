import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import { PDFArray, PDFDocument, PDFName, PDFNumber, PDFPage, PDFRawStream, PDFString } from "pdf-lib";
import { Builder, parseStringPromise } from "xml2js";

import type { SignatureMetadataSchema } from "@digisign/types";

import { getDocument, separateFilenameWithExt } from "../document";
import { InternalError } from "../errors";
import { decodeMetadataStreamToXml } from "./pdf-decoder";
import { createSignedFileName } from "./utils";

const SIGNATURE_FIELDS = [
  "digsig:documentHash",
  "digsig:documentId",
  "digsig:keyId",
  "digsig:rsaSignature",
  "digsig:eddsaSignature",
  "digsig:createdAt",
] as const;

const XML_BUILDER_OPTS = {
  headless: true,
  renderOpts: { pretty: true },
  xmldec: { version: "1.0", encoding: "UTF-8" },
};

// PDF Manipulation
function injectXmpMetadata(pdfDoc: PDFDocument, metadataXml: string) {
  const metadataBuffer = Buffer.from(metadataXml, "utf8");
  const xmlStream = pdfDoc.context.flateStream(metadataBuffer, {
    Type: PDFName.of("Metadata"),
    Subtype: PDFName.of("XML"),
    Length: PDFString.of(metadataXml.length.toString()),
  });

  const xmlStreamRef = pdfDoc.context.register(xmlStream);
  pdfDoc.catalog.set(PDFName.of("Metadata"), xmlStreamRef);
}

function addVisualSignatureAnnotation(pdfDoc: PDFDocument, text: string) {
  const context = pdfDoc.context;
  const annotation = context.obj({
    Type: PDFName.of("Annot"),
    Subtype: PDFName.of("FreeText"),
    Rect: context.obj([PDFNumber.of(50), PDFNumber.of(50), PDFNumber.of(300), PDFNumber.of(100)]),
    Contents: PDFString.of(text),
    DA: PDFString.of("/Courier 12 Tf 1 0 0 rg"),
    F: PDFNumber.of(4),
  });

  const annotationRef = context.register(annotation);
  const pages = pdfDoc.getPages();
  const lastPage = pages[pages.length - 1];

  if (!lastPage) return;

  let annots = lastPage.node.get(PDFName.of("Annots"));
  if (!annots) {
    annots = context.obj([]);
    lastPage.node.set(PDFName.of("Annots"), annots);
  }

  (annots as PDFArray).push(annotationRef);
}

function extractPageContentString(page: PDFPage): string {
  const contentsNode = page.node.get(PDFName.of("Contents"));
  if (!contentsNode) return "";

  // Jika konten adalah array, gabungkan seluruh referensinya
  if (contentsNode instanceof PDFArray) {
    let contentStr = "";
    for (let i = 0; i < contentsNode.size(); i++) {
      contentStr += contentsNode.get(i).toString();
    }
    return contentStr;
  }

  // Jika berupa stream tunggal
  return contentsNode.toString();
}

export const PdfSignature = {
  async extractMetadata(fileBuffer: Buffer): Promise<Record<string, string> | null> {
    const pdfDoc = await PDFDocument.load(fileBuffer, { updateMetadata: true });

    const metadataRef = pdfDoc.catalog.lookup(PDFName.of("Metadata"));
    if (!metadataRef) return null;

    const metadataStream = pdfDoc.context.lookup(metadataRef) as PDFRawStream;
    if (!metadataStream) return null;

    const xml = await decodeMetadataStreamToXml(metadataStream);
    return xml ? this.parseXmpMetadata(xml) : null;
  },

  async appendMetadata(filePath: string, docName: string, metaData: SignatureMetadataSchema) {
    const [name, extension] = separateFilenameWithExt(docName);
    const fileName = createSignedFileName(name!, extension!);

    const file = await getDocument(filePath);
    const pdfDoc = await PDFDocument.load(file);

    // 1. Generate & Inject Metadata
    const metadataXml = await this.generateXmp(metaData);
    injectXmpMetadata(pdfDoc, metadataXml);

    // 2. Append Visual Annotation
    addVisualSignatureAnnotation(pdfDoc, "Document signed with DigiSign");

    // 3. Save modified PDF
    const modifiedPdf = await pdfDoc.save();
    await fs.writeFile(join(filePath, fileName), modifiedPdf);
  },

  async parseXmpMetadata(xml: string): Promise<Record<string, string>> {
    try {
      const parsedXml = await parseStringPromise(xml);
      const metadata: Record<string, string> = {};

      // Navigate through the XMP structure to find custom signature metadata
      const xmpMeta = parsedXml?.["x:xmpmeta"];
      if (!xmpMeta) return metadata;

      const rdf = xmpMeta["rdf:RDF"];
      if (!rdf) return metadata;

      const rdfObj = Array.isArray(rdf) ? rdf[0] : rdf;

      // Look for signature-related properties
      for (const field of SIGNATURE_FIELDS) {
        if (rdfObj[field]) {
          const key = field.replace("digsig:", "");
          metadata[key] = Array.isArray(rdfObj[field]) ? rdfObj[field][0] : rdfObj[field];
        }
      }

      return metadata;
    } catch (error) {
      console.error("Error parsing XMP metadata:", error);
      return {};
    }
  },

  async generateXmp(metaData: SignatureMetadataSchema): Promise<string> {
    try {
      const xmlTemplate = {
        "x:xmpmeta": {
          $: {
            "xmlns:x": "adobe:ns:meta/",
            "x:xmptk": "NodeXMPToolkit",
          },
          "rdf:RDF": {
            $: {
              "xmlns:rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            },
            "rdf:Description": {
              $: {
                "rdf:about": "",
                "xmlns:custom": "http://example.com/custom",
              },
            },
            "digsig:documentHash": metaData.documentHash,
            "digsig:documentId": metaData.documentId,
            "digsig:keyId": metaData.keyId,
            "digsig:rsaSignature": metaData.rsaSignature,
            "digsig:eddsaSignature": metaData.eddsaSignature,
            "digsig:createdAt": metaData.createdAt,
          },
        },
      };

      const builder = new Builder(XML_BUILDER_OPTS);
      return builder.buildObject(xmlTemplate);
    } catch (error) {
      throw new InternalError(
        `Failed to generate PDF metadata: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },

  async calculateOriginalHash(fileBuffer: Buffer): Promise<string> {
    try {
      // 1. Muat file PDF menggunakan pdf-lib
      const pdfDoc = await PDFDocument.load(fileBuffer);

      // 2. Ambil semua konten dari halaman PDF dan gabungkan menjadi satu string
      const pages = pdfDoc.getPages();
      const coreContentStr = pages.map(extractPageContentString).join("");

      if (!coreContentStr) {
        throw new InternalError("Dokumen PDF tidak memiliki konten yang dapat dihitung hash-nya.");
      }

      // 4. Hitung hash SHA-256 dari konten utama PDF
      return crypto.createHash("sha256").update(coreContentStr).digest("hex");
    } catch (error) {
      throw new InternalError(`Gagal menghitung hash PDF asli: ${error}`);
    }
  },

  async normalize(fileBuffer: Buffer): Promise<Buffer> {
    const pdfDoc = await PDFDocument.load(fileBuffer);
    const normalizedPdfBytes = await pdfDoc.save({ useObjectStreams: false });
    return Buffer.from(normalizedPdfBytes);
  },
};
