import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import PizZip from "pizzip";
import { Builder, parseStringPromise } from "xml2js";

import type { CustomOfficePropertySchema, CustomXmlStructureSchema, SignatureMetadataSchema } from "@digisign/types";

import { getDocument, separateFilenameWithExt } from "../document";
import { InternalError } from "../errors";
import { CUSTOM_PROPERTY_FMTID, CUSTOM_XML_PATH, OFFICE_NAMESPACES } from "./constant";
import { createSignedFileName } from "./utils";

const XML_BUILDER_OPTS = {
  headless: true,
  renderOpts: { pretty: true },
  xmldec: { version: "1.0", encoding: "UTF-8" },
};

const DOCX_PATHS = {
  RELS: "word/_rels/document.xml.rels",
  CONTENT_TYPES: "[Content_Types].xml",
  DOCUMENT: "word/document.xml",
};

const getFooterTemplate = (text: string) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:p>
      <w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r>
        <w:rPr>
          <w:color w:val="888888"/>
          <w:sz w:val="20"/> <!-- 20 = 10pt font -->
        </w:rPr>
        <w:t>${text}</w:t>
      </w:r>
    </w:p>
  </w:ftr>`;

async function getExistingCustomXml(zip: PizZip): Promise<CustomXmlStructureSchema> {
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
  if (!customXmlFile) return defaultStructure;

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

function getNextPid(existingProperties: CustomOfficePropertySchema[]): number {
  if (existingProperties.length === 0) return 2;
  const maxPid = Math.max(...existingProperties.map((p) => parseInt(p.$.pid.toString())));
  return maxPid + 1;
}

function createCustomProperty(id: number, name: string, value: string): CustomOfficePropertySchema {
  return {
    $: { fmtid: CUSTOM_PROPERTY_FMTID, pid: id, name: name },
    "vt:lpwstr": [value],
  };
}

// Visual Signature DOCX

function generateDocxFooterId(zip: PizZip): { relId: string; fileName: string } {
  const relsXml = zip.file(DOCX_PATHS.RELS)!.asText();
  let counter = 1;
  while (relsXml.includes(`Id="rId${counter}"`)) counter++;

  return {
    relId: `rId${counter}`,
    fileName: `footerSignature${counter}.xml`,
  };
}

function registerDocxFooter(zip: PizZip, relId: string, fileName: string) {
  // Register in document.xml.rels
  const relsXml = zip.file(DOCX_PATHS.RELS)!.asText();
  const relString = `<Relationship Id="${relId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="${fileName}"/>`;
  zip.file(DOCX_PATHS.RELS, relsXml.replace("</Relationships>", `  ${relString}\n</Relationships>`));

  // Register in [Content_Types].xml
  const contentTypesXml = zip.file(DOCX_PATHS.CONTENT_TYPES)!.asText();
  const overrideString = `<Override PartName="/word/${fileName}" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>`;
  zip.file(DOCX_PATHS.CONTENT_TYPES, contentTypesXml.replace("</Types>", `  ${overrideString}\n</Types>`));
}

function attachDocxFooterToSections(zip: PizZip, relId: string) {
  const documentXml = zip.file(DOCX_PATHS.DOCUMENT)!.asText();
  const footerRefTag = `<w:footerReference w:type="default" r:id="${relId}"/>`;

  // Insert footer reference inside every <w:sectPr> (Section Properties)
  const updatedDocumentXml = documentXml.replace(/(<w:sectPr[^>]*>)/g, `$1${footerRefTag}`);
  zip.file(DOCX_PATHS.DOCUMENT, updatedDocumentXml);
}

async function appendVisualSignatureDocx(zip: PizZip, signatureText: string) {
  const { relId, fileName } = generateDocxFooterId(zip);

  zip.file(`word/${fileName}`, getFooterTemplate(signatureText));
  registerDocxFooter(zip, relId, fileName);
  attachDocxFooterToSections(zip, relId);
}

// Visual Signature XLSX

async function appendVisualSignatureXlsx(zip: PizZip, signatureText: string) {
  const sheetFiles = Object.keys(zip.files).filter((path) => /^xl\/worksheets\/sheet\d+\.xml$/.test(path));
  const builder = new Builder({ headless: true, renderOpts: { pretty: false } });
  const formattedFooter = `&C${signatureText}`;

  for (const sheetPath of sheetFiles) {
    const sheetXmlStr = zip.files?.[sheetPath]?.asText();
    if (!sheetXmlStr) continue;

    const sheetObj = await parseStringPromise(sheetXmlStr);

    // Ensure headerFooter structure exists
    sheetObj.worksheet.headerFooter = sheetObj.worksheet.headerFooter || [{}];
    const hf = sheetObj.worksheet.headerFooter[0];

    // Append or create oddFooter
    if (hf.oddFooter?.[0]) {
      const existingText = typeof hf.oddFooter[0] === "string" ? hf.oddFooter[0] : hf.oddFooter[0]._;
      hf.oddFooter = [`${existingText}\n${formattedFooter}`];
    } else {
      hf.oddFooter = [formattedFooter];
    }

    zip.file(sheetPath, builder.buildObject(sheetObj));
  }
}

export const OfficeSignature = {
  async extractMetadata(fileBuffer: Buffer): Promise<Record<string, string> | null> {
    const zip = new PizZip(fileBuffer);
    const customXml = await getExistingCustomXml(zip);
    const properties = customXml.Properties.property || [];

    return properties.reduce(
      (acc, prop) => {
        const key = prop.$?.name;
        const value = prop["vt:lpwstr"]?.[0];
        if (key && value !== undefined) acc[key] = value;
        return acc;
      },
      {} as Record<string, string>,
    );
  },

  async appendMetadata(filePath: string, docName: string, metaData: SignatureMetadataSchema) {
    const [name, extension] = separateFilenameWithExt(docName);
    const fileName = createSignedFileName(name!, extension!);
    const fileBuffer = await getDocument(filePath);
    const zip = new PizZip(fileBuffer);

    // 1. Append Custom Properties
    const customXml = await getExistingCustomXml(zip);
    if (!customXml.Properties.property) customXml.Properties.property = [];
    const existingProperties = customXml.Properties.property || [];

    let pidStart = getNextPid(existingProperties);

    for (const [key, value] of Object.entries(metaData)) {
      customXml.Properties.property.push(createCustomProperty(pidStart++, key, value));
    }

    const builder = new Builder(XML_BUILDER_OPTS);
    const newCustomXml = builder.buildObject(customXml);
    zip.file(CUSTOM_XML_PATH, newCustomXml);

    // 2. Append Visual Signature
    const visualText = `Dokumen ini ditandatangani secara digital dengan DigiSign\nWaktu: ${new Date().toLocaleString("id-ID")}`;

    if (extension === "docx") {
      await appendVisualSignatureDocx(zip, visualText);
    } else if (extension === "xlsx") {
      await appendVisualSignatureXlsx(zip, visualText);
    }

    // 3. Save File
    const newFileBuffer = zip.generate({ type: "nodebuffer" });
    await fs.writeFile(join(filePath, fileName), newFileBuffer);
  },

  async calculateOriginalHash(fileBuffer: Buffer): Promise<string> {
    try {
      // 1. Muat file DOCX/XLSX sebagai arsip ZIP
      const zip = new PizZip(fileBuffer);
      const documentXml = zip.file("word/document.xml")?.asText();
      const workbookXml = zip.file("xl/workbook.xml")?.asText();

      let contentToHash: string;

      if (documentXml) {
        const textMatches = documentXml.match(/<w:t[^>]*>(.*?)<\/w:t>/gs) ?? [];
        contentToHash = textMatches.map((match) => match.replace(/<w:t[^>]*>|<\/w:t>/g, "")).join(" ");
        if (!contentToHash) throw new InternalError("Konten teks utama tidak ditemukan dalam dokumen Word.");
      } else if (workbookXml) {
        contentToHash = workbookXml;
      } else {
        throw new InternalError(
          "Gagal menemukan konten utama untuk dihitung hash. Pastikan file adalah dokumen Word atau Excel yang valid.",
        );
      }

      // 3. Hitung hash SHA-256 dari konten utama
      return crypto.createHash("sha256").update(contentToHash).digest("hex");
    } catch (error) {
      if (error instanceof InternalError) throw error;
      throw new InternalError(`Gagal menghitung hash Office asli: ${error}`);
    }
  },

  async normalize(fileBuffer: Buffer): Promise<Buffer> {
    const zip = new PizZip(fileBuffer);
    const normalizedOfficeBuffer = zip.generate({ type: "nodebuffer" });
    return normalizedOfficeBuffer;
  },
};
