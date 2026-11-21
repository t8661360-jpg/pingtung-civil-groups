/* ===== 雲端存檔：Google 帳號 =====
 資料存在使用者「自己的」Google 雲端硬碟應用程式專用空間（drive.appdata，非敏感權限），
 其他應用程式、本網站管理者都看不到。需在 config.json 設定 googleClientId 才會出現。
 沒有設定或在 claude.ai 預覽中：只提供下載／分享備份檔。 */
const APP_CONFIG = { googleClientId: '' };
const G_SCOPE = 'https://www.googleapis.com/auth/drive.appdata openid email';
const G_FILE = 'pt-assoc-forms.json';
const CLOUD = { st: 'off', token: '', exp: 0, fileId: '', at: 0, busy: false, dirty: false, err: '' };
const inArtifact = () => !!(window.claude && window.claude.use);
const cloudReady = () => !!APP_CONFIG.googleClientId && !inArtifact() && location.protocol === 'https:';
const cloudOn = () => cloudReady() && !!(S.cloud && S.cloud.on);
const fmtTime = t => { if (!t) return '—'; const d = new Date(t); return `${d.getFullYear() - 1911}/${d.getMonth() + 1}/${d.getDate()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
async function cloudInit() {
  if (location.protocol === 'https:' && !inArtifact()) { try { const r = await fetch('config.json', { cache: 'no-store' }); if (r.ok) { const j = await r.json(); if (j && typeof j === 'object') Object.assign(APP_CONFIG, j); } } catch (e) { } }
  try { const t = JSON.parse(sessionStorage.getItem('pt-cloud-token') || 'null'); if (t && t.exp > Date.now()) { CLOUD.token = t.token; CLOUD.exp = t.exp; } } catch (e) { }
  if (cloudOn()) { CLOUD.st = CLOUD.token ? 'ok' : 'auth'; if (CLOUD.token) cloudSync(false); }
  renderCloudChip();
}
function cloudToken(prompt = '') {
  return loadLib('gsi').then(g => new Promise((res, rej) => {
    const tc = g.accounts.oauth2.initTokenClient({
      client_id: APP_CONFIG.googleClientId, scope: G_SCOPE,
      callback: r => {
        if (!r || r.error) return rej(new Error(r && (r.error_description || r.error) || '登入失敗'));
        CLOUD.token = r.access_token; CLOUD.exp = Date.now() + (Number(r.expires_in || 3600) - 120) * 1000;
        try { sessionStorage.setItem('pt-cloud-token', JSON.stringify({ token: CLOUD.token, exp: CLOUD.exp })); } catch (e) { }
        res(CLOUD.token);
      },
      error_callback: e => rej(new Error(e && e.type === 'popup_closed' ? '已取消登入' : '無法開啟 Google 登入視窗，請允許此網站開啟彈出式視窗後再試')),
    });
    tc.requestAccessToken({ prompt, hint: (S.cloud && S.cloud.email) || undefined });
  }));
}
async function gapi(method, url, body, headers = {}) {
  if (!CLOUD.token || Date.now() > CLOUD.exp) throw Object.assign(new Error('需要重新連線雲端'), { code: 'auth' });
  const r = await fetch(url, { method, headers: { Authorization: 'Bearer ' + CLOUD.token, ...headers }, body });
  if (r.status === 401 || r.status === 403) { CLOUD.token = ''; try { sessionStorage.removeItem('pt-cloud-token'); } catch (e) { } throw Object.assign(new Error('需要重新連線雲端'), { code: 'auth' }); }
  if (!r.ok) throw new Error('雲端回應錯誤（' + r.status + '）');
  return r;
}
async function cloudFind() {
  const q = encodeURIComponent(`name='${G_FILE}' and trashed=false`);
  const j = await (await gapi('GET', `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${q}&fields=files(id,modifiedTime)&orderBy=modifiedTime%20desc&pageSize=5`)).json();
  return (j.files || [])[0] || null;
}
async function cloudPayload() {
  const data = JSON.parse(JSON.stringify(S)); delete data.ui; delete data.cloud;
  const out = { app: 'pt-assoc-forms', v: 3, savedAt: (S.meta || {}).savedAt || Date.now(), data };
  if (S.cloud && S.cloud.seals) { out.seals = {}; for (const s of S.seals) { const r = await SealDB.get(s.id); if (r) out.seals[s.id] = r; } }
  return out;
}
async function cloudUpload(payload) {
  const body = JSON.stringify(payload);
  if (CLOUD.fileId) {
    try { return await (await gapi('PATCH', `https://www.googleapis.com/upload/drive/v3/files/${CLOUD.fileId}?uploadType=media&fields=id,modifiedTime`, body, { 'Content-Type': 'application/json' })).json(); }
    catch (e) { if (e.code === 'auth') throw e; CLOUD.fileId = ''; }
  }
  const bd = 'ptf' + uid() + uid(), meta = { name: G_FILE, parents: ['appDataFolder'], mimeType: 'application/json' };
  const mp = `--${bd}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${bd}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${body}\r\n--${bd}--`;
  const j = await (await gapi('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,modifiedTime', mp, { 'Content-Type': `multipart/related; boundary=${bd}` })).json();
  CLOUD.fileId = j.id; return j;
}
const localEmpty = () => (S.meta && S.meta.sample) || (!S.org.name && !S.people.length && !S.members.length);
async function applyRemote(rm) {
  const ui = S.ui, cl = S.cloud;
  S = merge(blankState(), rm.data || {}); S.ui = { ...S.ui, ...ui, view: ui.view }; S.cloud = cl;
  if (rm.seals) for (const [id, r] of Object.entries(rm.seals)) if (r && r.png) { await SealDB.put(id, r); sealCacheClear(id); }
  save({ keepTime: true, noCloud: true }); render();
}
/** 連線後比對雲端與這台的資料；ask：雲端較新時詢問 */
async function cloudSync(interactive = true) {
  if (CLOUD.busy) return;
  CLOUD.busy = true; CLOUD.st = 'busy'; renderCloudChip();
  try {
    const f = await cloudFind();
    if (f) {
      CLOUD.fileId = f.id;
      const rm = await (await gapi('GET', `https://www.googleapis.com/drive/v3/files/${f.id}?alt=media`)).json();
      const rAt = rm.savedAt || 0, lAt = (S.meta || {}).savedAt || 0;
      if (localEmpty() && rAt) { await applyRemote(rm); if (S.meta) delete S.meta.sample; save({ keepTime: true, noCloud: true }); toast('已載入雲端資料'); }
      else if (rAt > lAt + 1000) {
        CLOUD.busy = false;
        const ok = await ask(`雲端有較新的資料（${fmtTime(rAt)}${rm.data && rm.data.org && rm.data.org.name ? '，' + rm.data.org.name : ''}）。\n要載入到這台裝置嗎？這台目前的資料（${fmtTime(lAt)}）會被取代。`, { ok: '載入雲端資料', no: '保留這台的資料' });
        CLOUD.busy = true;
        if (ok) { await applyRemote(rm); toast('已載入雲端資料'); } else await cloudUpload(await cloudPayload());
      } else if (lAt > rAt + 1000 && !(S.meta && S.meta.sample)) await cloudUpload(await cloudPayload());
    } else if (!(S.meta && S.meta.sample)) await cloudUpload(await cloudPayload());
    CLOUD.at = Date.now(); CLOUD.dirty = false; CLOUD.st = 'ok';
    S.meta.lastCloud = CLOUD.at; save({ keepTime: true, noCloud: true });
  } catch (e) { CLOUD.st = e.code === 'auth' ? 'auth' : 'err'; CLOUD.err = e.message; if (interactive) toast('雲端同步失敗：' + e.message, 'err'); }
  finally { CLOUD.busy = false; renderCloudChip(); if (!$('#sheet').hidden && $('#sheet .cloudbox')) CMDS.cloud(); }
}
async function cloudSignIn() {
  try {
    CLOUD.st = 'busy'; renderCloudChip();
    await cloudToken(S.cloud && S.cloud.email ? '' : 'select_account');
    let email = '';
    try { email = (await (await gapi('GET', 'https://www.googleapis.com/oauth2/v3/userinfo')).json()).email || ''; } catch (e) { }
    S.cloud = { ...(S.cloud || {}), on: true, email }; save({ keepTime: true, noCloud: true });
    await cloudSync(true);
    if (CLOUD.st === 'ok') toast(`已連線雲端${email ? '：' + email : ''}`);
  } catch (e) { CLOUD.st = S.cloud && S.cloud.on ? 'auth' : 'off'; toast(e.message, 'err'); renderCloudChip(); }
  if (!$('#sheet').hidden && $('#sheet .cloudbox')) CMDS.cloud();
}
async function cloudSignOut() {
  if (!(await ask('登出雲端存檔？這台裝置上的資料會保留，雲端的資料也不會刪除。', { ok: '登出', no: '取消' }))) return;
  try { if (CLOUD.token && window.google && google.accounts) google.accounts.oauth2.revoke(CLOUD.token, () => { }); } catch (e) { }
  Object.assign(CLOUD, { st: 'off', token: '', exp: 0, fileId: '', at: 0, dirty: false });
  try { sessionStorage.removeItem('pt-cloud-token'); } catch (e) { }
  S.cloud = { on: false }; save({ keepTime: true, noCloud: true }); renderCloudChip(); CMDS.cloud(); toast('已登出雲端存檔');
}
let cloudTimer = null;
function cloudOnSave() {
  if (!cloudOn() || (S.meta && S.meta.sample)) return;
  CLOUD.dirty = true; clearTimeout(cloudTimer);
  if (!CLOUD.token || Date.now() > CLOUD.exp) { CLOUD.st = 'auth'; renderCloudChip(); return; }
  cloudTimer = setTimeout(cloudPush, 4000); renderCloudChip();
}
async function cloudPush() {
  if (!cloudOn() || (S.meta && S.meta.sample)) return;
  if (!CLOUD.token || Date.now() > CLOUD.exp) { CLOUD.st = 'auth'; renderCloudChip(); return; }
  if (CLOUD.busy) { clearTimeout(cloudTimer); cloudTimer = setTimeout(cloudPush, 3000); return; }
  CLOUD.busy = true; CLOUD.st = 'busy'; renderCloudChip();
  try { await cloudUpload(await cloudPayload()); CLOUD.at = Date.now(); CLOUD.dirty = false; CLOUD.st = 'ok'; S.meta.lastCloud = CLOUD.at; save({ keepTime: true, noCloud: true }); }
  catch (e) { CLOUD.st = e.code === 'auth' ? 'auth' : 'err'; CLOUD.err = e.message; }
  finally { CLOUD.busy = false; renderCloudChip(); }
}
function renderCloudChip() {
  const el = $('#cloudChip'); if (!el) return;
  if (!cloudOn()) { el.hidden = true; return; }
  el.hidden = false;
  const st = CLOUD.busy ? 'busy' : CLOUD.dirty && CLOUD.st === 'ok' ? 'dirty' : CLOUD.st;
  const T = { ok: '雲端已同步', busy: '同步中…', dirty: '等待同步', auth: '點此連線雲端', err: '同步失敗，點此重試', off: '雲端' };
  el.className = 'cloudchip st-' + st; el.title = T[st] || ''; el.setAttribute('aria-label', T[st] || '雲端');
  el.innerHTML = `${icon('cloud')}<span>${T[st] || ''}</span>`;
}
async function cloudChipClick() {
  if (CLOUD.st === 'auth') return cloudSignIn();
  if (CLOUD.st === 'err') return cloudSync(true);
  CMDS.cloud();
}
/* 備份檔分享（任何電子郵件、雲端硬碟、LINE 都可以） */
async function backupBlob(withSeals) {
  let data = S;
  if (withSeals) { const imgs = {}; for (const s of S.seals) { const r = await SealDB.get(s.id); if (r) imgs[s.id] = r; } data = { ...S, sealImgs: imgs }; }
  return new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' });
}
const canShareFiles = () => { try { return !inArtifact() && !!navigator.canShare && navigator.canShare({ files: [new File(['x'], 'x.json', { type: 'application/json' })] }); } catch (e) { return false; } };
async function shareBackup() {
  const seals = S.seals.length && await ask('備份檔要一併包含印章圖檔嗎？\n換裝置時需要；含印章的備份檔請妥善保管，不要交給他人。', { ok: '包含印章', no: '不含印章' });
  const name = `${orgShort()}_會務填報備份_${isoToday()}.json`, blob = await backupBlob(seals);
  if (canShareFiles()) {
    try { await navigator.share({ files: [new File([blob], name, { type: 'application/json' })], title: '會務填報備份', text: '屏東縣社團會務文件線上填報的備份檔。換裝置時，請在網頁右上角「⋯ → 還原資料」選擇這個檔案。' }); S.meta.lastBackup = Date.now(); save({ keepTime: true }); return; }
    catch (e) { if (e && e.name === 'AbortError') return; }
  }
  if (await saveFile(name, blob)) { S.meta.lastBackup = Date.now(); save({ keepTime: true }); }
}
function backupReminder() {
  if (cloudOn() || localEmpty()) return '';
  const lb = (S.meta || {}).lastBackup, days = lb ? Math.floor((Date.now() - lb) / 86400000) : null;
  if (days != null && days < 14) return '';
  return `<section class="card remind">${icon('warn')}<div><b>${days == null ? '還沒有備份過資料' : `已經 ${days} 天沒有備份`}</b><small>資料只存在這台裝置的瀏覽器，清除瀏覽紀錄或換手機就會不見。${cloudReady() ? '可以登入 Google 帳號自動存到雲端，或' : '建議'}下載備份檔，${canShareFiles() ? '也可以分享到自己的信箱或雲端硬碟。' : '存到自己的電腦或雲端硬碟。'}</small>
    <span class="btnrow">${cloudReady() ? `<button class="mini" data-cmd="cloudIn">${icon('cloud')}雲端存檔</button>` : ''}<button class="mini" data-cmd="${canShareFiles() ? 'share' : 'backup'}">${icon('dl')}${canShareFiles() ? '分享備份檔' : '下載備份檔'}</button></span></div></section>`;
}
