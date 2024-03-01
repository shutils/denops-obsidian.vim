import { Denops, fn, unknownutil as u, vars } from "./deps.ts";
import { isInVault, openObsidian, syncObsidian } from "./common.ts";

export function main(denops: Denops) {
  const commands: string[] = [
    `command! -nargs=0 ObsidianOpen call denops#notify('${denops.name}', 'openObsidianApp', [{'notePath': expand('%:p')}])`,
    `command! -nargs=0 ObsidianSync call denops#notify('${denops.name}', 'syncObsidianApp', [{'notePath': expand('%:p')}])`,
  ];

  commands.map((cmd) => {
    denops.cmd(cmd);
  });
  denops.dispatcher = {
    ...denops.dispatcher,
    openObsidianApp: async (args: unknown) => {
      const ensuredArgs = u.ensure(
        args,
        u.isObjectOf({ notePath: u.isString }),
      );
      const cmd = await vars.g.get(denops, "denops_obsidian_cmd") as
        | string
        | null;
      if (!await isInVault(ensuredArgs.notePath)) {
        return;
      }
      openObsidian(denops, ensuredArgs.notePath, cmd ?? "obsidian");
    },
    syncObsidianApp: async (args: unknown) => {
      const ensuredArgs = u.ensure(
        args,
        u.isObjectOf({ notePath: u.isString }),
      );
      const cmd = await vars.g.get(denops, "denops_obsidian_cmd") as
        | string
        | null;
      if (!await isInVault(ensuredArgs.notePath)) {
        return;
      }
      const lineNr = await fn.line(denops, ".") as number;
      syncObsidian(
        denops,
        ensuredArgs.notePath,
        lineNr,
        cmd ?? "obsidian",
      );
    },
  };
}
