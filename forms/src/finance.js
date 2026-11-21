/* ===== 財務（沿用 v1，6項財務報表） ===== */
function finEndMD() { const d = parseDate(S.fin.end); return d ? `${pad2(d.m)}月${pad2(d.d)}日` : '12月31日'; }
/* ===== 會計科目 ===== */
const ACC = [
  { k: 'inc', name: '收入總計', kids: [
    { k: 'i1', name: '入會費' }, { k: 'i2', name: '常年會費' }, { k: 'i3', name: '事業費' }, { k: 'i4', name: '會員捐款' },
    { k: 'i5', name: '補助收入', kids: [{ k: 'i51', name: '政府補助收入' }, { k: 'i52', name: '其他補助收入' }] },
    { k: 'i6', name: '委託收益' }, { k: 'i7', name: '會員服務收入' }, { k: 'i8', name: '專案計劃收入' }, { k: 'i9', name: '其他收入' }] },
  { k: 'exp', name: '支出總計', kids: [
    { k: 'e1', name: '人事費', kids: ['員工薪給', '兼職人員車馬費', '保險補助費', '年終成績考核獎金', '不休假獎金', '其他人事費'].map((n, i) => ({ k: 'e1_' + (i + 1), name: n })) },
    { k: 'e2', name: '辦公費', kids: ['文具、書報、雜誌費', '印刷費', '水電燃料費', '旅運費', '郵電費', '大樓管理費', '加班值班費', '租賦費', '修繕維護費', '財產保險費', '公共關係費', '人事查核費', '其他辦公費'].map((n, i) => ({ k: 'e2_' + (i + 1), name: n })) },
    { k: 'e3', name: '業務費', kids: ['會議費', '聯誼活動費', '業務推展費', '展覽費', '考察觀摩費', '會刊（訊）編印費', '調查統計費', '接受委託業務費', '內部作業組織業務費', '研究發展費', '社會服務費', '其他業務費'].map((n, i) => ({ k: 'e3_' + (i + 1), name: n })) },
    ...['購置費', '折舊', '繳納上級團體會費', '繳納其他團體會費', '捐助費', '專案計畫支出', '雜費支出', '預備金', '提撥基金'].map((n, i) => ({ k: 'e' + (i + 4), name: n }))] }
];
const ACC_FLAT = []; (function walk(list, lvl, parent) { list.forEach((a, i) => { a.lvl = lvl; a.idx = i + 1; a.parent = parent; ACC_FLAT.push(a); if (a.kids) walk(a.kids, lvl + 1, a); }); })(ACC, 0, null);
const ACC_BY = Object.fromEntries(ACC_FLAT.map(a => [a.k, a]));
const accName = a => (!isBlank(S.fin.names[a.k]) ? S.fin.names[a.k] : a.name);
function accVal(a, col) { if (a.kids) return a.kids.reduce((s, c) => s + accVal(c, col), 0); return num((S.fin.v[a.k] || {})[col]); }
function accZero(a) { return ['b', 'pb', 'a'].every(c => accVal(a, c) === 0); }
const finSurplus = col => accVal(ACC_BY.inc, col) - accVal(ACC_BY.exp, col);

/* 財產目錄 → 資產負債表 */
const BS_LEFT = [
  { k: 'L_cur', name: '流動資產小計', kids: ['庫存現金', '銀行存款', '定期存款', '有價證券', '應收票據', '應收款項', '預付款項'] },
  { k: 'L_fix', name: '固定資產小計', kids: ['土地', '房屋及建築', '事務器械設備', '儀器設備', '交通運輸設備', '雜項設備'] },
  { k: 'L_oth', name: '其他資產小計', kids: ['基金', '存出保證金', '雜項資產'] },
];
const BS_RIGHT_L = [
  { k: 'R_cur', name: '流動負債小計', kids: ['短期借款', '應付票據', '應付款項', '代收款項', '預收款項'] },
  { k: 'R_long', name: '長期負債小計', kids: ['長期借款'] },
  { k: 'R_oth', name: '其他負債小計', kids: ['存入保證金', '雜項負債'] },
];
const BS_RIGHT_E = [
  { k: 'R_cap', name: '投入資本小計', kids: ['投入資本'] },
  { k: 'R_fund', name: '基金小計', kids: ['資產基金', '提撥基金'] },
  { k: 'R_sur', name: '累計餘絀小計', kids: ['本期餘絀', '上期餘絀'] },
];
const PROP_CATS = ['土地', '房屋及建築', '事務器械設備', '儀器設備', '交通運輸設備', '雜項設備', '雜項資產'];
function propSum(cat) { let cur = ''; let s = 0; for (const r of S.fin.prop) { if (!isBlank(r.cat)) cur = r.cat.trim(); if (!cat || cur === cat) s += num(r.amt); } return s; }
function fundIn() { return num(S.fin.fund.acc) + num(S.fin.fund.int) + (hasNum(S.fin.fund.add) ? num(S.fin.fund.add) : accVal(ACC_BY.e12, 'a')); }
function fundOut() { return num(S.fin.fund.o1) + num(S.fin.fund.o2) + num(S.fin.fund.o3) + num(S.fin.fund.o4); }
function bsDerived(name) {
  if (['土地', '房屋及建築', '事務器械設備', '儀器設備', '交通運輸設備', '雜項設備', '雜項資產'].includes(name)) { const s = propSum(name); return s ? s : null; }
  if (name === '基金' || name === '提撥基金') { const s = fundIn() - fundOut(); return s ? s : null; }
  if (name === '本期餘絀') return finSurplus('a');
  if (name === '上期餘絀') return hasNum(S.fin.prev) ? num(S.fin.prev) : null;
  if (name === '資產基金') { const s = bsGroupSum(BS_LEFT[1]) + bsVal('雜項資產') + bsVal('存出保證金'); return s ? s : null; }
  return null;
}
function bsVal(name) { const raw = S.fin.bs[name]; if (hasNum(raw)) return num(raw); const d = bsDerived(name); return d == null ? 0 : d; }
function bsGroupSum(g) { return g.kids.reduce((s, n) => s + bsVal(n), 0); }
const bsAssets = () => BS_LEFT.reduce((s, g) => s + bsGroupSum(g), 0);
const bsLiab = () => BS_RIGHT_L.reduce((s, g) => s + bsGroupSum(g), 0);
const bsEquity = () => BS_RIGHT_E.reduce((s, g) => s + bsGroupSum(g), 0);
function cashPrev() { return hasNum(S.fin.cashPrev) ? num(S.fin.cashPrev) : num(S.fin.prev); }
function cashEnd() { return cashPrev() + accVal(ACC_BY.inc, 'a') - accVal(ACC_BY.exp, 'a'); }

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
    ...finHeader('收支決算表及現金出納表', `中華民國${BL(y)}年01月01日至${BL(y)}年${finEndMD()}止`),
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
    ...finHeader('財　產　目　錄', `中華民國${BL(y)}年${finEndMD()}`),
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
    ...finHeader('資　產　負　債　表', `中華民國${BL(y)}年${finEndMD()}`),
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
    ...finHeader('基　金　收　支　表', `中華民國${BL(y)}年1月1日至${BL(y)}年${finEndMD()}止`),
    T(rows, { size: 11 }),
    P(sigLine([['製表：', ''], ['出納：', pname('出納')], ['會計：', pname('會計')], ['總幹事：', pname('總幹事')], ['團體負責人：', pname('理事長')]]), { before: 8, size: 11 }),
    P('說明：', { size: 10, before: 4 }),
    ...(notes.length ? notes : ['（動支基金應註明理事會通過之屆次與主管機關核備之文號）']).map((t, i) => P(t, { size: 10, indent: 1 })),
    P(`${notes.length + 1}.各基金收支結存應與收支決算表及資產負債表相關科目金額一致。`, { size: 10, indent: 1 }),
    P(`${notes.length + 2}.本表須經製表、出納、會計、總幹事、團體負責人蓋章。`, { size: 10, indent: 1 }),
  ] };
}
