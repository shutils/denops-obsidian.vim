import { datetime, Denops, fn, fs, helper, path } from "./deps.ts";

export async function isInVault(filePath: string) {
  try {
    await searchVaultPath(filePath);
  } catch {
    return false;
  }
  return true;
}

export function openObsidian(denops: Denops, notePath: string, cmd?: string) {
  const filePathArray = notePath.split(path.SEPARATOR);
  const baseUri = `obsidian://open`;
  const params = new URLSearchParams({
    path: filePathArray.join("/"),
  });
  const uri = `${baseUri}?${params.toString()}`;
  const result = new Deno.Command(cmd ?? "obsidian", {
    args: [`${uri}`],
  });
  const decoder = new TextDecoder();
  result.output().then(async ({ stderr, success }) => {
    if (!success) {
      console.error(decoder.decode(stderr));
    } else {
      await helper.echo(denops, "Opened with Obsidian.");
    }
  }).catch((e) => {
    console.error(decoder.decode(e));
  });
}

export async function syncObsidian(
  _denops: Denops,
  notePath: string,
  lineNr: number,
  cmd?: string,
) {
  const vault = await searchVaultPath(notePath);
  const relativePath = path.relative(vault, notePath);
  const filePathArray = relativePath.split(path.SEPARATOR);
  const baseUri = `obsidian://advanced-uri`;
  const params = new URLSearchParams({
    vault: path.basename(vault),
    filepath: filePathArray.join("/"),
    line: lineNr.toString(),
  });
  const uri = `${baseUri}?${params.toString()}`;
  const result = new Deno.Command(cmd ?? "obsidian", {
    args: [`${uri}`],
  });
  const decoder = new TextDecoder();
  result.output().then(({ stderr, success }) => {
    if (!success) {
      console.error(decoder.decode(stderr));
    }
  }).catch((e) => {
    console.error(decoder.decode(e));
  });
}

export async function searchVaultPath(notePath: string) {
  let rootDir: string;
  if (Deno.build.os === "windows") {
    rootDir = "C:\\";
  } else {
    rootDir = "/";
  }
  let currentDir = path.parse(notePath).dir;
  while (true) {
    if (await fs.exists(path.join(currentDir, ".obsidian"))) {
      return currentDir;
    }
    if (currentDir === rootDir) {
      throw new Error("Not found in any parent directory");
    }

    currentDir = path.parse(currentDir).dir;
  }
}

export function getDailyNotePath(
  fileFormat: string,
  directory: string,
  offset = 0,
) {
  const fileName = datetime.format(
    new Date(new Date().getTime() + datetime.DAY * offset),
    fileFormat,
  ) + ".md";
  return path.join(directory, fileName);
}

export function getDatetimeNotePath(
  fileFormat: string,
  directory: string,
) {
  const fileName = datetime.format(
    new Date(new Date().getTime()),
    fileFormat,
  ) + ".md";
  return path.join(directory, fileName);
}

export async function openNote(
  denops: Denops,
  notePath: string,
  content?: string,
) {
  if (await fs.exists(notePath)) {
    await fn.execute(denops, `e ${notePath}`);
  } else {
    await Deno.writeTextFile(notePath, content ?? "");
    console.log(`Created ${notePath}`);
    await fn.execute(denops, `e ${notePath}`);
  }
}
