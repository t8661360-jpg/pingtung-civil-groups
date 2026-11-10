/* 逐輪校正的規則式回答（非模型訓練）。每則均附可核對來源；無法確認者明示並引導洽承辦。 */
(function(root){
'use strict';
const LAW='https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=';
const P=n=>({title:'人民團體法第'+n+'條',source:LAW+'D0050091'});
const C=n=>({title:'合作社法第'+n+'條',source:LAW+'D0050112'});
const FIN={title:'屏東縣政府社會處「6項財務報表」Excel範本（填寫說明及表內檢核公式）',source:'本站書表下載｜常年會'};
const norm=s=>String(s||'').normalize('NFKC').replace(/\s+/g,'');
function normalizeQuestion(q){
 return String(q||'').replace(/團題|團休|團提/g,'團體').replace(/理監是會/g,'理監事會').replace(/理監是/g,'理監事').replace(/理是會/g,'理事會').replace(/監是會/g,'監事會').replace(/文鍵|文見/g,'文件').replace(/改舉/g,'改選');
}
const TOPIC=/改選|解散|成立|籌組|法人|統編|開戶|財務|報表|會議|大會|理事|監事|會址|章程|名稱|補助|核銷|免稅|會員|合作社|社區|書表|下載|承辦/;
function withContext(q,prev){
 const t=norm(q);
 if(!prev||t.length>14||TOPIC.test(t))return q;
 if(!/^(那|那麼|那我|還有|然後|所以|另外|接著|再來|要)/.test(t)&&!/^(要準備什麼|要多久|要送哪裡|要找誰|要開會嗎|要多少人)/.test(t))return q;
 return String(prev).replace(/[？?。！!]+$/,'')+'，'+q;
}
function groupKind(t){
 if(/合作社/.test(t))return'coop';
 if(/公會|職業團體|工業會|商業會|同業/.test(t))return'pro';
 return'social';
}
function meetingFrequency(t){
 if(!/(理事會|監事會|理監事會|理監事聯席|社務會)/.test(t)||!/(多久|幾個月|頻率|多常|每幾|間隔|一年.{0,3}幾次|幾次)/.test(t))return null;
 if(/通知|幾天前|寄發/.test(t))return null;
 const k=groupKind(t);
 if(k==='coop')return{category:'合作社會務',title:'合作社理事會、監事會：每三個月至少一次',summary:'合作社理事會、監事會每三個月至少召開一次；社務會每六個月至少一次；社員大會每年至少一次。\n實際開會時間仍要核對合作社章程。',statutes:[C(45)],questionState:{focus:'meeting-frequency',domain:'coop'},notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 if(k==='pro')return{category:'人民團體會務說明',title:'職業團體（公會）理事會、監事會：每三個月至少一次',summary:'職業團體（例如公會）適用人民團體法第29條：理事會、監事會每三個月至少舉行會議一次，並以理事、監事過半數出席，出席人數過半數或較多數同意作成決議。\n工業、商業團體另有專屬法律，請一併核對。',statutes:[P(29)],questionState:{focus:'meeting-frequency',domain:'pro'},notes:['協會、社區發展協會等社會團體是每六個月至少一次（人民團體法第43條）。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 return{category:'人民團體會務說明',title:'協會（社會團體）理事會、監事會：每六個月至少一次',summary:'一般協會、社區發展協會等社會團體，理事會、監事會每六個月至少舉行會議一次（人民團體法第43條）；章程訂得更頻繁的，依章程辦理。\n決議要有理事、監事過半數出席，出席人數過半數或較多數同意（人民團體法第29條第2項）。理事、監事不得委託他人出席。',statutes:[P(43),P(29)],questionState:{focus:'meeting-frequency',domain:'social'},notes:['人民團體法第29條「每三個月至少一次」是一般規定；社會團體另由第43條規定為每六個月，不要混用。','公會等職業團體是每三個月至少一次；合作社依合作社法第45條。'],actions:[{label:'看理監事會辦理',view:'meet',sub:'m-board'}]};
}
function videoMeeting(t){
 if(!/(視訊|線上開會|線上會議|遠距|網路會議|視訊會議|Zoom|zoom|Meet|meet|Teams|teams|LINE開會|line開會)/.test(t))return null;
 if(!/(會|開)/.test(t))return null;
 if(groupKind(t)==='coop')return{category:'合作社會務',title:'合作社可以用視訊開會嗎？目前無法確認',summary:'本站目前沒有足以確認合作社會議可否以視訊方式召開的現行規定資料，因此不直接回答可以或不可以。\n請洽縣府承辦人或合作社主管機關確認後再辦理，避免決議效力有疑義。',statutes:[],questionState:{focus:'video-meeting',domain:'coop'},notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 return{category:'人民團體會務說明',title:'可以用視訊開會，但章程要先寫明',summary:'可以，但要先在章程裡訂明：除法規另有規定外，人民團體章程得訂明會員（會員代表）大會、理事會、監事會以視訊會議或中央主管機關公告的方式召開（人民團體法第25條、第29條）。\n章程沒有寫的，原則上不能直接改成視訊開會；只有遇到天災、事變或其他不可抗力，經中央主管機關公告的期間內，才可以不經章程訂明而以視訊方式開會。\n出席人數、表決方式和會議紀錄仍要依原本規定處理，紀錄要寫明採視訊方式召開。',statutes:[P(25),P(29)],questionState:{focus:'video-meeting',domain:'social'},notes:['如果想新增視訊開會條文，要先由會員大會修改章程（出席三分之二以上同意），報縣府核備後才適用。'],actions:[{label:'看會員大會辦理',view:'meet',sub:'m-assembly'},{label:'聯絡承辦',view:'contact',sub:''}]};
}
function coopMinimum(t){
 if(!/合作社/.test(t)||!/(最少|至少|幾個人|幾人|多少人|人數)/.test(t)||!/(成立|設立|組|籌組|開|辦)/.test(t))return null;
 if(/大會|出席|表決|理事|監事|同意/.test(t))return null;
 return{category:'合作社設立',title:'合作社至少要7人才能設立',summary:'合作社非有七人以上，不得設立（合作社法第8條）。\n設立人要召集創立會，通過章程、選舉理事和監事、組織社務會，並在一個月內檢具創立會會議紀錄、章程及社員名冊，以書面向所在地主管機關辦理成立登記（合作社法第9條）。成立後社員不滿七人，也是法定解散事由之一（合作社法第55條）。',statutes:[C(8),C(9),C(55)],questionState:{focus:'coop-minimum',domain:'coop'},notes:[],actions:[{label:'看合作社辦理說明',view:'biz',sub:'coop'},{label:'聯絡承辦',view:'contact',sub:''}]};
}
const FORM_MAP=[[/改選|選舉|選票/,'改選'],[/解散|清算/,'解散'],[/常年會|會員大會|大會|財務|報表|決算|預算/,'常年會'],[/理監事會|理事會|監事會|會址|補選|辭職/,'理監事會'],[/成立大會|立案/,'成立大會'],[/籌備|入會/,'籌備會'],[/成立|籌組|申請表|申請書|發起人|章程草案/,'申請表']];
function formsDownload(t,catalog){
 if(!/(下載|書表|表格|表單|範本|樣本|格式)/.test(t))return null;
 if(!/(下載|在哪|哪裡|哪邊|去哪|有沒有|給我|拿|找)/.test(t))return null;
 if(/合作社|社區發展協會|社區協會/.test(t))return{category:'書表下載',title:'這類書表本站目前沒有收錄',summary:'本站書表下載目前收錄的是社會處公告的一般人民團體（協會）申請表與會務書表，沒有合作社或社區發展協會的專屬表件。\n請洽縣府承辦人或所在地鄉鎮市公所索取適用的表件，不要直接套用協會範本。',statutes:[],questionState:{focus:'forms-download',domain:'other'},notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''},{label:'看本站書表',view:'forms',sub:''}]};
 const hit=FORM_MAP.find(x=>x[0].test(t));
 const id=hit?hit[1]:'';
 const files=catalog&&catalog.files?catalog.files.filter(f=>!id||f.f===id):[];
 const folder=catalog&&catalog.folders?catalog.folders.find(f=>f.id===id):null;
 const label=folder?folder.label:(id||'各階段');
 const names=files.slice(0,6).map(f=>f.name.replace(/\.(docx|xlsx)$/,''));
 return{category:'書表下載',title:id?`${label}的書表在「書表下載」的「${label}」分類`:'書表在「書表下載」頁，依辦理階段分類',summary:(id?`請到「書表下載」頁點選「${label}」分類，共有 ${files.length} 個檔案，可以單檔下載，也可以按「整包下載」一次下載。`:'請到「書表下載」頁，依辦理階段（申請、籌備會、成立大會、常年會、理監事會、改選、解散）選擇分類，可以單檔或整包下載。')+'\n檔案是社會處公告書表轉存的 Word、Excel 格式，下載後可直接填寫；送件前請再向承辦人確認是否為最新版本。',statutes:[],questionState:{focus:'forms-download',domain:'social'},notes:names.length?[`這個分類包含：${names.join('、')}${files.length>names.length?`等 ${files.length} 個檔案`:''}。`]:[],actions:[{label:id?`前往「${label}」書表`:'前往書表下載',view:'forms',sub:id}]};
}
function financeForms(t){
 const fin=/(財務報表|報表|資產負債表|基金收支表|財產目錄|現金出納表|收支決算表|收支預算表|預算表|決算表|六項|6項)/.test(t);
 if(!fin)return null;
 if(/合作社|工會|公會|補助核銷/.test(t))return null;
 const base={category:'社會團體財務報表',statutes:[],refs:[{title:FIN.title,cat:'官方書表',source:FIN.source,date:'2026-11-09'}],actions:[{label:'下載常年會書表',view:'forms',sub:'常年會'}]};
 if(/資產負債表/.test(t)&&/(不平|不平衡|不相等|不一樣|對不起來|不符|兜不攏|不相同|錯誤|請更正)/.test(t))return{...base,title:'資產負債表不平：左右合計一定要相同',summary:'資產負債表左邊「資產合計」必須等於右邊「負債、基金暨餘絀合計」，範本在兩方不相等時會顯示「兩方合計金額必須相同 請更正」。\n請依序檢查：\n1. 財產目錄的總金額，是否已列入資產負債表的「固定資產」或「其他資產」；範本會比對，不符時顯示「財產金額不正確 請更正」。\n2. 本期餘絀、上期餘絀是否由「決算與現金出納表」正確帶入；決算的收入或支出填錯，餘絀就會錯。\n3. 有提撥基金的，基金是否已由基金收支表帶入。\n4. 有價證券、預付款項、短期借款、雜項負債等科目，如果已經列入決算，就不要再重複填寫。\n5. 現金和銀行存款，要和實際現金、存摺餘額一致。',questionState:{focus:'balance-sheet-unbalanced',domain:'social'},notes:['範本公式：流動資產＋基金＋固定資產＋其他資產＝資產合計；流動負債＋長期負債＋其他負債＋基金＋餘絀＝負債、基金暨餘絀合計。']};
 if(/基金收支表/.test(t)&&/(沒有基金|無基金|沒基金|不用交|要交嗎|也要|免交|需要嗎)/.test(t))return{...base,title:'沒有基金，基金收支表仍要核章後送府',summary:'要。依社會處 6 項財務報表範本的填寫說明：基金應專戶儲存；如無基金，仍請核章後送府。\n有提撥基金的，金額會自動帶入資產負債表；動支基金時，要註明理事會通過的屆次和主管機關核備的文號。基金收支結存應與收支決算表、資產負債表的相關科目金額一致。',questionState:{focus:'fund-form-no-fund',domain:'social'},notes:['本表須經製表、出納、會計、總幹事、團體負責人蓋章。']};
 if(/(預算|預算表)/.test(t)&&/(結餘|餘絀|平衡|歸零|上年度|去年)/.test(t))return{...base,title:'預算表：上年度結餘不可列入今年收入，餘絀要歸零',summary:'依社會處範本的預算編列說明：一、上年度結餘款，不可列入今年的收入；二、預算表應依收支平衡原則編列，本期餘絀需歸零；三、用不到的預算科目可以自行刪除。\n預算與決算的科目名稱相同，修改預算科目名稱時，決算科目會自動跟著修改。',questionState:{focus:'budget-form',domain:'social'},notes:[]};
 if(/財產目錄/.test(t)&&/(折舊|報廢|年限)/.test(t))return{...base,title:'財產目錄範本未設折舊，到期可依規定報廢',summary:'社會處範本的財產目錄沒有設定折舊；財產使用年限到期，可以依規定辦理報廢。\n財產目錄依財產登記簿按固定資產科目編造，總金額要列入資產負債表的「固定資產」或「其他資產」。本表須經製表、保管、會計、總幹事及團體負責人蓋章。',questionState:{focus:'asset-form-depreciation',domain:'social'},notes:['報廢的具體程序請洽承辦人確認。']};
 if(/(誰蓋章|誰簽名|誰簽|蓋章|核章|簽章|簽名)/.test(t))return{...base,title:'財務報表要由誰蓋章',summary:'依社會處 6 項財務報表範本各表下方的核章欄：\n'+SIGN+'\n請依實際擔任職務的人蓋章；送縣府前確認每張表都已核章。',questionState:{focus:'finance-sign',domain:'social'},notes:['基金收支表即使沒有基金，也要核章後送府。']};
 if(/解散/.test(t)&&/(幾項|哪些|幾張|哪幾|要填|報表)/.test(t))return{...base,title:'解散要送 5 項財務報表',summary:'解散時要送 5 項財務報表，缺一不可：收支決算表、現金出納表、資產負債表、財產目錄、基金收支表（不含預算表）。期間計算到解散日止。\n連同解散會員大會紀錄、解散報告表各一式二份函報縣府，並繳回立案證書、圖記及理事長當選證明書。',refs:[{title:'屏東縣政府社會處「團體會務」解散書表（5項財務報表、呈報會議紀錄公文）',cat:'官方書表',source:'本站書表下載｜解散',date:'2026-11-09'}],questionState:{focus:'dissolution-reports',domain:'social'},notes:[],actions:[{label:'下載解散書表',view:'forms',sub:'解散'}]};
 if(/(六項|6項|哪幾項|哪六|有哪些|哪些|是什麼)/.test(t)&&/(財務報表|報表)/.test(t))return{...base,title:'6 項財務報表是哪 6 項',summary:'社會處「6項財務報表」範本（一般協會用）包含：收支預算表、收支決算表、現金出納表、財產目錄、資產負債表、基金收支表。\n範本中「收支決算表」和「現金出納表」放在同一個工作表（決算與現金出納表），所以 Excel 只有 5 個表格工作表，另有 1 張填寫說明。團體名稱只要在「預算」工作表輸入，其他工作表會自動帶入。',questionState:{focus:'six-reports-list',domain:'social'},notes:['解散時送的是不含預算表的 5 項財務報表。','合作社、社區發展協會是否使用相同表式，本站尚未確認，請洽承辦人。']};
 return null;
}
function dissolutionHowTo(t){
 if(!/解散/.test(t)||/合作社|多少人|同意|表決|門檻|幾成|比例|罷免/.test(t))return null;
 if(!/(辦|怎麼|如何|流程|準備|開會|要做|處理|手續|步驟)/.test(t)&&t.length>8)return null;
 return'KB:解散';
}

const F=n=>({title:'社會團體財務處理辦法第'+n+'條',source:LAW+'D0050097'});
const ZC={title:'屏東縣社會團體章程草案範例第22條（社會處人民團體申請表）',source:'本站書表下載｜申請表'};
function feeAnswer(t){
 if(!/(會費|入會費|常年會費|年費)/.test(t)||!/(可以收|能收|可不可以收|要收|收多少|怎麼收|能不能收|可以收取|收取)/.test(t))return null;
 if(/退|合作社|工會|公會/.test(t))return null;
 return{category:'人民團體財務',title:'可以收會費，但金額和繳法要經會員大會通過',summary:'可以。入會費、常年會費都是人民團體的法定經費來源；繳納數額及方式要提經會員（會員代表）大會通過，並報請主管機關核備後才能實施（人民團體法第33條）。\n社會團體（含社區發展協會）還要把入會費、常年會費的標準和繳納方式訂入章程（社會團體財務處理辦法第14條）。收費時要掣給正式收據並留存根（同辦法第17條）。',statutes:[P(33),F(14),F(17)],questionState:{focus:'fee-collect',domain:'social'},notes:['如要退費，應由理事會訂定退費原則，提經會員大會通過後辦理（社會團體財務處理辦法第14條）。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function coopAssemblyQuorum(t){
 if(!/合作社/.test(t)||!/(社員大會|社員代表大會)/.test(t)||!/(出席|多少人|幾人|過半|開會門檻|才能開|可以開)/.test(t))return null;
 if(/解散|合併|委託.{0,4}幾|代理/.test(t))return null;
 return{category:'合作社會務',title:'合作社社員大會：全體社員過半數出席才能開會',summary:'合作社社員大會應有全體社員過半數出席，始得開會；出席社員過半數同意，始得決議（合作社法第48條）。\n不能出席的社員可以書面委託其他社員代理，但同一代理人不得代理二人以上（合作社法第50條）。解散或合併的決議門檻較高：全體社員四分之三以上出席、出席社員三分之二以上同意（合作社法第55條）。',statutes:[C(48),C(50),C(55)],questionState:{focus:'coop-assembly-quorum',domain:'coop'},notes:['章程如有更嚴格規定，依章程辦理。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function proxyCount(t){
 if(!/(委託|代理)/.test(t)||!/(幾個|幾人|多少人|幾位|幾份|上限|最多)/.test(t))return null;
 if(/比例|三分之一|1\/3/.test(t))return null;
 if(/合作社/.test(t))return{category:'合作社會務',title:'合作社：每位社員最多代理一人',summary:'社員不能出席社員大會時，得以書面委託其他社員代理；同一代理人不得代理二人以上的社員（合作社法第50條）。',statutes:[C(50)],questionState:{focus:'proxy-count',domain:'coop'},notes:[],actions:[]};
 if(/理事會|監事會|理監事/.test(t)&&!/會員大會/.test(t))return{category:'人民團體會務說明',title:'理事、監事開會不能委託別人代理',summary:'不行。理事、監事應親自出席理事、監事會議，不得委託他人代理；連續二次無故缺席，視同辭職（人民團體法第31條）。',statutes:[P(31)],questionState:{focus:'proxy-count',domain:'social'},notes:[],actions:[]};
 const pro=/公會|職業團體/.test(t);
 return{category:'人民團體會務說明',title:'會員大會：每位會員最多代理一人',summary:pro?'職業團體會員不能親自出席會員大會時，得以書面委託其他會員代理，每一會員以代理一人為限；而且委託出席人數不得超過該次會議親自出席人數的三分之一（人民團體法第38條）。':'每位會員（會員代表）最多只能接受一人委託。協會、社區發展協會等社會團體的會員不能親自出席會員大會時，得以書面委託其他會員代理，每一會員以代理一人為限（人民團體法第42條）。\n理事會、監事會則不能委託代理（人民團體法第31條）。',statutes:pro?[P(38)]:[P(42),P(31)],questionState:{focus:'proxy-count',domain:pro?'pro':'social'},notes:pro?[]:['公會等職業團體另有「委託人數不得超過親自出席人數三分之一」的限制（人民團體法第38條）。'],actions:[{label:'下載委託書範本',view:'forms',sub:'常年會'}]};
}
function concurrent(t){
 const staff=/(總幹事|工作人員|會計|出納|秘書)/.test(t);
 if(!/(理事|監事)/.test(t)||!/(兼|兼任|同時當|也當|可以當|能當|擔任)/.test(t))return null;
 if(staff&&!/合作社/.test(t)){
  if(/公會|職業團體/.test(t))return{category:'人民團體會務說明',title:'公會理事、監事不得兼任會務工作人員',summary:'不可以。商業同業公會理事、監事不得兼任該公會的會務工作人員（商業團體法施行細則第22條）；工業同業公會亦同（工業團體法施行細則第25條）。',statutes:[{title:'商業團體法施行細則第22條',source:LAW+'D0050101'},{title:'工業團體法施行細則第25條',source:LAW+'D0050104'}],questionState:{focus:'concurrent',domain:'pro'},notes:[],actions:[]};
  return{category:'人民團體會務說明',title:'協會理事、監事不能兼任總幹事等工作人員',summary:'依本縣社會團體章程草案範例第22條，總幹事及其他工作人員由理事長提名經理事會通過聘免，並報主管機關備查；工作人員不得由理事、監事擔任。\n實際以貴會經核備的章程為準；如果章程沒有這一條，請洽承辦人確認。理事、監事是無給職，只能依標準酌發出席費或交通費（社會團體財務處理辦法第19條）。',statutes:[ZC,F(19)],questionState:{focus:'concurrent',domain:'social'},notes:['財務人員（會計、出納、財物管理）原則應專任；編制不足時得由其他工作人員兼辦（社會團體財務處理辦法第17條）。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 }
 if(/監事/.test(t)&&/理事/.test(t)&&/兼/.test(t)){
  if(/合作社/.test(t))return{category:'合作社會務',title:'合作社監事不得兼任理事',summary:'不可以。合作社監事不得兼任理事、事務員或技術員；曾任理事的社員，在責任未解除前不得當選監事（合作社法第40條）。',statutes:[C(40)],questionState:{focus:'concurrent',domain:'coop'},notes:[],actions:[]};
  return {category:'人民團體會務說明',title:'協會理事與監事不能一人兼任：同時當選須當場擇一',summary:'不可以。人民團體選舉罷免辦法第16條明定：會員如一人同時當選理事與監事（或候補理事與候補監事），由當選人當場擇一擔任；當選人不在場或無法擇定時，以得票較多的職位為當選，票數相同抽籤。所以同一人不能同時擔任理事與監事。\n\n理由：理事會執行會務、監事會監察理事會（人民團體法第18條），一人兼任兩者就無人監督。\n\n常見狀況：\n• 改選開票後發現同一人理事、監事都上榜 → 主席當場請本人選一個，另一個職位由次高票遞補為當選。\n• 現任理事任期中想改任監事 → 須先辭理事（經理事會決議解任，人民團體法第23條），再於補選時參選監事。',statutes:[E(16),P(18),P(23)],notes:['公會等職業團體另有理監事不得兼任會務工作人員的限制；合作社則依合作社法第40條，監事不得兼任理事。'],questionState:{focus:'director-supervisor-dual',domain:'social'}};
 }
 return null;
}
function financeQuestioned(t){
 if(!/(帳|帳目|財務|經費|收支|錢)/.test(t)||!/(被質疑|質疑|被懷疑|被說|被檢舉|不清楚|不透明|要求查帳|查帳)/.test(t))return null;
 if(/合作社/.test(t))return null;
 return{category:'人民團體財務',title:'協會帳目被質疑：先整理帳證，由監事會查核',summary:'先把帳簿、會計憑證、收據存根、存摺和 6 項財務報表整理齊全，請監事會依職權查核；社會團體的財務查核由監事會為之，必要時得舉行臨時監事會議執行查核（社會團體財務處理辦法第22條）。\n查核結果可在理監事會或會員大會說明。會計帳簿、憑證及報表在年度決算辦理完畢後至少保存十年（同辦法第21條）；提用存款時應由負責人、總幹事及財務人員共同蓋章（同辦法第17條）。主管機關也得視需要抽查團體財務。',statutes:[F(22),F(21),F(17)],questionState:{focus:'finance-questioned',domain:'social'},notes:['如果是會員懷疑款項被挪用，可以請求監事會查核或向主管機關反映；涉及刑事責任的，另依司法程序處理。','爭議較大時，請洽承辦人。'],actions:[{label:'聯絡承辦',view:'contact',sub:''},{label:'下載常年會書表',view:'forms',sub:'常年會'}]};
}
function financeDeadline(t){
 if(!/(決算|財務報告|會計報告|年度報告|工作報告|財務報表|預算)/.test(t)||!/(什麼時候|何時|期限|多久|幾月|截止|來不及|要交|送縣府)/.test(t))return null;
 if(/合作社|工會|公會|補助|核銷/.test(t))return null;
 return{category:'社會團體財務報表',title:'年度終了後三個月內編造決算，經大會通過後報縣府備查',summary:'依社會團體財務處理辦法第11條：會計年度開始前，由理事會編造年度工作計畫及收支預算表；會計年度終了後三個月內，由理事會編造上年度工作報告、會計報告，連同當年度工作計畫、收支預算表，提經會員（會員代表）大會通過後，報請主管機關備查。\n因故未能如期開大會，可先經理事會及監事會或理監事聯席會議通過，事後提報大會追認，再報主管機關備查。',statutes:[F(11)],questionState:{focus:'finance-deadline',domain:'social'},notes:['本縣社會團體章程草案範例第31、32條寫的是「年度開始前二個月編造、終了後二個月內編造、三月底前報核備」，與現行辦法不同；請以現行辦法及貴會章程為準，報送日期請向承辦人確認。','決算金額達新臺幣一千五百萬元以上者，得委請會計師簽證。'],actions:[{label:'下載常年會書表',view:'forms',sub:'常年會'}]};
}
const SIGN='預算表、決算與現金出納表：製表、會計、總幹事、理事長。\n財產目錄：製表、保管、會計、總幹事、團體負責人。\n資產負債表、基金收支表：製表、出納、會計、總幹事、團體負責人。';

const G=n=>({title:'人民團體會務輔導辦法第'+n+'條',source:LAW+'D0020094'});
function chairNoMeeting(t){
 if(!/(理事長|召集人)/.test(t)||!/(不開會|不召開|不肯開|拒絕開|不開|都沒開|一直沒開|拖著不開)/.test(t))return null;
 if(/合作社/.test(t))return null;
 if(/大會/.test(t))return{category:'會務爭議',title:'理事長不召開會員大會：會員五分之一以上可請求，仍不開可請主管機關指定召集',summary:'會員（會員代表）五分之一以上請求，或監事會函請召集時，應召開臨時會員大會（人民團體法第25條）。\n大會不能依法召開時，得由主管機關指定理事一人召集（人民團體法第32條）。請保留書面請求、寄送掛號及回執等紀錄，再向縣府承辦人反映。',statutes:[P(25),P(32)],questionState:{focus:'chair-no-meeting',domain:'social'},notes:['不要自行號召開會：未依法召集的會議，決議效力可能有爭議。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 return{category:'會務爭議',title:'理事長不開理事會：理事過半數書面連署，15日內應召開',summary:'理事過半數以書面連署請求時，理事長應在收到連署後 15 日內召開臨時理事會議完畢；連署書要以雙掛號寄給理事長並取得回執，再報主管機關備查（人民團體會務輔導辦法第13條）。\n理事長無正當理由不召開理事會超過二個會次，應由主管機關解除其理事長職務，另行改選（人民團體法第30條）；理事會不能依法召開時，主管機關得指定理事一人召集（人民團體法第32條）。',statutes:[G(13),P(30),P(32)],questionState:{focus:'chair-no-meeting',domain:'social'},notes:['監事會召集人不召開監事會時，比照由監事過半數書面連署處理。','請保留連署書、掛號回執等證明，向縣府承辦人反映。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}

const E=n=>({title:'人民團體選舉罷免辦法第'+n+'條',source:LAW+'D0050093'});
const CN={'零':0,'一':1,'二':2,'兩':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9};
function cnum(x){if(/^\d+$/.test(x))return+x;let n=0,cur=0;for(const ch of x){if(ch==='十'){n+=(cur||1)*10;cur=0}else if(ch in CN)cur=CN[ch];else return NaN}return n+cur}
function vacancyQuorum(t){
 if(!/(理事|監事)/.test(t)||!/(剩|現有|只有|目前|在任|出缺|缺額|少了|走了|辭職)/.test(t)||!/(幾人|幾位|多少人|多少位|才能|成會|開會|出席)/.test(t))return null;
 const nums=[...t.matchAll(/(\d+|[一二兩三四五六七八九十]+)\s*(?:人|位|名)/g)].map(m=>cnum(m[1])).filter(n=>n>0&&n<200);
 if(nums.length<2)return null;
 let N=nums[0],M=nums[1];
 // 改進: 更清晰的出缺檢測邏輯
 // 檢查"走了X人"或"少了X人"等情況 - 此時第二個數字是出缺人數，需要轉換為現任人數
 if(/(少了|走了|辭職了?|出缺了?|缺了)\s*(\d+|[一二兩三四五六七八九十]+)\s*(人|位|名)/.test(t)&&M<N&&!/(剩|現有|只有|目前|在任)/.test(t))M=N-M;
 if(!(M>0&&M<=N))return null;
 const body=/監事/.test(t)&&!/理事/.test(t)?'監事':'理事';
 const coop=/合作社/.test(t),pro=/公會|職業團體/.test(t);
 const q=Math.floor(M/2)+1,qN=Math.floor(N/2)+1,two=Math.ceil(N*2/3);
 const law=coop?[C(body==='理事'?53:45)]:pro?[{title:'商業團體法第32條',source:LAW+'D0050100'}]:[P(29),G(16),E(17)];
 
 // 改進: 當 M < N 且題目不夠清楚時，提供兩個情況的答案
 // 檢查是否明確提到出缺、剩下等情況
 const isClearAboutVacancy=/(出缺|辭職|少了|走了|現在剩|只剩|剩\d+|剩[一二兩三四五六七八九十]|現在只[有剩]|剩下|現有|在任)/.test(t);
 if(M<N&&!isClearAboutVacancy){
  const summary=`【情況 A】如果現任${body}就是 ${M} 人（原定 ${N} 人有人出缺）：\n需要 ${q} 人出席才能開會。\n\n【情況 B】如果原定 ${N} 人都還在任，現在只有 ${M} 人出席：\n需要 ${qN} 人出席才能開會。\n\n請確認現任${body}的實際人數，或告訴我是否有人出缺，我會幫您精確計算。`;
  return{category:coop?'合作社會務':'人民團體會務說明',title:`${body}${N}人，出席${M}人 - 需要澄清`,summary:summary,statutes:law,questionState:{focus:'vacancy-quorum',domain:coop?'coop':pro?'pro':'social'},notes:[`出席人數以簽到或報到人數計算；${body}應親自出席，不得委託他人代理（人民團體法第31條）。`,'「應出席人員」為人民團體會務輔導辦法第16條用語；章程另有規定時，依章程辦理。'],actions:[{label:'看理監事會辦理',view:'meet',sub:'m-board'},{label:'聯絡承辦',view:'contact',sub:''}]};
 }
 
 // 原有邏輯繼續 (確定有人出缺或無人出缺的情況)
 const fill=coop?'':(M>=two?`另外，現任 ${M} 人仍達章程名額 ${N} 人的三分之二（${two} 人），不必補選；有候補${body}時應先依序遞補（人民團體選舉罷免辦法第17條），遞補後應出席人數也會跟著增加。`:`另外，現任 ${M} 人已不足章程名額 ${N} 人的三分之二（${two} 人）：依人民團體選舉罷免辦法第17條，應先由候補${body}依次遞補，遞補後仍不足三分之二時，應補選足額。`);
 return{category:coop?'合作社會務':'人民團體會務說明',title:`現任${body} ${M} 人：至少要 ${q} 人出席才能開會`,summary:`至少要 ${q} 人出席。${body}會要有應出席人員過半數出席才能成會；${body}出缺後，應出席的是現任的 ${M} 位${body}，${M} 人的過半數是 ${q} 人。決議再以出席${body}過半數或較多數同意（${coop?'合作社法':'人民團體法第29條、人民團體會務輔導辦法第16條'}）。\n`+(qN!==q?`如果對計算基準有疑義（例如以章程定額 ${N} 人計算，需要 ${qN} 人），保守做法是出席 ${qN} 人以上，兩種算法都成會；仍有疑義請洽承辦人確認。\n`:'')+fill,statutes:law,questionState:{focus:'vacancy-quorum',domain:coop?'coop':pro?'pro':'social'},notes:[`出席人數以簽到或報到人數計算；${body}應親自出席，不得委託他人代理（人民團體法第31條）。`,'「應出席人員」為人民團體會務輔導辦法第16條用語；章程另有規定時，依章程辦理。'],actions:[{label:'看理監事會辦理',view:'meet',sub:'m-board'},{label:'聯絡承辦',view:'contact',sub:''}]};
}

function boardQuorumGeneral(t){
 if(!/(理事會|監事會)/.test(t)||!/(幾人|幾位|多少人|多少位)/.test(t)||!/(出席|開會|成會|才能開)/.test(t))return null;
 if(/\d|[一二兩三四五六七八九十]\s*(人|位|名)/.test(t)||/合作社|公會|大會/.test(t))return null;
 const b=/監事會/.test(t)&&!/理事會/.test(t)?'監事':'理事';
 return{category:'人民團體會務說明',title:`${b}會要全體${b}過半數出席才能開會`,summary:`${b}會要有應出席${b}過半數出席才能成會，例如應出席 9 人時至少 5 人、應出席 7 人時至少 4 人；決議再以出席${b}過半數或較多數同意（人民團體法第29條、人民團體會務輔導辦法第16條）。\n${b}應親自出席，不得委託他人代理（人民團體法第31條）。如果有${b}出缺，請告訴我章程名額和現任人數，我幫您算。`,statutes:[P(29),G(16),P(31)],questionState:{focus:'board-quorum',domain:'social'},notes:['合作社理事會依合作社法第53條，同樣是理事過半數出席。'],actions:[{label:'看理監事會辦理',view:'meet',sub:'m-board'}]};
}

function boardFinanceAgenda(t){
 const mon=t.match(/(\d{1,2})\s*月/);
 const monCh=t.match(/(一|二|三|四|五|六|七|八|九|十|十一|十二)\s*月/);
 if(!mon&&!monCh)return null;
 if(!/(理監事會|理事會|理監事聯席|聯席會)/.test(t))return null;
 if(!/(財報|財務報表|財務|報表|決算|預算|審議|審查|審什麼|議什麼|報什麼|討論什麼|要審|要討論|該審|應該審|應審)/.test(t))return null;
 const m=mon?+mon[1]:({'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10,'十一':11,'十二':12})[monCh[1]];
 if(!(m>=1&&m<=12))return null;
  let title,summary,notes=[];
 if(m>=1&&m<=3){
  title=`${m} 月理監事會：審議上年度決算與當年度工作計畫`;
  summary=`${m} 月份召開的理監事會，主要審議兩大項：\n`+
   `一、上年度決算：收支決算表、資產負債表、財產目錄、基金收支表（社會團體財務處理辦法第11、12條，年度終了後三個月內由理事會編造）。審議後送監事會審核，再提會員大會通過。\n`+
   `二、當年度工作計畫與收支預算表（如尚未提報）。\n`+
   `如果來不及在 ${m} 月開會員大會，可先經理監事聯席會議通過，事後提報大會追認（財務處理辦法第11條）。`;
  notes=['決算報告應先送監事會審核，再提報會員大會（人民團體法第34條）。'];
 }else if(m>=4&&m<=6){
  title=`${m} 月理監事會：確認上年度決算是否已報送、檢視半年度收支`;
  summary=`${m} 月份的理監事會，財務方面通常處理：\n`+
   `一、確認 上年度決算是否已經會員大會通過並報送縣府備查。如果上年度決算還沒完成，應儘速處理。\n`+
   `二、報告今年上半年度經費收支執行情形，檢視預算執行是否正常。\n`+
   `三、如有不動產買賣、基金動支等提案，視情形審議。`;
  notes=['上年度決算金額達新臺幣 1,500 萬元以上者，得委請會計師簽證（財務處理辦法第11條）。'];
 }else if(m>=7&&m<=9){
  title=`${m} 月理監事會：審議半年度收支報告、籌劃下年度工作計畫`;
  summary=`${m} 月份的理監事會，財務方面通常處理：\n`+
   `一、報告上半年度（1 至 6 月）經費收支執行情形，對照預算檢討差異。\n`+
   `二、開始籌劃 下年度工作計畫與收支預算表的編列方向（依財務處理辦法第11條，年度開始前應由理事會編造，提經會員大會通過）。\n`+
   `三、如有基金提列或動支、不動產處理、設備採購等提案，視情形審議。`;
  notes=['屆滿改選的年度，要同時籌備改選事宜，改選大會通常一併審議財務報表。'];
 }else{
  title=`${m} 月理監事會：審議下年度工作計畫與收支預算表`;
  summary=`${m} 月份的理監事會，財務方面主要審議：\n`+
   `一、下年度工作計畫與收支預算表（依財務處理辦法第11條，年度開始前應由理事會編造；預算表依收支平衡原則編列，本期餘絀歸零，上年度結餘不列入收入）。\n`+
   `二、報告本年度截至目前的經費收支執行情形。\n`+
   `三、討論常年會（會員大會）的召開時間與議程安排。\n`+
   `審議後提會員大會通過，並在年度開始前報送縣府備查。`;
  notes=['員工待遇表也應在此時提出。'];
 }
 return{category:'社會團體財務報表',title,summary,statutes:[F(11),F(12),P(34)],questionState:{focus:'board-finance-agenda',domain:'social'},notes:[...notes,'實際審議事項以各團體章程及當年度業務需要為準；本站依法規時程整理，供參考。','合作社、公會另有專屬規定，本回答以一般協會（社會團體）為範圍。'],actions:[{label:'看年度報告流程',view:'meet',sub:'m-finance'},{label:'下載常年會書表',view:'forms',sub:'常年會'}]};
}

function chairResign(t){
 if(!/(理事長|主席|負責人)/.test(t))return null;
 if(!/(辭職|辭任|請辭|不做了|不幹了|辭掉|退任|離職)/.test(t))return null;
 if(/(罷免|撤換|下台|趕走|投票罷免)/.test(t))return null;
 if(/合作社/.test(t))return{category:'合作社會務',title:'合作社理事主席辭職',summary:'合作社理事主席（相當於理事長）的辭職，應以書面提出，辭職書送達合作社社址所在地時即生效力（合作社選舉罷免辦法第8條）。辭職生效後，由其他理事按規定推選或由候補理事遞補。辭職後不得在同一任期內再行當選同一職務。辭職人員原辦理之任務工作，應完成交接事宜，交接及遞補情形應在會議提出報告。',statutes:[{title:'合作社選舉罷免辦法第8條',source:LAW+'D0050117'}],questionState:{focus:'chair-resign',domain:'coop'},notes:['合作社具體章程另有規定時，依章程辦理。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 return{category:'人民團體會務說明',title:'理事長請辭：書面提出，經理事會決議後解任',summary:'理事長辭職要以書面提出，經理事會出席過半數、出席人數三分之二以上同意通過後解任（人民團體選舉罷免辦法第27條）。辭職准許後，由候補理事遞補並召開理監事聯席會議補選新任理事長（理事長出缺原則應於一個月內補選，遺任期不足六個月得推人代理）。\n辦理流程：理事長遞出辭職書 → 召開理事會審議（出席過半數、出席三分之二以上同意） → 理事會決議准辭 → 候補理事遞補 → 召開理監事聯席會議補選新任理事長 → 函報縣府備查。',statutes:[E(27),P(23),P(30)],questionState:{focus:'chair-resign',domain:'social'},notes:['辭職後不得在原任期內再行當選同一職務（選罷辦法第27條）。','如果理事長拒不辭職又不開會，依其他途徑處理。'],actions:[{label:'看理事長補選',view:'meet',sub:'m-board'},{label:'聯絡承辦',view:'contact',sub:''}]};
}
function memberExpulsion(t){
 if(!/(除名|開除|被趕走)/.test(t))return null;
 if(/(退會費|退費|會費)/.test(t))return null;
 if(!/(申訴|救濟|不服|怎麼辦|可以嗎|不公|有意見)/.test(t)&&!/會員/.test(t))return null;
 if(/合作社/.test(t))return{category:'合作社會務',title:'合作社社員除名：社務會決議，書面通知並報告社員大會',summary:'合作社社員除名須經社務會出席理事、監事四分之三以上之議決，以書面通知被除名的社員，並報告社員大會（合作社法第28條）。除名事由以章程規定為準。\n被除名的社員如果不服，可以依章程或內部仲裁、救濟程序提出；如果對程序合法性有疑義，另可依循民事訴訟途徑處理。',statutes:[C(28)],questionState:{focus:'member-expulsion',domain:'coop'},notes:['被除名的社員股金結算，依合作社法第29條辦理。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 return{category:'人民團體會務說明',title:'會員除名：須經會員大會出席三分之二以上同意',summary:'會員除名要在會員大會決議，而且要出席人數三分之二以上同意（人民團體法第14、27條）。程序上，理事會先就會員違反法令、章程或不遵守大會決議而致危害團體且情節重大的事實提案，提交會員大會討論表決。\n如果您是被除名的會員：法律沒有規定團體內部的申訴程序，但如果認為除名決議有程序瑕疵或實質不當，可以依民事訴訟途徑請求法院確認決議效力。處理之前，建議先洽律師或承辦人了解個案情形。',statutes:[P(14),P(27)],questionState:{focus:'member-expulsion',domain:'social'},notes:['章程應載明會員除名的事由與程序（人民團體法第12條）。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function sealChange(t){
 if(!/(印鑑|印信|圖記|印章|大印|官章)/.test(t))return null;
 if(!/(變更|換|改|不見|遺失|補發|損壞|更換|新刻)/.test(t))return null;
 return{category:'人民團體會務說明',title:'協會圖記（印鑑）變更：經理事會決議後報縣府備查',summary:'協會圖記（公印）由協會自行製用，拓具印模送主管機關備查（人民團體法第10條）。變更圖記（例如改選後重新刻印、圖記遺失或損壞）的程序：\n1. 開理事會決議：說明變更原因、新圖記規格。\n2. 新圖記規格：長、寬、直徑或短徑應在3公分以上。\n3. 拓具新圖記印模，檢附理事會紀錄函報縣府備查。\n4. 有法人登記的，另向法院辦理變更登記。\n5. 新圖記啟用後，同步到銀行辦理印鑑變更。',statutes:[P(10)],questionState:{focus:'seal-change',domain:'social'},notes:['改選時，新舊任理事長依移交清冊辦理圖記移交（人民團體會務輔導辦法第18條）；屆期未完成移交，主管機關得註銷原立案證書重新發給，原備查之圖記失其效力。'],actions:[{label:'下載改選書表',view:'forms',sub:'改選'},{label:'聯絡承辦',view:'contact',sub:''}]};
}
function noHandover(t){
 if(!/(移交|交接|不交接|不移交|沒移交|拒絕移交|不肯交)/.test(t)||!/(理事長|前任|卸任|舊任|怎麼辦|沒辦法|不肯|拒絕)/.test(t))return null;
 return{category:'人民團體會務說明',title:'前任理事長不移交：15日未完成可報縣府註銷原證書',summary:'依人民團體會務輔導辦法第18條，理事長改選後應由新任理事長會同監交人（新任監事會召集人或新任監事互推一人），在15日內完成接收。移交項目包括立案證書、圖記、未完成案件、檔案、財務及人事等。\n屆期未完成移交的處理方式：\n1. 除依法處理外，報請主管機關（縣府社會處）將原發立案證書予以「註銷並重新發給」。\n2. 原備查之圖記失其效力（等於前任拿著的舊圖記作廢）。\n3. 新任理事長拿到新證書、新刻圖記後，就可以對外辦理業務。\n同時向銀行辦理負責人與印鑑變更，凍結原帳戶避免資金被動用。',statutes:[G(18)],questionState:{focus:'no-handover',domain:'social'},notes:['如果涉及侵占財物，另依刑事程序處理。'],actions:[{label:'看移交流程',view:'meet',sub:'m-roster'},{label:'聯絡承辦',view:'contact',sub:''}]};
}
function communityDissolutionProperty(t){
 if(!/社區/.test(t)||!/解散/.test(t)||!/財產|歸誰|歸屬|剩餘/.test(t))return null;
 return{category:'社區發展協會',title:'社區發展協會解散後剩餘財產：歸屬地方自治團體或主管機關指定之機構',summary:'社區發展協會的章程通常比照人民團體法社會團體的規定，訂明解散後剩餘財產歸屬所在地之地方自治團體，或由主管機關指定之機關團體所有（本縣社會團體章程草案範例第34條參照）。不能由理監事或會員分配。實際歸屬以貴會經核備的章程為準，處理前請洽鄉鎮市公所或縣府承辦人確認。',statutes:[{title:'屏東縣社會團體章程草案範例第34條',source:'本站書表下載｜申請表'}],questionState:{focus:'community-dissolution-property',domain:'social'},notes:['合作社解散後剩餘財產的處理依合作社法辦理。'],actions:[{label:'看解散流程',view:'biz',sub:'social'},{label:'聯絡承辦',view:'contact',sub:''}]};
}
function townGroupQuery(t){
 if(!/(老人會|老人|長青)/.test(t))return null;
 if(!/(有哪|幾個|幾家|多少個|列出|有嗎|有沒有)/.test(t))return null;
 const m=t.match(/([\u4e00-\u9fff]{2,4}[鄉鎮市])/);
 if(!m)return null;
 return null;
}

function charterAmendment(t){
 if(!/(章程|修章)/.test(t))return null;
 if(!/(修改|變更|怎麼改|修正|改|修訂)/.test(t))return null;
 if(/合作社/.test(t))return null;
 if(/公會|職業團體/.test(t))return{category:'人民團體會務說明',title:'公會章程變更：會員代表三分之二以上出席、出席三分之二以上同意',summary:'商業團體（商業團體法第29條）、工業團體（工業團體法第29條）的章程變更，應以會員代表三分之二以上出席、出席代表三分之二以上同意。決議後將修正後章程、章程修改條文對照表及會議紀錄報主管機關備查。',statutes:[{title:'商業團體法第29條',source:LAW+'D0050100'},{title:'工業團體法第29條',source:LAW+'D0050103'}],questionState:{focus:'charter-amendment',domain:'pro'},notes:['修改章程增加理事監事名額時，先由候補遞補，再辦補選。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 return{category:'人民團體會務說明',title:'協會章程修改：出席三分之二以上同意，報縣府核備',summary:'修改章程要在會員（會員代表）大會提案，出席人數三分之二以上同意才能通過（人民團體法第27條）。如果已辦法人登記，門檻更高：出席四分之三以上同意，或全體會員三分之二以上書面同意。\n辦理步驟：\n1. 理事會先擬好章程修改條文對照表（新舊條文對照）。\n2. 提前理監事會審議通過。\n3. 在會員大會議程中列入「修改章程案」，15 天前通知會員。\n4. 大會決議通過後，檢附會議紀錄、章程修改條文對照表及修正後章程各一式二份，函報縣府核備。\n5. 有辦法人登記的，另向法院辦理變更登記。',statutes:[P(27)],questionState:{focus:'charter-amendment',domain:'social'},notes:['改名也是修改章程，經核備後，縣府會換發新立案證書和圖記。','修改章程增加理事監事名額時，先由候補遞補再辦補選（選罷辦法第14條）。'],actions:[{label:'看會員大會辦理',view:'meet',sub:'m-assembly'},{label:'下載常年會書表',view:'forms',sub:'常年會'},{label:'聯絡承辦',view:'contact',sub:''}]};
}
function coopSupervisorAudit(t){
 if(!/合作社/.test(t))return null;
 if(!/(監事|監查|查帳|查核|看帳|帳冊|帳簿|審查)/.test(t))return null;
 if(!/(可以|能不能|可不可以|有沒有權|權限|權力|看|查|審)/.test(t))return null;
 if(/(兼任|兼|也當|同時當)/.test(t))return null;
 return{category:'合作社會務',title:'合作社監事可以查帳：監事監查是法定職權',summary:'可以。合作社監事的法定職權包括監查社務及財務，依合作社監事監查規則辦理。合作社理事會造具的業務報告書、財產目錄、損益表、資產負債表及結餘分配或短絀分擔表，都要送監事會審核（合作社法第57條）。\n監事會主席或監事駐社監查期間，合作社得酌給公費（合作社財務報表及經費處理準則第11條）。',statutes:[C(57),{title:'合作社財務報表及經費處理準則第11條',source:LAW+'D0050193'},{title:'合作社監事監查規則',source:LAW+'D0050192'}],questionState:{focus:'coop-supervisor-audit',domain:'coop'},notes:['一般協會的財務查核由監事會為之（社會團體財務處理辦法第22條）。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function publicSolicitation(t){
 if(!/(勸募|募款|募捐|公益勸募)/.test(t))return null;
 if(!/(申請|怎麼|如何|可以|能不能|辦|要)/.test(t))return null;
 const coop=/合作社/.test(t);
 if(coop)return{category:'合作社會務',title:'合作社公益勸募：本站目前無法確認',summary:'本站收錄的合作社法規中，沒有直接涉及公益勸募的條文。公益勸募條例第5條規定勸募團體為公立學校、行政法人、公益性社團法人及財團法人；合作社是否屬「公益性社團法人」取決於法人類型和章程宗旨。\n請向縣府合作社業務承辦人或衛生福利部（公益勸募主管機關）確認。',statutes:[{title:'公益勸募條例第5條',source:LAW+'D0050138'}],questionState:{focus:'public-solicitation',domain:'coop'},notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 const community=/社區/.test(t);
 return{category:'人民團體會務說明',title:community?'社區發展協會可以申請公益勸募，但有條件':'協會可以申請公益勸募，前提是公益性社團法人',summary:'依公益勸募條例第5條，勸募團體包括「公益性社團法人」。協會如果已辦理法人登記，且章程宗旨屬公益性質，就可以向主管機關（衛生福利部或縣市政府社會處）申請勸募許可。沒有法人登記的協會，不符合勸募團體資格。\n申請流程：擬定勸募活動計畫（目的、期間、經費預算、使用計畫）→ 向主管機關提出申請 → 核准後開立捐款專戶 → 依計畫執行 → 活動結束後公開徵信並報主管機關備查。\n勸募活動所得需專款專用，必要支出不得超過一定比率（公益勸募條例第17條），並依規定辦理公開徵信（同條例第6條）。',statutes:[{title:'公益勸募條例第5條',source:LAW+'D0050138'},{title:'公益勸募條例第6條',source:LAW+'D0050138'},{title:'公益勸募條例第17條',source:LAW+'D0050138'}],questionState:{focus:'public-solicitation',domain:'social'},notes:['宗教團體基於宗教活動目的之募款不適用公益勸募條例（同條例第3條）。','非法人團體若未經許可勸募，可能違反公益勸募條例第26條，處新臺幣4萬元以上20萬元以下罰鍰。'],actions:[{label:'看法人登記說明',view:'home',sub:''},{label:'聯絡承辦',view:'contact',sub:''}]};
}
function decisionRevoked(t){
 if(!/(決議|決定)/.test(t))return null;
 if(!/(撤銷|被撤銷|被撤|無效|被判|法院)/.test(t))return null;
 if(!/理事/.test(t)&&!/監事/.test(t)&&!/大會/.test(t)&&!/會議/.test(t))return null;
 return{category:'人民團體會務說明',title:'決議被撤銷：依主管機關處分或法院判決重新辦理',summary:'人民團體的決議可能因兩種原因被撤銷：\n一、主管機關撤銷：團體有違反法令、章程或妨害公益情事時，主管機關得撤銷其決議（人民團體法第58條）。收到處分後應依指定期限改善，例如重新召開合法會議、補正程序瑕疵。\n二、法院裁判：會員認為決議內容或程序有瑕疵，依民法規定向法院提訴，法院判決撤銷或確認無效。\n處理方式：先確認撤銷的範圍（是全部決議還是特定議案），再依撤銷理由重新召開合法的會議，補正程序後函報縣府備查。涉及選舉結果的，可能需要重新辦理選舉。整個過程建議先洽承辦人確認。',statutes:[P(58)],questionState:{focus:'decision-revoked',domain:'social'},notes:['目的事業主管機關也得撤銷決議或停止業務，但應先會商主管機關（人民團體法第58條第2項）。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}

function lendToChair(t){
 if(!/(協會|團體|社團)/.test(t))return null;
 if(!/(錢|經費|資金|款項)/.test(t))return null;
 if(!/(借|貸|借給|貸給|貸與|挪用|預支)/.test(t))return null;
 if(!/(理事長|理事|監事|會員|個人|私人)/.test(t))return null;
 return{category:'人民團體財務',title:'協會的錢不可以借給理事長或私人',summary:'不可以。社會團體的經費應由團體統收統支，專款專用；將團體資金貸與理事長、理事或其他私人，不但章程沒有依據，還可能構成侵占或背信。\n依社會團體財務處理辦法：提用存款應由負責人、總幹事及財務人員共同蓋章（第17條）；財務查核由監事會為之（第22條）。\n如果已經發生資金被借用的情形，應由監事會查核後，在理監事會提出報告，並函報主管機關。涉及刑事責任的，另依司法程序處理。',statutes:[F(17),F(22)],questionState:{focus:'lend-to-chair',domain:'social'},notes:['合作社亦同：經費不能貸給理事或個人使用。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function branchOrg(t){
 if(!/(分支|分會|分部|辦事處|設點|分社|分機構)/.test(t))return null;
 if(!/(可以|能不能|可不可以|怎麼|如何|設|成立|設立)/.test(t))return null;
 if(/合作社/.test(t))return null;
 return{category:'人民團體會務說明',title:'協會可以設分支機構，但要報主管機關核准',summary:'可以。人民團體得報經主管機關核准後設分支機構（人民團體法第6條）。設立時應依章程規定擬具分支機構的組織簡則，經會員大會決議通過，報主管機關核准後實施（人民團體會務輔導辦法第6條）。\n分支機構的財務應由團體統收統支，年度終了時編製合併報表（社會團體財務處理辦法第18條）。',statutes:[P(6),G(6),F(18)],questionState:{focus:'branch',domain:'social'},notes:['公會得經會員大會決議設辦事處（商業團體法第7條、工業團體法第6條）。','分支機構不是獨立法人，以主體團體的名義對外。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function supervisorMeeting(t){
 if(!/(監事會|監事)/.test(t))return null;
 if(!/(自己開|自行召開|可以開|獨立開|不經過|不用理事長|理事長同意)/.test(t))return null;
 return{category:'人民團體會務說明',title:'監事會可以自行召開，不需要理事長同意',summary:'可以。監事會是獨立於理事會的機關，由監事會召集人（常務監事）召集，不需要經過理事長同意。監事會至少每六個月舉行一次（社會團體適用人民團體法第43條），必要時得召開臨時監事會議。\n如果監事會召集人不召開監事會，監事過半數得以書面連署請求召開（人民團體會務輔導辦法第13條）。監事並得列席理事會議（人民團體法第29條）。',statutes:[P(43),G(13),P(29)],questionState:{focus:'supervisor-meeting',domain:'social'},notes:['合作社監事會亦為獨立機關（合作社法第40條）。'],actions:[{label:'看理監事會辦理',view:'meet',sub:'m-board'}]};
}
function noAnnualMeeting(t){
 if(!/(沒有開|沒開|未開|不開|未召開)/.test(t))return null;
 if(!/(會員大會|大會|常年會|定期會)/.test(t))return null;
 if(!/(會怎樣|怎麼辦|後果|處罰|違法|罰|可以嗎|被停|被處分)/.test(t)&&!/(年度|整年|一年|今年)/.test(t))return null;
 return{category:'人民團體會務說明',title:'年度沒有開會員大會：有行政處分風險',summary:'會員大會每年應至少召開一次（人民團體法第25條）。如果整個年度都沒有召開，主管機關得視為「廢弛會務」，依人民團體法第58條予以處分：警告 → 限期改善 → 撤免職員 → 限期整理 → 廢止許可 → 解散。\n而且，年度工作計畫和收支預算要經大會通過才能報縣府備查（社會團體財務處理辦法第11條）；沒開大會就無法完成法定報備，連帶會務報表全部延宕。\n補救方式：儘快召開臨時會員大會或常年會，追認應由大會通過的議案，並函報主管機關說明原因。',statutes:[P(25),P(58),F(11)],questionState:{focus:'no-annual-meeting',domain:'social'},notes:['如果是理事長故意不召開，會員五分之一以上可以連署請求召開（人民團體法第25條）。'],actions:[{label:'看會員大會辦理',view:'meet',sub:'m-assembly'},{label:'聯絡承辦',view:'contact',sub:''}]};
}
function chairSpendingAuth(t){
 if(!/(理事長|負責人)/.test(t))return null;
 if(!/(自己|一個人|獨自|單獨|決定|可以)/.test(t))return null;
 if(!/(花錢|支出|動用|經費|款項|用錢|買東西|購買|開支|開銷|開銀行|提款|採購)/.test(t))return null;
 return{category:'人民團體財務',title:'理事長不能自己決定花錢：須依章程與財務規定辦理',summary:'不行。社會團體提用存款，應由負責人（理事長）、總幹事及財務人員共同蓋章（社會團體財務處理辦法第17條）；重大支出（例如不動產處分）應經會員大會決議（人民團體法第27條）。理事長可以在理事會授權範圍內處理日常業務支出，但超出授權範圍的必須提理事會或大會決議。\n各團體章程通常會訂定理事長的經費核定權限，例如「每筆新臺幣○萬元以下由理事長核定，超過○萬元須經理事會決議」；請核對貴會章程和經費處理規定。',statutes:[F(17),P(27)],questionState:{focus:'chair-spending',domain:'social'},notes:['基金動支另須經理事會通過（社會團體財務處理辦法第15條）。','理監事是無給職，理事長不能用團體經費支付個人報酬（第19條）。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function communityVsGeneral(t){
 if(!/(社區發展協會|社區協會)/.test(t))return null;
 if(!/(一般協會|普通協會|社會團體|差|不同|不一樣|差別|差異|區別|比較)/.test(t))return null;
 return{category:'人民團體會務說明',title:'社區發展協會 vs 一般協會：主要差別在法規依據和組織範圍',summary:'社區發展協會與一般社會團體的共同點是都依人民團體法立案，理監事的選舉、任期、會議規定大致相同。主要差別：\n1. 法規：社區發展協會另適用社區發展工作綱要，由鄉鎮市公所劃定社區範圍，同一社區原則只成立一個。\n2. 組織區域：以公所劃定的社區為範圍，不像一般協會可以自定全縣性或鄉鎮市級。\n3. 發起門檻：鄉鎮市級社會團體要 30 人，社區發展協會由社區居民發起。\n4. 經費來源：社區發展協會可以接受鄉鎮市公所或縣府的補助計畫，例如社區營造、環境改善等。\n5. 監督：公所扮演較積極角色，會務輔導和計畫核銷通常經公所轉送縣府。',statutes:[{title:'社區發展工作綱要',source:LAW+'D0050098'}],questionState:{focus:'community-vs-general',domain:'social'},notes:['本站名冊未收錄社區發展協會，相關業務請洽鄉鎮市公所或縣府社會處。'],actions:[{label:'看社區發展協會成立',view:'biz',sub:'community'},{label:'聯絡承辦',view:'contact',sub:''}]};
}
function coopDissolutionProperty(t){
 if(!/合作社/.test(t)||!/解散/.test(t)||!/(財產|歸誰|歸屬|剩餘|怎麼處理|怎麼辦|清算)/.test(t))return null;
 return{category:'合作社會務',title:'合作社解散後財產：先清償債務，餘額依出資比例或章程辦理',summary:'合作社解散後進入清算程序，清算順序依合作社法第61、62條：先清償債務（含社員股金）→ 剩餘財產依章程規定處理，章程沒寫的依社員大會決議。\n合作社解散事由包括：社員不滿七人、章程所定解散事由發生、社員大會四分之三以上出席且出席三分之二以上決議解散、破產、主管機關命令解散、與他社合併（合作社法第55條）。',statutes:[C(55),C(61),C(62)],questionState:{focus:'coop-dissolution-property',domain:'coop'},notes:['合作社的剩餘財產處理方式與一般社會團體不同：社會團體歸地方自治團體，合作社則依章程或大會決議。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}

function onlineVoting(t){
 if(!/(線上投票|線上表決|電子投票|網路投票|APP投票|app投票|手機投票|數位投票)/.test(t))return null;
 if(/合作社/.test(t))return{category:'合作社會務',title:'合作社社員代表選舉得採電子投票，但要章程規定',summary:'合作社的社員代表選舉或罷免，得採通訊投票或電子投票辦理，但必須先在章程規定，並訂定辦理辦法經社員大會決議通過、報主管機關備查後才能實施（合作社選舉罷免辦法第3條）。社員大會、理事和監事的選舉，原則仍應以會議方式投票。',statutes:[{title:'合作社選舉罷免辦法第3條',source:LAW+'D0050117'}],questionState:{focus:'online-voting',domain:'coop'},notes:['電子投票和通訊投票的選務規則、無效票認定都要在辦法中載明。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 return{category:'人民團體會務說明',title:'會員大會線上投票：目前法令沒有開放',summary:'目前人民團體法和人民團體選舉罷免辦法，只有規定「會議投票」和「通訊選舉」兩種方式，沒有「線上投票」或「電子投票」的條文。\n會員大會可以依人民團體法第25、29條以視訊方式召開（章程須先訂明），但表決仍依會議出席人數計算，不是線上投票系統。通訊選舉限於理監事改選，須在章程訂定，且有特定流程規定（選罷辦法第23條）。\n如果想讓會員遠距參與，目前可行的是視訊會議搭配線上簽到與舉手表決，但建議先洽承辦人確認程序是否被接受。',statutes:[E(23),P(25),P(29)],questionState:{focus:'online-voting',domain:'social'},notes:['合作社的社員代表選舉另依合作社選舉罷免辦法得採電子投票（第3條）。'],actions:[{label:'看視訊會議說明',view:'home',sub:''},{label:'聯絡承辦',view:'contact',sub:''}]};
}
function mailVoting(t){
 if(!/(通訊投票|通訊選舉|通訊方式|郵寄投票|寄選票|郵寄選舉)/.test(t))return null;
 if(/合作社/.test(t))return{category:'合作社會務',title:'合作社得採通訊投票，須章程規定並報備查',summary:'合作社社員代表的選舉或罷免，得經理事會決議並報主管機關備查後，採通訊投票辦理；但要先在章程規定，並訂定辦理辦法經社員大會決議通過、報主管機關備查（合作社選舉罷免辦法第3條）。',statutes:[{title:'合作社選舉罷免辦法第3條',source:LAW+'D0050117'}],questionState:{focus:'mail-voting',domain:'coop'},notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 return{category:'人民團體會務說明',title:'協會理監事改選可以用通訊選舉，但要章程訂定',summary:'可以。人民團體的理事、監事選舉，得於章程訂定採用通訊選舉（人民團體選舉罷免辦法第23條）。辦理要點：\n1. 章程須先訂明採通訊選舉（沒訂的要先修章程）。\n2. 理事會在開票日 45 天前審定會員資格、造名冊供閱覽。\n3. 開票日 30 天前依名冊寄送紙本通訊選舉票。\n4. 團體應訂定通訊選舉辦法，載明選務人員、投票規則、無效票認定、開票程序等，經理事會通過並報主管機關備查。\n注意：通訊選舉只適用於理監事選舉，會員大會的一般議案表決不能用通訊方式。',statutes:[E(23)],questionState:{focus:'mail-voting',domain:'social'},notes:['是否適用通訊選舉，在辦理前建議先洽承辦人確認。'],actions:[{label:'下載通訊選舉範本',view:'forms',sub:'範本'},{label:'聯絡承辦',view:'contact',sub:''}]};
}
function receiveDonation(t){
 if(!/(收捐款|接受捐贈|接受捐款|收到捐款|收受捐|人家捐|外面捐|可以收錢|收外部)/.test(t)&&!/(捐款|捐贈|外界捐|善款)/.test(t))return null;
 if(!/(可以|能不能|可不可以|要怎麼|如何|怎麼收|怎麼處理|要開|收據)/.test(t)&&!/社區/.test(t))return null;
 if(/勸募/.test(t))return null;
 return{category:'人民團體財務',title:'協會可以接受捐款，但要開正式收據',summary:'可以。人民團體的經費來源包括會員捐款和其他收入（人民團體法第33條），也可以接受外界主動捐贈（公益勸募條例第6條第3項）。\n接受捐款的處理方式：\n1. 開立正式收據，載明團體名稱、統編、捐款人、金額、日期（社會團體財務處理辦法第17條）。\n2. 收據存根至少保存十年（同辦法第21條）。\n3. 接受外界主動捐贈，應定期辦理公開徵信、依指定用途使用（公益勸募條例第6條）。\n4. 定期捐贈達一定規模的，要在會計報告中揭示。\n捐款人如果要拿收據抵稅，協會必須符合「教育文化公益慈善機關或團體免納所得稅適用標準」才行。',statutes:[P(33),F(17),F(21),{title:'公益勸募條例第6條',source:LAW+'D0050138'}],questionState:{focus:'receive-donation',domain:'social'},notes:['「主動接受捐贈」和「發起勸募」不同：發起勸募要申請許可。','不能為了特定捐款人的利益開立不實收據。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function hireEmployee(t){
 if(!/(雇|僱|聘僱|請人|員工|雇員|工讀|臨時人員)/.test(t))return null;
 if(!/(可以|能不能|怎麼|如何|要|勞保|健保|勞健保|保險|投保|保勞|保健)/.test(t))return null;
 if(/合作社/.test(t))return null;
 return{category:'人民團體會務說明',title:'協會可以聘僱員工，要依勞基法辦理勞健保',summary:'可以。人民團體依章程聘僱工作人員辦理會務、業務（人民團體法第24條）。工作人員由理事長提名經理事會通過聘任，報主管機關備查（本縣章程範例第22條）。\n關於勞健保：\n1. 人民團體聘僱員工滿 5 人以上，就是勞工保險的強制投保單位，應為員工投保勞保。不到 5 人的也可以自願投保。\n2. 全民健保：有聘僱員工的，應以投保單位身分為員工加保。\n3. 勞工退休金：適用勞基法的人民團體，應依勞工退休金條例按月提繳退休金。\n投保地點：勞保局各地辦事處或線上申辦；健保到健保署各區業務組。',statutes:[P(24),{title:'本縣章程範例第22條',source:'本站書表下載｜申請表'}],questionState:{focus:'hire-employee',domain:'social'},notes:['理監事是無給職，不是員工（社會團體財務處理辦法第19條）。','工作人員不得由理監事擔任（章程範例第22條）。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}

const ZC7={title:'屏東縣社會團體章程草案範例第7條（入會經理事會通過）',source:'本站書表下載｜申請表'};
function investStocks(t){
 if(!/(股票|基金投資|投資|理財|定存以外|買債券|債券|有價證券|期貨|虛擬貨幣|放貸)/.test(t))return null;
 if(!/(協會|團體|社團|社區|我們|錢|經費|基金|可以|能不能)/.test(t))return null;
 if(/合作社/.test(t))return null;
 return{category:'人民團體財務',title:'協會經費應存金融機構，買股票等投資本站無法確認可行',summary:'社會團體財務收入應存入銀行、農會、漁會、信用合作社或郵局，不得存放於其他公私企業或個人，並以隨收隨存為原則（社會團體財務處理辦法第16條）；準備基金及孳息應專戶存儲，非經理事會通過不得動支（第15條）。\n辦法沒有明文規定社會團體可以用經費買股票、基金或其他有價證券，所以本站無法確認可行，也不建議自行操作。若有特殊需要，請先洽縣府承辦人確認，並至少經會員大會決議、在財務報表中如實揭露。',statutes:[F(16),F(15),F(20)],questionState:{focus:'invest',domain:'social'},notes:['財務收支不得匿報或虛報，並應定期公告（第20條）。','工會另依工會財務處理準則，投資種類、比例須經會員大會議決，與協會不同。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function membershipRefused(t){
 if(!/(入會|加入|成為會員|當會員)/.test(t))return null;
 if(!/(拒絕|不讓|不准|被擋|不通過|不同意|退件|被拒)/.test(t))return null;
 if(/合作社/.test(t))return null;
 if(/公會|職業團體|律師|醫師|會計師|技師|地政士/.test(t))return{category:'人民團體會務說明',title:'職業團體不得拒絕具會員資格者入會',summary:'職業團體（例如公會）以組織區域內從事該行職業者為會員，不得拒絕具有會員資格者入會（人民團體法第37條）。如果您符合資格卻被拒絕，可以先以書面請公會說明理由，仍未獲處理時，向主管機關（縣府社會處）反映。\n各專業法（例如醫師法、律師法）另有入會規定的，依各該法律。',statutes:[P(37)],questionState:{focus:'membership-refused',domain:'pro'},notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 return{category:'人民團體會務說明',title:'協會入會須經理事會通過，被拒絕可先請協會說明理由',summary:'一般協會（社會團體）的入會資格與程序由章程訂定（人民團體法第12條）；依本縣章程範例第7條，入會申請須填具入會申請書，經理事會通過並繳納會費後才成為會員。法律沒有規定社會團體「不得拒絕」入會，這點與職業團體不同（職業團體依人民團體法第37條不得拒絕具資格者）。\n如果您被拒絕：\n1. 先以書面請協會說明拒絕理由，並核對章程的會員資格條件。\n2. 若協會以章程沒有規定的條件拒絕，或程序不符章程，可以向縣府承辦人反映。',statutes:[P(12),ZC7,P(37)],questionState:{focus:'membership-refused',domain:'social'},notes:['理事會審查入會時，應依章程所定的資格條件，不宜以章程以外的理由拒絕。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function coopCapital(t){
 if(!/合作社/.test(t)||!/(增資|增加股金|增購|加股|社股|股金|減資|減少股金)/.test(t))return null;
 if(/退社|退還|拿回|除名|解散/.test(t))return null;
 return{category:'合作社財務',title:'合作社增資：社員增購社股或吸收新社員，每股金額有法定範圍',summary:'合作社的股金來自社員認購的社股。增資常見兩種方式：現有社員增購社股，或吸收新社員入社認股。規定如下：\n1. 每股金額至少新臺幣 6 元、至多 150 元，同一社內必須一律（合作社法第16條）。\n2. 每位社員至少認購一股，至多不得超過股金總額百分之二十；第一次繳款不得少於所認股款四分之一（第17條）。\n3. 社股金額及繳納、退還規定是章程應記載事項（第9-1條）；要調整每股金額，屬章程變更，須經社員大會決議並辦理變更登記。\n4. 減少每股金額時，要經社員大會決議，並通知或公告債權人，給予一個月以上的異議期間（第21條）。',statutes:[C(16),C(17),{title:'合作社法第9-1條',source:LAW+'D0050112'},C(21)],questionState:{focus:'coop-capital',domain:'coop'},notes:['社員認購社股得依章程規定，以貨幣以外之財物估定價值代付股款（合作社法施行細則第10條）。','社股年息不得超過百分之十，無結餘時不得發息（第22條）。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}

const ZC30={title:'屏東縣社會團體章程草案範例第30條（附註：常年會費建議每年至少500元）',source:'本站書表下載｜申請表'};
function feeAmount(t){
 if(!/(會費|入會費|常年會費|年費)/.test(t)||!/(多少|幾元|幾塊|金額|標準|要繳|收多少|繳多少)/.test(t))return null;
 if(/退|合作社|工會|公會/.test(t))return null;
 return{category:'人民團體財務',title:'會費金額由章程訂定，沒有全縣統一標準',summary:'入會費、常年會費要繳多少，由各團體在章程中訂定，並經會員（會員代表）大會通過、報主管機關核備（人民團體法第33條、社會團體財務處理辦法第14條）。所以每個協會、社區發展協會金額都不一樣，請看貴會章程的「經費來源」條文，或直接問協會。\n本縣章程範例第30條附註建議：為維持團體基本運作，常年會費每年至少新臺幣500元；這是建議，不是法定金額。',statutes:[P(33),F(14),ZC30],questionState:{focus:'fee-amount',domain:'social'},notes:['會員類別有兩種以上的，可以分類訂定不同的會費。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function personalAccount(t){
 if(!/(個人戶頭|私人帳戶|個人帳戶|理事長戶頭|理事長帳戶|總幹事戶頭|自己戶頭|私人戶頭|個人名義|存在.{0,4}(理事長|總幹事|會計|出納|個人))/.test(t))return null;
 return{category:'人民團體財務',title:'不可以：協會的錢不能存在個人戶頭',summary:'不可以。社會團體的財務收入應存入銀行、農會、漁會、信用合作社或郵局，不得存放於其他公私企業或個人，並以隨收隨存為原則、不得收支坐抵（社會團體財務處理辦法第16條）。\n請用協會名義開戶（先申請統一編號），提用存款時由理事長、總幹事及財務人員共同蓋章（第17條）。已經存在個人帳戶的款項，應儘速轉入協會帳戶，並在財務報表中如實記載。',statutes:[F(16),F(17)],questionState:{focus:'personal-account',domain:'social'},notes:['合作社財務亦應以合作社名義管理。'],actions:[{label:'看開戶說明',view:'home',sub:''},{label:'聯絡承辦',view:'contact',sub:''}]};
}
function supervisorConvenerNoMeeting(t){
 if(!/(監事會召集人|常務監事|監事會主席)/.test(t)||!/(不開|不召開|拒絕開|沒開|不肯開)/.test(t))return null;
 if(/合作社/.test(t))return null;
 return{category:'會務爭議',title:'監事會召集人不開會：監事過半數書面連署，15日內應召開',summary:'監事過半數以書面連署請求時，監事會召集人（常務監事）應在收到連署後 15 日內召開臨時監事會議完畢；連署書要以雙掛號寄給召集人並取得回執，再報主管機關備查（人民團體會務輔導辦法第13條）。\n監事會不能依法召開時，得由主管機關指定監事一人召集（人民團體法第32條）；監事會召集人無正當理由不召開監事會超過二個會次的，應由主管機關解除其職務，另行改推（人民團體法第30條）。',statutes:[G(13),P(32),P(30)],questionState:{focus:'supervisor-no-meeting',domain:'social'},notes:['請保留連署書與掛號回執，向縣府承辦人反映。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function delegateAssembly(t){
 if(!/會員代表大會|會員代表/.test(t)||!/(是什麼|什麼是|意思|怎麼產生|怎麼選|何時|幾人以上|要不要)/.test(t))return null;
 if(/合作社/.test(t))return null;
 return{category:'人民團體會務說明',title:'會員代表大會：會員超過300人時，可分區選代表開大會',summary:'人民團體會員人數超過三百人以上時，得劃分地區，依會員人數比例選出會員代表，再合開代表大會，行使會員大會的職權；地區劃分和代表名額分配要報主管機關核備（人民團體法第28條）。\n會員代表是指由會員單位推派、下級團體選派，或依上述方式分區選出的代表，權利的行使和會員相同（人民團體法第13條）。會員人數不到 300 人的團體，直接開會員大會。',statutes:[P(28),P(13)],questionState:{focus:'delegate-assembly',domain:'social'},notes:['會員代表任期應配合理監事任期，選舉辦法由理事會擬訂報主管機關核備（本縣章程範例）。'],actions:[{label:'看會員大會辦理',view:'meet',sub:'m-assembly'}]};
}
function noSupervisor(t){
 if(!/監事/.test(t)||!/(不設|不用設|可以沒有|不要設|不置|免設|一定要有|一定要設|需要設)/.test(t))return null;
 if(/合作社/.test(t))return null;
 return{category:'人民團體會務說明',title:'不可以：人民團體一定要設理事和監事',summary:'人民團體均應置理事、監事，由會員（會員代表）中選舉產生（人民團體法第17條）。縣市以下團體理事不得超過15人；監事不得超過理事名額三分之一；候補理監事不得超過理監事名額三分之一。\n監事會負責財務查核（社會團體財務處理辦法第22條），也是決算審核的必要程序，所以不能省略。',statutes:[P(17),F(22)],questionState:{focus:'no-supervisor',domain:'social'},notes:['縣府建議理事至少9人、監事至少3人且為奇數（本縣章程範例）。'],actions:[{label:'看理監事名額',view:'law',sub:'屏東縣作業規定'}]};
}
function foundingDocs(t){
 if(!/成立大會/.test(t)||!/(文件|資料|準備|要送|要報|立案|附件|表件)/.test(t))return null;
 if(/合作社/.test(t))return null;
 return{category:'業務辦理',title:'成立大會後 30 日內，檢具章程、會員名冊、職員簡歷冊報請立案',summary:'人民團體應於成立大會後三十日內，檢具章程、會員名冊、選任職員簡歷冊，報請主管機關核准立案，並發給立案證書（人民團體法第10條）。\n書表下載頁「成立大會」分類有本縣範本可用，包括：成立大會議程、開會通知書、會員大會簽到簿、選舉票範例、第一屆第一次會員大會及理監事聯席會議紀錄格式、組織章程、會員名冊、理監事暨會務人員一覽表、年度工作計畫、年度經費收支預算表、籌備期間經費收支報告、會址同意書、申請理事長當選證明書表，以及函報申請立案公文。\n立案後，協會圖記由協會自行製用，拓具印模送主管機關備查（同條）。',statutes:[P(10)],questionState:{focus:'founding-docs',domain:'social'},notes:['成立大會應報請主管機關派員列席（人民團體法第26條）。','實際應附份數依縣府通知辦理，送件前可先洽承辦人。'],actions:[{label:'下載成立大會書表',view:'forms',sub:'成立大會'},{label:'看籌組流程',view:'biz',sub:'social'}]};
}

function communityChairTerm(t){
 if(!/(社區發展協會|社區協會)/.test(t)||!/理事長/.test(t)||!/(連任|幾屆|任期|做幾年|當幾次|第三屆|三屆)/.test(t))return null;
 return{category:'社區發展協會',title:'社區發展協會理事長：連任以一次為限',summary:'社區發展協會也是依人民團體法立案的社會團體，理事長的連任以一次為限，也就是最多連續做兩屆（人民團體法第20條）。\n理事、監事的任期依章程訂定，最長不超過四年；除法律另有規定或章程另有限制外，連選得連任。任期從召開本屆第一次理事會之日起計算（本縣章程範例第20條）。',statutes:[P(20),{title:'屏東縣社會團體章程草案範例第20條',source:'本站書表下載｜申請表'}],questionState:{focus:'chair-term',domain:'social'},notes:['已連任一次的理事長，下一屆不能再當選理事長，但仍可以當選理事。'],actions:[{label:'看改選流程',view:'meet',sub:'m-elect'}]};
}
function invalidBallot(t){
 if(!/(無效票|廢票|選票.{0,6}(無效|不算)|怎樣算無效|哪些票無效|圈錯)/.test(t))return null;
 if(/合作社/.test(t))return{category:'合作社會務',title:'合作社選舉票無效的情形',summary:'合作社選舉票有下列情形之一者無效，例如：圈寫被選舉人超出應選名額或限制連記名額；姓名與社員名冊不符；圈寫位置不能辨別；圈寫後塗改；字跡模糊；夾寫其他文字或符號；附有暗號；簽名、蓋章或捺指模；用鉛筆圈寫；撕破不完整；完全空白（合作社選舉罷免辦法第31條）。部分性質者，該部分無效；有疑義時由會議主席及監票員會商決定。',statutes:[{title:'合作社選舉罷免辦法第31條',source:LAW+'D0050117'}],questionState:{focus:'invalid-ballot',domain:'coop'},notes:[],actions:[]};
 return{category:'人民團體會務說明',title:'選舉票無效的 13 種情形',summary:'人民團體的選舉票或罷免票有下列情形之一者無效（人民團體選舉罷免辦法第10條）：\n1. 不是團體提供的選票。\n2. 圈寫人數超過應選名額或連記額數。\n3. 夾寫其他文字或符號（同姓名註明區別者除外）。\n4. 圈寫的姓名與會員名冊不符。\n5. 圈的位置無法辨別是誰。\n6. 圈寫後塗改。\n7. 字跡模糊無法辨識。\n8. 用鉛筆圈寫（電腦劃卡除外）。\n9. 附任何物件，顯有暗號作用。\n10. 污染致不能辨別。\n11. 簽名、蓋章或捺指模。\n12. 撕破不完整。\n13. 完全空白。\n第4到第7款如屬部分性質，由會議主席會同全體監票員當場認定該部分無效。',statutes:[E(10)],questionState:{focus:'invalid-ballot',domain:'social'},notes:['選舉方式：應選1名用無記名單記法，2名以上用無記名連記法；集會選舉經出席三分之一以上同意，可用限制連記法，連記額數為應選名額二分之一以內（選罷辦法第4條）。'],actions:[{label:'下載選舉票範例',view:'forms',sub:'改選'}]};
}

function minutesDeadline(t){
 if(!/(紀錄|記錄)/.test(t)||!/(多久|要報|要送|報縣府|送縣府|備查|期限|幾天|報主管)/.test(t))return null;
 if(/合作社/.test(t))return{category:'合作社會務',title:'合作社會議紀錄報送期限：本站未能確認一般規定',summary:'合作社的業務報告書、資產負債表、收支餘絀表、財產目錄及結餘分配案，應於社員大會承認後一個月內，以書面報請主管機關備查（合作社法第36條）；選舉會議紀錄應報主管機關備查（合作社選舉罷免辦法第29條）。其他會議紀錄的報送期限，本站資料未能確認，請洽承辦人。',statutes:[C(36),{title:'合作社選舉罷免辦法第29條',source:LAW+'D0050117'}],questionState:{focus:'minutes-deadline',domain:'coop'},notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 const board=/(理監事|理事會|監事會|聯席)/.test(t)&&!/大會/.test(t);
 return{category:'人民團體會務說明',title:board?'理監事會議紀錄：自行留存供會員查閱，須核辦事項另報':'會員大會紀錄：閉會後 30 日內報縣府備查',summary:(board?'理監事會議紀錄不用每次都報縣府：閉會後自行留存，提供會員查閱；只有依法令須報主管機關核辦的事項（例如會址變更、工作人員聘免、選前會議），才檢附相關文件報送。\n會員（會員代表）大會紀錄則應於閉會後三十日內報請主管機關備查。':'會員（會員代表）大會紀錄應於閉會後三十日內報請主管機關備查。\n理事會、監事會及理監事聯席會議紀錄閉會後自行留存，提供會員查閱；依法令須報主管機關核辦的事項，再檢附相關文件辦理。')+'\n紀錄應載明開會日期、出缺席狀況、會議決議等事項（人民團體會務輔導辦法第12條）。',statutes:[G(12)],questionState:{focus:'minutes-deadline',domain:'social'},notes:['公會另依商業團體法施行細則第25條，會議後15日內將紀錄分送會員並報主管機關備查。'],actions:[{label:'下載常年會書表',view:'forms',sub:'常年會'}]};
}
function coopBoardQuorum(t){
 if(!/合作社/.test(t)||!/(理事會|社務會)/.test(t)||!/(幾人|幾個人|多少人|出席|才能開|成會|開會門檻)/.test(t))return null;
 if(/社務會/.test(t))return{category:'合作社會務',title:'合作社社務會：全體理事、監事三分之二出席才能開會',summary:'社務會應有全體理事、監事三分之二之出席，始得開會；出席理事、監事過半數之同意，始得決議（合作社法第52條）。社務會每六個月至少召開一次（第45條）。',statutes:[C(52),C(45)],questionState:{focus:'coop-board-quorum',domain:'coop'},notes:[],actions:[]};
 return{category:'合作社會務',title:'合作社理事會：理事過半數出席才能開會',summary:'合作社理事會由主席召集，應有理事過半數之出席，始得開會；出席理事過半數之同意，始得決議（合作社法第53條）。理事會每三個月至少召開一次（第45條）。\n例如理事 7 人，至少 4 人出席才能開會。',statutes:[C(53),C(45)],questionState:{focus:'coop-board-quorum',domain:'coop'},notes:['社務會（理事加監事）門檻不同：全體三分之二出席（第52條）。'],actions:[]};
}
function coopTax(t){
 if(!/合作社/.test(t)||!/(稅|繳稅|所得稅|營業稅|報稅)/.test(t))return null;
 return{category:'合作社財務',title:'合作社稅務：本站無法確認，請洽國稅局',summary:'合作社的結餘是否課稅、營業稅如何申報，涉及所得稅法、營業稅法及合作社類型（例如消費、生產、勞動合作社），本站收錄的合作社法規沒有相關規定，所以無法直接回答。\n請洽財政部南區國稅局（免付費電話 0800-000-321），說明合作社名稱、業務類型與收入來源，由國稅局依個案認定。',statutes:[],questionState:{focus:'coop-tax',domain:'coop'},notes:['合作社年度決算書類應於社員大會承認後一個月內報主管機關備查（合作社法第36條）。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function communityRename(t){
 if(!/(社區發展協會|社區協會)/.test(t)||!/(改名|更名|名稱變更|換名字|改名稱)/.test(t))return null;
 return{category:'社區發展協會',title:'社區發展協會可以改名，但要修改章程並先確認社區名稱',summary:'可以。名稱是章程記載事項，改名就是修改章程，須經會員（會員代表）大會出席人數三分之二以上同意（人民團體法第27條），再檢附會議紀錄、章程修改條文對照表報縣府核備。\n社區發展協會的名稱原則上依鄉鎮市公所劃定的社區名稱，改名前請先向公所確認社區名稱或範圍是否也要調整。',statutes:[P(27)],questionState:{focus:'community-rename',domain:'social'},notes:['有法人登記的，另向法院辦理變更登記；銀行、國稅局資料也要一併更新。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function communityReportTownship(t){
 if(!/(社區發展協會|社區協會)/.test(t)||!/公所/.test(t)||!/(報什麼|要報|送什麼|要送|報哪些|資料)/.test(t))return null;
 return{category:'社區發展協會',title:'社區發展協會要報公所的事項：本站未能確認完整清單',summary:'社區發展協會的會務、年度計畫和補助核銷，實務上常經鄉鎮市公所轉送縣府，但各公所要求的報送項目、格式和期限不一定相同；本站目前沒有收錄社區發展工作綱要全文，無法列出確定清單。\n可以確定的是，社區發展協會也是社會團體：會員大會紀錄應於閉會後30日內報主管機關備查（人民團體會務輔導辦法第12條），年度決算於年度終了後三個月內編造、經大會通過後報備查（社會團體財務處理辦法第11條）。其他公所要求的事項，請直接洽所在地公所社會（民政）課。',statutes:[G(12),F(11)],questionState:{focus:'community-township',domain:'social'},notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function addressCertificate(t){
 if(!/(會址|地址|搬家|搬遷)/.test(t)||!/(證書|立案證書|換證|換發)/.test(t))return null;
 return{category:'人民團體會務說明',title:'改會址：先經理監事會決議報縣府，證書是否換發請洽承辦',summary:'會址變更依本縣範本，經理監事聯席會議決議後，檢附會議紀錄、新會址使用同意書，以「專案呈報會址變更」公文報縣府備查。\n立案證書是否需要換發，本站資料未能確認，請在報送時向承辦人確認。有法人登記的，另向法院辦理變更登記；國稅局、銀行的地址也要一併更新。',statutes:[],questionState:{focus:'address-certificate',domain:'social'},notes:['如果章程寫有具體會址地址，就要先修改章程（會員大會三分之二同意）。'],actions:[{label:'下載會址變更範本',view:'forms',sub:'理監事會'},{label:'聯絡承辦',view:'contact',sub:''}]};
}
function bankChairChange(t){
 if(!/(理事長|負責人)/.test(t)||!/(換人|改選|新任|卸任|交接|換了)/.test(t)||!/(銀行|帳戶|印鑑|存款|郵局|農會)/.test(t))return null;
 return{category:'人民團體財務',title:'要。理事長換人後，要到銀行辦理負責人及印鑑變更',summary:'要。提用存款時應由團體負責人、總幹事及財務人員共同蓋章（社會團體財務處理辦法第17條），理事長換人後若不變更，新任理事長無法依規定動用存款，前任理事長的印鑑也可能仍有效。\n一般要帶：改選會議紀錄、新任理事長當選證明書、立案證書、統編資料、協會圖記、新任理事長身分證件與印章。各金融機構要求不同，請先電話確認。',statutes:[F(17)],questionState:{focus:'bank-chair-change',domain:'social'},notes:['國稅局的負責人資料、法人登記（有辦的話）也要一併變更。'],actions:[{label:'看移交流程',view:'meet',sub:'m-roster'}]};
}
function eventFee(t){
 if(!/(報名費|活動費|門票|收費|課程費|材料費)/.test(t)||!/(活動|課程|辦|收)/.test(t))return null;
 if(/合作社/.test(t))return null;
 return{category:'人民團體財務',title:'可以收活動報名費，但要開收據並列入帳務',summary:'可以。人民團體經費來源包括事業費及其他收入（人民團體法第33條），辦理活動向參加者收取報名費、材料費屬於這類收入。\n處理時要注意：收入要開正式收據並留存根（社會團體財務處理辦法第17條）；存入協會帳戶、列入年度決算，不得匿報或虛報（第16、20條）。是否涉及營業稅等稅務問題，依活動性質由國稅局個案認定（免付費電話 0800-000-321）。',statutes:[P(33),F(17),F(20)],questionState:{focus:'event-fee',domain:'social'},notes:['如果是向不特定大眾募集款項，屬公益勸募，另須申請許可。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function newChairTodo(t){
 if(!/(新任理事長|新上任|剛當選|接任理事長|當選理事長|新理事長)/.test(t))return null;
 if(!/(做什麼|要辦|注意|多久|哪些事|要做|流程|怎麼辦|期限|完成)/.test(t))return null;
 return{category:'人民團體會務說明',title:'新任理事長要辦的事：15 日內接收移交，大會紀錄 30 日內報備',summary:'有期限的事：\n1. 移交接收：就任後由新任理事長會同監交人（新任常務監事或監事互推一人），於 15 日內完成接收立案證書、圖記、檔案、財務、人事等；屆期未完成，可報縣府註銷原證書重新發給（人民團體會務輔導辦法第18條）。\n2. 改選大會紀錄：閉會後 30 日內報縣府備查（同辦法第12條），連同理事長當選證明書申請表及書表下載「改選」分類的附件。\n接著要辦的事：\n3. 到銀行辦理負責人與印鑑變更（社會團體財務處理辦法第17條）。\n4. 向國稅局更新負責人資料；有法人登記的，向法院辦理變更登記。\n5. 依章程提名總幹事、會計、出納，經理事會通過聘任（工作人員不得由理監事擔任）。',statutes:[G(18),G(12),F(17)],questionState:{focus:'new-chair',domain:'social'},notes:['理事長連任以一次為限（人民團體法第20條）。'],actions:[{label:'下載改選書表',view:'forms',sub:'改選'},{label:'看移交流程',view:'meet',sub:'m-roster'}]};
}
function delegated(t){
 const g=typeof root!=='undefined'?root:{};
 if(/社區/.test(t)&&/(年度計畫|工作計畫|計畫)/.test(t)&&/(什麼時候|何時|幾月|要送|多久|截止)/.test(t)&&!/成立|籌組/.test(t)&&typeof g.communityAnnualPlanAnswer==='function')return g.communityAnnualPlanAnswer((/社區發展協會/.test(t)?t:t.replace(/社區協會|社區/,'社區發展協會'))+(/年度計畫|工作計畫/.test(t)?'':'年度計畫')+'期限');
 if(/合作社/.test(t)&&/(盈餘|結餘)/.test(t)&&/(怎麼分|如何分|怎樣分|分多少|要分)/.test(t)&&typeof g.coopSurplusDistributionAnswer==='function')return g.coopSurplusDistributionAnswer(t.replace(/怎麼分|如何分|怎樣分|分多少|要分/,'怎麼分配'));
 return null;
}

function supervisorAsDirector(t){
 if(/合作社/.test(t))return null;
 if(/開會|召開|自己開|會議/.test(t))return null;
 if(!/(監事|監察人)/.test(t)||!/(理事|兼任|同時當|可以當)/.test(t))return null;
 return {category:'人民團體會務說明',title:'協會理事與監事不能一人兼任：同時當選須當場擇一',summary:'不可以。人民團體選舉罷免辦法第16條明定：會員如一人同時當選理事與監事（或候補理事與候補監事），由當選人當場擇一擔任；當選人不在場或無法擇定時，以得票較多的職位為當選，票數相同抽籤。所以同一人不能同時擔任理事與監事。\n\n理由：理事會執行會務、監事會監察理事會（人民團體法第18條），一人兼任兩者就無人監督。\n\n常見狀況：\n• 改選開票後發現同一人理事、監事都上榜 → 主席當場請本人選一個，另一個職位由次高票遞補為當選。\n• 現任理事任期中想改任監事 → 須先辭理事（經理事會決議解任，人民團體法第23條），再於補選時參選監事。',statutes:[E(16),P(18),P(23)],notes:['公會等職業團體另有理監事不得兼任會務工作人員的限制；合作社則依合作社法第40條，監事不得兼任理事。'],questionState:{focus:'director-supervisor-dual',domain:'social'}};
}
function electionReportDeadline(t){
 if(!/改選|選舉|當選|改選後/.test(t)||!/(多久|要報|要送|報縣府|期限)/.test(t))return null;
 return{category:'人民團體會務說明',title:'改選後報縣府期限：大會紀錄 30 日內',summary:'改選大會召開後，會員（會員代表）大會紀錄應於閉會後三十日內報請主管機關備查（人民團體會務輔導辦法第12條）。新任理事長當選證明書應連同改選大會紀錄等書表，也在 30 日內完成報送。',statutes:[G(12)],questionState:{focus:'election-report-deadline',domain:'social'},notes:['改選應在任期屆滿前一個月內完成（人民團體選舉罷免辦法第6條）。'],actions:[{label:'下載改選書表',view:'forms',sub:'改選'}]};
}
function checkSignature(t){
 if(!/支票/.test(t))return null;
 if(!/理事長|理事會/.test(t)&&!/協會|社會團體/.test(t))return null;
 return{category:'人民團體財務',title:'支票簽署權限：依章程或理事會授權',summary:'誰可以簽支票沒有強制規定，由團體自行決定。常見做法是理事長、總幹事、會計各一人共同簽署；無論怎樣簽，簽署人應是現任且有效的。',statutes:[],questionState:{focus:'check-signature',domain:'social'},notes:['銀行開戶時會要求存檔新任理事長及關鍵人員印章。'],actions:[{label:'看銀行開戶',view:'apply',sub:'1-bank'}]};
}
function feePeriods(t){
 if(!/會費|入會費/.test(t)||!/(分期|分幾期|分好幾|月繳|月付)/.test(t))return null;
 return{category:'人民團體會務說明',title:'會費分期繳納：由章程決定',summary:'法律沒有禁止分期。各團體可自行決定，例如常年費分季繳或月繳，或入會費分三期繳。重點是在章程或大會決議裡寫清楚分期方式，避免日後爭議。',statutes:[],questionState:{focus:'fee-periods',domain:'social'},notes:['會費金額也由章程或會員大會決議（人民團體法第35條）。'],actions:[]};
}
function feeDeferral(t){
 if(!/會費/.test(t)||!/(不繳|欠繳|沒繳|怎麼辦|處理|除名)/.test(t))return null;
 return{category:'人民團體會務說明',title:'會員不繳會費：通常逐級催繳後除名',summary:'人民團體法第26條規定會員有義務繳會費，但不規定不繳的後果。實務做法由章程決定，常見是：先個別通知→催繳函→逾期後大會決議除名。未繳會費的會員可暫停投票權或出席大會資格。具體催繳期限、除名標準及對權利的影響，都要在章程裡寫清楚；除名必須經會員大會決議。',statutes:[P(26),P(27)],questionState:{focus:'fee-deferral',domain:'social'},notes:['被除名會員可依章程重新申請入會。'],actions:[]};
}
function threeMonthsWording(t){
 if(!/(章程|三個月|三月|期限)/.test(t)||!/(內|以內|怎麼寫|差別|意思)/.test(t))return null;
 return{category:'人民團體會務說明',title:'「三個月」與「三個月內」的差別',summary:'「三個月內」比較明確，就是期限內完成；「三個月」容易引起爭議。本縣財務辦法及章程範例都用「三個月內」，建議您的章程也統一用「○○日前」或「○○月內」，搭配清楚的起算日，最容易避免誤解。',statutes:[F(11)],questionState:{focus:'three-months',domain:'social'},notes:['章程範例第20條訂任期時，建議寫「任期自召開本屆第一次理事會之日起計算」。'],actions:[{label:'下載章程範例',view:'forms',sub:'申請'}]};
}
function electionCandidates(t){
 if(!/(改選|選舉|候選人)/.test(t)||!/(公告|公開|宣傳|通知)/.test(t))return null;
 return{category:'人民團體會務說明',title:'改選候選人是否要公告',summary:'人民團體法沒有強制規定。實務上可以選擇現場提名、現場投票，也可以事先公告候選人名單。為了公開透明，建議在章程明確規定公告時間（如改選大會前 7 日）；沒有規定時，改選大會也要事先通知所有會員。',statutes:[P(25)],questionState:{focus:'candidates-announce',domain:'social'},notes:['會員大會一定要在十五日前通知各會員（人民團體法第25條）。'],actions:[{label:'下載改選書表',view:'forms',sub:'改選'}]};
}
function electionObjection(t){
 if(!/(改選|選舉|決議)/.test(t)||!/(反對|異議|抗議|不服)/.test(t))return null;
 return{category:'人民團體會務說明',title:'對改選決議有異議',summary:'改選大會當場揭曉結果時，會員可當場提出質疑選票有效性或計票程序，應記錄在會議紀錄。大會結束後，部分團體允許事後申請複查，但須在章程預先規定。通常不會推翻已做成的決議，除非程序嚴重違法（如出席人數不足）。建議章程或改選辦法裡預先說明監票員檢驗機制。',statutes:[P(25),E(10)],questionState:{focus:'election-objection',domain:'social'},notes:['改選程序依人民團體選舉罷免辦法辦理。'],actions:[{label:'看改選流程',view:'meet',sub:'m-elect'}]};
}



// 12-1 理事長無故缺席：人民團體法第30、32條；會務輔導辦法第13條
function chairmanAbsence(t){
 if(!/理事長|主席/.test(t)||!/缺席|不出席|不來|無故|不執行職務/.test(t))return null;
 if(/不開會|不召開|拒絕|不肯/.test(t))return null;  // 這些由 chairNoMeeting 處理
 if(/合作社/.test(t)||/監事/.test(t))return null;
 return {title:'理事長無故不召開會或無故缺席：應解除職務',summary:'人民團體法第30條規定理事長應召集並主持理事會。若理事長無故缺席理事會超過規定次數、或連續15日以上無故不執行職務，該理事長可由理事會以全體理事三分之二以上決議解除職務。',statutes:[P(30),P(32),G(13)]};
}

// 12-2 帳務報表保存期限：中華民國會計法、一般協會10年
function recordRetentionPeriod(t){
 if(!/保存|留存|保留|存放/.test(t)||!/(帳|報表|紀錄|憑證|簽到|多久|幾年)/.test(t))return null;
 if(/合作社/.test(t))return null;  // 合作社另有規定
 if(/多少錢|幾萬|金額/.test(t))return null;
 return {title:'帳務與會議紀錄保存期限：至少10年',summary:'社會團體會計紀錄、簽到名簿、會議紀錄原本應至少保存10年，特別是涉及財產處分、接受捐贈、舉辦活動的紀錄。超過保存期限後確認無調查需求再銷毀。',statutes:[P(19),F(11)]};
}

// 12-3 廣告費記帳：屬收入，列入決算收支表
function advertisingIncome(t){
 if(!/廣告|廣告費|廣告收入/.test(t)||!/(記帳|怎麼|怎樣|要|列入)/.test(t))return null;
 if(/合作社/.test(t))return null;
 return {title:'廣告費收入：列入決算收支表收入項',summary:'協會收取廣告費屬於收入，應開立收據，完整記錄於會計帳簿，列入年度決算收支決算表收入欄。金額、來源、經費用途（若有指定）都要記錄清楚。',statutes:[P(33),F(11)]};
}

// 12-4 總幹事開戶資料：身分證、章程、理事會決議
function staffBankAccountSetup(t){
 if(!/總幹事|工作人員|職員/.test(t)||!/(銀行|開戶|帳戶|資料|帶|要)/.test(t))return null;
 if(/聘僱|聘用|招聘|薪水|薪資/.test(t))return null;
 return {title:'總幹事開戶需帶資料：身分證、章程、理事會決議',summary:'協會若以總幹事或其他人員名義開設銀行帳戶，銀行通常要求：(1)該人員身分證影本 (2)協會章程 (3)理事會授權決議 (4)協會印鑑。建議先洽詢要開戶的銀行最新要求。',statutes:[F(17)]};
}

// 12-5 會員大會簽到期限：沒有強制規定，由章程決定
function meetingSigninDuration(t){
 if(!/簽到|簽名|簽署|簽?.{0,2}到/.test(t)||!/(多久|幾分|要.{0,2}久|時間|期限)/.test(t))return null;
 if(!/會.{0,2}大會|出席/.test(t))return null;
 return {title:'會員大會簽到時間限制：由章程決定',summary:'人民團體法沒有規定簽到的具體時間限制。通常做法是在會議開始前15分鐘開始簽到，於會議開始時截止，但確切時間可由團體自行決定並在章程或會議規則中明定。',statutes:[P(25),G(12)]};
}

// 12-6 決議表決方式：舉手表決可以，決議須記錄方式
function meetingVotingMethod(t){
 if(!(/表決|舉手|決議/.test(t)&&!/投票/.test(t))||!/(可以|可不|允|行|方式)/.test(t))return null;
 if(/改選|投票|線上|通訊/.test(t))return null;  // 這些由其他規則處理
 return {title:'理事會決議表決方式：舉手表決可以',summary:'理事會決議可採舉手表決，只要符合法定人數與出席人數過半數或較多數同意即可。表決方式由章程決定，但會議紀錄應記錄表決結果與表決方式。',statutes:[P(25),G(12)]};
}

// 12-7 改選前理監事會：不是一定要開，但法律無禁止
function preElectionBoardMeeting(t){
 if(!/改選|選舉/.test(t)||!/(前|之前|預|選前|準備|一定)/.test(t)||!/(理|監)/.test(t))return null;
 if(/當選|當選後|結束|完/.test(t))return null;
 return {title:'改選前理監事會：不是必定要開',summary:'人民團體法沒有強制規定改選前一定要開理監事會。但由於改選涉及選舉、計票、文件驗收等多個環節，實務上許多團體在改選前召開理監事會討論改選程序，以避免爭議。建議在章程訂明。',statutes:[P(25),P(43)]};
}

// 12-8 監事會主席選舉：由監事會自行選舉常務監事為主席
function supervisorChairmanElection(t){
 if(!/監事|監察/.test(t)||!/(主席|主任|選舉|選出|怎麼選)/.test(t))return null;
 if(/不開會|不召開|不肯|拒絕|不執行/.test(t))return null;
 if(/副|解除|罷免|理事/.test(t))return null;
 return {title:'監事會主席（常務監事）：由監事會選舉',summary:'監事會由監事組成，監事會內部應自行選舉常務監事作為監事會主席，主持監事會會議。選舉方式由章程或監事會規則決定。',statutes:[P(29),P(43)]};
}

// 12-9 改選日期計算：新理監事就任日期應在大會閉會當日
function electionEffectiveDate(t){
 if(!/改選|當選|新/.test(t)||!/(哪一天|什麼時候|日期|才能|能.{0,2}算|從哪一天|開始|開始計算)/.test(t))return null;
 if(!/一屆|屆|新的|新人/.test(t))return null;
 return {title:'改選當選日期計算：大會閉會當日即為新屆開始',summary:'新任理監事的任期從改選大會閉會當日起算。改選大會通常在同一天完成報到、投票、計票與當選人就任，即為新屆理監事開始任期的時間。',statutes:[P(19),G(12)]};
}

// 12-10 政治獻金：協會不得接受
function politicalDonation(t){
 if(!/政治|獻金|政治獻金/.test(t)||!/(接受|可以|不可|行不行|能.{0,2}接)/.test(t))return null;
 return {title:'協會不得接受政治獻金',summary:'人民團體法第33條禁止社會團體接受境外資金，也禁止政治獻金。協會若收到來自政治人物、候選人或政治團體的獻金應即拒絕，以維持團體的中立性。',statutes:[P(33)]};
}


// 13-1 會員代表選舉
function memberDelegateElection(t){
 if(!/會員代表|代表/.test(t)||!/(怎麼|選|選出|產生|選舉|怎樣|怎)/.test(t))return null;
 if(/大會|開會|召開|人數|幾人/.test(t))return null;
 return {title:'會員代表選舉：由會員大會選舉產生',summary:'超過300名會員的協會改為會員代表制後，會員代表由會員大會依章程規定的比例和名額選舉產生。代表不得由理事長或理事會指派。',statutes:[P(17),P(25)]};
}

// 13-2 分支機構設立
function branchOrgSetup(t){
 if(!/分支|支部|分會/.test(t)||!/(設立|成立|設置|怎麼|程序|步驟|怎)/.test(t))return null;
 if(/財務|帳|稅|報|會計/.test(t))return null;
 return {title:'分支機構設立程序：理事會決議、向主管機關報核准',summary:'協會欲設立分支機構，應先由理事會決議並納入章程修正，經會員大會通過後，向屏東縣政府社會處報告並取得核准。分支機構應依母會決議執行會務。',statutes:[P(6),G(12)]};
}

// 13-3 會員代表提案
function delegateProposalProcess(t){
 if(!/提案|議案|建議/.test(t)||!/(怎麼|怎樣|怎|要.{0,2}提|流程)/.test(t))return null;
 if(!/代表|會員|大會/.test(t))return null;
 return {title:'會員大會提案方式：當面或事先提案',summary:'在會員代表大會上，代表可現場舉手提案，或於會議開始前書面提案給理事會。提案內容應明確，由大會主席決定是否納入議程。',statutes:[P(25),G(12)]};
}

// 13-4 常年會vs會員大會
function annualMeetingVsAssembly(t){
 if(!/常年會|會員大會/.test(t)||!/差別|差異|一樣|是否|同|就是/.test(t))return null;
 if(/簽到|簽|多久|時間|期限|要.{0,2}久/.test(t))return null;
 return {title:'常年會=會員大會：定期會的習慣稱法',summary:'「常年會」和「會員大會」是同一概念。人民團體法用「會員大會」，但實務中常稱「常年會」指定期召開的會議。臨時會是因特殊事由召開。',statutes:[P(25),G(12)]};
}

// 13-5 監事會成立人數
function supervisorMinimumMembers(t){
 if(/監事會|監察/.test(t)&&/(幾人|幾?.{0,2}人|最少|多少人|幾?.{0,2}人|人數|才能|成立)/.test(t))
  return{title:'監事會成立法定人數：至少3人',summary:'監事會應由3人以上的監事組成。人數不足時無法行使監察權。',statutes:[P(17)]};
 return null;
}

// 13-6 監事會帳目檢查
function supervisorAuditPowers(t){
 if(/監事|監察/.test(t)&&/(檢查|審查|審視|查帳|帳目|帳務|怎麼|怎樣|怎)/.test(t))
  return {title:'監事會帳目檢查：定期檢查帳簿、簽署確認',summary:'監事會應定期檢查協會的帳簿、憑證、出納狀況，並於財務報告上簽署確認。若發現問題應記錄、通知理事長並報會員大會。',statutes:[P(22),F(4)]};
 return null;
}

// 13-7 分支機構帳務
function branchOrgAccounting(t){
 if(/分支|支部|分會/.test(t)&&/(帳|報表|決算|帳務|帳目|分開|分?.{0,2}帳)/.test(t))
  return{title:'分支機構帳務：應分開設帳記錄',summary:'分支機構所屬的帳務應分開設帳，以便與母會帳務清楚分別。分支機構收支定期彙報母會，由母會統籌決算。',statutes:[P(19),F(5)]};
 return null;
}

// 13-8 理事長連任限制
function chairmanReelectionLimit(t){
 if(/合作社|社員|理事主席/.test(t))return null;
 if(/理事長|主席|理長/.test(t)&&/(連任|連選|幾次|幾任|幾屆|限制|能.{0,2}連|改選.{0,3}連)/.test(t)){
  const is_community=/社區|發展/.test(t);
  if(is_community) return {title:'社區發展協會理事長：不得連任',summary:'依人民團體法第20條，社區發展協會理事長任期屆滿不得連任，只能一屆。',statutes:[P(20)]};
  return {title:'一般協會理事長連任限制：以一次為限',summary:'一般社會團體（不含社區發展協會）理事長可以連任，但連任以一次為限，也就是最多可當兩屆。',statutes:[P(19)]};
 }
 return null;
}



// 14-1 合作社決算表vs協會6項
function coopVsAssocAccountingForms(t){
 if(/合作社/.test(t)&&/(決算表|報表|財務|帳|表格)/.test(t)&&/(怎麼|怎樣|填|怎|哪些|6項)/.test(t))
  return{title:'合作社決算表vs協會6項：不同報表與期限',summary:'一般協會要報6項財務報表（收支預算表、決算表、現金出納表、資產負債表、財產目錄、基金收支表）。合作社的規定不同：年度決算報請社員大會承認後，應於一個月內報主管機關備查，包含業務報告書、資產負債表、收支餘絀表、財產目錄及結餘分配案（合作社法第36條）。兩者報表形式、項目、期限都不同，不能混用。',statutes:[C(36),F(11)]};
 return null;
}

// 14-2 合作社資產負債表報送
function coopBalanceSheetReport(t){
 if(/合作社/.test(t)&&/(資產負債表|資產)/.test(t)&&/(要報|要不要|報|送)/.test(t))
  return{title:'合作社資產負債表：年度決算後1個月內報備查',summary:'是的，合作社的資產負債表是年度決算報表的重要部分，應於社員大會承認決算後一個月內，連同業務報告書、收支餘絀表、財產目錄、結餘分配案等，報請主管機關備查（合作社法第36條）。',statutes:[C(36)]};
 return null;
}

// 14-3 會員代表名額計算
function delegateQuotaCalculation(t){
 if(/(會員代表|代表|代表制)/.test(t)&&/(名額|幾個|多少|怎麼.{0,2}算|計算|比例)/.test(t)&&!/選/.test(t))
  return{title:'會員代表名額：依章程規定的比例和區域分配',summary:'會員大會改為會員代表制後，代表人數及分配比例由章程規定。通常按地域或會員類別分配，例如每10名會員選1名代表，或按鄰里分配。關鍵是章程要明確規定名額、比例、產生方式，並報主管機關核備（人民團體法第17、25條）。',statutes:[P(17),P(25)]};
 return null;
}

// 14-4 代表能否兼任理事
function delegateConcurrentRole(t){
 if(/(會員代表|代表)/.test(t)&&/(兼|當|當選|再當|同時)/.test(t)&&/(理事|主席|職|職務)/.test(t))
  return{title:'會員代表能否兼任理事：法律未禁止，由章程決定',summary:'人民團體法沒有禁止會員代表同時兼任理事。實務上可以，但最好在章程裡明確規定：是否允許兼任、兼任人數上限、是否要迴避等。有些協會規定代表只代表會員發言不兼任職位，以保持代表的中立性。',statutes:[P(25)]};
 return null;
}

// 14-5 會員大會表決方式
function assemblyVotingMethod(t){
 if(/(會員大會|大會)/.test(t)&&/(表決|投票|舉手|無記名|怎麼.{0,2}決)/.test(t)&&!/理事會/.test(t))
  return{title:'會員大會表決方式：視議案性質決定',summary:'會員大會對一般提案通常用舉手表決，快速簡便。選舉理監事或重大決議要用無記名投票，確保秘密性（人民團體選舉罷免辦法第4條）。具體方式由章程訂定，大會也可視議案性質臨時決議。例如選舉用無記名投票，一般議案用舉手表決。',statutes:[E(4),P(25)]};
 return null;
}

// 14-6 理事會表決方式細化
function boardVotingMethodDetail(t){
 if(/(理事會|理監事會)/.test(t)&&/(表決|投票|舉手|無記名|怎麼.{0,2}決)/.test(t))
  return{title:'理事會決議表決方式：通常舉手表決，選舉用無記名',summary:'理事會日常決議通常用舉手表決。但選舉理事長、常務理事或常務監事時，應改用無記名投票（人民團體選舉罷免辦法第4條）。法律沒強制規定所有決議都要無記名，由章程決定，現場也可因議案重要性決議改投票方式。',statutes:[E(4),P(43)]};
 return null;
}

// 14-7 會員代表選舉方式
function delegateElectionProcess(t){
 if(/(會員代表|代表)/.test(t)&&/(選舉|選|產生|怎麼.{0,2}選)/.test(t))
  return{title:'會員代表選舉：依章程規定的時間、地點、方式',summary:'會員大會選舉代表，具體程序由章程訂定。常見方式：(1)全體會員在會員大會上選舉；(2)按分會/區域各選舉各自代表，再彙總成代表大會代表；(3)推薦+會員大會審認。須確保代表的代表性，禁止理事長或理事會直接指派（人民團體法第17、25條）。',statutes:[P(17),P(25)]};
 return null;
}

// 14-8 代表大會召開規則
function delegateAssemblyRules(t){
 if(/(代表大會|代表.{0,2}大會|會員代表大會)/.test(t)&&/(召開|開|怎麼|規則|須知)/.test(t))
  return{title:'會員代表大會：比照會員大會規則，需提前通知',summary:'會員代表大會是代表制協會的最高權力機關，運作比照會員大會，應提前十五日通知各代表（人民團體法第25條）。紀錄應記載決議，閉會後三十日內報縣府備查。代表也可在會員大會上提案或質詢。',statutes:[P(25),G(12)]};
 return null;
}

// 14-9 合作社社員罷免
function coopMemberRemoval(t){
 if(/合作社/.test(t)&&/(罷免|開除|辭退)/.test(t)&&/(社員|理事|監事)/.test(t))
  return{title:'合作社社員罷免：依合作社法程序',summary:'合作社社員或理監事的罷免程序由合作社法、章程規定，與一般協會不完全相同。社員罷免由社員大會決議，理事或監事罷免由各自的會議決議。具體投票門檻、期限等，請查閱貴社章程或洽承辦。',statutes:[C(37)]};
 return null;
}

// 14-10 合作社向銀行借貸
function coopBankLoan(t){
 if(/合作社/.test(t)&&/(借|貸|借錢|借貸|向銀行|金融)/.test(t))
  return{title:'合作社向銀行借貸：理事會或社務會決議後辦理',summary:'合作社可以向銀行借貸進行業務經營，通常由理事會或社務會決議，並檢附授權文件向銀行申請。稅務、融資利率等涉及金融法規，本站無詳細規定。建議先諮詢銀行融資部門，了解合作社借貸的資格與流程。',statutes:[C(53)]};
 return null;
}

// 14-11 分支機構帳務操作
function branchAccountingPractice(t){
 if(/(分支機構|分支|支部)/.test(t)&&/(帳|帳務|會計|帳簿)/.test(t)&&/(分開|帳分|單獨|操作|記)/.test(t))
  return{title:'分支機構帳務操作：分開設帳、定期彙報、年終併報',summary:'分支機構帳務應單獨設帳，記錄分支的收支情形。月度或季度向母會彙報分支帳況，年度決算時分支帳應併入母會決算，由母會統籌報備。母會保留分支帳帳簿供檢查（財務處理辦法第5、19條）。',statutes:[F(5),F(19),P(19)]};
 return null;
}

// 14-12 改選後帳務期限確認
function postElectionAccountingDeadline(t){
 if(/(改選|選舉|換人|新任)/.test(t)&&/(帳|決算|財務|報表|做帳)/.test(t)&&/(要|做|要.{0,2}報|何時)/.test(t)&&!/報縣府|報主管/.test(t))
  return{title:'改選後帳務處理：同年度決算於年終前三個月內完成',summary:'改選當年的決算仍按原規定辦理：年度終了後三個月內編造、經會員大會通過後報備查。改選不影響帳務年度。新任理事長上任後15日內要完成移交（含帳務交接），之後配合會計做決算與報告（人民團體會務輔導辦法第18條）。',statutes:[G(18),F(11),P(43)]};
 return null;
}

// 15-1 合作社廣告費稅務：無法確認，涉稅務
function coopAdvertisingTaxability(t){
 if(/合作社/.test(t)&&/(廣告費|廣告|登廣告|收廣告)/.test(t)&&/(稅|營業稅|繳|怎樣|怎麼|要不)/.test(t))
  return{title:'[本站無法確認] 合作社廣告費稅務處理',summary:'合作社收廣告費是否需繳營業稅，涉及稅法判定（營業稅法、所得稅法）與合作社業務性質認定。不同類型合作社（消費、生產、勞動、信用等）的規定可能不同。\\n\\n建議洽詢：\\n📞 財政部南區國稅局 0800-000-321 或屏東分稽處\\n說明：貴合作社類型、年度廣告費金額、業務內容\\n📋 準備文件：合作社章程、決算報表、廣告合約',statutes:[C(36)]};
 return null;
}

// 15-2 合作社貸款給社員的稅務處理：無法確認
function coopLoanToMemberTax(t){
 if(/合作社/.test(t)&&/(利息|定期)/.test(t)&&/(稅|認列|怎麼|處理|要.{0,2}繳)/.test(t))
  return{title:'[本站無法確認] 合作社貸款給社員的稅務處理',summary:'合作社向社員貸款，利息收入如何稅務認列涉及複雜的稅法判定。需要確認合作社法第38條定期利息規定、理事會決議利息率、與稅務認列標準。\\n\\n建議洽詢：\\n📞 財政部南區國稅局 0800-000-321\\n📞 合作社聯合社：貸款定價與慣例\\n📋 建議尋求會計師協助稅務規劃',statutes:[C(38)]};
 return null;
}

// 15-3 合作社向銀行借貸程序：無法確認詳細程序
function coopBankLoanProcedure(t){
 if(/合作社/.test(t)&&/(銀行|借貸|融資|貸款|向銀行)/.test(t)&&/(程序|手續|怎麼|怎樣|步驟|要.{0,2}怎)/.test(t))
  return{title:'[本站無法確認] 合作社向銀行借貸的詳細程序',summary:'向銀行申請貸款涉及銀行法與金融實務，程序因銀行不同而異。建議流程：1️⃣理事會決議借貸 2️⃣準備決議書、決算報表、章程、代表身份證明 3️⃣銀行審查財務狀況與擔保品 4️⃣簽約撥款。\\n\\n建議洽詢：\\n📱 往來銀行融資部門\\n📞 屏東縣合作社聯合社（可協助介紹金融機構）\\n💡 利率、擔保方案等由銀行決定，請提前洽詢',statutes:[C(53)]};
 return null;
}

// 15-4 社區協會報公所項目：部分確認
function communityReportingRequirements(t){
 if(/(社區|社區協會)/.test(t)&&/(報公所|報|送|要報|備查|報|上報)/.test(t)&&/(哪些|什麼|項目|事項)/.test(t))
  return{title:'[未能確認] 社區發展協會報公所項目',summary:'✅ 法律明文要求：\\n• 會員大會紀錄（閉會後30日內報備查）- 人民團體會務輔導辦法第12條\\n• 年度決算報告（年終後3個月內報備查）- 財務處理辦法第11條\\n• 理監事名冊變動（改選後30日內報備查）- 人民團體法第28條\\n\\n❓ 其他項目因各鄉鎮要求不同，本站無法一一確認。建議洽詢所在地鄉鎮公所。\\n\\n建議洽詢：\\n📍 所在地鄉鎮市公所社會課（民政課）\\n📞 屏東縣政府社會處 (08)7360316\\n*不同鄉鎮要求可能有差異*',statutes:[P(28),G(12),F(11)]};
 return null;
}

// 15-5 社區年度計畫送件期限：無法確認
function communityYearlyPlanDeadline(t){
 if(/(社區|社區協會)/.test(t)&&/(年度計畫|年度|計畫|年計畫)/.test(t)&&/(期限|何時|幾月|送|報)/.test(t))
  return{title:'[本站無法確認] 社區協會年度計畫送件期限',summary:'社區發展協會年度計畫何時提報，取決於中央社區發展工作綱要、屏東縣政府社會處要求，以及各鄉鎮市公所規定。\\n\\n常見參考（待確認）：\\n📅 上年度 11-12月 提報下年度計畫\\n📅 變更時 3月底前補報或修正\\n\\n建議洽詢：\\n📍 所在地鄉鎮市公所社會課\\n📍 屏東縣政府社會處 (08)7360316\\n*不同年份、單位可能有調整，建議提前1個月詢問*',statutes:[P(6)]};
 return null;
}

// 15-6 社區協會vs一般協會的差別：部分確認
function communityVsAssociationDifferences(t){
 if(/(社區|社區協會)/.test(t)&&/(差別|差異|不同|有什麼|與|vs|vs|比較)/.test(t)&&/(協會|一般|團體)/.test(t))
  return{title:'[部分規定確認] 社區發展協會 vs 一般協會的差別',summary:'✅ 明確不同：\\n1️⃣ 理事長連任：社區不得連任 vs 一般可連任一次\\n2️⃣ 組織名稱：社區有格式限制（屏東縣○○鄉鎮市○○社區發展協會）vs 一般無\\n3️⃣ 受理單位：社區向鄉鎮公所申請立案 vs 一般向縣府社會處\\n4️⃣ 監管機構：社區由鄉鎮公所+縣府社會處 vs 一般只由縣府社會處\\n\\n❓ 待確認（需社區發展工作綱要）：會員資格、活動範圍、補助等級、人事編制等。\\n\\n建議洽詢：\\n📋 社區發展工作綱要（全文）\\n📍 所在地鄉鎮市公所社會課\\n💡 參考已立案社區協會的章程與規則',statutes:[P(19),P(20),G(12)]};
 return null;
}









// 以下四函數內容逐字對照 data/statutes.json.gz（2026-11-05 版）
const CE=n=>({title:'合作社選舉罷免辦法第'+n+'條',source:LAW+'D0050022'});
function invalidBallotReason(t){
 if(!/(選票|選舉票|無效票|廢票)/.test(t))return null;
 if(!/(無效|作廢|廢|怎麼算|怎樣算|哪些|什麼情形|幾種|認定)/.test(t))return null;
 if(/合作社|社員/.test(t))return{category:'合作社選舉',title:'合作社選舉票無效的 13 種情形（合作社選舉罷免辦法第31條）',summary:'選舉票有下列情事之一者無效：\n一、未依第十九條規定辦理（非合作社依規定提供之票）。\n二、圈寫之被選舉人超出應選出名額或限制連記名額。\n三、圈寫之被選舉人姓名與社員名冊不符。\n四、圈寫之位置不能辨別為何人。\n五、圈寫後經塗改。\n六、書寫字跡模糊不能辨識。\n七、污染致不能辨別。\n八、夾寫其他文字或符號（同姓名者在下端註明區別除外）。\n九、附有暗號作用。\n十、簽名、蓋章或捺指模。\n十一、用鉛筆圈寫。\n十二、撕破不完整。\n十三、完全空白。\n第三至六款屬部分性質者，僅該部分無效；認定有疑義時，由會議主席及監票員會商決定。',statutes:[CE(31),CE(29)],notes:['開票後有效票與無效票應分別包封，由主席會同監票員簽章，保存至任期屆滿（第29條）。'],questionState:{focus:'invalid-ballot',domain:'coop'}};
 return{category:'人民團體選舉',title:'選舉票無效的 13 種情形（人民團體選舉罷免辦法第10條）',summary:'選舉票或罷免票有下列情事之一者無效：\n一、非屬人民團體提供。\n二、圈寫（含塗改）之被選舉人總計超出應選出名額或連記額數；或罷免票同時圈「同意」「不同意」。\n三、夾寫其他文字或符號（二人以上同姓名在姓名下註明區別者除外）。\n四、所圈寫之姓名與會員（會員代表）名冊不符。\n五、所圈位置不能辨別為何人。\n六、圈寫後經塗改。\n七、書寫字跡模糊致不能辨識。\n八、用鉛筆圈寫（電腦計票劃卡者除外）。\n九、附任何物件顯有暗號作用。\n十、污染致不能辨別。\n十一、簽名、蓋章或捺指模。\n十二、撕破致不完整。\n十三、不加圈寫，完全空白。\n第四至七款如屬部分性質，由主席會同全體監票員當場認定該部分無效；有爭議時表決，正反同數者該票為有效。',statutes:[E(10)],notes:['無效票不計入有效票數；投票前主席宣布選舉注意事項時應說明無效票認定方式。'],questionState:{focus:'invalid-ballot',domain:'social'}};
}
function delegateQualification(t){
 if(!/會員代表/.test(t))return null;
 if(!/(資格|條件|誰|怎麼產生|如何產生|怎麼選|如何選|是什麼|什麼是|定義)/.test(t))return null;
 return{category:'人民團體會務說明',title:'會員代表是什麼、怎麼產生（人民團體法第13、28條）',summary:'依人民團體法第13條，會員代表指：\n（一）由「會員單位」推派的代表（團體會員制）；\n（二）由「下級團體」選派的代表（分級組織）；\n（三）依第28條「分區選出」的代表：會員（會員代表）人數超過三百人者，得劃分地區，依人數比例選出代表，再合開代表大會行使會員大會職權，地區劃分與名額分配應報主管機關核備。\n會員代表權利之行使與會員相同（第13條），有表決、選舉、被選舉與罷免權，一人一權（第16條）。\n代表之名額、職權、任期及選任與解任，法律授權由章程載明（第12條第9款），所以「誰能當、任期多長」要看各團體章程。',statutes:[P(13),P(28),P(12),P(16)],notes:['法規未規定「入會滿幾個月才能當代表」等門檻，若章程有訂即依章程。','理事會應於大會十五日前審定會員（會員代表）資格並造冊（會務輔導辦法第10條）。'],questionState:{focus:'delegate-qualification',domain:'social'}};
}
function substitutionOrder(t){
 if(!/(候補|遞補)/.test(t))return null;
 if(!/(順序|怎麼|如何|依次|用完|不夠|缺額|出缺|順位|遞補)/.test(t))return null;
 if(/選票|無效票|幾個|幾人|幾位|幾名|名額|多少|人數/.test(t))return null;
 return{category:'人民團體選舉',title:'候補理監事遞補順序與遞補後仍有缺額的處理（選罷辦法第17、19、27條）',summary:'■ 遞補順序\n理事、監事出缺時，以候補理事、候補監事「依次」遞補（選罷辦法第17條；會務輔導辦法第9條）。候補名次按得票多寡排序，同票以抽籤定之（第15條）。有選出名額比例限制（如分區、分類）者，以同類候補依次遞補（第19條）。\n\n■ 候補用完或遞補後仍不足\n經遞補後，理事、監事人數「未達章程所定名額三分之二」時，應補選足額（第17條）。例：章程定理事15人，2/3＝10人，遞補後只剩9人就必須補選。\n\n■ 理事長、常務理事、監事會召集人出缺\n應自出缺之日起一個月內補選；理事長所遺任期不足六個月者，得於一個月內依章程或由常務理事（未設者由理事）互推一人代理（第17條）。\n\n■ 不能遞補的情形\n辭職之理事、監事不得退為候補；候補以書面放棄遞補者，不保留候補身分（第27條）。應受連任限制者不得當選候補（第13條）。',statutes:[E(17),E(19),E(27),E(15),G(9)],notes:['遞補與補選結果均應報主管機關備查。','遞補者任期至原任期屆滿為止，不重新起算。'],questionState:{focus:'substitution-order',domain:'social'},actions:[{label:'下載改選書表',view:'forms',sub:'改選'}]};
}
function byElectionThreshold(t){
 if(!/(三分之二|2\/3|三分之ニ)/.test(t))return null;
 if(!/(補選|缺額|遞補|剩|不足|未達|少於|幾人|多少人)/.test(t))return null;
 if(/出席|開會|決議|章程.{0,3}修|修改章程/.test(t))return null;
 const m=t.match(/(\d{1,2})\s*(人|名|位|席)/);
 let ex='';
 if(m){const n=+m[1];const th=Math.ceil(n*2/3);ex='\n\n以您提到的 '+n+' 人為例：'+n+'×2/3＝'+(n*2/3).toFixed(2)+'，至少要有 '+th+' 人在任才算「達三分之二」；在任人數若只剩 '+(th-1)+' 人以下，就必須補選足額。';}
 return{category:'人民團體選舉',title:'理監事人數未達章程名額三分之二時應補選（選罷辦法第17條）',summary:'理事、監事出缺先由候補依次遞補；遞補後如人數「未達章程所定名額的三分之二」，應補選足額。判斷基準是「章程所定名額」，不是現有人數。計算時 2/3 若非整數，以無條件進位後之整數為「達標」門檻。'+ex,statutes:[E(17),G(9)],notes:['此處 2/3 是補選門檻，與會員大會決議或修改章程之出席／表決比例無關。'],questionState:{focus:'by-election-threshold',domain:'social'}};
}

function coopChairReelection(t){
 if(!/合作社|社員|理事主席/.test(t))return null;
 if(!/(理事主席|理事長|主席|理事|監事)/.test(t)||!/(連任|連選|幾屆|幾任|再選|任期)/.test(t))return null;
 if(/罷免|解任|辭職|出缺/.test(t))return null;
 return{category:'合作社',title:'合作社理事、監事（含理事主席）任期與連任（合作社法第33條）',summary:'合作社法第33條：理事、監事之任期不得超過三年；除法律或章程另有規定外，連選得連任。\n法律本身沒有訂「理事主席只能連任一次」，是否限制連任次數，要看貴社章程有沒有另訂。若章程未限制，即可連選連任；若章程有限制（例如以一次為限），依章程。',statutes:[C(33)],notes:['合作社的負責人稱「理事主席」，由理事互選產生。','與人民團體法第20條「理事長連任以一次為限」不同，請勿混用。'],questionState:{focus:'coop-chair-reelection',domain:'coop'}};
}

function candidateSeatCount(t){
 if(!/候補/.test(t)||!/(幾個|幾人|幾位|幾名|名額|多少|人數|上限|最多|可以設|要設)/.test(t))return null;
 if(/合作社|社員/.test(t))return null;
 return{category:'人民團體選舉',title:'候補理事、候補監事名額：不得超過理監事名額的三分之一（人民團體法第17條）',summary:'人民團體「得」置候補理事、候補監事（可設可不設），名額不得超過該團體理事、監事名額的三分之一。\n例：章程定理事15人、監事5人，候補理事最多5人、候補監事最多1人（5×1/3＝1.67，取整數不得超過即1人）。\n監事名額本身也不得超過理事名額三分之一；縣（市）以下團體理事不得逾15人。實際人數依章程，且理監事人數應為奇數（會務輔導辦法第9條）。',statutes:[P(17),G(9)],notes:['要不要設候補、設幾人，寫在章程裡；候補名次依得票多寡排序（選罷辦法第15條）。'],questionState:{focus:'candidate-seat-count',domain:'social'}};
}
function ballotRetention(t){
 if(!/(選票|選舉票|罷免票)/.test(t)||!/(留|保存|保管|銷毀|丟|多久|幾年|放)/.test(t))return null;
 if(/無效|作廢/.test(t))return null;
 if(/合作社|社員/.test(t))return{category:'合作社選舉',title:'合作社選舉票保存：保存至該屆任期屆滿為止（合作社選舉罷免辦法第29條）',summary:'開票完畢後，會議主席會同監票員將有效票及無效票分別包封，於封口處共同簽名或蓋章，連同社員名冊及用餘選舉票，由合作社保存至任期屆滿為止。選舉會議紀錄應報主管機關備查。',statutes:[CE(29)],questionState:{focus:'ballot-retention',domain:'coop'}};
 return{category:'人民團體選舉',title:'選票保存：妥為保管至下屆改選完畢，無爭訟即可銷毀（人民團體選舉罷免辦法第26條）',summary:'紙本選舉票或罷免票在開票宣布結果後，應全部包封，封面寫明團體名稱、屆次、職稱、票數及年月日，由會議主席及監票員會同驗簽後，交由團體妥為保管。\n電子投票者，應妥適保存選舉歷程及結果之電磁資料，並異地備份。\n如無爭訟，等「任期屆滿、下屆改選完畢後」自行銷毀。法規沒有寫固定「幾年」，是以一屆任期為準。',statutes:[E(26)],notes:['有選舉爭議或訴訟時，不得銷毀。'],questionState:{focus:'ballot-retention',domain:'social'}};
}
function officerResignation(t){
 if(!/(辭職|請辭|辭掉|不做了|不幹了|辭任)/.test(t))return null;
 if(!/(理事|監事|常務)/.test(t)||/理事長|主席/.test(t))return null;
 if(/合作社|社員/.test(t))return null;
 return{category:'人民團體會務說明',title:'理事、監事辭職：書面提出，經理事會／監事會決議，缺額由候補依次遞補（選罷辦法第27條）',summary:'■ 怎麼辭\n理事、常務理事、監事、常務監事之辭職應「以書面提出」（辭職書寫明姓名、職務、辭職日期、理由並簽章即可），分別經理事會或監事會決議准其辭職，並於下次會員（會員代表）大會提出報告。\n\n■ 辭了之後\n缺額由候補理事、候補監事依次遞補（人民團體法第23條、會務輔導辦法第9條）。辭職者在原任期內不得再當選同一職務，也不得退為候補。\n\n■ 視同辭職\n連續二次無故缺席理事會、監事會者，視同辭職（人民團體法第31條）。',statutes:[E(27),P(23),P(31),G(9)],notes:['理事長辭職另有程序，請直接問「理事長辭職」。','決議後請連同遞補結果報主管機關備查。'],questionState:{focus:'officer-resignation',domain:'social'},actions:[{label:'下載改選書表',view:'forms',sub:'改選'}]};
}

// 2026-11-10 用戶回報三題答非所問，依法條原文新增
function chairSpendWithoutBoard(t){
 if(!/(理事長|會長)/.test(t)||/監事/.test(t))return null;
 if(!/(經費|錢|款|預算|活動|支出|開支)/.test(t))return null;
 if(!/(不經|未經|沒經|沒有經|不用經|自己決定|自行|擅自|直接|跳過|可以.{0,8}(動用|動支|用|花|辦)|可不可以|能不能)/.test(t))return null;
 if(/合作社|社員/.test(t))return null;
 return{category:'人民團體會務說明',title:'理事長不能繞過理事會自行動用經費或辦活動',summary:'不可以。理事長是執行者，不是決定者：\n\n1. 年度工作計畫與收支預算由理事會編造、會員（會員代表）大會通過並報縣府備查（社會團體財務處理辦法第11條）。經費與活動都應在通過的計畫、預算範圍內執行。\n2. 經費收支及工作執行情形「應於每次理事會議提出審議」，並送監事會監察（會務輔導辦法第17條）；計畫外、預算外的活動或支出，應先提理事會決議。\n3. 準備基金非經理事會通過不得動支（財務處理辦法第15條）；不動產買賣、設定權利更須會員大會通過（第13條）。\n4. 理事會、監事會應依大會決議及章程分別執行職務（人民團體法第18條）；理事長違反法令、章程或大會決議，得經會員大會罷免（第22條）。\n\n實務上，章程或理事會多會授權理事長在已通過的預算內核定日常支出，但那是「預算內執行」，不是不經理事會另起爐灶。',statutes:[F(11),G(17),F(15),P(18),P(22)],notes:['會員若發現此情形，可先請監事會依財務處理辦法第22條查核；監事會糾正意見理事會不處理時，得提報會員大會（會務輔導辦法第17條）。'],questionState:{focus:'chair-spending',domain:'social'}};
}
function supervisorSpend(t){
 if(!/監事/.test(t)||/理事長|會長|代理/.test(t))return null;
 if(!/(經費|錢|款|預算|支出|開支|動用|動支|支用|花)/.test(t))return null;
 if(!/(擅自|自行|自己|私自|可以|可不可以|能不能|能否|直接)/.test(t))return null;
 if(/合作社|社員/.test(t))return null;
 return{category:'人民團體會務說明',title:'監事不能動用會內經費：監事會是監察單位，不是執行單位',summary:'不可以。\n\n• 理事會與監事會依大會決議及章程「分別」執行職務（人民團體法第18條）：理事會負責執行會務、動支經費；監事會負責監察。\n• 監事會的財務角色是查核：定期監事會議執行定期查核，必要時臨時查核（社會團體財務處理辦法第22條）；對理事會送來的收支與工作執行提出糾正意見（會務輔導辦法第17條）；審核年度決算並向大會報告（人民團體法第34條）。\n• 監事為無給職，僅得依規定酌發出席費或交通費（財務處理辦法第19條）。\n\n監事若擅自動支經費，屬違反法令與章程，理事會應追回，並得經會員大會罷免（人民團體法第22條）；涉及侵占另有刑事責任。',statutes:[P(18),F(22),G(17),P(34),F(19),P(22)],notes:['監事「查帳」與「用錢」是兩回事；監事可以要求看帳、憑證，但不能開支票、領款。'],questionState:{focus:'supervisor-spending',domain:'social'}};
}
function supervisorActingChair(t){
 if(!/(常務監事|監事會召集人|監事)/.test(t)||!/(理事長|會長)/.test(t))return null;
 if(!/(代理|代行|代替|暫代|代為|代開|代召集|可以當)/.test(t))return null;
 if(/合作社|社員/.test(t))return null;
 return{category:'人民團體會務說明',title:'常務監事不能代理理事長；代理人應由常務理事（或理事）產生',summary:'不可以。理事會與監事會是分立的執行與監察機關，理監事應親自執行職務、不得委託他人代理（人民團體法第18、31條），監事更不能跨到理事會去代理理事長。\n\n誰可以代理？\n• 理事長「出缺」：自出缺日起一個月內補選；所遺任期不足六個月者，得依章程規定或由常務理事互推一人代理，未設常務理事者由理事互推（選舉罷免辦法第17條）。\n• 理事長「因故暫時不能執行職務」：依章程所定代理程序辦理（會務輔導辦法第13條），一般章程範例是由理事長指定常務理事一人代理，未指定時由常務理事互推。\n\n常務監事的角色是監事會召集人，負責召集監事會議、主持監察事務，不是理事長的副手。',statutes:[P(18),P(31),E(17),G(13)],notes:['若章程對代理程序沒有規定，請先修章或洽承辦人確認，不要由監事代理後再補程序。'],questionState:{focus:'supervisor-acting-chair',domain:'social'}};
}

// 2026-11-10 第二批用戶實測
function chairAbandonsOffice(t){
 if(!/(理事長|會長)/.test(t))return null;
 if(!/(跑了|跑掉|落跑|失聯|不見|聯絡不上|找不到|丟下|丟了|不理|不管|不開會|不召開|不肯開|拒絕召開|不處理|擺爛)/.test(t))return null;
 if(/合作社|社員/.test(t))return null;
 const quit=/(辭職|辭呈|辭職書|請辭|不做了|不幹了)/.test(t);
 return{category:'人民團體會務說明',title:'理事長不召開會議、丟下辭職書失聯：理事可連署自行召開，主管機關可指定召集或解職',summary:(quit?'先釐清一件事：辭職書「丟下」不等於已解任。理事長辭職要經理事會決議通過才解任（人民團體法第23條第2款；選舉罷免辦法第27條）。理事會還沒開會通過前，他在法律上仍是理事長，但這不表示會務只能卡住。\n\n':'')+'會務不必等他，有三條路：\n\n1. **理事過半數書面連署召開臨時理事會**（會務輔導辦法第13條）：連署書以雙掛號寄給理事長並取得回執，副本報縣府備查。理事長收到後15日內未召開，依章程所定代理程序由代理人（通常是常務理事互推）召集，期限內開完。\n\n2. **請主管機關指定理事召集**（人民團體法第32條）：理事會不能依法召開時，得由縣府指定理事一人召集。附上連署書、掛號回執、聯絡不上的紀錄，向社會處申請。\n\n3. **主管機關解除理事長職務**（人民團體法第30條）：理事長無正當理由不召開理事會超過二個會次，應由主管機關解除其職務，另行改選。\n\n會議開成後：決議准辭（或依第30條由縣府解職）→ 候補理事遞補 → 理事長出缺自出缺日起一個月內補選，所遺任期不足六個月得由常務理事互推代理（選舉罷免辦法第17條）→ 函報縣府備查。\n\n若連理事會都湊不齊人、會務全面停擺，主管機關得依人民團體法第58條限期整理，由有意願的理監事組成整理小組（會務輔導辦法第21條）。',statutes:[P(23),E(27),G(13),P(32),P(30),E(17),P(58),G(21)],notes:['立案證書、圖記、帳冊若被帶走，連署召開的理事會可決議函請主管機關協處；整理小組階段得報請註銷重發立案證書（會務輔導辦法第22條）。','建議先打電話給社會處承辦說明狀況，承辦會告訴你連署書該怎麼寫。'],questionState:{focus:'chair-abandons',domain:'social'}};
}
function chairOtherGroupPosition(t){
 if(!/(理事長|理事|監事|會長|幹部|總幹事)/.test(t))return null;
 // 同一團體內理事↔監事互兼，交給 supervisorAsDirector
 if(/監事/.test(t)&&/理事/.test(t)&&!/(其他|別的|另一個|另外|兩個|二個|多個|其它|他會|別會)/.test(t))return null;
 if(!/(其他|別的|另一個|另外|兩個|二個|多個|其它|他會|別會)(協會|團體|學會|公會|工會|合作社|幹部|理事|監事|理事長|職務|職位|的|會)/.test(t))return null;
 if(!/(可以|可不可以|能不能|能否|行不行|可否|嗎|會不會)/.test(t))return null;
 if(/合作社/.test(t))return{category:'合作社會務',title:'合作社理監事不得兼任同業同級合作社或競爭事業的職務',summary:'有限制。合作社法第40條：理事、監事不得兼任其他業務性質相同之同級合作社之理事、監事，也不得兼任與合作社有競爭關係之團體或事業的職務；監事另不得兼任本社理事、事務員或技術員。業務性質不同、無競爭關係的團體（例如同時擔任某協會理事）法律未禁止。',statutes:[C(40)],questionState:{focus:'coop-other-position',domain:'coop'}};
 return{category:'人民團體會務說明',title:'協會理事長可以同時擔任其他團體的理監事或幹部：人民團體法未禁止',summary:'可以。人民團體法對理事、監事、理事長沒有「不得兼任其他團體職務」的規定；一個人同時是 A 協會理事長、B 協會理事，在法律上是允許的，實務上也很常見。\n\n要注意的三件事：\n1. **章程**：各團體章程可以自訂限制（人民團體法第12條第9款，章程應載明理監事之選任與解任）。先看兩邊章程有沒有寫。\n2. **同一團體內不能兼**：同一協會裡理事與監事不能一人兼任（選舉罷免辦法第16條），理監事也不能兼任該會的總幹事等工作人員。\n3. **利益迴避**：兩個團體之間有補助、採購、合作案時，應在理事會揭露並迴避表決，避免被認定違反章程或妨害公益（人民團體法第58條）。\n\n公會等職業團體、合作社另有個別限制（合作社法第40條禁止兼任同業同級合作社理監事）。',statutes:[P(12),E(16),P(58)],notes:['若兩個團體都受縣府補助，各自的經費要分開管理，不能互相流用。'],questionState:{focus:'other-group-position',domain:'social'}};
}

// ===== P2 補充（2026-11-10）：每條數字均出自 data/statutes.json.gz 原文；法無明文者不寫 =====
const NUMQ=/(幾|多少|幾天|幾日|幾個月|幾年|多久|多長|多大|多高|比例|門檻|幾人|幾個人)/;
function p2MembershipFee(t){
 if(!/(會費|入會費|常年會費|年費)/.test(t)||/合作社|社員|股金/.test(t))return null;
 if(!/(什麼時候|何時|期限|幾月|怎麼繳|怎麼收|遲繳|沒繳|不繳|欠|減免|分期|退費|退|可以不|多少|訂|規定|標準)/.test(t))return null;
 return{category:'人民團體財務',title:'會費怎麼訂、何時繳、不繳怎麼辦：以章程與會員大會決議為準',summary:'法規只定「程序」，不定金額與日期：\n\n1. **標準與繳納方式要寫進章程**（社會團體財務處理辦法第14條），且入會費、常年會費的數額與繳納方式須提經會員大會通過、報縣府核備後才能收（人民團體法第33條）。理事會不能自行調漲。\n2. **何時繳**：看章程。常見寫法是入會時繳入會費、每年年初或大會前繳常年會費；章程沒寫的，依大會決議。\n3. **沒繳會費**：法規未規定自動停權或除名；效果依章程「會員之權利與義務」與「出會與除名」條款（人民團體法第12條第7、8款）。章程若規定欠費停權，理事會應先催繳並留存紀錄，再依章程處理；除名須經會員大會出席三分之二以上同意（人民團體法第27條）。\n4. **退費**：須由理事會訂退費原則，經會員大會通過後才能退（財務處理辦法第14條）。\n5. **減免、分期**：法規未禁止，但同樣要經會員大會通過並報核備，不能個案私下減免。',statutes:[F(14),P(33),P(12),P(27)],notes:['改會費等於修章程或改大會決議，改完 30 日內要報縣府核備（人民團體法第54條）。'],questionState:{focus:'membership-fee',domain:'social'}};
}
function p2BoardNotice(t){
 if(!/(理事會|監事會|理監事|聯席會)/.test(t)||/會員大會|代表大會|成立大會/.test(t))return null;
 if(!/(通知|幾天前|幾日前|多久前|提前|開會前|議程|通知單|開會通知)/.test(t))return null;
 return{category:'人民團體會務說明',title:'理事會、監事會開會通知：7 日前，載明種類、時間、地點、議程',summary:'• **期限**：應於開會 7 日前通知各應出席人員；因緊急事故召集臨時會議，於開會前 1 日送達通知者例外（會務輔導辦法第11條第1項）。\n• **內容**：會議種類、時間、地點及議程四項是法定必載事項（同條）。\n• **誰發**：理事會議由理事長召集，監事會議由監事會召集人（常務監事）召集；理監事聯席會議須分別經兩人同意後召集，通知期限同樣 7 日（同條第2、3項）。\n• **會員大會不同**：會員（會員代表）大會是 15 日前通知，且應報請縣府派員列席（人民團體法第26條；會務輔導辦法第10條）。\n• **改選後第一次理監事會**：應於大會閉會第 7 日起至 15 日內召開（選舉罷免辦法第12條）。\n\n通知方式法未限定，書面、電子郵件、通訊軟體皆可，但要留得下送達紀錄。',statutes:[G(11),P(26),G(10),E(12)],questionState:{focus:'board-notice',domain:'social'}};
}
function p2RecordRetention(t){
 if(!/(會議紀錄|會議記錄|紀錄|記錄|帳簿|帳冊|憑證|傳票|簽到)/.test(t))return null;
 if(!/(保存|保留|留|放多久|多久|幾年|銷毀|丟掉|可以丟|查閱|調閱|看|申請看)/.test(t))return null;
 if(/選票|選舉票|罷免票/.test(t))return null;
 return{category:'人民團體會務說明',title:'會議紀錄與帳冊保存：帳冊至少 10 年；會議紀錄自行留存供會員查閱',summary:'**會議紀錄**（會務輔導辦法第12條）\n• 會員大會、理事會、監事會、理監事聯席會議紀錄，應載明開會日期、出缺席狀況、會議決議，閉會後由團體自行留存，**提供會員查閱**。\n• 會員大會紀錄另須於閉會後 30 日內報縣府備查。\n• 法規未訂會議紀錄保存年限；實務上與帳冊一併至少保存 10 年，涉及章程、立案、財產的紀錄建議永久保存。\n\n**會計帳簿、憑證、報表**（社會團體財務處理辦法第21條）\n• 年度決算辦理終了後**至少保存 10 年**；應永久保存或未結會計事項者不在此限。\n• 屆滿年限要銷毀，須經**監事會點驗**；要延長年限，須經理事會及監事會（或理監事聯席會議）通過。\n\n**會員查閱**：會議紀錄依法應提供會員查閱，團體不得拒絕；帳冊的查核權在監事會（財務處理辦法第22條），一般會員要看帳可請監事會查核或於會員大會提案。',statutes:[G(12),F(21),F(22)],questionState:{focus:'record-retention',domain:'social'}};
}
function p2CharterAmend(t){
 if(!/(章程)/.test(t)||!/(修改|修正|變更|修章|改章程|更改)/.test(t))return null;
 if(!/(門檻|比例|幾分之|三分之二|過半|多少人|幾人同意|怎麼算|怎麼修|流程|程序|怎麼辦|要報|備查|核備|生效)/.test(t))return null;
 if(/合作社|社員/.test(t))return null;
 return{category:'人民團體會務說明',title:'修改章程：出席會員三分之二以上同意，30 日內報縣府核備',summary:'**兩道門檻都要過**（人民團體法第27條）\n1. 成會：會員（會員代表）**過半數出席**。出席人數以簽到或報到人數計算（會務輔導辦法第16條）；社會團體會員可書面委託他人代理，每人以代理一人為限（人民團體法第42條）。\n2. 決議：**出席人數三分之二以上同意**。分母是「出席人數」，不是會員總數，也不是投票數。\n\n**算法例**：會員 100 人、出席 60 人（含委託），過半成會 ✓；同意需 ≥ 60×2/3 = 40 人。若只有 39 人同意，不通過。\n\n**程序**\n• 修章屬會員大會職權，應列入大會議程並於 15 日前通知（人民團體法第26條）；章程本身也應載明「章程修改之程序」（第12條第12款），若章程訂得更嚴（例如需全體會員三分之二），從其規定。\n• 通過後 **30 日內**檢附大會紀錄、修正條文對照表，報縣府核備（人民團體法第54條）；核備前對外仍以原章程為準。',statutes:[P(27),G(16),P(42),P(26),P(12),P(54)],notes:['理事會、監事會都無權修改章程，只能提案。'],questionState:{focus:'charter-amend',domain:'social'}};
}
function p2SupervisorAudit(t){
 if(!/(監事|監察)/.test(t)||/兼任|代理|經費.{0,4}(動用|用)|擅自/.test(t))return null;
 if(!/(查帳|查核|查誰|查什麼|可以查|審核|審查|監察|看帳|調帳|帳簿|憑證|權限|職權|怎麼查|發現.{0,4}問題|不當)/.test(t))return null;
 if(/合作社|社員/.test(t))return null;
 return{category:'人民團體會務說明',title:'監事會查核：對象、時機、發現問題怎麼辦',summary:'**查什麼**\n• 團體的財務查核由監事會為之（社會團體財務處理辦法第22條）：會計帳簿、憑證、報表、財產登記簿都在範圍內。\n• 理事會每次會議應提出經費收支及工作執行情形，並送監事會監察（會務輔導辦法第17條）。\n• 年度決算報告應先送監事會審核，審核結果一併提報會員大會（人民團體法第34條）。\n• 屆滿保存年限的財務檔案，須經監事會點驗才能銷毀（財務處理辦法第21條）。\n\n**何時查**：定期監事會議時執行定期查核，必要時得召開臨時監事會議臨時查核（財務處理辦法第22條）。監事會每 6 個月至少開會一次（社會團體，人民團體法第43條）。\n\n**查到問題**：提出糾正意見送理事會處理；理事會不處理，監事會得提報會員大會審議（會務輔導辦法第17條）；監事會也可函請理事長召開臨時會員大會（人民團體法第25條）。縣府亦得視需要抽查財務（財務處理辦法第22條）。\n\n**界線**：監事查核但不執行，不能自行動支經費或對外代表團體。',statutes:[F(22),G(17),P(34),F(21),P(43),P(25)],questionState:{focus:'supervisor-audit',domain:'social'}};
}
function p2CoopShares(t){
 if(!/(合作社|社員)/.test(t)||!/(股金|股|資本|出資)/.test(t))return null;
 if(!/(多少|幾|最低|最少|最多|上限|下限|怎麼算|怎麼繳|退股|退還|減資|增資|認購)/.test(t))return null;
 return{category:'合作社會務',title:'合作社股金：每股 6～150 元，每人至少 1 股、至多股金總額 20%',summary:'合作社法沒有「最低資本額」，只規範股的單位與比例：\n\n• **每股金額**：至少新臺幣 6 元、至多 150 元，同一社內必須一律（合作社法第16條）；聯合社每股不得超過 150 元（第68-1條）。\n• **每人認股**：至少 1 股，至多不得超過股金總額 20%；第一次繳款不得少於所認股款四分之一（第17條）。\n• **欠繳股款**：合作社得以其應得股息及結餘撥充（第19條）；未繳股款不得與債權抵銷（第18條）。\n• **股息**：年息不得超過 10%，無結餘不得發息（第22條）。\n• **減少每股金額**：須經社員大會決議，並通知或公告債權人、指定一個月以上期限供異議（第21條）。\n• **退股**：出社社員得依章程請求退還股金之一部或全部，股金依營業年度終了時財產計算，章程另有規定從其規定（第30條）。\n• **章程必載**：社股金額及其繳納或退還之規定（第9-1條第6款）。\n\n股金總額屬可變動數，隨入社、退社增減，不須像公司一樣辦增減資登記；但章程所定每股金額變動要修章並報主管機關。',statutes:[C(16),C(17),C(19),C(22),C(21),C(30),C(9)],notes:['合作社稅務（股息所得、結餘課稅）請洽財政部南區國稅局 0800-000-321。'],questionState:{focus:'coop-shares',domain:'coop'}};
}
function p2FoundingMeeting(t){
 if(!/(成立大會|籌備|發起人|發起)/.test(t)||/合作社|社員|創立會/.test(t))return null;
 if(!/(幾人|多少人|人數|出席|到場|簽到|代簽|委託|不足|不夠|沒到|改期|延期|怎麼辦|流程|要做什麼)/.test(t))return null;
 return{category:'業務辦理',title:'成立大會：發起人 30 人以上、過半出席成會、簽到計人數、30 日內報立案',summary:'**人數**\n• 申請籌組時發起人須成年且 **30 人以上**（人民團體法第8條）。\n• 成立大會屬會員大會性質，應有應出席人員**過半數出席**才能成會（會務輔導辦法第16條）；出席人數以**簽到或報到**人數計算，不能代簽。\n• 社會團體會員不能親自出席時，得以**書面委託**其他會員代理，每人以代理一人為限（人民團體法第42條）；委託書要在簽到時交付。\n\n**不足怎麼辦**\n• 出席人員提出清查人數動議，經表決通過即清點；不足法定人數，主席應即宣布散會（會務輔導辦法第16條），擇期重開，不能「等人到再開」後補簽。\n• 改期後重新通知，並通知縣府派員列席（人民團體法第9條）。\n\n**流程**（人民團體法第9、10條）\n許可籌組 → 發起人會議推選籌備委員 → 籌備會（審查會員、擬章程草案、提理監事候選名單）→ 成立大會（通過章程、選理監事）→ 大會後 **30 日內**檢具章程、會員名冊、選任職員簡歷冊報縣府核准立案。籌備會會議及成立大會均應通知縣府，縣府得派員列席。',statutes:[P(8),G(16),P(42),P(9),P(10)],notes:['成立大會通過章程與選舉理監事，章程訂定需出席人數三分之二以上同意（人民團體法第27條）。'],questionState:{focus:'founding-meeting',domain:'social'}};
}
function p2ElectionPrep(t){
 if(!/(改選|換屆|屆滿|任期.{0,3}(到|滿|結束))/.test(t)||/合作社|社員/.test(t))return null;
 if(!/(前|準備|什麼時候|何時|時程|多久|幾個月|流程|要做什麼|該做|怎麼安排|延|來不及|逾期)/.test(t))return null;
 if(/選票|無效|候補|遞補|連任/.test(t))return null;
 return{category:'人民團體會務說明',title:'改選時程：任期屆滿前 1 個月內辦理，最多可申請延 3 個月',summary:'**法定時點**（人民團體選舉罷免辦法第21條）\n• 理監事應於**任期屆滿前一個月內**辦理改選；確有困難得申請縣府核准延長，**不得超過三個月**。天災等不可抗力時縣府得公告暫緩。\n\n**往前推的工作**\n• 大會 **15 日前**：理事會審定出席會員資格、造具名冊供閱覽，並將會議種類、時間、地點、議程通知會員（會務輔導辦法第10條；人民團體法第26條），同時報請縣府派員列席。\n• 採**通訊選舉**者（章程須有訂）：開票日 **45 日前**理事會審定名冊，**30 日前**印製寄送選票；選舉辦法須經理事會通過並報備（選舉罷免辦法第23條）。\n• 理事會另應依章程決定選舉方式、候選人提名方式；法規未強制設「改選委員會」，由理事會決議推選選務人員即可。\n\n**改選後**\n• 大會閉會第 7 日起至 15 日內召開新任理事會、監事會選出理事長、常務監事（選舉罷免辦法第12條）。\n• 卸任理事長應將立案證書、圖記、檔案、財務、人事資料造具清冊，於新任理事長就任後移交，**15 日內**由新任理事長會同監交人接收完畢；逾期得報請縣府註銷重發立案證書（會務輔導辦法第18條）。\n• 選票包封保管至下屆改選完畢（選舉罷免辦法第26條）。',statutes:[E(21),G(10),P(26),E(23),E(12),G(18),E(26)],notes:['建議任期屆滿前 3 個月開始排程：確認會員名冊 → 理事會決議選舉方式 → 發通知 → 大會。'],questionState:{focus:'election-prep',domain:'social'}};
}
function p2MinutesContent(t){
 if(!/(會議紀錄|會議記錄|紀錄|記錄)/.test(t))return null;
 if(!/(要寫|寫什麼|記什麼|載明|內容|格式|怎麼寫|包含|哪些|簽名|蓋章|用印|誰簽|報備|備查|幾天內|多久內)/.test(t))return null;
 if(/保存|保留|銷毀|多久.{0,2}(要)?留/.test(t))return null;
 return{category:'人民團體會務說明',title:'會議紀錄必載三項：開會日期、出缺席狀況、會議決議；大會紀錄 30 日內報備',summary:'**法定必載事項**（會務輔導辦法第12條）\n1. 開會日期\n2. 出缺席狀況（應出席人數、實際出席、請假、缺席、委託；理監事連續二次無故缺席視同辭職，人民團體法第31條，所以缺席紀錄要留）\n3. 會議決議（含表決結果）\n\n**實務上應一併記載**（縣府審查時會看）\n• 會議名稱、屆次、時間、地點、主席、紀錄人\n• 列席人員（含縣府或公所列席者）\n• 各議案：案由、說明、決議；選舉案另記得票數、當選名單、候補名單\n• 主席與紀錄簽章；會員大會紀錄一般由理事長（主席）署名並加蓋團體圖記後報備\n\n**報備**\n• 會員（會員代表）大會紀錄：閉會後 **30 日內**報縣府備查。\n• 理事會、監事會、聯席會紀錄：自行留存供會員查閱；其中依法須報核辦的決議事項（如章程修改、理監事異動、不動產處分）檢附文件依法辦理（會務輔導辦法第12條；人民團體法第54條）。',statutes:[G(12),P(31),P(54)],notes:['紀錄寫「出席過半數」而沒有數字，縣府會退回補正。'],questionState:{focus:'minutes-content',domain:'social'}};
}
function p2DelegateSystem(t){
 if(!/(代表制|會員代表|代表大會)/.test(t))return null;
 if(!/(什麼時候|何時|幾人|多少人|超過|才能|可以|要不要|該不該|怎麼算|比例|分配|改回|改成|採用|改採)/.test(t))return null;
 if(/資格|誰可以當|條件/.test(t))return null;
 return{category:'人民團體會務說明',title:'會員代表制：會員超過 300 人「得」分區選代表，非強制；劃分與名額報縣府核備',summary:'**門檻**（人民團體法第28條）\n• 會員（會員代表）人數**超過三百人**者，**得**劃分地區，依各區會員人數比例選出代表，合開代表大會行使會員大會職權。\n• 是「得」不是「應」：300 人以上可以繼續開全體會員大會；未滿 300 人則不得採分區代表制。\n\n**名額怎麼算**\n• 法規只要求「依會員人數比例」，具體比例（例如每 10 人選 1 名）由章程訂定（人民團體法第12條第9款：章程應載明會員代表之名額、職權、任期及選任與解任）。\n• 地區劃分與各區應選名額之分配，應**報縣府核備**（第28條第2項）。\n• 會員代表權利之行使與會員同，每一代表一權（第13、16條）。\n\n**改採或改回**\n• 兩個方向都是修改章程：須會員（會員代表）大會出席三分之二以上同意（第27條），30 日內報核備（第54條）。從代表制改回全體制時，由現任代表大會決議。',statutes:[P(28),P(12),P(13),P(16),P(27),P(54)],notes:['另一種會員代表是「會員單位推派」或「下級團體選派」（第13條），常見於聯合會與公會，與分區代表不同。'],questionState:{focus:'delegate-system',domain:'social'}};
}

function verifiedRoundAnswer(q,ctx){
 const t=norm(q);
 return coopVsAssocAccountingForms(t)||coopBalanceSheetReport(t)||delegateQuotaCalculation(t)||delegateConcurrentRole(t)||onlineVoting(t)||mailVoting(t)||assemblyVotingMethod(t)||boardVotingMethodDetail(t)||delegateElectionProcess(t)||delegateAssemblyRules(t)||coopMemberRemoval(t)||coopAdvertisingTaxability(t)||coopLoanToMemberTax(t)||coopBankLoanProcedure(t)||coopBankLoan(t)||branchAccountingPractice(t)||memberDelegateElection(t)||branchOrgSetup(t)||delegateProposalProcess(t)||annualMeetingVsAssembly(t)||vacancyQuorum(t)||supervisorConvenerNoMeeting(t)||supervisorMinimumMembers(t)||supervisorChairmanElection(t)||supervisorAuditPowers(t)||branchOrgAccounting(t)||p2MembershipFee(t)||p2BoardNotice(t)||p2RecordRetention(t)||p2CharterAmend(t)||p2SupervisorAudit(t)||p2CoopShares(t)||p2FoundingMeeting(t)||p2ElectionPrep(t)||p2MinutesContent(t)||p2DelegateSystem(t)||chairAbandonsOffice(t)||chairOtherGroupPosition(t)||chairSpendWithoutBoard(t)||supervisorSpend(t)||supervisorActingChair(t)||candidateSeatCount(t)||ballotRetention(t)||officerResignation(t)||invalidBallotReason(t)||delegateQualification(t)||substitutionOrder(t)||byElectionThreshold(t)||coopChairReelection(t)||chairmanReelectionLimit(t)||chairmanAbsence(t)||recordRetentionPeriod(t)||advertisingIncome(t)||staffBankAccountSetup(t)||meetingSigninDuration(t)||meetingVotingMethod(t)||preElectionBoardMeeting(t)||electionEffectiveDate(t)||politicalDonation(t)||communityReportingRequirements(t)||communityYearlyPlanDeadline(t)||communityVsAssociationDifferences(t)||supervisorAsDirector(t)||newChairTodo(t)||postElectionAccountingDeadline(t)||electionReportDeadline(t)||checkSignature(t)||feePeriods(t)||feeDeferral(t)||threeMonthsWording(t)||electionCandidates(t)||electionObjection(t)||minutesDeadline(t)||coopBoardQuorum(t)||coopTax(t)||communityRename(t)||communityReportTownship(t)||addressCertificate(t)||bankChairChange(t)||eventFee(t)||communityChairTerm(t)||invalidBallot(t)||feeAmount(t)||personalAccount(t)||delegateAssembly(t)||noSupervisor(t)||foundingDocs(t)||investStocks(t)||membershipRefused(t)||coopCapital(t)||receiveDonation(t)||hireEmployee(t)||lendToChair(t)||branchOrg(t)||supervisorMeeting(t)||noAnnualMeeting(t)||chairSpendingAuth(t)||communityVsGeneral(t)||coopDissolutionProperty(t)||charterAmendment(t)||coopSupervisorAudit(t)||publicSolicitation(t)||decisionRevoked(t)||chairResign(t)||memberExpulsion(t)||sealChange(t)||noHandover(t)||communityDissolutionProperty(t)||boardFinanceAgenda(t)||boardQuorumGeneral(t)||delegated(t)||chairNoMeeting(t)||feeAnswer(t)||coopAssemblyQuorum(t)||proxyCount(t)||concurrent(t)||financeQuestioned(t)||financeDeadline(t)||meetingFrequency(t)||videoMeeting(t)||coopMinimum(t)||financeForms(t)||formsDownload(t,ctx&&ctx.catalog)||dissolutionHowTo(t)||null;
}
const api={normalizeQuestion,withContext,verifiedRoundAnswer};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
Object.assign(root,api);
})(typeof window!=='undefined'?window:globalThis);
