import { PDFDocument, PDFName, PDFRawStream } from "pdf-lib";
import PizZip from "pizzip";
import { parseStringPromise } from "xml2js";

import type { CustomXmlStructureSchema } from "@digisign/types";

import { decodeMetadataStreamToXml } from "./decoder";
import { getExistingCustomXml } from "./signer";

export async function parseXmpMetadata(xml: string): Promise<Record<string, string>> {
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
}

export async function extractPdfMetadata(fileBuffer: Buffer): Promise<Record<string, string> | null> {
  try {
    const pdfDoc = await PDFDocument.load(fileBuffer, { updateMetadata: true });
    const catalog = pdfDoc.catalog;
    const metadataRef = catalog.lookup(PDFName.of("Metadata"));

    if (!metadataRef) {
      return null;
    }

    const metadataStream = pdfDoc.context.lookup(metadataRef) as PDFRawStream;

    if (!metadataStream) {
      return null;
    }

    const xml = await decodeMetadataStreamToXml(metadataStream);

    if (!xml) {
      return null;
    }

    // Parse the XMP metadata to extract signature information
    const metadata = await parseXmpMetadata(xml);
    return metadata;
  } catch (error) {
    console.error("Error extracting PDF metadata:", error);
    throw new Error(`Failed to extract PDF metadata: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export function parseOfficeMetadata(customXML: CustomXmlStructureSchema): Record<string, string> {
  const properties = customXML.Properties.property || [];

  const metadata: Record<string, string> = {};
  for (const prop of properties) {
    const key = prop.$?.name;
    const value = prop["vt:lpwstr"]?.[0];
    if (key && value !== undefined) {
      metadata[key] = value;
    }
  }
  return metadata;
}

export async function extractOfficeMetadata(fileBuffer: Buffer): Promise<Record<string, string> | null> {
  try {
    const zip = new PizZip(fileBuffer);

    const customXml = await getExistingCustomXml(zip);
    const metadata = parseOfficeMetadata(customXml);

    return metadata;
  } catch (error) {
    console.error("Error extracting Office metadata:", error);
    throw new Error(`Failed to extract Office metadata: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
