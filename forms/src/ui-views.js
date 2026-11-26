/* ===== 財務報表編輯（手機友善） ===== */
SEC.fin = () => {
  const tab = S.ui.finTab || 'acc';
  const tabs = [['acc', '收支預算／決算'], ['prop', '財產目錄'], ['bs', '資產負債表'], ['fund', '基金收支'], ['set', '年度設定']];
  let body = '';
  if (tab === 'acc') {
    const leaf = a => { const v = S.fin.v[a.k] || {}; return `<div class="ar lv${a.lvl}"><input class="an" data-p="fin.names.${a.k}" value="${esc(S.fin.names[a.k] || '')}" placeholder="${esc(a.name)}" aria-label="科目名稱"><div class="av">${['b', 'pb', 'a'].map((c, j) => `<label><small>${['預算', '上年度預算', '決算'][j]}</small><input data-p="fin.v.${a.k}.${c}" value="${esc(v[c] ?? '')}" inputmode="decimal" class="num"></label>`).join('')}</div></div>`; };
    const parent = a => `<div class="ar par lv${a.lvl}"><input class="an" data-p="fin.names.${a.k}" value="${esc(S.fin.names[a.k] || '')}" placeholder="${esc(a.name)}" aria-label="科目名稱"><div class="av sum">${['b', 'pb', 'a'].map(c => `<span data-calc="acc:${a.k}:${c}"></span>`).join('')}</div></div>`;
    const grp = top => {
      let h = `<div class="ag"><div class="ah"><b>${accName(top)}</b><span class="av sum">${['b', 'pb', 'a'].map(c => `<span data-calc="acc:${top.k}:${c}"></span>`).join('')}</span></div>`;
      for (const a of top.kids) {
        if (a.kids) { const open = OPEN.has('acc.' + a.k) || a.kids.some(k => !accZero(k)); h += `<details class="asub"${open ? ' open' : ''} data-det="acc.${a.k}"><summary>${parent(a)}</summary>${a.kids.map(leaf).join('')}</details>`; }
        else h += leaf(a);
      }
      return h + '</div>';
    };
    body = NOTE(`三欄依序為：<b>${O(BY(), '○')}年度預算</b>、<b>${O(Y(), '○')}年度預算（上年度預算＝決算表的預算數）</b>、<b>${O(Y(), '○')}年度決算</b>。科目名稱可直接修改，預算表與決算表會同步。`) +
      `<div class="acc">${ACC.map(grp).join('')}<div class="ah sur"><b>本期餘絀</b><span class="av sum">${['b', 'pb', 'a'].map(c => `<span data-calc="sur:${c}"></span>`).join('')}</span></div></div>` +
      GRID(F('fin.prev', '上期餘絀（決算用）', { type: 'num', w: 'half', suf: '元' }) + F('fin.cashPrev', '上期現金結存', { type: 'num', w: 'half', suf: '元' })) + calc('finChecks');
  } else if (tab === 'prop') {
    body = NOTE('財產科目留空表示與上一筆相同。各科目金額會自動帶入資產負債表的固定資產／雜項資產。') +
      LISTC('fin.prop', [{ k: 'cat', label: '財產科目', type: 'sel', opts: PROP_CATS, w: 'half' }, { k: 'name', label: '名稱', w: 'half' }, { k: 'date', label: '購置日期', w: 'third', ph: '例：104年12月' }, { k: 'unit', label: '單位', w: 'third' }, { k: 'qty', label: '數量', type: 'num', w: 'third' }, { k: 'amt', label: '金額', type: 'num', w: 'half', suf: '元' }, { k: 'loc', label: '存放地點', w: 'half' }, { k: 'note', label: '說明', w: 'full' }],
        { summary: r => [r.name, hasNum(r.amt) ? fmt(num(r.amt)) + '元' : ''].filter(Boolean).join('　'), addLabel: '新增財產' }) + calc('propTotal');
  } else if (tab === 'bs') {
    const grp = (g) => `<div class="bsg"><div class="bsh"><b>${g.name}</b><span data-calc="bsg:${g.k}"></span></div>${g.kids.map(n => `<label class="bsr"><span>${n}${bsDerived(n) != null ? '<span class="auto">自動</span>' : ''}</span><input data-p="fin.bs.${n}" value="${esc(S.fin.bs[n] ?? '')}" inputmode="decimal" class="num"></label>`).join('')}</div>`;
    body = NOTE('灰色數字是自動帶入的：固定資產與雜項資產來自財產目錄，資產基金＝固定資產＋雜項資產＋存出保證金，基金與提撥基金來自基金收支表，本期／上期餘絀來自決算。') +
      `<div class="bs"><div><div class="bst">資產 <span data-calc="bsA"></span></div>${BS_LEFT.map(grp).join('')}</div><div><div class="bst">負債 <span data-calc="bsL"></span></div>${BS_RIGHT_L.map(grp).join('')}<div class="bst">權益 <span data-calc="bsE"></span></div>${BS_RIGHT_E.map(grp).join('')}</div></div>` + calc('bsCheck');
  } else if (tab === 'fund') {
    body = H4('收入') + GRID(F('fin.fund.acc', '歷年累存', { type: 'num', w: 'third', suf: '元' }) + F('fin.fund.int', '本年度利息收入', { type: 'num', w: 'third', suf: '元' }) + F('fin.fund.add', '本年度提撥', { type: 'num', w: 'third', suf: '元' })) +
      H4('支出') + GRID(F('fin.fund.o1n', '支付項目', { w: 'half' }) + F('fin.fund.o1', '金額', { type: 'num', w: 'half', suf: '元' }) + F('fin.fund.o2n', '支付項目', { w: 'half' }) + F('fin.fund.o2', '金額', { type: 'num', w: 'half', suf: '元' }) + F('fin.fund.o3', '支付退職金', { type: 'num', w: 'half', suf: '元' }) + F('fin.fund.o4', '支付退休金', { type: 'num', w: 'half', suf: '元' })) +
      calc('fundTotal') + GRID(F('fin.fund.notes', '說明（每行一點；無動支可留空）', { type: 'area', rows: 3, w: 'full', ph: '1.支付○○○總幹事退職金經第○屆第○次理事會通過，報經屏東縣政府○年○月○日屏府社政字第○○○○號函核准動支。' }));
  } else {
    body = H4('表冊簽章人員') + GRID(F('org.maker', '製表人', { w: 'half', hint: '財務報表、預算表、收支報告的「製表」欄，上傳印章後自動核章。' }) + F('org.keeper', '財產保管人', { w: 'half', hint: '財產目錄的「保管」欄。' })) + H4('年度') + GRID(F('fin.year', '決算年度', { type: 'num', w: 'half', suf: '年', hint: '預設為會議年度的前一年。' }) + F('fin.budgetYear', '預算／工作計畫年度', { type: 'num', w: 'half', suf: '年', hint: '預設為決算年度＋1。' }) +
      (S.ui.scen === 'dissolve' ? F('fin.end', '報表截止日期（解散日）', { type: 'date', w: 'half', hint: '解散時請與解散日期一致。' }) : '') +
      `<div class="f full">${CK('fin.hideZero', '輸出時省略預算、上年度預算、決算皆為 0 的科目')}</div>`);
  }
  return `<div class="tabs" role="tablist">${tabs.map(([k, l]) => `<button type="button" role="tab" aria-selected="${k === tab}" data-fintab="${k}" class="${k === tab ? 'on' : ''}">${l}</button>`).join('')}</div>${body}`;
};

/* ===== 計算顯示 ===== */
const CALC = {
  orgFull: () => esc(orgFull()),
  seatCheck: () => seatWarn(num(V('org.dirSeats')), num(V('org.supSeats')), num(V('org.dirAlt')), num(V('org.supAlt')), num(S.org.stdDirSeats)),
  seatCheckStatute: () => seatWarn(num(V('statute.dirs')), num(V('statute.sups')), num(V('statute.dirAlt')), num(V('statute.supAlt')), num(V('statute.stdDirs'))),
  peopleCount: () => {
    const c = {}; S.people.forEach(r => { if (r.role && !isBlank(r.name)) c[r.role] = (c[r.role] || 0) + 1; });
    const s = ROLES.filter(r => c[r]).map(r => `<span class="pill">${r} ${c[r]}</span>`).join('');
    const w = [];
    if ((c['理事長'] || 0) > 1) w.push('有兩位以上理事長，請確認職別。');
    const bad = S.people.filter(p => !isBlank(p.idno) && !checkTwId(p.idno)).map(p => p.name || '（未填姓名）');
    if (bad.length) w.push(`身分證字號格式可能有誤：${bad.join('、')}`);
    return (s ? `<div class="pills">${s}</div>` : '<div class="muted">尚未輸入人員</div>') + w.map(t => `<div class="warn">${icon('warn')}${esc(t)}</div>`).join('');
  },
  memberCount: () => { const s = memberStats(); return s.total ? `<div class="pills"><span class="pill">共 ${s.total} 筆</span><span class="pill">個人 ${s.person}</span><span class="pill">團體 ${s.group}</span><span class="pill">贊助 ${s.sponsor}</span><span class="pill">停權 ${s.suspended}</span><span class="pill on">大會應出席 ${s.voters}</span></div>` : '<div class="muted">尚未輸入會員</div>'; },
  planTotal: () => `<div class="sumline">經費預估合計 <b>${fmt(S.plan.rows.reduce((s, r) => s + num(r.cost), 0))}</b> 元${accVal(ACC_BY.exp, 'b') ? `　｜　預算表支出總計 ${fmt(accVal(ACC_BY.exp, 'b'))} 元` : ''}</div>`,
  ledgerTotal: () => { const r = S.x.ledger.rows || [], i = r.reduce((s, x) => s + num(x.inc), 0), e = r.reduce((s, x) => s + num(x.exp), 0); return `<div class="sumline">收入 <b>${fmt(i)}</b>　支出 <b>${fmt(e)}</b>　餘額 <b>${fmt(num(S.x.ledger.open) + i - e)}</b> 元</div>`; },
  prepfinTotal: () => { const i = (S.x.prepfin.inc || []).reduce((s, x) => s + num(x.amt), 0), e = (S.x.prepfin.exp || []).reduce((s, x) => s + num(x.amt), 0); return `<div class="sumline ${i - e < 0 ? 'bad' : ''}">收入 <b>${fmt(i)}</b>　支出 <b>${fmt(e)}</b>　結餘 <b>${fmt(i - e)}</b> 元${i - e < 0 ? '（不得負債）' : ''}</div>`; },
  dissolveCheck: () => {
    const a = num(getp(S, 'm.dissolve.asm.attend')), g = num(S.x.report.agree); if (!a || !g) return '<div class="muted">填入大會實際出席人數與同意人數後，會自動檢查是否達到法定比例。</div>';
    if (S.org.corp === '有') {
      /* 已辦法人登記：民法第57條，全體會員三分之二以上可決 */
      const all = num(MV('dissolve.asm', 'should')), nAll = Math.ceil(all * 2 / 3);
      if (!all) return '<div class="muted">已辦社團法人登記：請先填應出席人數（全體會員），才能檢查是否達全體會員三分之二以上同意（民法第57條）。</div>';
      return g >= nAll ? `<div class="ok">${icon('check')}同意 ${g} 人，已達全體會員 ${all} 人的三分之二（${nAll} 人，民法第57條）。章程訂有更高門檻時，依章程規定。</div>`
        : `<div class="bad">${icon('warn')}同意 ${g} 人，未達全體會員 ${all} 人的三分之二（需 ${nAll} 人）。已辦社團法人登記的團體，解散須經全體會員三分之二以上同意（民法第57條），出席與同意人數都要達到這個數字。</div>`;
    }
    const need = Math.ceil(a * 2 / 3);
    return g >= need ? `<div class="ok">${icon('check')}同意 ${g} 人，已達出席 ${a} 人的三分之二（${need} 人，人民團體法第27條）。章程訂有更高門檻時，依章程規定。</div>` : `<div class="bad">${icon('warn')}同意 ${g} 人，未達出席 ${a} 人的三分之二（需 ${need} 人，人民團體法第27條）。</div>`;
  },
  propTotal: () => `<div class="sumline">財產合計 <b>${fmt(propSum(''))}</b> 元</div>`,
  bsA: () => fmt(bsAssets()), bsL: () => fmt(bsLiab()), bsE: () => fmt(bsEquity()),
  bsCheck: () => { const a = bsAssets(), r = bsLiab() + bsEquity(); return a === r ? `<div class="ok">${icon('check')}兩方合計相同：${fmt(a)} 元</div>` : `<div class="bad">${icon('warn')}兩方合計不同：資產 ${fmt(a)}，負債基金暨餘絀 ${fmt(r)}（差 ${fmt(a - r)}）</div>`; },
  fundTotal: () => `<div class="sumline">收入合計 <b>${fmt(fundIn())}</b>　支出 ${fmt(fundOut())}　結餘 <b>${fmt(fundIn() - fundOut())}</b> 元</div>`,
  finChecks: () => {
    const b = finSurplus('b'), out = [];
    out.push(b === 0 ? `<div class="ok">${icon('check')}預算收支平衡（本期餘絀為 0）</div>` : `<div class="bad">${icon('warn')}預算本期餘絀為 ${fmt(b)}，預算應本收支平衡原則編列，餘絀需歸零。</div>`);
    out.push(`<div class="sumline">決算：收入 ${fmt(accVal(ACC_BY.inc, 'a'))}・支出 ${fmt(accVal(ACC_BY.exp, 'a'))}・本期餘絀 <b>${fmt(finSurplus('a'))}</b>・累計餘絀 <b>${fmt(finSurplus('a') + num(S.fin.prev))}</b></div>`);
    return out.join('');
  },
};
function seatWarn(d, s, da, sa, sd) {
  const w = [];
  if (d > 15) w.push('理事名額不得超過十五人。');
  if (d && s > Math.floor(d / 3)) w.push(`監事名額不得超過理事名額三分之一（最多 ${Math.floor(d / 3)} 人）。`);
  if (d && da > Math.floor(d / 3)) w.push('候補理事不得超過理事名額三分之一。');
  if (s && sa > Math.floor(s / 3)) w.push('候補監事不得超過監事名額三分之一。');
  if (sd && d && sd > Math.floor(d / 3)) w.push('常務理事不得超過理事總額三分之一。');
  if ((d && d % 2 === 0) || (s && s % 2 === 0)) w.push('理事、監事名額應定額並為奇數（人民團體會務輔導辦法第9條）。');
  if ((d && d < 9) || (s && s < 3)) w.push('理事至少九人、監事至少三人；自由職業團體會員不足十二人者不在此限（人民團體會務輔導辦法第9條）。');
  if (!d) return '<div class="muted">理事9至15人、監事至少3人且不超過理事三分之一、候補不超過正選三分之一，名額應為奇數。</div>';
  return w.length ? w.map(t => `<div class="warn">${icon('warn')}${t}</div>`).join('') : `<div class="ok">${icon('check')}名額符合規定。</div>`;
}
function calcVal(key) {
  if (CALC[key]) return CALC[key]();
  const i = key.indexOf(':'), t = key.slice(0, i), rest = key.slice(i + 1);
  if (t === 'acc') { const [a, b] = rest.split(':'); return fmt(accVal(ACC_BY[a], b)); }
  if (t === 'sur') return fmt(finSurplus(rest));
  if (t === 'bsg') return fmt(bsGroupSum([...BS_LEFT, ...BS_RIGHT_L, ...BS_RIGHT_E].find(g => g.k === rest)));
  if (t === 'deadline') return deadlineCard(rest);
  if (t === 'preDeadline') { const ad = MV(MEET[rest].before, 'date'); return ad ? `大會${rd(ad)} → 本會議最晚 <b>${rd(addDays(ad, -15))}</b> 召開。` : ''; }
  if (t === 'quorum') { const mk = rest; const s = num(MV(mk, 'should')), at = num(getp(S, `m.${mk}.attend`)); if (!s || !at) return ''; return at > s / 2 ? `<div class="ok">${icon('check')}出席 ${at} 人，已過半數（應出席 ${s} 人），會議可成立。</div>` : `<div class="bad">${icon('warn')}出席 ${at} 人，未過半數（需 ${Math.floor(s / 2) + 1} 人），會議無法成立。</div>`; }
  if (t === 'elResult') { const mk = rest, { dr, sr } = elOf(mk); if (!dr.all.length && !sr.all.length) return '<div class="muted">輸入候選人與得票數後，這裡會依票數排出當選與候補名單。</div>'; const f = (lab, l) => `<div><b>${lab}</b>${l.length ? l.map(c => `${esc(c.name)}（${c.v}）`).join('、') : '—'}</div>`; const tie = (lab, r) => { const seq = [...r.win.map(c => ['w', c]), ...r.alt.map((c, i) => ['a' + i, c]), ...r.lose.map(c => ['l', c])], t = new Set(); for (let i = 1; i < seq.length; i++) if (seq[i][1].v === seq[i - 1][1].v && seq[i][0] !== seq[i - 1][0]) { t.add(seq[i - 1][1].name); t.add(seq[i][1].name); } return t.size ? `<div class="warn">${icon('warn')}${lab}${[...t].map(esc).join('、')}票數相同，當選與候補名次要以抽籤決定（人民團體選舉罷免辦法第15條）；請依抽籤結果調整候選人的排列順序，排在前面的優先。</div>` : ''; };
    const both = dr.win.filter(c => sr.win.some(x => x.name === c.name)).map(c => c.name);
    return `<div class="elres">${f('當選理事：', dr.win)}${f('候補理事：', dr.alt)}${f('當選監事：', sr.win)}${f('候補監事：', sr.alt)}</div>${tie('理事', dr)}${tie('監事', sr)}${both.length ? `<div class="warn">${icon('warn')}${both.map(esc).join('、')}同時當選理事與監事，只能擇一擔任（人民團體選舉罷免辦法第16條）。</div>` : ''}`; }
  return '';
}
function deadlineCard(mk) {
  const d = MEET[mk], dt = MV(mk, 'date');
  if (!dt) return `<div class="dl muted">${icon('clock')}填入日期後，系統會自動算出開會通知與紀錄送府的期限。</div>`;
  const today = isoToday(), n = addDays(dt, -d.days), l = addDays(dt, 30);
  const left = x => { const v = daysBetween(today, x); return v == null ? '' : v < 0 ? `<em class="late">已過 ${-v} 天</em>` : v === 0 ? '<em class="soon">今天</em>' : `<em${v <= 3 ? ' class="soon"' : ''}>剩 ${v} 天</em>`; };
  if (brdOnly(mk)) return `<div class="dl">${icon('clock')}<div><div>開會通知最晚 <b>${rd(n)}（${weekday(n)}）</b>送達各理事、監事（會議前 7 日）${left(n)}</div><div>會議紀錄閉會後自行留存、提供會員查閱；只有依法令須報縣府的事項（例如會址變更）才檢附文件報送。</div><div class="muted">${rd(dt)}（${weekday(dt)}）${tm(MV(mk, 'time'))}開會</div></div></div>`;
  return `<div class="dl">${icon('clock')}<div><div>開會通知單最晚 <b>${rd(n)}（${weekday(n)}）</b>送達縣府 ${left(n)}</div>${d.same ? '' : `<div>會議紀錄最晚 <b>${rd(l)}（${weekday(l)}）</b>前函送縣府 ${left(l)}</div>`}<div class="muted">${rd(dt)}（${weekday(dt)}）${tm(MV(mk, 'time'))}開會</div></div></div>`;
}

/* ===== 畫面 ===== */
function setHeader(title, sub, back) {
  $('#hTitle').textContent = title; $('#hSub').textContent = sub || '';
  $('#back').hidden = !back;
}
/* 開會通知單的報告／討論事項提到「工作計畫、財務報表、會員名冊…」時，自動勾選為開會通知檢附資料並提示 */
const REFW = {}; let refT = 0;
function refWatch(silent) {
  const sc = S.ui.scen; if (!sc || !SCEN[sc]) return;
  const na = scenDocs(sc).filter(x => x.nm), byMk = {};
  na.forEach(x => (byMk[x.nm] = byMk[x.nm] || []).push(x));
  const add = [], drop = [];
  for (const mk in byMk) {
    const now = noticeRefs(mk), key = sc + '|' + mk, was = REFW[key];
    if (silent) { if (!was) REFW[key] = now; continue; }
    REFW[key] = now; if (!was) continue;
    byMk[mk].forEach(x => { if ((S.sel[sc] || {})[x.sk] != null) return; if (now.has(x.id) && !was.has(x.id)) add.push(x.name); if (!now.has(x.id) && was.has(x.id)) drop.push(x.name); });
  }
  const msg = [add.length ? `開會通知單提到「${add.join('、')}」，已自動勾選為開會通知檢附資料（可線上填寫或上傳）` : '', drop.length ? `通知單不再提到「${drop.join('、')}」，已取消自動勾選` : ''].filter(Boolean).join('；');
  if (msg) toast(msg);
  if (add.length || drop.length) { const n = selDocs(sc).filter(x => x.kind !== 'attach').length, b = $('#dock .dk-t b'); if (b) b.textContent = n; }
}
function refWatchSoon() { clearTimeout(refT); refT = setTimeout(() => refWatch(), 700); }

function render(o = {}) {
  refWatch(true); tipHide();
  if (isDesk() !== deskNow) applyLayout();
  document.documentElement.classList.toggle('large', !!S.ui.large);
  const v = S.ui.view;
  $('#view').className = 'view v-' + v + (v === 'scen' ? ' s-' + S.ui.step : '');
  if (v === 'scen' && SCEN[S.ui.scen]) renderScen(); else if (v === 'help') renderHelp(); else renderHome();
  if (!o.keep) window.scrollTo({ top: 0 });
}
function scenProgress(sc) {
  const secs = sectionsFor(sc); if (!secs.length) return 0;
  const r = secs.map(secDone); const tot = r.reduce((s, x) => s + x.total, 0), ok = r.reduce((s, x) => s + x.ok, 0);
  return tot ? Math.round(ok / tot * 100) : 0;
}
/** 電腦版首頁：工具與說明 */
function homeTools() {
  const n = (S.seals || []).length;
  return `<div class="hgrp tools"><h3 class="hg">工具與說明</h3><div class="tiles"><button class="tile tool" data-cmd="sealOpen">${icon('stamp', 'big')}<b>電子印章與簽名</b><small>上傳印章照片自動去背，下載的文件自動核章</small><span class="cnt">${n ? `已上傳 ${n} 顆` : '設定'}</span></button><button class="tile tool" data-go="help">${icon('info', 'big')}<b>會務事項一覽表</b><small>什麼事要報核、報備，期限與法規依據</small><span class="cnt">查詢</span></button></div></div>`;
}
function renderHome() {
  setHeader('會務文件線上填報', '屏東縣社團（職業團體）', false);
  $('#steps').hidden = true; $('#dock').hidden = true;
  const last = S.ui.scen && SCEN[S.ui.scen] ? S.ui.scen : '';
  const D = isDesk(), hero = `<section class="hero">
    <h1>會務文件，<br>一次填好、處處帶入</h1>
    <p>選擇要辦理的事項，就會列出屏東縣政府社會處範本的所有文件。團體、人員、日期這些共同資料只要填一次，就會自動帶入每一份文件，完成後可下載 Word、Excel 或 PDF。</p>
    ${S.org.name ? `<div class="orgchip">${icon('org')}<span>${esc(orgFull())}</span></div>` : `<div class="hsearch"><label for="homeOrg">${icon('org')}先找到您的團體</label><div class="in"><input id="homeOrg" data-acorg="1" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false" placeholder="輸入團體名稱、理事長或電話的關鍵字"></div><small>從縣府人民團體名冊自動帶入會址、電話、理事長等資料，之後都可以修改；名冊沒有的團體，到填資料再輸入即可。</small></div>`}
  </section>`;
  const resume = `${last ? `<button class="resume" data-go="scen" data-scen="${last}">${icon(SCEN[last].icon)}<span><small>繼續填寫</small><b>${SCEN[last].title}</b></span><span class="ring" style="--p:${scenProgress(last)}">${scenProgress(last)}%</span></button>` : ''}`, side = `${backupReminder()}${upcomingCard()}`;
  const groups = `<h2 class="h2">我要辦理</h2><div class="hgroups">${HOME_GROUPS.map(([g, ks]) => { const flow = ks.length === 2 && SCEN[ks[1]].prev === ks[0]; return `<div class="hgrp${ks.length > 2 ? ' wide' : ''}"><h3 class="hg">${g}${flow ? '<small>依序辦理</small>' : ''}</h3><div class="tiles${flow ? ' flow' : ''}">${ks.map((k, i) => `<button class="tile" data-go="scen" data-scen="${k}">${flow ? `<span class="stepno">第${i + 1}步</span>` : ''}${icon(SCEN[k].icon, 'big')}<b>${SCEN[k].title}</b><small>${SCEN[k].sub}</small><span class="cnt">${allDocCount(k)} 份文件</span></button>`).join('')}</div></div>${D && g === '每年常會' ? homeTools() : ''}`; }).join('')}</div>`;
  const help = `<button class="rowlink" data-go="help">${icon('info')}<span><b>會務事項一覽表</b><small>什麼事要報核、報備，期限與法規依據</small></span>${icon('back', 'flip')}</button>`, tips = `<section class="tips">
    <h3>使用小提醒</h3>
    <ul>
      <li>${cloudReady() ? '資料預設只存在這支手機或這台電腦的瀏覽器裡；登入 Google 帳號，可以自動存到<b>您自己的雲端硬碟</b>，換裝置也能接著填。' : '資料只存在這支手機或這台電腦的瀏覽器裡，不會上傳到任何伺服器。'}</li>
      <li>換裝置或交接給下一任，也可以用右上角「⋯」的<b>備份資料</b>${canShareFiles() ? '或<b>分享備份檔</b>（寄到自己的信箱）' : ''}，再到新裝置<b>還原資料</b>。</li>
      <li>不確定怎麼填？右上角「⋯」可以<b>載入範例資料</b>，看看填好的樣子。</li>
      <li>不熟悉操作？按右上角的 <b>?</b> 開啟<b>操作提示</b>，滑鼠移到欄位或按鈕上（手機：點欄位）就會顯示說明與提醒。</li>
      <li>本網頁是協助填報的輔助工具，並非政府機關官方網站；送件格式以主管機關規定為準。</li>
    </ul>
  </section>`;
  $('#view').innerHTML = D
    ? `${guide('home')}<div class="homegrid"><div class="hmain">${hero}${groups}</div><aside class="haside">${resume}${side}${tips}</aside></div>`
    : `${guide('home')}${hero}${resume}${side}${groups}${help}${tips}`;
}
/** 首頁：各選單已排定會議的近期期限 */
function allUpcoming(limitDays = 120) {
  const today = isoToday(), out = [], seen = new Set();
  for (const sc of SCEN_ORDER) for (const x of deadlines(sc)) {
    if (!x.when || x.kind === 'none') continue;
    const v = daysBetween(today, x.when); if (v == null || v < 0 || v > limitDays) continue;
    const key = x.when + x.what; if (seen.has(key)) continue; seen.add(key);
    out.push({ ...x, sc, left: v });
  }
  return out.sort((a, b) => a.left - b.left);
}
function upcomingCard() {
  const list = allUpcoming(); if (!list.length) return '';
  const lf = v => v === 0 ? '今天' : v === 1 ? '明天' : `還有 ${v} 天`;
  return `<section class="card upc"><h3>${icon('clock')}近期期限<button class="mini cal" data-cmd="ics" data-scen="">${icon('cal')}加入行事曆</button></h3><ol class="tl">${list.slice(0, 4).map(x => `<li class="${x.left <= 3 ? 'soon' : ''}"><span class="d">${rd(x.when)}<small>${weekday(x.when)}・${lf(x.left)}</small></span><span class="w"><button class="lk" data-go="scen" data-scen="${x.sc}">${esc(x.what)}</button><small>${SCEN[x.sc].title}</small></span></li>`).join('')}</ol>${list.length > 4 ? `<p class="muted small">另有 ${list.length - 4} 個期限，請到各選單的「下載」步驟查看。</p>` : ''}</section>`;
}
function stepsBar() {
  const sc = S.ui.scen, n = selDocs(sc).filter(x => x.kind !== 'attach').length, p = scenProgress(sc);
  const st = [['docs', '選文件', `${n} 份`], ['fill', '填資料', `${p}%`], ['dl', '下載', '']];
  return st.map(([k, l, c], i) => `<button type="button" class="${S.ui.step === k ? 'on' : ''}" data-step="${k}"><i>${i + 1}</i><span>${l}</span>${c ? `<small>${c}</small>` : ''}</button>`).join('');
}
function renderScen() {
  const sc = S.ui.scen, s = SCEN[sc];
  setHeader(s.title, ['選擇要準備的文件', '填寫資料', '預覽與下載'][['docs', 'fill', 'dl'].indexOf(S.ui.step)], true);
  $('#steps').hidden = false; $('#steps').innerHTML = stepsBar();
  if (S.ui.step === 'fill') renderFill(); else if (S.ui.step === 'dl') renderDl(); else renderDocs();
}
function renderDocs() {
  const sc = S.ui.scen, list = scenDocs(sc);
  let h = guide('docs');
  if (sc === 'prep') h += `<div class="card">${H4('本次會議')}${SEG('ui.prepVar', [['p1', '發起人暨第一次籌備會'], ['p2', '第二次籌備會']], { rr: 1 })}</div>`;
  if (sc === 'board') h += `<div class="card">${CK('ui.boardAddr', '本次會議要討論會址變更', { rr: 1 })}<div class="muted small">勾選後會加入「檢送會址變更公文」、會議紀錄改用會址變更範本，並需附會址使用同意書。</div></div>`;
  if (sc === 'dissolve') h += `<details class="card info"><summary>${icon('info')}縣府「團體解散說明」</summary><div class="small">
    <p><b>流程：</b>函寄大會通知函 → 召開會員大會 → 團體函送大會紀錄及相關資料報屏東縣政府 → 收到屏東縣政府核准解散函 →（清算人可自行向會址所在地之國稅局查詢解散情形）。</p>
    <p><b>會議內容：</b>1.同意解散及決議解散日期（可與大會日期不同）。2.出席與決議門檻：未辦法人登記者，應有會員（會員代表）過半數出席，出席人數三分之二以上同意（人民團體法第27條）；已辦社團法人登記者，須經全體會員三分之二以上同意（民法第57條），出席與同意人數都要達到全體會員的三分之二。章程訂有更高門檻時，依章程規定。（常聽到的「四分之三」是民法第53條社團法人變更章程的門檻，不是解散門檻。）3.五項財務報表（截止日期與解散日期一致）。4.剩餘財產歸屬（請以公部門為主，其他團體為次）。5.選出清算人（為理事長）。</p>
    <p><b>應附資料：</b>第一階段：會員大會紀錄、各項財務報表（共5項，缺一不可）、解散報告表、原核發之立案證書、圖記、理事長當選證明書、其他相關資料。第二階段（如有後續清算資產）：解散報告表、剩餘財產歸屬資料（造冊由清算人簽章）。</p>
    <p><b>備註：</b>五項財務報表截止日期、解散日期、大會召開日期三者請決議一致；清算日期可延後。會議紀錄範例格式及提案請勿刪減。</p></div></details>`;
  const prev = SCEN[sc].prev;
  if (prev && ['renewPre', 'annualPre'].includes(prev)) h += `<button class="rowlink slim" data-go="scen" data-scen="${prev}">${icon('info')}<span><b>請先召開「${SCEN[prev].title}」</b><small>大會前15日以前召開，審查工作計畫、財務報表與會員名冊；填過的資料這裡會自動帶入。</small></span>${icon('back', 'flip')}</button>`;
  const on = batchOn(sc), both = on.pre && on.post;
  if (hasBatch(sc)) {
    const days = MEET[mainMeet(sc)].days;
    h += `<div class="batches" role="group" aria-label="這次要準備的文件">${[PRE, POST].map(k => `<button type="button" class="bt${on[k] ? ' on' : ''}" data-batch="${k}" aria-pressed="${on[k]}"><span class="bn">${BATCH[k].n}</span><span class="bd"><b>${BATCH[k].t}</b><small>${BATCH[k].s(days, sc)}</small></span><span class="bck">${icon('check')}</span></button>`).join('')}</div>
      <p class="muted small bhint">${batchAuto(sc) ? '已依開會日期自動選好。' : ''}開會通知要在會前先送，會議紀錄等資料會後再送；兩批可以分開準備，也可以一起勾選。</p>`;
  }
  h += NOTE('<b>必備</b>的文件已自動勾選；<b>選填</b>的文件勾選後才會出現在填寫與下載清單。標示「另附」的是要另外準備的文件，可以按「上傳」把照片或掃描檔一起放進下載檔。');
  const postIds = new Set(list.filter(x => x.id && x.bt === POST).map(x => x.id));
  const vis = x => on[x.bt] && !(x.bt === PRE && on.post && postIds.has(x.id));
  const groups = []; let g = null;
  for (const x of list) { if (x.g) { g = { ...x, items: [] }; groups.push(g); } else if (g && vis(x)) g.items.push(x); }
  let curBt = '';
  for (const gr of groups) {
    if (!gr.items.length) continue;
    if (both && gr.bt !== curBt) { h += `<div class="bsep"><span>${BATCH[gr.bt].n}</span>${BATCH[gr.bt].t}</div>`; curBt = gr.bt; }
    h += `<h3 class="grp${gr.sub ? ' sub' : ''}">${gr.g}</h3><div class="doclist">`;
    for (const x of gr.items) {
      const sel = isSel(sc, x), att = x.kind === 'attach';
      h += `<label class="docrow${x.req ? ' req' : ''}${att ? ' att' : ''}${sel ? ' on' : ''}">
      <input type="checkbox" data-sel="${x.id}"${sel ? ' checked' : ''}${x.req ? ' disabled' : ''}>
      <span class="box">${x.req ? icon('lock') : icon('check')}</span>
      <span class="dn"><b>${x.name}</b>${x.note ? `<small>${x.note}</small>` : ''}${x.mat ? `<span class="modes" role="group" aria-label="${esc(x.name)}的準備方式"><button type="button" class="${isUp(x) ? '' : 'on'}" data-mode="fill" data-id="${x.id}">線上填寫</button><button type="button" class="${isUp(x) ? 'on' : ''}" data-mode="up" data-id="${x.id}">上傳檔案</button></span>` : ''}${x.up && (!x.mat || isUp(x)) ? `<button type="button" class="upbtn${upList(sc, x).length ? ' has' : ''}" data-up="${x.id}">${icon('clip')}${upList(sc, x).length ? `已上傳 ${upList(sc, x).length} 個檔案・再上傳` : `上傳${typeof x.up === 'string' ? x.up : '檔案'}`}</button>${chkBadge(docCheckState(sc, x))}` : ''}</span>
      <span class="badge ${x.req ? 'b-req' : att ? 'b-att' : 'b-opt'}">${att ? '另附' : x.req ? '必備' : '選填'}</span></label>`;
    }
    h += '</div>';
  }
  $('#view').innerHTML = isDesk() ? `<div class="dgrid"><div class="dmain">${h}</div><aside class="daside">${docsAside(sc)}</aside></div>` : h;
  const n = selDocs(sc).filter(x => x.kind !== 'attach').length;
  dock(`<span class="dk-t">已選 <b>${n}</b> 份文件</span><button class="btn pri" data-step="fill"><span>下一步<span class="xs-hide">：填寫資料</span></span>${icon('back', 'flip')}</button>`);
}
function noDocs(step) {
  $('#view').innerHTML = `<section class="card nodocs">${icon('doc', 'big')}<h3>還沒有勾選文件</h3><p class="muted">請先回到「選文件」，勾選這次需要準備的文件，系統才會列出要填寫的欄位${step === 'dl' ? '與下載按鈕' : ''}。</p><button class="btn pri" data-step="docs">${icon('back')}回到選文件</button></section>`;
  dock(`<button class="btn pri" data-step="docs">${icon('back')}回到選文件</button>`);
}
function renderFill() {
  const sc = S.ui.scen, secs = sectionsFor(sc);
  if (!selDocs(sc).some(x => x.kind !== 'attach')) return noDocs('fill');
  if (!secs.includes(S.ui.open)) S.ui.open = secs.find(k => !secDone(k).done) || secs[0];
  let h = `${guide('fill')}<div class="fill"><div class="secs">`;
  for (const k of secs) {
    const meta = secMeta(k), dn = secDone(k), open = S.ui.open === k;
    const uses = docsUsing(sc, k);
    h += `<section class="sec${open ? ' open' : ''}" id="sec-${k.replace(/[:.]/g, '-')}" data-sec="${k}">
      <button type="button" class="sh" data-open="${k}" aria-expanded="${open}">${icon(meta.i, 'si')}<span class="st"><b>${meta.t}</b><small>${k === 'org' ? '所有文件都會用到' : `用於：${uses.map(x => x.name).slice(0, 4).join('、')}${uses.length > 4 ? ` 等${uses.length}份` : ''}`}</small></span>
      <span class="prog ${dn.done ? 'done' : ''}" data-prog="${k}">${dn.total ? (dn.done ? icon('check') : `${dn.ok}/${dn.total}`) : ''}</span>${icon('down', 'chev')}</button>
      ${open ? `<div class="sb">${k.startsWith('m:') ? meetSection(k.slice(2)) : SEC[k]()}</div>` : ''}
    </section>`;
  }
  h += `</div><aside class="side" id="side"></aside></div>`;
  $('#view').innerHTML = h;
  const i = secs.indexOf(S.ui.open), next = secs[i + 1];
  dock(`<button class="btn ghost" data-step="docs">${icon('back')}文件</button><button class="btn ghost pvbtn" data-cmd="pvOpen">${icon('eye')}預覽</button>${next ? `<button class="btn pri" data-open="${next}">下一段 ${icon('back', 'flip')}</button>` : `<button class="btn pri" data-step="dl"><span>下一步<span class="xs-hide">：下載</span></span>${icon('back', 'flip')}</button>`}`);
  foldOptional($('#view')); refreshLive(); renderSide();
}
/* 簡單填報：還沒填的選填欄位（標示「可留空」）收進每一區最下面的「選填欄位」，需要時再展開 */
const OPT_OPEN = new Set();
function foldOptional(root) {
  if (!root) return;
  root.querySelectorAll('section.sec .sb').forEach(sb => {
    const key = (sb.closest('section.sec') || {}).dataset?.sec || '';
    const opt = [...sb.querySelectorAll('.grid > .f')].filter(f => {
      const lab = (f.querySelector('label') || {}).textContent || '', inp = f.querySelector('input[data-p], textarea[data-p], select[data-p]');
      return /可留空|選填/.test(lab) && inp && inp.type !== 'checkbox' && isBlank(getp(S, inp.dataset.p)) && !f.closest('.lcard, .listc, details');
    });
    if (opt.length < 2) return;
    const d = document.createElement('details'); d.className = 'optf'; if (OPT_OPEN.has(key)) d.open = true;
    d.innerHTML = `<summary>${icon('plus')}選填欄位<small>${opt.length} 項，可留空；需要時再展開</small></summary><div class="grid"></div>`;
    const g = d.querySelector('.grid'); opt.forEach(f => g.appendChild(f));
    d.addEventListener('toggle', () => d.open ? OPT_OPEN.add(key) : OPT_OPEN.delete(key));
    sb.appendChild(d);
    sb.querySelectorAll('.grid').forEach(gr => { if (gr !== g && !gr.children.length) gr.remove(); });
  });
}
function renderDl() {
  const sc = S.ui.scen, list = selDocs(sc), fill = list.filter(x => x.kind !== 'attach'), hb = fill.filter(x => x.hb);
  if (!fill.length) return noDocs('dl');
  const dls = deadlines(sc).filter(x => x.kind !== 'none' || true);
  const today = isoToday();
  const sum = checkSummary(sc), stamp = stampDlCard();
  let all = `<section class="card dlall"><h3>${icon('zip')}全部下載${hasBatch(sc) ? `<span class="tag">${batchLabel(sc)}</span>` : ''}</h3><p class="muted">把已勾選的 ${fill.length} 份文件一次打包成壓縮檔（.zip）。</p>
    <div class="fmtrow"><button class="fmt w" data-zip="docx"><i>W</i>Word</button><button class="fmt x" data-zip="xlsx"><i>X</i>Excel</button><button class="fmt p" data-zip="pdf"><i>P</i>PDF</button></div>
    ${hb.length ? `<div class="hbrow"><span>${icon('book')}大會手冊合併成一個檔案</span><span><button class="mini" data-hb="docx">Word</button><button class="mini" data-hb="pdf">PDF</button></span></div>` : ''}
    <div class="hbrow mg"><span class="hbt">${icon('doc')}<span><b>送件合併 PDF</b><small>檢核表＋全部文件＋上傳的附件，依順序合成一份，方便列印或寄送</small></span></span><span><button class="mini p" data-cmd="merge">合併 PDF</button></span></div></section>`;
  const dlsec = dlCard(sc);
  let h = '';
  h += `<h3 class="grp">逐份下載</h3><div class="dcards">`;
  for (const x of list) {
    if (x.kind === 'attach') { const n = upList(sc, x).length; h += `<div class="dcard att">${icon('clip')}<div class="dt"><b>${x.name}</b><small>${n ? `已上傳 ${n} 個檔案，會一起放進壓縮檔與合併 PDF` : `請另外準備${x.note ? '：' + x.note : '實體文件'}`}</small></div>${x.up ? upHTML(sc, x) : ''}</div>`; continue; }
    const miss = docMissing(sc, x), cs = docCheckState(sc, x);
    if (isUp(x)) { h += `<div class="dcard upm">${icon('clip')}<div class="dt"><b>${x.name}</b><small>${upList(sc, x).length ? '使用上傳的檔案，會放進壓縮檔與合併 PDF' : '已選擇上傳檔案，請上傳'}</small></div>${chkBadge(cs)}<div class="da">${x.mat === 'doc' ? `<button class="mini w" data-dl="${x.id}" data-fmt="docx" title="下載 Word 範本，填好後再上傳">Word 範本</button>` : `<button class="mini x" data-dl="${x.id}" data-fmt="xlsx" title="下載 Excel 範本（含已填資料），填好後再上傳，系統會自動檢查">Excel 範本</button>`}<button class="mini" data-mode="fill" data-id="${x.id}">改用線上填寫</button></div>${upHTML(sc, x)}</div>`; continue; }
    h += `<div class="dcard">${icon('doc')}<div class="dt"><b>${x.name}</b>${miss.length ? `<small class="miss">尚缺：${esc(miss.slice(0, 3).join('、'))}${miss.length > 3 ? '…' : ''}</small>` : '<small class="okc">資料已齊</small>'}${cs.items.length ? chkList(cs.items) : ''}</div>${chkBadge(cs)}
      <div class="da"><button class="mini pv" data-pv="${x.id}">${icon('eye')}預覽</button><button class="mini w" data-dl="${x.id}" data-fmt="docx">Word</button><button class="mini x" data-dl="${x.id}" data-fmt="xlsx">Excel</button><button class="mini p" data-dl="${x.id}" data-fmt="pdf">PDF</button></div>${x.up ? upHTML(sc, x) : ''}</div>`;
  }
  h += `<div class="dcard extra">${icon('check')}<div class="dt"><b>送件檢核表</b><small>依您勾選的文件自動列出份數、附件與期限，送件前逐項打勾</small></div>
      <div class="da"><button class="mini pv" data-pv="__check">${icon('eye')}預覽</button><button class="mini w" data-dl="__check" data-fmt="docx">Word</button><button class="mini p" data-dl="__check" data-fmt="pdf">PDF</button></div></div></div>`;
  const nx = SCEN[sc].next; let lk = '';
  if (nx) lk += `<button class="rowlink next" data-go="scen" data-scen="${nx}">${icon(SCEN[nx].icon)}<span><b>下一步：${SCEN[nx].title}</b><small>這裡審查過的工作計畫、財務報表與會員名冊，會自動帶入大會手冊，不必重填。</small></span>${icon('back', 'flip')}</button>`;
  if (hasBatch(sc) && !batchOn(sc).post) lk += `<button class="rowlink slim" data-cmd="toPost">${icon('info')}<span><b>開完會後，回來準備「② 會後：會議紀錄送件」</b><small>按這裡切換到會後文件，已填的日期、地點、提案都會沿用。</small></span>${icon('back', 'flip')}</button>`;
  h = isDesk() ? `${guide('dl')}<div class="dgrid dlp"><div class="dmain">${sum}${h}${lk}</div><aside class="daside">${all}${stamp}${dlsec}</aside></div>` : guide('dl') + sum + stamp + all + dlsec + h + lk;
  $('#view').innerHTML = h; upThumbs($('#view'));
  dock(`<button class="btn ghost" data-step="fill">${icon('back')}回到填寫</button><button class="btn pri" data-zip="docx">${icon('dl')}<span>全部下載<span class="xs-hide"> Word</span></span></button>`);
}
function renderHelp() {
  setHeader('會務事項一覽表', '依屏東縣政府社會處頁面整理', true);
  $('#steps').hidden = true; $('#dock').hidden = true;
  const sec = (t, rows) => `<section class="card"><h3>${t}</h3>${rows.map(([a, b, c]) => `<div class="hrow"><b>${a}</b><div>${b}</div><small>${c}</small></div>`).join('')}</section>`;
  $('#view').innerHTML = NOTE('需報請主管機關核處的會務事項。「法規依據」括號內為條次。') +
    sec('一、核准（定）', [['設立分支機構（辦事處）及其組織簡則', '理事會通過後報核。', '人團法（6）、督導實施辦法（12）'], ['團體合併或分立', '大會通過。', '人團法（56）'], ['團體合併分立，其權利義務事項之承受移轉辦法', '大會通過後報核。', '督導實施辦法（17）'], ['延期改選理、監事', '理監事任期屆滿一個月內報核。', '選舉罷免辦法（33）'], ['延期改選理事長、常務理事、常務監事', '大會閉會後十五日內報核。', '選舉罷免辦法（20）'], ['舉行臨時監事會辦理財務查核', '召開會議七日前報核。', '財務處理辦法（34）'], ['申請延長整理期限', '指定召集人後三個月內報核。', '督導實施辦法（20－1）']]) +
    sec('二、核備', [['會員人數超過三○○人以上，擬選代表召開代表大會，其地區之劃分及應選代表名額之分配辦法', '擬選代表前由理事會通過後報核（章程應載明分區選舉辦法）。', '人團法（13）（28）、選舉罷免辦法（40）'], ['入會費、常年會費、事業費、會員捐款之繳納數額及方式', '大會通過後報核。', '人團法（33）、財務處理辦法（17）'], ['預算：年度工作計畫、收支預算表、工作人員待遇表', '年度開始前二個月內，由理事會編造，提經大會通過後報核；因故未如期召開大會者，先經理監事聯席會通過。', '人團法（34）、財務處理辦法（12）（18）'], ['決算：年度工作報告、收支決算表、現金出納表、資產負債表、財產目錄、基金收支表', '年度終了後二個月內由理事會編造，送請監事會審核，提經大會通過後並於三月底前報核；因故未能如期召開大會者，先經理監事聯席會通過。', '財務處理辦法（13）'], ['章程、選任職員簡歷冊或負責人之異動', '異動後三十日內報核。', '人團法（54）、選舉罷免辦法（43）'], ['會址變更', '理事會決議通過後報備。', '配合相關機關之規定']]) +
    sec('三、備查', [['法人登記證書影本', '辦妥法人登記後報備。', '人團法（11）'], ['會員（會員代表）名冊', '召開大會十五日前由理事會審定資格後報備。', '選舉罷免辦法（5）、督導實施辦法（4）'], ['會議種類、時間、地點連同議程', '召開大會十五日前報備；召開理、監事會議七日前報備；臨時會議之報備期限酌予縮短。', '人團法（26）、督導實施辦法（5）'], ['大會紀錄及理監事會議紀錄', '閉會後三十日內報備。', '督導實施辦法（5）'], ['工作人員解聘僱', '理事會通過後報備。', '工作人員管理辦法（4）（7）']]) +
    `<a class="rowlink" href="https://www.pthg.gov.tw/planjdp/cp.aspx?n=0CE0EA6891C2AC5C" target="_blank" rel="noopener">${icon('doc')}<span><b>屏東縣政府社會處 社團（職團）會務專區</b><small>www.pthg.gov.tw（原始範本下載）</small></span>${icon('back', 'flip')}</a>`;
}
function dock(html) { const d = $('#dock'); d.hidden = false; d.innerHTML = html; }

/* ===== 即時更新（不重繪整頁） ===== */
function refreshLive() {
  $$('#view [data-p]').forEach(el => {
    const p = el.dataset.p;
    if (el.type === 'checkbox' || el.tagName === 'SELECT') return;
    if (!hasDerive(p) && el.dataset.ph == null) return;
    let ph = el.dataset.ph || '';
    if (hasDerive(p)) { const dv = derive(p); if (!isBlank(dv)) ph = el.type === 'date' ? '' : String(dv); }
    if (el.placeholder !== ph) el.placeholder = ph;
  });
  $$('#view [data-reset]').forEach(b => { const f = b.closest('.f'); if (f) f.classList.toggle('ov', !isBlank(getp(S, b.dataset.reset))); });
  $$('#view [data-dyn]').forEach(el => {
    const p = el.dataset.dyn, k = el.dataset.kind, v = getp(S, p);
    if (k === 'date') { const dv = V(p); el.innerHTML = dv ? `民國 ${rd(dv)}（${weekday(dv)}）${isBlank(v) && dv ? '<span class="auto">自動</span>' : ''}` : ''; }
    else if (k === 'rdate') { if (isBlank(v)) { const dv = derive(p); el.innerHTML = dv ? `自動帶入：${esc(rdOr(dv, dv))}` : ''; } else { const d = parseDate(v); el.innerHTML = d ? `= 民國 ${d.y}年${d.m}月${d.d}日` : '<span class="bad">看不懂這個日期，請用「45/3/12」的格式</span>'; } }
    else if (k === 'id') { el.innerHTML = !isBlank(v) && !checkTwId(v) ? '<span class="bad">身分證字號格式或檢查碼不正確，請再確認</span>' : ''; }
  });
  $$('#view [data-calc]').forEach(el => { el.innerHTML = calcVal(el.dataset.calc); });
  $$('#view [data-prog]').forEach(el => { const dn = secDone(el.dataset.prog); el.className = 'prog' + (dn.done ? ' done' : ''); el.innerHTML = dn.total ? (dn.done ? icon('check') : `${dn.ok}/${dn.total}`) : ''; });
  if (S.ui.view === 'scen') { const st = $('#steps'); if (st && !st.hidden) st.innerHTML = stepsBar(); }
  const sumEls = $$('#view .li .ls'); if (sumEls.length) refreshSummaries();
}
function refreshSummaries() {
  $$('#view .li').forEach(li => {
    const key = li.dataset.key, [path, i] = [key.slice(0, key.lastIndexOf('.')), +key.slice(key.lastIndexOf('.') + 1)];
    const row = (getp(S, path) || [])[i] || {}, el = li.querySelector('.ls'); if (!el) return;
    let s = '';
    if (path === 'people') s = [row.role, row.name].filter(Boolean).join('　');
    else if (path === 'members') s = `${row.name || ''}${row.type && row.type !== '個人會員' ? '　' + row.type : ''}`;
    else if (/\.props$/.test(path)) { const mk = path.split('.').slice(1, 3).join('.'); s = PV(mk, i, 'reason').slice(0, 40); }
    else s = Object.values(row).filter(v => typeof v === 'string').find(v => v.trim()) || '';
    el.innerHTML = s ? esc(s) : '<em>（未填寫）</em>';
  });
}

/* ===== 預覽 ===== */
function docById(sc, id) { if (id === '__check') return { id, name: '送件檢核表', b: () => docChecklist(sc) }; return docsOf(sc).find(x => x.id === id); }
function buildDoc(sc, id) { const x = docById(sc, id); return x && x.b ? noPH(x.b()) : null; }
function pvDocs(sc) { return docsUsing(sc, S.ui.open || 'org'); }
let sideTimer = null;
function renderSide() {
  clearTimeout(sideTimer);
  sideTimer = setTimeout(() => {
    const side = $('#side'); if (!side || getComputedStyle(side).display === 'none') return;
    const sc = S.ui.scen, list = pvDocs(sc).length ? pvDocs(sc) : selDocs(sc).filter(x => x.kind !== 'attach' && !isUp(x));
    if (!list.length) { side.innerHTML = ''; return; }
    let id = S.ui.pvDoc; if (!list.some(x => x.id === id)) id = list[0].id;
    const x = docById(sc, id), doc = x && x.b ? keyed(sc, x) : null;
    side.innerHTML = `<div class="sidebar"><span class="live"></span><select data-pvsel="1" aria-label="選擇預覽的文件">${list.map(x2 => `<option value="${x2.id}"${x2.id === id ? ' selected' : ''}>${esc(x2.name)}</option>`).join('')}</select></div>${doc ? stampBar(`${sc}:${id}`) : ''}<div class="pages">${doc ? doc.sheets.map(sheetHTML).join('') : ''}</div>`;
    fitPages(side.querySelector('.pages')); refreshStamps(side);
  }, 160);
}
function fitPages(box) { if (!box) return; const w = box.clientWidth - 16; $$('.sheet', box).forEach(s => { const pw = s.classList.contains('land') ? 1123 : 794; s.style.zoom = Math.min(1, w / pw).toFixed(3); }); }
function openPreview(id) {
  const sc = S.ui.scen, x = docById(sc, id); if (!x) return;
  const doc = keyed(sc, x), pv = $('#pv');
  const list = selDocs(sc).filter(d => d.kind !== 'attach' && !isUp(d));
  pv.innerHTML = `<div class="pvbar"><button class="icon" data-cmd="pvClose" aria-label="關閉">${icon('x')}</button><select data-pvopen="1" aria-label="切換文件">${list.map(d => `<option value="${d.id}"${d.id === id ? ' selected' : ''}>${esc(d.name)}</option>`).join('')}${id === '__check' ? '<option value="__check" selected>送件檢核表</option>' : ''}</select></div>
    ${stampBar(`${sc}:${id}`)}
    <div class="pages">${doc.sheets.map(sheetHTML).join('')}</div>
    <div class="pvdock"><button class="fmt w" data-dl="${id}" data-fmt="docx"><i>W</i>Word</button><button class="fmt x" data-dl="${id}" data-fmt="xlsx"><i>X</i>Excel</button><button class="fmt p" data-dl="${id}" data-fmt="pdf"><i>P</i>PDF</button></div>`;
  pv.hidden = false; document.body.classList.add('noscroll');
  requestAnimationFrame(() => { fitPages(pv.querySelector('.pages')); refreshStamps(pv); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!pv.hidden) refreshStamps(pv); });
}
function closePreview() { $('#pv').hidden = true; document.body.classList.remove('noscroll'); }
