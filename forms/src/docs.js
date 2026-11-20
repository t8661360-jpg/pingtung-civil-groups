/* ===== 文件模型 =====
 sheet: {name, cols:[相對寬度], size(pt), ls(行距), blocks:[...]}
 block p: {t:'p', text, align, size, bold, indent(em), hang(em), before, after(pt), sp(字距em)}
 block table: {t:'table', size, rows:[{key, hdr, cells:[{v, cs, rs, al:'c'|'l'|'r', b, n(數字), f(公式樣板), h(底色)}]}]}
*/
const P = (text, o = {}) => ({ t: 'p', text, ...o });
const T = (rows, o = {}) => ({ t: 'table', rows, ...o });
const TITLE = (text, o = {}) => P(text, { align: 'c', size: 16, bold: true, after: 8, ...o });
const NUMC = (n, o = {}) => ({ v: n, n: true, al: 'r', ...o });

function sigLine(pairs) { const g = pairs.length > 4 ? 2 : 3; return pairs.map(([k, v]) => `${k}${v ? v : FW.repeat(pairs.length > 4 ? 3 : 4)}`).join(FW.repeat(g)); }

/* ---------- 會員大會會議紀錄 ---------- */
function docAssembly() {
  const A = S.assembly, B = [];
  let n = 0; const H = t => { n++; B.push(P(`${cn(n)}、${t}`, { hang: 0 })); };
  const sub = (t, lv = 1, hang = 0) => B.push(P(t, { indent: lv * 2, hang }));
  B.push(TITLE(`${orgFull()}第${O(cn(V('assembly.term')), '○')}屆第${O(cn(V('assembly.no')), '○')}次會員大會會議紀錄`));
  H(`時　　間：中華民國${rd(A.date)}${rt(A.time)}`);
  H(`地　　點：${A.place || ''}`);
  H(`出席人員：應出席人數${BL(V('assembly.should'))}人。實際出席人數${BL(A.attend)}人。（附簽到表影本）`);
  H(`缺席人員：${BL(V('assembly.absent'))}人。`);
  H(`請假人員：${BL(A.leave)}人。`);
  H(`列席人員：${BL(A.obs)}人。`);
  H(`主　　席：${V('assembly.chair') || FW.repeat(6)}${FW.repeat(4)}紀錄：${V('assembly.rec') || ''}`);
  H(`主席致詞：${A.speech || '（略）'}${A.speech ? '' : '。'}`);
  H('主管機關代表致詞：（略）。');
  H(`上年度工作報告${A.report ? '：' : '。'}`); if (A.report) sub(A.report);
  H('討論事項：');
  let pn = 0;
  const prop = (base, isFixed) => {
    pn++;
    const g = k => isFixed ? V(`assembly.${base}.${k}`) : (base[k] || '');
    const proposer = g('proposer');
    sub(`（${cn(pn)}）案由：${(g('reason') || '').replace(/。$/, '')}${proposer ? `（提案人－${proposer}）` : ''}。`, 0, 6);
    if (g('desc')) sub(`說明：${g('desc')}`, 1, 3);
    if (g('method')) sub(`辦法：${g('method')}`, 1, 3);
    sub(`決議：${g('res') || ''}`, 1, 3);
  };
  if (A.fin.on) prop('fin', true);
  if (A.plan.on) prop('plan', true);
  if (A.bud.on) prop('bud', true);
  A.props.forEach(p => prop(p, false));
  if (!pn) sub('無。');
  H('臨時動議：');
  const ms = A.motions.filter(m => !isBlank(m.prop) || !isBlank(m.desc));
  if (!ms.length) sub('無。');
  ms.forEach((m, i) => { sub(`（${cn(i + 1)}）提案：${m.prop || ''}`, 0, 6); if (m.desc) sub(`說明：${m.desc}`, 1, 3); sub(`決議：${m.res || ''}`, 1, 3); });
  if (A.hasEl) {
    const E = A.el;
    H('選舉');
    sub('（一）推選選務工作人員：', 0);
    sub(`1.監票員：${O(E.jp)}${FW.repeat(2)}2.發票員：${O(E.fp)}`, 1);
    sub(`3.唱票員：${O(E.cp)}${FW.repeat(2)}4.記票員：${O(E.jip)}`, 1);
    const dr = elResult(E.dirs, V('assembly.el.dirSeats'), V('assembly.el.dirAlt'));
    const sr = elResult(E.sups, V('assembly.el.supSeats'), V('assembly.el.supAlt'));
    const vl = l => l.map(c => `${c.name}（${c.votes === '' || c.votes == null ? '　' : c.votes}票）`).join('、');
    sub('（二）選舉得票數：', 0);
    sub(`1.理事：${dr.all.length ? vl(dr.all) : '（候選人姓名）（得票數）'}`, 1, 2);
    sub(`2.監事：${sr.all.length ? vl(sr.all) : '（候選人姓名）（得票數）'}`, 1, 2);
    const winD = dr.all.length ? vl(dr.win) : names(DIR_ROLES).join('、');
    const winS = sr.all.length ? vl(sr.win) : names(SUP_ROLES).join('、');
    const altL = (l, fallback) => (l.length ? l.map((c, i) => `第${cn(i + 1)}候補${c.name}`) : fallback.map((nm, i) => `第${cn(i + 1)}候補${nm}`)).join('、');
    sub('（三）當選人：', 0);
    sub(`1.理事：${winD || '（當選人姓名）（得票數）'}`, 1, 2);
    sub(`2.監事：${winS || '（當選人姓名）（得票數）'}`, 1, 2);
    sub(`3.候補理事：${altL(dr.alt, dr.all.length ? [] : names(['候補理事'])) || '無'}`, 1, 2);
    sub(`4.候補監事：${altL(sr.alt, sr.all.length ? [] : names(['候補監事'])) || '無'}`, 1, 2);
    H('主席當場宣布當選名單，無人異議。');
  }
  H(`散　　會：${rt(A.end)}。`);
  B.push(P(sigLine([['理 事 長　', pname('理事長') + '（簽章）'], ['紀　　錄　', (V('assembly.rec') || '') + '（簽章）']]), { before: 24 }));
  return { title: '會員大會會議紀錄', sheets: [{ name: '會員大會紀錄', cols: [1], size: 13, ls: 1.5, blocks: B }] };
}

/* ---------- 理監事聯席會議紀錄 ---------- */
function docBoard() {
  const A = S.board, B = [];
  let n = 0; const H = t => { n++; B.push(P(`${cn(n)}、${t}`)); };
  const sub = (t, lv = 1, hang = 0) => B.push(P(t, { indent: lv * 2, hang }));
  B.push(TITLE(`${orgFull()}第${O(cn(V('board.term')), '○')}屆第${O(cn(V('board.no')), '○')}次理監事聯席會議紀錄`));
  H(`時　　間：中華民國${rd(V('board.date'))}${rt(A.time)}`);
  H(`地　　點：${V('board.place') || ''}`);
  H('出席人員：（附簽到表影本，分別職稱簽到）');
  sub(`理　　事：${V('board.dirs')}`, 1, 5);
  sub(`監　　事：${V('board.sups')}`, 1, 5);
  H(`列席人員：${BL(A.obs)}人。`);
  H(`主　　席：${V('board.chair') || FW.repeat(6)}${FW.repeat(4)}紀錄：${V('board.rec') || ''}`);
  H('主席致詞：（略）。');
  H('主管機關代表致詞：（略）。');
  const std = V('board.stdDir');
  H(`選舉第${O(cn(V('board.electTerm')), '○')}屆${std ? '常務理事、' : ''}常務監事及理事長：`);
  sub('當選人：');
  let k = 0;
  if (std) sub(`${++k}.常務理事：${std}`, 1, 2);
  sub(`${++k}.常務監事：${V('board.stdSup') || '（當選人姓名及得票數）'}${A.stdSupVotes ? `（${A.stdSupVotes}票）` : ''}`, 1, 2);
  sub(`${++k}.理事長：${V('board.chairman') || '（當選人姓名及得票數）'}${A.chairVotes ? `（${A.chairVotes}票）` : ''}`, 1, 2);
  sub('主席當場宣布當選結果，無人異議。');
  H('討論提案：');
  let pn = 0;
  const prop = (base, fixed) => {
    pn++; const g = k => fixed ? V(`board.${base}.${k}`) : (base[k] || '');
    sub(`（${cn(pn)}）案由：${g('reason')}`, 0, 6);
    if (g('desc')) sub(`說明：${g('desc')}`, 1, 3);
    sub(`決議：${g('res') || ''}`, 1, 3);
  };
  if (A.addr.on) prop('addr', true);
  if (A.staff.on) prop('staff', true);
  A.props.forEach(p => prop(p, false));
  if (!pn) sub('無。');
  H(`臨時動議：${A.motion || '無。'}`);
  H(`散　　會：${rt(A.end)}。`);
  B.push(P(sigLine([['理 事 長　', (V('board.chairman') || '') + '（簽章）'], ['紀　　錄　', (V('board.rec') || '') + '（簽章）']]), { before: 24 }));
  return { title: '理監事聯席會議紀錄', sheets: [{ name: '理監事聯席會議紀錄', cols: [1], size: 13, ls: 1.5, blocks: B }] };
}

/* ---------- 理監事暨會務人員一覽表 ---------- */
function docRoster() {
  const b = S.basic, L = { al: 'c', h: true };
  const rows = [];
  rows.push({ cells: [{ v: `${orgFull()}理監事暨會務人員一覽表`, cs: 7, b: true, al: 'c', sz: 14 }, { v: `${rd(V('basic.fillDate'))}填送\n（請加蓋團體圖記）`, cs: 3, al: 'c', sz: 9 }] });
  rows.push({ cells: [{ v: '團體名稱', cs: 2, rs: 2, ...L }, { v: '社會局立案', cs: 3, ...L }, { v: '社團法人登記日期字號（法院）', rs: 2, ...L }, { v: '本屆別', rs: 2, ...L }, { v: '改選日期', rs: 2, ...L }, { v: '會員人數', cs: 2, ...L }] });
  rows.push({ cells: [{ v: '日期', cs: 2, ...L }, { v: '字號', ...L }, { v: '團體', ...L }, { v: '個人', ...L }] });
  const court = [rdOrBlank(b.courtDate), b.courtNo].filter(Boolean).join('\n');
  rows.push({ cells: [{ v: orgFull(), cs: 2, al: 'c' }, { v: rd(b.regDate), cs: 2, al: 'c' }, { v: `${b.regWord || FW}字\n第${b.regNum || FW.repeat(3)}號`, al: 'c' }, { v: court, al: 'c' }, { v: `第${O(b.term, FW)}屆`, al: 'c' }, { v: rd(b.reelectDate), al: 'c' }, NUMC(hasNum(b.membersGroup) ? num(b.membersGroup) : b.membersGroup, { al: 'c' }), NUMC(hasNum(b.membersPerson) ? num(b.membersPerson) : b.membersPerson, { al: 'c' })] });
  rows.push({ cells: [{ v: '團體會址', cs: 2, ...L }, { v: b.address, cs: 5 }, { v: '電話號碼', ...L }, { v: b.phone, cs: 2 }] });
  rows.push({ cells: [{ v: '網址', cs: 2, ...L }, { v: b.web, cs: 3 }, { v: '電子信箱', ...L }, { v: b.email, cs: 2 }, { v: '傳真號碼', ...L }, { v: b.fax }] });
  rows.push({ hdr: true, cells: [...['職別', '姓名', '性別', '出生年月日', '現職', '身分證統一編號'].map(v => ({ v, ...L })), { v: '戶籍所在地或工作地址', cs: 3, ...L }, { v: '電話號碼', ...L }] });
  const bd = d => dateEmpty(d) ? '' : [d.y, d.m, d.d].map((x, i) => i ? String(x || '').padStart(2, '0') : String(x || '')).join('.');
  const ppl = rosterSorted().filter(r => !isBlank(r.name) || !isBlank(r.role));
  ppl.forEach(r => rows.push({ cells: [{ v: r.role, al: 'c' }, { v: r.name, al: 'c' }, { v: r.gender, al: 'c' }, { v: bd(r.birth), al: 'c' }, { v: r.job, al: 'c' }, { v: r.idno, al: 'c' }, { v: r.addr, cs: 3 }, { v: r.phone, al: 'c' }] }));
  for (let i = ppl.length; i < 3; i++) rows.push({ cells: [...Array.from({ length: 6 }, () => ({ v: '' })), { v: '', cs: 3 }, { v: '' }] });
  return { title: '理監事暨會務人員一覽表', sheets: [{ name: '理監事暨會務人員一覽表', cols: [7, 8, 4, 9, 9, 11, 9, 9, 8, 12], size: 10, ls: 1.2, blocks: [
    T(rows, { size: 10 }),
    P('注意：請按下列次序填列－理事長、常務理事、理事、候補理事、常務監事、監事、候補監事、會務人員。', { size: 10, before: 4 }),
    P('本表一式三份，其中二份函送屏東縣政府社會處，一份團體自存。', { size: 10 }),
  ] }] };
}

/* ---------- 理事長當選證明書資料 ---------- */
function docCert() {
  const L = { al: 'c', h: true };
  const row = (a, b, c, d) => ({ cells: [{ v: a, ...L }, { v: b }, { v: c, ...L }, { v: d }] });
  const rows = [
    row('理事長姓名', V('cert.name'), '團體名稱', V('cert.org')),
    row('出生地', S.cert.birthplace, '當選屆次', `第${O(V('cert.term'), FW)}屆`),
    row('出生日期', rdOrBlank(V('cert.birth')), '召開第一次理事會日期（補選日期）', rdOrBlank(V('cert.firstDate'))),
    row('戶籍地址', V('cert.addr'), '任期', V('cert.tenure')),
    row('電話', V('cert.phone'), '備註', S.cert.note),
  ];
  rows.forEach(r => r.h = 1.2);
  return { title: '理事長當選證明書填報資料', sheets: [{ name: '理事長當選證明書資料', cols: [14, 30, 18, 30], size: 13, ls: 1.4, blocks: [
    TITLE('申請理事長當選證明書填報資料內容', { after: 12 }),
    T(rows, { size: 13, pad: 10 }),
    P('註：如有申請理事長當選證明書需要者於任期內請備函並檢具本表及申請人二吋半身照片乙張及身分證正反影本乙份。', { size: 12, before: 8, hang: 2 }),
  ] }] };
}

/* ---------- 會址使用同意書 ---------- */
function docConsent() {
  const c = S.consent;
  const sqm = V('consent.sqm'), ping = V('consent.ping');
  const body = `茲有本人座落於【${O(V('consent.loc'), '屏東縣○○鄉鎮市○○村里○○路○○號')}】房屋一間（棟），地號${BL(c.landNo, 4)}號，坪數${O(ping, '○○○')}坪（或）${O(sqm, '○○○○')}平方公尺，同意免費借予「${orgFull()}」使用，期限自民國${rd(c.from)}起至${rd(V('consent.to'))}止，恐空口無憑，特立此同意書以昭公信。`;
  const d = V('consent.date') || {};
  const sp = s => String(s).split('').join(FW);
  return { title: '會址使用同意書', sheets: [{ name: '會址使用同意書', cols: [1], size: 16, ls: 2, blocks: [
    TITLE('會址使用同意書', { size: 22, after: 24, sp: 0.3 }),
    P(body, { firstIndent: 2, align: 'j' }),
    P('', { after: 18 }),
    P(`房屋出借人：${c.lender || ''}${FW.repeat(2)}（簽章）`, { indent: 6, after: 10 }),
    P(`見　證　人：${c.witness || ''}${FW.repeat(2)}（簽章）`, { indent: 6, after: 10 }),
    P(`理　事　長：${V('consent.chairman') || ''}${FW.repeat(2)}（簽章）`, { indent: 6, after: 30 }),
    P(`中${FW}華${FW}民${FW}國${FW.repeat(2)}${BL(d.y, 2)}${FW.repeat(2)}年${FW.repeat(2)}${BL(d.m, 1)}${FW.repeat(2)}月${FW.repeat(2)}${BL(d.d, 1)}${FW.repeat(2)}日`, { align: 'c', before: 30 }),
  ] }] };
}

/* ---------- 章程修正條文對照表 ---------- */
function docStatute() {
  const s = S.statute, L = { al: 'c', h: true, b: true };
  const rows = [{ hdr: true, cells: [{ v: '原條文', ...L }, { v: '修正後條文', ...L }, { v: '說明', ...L }] }];
  s.rows.forEach(r => rows.push({ cells: [{ v: r.orig, al: 'l', va: 't' }, { v: r.rev, al: 'l', va: 't' }, { v: r.note, al: 'l', va: 't' }] }));
  if (!s.rows.length) rows.push({ cells: [{ v: '' }, { v: '' }, { v: '' }] });
  return { title: '章程修正條文對照表', sheets: [{ name: '章程修正條文對照表', cols: [1, 1, 1], size: 12, ls: 1.3, blocks: [
    TITLE(orgFull(), { after: 0 }),
    TITLE('章程修正條文對照表', { after: 6 }),
    P(`${rd(s.boardDate, 3)}第${O(cn(V('statute.boardTerm')), '○')}屆第${O(cn(s.boardNo), '○')}次理（監）事會審議通過`, { align: 'r', size: 11 }),
    P(`${rd(V('statute.asmDate'), 3)}第${O(cn(V('statute.asmTerm')), '○')}屆第${O(cn(V('statute.asmNo')), '○')}次會員大會議決通過`, { align: 'r', size: 11, after: 6 }),
    T(rows, { size: 12 }),
    P(sigLine([['總幹事　', (pname('總幹事') || '') + '（簽章）'], ['理事長　', (pname('理事長') || '') + '（簽章）']]), { before: 18, align: 'c' }),
  ] }] };
}

/* ---------- 年度工作計畫 ---------- */
const stripCat = s => String(s || '').replace(/^[一二三四五六七八九十]+、/, '').trim();
const stripItem = s => String(s || '').replace(/^[（(][一二三四五六七八九十]+[）)]/, '').trim();
function docPlan() {
  const p = S.plan, y = V('plan.year'), L = { al: 'c', h: true, b: true };
  const rows = [{ hdr: true, cells: ['工作類別', '項目', '說明', '數量', '執行進度', '經費預估', '協辦單位', '備註'].map(v => ({ v, ...L })) }];
  const list = p.rows.filter(r => Object.values(r).some(v => !isBlank(v)));
  // 自動編號並合併相同類別/項目
  let catNo = 0, itemNo = 0, lastCat = null, lastItem = null; const lab = [];
  list.forEach(r => {
    const c = stripCat(r.cat) || lastCat || '', it = stripItem(r.item) || '';
    if (c !== lastCat) { catNo++; itemNo = 0; lastItem = null; lastCat = c; }
    if (it && it !== lastItem) { itemNo++; lastItem = it; }
    lab.push({ cat: c ? `${cn(catNo)}、${c}` : '', catKey: catNo, item: it ? `（${cn(itemNo)}）${it}` : '', itemKey: catNo + '-' + (it ? itemNo : 'x' + Math.random()) });
  });
  const span = (key, i) => { if (i > 0 && lab[i - 1][key] === lab[i][key]) return 0; let n = 1; while (i + n < lab.length && lab[i + n][key] === lab[i][key]) n++; return n; };
  list.forEach((r, i) => {
    const cells = [];
    const cs = span('catKey', i); if (cs) cells.push({ v: lab[i].cat, rs: cs, al: 'c' });
    const is = span('itemKey', i); if (is) cells.push({ v: lab[i].item, rs: is, al: 'l' });
    cells.push({ v: r.desc, al: 'l' }, { v: r.qty, al: 'c' }, { v: r.prog, al: 'c' }, NUMC(hasNum(r.cost) ? num(r.cost) : r.cost), { v: r.co, al: 'c' }, { v: r.note, al: 'l' });
    rows.push({ key: 'r' + i, cells });
  });
  const total = list.reduce((s, r) => s + num(r.cost), 0);
  rows.push({ key: 'tot', cells: [{ v: '合　　計', cs: 5, al: 'c', b: true }, NUMC(total, { b: true, f: list.length ? `SUM({F:r0}:{F:r${list.length - 1}})` : '' }), { v: '' }, { v: '' }] });
  return { title: '年度工作計畫', sheets: [{ name: '年度工作計畫', cols: [9, 15, 28, 6, 10, 10, 8, 7], size: 12, ls: 1.4, blocks: [
    TITLE(`${orgFull()}${O(y, FW.repeat(2))}年度工作計畫`),
    P(`一、實施時間：民國${BL(y)}年1月1日至${BL(y)}年12月31日止`),
    P('二、工作內容：', { after: 4 }),
    T(rows, { size: 11 }),
    P(`三、經費預估合計：新臺幣${fmt(total)}元整。`, { before: 6 }),
    P('四、實施要領（或工作方法）：'),
    P(V('plan.method'), { indent: 2 }),
    P(`五、本項工作計畫提經第${O(cn(V('plan.refTerm')), '○')}屆第${O(cn(V('plan.refNo')), '○')}次理（監）事會議決通過並報請主管機關備查後施行。`, { hang: 2 }),
  ] }] };
}

/* ---------- 財務報表 ---------- */
function finHeader(title, period) {
  return [TITLE(orgFull(), { after: 2 }), TITLE(title, { size: 15, sp: 0.3, after: 2 }), P(period, { align: 'c', size: 11, after: 6 })];
}
const finSign = () => P(sigLine([['製表：', ''], ['會計：', pname('會計')], ['總幹事：', pname('總幹事')], ['理事長：', pname('理事長')]]), { before: 8, size: 11 });
function accRows(cols, extra) {
  // cols: [{c:'b'}...] 三個金額欄 + 說明欄 key
  const hide = S.fin.hideZero; const rows = [];
  const showAcc = a => a.lvl === 0 || !hide || !accZero(a);
  const walk = (list) => list.forEach(a => {
    if (!showAcc(a)) return;
    const name = (a.lvl === 0 ? '' : FW.repeat(a.lvl === 1 ? 1 : 2)) + accName(a);
    const kidsShown = a.kids ? a.kids.filter(showAcc) : [];
    const sumF = col => kidsShown.length ? kidsShown.map(k => `{${col}:${k.k}}`).join('+') : '';
    const cells = [
      { v: a.lvl === 0 ? String(a.idx) : '', al: 'c' }, { v: a.lvl === 1 ? String(a.idx) : '', al: 'c' }, { v: a.lvl === 2 ? String(a.idx) : '', al: 'c' },
      { v: name, b: a.lvl === 0 },
      NUMC(accVal(a, cols[0]), { b: a.lvl === 0, f: a.kids ? sumF('E') : '' }),
      NUMC(accVal(a, cols[1]), { b: a.lvl === 0, f: a.kids ? sumF('F') : '' }),
      NUMC(accVal(a, cols[0]) - accVal(a, cols[1]), { b: a.lvl === 0, f: '{E:@}-{F:@}' }),
      { v: (S.fin.v[a.k] || {})[cols[2]] || '', sz: 9 },
    ];
    rows.push({ key: a.k, cells });
    if (a.kids) walk(a.kids);
  });
  walk(ACC);
  const surB = finSurplus(cols[0]), surP = finSurplus(cols[1]);
  rows.push({ key: 'sur', cells: [{ v: '3', al: 'c' }, { v: '' }, { v: '' }, { v: '本期餘絀', b: true }, NUMC(surB, { b: true, f: '{E:inc}-{E:exp}' }), NUMC(surP, { b: true, f: '{F:inc}-{F:exp}' }), NUMC(surB - surP, { b: true, f: '{E:@}-{F:@}' }), { v: '' }] });
  if (extra) extra(rows);
  return rows;
}
function finHeadRows(c1, c2, c3) {
  const L = { al: 'c', h: true, b: true };
  return [
    { hdr: true, cells: [{ v: '科　　　　目', cs: 4, ...L }, { v: c1, rs: 2, ...L }, { v: c2, rs: 2, ...L }, { v: c3, rs: 2, ...L }, { v: '說　　明', rs: 2, ...L }] },
    { hdr: true, cells: ['款', '項', '目', '名　　稱'].map(v => ({ v, ...L })) },
  ];
}
const FIN_COLS = [3, 3, 3, 17, 10, 10, 10, 17];
function sheetBudget() {
  const y = BY();
  return { name: '預算', cols: FIN_COLS, size: 10, ls: 1.15, blocks: [
    ...finHeader('收　支　預　算　表', `中華民國${BL(y)}年01月01日至${BL(y)}年12月31日止`),
    T([...finHeadRows('預 算 數', '上 年 度\n預 算 數', '上年度預算與\n預算比較數'), ...accRows(['b', 'pb', 'n1'])], { size: 10 }),
    finSign(),
  ] };
}
function sheetActual() {
  const y = Y();
  const rows = [...finHeadRows('決 算 數', '預 算 數', '決算與預算\n比較數'), ...accRows(['a', 'pb', 'n2'], rows => {
    const prev = num(S.fin.prev), sur = finSurplus('a');
    rows.push({ key: 'prev', cells: [{ v: '4', al: 'c' }, { v: '' }, { v: '' }, { v: '上期餘絀', b: true }, NUMC(prev, { b: true }), { v: '' }, { v: '' }, { v: '' }] });
    rows.push({ key: 'cum', cells: [{ v: '5', al: 'c' }, { v: '' }, { v: '' }, { v: '累計餘絀', b: true }, NUMC(sur + prev, { b: true, f: '{E:sur}+{E:prev}' }), { v: '' }, { v: '' }, { v: '' }] });
  })];
  const L = { al: 'c', h: true, b: true };
  const cp = cashPrev(), ci = accVal(ACC_BY.inc, 'a'), ce = accVal(ACC_BY.exp, 'a');
  const cash = [
    { hdr: true, cells: [{ v: '收　　項', cs: 4, ...L }, { v: '金　額', ...L }, { v: '付　　項', cs: 2, ...L }, { v: '金　額', ...L }] },
    { key: 'c1', cells: [{ v: '上期結存', cs: 4 }, NUMC(cp), { v: '本期支出', cs: 2 }, NUMC(ce, { f: '{E:exp}' })] },
    { key: 'c2', cells: [{ v: '本期收入', cs: 4 }, NUMC(ci, { f: '{E:inc}' }), { v: '本期結存', cs: 2 }, NUMC(cp + ci - ce, { f: '{E:c1}+{E:c2}-{H:c1}' })] },
    { key: 'c3', cells: [{ v: '合　　計', cs: 4, al: 'c', b: true }, NUMC(cp + ci, { b: true, f: '{E:c1}+{E:c2}' }), { v: '合　　計', cs: 2, al: 'c', b: true }, NUMC(cp + ci, { b: true, f: '{H:c1}+{H:c2}' })] },
  ];
  return { name: '決算與現金出納表', cols: FIN_COLS, size: 10, ls: 1.15, blocks: [
    ...finHeader('收支決算表及現金出納表', `中華民國${BL(y)}年01月01日至${BL(y)}年12月31日止`),
    T(rows, { size: 10 }),
    P('現金出納表', { align: 'c', bold: true, size: 12, before: 10, after: 4 }),
    T(cash, { size: 10 }),
    finSign(),
  ] };
}
function sheetProp() {
  const y = Y(), L = { al: 'c', h: true, b: true };
  const rows = [{ hdr: true, cells: ['財產編號', '財產科目', '名　　稱', '購置日期', '單位', '數量', '金　　額', '存放地點', '說　　明'].map(v => ({ v, ...L })) }];
  const list = S.fin.prop.filter(r => Object.values(r).some(v => !isBlank(v)));
  let cur = ''; const cats = list.map(r => { if (!isBlank(r.cat)) cur = r.cat.trim(); return cur; });
  list.forEach((r, i) => {
    const cells = [{ v: String(i + 1).padStart(3, '0'), al: 'c' }];
    if (i === 0 || cats[i] !== cats[i - 1]) { let n = 1; while (i + n < list.length && cats[i + n] === cats[i]) n++; cells.push({ v: cats[i], rs: n, al: 'c' }); }
    cells.push({ v: r.name }, { v: r.date, al: 'c' }, { v: r.unit, al: 'c' }, NUMC(hasNum(r.qty) ? num(r.qty) : r.qty, { al: 'c' }), NUMC(hasNum(r.amt) ? num(r.amt) : r.amt), { v: r.loc, al: 'c' }, { v: r.note });
    rows.push({ key: 'p' + i, cells });
  });
  if (!list.length) rows.push({ key: 'p0', cells: Array.from({ length: 9 }, () => ({ v: '' })) });
  rows.push({ key: 'tot', cells: [{ v: '合　　　　計', cs: 6, al: 'c', b: true }, NUMC(propSum(''), { b: true, f: `SUM({G:p0}:{G:p${Math.max(0, list.length - 1)}})` }), { v: '' }, { v: '' }] });
  return { name: '財產目錄', cols: [7, 10, 14, 9, 5, 5, 10, 9, 10], size: 10, ls: 1.2, blocks: [
    ...finHeader('財　產　目　錄', `中華民國${BL(y)}年12月31日`),
    T(rows, { size: 10 }),
    P(sigLine([['製表：', ''], ['保管：', ''], ['會計：', pname('會計')], ['總幹事：', pname('總幹事')], ['團體負責人：', pname('理事長')]]), { before: 8, size: 11 }),
    P('說明：', { size: 10, before: 6 }),
    P('1.本目錄根據財產登記簿，按本辦法所訂固定資產之科目編造。', { size: 10, indent: 1 }),
    P('2.本表須經製表、保管、會計、總幹事及團體負責人蓋章。', { size: 10, indent: 1 }),
  ] };
}
function sheetBS() {
  const y = Y(), L = { al: 'c', h: true, b: true };
  const left = [{ name: '資產合計', v: bsAssets(), b: true, id: 'LT', sum: BS_LEFT.map(g => g.k) }];
  BS_LEFT.forEach(g => { left.push({ name: g.name, v: bsGroupSum(g), b: true, id: g.k, sum: g.kids.map(n => 'L:' + n) }); g.kids.forEach(n => left.push({ name: FW + n, v: bsVal(n), id: 'L:' + n })); });
  const right = [{ name: '負債合計', v: bsLiab(), b: true, id: 'RL', sum: BS_RIGHT_L.map(g => g.k) }];
  BS_RIGHT_L.forEach(g => { right.push({ name: g.name, v: bsGroupSum(g), b: true, id: g.k, sum: g.kids.map(n => 'R:' + n) }); g.kids.forEach(n => right.push({ name: FW + n, v: bsVal(n), id: 'R:' + n })); });
  right.push({ name: '權益合計', v: bsEquity(), b: true, id: 'RE', sum: BS_RIGHT_E.map(g => g.k) });
  BS_RIGHT_E.forEach(g => { right.push({ name: g.name, v: bsGroupSum(g), b: true, id: g.k, sum: g.kids.map(n => 'R:' + n) }); g.kids.forEach(n => right.push({ name: FW + n, v: bsVal(n), id: 'R:' + n })); });
  const nRows = Math.max(left.length, right.length);
  const where = {}; left.forEach((x, i) => where[x.id] = { col: 'B', row: 'b' + i }); right.forEach((x, i) => where[x.id] = { col: 'D', row: 'b' + i });
  const ref = id => `{${where[id].col}:${where[id].row}}`;
  const cellPair = x => x ? [{ v: x.name, b: x.b }, NUMC(x.v, { b: x.b, f: x.sum ? x.sum.map(ref).join('+') : '' })] : [{ v: '' }, { v: '' }];
  const rows = [
    { hdr: true, cells: [{ v: '資　　　產', cs: 2, ...L }, { v: '負債、基金暨餘絀', cs: 2, ...L }] },
    { hdr: true, cells: [{ v: '科　　目', ...L }, { v: '金　　額', ...L }, { v: '科　　目', ...L }, { v: '金　　額', ...L }] },
  ];
  for (let i = 0; i < nRows; i++) rows.push({ key: 'b' + i, cells: [...cellPair(left[i]), ...cellPair(right[i])] });
  rows.push({ key: 'tot', cells: [{ v: '合　　計', al: 'c', b: true }, NUMC(bsAssets(), { b: true, f: ref('LT') }), { v: '合　　計', al: 'c', b: true }, NUMC(bsLiab() + bsEquity(), { b: true, f: ref('RL') + '+' + ref('RE') })] });
  return { name: '資產負債表', cols: [16, 11, 16, 11], size: 10, ls: 1.15, blocks: [
    ...finHeader('資　產　負　債　表', `中華民國${BL(y)}年12月31日`),
    T(rows, { size: 10 }),
    P(sigLine([['製表：', ''], ['出納：', pname('出納')], ['會計：', pname('會計')], ['總幹事：', pname('總幹事')], ['團體負責人：', pname('理事長')]]), { before: 8, size: 11 }),
    P('說明：', { size: 9.5, before: 4 }),
    ...['1.流動資產＋固定資產＋其他資產＝合計（資產）。', '2.流動負債＋長期負債＋其他負債＋基金＋餘絀＝合計（負債、基金暨餘絀）。', '3.資產部份之合計金額與負債、基金暨餘絀部份之合計金額需相同才正確。', '4.本表資產、負債、基金暨餘絀之科目根據本辦法所訂之資產、負債、基金暨餘絀類科目編列。', '5.本表須經製表、出納、會計、總幹事及團體負責人蓋章。'].map(t => P(t, { size: 9.5, indent: 1, hang: 1 })),
  ] };
}
function sheetFund() {
  const y = Y(), f = S.fin.fund, L = { al: 'c', h: true, b: true };
  const add = hasNum(f.add) ? num(f.add) : accVal(ACC_BY.e12, 'a');
  const rows = [
    { hdr: true, cells: [{ v: '收　　　入', cs: 2, ...L }, { v: '支　　　出', cs: 2, ...L }] },
    { hdr: true, cells: [{ v: '科目名稱', ...L }, { v: '金　　額', ...L }, { v: '科目名稱', ...L }, { v: '金　　額', ...L }] },
    { key: 'f0', cells: [{ v: '準備基金', b: true }, { v: '／', al: 'c' }, { v: '準備基金', b: true }, { v: '／', al: 'c' }] },
    { key: 'f1', cells: [{ v: FW + '歷年累存' }, NUMC(num(f.acc)), { v: FW + '支付' + (f.o1n || '') }, NUMC(num(f.o1))] },
    { key: 'f2', cells: [{ v: FW + '本年度利息收入' }, NUMC(num(f.int)), { v: FW + '支付' + (f.o2n || '') }, NUMC(num(f.o2))] },
    { key: 'f3', cells: [{ v: FW + '本年度提撥' }, NUMC(add), { v: FW + '支付退職金' }, NUMC(num(f.o3))] },
    { key: 'f4', cells: [{ v: '' }, { v: '' }, { v: FW + '支付退休金' }, NUMC(num(f.o4))] },
    { key: 'f5', cells: [{ v: '合　　計', al: 'c', b: true }, NUMC(fundIn(), { b: true, f: 'SUM({B:f1}:{B:f3})' }), { v: '結　　餘', al: 'c', b: true }, NUMC(fundIn() - fundOut(), { b: true, f: '{B:f5}-SUM({D:f1}:{D:f4})' })] },
  ];
  const notes = (f.notes || '').split('\n').filter(t => t.trim());
  return { name: '基金收支表', cols: [16, 11, 16, 11], size: 11, ls: 1.2, blocks: [
    ...finHeader('基　金　收　支　表', `中華民國${BL(y)}年1月1日至${BL(y)}年12月31日止`),
    T(rows, { size: 11 }),
    P(sigLine([['製表：', ''], ['出納：', pname('出納')], ['會計：', pname('會計')], ['總幹事：', pname('總幹事')], ['團體負責人：', pname('理事長')]]), { before: 8, size: 11 }),
    P('說明：', { size: 10, before: 4 }),
    ...(notes.length ? notes : ['（動支基金應註明理事會通過之屆次與主管機關核備之文號）']).map((t, i) => P(t, { size: 10, indent: 1 })),
    P(`${notes.length + 1}.各基金收支結存應與收支決算表及資產負債表相關科目金額一致。`, { size: 10, indent: 1 }),
    P(`${notes.length + 2}.本表須經製表、出納、會計、總幹事、團體負責人蓋章。`, { size: 10, indent: 1 }),
  ] };
}
function docFinance(all) {
  const sel = S.fin.sel, sh = [];
  if (all || sel.bud) sh.push(sheetBudget());
  if (all || sel.act) sh.push(sheetActual());
  if (all || sel.prop) sh.push(sheetProp());
  if (all || sel.bs) sh.push(sheetBS());
  if (all || sel.fund) sh.push(sheetFund());
  return { title: '財務報表', sheets: sh };
}

const DOCS = { roster: docRoster, assembly: docAssembly, board: docBoard, cert: docCert, consent: docConsent, statute: docStatute, plan: docPlan, finance: () => docFinance(false) };
