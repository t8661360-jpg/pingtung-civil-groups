/* ===== 附件上傳：簽到後的簽到表、現行章程、證件與權狀影本等 =====
 檔案只存在這台裝置的瀏覽器（IndexedDB）；下載壓縮檔或合併 PDF 時一併附上。
 S.files = { 上傳鍵: [{fid, name, type, size, at}] } */
const FILEC = new Map(), FURL = new Map();
const FileDB = {
  put: (fid, blob) => { FILEC.set(fid, blob); return IDBX.run('files', 'readwrite', st => st.put(blob, fid)); },
  get: async fid => FILEC.get(fid) || (await IDBX.run('files', 'readonly', st => st.get(fid))) || null,
  del: fid => { FILEC.delete(fid); if (FURL.has(fid)) { URL.revokeObjectURL(FURL.get(fid)); FURL.delete(fid); } return IDBX.run('files', 'readwrite', st => st.delete(fid)); },
};
const upKey = (sc, x) => x.upk || `${sc}:${x.id}`;
const upList = (sc, x) => ((S.files || {})[upKey(sc, x)] || []);
const fsize = n => n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
async function decodeImage(blob) {
  if (window.createImageBitmap) { try { return await createImageBitmap(blob, { imageOrientation: 'from-image' }); } catch (e) { } }
  const url = URL.createObjectURL(blob);
  try { return await loadImgUrl(url); } finally { setTimeout(() => URL.revokeObjectURL(url), 2000); }
}
/** 照片縮到長邊 2200px、JPEG，避免檔案過大 */
async function shrinkImage(file, max = 2200, q = 0.85) {
  const im = await decodeImage(file), w = im.naturalWidth || im.width, h = im.naturalHeight || im.height, k = Math.min(1, max / Math.max(w, h));
  const c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k);
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0, c.width, c.height);
  const blob = await new Promise(res => c.toBlob(res, 'image/jpeg', q));
  return { blob, w: c.width, h: c.height };
}
let UPT = null; // 目前要上傳到哪一項
function upPick(sc, id) { const x = docsOf(sc).find(d => d.id === id) || scenDocs(sc).find(d => d.id === id); if (!x) return; UPT = { sc, x }; $('#upIn').value = ''; $('#upIn').click(); }
async function upAdd(sc, x, files) {
  const busy = showBusy('正在加入檔案…'); let n = 0;
  try {
    for (const f of files) {
      if (f.size > 25 * 1048576) { toast(`「${f.name}」超過 25 MB，請先壓縮或分頁掃描`, 'err'); continue; }
      let blob = f, type = f.type || '', name = f.name || '附件';
      if (/^image\//.test(type) && !/svg/.test(type)) {
        try { blob = (await shrinkImage(f)).blob; type = 'image/jpeg'; name = name.replace(/\.\w+$/, '') + '.jpg'; }
        catch (e) { toast(`無法讀取「${f.name}」，請改用 JPG、PNG 或 PDF（iPhone 可在相機設定選「最相容」）`, 'err'); continue; }
      }
      const fid = 'f' + uid() + uid();
      await FileDB.put(fid, blob);
      S.files = S.files || {}; const k = upKey(sc, x); (S.files[k] = S.files[k] || []).push({ fid, name, type, size: blob.size, at: Date.now() });
      n++;
    }
    if (n && !x.req) { S.sel[sc] = S.sel[sc] || {}; S.sel[sc][x.id] = true; }
    save();
  } finally { busy.done(); }
  if (n) toast(`已加入 ${n} 個檔案${IDBX.persistent() ? '' : '（這個瀏覽器無法長期保存，請在離開前下載）'}`);
  render();
}
async function upDel(sc, id, fid) {
  const x = scenDocs(sc).find(d => d.id === id); if (!x) return;
  const k = upKey(sc, x), L = (S.files || {})[k] || [], f = L.find(z => z.fid === fid); if (!f) return;
  if (!(await ask(`移除「${f.name}」？`))) return;
  S.files[k] = L.filter(z => z.fid !== fid); if (!S.files[k].length) delete S.files[k];
  if (!Object.values(S.files).some(l => l.some(z => z.fid === fid))) await FileDB.del(fid);
  save(); render();
}
/** 下載頁：已上傳的檔案清單 */
function upHTML(sc, x) {
  const L = upList(sc, x);
  return `<div class="ups">${L.map(f => `<span class="upf">${/^image\//.test(f.type) ? `<img data-fid="${f.fid}" alt="">` : `<i class="ext">${esc((f.name.split('.').pop() || '').slice(0, 4).toUpperCase())}</i>`}<span class="un">${esc(f.name)}<small>${fsize(f.size)}</small></span><button class="x" data-updel="${x.id}" data-fid="${f.fid}" aria-label="移除 ${esc(f.name)}">${icon('x')}</button></span>`).join('')}
    <button class="mini up" data-up="${x.id}">${icon('clip')}${L.length ? '再上傳' : `上傳${typeof x.up === 'string' ? x.up : '檔案'}`}</button></div>`;
}
async function upThumbs(root = document) {
  for (const im of $$('img[data-fid]', root)) {
    const fid = im.dataset.fid; if (im.src) continue;
    if (!FURL.has(fid)) { const b = await FileDB.get(fid); if (!b) { im.replaceWith(Object.assign(document.createElement('i'), { className: 'ext miss', textContent: '遺失' })); continue; } FURL.set(fid, URL.createObjectURL(b)); }
    im.src = FURL.get(fid);
  }
}
/** 壓縮檔用：同一項的照片合併成一份 PDF，PDF 與其他檔案原樣附上 */
async function upBlobs(sc, x) {
  const L = upList(sc, x), out = [], imgs = [];
  for (const f of L) { const b = await FileDB.get(f.fid); if (!b) continue; if (/^image\//.test(f.type)) imgs.push(b); else out.push({ name: f.name, blob: b }); }
  if (imgs.length) out.unshift({ name: '（上傳影本）.pdf', blob: await imagesToPdf(imgs), merged: true });
  return out;
}
async function imagesToPdf(blobs) {
  const jsp = await loadLib('jspdf'); let pdf = null;
  for (const b of blobs) {
    const im = await decodeImage(b), w = im.naturalWidth || im.width, h = im.naturalHeight || im.height, land = w > h;
    const PW = land ? 297 : 210, PH = land ? 210 : 297, m = 8, k = Math.min((PW - 2 * m) / w, (PH - 2 * m) / h);
    if (!pdf) pdf = new jsp.jsPDF({ unit: 'mm', format: 'a4', orientation: land ? 'landscape' : 'portrait', compress: true }); else pdf.addPage('a4', land ? 'landscape' : 'portrait');
    const url = await new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(b); });
    pdf.addImage(url, 'JPEG', (PW - w * k) / 2, (PH - h * k) / 2, w * k, h * k);
  }
  return pdf.output('blob');
}
/** 合併成一份送件 PDF：送件檢核表、各文件、上傳的附件，依清單順序 */
async function mergedPdf(sc) {
  const busy = showBusy('正在準備合併 PDF…');
  try {
    const PL = await loadLib('pdflib'), out = await PL.PDFDocument.create(), skipped = [];
    const addPdf = async blob => { const src = await PL.PDFDocument.load(await blob.arrayBuffer(), { ignoreEncryption: true }); (await out.copyPages(src, src.getPageIndices())).forEach(p => out.addPage(p)); };
    const addImg = async blob => {
      const bytes = new Uint8Array(await blob.arrayBuffer()), img = blob.type === 'image/png' ? await out.embedPng(bytes) : await out.embedJpg(bytes);
      const land = img.width > img.height, W = land ? 841.89 : 595.28, H = land ? 595.28 : 841.89, m = 22, k = Math.min((W - 2 * m) / img.width, (H - 2 * m) / img.height);
      out.addPage([W, H]).drawImage(img, { x: (W - img.width * k) / 2, y: (H - img.height * k) / 2, width: img.width * k, height: img.height * k });
    };
    const list = selDocs(sc);
    busy.set('正在產生送件檢核表…'); await addPdf(await makeBlob(docChecklist(sc), 'pdf'));
    for (let i = 0; i < list.length; i++) {
      const x = list[i];
      if (x.kind !== 'attach') { busy.set(`正在產生第 ${i + 1}/${list.length} 份：${x.name}`); await addPdf(await makeBlob(keyed(sc, x), 'pdf')); }
      for (const f of upList(sc, x)) {
        const b = await FileDB.get(f.fid); if (!b) continue;
        try { if (/^image\/(jpeg|png)$/.test(f.type)) await addImg(b); else if (f.type === 'application/pdf' || /\.pdf$/i.test(f.name)) await addPdf(b); else skipped.push(f.name); }
        catch (e) { skipped.push(f.name); }
      }
    }
    busy.set('正在合併…');
    const blob = new Blob([await out.save()], { type: 'application/pdf' });
    busy.done();
    await saveFile(`${orgShort()}_${SCEN[sc].title}_${batchLabel(sc)}_送件合併.pdf`, blob);
    if (skipped.length) toast(`下列檔案不是 PDF 或圖片，未放入合併檔（壓縮檔裡有）：${skipped.join('、')}`, 'err');
  } catch (e) { busy.done(); console.error(e); toast('合併失敗：' + (e.message || e), 'err'); }
}
$('#upIn').addEventListener('change', async e => { const fs = [...e.target.files]; e.target.value = ''; if (fs.length && UPT) await upAdd(UPT.sc, UPT.x, fs); });
document.addEventListener('click', e => {
  const u = e.target.closest('[data-up]'); if (u) { e.preventDefault(); e.stopPropagation(); upPick(S.ui.scen, u.dataset.up); return; }
  const d = e.target.closest('[data-updel]'); if (d) { e.preventDefault(); e.stopPropagation(); upDel(S.ui.scen, d.dataset.updel, d.dataset.fid); }
}, true);

/* ===== 從 Excel／CSV 檔匯入名單 ===== */
function csvLine(l) { const out = []; let cur = '', q = false; for (let i = 0; i < l.length; i++) { const c = l[i]; if (q) { if (c === '"' && l[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; } else if (c === '"') q = true; else if (c === ',') { out.push(cur); cur = ''; } else cur += c; } out.push(cur); return out; }
async function importTable(file) {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (ext === 'xls') throw new Error('舊版 .xls 請先在 Excel「另存新檔」成 .xlsx，或直接複製貼上');
  if (ext === 'xlsx') {
    const X = await loadLib('exceljs'), wb = new X.Workbook(); await wb.xlsx.load(await file.arrayBuffer());
    const ws = wb.worksheets.find(w => w.rowCount > 0) || wb.worksheets[0], rows = [];
    const str = c => { const v = c.value; if (v instanceof Date) return `${v.getFullYear()}-${pad2(v.getMonth() + 1)}-${pad2(v.getDate())}`; if (v && typeof v === 'object' && 'result' in v) return String(v.result ?? ''); if (v && typeof v === 'object' && v.richText) return v.richText.map(t => t.text).join(''); return c.text == null ? '' : String(c.text); };
    ws.eachRow({ includeEmpty: false }, row => { const vals = []; for (let c = 1; c <= row.cellCount; c++) vals.push(str(row.getCell(c)).replace(/[\t\r\n]+/g, ' ').trim()); if (vals.some(Boolean)) rows.push(vals.join('\t')); });
    return rows.join('\n');
  }
  const buf = new Uint8Array(await file.arrayBuffer()); let text;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(buf); } catch (e) { text = new TextDecoder('big5').decode(buf); }
  text = text.replace(/^﻿/, '');
  return ext === 'csv' ? text.split(/\r?\n/).filter(l => l.trim()).map(l => csvLine(l).map(c => c.trim()).join('\t')).join('\n') : text;
}
document.addEventListener('change', async e => {
  const t = e.target; if (!t.dataset.import) return;
  const f = t.files[0]; t.value = ''; if (!f) return;
  try { const txt = await importTable(f); const box = $('#pasteBox'); box.value = txt; pastePreview(t.dataset.import); toast(`已讀取「${f.name}」，請確認下方辨識結果後按「加入」`); }
  catch (err) { toast('無法讀取這個檔案：' + err.message, 'err'); }
});
