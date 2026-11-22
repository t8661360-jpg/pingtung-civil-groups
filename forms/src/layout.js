/* ===== 版面：自動（依螢幕寬度）／手機版／電腦版 ===== */
const DESK_MQ = window.matchMedia ? matchMedia('(min-width:1024px)') : { matches: false };
const LAYOUTS = { auto: '自動（依螢幕寬度）', m: '手機版', d: '電腦版' };
const VP_DEV = 'width=device-width, initial-scale=1, viewport-fit=cover', VP_WIDE = 'width=1280, viewport-fit=cover';
/** 目前是否使用電腦版版面 */
function isDesk() { return PREFS.layout === 'd' || (PREFS.layout !== 'm' && DESK_MQ.matches); }
/** 手機或平板選「電腦版」時，用 1280 像素寬的版面縮小顯示（跟瀏覽器的「電腦版網站」一樣） */
const narrowDevice = () => Math.min(screen.width || 9999, screen.height || 9999) < 1024 && (screen.width || 9999) < 1024;
function wantVp() { return PREFS.layout === 'd' && narrowDevice() ? VP_WIDE : VP_DEV; }
let deskNow = null;
function applyLayout() {
  const h = document.documentElement, vp = document.querySelector('meta[name=viewport]');
  if (vp && vp.getAttribute('content') !== wantVp()) vp.setAttribute('content', wantVp());
  h.classList.toggle('lay-m', PREFS.layout === 'm');
  h.classList.toggle('lay-d', PREFS.layout === 'd');
  deskNow = isDesk(); h.classList.toggle('desk', deskNow);
  const b = $('#layBtn');
  if (b) {
    b.innerHTML = icon(deskNow ? 'phone' : 'desk') + `<span class="tl">${deskNow ? '手機版' : '電腦版'}</span>`;
    b.title = deskNow ? '切換成手機版版面（單欄、大按鈕）' : '切換成電腦版版面（左右分欄）';
    b.setAttribute('aria-label', b.title);
  }
}
/** 手機用電腦版：重新整理後瀏覽器會沿用舊的縮放比例，先切回再切成 1280 寬，讓整頁重新縮放到可見 */
function refitWide() {
  const vp = document.querySelector('meta[name=viewport]'); if (!vp || wantVp() !== VP_WIDE) return;
  vp.setAttribute('content', VP_DEV);
  requestAnimationFrame(() => requestAnimationFrame(() => vp.setAttribute('content', VP_WIDE)));
}
function setLayout(v) {
  if (!LAYOUTS[v]) return;
  setPref('layout', v);
  applyLayout(); render();
  toast(`版面：${LAYOUTS[v]}${v === 'auto' ? `，目前是${isDesk() ? '電腦版' : '手機版'}` : ''}`);
}
if (DESK_MQ.addEventListener) DESK_MQ.addEventListener('change', () => { const was = deskNow; applyLayout(); if (was !== deskNow) render({ keep: 1 }); });

/* ===== 電腦版的右側欄 ===== */
/** 選文件：本次要準備的文件與期限 */
function docsAside(sc) {
  const sel = selDocs(sc), fill = sel.filter(x => x.kind !== 'attach'), att = sel.filter(x => x.kind === 'attach');
  const on = batchOn(sc), li = x => `<li${x.req ? ' class="rq"' : ''}>${esc(x.name)}${isUp(x) ? '<small>上傳</small>' : ''}</li>`;
  let h = `<section class="card dsum"><h3>${icon('list')}本次要準備<span class="n">${fill.length} 份</span></h3>`;
  if (hasBatch(sc)) for (const k of [PRE, POST]) { if (!on[k]) continue; const xs = fill.filter(x => x.bt === k); h += `<div class="dsb"><span class="bn">${BATCH[k].n}</span>${BATCH[k].t}<small>${xs.length} 份</small></div><ol>${xs.map(li).join('')}</ol>`; }
  else h += `<ol>${fill.map(li).join('')}</ol>`;
  if (att.length) h += `<div class="dsb"><span class="bn">${icon('clip')}</span>另附文件<small>${att.length} 份</small></div><ol>${att.map(li).join('')}</ol>`;
  h += `<button class="btn pri" data-step="fill">下一步：填寫資料${icon('back', 'flip')}</button></section>`;
  return h + dlCard(sc);
}
/** 重要期限（下載頁與電腦版側欄共用） */
function dlCard(sc) {
  const dls = deadlines(sc), today = isoToday(); if (!dls.length) return '';
  return `<section class="card dlc"><h3>${icon('clock')}重要期限${dls.some(x => x.when && daysBetween(today, x.when) >= 0) ? `<button class="mini cal" data-cmd="ics" data-scen="${sc}">${icon('cal')}加入行事曆</button>` : ''}</h3><ol class="tl">${dls.map(x => { const v = x.when ? daysBetween(today, x.when) : null; return `<li class="${v != null && v < 0 ? 'past' : ''}"><span class="d">${x.when ? `${rd(x.when)}<small>${weekday(x.when)}</small>` : '—'}</span><span class="w">${x.bt && hasBatch(sc) ? `<i class="bno">${BATCH[x.bt].n}</i>` : ''}${x.what}${v != null ? (v < 0 ? ' <em class="late">已過</em>' : v <= 7 ? ` <em class="soon">剩 ${v} 天</em>` : '') : ''}</span></li>`; }).join('')}</ol></section>`;
}
