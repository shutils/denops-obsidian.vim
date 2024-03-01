import { Denops, helper, path } from "./deps.ts";

export function isInVault(filePath: string, vault: string) {
  const common = path.common([filePath, vault]);
  return vault == common || vault + path.SEPARATOR == common;
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

export function syncObsidian(
  _denops: Denops,
  vault: string,
  filePath: string,
  lineNr: number,
  cmd?: string,
) {
  const relativePath = path.relative(vault, filePath);
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
