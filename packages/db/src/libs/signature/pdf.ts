import { promises as fs } from "node:fs";
import { join } from "node:path";
import { PDFDocument, PDFName, PDFRawStream, PDFString } from "pdf-lib";
import { Builder, parseStringPromise } from "xml2js";

import type { SignatureMetadataSchema } from "@digisign/types";

import { getDocument, separateFilenameWithExt } from "../document";
import { createSignedFileName } from "./utils";
import { decodeMetadataStreamToXml } from "./pdf-decoder";

export const PdfSignature = {
  async extractMetadata(fileBuffer: Buffer): Promise<Record<string, string> | null> {
    const pdfDoc = await PDFDocument.load(fileBuffer, { updateMetadata: true });
    const catalog = pdfDoc.catalog;
    const metadataRef = catalog.lookup(PDFName.of("Metadata"));
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

    const metadataXml = await this.generateXmp(metaData);
    const metadataBuffer = Buffer.from(metadataXml, "utf8");

    const xmlStream = pdfDoc.context.flateStream(metadataBuffer, {
      Type: PDFName.of("Metadata"),
      Subtype: PDFName.of("XML"),
      Length: PDFString.of(metadataXml.length.toString()),
    });

    const xmlStreamRef = pdfDoc.context.register(xmlStream);
    const catalog = pdfDoc.catalog;
    catalog.set(PDFName.of("Metadata"), xmlStreamRef);

    const modifiedPdf = await pdfDoc.save();
    await fs.writeFile(join(filePath, fileName), modifiedPdf);
  },

  async parseXmpMetadata(xml: string): Promise<Record<string, string>> {
    try {
      const parsedXml = await parseStringPromise(xml);
      const metadata: Record<string, string> = {};

      // Navigate through the XMP structure to find custom signature metadata
      const xmpMeta = parsedXml?.["x:xmpmeta"];
      if (!xmpMeta) {
        return metadata;
      }

      const rdf = xmpMeta["rdf:RDF"];
      if (!rdf) {
        return metadata;
      }

      const rdfObj = Array.isArray(rdf) ? rdf[0] : rdf;

      // Look for signature-related properties
      const signatureFields = [
        "digsig:documentHash",
        "digsig:documentId",
        "digsig:keyId",
        "digsig:rsaSignature",
        "digsig:eddsaSignature",
        "digsig:createdAt",
      ];

      for (const field of signatureFields) {
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

      const builder = new Builder({
        headless: true,
        renderOpts: { pretty: true },
        xmldec: {
          version: "1.0",
          encoding: "UTF-8",
        },
      });

      return builder.buildObject(xmlTemplate);
    } catch (error) {
      throw new Error(`Failed to generate PDF metadata: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },
};
