import { Dirent, readdirSync } from "node:fs";

export function directoryExists(basePath: string, prefix: string): string | undefined {
  try {
    const entries: Dirent[] = readdirSync(basePath, { withFileTypes: true });

    const matched = entries.find((entry) => entry.isDirectory() && entry.name.startsWith(prefix));

    return matched?.name;
  } catch (error) {
    console.error("Failed to read directory:", error);
    return undefined;
  }
}
