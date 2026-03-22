import { promises as fs } from "node:fs";
import { join, resolve } from "node:path";

export async function getDocumentHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = new Uint8Array(hashBuffer);
  const hashHex = Array.from(hashArray)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export async function getHumanReadableFileSize(dirName: string, fileName: string) {
  const storagePath = resolve(process.cwd(), "../../storage/documents");
  const targetDir = join(storagePath, dirName);
  const targetFile = join(targetDir, fileName);

  try {
    const stats = await fs.stat(targetFile);
    return formatBytes(stats.size);
  } catch (error) {
    console.error("Error getting file size:", error);
    return null;
  }
}

export function separateFilenameWithExt(fileName: string) {
  return fileName.split(/\.(?=[^\.]+$)/);
}

export async function getDocument(dirPath: string) {
  try {
    const files = await fs.readdir(dirPath);
    if (files.length === 0) {
      throw new Error(`No files found in the directory: ${dirPath}`);
    }

    const getFirstFileInPath = await fs.readFile(join(dirPath, files[0]!));
    return getFirstFileInPath;
  } catch (error) {
    throw new Error(`Error reading document from ${dirPath}: ${error}`);
  }
}

export async function getDocumentByName(dirPath: string, nameIncludes: string) {
  const files = await fs.readdir(dirPath);
  const matchedFiles = files.find((file) => file.includes(nameIncludes));

  if (!matchedFiles) {
    throw new Error(`No file found in ${dirPath} that includes "${nameIncludes}"`);
  }

  const getFile = await fs.readFile(join(dirPath, matchedFiles));
  return { name: matchedFiles, content: getFile };
}
