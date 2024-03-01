function! dps_obsidian#denops#open_note_with_obsidian() abort
  call denops#notify('dps-obsidian', 'open:note:obsidian', [{'notePath': expand('%:p')}])
endfunction
