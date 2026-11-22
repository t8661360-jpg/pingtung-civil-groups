/* ===== 工具 ===== */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const num = v => { const n = parseFloat(String(v ?? '').replace(/[,，\s]/g, '')); return isFinite(n) ? n : 0; };
const hasNum = v => String(v ?? '').trim() !== '' && isFinite(parseFloat(String(v).replace(/[,，\s]/g, '')));
const fmt = n => { n = Math.round(n || 0); return (n < 0 ? '-' : '') + Math.abs(n).toLocaleString('en-US'); };
const CNN = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
function cn(n) {
  n = parseInt(n, 10); if (!n || n < 0) return '';
  if (n <= 10) return CNN[n];
  if (n < 20) return '十' + (n % 10 ? CNN[n % 10] : '');
  if (n < 100) return CNN[Math.floor(n / 10)] + '十' + (n % 10 ? CNN[n % 10] : '');
  return String(n);
}
const FW = '　';
const O = (v, ph = '○○○') => (v === '' || v == null) ? ph : String(v);
const BL = (v, n = 2) => (v === '' || v == null) ? FW.repeat(n) : String(v);
const isBlank = v => v == null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && !v.length);
const pad2 = n => String(n).padStart(2, '0');
const uid = () => Math.random().toString(36).slice(2, 9);

/* ===== 日期（民國） ===== */
function isoToday() { const t = new Date(); return `${t.getFullYear()}-${pad2(t.getMonth() + 1)}-${pad2(t.getDate())}`; }
function parseDate(v) {
  if (!v) return null;
  if (typeof v === 'object') return (v.y && v.m && v.d) ? v : null;
  const s = String(v).trim();
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s);
  if (m) return { y: +m[1] - 1911, m: +m[2], d: +m[3] };
  m = /^(?:民國)?\s*(\d{2,4})\s*[\/.\-年]\s*(\d{1,2})\s*[\/.\-月]\s*(\d{1,2})\s*日?$/.exec(s);
  if (!m) m = /^(\d{2,3})(\d{2})(\d{2})$/.exec(s);
  if (!m) return null;
  let y = +m[1]; if (y > 1911) y -= 1911;
  if (+m[2] < 1 || +m[2] > 12 || +m[3] < 1 || +m[3] > 31) return null;
  return { y, m: +m[2], d: +m[3] };
}
function toIso(v) { const d = parseDate(v); return d ? `${d.y + 1911}-${pad2(d.m)}-${pad2(d.d)}` : ''; }
function addDays(v, n) {
  const d = parseDate(v); if (!d) return '';
  const dt = new Date(d.y + 1911, d.m - 1, d.d); dt.setDate(dt.getDate() + n);
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
}
function addYearsMinusDay(v, years) {
  const d = parseDate(v); if (!d) return '';
  const dt = new Date(d.y + 1911 + num(years), d.m - 1, d.d); dt.setDate(dt.getDate() - 1);
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
}
/** 115年3月7日；空白時以全形空白留位 */
function rd(v, blankY = 3) { const d = parseDate(v); return d ? `${d.y}年${d.m}月${d.d}日` : `${FW.repeat(blankY)}年${FW.repeat(2)}月${FW.repeat(2)}日`; }
function rdOr(v, alt = '') { return parseDate(v) ? rd(v) : alt; }
function rdDot(v) { const d = parseDate(v); return d ? `${d.y}.${pad2(d.m)}.${pad2(d.d)}` : ''; }
const WK = '日一二三四五六';
function weekday(v) { const d = parseDate(v); if (!d) return ''; return '星期' + WK[new Date(d.y + 1911, d.m - 1, d.d).getDay()]; }
function rocYear(v) { const d = parseDate(v); return d ? d.y : ''; }
function tm(t) {
  const m = /^(\d{1,2}):(\d{2})/.exec(t || ''); if (!m) return `${FW}午${FW}時${FW}分`;
  const h = +m[1], mi = +m[2];
  const ap = h < 12 ? '上午' : (h === 12 ? '中午' : '下午'); const hh = h > 12 ? h - 12 : (h === 0 ? 12 : h);
  return `${ap}${hh}時${mi ? mi + '分' : ''}`;
}
function daysBetween(a, b) { const x = parseDate(a), y = parseDate(b); if (!x || !y) return null; return Math.round((new Date(y.y + 1911, y.m - 1, y.d) - new Date(x.y + 1911, x.m - 1, x.d)) / 86400000); }

/* ===== 路徑存取 ===== */
function getp(o, path) { return path.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o); }
function setp(o, path, v) {
  const ks = path.split('.'); let a = o;
  for (let i = 0; i < ks.length - 1; i++) {
    if (a[ks[i]] == null || typeof a[ks[i]] !== 'object') a[ks[i]] = /^\d+$/.test(ks[i + 1]) ? [] : {};
    a = a[ks[i]];
  }
  a[ks[ks.length - 1]] = v;
}

/* ===== 狀態 ===== */
const LS_KEY = 'pt-assoc-forms-v2';
/* 這台裝置自己的偏好（版面、操作提示），不跟著備份或雲端同步 */
const PREF_KEY = 'pt-assoc-prefs';
const PREFS = (() => { const d = { layout: 'auto', tips: false }; try { return Object.assign(d, JSON.parse(localStorage.getItem(PREF_KEY) || '{}')); } catch (e) { return d; } })();
function setPref(k, v) { PREFS[k] = v; try { localStorage.setItem(PREF_KEY, JSON.stringify(PREFS)); } catch (e) { } }
const ROLES = ['理事長', '副理事長', '常務理事', '理事', '候補理事', '常務監事', '監事', '候補監事', '總幹事', '會計', '出納', '會務人員', '籌備會主任委員', '籌備委員', '發起人'];
const DIR_ROLES = ['理事長', '副理事長', '常務理事', '理事'];
const SUP_ROLES = ['常務監事', '監事'];
const STAFF_ROLES = ['總幹事', '會計', '出納', '會務人員'];
const PREP_ROLES = ['籌備會主任委員', '籌備委員', '發起人'];
const MEM_TYPES = ['個人會員', '團體會員', '贊助會員', '停權會員'];

function blankState() {
  return {
    v: 2,
    org: { county: '屏東縣', town: '', name: '', address: '', place: '', phone: '', mobile: '', fax: '', email: '', web: '', contact: '', contactTitle: '',
      docWord: '', term: '', termYears: '', regDate: '', regWord: '', regNum: '', courtDate: '', courtNo: '', corp: '',
      dirSeats: '', supSeats: '', dirAlt: '', supAlt: '', stdDirSeats: '', memberCount: '', groupCount: '' },
    people: [],
    members: [],
    fin: { year: '', budgetYear: '', end: '', names: {}, v: {}, prev: '', cashPrev: '', hideZero: false, prop: [], bs: {}, fund: {} },
    plan: { rows: [], method: '' },
    amend: { rows: [] },
    statute: {},
    m: {},
    x: { ledger: { rows: [] }, prepfin: { inc: [], exp: [] }, handover: {}, consent: {}, cert: {}, ballot: {}, proxy: {}, recruit: {}, report: {}, seal: {}, resign: {}, reissue: {}, check: {} },
    sel: {},
    batch: {},
    mode: {},
    seals: [],
    stamp: { on: true, docs: {} },
    files: {},
    meta: {},
    cloud: { on: false },
    ui: { view: 'home', scen: '', step: 'docs', open: '', large: false, prepVar: 'p1', boardAddr: false, finTab: 'acc', pvDoc: '' }
  };
}
function merge(base, add) {
  if (add == null) return base;
  if (Array.isArray(base)) return Array.isArray(add) ? add : base;
  if (base && typeof base === 'object') {
    const o = { ...base };
    for (const k of Object.keys(add)) o[k] = (k in base && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) ? merge(base[k], add[k]) : add[k];
    return o;
  }
  return add;
}
let S = blankState();
try { const raw = localStorage.getItem(LS_KEY); if (raw) S = merge(blankState(), JSON.parse(raw)); } catch (e) { }
let saveTimer = null;
/** 只比對填寫內容（不含畫面狀態），內容有變才更新時間並同步雲端 */
const dataSig = () => { const { ui, meta, cloud, ...d } = S; return JSON.stringify(d); };
let lastSig = dataSig();
function save(o = {}) {
  S.meta = S.meta || {};
  const sig = dataSig(), changed = sig !== lastSig;
  if (changed) { lastSig = sig; if (!o.keepTime) S.meta.savedAt = Date.now(); }
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { try { localStorage.setItem(LS_KEY, JSON.stringify(S)); const el = $('#saved'); if (el) { el.textContent = '已自動儲存'; el.classList.add('on'); clearTimeout(save.t); save.t = setTimeout(() => el.classList.remove('on'), 1600); } } catch (e) { } }, 250);
  if (changed && !o.noCloud && typeof cloudOnSave === 'function') cloudOnSave();
}

/* ===== 人員與會員 ===== */
function peopleSorted() {
  return S.people.map((r, i) => ({ ...r, _i: i })).filter(r => !isBlank(r.name) || !isBlank(r.role))
    .sort((a, b) => { const ia = ROLES.indexOf(a.role), ib = ROLES.indexOf(b.role); return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a._i - b._i; });
}
function person(role) { return peopleSorted().find(r => r.role === role && !isBlank(r.name)); }
function pname(role) { const p = person(role); return p ? p.name.trim() : ''; }
function names(roles) { return peopleSorted().filter(r => roles.includes(r.role) && !isBlank(r.name)).map(r => r.name.trim()); }
function chairName() { return pname('理事長'); }
function prepChair() { return pname('籌備會主任委員'); }
const isVoter = m => !['贊助會員', '停權會員'].includes(m.type || '個人會員');
function membersNamed() { return S.members.filter(m => !isBlank(m.name)); }
function voterCount() { return membersNamed().filter(isVoter).length; }
function memberStats() {
  const ms = membersNamed(), c = t => ms.filter(m => (m.type || '個人會員') === t).length;
  return { total: ms.length, person: c('個人會員'), group: c('團體會員'), sponsor: c('贊助會員'), suspended: c('停權會員'), voters: ms.filter(isVoter).length };
}

/* ===== 團體名稱 ===== */
function orgFull() { const o = S.org; return (o.county || '') + (o.town || '') + (o.name || '○○協會'); }
function orgShort() { return (S.org.name || '團體').replace(/[\\/:*?"<>|]/g, ''); }
function docWord() { return S.org.docWord || '屏縣○○'; }
function docNo(no) { return `${docWord()}字第${no || FW.repeat(5)}號`; }

/* ===== 連動：留白就自動帶入 ===== */
const DER = [];   // [regex, fn(match, path)]
function derive(path) {
  for (const [re, fn] of DER) { const m = re.exec(path); if (m) { try { const v = fn(m, path); return v == null ? '' : v; } catch (e) { return ''; } } }
  return '';
}
function hasDerive(path) { return DER.some(([re]) => re.test(path)); }
function raw(path) { const v = getp(S, path); return v == null ? '' : v; }
function V(path) { const v = getp(S, path); if (!isBlank(v) && v !== false) return v; return derive(path); }

DER.push(
  [/^org\.place$/, () => S.org.address],
  [/^org\.contact$/, () => pname('總幹事')],
  [/^org\.contactTitle$/, () => pname('總幹事') && !S.org.contact ? '總幹事' : ''],
  [/^org\.termYears$/, () => '4'],
  [/^org\.dirSeats$/, () => { const n = names(DIR_ROLES).length; return n ? String(n) : ''; }],
  [/^org\.supSeats$/, () => { const n = names(SUP_ROLES).length; return n ? String(n) : ''; }],
  [/^org\.dirAlt$/, () => { const n = names(['候補理事']).length; return n ? String(n) : ''; }],
  [/^org\.supAlt$/, () => { const n = names(['候補監事']).length; return n ? String(n) : ''; }],
  [/^org\.memberCount$/, () => { const s = memberStats(); return s.person ? String(s.person) : ''; }],
  [/^org\.groupCount$/, () => { const s = memberStats(); return s.group ? String(s.group) : ''; }],
  [/^fin\.budgetYear$/, () => hasNum(V('fin.year')) ? String(num(V('fin.year')) + 1) : ''],
  [/^fin\.year$/, () => { const d = scenMainDate(); const y = rocYear(d) || rocYear(isoToday()); return y ? String(y - 1) : ''; }],
  [/^fin\.cashPrev$/, () => S.fin.prev],
  [/^fin\.fund\.add$/, () => { const v = accVal(ACC_BY.e12, 'a'); return v ? String(v) : ''; }],
);
const Y = () => V('fin.year');
const BY = () => V('fin.budgetYear');
/** 目前情境的主要會議日期（推算年度用） */
function scenMainDate() {
  const sc = S.ui.scen; if (!sc || typeof SCEN === 'undefined' || !SCEN[sc]) return '';
  const keys = SCEN[sc].meets(); if (MEET[keys[0]] && MEET[keys[0]].before) keys.push(MEET[keys[0]].before);
  for (const k of keys) { const d = getp(S, `m.${k}.date`); if (d) return d; }
  return '';
}

/* ===== 驗證 ===== */
function checkTwId(id) {
  id = String(id || '').trim().toUpperCase(); if (!id) return true;
  if (!/^[A-Z][1289A-D]\d{8}$/.test(id)) return false;
  const L = 'ABCDEFGHJKLMNPQRSTUVXYWZIO', n = L.indexOf(id[0]) + 10;
  const d2 = /[A-D]/.test(id[1]) ? (id.charCodeAt(1) - 65) % 10 : +id[1];
  const ds = [Math.floor(n / 10), n % 10, d2, ...id.slice(2).split('').map(Number)];
  const w = [1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1];
  return ds.reduce((s, x, i) => s + x * w[i], 0) % 10 === 0;
}
