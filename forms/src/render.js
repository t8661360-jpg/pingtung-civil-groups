/* ---------- 送件公函 ---------- */
Object.assign(D, {
  'letter.addr': () => S.basic.address,
  'letter.contact': () => pname('總幹事'),
  'letter.phone': () => S.basic.phone,
  'letter.to': () => (V('basic.county') || '屏東縣') + '政府',
  'letter.date': () => V('basic.fillDate'),
  'letter.speed': () => '普通',
  'letter.secret': () => '普通',
  'letter.att': () => '如說明二',
  'letter.subject': () => `檢送本會第${O(cn(V('assembly.term')), '○')}屆第${O(cn(V('assembly.no')), '○')}次會員大會暨理監事會會議紀錄及相關附件各一式二份，敬請鈞府准予備查見復，請　鑒核。`,
  'letter.d1': () => `依據本會${O(BY(), '○○○')}年度工作計畫辦理。`,
  'letter.d2': () => {
    const dt = V('assembly.date');
    const atts = [];
    const sel = S.letter && S.letter.atts || {};
    const L = [
      ['act', `${O(Y(), '○○○')}年度經費收支決算表（含財產目錄及資產負債表）`],
      ['plan', `${O(BY(), '○○○')}年度工作計畫`], ['bud', `${O(BY(), '○○○')}年度經費收支預算表`],
      ['mem', '會員名冊'], ['roster', '新任理監事暨聘僱人員名冊'], ['handover', '移交清冊'], ['consent', '會址使用同意書'],
      ['charter', '章程'], ['statute', '章程修正條文對照表'], ['cert', '理事長當選證明書申請表'], ['book', '大會手冊']];
    L.forEach(([k, t]) => { if (sel[k] !== false) atts.push(t); });
    return `旨揭會議業於${dateEmpty(dt) ? '○○○年○○月○○日' : rd(dt)}假${S.assembly.place || '○○○'}召開完畢，隨函檢附${atts.join('、')}呈請備查。`;
  },
  'letter.main': () => (V('basic.county') || '屏東縣') + '政府',
  'letter.cc': () => '本會',
});
const LETTER_ATTS = [['act', '決算表（含財產目錄、資產負債表）'], ['plan', '工作計畫'], ['bud', '預算表'], ['mem', '會員名冊'], ['roster', '理監事暨聘僱人員名冊'], ['handover', '移交清冊'], ['consent', '會址使用同意書'], ['charter', '章程'], ['statute', '章程修正條文對照表'], ['cert', '理事長當選證明書申請表'], ['book', '大會手冊']];
function docLetter() {
  const l = S.letter || {};
  const kv = (k, v) => P(`${k}：${v || ''}`, { size: 12, indent: 14, hang: 0, after: 0 });
  return { title: '送件公函', sheets: [{ name: '送件公函', cols: [1], size: 14, ls: 1.5, blocks: [
    TITLE(`${orgFull()}　函`, { size: 20, after: 10 }),
    kv('機關地址', V('letter.addr')), kv('聯 絡 人', V('letter.contact')), kv('聯絡電話', V('letter.phone')),
    P('', { after: 4 }),
    P(`受文者：${V('letter.to')}`, { size: 14, after: 6 }),
    P(`發文日期：中華民國${rd(V('letter.date'), 3)}`, { size: 12, after: 0 }),
    P(`發文字號：${l.no || ''}`, { size: 12, after: 0 }),
    P(`速別：${V('letter.speed')}`, { size: 12, after: 0 }),
    P(`密等及解密條件：${V('letter.secret')}`, { size: 12, after: 0 }),
    P(`附件：${V('letter.att')}`, { size: 12, after: 10 }),
    P(`主旨：${V('letter.subject')}`, { size: 16, hang: 3, after: 6 }),
    P('說明：', { size: 16, after: 0 }),
    P(`一、${V('letter.d1')}`, { size: 16, indent: 1, hang: 2, after: 0 }),
    P(`二、${V('letter.d2')}`, { size: 16, indent: 1, hang: 2, after: 0 }),
    ...(l.d3 ? [P(`三、${l.d3}`, { size: 16, indent: 1, hang: 2, after: 0 })] : []),
    P(`理事長　${pname('理事長') || '○○○'}（簽字章或私章）`, { size: 16, align: 'r', before: 30, after: 30 }),
    P(`正本：${V('letter.main')}`, { size: 12, after: 0 }),
    P(`副本：${V('letter.cc')}`, { size: 12 }),
  ] }] };
}
DOCS.letter = docLetter;

/* ===== 表格排版（處理跨欄跨列） ===== */
function layoutTable(rows) {
  const occ = []; const out = [];
  rows.forEach((row, ri) => {
    occ[ri] = occ[ri] || [];
    const cont = occ[ri].some(Boolean); // 有上列跨列延伸進來
    let c = 0; const pl = [];
    for (const cell of row.cells) {
      while (occ[ri][c]) c++;
      const cs = cell.cs || 1, rs = cell.rs || 1;
      for (let i = 0; i < rs; i++) { occ[ri + i] = occ[ri + i] || []; for (let j = 0; j < cs; j++) occ[ri + i][c + j] = 1; }
      pl.push({ cell, col: c, cs, rs }); c += cs;
    }
    out.push({ row, pl, cont });
  });
  return out;
}
const cellText = c => (c.n && typeof c.v === 'number') ? fmt(c.v) : (c.v == null ? '' : String(c.v));
const ALC = { c: 'center', r: 'right', j: 'justify', l: 'left' };

/* ===== HTML（預覽與 PDF） ===== */
function sheetHTML(sh) {
  const tot = sh.cols.reduce((a, b) => a + b, 0);
  let h = `<div class="sheet" style="font-size:${sh.size || 12}pt;line-height:${sh.ls || 1.4}">`;
  for (const b of sh.blocks) {
    if (b.t === 'p') {
      const st = [`text-align:${ALC[b.align] || 'left'}`];
      if (b.size) st.push(`font-size:${b.size}pt`);
      if (b.bold) st.push('font-weight:700');
      const ind = (b.indent || 0) + (b.hang || 0); if (ind) st.push(`padding-left:${ind}em`);
      if (b.hang) st.push(`text-indent:-${b.hang}em`);
      if (b.firstIndent) st.push(`text-indent:${b.firstIndent}em`);
      if (b.sp) st.push(`letter-spacing:${b.sp}em`);
      st.push(`margin:${b.before || 0}pt 0 ${b.after ?? 2}pt`);
      h += `<p style="${st.join(';')}">${esc(b.text) || '&nbsp;'}</p>`;
    } else if (b.t === 'table') {
      const pad = b.pad != null ? b.pad : 2;
      h += `<table style="font-size:${b.size || sh.size}pt"><colgroup>${sh.cols.map(w => `<col style="width:${(w / tot * 100).toFixed(3)}%">`).join('')}</colgroup>`;
      for (const L of layoutTable(b.rows)) {
        h += `<tr${L.cont ? ' data-nb="1"' : ''}>`;
        for (const p of L.pl) {
          const c = p.cell, st = [`text-align:${ALC[c.al] || 'left'}`, `padding:${pad}pt 3pt`];
          if (c.b) st.push('font-weight:700'); if (c.sz) st.push(`font-size:${c.sz}pt`); if (c.va === 't') st.push('vertical-align:top');
          h += `<td${p.cs > 1 ? ` colspan="${p.cs}"` : ''}${p.rs > 1 ? ` rowspan="${p.rs}"` : ''}${c.h ? ' class="h"' : ''} style="${st.join(';')}">${esc(cellText(c))}</td>`;
        }
        h += '</tr>';
      }
      h += '</table>';
    }
  }
  return h + '</div>';
}

/* ===== 函式庫載入 ===== */
const LIBS = {
  docx: ['https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.js', () => window.docx],
  exceljs: ['https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js', () => window.ExcelJS],
  h2c: ['https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', () => window.html2canvas],
  jspdf: ['https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', () => window.jspdf],
};
const libP = {};
function loadLib(k) {
  if (LIBS[k][1]()) return Promise.resolve(LIBS[k][1]());
  if (!libP[k]) libP[k] = new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = LIBS[k][0]; s.async = true;
    s.onload = () => LIBS[k][1]() ? res(LIBS[k][1]()) : rej(new Error('函式庫載入失敗：' + k));
    s.onerror = () => { delete libP[k]; rej(new Error('無法下載函式庫（' + k + '），請檢查網路後再試一次')); };
    document.head.appendChild(s);
  });
  return libP[k];
}

/* ===== Word (.docx) ===== */
async function toDocx(doc) {
  const X = await loadLib('docx');
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, VerticalAlign, BorderStyle, ShadingType, TableLayoutType, LineRuleType } = X;
  const FONT = { ascii: 'Times New Roman', hAnsi: 'Times New Roman', eastAsia: '標楷體', cs: 'Times New Roman' };
  const AL = { c: AlignmentType.CENTER, r: AlignmentType.RIGHT, j: AlignmentType.BOTH, l: AlignmentType.LEFT };
  const runs = (text, size, bold, sp) => String(text ?? '').split('\n').map((line, i) => new TextRun({ text: line, break: i ? 1 : 0, font: FONT, size: Math.round(size * 2), bold: !!bold, characterSpacing: sp ? Math.round(sp * size * 20) : undefined }));
  const PAGE_W = 11906, PAGE_H = 16838, MX = 964, MY = 1020, CW = PAGE_W - 2 * MX;
  const B1 = { style: BorderStyle.SINGLE, size: 6, color: '000000' };
  const borders = { top: B1, bottom: B1, left: B1, right: B1 };
  const sections = doc.sheets.map(sh => {
    const tot = sh.cols.reduce((a, b) => a + b, 0);
    const colTw = sh.cols.map(w => Math.floor(w / tot * CW));
    const children = [];
    for (const b of sh.blocks) {
      if (b.t === 'p') {
        const sz = b.size || sh.size || 12, em = sz * 20;
        const ind = {};
        if (b.indent || b.hang) { ind.left = Math.round(((b.indent || 0) + (b.hang || 0)) * em); if (b.hang) ind.hanging = Math.round(b.hang * em); }
        if (b.firstIndent) ind.firstLine = Math.round(b.firstIndent * em);
        children.push(new Paragraph({ children: runs(b.text, sz, b.bold, b.sp), alignment: AL[b.align] || AlignmentType.LEFT, indent: ind,
          spacing: { before: Math.round((b.before || 0) * 20), after: Math.round((b.after ?? 2) * 20), line: Math.round(240 * (sh.ls || 1.3)), lineRule: LineRuleType.AUTO } }));
      } else if (b.t === 'table') {
        const tsz = b.size || sh.size || 12, pad = b.pad != null ? b.pad : 2;
        const rows = layoutTable(b.rows).map(L => new TableRow({ cantSplit: true, tableHeader: !!L.row.hdr, children: L.pl.map(p => {
          const c = p.cell, sz = c.sz || tsz;
          const paras = cellText(c).split('\n').map(line => new Paragraph({ children: runs(line, sz, c.b), alignment: AL[c.al] || AlignmentType.LEFT, spacing: { before: 0, after: 0, line: 252, lineRule: LineRuleType.AUTO } }));
          return new TableCell({ children: paras, columnSpan: p.cs > 1 ? p.cs : undefined, rowSpan: p.rs > 1 ? p.rs : undefined,
            width: { size: colTw.slice(p.col, p.col + p.cs).reduce((a, b) => a + b, 0), type: WidthType.DXA },
            verticalAlign: c.va === 't' ? VerticalAlign.TOP : VerticalAlign.CENTER, borders,
            margins: { top: Math.round(pad * 20), bottom: Math.round(pad * 20), left: 70, right: 70 },
            shading: c.h ? { fill: 'F2F2F2', type: ShadingType.CLEAR, color: 'auto' } : undefined });
        }) }));
        children.push(new Table({ rows, width: { size: CW, type: WidthType.DXA }, columnWidths: colTw, layout: TableLayoutType.FIXED }));
      }
    }
    return { properties: { page: { size: { width: PAGE_W, height: PAGE_H }, margin: { top: MY, bottom: MY, left: MX, right: MX } } }, children };
  });
  const d = new Document({ creator: '人民團體會務線上填報', title: doc.title, styles: { default: { document: { run: { font: FONT, size: 24 } } } }, sections });
  return Packer.toBlob(d);
}

/* ===== Excel (.xlsx) ===== */
function textUnits(s, size) { let u = 0; for (const ch of String(s)) u += ch.charCodeAt(0) < 256 ? 1.1 : 2.05; return u * size / 11; }
function estLines(text, width, size) { return String(text ?? '').split('\n').reduce((n, line) => n + Math.max(1, Math.ceil(textUnits(line, size) / Math.max(4, width - 1.5))), 0); }
async function toXlsx(doc) {
  const ExcelJS = await loadLib('exceljs');
  const wb = new ExcelJS.Workbook(); wb.creator = '人民團體會務線上填報'; wb.created = new Date();
  const used = new Set();
  const thin = { style: 'thin', color: { argb: 'FF000000' } };
  const BORDER = { top: thin, left: thin, bottom: thin, right: thin };
  const AH = { c: 'center', r: 'right', j: 'justify', l: 'left' };
  for (const sh of doc.sheets) {
    let name = sh.name.replace(/[\[\]:*?\/\\]/g, '').slice(0, 31), k = 2;
    while (used.has(name)) name = sh.name.slice(0, 28) + '_' + (k++); used.add(name);
    const ws = wb.addWorksheet(name, { views: [{ showGridLines: false }], pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: true, margins: { left: 0.5, right: 0.5, top: 0.6, bottom: 0.6, header: 0.3, footer: 0.3 } } });
    const nc = sh.cols.length, tot = sh.cols.reduce((a, b) => a + b, 0), TW = nc === 1 ? 92 : 104;
    const colW = sh.cols.map(w => w / tot * TW);
    ws.columns = colW.map(w => ({ width: w }));
    const font = (sz, b) => ({ name: '標楷體', size: sz, bold: !!b });
    let r = 1; const keyRow = {}; const fm = [];
    for (const b of sh.blocks) {
      if (b.t === 'p') {
        const sz = b.size || sh.size || 12;
        if (nc > 1) ws.mergeCells(r, 1, r, nc);
        const cell = ws.getCell(r, 1);
        const pre = FW.repeat(Math.round(b.indent || 0) + Math.round(b.firstIndent || 0));
        cell.value = pre + (b.sp ? String(b.text).split('').join(' ') : b.text);
        cell.font = font(sz, b.bold);
        cell.alignment = { horizontal: AH[b.align] || 'left', vertical: 'middle', wrapText: true };
        const lines = estLines(cell.value, TW, sz);
        ws.getRow(r).height = Math.max(sz * 1.5, lines * sz * 1.4 + 2) + Math.min(14, (b.before || 0) * 0.5 + (b.after || 0) * 0.5);
        r++;
      } else if (b.t === 'table') {
        const tsz = b.size || sh.size || 12, pad = b.pad != null ? b.pad : 2;
        const lay = layoutTable(b.rows);
        lay.forEach((L, ri) => { if (L.row.key) keyRow[L.row.key] = r + ri; });
        lay.forEach((L, ri) => {
          const R = r + ri; let maxH = 0;
          for (const p of L.pl) {
            const c = p.cell, sz = c.sz || tsz, C = p.col + 1;
            if (p.cs > 1 || p.rs > 1) ws.mergeCells(R, C, R + p.rs - 1, C + p.cs - 1);
            const x = ws.getCell(R, C);
            const isNum = c.n && typeof c.v === 'number';
            if (c.f) fm.push({ x, f: c.f, R, v: isNum ? c.v : 0 });
            else x.value = isNum ? c.v : cellText(c);
            if (c.n) x.numFmt = '#,##0;-#,##0;0';
            x.font = font(sz, c.b);
            x.alignment = { horizontal: AH[c.al] || (c.n ? 'right' : 'left'), vertical: c.va === 't' ? 'top' : 'middle', wrapText: true };
            if (c.h) x.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
            for (let i = 0; i < p.rs; i++) for (let j = 0; j < p.cs; j++) ws.getCell(R + i, C + j).border = BORDER;
            const w = colW.slice(p.col, p.col + p.cs).reduce((a, b) => a + b, 0);
            const hh = (estLines(cellText(c), w, sz) * sz * 1.45 + 5 + pad * 2) / p.rs;
            if (hh > maxH) maxH = hh;
          }
          ws.getRow(R).height = Math.max(tsz * 1.7 + pad * 2, maxH);
        });
        r += lay.length;
      }
    }
    for (const it of fm) {
      let ok = true;
      const formula = it.f.replace(/\{([A-Z]+):([\w@]+)\}/g, (m, col, key) => { const rr = key === '@' ? it.R : keyRow[key]; if (!rr) ok = false; return col + rr; });
      it.x.value = ok ? { formula, result: it.v } : it.v;
    }
  }
  const buf = await wb.xlsx.writeBuffer();
  return new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/* ===== PDF ===== */
async function toPdf(doc, onProgress) {
  const [h2c, jsp] = await Promise.all([loadLib('h2c'), loadLib('jspdf')]);
  const MM = 96 / 25.4, MARG = 14, CWmm = 210 - 2 * MARG, CHmm = 297 - 2 * MARG;
  const stage = document.createElement('div'); stage.className = 'pdf-stage';
  document.body.appendChild(stage);
  const pdf = new jsp.jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
  let first = true;
  try {
    for (let si = 0; si < doc.sheets.length; si++) {
      onProgress && onProgress(si + 1, doc.sheets.length);
      stage.innerHTML = sheetHTML(doc.sheets[si]);
      const el = stage.firstElementChild;
      try { await document.fonts.ready; } catch (e) { }
      await new Promise(r => setTimeout(r, 30));
      const W = el.offsetWidth, H = el.offsetHeight, pageH = CHmm * MM * (W / (CWmm * MM));
      const top0 = el.getBoundingClientRect().top;
      const bps = [...el.querySelectorAll('p, tr')].filter(x => !(x.tagName === 'TR' && x.dataset.nb)).map(x => x.getBoundingClientRect().top - top0).filter(y => y > 0);
      const slices = []; let a = 0;
      while (H - a > pageH + 1) {
        let b = 0; for (const y of bps) if (y > a + 20 && y <= a + pageH) b = Math.max(b, y);
        if (!b) b = a + pageH;
        slices.push([a, b]); a = b;
      }
      slices.push([a, H]);
      const canvas = await h2c(el, { scale: 2, backgroundColor: '#ffffff', logging: false, useCORS: true, windowWidth: document.documentElement.clientWidth });
      const k = canvas.width / W;
      for (const [s, e] of slices) {
        const c = document.createElement('canvas'); c.width = canvas.width; c.height = Math.max(1, Math.round((e - s) * k));
        const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
        g.drawImage(canvas, 0, Math.round(s * k), canvas.width, c.height, 0, 0, c.width, c.height);
        if (!first) pdf.addPage(); first = false;
        pdf.addImage(c.toDataURL('image/jpeg', 0.92), 'JPEG', MARG, MARG, CWmm, (e - s) * CWmm / W);
      }
    }
  } finally { stage.remove(); }
  return pdf.output('blob');
}

/* ===== 儲存檔案 ===== */
let DLP = null;
function dlNS() {
  if (!DLP) DLP = (async () => { try { if (window.claude && window.claude.use) return await window.claude.use('downloads'); } catch (e) { } return null; })();
  return DLP;
}
async function saveFile(filename, blob) {
  if (window.claude && window.claude.use) {
    const dl = await dlNS();
    if (!dl) { toast('目前的檢視無法下載檔案，請在 claude.ai 開啟此頁面後再試。', 'err'); return false; }
    try { await dl.save({ filename, data: blob }); toast('已下載：' + filename); return true; }
    catch (e) {
      if (e && e.code === 'declined') toast('已取消下載');
      else if (e && e.code === 'rate_limited') toast('已有下載確認視窗開啟中，請稍候再試', 'err');
      else toast('下載失敗：' + ((e && (e.message || e.code)) || e), 'err');
      return false;
    }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  toast('已下載：' + filename); return true;
}
async function exportDoc(doc, fmtType, baseName) {
  const file = `${baseName}.${fmtType}`;
  const busy = showBusy(`正在產生 ${fmtType === 'docx' ? 'Word' : fmtType === 'xlsx' ? 'Excel' : 'PDF'} 檔…`);
  try {
    let blob;
    if (fmtType === 'docx') blob = await toDocx(doc);
    else if (fmtType === 'xlsx') blob = await toXlsx(doc);
    else blob = await toPdf(doc, (i, n) => busy.set(`正在產生 PDF（第 ${i}/${n} 張表）…`));
    busy.done();
    return await saveFile(file, blob);
  } catch (e) { busy.done(); console.error(e); toast('產生檔案失敗：' + (e.message || e), 'err'); return false; }
}
