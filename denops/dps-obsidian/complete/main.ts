import { Denops, path, unknownutil as u } from "../deps.ts";

import { DAILY_NOTE_FLAGS, NEW_NOTE_FLAGS } from "./constant.ts";
import { getVaultsNames } from "../helper.ts";
import { Config, loadConfig, VaultConfig } from "../config.ts";
import { collectFilesUnderDir } from "../util.ts";

export function main(denops: Denops) {
  denops.dispatcher = {
    ...denops.dispatcher,
    async getNewNoteComplete(args: unknown) {
      const config = await loadConfig(denops);
      const ensuredArgs = u.ensure(
        args,
        u.isObjectOf({
          read: u.isString,
          line: u.isString,
          cursor: u.isNumber,
          daily: u.isOptionalOf(u.isBoolean),
        }),
      );
      if (ensuredArgs.read === "--") {
        return await Promise.resolve(
          NEW_NOTE_FLAGS.map((flag) => `--${flag}=`),
        );
      }
      if (ensuredArgs.read === "--vault=") {
        const vaultNames = getVaultsNames(config);
        return await Promise.resolve(
          vaultNames.map((name) => `${ensuredArgs.read}${name}`),
        );
      }
      if (ensuredArgs.read === "--template=") {
        const templates = await getTemplate(config, ensuredArgs.line);
        return await Promise.resolve(
          templates.map((name) => `${ensuredArgs.read}${name}`),
        );
      }
    },

    async getDailyNoteComplete(args: unknown) {
      const config = await loadConfig(denops);
      const ensuredArgs = u.ensure(
        args,
        u.isObjectOf({
          read: u.isString,
          line: u.isString,
          cursor: u.isNumber,
          daily: u.isOptionalOf(u.isBoolean),
        }),
      );
      if (ensuredArgs.read === "--") {
        return await Promise.resolve(
          DAILY_NOTE_FLAGS.map((flag) => `--${flag}=`),
        );
      }
      if (ensuredArgs.read === "--vault=") {
        const vaultNames = getVaultsNames(config);
        return await Promise.resolve(
          vaultNames.map((name) => `${ensuredArgs.read}${name}`),
        );
      }
      if (ensuredArgs.read === "--template=") {
        const templates = await getTemplate(config, ensuredArgs.line);
        return await Promise.resolve(
          templates.map((name) => `${ensuredArgs.read}${name}`),
        );
      }
    },
  };
}

function hasVaultFlag(line: string): boolean {
  return line.includes("--vault=");
}

function getVaultName(line: string): string {
  const match = line.match(/--vault=([^\s]+)/);
  if (match) {
    return match[1];
  }
  return "";
}

function getVaultConfig(config: Config, vaultName: string): VaultConfig {
  return config.vaults.find((v) => v.name === vaultName) ??
    getDefaultVaultConfig(config);
}

function getVaultTemplateDir(config: Config, vaultName: string): string {
  const vault = config.vaults.find((v) => v.name === vaultName);
  if (vault) {
    return vault.template_dir ?? "";
  }
  return "";
}

async function getVaultTemplates(
  config: Config,
  vaultName: string,
): Promise<string[]> {
  const vaultConfig = getVaultConfig(config, vaultName);
  const templateDir = getVaultTemplateDir(config, vaultName);
  const templateDirFullPath = path.join(vaultConfig.path, templateDir);
  const files = await collectFilesUnderDir(templateDirFullPath);
  const templates = files.filter((file) => file.endsWith(".md"));
  return templates.map((template) => {
    return path.relative(templateDirFullPath, template);
  });
}

function getDefaultVaultConfig(config: Config) {
  const vaultConfig = config.vaults.find((v) =>
    v.name === config.default_vault
  );
  if (vaultConfig) {
    return vaultConfig;
  } else {
    return config.vaults[0];
  }
}

async function getTemplate(config: Config, line: string) {
  if (!hasVaultFlag(line)) {
    const defaultVaultConfig = getDefaultVaultConfig(config);
    return await getVaultTemplates(config, defaultVaultConfig.name);
  } else {
    const vaultName = getVaultName(line);
    return await getVaultTemplates(config, vaultName);
  }
}
