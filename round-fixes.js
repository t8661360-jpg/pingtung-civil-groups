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
  return{category:'人民團體會務說明',title:'協會監事兼任理事：本站目前無法確認法源',summary:'本站收錄的人民團體法規中，沒有找到一般協會「監事兼任理事」的明文條文，所以無法直接回答可不可以。\n理事會與監事會是分別選出、分別開會的機關，監事會負責財務查核（社會團體財務處理辦法第22條）；實務上是否允許同時擔任，請洽縣府承辦人確認，並核對貴會章程。',statutes:[F(22)],questionState:{focus:'concurrent',domain:'social'},notes:['合作社有明文：監事不得兼任理事（合作社法第40條）。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
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
 if(/(少了|走了|辭職了?|出缺了?|缺了)\s*(\d+|[一二兩三四五六七八九十]+)\s*(人|位|名)/.test(t)&&M<N&&!/(剩|現有|只有|目前|在任)/.test(t))M=N-M;
 if(!(M>0&&M<=N))return null;
 const body=/監事/.test(t)&&!/理事/.test(t)?'監事':'理事';
 const coop=/合作社/.test(t),pro=/公會|職業團體/.test(t);
 const q=Math.floor(M/2)+1,qN=Math.floor(N/2)+1,two=Math.ceil(N*2/3);
 const law=coop?[C(body==='理事'?53:45)]:pro?[{title:'商業團體法第32條',source:LAW+'D0050100'}]:[P(29),G(16),E(17)];
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
 const Y=new Date().getFullYear();
 const prev=Y-1, cur=Y;
 let title,summary,notes=[];
 if(m>=1&&m<=3){
  title=`${m} 月理監事會：審議 ${prev} 年度決算與 ${cur} 年度工作計畫`;
  summary=`${m} 月份召開的理監事會，主要審議兩大項：\n`+
   `一、${prev} 年度決算：收支決算表、資產負債表、財產目錄、基金收支表（社會團體財務處理辦法第11、12條，年度終了後三個月內由理事會編造）。審議後送監事會審核，再提會員大會通過。\n`+
   `二、${cur} 年度工作計畫與收支預算表（如尚未提報）。\n`+
   `如果來不及在 ${m} 月開會員大會，可先經理監事聯席會議通過，事後提報大會追認（財務處理辦法第11條）。`;
  notes=['決算報告應先送監事會審核，再提報會員大會（人民團體法第34條）。'];
 }else if(m>=4&&m<=6){
  title=`${m} 月理監事會：確認上年度決算是否已報送、檢視半年度收支`;
  summary=`${m} 月份的理監事會，財務方面通常處理：\n`+
   `一、確認 ${prev} 年度決算是否已經會員大會通過並報送縣府備查。如果上年度決算還沒完成，應儘速處理。\n`+
   `二、報告今年上半年度經費收支執行情形，檢視預算執行是否正常。\n`+
   `三、如有不動產買賣、基金動支等提案，視情形審議。`;
  notes=['上年度決算金額達新臺幣 1,500 萬元以上者，得委請會計師簽證（財務處理辦法第11條）。'];
 }else if(m>=7&&m<=9){
  title=`${m} 月理監事會：審議半年度收支報告、籌劃下年度工作計畫`;
  summary=`${m} 月份的理監事會，財務方面通常處理：\n`+
   `一、報告上半年度（1 至 6 月）經費收支執行情形，對照預算檢討差異。\n`+
   `二、開始籌劃 ${cur+1} 年度工作計畫與收支預算表的編列方向（依財務處理辦法第11條，年度開始前應由理事會編造，提經會員大會通過）。\n`+
   `三、如有基金提列或動支、不動產處理、設備採購等提案，視情形審議。`;
  notes=['屆滿改選的年度，要同時籌備改選事宜，改選大會通常一併審議財務報表。'];
 }else{
  title=`${m} 月理監事會：審議 ${cur+1} 年度工作計畫與收支預算表`;
  summary=`${m} 月份的理監事會，財務方面主要審議：\n`+
   `一、${cur+1} 年度工作計畫與收支預算表（依財務處理辦法第11條，年度開始前應由理事會編造；預算表依收支平衡原則編列，本期餘絀歸零，上年度結餘不列入收入）。\n`+
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
function delegated(t){
 const g=typeof root!=='undefined'?root:{};
 if(/社區/.test(t)&&/(年度計畫|工作計畫|計畫)/.test(t)&&/(什麼時候|何時|幾月|要送|多久|截止)/.test(t)&&!/成立|籌組/.test(t)&&typeof g.communityAnnualPlanAnswer==='function')return g.communityAnnualPlanAnswer((/社區發展協會/.test(t)?t:t.replace(/社區協會|社區/,'社區發展協會'))+(/年度計畫|工作計畫/.test(t)?'':'年度計畫')+'期限');
 if(/合作社/.test(t)&&/(盈餘|結餘)/.test(t)&&/(怎麼分|如何分|怎樣分|分多少|要分)/.test(t)&&typeof g.coopSurplusDistributionAnswer==='function')return g.coopSurplusDistributionAnswer(t.replace(/怎麼分|如何分|怎樣分|分多少|要分/,'怎麼分配'));
 return null;
}
function verifiedRoundAnswer(q,ctx){
 const t=norm(q);
 return charterAmendment(t)||coopSupervisorAudit(t)||publicSolicitation(t)||decisionRevoked(t)||chairResign(t)||memberExpulsion(t)||sealChange(t)||noHandover(t)||communityDissolutionProperty(t)||boardFinanceAgenda(t)||vacancyQuorum(t)||boardQuorumGeneral(t)||delegated(t)||chairNoMeeting(t)||feeAnswer(t)||coopAssemblyQuorum(t)||proxyCount(t)||concurrent(t)||financeQuestioned(t)||financeDeadline(t)||meetingFrequency(t)||videoMeeting(t)||coopMinimum(t)||financeForms(t)||formsDownload(t,ctx&&ctx.catalog)||dissolutionHowTo(t)||null;
}
const api={normalizeQuestion,withContext,verifiedRoundAnswer};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
Object.assign(root,api);
})(typeof window!=='undefined'?window:globalThis);
