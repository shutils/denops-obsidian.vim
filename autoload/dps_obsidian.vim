function! dps_obsidian#get_new_note_complete(read, line, cursor) abort
  return denops#request("dps-obsidian", "getNewNoteComplete",
        \ [#{read: a:read, line: a:line, cursor: a:cursor}])
endfunction

function! dps_obsidian#get_daily_note_complete(read, line, cursor) abort
  return denops#request("dps-obsidian", "getDailyNoteComplete",
        \ [#{read: a:read, line: a:line, cursor: a:cursor}])
endfunction

function! dps_obsidian#setup(...) abort
  if denops#plugin#is_loaded("dps-obsidian")
    call denops#notify("dps-obsidian", "setup", [a:000])
  else
    augroup dps_obsidian
      autocmd!
      execute "autocmd User DenopsPluginPost:dps-obsidian ++once call denops#notify('dps-obsidian', 'setup', " . string(a:000) . ")"
    augroup END
  endif
endfunction
