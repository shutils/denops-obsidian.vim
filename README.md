# denops-obsidian.vim

obsidian handler powerd by denops.vim

## Required

### denops.vim

https://github.com/vim-denops/denops.vim

### obsidian

https://obsidian.md/

## Configuration

```vim
" Set your vault path. Default: expand('~/obsidian')
let g:denops_obsidian_vault = expand('~/zettelkasten')

" Set the name of your obsidian command
let g:denops_obsidian_cmd = 'obsidian'
```

## Commands

### OpenObsidian

Open the current buffer in obsidian.
Executes only when opening a file in the vault.

## Similar plugins

### ddu-source-obsidian

[shutils/ddu-source-obsidian](https://github.com/shutils/ddu-source-obsidian)

Powerd by `Shougo/ddu.vim`  
Provides tags and links in the vault to ddu.vim.

### ddc-source-obsidian

[shutils/ddc-source-obsidian](https://github.com/shutils/ddc-source-obsidian)

Powerd by `Shougo/ddc.vim`  
Provide tags and links in the vault to ddc.vim.
