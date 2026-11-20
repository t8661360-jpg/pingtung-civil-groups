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
const isBlank = v => v == null || (typeof v === 'string' && v.trim() === '');
function rd(d, n = 2) { d = d || {}; return `${BL(d.y, n)}年${BL(d.m, 1)}月${BL(d.d, 1)}日`; }
function rdOrBlank(d) { d = d || {}; return (!d.y && !d.m && !d.d) ? '' : rd(d); }
function rt(t) { t = t || {}; return `${t.ap || FW}午${BL(t.h, 1)}時${BL(t.mi, 1)}分`; }
function dateEmpty(d) { return !d || (isBlank(d.y) && isBlank(d.m) && isBlank(d.d)); }
function rocAddYearsMinusDay(d, years) {
  if (!d || !hasNum(d.y) || !hasNum(d.m) || !hasNum(d.d)) return null;
  const dt = new Date(num(d.y) + 1911 + num(years), num(d.m) - 1, num(d.d));
  dt.setDate(dt.getDate() - 1);
  return { y: String(dt.getFullYear() - 1911), m: String(dt.getMonth() + 1), d: String(dt.getDate()) };
}
function todayRoc() { const t = new Date(); return { y: String(t.getFullYear() - 1911), m: String(t.getMonth() + 1), d: String(t.getDate()) }; }

function getp(o, path) { return path.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o); }
function setp(o, path, v) {
  const ks = path.split('.'); let a = o;
  for (let i = 0; i < ks.length - 1; i++) {
    if (a[ks[i]] == null || typeof a[ks[i]] !== 'object') a[ks[i]] = /^\d+$/.test(ks[i + 1]) ? [] : {};
    a = a[ks[i]];
  }
  a[ks[ks.length - 1]] = v;
}
function isEmptyVal(v) {
  if (v == null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (typeof v === 'object' && !Array.isArray(v)) {
    if ('y' in v || 'm' in v || 'd' in v) return dateEmpty(v);
    return Object.keys(v).length === 0;
  }
  return false;
}

/* ===== 狀態 ===== */
const LS_KEY = 'rt-forms-v1';
const ROLES = ['理事長', '常務理事', '理事', '候補理事', '常務監事', '監事', '候補監事', '總幹事', '會計', '出納', '會務人員'];
const DIR_ROLES = ['理事長', '常務理事', '理事'];
const SUP_ROLES = ['常務監事', '監事'];

function blankState() {
  return {
    basic: { county: '屏東縣', town: '', org: '', term: '', year: '', budgetYear: '', termYears: '4',
      regDate: {}, regWord: '', regNum: '', courtDate: {}, courtNo: '', reelectDate: {},
      membersGroup: '', membersPerson: '', address: '', phone: '', fax: '', web: '', email: '', fillDate: {} },
    roster: [],
    assembly: { term: '', no: '', date: {}, time: {}, place: '', should: '', attend: '', leave: '', absent: '', obs: '',
      chair: '', rec: '', speech: '', report: '', refTerm: '', refNo: '',
      fin: { on: true }, plan: { on: true }, bud: { on: true }, props: [], motions: [],
      hasEl: true, el: { jp: '', fp: '', cp: '', jip: '', dirSeats: '', dirAlt: '', supSeats: '', supAlt: '', dirs: [], sups: [] },
      end: {} },
    board: { term: '', no: '', date: {}, time: {}, place: '', dirs: '', sups: '', obs: '', chair: '', rec: '',
      electTerm: '', stdDir: '', stdSup: '', stdSupVotes: '', chairman: '', chairVotes: '',
      addr: { on: true }, staff: { on: true }, props: [], motion: '', end: {} },
    cert: { name: '', birthplace: '', birth: {}, addr: '', phone: '', org: '', term: '', firstDate: {}, tenure: '', note: '' },
    consent: { loc: '', landNo: '', ping: '', sqm: '', from: {}, to: {}, lender: '', witness: '', chairman: '', date: {} },
    statute: { boardDate: {}, boardTerm: '', boardNo: '', asmDate: {}, asmTerm: '', asmNo: '', rows: [] },
    plan: { year: '', rows: [], method: '', refTerm: '', refNo: '' },
    fin: { names: {}, v: {}, prev: '', cashPrev: '', hideZero: false, prop: [], bs: {}, fund: {}, sel: { bud: true, act: true, prop: true, bs: true, fund: true } },
    letter: { addr: '', contact: '', phone: '', to: '', date: {}, no: '', speed: '', secret: '', att: '', subject: '', d1: '', d2: '', d3: '', main: '', cc: '', atts: {} },
    ui: { page: 'basic', finTab: 'acc' }
  };
}
function merge(base, add) {
  if (add == null) return base;
  if (Array.isArray(base)) return Array.isArray(add) ? add : base;
  if (typeof base === 'object') {
    const o = { ...base };
    for (const k of Object.keys(add)) o[k] = (k in base && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) ? merge(base[k], add[k]) : add[k];
    return o;
  }
  return add;
}
let S = blankState();
try { const raw = localStorage.getItem(LS_KEY); if (raw) S = merge(blankState(), JSON.parse(raw)); } catch (e) { }
let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { try { localStorage.setItem(LS_KEY, JSON.stringify(S)); flashSaved(); } catch (e) { } }, 300);
}
function flashSaved() { const el = $('#saved'); if (!el) return; el.textContent = '已自動儲存於此瀏覽器 ' + new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }); }

/* ===== 連動（衍生預設值） ===== */
const D = {};
function V(path) { const v = getp(S, path); if (!isEmptyVal(v)) return v; const d = D[path]; if (d) { try { const r = d(); return r == null ? '' : r; } catch (e) { return ''; } } return v ?? ''; }

function rosterSorted() {
  return S.roster.map((r, i) => ({ ...r, _i: i }))
    .sort((a, b) => { const ia = ROLES.indexOf(a.role), ib = ROLES.indexOf(b.role); return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a._i - b._i; });
}
function person(role) { return rosterSorted().find(r => r.role === role && !isBlank(r.name)); }
function pname(role) { const p = person(role); return p ? p.name : ''; }
function names(roles) { return rosterSorted().filter(r => roles.includes(r.role) && !isBlank(r.name)).map(r => r.name); }
function orgFull() { return (V('basic.county') || '') + (S.basic.town || '') + (S.basic.org || '○○協會'); }
function orgShort() { return (S.basic.org || '團體') ; }
const Y = () => V('basic.year');
const BY = () => V('basic.budgetYear');

Object.assign(D, {
  'basic.budgetYear': () => hasNum(S.basic.year) ? String(num(S.basic.year) + 1) : '',
  'basic.fillDate': () => todayRoc(),
  'basic.membersTotal': () => '',
  'assembly.term': () => S.basic.term,
  'assembly.no': () => '1',
  'assembly.should': () => (hasNum(S.basic.membersPerson) || hasNum(S.basic.membersGroup)) ? String(num(S.basic.membersPerson) + num(S.basic.membersGroup)) : '',
  'assembly.absent': () => { const s = V('assembly.should'), a = S.assembly.attend; if (!hasNum(s) || !hasNum(a)) return ''; return String(Math.max(0, num(s) - num(a) - num(S.assembly.leave))); },
  'assembly.chair': () => pname('理事長'),
  'assembly.rec': () => pname('總幹事'),
  'assembly.refTerm': () => S.basic.term,
  'assembly.fin.reason': () => `請審議${O(Y(), '○')}年度經費收支決算案含財產目錄及資產負債表`,
  'assembly.fin.desc': () => `${O(Y(), '○')}年度經費收支決算表、財產目錄及資產負債表業經第${O(cn(V('assembly.refTerm')), '○')}屆第${O(cn(S.assembly.refNo), '○')}次理（監）事會審議通過。`,
  'assembly.fin.method': () => `${O(Y(), '○')}年度經費收支決算書經會員大會審議通過，報請主管機關核備後實施。`,
  'assembly.plan.reason': () => `請審議${O(BY(), '○')}年度工作計畫案`,
  'assembly.plan.desc': () => `${O(BY(), '○')}年度工作計畫業經第${O(cn(V('assembly.refTerm')), '○')}屆第${O(cn(S.assembly.refNo), '○')}次理（監）事會審議通過。`,
  'assembly.plan.method': () => `${O(BY(), '○')}年度工作計畫經會員大會審議通過，報請主管機關核備後實施。`,
  'assembly.bud.reason': () => `請審議${O(BY(), '○')}年度經費收支預算案`,
  'assembly.bud.desc': () => `${O(BY(), '○')}年度經費收支預算書業經第${O(cn(V('assembly.refTerm')), '○')}屆第${O(cn(S.assembly.refNo), '○')}次理（監）事會審議通過。`,
  'assembly.bud.method': () => `${O(BY(), '○')}年度經費收支預算書經會員大會審議通過，報請主管機關核備後實施。`,
  'assembly.fin.proposer': () => '理事會', 'assembly.plan.proposer': () => '理事會', 'assembly.bud.proposer': () => '理事會',
  'assembly.fin.res': () => '照案通過。', 'assembly.plan.res': () => '照案通過。', 'assembly.bud.res': () => '照案通過。',
  'assembly.el.dirSeats': () => { const n = names(DIR_ROLES).length; return n ? String(n) : ''; },
  'assembly.el.dirAlt': () => { const n = names(['候補理事']).length; return n ? String(n) : ''; },
  'assembly.el.supSeats': () => { const n = names(SUP_ROLES).length; return n ? String(n) : ''; },
  'assembly.el.supAlt': () => { const n = names(['候補監事']).length; return n ? String(n) : ''; },
  'board.term': () => S.basic.term,
  'board.no': () => '1',
  'board.date': () => dateEmpty(S.assembly.date) ? null : S.assembly.date,
  'board.place': () => S.assembly.place,
  'board.dirs': () => names(DIR_ROLES).join('、'),
  'board.sups': () => names(SUP_ROLES).join('、'),
  'board.chair': () => pname('理事長'),
  'board.rec': () => pname('總幹事'),
  'board.electTerm': () => S.basic.term,
  'board.stdDir': () => names(['常務理事']).join('、'),
  'board.stdSup': () => names(['常務監事']).join('、'),
  'board.chairman': () => pname('理事長'),
  'board.addr.reason': () => '決定本會會址處所案。',
  'board.addr.desc': () => '取得使用權證明（例如租約、使用同意書）。',
  'board.addr.res': () => S.basic.address ? `本會會址設於${S.basic.address}，照案通過。` : '',
  'board.staff.reason': () => '聘任本會總幹事等工作人員案。',
  'board.staff.desc': () => '工作人員不得由選任之職員擔任。',
  'board.staff.res': () => {
    const parts = [];
    for (const role of ['總幹事', '會計', '出納', '會務人員']) { const ns = names([role]); if (ns.length) parts.push(`${ns.join('、')}為${role}`); }
    return parts.length ? `聘任${parts.join('，')}，照案通過。` : '';
  },
  'cert.name': () => pname('理事長'),
  'cert.birth': () => { const p = person('理事長'); return p && !dateEmpty(p.birth) ? p.birth : null; },
  'cert.addr': () => (person('理事長') || {}).addr || '',
  'cert.phone': () => (person('理事長') || {}).phone || '',
  'cert.org': () => orgFull(),
  'cert.term': () => S.basic.term,
  'cert.firstDate': () => { const d = V('board.date'); return dateEmpty(d) ? null : d; },
  'cert.tenure': () => { const f = V('cert.firstDate'); const t = rocAddYearsMinusDay(f, V('basic.termYears') || 4); return t ? `${rd(f)}起至${rd(t)}止` : ''; },
  'consent.loc': () => S.basic.address,
  'consent.sqm': () => hasNum(S.consent.ping) ? (num(S.consent.ping) * 3.305785).toFixed(2) : '',
  'consent.ping': () => hasNum(S.consent.sqm) ? (num(S.consent.sqm) / 3.305785).toFixed(2) : '',
  'consent.to': () => rocAddYearsMinusDay(S.consent.from, V('basic.termYears') || 4),
  'consent.chairman': () => pname('理事長'),
  'consent.date': () => dateEmpty(S.consent.from) ? V('basic.fillDate') : S.consent.from,
  'statute.boardTerm': () => S.basic.term,
  'statute.asmDate': () => dateEmpty(S.assembly.date) ? null : S.assembly.date,
  'statute.asmTerm': () => V('assembly.term'),
  'statute.asmNo': () => V('assembly.no'),
  'plan.year': () => BY(),
  'plan.method': () => '定期召開會員大會及理、監事會，按計畫進度辦理各項活動，並配合上級政府之政策，達成本會設立宗旨及發展目標。',
  'plan.refTerm': () => S.basic.term,
  'plan.refNo': () => S.assembly.refNo,
  'fin.cashPrev': () => S.fin.prev,
  'fin.fund.add': () => { const v = accVal(ACC_BY.e12, 'a'); return v ? String(v) : ''; },
});

/* ===== 會計科目 ===== */
const ACC = [
  { k: 'inc', name: '收入總計', kids: [
    { k: 'i1', name: '入會費' }, { k: 'i2', name: '常年會費' }, { k: 'i3', name: '事業費' }, { k: 'i4', name: '會員捐款' },
    { k: 'i5', name: '補助收入', kids: [{ k: 'i51', name: '政府補助收入' }, { k: 'i52', name: '其他補助收入' }] },
    { k: 'i6', name: '委託收益' }, { k: 'i7', name: '會員服務收入' }, { k: 'i8', name: '專案計劃收入' }, { k: 'i9', name: '其他收入' }] },
  { k: 'exp', name: '支出總計', kids: [
    { k: 'e1', name: '人事費', kids: ['員工薪給', '兼職人員車馬費', '保險補助費', '年終成績考核獎金', '不休假獎金', '其他人事費'].map((n, i) => ({ k: 'e1_' + (i + 1), name: n })) },
    { k: 'e2', name: '辦公費', kids: ['文具、書報、雜誌費', '印刷費', '水電燃料費', '旅運費', '郵電費', '大樓管理費', '加班值班費', '租賦費', '修繕維護費', '財產保險費', '公共關係費', '人事查核費', '其他辦公費'].map((n, i) => ({ k: 'e2_' + (i + 1), name: n })) },
    { k: 'e3', name: '業務費', kids: ['會議費', '聯誼活動費', '業務推展費', '展覽費', '考察觀摩費', '會刊（訊）編印費', '調查統計費', '接受委託業務費', '內部作業組織業務費', '研究發展費', '社會服務費', '其他業務費'].map((n, i) => ({ k: 'e3_' + (i + 1), name: n })) },
    ...['購置費', '折舊', '繳納上級團體會費', '繳納其他團體會費', '捐助費', '專案計畫支出', '雜費支出', '預備金', '提撥基金'].map((n, i) => ({ k: 'e' + (i + 4), name: n }))] }
];
const ACC_FLAT = []; (function walk(list, lvl, parent) { list.forEach((a, i) => { a.lvl = lvl; a.idx = i + 1; a.parent = parent; ACC_FLAT.push(a); if (a.kids) walk(a.kids, lvl + 1, a); }); })(ACC, 0, null);
const ACC_BY = Object.fromEntries(ACC_FLAT.map(a => [a.k, a]));
const accName = a => (!isBlank(S.fin.names[a.k]) ? S.fin.names[a.k] : a.name);
function accVal(a, col) { if (a.kids) return a.kids.reduce((s, c) => s + accVal(c, col), 0); return num((S.fin.v[a.k] || {})[col]); }
function accZero(a) { return ['b', 'pb', 'a'].every(c => accVal(a, c) === 0); }
const finSurplus = col => accVal(ACC_BY.inc, col) - accVal(ACC_BY.exp, col);

/* 財產目錄 → 資產負債表 */
const BS_LEFT = [
  { k: 'L_cur', name: '流動資產小計', kids: ['庫存現金', '銀行存款', '定期存款', '有價證券', '應收票據', '應收款項', '預付款項'] },
  { k: 'L_fix', name: '固定資產小計', kids: ['土地', '房屋及建築', '事務器械設備', '儀器設備', '交通運輸設備', '雜項設備'] },
  { k: 'L_oth', name: '其他資產小計', kids: ['基金', '存出保證金', '雜項資產'] },
];
const BS_RIGHT_L = [
  { k: 'R_cur', name: '流動負債小計', kids: ['短期借款', '應付票據', '應付款項', '代收款項', '預收款項'] },
  { k: 'R_long', name: '長期負債小計', kids: ['長期借款'] },
  { k: 'R_oth', name: '其他負債小計', kids: ['存入保證金', '雜項負債'] },
];
const BS_RIGHT_E = [
  { k: 'R_cap', name: '投入資本小計', kids: ['投入資本'] },
  { k: 'R_fund', name: '基金小計', kids: ['資產基金', '提撥基金'] },
  { k: 'R_sur', name: '累計餘絀小計', kids: ['本期餘絀', '上期餘絀'] },
];
const PROP_CATS = ['土地', '房屋及建築', '事務器械設備', '儀器設備', '交通運輸設備', '雜項設備', '雜項資產'];
function propSum(cat) { let cur = ''; let s = 0; for (const r of S.fin.prop) { if (!isBlank(r.cat)) cur = r.cat.trim(); if (!cat || cur === cat) s += num(r.amt); } return s; }
function fundIn() { return num(S.fin.fund.acc) + num(S.fin.fund.int) + (hasNum(S.fin.fund.add) ? num(S.fin.fund.add) : accVal(ACC_BY.e12, 'a')); }
function fundOut() { return num(S.fin.fund.o1) + num(S.fin.fund.o2) + num(S.fin.fund.o3) + num(S.fin.fund.o4); }
function bsDerived(name) {
  if (['土地', '房屋及建築', '事務器械設備', '儀器設備', '交通運輸設備', '雜項設備', '雜項資產'].includes(name)) { const s = propSum(name); return s ? s : null; }
  if (name === '基金' || name === '提撥基金') { const s = fundIn() - fundOut(); return s ? s : null; }
  if (name === '本期餘絀') return finSurplus('a');
  if (name === '上期餘絀') return hasNum(S.fin.prev) ? num(S.fin.prev) : null;
  if (name === '資產基金') { const s = bsGroupSum(BS_LEFT[1]) + bsVal('雜項資產') + bsVal('存出保證金'); return s ? s : null; }
  return null;
}
function bsVal(name) { const raw = S.fin.bs[name]; if (hasNum(raw)) return num(raw); const d = bsDerived(name); return d == null ? 0 : d; }
function bsGroupSum(g) { return g.kids.reduce((s, n) => s + bsVal(n), 0); }
const bsAssets = () => BS_LEFT.reduce((s, g) => s + bsGroupSum(g), 0);
const bsLiab = () => BS_RIGHT_L.reduce((s, g) => s + bsGroupSum(g), 0);
const bsEquity = () => BS_RIGHT_E.reduce((s, g) => s + bsGroupSum(g), 0);
function cashPrev() { return hasNum(S.fin.cashPrev) ? num(S.fin.cashPrev) : num(S.fin.prev); }
function cashEnd() { return cashPrev() + accVal(ACC_BY.inc, 'a') - accVal(ACC_BY.exp, 'a'); }

/* 選舉結果 */
function elResult(list, seats, alt) {
  const c = (list || []).filter(r => !isBlank(r.name)).map((r, i) => ({ ...r, _i: i, v: num(r.votes) })).sort((a, b) => b.v - a.v || a._i - b._i);
  const s = num(seats), a = num(alt);
  return { all: c, win: c.slice(0, s), alt: c.slice(s, s + a) };
}

/* 檢核 */
function checks() {
  const out = [];
  const bud = finSurplus('b');
  if (accVal(ACC_BY.inc, 'b') + accVal(ACC_BY.exp, 'b') > 0 && bud !== 0) out.push({ lv: 'warn', page: 'finance', t: `預算表收支未平衡：本期餘絀 ${fmt(bud)}，預算應編列至餘絀為 0。` });
  const a = bsAssets(), r = bsLiab() + bsEquity();
  if (a + r > 0 && a !== r) out.push({ lv: 'warn', page: 'finance', t: `資產負債表兩方合計不同：資產 ${fmt(a)}，負債基金暨餘絀 ${fmt(r)}。` });
  const ps = propSum(''), fo = bsGroupSum(BS_LEFT[1]) + bsVal('雜項資產');
  if (ps && ps !== fo) out.push({ lv: 'warn', page: 'finance', t: `財產目錄合計 ${fmt(ps)} 與資產負債表固定資產＋雜項資產 ${fmt(fo)} 不一致。` });
  const cash = bsVal('庫存現金') + bsVal('銀行存款') + bsVal('定期存款');
  if ((accVal(ACC_BY.inc, 'a') || accVal(ACC_BY.exp, 'a')) && cash && cash !== cashEnd()) out.push({ lv: 'info', page: 'finance', t: `現金出納表本期結存 ${fmt(cashEnd())} 與資產負債表現金＋存款 ${fmt(cash)} 不同，請確認。` });
  const planSum = S.plan.rows.reduce((s, r) => s + num(r.cost), 0), budExp = accVal(ACC_BY.exp, 'b');
  if (planSum && budExp && planSum !== budExp) out.push({ lv: 'info', page: 'plan', t: `工作計畫經費預估合計 ${fmt(planSum)}，與預算表支出總計 ${fmt(budExp)} 不同（僅供參考）。` });
  if (!S.roster.some(r => r.role === '理事長' && !isBlank(r.name))) out.push({ lv: 'info', page: 'roster', t: '一覽表尚未填入理事長，各表單的理事長欄位將無法自動帶入。' });
  if (S.roster.filter(r => r.role === '理事長').length > 1) out.push({ lv: 'warn', page: 'roster', t: '一覽表有兩位以上理事長，請確認職別。' });
  return out;
}

[...BS_LEFT, ...BS_RIGHT_L, ...BS_RIGHT_E].forEach(g => g.kids.forEach(n => { D['fin.bs.' + n] = () => { const d = bsDerived(n); return d == null ? '' : String(d); }; }));
