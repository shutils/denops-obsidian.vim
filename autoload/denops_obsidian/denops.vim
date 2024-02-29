function! denops_obsidian#denops#open_note_with_obsidian() abort
  call denops#notify('denops-obsidian.vim', 'open:note:obsidian', [{'notePath': expand('%:p')}])
endfunction
