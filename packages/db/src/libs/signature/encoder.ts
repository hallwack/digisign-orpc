import type { CustomOfficePropertySchema } from "@digisign/types";
import { CUSTOM_PROPERTY_FMTID, SUPPORTED_EXTENSIONS } from "./constant";

export function isSupportedExtension(extension: string): extension is (typeof SUPPORTED_EXTENSIONS)[number] {
  return SUPPORTED_EXTENSIONS.includes(extension as any);
}

export function createSignedFileName(originalName: string, extension: string): string {
  return `${originalName}-signed.${extension}`;
}

export function createCustomProperty(id: number, name: string, value: string): CustomOfficePropertySchema {
  return {
    $: {
      fmtid: CUSTOM_PROPERTY_FMTID,
      pid: id,
      name: name,
    },
    "vt:lpwstr": [value],
  };
}

export function getNextPid(existingProperties: CustomOfficePropertySchema[]): number {
  if (existingProperties.length === 0) {
    return 2;
  }

  const maxPid = Math.max(...existingProperties.map((p) => parseInt(p.$.pid.toString())));

  return maxPid + 1;
}
