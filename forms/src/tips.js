/* ===== 操作提示：預設關閉；開啟後，滑鼠移到欄位或按鈕上（手機：點欄位、長按按鈕）會顯示說明與提醒 ===== */
const tipsOn = () => !!PREFS.tips;
function applyTips() {
  const on = tipsOn();
  document.documentElement.classList.toggle('tips-on', on);
  const b = $('#tipBtn');
  if (b) {
    b.setAttribute('aria-pressed', on);
    b.innerHTML = icon('help') + `<span class="tl">操作提示</span><span class="tsw">${on ? '開' : '關'}</span>`;
    b.title = on ? '操作提示：開（按一下關閉）' : '操作提示：關（按一下開啟，滑鼠移到欄位或按鈕上會顯示說明）';
    b.setAttribute('aria-label', b.title);
  }
  if (!on) tipHide();
}
function setTips(on) {
  setPref('tips', !!on); applyTips(); render({ keep: 1 });
  toast(on ? (lastPtr === 'touch' ? '已開啟操作提示：點欄位會顯示說明，長按按鈕可看用途' : '已開啟操作提示：滑鼠移到欄位或按鈕上，就會顯示說明與提醒') : '已關閉操作提示（右上角「?」可再開啟）');
}
/** 各步驟上方的說明（開啟提示時才顯示） */
function guide(k) {
  if (!tipsOn()) return '';
  const G = {
    home: '先選要辦理的事項。有「第1步、第2步」的請依序辦理，例如先開「選前理監事會」，再開「會員大會－改選」。',
    docs: '① 上方選這次要送的是「會前：開會通知」還是「會後：會議紀錄送件」。② 必備文件已自動勾選，選填的勾了才會出現。③ 財務報表、名冊等資料可以「線上填寫」或「上傳檔案」。',
    fill: '由上往下逐區填寫，填完的區塊會打勾。同樣的資料只要填一次，會自動帶入每一份文件；標示「自動」的欄位已自動帶入，也可以直接改寫。',
    dl: '先看最上方的「送件前自動檢查」：紅色是錯誤、黃色是提醒。沒問題再下載；Word 可以再修改，PDF 適合直接列印送件。',
  };
  if (!G[k]) return '';
  const how = isDesk() && lastPtr !== 'touch' ? '滑鼠移到欄位或按鈕上，會顯示說明與提醒。' : '點欄位會顯示說明；長按按鈕可以看用途。';
  return `<div class="guide" role="note">${icon('help')}<div><b>操作提示</b><p>${G[k]}</p><small>${how}</small></div><button type="button" class="gx" data-cmd="tipsOff" title="關閉操作提示">關閉提示</button></div>`;
}

/* ---------- 提示內容 ---------- */
const TW = (m, lv) => ({ m, lv });
/** 開會日期：自動算出期限 */
function meetDateLines(mk) {
  const M0 = MEET[mk], d = MV(mk, 'date'), today = isoToday(), w = [];
  if (!M0) return w;
  if (M0.before) {
    const a = MV(M0.before, 'date');
    if (a) { const last = addDays(a, -15); w.push(d && daysBetween(d, last) < 0 ? TW(`要在大會 15 日前召開，最晚 ${rd(last)}；目前的日期太晚`, 'bad') : TW(`要在大會 15 日前召開：最晚 ${rd(last)}`)); }
    else w.push(TW('要在會員大會 15 日前召開；填好大會日期後會自動檢查'));
  }
  if (!d) { w.push(TW('填好開會日期後，會自動算出開會通知與會議紀錄的送件期限')); return w; }
  if (M0.same) w.push(TW(`與「${MEET[M0.same].label}」同一天召開，送件期限跟大會相同`));
  else if (brdOnly(mk)) {
    const due = addDays(d, -M0.days), left = daysBetween(today, due);
    w.push(left < 0 ? TW(`開會通知應在 ${rd(due)} 前送達各理事、監事（會議前 ${M0.days} 日），已超過 ${-left} 天，請調整開會日期`, 'bad')
      : TW(`開會通知：${rd(due)} 前送達各理事、監事（會議前 ${M0.days} 日）${left === 0 ? '，就是今天' : `，還有 ${left} 天`}`, left <= 3 ? 'warn' : 'ok'));
    w.push(TW('會議紀錄：閉會後自行留存、提供會員查閱；只有依法令須報縣府的事項（例如會址變更）才檢附文件報送', 'ok'));
  }
  else {
    const due = addDays(d, -M0.days), left = daysBetween(today, due);
    w.push(left < 0 ? TW(`開會通知書應在 ${rd(due)} 前送達縣府（會議前 ${M0.days} 日），已超過 ${-left} 天，請調整開會日期或儘快送件`, 'bad')
      : TW(`開會通知書：${rd(due)} 前送達縣府（會議前 ${M0.days} 日）${left === 0 ? '，就是今天' : `，還有 ${left} 天`}`, left <= 3 ? 'warn' : 'ok'));
    w.push(TW(`會議紀錄：${rd(addDays(d, 30))} 前檢送縣府（會後 30 日內）`, 'ok'));
  }
  if (M0.el === 'chair') w.push(TW(`新任理事長就任後 15 日內完成移交接收：${rd(addDays(d, 15))} 前`));
  return w;
}
/** 出席是否過半 */
function quorumLines(mk) {
  const sh = num(MV(mk, 'should')), at = num(MV(mk, 'attend'));
  if (!sh) return [TW('填好應出席人數後，會自動檢查出席是否過半數')];
  const need = Math.floor(sh / 2) + 1;
  if (!at) return [TW(`應出席 ${sh} 人，至少要 ${need} 人出席（過半數）才能開會`)];
  return [at >= need ? TW(`出席 ${at} 人／應出席 ${sh} 人，已過半數（至少 ${need} 人）`, 'ok') : TW(`出席 ${at} 人，未過半數（至少要 ${need} 人），會議不能成立`, 'bad')];
}
function noticeDateLines(mk) {
  const M0 = MEET[mk], d = MV(mk, 'date'), nd = MV(mk, 'noticeDate');
  if (!d) return [TW('先填開會日期，會自動算出最晚的發文日期')];
  const w = [TW(brdOnly(mk) ? `通知要在會議前 ${M0.days} 日送達各理事、監事：最晚 ${rd(addDays(d, -M0.days))}` : `通知書要在會議前 ${M0.days} 日送達縣府：最晚 ${rd(addDays(d, -M0.days))}，請預留郵寄時間`)];
  if (nd) { const gap = daysBetween(nd, d); if (gap != null && gap < M0.days) w.push(TW(`發文日期距開會只有 ${gap} 天，不足 ${M0.days} 天`, 'bad')); }
  return w;
}
function letterDateLines(mk) {
  const d = MV(mk, 'date'), ld = MV(mk, 'letterDate');
  if (!d) return [TW('先填開會日期，會自動算出期限')];
  if (brdOnly(mk)) { const w0 = [TW('理監事會紀錄閉會後自行留存；只有依法令須報縣府的事項（例如會址變更）才需要發這份公文，沒有 30 日的期限')]; if (ld && daysBetween(d, ld) < 0) w0.push(TW('發文日期早於開會日期，請確認', 'bad')); return w0; }
  const due = addDays(d, 30), w = [TW(`會議紀錄要在會後 30 日內報府：最晚 ${rd(due)}`)];
  if (ld) { if (daysBetween(d, ld) < 0) w.push(TW('發文日期早於開會日期，請確認', 'bad')); else if (daysBetween(ld, due) < 0) w.push(TW(`發文日期已超過會後 30 日（${rd(due)}）`, 'bad')); }
  return w;
}
const MEET_TIPS = {
  date: ['', mk => meetDateLines(mk)],
  time: ['24 小時制，例如 14:00。'], end: ['散會時間會寫在會議紀錄。'],
  place: ['開會地點會印在通知書與會議紀錄；可以在「團體基本資料」設定常用地點，各次會議會自動帶入。'],
  should: ['有表決權的會員人數，不含停權、贊助會員。', mk => quorumLines(mk)],
  attend: ['實際出席人數（含委託出席）。出席要超過應出席人數的一半，會議才成立。', mk => quorumLines(mk)],
  attendDir: ['理事出席人數。理監事聯席會議，理事、監事要分別過半數出席。'], attendSup: ['監事出席人數。理監事聯席會議，理事、監事要分別過半數出席。'],
  noticeDate: ['開會通知書的發文日期。', mk => noticeDateLines(mk)], noticeNo: ['公文字號的號碼，會接在「發文字軌」後面，例如「屏○協字第 15 號」。', mk => noticeDateLines(mk)],
  letterDate: ['檢送會議紀錄公文的發文日期。', mk => letterDateLines(mk)], letterNo: ['公文字號的號碼，會接在「發文字軌」後面。', mk => letterDateLines(mk)],
  topics: ['通知書上的「重要討論事項」。提到工作計畫、財務報表、收支報告、會員名冊、章程時，會自動勾選為「開會通知檢附資料」，附註也會列出附件。'],
  report: ['通知書與會議紀錄的報告事項。提到工作計畫、財務報表、會員名冊等資料時，同樣會自動勾選為開會通知檢附資料。'],
  noticeNote: ['通知書最下面的附註。勾選的開會通知檢附資料會自動列成「附件：…」。'],
  chair: ['會議主席，會印在會議紀錄的簽名欄。'], rec: ['會議紀錄人，會印在會議紀錄的簽名欄。'],
  term: ['第幾屆，例如第 3 屆。'], no: ['這一屆的第幾次會議，例如第 2 次。'],
  subject: ['公文主旨，系統已依會議自動產生，可以再修改。'],
  absentNames: ['多位請用頓號（、）分隔。'], leaveNames: ['多位請用頓號（、）分隔。'], obsNames: ['列席人員姓名，多位請用頓號（、）分隔。'], dirNames: ['出席理事姓名，多位請用頓號（、）分隔。'], supNames: ['出席監事姓名，多位請用頓號（、）分隔。'],
  speech: ['留空就不會出現在會議紀錄。'], guest: ['沒有來賓致詞就留空，會議紀錄會略過。'], chairSpeech: ['留空就不會出現在會議紀錄。'],
  cntPerson: ['有表決權的正式會員人數。'], cntSponsor: ['贊助會員沒有表決權，不算應出席人數。'], cntSuspended: ['停權會員沒有表決權，不算應出席人數。'], asOf: ['會籍統計的截止日期，通常是審定會員名冊的日期。'],
  tmpChair: ['籌備會由發起人推選臨時主席。'],
};
const ORG_TIPS = [
  [/^org\.name$/, '輸入團體名稱、理事長或電話的關鍵字，會列出縣府人民團體名冊裡的團體；選擇後自動帶入會址、電話、理事長、立案字號與屆別，都可以再修改。'],
  [/^org\.(regWord|regNum|regDate)$/, '立案證書上的立案字號與日期，報府公文與大會手冊會用到。'],
  [/^org\.address$/, '縣府登記的會址。要搬遷須經理事會通過後報府（「理監事會」選單可勾選會址變更）。'],
  [/^org\.(phone|mobile|fax|email|web)$/, '會印在公文的聯絡資訊，縣府承辦人有問題會用這裡聯絡。'],
  [/^org\.(contact|contactTitle)$/, '公文上的聯絡人與職稱，通常是總幹事或秘書。'],
  [/^org\.docWord$/, '團體公文字號的開頭，例如「屏○協字」，發文字號會組成「屏○協字第○○號」。'],
  [/^org\.termYears$/, '依章程的理監事任期（年），用來計算改選年度與任期起訖。'],
  [/^org\.(dirSeats|supSeats|stdDirSeats|dirAlt|supAlt)$/, '依章程規定的名額，會用來檢查選舉的當選人數。'],
  [/^org\.(memberCount|groupCount)$/, '目前的會員人數，會帶入應出席人數；停權、贊助會員沒有表決權。'],
  [/^org\.reelectDate$/, '上一次改選的大會日期，用來推算任期與下次改選。'],
  [/^org\.(corp|courtNo|courtDate)$/, '有向法院辦理社團法人登記才需要填；解散時須全體會員三分之二以上同意（民法第57條），和沒有登記的團體不同。'],
  [/^org\.place$/, '常用的開會地點，各次會議會自動帶入，可再個別修改。'],
  [/^org\.(county|town)$/, '團體所在的縣市與鄉鎮市，會用在文件抬頭與地址。'],
];
const CELL_TIPS = {
  name: '姓名請與身分證相同。', role: '職稱，例如理事長、常務理事、理事、監事、總幹事。', gender: '男或女。',
  birth: '民國年月日，可以輸入 45/3/12 或 450312。', job: '目前的工作或職稱。', addr: '戶籍或通訊地址。', phone: '電話或手機。',
  origin: '籍貫，例如屏東縣。', type: '個人會員、團體會員或贊助會員；贊助、停權會員沒有表決權，不算應出席人數。',
  idno: '第 1 碼英文字母，共 10 碼，系統會檢查檢查碼。', votes: '得票數，會用來排出當選與候補順序。',
};
function idLines(path) { const v = getp(S, path); return !isBlank(v) && !checkTwId(v) ? [TW('身分證字號格式或檢查碼不正確，請再核對', 'bad')] : []; }
/** 欄位的說明 */
function fieldTip(f, inp) {
  inp = inp || f.querySelector('[data-p]'); const p = inp && inp.dataset.p; if (!p) return null;
  const lab = f.querySelector('label');
  let t = lab ? [...lab.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim() : '';
  if (!t && inp) t = inp.getAttribute('aria-label') || '';
  let d = '', w = [];
  const mm = /^m\.([^.]+\.[^.]+)\.([^.]+)$/.exec(p), last = p.split('.').pop();
  if (mm && MEET_TIPS[mm[2]]) { const [txt, fn] = MEET_TIPS[mm[2]]; d = txt; if (fn) w = fn(mm[1]); }
  else if (/^m\.[^.]+\.[^.]+\.el\./.test(p)) d = '選舉結果，會帶入當選證明書與會議紀錄。';
  else { const o = ORG_TIPS.find(([re]) => re.test(p)); if (o) d = o[1]; else if (/\.\d+\./.test(p) && CELL_TIPS[last]) d = CELL_TIPS[last]; }
  if (last === 'idno' || /idno$/i.test(p)) { d = d || CELL_TIPS.idno; w = w.concat(idLines(p)); }
  if (!d) { const ph = inp ? (inp.dataset.ph || inp.getAttribute('placeholder') || '') : ''; if (ph && !/^例/.test(ph)) d = `例如：${ph}`; else if (ph) d = ph; }
  if (inp && inp.matches('[data-rdate]') && !/民國/.test(d)) d += (d ? ' ' : '') + '日期可以輸入 115/3/12、1150312 或 115年3月12日。';
  if (inp && inp.classList.contains('num')) d += (d ? ' ' : '') + '只填數字（元），不用加逗號；合計會自動計算。';
  if (f.classList && f.classList.contains('req') && inp && isBlank(inp.value) && isBlank(V(p))) w.push(TW('必填欄位，還沒填的話文件上會空著', 'warn'));
  if (lab && lab.querySelector('.auto')) d += (d ? ' ' : '') + '「自動」：已自動帶入，可以直接改寫。';
  const sec = f.closest('section.sec'), sk = sec && sec.dataset.sec, sc = S.ui.scen;
  const u = sk && SCEN[sc] ? docsUsing(sc, sk).map(x => x.name) : [];
  return { t, d: esc(d), w, u: u.length > 6 ? u.slice(0, 6).concat(`等 ${u.length} 份`) : u };
}
/** 選文件的每一列 */
function docTip(row) {
  const sc = S.ui.scen, id = (row.querySelector('[data-sel]') || {}).dataset?.sel, x = id && docsOf(sc).find(d => d.id === id); if (!x) return null;
  const grp = ((row.closest('.doclist') || {}).previousElementSibling || {}).textContent || '', L = [];
  L.push(x.req ? '必備：縣府規定要附的文件，已自動勾選。' : x.kind === 'attach' ? '另附：要另外準備的文件，可以上傳照片或掃描檔，一起放進壓縮檔與合併 PDF。' : '選填：需要時再勾選，勾了才會出現在「填資料」與「下載」。');
  if (hasBatch(sc)) L.push(/當天/.test(grp) ? '開會當天使用，不必送縣府。' : x.bt === PRE ? `屬於「① 會前：開會通知」，要在會議前 ${MEET[mainMeet(sc)].days} 日送達${scBrd(sc) ? '各理事、監事' : '縣府'}。` : scBrd(sc) ? '屬於「② 會後：會議紀錄送件」；理監事會紀錄自行留存，有依法令須報縣府的事項才送件。' : '屬於「② 會後：會議紀錄送件」，會議後 30 日內送縣府。');
  if (x.mat) L.push('可以「線上填寫」，或直接「上傳檔案」（Excel、PDF、Word、照片），上傳後會自動檢查格式與計算錯誤。');
  else if (x.up) L.push('可以按「上傳」附上照片或掃描檔。');
  const secs = x.kind === 'attach' || isUp(x) ? [] : docSecs(x).map(k => secMeta(k).t);
  if (secs.length) L.push(`要填的資料：${secs.join('、')}。`);
  const w = [];
  if (x.nm && noticeRefs(x.nm).has(x.id) && !isSel(sc, x)) w.push(TW('開會通知書有提到這份資料，建議勾選', 'warn'));
  if (isUp(x) && !upList(sc, x).length) w.push(TW('選了「上傳檔案」，但還沒有上傳', 'warn'));
  return { t: x.name, d: L.map(esc).join('<br>'), w };
}
function scenTip(k) {
  const s = SCEN[k]; if (!s) return null;
  const L = [s.sub + '。'], w = [];
  for (const mk of s.meets()) { const M0 = MEET[mk]; if (!M0 || M0.same) continue; L.push(brdOnly(mk) ? `${M0.label}：開會通知於會議前 ${M0.days} 日送達各理事、監事；會議紀錄自行留存，有依法令須報縣府的事項才送件。` : `${M0.label}：開會通知於會議前 ${M0.days} 日送達縣府，會議紀錄於會後 30 日內報府。`); }
  if (s.prev) w.push(TW(`請先辦理「${SCEN[s.prev].title}」，填過的資料會自動帶過來`));
  if (s.next) w.push(TW(`接著辦理「${SCEN[s.next].title}」`));
  return { t: s.title, d: L.map(esc).join('<br>'), w };
}
const BTN_TIPS = {
  'zip:docx': ['全部下載 Word', '把勾選的文件打包成一個壓縮檔（.zip）。Word 可以再自行修改文字；上傳的附件也會一起放進去。'],
  'zip:xlsx': ['全部下載 Excel', '把勾選的文件打包成 Excel 檔；名冊、財務報表用 Excel 方便再計算。'],
  'zip:pdf': ['全部下載 PDF', '版面固定，適合直接列印送件；設定了電子印章會自動蓋章。'],
  'dl:docx': ['下載 Word', '只下載這一份，Word 可以再自行修改。'], 'dl:xlsx': ['下載 Excel', '只下載這一份 Excel；上傳模式下載的是範本，用 Excel 填好再上傳。'], 'dl:pdf': ['下載 PDF', '只下載這一份 PDF，適合直接列印。'],
  pv: ['預覽', '先看看文件的樣子；有電子印章時，可以在預覽裡拖曳印章位置。'],
  'hb:docx': ['大會手冊（Word）', '把會員大會手冊的各份文件合成一個 Word 檔。'], 'hb:pdf': ['大會手冊（PDF）', '把會員大會手冊合成一份 PDF，上傳的 PDF、照片也會併入。'],
  'cmd:merge': ['送件合併 PDF', '把送件檢核表、全部文件和上傳的附件依序合成一份 PDF，方便列印或寄給縣府。Excel、Word 附件不會併入，請另外附上。'],
  'cmd:ics': ['加入行事曆', '下載 .ics 檔，匯入手機或電腦的行事曆，期限前就會提醒。'],
  'cmd:pvOpen': ['預覽', '看這一區資料帶入文件後的樣子。'],
  'cmd:sealOpen': ['電子印章與簽名', '上傳蓋在白紙上的印章照片，系統自動切出每一顆章並去背；下載的文件會自動核章。'],
  'cmd:toPost': ['切換到會後文件', '開完會後按這裡，準備會議紀錄送件；已填的日期、地點、提案都會沿用。'],
  'mode:fill': ['線上填寫', '直接在網頁上填，合計會自動計算，資料會帶入其他文件。'],
  'mode:up': ['上傳檔案', '已經有做好的檔案就直接上傳（Excel、PDF、Word、照片）；系統會自動檢查格式與計算錯誤，下載時用上傳的檔案。'],
  up: ['上傳', '可以一次選多個檔案；照片會自動縮小。上傳後會自動檢查，結果顯示在下方。'],
  'act:add': ['新增一列', '多筆資料也可以從 Excel 複製後，按「從 Excel 貼上」一次加入。'],
  'cmd:paste': ['從 Excel 貼上', '在 Excel 選取多列複製，貼到這裡，系統會自動辨識姓名、職稱、身分證字號等欄位。'],
  back: ['回首頁', '資料會自動保存，隨時可以回來繼續填。'],
  fontBtn: ['放大字體', '字太小看不清楚時按這裡，再按一次恢復。'],
  wipeBtn: ['清除記憶', '清空這個網頁存在這台裝置瀏覽器裡的所有資料：填寫內容、印章與簽名、上傳的附件與設定。借用別人的電腦或公用電腦填完後，請按這裡。'],
  menuBtn: ['更多功能', '備份、還原、範例資料、版面切換、操作提示、電子印章都在這裡。'],
  tipBtn: ['操作提示', '開啟後，滑鼠移到欄位或按鈕上會顯示說明與提醒；手機上點欄位就會顯示，長按按鈕可以看用途。'],
  layBtn: ['切換版面', '電腦版左右分欄、一次看更多；手機版單欄、按鈕較大。「更多」裡可以改回「自動（依螢幕寬度）」。'],
  cloudChip: ['雲端存檔', '登入 Google 帳號後，資料會自動存到您自己的雲端硬碟，換裝置也能接著填。'],
};
const STEP_TIPS = { docs: ['選文件', '勾選這次要準備的文件；必備的已自動勾選。'], fill: ['填資料', '依序填寫各區資料，同樣的資料只填一次，會自動帶入每份文件。'], dl: ['下載', '預覽、自動檢查，下載 Word、Excel、PDF 或全部打包。'] };
const BATCH_TIPS = {
  pre: ['① 會前：開會通知', '開會前要先送縣府的開會通知書與檢附資料，以及開會當天用的簽到表、選票、委託書。'],
  post: ['② 會後：會議紀錄送件', '開完會後檢送會議紀錄的公文、會議紀錄與各項檢附資料，會議後 30 日內送縣府。'],
};
/** 依元素找出提示內容；沒有就回傳 null */
function tipContent(t) {
  const ds = t.dataset || {}, mk2 = (k, v) => v ? { t: v[0], d: esc(v[1]) } : null;
  if (ds.tip) return { t: ds.tipT || '', d: esc(ds.tip) };
  if (t.matches('.f')) return fieldTip(t);
  if (t.matches('[data-p]') && t.closest('.tr')) return fieldTip(t.closest('.tr'), t);
  if (t.matches('.docrow')) return docTip(t);
  if (t.matches('.tile[data-scen]')) return scenTip(ds.scen);
  if (t.matches('.resume')) return { t: '繼續填寫', d: esc('回到上次填寫的地方；百分比是必填欄位的完成度。') };
  if (t.matches('[data-batch]')) return mk2(0, BATCH_TIPS[ds.batch]);
  if (t.matches('.sh[data-open]')) { const sc = S.ui.scen, u = docsUsing(sc, ds.open).map(x => x.name); return { t: secMeta(ds.open).t, d: esc('點一下展開這一區。右邊的數字是已填／應填的欄位數，全部填好會打勾。'), u: u.length > 6 ? u.slice(0, 6).concat(`等 ${u.length} 份`) : u }; }
  if (ds.step) return mk2(0, STEP_TIPS[ds.step]);
  if (ds.zip) return mk2(0, BTN_TIPS['zip:' + ds.zip]);
  if (ds.dl) return mk2(0, BTN_TIPS['dl:' + ds.fmt]);
  if (ds.pv) return mk2(0, BTN_TIPS.pv);
  if (ds.hb) return mk2(0, BTN_TIPS['hb:' + ds.hb]);
  if (ds.mode) return mk2(0, BTN_TIPS['mode:' + ds.mode]);
  if (ds.up) return mk2(0, BTN_TIPS.up);
  if (ds.cmd) return mk2(0, BTN_TIPS['cmd:' + ds.cmd]);
  if (ds.act === 'add') return mk2(0, BTN_TIPS['act:add']);
  if (t.id && BTN_TIPS[t.id]) return mk2(0, BTN_TIPS[t.id]);
  if (ds.go === 'help') return { t: '會務事項一覽表', d: esc('依縣府會務專區整理：哪些事項要報核、報備，期限與法規依據。') };
  return null;
}

/* ---------- 顯示位置與事件 ---------- */
const TIP_SEL = '[data-tip], .f, .tr [data-p], .docrow, .tile[data-scen], .resume, [data-batch], .sh[data-open], [data-step], [data-zip], [data-dl], [data-pv], [data-hb], [data-mode], [data-up], [data-cmd], [data-act=add], [data-go=help], #back, #fontBtn, #menuBtn, #tipBtn, #layBtn, #cloudChip';
let tipEl = null, tipAt = null, tipHow = '', tipT = 0, lpT = 0, lpXY = null, tipSwallow = false, lastPtr = 'mouse';
function tipResolve(el) {
  let t = el && el.closest ? el.closest(TIP_SEL) : null;
  while (t) {
    if (t.closest('#sheet, #pv, #seal, #modal, #tip, #busy')) return null;
    const c = tipContent(t); if (c && (c.d || (c.w && c.w.length) || (c.u && c.u.length))) return { t, c };
    t = t.parentElement ? t.parentElement.closest(TIP_SEL) : null;
  }
  return null;
}
function tipShow(r, how) {
  if (!r) return;
  if (!tipEl) { tipEl = document.createElement('div'); tipEl.id = 'tip'; tipEl.setAttribute('role', 'tooltip'); document.body.appendChild(tipEl); }
  const { c } = r, w = (c.w || []).filter(Boolean);
  tipEl.innerHTML = `${c.t ? `<b class="tt">${esc(c.t)}</b>` : ''}${c.d ? `<div class="td">${c.d}</div>` : ''}${w.map(x => `<div class="tw ${x.lv || ''}">${icon(x.lv === 'ok' ? 'check' : x.lv === 'bad' || x.lv === 'warn' ? 'warn' : 'clock')}<span>${esc(x.m)}</span></div>`).join('')}${c.u && c.u.length ? `<div class="tu">${icon('doc')}<span>會帶入：${esc(c.u.join('、'))}</span></div>` : ''}`;
  tipEl.hidden = false; tipAt = r.t; tipHow = how; tipPlace();
}
function tipPlace() {
  if (!tipEl || tipEl.hidden || !tipAt) return;
  if (!document.body.contains(tipAt)) return tipHide();
  const a = (tipAt.matches('.f') && tipAt.querySelector('.in')) ? tipAt.querySelector('.in').getBoundingClientRect() : tipAt.getBoundingClientRect();
  const vw = document.documentElement.clientWidth, vh = innerHeight, m = 8;
  if (a.bottom < 0 || a.top > vh) { if (tipHow === 'focus') { tipEl.style.visibility = 'hidden'; return; } return tipHide(); }
  tipEl.style.visibility = ''; tipEl.style.maxWidth = Math.min(380, vw - 2 * m) + 'px'; tipEl.style.left = '0px'; tipEl.style.top = '0px';
  const bw = tipEl.offsetWidth, bh = tipEl.offsetHeight;
  const bar = $('.bar').getBoundingClientRect().bottom, st = $('#steps'), top0 = Math.max(bar, st && !st.hidden ? st.getBoundingClientRect().bottom : 0) + 6;
  const dk = $('#dock'), bot0 = dk && !dk.hidden ? Math.min(vh, dk.getBoundingClientRect().top) - 6 : vh - m;
  let top = a.top - bh - 10, below = false;
  if (top < top0) { top = a.bottom + 10; below = true; }
  if (top + bh > bot0) top = Math.max(top0, bot0 - bh);
  const left = Math.min(Math.max(m, a.left), vw - bw - m);
  tipEl.style.left = left + 'px'; tipEl.style.top = top + 'px';
  tipEl.classList.toggle('below', below);
  tipEl.style.setProperty('--ax', Math.min(Math.max(16, a.left + Math.min(30, a.width / 2) - left), bw - 16) + 'px');
}
function tipHide() { clearTimeout(tipT); if (tipEl) tipEl.hidden = true; tipAt = null; tipHow = ''; }
const focusedField = () => { const a = document.activeElement; return a && a.matches && a.matches('input[data-p], select[data-p], textarea[data-p]') ? a : null; };
document.addEventListener('pointerdown', e => { lastPtr = e.pointerType || 'mouse'; }, true);
document.addEventListener('mouseover', e => {
  if (!tipsOn() || lastPtr === 'touch') return;
  const r = tipResolve(e.target); if (!r || r.t === tipAt) return;
  clearTimeout(tipT); tipT = setTimeout(() => tipShow(r, 'hover'), 260);
});
document.addEventListener('mouseout', e => {
  if (!tipsOn() || lastPtr === 'touch') return;
  const t = e.target.closest && e.target.closest(TIP_SEL); if (!t || (e.relatedTarget && t.contains(e.relatedTarget))) return;
  clearTimeout(tipT);
  if (tipHow === 'hover') {
    const f = focusedField();
    tipT = setTimeout(() => { if (f && document.activeElement === f) tipShow(tipResolve(f), 'focus'); else if (tipHow === 'hover') tipHide(); }, 120);
  }
});
/* 鍵盤操作（Tab）也會顯示：欄位一律顯示，按鈕在用鍵盤移動時顯示 */
document.addEventListener('keydown', e => { if (e.key === 'Tab') lastPtr = 'key'; }, true);
document.addEventListener('focusin', e => {
  if (!tipsOn()) return;
  const isField = e.target.matches('input[data-p], select[data-p], textarea[data-p]');
  if (!isField && lastPtr !== 'key') return;
  clearTimeout(tipT); const r = tipResolve(e.target);
  if (r) { tipShow(r, 'focus'); e.target.setAttribute('aria-describedby', 'tip'); } else if (isField) tipHide();
});
document.addEventListener('focusout', e => {
  if (e.target.getAttribute && e.target.getAttribute('aria-describedby') === 'tip') e.target.removeAttribute('aria-describedby');
  if (!tipsOn()) return;
  setTimeout(() => { if (tipHow === 'focus' && !(tipAt && tipAt.contains(document.activeElement))) tipHide(); }, 0);
});
/* 輸入時更新提示裡的即時提醒（例如出席是否過半、期限） */
document.addEventListener('input', e => { if (tipsOn() && tipHow === 'focus' && tipAt && tipAt.contains(e.target)) { clearTimeout(tipT); tipT = setTimeout(() => { const r = tipResolve(e.target); if (r) tipShow(r, 'focus'); }, 350); } });
/* 手機：長按按鈕或文件列顯示說明，不觸發按鈕 */
document.addEventListener('pointerdown', e => {
  if (!tipsOn() || e.pointerType !== 'touch') return;
  if (tipHow === 'touch' && tipEl && !tipEl.contains(e.target)) tipHide();
  if (e.target.matches('input, select, textarea')) return;
  const r = tipResolve(e.target); if (!r || r.t.matches('.f')) return;
  lpXY = [e.clientX, e.clientY]; clearTimeout(lpT);
  lpT = setTimeout(() => { tipSwallow = true; tipShow(r, 'touch'); if (navigator.vibrate) try { navigator.vibrate(8); } catch (x) { } }, 480);
}, true);
document.addEventListener('pointermove', e => { if (lpXY && Math.hypot(e.clientX - lpXY[0], e.clientY - lpXY[1]) > 10) { clearTimeout(lpT); lpXY = null; } }, true);
['pointerup', 'pointercancel'].forEach(k => document.addEventListener(k, () => { clearTimeout(lpT); lpXY = null; }, true));
document.addEventListener('click', e => { if (tipSwallow) { tipSwallow = false; e.preventDefault(); e.stopPropagation(); } }, true);
document.addEventListener('contextmenu', e => { if (tipsOn() && lastPtr === 'touch' && tipResolve(e.target)) e.preventDefault(); }, true);
/* 捲動：跟著欄位移動；滑鼠提示先收起（不取消正要顯示的提示） */
addEventListener('scroll', () => { if (!tipAt) return; if (tipHow === 'focus') tipPlace(); else if (tipEl) { tipEl.hidden = true; tipAt = null; tipHow = ''; } }, { passive: true, capture: true });
addEventListener('resize', () => tipPlace());
document.addEventListener('keydown', e => { if (e.key === 'Escape' && tipAt) tipHide(); });
