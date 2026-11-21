/* ===== 文件模型 =====
 sheet: {name, cols:[相對寬度], size(pt), ls(行距), land(橫式), blocks:[...]}
 p: {t:'p', text, align:'c'|'r'|'j', size, bold, indent(em), hang(em), firstIndent, before, after(pt), sp(字距em)}
 table: {t:'table', size, pad, rows:[{key, hdr, h(最小列高pt), cells:[{v, cs, rs, al, b, n(數字), f(公式樣板), h(底色), sz, va}]}]}
 pb: {t:'pb'} 分頁
*/
const P = (text, o = {}) => ({ t: 'p', text, ...o });
const T = (rows, o = {}) => ({ t: 'table', rows, ...o });
const PB = () => ({ t: 'pb' });
const TITLE = (text, o = {}) => P(text, { align: 'c', size: 16, bold: true, after: 8, ...o });
const NUMC = (n, o = {}) => ({ v: n, n: true, al: 'r', ...o });
/* ===== 用印位置標記 =====
 SA(位置, cx, cy)：在文字中插入看不見的用印錨點；cx、cy 為印章中心相對錨點的位移（以字高 em 計）。
 位置：'@org' 團體圖記／大章；'職稱|姓名' 職章或個人印鑑、簽名。 */
const SA = (key, cx = 2, cy = 0) => `\uE000${key}~${cx}~${cy}\uE001`;
const SA_RE = /\uE000([^\uE001~]*)~([^~\uE001]*)~([^\uE001]*)\uE001/g;
const saStrip = s => String(s ?? '').replace(SA_RE, '');
/** 在「（簽章）」等字前放錨點，印章中心落在括號字中央 */
function STAMP(slot, label = '（簽章）') { return SA(slot, label.length / 2, 0) + label; }
function slotOf(title, name) { return `${normTitle(title)}|${String(name || '').trim()}`; }
function sigLine(pairs) {
  const g = pairs.length > 4 ? 2 : 3, ph = FW.repeat(pairs.length > 4 ? 3 : 4);
  return pairs.map(([k, v]) => `${k}${v ? v : ph}${SA(slotOf(k, v), v ? 0.8 : -ph.length / 2)}`).join(FW.repeat(g));
}

function layoutTable(rows) {
  const occ = []; const out = [];
  rows.forEach((row, ri) => {
    occ[ri] = occ[ri] || [];
    const cont = occ[ri].some(Boolean);
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
const htmlText = (s, fs) => esc(s).replace(SA_RE, (m, k, cx, cy) => `<span class="sa" data-sa="${k}" data-cx="${cx}" data-cy="${cy}" data-fs="${fs}">\u200b</span>`);
function sheetHTML(sh) {
  const tot = sh.cols.reduce((a, b) => a + b, 0);
  let h = `<div class="sheet${sh.land ? ' land' : ''}"${sh.dk ? ` data-dk="${esc(sh.dk)}" data-dsi="${sh.dsi || 0}"` : ''} style="font-size:${sh.size || 12}pt;line-height:${sh.ls || 1.4}">`;
  for (const b of sh.blocks) {
    if (b.t === 'p') {
      const st = [`text-align:${ALC[b.align] || 'left'}`];
      if (b.size) st.push(`font-size:${b.size}pt`);
      if (b.bold) st.push('font-weight:700');
      const ind = (b.indent || 0) + (b.hang || 0); if (ind) st.push(`padding-left:${ind}em`);
      if (b.hang) st.push(`text-indent:-${b.hang}em`);
      if (b.firstIndent) st.push(`text-indent:${b.firstIndent}em`);
      if (b.sp) st.push(`letter-spacing:${b.sp}em`);
      if (b.lh) st.push(`line-height:${b.lh}`);
      st.push(`margin:${b.before || 0}pt 0 ${b.after ?? 2}pt`);
      h += `<p style="${st.join(';')}">${htmlText(b.text, b.size || sh.size || 12) || '&nbsp;'}</p>`;
    } else if (b.t === 'pb') {
      h += '<div class="pb" data-pb="1"></div>';
    } else if (b.t === 'table') {
      const pad = b.pad != null ? b.pad : 2;
      h += `<table style="font-size:${b.size || sh.size}pt${b.noBorder ? '' : ''}"${b.noBorder ? ' class="nob"' : ''}><colgroup>${sh.cols.map(w => `<col style="width:${(w / tot * 100).toFixed(3)}%">`).join('')}</colgroup>`;
      for (const L of layoutTable(b.rows)) {
        h += `<tr${L.cont ? ' data-nb="1"' : ''}${L.row.h ? ` style="height:${L.row.h}pt"` : ''}>`;
        for (const p of L.pl) {
          const c = p.cell, st = [`text-align:${ALC[c.al] || 'left'}`, `padding:${pad}pt 3pt`];
          if (c.b) st.push('font-weight:700'); if (c.sz) st.push(`font-size:${c.sz}pt`); if (c.va === 't') st.push('vertical-align:top'); if (c.va === 'b') st.push('vertical-align:bottom');
          h += `<td${p.cs > 1 ? ` colspan="${p.cs}"` : ''}${p.rs > 1 ? ` rowspan="${p.rs}"` : ''}${c.h ? ' class="h"' : ''} style="${st.join(';')}">${htmlText(cellText(c), c.sz || b.size || sh.size || 12)}</td>`;
        }
        h += '</tr>';
      }
      h += '</table>';
    }
  }
  return h + '</div>';
}

/* ===== 函式庫 ===== */
const LIBS = {
  docx: ['https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.js', () => window.docx],
  exceljs: ['https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js', () => window.ExcelJS],
  h2c: ['https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', () => window.html2canvas],
  jspdf: ['https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', () => window.jspdf],
  jszip: ['https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js', () => window.JSZip],
  pdflib: ['https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js', () => window.PDFLib],
  gsi: ['https://accounts.google.com/gsi/client', () => window.google && window.google.accounts && window.google.accounts.oauth2 && window.google],
};
const libP = {};
function loadLib(k) {
  if (LIBS[k][1]()) return Promise.resolve(LIBS[k][1]());
  if (!libP[k]) libP[k] = new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = LIBS[k][0]; s.async = true;
    s.onload = () => LIBS[k][1]() ? res(LIBS[k][1]()) : rej(new Error('函式庫載入失敗：' + k));
    s.onerror = () => { delete libP[k]; s.remove(); rej(new Error('無法下載產生檔案的元件，請確認網路連線後再試一次')); };
    document.head.appendChild(s);
  });
  return libP[k];
}

/* ===== Word (.docx) ===== */
async function toDocx(doc) {
  const X = await loadLib('docx');
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, VerticalAlign, BorderStyle, ShadingType, TableLayoutType, LineRuleType, PageOrientation, HeightRule, ImageRun, HorizontalPositionRelativeFrom: HR, VerticalPositionRelativeFrom: VR, TextWrappingType } = X;
  const SP = await stampPrep(doc, 'docx');
  let zi = 1;
  /* 印章：放在文字後方（黑字自然透出，等同色彩相乘），不透明度 90% */
  const imgRun = (it, fs, ls, top) => {
    const g = SP.geo(it), w = g.bw, h = g.bh;
    const lineC = top ? 0 : fs * 1.25 * ls * PT_MM / 2;
    const ox = top ? it.ax - w / 2 + top.mx : g.dx - w / 2, oy = top ? it.ay - h / 2 + top.my : lineC + g.dy - h / 2;
    return new ImageRun({ data: SP.png(it.sid, g.rot), transformation: { width: w * PX_MM, height: h * PX_MM },
      floating: { horizontalPosition: { relative: top ? HR.PAGE : HR.CHARACTER, offset: Math.round(ox * 36000) }, verticalPosition: { relative: top ? VR.PAGE : VR.LINE, offset: Math.round(oy * 36000) },
        behindDocument: true, allowOverlap: true, lockAnchor: true, layoutInCell: !top, wrap: { type: TextWrappingType.NONE }, zIndex: zi++ } });
  };
  const FONT = { ascii: 'Times New Roman', hAnsi: 'Times New Roman', eastAsia: '標楷體', cs: 'Times New Roman' };
  const AL = { c: AlignmentType.CENTER, r: AlignmentType.RIGHT, j: AlignmentType.BOTH, l: AlignmentType.LEFT };
  const VA = { t: VerticalAlign.TOP, b: VerticalAlign.BOTTOM };
  let CUR = null; // 目前工作表的用印資訊
  const runs = (text, size, bold, sp, ls = 1.3) => {
    const out = [], mk = (t, br) => new TextRun({ text: t, break: br ? 1 : 0, font: FONT, size: Math.round(size * 2), bold: !!bold, characterSpacing: sp ? Math.round(sp * size * 20) : undefined });
    if (CUR && CUR.top.length) { CUR.top.forEach(it => out.push(imgRun(it, size, ls, CUR.mg))); CUR.top = []; }
    String(text ?? '').split('\n').forEach((line, li) => {
      let last = 0, first = true, m; SA_RE.lastIndex = 0;
      while ((m = SA_RE.exec(line))) {
        if (m.index > last || (li && first)) { out.push(mk(line.slice(last, m.index), li && first)); first = false; }
        if (CUR) { const key = m[1], n = CUR.cnt[key] = (CUR.cnt[key] ?? -1) + 1; (CUR.at[key + '#' + n] || []).forEach(it => out.push(imgRun({ ...it, fs: size }, size, ls))); }
        last = SA_RE.lastIndex;
      }
      if (last < line.length || first) out.push(mk(line.slice(last), li && first));
    });
    return out;
  };
  const B1 = { style: BorderStyle.SINGLE, size: 6, color: '000000' };
  const B0 = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  const sections = doc.sheets.map(sh => {
    const PW = sh.land ? 16838 : 11906, MX = 964, MY = 1020, CW = PW - 2 * MX;
    CUR = SP.sheet(sh); if (CUR) CUR.mg = { mx: MX / 56.693, my: MY / 56.693 };
    const tot = sh.cols.reduce((a, b) => a + b, 0);
    const colTw = sh.cols.map(w => Math.floor(w / tot * CW));
    const children = []; let pbNext = false;
    for (const b of sh.blocks) {
      if (b.t === 'pb') { pbNext = true; continue; }
      if (b.t === 'p') {
        const sz = b.size || sh.size || 12, em = sz * 20;
        const ind = {};
        if (b.indent || b.hang) { ind.left = Math.round(((b.indent || 0) + (b.hang || 0)) * em); if (b.hang) ind.hanging = Math.round(b.hang * em); }
        if (b.firstIndent) ind.firstLine = Math.round(b.firstIndent * em);
        children.push(new Paragraph({ children: runs(b.text, sz, b.bold, b.sp, b.lh || sh.ls || 1.3), alignment: AL[b.align] || AlignmentType.LEFT, indent: ind, pageBreakBefore: pbNext,
          spacing: { before: Math.round((b.before || 0) * 20), after: Math.round((b.after ?? 2) * 20), line: Math.round(240 * (b.lh || sh.ls || 1.3)), lineRule: LineRuleType.AUTO } }));
        pbNext = false;
      } else if (b.t === 'table') {
        if (pbNext) { children.push(new Paragraph({ children: [], pageBreakBefore: true, spacing: { before: 0, after: 0 } })); pbNext = false; }
        const tsz = b.size || sh.size || 12, pad = b.pad != null ? b.pad : 2;
        const bd = b.noBorder ? { top: B0, bottom: B0, left: B0, right: B0 } : { top: B1, bottom: B1, left: B1, right: B1 };
        const rows = layoutTable(b.rows).map(L => new TableRow({ cantSplit: true, tableHeader: !!L.row.hdr, height: L.row.h ? { value: Math.round(L.row.h * 20), rule: HeightRule.ATLEAST } : undefined, children: L.pl.map(p => {
          const c = p.cell, sz = c.sz || tsz;
          const paras = cellText(c).split('\n').map(line => new Paragraph({ children: runs(line, sz, c.b, 0, b.ls || 1.1), alignment: AL[c.al] || AlignmentType.LEFT, spacing: { before: 0, after: 0, line: Math.round(240 * (b.ls || 1.1)), lineRule: LineRuleType.AUTO } }));
          return new TableCell({ children: paras, columnSpan: p.cs > 1 ? p.cs : undefined, rowSpan: p.rs > 1 ? p.rs : undefined,
            width: { size: colTw.slice(p.col, p.col + p.cs).reduce((a, b) => a + b, 0), type: WidthType.DXA },
            verticalAlign: VA[c.va] || VerticalAlign.CENTER, borders: bd,
            margins: { top: Math.round(pad * 20), bottom: Math.round(pad * 20), left: 70, right: 70 },
            shading: c.h ? { fill: 'F2F2F2', type: ShadingType.CLEAR, color: 'auto' } : undefined });
        }) }));
        children.push(new Table({ rows, width: { size: CW, type: WidthType.DXA }, columnWidths: colTw, layout: TableLayoutType.FIXED }));
      }
    }
    if (!children.length || (CUR && CUR.top.length)) children.push(new Paragraph({ children: runs('', sh.size || 12, false) }));
    return { properties: { page: { size: { width: 11906, height: 16838, orientation: sh.land ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT }, margin: { top: MY, bottom: MY, left: MX, right: MX } } }, children };
  });
  const d = new Document({ creator: '屏東縣人民團體會務文件線上填報', title: doc.title, styles: { default: { document: { run: { font: FONT, size: 24 } } } }, sections });
  return Packer.toBlob(d);
}

/* ===== Excel (.xlsx) ===== */
function textUnits(s, size) { let u = 0; for (const ch of saStrip(s)) u += ch.charCodeAt(0) < 256 ? 1.1 : 2.05; return u * size / 11; }
/** 文字寬度（px，標楷體近似） */
function textPx(s, size) { let u = 0; for (const ch of saStrip(s)) u += ch.charCodeAt(0) < 256 ? 0.55 : 1; return u * size * 4 / 3; }
function estLines(text, width, size) { return String(text ?? '').split('\n').reduce((n, line) => n + Math.max(1, Math.ceil(textUnits(line, size) / Math.max(4, width - 1.5))), 0); }
async function toXlsx(doc) {
  const ExcelJS = await loadLib('exceljs');
  const SP = await stampPrep(doc, 'xlsx'), imgIds = {};
  const wb = new ExcelJS.Workbook(); wb.creator = '屏東縣人民團體會務文件線上填報'; wb.created = new Date();
  const used = new Set();
  const thin = { style: 'thin', color: { argb: 'FF000000' } };
  const BORDER = { top: thin, left: thin, bottom: thin, right: thin };
  const AH = { c: 'center', r: 'right', j: 'justify', l: 'left' };
  for (const sh of doc.sheets) {
    let name = sh.name.replace(/[\[\]:*?\/\\]/g, '').slice(0, 31), k = 2;
    while (used.has(name)) name = sh.name.replace(/[\[\]:*?\/\\]/g, '').slice(0, 27) + '_' + (k++); used.add(name);
    const ws = wb.addWorksheet(name, { views: [{ showGridLines: false }], pageSetup: { paperSize: 9, orientation: sh.land ? 'landscape' : 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: true, margins: { left: 0.5, right: 0.5, top: 0.6, bottom: 0.6, header: 0.3, footer: 0.3 } } });
    const nc = sh.cols.length, tot = sh.cols.reduce((a, b) => a + b, 0), TW = (nc === 1 ? 92 : 104) * (sh.land ? 1.42 : 1);
    const colW = sh.cols.map(w => w / tot * TW);
    ws.columns = colW.map(w => ({ width: w }));
    const font = (sz, b) => ({ name: '標楷體', size: sz, bold: !!b });
    let r = 1; const keyRow = {}; const fm = []; const anc = [];
    for (const b of sh.blocks) {
      if (b.t === 'pb') { if (r > 1) ws.getRow(r - 1).addPageBreak(); continue; }
      if (b.t === 'p') {
        const sz = b.size || sh.size || 12;
        if (nc > 1) ws.mergeCells(r, 1, r, nc);
        const cell = ws.getCell(r, 1);
        const pre = FW.repeat(Math.round(b.indent || 0) + Math.round(b.firstIndent || 0));
        const full = pre + (b.sp ? String(b.text).split('').join(' ') : b.text);
        if (SA_RE.test(full)) anc.push({ r, c0: 0, cs: nc, rs: 1, text: full, fs: sz, al: b.align || 'l' }); SA_RE.lastIndex = 0;
        cell.value = saStrip(full);
        cell.font = font(sz, b.bold);
        cell.alignment = { horizontal: AH[b.align] || 'left', vertical: 'middle', wrapText: true };
        const lines = estLines(cell.value, TW, sz);
        ws.getRow(r).height = Math.max(sz * 1.5, lines * sz * (b.lh ? Math.max(1, b.lh) : 1.4) + 2) + Math.min(14, (b.before || 0) * 0.5 + (b.after || 0) * 0.5);
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
            else x.value = isNum ? c.v : saStrip(cellText(c));
            if (!isNum && SA_RE.test(cellText(c))) anc.push({ r: R, c0: p.col, cs: p.cs, rs: p.rs, text: cellText(c), fs: sz, al: c.al || (c.n ? 'r' : 'l'), va: c.va, pad }); SA_RE.lastIndex = 0;
            if (c.n) x.numFmt = '#,##0;-#,##0;0';
            x.font = font(sz, c.b);
            x.alignment = { horizontal: AH[c.al] || (c.n ? 'right' : 'left'), vertical: c.va === 't' ? 'top' : (c.va === 'b' ? 'bottom' : 'middle'), wrapText: true };
            if (c.h) x.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
            if (!b.noBorder) for (let i = 0; i < p.rs; i++) for (let j = 0; j < p.cs; j++) ws.getCell(R + i, C + j).border = BORDER;
            const w = colW.slice(p.col, p.col + p.cs).reduce((a, b) => a + b, 0);
            const hh = (estLines(cellText(c), w, sz) * sz * 1.45 + 5 + pad * 2) / p.rs;
            if (hh > maxH) maxH = hh;
          }
          ws.getRow(R).height = Math.max(tsz * 1.7 + pad * 2, maxH, L.row.h || 0);
        });
        r += lay.length;
      }
    }
    const st = SP.sheet(sh);
    if (st && (anc.length || st.top.length)) {
      const colPx = colW.map(w => Math.round(w * 7 + 5)), rowPx = i => ((ws.getRow(i).height || 15) * 4 / 3);
      /* 以 EMU 直接指定錨點（ExcelJS 的小數欄列換算會低估欄寬） */
      const toAnchor = (xpx, ypx) => {
        let c = 0, x = Math.max(0, xpx); while (c < colPx.length - 1 && x >= colPx[c]) { x -= colPx[c]; c++; }
        let rr = 1, y = Math.max(0, ypx); while (rr < r + 80 && y >= rowPx(rr)) { y -= rowPx(rr); rr++; }
        return { nativeCol: c, nativeColOff: Math.round(Math.min(x, colPx[c] - 1) * 9525), nativeRow: rr - 1, nativeRowOff: Math.round(Math.min(y, rowPx(rr) - 1) * 9525) };
      };
      const put = (it, cx, cy) => {
        const g = SP.geo(it), key = it.sid + '|' + (g.rot || 0);
        if (!imgIds[key]) imgIds[key] = wb.addImage({ base64: SP.png(it.sid, g.rot), extension: 'png' });
        const bw = g.bw * PX_MM, bh = g.bh * PX_MM;
        ws.addImage(imgIds[key], { tl: toAnchor(cx - bw / 2, cy - bh / 2), ext: { width: bw, height: bh }, editAs: 'oneCell' });
      };
      const cnt = {};
      for (const a of anc) {
        let x0 = 0; for (let i = 0; i < a.c0; i++) x0 += colPx[i];
        let y0 = 0; for (let i = 1; i < a.r; i++) y0 += rowPx(i);
        let cw = 0; for (let i = a.c0; i < a.c0 + a.cs; i++) cw += colPx[i];
        let ch = 0; for (let i = a.r; i < a.r + a.rs; i++) ch += rowPx(i);
        const lines = String(a.text).split('\n'), lh = a.fs * 1.45 * 4 / 3, tot = lines.length * lh;
        const top = a.va === 't' ? (a.pad || 2) * 4 / 3 : a.va === 'b' ? ch - tot - 3 : (ch - tot) / 2;
        lines.forEach((ln, li) => {
          const re = new RegExp(SA_RE.source, 'g'); let m;
          while ((m = re.exec(ln))) {
            const key = m[1], n = cnt[key] = (cnt[key] ?? -1) + 1, its = st.at[key + '#' + n]; if (!its) continue;
            const lw = textPx(ln, a.fs), pw = textPx(ln.slice(0, m.index), a.fs);
            const lx = a.al === 'c' ? (cw - lw) / 2 : a.al === 'r' ? cw - lw - 4 : 4;
            const ax = x0 + lx + pw, ay = y0 + top + li * lh + lh / 2;
            for (const it of its) { const g = SP.geo({ ...it, fs: a.fs }); put(it, ax + g.dx * PX_MM, ay + g.dy * PX_MM); }
          }
        });
      }
      for (const it of st.top) put(it, (it.ax + 3) * PX_MM, (it.ay + 3) * PX_MM);
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
  const MARG = 14;
  const stage = document.createElement('div'); stage.className = 'pdf-stage';
  document.body.appendChild(stage);
  let pdf = null;
  try {
    for (let si = 0; si < doc.sheets.length; si++) {
      onProgress && onProgress(si + 1, doc.sheets.length);
      const sh = doc.sheets[si], land = !!sh.land;
      const CWmm = (land ? 297 : 210) - 2 * MARG, CHmm = (land ? 210 : 297) - 2 * MARG;
      stage.innerHTML = sheetHTML(sh);
      stage.style.width = CWmm + 'mm';
      const el = stage.firstElementChild;
      try { await document.fonts.ready; } catch (e) { }
      await new Promise(r => setTimeout(r, 30));
      const seals = await stampBoxes(el, sh);
      const W = el.offsetWidth, H = el.offsetHeight, pageH = CHmm * (W / CWmm);
      const top0 = el.getBoundingClientRect().top;
      const forced = [...el.querySelectorAll('[data-pb]')].map(x => x.getBoundingClientRect().top - top0);
      const bps = [...el.querySelectorAll('p, tr')].filter(x => !(x.tagName === 'TR' && x.dataset.nb)).map(x => x.getBoundingClientRect().top - top0).filter(y => y > 0);
      const slices = []; let a = 0;
      while (true) {
        const f = forced.find(y => y > a + 2 && y <= a + pageH);
        if (f != null) { slices.push([a, f]); a = f; continue; }
        if (H - a <= pageH + 1) break;
        let b = 0; for (const y of bps) if (y > a + 20 && y <= a + pageH) b = Math.max(b, y);
        if (!b) b = a + pageH;
        slices.push([a, b]); a = b;
      }
      if (H - a > 2) slices.push([a, H]);
      const canvas = await h2c(el, { scale: 2, backgroundColor: '#ffffff', logging: false, useCORS: true, windowWidth: Math.max(1200, document.documentElement.clientWidth) });
      const k = canvas.width / W, pxmm = W / CWmm * k, PWmm = land ? 297 : 210, PHmm = land ? 210 : 297;
      for (const [s, e] of slices) {
        /* 整頁畫布（含邊界），印章依錨點所在頁面合成，可以超出內文範圍 */
        const c = document.createElement('canvas'); c.width = Math.round(PWmm * pxmm); c.height = Math.round(PHmm * pxmm);
        const g = c.getContext('2d'), ox = MARG * pxmm, oy = MARG * pxmm, hh = Math.max(1, Math.round((e - s) * k));
        g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
        g.drawImage(canvas, 0, Math.round(s * k), canvas.width, hh, ox, oy, canvas.width, hh);
        for (const b of seals) if (b.ay >= s - 1 && b.ay < e - 1) {
          /* 換頁後若印章超出紙張，就往內移，確保整顆印章都在同一頁 */
          const half = (Math.abs(b.w * Math.sin(b.rot * Math.PI / 180)) + Math.abs(b.h * Math.cos(b.rot * Math.PI / 180))) / 2, lim = 3 * pxmm / k;
          let cy = b.cy - s; const top = oy / k + cy - half, bot = oy / k + cy + half, PH = c.height / k;
          if (top < lim) cy += lim - top; else if (bot > PH - lim) cy -= bot - (PH - lim);
          drawSeal(g, { ...b, cy }, k, ox, oy);
        }
        if (!pdf) pdf = new jsp.jsPDF({ unit: 'mm', format: 'a4', orientation: land ? 'landscape' : 'portrait', compress: true });
        else pdf.addPage('a4', land ? 'landscape' : 'portrait');
        pdf.addImage(c.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, PWmm, PHmm);
      }
    }
  } finally { stage.remove(); }
  return pdf.output('blob');
}

/* ===== 儲存 ===== */
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
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
  toast('已下載：' + filename); return true;
}
const FMT_NAME = { docx: 'Word', xlsx: 'Excel', pdf: 'PDF' };
async function makeBlob(doc, f, onProg) { return f === 'docx' ? toDocx(doc) : f === 'xlsx' ? toXlsx(doc) : toPdf(doc, onProg); }
async function exportDoc(doc, f, baseName) {
  const busy = showBusy(`正在產生 ${FMT_NAME[f]} 檔…`);
  try {
    const blob = await makeBlob(doc, f, (i, n) => busy.set(`正在產生 PDF（第 ${i}/${n} 頁表單）…`));
    busy.done();
    return await saveFile(`${baseName}.${f}`, blob);
  } catch (e) { busy.done(); console.error(e); toast('產生檔案失敗：' + (e.message || e), 'err'); return false; }
}
async function exportZip(items, f, zipName) {
  const busy = showBusy(`正在產生 ${items.length} 份 ${FMT_NAME[f]} 檔…`);
  try {
    const JSZip = await loadLib('jszip');
    const zip = new JSZip(); const usedN = {};
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      busy.set(`正在產生第 ${i + 1}/${items.length} 份：${it.name}`);
      let fn = `${String(i + 1).padStart(2, '0')}_${it.name}`.replace(/[\\/:*?"<>|]/g, '');
      if (usedN[fn]) fn += '_' + (++usedN[fn]); else usedN[fn] = 1;
      if (it.doc) zip.file(`${fn}.${f}`, await makeBlob(it.doc, f));
      if (it.files) { const L = await it.files(), others = L.filter(u => !u.merged); L.forEach(u => zip.file(u.merged ? `${fn}${u.name}` : `${fn}_附件${others.length > 1 ? others.indexOf(u) + 1 : ''}_${u.name.replace(/[\\/:*?"<>|]/g, '')}`, u.blob)); }
    }
    busy.set('正在壓縮…');
    const out = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
    busy.done();
    return await saveFile(zipName + '.zip', out);
  } catch (e) { busy.done(); console.error(e); toast('產生檔案失敗：' + (e.message || e), 'err'); return false; }
}
