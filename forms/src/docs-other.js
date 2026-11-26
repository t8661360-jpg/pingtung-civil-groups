/* ===== 其他文件 ===== */
DER.push(
  [/^plan\.year$/, () => BY()],
  [/^plan\.refTerm$/, () => S.org.term],
  [/^plan\.method$/, () => '定期召開會員大會及理、監事會，按計畫進度辦理各項活動，並配合政府之政策，達成本會設立宗旨及發展目標。'],
  [/^x\.consent\.loc$/, () => S.org.address],
  [/^x\.consent\.sqm$/, () => hasNum(S.x.consent.ping) ? (num(S.x.consent.ping) * 3.305785).toFixed(2) : ''],
  [/^x\.consent\.ping$/, () => hasNum(S.x.consent.sqm) ? (num(S.x.consent.sqm) / 3.305785).toFixed(2) : ''],
  [/^x\.consent\.to$/, () => addYearsMinusDay(S.x.consent.from, V('org.termYears'))],
  [/^x\.consent\.date$/, () => S.x.consent.from || isoToday()],
  [/^x\.cert\.name$/, () => chairName()],
  [/^x\.cert\.birth$/, () => (person('理事長') || {}).birth || ''],
  [/^x\.cert\.addr$/, () => (person('理事長') || {}).addr || ''],
  [/^x\.cert\.phone$/, () => (person('理事長') || {}).phone || ''],
  [/^x\.cert\.term$/, () => certMeet() ? mTerm(certMeet()) : S.org.term],
  [/^x\.cert\.firstDate$/, () => certMeet() ? MV(certMeet(), 'date') : ''],
  [/^x\.cert\.tenure$/, () => { const f = V('x.cert.firstDate'); const t = addYearsMinusDay(f, V('org.termYears')); return t ? `${rd(f)}起至${rd(t)}止` : ''; }],
  [/^x\.handover\.date$/, () => { const mk = S.ui.scen === 'found' ? 'found.brd' : 'renew.brd'; return MV(mk, 'date'); }],
  [/^x\.handover\.from$/, () => S.ui.scen === 'found' ? prepChair() : (S.x.handover.oldChair || '')],
  [/^x\.handover\.to$/, () => chairName()],
  [/^x\.handover\.sup$/, () => pname('常務監事')],
  [/^x\.recruit\.goal$/, () => S.statute.purpose || ''],
  [/^x\.recruit\.chair$/, () => prepChair()],
  [/^x\.report\.liq$/, () => chairName()],
  [/^x\.report\.date$/, () => getp(S, 'm.dissolve.asm.date')],
  [/^x\.report\.cash$/, () => { const v = cashEnd(); return v ? String(v) : ''; }],
  [/^x\.report\.to$/, () => '屏東縣政府'],
  [/^x\.seal\.chair$/, () => chairName()],
  [/^x\.seal\.addr$/, () => S.org.address],
  [/^x\.resign\.org$/, () => orgFull()],
  [/^x\.resign\.term$/, () => S.org.term],
  [/^x\.reissue\.who$/, () => chairName()],
  [/^x\.reissue\.addr$/, () => S.org.address],
  [/^x\.reissue\.phone$/, () => S.org.mobile || S.org.phone],
  [/^x\.ledger\.term$/, () => S.org.term],
  [/^x\.ballot\.term$/, () => S.ui.scen === 'found' ? '1' : mTerm('renew.asm')],
  [/^x\.proxy\.pages$/, () => '1'],
  [/^statute\.(\w+)$/, m => STATUTE_DEF[m[1]] ? STATUTE_DEF[m[1]]() : ''],
);
function certMeet() { return S.ui.scen === 'found' ? 'found.brd' : (S.ui.scen === 'renew' ? 'renew.brd' : ''); }
function scenTerm(sc) { return sc === 'found' ? '1' : sc === 'renew' ? mTerm('renew.asm') : S.org.term; }
const SIG5 = () => P(sigLine([['製表：', V('org.maker')], ['會計：', pname('會計')], ['總幹事：', pname('總幹事')], ['理事長：', chairName()]]), { before: 8, size: 11 });

/* ---------- 年度工作計畫 ---------- */
const stripCat = s => String(s || '').replace(/^[一二三四五六七八九十]+、/, '').trim();
const stripItem = s => String(s || '').replace(/^[（(][一二三四五六七八九十]+[）)]/, '').trim();
function docPlan() {
  const p = S.plan, y = V('plan.year'), L = { al: 'c', h: true, b: true };
  const rows = [{ hdr: true, cells: ['工作類別', '項目', '說明', '數量', '執行進度', '經費預估', '協辦單位', '備註'].map(v => ({ v, ...L })) }];
  const list = p.rows.filter(r => Object.values(r).some(v => !isBlank(v)));
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
  if (!list.length) for (let i = 0; i < 6; i++) rows.push({ h: 24, cells: Array.from({ length: 8 }, () => ({ v: '' })) });
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
    P(`五、本項工作計畫提經第${O(cn(V('plan.refTerm')), '○')}屆第${O(cn(S.plan.refNo), '○')}次理（監）事會議決通過並報請主管機關備查後施行。`, { hang: 2 }),
  ] }] };
}

/* ---------- 財務報表 ---------- */
function docFinance(keys) {
  const map = { bud: sheetBudget, act: sheetActual, prop: sheetProp, bs: sheetBS, fund: sheetFund };
  return { title: '財務報表', sheets: keys.map(k => map[k]()) };
}

/* ---------- 經費收支報告（收支報表） ---------- */
function docLedger() {
  const x = S.x.ledger, L = { al: 'c', h: true, b: true };
  const rows = [{ hdr: true, cells: ['年', '月', '日', '科目', '收　支　項　目', '掃描檔名', '收入額', '支出額', '餘　額'].map(v => ({ v, ...L })) }];
  const list = (x.rows || []).filter(r => Object.values(r).some(v => !isBlank(v)));
  let bal = num(x.open);
  if (hasNum(x.open)) rows.push({ key: 'o', cells: [{ v: '' }, { v: '' }, { v: '' }, { v: '' }, { v: '上期結存' }, { v: '' }, { v: '' }, { v: '' }, NUMC(bal)] });
  list.forEach((r, i) => {
    const d = parseDate(r.date); bal += num(r.inc) - num(r.exp);
    const prevKey = i ? 'l' + (i - 1) : (hasNum(x.open) ? 'o' : '');
    rows.push({ key: 'l' + i, cells: [{ v: d ? String(d.y) : '', al: 'c' }, { v: d ? String(d.m) : '', al: 'c' }, { v: d ? String(d.d) : '', al: 'c' }, { v: r.acc || '', al: 'c' }, { v: r.item || '' }, { v: r.file || '' }, NUMC(hasNum(r.inc) ? num(r.inc) : ''), NUMC(hasNum(r.exp) ? num(r.exp) : ''), NUMC(bal, { f: prevKey ? `{I:${prevKey}}+N({G:@})-N({H:@})` : 'N({G:@})-N({H:@})' })] });
  });
  if (!list.length) for (let i = 0; i < 12; i++) rows.push({ h: 22, cells: Array.from({ length: 9 }, () => ({ v: '' })) });
  const inc = list.reduce((s, r) => s + num(r.inc), 0), exp = list.reduce((s, r) => s + num(r.exp), 0);
  const rng = c => list.length ? `SUM({${c}:l0}:{${c}:l${list.length - 1}})` : '';
  rows.push({ key: 't', cells: [{ v: '' }, { v: '' }, { v: '' }, { v: '合　　計', cs: 3, al: 'c', b: true }, NUMC(inc, { b: true, f: rng('G') }), NUMC(exp, { b: true, f: rng('H') }), NUMC(num(x.open) + inc - exp, { b: true })] });
  return { title: '經費收支報告', sheets: [{ name: '經費收支報表', cols: [4, 3, 3, 10, 24, 10, 10, 10, 10], size: 11, ls: 1.3, blocks: [
    TITLE(`${orgFull()}第${O(cn(V('x.ledger.term')), '○')}屆經費收支報表`, { after: 2 }),
    P(`自${rd(x.from)}起至${rd(x.to)}止`, { align: 'c', after: 6 }),
    T(rows, { size: 11 }),
    P(sigLine([['製表：', V('org.maker')], ['會計：', pname('會計')], ['總幹事：', pname('總幹事')], ['團體負責人：', chairName()]]), { before: 8, size: 11 }),
  ] }] };
}

/* ---------- 籌備期間經費收支報告表 ---------- */
function docPrepFin() {
  const x = S.x.prepfin, L = { al: 'c', h: true, b: true };
  const inc = (x.inc || []).filter(r => !isBlank(r.name) || hasNum(r.amt)), exp = (x.exp || []).filter(r => !isBlank(r.name) || hasNum(r.amt));
  const n = Math.max(6, inc.length, exp.length);
  const rows = [{ hdr: true, cells: [{ v: '收　　　入', cs: 2, ...L }, { v: '支　　　出', cs: 2, ...L }] }, { hdr: true, cells: [{ v: '科目名稱', ...L }, { v: '金　額', ...L }, { v: '科目名稱', ...L }, { v: '金　額', ...L }] }];
  for (let i = 0; i < n; i++) { const a = inc[i] || {}, b = exp[i] || {}; rows.push({ key: 'r' + i, h: 22, cells: [{ v: a.name || '' }, NUMC(hasNum(a.amt) ? num(a.amt) : ''), { v: b.name || '' }, NUMC(hasNum(b.amt) ? num(b.amt) : '')] }); }
  const si = inc.reduce((s, r) => s + num(r.amt), 0), se = exp.reduce((s, r) => s + num(r.amt), 0);
  rows.push({ cells: [{ v: '合　　計', al: 'c', b: true }, NUMC(si, { b: true, f: `SUM({B:r0}:{B:r${n - 1}})` }), { v: '合　　計', al: 'c', b: true }, NUMC(se, { b: true, f: `SUM({D:r0}:{D:r${n - 1}})` })] });
  if (si || se) rows.push({ cells: [{ v: `結餘：新臺幣${fmt(si - se)}元`, cs: 4, al: 'r' }] });
  return { title: '籌備期間經費收支報告表', sheets: [{ name: '籌備期間經費收支報告表', cols: [30, 20, 30, 20], size: 12, blocks: [
    TITLE(orgFull(), { after: 0 }), TITLE('籌備期間經費收支報告表', { after: 2 }),
    P(`中華民國${rd(x.from)}至${rd(x.to)}止`, { align: 'c', after: 6 }),
    T(rows, { size: 12 }),
    P(sigLine([['製表：', V('org.maker')], ['會計：', pname('會計')], ['總幹事：', pname('總幹事')], ['籌備會主任委員：', prepChair()]]), { before: 8, size: 11 }),
    P('註：收支應保持平衡或有結餘，不得負債。', { size: 11, before: 6 }),
  ] }] };
}

/* ---------- 會員名冊（橫式） ---------- */
function docMembers(sc) {
  const L = { al: 'c', h: true, b: true }, y = sc === 'prep' ? rocYear(isoToday()) : (BY() || rocYear(isoToday()));
  let title = `${orgFull()}　${y}年度會員名冊`;
  if (sc === 'prep') { const mk = 'prep.' + (S.ui.prepVar || 'p1'); const dt = MV(mk, 'date'); title += `（${parseDate(dt) ? rdDot(dt) : '　/　/　'}第${S.ui.prepVar === 'p2' ? '二' : '一'}次籌備委員會決議通過）`; }
  const rows = [{ hdr: true, cells: [{ v: title, cs: 8, al: 'c', b: true, sz: 14 }] }, { hdr: true, cells: ['編號', '姓名', '性別', '出生年月日', '籍貫', '地址', '電話', '備註(正式、贊助)'].map(v => ({ v, ...L })) }];
  const ms = membersNamed();
  ms.forEach((m, i) => rows.push({ cells: [{ v: String(i + 1).padStart(3, '0'), al: 'c' }, { v: m.name, al: 'c' }, { v: m.gender || '', al: 'c' }, { v: rdDot(m.birth) || m.birth || '', al: 'c' }, { v: m.origin || '', al: 'c' }, { v: m.addr || '' }, { v: m.phone || '', al: 'c' }, { v: (m.type || '個人會員').replace('會員', '') + (m.note ? '、' + m.note : ''), al: 'c' }] }));
  for (let i = ms.length; i < (ms.length ? ms.length : 12); i++) rows.push({ h: 22, cells: Array.from({ length: 8 }, () => ({ v: '' })) });
  const st = memberStats();
  return { title: '會員名冊', sheets: [{ name: '會員名冊', land: true, cols: [6, 10, 5, 10, 8, 38, 13, 12], size: 11, blocks: [
    T(rows, { size: 11 }),
    ...(st.total ? [P(`合計：個人會員${st.person}人、團體會員${st.group}個、贊助會員${st.sponsor}人${st.suspended ? `、停權會員${st.suspended}人` : ''}，共${st.total}名。`, { size: 11, before: 4 })] : []),
  ] }] };
}

/* ---------- 組織章程（依縣府範本產生） ---------- */
const STATUTE_DEF = {
  name: () => orgFull(), area: () => `${S.org.county || '屏東縣'}${S.org.town ? S.org.town : ''}行政區域`, purpose: () => '', tasks: () => '',
  memTypes: () => '個人會員：凡贊同本會宗旨、年滿二十歲，填具入會申請書，經理事會通過，並繳納會費後，為個人會員。\n團體會員：凡贊同本會宗旨之機構或團體，填具入會申請書，經理事會通過，並繳納會費後，為團體會員，團體會員推派代表一人，以行使會員權利。\n贊助會員：凡贊助本會工作之個人或團體，填具入會申請書，經理事會通過，並繳納會費後，為贊助會員。',
  dirs: () => V('org.dirSeats') || '', sups: () => V('org.supSeats') || '', dirAlt: () => V('org.dirAlt') || '', supAlt: () => V('org.supAlt') || '',
  stdDirs: () => S.org.stdDirSeats || '', stdSups: () => '1', years: () => V('org.termYears'), repYears: () => V('org.termYears'),
  brdMonths: () => '三', supMonths: () => '三', feeIn: () => '', feeYear: () => '',
  passDate: () => getp(S, 'm.found.asm.date') || '', passTerm: () => '一', passNo: () => '一',
};
function docStatuteDraft() {
  const s = k => V('statute.' + k);
  const o = (v, ph = '○') => isBlank(v) ? ph : v;
  const nm = s('name');
  const tasks = String(s('tasks') || '').split('\n').map(t => t.trim()).filter(Boolean);
  const types = String(s('memTypes') || '').split('\n').map(t => t.trim()).filter(Boolean);
  const CN = i => cn(i + 1);
  const art = [];
  const A = (...lines) => art.push({ lines });
  const ch = t => art.push({ ch: t });
  ch('第一章　總則');
  A(`本會名稱為${nm}（以下簡稱本會）。`);
  A(`本會為依法設立、非以營利為目的之社會團體，以${o(s('purpose'), '○○○')}為宗旨。`);
  A(`本會以${o(s('area'), '屏東縣○○鄉（鎮市）行政區域')}為組織區域。`);
  A('本會會址設於主管機關所在地區，並得報經主管機關核准設分支機構。', '前項分支機構組織簡則由理事會擬訂，報請主管機關核准後行之。', '會址及分支機構之地址於設置及變更時應函報主管機關核備。');
  A('本會之任務如下：', ...(tasks.length ? tasks : ['○○○。', '……']).map((t, i) => `${CN(i)}、${t.replace(/^[一二三四五六七八九十]+、/, '')}`));
  A('本會之主管機關為屏東縣政府。本會之目的事業應受各該事業主管機關之指導、監督。');
  ch('第二章　會員');
  A(`本會會員分下列${cn(types.length || 2) || '○'}種：`, ...(types.length ? types : ['個人會員：……', '團體會員：……']).map((t, i) => `${CN(i)}、${t.replace(/^[一二三四五六七八九十]+、/, '')}`));
  A('會員（會員代表）有表決權、選舉權、被選舉權與罷免權。每一會員（會員代表）為一權。榮譽會員及贊助會員無上述權利。');
  A('會員有遵守本會章程、決議及繳納會費之義務。');
  A('會員（會員代表）有違反法令，章程或不遵守會員大會決議時，得經理事會決議，予以警告或停權處分，其危害團體情節重大者，得經會員大會決議予以除名。');
  A('會員有下列情事之一者，為出會：', '一、喪失會員資格者。', '二、經會員大會決議除名者。');
  A('會員得以書面敘明理由向本會聲明退會。');
  ch('第三章　組織及職權');
  A(`本會以會員大會為最高權力機構。會員（會員代表）人數超過三百人以上時得分區比例選出會員代表，再召開會員代表大會，行使會員大會職權。會員代表任期${o(s('repYears'))}年，其各名額及選舉辦法由理事會擬訂，報請主管機關核備後行之。`);
  A('會員（會員代表）大會之職權如下：', '一、訂定與變更章程。', '二、選舉及罷免理事、監事。', '三、議決入會費、常年會費、事業費及會員捐款之數額及方式。', '四、議決年度工作計畫、報告及預算、決算。', '五、議決會員（會員代表）之除名處分。', '六、議決財產之處分。', '七、議決本會之解散。', '八、議決與會員權利義務有關之其他重大事項。', '前項第八款重大事項之範圍由理事會定之。');
  A(`本會置理事${o(cn(s('dirs')))}人、監事${o(cn(s('sups')))}人，由會員（會員代表）選舉之，分別成立理事會、監事會。選舉前項理事、監事時，依計票情形得同時選出候補理事${o(cn(s('dirAlt')))}人，候補監事${o(cn(s('supAlt')))}人，遇理事、監事出缺時，分別依序遞補之。`);
  A('理事會之職權如下：', '一、審定會員（會員代表）之資格。', '二、選舉及罷免常務理事、理事長。', '三、議決理事、常務理事及理事長之辭職。', '四、聘免工作人員。', '五、擬訂年度工作計畫、報告及預算、決算。', '六、其他應執行事項。');
  A(isBlank(s('stdDirs')) || num(s('stdDirs')) === 0 ? '理事會由理事互選一人為理事長。' : `理事會置常務理事${cn(s('stdDirs'))}人，由理事互選之，並由理事就常務理事中選舉一人為理事長。`, '理事長對內綜理督導會務，對外代表本會，並擔任會員大會、理事會主席。', `理事長因事不能執行職務時，應指定${isBlank(s('stdDirs')) || num(s('stdDirs')) === 0 ? '理事' : '常務理事'}一人代理之，未指定或不能指定時，由${isBlank(s('stdDirs')) || num(s('stdDirs')) === 0 ? '理事' : '常務理事'}互推一人代理之。`, `理事長${isBlank(s('stdDirs')) || num(s('stdDirs')) === 0 ? '' : '、常務理事'}出缺時，應於一個月內補選之。`);
  A('監事會之職權如下：', '一、監察理事會工作之執行。', '二、審核年度決算。', '三、選舉及罷免常務監事。', '四、議決監事及常務監事之辭職。', '五、其他應監察事項。');
  A(`監事會置常務監事${o(cn(s('stdSups')))}人，由監事互選之，監察日常會務，並擔任監事會主席。`, '常務監事因事不能執行職務時，應指定監事一人代理之，未指定或不能指定時，由監事互推一人代理之。', '監事會主席（常務監事）出缺時應於一個月內補選之。');
  A(`理事、監事均為無給職，任期${o(cn(s('years')))}年，連選得連任。理事長之連任，以一次為限。理事、監事之任期自召開本屆第一次理事會之日起計算。`);
  A('理事、監事有下列情事之一者，應即解任：', '一、喪失會員（會員代表）資格者。', '二、因故辭職經理事會或監事會決議通過者。', '三、被罷免或撤免者。', '四、受停權處分期間逾任期二分之一者。');
  A('本會置總幹事一人，承理事長之命處理本會事務，其他工作人員若干人，由理事長提名經理事會通過聘免之，並報主管機關備查。', '前項工作人員不得由理事監事擔任。', '工作人員權責及分層負責事項由理事會另定之。');
  A('本會得設各種委員會、小組或其他內部作業組織，其組織簡則經理事會通過後施行，變更時亦同。');
  A('本會得由理事會聘請名譽理事長一人，名譽理事、顧問若干人，其聘期與理事、監事之任期同。');
  ch('第四章　會議');
  A('會員（會員代表）大會分定期會議與臨時會議二種，由理事長召集，召集時除緊急事故之臨時會議外應於十五日前以書面通知之。', '定期會議每年召開一次，臨時會議於理事會認為必要，或經會員（會員代表）五分之一以上之請求，或監事會函請召集時召開之。', '本會辦理法人登記後，臨時會議經會員（會員代表）十分之一以上之請求召開之。');
  A('會員（會員代表）不能親自出席會員大會時，得以書面委託其他會員（會員代表）代理，每一會員（會員代表）以代理一人為限。');
  A('會員（會員代表）大會之決議，以會員（會員代表）過半數之出席，出席人數較多數之同意行之。但下列事項之決議以出席人數三分之二以上同意行之。', '一、章程之訂定與變更。', '二、會員（會員代表）之除名。', '三、理事、監事之罷免。', '四、財產之處分。', '五、本會之解散。', '六、其他與會員權利義務有關之重大事項。', '本會辦理法人登記後，章程之變更以出席人數四分之三以上之同意或全體會員三分之二以上書面之同意行之。', '本會之解散，得隨時以全體會員三分之二以上之可決解散之。');
  A(`理事會每${o(s('brdMonths'))}個月召開一次，監事會每${o(s('supMonths'))}個月召開一次，必要時得召開聯席會議或臨時會議。`, '前項會議召集時除臨時會議外，應於七日前以書面通知，會議之決議，各以理事、監事過半數之出席，出席人數較多數之同意行之。');
  A('理事應出席理事會議，監事應出席監事會議，理事會、監事會不得委託出席：理事、監事連續二次無故缺席理事會、監事會者，視同辭職。');
  ch('第五章　經費及會計');
  A('本會經費來源如下：', `一、入會費：新台幣${o(s('feeIn'))}元，於會員入會時繳納。`, `二、常年會費：新台幣${o(s('feeYear'))}元。`, '三、事業費。', '四、會員捐款。', '五、委託收益。', '六、基金及其孳息。', '七、其他收入。');
  A('本會會計年度以曆年為準，自每年一月一日起至十二月三十一日止。');
  A('本會每年於會計年度開始前二個月由理事會編造年度工作計畫、收支預算表、員工待遇表，提會員大會通過（會員大會因故未能如期召開者，先提理監事聯席會議通過），於會計年度開始前報主管機關核備。並於會計年度終了後二個月內由理事會編造年度工作報告、收支決算表、現金出納表、資產負債表、財產目錄及基金收支表，送監事會審核後，造具審核意見書送還理事會，提會員大會通過，於三月底前報主管機關核備（會員大會未能如期召開者，先報主管機關）。');
  A('本會於解散後，剩餘財產歸屬所在地之地方自治團體或主管機關指定之機關團體所有。');
  ch('第六章　附則');
  A('本章程未規定事項，悉依有關法令規定辦理。');
  A('本章程經會員（會員代表）大會通過，報經主管機關核備後施行，變更時亦同。');
  const pd = s('passDate');
  A(`本章程經本會${parseDate(pd) ? rd(pd) : '○年○月○日'}第${o(s('passTerm'))}屆第${o(s('passNo'))}次會員大會通過。`, `報經屏東縣政府${S.statute.approveDate ? rd(S.statute.approveDate) : '○年○月○日'}屏府社政字第${o(S.statute.approveNo, '○○○')}號函准予備查。`);
  const B = [TITLE(`${nm}章程`, { size: 18, after: 10 })];
  let no = 0;
  for (const a of art) {
    if (a.ch) { B.push(P(a.ch, { align: 'c', bold: true, size: 14, before: 8, after: 4 })); continue; }
    no++;
    const lab = `第${cn(no).length === 1 ? FW + cn(no) + FW : cn(no).length === 2 ? cn(no)[0] + FW + cn(no)[1] : cn(no)}條`;
    B.push(P(`${lab}　${a.lines[0]}`, { hang: 6, after: 1 }));
    a.lines.slice(1).forEach(l => B.push(P(l, { indent: 6, hang: /^[一二三四五六七八九十]+、/.test(l) ? 2 : 0, after: 1 })));
  }
  return { title: '組織章程', sheets: [{ name: '組織章程', cols: [1], size: 12, ls: 1.5, blocks: B }] };
}

/* ---------- 徵求入會公告、入會申請書 ---------- */
function docRecruit() {
  const x = S.x.recruit, mk = 'prep.' + (S.ui.prepVar || 'p1');
  const quals = (x.quals || '1.個人會員：凡贊同本會宗旨，年滿二十歲者，得申請入會。\n2.團體會員：凡贊同本會宗旨之機關、機構、學校及團體，得申請入會。\n3.贊助會員：凡贊同本會宗旨，並對本會有所贊助之個人或機關、機構、學校及團體，得申請入會。').split('\n');
  return { title: '徵求入會公告', sheets: [{ name: '徵求入會公告', cols: [1], size: 14, ls: 1.6, blocks: [
    P(rd(x.date || isoToday()), { align: 'r', after: 0 }),
    P(docNo(x.no), { align: 'r', size: 12, after: 8 }),
    TITLE(`${orgFull()}籌備會　公告`, { size: 18 }),
    P(`主　　旨：本會經屏東縣政府${rd(x.approveDate)}屏府社政字第${x.approveNo || FW.repeat(5)}號函准予設立，並成立籌備會，茲公開徵求會員。`, { hang: 5 }),
    P('公告事項：'),
    P(`一、本會宗旨：${V('x.recruit.goal') || FW.repeat(10)}`, { indent: 1, hang: 2 }),
    P('二、入會資格：', { indent: 1, hang: 2 }),
    ...quals.map(q => P(q, { indent: 3, hang: 2 })),
    P(`三、籌備期間申請入會之截止日期：即日起至${rd(x.deadline)}止。`, { indent: 1, hang: 2 }),
    P(`四、籌備會地址及電話：${S.org.address || ''}${S.org.phone ? '　電話：' + S.org.phone : ''}`, { indent: 1, hang: 2 }),
    P('五、入會申請書有關資料請向前項地址索取。', { indent: 1, hang: 2 }),
    P(`${SA('@org', -6, -1.2)}主任委員　${V('x.recruit.chair') || FW.repeat(4)}${STAMP(slotOf('籌備會主任委員', V('x.recruit.chair')), '（蓋章）')}`, { align: 'r', before: 24, size: 16 }),
  ] }] };
}
function docApplyP() {
  const L = { al: 'c', h: true };
  const r = (a, b, c, d2) => ({ h: 30, cells: [{ v: a, ...L }, { v: b, cs: c ? 1 : 3 }, ...(c ? [{ v: c, ...L }, { v: d2 }] : [])] });
  const rows = [
    r('姓　　名', '', '性　　別', '□男　□女'), r('出生年月日', '民國　　年　　月　　日', '身分證字號', ''),
    r('籍　　貫', ''), r('戶籍地址', ''), r('電　　話', ''), r('學　　歷', ''), r('經　　歷', ''), r('現　　職', ''),
    { h: 40, cells: [{ v: '審查結果', ...L }, { v: '□同意入會\n□歉難同意，原因：', cs: 3 }] },
    { h: 30, cells: [{ v: '會員類別', ...L }, { v: '□個人會員　□贊助會員', cs: 3 }] },
    { h: 30, cells: [{ v: '會員證號碼', ...L }, { v: '', cs: 3 }] },
    { h: 70, cells: [{ v: `中　華　民　國　　　年　　　月　　　日\n\n申請人：　　　　　　　　簽名（蓋章）`, cs: 4, al: 'c' }] },
  ];
  return { title: '個人會員入會申請書', sheets: [{ name: '個人會員入會申請書', cols: [18, 34, 16, 32], size: 13, blocks: [
    TITLE(`${orgFull()}\n個人會員入會申請書`, { size: 18 }), T(rows, { size: 13, pad: 4 }), P('（請附身分證影本）', { size: 11, before: 4 }),
  ] }] };
}
function docApplyG() {
  const L = { al: 'c', h: true };
  const rows = [
    { h: 30, cells: [{ v: '團體名稱', ...L }, { v: '', cs: 3 }, { v: '電話', ...L }, { v: '', cs: 2 }] },
    { h: 30, cells: [{ v: '地　　址', ...L }, { v: '', cs: 6 }] },
    { h: 30, cells: [{ v: '負責人', ...L }, { v: '職稱：', cs: 2 }, { v: '姓名：', cs: 4 }] },
    { cells: [{ v: '會員代表', rs: 2, ...L }, ...['姓名', '性別', '生日', '學歷', '經歷', '職稱'].map(v => ({ v, ...L }))] },
    { h: 36, cells: Array.from({ length: 6 }, () => ({ v: '' })) },
    { cells: ['設立日期', '成員人數', '證照字號', '發證機關'].map(v => ({ v, ...L })).concat([{ v: '業務項目', cs: 3, ...L }]) },
    { h: 40, cells: [{ v: '' }, { v: '' }, { v: '' }, { v: '' }, { v: '', cs: 3 }] },
    { h: 90, cells: [{ v: '審查結果', ...L }, { v: '□同意入會\n\n□歉難同意，原因：', cs: 2, va: 't' }, { v: '會員代表照片黏貼處', cs: 2, al: 'c' }, { v: '會員證號碼', ...L }, { v: '' }] },
    { h: 70, cells: [{ v: '申請團體：　　　　　　　　負責人：　　　　　（簽名或蓋章）\n\n中　華　民　國　　　年　　　月　　　日', cs: 7, al: 'c' }] },
  ];
  return { title: '團體會員入會申請書', sheets: [{ name: '團體會員入會申請書', land: true, cols: [12, 14, 12, 14, 18, 14, 16], size: 12, blocks: [TITLE(`${orgFull()}　團體會員入會申請書`, { size: 16 }), T(rows, { size: 12, pad: 3 })] }] };
}

/* ---------- 移交清冊 ---------- */
function docHandover(sc) {
  const x = S.x.handover, found = sc === 'found', L = { al: 'c', h: true, b: true };
  const t2 = found ? '一' : O(cn(mTerm('renew.asm')), '○'), t1 = found ? '籌備會' : O(cn(num(mTerm('renew.asm')) - 1), '○');
  const lists = found ? ['電子檔案移交清冊', '業務移交清冊', '財產移交清冊', '人事移交清冊'] : ['圖記移交清冊', '電子檔案移交清冊', '業務移交清冊', '財產移交清冊', '人事移交清冊'];
  const CAP = ['壹', '貳', '參', '肆', '伍'];
  const head = [
    { cells: [{ v: `${orgFull()}${found ? '籌備會移交第一屆理事長' : `第${t1}、${t2}屆理事長`}移交清冊\n${rd(V('x.handover.date'))}`, cs: 3, al: 'c', b: true, sz: 14 }] },
    { hdr: true, cells: ['表　冊　名　稱', '份數', '備　　　註'].map(v => ({ v, ...L })) },
    ...lists.map((n, i) => ({ h: 24, cells: [{ v: `${cn(i + 1)}、${n}` }, { v: '壹', al: 'c' }, { v: '如附件', al: 'c' }] })),
    { h: 24, cells: [{ v: '合　　　　　計', al: 'c' }, { v: CAP[lists.length - 1], al: 'c' }, { v: '' }] },
    { h: 150, cells: [{ v: '', cs: 2 }, { v: `移交人　${found ? '卸任籌備會主任委員' : '卸任理事長'}　${V('x.handover.from') || ''}\n${STAMP(slotOf(found ? '籌備會主任委員' : '', V('x.handover.from')))}\n\n接收人　新任理事長　${V('x.handover.to') || ''}\n${STAMP(slotOf('理事長', V('x.handover.to')))}\n\n監交人　監事會代表（或新任常務監事）　${V('x.handover.sup') || ''}\n${STAMP(slotOf('', V('x.handover.sup')))}` }] },
  ];
  const sub = (title, hdr, items) => [PB(), T([{ cells: [{ v: title, cs: 3, al: 'c', b: true, sz: 14 }] }, { hdr: true, cells: hdr.map(v => ({ v, ...L })) }, ...items.map((it, i) => ({ h: 24, cells: [{ v: `${i + 1}．${it[0] || ''}` }, { v: it[1] || '', al: 'c' }, { v: it[2] || '' }] }))], { size: 12 })];
  const ms = memberStats().total;
  const B = [T(head, { size: 12 })];
  if (!found) B.push(...sub('印信移交清冊', ['印　　　文', '數量(枚)', '備註'], [[orgFull(), '1', '長方型章'], [`${orgFull()}理事長印`, '1', '理事長職章'], [orgFull(), '1', '支票專用章'], [orgFull(), '1', '圖記(大印)'], [`${orgFull()}收發章`, '1', '橡皮圖章']]));
  B.push(...sub('電子檔案移交清冊', ['類　　別', '數量', '備　　註'], [['會務', '', '章程、會議議程、開會通知、會議紀錄'], ['業務', '', '發文範本、活動辦理成果、照片等'], ['財產', '', '決算表、工作計畫、預算表、其他帳冊'], ['人事', '', '會員名冊、理監事簡歷冊、聘僱人員名冊'], [], [], []]));
  B.push(...sub('業務移交清冊', ['類　　別', '數量(本)', '備　　註'], found
    ? [['立案資料', '', '立案公文、立案證書'], ['章程', '', '章程修改備查文'], ['會議資料', '', ''], ['活動辦理資料', '', ''], ['收發文登記簿', '', ''], ['收發文文實體', '', ''], [], []]
    : [['立案資料', '', '立案公文、立案證書'], ['印信', '', '核准啟用印信文'], ['章程', '', '章程修改備查文'], ['法人登記', '', '法人登記證書、法人登記備查文、法人登記相關資料'], ['稅務資料', '', '國稅局稅籍資料（含統編）、所得利息免扣繳証明'], ['年度會議資料', '', ''], ['活動辦理資料', '', ''], ['收發文登記簿', '', ''], ['收發文文實體', '', ''], []]));
  B.push(...sub('財產移交清冊', ['檔案名稱', '數量(本)', '備　　註'], [['預算書表', '', ''], ['決算書表', '', ''], ['銀行存款－一般', '', '附存摺影本及銀行往來對帳單明細表'], ['銀行存款－基金專戶', '', '附存摺影本及銀行往來對帳單明細表'], ['日記簿', '', ''], ['總分類帳', '', ''], ['財產登記簿', '', '附財產之處理文件'], ['明細分類帳', '', ''], ['會計憑簿', '', ''], []]));
  B.push(...sub('人事移交清冊', ['檔案名稱', '數量(本)', '備　　註'], found
    ? [['會員入會申請書', '', `共${ms ? ms : FW.repeat(3)}員`], ['會員名冊', '', `共${ms ? ms : FW.repeat(3)}員`], ['服務規則', '', ''], [], []]
    : [['會員入會申請書', '', `共${ms ? ms : FW.repeat(3)}員`], ['會員名冊', '', `共${ms ? ms : FW.repeat(3)}員`], ['待遇－職稱、薪給', '', ''], ['服務規則', '', ''], ['考勤－平時、年終', '', ''], ['資遣、退職', '', ''], ['退休、撫恤', '', ''], ['選任職員', '', '歷屆理、監事簡歷冊資料']]));
  B.push(P('註：一、於新任理事長選出後15日內以移交清冊乙份連同圖記移交新任。', { size: 11, before: 6 }), P('二、理事長當選後十日內辦竣點交手續，備函並檢同移交清冊乙份報主管機關。', { size: 11, indent: 1.5 }));
  return { title: '移交清冊', sheets: [{ name: '移交清冊', cols: [40, 14, 46], size: 12, blocks: B }] };
}

/* ---------- 理監事暨會務人員一覽表 ---------- */
function docRoster(sc) {
  const o = S.org, L = { al: 'c', h: true };
  const term = scenTerm(sc), reelect = sc === 'renew' ? MV('renew.asm', 'date') : (sc === 'found' ? MV('found.asm', 'date') : o.reelectDate);
  const st = memberStats();
  const grp = V('org.groupCount'), per = V('org.memberCount');
  const rows = [];
  rows.push({ cells: [{ v: `${orgFull()}理監事暨會務人員一覽表`, cs: 7, b: true, al: 'c', sz: 14 }, { v: `${rd(isoToday())}填送\n${SA('@org', 4.5, 'b')}（請加蓋團體圖記）`, cs: 3, al: 'c', sz: 9 }] });
  rows.push({ cells: [{ v: '團體名稱', cs: 2, rs: 2, ...L }, { v: '社會局立案', cs: 3, ...L }, { v: '社團法人登記日期字號（法院）', rs: 2, ...L }, { v: '本屆別', rs: 2, ...L }, { v: '改選日期', rs: 2, ...L }, { v: '會員人數', cs: 2, ...L }] });
  rows.push({ cells: [{ v: '日期', cs: 2, ...L }, { v: '字號', ...L }, { v: '團體', ...L }, { v: '個人', ...L }] });
  const court = [rdOr(o.courtDate), o.courtNo].filter(Boolean).join('\n');
  rows.push({ cells: [{ v: orgFull(), cs: 2, al: 'c' }, { v: rd(o.regDate), cs: 2, al: 'c' }, { v: `${o.regWord || FW}字\n第${o.regNum || FW.repeat(3)}號`, al: 'c' }, { v: court, al: 'c' }, { v: `第${O(term, FW)}屆`, al: 'c' }, { v: rd(reelect), al: 'c' }, { v: grp, al: 'c' }, { v: per, al: 'c' }] });
  rows.push({ cells: [{ v: '團體會址', cs: 2, ...L }, { v: o.address, cs: 5 }, { v: '電話號碼', ...L }, { v: o.phone, cs: 2 }] });
  rows.push({ cells: [{ v: '網址', cs: 2, ...L }, { v: o.web, cs: 3 }, { v: '電子信箱', ...L }, { v: o.email, cs: 2 }, { v: '傳真號碼', ...L }, { v: o.fax }] });
  rows.push({ hdr: true, cells: [...['職別', '姓名', '性別', '出生年月日', '現職', '身分證統一編號'].map(v => ({ v, ...L })), { v: '戶籍所在地或工作地址', cs: 3, ...L }, { v: '電話號碼', ...L }] });
  const ppl = peopleSorted().filter(r => !PREP_ROLES.includes(r.role));
  ppl.forEach(r => rows.push({ cells: [{ v: r.role, al: 'c' }, { v: r.name, al: 'c' }, { v: r.gender, al: 'c' }, { v: rdDot(r.birth) || r.birth || '', al: 'c' }, { v: r.job, al: 'c' }, { v: r.idno, al: 'c' }, { v: r.addr, cs: 3 }, { v: r.phone, al: 'c' }] }));
  for (let i = ppl.length; i < 4; i++) rows.push({ h: 22, cells: [...Array.from({ length: 6 }, () => ({ v: '' })), { v: '', cs: 3 }, { v: '' }] });
  return { title: '理監事暨會務人員一覽表', sheets: [{ name: '理監事暨會務人員一覽表', cols: [7, 8, 4, 9, 9, 11, 9, 9, 8, 12], size: 10, ls: 1.2, blocks: [
    T(rows, { size: 10 }),
    P('注意：請按下列次序填列－理事長、常務理事、理事、候補理事、常務監事、監事、候補監事、會務人員。', { size: 10, before: 4 }),
    P('本表一式三份，其中二份函送屏東縣政府社會處，一份團體自存。', { size: 10 }),
  ] }] };
}

/* ---------- 當選證明、會址使用同意書 ---------- */
function docCert() {
  const L = { al: 'c', h: true };
  const row = (a, b, c, d2) => ({ h: 40, cells: [{ v: a, ...L }, { v: b }, { v: c, ...L }, { v: d2 }] });
  const rows = [
    row('理事長姓名', V('x.cert.name'), '團體名稱', orgFull()),
    row('出生地', S.x.cert.birthplace, '當選屆次', `第${O(V('x.cert.term'), FW)}屆`),
    row('出生日期', rdOr(V('x.cert.birth'), V('x.cert.birth')), '召開第一次理事會日期（補選日期）', rdOr(V('x.cert.firstDate'))),
    row('戶籍地址', V('x.cert.addr'), '任期', V('x.cert.tenure')),
    row('電話', V('x.cert.phone'), '備註', S.x.cert.note || ''),
  ];
  return { title: '申請理事長當選證明書', sheets: [{ name: '理事長當選證明書資料', cols: [14, 30, 18, 30], size: 13, ls: 1.4, blocks: [
    TITLE('申請理事長當選證明書填報資料內容', { after: 12 }), T(rows, { size: 13, pad: 6 }),
    P('註：如有申請理事長當選證明書需要者於任期內請備函並檢具本表及申請人二吋半身照片乙張及身分證正反影本乙份。', { size: 12, before: 8, hang: 2 }),
  ] }] };
}
function docConsent() {
  const c = S.x.consent, d = parseDate(V('x.consent.date')) || {};
  const body = `茲有本人座落於【${V('x.consent.loc') || '屏東縣○○鄉鎮市○○村里○○路○○號'}】房屋一間（棟），地號${c.landNo || FW.repeat(4)}號，坪數${V('x.consent.ping') || '○○○'}坪（或）${V('x.consent.sqm') || '○○○○'}平方公尺，同意免費借予「${orgFull()}」使用，期限自民國${rd(c.from)}起至${rd(V('x.consent.to'))}止，恐空口無憑，特立此同意書以昭公信。`;
  return { title: '會址使用同意書', sheets: [{ name: '會址使用同意書', cols: [1], size: 16, ls: 2, blocks: [
    TITLE('會址使用同意書', { size: 22, after: 24, sp: 0.3 }), P(body, { firstIndent: 2, align: 'j' }), P('', { after: 18 }),
    P(`房屋出借人：${c.lender || ''}${FW.repeat(2)}${STAMP(slotOf('', c.lender))}`, { indent: 6, after: 10 }),
    P(`見　證　人：${c.witness || ''}${FW.repeat(2)}${STAMP(slotOf('', c.witness))}`, { indent: 6, after: 10 }),
    P(`理　事　長：${chairName()}${FW.repeat(2)}${STAMP(slotOf('理事長', chairName()))}`, { indent: 6, after: 30 }),
    P(`中${FW}華${FW}民${FW}國${FW.repeat(2)}${d.y || FW.repeat(2)}${FW.repeat(2)}年${FW.repeat(2)}${d.m || FW}${FW.repeat(2)}月${FW.repeat(2)}${d.d || FW}${FW.repeat(2)}日`, { align: 'c', before: 30 }),
    P('（請檢附使用權狀或近期繳稅單影本）', { align: 'c', size: 11, before: 18 }),
  ] }] };
}

/* ---------- 委託書（每頁 6 張） ---------- */
function docProxy(mk) {
  const sc = scenOf(mk), meet = sc === 'found' ? '成立大會' : `${mTitle(mk)}`;
  const one = `委託書\n\n本人＿＿＿＿＿＿（簽名或蓋章）因私務繁忙，不克前往參加${orgFull()}之${meet}，茲委託＿＿＿＿＿＿代行本人在會員大會中一切的會員權利。\n\n委託人姓名：＿＿＿＿＿＿＿\n委託人聯絡電話（行動）：＿＿＿＿＿＿\n立書日期：＿＿年＿＿月＿＿日`;
  const pages = Math.max(1, Math.min(10, num(V('x.proxy.pages')) || 1)), B = [];
  for (let p = 0; p < pages; p++) { if (p) B.push(PB()); B.push(T([0, 1, 2].map(() => ({ h: 230, cells: [{ v: one, va: 't' }, { v: one, va: 't' }] })), { size: 11, pad: 8, ls: 1.3 })); }
  return { title: '委託書', sheets: [{ name: '委託書', cols: [1, 1], size: 11, blocks: B }] };
}

/* ---------- 選舉票、罷免票 ---------- */
function ballotCands(mk, which) {
  const el = M(mk).el || {}; const list = (which === 'sup' ? el.sups : el.dirs) || [];
  const ns = list.filter(c => !isBlank(c.name)).map(c => c.name.trim());
  if (ns.length) return ns;
  if (ballotType() === '1') return membersNamed().filter(isVoter).map(m => m.name.trim());
  return [];
}
function docBallot(mk) {
  const type = ballotType(), t = O(cn(V('x.ballot.term')), '○'), sheets = [];
  const stamp = d0 => ({ h: 80, cells: [{ v: `${STAMP('@org', '（蓋團體圖記）')}${FW.repeat(8)}（監事會推派監事簽章）\n\n中華民國${rd(d0)}`, cs: 99, al: 'c', va: 'b' }] });
  const date = MV(mk, 'date');
  const mkOne = which => {
    const seat = num(MV(mk, `el.${which}Seats`)) || (which === 'dir' ? 9 : 3), role = which === 'dir' ? '理事' : '監事';
    const title = `${orgFull()}第${t}屆${role}選舉票`;
    const rule = `應選出${role}${seat}名，圈（填）選不得超過${seat}名，請於圈選欄內畫「○」${type === '1' ? '' : '或於空格內填寫候選人姓名'}。`;
    const cands = ballotCands(mk, which);
    if (type === '1') {
      const n = Math.max(cands.length, 9), per = Math.ceil(n / 3), L = { al: 'c', h: true, b: true };
      const rows = [{ cells: [{ v: title, cs: 9, al: 'c', b: true, sz: 15 }] }, { cells: [{ v: rule, cs: 9, al: 'c', sz: 11 }] }, { hdr: true, cells: Array.from({ length: 3 }, () => [{ v: '編號', ...L }, { v: '圈選', ...L }, { v: '候選人', ...L }]).flat() }];
      for (let r = 0; r < per; r++) { const cells = []; for (let g = 0; g < 3; g++) { const i = r * 3 + g; cells.push({ v: i < n ? String(i + 1) : '', al: 'c' }, { v: '' }, { v: cands[i] || '', al: 'c' }); } rows.push({ h: 26, cells }); }
      rows.push({ ...stamp(date), cells: [{ ...stamp(date).cells[0], cs: 9 }] });
      return { name: `${role}選舉票`, cols: [5, 7, 21, 5, 7, 21, 5, 7, 21], size: 12, blocks: [T(rows, { size: 12, pad: 3 })] };
    }
    if (type === '2') {
      const rows = [{ cells: [{ v: title, cs: 3, al: 'c', b: true, sz: 15 }] }, { cells: [{ v: rule, cs: 3, al: 'c', sz: 11 }] }, { hdr: true, cells: [{ v: '填　選　候　選　人', cs: 3, al: 'c', h: true, b: true }] }];
      for (let i = 0; i < seat; i += 3) rows.push({ h: 34, cells: [0, 1, 2].map(j => ({ v: i + j < seat ? '' : '／', al: 'c' })) });
      rows.push({ ...stamp(date), cells: [{ ...stamp(date).cells[0], cs: 3 }] });
      return { name: `${role}選舉票`, cols: [1, 1, 1], size: 12, blocks: [T(rows, { size: 12, pad: 3 })] };
    }
    const n = Math.max(cands.length, seat), L = { al: 'c', h: true, b: true };
    const rows = [{ cells: [{ v: title, cs: 4, al: 'c', b: true, sz: 15 }] }, { cells: [{ v: `${rule}（參考名單）`, cs: 4, al: 'c', sz: 11 }] }, { hdr: true, cells: [{ v: '編號', ...L }, { v: '圈選', ...L }, { v: '候選人', ...L }, { v: '填　選　候　選　人', ...L }] }];
    for (let i = 0; i < n; i++) rows.push({ h: 26, cells: [{ v: String(i + 1), al: 'c' }, { v: '' }, { v: cands[i] || '', al: 'c' }, { v: i < seat ? '' : '／', al: 'c' }] });
    rows.push({ ...stamp(date), cells: [{ ...stamp(date).cells[0], cs: 4 }] });
    return { name: `${role}選舉票`, cols: [8, 10, 34, 48], size: 12, blocks: [T(rows, { size: 12, pad: 3 })] };
  };
  sheets.push(mkOne('dir'), mkOne('sup'));
  const rc = (S.x.ballot.recall || '').split(/[、,，\s]+/).filter(Boolean);
  if (rc.length && scenOf(mk) === 'renew') {
    const rows = [{ cells: [{ v: `${orgFull()}第${t}屆${S.x.ballot.recallRole || '理監事'}罷免票`, cs: 3, al: 'c', b: true, sz: 15 }] }];
    rc.forEach(nm => { rows.push({ h: 30, cells: [{ v: '' }, { v: '同意罷免', al: 'c' }, { v: nm, rs: 2, al: 'c', sz: 16 }] }); rows.push({ h: 30, cells: [{ v: '' }, { v: '不同意罷免', al: 'c' }] }); });
    rows.push({ h: 80, cells: [{ v: `${STAMP('@org', '（蓋團體圖記）')}${FW.repeat(6)}（監事會推派監事簽章）\n\n中華民國${rd(date)}`, cs: 3, al: 'c', va: 'b' }] });
    sheets.push({ name: '罷免票', cols: [10, 30, 60], size: 13, blocks: [T(rows, { size: 13, pad: 3 })] });
  }
  return { title: '選舉票', sheets };
}

/* ---------- 章程修正對照表 ---------- */
function docAmend(sc) {
  const a = S.amend, L = { al: 'c', h: true, b: true };
  const pre = sc + '.pre', asm = sc + '.asm';
  const rows = [{ hdr: true, cells: [{ v: '原條文', ...L }, { v: '修正後條文', ...L }, { v: '說明', ...L }] }];
  (a.rows || []).forEach(r => rows.push({ cells: [{ v: r.orig, va: 't' }, { v: r.rev, va: 't' }, { v: r.note, va: 't' }] }));
  if (!(a.rows || []).length) rows.push({ h: 120, cells: [{ v: '' }, { v: '' }, { v: '' }] });
  return { title: '章程修正條文對照表', sheets: [{ name: '章程修正條文對照表', cols: [1, 1, 1], size: 12, ls: 1.3, blocks: [
    TITLE(orgFull(), { after: 0 }), TITLE('章程修正條文對照表', { after: 6 }),
    P(`${rd(MV(pre, 'date'))}第${O(cn(mTerm(pre)), '○')}屆第${O(cn(mNo(pre)), '○')}次理（監）事會審議通過`, { align: 'r', size: 11 }),
    P(`${rd(MV(asm, 'date'))}第${O(cn(mTerm(asm)), '○')}屆第${O(cn(mNo(asm)), '○')}次會員大會議決通過`, { align: 'r', size: 11, after: 6 }),
    T(rows, { size: 12 }),
    P(`總幹事　${pname('總幹事') || FW.repeat(4)}${STAMP(slotOf('總幹事', pname('總幹事')))}${FW.repeat(6)}理事長　${chairName() || FW.repeat(4)}${STAMP(slotOf('理事長', chairName()))}`, { before: 18, align: 'c' }),
  ] }] };
}

/* ---------- 解散報告書、圖記印鑑證明、辭職書、證書補發 ---------- */
function docDissolveReport() {
  const r = S.x.report, L = { al: 'c', h: true };
  const rows = [
    { h: 30, cells: [{ v: '團體名稱', ...L }, { v: orgFull(), cs: 3 }] },
    { h: 30, cells: [{ v: '會　　址', ...L }, { v: S.org.address, cs: 3 }] },
    { h: 34, cells: [{ v: '原頒立案\n證書字號', ...L }, { v: `${S.org.regWord || '屏府社政'}字第${S.org.regNum || FW.repeat(6)}號` }, { v: '有無辦理\n登記法人', ...L }, { v: S.org.corp === '有' ? '■有　□無' : S.org.corp === '無' ? '□有　■無' : '□有　□無', al: 'c' }] },
    { h: 70, cells: [{ v: '解散原因\n及經過', ...L }, { v: r.story || (r.reason ? `本會因${r.reason}，經${mTitle('dissolve.asm')}決議解散。` : ''), cs: 3, va: 't' }] },
    { h: 30, cells: [{ v: '奉准解散\n時間及文號', ...L }, { v: `${rd(r.okDate)}${FW}${r.okNo || FW.repeat(3) + '字第' + FW.repeat(6) + '號'}`, cs: 3 }] },
    { h: 30, cells: [{ v: '解散時間', ...L }, { v: rd(V('x.report.date')), cs: 3 }] },
    { h: 30, cells: [{ v: '繳銷原立案證書及圖記', ...L }, { v: rd(r.returnDate), cs: 3 }] },
    { h: 110, cells: [{ v: '清算事項', ...L }, { v: `清算人姓名：${V('x.report.liq') || ''}\n清算時間：${rd(r.liqFrom)}至${rd(r.liqTo)}\n剩餘財產：新台幣${hasNum(V('x.report.cash')) ? fmt(num(V('x.report.cash'))) : FW.repeat(6)}元\n其他：${r.other || ''}`, cs: 3, va: 't' }] },
    { h: 40, cells: [{ v: '備　　考', ...L }, { v: r.memo || '', cs: 3 }] },
  ];
  return { title: '解散報告書', sheets: [{ name: '解散報告表', cols: [18, 34, 16, 32], size: 13, ls: 1.4, blocks: [
    TITLE('屏東縣人民團體解散報告表', { size: 18 }), T(rows, { size: 13, pad: 4 }),
    P(`${orgFull()}理事長（或清算人）：${V('x.report.liq') || FW.repeat(4)}${STAMP(slotOf('理事長', V('x.report.liq')))}`, { before: 18 }),
    P(`中${FW}華${FW}民${FW}國${FW.repeat(3)}${rd(r.signDate || isoToday())}`, { align: 'c', before: 18 }),
  ] }] };
}
function docSeal() {
  const x = S.x.seal, L = { al: 'c', h: true };
  const rows = [
    { cells: [{ v: '屏東縣政府立案人民團體圖記印鑑證明書\n屏府社政字第　　　　號', cs: 3, al: 'c', b: true, sz: 15 }] },
    { h: 30, cells: [{ v: '團體名稱＊', ...L }, { v: orgFull(), cs: 2 }] },
    { h: 30, cells: [{ v: '印信啟用核備字號', ...L }, { v: `中華民國${rd(x.sealDate)}屏府社政字第${x.sealNo || FW.repeat(5)}號`, cs: 2 }] },
    { h: 30, cells: [{ v: '立案字號＊', ...L }, { v: `${S.org.regWord ? S.org.regWord + '字' : '屏府　字'}第${S.org.regNum || FW.repeat(5)}號函`, cs: 2 }] },
    { h: 30, cells: [{ v: '現任理事長（負責人）＊', ...L }, { v: V('x.seal.chair') }, { v: `團體圖記印模＊${SA('@org', -3.5, 7)}`, rs: 3, al: 'c', va: 't' }] },
    { h: 30, cells: [{ v: '團體會址＊', ...L }, { v: V('x.seal.addr') }] },
    { h: 150, cells: [{ v: '本印鑑證明書之用途＊', ...L }, { v: x.use || '' }] },
    { cells: [{ v: '附註：＊欄由申請單位填寫。依各團體需要份數，專案函報屏東縣政府（社會處）申請核印。', cs: 3, sz: 10 }] },
  ];
  return { title: '人民團體圖記印鑑證明書', sheets: [{ name: '圖記印鑑證明書', cols: [26, 34, 40], size: 13, blocks: [
    T(rows, { size: 13, pad: 4 }), P('本圖記核與原存檔印模相符核給證明', { align: 'c', before: 20 }), P(`中${FW}華${FW}民${FW}國${FW.repeat(4)}年${FW.repeat(4)}月${FW.repeat(4)}日`, { align: 'c', before: 16 }),
  ] }] };
}
function docResign() {
  const x = S.x.resign;
  return { title: '辭職書', sheets: [{ name: '辭職書', cols: [1], size: 16, ls: 2, blocks: [
    TITLE('辭　職　書', { size: 24, after: 24, sp: 0.4 }),
    P(`本人${x.name || FW.repeat(4)}因${x.reason || '（敘明原因）'}辭去${V('x.resign.org')}第${O(cn(V('x.resign.term')), '○')}屆${x.pos || '（理事長、常務理事、理事）'}一職，俾利本會會務運作。`, { firstIndent: 2, align: 'j' }),
    P(`立書人：${x.name || ''}${FW.repeat(2)}${STAMP(slotOf(/理事長/.test(x.pos || '') ? '理事長' : '', x.name))}`, { indent: 10, before: 40 }),
    P(`中${FW}華${FW}民${FW}國${FW.repeat(2)}${rd(x.date || isoToday())}`, { align: 'c', before: 40 }),
  ] }] };
}
function docReissue() {
  const x = S.x.reissue, why = x.why || '遺失';
  const rows = [
    { h: 34, cells: [{ v: `${orgFull()}之立案證書因有`, cs: 2 }] },
    { h: 28, cells: [{ v: (why === '遺失' ? '■' : '□') + '遺失' }, { v: '' }] },
    { h: 28, cells: [{ v: (why === '毀損' ? '■' : '□') + '毀損' }, { v: '' }] },
    { h: 28, cells: [{ v: (why === '其它' ? '■' : '□') + '其它原因：' }, { v: why === '其它' ? (x.other || '') : '' }] },
    { h: 40, cells: [{ v: '之情事，故向屏東縣政府申請補發，並由負責人切結為證，如有不實，本人願負一切法律責任。', cs: 2 }] },
  ];
  return { title: '立案證書補發申請書', sheets: [{ name: '立案證書補發申請書', cols: [30, 70], size: 14, ls: 1.6, blocks: [
    TITLE('人民團體立案證書補發申請書', { size: 18, after: 12 }), T(rows, { size: 14, pad: 4 }),
    P('此致', { before: 14 }), P('屏東縣政府', { indent: 2, after: 14 }),
    P(`申請／立切結書人（負責人）：${V('x.reissue.who')}${FW.repeat(2)}${STAMP(slotOf('理事長', V('x.reissue.who')), '（請簽名或蓋章）')}`),
    P(`身分證統一編號：${x.idno || ''}`), P(`聯絡電話：${V('x.reissue.phone')}`), P(`通訊地址：${V('x.reissue.addr')}`),
    P(`中${FW}華${FW}民${FW}國${FW.repeat(2)}${rd(x.date || isoToday())}`, { align: 'c', before: 24 }),
  ] }] };
}

/* ---------- 送件檢核表（本系統輔助） ---------- */
function docChecklist(sc) {
  const L = { al: 'c', h: true, b: true }, list = selDocs(sc);
  const rows = [{ hdr: true, cells: ['項次', '文件名稱', '份數／說明', '備妥'].map(v => ({ v, ...L })) }];
  const copies = x => ({ roster: '一式三份（二份送府）', amend: '附新舊章程各2份', cert: '附身分證影本1份、2吋照片2張', consent: '附使用權狀或稅單影本', handover: '一式四份', notice: '', letter: '' })[x.id] || '';
  list.forEach((x, i) => { const up = typeof upList === 'function' ? upList(sc, x).length : 0; rows.push({ h: 24, cells: [{ v: String(i + 1), al: 'c' }, { v: x.name + (x.kind === 'attach' ? '（另附）' : '') }, { v: [copies(x), up ? `已上傳 ${up} 個檔案` : '', x.note || ''].filter(Boolean).join('；'), sz: 10 }, { v: up ? '■' : '□', al: 'c' }] }); });
  const B = [TITLE(`${orgFull()}　${SCEN[sc].title}送件檢核表`), T(rows, { size: 12 })];
  const dl = deadlines(sc);
  if (dl.length) { B.push(P('重要期限：', { bold: true, before: 10 })); dl.forEach(x => B.push(P(`□ ${x.when ? rd(x.when) + '（' + weekday(x.when) + '）' : '（請先填會議日期）'}前：${x.what}`, { indent: 1 }))); }
  B.push(P('本表由線上填報系統依您勾選的文件自動產生，僅供自我檢核，實際應備文件以主管機關規定為準。', { size: 10, before: 10 }));
  return { title: '送件檢核表', sheets: [{ name: '送件檢核表', cols: [8, 44, 38, 10], size: 12, blocks: B }] };
}
function deadlines(sc) {
  const out = [];
  for (const mk of SCEN[sc].meets()) {
    const d = MV(mk, 'date'), M0 = MEET[mk], nm = M0.label;
    if (M0.before) { const a = MV(M0.before, 'date'); if (a) out.push({ when: addDays(a, -15), what: `${nm}最晚召開日（大會召開前15日）${d && daysBetween(d, addDays(a, -15)) < 0 ? '　⚠ 目前排定的日期太晚' : ''}`, kind: 'meet' }); }
    if (d) {
      if (!M0.same) out.push({ when: addDays(d, -M0.days), what: brdOnly(mk) ? `${nm}開會通知送達各理事、監事（會議前${M0.days}日）` : `${nm}開會通知單送達縣府備查（會議前${M0.days}日）`, kind: 'notice', bt: PRE });
      out.push({ when: d, what: `召開${nm}`, kind: 'day' });
      if (!M0.same && !brdOnly(mk)) out.push({ when: addDays(d, 30), what: `檢送${nm}紀錄公文送達縣府（會議後30日內）`, kind: 'letter', bt: POST });
    } else out.push({ when: '', what: `${nm}：請先填寫會議日期，系統會自動算出期限`, kind: 'none' });
    if (M0.el === 'chair') { const d2 = MV(mk, 'date'); if (d2) out.push({ when: addDays(d2, 15), what: '新任理事長就任後15日內完成移交接收（移交清冊連同立案證書、圖記；人民團體會務輔導辦法第18條）', kind: 'hand', bt: POST }); }
  }
  return out.sort((a, b) => (a.when || '9') < (b.when || '9') ? -1 : 1);
}
