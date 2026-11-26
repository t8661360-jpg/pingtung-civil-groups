/* ===== 會議定義 ===== */
const MEET = {
  'prep.p1': { scen: 'prep', kind: 'prep1', label: '發起人暨第一次籌備會', days: 7 },
  'prep.p2': { scen: 'prep', kind: 'prep2', label: '第二次籌備會', days: 7 },
  'found.asm': { scen: 'found', kind: 'foundAsm', label: '第一屆第一次成立會員大會', asm: true, days: 15, el: 'ds' },
  'found.brd': { scen: 'found', kind: 'foundBrd', label: '第一屆第一次理監事聯席會議', days: 7, el: 'chair', same: 'found.asm' },
  'renew.pre': { scen: 'renew', kind: 'pre', label: '選前理監事聯席會議', days: 7, before: 'renew.asm' },
  'renew.asm': { scen: 'renew', kind: 'asm', label: '會員大會（改選）', asm: true, days: 15, el: 'ds' },
  'renew.brd': { scen: 'renew', kind: 'postBrd', label: '選後第一次理監事聯席會議', days: 7, el: 'chair', same: 'renew.asm' },
  'annual.pre': { scen: 'annual', kind: 'pre', label: '大會前理監事聯席會議', days: 7, before: 'annual.asm' },
  'annual.asm': { scen: 'annual', kind: 'asm', label: '會員大會（常年）', asm: true, days: 15 },
  'board.brd': { scen: 'board', kind: 'brd', label: '理監事聯席會議', days: 7 },
  'dissolve.asm': { scen: 'dissolve', kind: 'dissolve', label: '會員大會（解散）', asm: true, days: 15 },
};
function M(mk) { let o = getp(S, 'm.' + mk); if (!o || typeof o !== 'object') { o = { props: null, motions: [], el: {} }; setp(S, 'm.' + mk, o); } return o; }
function MV(mk, f) { return V(`m.${mk}.${f}`); }
/** 單純的理事會、監事會、理監事聯席會（不是和大會同日接續召開的那一場） */
const brdOnly = mk => ['pre', 'brd'].includes(MEET[mk].kind);
const isNewTerm = mk => mk === 'renew.asm' || mk === 'renew.brd';
function mTerm(mk) { return MV(mk, 'term'); }
function mNo(mk) { return MV(mk, 'no'); }
function mTitle(mk) {
  const k = MEET[mk].kind, t = O(cn(mTerm(mk)), '○'), n = O(cn(mNo(mk)), '○');
  if (k === 'prep1') return '發起人暨第一次籌備會';
  if (k === 'prep2') return '第二次籌備會';
  if (k === 'foundAsm') return '第一屆第一次會員大會';
  if (k === 'foundBrd') return '第一屆第一次理監事聯席會議';
  if (k === 'pre' || k === 'brd' || k === 'postBrd') return `第${t}屆第${n}次理監事聯席會議`;
  return `第${t}屆第${n}次會員大會`;
}
function mDateLine(mk) { const d = MV(mk, 'date'); return `中華民國${rd(d)}${d ? `（${weekday(d)}）` : ''}${tm(MV(mk, 'time'))}`; }

/* 參與人數 */
function boardCount() { return names([...DIR_ROLES, ...SUP_ROLES]).length; }
const mStats = () => memberStats();

DER.push(
  [/^m\.([\w]+\.[\w]+)\.signName$/, m => signNameDef(m[1])],
  [/^m\.([\w]+\.[\w]+)\.term$/, m => { const mk = m[1]; if (MEET[mk].scen === 'found') return '1'; if (isNewTerm(mk)) return hasNum(S.org.term) ? String(num(S.org.term) + 1) : ''; return S.org.term; }],
  [/^m\.([\w]+\.[\w]+)\.no$/, m => { const mk = m[1]; if (MEET[mk].scen === 'found' || isNewTerm(mk)) return '1'; return ''; }],
  [/^m\.([\w]+\.[\w]+)\.kind2$/, () => '定期會'],
  [/^m\.([\w]+\.[\w]+)\.date$/, m => { const d = MEET[m[1]]; return d.same ? getp(S, `m.${d.same}.date`) : ''; }],
  [/^m\.([\w]+\.[\w]+)\.place$/, m => { const d = MEET[m[1]]; return (d.same && getp(S, `m.${d.same}.place`)) || V('org.place'); }],
  [/^m\.([\w]+\.[\w]+)\.chair$/, m => { const k = MEET[m[1]].kind; if (k === 'prep1' || k === 'prep2' || k === 'foundAsm' || k === 'foundBrd') return prepChair() || (k === 'foundBrd' ? chairName() : ''); return chairName(); }],
  [/^m\.([\w]+\.[\w]+)\.rec$/, m => MEET[m[1]].scen === 'prep' ? '' : pname('總幹事')],
  [/^m\.([\w]+\.[\w]+)\.should$/, m => { const d = MEET[m[1]]; if (d.asm) { const v = voterCount(); return v ? String(v) : String(S.org.memberCount ? num(S.org.memberCount) + num(S.org.groupCount) : ''); } if (d.scen === 'prep') { const n = names(PREP_ROLES).length; return n ? String(n) : ''; } const n = boardCount(); return n ? String(n) : ''; }],
  [/^m\.([\w]+\.[\w]+)\.absent$/, m => { const mk = m[1]; const s = MV(mk, 'should'), a = getp(S, `m.${mk}.attend`); if (!hasNum(s) || !hasNum(a)) return ''; return String(Math.max(0, num(s) - num(a) - num(getp(S, `m.${mk}.leave`)))); }],
  [/^m\.([\w]+\.[\w]+)\.dirNames$/, () => names(DIR_ROLES).join('、')],
  [/^m\.([\w]+\.[\w]+)\.supNames$/, () => names(SUP_ROLES).join('、')],
  [/^m\.([\w]+\.[\w]+)\.noticeDate$/, () => isoToday()],
  [/^m\.([\w]+\.[\w]+)\.letterDate$/, m => { const d = MV(m[1], 'date'); return d && daysBetween(isoToday(), d) > 0 ? '' : isoToday(); }],
  [/^m\.([\w]+\.[\w]+)\.report$/, m => defaultReport(m[1])],
  [/^m\.([\w]+\.[\w]+)\.topics$/, m => defaultTopics(m[1])],
  [/^m\.([\w]+\.[\w]+)\.subject$/, m => letterSubject(m[1])],
  [/^m\.([\w]+\.[\w]+)\.d1$/, m => letterD1(m[1])],
  [/^m\.([\w]+\.[\w]+)\.d2$/, m => letterD2(m[1])],
  [/^m\.([\w]+\.[\w]+)\.refTerm$/, m => { const d = MEET[m[1]]; const pre = Object.keys(MEET).find(k => MEET[k].before === m[1]); return pre ? mTerm(pre) : S.org.term; }],
  [/^m\.([\w]+\.[\w]+)\.refNo$/, m => { const pre = Object.keys(MEET).find(k => MEET[k].before === m[1]); return pre ? mNo(pre) : ''; }],
  [/^m\.([\w]+\.[\w]+)\.asOf$/, m => getp(S, `m.${m[1]}.date`)],
  [/^m\.([\w]+\.[\w]+)\.cnt(Person|Suspended|Sponsor)$/, m => { const s = mStats(); const v = { Person: s.person + s.group, Suspended: s.suspended, Sponsor: s.sponsor }[m[2]]; return s.total ? String(v) : ''; }],
  [/^m\.([\w]+\.[\w]+)\.el\.(dirSeats|supSeats|dirAlt|supAlt)$/, m => V('org.' + m[2])],
  [/^m\.([\w]+\.[\w]+)\.el\.chair$/, () => chairName()],
  [/^m\.([\w]+\.[\w]+)\.el\.stdSup$/, () => names(['常務監事']).join('、')],
  [/^m\.([\w]+\.[\w]+)\.el\.stdDirs$/, () => names(['常務理事']).join('、')],
  [/^m\.([\w]+\.[\w]+)\.props\.(\d+)\.(\w+)$/, m => propDefault(m[1], +m[2], m[3])],
);

/* ===== 提案範本（依縣府範本；年度、屆次、人名自動帶入） ===== */
function yrs() { return { y: O(Y(), '○○○'), by: O(BY(), '○○○') }; }
const PROP_TPL = {
  prep1: [
    { k: 'a1', grp: 'a', reason: () => '推選籌備委員，組織籌備會案。', desc: () => '由發起人互推選籌備委員七人以上，負責辦理籌備事宜。', res: () => { const ns = names(['籌備會主任委員', '籌備委員']); return ns.length ? `推選${ns.join('、')}等${ns.length}人為籌備委員。` : ''; } },
    { k: 'a2', grp: 'a', reason: () => '推選籌備會主任委員案。', desc: () => '由籌備委員互推一人為主任委員，負責召集會議，對外行文等事項。', res: () => prepChair() ? `推選${prepChair()}為籌備會主任委員。` : '' },
    { k: 'b1', grp: 'b', reason: () => '審查章程草案。', desc: () => '章程草案須由籌備會議審查後提大會通過。' },
    { k: 'b2', grp: 'b', reason: () => '決定籌備期間內聯絡地址及工作人員案。', desc: () => '籌備期間內擬擇定適當處所作為辦公及通訊聯絡使用，並聘請專任或義務工作人員（執行秘書一人、會計一人、秘書若干人），處理日常事務。', res: () => S.org.address ? `籌備期間聯絡地址設於${S.org.address}。` : '' },
    { k: 'b3', grp: 'b', reason: () => '決定會員入會申請手續、申請書格式，並公開徵求會員。', desc: () => '會員入會申請書格式如附件。' },
    { k: 'b4', grp: 'b', reason: () => '籌備期間經費之收繳及籌墊案。', desc: () => '籌備期間所需經費項目主要有印刷費（開會通知、紀錄、議程、出席證件、成立大會手冊、選票等之印製）、郵電費、會議費、成立大會會場佈置費、文具費等。' },
  ],
  prep2: [
    { k: 'c1', reason: () => '審定會員名冊案。', desc: () => '審定會員（會員代表）資格，以確定成立大會應出席人數。', res: () => { const v = voterCount(); return v ? `審定會員${v}人，為成立大會應出席人數。` : ''; } },
    { k: 'c2', reason: () => '確定成立大會召開日期、地點，並擬定成立大會手冊內容及討論案。', desc: () => '成立大會手冊內容目錄如下：\n1.大會議程。\n2.籌備工作及籌備期間經費收支報告（附報告書）。\n3.章程草案。\n4.年度工作計畫。\n5.年度經費收支預算表。\n6.會員名冊。\n7.其他：得視需要列入，如發起人名單、籌備委員名單、籌備會工作人員名單、成立大會工作人員名單、成立大會工作人員分工表、成立大會議事規則等。', res: () => { const d = getp(S, 'm.found.asm.date'); return d ? `成立大會訂於${rd(d)}${getp(S, 'm.found.asm.place') ? '假' + getp(S, 'm.found.asm.place') : ''}召開。` : ''; } },
    { k: 'c3', reason: () => '擬訂年度工作計畫及年度經費收支預算表。', desc: () => '擬訂後提成立大會審議。' },
    { k: 'c4', reason: () => '決定理監事選票格式案。', desc: () => '理監事選票格式由籌備會依規定擇定採用。', res: () => `採用第${cn(ballotType())}種選票格式。` },
    { k: 'c5', reason: () => '決定成立大會工作分工案。', desc: () => '成立大會工作分工得設總務組、議事組、選務組、報到組、接待組、秩序組、新聞組等各組，各組置組長一人，組員若干人。（組別得按實際需要增減）。' },
  ],
  foundAsm: [
    { k: 'st', reason: () => '通過本會章程草案，請討論。', proposer: () => '籌備委員會', desc: () => '章程條文，如大會手冊。', res: () => '經出席會員同意通過後，將章程四份報請主管機關核備。' },
    { k: 'pl', reason: () => `${yrs().by}年度工作計畫，請討論。`, proposer: () => '籌備委員會', desc: () => `${yrs().by}年度工作計畫，如大會手冊。`, res: () => '經出席會員同意通過。' },
    { k: 'bd', reason: () => `${yrs().by}年度經費收支預算表，請討論。`, proposer: () => '籌備委員會', desc: () => `${yrs().by}年度經費收支預算表，如大會手冊。`, res: () => '經出席會員同意通過。' },
  ],
  foundBrd: [
    { k: 'ad', reason: () => '請出席理事審核本會第一屆會址設立地點，請討論。', desc: () => `會址處所依規定不得少於卅平方公尺，並應取得准予使用一年以上之使用權證明（例如租約、借用同意書），本會會址設於「${S.org.address || '屏東縣○○鄉鎮市○○路○○號'}」。`, res: () => '照案通過，並將會址使用同意書報請主管機關備查。' },
    { k: 'sf', reason: () => '請出席理事審核本會第一屆總幹事、會計及出納，請討論。', proposer: () => '本會第一屆理事長', desc: () => `⒈依本會章程規定：「本會置總幹事一人，承理事長之命處理本會事務，其他工作人員若干人，由理事長提名經理事會通過聘免之，並報主管機關備查。前項工作人員不得由理事監事擔任。」\n⒉理事長提名${O(pname('總幹事'))}為第一屆總幹事、${O(pname('會計'))}為會計、${O(pname('出納'))}為出納。`, res: () => '照案通過，並造冊報請主管機關核備。' },
  ],
  preRenew: [
    { k: 'p1', reason: () => { const s = mStats(); return `審查本會會員會籍資格，正式會員共${s.total ? s.person + s.group : '○'}位、停權會員共${s.total ? s.suspended : '○'}位、贊助會員共${s.total ? s.sponsor : '○'}位，參閱會員名冊如附件。`; }, res: () => '照案通過。' },
    { k: 'p2', reason: () => `審查上年度決算案（${yrs().y}年度經費收支決算表、財產清冊、資產負債表），如附件。`, res: () => '照案通過。' },
    { k: 'p3', reason: () => `審查下年度工作計畫（${yrs().by}年度工作計畫），如附件。`, res: () => '照案通過。' },
    { k: 'p4', reason: () => `審查下年度預算案（${yrs().by}年度經費收支預算表），如附件。`, res: () => '照案通過。' },
    { k: 'p5', reason: () => '議決選票格式，依據人民團體選舉罷免辦法第七條規定之三種選票格式擇一採用。', res: () => `採用第${cn(ballotType())}種。` },
    { k: 'p6', reason: () => '議決參考名單產生方式（理事會推薦或公開徵求登記）。', res: () => refListRes() },
    { k: 'p7', reason: () => '議決有關大會手冊內容及印製工作。', res: () => '大會手冊內容納入：1.議程、2.理事會工作報告、3.監事會監察報告、4.上年度經費收支決算表、5.財產清冊、6.資產負債表、7.下年度工作計畫、8.下年度經費收支預算表、9.會員名冊(簡易欄位)、10.章程。' },
  ],
  asm: [
    { k: 'fin', reason: () => `請審議${yrs().y}年度經費收支決算案含財產目錄及資產負債表`, proposer: () => '理事會', desc: m => `${yrs().y}年度經費收支決算表、財產目錄及資產負債表業經第${O(cn(MV(m, 'refTerm')), '○')}屆第${O(cn(MV(m, 'refNo')), '○')}次理（監）事會審議通過。`, method: () => `${yrs().y}年度經費收支決算書經會員大會審議通過，報請主管機關核備後實施。`, res: () => '照案通過。' },
    { k: 'plan', reason: () => `請審議${yrs().by}年度工作計畫案`, proposer: () => '理事會', desc: m => `${yrs().by}年度工作計畫業經第${O(cn(MV(m, 'refTerm')), '○')}屆第${O(cn(MV(m, 'refNo')), '○')}次理（監）事會審議通過。`, method: () => `${yrs().by}年度工作計畫經會員大會審議通過，報請主管機關核備後實施。`, res: () => '照案通過。' },
    { k: 'bud', reason: () => `請審議${yrs().by}年度經費收支預算案`, proposer: () => '理事會', desc: m => `${yrs().by}年度經費收支預算書業經第${O(cn(MV(m, 'refTerm')), '○')}屆第${O(cn(MV(m, 'refNo')), '○')}次理（監）事會審議通過。`, method: () => `${yrs().by}年度經費收支預算書經會員大會審議通過，報請主管機關核備後實施。`, res: () => '照案通過。' },
  ],
  postBrd: [
    { k: 'ad', reason: () => '決定本會會址處所案。', desc: () => '取得使用權證明（例如租約、使用同意書）。', res: () => S.org.address ? `本會會址設於${S.org.address}，照案通過。` : '' },
    { k: 'sf', reason: () => '聘任本會總幹事等工作人員案。', desc: () => '工作人員不得由選任之職員擔任。', res: () => { const parts = []; for (const r of STAFF_ROLES) { const ns = names([r]); if (ns.length) parts.push(`${ns.join('、')}為${r}`); } return parts.length ? `聘任${parts.join('，')}，照案通過。` : ''; } },
  ],
  brd: [{ k: 'b1' }],
  addr: { k: 'addr', reason: () => '變更本會會址設立地點，請討論。', desc: () => `會址處所依規定不得少於卅平方公尺，並應取得准予使用一年以上之使用權證明（例如租約、借用同意書），本會會址設於「${newAddr() || '屏東縣○○鄉鎮市○○路○○號'}」。`, res: () => '照案通過，並將會址使用同意書報請主管機關備查。' },
  dissolve: [
    { k: 'd1', reason: () => '本會之解散及解散日期確定。（解散日期可與大會召開日期相異）', desc: () => '為確定本會解散日期及各項財務報表核算，如收支決算表、現金出納表、資產負債表、財產目錄、基金收支表等財務報表。', res: () => `經出席會員${O(S.x.report.agree, '○')}人同意本會解散，解散日期訂為${parseDate(dissolveDate()) ? rd(dissolveDate()) : '○○○年○月○日'}，並審議通過本會本年度（迄解散日止）之決算書表。` },
    { k: 'd2', reason: () => '本會相關剩餘財產之歸屬。', desc: () => S.x.report.propDesc || `本會至目前約有固定資產${propSum('') ? '計新台幣' + fmt(propSum('')) + '元（詳附件）' : '……等(詳附件)'}，財務存款計新台幣${fmt(num(S.x.report.cash) || cashEnd())}元，為討論財產歸屬，提請討論。`, res: () => `本會解散後的剩餘財產(含固定資產及現金)部分，將全數捐贈予${S.x.report.to || '屏東縣政府'}作為公益使用。` },
    { k: 'd3', reason: () => '本會解散之清算人。', desc: () => `本會解散訂日期為${parseDate(dissolveDate()) ? rd(dissolveDate()) : '○○○年○月○日'}，後續行政作業將由清算人辦理。`, res: () => `本會解散清算人為${O(liquidator())}(為理事長)。` },
    { k: 'd4', reason: () => '是否登報解散本會公告。', desc: () => `為求周延、慎重，擬請清算人${O(liquidator())}登報辦理本會之解散，並將本會解散報告及相關資料函報主管機關辦理。`, res: () => `照案通過，由${O(liquidator())}理事長辦理。` },
  ],
};
function propTplList(mk) {
  const d = MEET[mk];
  if (d.kind === 'pre') return d.scen === 'renew' ? PROP_TPL.preRenew : PROP_TPL.preRenew.filter(p => !['p5', 'p6'].includes(p.k));
  return PROP_TPL[d.kind] || [];
}
function findTpl(mk, key) { if (key === 'addr') return PROP_TPL.addr; return propTplList(mk).find(t => t.k === key); }
function propsOf(mk) {
  const m = M(mk);
  if (!Array.isArray(m.props)) m.props = propTplList(mk).map(t => ({ tpl: t.k, grp: t.grp || '' }));
  if (mk === 'board.brd') {
    /* 勾選「討論會址變更」時自動加入會址變更提案；取消勾選且未修改過時自動移除 */
    const i = m.props.findIndex(p => p.tpl === 'addr');
    const plain = p => ['reason', 'proposer', 'desc', 'method', 'res'].every(f => isBlank(p[f]));
    if (S.ui.boardAddr && i < 0) m.props.unshift({ tpl: 'addr', grp: '' });
    else if (!S.ui.boardAddr && i >= 0 && plain(m.props[i])) m.props.splice(i, 1);
    /* 空白的 b1 範本（未填任何內容）在會址變更會議中不需要 */
    const j = m.props.findIndex(p => p.tpl === 'b1');
    if (S.ui.boardAddr && j >= 0 && plain(m.props[j]) && m.props.length > 1) m.props.splice(j, 1);
    if (!S.ui.boardAddr && !m.props.length) m.props.push({ tpl: 'b1', grp: '' });
  }
  return m.props;
}
function propDefault(mk, i, f) {
  const p = propsOf(mk)[i]; if (!p || !p.tpl) return '';
  const t = findTpl(mk, p.tpl); if (!t || !t[f]) return '';
  return t[f](mk);
}
function PV(mk, i, f) { const p = propsOf(mk)[i] || {}; return !isBlank(p[f]) ? p[f] : propDefault(mk, i, f); }
function ballotType() { return S.x.ballot.type || '3'; }
function refListRes() {
  if ((S.x.ballot.refMode || '推薦') === '登記') return '採公開徵求登記。授權理事長指揮總幹事等會務工作人員執行公開徵求登記之工作，並於一週內完成，選票上參考名單之排序依據登記之先後順序，同時登記者以抽籤定之，理事與監事不得重複登記。並於登記完成後製作選票蓋用圖記後送監事會代表（常務監事）用印。';
  const el = M('renew.asm').el || {};
  const dn = (el.dirs || []).filter(c => !isBlank(c.name)).map(c => c.name), sn = (el.sups || []).filter(c => !isBlank(c.name)).map(c => c.name);
  return `由理事會推薦。下屆理事推薦名單如下：${dn.length ? dn.join('、') : '○○○、○○○…'}。下屆監事推薦名單如下：${sn.length ? sn.join('、') : '○○○…'}。並於會後完成後製作選票蓋用圖記後送監事會代表（常務監事）用印。`;
}
function newAddr() { return S.x.consent.loc || ''; }
function dissolveDate() { return S.x.report.date || getp(S, 'm.dissolve.asm.date') || ''; }
function liquidator() { return S.x.report.liq || chairName(); }

/* 開會通知書的議程（報告事項／重要討論事項） */
function defaultReport(mk) {
  const k = MEET[mk].kind;
  if (k === 'pre' || k === 'brd') return '上季收支報告、上季會員異動報告。';
  if (k === 'asm') return '理事會年度工作報告、監事會年度監查報告。';
  if (k === 'dissolve') return '討論本會解散情形。';
  if (k === 'foundAsm') return '籌備工作及籌備期間經費收支報告。';
  if (k === 'prep2') return '籌備工作進度報告。';
  return '';
}
function defaultTopics(mk) {
  const d = MEET[mk], ps = propsOf(mk);
  const list = ps.map((p, i) => PV(mk, i, 'reason')).filter(Boolean).map(s => s.replace(/(，請討論|，提請討論)?[。．.]?$/, ''));
  if (d.el === 'ds') list.push(d.scen === 'found' ? '選舉第一屆理事、監事' : `選舉第${O(cn(mTerm(mk)), '○')}屆理事、監事`);
  if (d.el === 'chair') list.unshift(`選舉${d.scen === 'found' ? '第一屆' : `第${O(cn(mTerm(mk)), '○')}屆`}常務理事、理事長及常務監事`);
  return list.map((s, i) => `${i + 1}.${s}。`).join('\n');
}

/* ===== 情境（選單）與文件清單 ===== */
const SCEN_ORDER = ['prep', 'found', 'renewPre', 'renew', 'annualPre', 'annual', 'board', 'dissolve', 'other'];
/* fam：沿用的會議家族（renew／annual），prev／next：前後步驟的選單 */
const SCEN = {
  prep: { title: '籌備會', sub: '籌組新團體：發起人會議、籌備會', icon: 'seed', meets: () => ['prep.' + (S.ui.prepVar || 'p1')] },
  found: { title: '成立大會', sub: '第1屆第1次會員大會＋理監事會', icon: 'flag', meets: () => ['found.asm', 'found.brd'], prev: 'prep' },
  renewPre: { title: '選前理監事會', sub: '改選大會前15日以前召開', icon: 'table', meets: () => ['renew.pre'], fam: 'renew', next: 'renew' },
  renew: { title: '會員大會－改選', sub: '改選理監事＋選後第一次理監事會', icon: 'vote', meets: () => ['renew.asm', 'renew.brd'], prev: 'renewPre' },
  annualPre: { title: '大會前理監事會', sub: '常年大會前15日以前召開', icon: 'table', meets: () => ['annual.pre'], fam: 'annual', next: 'annual' },
  annual: { title: '會員大會－常年', sub: '每年定期會員大會', icon: 'cal', meets: () => ['annual.asm'], prev: 'annualPre' },
  board: { title: '理監事會', sub: '定期會、臨時會、會址變更', icon: 'table', meets: () => ['board.brd'] },
  dissolve: { title: '會員大會－解散', sub: '解散、清算與財產歸屬', icon: 'close', meets: () => ['dissolve.asm'] },
  other: { title: '其他會務', sub: '圖記印鑑證明、辭職書、證書補發、解散報告表', icon: 'more', meets: () => [] },
};
const HOME_GROUPS = [['籌組與成立', ['prep', 'found']], ['改選年度', ['renewPre', 'renew']], ['每年常會', ['annualPre', 'annual']], ['其他會議與會務', ['board', 'dissolve', 'other']]];
const fam = sc => (SCEN[sc] && SCEN[sc].fam) || sc;
const mainMeet = sc => SCEN[sc].meets().find(mk => !MEET[mk].same) || SCEN[sc].meets()[0];

/* ===== 報送批次：① 會前（開會通知） ② 會後（會議紀錄送件） ===== */
const PRE = 'pre', POST = 'post';
const BATCH = {
  pre: { n: '①', t: '會前：開會通知', s: (d, sc) => scBrd(sc) ? `會議前${d}日送達各理事、監事` : `會議前${d}日送達縣府` },
  post: { n: '②', t: '會後：會議紀錄送件', s: (d, sc) => scBrd(sc) ? '紀錄自行留存，須報縣府的事項才送件' : '會議後30日內送達縣府' },
};
/** 這個選單的主要會議是不是單純的理監事會 */
function scBrd(sc) { const mk = sc && SCEN[sc] && SCEN[sc].meets()[0]; return !!mk && brdOnly(mk); }
const hasBatch = sc => SCEN[sc].meets().length > 0;
/** 目前選了哪些批次；沒選過時依開會日期判斷：日期已過＝會後，否則＝會前 */
function batchOn(sc) {
  if (!hasBatch(sc)) return { pre: false, post: true };
  const b = (S.batch || {})[sc];
  if (b && (b.pre || b.post)) return { pre: !!b.pre, post: !!b.post };
  const dt = MV(mainMeet(sc), 'date');
  return dt && daysBetween(isoToday(), dt) < 0 ? { pre: false, post: true } : { pre: true, post: false };
}
function batchAuto(sc) { const b = (S.batch || {})[sc]; return !(b && (b.pre || b.post)); }
function setBatch(sc, k, on) {
  const cur = batchOn(sc); cur[k] = on;
  if (!cur.pre && !cur.post) cur[k === PRE ? POST : PRE] = true;
  S.batch = S.batch || {}; S.batch[sc] = cur;
}
function batchLabel(sc) { const b = batchOn(sc); if (!hasBatch(sc)) return '全部文件'; return b.pre && b.post ? '會前及會後文件' : b.pre ? '開會通知' : '會議紀錄送件'; }

/* 會議資料（附件）：可以線上填寫，也可以上傳自己的檔案；上傳的檔案在各選單共用，並自動檢查 */
const MAT = { members: '會員名冊', fin: '財務報表', fin5: '財務報表', budget: '預算表', prepfin: '經費收支報告表', plan: '工作計畫', ledger: '收支報告', roster: '理監事名冊', statute: '章程', amend: '修正對照表' };
const MAT_KIND = { members: 'members', roster: 'roster', fin: 'fin', fin5: 'fin', budget: 'fin', prepfin: 'fin', ledger: 'fin', plan: 'doc', statute: 'doc', amend: 'doc' };
const docMode = x => (x && x.mat && (S.mode || {})[x.id]) || 'fill';
const isUp = x => !!(x && x.mat && docMode(x) === 'up');
/** 開會通知書「重要討論事項、報告事項」提到的附件 */
const NOTICE_KW = { members: /名冊|會籍/, fin: /決算|預算|財產|資產負債|現金出納|基金收支/, fin5: /財務報表|決算|財產|資產負債/, budget: /預算/, prepfin: /籌備.*(經費|收支)|收支報告/, plan: /工作計畫/, ledger: /收支報(告|表)/, roster: /理監事.*(名冊|一覽)/, statute: /章程/, amend: /章程修正|修改章程|修正章程/ };
function noticeRefs(mk) { const t = `${MV(mk, 'topics') || ''}\n${MV(mk, 'report') || ''}`; return new Set(Object.keys(NOTICE_KW).filter(k => NOTICE_KW[k].test(t))); }
function withMat(list) { return list.map(x => x.id && MAT[x.id] ? { ...x, mat: MAT_KIND[x.id], upk: 'mat:' + x.id, up: x.up || '自己的' + MAT[x.id] } : x); }
/* d(id, 名稱, 選項)：bt 批次、req 必備（該批次鎖定）、def 預設勾選、note 說明、kind:'attach' 只需另附不產生檔案、m 會議、b 產生函式 */
const G = (g, bt = POST, o = {}) => ({ g, bt, ...o });
const d = (id, name, o = {}) => ({ id, name, bt: POST, ...o });
const DAY = '開會當天使用（不必送府，勾選才產生）';
function scenDocs(sc) { return withMat(scenDocs0(sc)); }
function scenDocs0(sc) {
  const pv = S.ui.prepVar || 'p1';
  const F6 = '6項財務報表', d7 = '會議召開前7日送達縣府備查', d15 = '會議召開前15日送達縣府備查', d30 = '會議召開後30日內送達縣府備查', d7b = '會議召開前7日送達各理事、監事', dKeep = '理監事會紀錄閉會後自行留存；有依法令須報縣府的事項才檢送，不需要可取消勾選';
  const F6N = '預算表、決算表(含現金出納表)、財產目錄、資產負債表、基金收支表';
  const signPre = (id, name, mk, b) => d(id, name, { bt: PRE, def: 1, note: '開會前印出，供出席人員簽到', m: mk, b });
  /* 會後：簽到表改為選填，可上傳簽到後的照片或掃描檔一併檢附 */
  const signUp = (id, name) => d(id, name, { kind: 'attach', def: 1, up: '簽到後的簽到表', note: '可上傳簽名後的簽到表照片或掃描檔，下載時一併附上；也可以另外檢附紙本' });
  /* 會員大會手冊（hb）：會後必備；會前可勾選先印製發給會員 */
  const hbDocs = (bt, list) => list.map(x => ({ ...x, bt, hb: 1, ...(bt === PRE ? { req: 0, def: 0, note: x.preNote || '開會前印製，發給出席會員' } : {}) }));
  /* 會前：開會通知書寫「如附件」的資料，依通知書內容自動勾選 */
  const NA = (mk, list) => {
    const r = noticeRefs(mk), own = S.sel[sc] || {};
    return [G('開會通知檢附資料（通知書提到「如附件」的資料，可線上填寫或上傳）', PRE), ...list.map(x => ({ ...x, bt: PRE, req: 0, sk: 'pre:' + x.id, nm: mk, def: r.has(x.id) ? 1 : 0,
      note: r.has(x.id) ? (own['pre:' + x.id] === false ? '開會通知書有提到，建議一併檢附' : '開會通知書有提到，已自動勾選') : (x.preNote || '通知書沒有提到，需要時再勾選') }))];
  };
  const hbDay = (HB) => hbDocs(PRE, HB.filter(x => ['cover', 'agenda'].includes(x.id)));
  switch (sc) {
    case 'prep': { const mk = 'prep.' + pv; return [
      G('開會通知', PRE), d('notice', '開會通知書', { bt: PRE, req: 1, note: d7, m: mk, b: () => docNotice(mk) }),
      ...NA(mk, [d('statute', '組織章程（草案）', { b: docStatuteDraft }), d('members', '會員名冊', { b: () => docMembers('prep') }), d('prepfin', '籌備期間經費收支報告表', { b: docPrepFin })]),
      G(DAY, PRE, { sub: 1 }), signPre('sign', '簽到表', mk, () => docSignPrep(mk)),
      G('公文'), d('letter', '檢送會議紀錄公文', { req: 1, note: d30, m: mk, b: () => docLetter(mk) }),
      G('會議紀錄'), d('min', pv === 'p2' ? '第二次籌備會會議紀錄' : '發起人暨第一次籌備會會議紀錄', { req: 1, m: mk, b: () => docMinutes(mk) }), signUp('signUp', '簽到表（簽到後影本）'),
      G('其他檢附資料'), d('recruit', '徵求入會公告', { def: pv === 'p1', b: docRecruit }), d('applyP', '個人會員入會申請書', { def: pv === 'p1', b: docApplyP, note: '附身分證影本', up: '填好的申請書或身分證影本' }), d('applyG', '團體會員入會申請書', { b: docApplyG }),
      d('prepfin', '籌備期間經費收支報告表', { b: docPrepFin }), d('members', '會員名冊', { def: pv === 'p2', b: () => docMembers('prep') }), d('statute', '組織章程（草案）', { def: pv === 'p1', b: docStatuteDraft, note: '依縣府章程範本產生，可修改' }),
    ]; }
    case 'found': {
      const HB = [d('cover', '手冊封面', { def: 1, m: 'found.asm', b: () => docCover('found.asm') }), d('agenda', '成立大會議程', { def: 1, b: () => docAgenda('found') }), d('plan', '年度工作計畫', { req: 1, b: docPlan }),
        d('budget', '年度經費收支預算表', { req: 1, b: () => docFinance(['bud']) }), d('prepfin', '籌備期間經費收支報告表', { req: 1, b: docPrepFin }), d('statute', '組織章程', { req: 1, b: docStatuteDraft }), d('members', '會員名冊', { req: 1, b: () => docMembers('found') })];
      return [
        G('開會通知', PRE), d('notice', '開會通知書', { bt: PRE, req: 1, note: d15, m: 'found.asm', b: () => docNotice('found.asm') }),
        ...NA('found.asm', HB.filter(x => ['plan', 'budget', 'prepfin', 'statute', 'members'].includes(x.id))),
        G(DAY, PRE, { sub: 1 }), signPre('asmSign', '大會簽到表', 'found.asm', () => docSignAsm('found.asm')), signPre('brdSign', '理監事會簽到表', 'found.brd', () => docSignBrd('found.brd')),
        d('ballot', '選舉票', { bt: PRE, def: 1, note: '依選舉票格式印製，加蓋團體圖記', b: () => docBallot('found.asm') }), d('proxy', '委託書', { bt: PRE, b: () => docProxy('found.asm'), note: '隨開會通知寄給會員' }),
        ...hbDay(HB),
        G('公文'), d('letter', '檢送會議紀錄公文（申請立案）', { req: 1, note: d30, m: 'found.asm', b: () => docLetter('found.asm') }),
        G('會議紀錄'), d('asmMin', '第1屆第1次成立會員大會紀錄', { req: 1, note: '選舉理事、監事', m: 'found.asm', b: () => docMinutes('found.asm') }), signUp('asmSignUp', '大會簽到表（簽到後影本）'),
        d('brdMin', '第1屆第1次理監事會紀錄', { req: 1, note: '選舉常務理事、理事長、常務監事', m: 'found.brd', b: () => docMinutes('found.brd') }), signUp('brdSignUp', '理監事會簽到表（簽到後影本）'),
        G('會員大會手冊'), ...hbDocs(POST, HB),
        G('其他檢附資料'), d('handover', '移交清冊', { def: 1, b: () => docHandover('found'), note: '新任理事長選出後15日內移交' }), d('roster', '理監事暨會務人員一覽表', { req: 1, b: () => docRoster('found'), note: '一式三份，二份送府、一份自存' }),
        d('cert', '申請理事長當選證明書', { req: 1, b: docCert, note: '檢附當選人身分證正反面影本1份，2吋大頭照2張', up: '身分證影本、照片' }), d('consent', '會址使用同意書', { req: 1, b: docConsent, note: '需檢附使用權狀或近期繳稅單影本', up: '權狀或稅單影本' }),
      ];
    }
    case 'renewPre': case 'annualPre': {
      const mk = sc === 'renewPre' ? 'renew.pre' : 'annual.pre', rn = sc === 'renewPre', A = rn ? 'renew' : 'annual';
      return [
        G('開會通知', PRE), d('notice', '開會通知書', { bt: PRE, req: 1, note: d7b, m: mk, b: () => docNotice(mk) }),
        ...NA(mk, [d('members', '會員名冊', { b: () => docMembers(A) }), d('fin', F6, { b: () => docFinance(['bud', 'act', 'prop', 'bs', 'fund']) }), d('plan', '年度工作計畫', { b: docPlan }), d('ledger', '經費收支報告', { b: docLedger })]),
        G(DAY, PRE, { sub: 1 }), signPre('sign', '理監事會簽到表', mk, () => docSignBrd(mk)),
        G('公文'), d('letter', '檢送會議紀錄公文', { def: 1, note: dKeep, m: mk, b: () => docLetter(mk) }),
        G('會議紀錄'), d('min', '理監事會會議紀錄', { req: 1, note: rn ? '會員大會改選會議前15日，召開選前理監事會' : '會員大會召開前15日，開大會前理監事會', m: mk, b: () => docMinutes(mk) }),
        signUp('signUp', '理監事會簽到表（簽到後影本）'),
        G('隨函檢附（大會手冊內容，經本次會議審查）'),
        d('plan', '年度工作計畫', { def: 1, b: docPlan }), d('fin', F6, { def: 1, b: () => docFinance(['bud', 'act', 'prop', 'bs', 'fund']), note: F6N }),
        d('members', '會員名冊', { def: 1, b: () => docMembers(A), note: '審查會員會籍資格用' }), d('ledger', '經費收支報告', { b: docLedger }), d('agenda', '會員大會議程', { b: () => docAgenda(A) }),
        ...(rn ? [d('ballot', '選舉票（樣張）', { def: 1, b: () => docBallot('renew.asm'), note: '議決選票格式後檢附樣張' })] : []),
      ];
    }
    case 'renew': {
      const HB = [d('cover', '手冊封面', { def: 1, m: 'renew.asm', b: () => docCover('renew.asm') }), d('agenda', '會議議程', { def: 1, b: () => docAgenda('renew') }), d('plan', '年度工作計畫', { req: 1, b: docPlan }),
        d('fin', F6, { req: 1, b: () => docFinance(['bud', 'act', 'prop', 'bs', 'fund']), note: F6N }), d('ledger', '經費收支報告', { def: 1, b: docLedger }),
        d('members', '會員名冊', { req: 1, b: () => docMembers('renew') })];
      return [
        G('開會通知', PRE), d('notice', '開會通知書', { bt: PRE, req: 1, note: d15, m: 'renew.asm', b: () => docNotice('renew.asm') }),
        ...NA('renew.asm', HB.filter(x => ['fin', 'plan', 'ledger', 'members'].includes(x.id))),
        G(DAY, PRE, { sub: 1 }), signPre('asmSign', '大會簽到表', 'renew.asm', () => docSignAsm('renew.asm')), signPre('brdSign', '選後理監事會簽到表', 'renew.brd', () => docSignBrd('renew.brd')),
        d('ballot', '選舉及罷免票', { bt: PRE, def: 1, note: '依選前理監事會議決的格式印製，加蓋團體圖記', b: () => docBallot('renew.asm') }), d('proxy', '委託書', { bt: PRE, b: () => docProxy('renew.asm'), note: '隨開會通知寄給會員' }),
        ...hbDay(HB),
        G('公文'), d('letter', '檢送會議紀錄公文', { req: 1, note: d30, m: 'renew.asm', b: () => docLetter('renew.asm') }),
        G('會議紀錄'), d('asmMin', '會員大會會議紀錄', { req: 1, note: '改選理事、監事', m: 'renew.asm', b: () => docMinutes('renew.asm') }), signUp('asmSignUp', '大會簽到表（簽到後影本）'),
        d('brdMin', '理監事會會議紀錄（選後）', { req: 1, note: '選舉常務理事、理事長、常務監事', m: 'renew.brd', b: () => docMinutes('renew.brd') }), signUp('brdSignUp', '理監事會簽到表（選後，簽到後影本）'),
        G('會員大會手冊'), ...hbDocs(POST, HB), d('charter', '組織章程（現行）', { req: 1, hb: 1, kind: 'attach', note: '請附貴會現行章程', up: '現行章程', upk: 'charter' }),
        G('其他檢附資料'), d('handover', '移交清冊', { def: 1, b: () => docHandover('renew'), note: '理事長連任或未更換時免附；新任理事長選出後15日內移交' }), d('roster', '理監事暨會務人員一覽表', { req: 1, b: () => docRoster('renew'), note: '一式三份，二份送府、一份自存' }),
        d('cert', '申請理事長當選證明書', { def: 1, b: docCert, note: '檢附當選人身分證正反面影本1份，2吋大頭照2張', up: '身分證影本、照片' }), d('consent', '會址使用同意書', { def: 1, b: docConsent, note: '需檢附使用權狀或近期繳稅單影本', up: '權狀或稅單影本' }),
        d('ballot', '選舉及罷免票（樣張）', { b: () => docBallot('renew.asm') }), d('amend', '組織章程修正對照表', { b: () => docAmend('renew'), note: '需檢附新舊章程各2份', up: '新舊章程' }),
      ];
    }
    case 'annual': {
      const HB = [d('cover', '手冊封面', { def: 1, m: 'annual.asm', b: () => docCover('annual.asm') }), d('agenda', '會議議程', { def: 1, b: () => docAgenda('annual') }), d('plan', '年度工作計畫', { req: 1, b: docPlan }),
        d('fin', F6, { req: 1, b: () => docFinance(['bud', 'act', 'prop', 'bs', 'fund']), note: F6N }), d('ledger', '經費收支報告', { def: 1, b: docLedger }),
        d('roster', '理監事暨會務人員一覽表', { req: 1, b: () => docRoster('annual') }), d('members', '會員名冊', { req: 1, b: () => docMembers('annual') })];
      return [
        G('開會通知', PRE), d('notice', '開會通知書', { bt: PRE, req: 1, note: d15, m: 'annual.asm', b: () => docNotice('annual.asm') }),
        ...NA('annual.asm', HB.filter(x => ['fin', 'plan', 'ledger', 'roster', 'members'].includes(x.id))),
        G(DAY, PRE, { sub: 1 }), signPre('asmSign', '大會簽到表', 'annual.asm', () => docSignAsm('annual.asm')), d('proxy', '委託書', { bt: PRE, b: () => docProxy('annual.asm'), note: '隨開會通知寄給會員' }),
        ...hbDay(HB),
        G('公文'), d('letter', '檢送會議紀錄公文', { req: 1, note: d30, m: 'annual.asm', b: () => docLetter('annual.asm') }),
        G('會議紀錄'), d('asmMin', '會員大會會議紀錄', { req: 1, m: 'annual.asm', b: () => docMinutes('annual.asm') }), signUp('asmSignUp', '大會簽到表（簽到後影本）'),
        G('會員大會手冊'), ...hbDocs(POST, HB), d('charter', '組織章程（現行）', { req: 1, hb: 1, kind: 'attach', note: '請附貴會現行章程', up: '現行章程', upk: 'charter' }),
        G('其他檢附資料'), d('amend', '組織章程修正對照表', { b: () => docAmend('annual'), note: '需檢附新舊章程各2份', up: '新舊章程' }),
      ];
    }
    case 'board': { const ad = !!S.ui.boardAddr; return [
      G('開會通知', PRE), d('notice', '開會通知書', { bt: PRE, req: 1, note: d7b, m: 'board.brd', b: () => docNotice('board.brd') }),
      ...NA('board.brd', [d('ledger', '經費收支報告', { b: docLedger }), d('members', '會員名冊（新入會名單）', { b: () => docMembers('board') }), d('plan', '年度工作計畫', { b: docPlan }), d('fin', F6, { b: () => docFinance(['bud', 'act', 'prop', 'bs', 'fund']) })]),
      G(DAY, PRE, { sub: 1 }), signPre('sign', '簽到表', 'board.brd', () => docSignBrd('board.brd')),
      G('公文'), d('letter', '檢送會議紀錄公文', { def: 1, note: dKeep, m: 'board.brd', b: () => docLetter('board.brd') }),
      ...(ad ? [d('addrLetter', '檢送會址變更公文', { req: 1, note: '會址變更經理監事會決議後，檢附會議紀錄與會址使用同意書報縣府備查', b: docAddrLetter })] : []),
      G('會議紀錄'), d('min', ad ? '討論會址變更會議紀錄' : '理監事會會議紀錄', { req: 1, note: ad ? '討論會址變更' : '定期會、臨時會', m: 'board.brd', b: () => docMinutes('board.brd') }), signUp('signUp', '簽到表（簽到後影本）'),
      G('其他檢附資料'), d('ledger', '經費收支報告', { def: 1, b: docLedger, note: '當季收支報表' }), d('plan', '年度工作計畫', { b: docPlan }), d('fin', F6, { b: () => docFinance(['bud', 'act', 'prop', 'bs', 'fund']) }),
      d('consent', '會址使用同意書', { req: ad ? 1 : 0, b: docConsent, note: '需檢附使用權狀或近期繳稅單影本', up: '權狀或稅單影本' }),
    ]; }
    case 'dissolve': return [
      G('開會通知', PRE), d('notice', '開會通知書', { bt: PRE, req: 1, note: d15, m: 'dissolve.asm', b: () => docNotice('dissolve.asm') }),
      ...NA('dissolve.asm', [d('fin5', '5項財務報表', { b: () => docFinance(['act', 'prop', 'bs', 'fund']) }), d('members', '會員名冊', { b: () => docMembers('dissolve') }), d('roster', '理監事暨會務人員一覽表', { b: () => docRoster('dissolve') })]),
      G(DAY, PRE, { sub: 1 }), signPre('sign', '大會簽到表', 'dissolve.asm', () => docSignAsm('dissolve.asm')), d('proxy', '委託書', { bt: PRE, b: () => docProxy('dissolve.asm'), note: '隨開會通知寄給會員' }),
      G('公文'), d('letter', '檢送會議紀錄公文', { req: 1, note: d30, m: 'dissolve.asm', b: () => docLetter('dissolve.asm') }),
      G('會議紀錄'), d('min', '會員大會會議紀錄', { req: 1, note: '範例格式及提案請勿刪減', m: 'dissolve.asm', b: () => docMinutes('dissolve.asm') }), signUp('signUp', '大會簽到表（簽到後影本）'),
      G('其他資料'), d('fin5', '5項財務報表', { req: 1, b: () => docFinance(['act', 'prop', 'bs', 'fund']), note: '決算表(含現金出納表)、財產目錄、資產負債表、基金收支表；截止日期與解散日期一致' }),
      d('charter', '組織章程（現行）', { req: 1, kind: 'attach', note: '請附貴會現行章程', up: '現行章程', upk: 'charter' }), d('roster', '理監事暨會務人員一覽表', { req: 1, b: () => docRoster('dissolve') }), d('members', '會員名冊', { req: 1, b: () => docMembers('dissolve') }),
      d('report', '解散報告書', { req: 1, b: docDissolveReport }),
      d('cert0', '原核發之立案證書、圖記、理事長當選證明書', { req: 1, kind: 'attach', note: '繳銷（正本請另外送交）' }), d('rest', '剩餘財產歸屬資料、捐款收據或財產轉移清冊', { kind: 'attach', note: '由清算人造冊簽名或核章', up: '財產歸屬資料' }),
    ];
    case 'other': return [
      G('其他會務辦理'), d('seal', '人民團體圖記印鑑證明書', { b: docSeal }), d('report', '申請解散報告表', { b: docDissolveReport }), d('resign', '辭職書', { b: docResign }), d('reissue', '人民團體立案證書補發申請書', { b: docReissue }),
    ];
  }
  return [];
}
/** 目前批次下的文件（同一份文件若兩批都有，以會後版本為準，排在會後位置） */
function docsOf(sc) {
  const on = batchOn(sc), m = new Map();
  for (const x of scenDocs(sc)) if (x.id && on[x.bt]) {
    const prev = m.get(x.id); m.delete(x.id);
    /* 會前、會後都要的同一份資料：會前會後一起下載時合併成一列，勾選狀態取聯集 */
    m.set(x.id, prev && prev.sk && prev.sk !== selKey(x) ? { ...x, alt: { sk: prev.sk, def: prev.def } } : x);
  }
  return [...m.values()];
}
/** 勾選狀態的鍵：會前「開會通知檢附資料」與會後檢附資料分開記錄 */
const selKey = x => x.sk || x.id;
function selOne(sc, k, def) { const v = (S.sel[sc] || {})[k]; return v == null ? !!def : !!v; }
function setSel(sc, x, on) { S.sel[sc] = S.sel[sc] || {}; S.sel[sc][selKey(x)] = !!on; if (x.alt) S.sel[sc][x.alt.sk] = !!on; }
/** 開會通知書要附上的資料（會前批次中勾選的） */
function noticeAtt(mk, sc = S.ui.scen) { return scenDocs(sc).filter(x => x.nm === mk && x.bt === PRE && isSel(sc, x)); }
/** 選單中全部（不分批次）的文件數，首頁用 */
function allDocCount(sc) { return new Set(scenDocs(sc).filter(x => x.id && x.kind !== 'attach').map(x => x.id)).size; }
function isSel(sc, x) { if (x.req) return true; return selOne(sc, selKey(x), x.def) || (!!x.alt && selOne(sc, x.alt.sk, x.alt.def)); }
function selDocs(sc) { return docsOf(sc).filter(x => isSel(sc, x)); }
