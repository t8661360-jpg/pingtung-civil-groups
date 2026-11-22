/* ===== 圖示（內嵌 SVG） ===== */
const IC = {
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.6 2.3c-.7.4-1.2.9-1.2 1.7v.4M12 17.2v.1"/>',
  desk: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8.5 20h7M12 16v4"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M11 18.5h2"/>',
  seed: '<path d="M12 21v-8m0 0c0-4 3-7 7-7 0 4-3 7-7 7zm0 0C12 9 9 6 5 6c0 4 3 7 7 7z"/>',
  flag: '<path d="M5 21V4m0 0h11l-2 4 2 4H5"/>',
  vote: '<path d="M4 12l3 3 6-7M14 13h6M14 17h6M4 20h16"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  table: '<circle cx="12" cy="12" r="4"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
  close: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  more: '<path d="M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6"/>',
  org: '<path d="M4 21V8l8-5 8 5v13M9 21v-6h6v6M3 21h18"/>',
  people: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 11a3 3 0 100-6M21 20c0-2.6-1.6-4.8-4-5.6"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  meet: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  money: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/>',
  doc: '<path d="M6 3h8l4 4v14H6zM14 3v4h4"/>',
  pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3"/>',
  check: '<path d="M5 12l5 5L20 7"/>',
  dl: '<path d="M12 4v11m0 0l-4-4m4 4l4-4M5 20h14"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  clip: '<path d="M21 11l-8.5 8.5a5 5 0 01-7-7L14 4a3.5 3.5 0 015 5l-8.5 8.5a2 2 0 01-3-3L15 7"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  up: '<path d="M6 15l6-6 6 6"/>', down: '<path d="M6 9l6 6 6-6"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
  paste: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V2h6v2M9 10h6M9 14h6"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
  menu: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
  zip: '<path d="M6 3h12v18H6zM11 3v2h2v2h-2v2h2v2h-2v3h2"/>',
  book: '<path d="M4 4h7a2 2 0 012 2v14a2 2 0 00-2-2H4zM20 4h-7a2 2 0 00-2 2v14a2 2 0 012-2h7z"/>',
  warn: '<path d="M12 3l10 18H2zM12 10v5M12 18h.01"/>',
  vote2: '<rect x="4" y="9" width="16" height="12" rx="1"/><path d="M8 9V4h8v5M10 6h4"/>',
  cloud: '<path d="M7 18h10.5a4 4 0 00.6-7.96A6 6 0 006.3 9.5 4.25 4.25 0 007 18z"/>',
  stamp: '<path d="M10 3h4a1.5 1.5 0 011.5 1.5V8a2 2 0 01-1.5 1.9V12h4.5a1.5 1.5 0 011.5 1.5V16H4v-2.5A1.5 1.5 0 015.5 12H10V9.9A2 2 0 018.5 8V4.5A1.5 1.5 0 0110 3zM5 19.5h14"/>',
};
const icon = (k, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${IC[k] || IC.doc}</svg>`;

/* ===== 欄位元件 =====
 F(path, label, {type:'text'|'num'|'area'|'date'|'time'|'rdate'|'sel'|'tel'|'email', w:'half'|'third'|'full', ph, hint, opts, chips, rows}) */
function linkedChip(path) { return hasDerive(path) ? `<span class="auto" title="留空會自動帶入其他資料；直接輸入即可改寫">自動</span><button type="button" class="rst" data-reset="${path}" title="清除改寫，恢復自動帶入">恢復自動</button>` : ''; }
function F(path, label, o = {}) {
  const t = o.type || 'text', v = raw(path), id = 'f_' + path.replace(/\W/g, '_');
  let input;
  const common = `id="${id}" data-p="${path}"${o.ph ? ` data-ph="${esc(o.ph)}"` : ''}${o.attrs || ''}`;
  if (t === 'area') input = `<textarea ${common} rows="${o.rows || 3}">${esc(v)}</textarea>`;
  else if (t === 'sel') input = `<select ${common}>${(o.blank === false ? [] : ['']).concat(o.opts).map(x => { const [val, lab] = Array.isArray(x) ? x : [x, x]; return `<option value="${esc(val)}"${String(v) === String(val) ? ' selected' : ''}>${esc(lab || (val === '' ? (o.blankLabel || '請選擇') : val))}</option>`; }).join('')}</select>`;
  else if (t === 'date') input = `<input type="date" ${common} value="${esc(v)}">`;
  else if (t === 'time') input = `<input type="time" ${common} value="${esc(v)}" step="300">`;
  else if (t === 'num') input = `<input type="text" inputmode="decimal" ${common} value="${esc(v)}">`;
  else if (t === 'rdate') input = `<input type="text" inputmode="text" autocomplete="off" ${common} value="${esc(v)}" data-rdate="1">`;
  else input = `<input type="${t === 'tel' ? 'tel' : t === 'email' ? 'email' : 'text'}" ${common} value="${esc(v)}"${o.ac ? ` autocomplete="${o.ac}"` : ''}>`;
  const suf = o.suf ? `<span class="suf">${o.suf}</span>` : '', pre = o.pre ? `<span class="suf">${o.pre}</span>` : '';
  const chips = o.chips ? `<div class="qchips">${o.chips.map(c => `<button type="button" class="qc" data-chip="${esc(c)}" data-target="${path}">${esc(c)}</button>`).join('')}</div>` : '';
  const dyn = (t === 'date' || t === 'rdate' || o.check) ? `<div class="dyn" data-dyn="${path}" data-kind="${o.check || t}"></div>` : '';
  return `<div class="f ${o.w || ''}${o.req ? ' req' : ''}"><label for="${id}">${label}${o.req ? '<i class="star">*</i>' : ''}${linkedChip(path)}</label><div class="in">${pre}${input}${suf}</div>${dyn}${chips}${o.hint ? `<div class="hint">${o.hint}</div>` : ''}</div>`;
}
function CK(path, label, o = {}) { const v = getp(S, path); const on = o.def ? v !== false : !!v; return `<label class="sw ${o.w || ''}"><input type="checkbox" data-p="${path}"${on ? ' checked' : ''}${o.rr ? ' data-rr="1"' : ''}><span class="swt"></span><span>${label}</span></label>`; }
function SEG(path, opts, o = {}) { const v = raw(path) || o.def || opts[0][0]; return `<div class="seg ${o.cls || ''}" role="radiogroup">${opts.map(([val, lab]) => `<button type="button" role="radio" aria-checked="${v === val}" class="${v === val ? 'on' : ''}" data-setp="${path}" data-val="${esc(val)}"${o.rr ? ' data-rr="1"' : ''}>${lab}</button>`).join('')}</div>`; }
const H4 = (t, o = '') => `<h4 class="sub">${t}${o}</h4>`;
const NOTE = (t, cls = '') => `<div class="note ${cls}">${icon('info')}<div>${t}</div></div>`;
const GRID = inner => `<div class="grid">${inner}</div>`;
const calc = (key, cls = '') => `<div class="calc ${cls}" data-calc="${key}"></div>`;

/* ===== 卡片式清單 ===== */
const OPEN = new Set();
function LISTC(path, fields, o = {}) {
  const arr = getp(S, path) || [];
  const items = arr.map((row, i) => {
    const key = `${path}.${i}`, open = OPEN.has(key) || o.alwaysOpen;
    const sum = o.summary ? o.summary(row, i) : (row[fields[0].k] || '');
    return `<div class="li${open ? ' open' : ''}" data-key="${key}">
      <div class="lh"><button type="button" class="lt" data-toggle="${key}"><span class="ln">${o.numFmt ? o.numFmt(i) : i + 1}</span><span class="ls">${sum ? esc(sum) : `<em>${o.emptyLabel || '（未填寫）'}</em>`}</span>${o.alwaysOpen ? '' : `<span class="chev">${icon('down')}</span>`}</button>
      <span class="la"><button type="button" data-act="up" data-list="${path}" data-i="${i}" aria-label="上移">${icon('up')}</button><button type="button" data-act="down" data-list="${path}" data-i="${i}" aria-label="下移">${icon('down')}</button><button type="button" class="del" data-act="del" data-list="${path}" data-i="${i}" aria-label="刪除">${icon('x')}</button></span></div>
      ${open ? `<div class="lf grid">${fields.map(f => F(`${path}.${i}.${f.k}`, f.label, f)).join('')}${o.extra ? o.extra(i) : ''}</div>` : ''}
    </div>`;
  }).join('');
  return `<div class="lc">${items || `<div class="empty">${o.empty || '尚無資料'}</div>`}
    <div class="lbar"><button type="button" class="btn ghost" data-act="add" data-list="${path}"${o.tpl ? ` data-tpl='${esc(JSON.stringify(o.tpl))}'` : ''}>${icon('plus')}${o.addLabel || '新增一筆'}</button>${o.bar || ''}</div></div>`;
}
/* 精簡表格式清單（適合人數多、欄位少） */
function LISTT(path, cols, o = {}) {
  const arr = getp(S, path) || [];
  const head = `<div class="tr th">${cols.map(c => `<span style="flex:${c.f || 1}">${c.label}</span>`).join('')}<span class="ta"></span></div>`;
  const rows = arr.map((row, i) => `<div class="tr">${cols.map(c => {
    const p = `${path}.${i}.${c.k}`, v = row[c.k] ?? '';
    const inp = c.type === 'sel' ? `<select data-p="${p}" aria-label="${c.label}">${['', ...c.opts].map(x => `<option${x === v ? ' selected' : ''} value="${esc(x)}">${esc(x || '—')}</option>`).join('')}</select>`
      : `<input data-p="${p}" value="${esc(v)}" aria-label="${c.label}"${c.num ? ' inputmode="decimal" class="num"' : ''}${c.ph ? ` placeholder="${esc(c.ph)}"` : ''}>`;
    return `<span style="flex:${c.f || 1}">${inp}</span>`;
  }).join('')}<span class="ta"><button type="button" class="del" data-act="del" data-list="${path}" data-i="${i}" aria-label="刪除">${icon('x')}</button></span></div>`).join('');
  return `<div class="lt2">${head}${rows || `<div class="empty">${o.empty || '尚無資料'}</div>`}<div class="lbar"><button type="button" class="btn ghost" data-act="add" data-list="${path}">${icon('plus')}${o.addLabel || '新增一列'}</button>${o.bar || ''}</div></div>`;
}
