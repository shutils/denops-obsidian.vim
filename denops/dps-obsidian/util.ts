import { fs } from "./deps.ts";

export function strToNum(str: string) {
  if (isNaN(Number(str))) {
    throw new Error("Invalid number");
  }
  return Number(str);
}

export async function collectFilesUnderDir(dir: string): Promise<string[]> {
  const files: string[] = [];
  for await (const entry of fs.walk(dir, { maxDepth: Infinity })) {
    if (entry.isFile) {
      files.push(entry.path);
    }
  }
  return files;
}
