/* ===== 文件 → 需要填寫的區塊 ===== */
function docSecs(x) {
  const s = [];
  if (x.kind === 'attach' || isUp(x)) return s;
  if (x.m) { s.push('people', 'm:' + x.m); if (MEET[x.m].asm && /sign|Sign|notice/.test(x.id)) s.push('members'); }
  const map = { cover: ['m:' + (fam(S.ui.scen) + '.asm')], agenda: [], plan: ['plan'], fin: ['fin'], fin5: ['fin'], budget: ['fin'], ledger: ['ledger'], prepfin: ['prepfin', 'people'], members: ['members'], statute: ['statute'],
    recruit: ['recruit', 'people'], handover: ['handover', 'people'], roster: ['people', 'members'], cert: ['cert', 'people'], consent: ['consent'], proxy: ['proxy'], ballot: ['ballot', 'm:' + fam(S.ui.scen) + '.asm'],
    amend: ['amend'], addrLetter: ['consent', 'm:board.brd'], report: ['report', 'fin'], seal: ['seal'], resign: ['resign'], reissue: ['reissue'] };
  if (S.ui.scen === 'found' && x.id === 'cover') return ['m:found.asm'];
  (map[x.id] || []).forEach(k => s.push(k));
  return s;
}
/** 附註欄提示：會自動列出哪些附件 */
function noticeNoteHint(mk) {
  const att = noticeAtt(mk).map(x => x.name);
  return att.length ? `通知書會自動加上「附件：${att.join('、')}」（附註裡寫了「附件」或「檢附」就不另外加）` : '在「選文件」勾選開會通知檢附資料後，通知書附註會自動列出附件';
}
const SEC_ORDER = ['org', 'people', 'members', 'm', 'plan', 'fin', 'ledger', 'prepfin', 'statute', 'amend', 'handover', 'cert', 'consent', 'ballot', 'proxy', 'recruit', 'report', 'seal', 'resign', 'reissue'];
function sectionsFor(sc) {
  const set = new Set(['org']);
  selDocs(sc).forEach(x => docSecs(x).forEach(k => set.add(k)));
  if (sc === 'dissolve') set.add('report');
  const meets = SCEN[sc].meets().map(mk => 'm:' + mk).filter(k => set.has(k));
  const out = [];
  for (const k of SEC_ORDER) { if (k === 'm') out.push(...meets); else if (set.has(k)) out.push(k); }
  return out;
}
function docsUsing(sc, sec) { return selDocs(sc).filter(x => x.kind !== 'attach' && !isUp(x) && (sec === 'org' || docSecs(x).includes(sec))); }

/* ===== 區塊標題、圖示、完成度 ===== */
function secMeta(k) {
  if (k.startsWith('m:')) { const mk = k.slice(2); return { t: MEET[mk].label, i: 'meet' }; }
  return ({ org: { t: '團體基本資料', i: 'org' }, people: { t: S.ui.scen === 'prep' ? '籌備會成員與人員' : '理監事與會務人員', i: 'people' }, members: { t: '會員名冊', i: 'list' }, plan: { t: '年度工作計畫', i: 'cal' }, fin: { t: '財務報表', i: 'money' },
    ledger: { t: '經費收支報告', i: 'money' }, prepfin: { t: '籌備期間經費', i: 'money' }, statute: { t: '組織章程內容', i: 'book' }, amend: { t: '章程修正條文', i: 'pen' }, handover: { t: '移交清冊', i: 'key' }, cert: { t: '理事長當選證明', i: 'doc' },
    consent: { t: '會址使用同意書', i: 'org' }, ballot: { t: '選舉票', i: 'vote2' }, proxy: { t: '委託書', i: 'doc' }, recruit: { t: '徵求入會公告', i: 'doc' }, report: { t: '解散相關資料', i: 'close' }, seal: { t: '圖記印鑑證明', i: 'doc' }, resign: { t: '辭職書', i: 'pen' }, reissue: { t: '立案證書補發', i: 'doc' } })[k] || { t: k, i: 'doc' };
}
function secReq(k) {
  const sc = S.ui.scen;
  if (k === 'org') return ['org.name', 'org.address', 'org.phone', ...(sc !== 'prep' && sc !== 'found' && sc !== 'other' ? ['org.term'] : [])];
  if (k === 'people') return [sc === 'prep' ? '@prep' : '@chair'];
  if (k === 'members') return ['@members'];
  if (k.startsWith('m:')) { const mk = k.slice(2), d = MEET[mk], post = batchOn(sc).post; const r = [`m.${mk}.date`, `m.${mk}.time`, `m.${mk}.place`]; if (!['found', 'prep'].includes(d.scen) && !isNewTerm(mk)) r.push(`m.${mk}.no`); if (post) { r.push(`m.${mk}.chair`); if (d.asm) r.push(`m.${mk}.attend`); if (d.el === 'ds') r.push('@el:' + mk); } return r; }
  if (k === 'plan') return ['@plan'];
  if (k === 'fin') return ['@fin'];
  if (k === 'ledger') return ['@ledger'];
  if (k === 'consent') return ['x.consent.loc', 'x.consent.from', 'x.consent.lender'];
  if (k === 'cert') return ['x.cert.name', 'x.cert.birthplace', 'x.cert.birth'];
  if (k === 'statute') return ['statute.purpose', 'statute.tasks'];
  if (k === 'amend') return ['@amend'];
  if (k === 'report') return ['x.report.reason', 'x.report.agree'];
  if (k === 'recruit') return ['x.recruit.deadline'];
  if (k === 'resign') return ['x.resign.name', 'x.resign.pos'];
  if (k === 'reissue') return ['x.reissue.idno'];
  if (k === 'seal') return ['x.seal.use'];
  return [];
}
function reqOk(p) {
  if (p === '@prep') return names(PREP_ROLES).length > 0;
  if (p === '@chair') return !!chairName();
  if (p === '@members') return membersNamed().length > 0;
  if (p === '@plan') return S.plan.rows.some(r => !isBlank(r.desc) || !isBlank(r.item));
  if (p === '@fin') return accVal(ACC_BY.inc, 'b') + accVal(ACC_BY.exp, 'b') + accVal(ACC_BY.inc, 'a') > 0;
  if (p === '@ledger') return (S.x.ledger.rows || []).some(r => hasNum(r.inc) || hasNum(r.exp));
  if (p === '@amend') return (S.amend.rows || []).some(r => !isBlank(r.rev));
  if (p.startsWith('@el:')) { const el = M(p.slice(4)).el || {}; return (el.dirs || []).some(c => !isBlank(c.name)) || names(DIR_ROLES).length > 0; }
  return !isBlank(V(p));
}
const REQ_LABEL = { '@prep': '籌備會成員', '@chair': '理事長', '@members': '會員名冊', '@plan': '工作項目', '@fin': '財務數字', '@ledger': '收支明細', '@amend': '修正條文' };
function reqLabel(p) {
  if (REQ_LABEL[p]) return REQ_LABEL[p];
  if (p.startsWith('@el:')) return '選舉候選人';
  const f = p.split('.').pop();
  return ({ name: '名稱', address: '會址', phone: '電話', term: '屆別', date: '日期', time: '時間', place: '地點', chair: '主席', attend: '出席人數', no: '會次', loc: '房屋座落', from: '起始日期', lender: '出借人', birthplace: '出生地', birth: '出生日期', purpose: '宗旨', tasks: '任務', reason: '原因', agree: '同意人數', deadline: '截止日期', pos: '職稱', idno: '身分證字號', use: '用途' })[f] || f;
}
function secDone(k) { const r = secReq(k); const ok = r.filter(reqOk).length; return { ok, total: r.length, done: ok === r.length, missing: r.filter(p => !reqOk(p)).map(reqLabel) }; }
function docMissing(sc, x) {
  if (isUp(x)) return upList(sc, x).length ? [] : ['上傳的檔案'];
  const ks = ['org', ...docSecs(x)];
  const miss = [];
  ks.forEach(k => secDone(k).missing.forEach(l => { const t = `${k.startsWith('m:') ? MEET[k.slice(2)].label.replace(/（.*）/, '') : secMeta(k).t}的${l}`; if (!miss.includes(t)) miss.push(t); }));
  return miss;
}

/* ===== 各區塊內容 ===== */
const SEC = {};
SEC.org = () => {
  const sc = S.ui.scen, ids = new Set(selDocs(sc).map(x => x.id));
  const needReg = ['roster', 'report', 'seal', 'reissue'].some(i => ids.has(i));
  const needSeats = ['prep', 'found', 'renew'].includes(fam(sc));
  return GRID(
    F('org.name', '團體名稱', { req: 1, w: 'full', ph: '例：○○協會、○○學會、○○促進會', hint: '輸入團體本名即可，縣市與鄉鎮會自動加在前面。' }) +
    F('org.county', '縣市', { w: 'half' }) + F('org.town', '鄉鎮市（可留空）', { w: 'half', ph: '例：屏東市' }) +
    `<div class="f full"><label>文件抬頭會顯示為</label><div class="out">${calc('orgFull')}</div></div>`) +
  H4('聯絡資料') + GRID(
    F('org.address', '會址', { req: 1, w: 'full', ph: '屏東縣○○鄉○○村○○路○○號' }) +
    F('org.place', '常用開會地點', { w: 'full', hint: '留空會用會址。會議若在別處，到該會議再改即可。' }) +
    F('org.phone', '辦公電話', { req: 1, type: 'tel', w: 'half', ph: '08-7xxxxxx' }) + F('org.mobile', '行動電話', { type: 'tel', w: 'half' }) +
    F('org.contact', '聯絡人', { w: 'half' }) + F('org.contactTitle', '聯絡人職稱', { w: 'half', ph: '例：總幹事' }) +
    F('org.email', '電子信箱', { type: 'email', w: 'half' }) + F('org.fax', '傳真', { type: 'tel', w: 'half' }) + F('org.web', '網址', { w: 'full' })) +
  H4('公文字號') + GRID(F('org.docWord', '發文字軌', { w: 'full', ph: '例：屏○○協', hint: '產生的公文會寫成「（字軌）字第＿＿號」，每份公文的號碼在各會議內填寫。' })) +
  (sc === 'prep' || sc === 'found' || sc === 'other' ? '' : H4('屆次') + GRID(F('org.term', fam(sc) === 'renew' ? '目前屆別（改選前）' : '目前屆別', { type: 'num', req: 1, w: 'half', pre: '第', suf: '屆' }) + F('org.termYears', '每屆任期', { type: 'num', w: 'half', suf: '年' }))) +
  (needSeats ? H4('理監事名額', '<small>依章程</small>') + GRID(F('org.dirSeats', '理事', { type: 'num', w: 'third', suf: '人' }) + F('org.supSeats', '監事', { type: 'num', w: 'third', suf: '人' }) + F('org.stdDirSeats', '常務理事', { type: 'num', w: 'third', suf: '人' }) + F('org.dirAlt', '候補理事', { type: 'num', w: 'third', suf: '人' }) + F('org.supAlt', '候補監事', { type: 'num', w: 'third', suf: '人' }) + calc('seatCheck', 'full')) : '') +
  (needReg ? H4('立案與登記') + GRID(F('org.regDate', '社會局立案日期', { type: 'rdate', w: 'half', ph: '例：98/5/20' }) + F('org.regWord', '立案字號（字）', { w: 'half', ph: '例：屏府社行', suf: '字' }) + F('org.regNum', '立案字號（號）', { w: 'half', pre: '第', suf: '號' }) +
    F('org.corp', '辦理社團法人登記', { type: 'sel', opts: ['有', '無'], w: 'half' }) + F('org.courtDate', '法院登記日期', { type: 'rdate', w: 'half' }) + F('org.courtNo', '法院登記字號', { w: 'half' }) +
    F('org.reelectDate', '上次改選日期', { type: 'rdate', w: 'half' }) + F('org.groupCount', '團體會員數', { type: 'num', w: 'third', suf: '個' }) + F('org.memberCount', '個人會員數', { type: 'num', w: 'third', suf: '人' })) : '');
};
SEC.people = () => {
  const sc = S.ui.scen, prep = sc === 'prep';
  const roles = prep ? [...PREP_ROLES, ...ROLES.filter(r => !PREP_ROLES.includes(r))] : ROLES.filter(r => sc === 'found' || !PREP_ROLES.includes(r));
  const fields = [{ k: 'role', label: '職別', type: 'sel', opts: roles, w: 'half' }, { k: 'name', label: '姓名', w: 'half' }, { k: 'gender', label: '性別', type: 'sel', opts: ['男', '女'], w: 'third' },
    { k: 'birth', label: '出生年月日（民國）', type: 'rdate', w: 'third', ph: '例：45/3/12' }, { k: 'job', label: '現職', w: 'third' }, { k: 'idno', label: '身分證統一編號', w: 'half', check: 'id' },
    { k: 'phone', label: '電話', type: 'tel', w: 'half' }, { k: 'addr', label: '戶籍或工作地址', w: 'full' }];
  return NOTE(prep ? '請先輸入發起人、籌備委員與籌備會主任委員；成立後的理監事也可以在這裡一起管理。' : '這份名單會自動帶入簽到表、會議紀錄的出席名單、當選證明、一覽表與各文件的簽章欄。') +
    calc('peopleCount') +
    LISTC('people', fields, { summary: r => [r.role, r.name].filter(Boolean).join('　'), emptyLabel: '（新人員）', addLabel: '新增人員', tpl: { role: prep ? '籌備委員' : '理事' },
      bar: `<button type="button" class="btn ghost" data-cmd="paste" data-target="people">${icon('paste')}從 Excel 貼上</button>` });
};
SEC.members = () => NOTE('可從 Excel 或 Google 試算表直接複製整段貼上，系統會自動辨識「姓名、性別、出生、籍貫、地址、電話、類別」等欄位。正式會員（個人、團體）會算入大會應出席人數。') +
  calc('memberCount') +
  LISTC('members', [{ k: 'name', label: '姓名／團體名稱', w: 'half' }, { k: 'type', label: '會員類別', type: 'sel', opts: MEM_TYPES, w: 'half', blank: false }, { k: 'gender', label: '性別', type: 'sel', opts: ['男', '女'], w: 'third' },
    { k: 'birth', label: '出生年月日（民國）', type: 'rdate', w: 'third' }, { k: 'origin', label: '籍貫', w: 'third' }, { k: 'phone', label: '電話', type: 'tel', w: 'half' }, { k: 'note', label: '備註', w: 'half' }, { k: 'addr', label: '地址', w: 'full' }],
    { summary: r => `${r.name || ''}${r.type && r.type !== '個人會員' ? '　' + r.type : ''}`, emptyLabel: '（新會員）', addLabel: '新增會員', tpl: { type: '個人會員' },
      bar: `<button type="button" class="btn ghost" data-cmd="paste" data-target="members">${icon('paste')}從 Excel 貼上</button>${S.members.length ? `<button type="button" class="btn ghost" data-cmd="clearMembers">清空名冊</button>` : ''}` });

function propFields(mk) {
  const k = MEET[mk].kind;
  const f = [{ k: 'reason', label: '案由', type: 'area', rows: 2, w: 'full' }];
  if (['asm', 'foundAsm', 'foundBrd'].includes(k)) f.push({ k: 'proposer', label: '提案人', w: 'half' });
  if (k === 'prep1') f.push({ k: 'grp', label: '屬於', type: 'sel', opts: [['a', '發起人會議'], ['b', '第一次籌備會議']], w: 'half', blank: false });
  if (k !== 'pre') f.push({ k: 'desc', label: '說明', type: 'area', rows: 3, w: 'full' });
  if (k === 'asm') f.push({ k: 'method', label: '辦法', type: 'area', rows: 2, w: 'full' });
  f.push({ k: 'res', label: '決議', type: 'area', rows: 2, w: 'full', chips: ['照案通過。', '修正通過。', '保留，下次再議。'] });
  return f;
}
function meetSection(mk) {
  const d = MEET[mk], m = M(mk), sc = d.scen, k = d.kind, on = batchOn(S.ui.scen), post = on.post;
  const ids = new Set(selDocs(S.ui.scen).filter(x => x.m === mk).map(x => x.id));
  const hasNotice = [...ids].some(i => /notice|Notice/.test(i)), hasLetter = [...ids].some(i => /letter|Letter/.test(i));
  propsOf(mk);
  let h = '';
  if (d.before) h += NOTE(`依縣府說明，本會議應在會員大會召開前15日召開。${calcInline('preDeadline:' + mk)}`) +
    GRID(F(`m.${d.before}.date`, '會員大會預定日期', { type: 'date', w: 'half', hint: '用來檢查15日期限；之後到「' + SCEN[SCEN[S.ui.scen].next || 'renew'].title + '」會自動帶入。' }) + F(`m.${d.before}.place`, '會員大會預定地點', { w: 'half' }));
  if (!post) h += NOTE('目前只準備「① 會前：開會通知」，所以只列出開會通知需要的欄位；會議開完後，到「選文件」勾選「② 會後」，再補上出席、決議等會議內容。');
  if (d.same) h += NOTE('通常與會員大會同日接續召開；日期、地點未填時會自動沿用大會的資料。');
  h += GRID(
    (['prep', 'found'].includes(sc) ? '' : F(`m.${mk}.term`, '屆次', { type: 'num', w: 'third', pre: '第', suf: '屆' }) + F(`m.${mk}.no`, '會次', { type: 'num', w: 'third', pre: '第', suf: '次', req: !isNewTerm(mk) })) +
    F(`m.${mk}.kind2`, '會議性質', { type: 'sel', opts: ['定期會', '臨時會'], w: 'third', blank: false }) +
    F(`m.${mk}.date`, '開會日期', { type: 'date', w: 'half', req: 1 }) + F(`m.${mk}.time`, '開會時間', { type: 'time', w: 'half', req: 1 }) +
    F(`m.${mk}.place`, '開會地點', { w: 'full', req: 1 }) +
    (post ? F(`m.${mk}.chair`, '主席', { w: 'half', req: 1 }) + F(`m.${mk}.rec`, '紀錄', { w: 'half' }) : ''));
  h += calc('deadline:' + mk);
  if (!post) {
    h += GRID(F(`m.${mk}.should`, d.asm ? '應出席人數' : '應出席人數（通知書用）', { type: 'num', w: 'half', suf: '人' }));
    if (hasNotice) h += H4('開會通知書') + GRID(F(`m.${mk}.noticeNo`, '發文字號（號碼）', { w: 'half', pre: '第', suf: '號' }) + F(`m.${mk}.noticeDate`, '發文日期', { type: 'date', w: 'half' }) +
      F(`m.${mk}.report`, '報告事項', { type: 'area', rows: 2, w: 'full' }) + F(`m.${mk}.topics`, '重要討論事項', { type: 'area', rows: 4, w: 'full', hint: '預設依下方「討論提案」自動列出。提到工作計畫、財務報表、會員名冊等資料時，會自動勾選為「開會通知檢附資料」，附註也會列出附件。' }) + F(`m.${mk}.noticeNote`, '附註', { w: 'full', ph: '例：不克出席者請填具委託書', hint: noticeNoteHint(mk) }));
    h += H4('討論提案（案由）') + NOTE('會前只要列出案由，開會通知書的「重要討論事項」會自動帶入；決議可以會後再填。') +
      LISTC(`m.${mk}.props`, propFields(mk), { summary: (r, i) => PV(mk, i, 'reason').slice(0, 40), numFmt: i => '案' + cn(i + 1), addLabel: '新增提案', emptyLabel: '（新提案）', empty: '目前沒有提案' });
    return h;
  }
  h += H4('出席情形');
  if (d.asm) h += GRID(F(`m.${mk}.should`, '應出席人數', { type: 'num', w: 'third', suf: '人' }) + F(`m.${mk}.attend`, '實際出席（含委託）', { type: 'num', w: 'third', suf: '人', req: 1 }) + F(`m.${mk}.leave`, '請假', { type: 'num', w: 'third', suf: '人' }) +
    F(`m.${mk}.absent`, '缺席', { type: 'num', w: 'third', suf: '人' }) + F(`m.${mk}.obs`, '列席', { type: 'num', w: 'third', suf: '人' }) + (sc === 'found' || sc === 'dissolve' ? F(`m.${mk}.obsNames`, '列席人員姓名', { w: 'full', ph: '例：社會處代表' }) : '') + calc('quorum:' + mk, 'full'));
  else if (sc === 'prep') h += GRID(F(`m.${mk}.attend`, k === 'prep1' ? '出席發起人' : '出席籌備委員', { type: 'num', w: 'half', suf: '人' }) + F(`m.${mk}.should`, '應出席人數', { type: 'num', w: 'half', suf: '人' }));
  else h += GRID(F(`m.${mk}.dirNames`, '出席理事', { type: 'area', rows: 2, w: 'full' }) + F(`m.${mk}.supNames`, '出席監事', { type: 'area', rows: 2, w: 'full' }) +
    (k === 'foundBrd' ? F(`m.${mk}.attend`, '出席人數', { type: 'num', w: 'third', suf: '人' }) + F(`m.${mk}.attendDir`, '其中理事', { type: 'num', w: 'third', suf: '人' }) + F(`m.${mk}.attendSup`, '其中監事', { type: 'num', w: 'third', suf: '人' }) + F(`m.${mk}.absentNames`, '缺席人員', { w: 'half' }) + F(`m.${mk}.obsNames`, '列席人員', { w: 'half' }) : '') +
    F(`m.${mk}.leaveNames`, '請假人員', { w: 'half' }) + (k === 'postBrd' ? F(`m.${mk}.obs`, '列席人數', { type: 'num', w: 'half', suf: '人' }) : '') + F(`m.${mk}.should`, '應出席人數（通知書用）', { type: 'num', w: 'half', suf: '人' }));
  if (hasNotice) h += H4('開會通知書') + GRID(F(`m.${mk}.noticeNo`, '發文字號（號碼）', { w: 'half', pre: '第', suf: '號' }) + F(`m.${mk}.noticeDate`, '發文日期', { type: 'date', w: 'half' }) +
    F(`m.${mk}.report`, '報告事項', { type: 'area', rows: 2, w: 'full' }) + F(`m.${mk}.topics`, '重要討論事項', { type: 'area', rows: 4, w: 'full', hint: '預設依下方「討論提案」自動列出。提到工作計畫、財務報表、會員名冊等資料時，會自動勾選為「開會通知檢附資料」，附註也會列出附件。' }) + F(`m.${mk}.noticeNote`, '附註', { w: 'full', ph: '例：不克出席者請填具委託書', hint: noticeNoteHint(mk) }));
  h += H4('會議內容') + GRID(
    (k === 'prep1' ? F(`m.${mk}.tmpChair`, '臨時主席（發起人代表）', { w: 'half' }) : '') +
    F(`m.${mk}.speech`, '主席致詞（留空＝略）', { type: 'area', rows: 2, w: 'full' }) +
    (['prep1', 'prep2', 'foundAsm', 'foundBrd'].includes(k) ? F(`m.${mk}.guest`, '來賓致詞（留空＝略／免列）', { w: 'full' }) : '') +
    (k === 'brd' ? F(`m.${mk}.asOf`, '會籍統計截至', { type: 'date', w: 'half' }) + F(`m.${mk}.cntPerson`, '正式會員', { type: 'num', w: 'third', suf: '人' }) + F(`m.${mk}.cntSuspended`, '停權會員', { type: 'num', w: 'third', suf: '人' }) + F(`m.${mk}.cntSponsor`, '贊助會員', { type: 'num', w: 'third', suf: '人' }) : '') +
    (k !== 'postBrd' ? F(`m.${mk}.reportText`, k === 'asm' ? '上年度工作報告（可留空）' : k === 'brd' ? '業務報告' : '報告事項內容（可留空）', { type: 'area', rows: 3, w: 'full' }) : '') +
    (k === 'asm' ? F(`m.${mk}.refTerm`, '決算等案經第', { type: 'num', w: 'half', suf: '屆' }) + F(`m.${mk}.refNo`, '第', { type: 'num', w: 'half', suf: '次理（監）事會審議', hint: '預設帶入「大會前理監事會」的屆次。' }) : '') +
    (k === 'foundBrd' ? F(`m.${mk}.chairSpeech`, '第一屆理事長致詞（留空＝略）', { w: 'full' }) : ''));
  if (d.el === 'ds') h += electionBlock(mk);
  if (d.el === 'chair') h += H4('選舉結果') + GRID(
    (k === 'foundBrd' ? F(`m.${mk}.el.jp`, '監票員', { w: 'half' }) + F(`m.${mk}.el.fp`, '發票員', { w: 'half' }) + F(`m.${mk}.el.cp`, '唱票員', { w: 'half' }) + F(`m.${mk}.el.jip`, '計票員', { w: 'half' }) : '') +
    F(`m.${mk}.el.stdDirs`, '常務理事當選人（可留空）', { w: 'full' }) + F(`m.${mk}.el.chair`, '理事長當選人', { w: 'half' }) + F(`m.${mk}.el.chairVotes`, '得票數', { type: 'num', w: 'half', suf: '票' }) +
    F(`m.${mk}.el.stdSup`, '常務監事當選人', { w: 'half' }) + F(`m.${mk}.el.stdSupVotes`, '得票數', { type: 'num', w: 'half', suf: '票' })) + NOTE('當選人預設帶入「人員名單」中職別為常務理事、理事長、常務監事的人；名單更新後這裡會自動跟著變。');
  h += H4(k === 'dissolve' ? '討論提案（縣府要求範例提案請勿刪減）' : '討論提案') + (k === 'dissolve' ? NOTE('提案文字會依「解散相關資料」區塊的內容自動產生。') : '') +
    LISTC(`m.${mk}.props`, propFields(mk), { summary: (r, i) => PV(mk, i, 'reason').slice(0, 40), numFmt: i => '案' + cn(i + 1), addLabel: '新增提案', emptyLabel: '（新提案）', empty: '目前沒有提案' });
  h += H4('臨時動議') + LISTC(`m.${mk}.motions`, [{ k: 'prop', label: '提案', type: 'area', rows: 2, w: 'full' }, { k: 'desc', label: '說明', type: 'area', rows: 2, w: 'full' }, { k: 'res', label: '決議', type: 'area', rows: 2, w: 'full', chips: ['照案通過。', '交理事會研議。'] }],
    { summary: r => (r.prop || '').slice(0, 40), addLabel: '新增臨時動議', empty: '沒有臨時動議（紀錄會寫「無」）' });
  h += GRID(F(`m.${mk}.end`, '散會時間', { type: 'time', w: 'half' }));
  if (hasLetter) h += H4('檢送會議紀錄公文') + GRID(F(`m.${mk}.letterNo`, '發文字號（號碼）', { w: 'half', pre: '第', suf: '號' }) + F(`m.${mk}.letterDate`, '發文日期', { type: 'date', w: 'half' }) +
    F(`m.${mk}.subject`, '主旨', { type: 'area', rows: 3, w: 'full' }) + F(`m.${mk}.d1`, '說明一', { type: 'area', rows: 2, w: 'full' }) + F(`m.${mk}.d2`, '說明二', { type: 'area', rows: 4, w: 'full', hint: '隨函檢附的文件會依您勾選的文件自動列出。' }) + F(`m.${mk}.d3`, '說明三（可留空）', { type: 'area', rows: 2, w: 'full' }));
  return h;
}
function calcInline(key) { return `<span data-calc="${key}"></span>`; }
function electionBlock(mk) {
  const cand = (w, lab) => `<div class="f full"><label>${lab}候選人與得票數</label>${LISTT(`m.${mk}.el.${w}`, [{ k: 'name', label: '姓名', f: 2 }, { k: 'votes', label: '得票數', f: 1, num: true }], { addLabel: '新增候選人', empty: '尚未輸入' })}</div>`;
  return H4('選舉') + GRID(
    F(`m.${mk}.el.jp`, '監票員', { w: 'half' }) + F(`m.${mk}.el.fp`, '發票員', { w: 'half' }) + F(`m.${mk}.el.cp`, '唱票員', { w: 'half' }) + F(`m.${mk}.el.jip`, '記（計）票員', { w: 'half' }) +
    F(`m.${mk}.el.dirSeats`, '理事名額', { type: 'num', w: 'third', suf: '人' }) + F(`m.${mk}.el.dirAlt`, '候補理事', { type: 'num', w: 'third', suf: '人' }) + F(`m.${mk}.el.supSeats`, '監事名額', { type: 'num', w: 'third', suf: '人' }) + F(`m.${mk}.el.supAlt`, '候補監事', { type: 'num', w: 'third', suf: '人' }) +
    cand('dirs', '理事') + cand('sups', '監事') + calc('elResult:' + mk, 'full') +
    `<div class="f full btnrow"><button type="button" class="btn ghost" data-cmd="candFromPeople" data-mk="${mk}">${icon('people')}從人員名單帶入候選人</button><button type="button" class="btn" data-cmd="applyElection" data-mk="${mk}">${icon('check')}依選舉結果更新人員名單</button></div>`);
}
SEC.plan = () => NOTE('同一類別、項目連續填寫時，輸出會自動合併並加上「一、」「（一）」編號。') + GRID(F('plan.year', '計畫年度', { type: 'num', w: 'third', suf: '年' }) + F('plan.refTerm', '提經第', { type: 'num', w: 'third', suf: '屆' }) + F('plan.refNo', '第', { type: 'num', w: 'third', suf: '次理監事會' })) +
  LISTC('plan.rows', [{ k: 'cat', label: '工作類別', w: 'half', ph: '例：會務推展' }, { k: 'item', label: '項目', w: 'half', ph: '例：會議' }, { k: 'desc', label: '說明', type: 'area', rows: 2, w: 'full' }, { k: 'qty', label: '數量', w: 'third' }, { k: 'prog', label: '執行進度', w: 'third', ph: '例：3月' }, { k: 'cost', label: '經費預估', type: 'num', w: 'third', suf: '元' }, { k: 'co', label: '協辦單位', w: 'half' }, { k: 'note', label: '備註', w: 'half' }],
    { summary: r => [r.cat, r.item, r.desc].filter(Boolean).join('／').slice(0, 40), addLabel: '新增工作項目' }) + calc('planTotal') + GRID(F('plan.method', '實施要領（或工作方法）', { type: 'area', rows: 3, w: 'full' }));
SEC.ledger = () => GRID(F('x.ledger.term', '第', { type: 'num', w: 'third', suf: '屆' }) + F('x.ledger.from', '期間自', { type: 'date', w: 'third' }) + F('x.ledger.to', '至', { type: 'date', w: 'third' }) + F('x.ledger.open', '上期結存（可留空）', { type: 'num', w: 'half', suf: '元' })) +
  LISTC('x.ledger.rows', [{ k: 'date', label: '日期', type: 'date', w: 'half' }, { k: 'acc', label: '科目', w: 'half', ph: '例：業務費' }, { k: 'item', label: '收支項目', w: 'full' }, { k: 'inc', label: '收入額', type: 'num', w: 'third', suf: '元' }, { k: 'exp', label: '支出額', type: 'num', w: 'third', suf: '元' }, { k: 'file', label: '掃描檔名', w: 'third' }],
    { summary: r => `${rdDot(r.date)}　${r.item || ''}　${hasNum(r.inc) ? '+' + fmt(num(r.inc)) : ''}${hasNum(r.exp) ? '-' + fmt(num(r.exp)) : ''}`, addLabel: '新增一筆收支' }) + calc('ledgerTotal');
SEC.prepfin = () => GRID(F('x.prepfin.from', '期間自', { type: 'date', w: 'half' }) + F('x.prepfin.to', '至', { type: 'date', w: 'half' })) +
  H4('收入') + LISTT('x.prepfin.inc', [{ k: 'name', label: '科目名稱', f: 2, ph: '例：籌備委員捐款' }, { k: 'amt', label: '金額', f: 1, num: true }]) +
  H4('支出') + LISTT('x.prepfin.exp', [{ k: 'name', label: '科目名稱', f: 2, ph: '例：印刷費' }, { k: 'amt', label: '金額', f: 1, num: true }]) + calc('prepfinTotal') + NOTE('收支應保持平衡或有結餘，不得負債。');
SEC.statute = () => NOTE('依縣府「組織章程」範本產生，條文順序與文字保持不變，只填入貴會的名稱、宗旨、任務、名額、任期與會費等。產生後可再用 Word 修改。') + GRID(
  F('statute.name', '團體全名', { w: 'full' }) + F('statute.purpose', '宗旨', { type: 'area', rows: 2, w: 'full', req: 1, ph: '例：促進○○交流，推廣○○，增進會員福祉', hint: '簡明扼要，一百字以內為原則。' }) +
  F('statute.area', '組織區域', { w: 'full' }) + F('statute.tasks', '任務（每行一項）', { type: 'area', rows: 4, w: 'full', req: 1, ph: '舉辦○○講座及研習活動。\n推廣○○……' }) +
  F('statute.memTypes', '會員類別與資格（每行一種）', { type: 'area', rows: 4, w: 'full' }) +
  F('statute.dirs', '理事', { type: 'num', w: 'third', suf: '人' }) + F('statute.sups', '監事', { type: 'num', w: 'third', suf: '人' }) + F('statute.stdDirs', '常務理事', { type: 'num', w: 'third', suf: '人' }) +
  F('statute.dirAlt', '候補理事', { type: 'num', w: 'third', suf: '人' }) + F('statute.supAlt', '候補監事', { type: 'num', w: 'third', suf: '人' }) + F('statute.stdSups', '常務監事', { type: 'num', w: 'third', suf: '人' }) +
  F('statute.years', '理監事任期', { type: 'num', w: 'third', suf: '年' }) + F('statute.brdMonths', '理事會每', { w: 'third', suf: '個月開會' }) + F('statute.supMonths', '監事會每', { w: 'third', suf: '個月開會' }) +
  F('statute.feeIn', '入會費', { type: 'num', w: 'half', pre: '新台幣', suf: '元' }) + F('statute.feeYear', '常年會費', { type: 'num', w: 'half', pre: '新台幣', suf: '元', hint: '縣府建議每年至少500元。' }) +
  F('statute.passDate', '通過章程的會員大會日期', { type: 'date', w: 'half' }) + F('statute.passTerm', '第', { w: 'third', suf: '屆' }) + F('statute.passNo', '第', { w: 'third', suf: '次會員大會' }) +
  F('statute.approveDate', '縣府核備日期（可留空）', { type: 'date', w: 'half' }) + F('statute.approveNo', '核備文號（可留空）', { w: 'half', pre: '屏府社政字第', suf: '號' })) + calc('seatCheckStatute');
SEC.amend = () => NOTE('需檢附新舊章程各2份。') + LISTC('amend.rows', [{ k: 'orig', label: '原條文', type: 'area', rows: 4, w: 'full' }, { k: 'rev', label: '修正後條文', type: 'area', rows: 4, w: 'full' }, { k: 'note', label: '說明', type: 'area', rows: 3, w: 'full' }],
  { summary: r => (r.rev || r.orig || '').split('\n')[0].slice(0, 36), addLabel: '新增修正條文' });
SEC.handover = () => GRID(F('x.handover.date', '移交日期', { type: 'date', w: 'half' }) + F('x.handover.from', S.ui.scen === 'found' ? '移交人（卸任籌備會主任委員）' : '移交人（卸任理事長）', { w: 'half' }) + F('x.handover.to', '接收人（新任理事長）', { w: 'half' }) + F('x.handover.sup', '監交人（常務監事）', { w: 'half' })) +
  NOTE('於新任理事長選出後14日內，以移交清冊乙份連同圖記移交新任；理事長當選後十日內辦竣點交手續，備函並檢同移交清冊乙份報主管機關。各清冊的數量欄可列印後手寫。');
SEC.cert = () => GRID(F('x.cert.name', '理事長姓名', { w: 'half', req: 1 }) + F('x.cert.birthplace', '出生地', { w: 'half', req: 1 }) + F('x.cert.birth', '出生日期（民國）', { type: 'rdate', w: 'half', req: 1 }) + F('x.cert.phone', '電話', { type: 'tel', w: 'half' }) + F('x.cert.addr', '戶籍地址', { w: 'full' }) +
  F('x.cert.term', '當選屆次', { type: 'num', w: 'third', pre: '第', suf: '屆' }) + F('x.cert.firstDate', '第一次理事會日期', { type: 'date', w: 'third' }) + F('x.cert.tenure', '任期', { w: 'full', hint: '預設由第一次理事會日期加上任期年數自動推算。' }) + F('x.cert.note', '備註', { w: 'full' })) +
  NOTE('送件時請檢附當選人身分證正反面影本1份、2吋大頭照2張。');
SEC.consent = () => GRID(F('x.consent.loc', S.ui.scen === 'board' && S.ui.boardAddr ? '新會址（房屋座落）' : '房屋座落', { w: 'full', req: 1 }) + F('x.consent.landNo', '地號', { w: 'half' }) + F('x.consent.ping', '坪數', { type: 'num', w: 'third', suf: '坪' }) + F('x.consent.sqm', '面積', { type: 'num', w: 'third', suf: 'm²' }) +
  F('x.consent.from', '借用期限自', { type: 'date', w: 'half', req: 1 }) + F('x.consent.to', '至', { type: 'date', w: 'half' }) + F('x.consent.lender', '房屋出借人', { w: 'half', req: 1 }) + F('x.consent.witness', '見證人', { w: 'half' }) + F('x.consent.date', '立書日期', { type: 'date', w: 'half' }) +
  (S.ui.scen === 'board' && S.ui.boardAddr ? F('x.consent.letterNo', '會址變更公文字號（號碼）', { w: 'half', pre: '第', suf: '號' }) + F('x.consent.letterDate', '會址變更公文日期', { type: 'date', w: 'half' }) : '')) +
  NOTE('坪數與平方公尺擇一填寫，另一個會自動換算。會址處所依規定不得少於卅平方公尺，並應取得一年以上使用權；請檢附使用權狀或近期繳稅單影本。');
SEC.ballot = () => GRID(`<div class="f full"><label>選票格式（人民團體選舉罷免辦法第七條）</label>${SEG('x.ballot.type', [['1', '第一種：全體候選人圈選'], ['2', '第二種：空白填寫'], ['3', '第三種：參考名單＋填寫']], { def: '3', cls: 'col' })}</div>` +
  (fam(S.ui.scen) === 'renew' ? `<div class="f full"><label>參考名單產生方式</label>${SEG('x.ballot.refMode', [['推薦', '理事會推薦'], ['登記', '公開徵求登記']], { def: '推薦' })}</div>` : '') +
  F('x.ballot.term', '選舉第', { type: 'num', w: 'half', suf: '屆' }) +
  (fam(S.ui.scen) === 'renew' ? F('x.ballot.recall', '被聲請罷免人（若有，以、分隔）', { w: 'full' }) + F('x.ballot.recallRole', '罷免職務', { type: 'sel', opts: ['理監事', '常務理監事', '理事長'], w: 'half' }) : '')) +
  NOTE('候選人名單與應選名額取自「會員大會」的選舉欄；第一種格式若沒輸入候選人，會改用會員名冊全體正式會員。');
SEC.proxy = () => GRID(F('x.proxy.pages', '列印頁數（每頁6張）', { type: 'num', w: 'half', suf: '頁' })) + NOTE('一人只能委託一人、一人只能受一人委託；會議名稱與團體名稱會自動帶入。');
SEC.recruit = () => GRID(F('x.recruit.no', '公告字號（號碼）', { w: 'half', pre: '第', suf: '號' }) + F('x.recruit.date', '公告日期', { type: 'date', w: 'half' }) + F('x.recruit.approveDate', '縣府准予設立日期', { type: 'date', w: 'half' }) + F('x.recruit.approveNo', '准予設立文號', { w: 'half', pre: '屏府社政字第', suf: '號' }) +
  F('x.recruit.goal', '本會宗旨', { type: 'area', rows: 2, w: 'full' }) + F('x.recruit.quals', '入會資格（每行一項）', { type: 'area', rows: 4, w: 'full', ph: '1.個人會員：凡贊同本會宗旨，年滿二十歲者，得申請入會。' }) +
  F('x.recruit.deadline', '申請入會截止日期', { type: 'date', w: 'half', req: 1 }) + F('x.recruit.chair', '主任委員', { w: 'half' }));
SEC.report = () => NOTE('解散須經大會出席人數三分之二以上同意（已辦社團法人登記者為四分之三以上）。五項財務報表的截止日期、解散日期、大會召開日期三者請決議一致。') + GRID(
  F('x.report.reason', '解散原因', { w: 'full', req: 1, ph: '例：會員老化、人數縮減，會務無法繼續推動' }) + F('x.report.date', '解散日期', { type: 'date', w: 'half' }) + F('x.report.agree', '同意解散人數', { type: 'num', w: 'half', suf: '人', req: 1 }) + calc('dissolveCheck', 'full') +
  F('x.report.cash', '財務存款（剩餘財產）', { type: 'num', w: 'half', pre: '新台幣', suf: '元' }) + F('x.report.to', '剩餘財產歸屬', { w: 'half', hint: '請以公部門為主，其他團體為次。' }) + F('x.report.propDesc', '財產說明（可留空）', { type: 'area', rows: 2, w: 'full' }) +
  F('x.report.liq', '清算人', { w: 'half' }) + F('x.report.liqFrom', '清算時間自', { type: 'date', w: 'half' }) + F('x.report.liqTo', '至', { type: 'date', w: 'half' }) + F('x.report.returnDate', '繳銷立案證書及圖記日期', { type: 'date', w: 'half' }) +
  F('x.report.okDate', '奉准解散日期（核准後填）', { type: 'date', w: 'half' }) + F('x.report.okNo', '奉准文號', { w: 'half' }) + F('x.report.story', '解散原因及經過（報告表用，可留空）', { type: 'area', rows: 3, w: 'full' }) + F('x.report.other', '其他', { w: 'full' }));
SEC.seal = () => GRID(F('x.seal.sealDate', '印信啟用核備日期', { type: 'date', w: 'half' }) + F('x.seal.sealNo', '核備文號', { w: 'half', pre: '屏府社政字第', suf: '號' }) + F('x.seal.chair', '現任理事長', { w: 'half' }) + F('x.seal.addr', '團體會址', { w: 'full' }) + F('x.seal.use', '本印鑑證明書之用途', { type: 'area', rows: 2, w: 'full', req: 1, ph: '例：辦理銀行開戶' })) +
  NOTE('依各團體需要份數，專案函報屏東縣政府（社會處）申請核印；立案字號取自「團體基本資料」。');
SEC.resign = () => GRID(F('x.resign.name', '辭職人姓名', { w: 'half', req: 1 }) + F('x.resign.pos', '辭去職務', { type: 'sel', opts: ['理事長', '常務理事', '理事', '常務監事', '監事'], w: 'half', req: 1 }) + F('x.resign.term', '第', { type: 'num', w: 'third', suf: '屆' }) + F('x.resign.date', '日期', { type: 'date', w: 'half' }) + F('x.resign.reason', '原因', { w: 'full', ph: '例：個人健康因素' }));
SEC.reissue = () => GRID(`<div class="f full"><label>補發原因</label>${SEG('x.reissue.why', [['遺失', '遺失'], ['毀損', '毀損'], ['其它', '其它原因']], { def: '遺失' })}</div>` + F('x.reissue.other', '其它原因說明', { w: 'full' }) + F('x.reissue.who', '負責人', { w: 'half' }) + F('x.reissue.idno', '身分證統一編號', { w: 'half', req: 1, check: 'id' }) + F('x.reissue.phone', '聯絡電話', { type: 'tel', w: 'half' }) + F('x.reissue.date', '申請日期', { type: 'date', w: 'half' }) + F('x.reissue.addr', '通訊地址', { w: 'full' }));
