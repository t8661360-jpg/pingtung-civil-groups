/* ===== 欄位元件 ===== */
function raw(p) { const v = getp(S, p); return v == null ? '' : v; }
function chip(p) { return D[p] ? `<span class="chip" title="留白時自動帶入其他表單的資料；直接輸入即可覆寫">連動</span><button type="button" class="rst" data-reset="${p}" title="清除覆寫，改回自動帶入">↺ 還原</button>` : ''; }
function F(p, label, o = {}) {
  const tag = o.area
    ? `<textarea data-p="${p}" rows="${o.rows || 3}"${o.ph ? ` data-ph="${esc(o.ph)}"` : ''}>${esc(raw(p))}</textarea>`
    : `<input data-p="${p}" value="${esc(raw(p))}"${o.num ? ' inputmode="decimal"' : ''}${o.ph ? ` data-ph="${esc(o.ph)}"` : ''}${o.list ? ` list="${o.list}"` : ''}>`;
  return `<div class="f ${o.w || ''}"><label>${label}${chip(p)}</label><div class="in">${o.pre ? `<span class="suf">${o.pre}</span>` : ''}${tag}${o.suf ? `<span class="suf">${o.suf}</span>` : ''}</div>${o.hint ? `<div class="hint">${o.hint}</div>` : ''}</div>`;
}
function dateIns(p, v) { v = v || {}; return ['y', 'm', 'd'].map((k, i) => `<input data-p="${p}" data-part="${k}" value="${esc(v[k] ?? '')}" inputmode="numeric" class="d${k}" aria-label="${'年月日'[i]}"><span>${'年月日'[i]}</span>`).join(''); }
function FD(p, label, o = {}) { return `<div class="f ${o.w || ''}"><label>${label}${chip(p)}</label><div class="in date">${o.pre ? '<span class="suf">民國</span>' : ''}${dateIns(p, getp(S, p))}</div>${o.hint ? `<div class="hint">${o.hint}</div>` : ''}</div>`; }
function FT(p, label) {
  const v = getp(S, p) || {};
  return `<div class="f"><label>${label}</label><div class="in date"><select data-p="${p}" data-part="ap"><option value=""></option><option value="上"${v.ap === '上' ? ' selected' : ''}>上午</option><option value="下"${v.ap === '下' ? ' selected' : ''}>下午</option></select><input data-p="${p}" data-part="h" value="${esc(v.h ?? '')}" inputmode="numeric" class="dm"><span>時</span><input data-p="${p}" data-part="mi" value="${esc(v.mi ?? '')}" inputmode="numeric" class="dm"><span>分</span></div></div>`;
}
function FS(p, label, opts, o = {}) { const v = raw(p); return `<div class="f ${o.w || ''}"><label>${label}${chip(p)}</label><div class="in"><select data-p="${p}">${opts.map(x => `<option${x === v ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select></div></div>`; }
function FC(p, label, o = {}) { const v = getp(S, p); return `<label class="ck ${o.w || ''}"><input type="checkbox" data-p="${p}"${v !== false ? ' checked' : ''}${o.rr ? ' data-rr="1"' : ''}> ${label}</label>`; }
const card = (title, inner, o = {}) => `<section class="card${o.cls ? ' ' + o.cls : ''}"${o.id ? ` id="${o.id}"` : ''}><div class="ch"><h3>${title}</h3>${o.right || ''}</div>${o.note ? `<p class="note">${o.note}</p>` : ''}<div class="grid">${inner}</div></section>`;
const calc = (key, cls = '') => `<span class="calc ${cls}" data-calc="${key}"></span>`;

function LIST(path, cols, o = {}) {
  const arr = getp(S, path) || [];
  const head = cols.map(c => `<th style="width:${c.w || 'auto'}">${c.label}</th>`).join('');
  const body = arr.map((row, i) => `<tr>${cols.map(c => {
    const p = `${path}.${i}.${c.k}`;
    let inp;
    if (c.type === 'sel') inp = `<select data-p="${p}">${['', ...c.opts].map(x => `<option${x === (row[c.k] || '') ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select>`;
    else if (c.type === 'date') inp = `<div class="in date sm">${dateIns(p, row[c.k])}</div>`;
    else if (c.type === 'area') inp = `<textarea data-p="${p}" rows="${c.rows || 3}">${esc(row[c.k] ?? '')}</textarea>`;
    else inp = `<input data-p="${p}" value="${esc(row[c.k] ?? '')}"${c.num ? ' inputmode="decimal" class="num"' : ''}${c.list ? ` list="${c.list}"` : ''}${c.ph ? ` placeholder="${esc(c.ph)}"` : ''}>`;
    return `<td>${inp}</td>`;
  }).join('')}<td class="act"><button type="button" data-act="up" data-list="${path}" data-i="${i}" title="上移">↑</button><button type="button" data-act="down" data-list="${path}" data-i="${i}" title="下移">↓</button><button type="button" class="del" data-act="del" data-list="${path}" data-i="${i}" title="刪除">✕</button></td></tr>`).join('');
  return `<div class="lst${o.cls ? ' ' + o.cls : ''}"><div class="tw"><table><thead><tr>${head}<th class="act"></th></tr></thead><tbody>${body || `<tr><td colspan="${cols.length + 1}" class="empty">${o.empty || '尚無資料，請按下方「新增」'}</td></tr>`}</tbody></table></div>
    <div class="lbar"><button type="button" class="btn ghost" data-act="add" data-list="${path}">＋ 新增一列</button>${o.extra || ''}</div></div>`;
}

/* ===== 頁面 ===== */
const PAGES = [
  { id: 'basic', t: '基本資料', s: '共用欄位・全部下載' },
  { id: 'roster', t: '理監事暨會務人員一覽表', s: '人員主檔' },
  { id: 'assembly', t: '會員大會會議紀錄', s: '含選舉' },
  { id: 'board', t: '理監事聯席會議紀錄', s: '選舉理事長' },
  { id: 'cert', t: '理事長當選證明書資料' },
  { id: 'consent', t: '會址使用同意書' },
  { id: 'statute', t: '章程修正條文對照表' },
  { id: 'plan', t: '年度工作計畫' },
  { id: 'finance', t: '財務報表', s: '預算・決算・財產・資產負債・基金' },
  { id: 'letter', t: '送件公函', s: '函送縣府備查' },
];

const UI = {};
UI.basic = () => card('團體', F('basic.county', '縣市', { w: 's' }) + F('basic.town', '鄉鎮市', { w: 's', ph: '例：屏東市' }) + F('basic.org', '團體名稱', { w: 'l', ph: '例：○○社區發展協會' }) +
  `<div class="f full"><label>團體全銜（自動組合，用於所有表單抬頭）</label><div class="out">${calc('orgFull')}</div></div>` +
  F('basic.term', '本屆別', { w: 's', pre: '第', suf: '屆', num: true }) + F('basic.termYears', '每屆任期', { w: 's', suf: '年', num: true }) +
  F('basic.membersGroup', '團體會員', { w: 's', suf: '個', num: true }) + F('basic.membersPerson', '個人會員', { w: 's', suf: '人', num: true }), { note: '資料會自動儲存在這台電腦的瀏覽器。第一次使用可按右上角「載入範例」看看填好的樣子；換電腦或與他人交接時，請用「備份資料」存成檔案。' })
  + card('年度', F('basic.year', '決算年度（民國）', { w: 's', suf: '年', num: true, hint: '決算表、財產目錄、資產負債表、基金收支表用' }) +
    F('basic.budgetYear', '預算／工作計畫年度', { w: 's', suf: '年', num: true, hint: '預設為決算年度＋1' }) +
    FD('basic.fillDate', '填送日期', { hint: '預設為今天' }))
  + card('立案與登記', FD('basic.regDate', '社會局立案日期') + F('basic.regWord', '立案字號（○○字）', { w: 's', suf: '字' }) + F('basic.regNum', '第', { w: 's', suf: '號' }) +
    FD('basic.courtDate', '法院登記日期') + F('basic.courtNo', '法院登記字號', { w: 'm' }) + FD('basic.reelectDate', '改選日期'))
  + card('聯絡資料', F('basic.address', '團體會址', { w: 'full', ph: '屏東縣○○鄉○○村○○路○○號' }) + F('basic.phone', '電話', { w: 'm' }) + F('basic.fax', '傳真', { w: 'm' }) + F('basic.web', '網址', { w: 'm' }) + F('basic.email', '電子信箱', { w: 'm' }))
  + card('連動說明', `<div class="full flow">
      <p>標示 <span class="chip">連動</span> 的欄位留白時，會自動帶入其他表單的資料（灰色提示文字就是會帶入的內容）。直接輸入可覆寫，按「↺ 還原」改回自動帶入。</p>
      <table class="map"><tr><th>來源</th><th>自動帶入到</th></tr>
      <tr><td>團體名稱・屆別・年度</td><td>全部表單的抬頭、會議紀錄案由、工作計畫、財務報表期間、公函主旨</td></tr>
      <tr><td>一覽表的理事長</td><td>會議主席、簽章欄、當選證明（姓名・生日・地址・電話）、同意書、公函</td></tr>
      <tr><td>一覽表的理事／監事</td><td>聯席會議出席名單、選舉當選人、候補名單</td></tr>
      <tr><td>一覽表的總幹事・會計・出納</td><td>會議紀錄人、聘任工作人員案決議、財務報表簽章欄、公函聯絡人</td></tr>
      <tr><td>會員人數</td><td>會員大會應出席人數（缺席人數自動計算）</td></tr>
      <tr><td>會員大會日期・地點</td><td>聯席會議、章程對照表、當選證明（任期自動推算）、公函說明</td></tr>
      <tr><td>決算數・財產目錄・基金</td><td>現金出納表、資產負債表（本期餘絀、固定資產、資產基金、提撥基金）</td></tr>
      </table></div>`)
  + card('全部表單一次下載', `<div class="full"><p class="note" style="margin:0 0 10px">把 9 份表單合併成一個檔案（Word 與 PDF 每份表單自成一頁起，Excel 每份表單一個工作表）。</p>
      <div class="dlrow">${dlButtons('all')}</div><div id="checks"></div></div>`, { cls: 'hl' });

UI.roster = () => {
  const extra = `<button type="button" class="btn ghost" data-cmd="fromElection">⇣ 依會員大會選舉結果帶入</button>`;
  return card('人員名單', `<div class="full">${LIST('roster', [
    { k: 'role', label: '職別', type: 'sel', opts: ROLES, w: '108px' }, { k: 'name', label: '姓名', w: '96px' }, { k: 'gender', label: '性別', type: 'sel', opts: ['男', '女'], w: '64px' },
    { k: 'birth', label: '出生年月日（民國）', type: 'date', w: '170px' }, { k: 'job', label: '現職', w: '110px' }, { k: 'idno', label: '身分證統一編號', w: '118px' },
    { k: 'addr', label: '戶籍所在地或工作地址', w: '220px' }, { k: 'phone', label: '電話號碼', w: '112px' }], { extra, cls: 'wide roster' })}
    <div class="stat">${calc('rosterCount')}</div></div>`, { note: '輸出時會自動依「理事長、常務理事、理事、候補理事、常務監事、監事、候補監事、會務人員」排序。這裡的資料會帶入其他所有表單。' })
    + card('表頭資料', `<div class="full out-note">團體名稱、立案字號、會址、電話等表頭欄位來自「基本資料」頁。</div>` + FD('basic.fillDate', '填送日期'));
};

function propCard(base, title, fields, onKey) {
  const on = getp(S, base + '.on') !== false;
  return `<div class="prop${on ? '' : ' off'}"><div class="ph">${FC(base + '.on', `<b>${title}</b>`, { rr: true })}</div>${on ? `<div class="grid">${fields.map(([k, l, o]) => F(`${base}.${k}`, l, { w: 'full', area: true, rows: 2, ...(o || {}) })).join('')}</div>` : ''}</div>`;
}
UI.assembly = () => {
  const A = S.assembly;
  const propCols = [{ k: 'reason', label: '案由', type: 'area', rows: 2 }, { k: 'proposer', label: '提案人', w: '90px' }, { k: 'desc', label: '說明', type: 'area', rows: 2 }, { k: 'method', label: '辦法', type: 'area', rows: 2 }, { k: 'res', label: '決議', type: 'area', rows: 2 }];
  let el = '';
  if (A.hasEl) {
    const cand = (path) => LIST(path, [{ k: 'name', label: '候選人姓名' }, { k: 'votes', label: '得票數', num: true, w: '90px' }], { empty: '尚未輸入；留白時當選人由一覽表帶入' });
    el = F('assembly.el.jp', '監票員', { w: 's' }) + F('assembly.el.fp', '發票員', { w: 's' }) + F('assembly.el.cp', '唱票員', { w: 's' }) + F('assembly.el.jip', '記票員', { w: 's' }) +
      F('assembly.el.dirSeats', '理事名額', { w: 's', num: true, suf: '名' }) + F('assembly.el.dirAlt', '候補理事名額', { w: 's', num: true, suf: '名' }) +
      F('assembly.el.supSeats', '監事名額', { w: 's', num: true, suf: '名' }) + F('assembly.el.supAlt', '候補監事名額', { w: 's', num: true, suf: '名' }) +
      `<div class="f half"><label>理事候選人得票</label>${cand('assembly.el.dirs')}</div><div class="f half"><label>監事候選人得票</label>${cand('assembly.el.sups')}</div>
       <div class="full elres">${calc('elResult')}</div>
       <div class="full dlrow"><button type="button" class="btn ghost" data-cmd="candFromRoster">⇡ 由一覽表帶入候選人</button><button type="button" class="btn" data-cmd="fromElection">⇣ 將當選名單更新到一覽表</button></div>`;
  }
  return card('會議資訊', F('assembly.term', '屆次', { w: 's', pre: '第', suf: '屆', num: true }) + F('assembly.no', '會次', { w: 's', pre: '第', suf: '次', num: true }) +
    FD('assembly.date', '日期') + FT('assembly.time', '開會時間') + F('assembly.place', '地點', { w: 'l', ph: '例：本社區活動中心' }) +
    F('assembly.chair', '主席', { w: 's' }) + F('assembly.rec', '紀錄', { w: 's' }))
    + card('出席情形', F('assembly.should', '應出席人數', { w: 's', num: true, suf: '人' }) + F('assembly.attend', '實際出席', { w: 's', num: true, suf: '人' }) + F('assembly.leave', '請假', { w: 's', num: true, suf: '人' }) + F('assembly.absent', '缺席', { w: 's', num: true, suf: '人' }) + F('assembly.obs', '列席', { w: 's', num: true, suf: '人' }))
    + card('致詞與報告', F('assembly.speech', '主席致詞（留白＝略）', { w: 'full', area: true, rows: 2 }) + F('assembly.report', '上年度工作報告（可留白）', { w: 'full', area: true, rows: 3 }))
    + card('討論事項', F('assembly.refTerm', '審議的理（監）事會：第', { w: 's', suf: '屆', num: true }) + F('assembly.refNo', '第', { w: 's', suf: '次', num: true, hint: '用於各案「說明」' }) +
      `<div class="full">${propCard('assembly.fin', '（一）決算案', [['reason', '案由'], ['proposer', '提案人', { area: false, w: 's' }], ['desc', '說明'], ['method', '辦法'], ['res', '決議', { area: false }]])}
      ${propCard('assembly.plan', '（二）工作計畫案', [['reason', '案由'], ['proposer', '提案人', { area: false, w: 's' }], ['desc', '說明'], ['method', '辦法'], ['res', '決議', { area: false }]])}
      ${propCard('assembly.bud', '（三）預算案', [['reason', '案由'], ['proposer', '提案人', { area: false, w: 's' }], ['desc', '說明'], ['method', '辦法'], ['res', '決議', { area: false }]])}
      <h4>其他提案</h4>${LIST('assembly.props', propCols, { cls: 'wide', empty: '無其他提案' })}</div>`, { note: '三個常用案由會依年度、屆次自動產生文字；不需要的案可取消勾選。' })
    + card('臨時動議', `<div class="full">${LIST('assembly.motions', [{ k: 'prop', label: '提案', type: 'area', rows: 2 }, { k: 'desc', label: '說明', type: 'area', rows: 2 }, { k: 'res', label: '決議', type: 'area', rows: 2 }], { empty: '無臨時動議（紀錄會寫「無。」）' })}</div>`)
    + card('選舉', `<div class="full">${FC('assembly.hasEl', '本次會議辦理理監事選舉', { rr: true })}</div>` + el)
    + card('散會', FT('assembly.end', '散會時間'));
};
UI.board = () => card('會議資訊', F('board.term', '屆次', { w: 's', pre: '第', suf: '屆', num: true }) + F('board.no', '會次', { w: 's', pre: '第', suf: '次', num: true }) +
  FD('board.date', '日期') + FT('board.time', '開會時間') + F('board.place', '地點', { w: 'l' }) + F('board.chair', '主席', { w: 's' }) + F('board.rec', '紀錄', { w: 's' }))
  + card('出席人員', F('board.dirs', '理事', { w: 'full', area: true, rows: 2 }) + F('board.sups', '監事', { w: 'full', area: true, rows: 2 }) + F('board.obs', '列席人數', { w: 's', num: true, suf: '人' }), { note: '理事、監事名單預設由一覽表帶入。' })
  + card('選舉', F('board.electTerm', '選舉第', { w: 's', suf: '屆', num: true }) + F('board.stdDir', '常務理事（可留白）', { w: 'l' }) +
    F('board.stdSup', '常務監事當選人', { w: 'm' }) + F('board.stdSupVotes', '得票數', { w: 's', num: true, suf: '票' }) +
    F('board.chairman', '理事長當選人', { w: 'm' }) + F('board.chairVotes', '得票數', { w: 's', num: true, suf: '票' }), { note: '當選人預設帶入一覽表中職別為常務理事、常務監事、理事長的人。' })
  + card('討論提案', `<div class="full">${propCard('board.addr', '（一）會址處所案', [['reason', '案由', { area: false }], ['desc', '說明'], ['res', '決議']])}
      ${propCard('board.staff', '（二）聘任工作人員案', [['reason', '案由', { area: false }], ['desc', '說明'], ['res', '決議']])}
      <h4>其他提案</h4>${LIST('board.props', [{ k: 'reason', label: '案由', type: 'area', rows: 2 }, { k: 'desc', label: '說明', type: 'area', rows: 2 }, { k: 'res', label: '決議', type: 'area', rows: 2 }], { empty: '無其他提案' })}</div>`)
  + card('臨時動議與散會', F('board.motion', '臨時動議（留白＝無）', { w: 'full', area: true, rows: 2 }) + FT('board.end', '散會時間'));

UI.cert = () => card('理事長資料', F('cert.name', '理事長姓名', { w: 'm' }) + F('cert.birthplace', '出生地', { w: 'm' }) + FD('cert.birth', '出生日期') +
  F('cert.phone', '電話', { w: 'm' }) + F('cert.addr', '戶籍地址', { w: 'full' }), { note: '姓名、出生日期、地址、電話預設帶入一覽表中的理事長資料。' })
  + card('當選資料', F('cert.org', '團體名稱', { w: 'full' }) + F('cert.term', '當選屆次', { w: 's', pre: '第', suf: '屆', num: true }) +
    FD('cert.firstDate', '召開第一次理事會日期（補選日期）') + F('cert.tenure', '任期', { w: 'full', hint: '預設由第一次理事會日期加上每屆任期年數推算' }) + F('cert.note', '備註', { w: 'full' }));

UI.consent = () => card('房屋資料', F('consent.loc', '房屋座落', { w: 'full' }) + F('consent.landNo', '地號', { w: 'm' }) +
  F('consent.ping', '坪數', { w: 's', num: true, suf: '坪' }) + F('consent.sqm', '面積', { w: 's', num: true, suf: '平方公尺' }), { note: '坪數與平方公尺擇一填寫，另一個會自動換算。' })
  + card('借用期限與簽章', FD('consent.from', '期限自') + FD('consent.to', '至', { hint: '預設為起日加每屆任期年數' }) +
    F('consent.lender', '房屋出借人', { w: 'm' }) + F('consent.witness', '見證人', { w: 'm' }) + F('consent.chairman', '理事長', { w: 'm' }) + FD('consent.date', '立書日期'));

UI.statute = () => card('審議通過', FD('statute.boardDate', '理（監）事會日期') + F('statute.boardTerm', '第', { w: 's', suf: '屆', num: true }) + F('statute.boardNo', '第', { w: 's', suf: '次', num: true }) +
  FD('statute.asmDate', '會員大會日期') + F('statute.asmTerm', '第', { w: 's', suf: '屆', num: true }) + F('statute.asmNo', '第', { w: 's', suf: '次', num: true }))
  + card('條文對照', `<div class="full">${LIST('statute.rows', [{ k: 'orig', label: '原條文', type: 'area', rows: 5 }, { k: 'rev', label: '修正後條文', type: 'area', rows: 5 }, { k: 'note', label: '說明', type: 'area', rows: 5 }], { cls: 'wide' })}</div>`);

UI.plan = () => card('計畫', F('plan.year', '計畫年度', { w: 's', suf: '年', num: true }) + F('plan.refTerm', '提經第', { w: 's', suf: '屆', num: true }) + F('plan.refNo', '第', { w: 's', suf: '次理（監）事會', num: true }))
  + card('工作內容', `<div class="full">${LIST('plan.rows', [{ k: 'cat', label: '工作類別', w: '110px', list: 'dl-cat' }, { k: 'item', label: '項目', w: '120px' }, { k: 'desc', label: '說明', type: 'area', rows: 2 },
    { k: 'qty', label: '數量', w: '60px' }, { k: 'prog', label: '執行進度', w: '90px' }, { k: 'cost', label: '經費預估', num: true, w: '96px' }, { k: 'co', label: '協辦單位', w: '90px' }, { k: 'note', label: '備註', w: '80px' }], { cls: 'wide' })}
    <datalist id="dl-cat"><option>會務推展</option><option>公共建設</option><option>業務推展</option></datalist><div class="stat">${calc('planTotal')}</div></div>`, { note: '同一類別、項目連續填寫時，輸出會自動合併儲存格並加上「一、」「（一）」編號，不必自己打。' })
  + card('實施要領', F('plan.method', '實施要領（或工作方法）', { w: 'full', area: true, rows: 3 }));

UI.finance = () => {
  const tab = S.ui.finTab || 'acc';
  const tabs = [['acc', '收支預算／決算'], ['prop', '財產目錄'], ['bs', '資產負債表'], ['fund', '基金收支表'], ['out', '輸出設定']];
  let body = '';
  if (tab === 'acc') {
    const rows = ACC_FLAT.map(a => {
      const v = S.fin.v[a.k] || {};
      const nameCell = `<input data-p="fin.names.${a.k}" value="${esc(S.fin.names[a.k] || '')}" placeholder="${esc(a.name)}" class="nm lv${a.lvl}">`;
      const amt = col => a.kids ? `<td class="sum">${calc(`acc:${a.k}:${col}`)}</td>` : `<td><input data-p="fin.v.${a.k}.${col}" value="${esc(v[col] ?? '')}" inputmode="decimal" class="num"></td>`;
      const note = col => a.kids && a.lvl === 0 ? '<td></td>' : `<td><input data-p="fin.v.${a.k}.${col}" value="${esc(v[col] ?? '')}"></td>`;
      return `<tr class="lv${a.lvl}"><td>${nameCell}</td>${amt('b')}${amt('pb')}${amt('a')}${note('n1')}${note('n2')}</tr>`;
    }).join('');
    body = card('收支科目', `<div class="full"><div class="tw"><table class="acc"><thead><tr><th style="width:190px">科目名稱（可修改）</th><th>預算數<br><small>${calc('yrBY')}年度</small></th><th>上年度預算數<br><small>${calc('yrY')}年度</small></th><th>決算數<br><small>${calc('yrY')}年度</small></th><th>預算說明</th><th>決算說明</th></tr></thead>
      <tbody>${rows}<tr class="lv0 sur"><td>本期餘絀</td><td class="sum">${calc('sur:b')}</td><td class="sum">${calc('sur:pb')}</td><td class="sum">${calc('sur:a')}</td><td></td><td></td></tr></tbody></table></div></div>`
      + F('fin.prev', '上期餘絀（決算用）', { w: 's', num: true, suf: '元' }) + F('fin.cashPrev', '上期現金結存（現金出納表）', { w: 's', num: true, suf: '元' }) + `<div class="f full">${calc('finChecks')}</div>`,
      { note: '「上年度預算數」同時是預算表的上年度欄與決算表的預算數欄，只要填一次。修改科目名稱，預算表與決算表會同步。' });
  } else if (tab === 'prop') {
    body = card('財產目錄', `<div class="full">${LIST('fin.prop', [{ k: 'cat', label: '財產科目', list: 'dl-pc', w: '118px' }, { k: 'name', label: '名稱' }, { k: 'date', label: '購置日期', w: '96px', ph: '104年12月' }, { k: 'unit', label: '單位', w: '56px' }, { k: 'qty', label: '數量', num: true, w: '60px' }, { k: 'amt', label: '金額', num: true, w: '96px' }, { k: 'loc', label: '存放地點', w: '90px' }, { k: 'note', label: '說明', w: '100px' }], { cls: 'wide' })}
      <datalist id="dl-pc">${PROP_CATS.map(c => `<option>${c}</option>`).join('')}</datalist><div class="stat">${calc('propTotal')}</div></div>`, { note: '財產科目留白表示與上一列相同。各科目金額會自動帶入資產負債表的固定資產／雜項資產。' });
  } else if (tab === 'bs') {
    const grp = (g, side) => `<tr class="g"><td>${g.name}</td><td class="sum">${calc('bsg:' + g.k)}</td></tr>` + g.kids.map(n => `<tr><td>　${n}${D['fin.bs.' + n] && bsDerived(n) != null ? ' <span class="chip">連動</span>' : ''}</td><td><input data-p="fin.bs.${n}" value="${esc(S.fin.bs[n] ?? '')}" inputmode="decimal" class="num"></td></tr>`).join('');
    body = card('資產負債表', `<div class="full bs"><div><table class="acc"><thead><tr><th>資產科目</th><th style="width:130px">金額</th></tr></thead><tbody><tr class="t"><td>資產合計</td><td class="sum">${calc('bsA')}</td></tr>${BS_LEFT.map(g => grp(g)).join('')}</tbody></table></div>
      <div><table class="acc"><thead><tr><th>負債、基金暨餘絀科目</th><th style="width:130px">金額</th></tr></thead><tbody><tr class="t"><td>負債合計</td><td class="sum">${calc('bsL')}</td></tr>${BS_RIGHT_L.map(g => grp(g)).join('')}<tr class="t"><td>權益合計</td><td class="sum">${calc('bsE')}</td></tr>${BS_RIGHT_E.map(g => grp(g)).join('')}</tbody></table></div></div>
      <div class="f full">${calc('bsCheck')}</div>`, { note: '灰色數字為自動帶入：固定資產與雜項資產來自財產目錄，資產基金＝固定資產＋雜項資產＋存出保證金，基金／提撥基金來自基金收支表結餘，本期／上期餘絀來自決算。' });
  } else if (tab === 'fund') {
    body = card('收入', F('fin.fund.acc', '歷年累存', { w: 's', num: true, suf: '元' }) + F('fin.fund.int', '本年度利息收入', { w: 's', num: true, suf: '元' }) + F('fin.fund.add', '本年度提撥', { w: 's', num: true, suf: '元', hint: '預設帶入決算「提撥基金」' }))
      + card('支出', F('fin.fund.o1n', '支付（項目）', { w: 's' }) + F('fin.fund.o1', '金額', { w: 's', num: true, suf: '元' }) + F('fin.fund.o2n', '支付（項目）', { w: 's' }) + F('fin.fund.o2', '金額', { w: 's', num: true, suf: '元' }) +
        F('fin.fund.o3', '支付退職金', { w: 's', num: true, suf: '元' }) + F('fin.fund.o4', '支付退休金', { w: 's', num: true, suf: '元' }) + `<div class="f full">${calc('fundTotal')}</div>`)
      + card('說明', F('fin.fund.notes', '說明（每行一點；無動支可留白）', { w: 'full', area: true, rows: 3, ph: '1.支付○○○總幹事退職金經第○屆第○次理事會通過，報經屏東縣政府○年○月○日屏府社政字第○○○○號函核准動支。' }));
  } else {
    body = card('要輸出的報表', ['bud:收支預算表', 'act:收支決算表及現金出納表', 'prop:財產目錄', 'bs:資產負債表', 'fund:基金收支表'].map(x => { const [k, l] = x.split(':'); return FC('fin.sel.' + k, l, { w: 'half' }); }).join('') +
      `<label class="ck full"><input type="checkbox" data-p="fin.hideZero"${S.fin.hideZero ? ' checked' : ''}> 省略預算、上年度預算、決算皆為 0 的科目（說明：預算科目不適用可自行刪除）</label>`);
  }
  return `<div class="tabs">${tabs.map(([k, l]) => `<button type="button" data-fintab="${k}" class="${k === tab ? 'on' : ''}">${l}</button>`).join('')}</div>${body}`;
};

UI.letter = () => card('發文資料', F('letter.no', '發文字號', { w: 'l', ph: '屏縣○鄉○○（○）字第○○○○號' }) + FD('letter.date', '發文日期') + F('letter.to', '受文者', { w: 'm' }) +
  F('letter.speed', '速別', { w: 's' }) + F('letter.secret', '密等及解密條件', { w: 's' }) + F('letter.att', '附件', { w: 's' }))
  + card('聯絡資料', F('letter.addr', '機關地址', { w: 'full' }) + F('letter.contact', '聯絡人', { w: 'm' }) + F('letter.phone', '聯絡電話', { w: 'm' }))
  + card('主旨與說明', F('letter.subject', '主旨', { w: 'full', area: true, rows: 2 }) + F('letter.d1', '說明一', { w: 'full', area: true, rows: 2 }) +
    `<div class="f full"><label>隨函檢附（勾選後自動寫入說明二）</label><div class="cks">${LETTER_ATTS.map(([k, l]) => `<label class="ck"><input type="checkbox" data-p="letter.atts.${k}"${(S.letter.atts || {})[k] !== false ? ' checked' : ''}> ${l}</label>`).join('')}</div></div>` +
    F('letter.d2', '說明二', { w: 'full', area: true, rows: 4 }) + F('letter.d3', '說明三（可留白）', { w: 'full', area: true, rows: 2 }))
  + card('正副本', F('letter.main', '正本', { w: 'm' }) + F('letter.cc', '副本', { w: 'm' }));

/* ===== 計算顯示 ===== */
const CALC = {
  orgFull: () => esc(orgFull()),
  rosterCount: () => {
    const c = {}; S.roster.forEach(r => { if (r.role) c[r.role] = (c[r.role] || 0) + 1; });
    const s = ROLES.filter(r => c[r]).map(r => `${r} ${c[r]}`).join('・');
    return s ? `共 ${S.roster.length} 人：${s}` : '尚未輸入人員';
  },
  elResult: () => {
    const E = S.assembly.el;
    const dr = elResult(E.dirs, V('assembly.el.dirSeats'), V('assembly.el.dirAlt')), sr = elResult(E.sups, V('assembly.el.supSeats'), V('assembly.el.supAlt'));
    if (!dr.all.length && !sr.all.length) return '<span class="muted">輸入候選人與得票數後，這裡會依票數自動排出當選人與候補順序。</span>';
    const f = (t, l) => `<div><b>${t}</b>${l.length ? l.map(c => `${esc(c.name)}（${c.v}）`).join('、') : '—'}</div>`;
    return f('當選理事：', dr.win) + f('候補理事：', dr.alt) + f('當選監事：', sr.win) + f('候補監事：', sr.alt);
  },
  planTotal: () => `經費預估合計：<b>${fmt(S.plan.rows.reduce((s, r) => s + num(r.cost), 0))}</b> 元　｜　預算表支出總計：${fmt(accVal(ACC_BY.exp, 'b'))} 元`,
  yrBY: () => esc(O(BY(), '○')), yrY: () => esc(O(Y(), '○')),
  propTotal: () => `財產合計：<b>${fmt(propSum(''))}</b> 元` + PROP_CATS.filter(c => propSum(c)).map(c => `　${c} ${fmt(propSum(c))}`).join(''),
  bsA: () => fmt(bsAssets()), bsL: () => fmt(bsLiab()), bsE: () => fmt(bsEquity()),
  bsCheck: () => { const a = bsAssets(), r = bsLiab() + bsEquity(); return a === r ? `<span class="ok">✓ 兩方合計相同：${fmt(a)} 元</span>` : `<span class="bad">⚠ 兩方合計不同：資產 ${fmt(a)}，負債基金暨餘絀 ${fmt(r)}（差 ${fmt(a - r)}）</span>`; },
  fundTotal: () => `收入合計 <b>${fmt(fundIn())}</b> 元　支出合計 ${fmt(fundOut())} 元　結餘 <b>${fmt(fundIn() - fundOut())}</b> 元`,
  finChecks: () => {
    const b = finSurplus('b');
    return `<div class="${b === 0 ? 'ok' : 'bad'}">${b === 0 ? '✓ 預算收支平衡（本期餘絀為 0）' : `⚠ 預算本期餘絀為 ${fmt(b)}，預算應本收支平衡原則編列，餘絀需歸零。`}</div>
      <div>決算：收入 ${fmt(accVal(ACC_BY.inc, 'a'))}・支出 ${fmt(accVal(ACC_BY.exp, 'a'))}・本期餘絀 <b>${fmt(finSurplus('a'))}</b>・累計餘絀 <b>${fmt(finSurplus('a') + num(S.fin.prev))}</b>・現金本期結存 ${fmt(cashEnd())}</div>`;
  },
};
function calcVal(key) {
  if (CALC[key]) return CALC[key]();
  const [t, a, b] = key.split(':');
  if (t === 'acc') return fmt(accVal(ACC_BY[a], b));
  if (t === 'sur') return fmt(finSurplus(a));
  if (t === 'bsg') return fmt(bsGroupSum([...BS_LEFT, ...BS_RIGHT_L, ...BS_RIGHT_E].find(g => g.k === a)));
  return '';
}
