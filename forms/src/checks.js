/* ===== 自動檢查：上傳檔案與線上填寫的資料 =====
 結果：{ lv: 'ok'|'info'|'warn'|'err', items: [{ lv, msg }], info: '摘要' } */
const LV = { ok: 0, info: 1, warn: 2, err: 3 };
const worst = items => items.reduce((w, i) => LV[i.lv] > LV[w] ? i.lv : w, 'ok');
const colName = c => { let s = ''; c++; while (c) { const m = (c - 1) % 26; s = String.fromCharCode(65 + m) + s; c = Math.floor((c - 1) / 26); } return s; };
const n0 = v => Math.round(v).toLocaleString('en-US');

/* ---------- 讀取試算表：{ name, rows: [[{v, f, r, e}]] } ---------- */
async function readSheets(blob, name) {
  const ext = (name.split('.').pop() || '').toLowerCase();
  if (ext === 'csv' || ext === 'txt') {
    const buf = new Uint8Array(await blob.arrayBuffer()); let t;
    try { t = new TextDecoder('utf-8', { fatal: true }).decode(buf); } catch (e) { t = new TextDecoder('big5').decode(buf); }
    const rows = t.replace(/^﻿/, '').split(/\r?\n/).map(l => csvLine(l).map(c => { const s = c.trim(), n = s !== '' && /^-?[\d,]+(\.\d+)?$/.test(s) ? Number(s.replace(/,/g, '')) : null; return { v: n != null ? n : (s || null) }; }));
    return [{ name: name, rows }];
  }
  const X = await loadLib('exceljs'), wb = new X.Workbook();
  await wb.xlsx.load(await blob.arrayBuffer());
  return wb.worksheets.map(ws => {
    const rows = [];
    ws.eachRow({ includeEmpty: true }, (row, ri) => {
      const r = [];
      row.eachCell({ includeEmpty: true }, (c, ci) => {
        if (c.isMerged && c.master && c.master.address !== c.address) { r[ci - 1] = { v: null }; return; }
        const val = c.value; let o = { v: null };
        if (val == null) o = { v: null };
        else if (typeof val === 'number') o = { v: val };
        else if (typeof val === 'string') o = { v: val.trim() || null };
        else if (val instanceof Date) o = { v: val };
        else if (typeof val === 'object') {
          if (val.error) o = { v: null, e: val.error };
          else if ('formula' in val || 'sharedFormula' in val) { const res = val.result; o = { v: res && typeof res === 'object' && res.error ? null : res ?? null, f: val.formula || '@shared', e: res && typeof res === 'object' && res.error ? res.error : null, nr: res === undefined }; }
          else if (val.richText) o = { v: val.richText.map(t => t.text).join('').trim() || null };
          else if ('text' in val) o = { v: String(val.text || '').trim() || null };
        }
        r[ci - 1] = o;
      });
      rows[ri - 1] = r;
    });
    for (let i = 0; i < rows.length; i++) rows[i] = rows[i] || [];
    return { name: ws.name, rows };
  });
}
const isNum = c => c && typeof c.v === 'number' && isFinite(c.v);
const txt = c => c && typeof c.v === 'string' ? c.v.replace(/\s|　/g, '') : '';
const rowText = r => r.map(txt).join('');

/* ---------- 簡易公式計算（+ - * / 括號、儲存格、SUM、ROUND） ---------- */
function evalFormula(f, rows) {
  const ref = s => { const m = /^\$?([A-Z]{1,3})\$?(\d+)$/.exec(s); if (!m) return null; let c = 0; for (const ch of m[1]) c = c * 26 + ch.charCodeAt(0) - 64; return [Number(m[2]) - 1, c - 1]; };
  const valAt = ([r, c]) => { const x = (rows[r] || [])[c]; if (!x || x.v == null || x.v === '') return 0; if (typeof x.v === 'number') return x.v; throw new Error('text'); };
  const range = s => { const [a, b] = s.split(':').map(ref); if (!a || !b) throw new Error('ref'); const out = []; for (let r = Math.min(a[0], b[0]); r <= Math.max(a[0], b[0]); r++) for (let c = Math.min(a[1], b[1]); c <= Math.max(a[1], b[1]); c++) { const x = (rows[r] || [])[c]; if (x && typeof x.v === 'number') out.push(x.v); } return out; };
  const toks = String(f).replace(/^=/, '').toUpperCase().match(/\$?[A-Z]{1,3}\$?\d+(?::\$?[A-Z]{1,3}\$?\d+)?|\d+(?:\.\d+)?|SUM|ROUND|[-+*/(),]/g);
  if (!toks || toks.join('') !== String(f).replace(/^=/, '').toUpperCase().replace(/\s/g, '')) throw new Error('unsupported');
  let i = 0;
  const peek = () => toks[i], take = () => toks[i++];
  const expr = () => { let v = term(); while (peek() === '+' || peek() === '-') { const op = take(), w = term(); v = op === '+' ? v + w : v - w; } return v; };
  const term = () => { let v = fac(); while (peek() === '*' || peek() === '/') { const op = take(), w = fac(); v = op === '*' ? v * w : v / w; } return v; };
  const args = () => { const out = []; take(); if (peek() !== ')') { do { if (peek() === ',') take(); const t = peek(); if (/:/.test(t || '')) { take(); out.push(...range(t)); } else out.push(expr()); } while (peek() === ','); } if (take() !== ')') throw new Error('paren'); return out; };
  const fac = () => {
    const t = take();
    if (t === '-') return -fac(); if (t === '+') return fac();
    if (t === '(') { const v = expr(); if (take() !== ')') throw new Error('paren'); return v; }
    if (t === 'SUM') { if (peek() !== '(') throw new Error('sum'); return args().reduce((a, b) => a + b, 0); }
    if (t === 'ROUND') { if (peek() !== '(') throw new Error('round'); const a = args(); const k = Math.pow(10, a[1] || 0); return Math.round(a[0] * k) / k; }
    if (/^\d/.test(t)) return Number(t);
    const r = ref(t); if (r) return valAt(r);
    throw new Error('tok');
  };
  const v = expr(); if (i !== toks.length) throw new Error('trail'); return v;
}
/** 找出某個標籤列的第一個數字（例如「資產合計」那一列） */
function findVal(rows, re, exclude) {
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r] || [];
    for (let c = 0; c < row.length; c++) {
      const t = txt(row[c]); if (!t || !re.test(t) || (exclude && exclude.test(t))) continue;
      for (let k = c + 1; k < row.length; k++) if (isNum(row[k])) return { v: row[k].v, r, c: k, label: t };
    }
  }
  return null;
}
function sheetChecks(sh, kind, items) {
  const rows = sh.rows, P = s => `「${sh.name}」${s}`;
  let errs = 0, fchk = 0, fbad = 0, nr = 0;
  rows.forEach((row, r) => row.forEach((c, k) => {
    if (!c) return;
    if (c.e && errs < 5) { items.push({ lv: 'err', msg: P(`${colName(k)}${r + 1} 出現錯誤值 ${c.e}，請在 Excel 修正公式`) }); errs++; }
    if (c.f && !c.e && c.f !== '@shared') {
      try {
        const v = evalFormula(c.f, rows);
        if (c.nr) { if (Math.abs(v) > 0.5) nr++; else fchk++; return; }   /* 沒存結果通常代表 0 */
        fchk++;
        if (typeof c.v === 'number' && Math.abs(v - c.v) > 0.5) { fbad++; if (fbad <= 5) items.push({ lv: 'err', msg: P(`${colName(k)}${r + 1} 的公式（=${c.f}）顯示 ${n0(c.v)}，但重新計算是 ${n0(v)}，請在 Excel 重新計算後再存檔上傳`) }); }
      } catch (e) { if (c.nr) nr++; }
    }
  }));
  if (nr) items.push({ lv: 'info', msg: P(`有 ${nr} 個公式沒有存下計算結果，無法核對；建議用 Excel 開啟、存檔後再上傳`) });
  /* 手打（沒有公式）的合計：以同一列左邊最近的文字當標籤，逐欄比對上方加總 */
  const TOT = /(合計|總計|小計|共計|總額)/, startCol = {};
  let warned = 0;
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r] || [];
    row.forEach((c, k) => {
      if (!isNum(c)) return;
      let lab = ''; for (let q = k - 1; q >= 0; q--) { const t = txt(row[q]); if (t) { lab = t; break; } if (isNum(row[q])) break; }
      if (!TOT.test(lab)) return;
      const st = startCol[k] || 0; startCol[k] = r + 1;
      if (c.f || warned >= 4) return;
      let sum = 0, n = 0, prev = 0;
      for (let q = st; q < r; q++) { const x = (rows[q] || [])[k]; if (isNum(x)) { sum += x.v; n++; prev = x.v; } }
      if (n < 2) return;
      const ok = [sum, sum / 2].some(v => Math.abs(v - c.v) <= 0.5) || Math.abs(prev - c.v) <= 0.5;
      if (!ok) { warned++; items.push({ lv: 'warn', msg: P(`第 ${r + 1} 列 ${colName(k)} 欄「${lab}」是 ${n0(c.v)}，上方各列加總是 ${n0(sum)}，請確認合計是否正確`) }); }
    });
  }
  if (kind === 'fin') {
    const all = rows.map(rowText).join('');
    const A = findVal(rows, /^資產(合計|總計)|資產總額/), B = findVal(rows, /負債.*(合計|總計)|負債.*淨值|負債.*權益/, /^負債(合計|總計)$/);
    if (A && B && Math.abs(A.v - B.v) > 0.5) items.push({ lv: 'err', msg: P(`資產負債表兩方不相等：資產 ${n0(A.v)}，負債、基金及餘絀 ${n0(B.v)}（差 ${n0(A.v - B.v)}）`) });
    const I = findVal(rows, /^收入(合計|總計)|收入總額/), E = findVal(rows, /^支出(合計|總計)|支出總額/), R = findVal(rows, /^本期(餘絀|結餘|賸餘|短絀)|收支餘絀|^本期餘額/);
    if (I && E && R && Math.abs(I.v - E.v - R.v) > 0.5) items.push({ lv: 'err', msg: P(`收入 ${n0(I.v)} 減支出 ${n0(E.v)} 應等於本期餘絀，但表上是 ${n0(R.v)}`) });
    if (I && E && !R && /預算/.test(sh.name + all) && Math.abs(I.v - E.v) > 0.5) items.push({ lv: 'warn', msg: P(`預算收入 ${n0(I.v)} 與支出 ${n0(E.v)} 不平衡，預算應本收支平衡原則編列`) });
    const p0 = findVal(rows, /上(期|年度)結存|期初餘額/), pi = findVal(rows, /^本期收入/), po = findVal(rows, /^本期支出/), pe = findVal(rows, /本期結存|期末(結存|餘額)/);
    if (p0 && pi && po && pe && Math.abs(p0.v + pi.v - po.v - pe.v) > 0.5) items.push({ lv: 'err', msg: P(`現金出納：上期結存＋本期收入－本期支出應為 ${n0(p0.v + pi.v - po.v)}，表上本期結存是 ${n0(pe.v)}`) });
    if (pe && pe.v < 0) items.push({ lv: 'warn', msg: P(`本期結存為負數（${n0(pe.v)}），請確認`) });
  }
  return { fchk, fbad };
}
/* 名冊：身分證字號、重複、日期、人數 */
function listChecks(sheets, kind, items, sc) {
  let hdr = null, sh = null;
  for (const re of [/姓名/, /^(會員)?名稱$/]) { for (const s of sheets) { for (let r = 0; r < Math.min(12, s.rows.length); r++) if ((s.rows[r] || []).some(c => re.test(txt(c)))) { hdr = r; sh = s; break; } if (sh) break; } if (sh) break; }
  if (!sh) { items.push({ lv: 'warn', msg: '找不到「姓名」欄位，請確認上傳的是名冊，且第一列是欄位名稱' }); return; }
  const H = (sh.rows[hdr] || []).map(txt), col = re => H.findIndex(h => re.test(h));
  const cN = H.findIndex(h => /姓名/.test(h)) >= 0 ? H.findIndex(h => /姓名/.test(h)) : col(/名稱/), cI = col(/身分證|身份證|統一編號|統編/), cB = col(/出生|生日/), cR = col(/職稱|職別|職務/), cT = col(/類別|會員別|身分別/);
  const filled = r => (r || []).filter(c => c && c.v != null && c.v !== '');
  const NOTE_RE = /^(註|備註|說明|填表|製表|合計|總計|共計|注意|本表|以上)/;
  const data = sh.rows.slice(hdr + 1).filter(r => { const f = filled(r); return f.length > 1 && !NOTE_RE.test(txt(f.find(c => txt(c))) || ''); });
  const names = [], bad = [], ids = new Map(), dates = [];
  data.forEach((r, i) => {
    const line = hdr + 2 + i, nm = cN >= 0 && r[cN] ? String(r[cN].v ?? '').trim() : '';
    if (!nm) { if (r.some(c => c && c.v != null)) dates.push(`第 ${line} 列沒有姓名`); return; }
    if (/(合計|總計|共計)/.test(nm)) return;
    names.push(nm);
    if (cI >= 0 && r[cI] && r[cI].v) { const id = String(r[cI].v).trim().toUpperCase(); if (/^[A-Z]/.test(id)) { if (!checkTwId(id)) bad.push(`第 ${line} 列 ${nm}（${id}）`); if (ids.has(id)) bad.push(`第 ${line} 列 ${nm} 與 ${ids.get(id)} 的身分證字號重複`); ids.set(id, nm); } }
    if (cB >= 0 && r[cB] && r[cB].v != null && !(r[cB].v instanceof Date) && !parseDate(String(r[cB].v))) dates.push(`第 ${line} 列 ${nm} 的出生日期「${r[cB].v}」看不懂`);
  });
  if (bad.length) items.push({ lv: 'err', msg: `身分證字號格式或檢查碼不正確：${bad.slice(0, 5).join('、')}${bad.length > 5 ? ` 等 ${bad.length} 筆` : ''}` });
  const dup = [...new Set(names.filter((n, i) => names.indexOf(n) !== i))];
  if (kind === 'members' && dup.length) items.push({ lv: 'warn', msg: `姓名重複：${dup.slice(0, 5).join('、')}，請確認是否重複登記` });
  if (dates.length) items.push({ lv: 'warn', msg: dates.slice(0, 4).join('；') + (dates.length > 4 ? ` 等 ${dates.length} 筆` : '') });
  if (kind === 'roster' && cR >= 0 && !data.some(r => r[cR] && /理事長/.test(String(r[cR].v || '')))) items.push({ lv: 'warn', msg: '名冊中沒有職稱為「理事長」的人' });
  let msg = `名冊共 ${names.length} 人`;
  if (kind === 'members' && cT >= 0) { const g = {}; data.forEach(r => { const t = r[cT] && r[cT].v ? String(r[cT].v).trim() : ''; if (t) g[t] = (g[t] || 0) + 1; }); const ks = Object.keys(g); if (ks.length) msg += `（${ks.map(k => `${k} ${g[k]}`).join('、')}）`; }
  items.push({ lv: 'info', msg });
  if (kind === 'members' && sc) {
    const mk = SCEN[sc] && SCEN[sc].meets().find(m => MEET[m] && MEET[m].asm), should = mk ? num(MV(mk, 'should')) : 0;
    const rows2 = data.filter(r => cN >= 0 && r[cN] && String(r[cN].v ?? '').trim());
    const nonVote = rows2.filter(r => /贊助|停權/.test(rowText(r))).length, formal = names.length - nonVote;
    if (should && names.length && should !== formal && should !== names.length) items.push({ lv: 'warn', msg: `名冊有表決權的會員 ${formal} 人（共 ${names.length} 人），與開會通知書的應出席人數 ${should} 人不同，請確認` });
  }
}
/** 檢查一個上傳的檔案 */
async function fileCheck(kind, f, blob, sc) {
  const items = [], name = f.name || '', ext = (name.split('.').pop() || '').toLowerCase(), type = f.type || '';
  let info = '';
  try {
    if (/^image\//.test(type)) {
      const im = await decodeImage(blob), w = im.naturalWidth || im.width, h = im.naturalHeight || im.height;
      info = `圖片 ${w}×${h}`;
      if (Math.max(w, h) < 1200) items.push({ lv: 'warn', msg: `解析度偏低（${w}×${h}），列印可能模糊；建議用 300dpi 掃描，或拍攝時讓文件佔滿畫面` });
      if (kind === 'fin' || kind === 'members' || kind === 'roster') items.push({ lv: 'info', msg: '照片無法自動核對數字與身分證字號，送件前請自行確認；上傳 Excel 檔可以自動檢查' });
    } else if (type === 'application/pdf' || ext === 'pdf') {
      const PL = await loadLib('pdflib');
      let doc; try { doc = await PL.PDFDocument.load(await blob.arrayBuffer(), { ignoreEncryption: true }); } catch (e) { return { lv: 'err', items: [{ lv: 'err', msg: '無法開啟這個 PDF，檔案可能損毀，請重新匯出或掃描' }], info: 'PDF' }; }
      const n = doc.getPageCount(); info = `PDF ${n} 頁`;
      if (!n) items.push({ lv: 'err', msg: 'PDF 沒有任何頁面' });
      if (doc.isEncrypted) items.push({ lv: 'warn', msg: 'PDF 有加密保護，合併送件檔時可能無法放入' });
      const odd = doc.getPages().filter(p => { const { width: a, height: b } = p.getSize(), L = Math.max(a, b), Sh = Math.min(a, b); return Math.abs(L - 842) > 30 || Math.abs(Sh - 595) > 30; }).length;
      if (odd) items.push({ lv: 'info', msg: `有 ${odd} 頁不是 A4 大小，列印時可能會縮放` });
      if (kind === 'fin' || kind === 'members' || kind === 'roster') items.push({ lv: 'info', msg: 'PDF 無法自動核對數字與身分證字號，送件前請自行確認；上傳 Excel 檔可以自動檢查' });
    } else if (ext === 'xlsx' || ext === 'csv' || ext === 'txt') {
      let sheets; try { sheets = await readSheets(blob, name); } catch (e) { return { lv: 'err', items: [{ lv: 'err', msg: '無法開啟這個 Excel 檔，檔案可能損毀或有密碼保護' }], info: 'Excel' }; }
      const used = sheets.filter(s => s.rows.some(r => (r || []).some(c => c && c.v != null)));
      info = ext === 'xlsx' ? `Excel ${used.length} 個工作表` : 'CSV';
      if (!used.length) items.push({ lv: 'err', msg: '檔案是空的' });
      let fchk = 0, fbad = 0;
      for (const sh of used) { const r = sheetChecks(sh, kind, items); fchk += r.fchk; fbad += r.fbad; }
      if (kind === 'members' || kind === 'roster') listChecks(used, kind, items, sc);
      if (fchk && !fbad) items.push({ lv: 'ok', msg: `已重新計算 ${fchk} 個公式，結果都正確` });
    } else if (ext === 'docx') {
      const JZ = await loadLib('jszip'); let xml;
      try { const z = await JZ.loadAsync(await blob.arrayBuffer()); xml = await z.file('word/document.xml').async('string'); } catch (e) { return { lv: 'err', items: [{ lv: 'err', msg: '無法開啟這個 Word 檔，檔案可能損毀' }], info: 'Word' }; }
      const t = xml.replace(/<w:tab\/>/g, ' ').replace(/<\/w:p>/g, '\n').replace(/<[^>]+>/g, '');
      info = `Word 約 ${t.replace(/\s/g, '').length} 字`;
      const blanks = (t.match(/○{2,}|＿{3,}|_{4,}|（請填寫）|XXX/g) || []).length;
      if (blanks) items.push({ lv: 'warn', msg: `文件中還有 ${blanks} 處未填寫的空白（○○○、＿＿＿），請確認` });
      if (kind === 'fin' || kind === 'members' || kind === 'roster') items.push({ lv: 'info', msg: 'Word 檔無法自動核對計算，建議上傳 Excel 檔或改用線上填寫' });
    } else if (['xls', 'doc', 'odt', 'ods'].includes(ext)) {
      info = ext.toUpperCase(); items.push({ lv: 'info', msg: '這種格式無法自動檢查內容，建議另存為 .xlsx、.docx 或 PDF 再上傳' });
    } else items.push({ lv: 'err', msg: '不支援的檔案格式，請上傳 PDF、JPG、PNG、Excel（.xlsx）或 Word（.docx）' });
  } catch (e) { items.push({ lv: 'info', msg: '無法自動檢查這個檔案：' + (e.message || e) }); }
  return { lv: worst(items), items, info };
}

/* ---------- 線上填寫資料的檢查 ---------- */
function docChecks(sc, x) {
  const out = [], P = (lv, msg) => out.push({ lv, msg });
  if (isUp(x)) return out;
  const id = x.id, mk = x.m;
  if (id === 'members' || id === 'roster') {
    const L = id === 'members' ? S.members : S.people;
    const bad = L.filter(p => p.idno && !checkTwId(p.idno)).map(p => p.name || '（未填姓名）');
    if (bad.length) P('err', `身分證字號格式或檢查碼不正確：${bad.slice(0, 5).join('、')}${bad.length > 5 ? ` 等 ${bad.length} 人` : ''}`);
    const nm = L.map(p => (p.name || '').trim()).filter(Boolean), dup = [...new Set(nm.filter((n, i) => nm.indexOf(n) !== i))];
    if (id === 'members' && dup.length) P('warn', `姓名重複：${dup.slice(0, 5).join('、')}`);
    const bd = L.filter(p => p.birth && !parseDate(p.birth)).map(p => p.name); if (bd.length) P('warn', `出生日期看不懂：${bd.slice(0, 5).join('、')}`);
    if (id === 'roster' && !chairName()) P('err', '還沒有設定理事長');
  }
  if (['fin', 'fin5', 'budget'].includes(id)) {
    if (id !== 'fin5' && finSurplus('b') !== 0) P('warn', `預算收支不平衡（本期餘絀 ${fmt(finSurplus('b'))}），預算應本收支平衡原則編列`);
    if (id !== 'budget') { const a = bsAssets(), r = bsLiab() + bsEquity(); if (a !== r) P('err', `資產負債表兩方不相等：資產 ${fmt(a)}，負債、基金暨餘絀 ${fmt(r)}（差 ${fmt(a - r)}）`); }
    if (id !== 'budget' && cashEnd() < 0) P('warn', `現金出納表本期結存為負數（${fmt(cashEnd())}），請確認收支或上期結存`);
    if (id !== 'budget') ['土地', '房屋及建築', '事務器械設備', '儀器設備', '交通運輸設備', '雜項設備'].forEach(n => { const raw = S.fin.bs[n], ps = propSum(n); if (hasNum(raw) && ps && num(raw) !== ps) P('warn', `資產負債表「${n}」${fmt(num(raw))} 與財產目錄 ${fmt(ps)} 不同`); });
  }
  if (id === 'prepfin') { const inc = (S.x.prepfin.inc || []).reduce((s, r) => s + num(r.amt), 0), exp = (S.x.prepfin.exp || []).reduce((s, r) => s + num(r.amt), 0); if (exp > inc) P('err', `籌備期間支出 ${fmt(exp)} 大於收入 ${fmt(inc)}，收支不得負債`); }
  if (id === 'ledger') {
    let bal = hasNum(S.x.ledger.open) ? num(S.x.ledger.open) : 0, neg = '';
    for (const r of S.x.ledger.rows || []) { bal += num(r.inc) - num(r.exp); if (bal < 0 && !neg) neg = r.item || rdDot(r.date) || '某筆'; }
    if (neg) P('warn', `收支報告餘額在「${neg}」之後變成負數，請確認上期結存或收支金額`);
    const from = parseDate(S.x.ledger.from) && toIso(S.x.ledger.from), to = parseDate(S.x.ledger.to) && toIso(S.x.ledger.to);
    if (from && to) { const outR = (S.x.ledger.rows || []).filter(r => r.date && (toIso(r.date) < from || toIso(r.date) > to)).length; if (outR) P('warn', `有 ${outR} 筆收支日期不在報告期間內`); }
  }
  if (/notice/i.test(id) && mk) {
    const d = MV(mk, 'date'), nd = MV(mk, 'noticeDate'), days = MEET[mk].days;
    if (d && nd) { const left = daysBetween(nd, d); if (left != null && left < days) P('warn', `開會通知書發文日期距開會只有 ${left} 天，依規定應於會議前 ${days} 日送達縣府`); }
    const refs = noticeRefs(mk), miss = scenDocs(sc).filter(a => a.nm === mk && refs.has(a.id) && !isSel(sc, a)).map(a => a.name);
    if (miss.length) P('warn', `通知書的報告或討論事項提到「${miss.join('、')}」，但開會通知檢附資料沒有勾選，送件時請一併附上`);
  }
  if (/letter/i.test(id) && mk) {
    const d = MV(mk, 'date'), ld = MV(mk, 'letterDate'), typed = !isBlank(getp(S, `m.${mk}.letterDate`)), held = d && daysBetween(d, isoToday()) >= 0;
    if (d && ld && (typed || held)) { const gap = daysBetween(d, ld); if (gap != null && gap > 30) P('warn', `檢送公文日期在會後 ${gap} 天，應於會議後 30 日內送達縣府`); if (gap != null && gap < 0) P('err', '檢送會議紀錄公文的發文日期早於開會日期'); }
  }
  if (/Min$|^min$/.test(id) && mk && MEET[mk].asm) {
    const a = num(MV(mk, 'attend')), s = num(MV(mk, 'should'));
    if (a && s && a * 2 <= s) P('err', `出席 ${a} 人未過應出席 ${s} 人的半數，會議不足法定人數`);
  }
  return out;
}
/** 一份文件的檢查摘要（線上填寫或上傳） */
function docCheckState(sc, x) {
  if (isUp(x) || (x.kind === 'attach' && upList(sc, x).length)) {
    const L = upList(sc, x); if (!L.length) return { lv: isUp(x) ? 'warn' : 'ok', items: isUp(x) ? [{ lv: 'warn', msg: '已選擇上傳，但還沒有上傳檔案' }] : [] };
    const items = L.flatMap(f => (f.chk && f.chk.items || []).filter(i => i.lv !== 'ok' && i.lv !== 'info' || i.lv === 'err').map(i => ({ ...i, msg: `${f.name}：${i.msg}` })));
    return { lv: worst(L.map(f => ({ lv: f.chk ? f.chk.lv : 'ok' }))), items };
  }
  const items = docChecks(sc, x); return { lv: worst(items), items };
}
function chkBadge(st) { return st.lv === 'err' ? `<span class="ck err">${icon('x')}${st.items.filter(i => i.lv === 'err').length} 個錯誤</span>` : st.lv === 'warn' ? `<span class="ck warn">${icon('warn')}${st.items.filter(i => i.lv === 'warn').length} 個提醒</span>` : ''; }
function chkList(items) { const L = items.filter(i => i.lv === 'err' || i.lv === 'warn'); return L.length ? `<ul class="cklist">${L.map(i => `<li class="${i.lv}">${esc(i.msg)}</li>`).join('')}</ul>` : ''; }
/** 下載頁：送件前自動檢查 */
function checkSummary(sc) {
  const list = selDocs(sc), res = list.map(x => ({ x, st: docCheckState(sc, x) })).filter(r => r.st.items.some(i => i.lv === 'err' || i.lv === 'warn'));
  const ne = res.reduce((s, r) => s + r.st.items.filter(i => i.lv === 'err').length, 0), nw = res.reduce((s, r) => s + r.st.items.filter(i => i.lv === 'warn').length, 0);
  if (!res.length) return `<section class="card ckall ok">${icon('check')}<div><b>送件前自動檢查：沒有發現格式或計算錯誤</b><small>已核對財務報表平衡、身分證字號、出席人數、發文期限與上傳檔案。</small></div></section>`;
  return `<section class="card ckall ${ne ? 'err' : 'warn'}">${icon(ne ? 'x' : 'warn')}<div><b>送件前自動檢查：${ne ? `${ne} 個錯誤` : ''}${ne && nw ? '、' : ''}${nw ? `${nw} 個提醒` : ''}</b>
    <details${ne ? ' open' : ''}><summary>查看內容</summary>${res.map(r => `<div class="ckdoc"><b>${esc(r.x.name)}</b>${chkList(r.st.items)}</div>`).join('')}</details></div></section>`;
}
