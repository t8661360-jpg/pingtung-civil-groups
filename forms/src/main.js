/* ===== 從 Excel 貼上 ===== */
const HDR = [['skip', /編號|序號|^No/i], ['idno', /身分證|身份證/], ['type', /類別|會員別|身分別/], ['role', /職別|職稱|職務/], ['gender', /性別/], ['birth', /出生|生日/], ['origin', /籍貫/], ['addr', /地址|住址/], ['phone', /電話|手機|聯絡/], ['job', /現職|職業|服務單位/], ['note', /備註/], ['name', /姓名|名稱|會員/]];
function normRow(o) {
  if (o.gender) o.gender = /女|F/i.test(o.gender) ? '女' : /男|M/i.test(o.gender) ? '男' : '';
  if (o.type !== undefined) o.type = /團體/.test(o.type) ? '團體會員' : /贊助/.test(o.type) ? '贊助會員' : /停權/.test(o.type) ? '停權會員' : '個人會員';
  if (o.role && !ROLES.includes(o.role)) { const r = ROLES.find(x => o.role.replace(/\s/g, '').includes(x)); o.role = r || o.role; }
  return o;
}
function parsePaste(text, target) {
  text = String(text || '').replace(/\r/g, '').trim(); if (!text) return [];
  let lines = text.split('\n').map(l => l.replace(/\s+$/, '')).filter(l => l.trim());
  if (lines.length === 1 && /[、，,;；]/.test(lines[0]) && !/\t/.test(lines[0])) lines = lines[0].split(/[、，,;；]/).map(s => s.trim()).filter(Boolean);
  const split = l => l.includes('\t') ? l.split('\t') : (l.includes(',') ? l.split(',') : l.trim().split(/\s{2,}|　+|\s+/));
  let rows = lines.map(split).map(r => r.map(c => c.trim()));
  let map = null;
  if (rows[0].some(c => HDR.some(([, re]) => re.test(c)))) { map = rows[0].map(c => (HDR.find(([, re]) => re.test(c)) || [null])[0]); rows = rows.slice(1); }
  if (!map) {
    const looksRole = rows.some(r => ROLES.includes(r[0]));
    map = target === 'people' ? (looksRole ? ['role', 'name', 'gender', 'birth', 'job', 'idno', 'addr', 'phone'] : ['name', 'role', 'gender', 'birth', 'job', 'idno', 'addr', 'phone'])
      : ['name', 'gender', 'birth', 'origin', 'addr', 'phone', 'type', 'note'];
    if (rows.every(r => r.length === 1)) map = ['name'];
  }
  return rows.map(r => { const o = {}; r.forEach((c, i) => { const k = map[i]; if (k && k !== 'skip' && c) o[k] = c; }); return normRow(o); }).filter(o => o.name);
}
function openPaste(target) {
  const m = $('#sheet');
  m.innerHTML = `<div class="sbox"><h3>${icon('paste')}從 Excel／試算表貼上${target === 'people' ? '人員' : '會員'}</h3>
    <p class="muted small">在 Excel 選取整個範圍（可含第一列標題）複製後，貼到下面。也可以只貼姓名，用換行或「、」分隔。</p>
    <textarea id="pasteBox" rows="8" placeholder="${target === 'people' ? '職別\t姓名\t性別\t出生年月日\t現職\n理事長\t王大明\t男\t50/4/12\t自營商' : '姓名\t性別\t出生年月日\t地址\t電話\n王大明\t男\t50/4/12\t屏東市…\t0912…'}"></textarea>
    <label class="btn ghost filebtn">${icon('up')}或選擇 Excel（.xlsx）／CSV 檔<input type="file" accept=".xlsx,.csv,.txt,.xls" data-import="${target}" hidden></label>
    <div id="pastePv" class="pastepv muted small">尚未貼上資料</div>
    <div class="row"><button class="btn ghost" data-cmd="sheetClose">取消</button><button class="btn pri" data-cmd="pasteDo" data-target="${target}" disabled>加入</button></div></div>`;
  m.hidden = false; setTimeout(() => $('#pasteBox').focus(), 50);
}
function pastePreview(target) {
  const rows = parsePaste($('#pasteBox').value, target), btn = $('[data-cmd=pasteDo]');
  $('#pastePv').innerHTML = rows.length ? `辨識到 <b>${rows.length}</b> 筆：${esc(rows.slice(0, 8).map(r => r.name + (r.role ? `（${r.role}）` : '')).join('、'))}${rows.length > 8 ? '…' : ''}` : '尚未辨識到姓名';
  btn.disabled = !rows.length; btn.textContent = rows.length ? `加入 ${rows.length} 筆` : '加入';
}

/* ===== 指令 ===== */
const CMDS = {
  menu() {
    const m = $('#sheet');
    m.innerHTML = `<div class="sbox menu"><h3>更多</h3>
      <div class="mset"><span class="msl"><b>${icon(isDesk() ? 'desk' : 'phone')}版面</b><small>目前是${isDesk() ? '電腦版' : '手機版'}${PREFS.layout === 'auto' ? '（依螢幕寬度自動切換）' : ''}</small></span>
        <span class="seg mseg" role="radiogroup" aria-label="版面">${Object.keys(LAYOUTS).map(k => `<button type="button" role="radio" aria-checked="${PREFS.layout === k}" class="${PREFS.layout === k ? 'on' : ''}" data-cmd="layout" data-v="${k}">${k === 'auto' ? '自動' : LAYOUTS[k]}</button>`).join('')}</span></div>
      <div class="mset"><span class="msl"><b>${icon('help')}操作提示</b><small>${tipsOn() ? '已開啟：滑鼠移到欄位或按鈕上會顯示說明' : '開啟後，滑鼠移到欄位或按鈕上會顯示說明與提醒'}</small></span>
        <button type="button" class="tgl" role="switch" aria-checked="${tipsOn()}" data-cmd="tips"><span></span><b>${tipsOn() ? '開' : '關'}</b></button></div>
      <button data-cmd="sample">${icon('doc')}<span><b>載入範例資料</b><small>看看填好的樣子（會覆蓋目前資料）</small></span></button>
      ${cloudReady() ? `<button data-cmd="cloud">${icon('cloud')}<span><b>雲端存檔（Google 帳號）</b><small>${cloudOn() ? `已連線${S.cloud.email ? '：' + esc(S.cloud.email) : ''}` : '登入後自動存到自己的雲端硬碟，換裝置也能接著填'}</small></span></button>` : ''}
      <button data-cmd="backup">${icon('dl')}<span><b>備份資料</b><small>下載 .json 檔，換裝置或交接時使用${(S.meta || {}).lastBackup ? `（上次 ${fmtTime(S.meta.lastBackup)}）` : ''}</small></span></button>
      ${canShareFiles() ? `<button data-cmd="share">${icon('up')}<span><b>分享備份檔</b><small>寄到自己的電子信箱、存到雲端硬碟或 LINE</small></span></button>` : ''}
      <button data-cmd="restore">${icon('up')}<span><b>還原資料</b><small>讀取之前備份的 .json 檔</small></span></button>
      <button data-cmd="sealOpen">${icon('stamp')}<span><b>電子印章與簽名</b><small>上傳印章、手寫簽名，文件自動核章</small></span></button>
      <button data-go="help">${icon('info')}<span><b>會務事項一覽表</b><small>報核、報備期限與法規依據</small></span></button>
      <button data-cmd="clear" class="danger">${icon('x')}<span><b>清除全部資料</b><small>清除這個瀏覽器裡的填寫內容</small></span></button>
      <p class="muted small">${cloudReady() ? '資料預設只存在這個瀏覽器；登入 Google 帳號後，會另存一份到您自己的雲端硬碟，本網站不會保存您的資料。' : '資料只存在這個瀏覽器，不會上傳。'}本網頁為協助填報的輔助工具，送件格式以主管機關規定為準。</p>
      <div class="row"><button class="btn ghost" data-cmd="sheetClose">關閉</button></div></div>`;
    m.hidden = false;
  },
  sheetClose() { $('#sheet').hidden = true; },
  layout(t) { $('#sheet').hidden = true; setLayout(t.dataset.v); },
  tips() { $('#sheet').hidden = true; setTips(!tipsOn()); },
  tipsOff() { setTips(false); },
  orgUndo() { orgUndo(); rerenderSection(); refreshLive(); renderSide(); toast('已復原成帶入前的資料'); },
  paste(t) { openPaste(t.dataset.target); },
  pasteDo(t) {
    const target = t.dataset.target, rows = parsePaste($('#pasteBox').value, target);
    if (target === 'people') rows.forEach(r => S.people.push({ role: r.role || '理事', name: r.name, gender: r.gender || '', birth: r.birth || '', job: r.job || '', idno: r.idno || '', addr: r.addr || '', phone: r.phone || '' }));
    else { const have = new Set(S.members.map(m => (m.name || '').trim())); rows.forEach(r => { if (!have.has(r.name)) S.members.push({ name: r.name, type: r.type || '個人會員', gender: r.gender || '', birth: r.birth || '', origin: r.origin || '', addr: r.addr || '', phone: r.phone || '', note: r.note || '' }); }); }
    save(); $('#sheet').hidden = true; rerenderSection(); toast(`已加入 ${rows.length} 筆`);
  },
  clearMembers: async () => { if (await ask(`確定清空會員名冊（${S.members.length} 筆）？`)) { S.members = []; save(); rerenderSection(); } },
  candFromPeople(t) {
    const mk = t.dataset.mk, el = M(mk).el || (M(mk).el = {});
    const mk2 = roles => names(roles).map(name => ({ name, votes: '' }));
    let n = 0;
    if (!(el.dirs || []).some(c => !isBlank(c.name))) { el.dirs = mk2([...DIR_ROLES, '候補理事']); n += el.dirs.length; }
    if (!(el.sups || []).some(c => !isBlank(c.name))) { el.sups = mk2([...SUP_ROLES, '候補監事']); n += el.sups.length; }
    save(); rerenderSection(); toast(n ? `已帶入 ${n} 位候選人，請輸入得票數` : '候選人名單已有資料，未變更');
  },
  applyElection(t) {
    const mk = t.dataset.mk, { dr, sr } = elOf(mk);
    if (!dr.all.length && !sr.all.length) { toast('請先輸入候選人與得票數', 'err'); return; }
    let add = 0, upd = 0;
    const put = (name, role, keep) => { const r = S.people.find(x => (x.name || '').trim() === name); if (r) { if (!keep.includes(r.role) && r.role !== role) { r.role = role; upd++; } } else { S.people.push({ role, name }); add++; } };
    dr.win.forEach(c => put(c.name, '理事', DIR_ROLES)); dr.alt.forEach(c => put(c.name, '候補理事', ['候補理事']));
    sr.win.forEach(c => put(c.name, '監事', SUP_ROLES)); sr.alt.forEach(c => put(c.name, '候補監事', ['候補監事']));
    const elected = new Set([...dr.win, ...dr.alt, ...sr.win, ...sr.alt].map(c => c.name));
    const out = S.people.filter(p => [...DIR_ROLES, ...SUP_ROLES, '候補理事', '候補監事'].includes(p.role) && !elected.has((p.name || '').trim()));
    save(); rerenderSection();
    toast(`人員名單已更新：新增 ${add} 人、變更職別 ${upd} 人。${out.length ? `另有 ${out.length} 位原理監事未當選，請到人員名單調整。` : ''}理事長、常務理監事請在選後理監事會選出後調整。`);
  },
  async sample() { $('#sheet').hidden = true; if (!(await ask('載入範例資料會覆蓋目前填寫的內容，建議先備份。確定載入？'))) return; const ui = { ...S.ui }, cl = S.cloud; S = sampleState(); S.ui = { ...S.ui, view: ui.view, scen: ui.scen, step: ui.step, large: ui.large }; S.cloud = cl; S.meta = { ...(S.meta || {}), sample: true }; save(); render(); toast(cloudOn() ? '已載入範例資料（範例資料不會上傳到雲端）' : '已載入範例資料'); },
  async backup() {
    $('#sheet').hidden = true;
    const seals = S.seals.length && await ask('備份檔要一併包含印章圖檔嗎？\n換裝置時需要；含印章的備份檔請妥善保管，不要交給他人。', { ok: '包含印章', no: '不含印章' });
    if (await saveFile(`${orgShort()}_會務填報備份_${isoToday()}.json`, await backupBlob(seals))) { S.meta.lastBackup = Date.now(); save({ keepTime: true }); if (S.ui.view === 'home') render(); }
  },
  async share() { $('#sheet').hidden = true; await shareBackup(); if (S.ui.view === 'home') render(); },
  cloud() {
    const m = $('#sheet'), on = cloudOn();
    m.innerHTML = `<div class="sbox cloudbox"><h3>${icon('cloud')}雲端存檔（Google 帳號）</h3>
      <p class="muted small">資料會存在<b>您自己的 Google 雲端硬碟</b>中，本網站專用、看不到其他檔案的空間；其他應用程式和本網站管理者都看不到。換手機或電腦時，登入同一個帳號就能接著填。上傳的附件不會同步，請另外保存。</p>
      ${on ? `<div class="cstat"><b>${esc(S.cloud.email || 'Google 帳號')}</b><small>${CLOUD.st === 'ok' ? `已同步（${fmtTime(CLOUD.at || S.meta.lastCloud)}）` : CLOUD.st === 'busy' ? '同步中…' : CLOUD.st === 'auth' ? '需要重新連線（為了安全，每次開啟網頁要點一下連線）' : CLOUD.st === 'err' ? '同步失敗：' + esc(CLOUD.err) : ''}</small></div>
        <label class="sw"><input type="checkbox" data-cloudseals="1"${S.cloud.seals ? ' checked' : ''}><span class="swt"></span>電子印章也存到雲端</label>
        <div class="row">${CLOUD.st === 'auth' ? `<button class="btn pri" data-cmd="cloudIn">${icon('cloud')}重新連線</button>` : `<button class="btn pri" data-cmd="cloudNow">${icon('check')}立即同步</button>`}<button class="btn ghost" data-cmd="cloudOut">登出</button></div>`
      : `<div class="row"><button class="btn pri gbtn" data-cmd="cloudIn"><span class="g">G</span>使用 Google 帳號登入</button></div>`}
      <div class="row"><button class="btn ghost" data-cmd="sheetClose">關閉</button></div></div>`;
    m.hidden = false;
  },
  cloudIn() { cloudSignIn(); },
  cloudNow() { cloudSync(true); },
  cloudOut() { cloudSignOut(); },
  merge() { mergedPdf(S.ui.scen); },
  sealOpen() { $('#sheet').hidden = true; sealOpen('lib'); },
  restore() { $('#sheet').hidden = true; $('#fileIn').click(); },
  async clear() {
    $('#sheet').hidden = true; if (!(await ask('確定清除全部填寫內容、印章與上傳的附件？此動作無法復原，建議先備份。'))) return;
    const large = S.ui.large, cl = S.cloud; S = blankState(); S.ui.large = large; S.cloud = cl;
    await IDBX.run('files', 'readwrite', st => st.clear()); await IDBX.run('img', 'readwrite', st => st.clear()); SEALC.clear(); FILEC.clear();
    save(); render(); toast('已清除');
  },
  /** 右上角「清除記憶」：清空這個網頁存在瀏覽器裡的所有資料（填寫內容、印章與簽名、上傳附件、版面與提示設定、雲端登入狀態） */
  async wipe() {
    $('#sheet').hidden = true;
    const cloudOn = !!(S.cloud && S.cloud.on);
    if (!(await ask(`確定清除記憶？\n會清空這個網頁存在這台裝置瀏覽器裡的所有資料：填寫內容、印章與簽名、上傳的附件、版面與提示設定。${cloudOn ? '\n也會登出雲端存檔；已存在您 Google 雲端硬碟的備份不會被刪除。' : ''}\n此動作無法復原，需要保留的資料請先用「⋯ → 備份資料」。`, { ok: '清除記憶' }))) return;
    const busy = showBusy('正在清除…'); WIPING = true; clearTimeout(saveTimer);
    try {
      try { await IDBX.run('files', 'readwrite', st => st.clear()); await IDBX.run('img', 'readwrite', st => st.clear()); } catch (e) { }
      try { await new Promise(res => { const rq = indexedDB.deleteDatabase('pt-assoc-seals'); rq.onsuccess = rq.onerror = rq.onblocked = () => res(); setTimeout(res, 1500); }); } catch (e) { }
      SEALC.clear(); FILEC.clear();
      try { Object.keys(localStorage).filter(k => k.startsWith('pt-')).forEach(k => localStorage.removeItem(k)); } catch (e) { }
      try { Object.keys(sessionStorage).filter(k => k.startsWith('pt-')).forEach(k => sessionStorage.removeItem(k)); } catch (e) { }
      try { if (window.caches) for (const k of await caches.keys()) await caches.delete(k); } catch (e) { }
    } finally { busy.done(); }
    location.reload();
  },
  pvOpen() { const list = pvDocs(S.ui.scen).length ? pvDocs(S.ui.scen) : selDocs(S.ui.scen).filter(x => x.kind !== 'attach' && !isUp(x)); if (list.length) openPreview(list.some(x => x.id === S.ui.pvDoc) ? S.ui.pvDoc : list[0].id); },
  pvClose() { closePreview(); },
  toPost() { const sc = S.ui.scen; S.batch = S.batch || {}; S.batch[sc] = { pre: false, post: true }; S.ui.step = 'docs'; save(); render(); window.scrollTo({ top: 0 }); toast('已切換到「② 會後：會議紀錄送件」'); },
  async ics(t) {
    const sc = t.dataset.scen, today = isoToday();
    const list = (sc ? deadlines(sc).map(x => ({ ...x, sc })) : allUpcoming(400)).filter(x => x.when && x.kind !== 'none' && daysBetween(today, x.when) >= 0);
    if (!list.length) { toast('目前沒有尚未到期的期限', 'err'); return; }
    const blob = new Blob([makeIcs(list)], { type: 'text/calendar' });
    await saveFile(`${orgShort()}_會務期限${sc ? '_' + SCEN[sc].title : ''}.ics`, blob);
  },
};
/* ===== 行事曆（.ics） ===== */
function icsEsc(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); }
function icsFold(line) {
  const enc = new TextEncoder(); const out = []; let cur = '', n = 0;
  for (const ch of line) { const b = enc.encode(ch).length; if (n + b > 73) { out.push(cur); cur = ' ' + ch; n = 1 + b; } else { cur += ch; n += b; } }
  out.push(cur); return out.join('\r\n');
}
function makeIcs(list) {
  const ymd = iso => iso.replace(/-/g, ''), stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const org = orgFull() || '本會';
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//pthg-assoc-forms//ZH-TW', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:' + icsEsc(org + ' 會務期限')];
  list.forEach((x, i) => {
    const title = x.kind === 'day' ? `${org}：${x.what}` : `【期限】${x.what}`;
    L.push('BEGIN:VEVENT', `UID:${ymd(x.when)}-${i}-${Math.abs([...x.what].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7))}@pthg-assoc-forms`, `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${ymd(x.when)}`, `DTEND;VALUE=DATE:${ymd(addDays(x.when, 1))}`, 'SUMMARY:' + icsEsc(title),
      'DESCRIPTION:' + icsEsc(`${SCEN[x.sc] ? SCEN[x.sc].title + '\n' : ''}${x.what}\n（由會務文件線上填報產生，期限以主管機關規定為準）`),
      'BEGIN:VALARM', 'TRIGGER:-P3D', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEsc('3天後：' + x.what), 'END:VALARM',
      'BEGIN:VALARM', 'TRIGGER:-PT15H', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEsc('明天：' + x.what), 'END:VALARM', 'END:VEVENT');
  });
  L.push('END:VCALENDAR');
  return L.map(icsFold).join('\r\n') + '\r\n';
}
$('#fileIn').addEventListener('change', async e => {
  const f = e.target.files[0]; if (!f) return;
  try {
    const data = JSON.parse(await f.text()); if (!data || !data.org) throw new Error('不是本系統的備份檔');
    const imgs = data.sealImgs || {}; delete data.sealImgs;
    S = merge(blankState(), data); if (S.meta) delete S.meta.sample;
    for (const [id, r] of Object.entries(imgs)) if (r && r.png) await SealDB.put(id, r);
    S.seals.forEach(s => sealCacheClear(s.id)); save(); render(); toast('已還原：' + f.name + (Object.keys(imgs).length ? `（含 ${Object.keys(imgs).length} 個印章）` : ''));
  }
  catch (err) { toast('無法讀取這個檔案：' + err.message, 'err'); }
  e.target.value = '';
});

/* ===== 局部重繪 ===== */
function rerenderSection() {
  if (S.ui.view !== 'scen' || S.ui.step !== 'fill') { render(); return; }
  const k = S.ui.open, sec = document.getElementById('sec-' + k.replace(/[:.]/g, '-')); if (!sec) { render(); return; }
  const sb = sec.querySelector('.sb'); if (!sb) { render(); return; }
  const y = window.scrollY;
  sb.innerHTML = k.startsWith('m:') ? meetSection(k.slice(2)) : SEC[k]();
  foldOptional(sec); refreshLive(); renderSide(); window.scrollTo({ top: y });
}
function listOp(act, path, i, tpl) {
  const arr = getp(S, path) || []; i = +i;
  if (act === 'add') { const item = tpl ? JSON.parse(tpl) : {}; arr.push(item); setp(S, path, arr); OPEN.add(`${path}.${arr.length - 1}`); }
  if (act === 'del') { arr.splice(i, 1); [...OPEN].forEach(k => { if (k.startsWith(path + '.')) OPEN.delete(k); }); }
  if (act === 'up' && i > 0) [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
  if (act === 'down' && i < arr.length - 1) [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
  save(); rerenderSection();
  if (act === 'add') { const el = document.querySelector(`[data-key="${path}.${arr.length - 1}"] input, [data-key="${path}.${arr.length - 1}"] select, [data-key="${path}.${arr.length - 1}"] textarea`); if (el) { el.focus({ preventScroll: true }); el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } else { const rows = $$(`[data-p^="${path}.${arr.length - 1}."]`); if (rows[0]) rows[0].focus(); } }
}

/* ===== 事件 ===== */
function onInput(e) {
  const el = e.target;
  if (el.id === 'pasteBox') { pastePreview($('[data-cmd=pasteDo]').dataset.target); return; }
  const p = el.dataset && el.dataset.p; if (!p) return;
  const val = el.type === 'checkbox' ? el.checked : el.value;
  setp(S, p, val);
  if (p.startsWith('ui.')) { save(); render(); return; }
  save();
  if (/^m\./.test(p)) refWatchSoon();
  if (el.dataset.rr) { render(); return; }
  refreshLive(); renderSide();
}
document.addEventListener('input', onInput);
document.addEventListener('change', e => { if (e.target.type === 'checkbox' && e.target.dataset.sel) return; if (e.target.matches('select[data-p], input[type=checkbox][data-p], input[type=date], input[type=time]')) onInput(e); });
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.sel) { const sc = S.ui.scen; setSel(sc, docsOf(sc).find(d => d.id === t.dataset.sel) || { id: t.dataset.sel }, t.checked); save(); t.closest('.docrow').classList.toggle('on', t.checked); const n = selDocs(sc).filter(x => x.kind !== 'attach').length; $('#dock .dk-t b').textContent = n; $('#steps').innerHTML = stepsBar(); }
  if (t.dataset.pvsel) { S.ui.pvDoc = t.value; save(); renderSide(); }
  if (t.dataset.cloudseals) { S.cloud.seals = t.checked; save({ keepTime: true, noCloud: true }); if (t.checked) cloudPush(); }
  if (t.dataset.pvopen) { openPreview(t.value); }
});
document.addEventListener('toggle', e => { const d = e.target; if (d.dataset && d.dataset.det) { if (d.open) OPEN.add(d.dataset.det); else OPEN.delete(d.dataset.det); } }, true);
document.addEventListener('click', async e => {
  const t = e.target.closest('button, a[data-go], [data-go]'); if (!t) return;
  const ds = t.dataset;
  if (t.id === 'back') { if ($('#pv').hidden === false) { closePreview(); return; } S.ui.view = 'home'; save(); render(); return; }
  if (t.id === 'fontBtn') { S.ui.large = !S.ui.large; save(); document.documentElement.classList.toggle('large', S.ui.large); t.setAttribute('aria-pressed', S.ui.large); return; }
  if (t.id === 'menuBtn') { CMDS.menu(); return; }
  if (t.id === 'wipeBtn') { CMDS.wipe(); return; }
  if (t.id === 'tipBtn') { setTips(!tipsOn()); return; }
  if (t.id === 'layBtn') { setLayout(isDesk() ? 'm' : 'd'); return; }
  if (t.id === 'cloudChip') { cloudChipClick(); return; }
  if (ds.go) { e.preventDefault(); $('#sheet').hidden = true; S.ui.view = ds.go === 'scen' ? 'scen' : ds.go; if (ds.scen) { if (S.ui.scen !== ds.scen) { S.ui.step = 'docs'; S.ui.open = ''; } S.ui.scen = ds.scen; } save(); render(); return; }
  if (ds.step) { S.ui.step = ds.step; save(); render(); return; }
  if (ds.mode) { e.preventDefault(); S.mode = S.mode || {}; S.mode[ds.id] = ds.mode; const sc = S.ui.scen; if (ds.mode === 'up') setSel(sc, docsOf(sc).find(d => d.id === ds.id) || { id: ds.id }, true); save(); render(); toast(ds.mode === 'up' ? '改為上傳檔案：可上傳 Excel、PDF、Word 或照片，系統會自動檢查（各選單共用）' : '改為線上填寫'); return; }
  if (ds.batch) { const sc = S.ui.scen, on = batchOn(sc); setBatch(sc, ds.batch, !on[ds.batch]); save(); render(); return; }
  if (ds.open) {
    const was = S.ui.open; S.ui.open = was === ds.open && t.classList.contains('sh') ? '' : ds.open; save(); renderFill();
    const el = document.getElementById('sec-' + ds.open.replace(/[:.]/g, '-')); if (el && S.ui.open) { const top = el.getBoundingClientRect().top + window.scrollY - (document.querySelector('.bar').offsetHeight + document.querySelector('#steps').offsetHeight + 8); window.scrollTo({ top, behavior: 'smooth' }); }
    return;
  }
  if (ds.toggle) { if (OPEN.has(ds.toggle)) OPEN.delete(ds.toggle); else OPEN.add(ds.toggle); rerenderSection(); return; }
  if (ds.act) { listOp(ds.act, ds.list, ds.i, ds.tpl); return; }
  if (ds.reset) { const v = getp(S, ds.reset); setp(S, ds.reset, ''); save(); rerenderSection(); return; }
  if (ds.setp) { setp(S, ds.setp, ds.val); save(); if (ds.rr || ds.setp.startsWith('ui.')) render(); else { t.parentElement.querySelectorAll('button').forEach(b => { b.classList.toggle('on', b === t); b.setAttribute('aria-checked', b === t); }); refreshLive(); renderSide(); } return; }
  if (ds.chip) { setp(S, ds.target, ds.chip); save(); const inp = document.querySelector(`[data-p="${ds.target}"]`); if (inp) inp.value = ds.chip; refreshLive(); renderSide(); return; }
  if (ds.fintab) { S.ui.finTab = ds.fintab; save(); rerenderSection(); return; }
  if (ds.cmd) { await CMDS[ds.cmd](t); return; }
  if (ds.pv) { openPreview(ds.pv); return; }
  if (ds.dl) {
    const sc = S.ui.scen, x = docById(sc, ds.dl); if (!x) return;
    t.disabled = true; await exportDoc(keyed(sc, x), ds.fmt, `${orgShort()}_${SCEN[sc].title}_${x.name}`); t.disabled = false; return;
  }
  if (ds.zip) {
    const sc = S.ui.scen, items = selDocs(sc).filter(x => (x.kind !== 'attach' && !isUp(x)) || upList(sc, x).length).map(x => ({ name: x.name, doc: x.kind === 'attach' || isUp(x) ? null : keyed(sc, x), files: upList(sc, x).length ? () => upBlobs(sc, x) : null }));
    items.push({ name: '送件檢核表', doc: docChecklist(sc) });
    t.disabled = true; await exportZip(items, ds.zip, `${orgShort()}_${SCEN[sc].title}_${batchLabel(sc)}_${FMT_NAME[ds.zip]}`); t.disabled = false; return;
  }
  if (ds.hb) {
    const sc = S.ui.scen, hbAll = selDocs(sc).filter(x => x.hb && (x.kind !== 'attach' || upList(sc, x).length)), hb = hbAll.filter(x => x.kind !== 'attach' && !isUp(x));
    if (ds.hb === 'pdf' && hbAll.some(x => upList(sc, x).length)) { t.disabled = true; await mergedPdf(sc, hbAll, `${orgShort()}_${SCEN[sc].title}_大會手冊.pdf`); t.disabled = false; return; }
    if (hbAll.length > hb.length) toast(`Word 版手冊不含上傳的檔案（${hbAll.filter(x => !hb.includes(x)).map(x => x.name).join('、')}），需要時請下載 PDF 版`);
    const doc = { title: '會員大會手冊', sheets: hb.flatMap(x => keyed(sc, x).sheets) };
    t.disabled = true; await exportDoc(doc, ds.hb, `${orgShort()}_${SCEN[sc].title}_大會手冊`); t.disabled = false; return;
  }
});
window.addEventListener('resize', () => { clearTimeout(window.__rz); window.__rz = setTimeout(() => { renderSide(); const p = $('#pv .pages'); if (p && !$('#pv').hidden) fitPages(p); }, 150); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (!$('#pv').hidden) closePreview(); else if (!$('#sheet').hidden) $('#sheet').hidden = true; } });

/* ===== 提示、忙碌、確認 ===== */
function toast(msg, kind) {
  const el = document.createElement('div'); el.className = 'toast' + (kind === 'err' ? ' err' : ''); el.textContent = msg; el.setAttribute('role', 'status');
  $('#toasts').appendChild(el); setTimeout(() => el.classList.add('out'), 4200); setTimeout(() => el.remove(), 4700);
}
function showBusy(msg) { const el = $('#busy'); el.querySelector('span').textContent = msg; el.hidden = false; return { set: m => el.querySelector('span').textContent = m, done: () => el.hidden = true }; }
function ask(msg, lab = {}) {
  return new Promise(res => {
    const m = $('#modal'); m.querySelector('p').textContent = msg; m.hidden = false;
    const ok = m.querySelector('.ok'), no = m.querySelector('.no');
    ok.textContent = lab.ok || '確定'; no.textContent = lab.no || '取消';
    const done = v => { m.hidden = true; ok.onclick = no.onclick = null; res(v); };
    ok.onclick = () => done(true); no.onclick = () => done(false);
  });
}

/* ===== 啟動 ===== */
applyLayout(); applyTips();
addEventListener('load', () => setTimeout(refitWide, 60));
addEventListener('pageshow', e => { if (e.persisted) refitWide(); });
if (!['home', 'scen', 'help'].includes(S.ui.view)) S.ui.view = 'home';
if (S.ui.view === 'scen' && !SCEN[S.ui.scen]) S.ui.view = 'home';
render();
dlNS();
sealsLoad();
cloudInit();
