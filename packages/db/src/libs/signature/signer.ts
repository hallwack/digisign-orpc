import { promises as fs } from "node:fs";
import path, { join } from "node:path";
import { PDFDocument, PDFName, PDFString } from "pdf-lib";
import PizZip from "pizzip";
import { Builder, parseStringPromise } from "xml2js";

import { CUSTOM_XML_PATH, OFFICE_NAMESPACES, SUPPORTED_EXTENSIONS } from "./constant";
import { createCustomProperty, createSignedFileName, getNextPid, isSupportedExtension } from "./encoder";
import type { CustomOfficePropertySchema, CustomXmlStructureSchema, SignatureMetadataSchema } from "@digisign/types";
import { getDocument, separateFilenameWithExt } from "../document";

export async function generatePdfMetadata(metaData: SignatureMetadataSchema): Promise<string> {
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
}

export async function appendPdfMetadata(filePath: string, docName: string, metaData: SignatureMetadataSchema) {
  try {
    const [name, extension] = separateFilenameWithExt(docName);
    const fileName = createSignedFileName(name, extension);

    const file = await getDocument(filePath);
    const pdfDoc = await PDFDocument.load(file);

    const metadataXml = await generatePdfMetadata(metaData);
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
  } catch (error) {
    throw new Error(`Failed to append PDF metadata: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function generateOfficeMetadata(metaData: SignatureMetadataSchema): Promise<string> {
  try {
    const customXmlTemplate: CustomXmlStructureSchema = {
      Properties: {
        $: {
          xmlns: "http://schemas.openxmlformats.org/officeDocument/2006/custom-properties",
          "xmlns:vt": "http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes",
        },
        property: [],
      },
    };

    let pid = 2;
    const properties: CustomOfficePropertySchema[] = [];

    for (const [key, value] of Object.entries(metaData)) {
      properties.push(createCustomProperty(pid++, key, value));
    }

    customXmlTemplate.Properties.property = properties;

    const builder = new Builder();
    return builder.buildObject(customXmlTemplate);
  } catch (error) {
    throw new Error(`Failed to generate Office metadata: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function getExistingCustomXml(zip: PizZip): Promise<CustomXmlStructureSchema> {
  const defaultStructure: CustomXmlStructureSchema = {
    Properties: {
      $: {
        xmlns: OFFICE_NAMESPACES.CUSTOM_PROPS,
        "xmlns:vt": OFFICE_NAMESPACES.DOC_PROPS_TYPES,
      },
      property: [],
    },
  };

  const customXmlFile = zip.file(CUSTOM_XML_PATH);
  if (!customXmlFile) {
    return defaultStructure;
  }

  try {
    const xmlContent = customXmlFile.asText();
    const parsedXml = await parseStringPromise(xmlContent);

    // Ensure the structure is valid
    if (!parsedXml?.Properties) {
      return defaultStructure;
    }

    // Ensure property array is exists and is an array
    if (!parsedXml.Properties.property) {
      parsedXml.Properties.property = [];
    } else if (!Array.isArray(parsedXml.Properties.property)) {
      parsedXml.Properties.property = [parsedXml.Properties.property];
    }

    // Ensure the namespace attributes exist
    if (!parsedXml.Properties.$) {
      parsedXml.Properties.$ = defaultStructure.Properties.$;
    }

    return parsedXml as CustomXmlStructureSchema;
  } catch (error) {
    console.warn(`Failed to parse existing custom.xml, using default structure: ${error}`);
    return defaultStructure;
  }
}

export async function appendOfficeFileMetadata(
  filePath: string,
  docName: string,
  metaData: SignatureMetadataSchema,
): Promise<void> {
  try {
    const [name, extension] = separateFilenameWithExt(docName);
    const fileName = createSignedFileName(name, extension);

    const fileBuffer = await getDocument(filePath);
    const zip = new PizZip(fileBuffer);

    const customXml = await getExistingCustomXml(zip);

    if (!customXml.Properties.property) {
      customXml.Properties.property = [];
    }

    const existingProperties = customXml.Properties.property || [];
    let pidStart = getNextPid(existingProperties);

    for (const [key, value] of Object.entries(metaData)) {
      customXml.Properties.property.push(createCustomProperty(pidStart++, key, value));
    }

    const builder = new Builder({
      headless: true,
      renderOpts: { pretty: true },
      xmldec: {
        version: "1.0",
        encoding: "UTF-8",
      },
    });
    const newCustomXml = builder.buildObject(customXml);

    zip.file(CUSTOM_XML_PATH, newCustomXml);

    const newFileBuffer = zip.generate({ type: "nodebuffer" });
    await fs.writeFile(join(filePath, fileName), newFileBuffer);
  } catch (error) {
    throw new Error(`Failed to append Office metadata: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function appendSignature(filePath: string, docName: string, metaData: SignatureMetadataSchema) {
  try {
    if (!filePath || !docName || !metaData) {
      throw new Error("Missing required parameters");
    }

    const extension = path.extname(docName).toLowerCase();

    if (!isSupportedExtension(extension)) {
      throw new Error(
        `Unsupported file extension: ${extension}. Supported extensions are: ${SUPPORTED_EXTENSIONS.join(", ")}`,
      );
    }

    const requiredFields: (keyof SignatureMetadataSchema)[] = [
      "documentHash",
      "documentId",
      "rsaSignature",
      "eddsaSignature",
      "createdAt",
    ];

    for (const field of requiredFields) {
      if (!metaData[field] || typeof metaData[field] !== "string") {
        throw new Error(`Missing required metadata field: ${field}`);
      }
    }

    switch (extension) {
      case ".pdf":
        await appendPdfMetadata(filePath, docName, metaData);
        break;

      case ".docx":
      case ".xlsx":
        await appendOfficeFileMetadata(filePath, docName, metaData);
        break;

      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
  } catch (error) {
    throw new Error(`Failed to append signature: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
