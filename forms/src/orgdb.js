/* ===== 團體名冊：輸入關鍵字，從縣府人民團體名冊帶入團體名稱、會址、電話、理事長等資料（帶入後都可以修改） =====
   GitHub 網站讀取數位櫃檯的 data/directory.json（跟著名冊更新）；Claude 內的預覽版讀取同一份資料的精簡版 data/orgs.json。 */
const ORGDB = { rows: null, meta: null, loading: null, err: '' };
const ORGDB_URLS = ['../data/directory.json', 'data/orgs.json'];
const TOWNS = ['屏東市', '潮州鎮', '東港鎮', '恆春鎮', '萬丹鄉', '長治鄉', '麟洛鄉', '九如鄉', '里港鄉', '鹽埔鄉', '高樹鄉', '萬巒鄉', '內埔鄉', '竹田鄉', '新埤鄉', '枋寮鄉', '新園鄉', '崁頂鄉', '林邊鄉', '南州鄉', '佳冬鄉', '琉球鄉', '車城鄉', '滿州鄉', '枋山鄉', '三地門鄉', '霧臺鄉', '瑪家鄉', '泰武鄉', '來義鄉', '春日鄉', '獅子鄉', '牡丹鄉'];
const ONORM = s => String(s || '').normalize('NFKC').replace(/臺/g, '台').replace(/[\s　・·．.,，、()（）]/g, '').toLowerCase();
const OSTRIP = s => s.replace(/^社團法人/, '').replace(/^屏東縣/, '');
/** 名冊電話整理：7 碼補上 08、分機改成「轉」，例如 7237131-217 → 08-7237131轉217 */
function orgTel(t) {
  let s = String(t || '').trim().replace(/\s/g, ''); if (!s) return '';
  let ext = '', m = /(?:轉|#|分機|ext\.?)(\d+)$/i.exec(s);
  if (m) { ext = m[1]; s = s.slice(0, m.index); } else if ((m = /^(\d{7})-(\d{1,4})$/.exec(s))) { s = m[1]; ext = m[2]; }
  const d = s.replace(/[-()（）]/g, '');
  let out = s;
  if (/^\d{7}$/.test(d)) out = '08-' + d;
  else if (/^08\d{7}$/.test(d)) out = '08-' + d.slice(2);
  else if (/^09\d{8}$/.test(d)) out = d.slice(0, 4) + '-' + d.slice(4);
  else if (/^0[2-8]\d{7,8}$/.test(d)) out = d.slice(0, 2) + '-' + d.slice(2);
  return out + (ext ? '轉' + ext : '');
}
function orgPrep(x) {
  const tel = orgTel(x.tel), h = ONORM(x.n);
  let s = OSTRIP(h); const tw = TOWNS.map(ONORM).find(t => s.startsWith(t) && s.length > t.length + 1); if (tw) s = s.slice(tw.length);
  return { ...x, tel, _h: h, _s: s, _o: ONORM([x.p, x.a, x.d, x.c].filter(Boolean).join(' ')), _t: tel.replace(/\D/g, '') };
}
function orgdbLoad() {
  if (ORGDB.rows) return Promise.resolve(ORGDB.rows);
  if (ORGDB.loading) return ORGDB.loading;
  if (location.protocol === 'file:') { ORGDB.err = '直接開啟檔案時無法讀取團體名冊，請從網站開啟，或直接手動輸入'; return Promise.resolve(null); }
  ORGDB.loading = (async () => {
    for (const u of ORGDB_URLS) {
      try {
        const r = await fetch(u); if (!r.ok) continue;
        const d = await r.json(); if (!d || !Array.isArray(d.rows)) continue;
        ORGDB.meta = d.meta || {}; ORGDB.rows = d.rows.filter(x => x && x.n && x.s !== '已解散').map(orgPrep); ORGDB.err = '';
        return ORGDB.rows;
      } catch (e) { }
    }
    ORGDB.err = '目前無法讀取團體名冊，請直接手動輸入'; return null;
  })();
  ORGDB.loading.finally(() => { ORGDB.loading = null; });
  return ORGDB.loading;
}
/** 關鍵字搜尋：團體名稱優先，其次理事長、會址、鄉鎮、電話；多個關鍵字用空白分開 */
function orgSearch(q, lim = 8) {
  const rows = ORGDB.rows; if (!rows) return [];
  const toks = String(q || '').trim().split(/\s+/).map(t => OSTRIP(ONORM(t))).filter(Boolean);
  if (!toks.length || (toks.join('').length < 2)) return [];
  const out = [];
  for (const x of rows) {
    let sc = 0;
    for (const t of toks) {
      const dg = t.replace(/\D/g, '');
      if (x._s === t) sc += 40;
      else if (x._s.startsWith(t)) sc += 18;
      else if (x._h.includes(t)) sc += 12;
      else if (x._o.includes(t)) sc += 5;
      else if (dg.length >= 4 && x._t.includes(dg)) sc += 8;
      else { sc = -1; break; }
    }
    if (sc > 0) out.push([sc - x.n.length * 0.01 + (x.tel ? 0.3 : 0) + (x.a ? 0.3 : 0), x]);
  }
  return out.sort((a, b) => b[0] - a[0]).slice(0, lim).map(a => a[1]);
}
/** 「屏東縣潮州鎮○○協會」→ 縣市、鄉鎮、本名；「社團法人屏東縣○○公會」整個當本名 */
function orgSplit(full) {
  const n = String(full || '').trim();
  if (!n.startsWith('屏東縣')) return { county: '', town: '', name: n };
  let rest = n.slice(3), town = '';
  const rn = rest.replace(/臺/g, '台');
  for (const tw of TOWNS) { if (rn.startsWith(tw.replace(/臺/g, '台')) && rest.length > tw.length + 1) { town = rest.slice(0, tw.length); rest = rest.slice(tw.length); break; } }
  return { county: '屏東縣', town, name: rest };
}
function orgAddr(a) {
  let s = String(a || '').trim().replace(/^\d{3,6}\s*/, ''); if (!s) return '';
  if (!s.startsWith('屏東縣') && TOWNS.some(t => s.replace(/臺/g, '台').startsWith(t.replace(/臺/g, '台')))) s = '屏東縣' + s;
  return s;
}
const rocDate = v => { const p = parseDate(v); return p ? `${p.y}/${p.m}/${p.d}` : ''; };
function orgTerm(t) {
  const m = /第\s*(\d+)\s*屆[（(]\s*(\d{4}-\d{2}-\d{2})\s*[～~至-]\s*(\d{4}-\d{2}-\d{2})/.exec(t || ''); if (!m) return null;
  const days = daysBetween(m[2], m[3]);
  return { no: m[1], from: m[2], to: m[3], years: days ? String(Math.max(1, Math.round(days / 365.25))) : '' };
}
function orgTermWarn(x) {
  const tm = orgTerm(x.term); if (!tm) return '';
  const left = daysBetween(isoToday(), tm.to); if (left == null) return '';
  if (left < 0) return `名冊登記的第 ${tm.no} 屆任期已於 ${rd(tm.to)} 屆滿，應辦理改選（先開「選前理監事會」，再開「會員大會－改選」）；若已改選，請更正屆別。`;
  if (left <= 180) return `第 ${tm.no} 屆任期將於 ${rd(tm.to)} 屆滿（還有 ${left} 天），記得提前辦理改選。`;
  return '';
}

/* ---------- 帶入與復原 ---------- */
let ORG_FILLED = null;
const ORG_LABELS = { 'org.name': '團體名稱', 'org.address': '會址', 'org.phone': '辦公電話', 'org.contact': '聯絡人（理事長）', 'org.regWord': '立案字號', 'org.regDate': '立案日期', 'org.term': '目前屆別', 'org.termYears': '每屆任期', 'org.reelectDate': '上次改選日期' };
function orgApply(x) {
  const sp = orgSplit(x.n), tm = orgTerm(x.term), rg = /^(.*?)字第(.+?)號$/.exec(x.r || '');
  const patch = { 'org.county': sp.county, 'org.town': sp.town, 'org.name': sp.name };
  const put = (k, v) => { if (!isBlank(v)) patch[k] = String(v); };
  put('org.address', orgAddr(x.a)); put('org.phone', x.tel);
  if (x.p) { patch['org.contact'] = x.p; patch['org.contactTitle'] = '理事長'; }
  if (rg) { patch['org.regWord'] = rg[1]; patch['org.regNum'] = rg[2]; }
  put('org.regDate', rocDate(x.dt));
  if (tm) { put('org.term', tm.no); put('org.termYears', tm.years); put('org.reelectDate', rocDate(tm.from)); }
  /* 換成另一個團體：上一次從名冊帶入、使用者沒改過的欄位，新團體名冊裡沒有的就清空，不留上一個團體的資料 */
  const prev = S.org.dbFill && S.org.dbFill.vals ? S.org.dbFill : null;
  if (prev) for (const k in prev.vals) if (!(k in patch) && getp(S, k) === prev.vals[k]) patch[k] = '';
  const missing = ['org.address', 'org.phone', 'org.regWord', 'org.regDate'].filter(k => isBlank(patch[k])).map(k => ORG_LABELS[k]);
  const before = { 'org.dbFill': S.org.dbFill }; for (const k in patch) before[k] = getp(S, k);
  if (AC.name0 && AC.inp && AC.inp.dataset.p === 'org.name') Object.assign(before, AC.name0);   /* 復原時回到開始輸入關鍵字之前的名稱 */
  const peopleBefore = JSON.parse(JSON.stringify(S.people || []));
  for (const k in patch) setp(S, k, patch[k]);
  /* 理事長：名單裡沒有就加入；原本是上一次名冊帶入的，就換成新團體的理事長 */
  let chair = '', chairAdded = false; const ppl = S.people = S.people || [], row = ppl.find(r => r.role === '理事長' && !isBlank(r.name));
  if (x.p) {
    if (!row) { ppl.push({ role: '理事長', name: x.p, gender: '', birth: '', job: '', idno: '', addr: '', phone: '' }); chair = x.p; chairAdded = true; }
    else if (row.name === x.p) chair = x.p;
    else if (prev && prev.chair && row.name === prev.chair) { row.name = x.p; chair = x.p; chairAdded = true; }
  }
  const vals = {}; for (const k in patch) if (!isBlank(patch[k])) vals[k] = patch[k];
  S.org.dbFill = { n: x.n, vals, chair };
  ORG_FILLED = { x, before, peopleBefore, keys: Object.keys(patch).filter(k => ORG_LABELS[k] && !isBlank(patch[k])), chair: chairAdded, missing };
  AC.name0 = null; save();
}
function orgUndo() {
  if (!ORG_FILLED) return;
  for (const k in ORG_FILLED.before) { const v = ORG_FILLED.before[k]; if (k === 'org.dbFill') { if (v === undefined) delete S.org.dbFill; else S.org.dbFill = v; } else setp(S, k, v ?? ''); }
  S.people = ORG_FILLED.peopleBefore; ORG_FILLED = null; save();
}
/** 團體基本資料上方：帶入結果、復原、任期提醒 */
function orgFilledCard() {
  if (!ORG_FILLED) return '';
  const { x, keys, chair, missing } = ORG_FILLED, w = orgTermWarn(x);
  const labs = keys.map(k => ORG_LABELS[k]).concat(chair ? ['理事長（理監事名單）'] : []);
  return `<div class="acdone" role="status">${icon('check')}<div><b>已從縣府人民團體名冊帶入「${esc(x.n)}」</b><small>帶入：${labs.join('、')}。都可以直接修改。</small>${missing && missing.length ? `<small class="m">名冊沒有${missing.join('、')}，請自行填寫。</small>` : ''}${w ? `<small class="w">${icon('warn')}${esc(w)}</small>` : ''}</div><button type="button" class="mini" data-cmd="orgUndo">復原</button></div>`;
}

/* ---------- 下拉選單 ---------- */
const AC = { list: [], i: -1, inp: null, t: 0 };
function acBox(inp, make) {
  const host = inp.closest('.in') || inp.parentElement; let b = host.querySelector('.acbox');
  if (!b && make) { b = document.createElement('div'); b.className = 'acbox'; b.id = 'acbox'; b.setAttribute('role', 'listbox'); host.classList.add('ach'); host.appendChild(b); inp.setAttribute('aria-controls', 'acbox'); }
  return b;
}
function acShow(inp, html) { const b = acBox(inp, true); b.innerHTML = html; b.hidden = false; inp.setAttribute('aria-expanded', 'true'); }
function acClose(inp) { inp = inp || AC.inp; if (!inp) return; const b = acBox(inp); if (b) b.hidden = true; inp.setAttribute('aria-expanded', 'false'); inp.removeAttribute('aria-activedescendant'); AC.i = -1; }
function acHl(name, q) {
  const toks = String(q).trim().split(/\s+/).map(t => t.replace(/^社團法人/, '').replace(/^屏東縣/, '')).filter(t => t.length >= 1);
  let marks = []; for (const t of toks) { const i = name.indexOf(t); if (i >= 0) marks.push([i, i + t.length]); }
  if (!marks.length) return esc(name);
  marks = marks.sort((a, b) => a[0] - b[0]); let out = '', p = 0;
  for (const [a, b] of marks) { if (a < p) continue; out += esc(name.slice(p, a)) + '<mark>' + esc(name.slice(a, b)) + '</mark>'; p = b; }
  return out + esc(name.slice(p));
}
function acItem(x, i, q) {
  const tm = orgTerm(x.term), left = tm ? daysBetween(isoToday(), tm.to) : null;
  const sub = [x.d, x.p ? `理事長 ${x.p}` : '', x.tel].filter(Boolean).join('・');
  return `<div class="acitem" role="option" id="aci${i}" data-i="${i}" aria-selected="false"><b>${acHl(x.n, q)}</b><small>${esc(sub || '（名冊只有名稱）')}</small>${tm || x.c ? `<span class="acm">${x.c ? `<i>${esc(x.c)}</i>` : ''}${tm ? `<em class="${left < 0 ? 'late' : left <= 180 ? 'soon' : ''}">第${tm.no}屆・任期至 ${rd(tm.to)}${left < 0 ? '（已屆滿）' : ''}</em>` : ''}</span>` : ''}</div>`;
}
function acQuery(inp) {
  clearTimeout(AC.t);
  AC.t = setTimeout(async () => {
    const q = inp.value.trim();
    if (q.length < 2) return acClose(inp);
    if (!ORGDB.rows) {
      acShow(inp, `<div class="acmsg">${ORGDB.err ? esc(ORGDB.err) : '正在讀取縣府人民團體名冊…'}</div>`);
      await orgdbLoad();
      if (!ORGDB.rows) return acShow(inp, `<div class="acmsg">${esc(ORGDB.err)}</div>`);
      if (document.activeElement !== inp) return acClose(inp);
    }
    const res = orgSearch(inp.value.trim()); AC.list = res; AC.i = -1; AC.inp = inp;
    const src = `資料來源：屏東縣政府社會處人民團體名冊${ORGDB.meta && ORGDB.meta.updatedAt ? `（${String(ORGDB.meta.updatedAt).slice(0, 10)}）` : ''}`;
    if (!res.length) return q.length >= 3 ? acShow(inp, `<div class="acmsg">名冊裡找不到「${esc(q)}」。新成立或名冊沒有收錄的團體，請直接輸入。</div>`) : acClose(inp);
    acShow(inp, `<div class="achd">選擇團體，自動帶入會址、電話、理事長等資料</div>${res.map((x, i) => acItem(x, i, q)).join('')}<div class="acft">${src}・帶入後都可以修改</div>`);
  }, 140);
}
function acMove(d) {
  const b = AC.inp && acBox(AC.inp); if (!b || b.hidden || !AC.list.length) return;
  AC.i = (AC.i + d + AC.list.length) % AC.list.length;
  b.querySelectorAll('.acitem').forEach((el, i) => el.setAttribute('aria-selected', i === AC.i));
  const cur = b.querySelector(`#aci${AC.i}`); if (cur) { cur.scrollIntoView({ block: 'nearest' }); AC.inp.setAttribute('aria-activedescendant', cur.id); }
}
function acPick(i) {
  const x = AC.list[i], inp = AC.inp; if (!x || !inp) return;
  acClose(inp); orgApply(x);
  if (inp.dataset.p) { inp.value = S.org.name; rerenderSection(); refreshLive(); renderSide(); }
  else render({ keep: 1 });
  const w = orgTermWarn(x);
  toast(`已帶入「${x.n}」的資料，都可以直接修改${w ? '。' + w.split('；')[0] : ''}`);
}
document.addEventListener('input', e => { if (e.target.matches && e.target.matches('[data-acorg]')) { AC.inp = e.target; acQuery(e.target); } });
document.addEventListener('focusin', e => {
  if (!e.target.matches || !e.target.matches('[data-acorg]')) return;
  AC.inp = e.target; orgdbLoad();
  if (e.target.dataset.p === 'org.name') AC.name0 = { 'org.name': S.org.name, 'org.county': S.org.county, 'org.town': S.org.town };
});
document.addEventListener('focusout', e => { if (e.target.matches && e.target.matches('[data-acorg]')) setTimeout(() => { if (document.activeElement !== e.target) acClose(e.target); }, 120); });
document.addEventListener('keydown', e => {
  if (!e.target.matches || !e.target.matches('[data-acorg]')) return;
  const b = acBox(e.target); if (!b || b.hidden) return;
  if (e.key === 'ArrowDown') { e.preventDefault(); acMove(1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); acMove(-1); }
  else if (e.key === 'Enter' && AC.i >= 0) { e.preventDefault(); acPick(AC.i); }
  else if (e.key === 'Escape') { e.stopPropagation(); acClose(e.target); }
}, true);
/* 按下時就選（不讓輸入框先失去焦點而關閉選單） */
document.addEventListener('mousedown', e => { const it = e.target.closest && e.target.closest('.acitem'); if (it) { e.preventDefault(); acPick(+it.dataset.i); } });
/* 直接輸入「屏東縣○○協會」時，去掉開頭的縣市與鄉鎮，避免文件抬頭重複 */
document.addEventListener('change', e => {
  const t = e.target; if (!t.matches || !t.matches('[data-p="org.name"]')) return;
  const v = t.value.trim();
  for (const pre of [(S.org.county || '') + (S.org.town || ''), S.org.county || '']) {
    if (pre && v.startsWith(pre) && v.length > pre.length + 1) {
      setp(S, 'org.name', v.slice(pre.length)); t.value = S.org.name; save(); refreshLive();
      toast(`團體名稱已去掉開頭的「${pre}」，文件抬頭會自動加上`); return;
    }
  }
});
