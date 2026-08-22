import { promises as fs } from "node:fs";
import { join, parse, resolve } from "node:path";

import { InternalError } from "./errors";
import { convertToSlug } from "./slug";

export async function getDocumentHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = new Uint8Array(hashBuffer);
  const hashHex = Array.from(hashArray)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export async function getHumanReadableFileSize(title: string, dirName: string, fileName: string, signed = false) {
  const storagePath = resolve(process.cwd(), "../../storage/documents");
  const dirNameSlug = `${convertToSlug(title)}-${dirName}`.toLowerCase();

  const { name, ext } = parse(fileName);
  const resolvedFileName = signed ? `${name}-signed${ext}` : fileName;

  const targetFile = join(storagePath, dirNameSlug, resolvedFileName);

  try {
    const stats = await fs.stat(targetFile);
    return formatBytes(stats.size);
  } catch (error) {
    return null;
  }
}

export function separateFilenameWithExt(fileName: string) {
  return fileName.split(/\.(?=[^\.]+$)/);
}

export async function getDocument(dirPath: string) {
  try {
    const files = await fs.readdir(dirPath);
    if (files.length === 0) throw new InternalError(`No files found in the directory: ${dirPath}`);

    const getFirstFileInPath = await fs.readFile(join(dirPath, files[0]!));
    return getFirstFileInPath;
  } catch (error) {
    if (error instanceof InternalError) throw error;
    throw new InternalError(`Error reading document from ${dirPath}: ${error}`);
  }
}

export async function getDocumentByName(dirPath: string, nameIncludes: string) {
  const files = await fs.readdir(dirPath);
  const matchedFiles = files.find((file) => file.includes(nameIncludes));

  if (!matchedFiles) throw new InternalError(`No file found in ${dirPath} that includes "${nameIncludes}"`);

  const getFile = await fs.readFile(join(dirPath, matchedFiles));
  return { name: matchedFiles, content: getFile };
}
