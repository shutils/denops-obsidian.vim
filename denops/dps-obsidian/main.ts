import { Denops, fn, unknownutil as u, vars } from "./deps.ts";
import { isInVault, openObsidian, syncObsidian } from "./common.ts";

export function main(denops: Denops) {
  denops.dispatcher = {
    ...denops.dispatcher,
    "open:note:obsidian": async (args: unknown) => {
      const ensuredArgs = u.ensure(
        args,
        u.isObjectOf({
          notePath: u.isString,
        }),
      );
      const vault = u.ensure(
        await vars.g.get(denops, "denops_obsidian_vault"),
        u.isOptionalOf(u.isUnionOf([u.isString, u.isNull])),
      );
      const cmd = u.ensure(
        await vars.g.get(denops, "denops_obsidian_cmd"),
        u.isOptionalOf(u.isUnionOf([u.isString, u.isNull])),
      );
      if (
        !isInVault(
          ensuredArgs.notePath,
          vault ?? await fn.expand(denops, "~/obsidian") as string,
        )
      ) {
        return;
      }
      openObsidian(denops, ensuredArgs.notePath, cmd ?? "obsidian");
    },
    "sync:note:obsidian": async (args: unknown) => {
      const ensuredArgs = u.ensure(
        args,
        u.isObjectOf({
          notePath: u.isString,
        }),
      );
      const vault = u.ensure(
        await vars.g.get(denops, "denops_obsidian_vault"),
        u.isOptionalOf(u.isUnionOf([u.isString, u.isNull])),
      );
      const cmd = u.ensure(
        await vars.g.get(denops, "denops_obsidian_cmd"),
        u.isOptionalOf(u.isUnionOf([u.isString, u.isNull])),
      );
      if (
        !isInVault(
          ensuredArgs.notePath,
          vault ?? await fn.expand(denops, "~/obsidian") as string,
        )
      ) {
        return;
      }
      const lineNr = await fn.line(denops, ".") as number;
      syncObsidian(
        denops,
        vault ?? await fn.expand(denops, "~/obsidian") as string,
        ensuredArgs.notePath,
        lineNr,
        cmd ?? "obsidian",
      );
    },
  };
}
