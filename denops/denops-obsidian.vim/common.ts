import {
  Denops,
  helper,
  path,
} from "./deps.ts";

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
