import { Denops, fn, fs, path, unknownutil as u, vars } from "./deps.ts";
import {
  getDailyNotePath,
  getDatetimeNotePath,
  isInVault,
  openObsidian,
  syncObsidian,
} from "./common.ts";
import {
  defaultAppCommandName,
  defaultDailyNoteFormat,
  defaultNoteFormat,
} from "./default.ts";
import { renderTemplate } from "./template/main.ts";

export function main(denops: Denops) {
  const commands: string[] = [
    `command! -nargs=0 ObsidianOpen call denops#notify('${denops.name}', 'openObsidianApp', [{'notePath': expand('%:p')}])`,
    `command! -nargs=0 ObsidianSync call denops#notify('${denops.name}', 'syncObsidianApp', [{'notePath': expand('%:p')}])`,
    `command! -nargs=? ObsidianToday call dps_obsidian#create_daily_note(<f-args>)`,
    `command! -nargs=0 ObsidianTomorrow call denops#notify('${denops.name}', 'createDailyNote', [{'offset': 1}])`,
    `command! -nargs=0 ObsidianYesterday call denops#notify('${denops.name}', 'createDailyNote', [{'offset': -1}])`,
    `command! -nargs=? ObsidianNewNote call dps_obsidian#create_new_note(<f-args>)`,
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
        | null ?? defaultAppCommandName;
      if (!await isInVault(ensuredArgs.notePath)) {
        return;
      }
      openObsidian(denops, ensuredArgs.notePath, cmd);
    },
    syncObsidianApp: async (args: unknown) => {
      const ensuredArgs = u.ensure(
        args,
        u.isObjectOf({ notePath: u.isString }),
      );
      const cmd = await vars.g.get(denops, "denops_obsidian_cmd") as
        | string
        | null ?? defaultAppCommandName;
      if (!await isInVault(ensuredArgs.notePath)) {
        return;
      }
      const lineNr = await fn.line(denops, ".") as number;
      syncObsidian(
        denops,
        ensuredArgs.notePath,
        lineNr,
        cmd,
      );
    },
    createDailyNote: async (args: unknown) => {
      const ensuredArgs = u.ensure(
        args,
        u.isOptionalOf(u.isObjectOf({ offset: u.isNumber })),
      );
      const fileNameFormat = await vars.g.get(
        denops,
        "denops_obsidian_daily_note_format",
      ) as string | null ?? defaultDailyNoteFormat;
      const dailyNoteDir = await vars.g.get(
        denops,
        "denops_obsidian_daily_note_dir",
      ) as
        | string
        | null;
      const templatePath = await vars.g.get(
        denops,
        "denops_obsidian_daily_note_template",
      ) as
        | string
        | null;
      let content: string;
      if (templatePath) {
        content = renderTemplate(templatePath);
      } else {
        content = "";
      }
      if (dailyNoteDir === null) {
        console.error("denops_obsidian_daily_note_dir is not set.");
        return;
      }
      const dailyNotePath = getDailyNotePath(
        fileNameFormat,
        dailyNoteDir,
        ensuredArgs?.offset ?? 0,
      );
      if (await fs.exists(dailyNotePath)) {
        await fn.execute(denops, `e ${dailyNotePath}`);
      } else {
        await Deno.writeTextFile(dailyNotePath, content);
        console.log(`Created ${dailyNotePath}`);
        await fn.execute(denops, `e ${dailyNotePath}`);
      }
    },
    createNewNote: async (args: unknown) => {
      const ensuredArgs = u.ensure(
        args,
        u.isOptionalOf(u.isObjectOf({ name: u.isString })),
      );
      const noteDir = await vars.g.get(
        denops,
        "denops_obsidian_note_dir",
      ) as
        | string
        | null;
      const templatePath = await vars.g.get(
        denops,
        "denops_obsidian_note_template",
      ) as
        | string
        | null;
      if (noteDir === null) {
        console.error("denops_obsidian_note_dir is not set.");
        return;
      }
      let content: string;
      if (templatePath) {
        content = renderTemplate(templatePath);
      } else {
        content = "";
      }
      let filePath: string;
      if (ensuredArgs) {
        filePath = path.join(noteDir, `${ensuredArgs.name}.md`);
      } else {
        const fileNameFormat = await vars.g.get(
          denops,
          "denops_obsidian_note_format",
        ) as string | null ?? defaultNoteFormat;
        filePath = getDatetimeNotePath(fileNameFormat, noteDir);
      }
      if (await fs.exists(filePath)) {
        await fn.execute(denops, `e ${filePath}`);
      } else {
        await Deno.writeTextFile(filePath, content);
        console.log(`Created ${filePath}`);
        await fn.execute(denops, `e ${filePath}`);
      }
    },
  };
}
