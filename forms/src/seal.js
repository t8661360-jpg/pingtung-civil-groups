/* ===== 電子印章：上傳辨識、去背、印章庫、手寫簽名 =====
 印章資料：S.seals = [{id, name, type, title, owner, wmm, hmm, rot, color, strength, ink}]
 圖檔：IndexedDB（只存在這台裝置的瀏覽器），記憶體快取 SEALC */
const SEAL_TYPES = { org: ['印信（團體圖記）', 48], big: ['大章（團體章）', 48], title: ['職務章（職章）', 50], person: ['印鑑／私章', 18], sign: ['手寫簽名', 40], other: ['其他', 30] };
const INK = { orig: ['原色', null], red: ['朱紅', [206, 32, 30]], dark: ['暗紅', [150, 18, 30]], blue: ['藍色', [28, 62, 168]], black: ['黑色', [26, 26, 26]] };
const INK_MODE = { auto: '自動判斷', red: '紅色印泥', blue: '藍色印泥', black: '黑色' };
const SEAL_TITLES = ['理事長', '總幹事', '會計', '出納', '常務監事', '籌備會主任委員', '清算人', '製表'];
const sealById = id => S.seals.find(s => s.id === id);
const SEALC = new Map();
const IMGC = new Map(), PNGC = new Map();
function sealCacheClear(id) { [...IMGC.keys()].forEach(k => k === id && IMGC.delete(k)); [...PNGC.keys()].forEach(k => k.startsWith(id + '|') && PNGC.delete(k)); }
const sealUrl = id => (SEALC.get(id) || {}).png || '';
const sealOk = s => !!(s && SEALC.has(s.id));
function sealDefName(s) {
  if (s.type === 'title') return `${s.title || '理事長'}職章`;
  if (s.type === 'person') return s.owner ? `${s.owner}印鑑` : '私章';
  if (s.type === 'sign') return s.owner ? `${s.owner}簽名` : '簽名';
  if (s.type === 'big') return '大章';
  if (s.type === 'org') return '團體圖記';
  return '印章';
}

/* ---------- 儲存（IndexedDB，失敗時僅保留在記憶體） ---------- */
const IDBX = (() => {
  let dbp = null, ok = true;
  const open = () => dbp || (dbp = new Promise(res => {
    try {
      const rq = indexedDB.open('pt-assoc-seals', 2);
      rq.onupgradeneeded = () => { const db = rq.result; ['img', 'files'].forEach(n => { if (!db.objectStoreNames.contains(n)) db.createObjectStore(n); }); };
      rq.onsuccess = () => res(rq.result); rq.onerror = () => { ok = false; res(null); }; rq.onblocked = () => { ok = false; res(null); };
    } catch (e) { ok = false; res(null); }
  }));
  const run = async (store, mode, fn) => {
    const db = await open(); if (!db) return null;
    return new Promise(res => { try { const t = db.transaction(store, mode), r = fn(t.objectStore(store)); t.oncomplete = () => res(r ? r.result : null); t.onerror = t.onabort = () => { ok = false; res(null); }; } catch (e) { ok = false; res(null); } });
  };
  return { run, persistent: () => ok };
})();
const SealDB = {
  put: (id, v) => { SEALC.set(id, v); return IDBX.run('img', 'readwrite', st => st.put(v, id)); },
  get: async id => SEALC.get(id) || (await IDBX.run('img', 'readonly', st => st.get(id))) || null,
  del: id => { SEALC.delete(id); return IDBX.run('img', 'readwrite', st => st.delete(id)); },
  persistent: () => IDBX.persistent(),
};
async function sealsLoad() {
  let n = 0;
  for (const s of S.seals) { const r = await SealDB.get(s.id); if (r && r.png) { SEALC.set(s.id, r); n++; } }
  if (n) { if (!$('#pv').hidden) refreshStamps($('#pv')); renderSide(); if (S.ui.view === 'scen' && S.ui.step === 'dl') render(); }
}
function sealImgEl(id) {
  if (!IMGC.has(id)) IMGC.set(id, new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = sealUrl(id); }));
  return IMGC.get(id);
}
/** 匯出用 PNG：預先套用 90% 不透明度與旋轉 */
async function sealPngData(id, alpha = 0.9, rot = 0) {
  const k = `${id}|${alpha}|${rot}`; if (PNGC.has(k)) return PNGC.get(k);
  const im = await sealImgEl(id); if (!im) return null;
  const r = rot * Math.PI / 180, W = im.naturalWidth, H = im.naturalHeight;
  const cw = Math.max(1, Math.ceil(Math.abs(W * Math.cos(r)) + Math.abs(H * Math.sin(r)))), ch = Math.max(1, Math.ceil(Math.abs(W * Math.sin(r)) + Math.abs(H * Math.cos(r))));
  const c = document.createElement('canvas'); c.width = cw; c.height = ch;
  const g = c.getContext('2d'); g.globalAlpha = alpha; g.translate(cw / 2, ch / 2); g.rotate(r); g.drawImage(im, -W / 2, -H / 2);
  const url = c.toDataURL('image/png'); PNGC.set(k, url); return url;
}

/* ---------- 影像讀取與實際尺寸 ---------- */
async function readDpi(file) {
  try {
    const b = new Uint8Array(await file.slice(0, 131072).arrayBuffer());
    if (b[0] === 0xFF && b[1] === 0xD8) {
      let i = 2;
      while (i + 4 < b.length && b[i] === 0xFF) {
        const mk = b[i + 1], len = (b[i + 2] << 8) | b[i + 3];
        if (mk === 0xE0 && b[i + 4] === 0x4A && b[i + 5] === 0x46 && b[i + 6] === 0x49 && b[i + 7] === 0x46) {
          const u = b[i + 11], xd = (b[i + 12] << 8) | b[i + 13];
          if (u === 1 && xd) return xd; if (u === 2 && xd) return xd * 2.54;
        }
        if (mk === 0xE1 && b[i + 4] === 0x45 && b[i + 5] === 0x78 && b[i + 6] === 0x69 && b[i + 7] === 0x66) {
          const t = i + 10, le = b[t] === 0x49, r16 = o => le ? b[t + o] | (b[t + o + 1] << 8) : (b[t + o] << 8) | b[t + o + 1];
          const r32 = o => le ? (b[t + o] | (b[t + o + 1] << 8) | (b[t + o + 2] << 16) | (b[t + o + 3] << 24)) >>> 0 : ((b[t + o] << 24) | (b[t + o + 1] << 16) | (b[t + o + 2] << 8) | b[t + o + 3]) >>> 0;
          const ifd = r32(4), n = r16(ifd); let xr = 0, unit = 2;
          for (let e = 0; e < n; e++) { const o = ifd + 2 + e * 12, tag = r16(o); if (tag === 0x011A) { const vo = r32(o + 8); xr = r32(vo) / (r32(vo + 4) || 1); } if (tag === 0x0128) unit = r16(o + 8); }
          if (xr) return unit === 3 ? xr * 2.54 : xr;
        }
        if (mk === 0xDA) break; i += 2 + len;
      }
    }
    if (b[0] === 0x89 && b[1] === 0x50) {
      let i = 8;
      while (i + 12 < b.length) {
        const len = ((b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]) >>> 0, ty = String.fromCharCode(b[i + 4], b[i + 5], b[i + 6], b[i + 7]);
        if (ty === 'pHYs') { const ppu = ((b[i + 8] << 24) | (b[i + 9] << 16) | (b[i + 10] << 8) | b[i + 11]) >>> 0; if (b[i + 16] === 1) return ppu * 0.0254; }
        if (ty === 'IDAT') break; i += 12 + len;
      }
    }
  } catch (e) { }
  return 0;
}
function loadImgUrl(url) { return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error('無法讀取這個圖檔')); im.src = url; }); }

/* ---------- 去背分析 ----------
 1) 以區塊亮部估計紙張顏色（可處理陰影、光線不均）
 2) 每個像素對紙色做白平衡，算出「墨色強度」與「印泥色彩度」
 3) Otsu 自動門檻，自動判斷紅／藍／黑色印泥 */
function sealAnalyze(img, maxSide = 1800) {
  const k = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const W = Math.max(1, Math.round(img.naturalWidth * k)), H = Math.max(1, Math.round(img.naturalHeight * k)), N = W * H;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d', { willReadFrequently: true }); g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); g.drawImage(img, 0, 0, W, H);
  const D = g.getImageData(0, 0, W, H).data;
  const bs = Math.max(12, Math.round(Math.max(W, H) / 28)), BW = Math.ceil(W / bs), BH = Math.ceil(H / bs), NB = BW * BH;
  const P0 = new Float32Array(NB * 3), PL = new Float32Array(NB), hist = new Uint32Array(64);
  const L6 = i => (D[i] * 77 + D[i + 1] * 150 + D[i + 2] * 29) >> 10;
  for (let by = 0; by < BH; by++) for (let bx = 0; bx < BW; bx++) {
    hist.fill(0); let cnt = 0;
    const x0 = bx * bs, y0 = by * bs, x1 = Math.min(W, x0 + bs), y1 = Math.min(H, y0 + bs);
    for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) { hist[L6((y * W + x) * 4)]++; cnt++; }
    let acc = 0, th = 63; for (let q = 63; q >= 0; q--) { acc += hist[q]; if (acc >= cnt * 0.2) { th = q; break; } }
    let r = 0, gg = 0, bb = 0, n = 0;
    for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) { const i = (y * W + x) * 4; if (L6(i) >= th) { r += D[i]; gg += D[i + 1]; bb += D[i + 2]; n++; } }
    const o = by * BW + bx; n = n || 1; P0[o * 3] = r / n; P0[o * 3 + 1] = gg / n; P0[o * 3 + 2] = bb / n; PL[o] = (r * 0.3 + gg * 0.59 + bb * 0.11) / n;
  }
  const nb = (bx, by, f) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = bx + dx, yy = by + dy; if (xx >= 0 && yy >= 0 && xx < BW && yy < BH) f(yy * BW + xx); } };
  const P1 = new Float32Array(NB * 3), P2 = new Float32Array(NB * 3);
  for (let by = 0; by < BH; by++) for (let bx = 0; bx < BW; bx++) { let best = -1, bo = 0; nb(bx, by, o => { if (PL[o] > best) { best = PL[o]; bo = o; } }); const o = by * BW + bx; for (let c = 0; c < 3; c++) P1[o * 3 + c] = P0[bo * 3 + c]; }
  for (let by = 0; by < BH; by++) for (let bx = 0; bx < BW; bx++) { const s = [0, 0, 0]; let n = 0; nb(bx, by, o => { s[0] += P1[o * 3]; s[1] += P1[o * 3 + 1]; s[2] += P1[o * 3 + 2]; n++; }); const o = by * BW + bx; for (let c = 0; c < 3; c++) P2[o * 3 + c] = Math.max(40, s[c] / n); }
  const DK = new Float32Array(N), NC = new Uint8ClampedArray(N * 3);
  let red = 0, blue = 0, col = 0;
  for (let y = 0; y < H; y++) {
    const fy = Math.min(BH - 1, Math.max(0, (y + 0.5) / bs - 0.5)), y0 = Math.floor(fy), y1 = Math.min(BH - 1, y0 + 1), ty = fy - y0;
    for (let x = 0; x < W; x++) {
      const fx = Math.min(BW - 1, Math.max(0, (x + 0.5) / bs - 0.5)), x0 = Math.floor(fx), x1 = Math.min(BW - 1, x0 + 1), tx = fx - x0;
      const a = (y0 * BW + x0) * 3, b = (y0 * BW + x1) * 3, c = (y1 * BW + x0) * 3, d = (y1 * BW + x1) * 3, i = (y * W + x) * 4, p = y * W + x;
      let mn = 1, mx = 0, rr = 0, gg2 = 0, bb2 = 0;
      for (let ch = 0; ch < 3; ch++) {
        const pap = (P2[a + ch] * (1 - tx) + P2[b + ch] * tx) * (1 - ty) + (P2[c + ch] * (1 - tx) + P2[d + ch] * tx) * ty;
        const v = Math.min(1, D[i + ch] / pap); NC[p * 3 + ch] = v * 255;
        if (v < mn) mn = v; if (v > mx) mx = v; if (ch === 0) rr = v; else if (ch === 1) gg2 = v; else bb2 = v;
      }
      DK[p] = 1 - mn;
      if (mx - mn > 0.22 && 1 - mn > 0.2) { col++; if (rr >= gg2 && rr >= bb2) red++; else if (bb2 >= rr && bb2 >= gg2) blue++; }
    }
  }
  const A = { W, H, N, cv, DK, NC, autoInk: col > N * 0.0008 ? (red >= blue ? 'red' : 'blue') : 'black' };
  return A;
}
/** 依印泥模式算出每個像素的「是印泥」分數與自動門檻 */
function sealScore(A, ink) {
  const md = ink && ink !== 'auto' ? ink : A.autoInk;
  if (A.md === md && A.SC) return;
  const { N, NC, DK } = A, SC = A.SC || new Float32Array(N);
  for (let p = 0; p < N; p++) {
    const r = NC[p * 3] / 255, g = NC[p * 3 + 1] / 255, b = NC[p * 3 + 2] / 255;
    SC[p] = md === 'red' ? Math.max(0, r - Math.max(g, b)) : md === 'blue' ? Math.max(0, b - Math.max(r, g * 0.9)) : DK[p];
  }
  const bins = 128, h = new Float64Array(bins); let n = 0;
  for (let p = 0; p < N; p += 3) { h[Math.min(bins - 1, Math.floor(SC[p] * bins))]++; n++; }
  let sum = 0; for (let i = 0; i < bins; i++) sum += i * h[i];
  let sB = 0, wB = 0, best = 0, th = 0;
  for (let i = 0; i < bins; i++) { wB += h[i]; if (!wB) continue; const wF = n - wB; if (!wF) break; sB += i * h[i]; const v = wB * wF * (sB / wB - (sum - sB) / wF) ** 2; if (v > best) { best = v; th = i; } }
  const t = (th + 0.5) / bins;
  A.SC = SC; A.md = md; A.thr = md === 'black' ? Math.min(0.7, Math.max(0.28, t)) : Math.min(0.45, Math.max(0.09, t));
}
/** 找出每一顆印章（連通區塊＋鄰近合併） */
function sealDetect(A) {
  const { W, H, SC, thr } = A, f = Math.max(1, Math.ceil(Math.max(W, H) / 480)), GW = Math.ceil(W / f), GH = Math.ceil(H / f), GN = GW * GH;
  const G = new Uint8Array(GN);
  for (let y = 0; y < H; y++) { const row = ((y / f) | 0) * GW; for (let x = 0; x < W; x++) if (SC[y * W + x] > thr) G[row + ((x / f) | 0)] = 1; }
  const R = Math.max(1, Math.round(Math.max(GW, GH) * 0.008)), T1 = new Uint8Array(GN), T = new Uint8Array(GN);
  for (let y = 0; y < GH; y++) { let last = -1e9; for (let x = 0; x < GW; x++) { if (G[y * GW + x]) last = x; if (x - last <= R) T1[y * GW + x] = 1; } last = 1e9; for (let x = GW - 1; x >= 0; x--) { if (G[y * GW + x]) last = x; if (last - x <= R) T1[y * GW + x] = 1; } }
  for (let x = 0; x < GW; x++) { let last = -1e9; for (let y = 0; y < GH; y++) { if (T1[y * GW + x]) last = y; if (y - last <= R) T[y * GW + x] = 1; } last = 1e9; for (let y = GH - 1; y >= 0; y--) { if (T1[y * GW + x]) last = y; if (last - y <= R) T[y * GW + x] = 1; } }
  const LAB = new Int32Array(GN), stack = new Int32Array(GN); let comps = [], id = 0;
  for (let p0 = 0; p0 < GN; p0++) {
    if (!T[p0] || LAB[p0]) continue;
    id++; let sp = 0; stack[sp++] = p0; LAB[p0] = id; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, ink = 0;
    while (sp) {
      const q = stack[--sp], qx = q % GW, qy = (q / GW) | 0;
      if (qx < x0) x0 = qx; if (qx > x1) x1 = qx; if (qy < y0) y0 = qy; if (qy > y1) y1 = qy; if (G[q]) ink++;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = qx + dx, ny = qy + dy; if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue; const r = ny * GW + nx; if (T[r] && !LAB[r]) { LAB[r] = id; stack[sp++] = r; } }
    }
    comps.push({ ids: [id], x0, y0, x1, y1, ink });
  }
  comps = comps.filter(c => c.ink >= Math.max(3, GN * 0.00004)).sort((a, b) => b.ink - a.ink).slice(0, 400);
  const sz = c => Math.max(c.x1 - c.x0, c.y1 - c.y0) + 1;
  for (let changed = true; changed;) {
    changed = false;
    outer: for (let i = 0; i < comps.length; i++) for (let j = i + 1; j < comps.length; j++) {
      const a = comps[i], b = comps[j];
      const gap = Math.max(Math.max(0, Math.max(a.x0, b.x0) - Math.min(a.x1, b.x1)), Math.max(0, Math.max(a.y0, b.y0) - Math.min(a.y1, b.y1)));
      if (gap <= Math.max(1, 0.3 * Math.min(sz(a), sz(b)))) {
        comps[i] = { ids: [...a.ids, ...b.ids], x0: Math.min(a.x0, b.x0), y0: Math.min(a.y0, b.y0), x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1), ink: a.ink + b.ink };
        comps.splice(j, 1); changed = true; break outer;
      }
    }
  }
  const big = Math.max(GW, GH);
  comps = comps.filter(c => sz(c) >= big * 0.035 && c.ink >= GN * 0.0004);
  const band = big * 0.12;
  comps.sort((a, b) => Math.round((a.y0 + a.y1) / 2 / band) - Math.round((b.y0 + b.y1) / 2 / band) || a.x0 - b.x0);
  A.grid = { f, GW, LAB };
  return comps.map(c => {
    const w = (c.x1 - c.x0 + 1) * f, h = (c.y1 - c.y0 + 1) * f, pad = Math.round(Math.max(w, h) * 0.04);
    const x = Math.max(0, c.x0 * f - pad), y = Math.max(0, c.y0 * f - pad);
    return { box: { x, y, w: Math.min(W - x, w + pad * 2), h: Math.min(H - y, h + pad * 2) }, ids: c.ids };
  });
}
/** 取出一顆印章：去背、統一印泥色、修邊 */
function sealExtract(A, c, opt = {}) {
  sealScore(A, opt.ink);
  const { W, SC, DK, NC } = A, { x, y, w, h } = c.box, ids = c.ids ? new Set(c.ids) : null, gr = A.grid;
  const thr = A.thr * (0.4 + (opt.strength ?? 50) / 100 * 1.2), lo = thr * 0.65, hi = thr * 1.1;
  const inMask = (xx, yy) => !ids || ids.has(gr.LAB[((yy / gr.f) | 0) * gr.GW + ((xx / gr.f) | 0)]);
  const hb = new Uint32Array(101); let hn = 0, cr = 0, cg = 0, cb = 0, cn2 = 0;
  for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) {
    const p = yy * W + xx; if (SC[p] <= hi || !inMask(xx, yy)) continue;
    hb[Math.min(100, Math.round(DK[p] * 100))]++; hn++;
    const dk = Math.max(0.05, DK[p]); cr += 1 - (1 - NC[p * 3] / 255) / dk; cg += 1 - (1 - NC[p * 3 + 1] / 255) / dk; cb += 1 - (1 - NC[p * 3 + 2] / 255) / dk; cn2++;
  }
  let acc = 0, p90 = 0.6; for (let i = 0; i <= 100; i++) { acc += hb[i]; if (acc >= hn * 0.9) { p90 = Math.max(0.15, i / 100); break; } }
  const gain = Math.min(2.6, Math.max(1, 0.95 / p90));
  const fixed = INK[opt.color || 'orig'] && INK[opt.color || 'orig'][1];
  const base = fixed || (cn2 ? [cr / cn2, cg / cn2, cb / cn2].map(v => Math.round(Math.min(1, Math.max(0, v)) * 255)) : [200, 30, 30]);
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d'), out = g.createImageData(w, h), O = out.data;
  let tx0 = w, ty0 = h, tx1 = -1, ty1 = -1;
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
    const p = (y + yy) * W + (x + xx);
    let m = SC[p] <= lo ? 0 : SC[p] >= hi ? 1 : (SC[p] - lo) / (hi - lo); m = m * m * (3 - 2 * m);
    if (m && !inMask(x + xx, y + yy)) m = 0;
    let a = Math.min(1, DK[p] * gain) * m; if (a < 0.05) a = 0;
    const j = (yy * w + xx) * 4; O[j] = base[0]; O[j + 1] = base[1]; O[j + 2] = base[2]; O[j + 3] = Math.round(a * 255);
    if (a > 0.12) { if (xx < tx0) tx0 = xx; if (xx > tx1) tx1 = xx; if (yy < ty0) ty0 = yy; if (yy > ty1) ty1 = yy; }
  }
  g.putImageData(out, 0, 0);
  if (tx1 < 0) return null;
  const pd = 2; tx0 = Math.max(0, tx0 - pd); ty0 = Math.max(0, ty0 - pd); tx1 = Math.min(w - 1, tx1 + pd); ty1 = Math.min(h - 1, ty1 + pd);
  const tw = tx1 - tx0 + 1, th = ty1 - ty0 + 1, sc = Math.min(1, 720 / Math.max(tw, th));
  const o = document.createElement('canvas'); o.width = Math.max(1, Math.round(tw * sc)); o.height = Math.max(1, Math.round(th * sc));
  const og = o.getContext('2d'); og.imageSmoothingQuality = 'high'; og.drawImage(cv, tx0, ty0, tw, th, 0, 0, o.width, o.height);
  return { canvas: o, url: o.toDataURL('image/png'), box: { x: x + tx0, y: y + ty0, w: tw, h: th }, color: base };
}
function sealGuessType(c, all, mmpp) {
  const ar = c.box.w / c.box.h, L = Math.max(c.box.w, c.box.h), narrow = ar < 0.55 || ar > 1.8;
  if (mmpp) { const mm = L * mmpp; if (mm < 28) return 'person'; return narrow ? 'title' : 'org'; }
  if (narrow) return 'title';
  const maxL = Math.max(...all.map(x => Math.max(x.box.w, x.box.h)));
  return all.length > 1 && L < maxL * 0.6 ? 'person' : 'org';
}
function sealSizeFor(c, type, mmpp) {
  const w = c.box.w, h = c.box.h;
  if (mmpp) return { wmm: +(w * mmpp).toFixed(1), hmm: +(h * mmpp).toFixed(1) };
  const L = SEAL_TYPES[type][1], k = L / Math.max(w, h);
  return { wmm: +(w * k).toFixed(1), hmm: +(h * k).toFixed(1) };
}

/* ---------- 介面：印章管理 ---------- */
let SV = { view: 'lib' }, UP = null;
const sealOwners = () => [...new Set([...S.people.map(p => (p.name || '').trim()), ...S.members.map(m => (m.name || '').trim())].filter(Boolean))].slice(0, 300);
function sealOpen(view = 'lib') { SV = { view }; const el = $('#seal'); el.hidden = false; document.body.classList.add('noscroll'); sealRender(); }
function sealClose() { $('#seal').hidden = true; if ($('#pv').hidden) document.body.classList.remove('noscroll'); UP = null; if (!$('#pv').hidden) refreshStamps($('#pv')); renderSide(); if (S.ui.view === 'scen') render(); }
const chk = url => `<span class="chk"><img src="${url}" alt=""></span>`;
const typeSel = (attr, v) => `<select ${attr}>${Object.entries(SEAL_TYPES).map(([k, [t]]) => `<option value="${k}"${k === v ? ' selected' : ''}>${t}</option>`).join('')}</select>`;
function sealRender() {
  const el = $('#seal'), v = SV.view;
  const lists = `<datalist id="sealTitles">${SEAL_TITLES.map(t => `<option value="${t}">`).join('')}</datalist><datalist id="sealOwners">${sealOwners().map(n => `<option value="${esc(n)}">`).join('')}</datalist>`;
  if (v === 'up') { el.innerHTML = sealUpHTML() + lists; return; }
  if (v === 'edit') { el.innerHTML = sealEditHTML() + lists; return; }
  if (v === 'sign') { el.innerHTML = sealSignHTML() + lists; sigInit(); return; }
  const L = S.seals;
  el.innerHTML = `<div class="pvbar"><button class="icon" data-seal="close" aria-label="關閉">${icon('x')}</button><b class="pvt">電子印章</b></div>
  <div class="sbody">
    <div class="note">${icon('lock')}<span>印章圖檔<b>只存在這台裝置的瀏覽器</b>，不會上傳。請勿在公用電腦上傳印章；用完可在這裡刪除。電子用印文件能否直接送件，以主管機關規定為準。</span></div>
    ${SealDB.persistent() ? '' : `<div class="note warn">${icon('warn')}<span>這個瀏覽器無法長期保存印章，關閉頁面後需要重新上傳；可用「⋯ → 備份資料」保存。</span></div>`}
    ${L.length ? `<label class="sw big"><input type="checkbox" data-p="stamp.on"${S.stamp.on !== false ? ' checked' : ''}><span class="swt"></span><b>文件自動加蓋印章</b></label>
    <p class="muted small">系統會依文件的簽章位置自動擺放：「蓋團體圖記」處用印信或大章；理事長等簽章處優先用該職稱的職章，沒有時用本人的印鑑或簽名。可在每份文件的「預覽」拖曳調整。</p>` : ''}
    <div class="sgrid">${L.map(s => `<div class="scard${sealOk(s) ? '' : ' miss'}">${sealOk(s) ? chk(sealUrl(s.id)) : `<span class="chk">${icon('warn')}</span>`}<b>${esc(s.name || sealDefName(s))}</b><small>${SEAL_TYPES[s.type][0]}${s.type === 'title' && s.title ? '・' + esc(s.title) : ''}${(s.type === 'person' || s.type === 'sign') && s.owner ? '・' + esc(s.owner) : ''}</small><small>${(s.wmm / 10).toFixed(1)} × ${(s.hmm / 10).toFixed(1)} 公分${sealOk(s) ? '' : '・圖檔遺失，請重新上傳'}</small>
      <span class="sact"><button class="mini" data-seal="edit" data-id="${s.id}">${icon('pen')}編輯</button><button class="mini danger" data-seal="del" data-id="${s.id}">${icon('x')}刪除</button></span></div>`).join('')}</div>
    ${L.length ? '' : `<div class="empty big">${icon('stamp', 'big')}<b>還沒有印章</b><span>上傳蓋在白紙上的印章照片或掃描檔，系統會自動切出每一顆章並去除背景。</span></div>`}
    <div class="btnrow col"><button class="btn pri" data-seal="pick">${icon('up')}上傳印章照片或掃描檔</button><button class="btn ghost" data-seal="sign">${icon('pen')}手寫簽名</button></div>
    <details class="card info"><summary>${icon('info')}拍照、掃描小技巧</summary><ul class="small">
      <li>把印章蓋在<b>白紙</b>上，可以一次蓋好團體圖記、大章、職章、印鑑再拍一張，系統會自動分開。</li>
      <li>光線均勻、手機在正上方拍，避免陰影與反光；印章之間留點距離。</li>
      <li>用掃描器以 300 dpi 掃描（JPG 或 PNG），或拍整張 A4 白紙，系統可以自動算出印章的實際尺寸。</li>
      <li>沒有自動算出尺寸時，請用尺量印章的實際寬高，填在「實際尺寸」。</li></ul></details>
  </div>${lists}`;
}
function sealUpHTML() {
  const n = UP.cands.filter(c => c.keep && c.res).length;
  return `<div class="pvbar"><button class="icon" data-seal="lib" aria-label="返回">${icon('back')}</button><b class="pvt">確認辨識結果</b></div>
  <div class="sbody">
    ${UP.srcs.map((s, si) => `<div class="srcbox${UP.draw === si ? ' drawing' : ''}" data-src="${si}"><img src="${s.url}" alt="上傳的圖片" draggable="false"><svg viewBox="0 0 ${s.A.W} ${s.A.H}" preserveAspectRatio="none">${UP.cands.map((c, i) => c.src === si ? `<g class="${c.keep ? 'on' : 'off'}"><rect x="${c.box.x}" y="${c.box.y}" width="${c.box.w}" height="${c.box.h}" rx="6"/><text x="${c.box.x + 8}" y="${c.box.y + Math.max(26, s.A.W / 30)}" font-size="${Math.max(24, s.A.W / 28)}">${i + 1}</text></g>` : '').join('')}<rect class="tmp" x="0" y="0" width="0" height="0"/></svg>
      <button class="mini drawbtn${UP.draw === si ? ' on' : ''}" data-seal="draw" data-src="${si}">${icon('plus')}${UP.draw === si ? '在圖上拖曳框出印章…' : '手動框選'}</button></div>`).join('')}
    <div class="sopts">
      <label>去背強度<input type="range" min="0" max="100" step="5" value="${UP.opt.strength}" data-sopt="strength"></label>
      <label>印泥<select data-sopt="ink">${Object.entries(INK_MODE).map(([k, t]) => `<option value="${k}"${UP.opt.ink === k ? ' selected' : ''}>${t}${k === 'auto' && UP.srcs[0] ? `（${INK_MODE[UP.srcs[0].A.autoInk]}）` : ''}</option>`).join('')}</select></label>
      <label>顏色<select data-sopt="color">${Object.entries(INK).map(([k, [t]]) => `<option value="${k}"${UP.opt.color === k ? ' selected' : ''}>${t}</option>`).join('')}</select></label>
    </div>
    <p class="muted small">${UP.cands.length ? `找到 ${UP.cands.length} 個印章。請確認類別、所屬人與實際尺寸（${UP.srcs.some(s => s.mmpp) ? '已依掃描解析度自動計算，可再修改' : '請用尺量印章實際大小'}）。不要的取消勾選；沒抓到的可用「手動框選」。` : '沒有找到印章，請用「手動框選」框出印章範圍，或調整去背強度、印泥顏色。'}</p>
    <div class="cands">${UP.cands.map((c, i) => candHTML(c, i)).join('')}</div>
    <div class="btnrow"><button class="btn ghost" data-seal="lib">取消</button><button class="btn pri" data-seal="save"${n ? '' : ' disabled'}>${icon('check')}加入 ${n} 個印章</button></div>
  </div>`;
}
function sealFields(o, attr) {
  return `${typeSel(`${attr} data-cf="type" aria-label="類別"`, o.type)}
    ${o.type === 'title' ? `<input ${attr} data-cf="title" list="sealTitles" value="${esc(o.title || '')}" placeholder="職稱，例如：理事長" aria-label="職稱">` : ''}
    ${o.type === 'person' || o.type === 'sign' ? `<input ${attr} data-cf="owner" list="sealOwners" value="${esc(o.owner || '')}" placeholder="所屬人姓名" aria-label="所屬人">` : ''}
    <input ${attr} data-cf="name" value="${esc(o.name || '')}" placeholder="${esc(sealDefName(o))}" aria-label="名稱">
    <span class="szrow"><span class="szl">實際尺寸（公分）</span><span class="szi">寬<input ${attr} data-cf="wcm" type="number" inputmode="decimal" step="0.1" min="0.5" max="15" value="${(o.wmm / 10).toFixed(1)}" aria-label="寬（公分）"></span><span class="szi">高<input ${attr} data-cf="hcm" type="number" inputmode="decimal" step="0.1" min="0.5" max="15" value="${(o.hmm / 10).toFixed(1)}" aria-label="高（公分）"></span></span>`;
}
function candHTML(c, i) {
  return `<div class="cand${c.keep ? '' : ' off'}">${c.res ? chk(c.res.url) : `<span class="chk">${icon('warn')}</span>`}
    <div class="cf"><label class="ck"><input type="checkbox" data-cand="${i}" data-cf="keep"${c.keep ? ' checked' : ''}><b>第 ${i + 1} 個</b></label>${sealFields(c, `data-cand="${i}"`)}</div></div>`;
}
async function sealFiles(files) {
  const busy = showBusy('正在辨識印章…');
  try {
    const srcs = [];
    for (const f of files) {
      const url = URL.createObjectURL(f);
      let img; try { img = await loadImgUrl(url); } catch (e) { toast(`無法讀取「${f.name}」，請改用 JPG 或 PNG（iPhone 可在相機設定選「最相容」）`, 'err'); continue; }
      const A = sealAnalyze(img), dpi = await readDpi(f), k = A.W / img.naturalWidth, Lg = Math.max(img.naturalWidth, img.naturalHeight), Sm = Math.min(img.naturalWidth, img.naturalHeight);
      let mmpp = 0;
      if (dpi >= 150 && dpi <= 1600) mmpp = 25.4 / dpi / k;
      else if (Lg >= 1500 && Math.abs(Lg / Sm - 1.4142) < 0.025) mmpp = 297 / Lg / k;
      srcs.push({ url, img, A, mmpp });
    }
    if (!srcs.length) return;
    UP = { srcs, cands: [], opt: { strength: 50, ink: 'auto', color: 'orig' }, draw: -1 };
    srcs.forEach((s, si) => { sealScore(s.A, 'auto'); sealDetect(s.A).forEach(c => UP.cands.push({ ...c, src: si, keep: true })); });
    upRefresh(true);
    SV.view = 'up'; sealRender();
  } finally { busy.done(); }
}
/** 依目前選項重新去背；first：第一次時順便猜類別與尺寸 */
function upRefresh(first) {
  const all = UP.cands;
  all.forEach(c => {
    const s = UP.srcs[c.src];
    c.res = sealExtract(s.A, c, UP.opt);
    if (first || c.fresh) {
      c.type = sealGuessType(c, all.filter(x => x.src === c.src), s.mmpp);
      if (c.type === 'title') c.title = '理事長';
      Object.assign(c, sealSizeFor(c.res || c, c.type, s.mmpp)); c.fresh = false;
    }
    if (!c.res) c.keep = false;
  });
}
async function sealSave() {
  const keep = UP.cands.filter(c => c.keep && c.res);
  for (const c of keep) {
    const s = UP.srcs[c.src], id = 'seal' + uid(), M2 = Math.round(Math.max(c.res.box.w, c.res.box.h) * 0.15);
    const bx = Math.max(0, c.res.box.x - M2), by = Math.max(0, c.res.box.y - M2), bw = Math.min(s.A.W - bx, c.res.box.w + M2 * 2), bh = Math.min(s.A.H - by, c.res.box.h + M2 * 2);
    const sc = Math.min(1, 1100 / Math.max(bw, bh)), cv = document.createElement('canvas'); cv.width = Math.round(bw * sc); cv.height = Math.round(bh * sc);
    cv.getContext('2d').drawImage(s.A.cv, bx, by, bw, bh, 0, 0, cv.width, cv.height);
    const rec = { id, type: c.type, title: c.type === 'title' ? (c.title || '理事長') : '', owner: c.type === 'person' || c.type === 'sign' ? (c.owner || '') : '', wmm: c.wmm, hmm: c.hmm, rot: 0, color: UP.opt.color, strength: UP.opt.strength, ink: UP.opt.ink, mmpp: s.mmpp ? s.mmpp / sc : 0 };
    rec.name = (c.name || '').trim() || sealDefName(rec);
    await SealDB.put(id, { png: c.res.url, src: cv.toDataURL('image/jpeg', 0.9) });
    S.seals.push(rec);
  }
  if (S.stamp.on == null) S.stamp.on = true;
  save(); UP.srcs.forEach(s => URL.revokeObjectURL(s.url)); UP = null;
  SV.view = 'lib'; sealRender(); toast(`已加入 ${keep.length} 個印章`);
}
/* 編輯：重新去背、尺寸、旋轉 */
function sealEditHTML() {
  const s = sealById(SV.id); if (!s) { SV.view = 'lib'; return ''; }
  const E = SV.e;
  return `<div class="pvbar"><button class="icon" data-seal="lib" aria-label="返回">${icon('back')}</button><b class="pvt">編輯印章</b></div>
  <div class="sbody">
    <div class="eprev">${chk(E.url)}${E.rot ? '' : ''}</div>
    <div class="cand solo"><div class="cf">${sealFields(E, 'data-edit="1"')}</div></div>
    <div class="sopts">
      <label>旋轉校正<input type="range" min="-20" max="20" step="1" value="${E.rot || 0}" data-eopt="rot"><output>${E.rot || 0}°</output></label>
      ${E.src ? `<label>去背強度<input type="range" min="0" max="100" step="5" value="${E.strength ?? 50}" data-eopt="strength"></label>
      <label>印泥<select data-eopt="ink">${Object.entries(INK_MODE).map(([k, t]) => `<option value="${k}"${(E.ink || 'auto') === k ? ' selected' : ''}>${t}</option>`).join('')}</select></label>` : ''}
      <label>顏色<select data-eopt="color">${Object.entries(INK).map(([k, [t]]) => `<option value="${k}"${(E.color || 'orig') === k ? ' selected' : ''}>${t}</option>`).join('')}</select></label>
    </div>
    <div class="btnrow"><button class="btn ghost" data-seal="lib">取消</button><button class="btn pri" data-seal="esave">${icon('check')}儲存</button></div>
  </div>`;
}
async function sealEditOpen(id) {
  const s = sealById(id), rec = await SealDB.get(id); if (!s) return;
  SV = { view: 'edit', id, e: { ...s, url: rec ? rec.png : '', src: rec ? rec.src : '', png: rec ? rec.png : '' } };
  sealRender();
}
let ED_A = null;
async function sealEditReprocess() {
  const E = SV.e;
  if (E.src && (E.reproc || E.colorChanged)) {
    if (!ED_A || ED_A.key !== SV.id) { const im = await loadImgUrl(E.src); ED_A = sealAnalyze(im, 1200); ED_A.key = SV.id; ED_A.k = ED_A.W / im.naturalWidth; }
    sealScore(ED_A, E.ink); const cs = sealDetect(ED_A), A = ED_A;
    const mid = c => Math.abs(c.box.x + c.box.w / 2 - A.W / 2) < A.W * 0.3 && Math.abs(c.box.y + c.box.h / 2 - A.H / 2) < A.H * 0.3;
    const pick = cs.filter(mid);
    const c = pick.length ? { box: pick.reduce((u, c2) => { const x0 = Math.min(u.x, c2.box.x), y0 = Math.min(u.y, c2.box.y); return { x: x0, y: y0, w: Math.max(u.x + u.w, c2.box.x + c2.box.w) - x0, h: Math.max(u.y + u.h, c2.box.y + c2.box.h) - y0 }; }, pick[0].box), ids: pick.flatMap(c2 => c2.ids) } : { box: { x: 0, y: 0, w: A.W, h: A.H } };
    const r = sealExtract(A, c, { strength: E.strength, ink: E.ink, color: E.color });
    if (r) { E.png = r.url; E.url = r.url; if (E.mmpp) { const mm = E.mmpp / (A.k || 1); E.wmm = +(r.box.w * mm).toFixed(1); E.hmm = +(r.box.h * mm).toFixed(1); } else E.hmm = +(E.wmm * r.box.h / r.box.w).toFixed(1); }
  } else if (E.colorChanged && E.png) {
    const im = await loadImgUrl(E.png), cv = document.createElement('canvas'); cv.width = im.naturalWidth; cv.height = im.naturalHeight;
    const g = cv.getContext('2d'); g.drawImage(im, 0, 0); const col = INK[E.color || 'orig'][1];
    if (col) { const d = g.getImageData(0, 0, cv.width, cv.height); for (let i = 0; i < d.data.length; i += 4) { d.data[i] = col[0]; d.data[i + 1] = col[1]; d.data[i + 2] = col[2]; } g.putImageData(d, 0, 0); E.png = E.url = cv.toDataURL('image/png'); }
  }
  E.reproc = E.colorChanged = false;
  const pv = $('#seal .eprev'); if (pv) pv.innerHTML = chk(E.url);
  const w = $('#seal [data-cf=wcm]'), h = $('#seal [data-cf=hcm]'); if (w) w.value = (E.wmm / 10).toFixed(1); if (h) h.value = (E.hmm / 10).toFixed(1);
}
async function sealEditSave() {
  const s = sealById(SV.id), E = SV.e; if (!s) return;
  Object.assign(s, { name: (E.name || '').trim() || sealDefName(E), type: E.type, title: E.type === 'title' ? (E.title || '理事長') : '', owner: E.type === 'person' || E.type === 'sign' ? (E.owner || '') : '', wmm: +E.wmm || s.wmm, hmm: +E.hmm || s.hmm, rot: +E.rot || 0, color: E.color, strength: E.strength, ink: E.ink });
  const rec = await SealDB.get(s.id);
  if (E.png && rec && E.png !== rec.png) { await SealDB.put(s.id, { ...rec, png: E.png }); }
  sealCacheClear(s.id); save(); ED_A = null; SV = { view: 'lib' }; sealRender(); toast('已儲存');
}
/* 手寫簽名 */
function sealSignHTML() {
  const o = SV.sg || (SV.sg = { owner: chairName() || '', color: 'black', width: 3 });
  return `<div class="pvbar"><button class="icon" data-seal="lib" aria-label="返回">${icon('back')}</button><b class="pvt">手寫簽名</b></div>
  <div class="sbody">
    <p class="muted small">用手指或滑鼠在框內簽名，完成後會去除背景，存成可以放進文件的簽名圖。</p>
    <div class="sigwrap"><canvas id="sigCv"></canvas><span class="sigline">請在線上簽名</span></div>
    <div class="sopts">
      <label>筆色<select data-sg="color">${[['black', '黑色'], ['blue', '藍色']].map(([k, t]) => `<option value="${k}"${o.color === k ? ' selected' : ''}>${t}</option>`).join('')}</select></label>
      <label>粗細<select data-sg="width">${[[2, '細'], [3, '中'], [4.5, '粗']].map(([k, t]) => `<option value="${k}"${+o.width === k ? ' selected' : ''}>${t}</option>`).join('')}</select></label>
      <button class="mini" data-seal="sigclear">${icon('x')}清除重簽</button>
    </div>
    <div class="cand solo"><div class="cf"><input data-sg="owner" list="sealOwners" value="${esc(o.owner)}" placeholder="簽名的人（姓名）" aria-label="簽名的人"></div></div>
    <div class="btnrow"><button class="btn ghost" data-seal="lib">取消</button><button class="btn pri" data-seal="sigsave">${icon('check')}完成</button></div>
  </div>`;
}
let SIG = null;
function sigInit() {
  const cv = $('#sigCv'); if (!cv) return;
  const r = cv.getBoundingClientRect(), dpr = Math.min(3, window.devicePixelRatio || 1);
  cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
  const g = cv.getContext('2d'); g.scale(dpr, dpr); g.lineCap = g.lineJoin = 'round';
  SIG = { cv, g, dpr, drawing: false, pts: [], any: false };
  const pos = e => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
  cv.onpointerdown = e => { e.preventDefault(); cv.setPointerCapture(e.pointerId); SIG.drawing = true; SIG.pts = [pos(e)]; const o = SV.sg; g.strokeStyle = o.color === 'blue' ? '#1e3fa6' : '#111'; g.lineWidth = +o.width; g.beginPath(); g.arc(SIG.pts[0][0], SIG.pts[0][1], g.lineWidth / 2, 0, Math.PI * 2); g.fillStyle = g.strokeStyle; g.fill(); SIG.any = true; };
  cv.onpointermove = e => {
    if (!SIG.drawing) return; const p = pos(e), P = SIG.pts; P.push(p);
    if (P.length >= 3) { const a = P[P.length - 3], b = P[P.length - 2], m1 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], m2 = [(b[0] + p[0]) / 2, (b[1] + p[1]) / 2]; g.beginPath(); g.moveTo(m1[0], m1[1]); g.quadraticCurveTo(b[0], b[1], m2[0], m2[1]); g.stroke(); }
  };
  cv.onpointerup = cv.onpointercancel = () => { SIG.drawing = false; };
}
async function sigSave() {
  if (!SIG || !SIG.any) { toast('請先在框內簽名', 'err'); return; }
  const { cv } = SIG, g = cv.getContext('2d'), d = g.getImageData(0, 0, cv.width, cv.height).data;
  let x0 = cv.width, y0 = cv.height, x1 = -1, y1 = -1;
  for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) if (d[(y * cv.width + x) * 4 + 3] > 20) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 < 0) { toast('請先在框內簽名', 'err'); return; }
  const p = 6; x0 = Math.max(0, x0 - p); y0 = Math.max(0, y0 - p); x1 = Math.min(cv.width - 1, x1 + p); y1 = Math.min(cv.height - 1, y1 + p);
  const o = document.createElement('canvas'); o.width = x1 - x0 + 1; o.height = y1 - y0 + 1; o.getContext('2d').drawImage(cv, x0, y0, o.width, o.height, 0, 0, o.width, o.height);
  const cssW = cv.width / SIG.dpr, wmm = Math.min(50, Math.max(15, 60 * (o.width / SIG.dpr) / cssW)), hmm = wmm * o.height / o.width;
  const owner = (SV.sg.owner || '').trim(), id = 'seal' + uid(), rec = { id, type: 'sign', title: '', owner, wmm: +wmm.toFixed(1), hmm: +hmm.toFixed(1), rot: 0, color: 'orig' };
  rec.name = sealDefName(rec);
  await SealDB.put(id, { png: o.toDataURL('image/png'), src: '' });
  S.seals.push(rec); if (S.stamp.on == null) S.stamp.on = true; save();
  SV = { view: 'lib' }; sealRender(); toast('已加入簽名');
}

/* ---------- 事件 ---------- */
$('#sealIn').addEventListener('change', async e => { const fs = [...e.target.files]; e.target.value = ''; if (fs.length) await sealFiles(fs); });
document.addEventListener('click', async e => {
  const t = e.target.closest('[data-seal]'); if (!t) return;
  const a = t.dataset.seal;
  if (a === 'close') return sealClose();
  if (a === 'lib') { if (UP) UP.srcs.forEach(s => URL.revokeObjectURL(s.url)); UP = null; ED_A = null; SV = { view: 'lib' }; return sealRender(); }
  if (a === 'pick') return $('#sealIn').click();
  if (a === 'sign') { SV = { view: 'sign' }; return sealRender(); }
  if (a === 'sigclear') { if (SIG) { SIG.g.clearRect(0, 0, SIG.cv.width, SIG.cv.height); SIG.any = false; } return; }
  if (a === 'sigsave') return sigSave();
  if (a === 'save') return sealSave();
  if (a === 'edit') return sealEditOpen(t.dataset.id);
  if (a === 'esave') return sealEditSave();
  if (a === 'draw') { const si = +t.dataset.src; UP.draw = UP.draw === si ? -1 : si; return sealRender(); }
  if (a === 'del') {
    const s = sealById(t.dataset.id); if (!s) return;
    if (!(await ask(`確定刪除「${s.name}」？已排在文件上的這個印章也會一起移除。`))) return;
    S.seals = S.seals.filter(x => x.id !== s.id); await SealDB.del(s.id); sealCacheClear(s.id);
    Object.values(S.stamp.docs || {}).forEach(dd => { if (dd.items) dd.items = dd.items.filter(it => it.sid !== s.id); });
    save(); sealRender();
  }
});
function candSet(c, f, v) {
  if (f === 'keep') c.keep = v;
  else if (f === 'wcm') { const w = Math.max(5, num(v) * 10); c.hmm = +(c.hmm * w / c.wmm).toFixed(1); c.wmm = +w.toFixed(1); return 'h'; }
  else if (f === 'hcm') { const h = Math.max(5, num(v) * 10); c.wmm = +(c.wmm * h / c.hmm).toFixed(1); c.hmm = +h.toFixed(1); return 'w'; }
  else if (f === 'type') { const was = c.type; c.type = v; if (v === 'title' && !c.title) c.title = '理事長'; if (!c.mmppKnown && SEAL_TYPES[was][1] !== SEAL_TYPES[v][1]) { const k = SEAL_TYPES[v][1] / Math.max(c.wmm, c.hmm); c.wmm = +(c.wmm * k).toFixed(1); c.hmm = +(c.hmm * k).toFixed(1); } return 'r'; }
  else c[f] = v;
}
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.cand != null && UP) { const c = UP.cands[+t.dataset.cand]; c.mmppKnown = !!UP.srcs[c.src].mmpp; const r = candSet(c, t.dataset.cf, t.type === 'checkbox' ? t.checked : t.value); if (r) sealRender(); else if (t.dataset.cf === 'keep') sealRender(); return; }
  if (t.dataset.edit && SV.e) { const r = candSet(SV.e, t.dataset.cf, t.value); SV.e.mmppKnown = !!SV.e.mmpp; if (r === 'r') sealRender(); else if (r) { const o = $(`#seal [data-cf=${r === 'h' ? 'hcm' : 'wcm'}]`); if (o) o.value = ((r === 'h' ? SV.e.hmm : SV.e.wmm) / 10).toFixed(1); } return; }
  if (t.dataset.sopt && UP) { UP.opt[t.dataset.sopt] = t.dataset.sopt === 'strength' ? +t.value : t.value; const busy = showBusy('重新去背…'); setTimeout(() => { try { if (t.dataset.sopt === 'ink') { UP.srcs.forEach(s => { s.A.SC = null; s.A.md = null; sealScore(s.A, UP.opt.ink); }); UP.cands = []; UP.srcs.forEach((s, si) => sealDetect(s.A).forEach(c => UP.cands.push({ ...c, src: si, keep: true, fresh: true }))); upRefresh(false); } else upRefresh(false); sealRender(); } finally { busy.done(); } }, 30); return; }
  if (t.dataset.eopt && SV.e) { const k = t.dataset.eopt; SV.e[k] = k === 'rot' || k === 'strength' ? +t.value : t.value; if (k === 'rot') { const o = t.parentElement.querySelector('output'); if (o) o.textContent = t.value + '°'; const im = $('#seal .eprev img'); if (im) im.style.transform = `rotate(${t.value}deg)`; return; } if (k === 'color') SV.e.colorChanged = true; else { SV.e.reproc = true; if (k === 'ink') ED_A = null; } sealEditReprocess(); return; }
  if (t.dataset.sg && SV.sg) { SV.sg[t.dataset.sg] = t.value; }
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.eopt === 'rot' && SV.e) { const o = t.parentElement.querySelector('output'); if (o) o.textContent = t.value + '°'; const im = $('#seal .eprev img'); if (im) im.style.transform = `rotate(${t.value}deg)`; SV.e.rot = +t.value; }
  if (t.dataset.sg === 'owner' && SV.sg) SV.sg.owner = t.value;
  if (t.dataset.cand != null && UP && ['name', 'title', 'owner'].includes(t.dataset.cf)) UP.cands[+t.dataset.cand][t.dataset.cf] = t.value;
  if (t.dataset.edit && SV.e && ['name', 'title', 'owner'].includes(t.dataset.cf)) SV.e[t.dataset.cf] = t.value;
});
/* 手動框選 */
document.addEventListener('pointerdown', e => {
  const box = e.target.closest('#seal .srcbox.drawing'); if (!box || !UP || e.target.closest('button')) return;
  e.preventDefault();
  const si = +box.dataset.src, s = UP.srcs[si], img = box.querySelector('img'), rect = box.querySelector('rect.tmp');
  const toImg = ev => { const r = img.getBoundingClientRect(); return [Math.max(0, Math.min(s.A.W, (ev.clientX - r.left) / r.width * s.A.W)), Math.max(0, Math.min(s.A.H, (ev.clientY - r.top) / r.height * s.A.H))]; };
  const p0 = toImg(e); box.setPointerCapture(e.pointerId);
  const mv = ev => { const p = toImg(ev); rect.setAttribute('x', Math.min(p0[0], p[0])); rect.setAttribute('y', Math.min(p0[1], p[1])); rect.setAttribute('width', Math.abs(p[0] - p0[0])); rect.setAttribute('height', Math.abs(p[1] - p0[1])); };
  const up = ev => {
    box.removeEventListener('pointermove', mv); box.removeEventListener('pointerup', up); box.removeEventListener('pointercancel', up);
    const p = toImg(ev), x = Math.round(Math.min(p0[0], p[0])), y = Math.round(Math.min(p0[1], p[1])), w = Math.round(Math.abs(p[0] - p0[0])), h = Math.round(Math.abs(p[1] - p0[1]));
    UP.draw = -1;
    if (w > 12 && h > 12) { const c = { box: { x, y, w, h }, ids: null, src: si, keep: true, fresh: true }; UP.cands.push(c); upRefresh(false); if (!c.res) toast('框選範圍內沒有找到印泥，請調整去背強度或印泥顏色', 'err'); }
    sealRender();
  };
  box.addEventListener('pointermove', mv); box.addEventListener('pointerup', up); box.addEventListener('pointercancel', up);
});
