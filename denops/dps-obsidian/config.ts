import { Denops, unknownutil as u, vars } from "./deps.ts";

const isVaultConfig = u.isObjectOf({
  name: u.isString,
  path: u.isString,
  note: u.isOptionalOf(u.isObjectOf({
    dir: u.isOptionalOf(u.isString),
    file_name_format: u.isOptionalOf(u.isString),
    template: u.isOptionalOf(u.isString),
  })),
  daily_note: u.isOptionalOf(u.isObjectOf({
    dir: u.isOptionalOf(u.isString),
    file_name_format: u.isOptionalOf(u.isString),
    template: u.isOptionalOf(u.isString),
  })),
  template_dir: u.isOptionalOf(u.isString),
});

export const isConfig = u.isObjectOf({
  cmd: u.isOptionalOf(u.isString),
  vaults: u.isArrayOf(isVaultConfig),
  default_vault: u.isOptionalOf(u.isString),
});

export type VaultConfig = u.PredicateType<typeof isVaultConfig>;

export type Config = u.PredicateType<typeof isConfig>;

export async function loadConfig(denops: Denops): Promise<Config> {
  const config = await vars.g.get(denops, "denops_obsidian_config");
  return validateConfig(config);
}

export function validateConfig(config: unknown) {
  const ensuredConfig = u.ensure(config, isConfig);
  ensuredConfig.vaults.map((vault) => {
    if (vault.name === "") {
      throw new Error("Vault name is empty");
    }
    if (vault.path === "") {
      throw new Error("Vault path is empty");
    }
  });
  return ensuredConfig;
}
