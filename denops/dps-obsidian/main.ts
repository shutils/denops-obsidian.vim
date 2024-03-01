import { Denops, fn, unknownutil as u, vars } from "./deps.ts";
import { isInVault, openObsidian, syncObsidian } from "./common.ts";

export function main(denops: Denops) {
  denops.dispatcher = {
    ...denops.dispatcher,
    "open:note:obsidian": async (args: unknown) => {
      const ensuredArgs = u.ensure(
        args,
        u.isObjectOf({ notePath: u.isString }),
      );
      const cmd = u.ensure(
        await vars.g.get(denops, "denops_obsidian_cmd"),
        u.isOptionalOf(u.isUnionOf([u.isString, u.isNull])),
      );
      if (!await isInVault(ensuredArgs.notePath)) {
        return;
      }
      openObsidian(denops, ensuredArgs.notePath, cmd ?? "obsidian");
    },
    "sync:note:obsidian": async (args: unknown) => {
      const ensuredArgs = u.ensure(
        args,
        u.isObjectOf({ notePath: u.isString }),
      );
      const cmd = u.ensure(
        await vars.g.get(denops, "denops_obsidian_cmd"),
        u.isOptionalOf(u.isUnionOf([u.isString, u.isNull])),
      );
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
