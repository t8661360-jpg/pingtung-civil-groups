/* ===== 會議相關文件 ===== */
const SUBL = (B, t, lv = 1, hang = 0, o = {}) => B.push(P(t, { indent: lv * 2, hang, ...o }));
function heading() { let n = 0; return t => `${cn(++n)}、${t}`; }
function footSlot([lab, name]) {
  const L = String(lab).replace(/[\s　]/g, ''); let t = L === '理事長' ? '理事長' : '';
  if (!t && name) t = name === chairName() ? '理事長' : name === prepChair() ? '籌備會主任委員' : name === pname('總幹事') ? '總幹事' : '';
  return slotOf(t, name);
}
function signFooter(a, b) { return P(`${a[0]}　${a[1] || FW.repeat(4)}${STAMP(footSlot(a))}${FW.repeat(6)}${b[0]}　${b[1] || FW.repeat(4)}${STAMP(footSlot(b))}`, { before: 28 }); }
const scenOf = mk => MEET[mk].scen;
const yesNo = (on, t) => (on ? '■' : '□') + t;

/* ---------- 開會通知書 ---------- */
function noticeOptions(mk) {
  const k = MEET[mk].kind, t = O(cn(mTerm(mk)), '○'), n = O(cn(mNo(mk)), '○');
  if (k === 'prep1' || k === 'prep2') return `${yesNo(k === 'prep1', '發起人暨第一次籌備會')}　${yesNo(k === 'prep2', '第二次籌備會')}（請打ˇ或■填寫）`;
  if (k === 'foundAsm') return '■第一屆第一次成立會員大會';
  if (k === 'pre' || k === 'brd') return `□第○屆第○次會員大會　□第○屆第○次□理□監事會議（單獨）\n■第${t}屆第${n}次理監事聯席會議（請打ˇ或■填寫）`;
  if (k === 'asm' && scenOf(mk) === 'renew') return `■第${t}屆第一次會員大會　□第○屆第○次理監事會議（改選前）\n□第${t}屆第一次理監事聯席會議（請打ˇ或■填寫）`;
  return `■第${t}屆第${n}次會員大會（請打ˇ或■填寫）`;
}
function signerLine(mk) {
  const sc = scenOf(mk), k = MEET[mk].kind;
  if (sc === 'prep') { const who = k === 'prep1' ? (names(['發起人'])[0] || prepChair()) : prepChair(); return `${yesNo(k === 'prep2', '籌備主委')} ${yesNo(k === 'prep1', '發起人代表')}：${O(who)}${STAMP(slotOf(k === 'prep2' || who === prepChair() ? '籌備會主任委員' : '', who), '（蓋章）')}`; }
  if (sc === 'found') return `籌備主委　${O(prepChair())}${STAMP(slotOf('籌備會主任委員', prepChair()), '（蓋章）')}`;
  return `■理事長 □籌備主委 □發起人代表：${O(chairName())}${STAMP(slotOf('理事長', chairName()), '（蓋章）')}`;
}
function recipLines(mk) {
  const sc = scenOf(mk), k = MEET[mk].kind, gov = `■${S.org.county || '屏東縣'}政府`;
  if (sc === 'prep') return `${gov}\n${yesNo(k === 'prep2', '本會籌備委員')}　${yesNo(k === 'prep1', '本會發起人')}`;
  if (sc === 'found') return `${gov}\n■本會會員　□本會籌備委員　□本會發起人`;
  if (MEET[mk].asm) return `${gov}\n□本會理監事\n■本會會員`;
  return `${gov}\n■本會理監事\n□本會會員`;
}
function contactBlock() {
  const o = S.org, ct = V('org.contactTitle'), c = V('org.contact');
  return [o.address || '', c ? `${ct ? ct + '：' : ''}${c}` : '', o.phone ? `【辦公】${o.phone}` : '', o.mobile ? `【行動】${o.mobile}` : ''].join('\n');
}
function docNotice(mk) {
  const m = M(mk), date = MV(mk, 'date');
  const title = `${orgFull()}${scenOf(mk) === 'prep' ? '籌備會' : ''}開會通知書${FW.repeat(2)}民國${rd(MV(mk, 'noticeDate'))}\n${docNo(m.noticeNo)}`;
  const k2 = MV(mk, 'kind2');
  const rows = [
    { cells: [{ v: title, cs: 5, al: 'c', b: true, sz: 13 }] },
    { cells: [{ v: '會議\n名稱', cs: 2, rs: 2, al: 'c' }, { v: `${k2 === '臨時會' ? '□定期會■臨時會' : '■定期會□臨時會'}（請打ˇ填寫）`, cs: 3 }] },
    { cells: [{ v: noticeOptions(mk), cs: 3 }] },
    { cells: [{ v: '時　間', cs: 2, al: 'c' }, { v: `民國${rd(date)}${date ? `（${weekday(date)}）` : ''}\n${tm(MV(mk, 'time'))}` }, { v: '地址\n聯絡人\n電話\n手機', rs: 3, al: 'c' }, { v: contactBlock(), rs: 3 }] },
    { cells: [{ v: '地　點', cs: 2, al: 'c' }, { v: MV(mk, 'place') }] },
    { cells: [{ v: '應出席人數', cs: 2, al: 'c' }, { v: `${BL(MV(mk, 'should'))}人` }] },
    { h: 54, cells: [{ v: '議\n\n程', rs: 2, al: 'c' }, { v: '報告事項', al: 'c' }, { v: MV(mk, 'report'), cs: 3 }] },
    { h: 80, cells: [{ v: '重　要\n討論事項', al: 'c' }, { v: MV(mk, 'topics'), cs: 3 }] },
    { cells: [{ v: '申請事項', cs: 2, al: 'c' }, { v: '敬請主管機關派員列席指導。', cs: 3 }] },
    { h: 28, cells: [{ v: '附　　註', cs: 2, al: 'c' }, { v: m.noticeNote || '', cs: 3 }] },
    { cells: [{ v: `此致\n${signerLine(mk)}\n${recipLines(mk)}`, cs: 5 }] },
  ];
  return { title: '開會通知書', sheets: [{ name: '開會通知書', cols: [5, 7, 30, 10, 30], size: 12, ls: 1.35, blocks: [T(rows, { size: 12, pad: 4 })] }] };
}

/* ---------- 檢送會議紀錄公文（函） ---------- */
function handbookList(sc) {
  const y = yrs();
  return `議程、理事會工作報告、監事會監察報告、${y.y}年度收支決算表、財產目錄、資產負債表、收支報表、${y.by}年度工作計畫、${y.by}年度經費收支預算表、會員名冊及章程`;
}
function attNames(sc) {
  const sel = new Set(selDocs(sc).map(x => x.id)), y = yrs(), out = [];
  const add = (id, t) => { if (sel.has(id)) out.push(t); };
  if (sc === 'found') {
    add('asmMin', '第一屆第一次會員大會紀錄'); add('brdMin', '第一屆第一次理監事會紀錄'); add('statute', '章程'); add('roster', '選任職員暨聘僱人員簡歷冊');
    add('members', '會員名冊'); add('plan', '年度工作計畫'); add('budget', '年度經費收支預算表'); add('consent', '會址使用同意書'); add('handover', '移交清冊');
    if (selDocs(sc).some(x => x.hb)) out.push('成立大會手冊');
    add('cert', '理事長當選證明書申請表二份暨理事長照片三張');
    return out;
  }
  if (sel.has('fin')) out.push(`${y.y}年度經費收支決算表（含財產目錄及資產負債表）`);
  add('ledger', '收支報表'); add('plan', `${y.by}年度工作計畫`);
  if (sel.has('fin')) out.push(`${y.by}年度經費收支預算表`);
  add('members', '會員名冊'); add('roster', sc === 'renew' ? '新任理監事暨聘僱人員名冊' : '理監事暨會務人員一覽表'); add('handover', '移交清冊'); add('consent', '會址使用同意書');
  add('charter', '章程'); add('amend', '章程修正條文對照表（附新舊章程各2份）'); add('cert', '理事長當選證明書申請表');
  if (selDocs(sc).some(x => x.hb)) out.push('大會手冊');
  return out;
}
function placeOf(mk) { return MV(mk, 'place') || '○○○'; }
function heldText(mk, verb = '召開完畢') { const dt = MV(mk, 'date'); return `旨揭會議業於${parseDate(dt) ? rd(dt) : '○○○年○○月○○日'}假${placeOf(mk)}${verb}`; }
function letterSubject(mk) {
  const k = MEET[mk].kind, sc = scenOf(mk), t = O(cn(mTerm(mk)), '○'), n = O(cn(mNo(mk)), '○');
  if (k === 'prep1' || k === 'prep2') return `檢送本會第${k === 'prep1' ? '一' : '二'}次籌備會會議紀錄及相關附件各一式二份，敬請鈞府准予備查見復，請鑒核。`;
  if (sc === 'found') return '檢送本會成立相關資料，敬請鈞府准予立案，發給立案證書及理事長當選證明書。';
  if (k === 'pre') return `檢送本會第${t}屆第${n}次理監事聯席會議${sc === 'renew' ? '（選前）' : ''}會議紀錄一式二份，敬請鈞府准予備查見復，請　鑒核。`;
  if (k === 'brd') return `檢送本會第${t}屆第${n}次理監事聯席會議會議紀錄一份，敬請鈞府准予備查見復，請鑒核。`;
  if (sc === 'renew') return `檢送本會第${t}屆第一次會員大會暨理監事會會議紀錄及相關附件各一式二份，敬請鈞府准予備查見復，請　鑒核。`;
  return `檢送本會第${t}屆第${n}次會員大會會議紀錄及相關附件各一式二份，敬請鈞府准予備查見復，請　鑒核。`;
}
function letterD1(mk) {
  const sc = scenOf(mk);
  if (sc === 'found') { const dt = MV('found.asm', 'date'); return `本會第一屆第一次會員大會暨第一屆第一次理監事會業於${parseDate(dt) ? rd(dt) : '○○○年○○月○○日'}假${placeOf('found.asm')}召開完竣。`; }
  if (sc === 'dissolve') return '';
  if (sc === 'prep') return '';
  return `依據本會${O(BY(), '○○○')}年度工作計畫辦理。`;
}
function letterD2(mk) {
  const k = MEET[mk].kind, sc = scenOf(mk);
  if (sc === 'prep') return `${heldText(mk)}，隨函檢附會議紀錄及相關附件呈請備查。`;
  if (sc === 'found') return `檢附相關資料如下：（除理事長當選證明書申請表外，餘一式三份）\n${attNames('found').map((t, i) => `（${cn(i + 1)}）${t}`).join('\n')}`;
  if (k === 'pre') return `${heldText(mk)}，隨函檢附會議紀錄${sc === 'renew' ? '、選票樣張' : ''}及大會手冊內容（${handbookList(sc)}）呈請備查。`;
  if (k === 'brd') return `${heldText(mk)}，隨函檢附會議紀錄${selDocs('board').some(x => x.id === 'ledger') ? '及當季收支報表' : ''}呈請備查。`;
  if (sc === 'dissolve') return `${heldText(mk)}，隨函檢附下列資料一式二份呈請備查：\n（一）會員大會紀錄。\n（二）各項財務報表。（共5項報表，缺一不可）\n（三）解散報告表。\n（四）本府原核發之立案證書、圖記、理事長當選證明書。\n（五）其他相關資料（例如捐款收據或剩餘財產轉移清冊等）`;
  if (sc === 'annual') return `${heldText(mk)}，隨函檢附下列資料一式二份呈請備查：\n${attNames('annual').map((t, i) => `（${cn(i + 1)}）${t}`).join('\n')}`;
  return `${heldText(mk)}，隨函檢附${attNames(sc).join('、')}呈請備查。`;
}
function letterBody(blocks, items) {
  const CNL = ['一', '二', '三', '四', '五', '六'];
  items.filter(Boolean).forEach((txt, i) => {
    const lines = String(txt).split('\n');
    blocks.push(P(`${items.filter(Boolean).length > 1 ? CNL[i] + '、' : ''}${lines[0]}`, { size: 16, indent: items.filter(Boolean).length > 1 ? 1 : 0, hang: items.filter(Boolean).length > 1 ? 2 : 0, after: 0 }));
    lines.slice(1).forEach(l => blocks.push(P(l, { size: 16, indent: 3, hang: 2.5, after: 0 })));
  });
}
function govLetter({ keep = '10年', no, date, subject, items, signer, signerTitle = '理事長', signerName = chairName(), att = '如說明二' }) {
  const kv = (k, v) => P(`${k}：${v || ''}`, { size: 12, indent: 15, after: 0 });
  const B = [
    P(`檔號：02\n保存年限：${keep}`, { align: 'r', size: 10, after: 4 }),
    TITLE(`${orgFull()}　函`, { size: 20, after: 10 }),
    kv('機關地址', S.org.address), kv('聯 絡 人', `${V('org.contact')}${S.org.mobile ? '　' + S.org.mobile : ''}`), kv('聯絡電話', S.org.phone),
    P('', { after: 2 }),
    P(`受文者：${S.org.county || '屏東縣'}政府`, { size: 14, after: 6 }),
    P(`發文日期：中華民國${rd(date)}`, { size: 12, after: 0 }),
    P(`發文字號：${docNo(no)}`, { size: 12, after: 0 }),
    P('速別：普通', { size: 12, after: 0 }), P('密等及解密條件：普通', { size: 12, after: 0 }),
    P(`附件：${att}`, { size: 12, after: 10 }),
    P(`主旨：${subject}`, { size: 16, hang: 3, after: 6 }),
    P('說明：', { size: 16, after: 0 }),
  ];
  letterBody(B, items);
  B.push(P(`${signer}${STAMP(slotOf(signerTitle || '理事長', signerName), '（簽字章或私章）')}`, { size: 16, align: 'r', before: 30, after: 30 }));
  B.push(P(`正本：${S.org.county || '屏東縣'}政府`, { size: 12, after: 0 }), P('副本：本會', { size: 12 }));
  return B;
}
function docLetter(mk) {
  const m = M(mk), sc = scenOf(mk);
  const signer = sc === 'prep' ? `籌備會主委　${O(prepChair())}` : `理事長　${O(chairName())}`;
  const items = [MV(mk, 'd1'), MV(mk, 'd2'), m.d3 || ''];
  const B = govLetter({ keep: MEET[mk].kind === 'pre' ? '5年' : '10年', no: m.letterNo, date: MV(mk, 'letterDate'), subject: MV(mk, 'subject'), items, signer, signerTitle: sc === 'prep' ? '籌備會主任委員' : '理事長', signerName: sc === 'prep' ? prepChair() : chairName(), att: sc === 'prep' ? '如文' : '如說明二' });
  return { title: '檢送會議紀錄公文', sheets: [{ name: '檢送會議紀錄公文', cols: [1], size: 14, ls: 1.5, blocks: B }] };
}
function docAddrLetter() {
  const mk = 'board.brd', x = S.x.consent, t = O(cn(mTerm(mk)), '○'), n = O(cn(mNo(mk)), '○');
  const B = govLetter({ no: x.letterNo, date: x.letterDate || isoToday(), subject: `本會會址變更至「${newAddr() || '屏東縣○○鄉○○村○○路○○號'}」，檢附相關資料各一式二份，敬請主管機關准予備查見復，如說明，請鑒核。`,
    items: [`旨揭案由業經本會第${t}屆第${n}次理監事聯席會議議決通過在案。`, '隨函檢附上開會議紀錄及旨揭會址之使用同意書呈請備查。'], signer: `理事長　${O(chairName())}` });
  return { title: '檢送會址變更公文', sheets: [{ name: '檢送會址變更公文', cols: [1], size: 14, ls: 1.5, blocks: B }] };
}

/* ---------- 會議紀錄 ---------- */
function propBlock(B, mk, i, num, o = {}) {
  const reason = PV(mk, i, 'reason'), proposer = PV(mk, i, 'proposer'), desc = PV(mk, i, 'desc'), method = PV(mk, i, 'method'), res = PV(mk, i, 'res');
  const head = o.style === 'tian' ? `提案${cn(num)}：` : o.style === 'an' ? `案由（${cn(num)}）：` : `（${cn(num)}）案由：`;
  let line = `${head}${reason || ''}`;
  if (proposer) line = o.style === 'an' ? `${line}${FW.repeat(2)}提案人：${proposer}。` : `${line.replace(/。$/, '')}（提案人－${proposer}）。`;
  SUBL(B, line, o.lv ?? 0, o.style === 'tian' ? 4 : 6);
  const ind = o.style === 'tian' ? 0 : 1;
  if (desc) desc.split('\n').forEach((l, j) => SUBL(B, j ? l : `說明：${l}`, ind, j ? 0 : 3, j ? { indent: ind * 2 + 3 } : {}));
  if (method) SUBL(B, `辦法：${method}`, ind, 3);
  SUBL(B, `${o.style === 'tian' ? '決　議' : '決議'}：${res || ''}`, ind, 3);
}
function motionsBlock(B, mk, o = {}) {
  const ms = (M(mk).motions || []).filter(x => !isBlank(x.prop) || !isBlank(x.res));
  if (!ms.length) { B[B.length - 1].text += '無。'; return; }
  ms.forEach((x, i) => { SUBL(B, `（${cn(i + 1)}）提案：${x.prop || ''}`, 0, 6); if (x.desc) SUBL(B, `說明：${x.desc}`, 1, 3); SUBL(B, `決議：${x.res || ''}`, 1, 3); });
}
function elResult(list, seats, alt) {
  const c = (list || []).filter(r => !isBlank(r.name)).map((r, i) => ({ ...r, name: r.name.trim(), _i: i, v: num(r.votes) })).sort((a, b) => b.v - a.v || a._i - b._i);
  const s = num(seats), a = num(alt);
  return { all: c, win: c.slice(0, s), alt: c.slice(s, s + a), lose: c.slice(s + a) };
}
function elOf(mk) { const el = M(mk).el || {}; return { el, dr: elResult(el.dirs, MV(mk, 'el.dirSeats'), MV(mk, 'el.dirAlt')), sr: elResult(el.sups, MV(mk, 'el.supSeats'), MV(mk, 'el.supAlt')) }; }
function staffLine(mk) { const el = M(mk).el || {}; return `監票員：${O(el.jp)}　發票員：${O(el.fp)}　唱票員：${O(el.cp)}　計票員：${O(el.jip)}`; }
function voteTable(res, title, groups = 3) {
  const items = [...res.win.map((c, i) => ({ no: cn(i + 1), ...c })), ...res.alt.map((c, i) => ({ no: '候補' + cn(i + 1), ...c })), ...res.lose.map(c => ({ no: '未當選', ...c }))];
  if (!items.length) for (let i = 0; i < 6; i++) items.push({ no: cn(i + 1), name: '', votes: '' });
  const L = { al: 'c', h: true };
  const rows = [{ hdr: true, cells: Array.from({ length: groups }, () => [{ v: '編號', ...L }, { v: '姓名', ...L }, { v: '得票數', ...L }]).flat() }];
  const per = Math.ceil(items.length / groups);
  for (let r = 0; r < per; r++) { const cells = []; for (let g = 0; g < groups; g++) { const it = items[g * per + r]; cells.push({ v: it ? it.no : '', al: 'c' }, { v: it ? it.name : '', al: 'c' }, { v: it && it.votes !== '' && it.votes != null ? String(it.votes) : '', al: 'c' }); } rows.push({ cells }); }
  return T(rows, { size: 11, cols: groups * 3 });
}
function attendLine(mk) {
  return `出席人員：${BL(getp(S, `m.${mk}.attend`))}人（詳如簽到名冊—需影印附於會議紀錄後）`;
}
function docMinutes(mk) {
  const k = MEET[mk].kind;
  const B = ({ prep1: minPrep1, prep2: minPrep2, foundAsm: minFoundAsm, foundBrd: minFoundBrd, pre: minPre, asm: minAsm, postBrd: minPostBrd, brd: minBrd, dissolve: minDissolve })[k](mk);
  const multiCol = B.some(b => b.t === 'table' && b.cols);
  const cols = multiCol ? [5, 9, 6, 5, 9, 6, 5, 9, 6] : [1];
  return { title: '會議紀錄', sheets: [{ name: '會議紀錄', cols, size: 13, ls: 1.5, blocks: B.map(b => { if (b.t === 'table' && !b.cols) b.full = 1; return b; }) }] };
}
function infoLines(B, mk, o = {}) {
  const m = M(mk), d = MV(mk, 'date');
  B.push(P(`時${FW}${FW}間：中華民國${rd(d)}${d ? `（${weekday(d)}）` : ''}${tm(MV(mk, 'time'))}`));
  B.push(P(`地${FW}${FW}點：${MV(mk, 'place')}`));
  if (o.attend !== false) B.push(P(o.attendText || attendLine(mk)));
  if (o.counts) { B.push(P(`缺席人員：${BL(MV(mk, 'absent'))}人`)); B.push(P(`請假人員：${BL(m.leave)}人`)); }
  if (o.obs) B.push(P(`列席人員：${m.obsNames || '無'}`));
  B.push(P(`主${FW}${FW}席：${MV(mk, 'chair') || FW.repeat(6)}${FW.repeat(8)}紀錄：${MV(mk, 'rec') || ''}`));
}
function minPrep1(mk) {
  const m = M(mk), B = [TITLE(orgFull(), { after: 0 }), TITLE('發起人暨第一次籌備會會議紀錄')];
  infoLines(B, mk, { attendText: `出席人員：發起人${BL(m.attend)}人（附簽到表影本）` });
  const H = heading();
  B.push(P(H(`會議開始（發起人代表擔任臨時主席）${m.tmpChair ? '：由' + m.tmpChair + '擔任臨時主席。' : ''}`), { before: 6 }));
  B.push(P(H(`推選主席：${MV(mk, 'chair') ? '推選' + MV(mk, 'chair') + '為主席。' : ''}`)));
  B.push(P(H(`主席致詞：${m.speech || '（略）'}`)));
  if (m.guest) B.push(P(H(`來賓致詞：${m.guest}`)));
  B.push(P(H(`報告事項：${m.reportText || '（略）'}`)));
  const ps = propsOf(mk);
  B.push(P(H('發起人會議討論提案：')));
  let a = 0; ps.forEach((p, i) => { if ((p.grp || 'b') === 'a') propBlock(B, mk, i, ++a, { lv: 1 }); });
  B.push(P(H('第一次籌備會議討論提案（由主任委員主持）（非籌備委員屬列席性質，得先行離席）：')));
  let b = 0; ps.forEach((p, i) => { if ((p.grp || 'b') !== 'a') propBlock(B, mk, i, ++b, { lv: 1 }); });
  B.push(P(H('臨時動議：'))); motionsBlock(B, mk);
  B.push(P(H(`散會：${tm(m.end)}。`)));
  B.push(signFooter(['主　　席', MV(mk, 'chair')], ['紀　　錄', MV(mk, 'rec')]));
  return B;
}
function minPrep2(mk) {
  const m = M(mk), B = [TITLE(orgFull(), { after: 0 }), TITLE('第二次籌備會會議紀錄')];
  infoLines(B, mk, { attendText: `出席人員：籌備委員${BL(m.attend)}人（附簽到表影本）` });
  const H = heading();
  B.push(P(H('會議開始'), { before: 6 }));
  B.push(P(H(`主席致詞：${m.speech || '（略）'}`)));
  if (m.guest) B.push(P(H(`來賓致詞：${m.guest}`)));
  B.push(P(H(`報告事項：${m.reportText || '（略）'}`)));
  B.push(P(H('討論提案：')));
  propsOf(mk).forEach((p, i) => propBlock(B, mk, i, i + 1, { lv: 1 }));
  B.push(P(H('臨時動議：'))); motionsBlock(B, mk);
  B.push(P(H(`散會：${tm(m.end)}。`)));
  B.push(signFooter(['主　　席', MV(mk, 'chair')], ['紀　　錄', MV(mk, 'rec')]));
  return B;
}
function minFoundAsm(mk) {
  const m = M(mk), B = [TITLE(`${orgFull()}第一屆第一次會員大會會議紀錄`)];
  infoLines(B, mk, { counts: true, obs: true });
  const H = heading();
  B.push(P(H(`主席致詞：${m.speech || '（略）'}`), { before: 6 }));
  B.push(P(H('主管機關致詞：（略）')));
  B.push(P(H(`來賓致詞：${m.guest || '（略）'}`)));
  B.push(P(H(`報告事項：${m.reportText || '籌備會經費執行及會務推展情形'}`)));
  B.push(P(H('討論提案：')));
  propsOf(mk).forEach((p, i) => propBlock(B, mk, i, i + 1, { style: 'an' }));
  const { dr, sr } = elOf(mk);
  B.push(P(H('選舉事項：選舉第一屆理事及監事。')));
  SUBL(B, staffLine(mk), 1);
  SUBL(B, '（一）第一屆理事選舉結果：（含全部候選人得票數）', 0);
  B.push(voteTable(dr, '理事'));
  SUBL(B, '（二）第一屆監事選舉結果：（含全部候選人得票數）', 0, 0, { before: 6 });
  B.push(voteTable(sr, '監事'));
  B.push(P(H('臨時動議：'), { before: 6 })); motionsBlock(B, mk);
  B.push(P(H(`散會：${tm(m.end)}。`)));
  B.push(signFooter(['主　　席', MV(mk, 'chair')], ['紀　　錄', MV(mk, 'rec')]));
  return B;
}
function chairElection(B, mk, H, first) {
  const el = M(mk).el || {}, t = first ? '第一屆' : `第${O(cn(mTerm(mk)), '○')}屆`;
  const stdD = MV(mk, 'el.stdDirs'), ch = MV(mk, 'el.chair'), ss = MV(mk, 'el.stdSup');
  const v = x => x ? `　${x}票` : '';
  return { t, stdD, ch, ss, chV: v(el.chairVotes), ssV: v(el.stdSupVotes), sdV: el.stdDirVotes ? `（${el.stdDirVotes}）` : '' };
}
function minFoundBrd(mk) {
  const m = M(mk), B = [TITLE(`${orgFull()}第一屆第一次理、監事聯席會議紀錄`)];
  infoLines(B, mk, { attendText: `出席人員：${BL(m.attend)}人（理事${BL(m.attendDir)}人，監事${BL(m.attendSup)}人，詳如簽到名冊—需影印附於會議紀錄後）` });
  B.push(P(`缺席人員：${m.absentNames || '無'}`), P(`請假人員：${m.leaveNames || '無'}`), P(`列席人員：${m.obsNames || '無'}`));
  const H = heading(), c = chairElection(B, mk, H, true);
  B.push(P(H(`主席致詞：${m.speech || '（略）'}`), { before: 6 }));
  B.push(P(H('主管機關致詞：（略）'))); B.push(P(H(`來賓致詞：${m.guest || '（略）'}`)));
  B.push(P(H(`報告事項：${m.reportText || ''}`)));
  B.push(P(H(`選舉事項：選舉第一屆${c.stdD ? '常務理事、' : ''}理事長及常務監事。`)));
  SUBL(B, staffLine(mk), 1);
  let q = 0;
  if (c.stdD) { SUBL(B, `（${cn(++q)}）請出席理事選出本會第一屆常務理事。`, 0); SUBL(B, `選舉結果：${c.stdD}${c.sdV}【當選本會第一屆常務理事】。`, 1); }
  SUBL(B, `（${cn(++q)}）請出席理事選出本會第一屆理事長。`, 0); SUBL(B, `選舉結果：${O(c.ch)}${c.chV || '　○票'}【當選本會第一屆理事長】。`, 1);
  SUBL(B, `（${cn(++q)}）請出席監事選出本會第一屆常務監事。`, 0); SUBL(B, `選舉結果：${O(c.ss)}${c.ssV || '　○票'}【當選本會第一屆常務監事】。`, 1);
  B.push(P(H('移交：籌備會主任委員將籌備期間之檔案、財產及人事等有關清冊一式四份移交第一屆理事長，由常務監事監交，並於十五日內接收完畢，分別簽章後，籌備會主任委員、理事長及團體各存一份、一份函報主管機關。主任委員與理事長為同一人時仍須辦理移交。'), { hang: 2 }));
  B.push(P(H(`第一屆理事長致詞。${m.chairSpeech ? m.chairSpeech : ''}`)));
  B.push(P(H('討論提案：')));
  propsOf(mk).forEach((p, i) => propBlock(B, mk, i, i + 1, { style: 'an' }));
  B.push(P(H('臨時動議：'))); motionsBlock(B, mk);
  B.push(P(H(`散會：${tm(m.end)}。`)));
  B.push(signFooter(['主　　席', MV(mk, 'chair')], ['紀　　錄', MV(mk, 'rec')]));
  return B;
}
function minPre(mk) {
  const m = M(mk), d = MV(mk, 'date'), B = [TITLE(`${orgFull()}第${O(cn(mTerm(mk)), '○')}屆第${O(cn(mNo(mk)), '○')}次理監事會議紀錄`)];
  B.push(P(`時間：民國${rd(d)}${d ? `（${weekday(d)}）` : ''}${tm(MV(mk, 'time'))}`), P(`地點：${MV(mk, 'place')}`));
  B.push(P(`主席：理事長　${MV(mk, 'chair')}${FW.repeat(6)}記錄：${MV(mk, 'rec')}`));
  B.push(P(`出席人員：應到理事${BL(names(DIR_ROLES).length || '')}人，應到監事${BL(names(SUP_ROLES).length || '')}人（附簽到表影本）`));
  B.push(P(`理事：${MV(mk, 'dirNames')}`, { hang: 3 }), P(`監事：${MV(mk, 'supNames')}`, { hang: 3 }), P(`請假人員：${m.leaveNames || '無'}`));
  const H = heading();
  B.push(P(H(`主席致詞${m.speech ? '：' + m.speech : '（略）'}`), { before: 6 }));
  B.push(P(H(`報告事項${m.reportText ? '：' + m.reportText : '（略）'}`)));
  B.push(P(H('討論提案：')));
  propsOf(mk).forEach((p, i) => propBlock(B, mk, i, i + 1, { style: 'tian' }));
  B.push(P(H('臨時動議：'))); motionsBlock(B, mk);
  B.push(P(H(`散會${m.end ? '：' + tm(m.end) + '。' : ''}`)));
  B.push(signFooter(['理 事 長', chairName()], ['紀　　錄', MV(mk, 'rec')]));
  return B;
}
function minAsm(mk) {
  const m = M(mk), sc = scenOf(mk), d = MV(mk, 'date'), B = [TITLE(`${orgFull()}${mTitle(mk)}會議紀錄`)];
  const H = heading(), sub = (t, lv = 1, hang = 0) => SUBL(B, t, lv, hang);
  B.push(P(H(`時　　間：中華民國${rd(d)}${d ? `（${weekday(d)}）` : ''}${tm(MV(mk, 'time'))}`)));
  B.push(P(H(`地　　點：${MV(mk, 'place')}`)));
  B.push(P(H(`出席人員：應出席人數${BL(MV(mk, 'should'))}人。實際出席人數${BL(m.attend)}人。（附簽到表影本）`)));
  B.push(P(H(`缺席人員：${BL(MV(mk, 'absent'))}人。`)), P(H(`請假人員：${BL(m.leave)}人。`)), P(H(`列席人員：${BL(m.obs)}人。`)));
  B.push(P(H(`主　　席：${MV(mk, 'chair') || FW.repeat(6)}${FW.repeat(4)}紀錄：${MV(mk, 'rec') || ''}`)));
  B.push(P(H(`主席致詞：${m.speech || '（略）'}${m.speech ? '' : '。'}`)), P(H('主管機關代表致詞：（略）。')));
  B.push(P(H(`上年度工作報告${m.reportText ? '：' : '。'}`))); if (m.reportText) sub(m.reportText, 1);
  B.push(P(H('討論事項：')));
  propsOf(mk).forEach((p, i) => propBlock(B, mk, i, i + 1));
  B.push(P(H('臨時動議：'))); motionsBlock(B, mk);
  if (MEET[mk].el) {
    const el = M(mk).el || {}, { dr, sr } = elOf(mk);
    const vl = l => l.map(c => `${c.name}（${c.votes === '' || c.votes == null ? '　' : c.votes}票）`).join('、');
    B.push(P(H('選舉')));
    sub('（一）推選選務工作人員：', 0);
    sub(`1.監票員：${O(el.jp)}${FW.repeat(2)}2.發票員：${O(el.fp)}`); sub(`3.唱票員：${O(el.cp)}${FW.repeat(2)}4.記票員：${O(el.jip)}`);
    sub('（二）選舉得票數：', 0);
    sub(`1.理事：${dr.all.length ? vl(dr.all) : '（候選人姓名）（得票數）'}`, 1, 2); sub(`2.監事：${sr.all.length ? vl(sr.all) : '（候選人姓名）（得票數）'}`, 1, 2);
    const altL = l => l.length ? l.map((c, i) => `第${cn(i + 1)}候補${c.name}`).join('、') : '無';
    sub('（三）當選人：', 0);
    sub(`1.理事：${dr.win.length ? vl(dr.win) : (names(DIR_ROLES).join('、') || '（當選人姓名）（得票數）')}`, 1, 2);
    sub(`2.監事：${sr.win.length ? vl(sr.win) : (names(SUP_ROLES).join('、') || '（當選人姓名）（得票數）')}`, 1, 2);
    sub(`3.候補理事：${dr.all.length ? altL(dr.alt) : (names(['候補理事']).map((n, i) => `第${cn(i + 1)}候補${n}`).join('、') || '無')}`, 1, 2);
    sub(`4.候補監事：${sr.all.length ? altL(sr.alt) : (names(['候補監事']).map((n, i) => `第${cn(i + 1)}候補${n}`).join('、') || '無')}`, 1, 2);
    B.push(P(H('主席當場宣布當選名單，無人異議。')));
  }
  B.push(P(H(`散　　會：${tm(m.end)}。`)));
  B.push(signFooter(['理 事 長', chairName()], ['紀　　錄', MV(mk, 'rec')]));
  return B;
}
function minPostBrd(mk) {
  const m = M(mk), d = MV(mk, 'date'), B = [TITLE(`${orgFull()}${mTitle(mk)}紀錄`)];
  const H = heading(), sub = (t, lv = 1, hang = 0) => SUBL(B, t, lv, hang), c = chairElection(B, mk, H, false);
  B.push(P(H(`時　　間：中華民國${rd(d)}${d ? `（${weekday(d)}）` : ''}${tm(MV(mk, 'time'))}`)));
  B.push(P(H(`地　　點：${MV(mk, 'place')}`)));
  B.push(P(H('出席人員：（附簽到表影本，分別職稱簽到）')));
  sub(`理　　事：${MV(mk, 'dirNames')}`, 1, 5); sub(`監　　事：${MV(mk, 'supNames')}`, 1, 5);
  B.push(P(H(`列席人員：${BL(m.obs)}人。`)));
  B.push(P(H(`主　　席：${MV(mk, 'chair') || FW.repeat(6)}${FW.repeat(4)}紀錄：${MV(mk, 'rec') || ''}`)));
  B.push(P(H(`主席致詞：${m.speech || '（略）'}${m.speech ? '' : '。'}`)), P(H('主管機關代表致詞：（略）。')));
  B.push(P(H(`選舉${c.t}${c.stdD ? '常務理事、' : ''}常務監事及理事長：`)));
  sub('當選人：');
  let q = 0;
  if (c.stdD) sub(`${++q}.常務理事：${c.stdD}${c.sdV}`, 1, 2);
  sub(`${++q}.常務監事：${c.ss || '（當選人姓名及得票數）'}${c.ssV ? `（${c.ssV.trim()}）` : ''}`, 1, 2);
  sub(`${++q}.理事長：${c.ch || '（當選人姓名及得票數）'}${c.chV ? `（${c.chV.trim()}）` : ''}`, 1, 2);
  sub('主席當場宣布當選結果，無人異議。');
  B.push(P(H('討論提案：')));
  propsOf(mk).forEach((p, i) => propBlock(B, mk, i, i + 1));
  B.push(P(H('臨時動議：'))); motionsBlock(B, mk);
  B.push(P(H(`散　　會：${tm(m.end)}。`)));
  B.push(signFooter(['理 事 長', MV(mk, 'el.chair') || chairName()], ['紀　　錄', MV(mk, 'rec')]));
  return B;
}
function minBrd(mk) {
  const m = M(mk), d = MV(mk, 'date'), B = [TITLE(`${orgFull()}第${O(cn(mTerm(mk)), '○')}屆第${O(cn(mNo(mk)), '○')}次理監事會議紀錄`)];
  B.push(P(`時間：民國${rd(d)}${d ? `（${weekday(d)}）` : ''}${tm(MV(mk, 'time'))}`), P(`地點：${MV(mk, 'place')}`));
  B.push(P(`主席：理事長　${MV(mk, 'chair')}${FW.repeat(6)}記錄：${MV(mk, 'rec')}`));
  B.push(P(`出席人員：應到理事${BL(names(DIR_ROLES).length || '')}人，應到監事${BL(names(SUP_ROLES).length || '')}人（附簽到表影本）`));
  B.push(P(`理事：${MV(mk, 'dirNames')}`, { hang: 3 }), P(`監事：${MV(mk, 'supNames')}`, { hang: 3 }), P(`請假人員：${m.leaveNames || '無'}`));
  const H = heading(), sub = (t, lv = 1, hang = 0) => SUBL(B, t, lv, hang);
  B.push(P(H(`主席致詞${m.speech ? '：' + m.speech : ''}`), { before: 6 }));
  B.push(P(H('報告事項')));
  sub('（一）會務報告：', 0);
  const p = MV(mk, 'cntPerson'), s = MV(mk, 'cntSuspended'), sp = MV(mk, 'cntSponsor');
  const tot = [p, s, sp].some(hasNum) ? String(num(p) + num(s) + num(sp)) : '';
  sub(`1.會籍：截至民國${rd(MV(mk, 'asOf'))}止，本會現有會員狀況如下：（1）個人會員：${BL(p)}人（2）停權會員：${BL(s)}人（3）贊助會員：${BL(sp)}人，共計：${BL(tot)}人。`, 1, 2);
  sub(`2.財務狀況：本季經費收支報表，詳如附件。（附件一）`, 1, 2);
  sub(`（二）業務報告：${m.reportText || ''}`, 0, 6);
  B.push(P(H('討論提案：')));
  const ps = propsOf(mk); const style = S.ui.boardAddr ? 'an' : 'tian';
  ps.forEach((x, i) => propBlock(B, mk, i, i + 1, { style }));
  B.push(P(H('臨時動議：'))); motionsBlock(B, mk);
  B.push(P(H(`散會${m.end ? '：' + tm(m.end) + '。' : ''}`)));
  B.push(signFooter(['理 事 長', chairName()], ['紀　　錄', MV(mk, 'rec')]));
  return B;
}
function minDissolve(mk) {
  const m = M(mk), d = MV(mk, 'date'), r = S.x.report, B = [TITLE(`${orgFull()}${mTitle(mk)}會議紀錄`)];
  const H = heading(), sub = (t, lv = 1, hang = 0) => SUBL(B, t, lv, hang);
  B.push(P(H(`日　　期：${rd(d)}${d ? `（${weekday(d)}）` : ''}${tm(MV(mk, 'time'))}`)));
  B.push(P(H(`地　　點：${MV(mk, 'place')}`)));
  B.push(P(H(`主　　席：${MV(mk, 'chair') || FW.repeat(6)}${FW.repeat(6)}紀錄：${MV(mk, 'rec') || ''}`)));
  B.push(P(H(`出席人員：應出席：${BL(MV(mk, 'should'))}人、實際出席：${BL(m.attend)}人`)));
  B.push(P(H(`列席人員：${m.obsNames || '無'}`)));
  B.push(P(H(`主席致詞：${m.speech || '略'}`)));
  B.push(P(H(`報告事項：${m.reportText || `本會因${r.reason || '……'}因素，且會員人數亦縮減至目前的${BL(voterCount() || '')}人，以致會務無法繼續推動，決定今天邀請各位會員召開本次大會，討論本會解散情形。`}`), { hang: 2 }));
  B.push(P(H('討論提案：')));
  propsOf(mk).forEach((p, i) => { SUBL(B, `（${cn(i + 1)}）${PV(mk, i, 'reason')}`, 0, 4); const de = PV(mk, i, 'desc'); if (de) sub(`說明：${de}`, 1, 3); sub(`決議：${PV(mk, i, 'res')}`, 1, 3); });
  B.push(P(H('臨時動議：'))); motionsBlock(B, mk);
  B.push(P(H(`散會${m.end ? '：' + tm(m.end) + '。' : ''}`)));
  B.push(signFooter(['主　　席', MV(mk, 'chair')], ['紀　　錄', MV(mk, 'rec')]));
  return B;
}

/* ---------- 簽到表 ---------- */
function signHead(mk, label) {
  const d = MV(mk, 'date');
  return `開會時間：${rd(d)}${d ? `（${weekday(d)}）` : ''}${tm(MV(mk, 'time'))}\n開會地點：${MV(mk, 'place')}`;
}
function docSignPrep(mk) {
  const L = { al: 'c', h: true, b: true };
  const ppl = peopleSorted().filter(r => PREP_ROLES.includes(r.role));
  const rows = [
    { hdr: true, cells: [{ v: `${orgFull()}籌備會\n${MEET[mk].label}簽到簿`, cs: 2, al: 'c', b: true, sz: 13 }, { v: signHead(mk), sz: 11 }] },
    { hdr: true, cells: [{ v: '職稱', ...L }, { v: '姓名', ...L }, { v: '簽名欄', ...L }] },
  ];
  ppl.forEach(p => rows.push({ h: 30, cells: [{ v: p.role, al: 'c' }, { v: p.name, al: 'c' }, { v: '' }] }));
  for (let i = ppl.length; i < Math.max(14, ppl.length + 3); i++) rows.push({ h: 30, cells: [{ v: '' }, { v: '' }, { v: '' }] });
  return { title: '簽到表', sheets: [{ name: '簽到表', cols: [18, 22, 60], size: 12, blocks: [T(rows, { size: 12, pad: 3 })] }] };
}
function docSignAsm(mk) {
  const L = { al: 'c', h: true, b: true };
  const list = []; const seen = new Set();
  peopleSorted().filter(r => [...DIR_ROLES, ...SUP_ROLES, '候補理事', '候補監事'].includes(r.role) && !isBlank(r.name)).forEach(r => { list.push({ role: r.role, name: r.name.trim() }); seen.add(r.name.trim()); });
  membersNamed().filter(isVoter).forEach(x => { if (!seen.has(x.name.trim())) { list.push({ role: x.type === '團體會員' ? '團體會員' : '會員', name: x.name.trim() }); seen.add(x.name.trim()); } });
  const blanks = list.length ? 4 : 18;
  for (let i = 0; i < blanks; i++) list.push({ role: '', name: '' });
  const per = 16, B = [];
  const head = () => [
    { hdr: true, cells: [{ v: `${orgFull()}\n${mTitle(mk)}簽到簿`, cs: 4, al: 'c', b: true, sz: 13 }, { v: signHead(mk), cs: 2, sz: 10 }] },
    { hdr: true, cells: ['序號', '職稱', '姓名', '親自出席簽名欄', '委託出席簽名欄', '備註(委託人)'].map(v => ({ v, ...L })) },
  ];
  for (let s = 0; s < list.length; s += per) {
    if (s) B.push(PB());
    const rows = head();
    list.slice(s, s + per).forEach((x, i) => rows.push({ h: 28, cells: [{ v: String(s + i + 1).padStart(3, '0'), al: 'c' }, { v: x.role, al: 'c' }, { v: x.name, al: 'c' }, { v: '' }, { v: '' }, { v: '' }] }));
    B.push(T(rows, { size: 12, pad: 2 }));
  }
  B.push(P('備註：出席過半始成會，出席數額包含親自出席及委託出席，會員無法親自出席會員大會者得委託其他出席會員代為行使其會員職權，因一人只能委託一人，一人只能受一人委託，故簽到簿需標示出席方式（親自出席及委託出席）以及註記受委託狀況，以杜絕「重複委託」及「重複受委託」之情事發生。', { size: 10, before: 6 }));
  return { title: '大會簽到表', sheets: [{ name: '大會簽到表', cols: [8, 12, 14, 24, 24, 18], size: 12, blocks: B }] };
}
function docSignBrd(mk) {
  const L = { al: 'c', h: true, b: true };
  const rows = [
    { hdr: true, cells: [{ v: `${orgFull()}\n${mTitle(mk)}簽到簿`, cs: 3, al: 'c', b: true, sz: 13 }, { v: signHead(mk), sz: 10 }] },
    { hdr: true, cells: ['職稱', '姓名', '簽名欄', '備註（註明請假或缺席）'].map(v => ({ v, ...L })) },
  ];
  const brd = peopleSorted().filter(r => [...DIR_ROLES, ...SUP_ROLES].includes(r.role));
  const staff = peopleSorted().filter(r => ['總幹事', '會計', '出納'].includes(r.role));
  if (brd.length) brd.forEach(p => rows.push({ h: 30, cells: [{ v: p.role, al: 'c' }, { v: p.name, al: 'c' }, { v: '' }, { v: '' }] }));
  else ['理事長', '常務理事', '常務理事', '理事', '理事', '理事', '理事', '理事', '理事', '常務監事', '監事', '監事'].forEach(r => rows.push({ h: 30, cells: [{ v: r, al: 'c' }, { v: '' }, { v: '' }, { v: '' }] }));
  rows.push({ h: 30, cells: [{ v: '' }, { v: '' }, { v: '' }, { v: '' }] });
  (staff.length ? staff : ['總幹事', '會計', '出納'].map(role => ({ role, name: '' }))).forEach(p => rows.push({ h: 30, cells: [{ v: p.role, al: 'c' }, { v: p.name, al: 'c' }, { v: '' }, { v: '' }] }));
  return { title: '理監事會簽到表', sheets: [{ name: '理監事會簽到表', cols: [16, 18, 36, 30], size: 12, blocks: [
    T(rows, { size: 12, pad: 2 }),
    P('備註：理、監事會不得委託出席，決議事項之效力端視議案之職權歸屬，屬理事會職權者須經理事1/2以上出席，表決多數決之，監事會亦同。', { size: 10, before: 6 }),
  ] }] };
}

/* ---------- 大會手冊：封面、議程 ---------- */
function docCover(mk) {
  const sc = scenOf(mk), d = MV(mk, 'date');
  const word = sc === 'found' ? '成立會員大會手冊' : '會員大會手冊';
  const head = sc === 'found' ? '第1屆第1次' : `第${O(mTerm(mk), '○')}屆第${O(mNo(mk), '○')}次`;
  return { title: '手冊封面', sheets: [{ name: '手冊封面', cols: [1], size: 16, ls: 1.4, blocks: [
    P(orgFull(), { align: 'c', size: 24, bold: true, before: 40, after: 6 }),
    P(head, { align: 'c', size: 20, after: 26 }),
    P(word.split('').join('\n'), { align: 'c', size: 40, bold: true, lh: 1.2, after: 30 }),
    P(`召開日期：${rd(d)}${d ? `（${weekday(d)}）` : ''}`, { align: 'c', size: 16, after: 4 }),
    P(`召開地點：${MV(mk, 'place')}`, { align: 'c', size: 16 }),
  ] }] };
}
function docAgenda(sc) {
  const B = [];
  const list = (title, items) => { B.push(TITLE(title, { before: B.length ? 18 : 0 })); items.forEach((t, i) => B.push(P(`${cn(i + 1)}、${t}`, { indent: 2, hang: 2 }))); };
  if (sc === 'found') {
    list(`${orgFull()}\n第一屆第一次會員大會議程`, ['大會開始', '主席就位', '全體肅立', '唱國歌', '向國旗暨　國父遺像行三鞠躬禮', '主席致詞', '介紹來賓', '來賓致詞（預先徵詢，如無則免列）', '籌備工作及籌備期間經費收支報告', '討論提案：\n１通過章程草案\n２通過年度工作計畫案\n３通過年度經費收支預算案\n４其他提案', '臨時動議', '選舉第一屆理監事', '散會']);
    list('第一屆第一次理監事會議程', ['召開第一屆第一次理事、監事聯席會議', '主席致詞（由籌備主委或理事最高票者擔任主席）', '選舉第一屆理事長及常務監事', '第一屆理事長致詞', '討論提案：\n１議決會址所在地\n２議決會務工作人員聘任案', '臨時動議', '散會']);
  } else {
    const mk = sc + '.asm', t = O(cn(mTerm(mk)), '○');
    const items = ['大會開始', '主席就位', '全體肅立', '唱國歌', '向國旗暨　國父遺像行三鞠躬禮', '主席致詞', '介紹來賓', '來賓致詞（預先徵詢，如無則免列）', '理事會工作報告、監事會監察報告', '討論提案：\n１通過年度經費收支決算案（財產清冊、資產負債表）\n２通過年度工作計畫案\n３通過年度經費收支預算案\n４其他提案', '臨時動議'];
    if (sc === 'renew') items.push(`選舉第${t}屆理事、監事`);
    items.push('散會');
    list(`${orgFull()}\n${mTitle(mk)}議程`, items);
    if (sc === 'renew') list(`第${t}屆第一次理監事會議程`, [`召開第${t}屆第一次理事、監事聯席會議`, '主席致詞（由原任理事長或理事最高票者擔任主席）', `選舉第${t}屆理事長及常務監事`, '宣佈移交事宜', `第${t}屆理事長致詞`, `討論提案：\n１議決第${t}屆會址所在地\n２議決第${t}屆會務工作人員聘任案`, '臨時動議', '散會']);
  }
  B.forEach(b => { if (b.text && b.text.includes('\n') && !b.bold) { const [a, ...r] = b.text.split('\n'); b.text = a + '\n' + r.map(x => FW.repeat(3) + x).join('\n'); } });
  return { title: '會議議程', sheets: [{ name: '會議議程', cols: [1], size: 14, ls: 1.6, blocks: B }] };
}
