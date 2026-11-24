/* ===== 用印：把印章擺到文件上 =====
 每份文件（dk = 選單:文件）預設「自動排列」：依簽章位置與印章類別自動擺放。
 使用者在預覽拖曳、縮放、旋轉、加蓋或移除後，改存成 S.stamp.docs[dk].items（手動）。
 位置以「錨點＋位移（公釐）」記錄，Word、Excel、PDF 都用同一份資料。 */
const PX_MM = 96 / 25.4, PT_MM = 25.4 / 72;
const TITLE_ALIAS = { 團體負責人: '理事長', 負責人: '理事長', 籌備主委: '籌備會主任委員', 籌備會主委: '籌備會主任委員', 主任委員: '籌備會主任委員', 清算人: '清算人' };
function normTitle(t) { t = String(t || '').replace(/[\s　：:]/g, ''); return TITLE_ALIAS[t] || t; }
function parseSlot(key) { if (key[0] === '@') return { org: true }; const [t, n] = String(key).split('|'); return { title: normTitle(t), name: (n || '').trim() }; }
function matchSeal(key) {
  const sl = parseSlot(key), L = S.seals.filter(sealOk);
  if (sl.org) return L.find(s => s.type === 'org') || L.find(s => s.type === 'big') || null;
  if (sl.title) { const t = L.find(s => s.type === 'title' && normTitle(s.title) === sl.title); if (t) return t; }
  if (sl.name) { const p = L.find(s => (s.type === 'person' || s.type === 'sign') && (s.owner || '').trim() === sl.name); if (p) return p; }
  return null;
}
/** 這顆印章適合放在哪個錨點 */
function sealFits(s, key) {
  const sl = parseSlot(key);
  if (sl.org) return s.type === 'org' || s.type === 'big';
  if (s.type === 'title') return !!sl.title && normTitle(s.title) === sl.title;
  if (s.type === 'person' || s.type === 'sign') return !!sl.name && (s.owner || '').trim() === sl.name;
  return false;
}
const stampOn = () => S.stamp && S.stamp.on !== false && S.seals.some(sealOk);
const docSt = dk => { S.stamp.docs = S.stamp.docs || {}; return S.stamp.docs[dk] || (S.stamp.docs[dk] = {}); };
const docStampOn = dk => stampOn() && !((S.stamp.docs || {})[dk] || {}).off;
const isManual = dk => !!((S.stamp.docs || {})[dk] || {}).items;
/** 文件不出現「○○○」佔位字：沒填的地方留白（選票說明的「○」符號保留） */
function noPH(doc) {
  const f = t => typeof t === 'string' && t.includes('○') ? t.replace(/(^|[^「])○+/g, (m, a) => a + '　'.repeat(Math.min(3, m.length - a.length))) : t;
  for (const sh of doc.sheets || []) for (const b of sh.blocks || []) {
    if (typeof b.text === 'string') b.text = f(b.text);
    for (const r of b.rows || []) for (const c of (r.cells || [])) if (c && typeof c.v === 'string') c.v = f(c.v);
  }
  return doc;
}
function keyed(sc, x) { const doc = noPH(x.b()); const dk = `${sc}:${x.id}`; doc.sheets.forEach((s, i) => { s.dk = dk; s.dsi = i; }); return doc; }

/** 依錨點算出這張工作表要蓋的印章
 anchors：[{key, n, cx, cy, fs}]；回傳 items：{sid, slot, n, si, ex/ey（字高倍數）或 dx/dy（公釐）, ax/ay, sc, rot} */
function sheetItems(dk, si, anchors) {
  if (!dk || !docStampOn(dk)) return [];
  const st = (S.stamp.docs || {})[dk];
  if (st && st.items) {
    const out = [];
    for (const it of st.items) {
      if ((it.si || 0) !== si || !sealOk(sealById(it.sid))) continue;
      if (it.slot !== '@top' && !anchors.some(a => a.key === it.slot && a.n === it.n)) {
        const sl = parseSlot(it.slot), a = anchors.find(a2 => { const s2 = parseSlot(a2.key); return sl.org ? s2.org : (sl.title && s2.title === sl.title) || (sl.name && s2.name === sl.name); });
        if (a) { it.slot = a.key; it.n = a.n; } else if (it.ax != null) { it.slot = '@top'; } else continue;
      }
      out.push(it);
    }
    return out;
  }
  const out = [];
  for (const a of anchors) { const s = matchSeal(a.key); if (s) out.push({ sid: s.id, slot: a.key, n: a.n, si, ex: a.cx, ey: a.cy, fs: a.fs, sc: 1, rot: 0 }); }
  return out;
}
/** 印章尺寸與中心位移（公釐） */
function geoOf(it, fs) {
  const s = sealById(it.sid) || { wmm: 20, hmm: 20 }, k = it.sc || 1, f = fs || it.fs || 12, w = s.wmm * k, h = s.hmm * k, rot = (s.rot || 0) + (it.rot || 0);
  const r = rot * Math.PI / 180, ac = Math.abs(Math.cos(r)), as = Math.abs(Math.sin(r));
  /* 垂直位置：'b'＝印章上緣貼齊該行；簽章處的長形職章大部分垂在簽名行下方，不壓到上面的表格 */
  const dy = it.dy != null ? it.dy : it.ey === 'b' ? h / 2 - f * PT_MM * 0.8 : !+it.ey && it.slot && it.slot[0] !== '@' ? Math.max(0, h / 2 - 8) : (+it.ey || 0) * f * PT_MM;
  return { w, h, rot, bw: w * ac + h * as, bh: w * as + h * ac, dx: it.dx != null ? it.dx : (it.ex || 0) * f * PT_MM, dy };
}
/** 從文件模型找出錨點（順序與 HTML、Word、Excel 輸出一致） */
function modelAnchors(sh) {
  const out = [], cnt = {};
  const scan = (txt, fs) => { const re = new RegExp(SA_RE.source, 'g'); let m; while ((m = re.exec(String(txt ?? '')))) { const k = m[1]; out.push({ key: k, n: cnt[k] = (cnt[k] ?? -1) + 1, cx: +m[2] || 0, cy: m[3] === 'b' ? 'b' : +m[3] || 0, fs }); } };
  for (const b of sh.blocks) {
    if (b.t === 'p') scan(b.text, b.size || sh.size || 12);
    else if (b.t === 'table') layoutTable(b.rows).forEach(L => L.pl.forEach(p => scan(cellText(p.cell), p.cell.sz || b.size || sh.size || 12)));
  }
  return out;
}
/** Word／Excel 匯出前準備：每張表的印章、PNG（含 90% 不透明度） */
async function stampPrep(doc, fmt) {
  const per = doc.sheets.map(sh => {
    if (!sh.dk || !docStampOn(sh.dk)) return null;
    const items = sheetItems(sh.dk, sh.dsi || 0, modelAnchors(sh)); if (!items.length) return null;
    const at = {}, top = [];
    items.forEach(it => { if (it.slot === '@top') top.push(it); else (at[it.slot + '#' + it.n] = at[it.slot + '#' + it.n] || []).push(it); });
    return { at, top, items };
  });
  const png = {};
  for (const p of per) if (p) for (const it of p.items) {
    const g = geoOf(it), rot = g.rot, k = it.sid + '|' + rot;
    if (!png[k]) png[k] = await sealPngData(it.sid, 0.9, rot);
  }
  return {
    sheet: sh => { const p = per[doc.sheets.indexOf(sh)]; return p ? { at: p.at, top: [...p.top], cnt: {} } : null; },
    png: (sid, rot = 0) => png[sid + '|' + rot] || png[sid + '|0'],
    geo: it => geoOf(it),
  };
}
/** HTML 中錨點的位置（相對 .sheet，CSS px；呼叫前請確保沒有 zoom） */
function domAnchors(el) {
  const r0 = el.getBoundingClientRect(), cnt = {};
  return $$('.sa', el).map(sp => { const k = sp.dataset.sa, r = sp.getBoundingClientRect(); return { key: k, n: cnt[k] = (cnt[k] ?? -1) + 1, cx: +sp.dataset.cx || 0, cy: sp.dataset.cy === 'b' ? 'b' : +sp.dataset.cy || 0, fs: +sp.dataset.fs || 12, x: r.left - r0.left, y: r.top + r.height / 2 - r0.top }; });
}
function boxOf(it, A, pad) {
  if (it.slot === '@top') { const g = geoOf(it), cy = pad.t + it.ay * PX_MM; return { it, cx: pad.l + it.ax * PX_MM, cy, ay: cy, w: g.w * PX_MM, h: g.h * PX_MM, rot: g.rot }; }
  const a = A.find(x => x.key === it.slot && x.n === it.n); if (!a) return null;
  const g = geoOf(it, a.fs);
  return { it, a, ay: a.y, cx: a.x + g.dx * PX_MM, cy: a.y + g.dy * PX_MM, w: g.w * PX_MM, h: g.h * PX_MM, rot: g.rot };
}
const padOf = el => { const cs = getComputedStyle(el); return { l: parseFloat(cs.paddingLeft) || 0, t: parseFloat(cs.paddingTop) || 0 }; };
/** PDF：算出每顆印章在畫面上的位置，稍後以「色彩相乘＋90% 不透明度」合成 */
async function stampBoxes(el, sh) {
  if (!sh.dk || !docStampOn(sh.dk)) return [];
  const A = domAnchors(el), pad = padOf(el), out = [];
  for (const it of sheetItems(sh.dk, sh.dsi || 0, A)) { const b = boxOf(it, A, pad); if (b) { b.img = await sealImgEl(it.sid); if (b.img) out.push(b); } }
  return out;
}
function drawSeal(g, b, k, ox = 0, oy = 0) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.9;
  g.translate(ox + b.cx * k, oy + b.cy * k); if (b.rot) g.rotate(b.rot * Math.PI / 180);
  g.drawImage(b.img, -b.w * k / 2, -b.h * k / 2, b.w * k, b.h * k); g.restore();
}

/* ---------- 預覽：顯示、拖曳、縮放、旋轉 ---------- */
function renderStamps(el) {
  const old = el.querySelector('.seal-l'); if (old) old.remove();
  const dk = el.dataset.dk; el._st = null;
  if (!dk || !docStampOn(dk)) return;
  const z = el.style.zoom; el.style.zoom = 1;
  const w0 = el.getBoundingClientRect().width, A = domAnchors(el), pad = padOf(el);
  const items = sheetItems(dk, +el.dataset.dsi || 0, A), boxes = items.map(it => boxOf(it, A, pad)).filter(Boolean);
  el.style.zoom = z;
  const layer = document.createElement('div'); layer.className = 'seal-l';
  boxes.forEach((b, i) => {
    const im = document.createElement('img'); im.className = 'seal'; im.src = sealUrl(b.it.sid); im.alt = (sealById(b.it.sid) || {}).name || '印章'; im.draggable = false; im.dataset.i = i;
    placeImg(im, b); layer.appendChild(im);
  });
  el.appendChild(layer);
  el._st = { dk, si: +el.dataset.dsi || 0, A, boxes, pad, w0 };
}
function placeImg(im, b) { Object.assign(im.style, { left: (b.cx - b.w / 2) + 'px', top: (b.cy - b.h / 2) + 'px', width: b.w + 'px', height: b.h + 'px', transform: b.rot ? `rotate(${b.rot}deg)` : '' }); }
function refreshStamps(box) {
  if (!box) return;
  $$('.sheet', box).forEach(renderStamps);
  const bar = box.querySelector('.stbar'); if (bar && bar.dataset.dk) bar.outerHTML = stampBar(bar.dataset.dk);
}
function stampBar(dk) {
  if (!S.seals.length) return `<div class="stbar none" data-dk="${esc(dk)}"><button class="lnk" data-cmd="sealOpen">${icon('stamp')}上傳印章或手寫簽名，文件可以自動核章</button></div>`;
  const on = docStampOn(dk), man = isManual(dk);
  return `<div class="stbar" data-dk="${esc(dk)}">
    <label class="sw"><input type="checkbox" data-stampdoc="${esc(dk)}"${on ? ' checked' : ''}${S.stamp.on === false ? ' disabled' : ''}><span class="swt"></span>用印</label>
    ${on ? `<span class="stmain"><button class="mini" data-stamp="add">${icon('plus')}加蓋</button><button class="mini" data-stamp="auto"${man ? '' : ' disabled'} title="依簽章位置重新自動排列">${icon('table')}自動排列</button></span>
    <span class="stsel" hidden><button class="mini" data-stamp="smaller" aria-label="縮小">−</button><button class="mini" data-stamp="bigger" aria-label="放大">＋</button><button class="mini" data-stamp="rl" aria-label="向左轉">↺</button><button class="mini" data-stamp="rr" aria-label="向右轉">↻</button><button class="mini danger" data-stamp="del">移除</button></span>` : (S.stamp.on === false ? '<small class="muted">已在下載頁關閉用印</small>' : '')}
    <button class="mini ghost" data-cmd="sealOpen" aria-label="管理印章">${icon('stamp')}印章</button>
    <div class="stpop" hidden>${S.seals.filter(sealOk).map(s => `<button data-stamp="put" data-sid="${s.id}">${chk(sealUrl(s.id))}<span>${esc(s.name)}</span></button>`).join('')}</div>
  </div>`;
}
const pvBox = t => t.closest('#pv, #side');
let SEL = null; // {el, i}
function selClear() { if (SEL) { const im = SEL.el.querySelector(`.seal[data-i="${SEL.i}"]`); if (im) im.classList.remove('sel'); const bar = pvBox(SEL.el)?.querySelector('.stbar'); if (bar) { bar.querySelector('.stsel')?.setAttribute('hidden', ''); bar.querySelector('.stmain')?.removeAttribute('hidden'); } } SEL = null; }
function selSet(el, i) {
  selClear(); SEL = { el, i };
  const im = el.querySelector(`.seal[data-i="${i}"]`); if (im) im.classList.add('sel');
  const bar = pvBox(el)?.querySelector('.stbar'); if (bar) { bar.querySelector('.stsel')?.removeAttribute('hidden'); bar.querySelector('.stmain')?.setAttribute('hidden', ''); }
}
/** 第一次手動調整：把目前自動排列的結果存成手動資料 */
function materialize(box, dk) {
  const st = docSt(dk); if (st.items) return;
  st.items = [];
  $$('.sheet', box).filter(el => el.dataset.dk === dk && el._st).forEach(el => el._st.boxes.forEach(b => { const o = toManual(b, el._st); st.items.push(o); b.it = o; }));
}
function toManual(b, st) {
  const it = b.it, o = { sid: it.sid, slot: it.slot, n: it.n, si: st.si, sc: it.sc || 1, rot: it.rot || 0, ax: (b.cx - st.pad.l) / PX_MM, ay: (b.cy - st.pad.t) / PX_MM };
  if (b.a) { o.dx = (b.cx - b.a.x) / PX_MM; o.dy = (b.cy - b.a.y) / PX_MM; }
  return o;
}
function setPos(b, st, cx, cy) {
  b.cx = cx; b.cy = cy; const it = b.it;
  it.ax = (cx - st.pad.l) / PX_MM; it.ay = (cy - st.pad.t) / PX_MM;
  if (b.a && it.slot !== '@top') { it.dx = (cx - b.a.x) / PX_MM; it.dy = (cy - b.a.y) / PX_MM; }
}
document.addEventListener('pointerdown', e => {
  const im = e.target.closest('.sheet .seal');
  if (!im) { if (SEL && !e.target.closest('.stbar')) selClear(); return; }
  e.preventDefault();
  const el = im.closest('.sheet'), st = el._st; if (!st) return;
  const i = +im.dataset.i, b = st.boxes[i], zf = el.getBoundingClientRect().width / st.w0 || 1;
  selSet(el, i);
  const sx = e.clientX, sy = e.clientY, cx0 = b.cx, cy0 = b.cy; let moved = false;
  im.setPointerCapture(e.pointerId); im.classList.add('drag');
  const mv = ev => { const dx = (ev.clientX - sx) / zf, dy = (ev.clientY - sy) / zf; if (Math.abs(dx) + Math.abs(dy) > 2) moved = true; placeImg(im, { ...b, cx: cx0 + dx, cy: cy0 + dy }); };
  const up = ev => {
    im.removeEventListener('pointermove', mv); im.removeEventListener('pointerup', up); im.removeEventListener('pointercancel', up); im.classList.remove('drag');
    if (!moved) return;
    const box = pvBox(el); materialize(box, st.dk);
    setPos(st.boxes[i], st, cx0 + (ev.clientX - sx) / zf, cy0 + (ev.clientY - sy) / zf);
    save(); const bar = box && box.querySelector('.stbar [data-stamp=auto]'); if (bar) bar.disabled = false;
  };
  im.addEventListener('pointermove', mv); im.addEventListener('pointerup', up); im.addEventListener('pointercancel', up);
});
document.addEventListener('keydown', e => {
  if (!SEL || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Delete', 'Backspace'].includes(e.key) || e.target.closest('input, textarea, select')) return;
  e.preventDefault();
  const st = SEL.el._st, b = st && st.boxes[SEL.i]; if (!b) return;
  if (e.key === 'Delete' || e.key === 'Backspace') return stampAct('del', SEL.el);
  materialize(pvBox(SEL.el), st.dk);
  const d = (e.shiftKey ? 5 : 1) * PX_MM; setPos(b, st, b.cx + (e.key === 'ArrowLeft' ? -d : e.key === 'ArrowRight' ? d : 0), b.cy + (e.key === 'ArrowUp' ? -d : e.key === 'ArrowDown' ? d : 0));
  const im = SEL.el.querySelector(`.seal[data-i="${SEL.i}"]`); if (im) placeImg(im, b); save();
});
function stampAct(a, el, extra) {
  const box = pvBox(el); if (!box) return;
  const bar = box.querySelector('.stbar'), dk = bar && bar.dataset.dk; if (!dk) return;
  if (a === 'auto') { delete docSt(dk).items; save(); selClear(); refreshStamps(box); toast('已依簽章位置重新自動排列'); return; }
  if (a === 'add') { const pop = bar.querySelector('.stpop'); if (pop) pop.hidden = !pop.hidden; return; }
  if (a === 'put') {
    materialize(box, dk);
    const s = sealById(extra), st = docSt(dk), sheets = $$('.sheet', box).filter(x => x.dataset.dk === dk && x._st);
    let placed = false;
    for (const sh of sheets) {
      const used = new Set(st.items.filter(it => it.sid === s.id && it.si === sh._st.si).map(it => it.slot + '#' + it.n));
      const a2 = sh._st.A.find(x => sealFits(s, x.key) && !used.has(x.key + '#' + x.n));
      if (a2) { const g = geoOf({ sid: s.id, slot: a2.key, ex: a2.cx, ey: a2.cy, fs: a2.fs }); st.items.push({ sid: s.id, slot: a2.key, n: a2.n, si: sh._st.si, sc: 1, rot: 0, dx: g.dx, dy: g.dy }); placed = true; break; }
    }
    if (!placed && sheets[0]) {
      const sh = sheets[0], wmm = (sh._st.w0 - sh._st.pad.l * 2) / PX_MM, vis = sh.getBoundingClientRect(), view = box.querySelector('.pages').getBoundingClientRect();
      const zf = vis.width / sh._st.w0 || 1, yView = Math.max(0, (view.top + view.height / 2 - vis.top) / zf);
      st.items.push({ sid: s.id, slot: '@top', n: 0, si: sh._st.si, sc: 1, rot: 0, ax: wmm / 2, ay: Math.max(20, yView / PX_MM - sh._st.pad.t / PX_MM) });
    }
    save(); refreshStamps(box); toast(placed ? `已把「${s.name}」放到對應的簽章位置，可拖曳調整` : `已把「${s.name}」放在頁面中間，請拖曳到要蓋章的位置`);
    return;
  }
  if (!SEL) return;
  const st = SEL.el._st, b = st && st.boxes[SEL.i]; if (!b) return;
  materialize(box, dk);
  const it = b.it;
  if (a === 'del') { const L = docSt(dk).items, k = L.indexOf(it); if (k >= 0) L.splice(k, 1); selClear(); save(); refreshStamps(box); return; }
  if (a === 'bigger' || a === 'smaller') it.sc = Math.max(0.3, Math.min(3, (it.sc || 1) * (a === 'bigger' ? 1.08 : 1 / 1.08)));
  if (a === 'rl' || a === 'rr') it.rot = ((it.rot || 0) + (a === 'rr' ? 5 : -5)) % 360;
  const g = geoOf(it, b.a && b.a.fs); b.w = g.w * PX_MM; b.h = g.h * PX_MM; b.rot = g.rot;
  const im = SEL.el.querySelector(`.seal[data-i="${SEL.i}"]`); if (im) placeImg(im, b); save();
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-stamp]'); if (!t) { const pop = document.querySelector('.stpop:not([hidden])'); if (pop && !e.target.closest('.stpop')) pop.hidden = true; return; }
  e.preventDefault(); stampAct(t.dataset.stamp, t, t.dataset.sid);
});
document.addEventListener('change', e => {
  const t = e.target; if (!t.dataset.stampdoc) return;
  const dk = t.dataset.stampdoc; docSt(dk).off = !t.checked; save(); selClear(); refreshStamps(pvBox(t));
});
/** 下載頁：用印總開關 */
function stampDlCard() {
  const n = S.seals.filter(sealOk).length;
  if (!S.seals.length) return `<button class="rowlink slim" data-cmd="sealOpen">${icon('stamp')}<span><b>電子用印（選用）</b><small>上傳印章照片或手寫簽名，下載的文件就會自動核章。</small></span>${icon('back', 'flip')}</button>`;
  return `<section class="card stdl"><label class="sw big"><input type="checkbox" data-p="stamp.on" data-rr="1"${S.stamp.on !== false ? ' checked' : ''}><span class="swt"></span><b>下載時加蓋電子印章</b></label>
    <p class="muted small">已有 ${n} 個印章${n < S.seals.length ? `（${S.seals.length - n} 個圖檔遺失）` : ''}。每份文件可按「預覽」調整位置、加蓋或關閉。<button class="lk" data-cmd="sealOpen">管理印章</button></p></section>`;
}
