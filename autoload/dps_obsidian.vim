function! dps_obsidian#create_daily_note(...) abort
  if a:0 == 0
    let s:offset = 0
  else
    let s:offset = str2nr(a:1)
  endif
  call denops#notify("dps-obsidian", "createDailyNote", [{ "offset": s:offset }])
endfunction
