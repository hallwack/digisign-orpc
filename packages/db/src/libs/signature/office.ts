import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import PizZip from "pizzip";
import { Builder, parseStringPromise } from "xml2js";

import type { CustomOfficePropertySchema, CustomXmlStructureSchema, SignatureMetadataSchema } from "@digisign/types";

import { getDocument, separateFilenameWithExt } from "../document";
import { CUSTOM_PROPERTY_FMTID, CUSTOM_XML_PATH, OFFICE_NAMESPACES } from "./constant";
import { createSignedFileName } from "./utils";

export const OfficeSignature = {
  async extractMetadata(fileBuffer: Buffer): Promise<Record<string, string> | null> {
    const zip = new PizZip(fileBuffer);

    const customXml = await this.getExistingCustomXml(zip);
    const properties = customXml.Properties.property || [];

    const metadata: Record<string, string> = {};
    for (const prop of properties) {
      const key = prop.$?.name;
      const value = prop["vt:lpwstr"]?.[0];
      if (key && value !== undefined) {
        metadata[key] = value;
      }
    }

    return metadata;
  },

  async appendMetadata(filePath: string, docName: string, metaData: SignatureMetadataSchema) {
    const [name, extension] = separateFilenameWithExt(docName);
    const fileName = createSignedFileName(name!, extension!);

    const fileBuffer = await getDocument(filePath);
    const zip = new PizZip(fileBuffer);

    const customXml = await this.getExistingCustomXml(zip);

    if (!customXml.Properties.property) customXml.Properties.property = [];

    const existingProperties = customXml.Properties.property || [];
    let pidStart = this.getNextPid(existingProperties);

    for (const [key, value] of Object.entries(metaData)) {
      customXml.Properties.property.push(this.createCustomProperty(pidStart++, key, value));
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
  },

  getNextPid(existingProperties: CustomOfficePropertySchema[]): number {
    if (existingProperties.length === 0) return 2;
    const maxPid = Math.max(...existingProperties.map((p) => parseInt(p.$.pid.toString())));
    return maxPid + 1;
  },

  createCustomProperty(id: number, name: string, value: string): CustomOfficePropertySchema {
    return {
      $: { fmtid: CUSTOM_PROPERTY_FMTID, pid: id, name: name },
      "vt:lpwstr": [value],
    };
  },

  async getExistingCustomXml(zip: PizZip): Promise<CustomXmlStructureSchema> {
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
  },

  async calculateOriginalHash(fileBuffer: Buffer): Promise<string> {
    try {
      // 1. Muat file DOCX/XLSX sebagai arsip ZIP
      const zip = new PizZip(fileBuffer);
      const customXmlFile = zip.file(CUSTOM_XML_PATH);

      if (customXmlFile) {
        const xmlContent = customXmlFile.asText();
        const parsedXml = await parseStringPromise(xmlContent);

        // 2. Cabut "stiker" (Filter out properti buatan sistem DigiSign)
        if (parsedXml?.Properties?.property) {
          const ourFields = ["documentHash", "documentId", "keyId", "rsaSignature", "eddsaSignature", "createdAt"];

          parsedXml.Properties.property = parsedXml.Properties.property.filter((prop: any) => {
            const propName = prop.$?.name;
            // Jika properti ini adalah buatan kita, buang (return false)
            if (propName && ourFields.includes(propName)) {
              return false;
            }
            // Jika bukan buatan kita (misal: properti asli dokumen), pertahankan
            return true;
          });
        }

        // 3. Kembalikan ke format XML murni
        const builder = new Builder({
          headless: true,
          renderOpts: { pretty: true },
          xmldec: { version: "1.0", encoding: "UTF-8" },
        });
        const strippedXml = builder.buildObject(parsedXml);

        // 4. Timpa file custom.xml di dalam memori ZIP
        zip.file(CUSTOM_XML_PATH, strippedXml);
      }

      // 5. Timbang ulang (Generate ulang file biner DOCX/XLSX)
      const strippedOfficeBuffer = zip.generate({ type: "nodebuffer" });

      // 6. Hitung Hash
      return crypto.createHash("sha256").update(strippedOfficeBuffer).digest("hex");
    } catch (error) {
      throw new Error(`Gagal menghitung hash Office asli: ${error}`);
    }
  },
};
