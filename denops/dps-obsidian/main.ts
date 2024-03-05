import { argument, Denops, fn, path, unknownutil as u, vars } from "./deps.ts";
import {
  getDailyNotePath,
  getDatetimeNotePath,
  isInVault,
  openNote,
  openObsidian,
  syncObsidian,
} from "./common.ts";
import { defaultAppCommandName } from "./default.ts";
import { renderTemplate } from "./template/main.ts";
import { loadConfig, validateConfig } from "./config.ts";
import { strToNum } from "./util.ts";
import {
  getDailyNoteDirPath,
  getDailyNoteNameFormat,
  getNoteDirPath,
  getNoteNameFormat,
  getTemplatePath,
  getVaultConfig,
  isTemplateUsed,
} from "./helper.ts";

export function main(denops: Denops) {
  const commands: string[] = [
    `command! -nargs=0 ObsidianOpen call denops#notify('${denops.name}', 'openObsidianApp', [{'notePath': expand('%:p')}])`,
    `command! -nargs=0 ObsidianSync call denops#notify('${denops.name}', 'syncObsidianApp', [{'notePath': expand('%:p')}])`,
    `command! -nargs=? ObsidianToday call denops#notify('${denops.name}', 'createDailyNote', [[<f-args>]])`,
    `command! -nargs=0 ObsidianTomorrow call denops#notify('${denops.name}', 'createDailyNote', [["--offset=1"]])`,
    `command! -nargs=0 ObsidianYesterday call denops#notify('${denops.name}', 'createDailyNote', [["--offset=-1"]])`,
    `command! -nargs=* -complete=customlist,dps_obsidian#get_new_note_complete ObsidianNewNote call denops#notify('${denops.name}', 'createNewNote', [[<f-args>]])`,
  ];

  commands.map((cmd) => {
    denops.cmd(cmd);
  });
  denops.dispatcher = {
    ...denops.dispatcher,
    openObsidianApp: async (args: unknown) => {
      const config = await loadConfig(denops);
      const ensuredArgs = u.ensure(
        args,
        u.isObjectOf({ notePath: u.isString }),
      );
      if (!await isInVault(ensuredArgs.notePath)) {
        return;
      }
      openObsidian(
        denops,
        ensuredArgs.notePath,
        config.cmd ?? defaultAppCommandName,
      );
    },

    syncObsidianApp: async (args: unknown) => {
      const config = await loadConfig(denops);
      const ensuredArgs = u.ensure(
        args,
        u.isObjectOf({ notePath: u.isString }),
      );
      if (!await isInVault(ensuredArgs.notePath)) {
        return;
      }
      const lineNr = await fn.line(denops, ".") as number;
      syncObsidian(
        denops,
        ensuredArgs.notePath,
        lineNr,
        config.cmd ?? defaultAppCommandName,
      );
    },

    createDailyNote: async (args: unknown) => {
      const [_, flags] = argument.parse(args as string[]);
      const config = await loadConfig(denops);
      const ensuredFlags = u.ensure(
        flags,
        u.isObjectOf({
          offset: u.isOptionalOf(u.isString),
          vault: u.isOptionalOf(u.isString),
        }),
      );
      const vaultConfig = getVaultConfig(config, ensuredFlags?.vault);
      const offset = strToNum(ensuredFlags?.offset ?? "0");
      const fileNameFormat = getDailyNoteNameFormat(vaultConfig);
      const dailyNoteDir = getDailyNoteDirPath(vaultConfig);
      let content: string;
      if (isTemplateUsed(vaultConfig, flags, true)) {
        const templatePath = getTemplatePath(vaultConfig, flags, true);
        content = renderTemplate(templatePath);
      } else {
        content = "";
      }
      const dailyNotePath = getDailyNotePath(
        fileNameFormat,
        dailyNoteDir,
        offset,
      );
      openNote(denops, dailyNotePath, content);
    },

    createNewNote: async (args: unknown) => {
      const config = await loadConfig(denops);
      const [_, flags, residues] = argument.parse(args as string[]);
      const ensuredFlags = u.ensure(
        flags,
        u.isObjectOf({ vault: u.isOptionalOf(u.isString) }),
      );
      const vaultConfig = getVaultConfig(config, ensuredFlags?.vault);
      let name: string | undefined;
      name = residues.join(" ");
      if (name === "") {
        name = undefined;
      }
      let content: string;
      if (isTemplateUsed(config.vaults[0], flags, false)) {
        const templatePath = getTemplatePath(config.vaults[0], flags, false);
        content = renderTemplate(templatePath);
      } else {
        content = "";
      }
      const noteDir = getNoteDirPath(vaultConfig);
      let filePath: string;
      if (name !== undefined) {
        filePath = path.join(noteDir, `${name}.md`);
      } else {
        const fileNameFormat = getNoteNameFormat(vaultConfig);
        filePath = getDatetimeNotePath(fileNameFormat, noteDir);
      }
      openNote(denops, filePath, content);
    },

    setup: async (args: unknown) => {
      const config = validateConfig(args);
      await vars.g.set(denops, "denops_obsidian_config", config);
    },
  };
}
