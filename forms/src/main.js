/* ===== 範例資料 ===== */
function sampleState() {
  const s = blankState();
  Object.assign(s.basic, { county: '屏東縣', town: '屏東市', org: '示範社區發展協會', term: '5', termYears: '4', year: '114',
    regDate: { y: '89', m: '3', d: '15' }, regWord: '屏府社行', regNum: '0890012345', courtDate: { y: '89', m: '5', d: '2' }, courtNo: '屏院社登字第123號',
    reelectDate: { y: '115', m: '1', d: '10' }, membersGroup: '2', membersPerson: '120', address: '屏東縣屏東市示範里中正路100號', phone: '08-7320000', fax: '08-7320001', email: 'demo@example.org' });
  const P = (role, name, gender, by, bm, bd, job, addrNo, ph) => ({ role, name, gender, birth: { y: by, m: bm, d: bd }, job, idno: '', addr: `屏東縣屏東市示範里中正路${addrNo}號`, phone: ph });
  s.roster = [
    P('理事長', '陳志明', '男', '50', '4', '12', '自營商', '12', '0912-000001'), P('常務理事', '林美玲', '女', '55', '8', '3', '教師', '18', '0912-000002'),
    P('理事', '張建國', '男', '48', '1', '20', '農', '25', '0912-000003'), P('理事', '李淑芬', '女', '60', '11', '9', '家管', '31', '0912-000004'),
    P('理事', '王俊傑', '男', '62', '6', '30', '公', '36', '0912-000005'), P('理事', '黃雅婷', '女', '66', '2', '14', '商', '44', '0912-000006'),
    P('理事', '吳宗翰', '男', '58', '9', '1', '工', '52', '0912-000007'), P('候補理事', '鄭文華', '男', '61', '12', '5', '商', '57', '0912-000008'),
    P('常務監事', '許秀英', '女', '47', '7', '22', '退休', '63', '0912-000009'), P('監事', '郭志強', '男', '53', '3', '3', '農', '70', '0912-000010'),
    P('監事', '洪麗華', '女', '57', '10', '18', '家管', '76', '0912-000011'), P('候補監事', '曾國峰', '男', '64', '5', '27', '工', '81', '0912-000012'),
    P('總幹事', '楊惠如', '女', '63', '1', '8', '專職', '88', '0912-000013'), P('會計', '周美珠', '女', '59', '4', '19', '專職', '93', '0912-000014'), P('出納', '賴俊宏', '男', '65', '8', '25', '專職', '97', '0912-000015'),
  ];
  Object.assign(s.assembly, { date: { y: '115', m: '1', d: '10' }, time: { ap: '上', h: '9', mi: '0' }, place: '本社區活動中心', attend: '86', leave: '6', obs: '3', refNo: '12',
    report: '一、辦理會員大會 1 次、理監事會 4 次。\n二、辦理母親節活動、老人健康檢查等社區活動，參與人數約 600 人次。', end: { ap: '上', h: '11', mi: '30' } });
  Object.assign(s.assembly.el, { jp: '郭志強', fp: '鄭文華', cp: '曾國峰', jip: '楊惠如', dirSeats: '7', dirAlt: '1', supSeats: '3', supAlt: '1',
    dirs: [['陳志明', 62], ['林美玲', 58], ['張建國', 51], ['李淑芬', 49], ['王俊傑', 44], ['黃雅婷', 40], ['吳宗翰', 37], ['鄭文華', 21]].map(([name, v]) => ({ name, votes: String(v) })),
    sups: [['許秀英', 55], ['郭志強', 47], ['洪麗華', 39], ['曾國峰', 18]].map(([name, v]) => ({ name, votes: String(v) })) });
  s.assembly.motions = [{ prop: '建請增設社區巡守隊夜間巡邏班次。', desc: '近期夜間治安事件增加。', res: '交由理事會研議辦理。' }];
  Object.assign(s.board, { time: { ap: '上', h: '11', mi: '40' }, obs: '2', stdSupVotes: '3', chairVotes: '6', end: { ap: '下', h: '12', mi: '10' } });
  Object.assign(s.cert, { birthplace: '屏東縣' });
  Object.assign(s.consent, { landNo: '示範段123', ping: '30', from: { y: '115', m: '1', d: '1' }, lender: '陳大同', witness: '林美玲' });
  Object.assign(s.statute, { boardDate: { y: '114', m: '12', d: '6' }, boardNo: '12' });
  s.statute.rows = [
    { orig: '章程全文條文內容涉及「左列」、「如左」。', rev: '取代為「下列」、「如下」。', note: '因應公文書格式改為直式橫書，原條文【左】修改為【下】。' },
    { orig: '第八條　會員有下列情事之一者，為出會：\n一、喪失會員資格者（含死亡）。\n二、經會員大會決議除名者。', rev: '第八條　會員有下列情事之一者，為出會：\n一、喪失會員資格者（含死亡）。\n二、經會員大會決議除名者。\n三、會員未依規定繳納常年會費，予以停權，停權滿一年者視同出會。', note: '為保障持續參與本會運作之會員權益，凡未依規定繳納常年會費者依法本應停權，未繳納一整年度之常年會費，要再次參與本會運作之居民，需重新繳納入會費及常年會費。' },
  ];
  const pr = (cat, item, desc, qty, prog, cost) => ({ cat, item, desc, qty, prog, cost: String(cost), co: '', note: '' });
  s.plan.rows = [
    pr('會務推展', '會議', '1.召開會員大會', '1', '1月', 40000), pr('會務推展', '會議', '2.召開理監事會', '4', '1、4、7、10月', 10000), pr('會務推展', '檔案管理', '公文處理、文書建檔、登錄保管', '全年', '', 5000),
    pr('公共建設', '道路', '路面維護', '全年', '', 5000), pr('公共建設', '排水溝', '排水溝清淤', '全年', '', 5000), pr('公共建設', '社區環境', '環境整理及綠美化', '全年', '', 5000), pr('公共建設', '活動中心', '管理及維護', '全年', '', 5000),
    pr('業務推展', '兒童服務', '1.舉辦書法繪畫作文比賽活動', '1', '3月', 10000), pr('業務推展', '兒童服務', '2.舉辦趣味營活動', '1', '4月', 5000), pr('業務推展', '兒童服務', '3.購置兒童文物', '1', '5月', 5000),
    pr('業務推展', '老人服務', '老人義診及健康檢查', '1', '10月', 90000), pr('業務推展', '婦女服務', '1.舉辦烹飪研習', '2', '3、12月', 20000), pr('業務推展', '婦女服務', '2.舉辦母親節活動', '1', '5月', 30000),
  ];
  const v = (k, b, pb, a) => { s.fin.v[k] = { b: String(b), pb: String(pb), a: String(a) }; };
  v('i1', 10000, 10000, 10000); v('i2', 30000, 30000, 40000); v('i4', 20000, 20000, 20000); v('i51', 20000, 20000, 20000); v('i52', 20000, 20000, 20000);
  v('e2_1', 5000, 5000, 4500); v('e2_2', 5000, 5000, 3500); v('e2_3', 10000, 10000, 9600); v('e2_4', 5000, 5000, 4600); v('e2_5', 5000, 5000, 4200);
  v('e3_1', 20000, 20000, 15000); v('e3_5', 20000, 20000, 20000); v('e3_8', 20000, 20000, 20000); v('e10', 10000, 10000, 7000);
  s.fin.prev = '16000';
  s.fin.prop = [
    { cat: '事務器械設備', name: '辦公桌、椅', date: '104年12月', unit: '組', qty: '2', amt: '12000', loc: '辦公室', note: '' },
    { cat: '', name: '電腦', date: '110年3月', unit: '台', qty: '1', amt: '25000', loc: '辦公室', note: '' },
    { cat: '雜項設備', name: '冰箱', date: '108年6月', unit: '台', qty: '1', amt: '8000', loc: '辦公室', note: '' },
  ];
  s.fin.bs = { '庫存現金': '7600', '銀行存款': '30000' };
  Object.assign(s.letter, { no: '屏市示社字第1150000001號' });
  s.ui.page = S.ui.page;
  return s;
}

/* ===== 介面 ===== */
function dlButtons(id) {
  return [['docx', 'Word', 'w'], ['xlsx', 'Excel', 'x'], ['pdf', 'PDF', 'p']].map(([f, l, c]) => `<button type="button" class="dl ${c}" data-dl="${f}" data-doc="${id}"><span class="ic">${l[0]}</span>下載 ${l}</button>`).join('');
}
function docFor(id) {
  if (id === 'all') return { title: '全部表單', sheets: ['letter', 'assembly', 'board', 'roster', 'cert', 'consent', 'statute', 'plan'].flatMap(k => DOCS[k]().sheets).concat(docFinance(true).sheets) };
  if (id === 'basic') return { title: '基本資料', sheets: [...DOCS.letter().sheets, ...DOCS.roster().sheets] };
  return DOCS[id]();
}
function renderNav() {
  const issues = checks();
  $('#nav').innerHTML = PAGES.map((p, i) => {
    const n = issues.filter(c => c.page === p.id && c.lv === 'warn').length;
    return `<button type="button" data-page="${p.id}" class="${S.ui.page === p.id ? 'on' : ''}"><span class="no">${i === 0 ? '●' : i}</span><span class="tx"><b>${p.t}</b>${p.s ? `<small>${p.s}</small>` : ''}</span>${n ? `<span class="warn" title="有 ${n} 項需要確認">!</span>` : ''}</button>`;
  }).join('') + `<div class="navfoot">🔒 填寫的資料只存在您自己的瀏覽器，不會上傳到任何伺服器。換電腦或交接請用「備份資料」。<br>本工具為協助填報之輔助網頁，非政府機關官方網站；送件格式以主管機關規定為準。</div>`;
  $('#orgName').textContent = S.basic.org ? orgFull() : '尚未填寫團體名稱';
}
function renderPage() {
  const id = S.ui.page, pg = PAGES.find(p => p.id === id) || PAGES[0];
  $('#ptitle').textContent = pg.t;
  $('#pdl').innerHTML = id === 'basic' ? '' : dlButtons(id);
  $('#form').innerHTML = UI[pg.id]();
  refreshLinked(); refreshCalc(); renderChecks();
  renderNav(); renderPreview();
  $('#formcol').scrollTop = 0;
}
function refreshLinked() {
  $$('#form [data-p]').forEach(el => {
    const p = el.dataset.p, part = el.dataset.part;
    if (el.type === 'checkbox' || el.tagName === 'SELECT') return;
    if (!D[p] && el.dataset.ph == null) return;
    let ph = el.dataset.ph || '';
    if (D[p]) { let d = ''; try { d = D[p](); } catch (e) { } if (part) d = d && d[part]; if (d != null && d !== '') ph = String(d); }
    el.placeholder = ph;
  });
  $$('#form [data-reset]').forEach(b => { b.closest('.f, label')?.closest('.f')?.classList.toggle('ov', !isEmptyVal(getp(S, b.dataset.reset))); });
}
function refreshCalc() { $$('#form [data-calc]').forEach(el => { el.innerHTML = calcVal(el.dataset.calc); }); }
function renderChecks() {
  const el = $('#checks'); if (!el) return;
  const cs = checks();
  el.innerHTML = cs.length ? `<div class="checks"><b>檢核提醒</b>${cs.map(c => `<div class="${c.lv}"><a href="#" data-page="${c.page}">${PAGES.find(p => p.id === c.page).t}</a>　${esc(c.t)}</div>`).join('')}</div>` : '<div class="checks okb">✓ 目前沒有需要確認的檢核項目</div>';
}
let pvTimer = null;
function renderPreview() {
  clearTimeout(pvTimer);
  pvTimer = setTimeout(() => {
    const id = S.ui.page;
    let doc; try { doc = docFor(id); } catch (e) { console.error(e); return; }
    const box = $('#preview');
    box.innerHTML = doc.sheets.map(sheetHTML).join('');
    fitPreview();
    $('#pvinfo').textContent = `${doc.sheets.length} 頁表單・A4`;
  }, 120);
}
function fitPreview() { const col = $('#prevcol'), box = $('#preview'); if (!col || !box) return; const w = col.clientWidth - 40; box.style.zoom = Math.min(1, w / 794).toFixed(3); }
window.addEventListener('resize', fitPreview);

/* 互動 */
function onInput(e) {
  const el = e.target; const p = el.dataset && el.dataset.p; if (!p) return;
  let val = el.type === 'checkbox' ? el.checked : el.value;
  if (el.dataset.part) { const o = { ...(getp(S, p) || {}) }; o[el.dataset.part] = val; setp(S, p, o); }
  else setp(S, p, val);
  save();
  if (el.dataset.rr) { renderPage(); return; }
  refreshLinked(); refreshCalc(); renderChecks(); renderPreview();
  if (p.startsWith('basic.org') || p.startsWith('basic.town') || p.startsWith('basic.county')) renderNav();
  clearTimeout(onInput.nt); onInput.nt = setTimeout(renderNav, 600);
}
function listOp(act, path, i) {
  const arr = getp(S, path) || []; i = +i;
  if (act === 'add') { arr.push({}); setp(S, path, arr); }
  if (act === 'del') arr.splice(i, 1);
  if (act === 'up' && i > 0) [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
  if (act === 'down' && i < arr.length - 1) [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
  save(); renderPage();
  if (act === 'add') { const rows = $$(`#form [data-p^="${path}.${arr.length - 1}."]`); if (rows[0]) rows[0].focus(); }
}
const CMDS = {
  fromElection() {
    const E = S.assembly.el;
    const dr = elResult(E.dirs, V('assembly.el.dirSeats'), V('assembly.el.dirAlt')), sr = elResult(E.sups, V('assembly.el.supSeats'), V('assembly.el.supAlt'));
    if (!dr.all.length && !sr.all.length) { toast('請先在「會員大會會議紀錄 › 選舉」輸入候選人與得票數', 'err'); return; }
    let add = 0, upd = 0;
    const put = (name, role, keep) => {
      const r = S.roster.find(x => x.name === name);
      if (r) { if (!(keep.includes(r.role))) { if (r.role !== role) upd++; r.role = role; } }
      else { S.roster.push({ role, name }); add++; }
    };
    dr.win.forEach(c => put(c.name, '理事', ['理事長', '常務理事', '理事']));
    dr.alt.forEach(c => put(c.name, '候補理事', ['候補理事']));
    sr.win.forEach(c => put(c.name, '監事', ['常務監事', '監事']));
    sr.alt.forEach(c => put(c.name, '候補監事', ['候補監事']));
    save(); renderPage(); toast(`一覽表已更新：新增 ${add} 人、變更職別 ${upd} 人。理事長、常務理監事請在一覽表調整。`);
  },
  candFromRoster() {
    const E = S.assembly.el;
    const mk = roles => names(roles).map(name => ({ name, votes: '' }));
    if (!E.dirs.length) E.dirs = mk([...DIR_ROLES, '候補理事']);
    if (!E.sups.length) E.sups = mk([...SUP_ROLES, '候補監事']);
    save(); renderPage(); toast('已帶入候選人（只補空白的名單），請輸入得票數');
  },
  async sample() {
    if (!(await ask('載入範例資料？目前填寫的內容會被範例取代。建議先「備份資料」。'))) return;
    S = sampleState(); save(); renderPage(); toast('已載入範例資料');
  },
  async clear() {
    if (!(await ask('清除全部填寫內容？此動作無法復原，建議先「備份資料」。'))) return;
    const page = S.ui.page; S = blankState(); S.ui.page = page; save(); renderPage(); toast('已清除');
  },
  async backup() {
    const name = `${orgShort()}_填報資料備份_${new Date().toISOString().slice(0, 10)}.json`;
    await saveFile(name, new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' }));
  },
  restore() { $('#fileIn').click(); },
};
$('#fileIn').addEventListener('change', async e => {
  const f = e.target.files[0]; if (!f) return;
  try { const data = JSON.parse(await f.text()); if (!data || !data.basic) throw new Error('格式不符'); S = merge(blankState(), data); save(); renderPage(); toast('已還原資料：' + f.name); }
  catch (err) { toast('無法讀取這個檔案：' + err.message, 'err'); }
  e.target.value = '';
});

document.addEventListener('input', onInput);
document.addEventListener('change', e => { if (e.target.type === 'checkbox' || e.target.tagName === 'SELECT') onInput(e); });
document.addEventListener('click', async e => {
  const t = e.target.closest('button, a'); if (!t) return;
  if (t.dataset.page) { e.preventDefault(); S.ui.page = t.dataset.page; save(); renderPage(); document.body.classList.remove('navopen'); return; }
  if (t.dataset.reset) { const v = getp(S, t.dataset.reset); setp(S, t.dataset.reset, (v && typeof v === 'object') ? {} : ''); save(); renderPage(); return; }
  if (t.dataset.act) { listOp(t.dataset.act, t.dataset.list, t.dataset.i); return; }
  if (t.dataset.fintab) { S.ui.finTab = t.dataset.fintab; save(); renderPage(); return; }
  if (t.dataset.cmd) { CMDS[t.dataset.cmd](); return; }
  if (t.dataset.dl) {
    const id = t.dataset.doc, doc = docFor(id === 'basic' ? 'all' : id);
    if (!doc.sheets.length) { toast('沒有選擇要輸出的報表', 'err'); return; }
    const pg = PAGES.find(p => p.id === id);
    const name = `${orgShort()}_${id === 'all' ? '全部表單' : id === 'finance' ? `${O(Y(), '')}年度財務報表` : pg.t}`;
    t.disabled = true; await exportDoc(doc, t.dataset.dl, name); t.disabled = false; return;
  }
  if (t.id === 'navToggle') document.body.classList.toggle('navopen');
  if (t.id === 'pvToggle') { document.body.classList.toggle('pvopen'); fitPreview(); }
});

/* 提示、忙碌、確認 */
function toast(msg, kind) {
  const el = document.createElement('div'); el.className = 'toast' + (kind === 'err' ? ' err' : ''); el.textContent = msg;
  $('#toasts').appendChild(el); setTimeout(() => el.classList.add('out'), 3800); setTimeout(() => el.remove(), 4300);
}
function showBusy(msg) {
  const el = $('#busy'); el.querySelector('span').textContent = msg; el.hidden = false;
  return { set: m => el.querySelector('span').textContent = m, done: () => el.hidden = true };
}
function ask(msg) {
  return new Promise(res => {
    const m = $('#modal'); m.querySelector('p').textContent = msg; m.hidden = false;
    const done = v => { m.hidden = true; ok.onclick = no.onclick = null; res(v); };
    const ok = m.querySelector('.ok'), no = m.querySelector('.no');
    ok.onclick = () => done(true); no.onclick = () => done(false);
  });
}

if (!['basic', ...PAGES.map(p => p.id)].includes(S.ui.page)) S.ui.page = 'basic';
renderPage();
dlNS();
