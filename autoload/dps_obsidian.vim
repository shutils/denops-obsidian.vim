function! dps_obsidian#create_daily_note(...) abort
  if a:0 == 0
    let s:offset = 0
  else
    let s:offset = str2nr(a:1)
  endif
  call denops#notify("dps-obsidian", "createDailyNote", [{ "offset": s:offset }])
endfunction

function! dps_obsidian#get_new_note_complete(read, line, cursor) abort
  if a:read ==# "--template="
    return dps_obsidian#get_rel_paths(a:read)
  elseif a:read ==# "--"
    return dps_obsidian#get_new_note_flags(a:read)
  endif
  return []
endfunction

function! dps_obsidian#get_new_note_flags(read) abort
  let flags = [
        \ "template",
        \ ]
  return map(flags, {_, v -> a:read . v . "="})
endfunction

function! dps_obsidian#get_rel_paths(read) abort
  if g:denops_obsidian_template_dir == v:null
    return []
  endif
  let s:dir = g:denops_obsidian_template_dir
  let s:templates = globpath(s:dir, "**/*.md", 0, 1)
  return map(s:templates, {_, v -> substitute(v, escape(s:dir, "/") . "/", a:read, "")})
endfunction
