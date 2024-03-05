import { argument, path } from "./deps.ts";
import { Config, VaultConfig } from "./config.ts";
import { defaultDailyNoteFormat, defaultNoteFormat } from "./default.ts";

export function getNoteDirPath(vault: VaultConfig) {
  return path.join(
    vault.path,
    vault.note?.dir ?? "",
  );
}

export function getDailyNoteDirPath(vault: VaultConfig) {
  return path.join(
    vault.path,
    vault.daily_note?.dir ?? "",
  );
}

export function getNoteNameFormat(vault: VaultConfig) {
  return vault.note?.file_name_format ?? defaultNoteFormat;
}

export function getDailyNoteNameFormat(vault: VaultConfig) {
  return vault.daily_note?.file_name_format ?? defaultDailyNoteFormat;
}

export function isTemplateUsed(
  vault: VaultConfig,
  flags: argument.Flags,
  isDaily: boolean,
) {
  if (isDaily) {
    return flags.template !== undefined ||
      vault.daily_note?.template !== undefined;
  } else {
    return flags.template !== undefined || vault.note?.template !== undefined;
  }
}

export function getTemplatePath(
  vault: VaultConfig,
  flags: argument.Flags,
  isDaily: boolean,
) {
  if (isDaily) {
    return flags.template
      ? path.join(
        vault.path,
        vault.template_dir ?? "",
        flags.template as string,
      )
      : path.join(
        vault.path,
        vault.template_dir ?? "",
        vault.daily_note?.template ?? "",
      );
  } else {
    return flags.template
      ? path.join(
        vault.path,
        vault.template_dir ?? "",
        flags.template as string,
      )
      : path.join(
        vault.path,
        vault.template_dir ?? "",
        vault.note?.template ?? "",
      );
  }
}

export function getVaultConfig(config: Config, vaultName: string | undefined){
  return config.vaults.find((vault) => vault.name === vaultName) ??
    config.vaults[0];
};
