/* 逐輪校正的規則式回答（非模型訓練）。每則均附可核對來源；無法確認者明示並引導洽承辦。 */
(function(root){
'use strict';
const LAW='https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=';
const P=n=>({title:'人民團體法第'+n+'條',source:LAW+'D0050091'});
const C=n=>({title:'合作社法第'+n+'條',source:LAW+'D0050112'});
const FIN={title:'屏東縣政府社會處「6項財務報表」Excel範本（填寫說明及表內檢核公式）',source:'本站書表下載｜常年會'};
const norm=s=>String(s||'').normalize('NFKC').replace(/\s+/g,'');
function normalizeQuestion(q){
 return String(q||'').replace(/團題|團休|團提/g,'團體').replace(/理監是會/g,'理監事會').replace(/理監是/g,'理監事').replace(/理是會/g,'理事會').replace(/監是會/g,'監事會').replace(/文鍵|文見/g,'文件').replace(/改舉/g,'改選')
  /* 口語同義詞：社團＝協會、會長＝理事長（社團法人、家長會長、分會長等除外） */
  .replace(/(要|該|應該)?(怎麼|如何|怎樣)(辦理|處理|進行)(?!登記|變更|補助)/g,'怎麼辦').replace(/怎麼弄|怎麼搞|要怎麼用/g,'怎麼辦').replace(/副會長|副理長/g,'副理事長').replace(/(跟|向|找)(銀行|農會|信合社)借(錢|款)?/g,'向銀行貸款').replace(/(想|要|打算)組(一個|個)?(協會|社團|團體)/g,'$1成立$3').replace(/一任(幾|多少|多久)/g,'任期$1').replace(/(理事長|會長|理事|監事)不想做了/g,'$1要辭職').replace(/怎麼辭(?!職|任)/g,'怎麼辭職').replace(/申請經費/g,'申請補助').replace(/社團(?!法人)/g,'協會').replace(/(^|[^家副分總班隊])會長/g,'$1理事長');
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
 if(!/(下載|在哪|哪裡|哪邊|去哪|有沒有|給我|拿|找)/.test(t)&&!/(範本|範例|樣本|格式|空白表)/.test(t))return null;
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
const TX=n=>({title:'教育文化公益慈善機關或團體免納所得稅適用標準第'+n+'條',source:LAW+'G0340012'});
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
 return{category:'人民團體會務說明',title:'理事長請辭：書面提出，經理事會決議後解任',summary:'理事長辭職要用書面提出，經理事會決議准予辭職，並在下一次會員大會提出報告（人民團體選舉罷免辦法第27條）。理事會的決議，要理事過半數出席、出席人數過半數同意（人民團體法第29條）。口頭說要辭職、或只丟下辭職書沒有經理事會決議，都還不算辭職生效。\n\n辭職准許之後：\n• 理事長出缺，要在出缺之日起一個月內補選；剩下的任期不到6個月的，可以依章程規定或由常務理事互推一人代理，沒有設常務理事的，由理事互推（同辦法第17條）。\n• 補選後30日內把異動報縣府核備。\n\n辦理流程：理事長遞出辭職書 → 召開理事會決議准辭 → 補選（或推人代理）理事長 → 報縣府核備 → 下次會員大會提出報告。',statutes:[E(27),E(17),P(29)],questionState:{focus:'chair-resign',domain:'social'},notes:['辭職後不得在原任期內再行當選同一職務（選罷辦法第27條）。','如果理事長拒不辭職又不開會，依其他途徑處理。'],actions:[{label:'看理事長補選',view:'meet',sub:'m-board'},{label:'聯絡承辦',view:'contact',sub:''}]};
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
 if(!/(不交接|不移交|沒移交|沒有移交|沒有交接|沒交接|還沒移交|拒絕移交|不肯交|不交|不還|不給|不肯移交|拒絕交|拒交|霸占|扣住)/.test(t)||!/(移交|交接|印章|圖記|證書|帳|存摺|資料|理事長|前任|卸任|舊任)/.test(t))return null;
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
 /* 勸募的細節（結束後報告、支出、薪水、剩餘、收據等）交給知識庫條目回答 */
 if(/(結束|之後|期滿|報告|支出|薪水|人事|付|用途|剩|餘款|收據|罰|違法|專戶|徵信|保存|變更|借)/.test(t))return null;
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
 return{direct:true,category:'人民團體會務說明',title:'社區發展協會和一般協會的差別：組織區域以村里為單位，由公所輔導',summary:'兩者都是依人民團體法立案的社會團體。社區發展協會的設立、組織、會員資格、工作人員和財務，一樣適用人民團體法（社區發展工作要點第17點）；理事長連任以一次為限、任期最長四年等規定也相同（人民團體法第20條）。\n\n主要的差別有三點：\n1. 多一份規定：社區發展協會另外適用衛生福利部的「社區發展工作要點」（114年7月1日起適用；原來的「社區發展工作綱要」已在同一天廢止）。\n2. 組織區域：以村里為單位，原則上不超出鄉（鎮、市、區）的行政區域範圍（要點第4點）；一般協會則可以是全縣性或鄉鎮市級。\n3. 公所的角色：鄉（鎮、市、區）公所也是社區發展的主管機關，負責輔導居民設立社區發展協會（要點第3點、第4點），所以會務和補助計畫通常會經過公所。',statutes:[CDP(17),CDP(4),CDP(3),P(20)],questionState:{focus:'community-vs-general',domain:'social'},notes:['社區發展協會的業務請洽所在地的鄉鎮市公所，或縣府社會處。'],actions:[{label:'看社區發展協會成立',view:'biz',sub:'community'},{label:'聯絡承辦',view:'contact',sub:''}]};
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
 return{category:'人民團體會務說明',title:'協會可以聘僱員工，要依勞基法辦理勞健保',summary:'可以。人民團體依章程聘僱工作人員辦理會務、業務（人民團體法第24條）。工作人員由理事長提名經理事會通過聘任，報主管機關備查（本縣章程範例第22條）。\n關於勞健保：\n1. 人民團體聘僱員工滿 5 人以上，就是勞工保險的強制投保單位，應為員工投保勞保。不到 5 人的也可以自願投保。\n2. 全民健保：有聘僱員工的，應以投保單位身分為員工加保。\n3. 勞工退休金：適用勞基法的人民團體，應依勞工退休金條例按月提繳退休金。\n投保地點：勞保局各地辦事處或線上申辦；健保到健保署各區業務組。',statutes:[P(24),{title:'本縣章程範例第22條',source:'本站書表下載｜申請表'}],questionState:{focus:'hire-employee',domain:'social'},notes:['理監事是無給職，不是員工（社會團體財務處理辦法第19條）。','工作人員不得由理監事擔任（社會團體工作人員管理辦法第4條）。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
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
 return{direct:true,category:'社區發展協會',title:'社區發展協會理事長：連任以一次為限',summary:'社區發展協會也是依人民團體法立案的社會團體，理事長的連任以一次為限，也就是最多連續做兩屆（人民團體法第20條）。\n理事、監事的任期依章程訂定，最長不超過四年；除法律另有規定或章程另有限制外，連選得連任。任期從召開本屆第一次理事會之日起計算（本縣章程範例第20條）。',statutes:[P(20),{title:'屏東縣社會團體章程草案範例第20條',source:'本站書表下載｜申請表'}],questionState:{focus:'chair-term',domain:'social'},notes:['已連任一次的理事長，下一屆不能再當選理事長，但仍可以當選理事。'],actions:[{label:'看改選流程',view:'meet',sub:'m-elect'}]};
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
 return{category:'社區發展協會',title:'社區發展協會要報公所的事項：本站未能確認完整清單',summary:'社區發展協會的會務、年度計畫和補助核銷，實務上常經鄉鎮市公所轉送縣府，但各公所要求的報送項目、格式和期限不一定相同；社區發展工作要點（114年7月1日起適用）沒有統一規定報送的項目，無法列出確定清單。\n可以確定的是，社區發展協會也是社會團體：會員大會紀錄應於閉會後30日內報主管機關備查（人民團體會務輔導辦法第12條），年度決算於年度終了後三個月內編造、經大會通過後報備查（社會團體財務處理辦法第11條）。其他公所要求的事項，請直接洽所在地公所社會（民政）課。',statutes:[G(12),F(11)],questionState:{focus:'community-township',domain:'social'},notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
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
 return{category:'人民團體會務說明',title:'新任理事長要辦的事：15 日內接收移交，大會紀錄 30 日內報備',summary:'有期限的事：\n1. 移交接收：就任後由新任理事長會同監交人（新任常務監事或監事互推一人），於 15 日內完成接收立案證書、圖記、檔案、財務、人事等；屆期未完成，可報縣府註銷原證書重新發給（人民團體會務輔導辦法第18條）。\n2. 改選大會紀錄：閉會後 30 日內報縣府備查（同辦法第12條），連同理事長當選證明書申請表及書表下載「改選」分類的附件。\n接著要辦的事：\n3. 到銀行辦理負責人與印鑑變更（社會團體財務處理辦法第17條）。\n4. 向國稅局更新負責人資料；有法人登記的，向法院辦理變更登記。\n5. 依章程提名總幹事、會計、出納，經理事會通過聘任（工作人員不得由理監事擔任，社會團體工作人員管理辦法第4條）。',statutes:[G(18),G(12),F(17)],questionState:{focus:'new-chair',domain:'social'},notes:['理事長連任以一次為限（人民團體法第20條）。'],actions:[{label:'下載改選書表',view:'forms',sub:'改選'},{label:'看移交流程',view:'meet',sub:'m-roster'}]};
}
function delegated(t){
 const g=typeof root!=='undefined'?root:{};
 if(/社區/.test(t)&&/(年度計畫|工作計畫|計畫)/.test(t)&&/(什麼時候|何時|幾月|要送|多久|截止)/.test(t)&&!/成立|籌組/.test(t)&&typeof g.communityAnnualPlanAnswer==='function')return g.communityAnnualPlanAnswer((/社區發展協會/.test(t)?t:t.replace(/社區協會|社區/,'社區發展協會'))+(/年度計畫|工作計畫/.test(t)?'':'年度計畫')+'期限');
 if(/合作社/.test(t)&&/(盈餘|結餘)/.test(t)&&/(怎麼分|如何分|怎樣分|分多少|要分)/.test(t)&&typeof g.coopSurplusDistributionAnswer==='function')return g.coopSurplusDistributionAnswer(t.replace(/怎麼分|如何分|怎樣分|分多少|要分/,'怎麼分配'));
 return null;
}

function supervisorAsDirector(t){
 if(/合作社/.test(t))return null;
 if(/開會|召開|自己開|會議|否決|推翻|決議|監事會|理事會/.test(t))return null;
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
 if(/^(協會|社團|我們協會|本會)?的?(會費|入會費|常年會費|年費)(要)?(怎麼辦|怎麼處理)[嗎呢？?]*$/.test(t))return null;
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
 if(/^(協會|社區發展協會|我們協會|本會)?的?監事(要)?(怎麼選|怎麼產生|如何產生|誰選)/.test(t))return null;
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
  return{title:'[本站無法確認] 社區協會年度計畫送件期限',summary:'社區發展協會年度計畫何時提報，取決於屏東縣政府社會處的要求，以及各鄉鎮市公所規定。\\n\\n常見參考（待確認）：\\n📅 上年度 11-12月 提報下年度計畫\\n📅 變更時 3月底前補報或修正\\n\\n建議洽詢：\\n📍 所在地鄉鎮市公所社會課\\n📍 屏東縣政府社會處 (08)7360316\\n*不同年份、單位可能有調整，建議提前1個月詢問*',statutes:[P(6)]};
 return null;
}

// 15-6 社區協會vs一般協會的差別：部分確認
function communityVsAssociationDifferences(t){
 if(/(社區|社區協會)/.test(t)&&/(差別|差異|不同|有什麼|與|vs|比較)/.test(t)&&/(協會|一般|團體)/.test(t)&&/(差別|差異|不同|不一樣|比較|vs)/.test(t))return communityVsGeneral(/社區發展協會|社區協會/.test(t)?t:t+'社區發展協會');
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
 return{category:'人民團體會務說明',title:'理事長不能繞過理事會自行動用經費或辦活動',summary:'不可以。理事長是執行者，不是決定者：\n\n1. 年度工作計畫與收支預算由理事會編造、會員（會員代表）大會通過並報縣府備查（社會團體財務處理辦法第11條）。經費與活動都應在通過的計畫、預算範圍內執行。\n2. 經費收支及工作執行情形「應於每次理事會議提出審議」，並送監事會監察（會務輔導辦法第17條）；計畫外、預算外的活動或支出，應先提理事會決議。\n3. 提用存款時，須由團體負責人、秘書長或總幹事及財務人員在領款憑證上共同蓋章（財務處理辦法第17條），理事長一個人動不了錢。\n4. 準備基金非經理事會通過不得動支（財務處理辦法第15條）；不動產買賣、設定權利更須會員大會通過（第13條）。\n5. 理事會、監事會應依大會決議及章程分別執行職務（人民團體法第18條）；理事長違反法令、章程或大會決議，得經會員大會罷免（第22條）。\n\n實務上，章程或理事會多會授權理事長在已通過的預算內核定日常支出，但那是「預算內執行」，不是不經理事會另起爐灶。',statutes:[F(11),G(17),F(17),F(15),P(18),P(22)],notes:['會員若發現此情形，可先請監事會依財務處理辦法第22條查核；監事會糾正意見理事會不處理時，得提報會員大會（會務輔導辦法第17條）。'],questionState:{focus:'chair-spending',domain:'social'}};
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
 if(/(會員大會|代表大會|大會)/.test(t)&&!/(理事會|理監事)/.test(t))return null; // 不開會員大會：輔導§15，另有規則
 if(!/(跑了|跑掉|落跑|失聯|不見|聯絡不上|找不到|丟下|丟了|不理|不管|不開會|不召開|不肯開|拒絕召開|不處理|擺爛)/.test(t))return null;
 if(/合作社|社員/.test(t))return null;
 const quit=/(辭職|辭呈|辭職書|請辭|不做了|不幹了)/.test(t);
 return{category:'人民團體會務說明',title:quit?'理事長不召開會議、丟下辭職書失聯：理事可連署自行召開，主管機關可指定召集或解職':'理事長一直不開會：理事可以連署召開，主管機關也可以指定召集或解除職務',summary:(quit?'先釐清一件事：辭職書「丟下」不等於已解任。理事長辭職要經理事會決議通過才解任（人民團體法第23條第2款；選舉罷免辦法第27條）。理事會還沒開會通過前，他在法律上仍是理事長，但這不表示會務只能卡住。\n\n':'')+'會務不必等他，有三條路：\n\n1. 理事過半數書面連署召開臨時理事會（會務輔導辦法第13條）：連署書以雙掛號寄給理事長並取得回執，副本報縣府備查。理事長收到後15日內未召開，依章程所定代理程序由代理人（通常是常務理事互推）召集，期限內開完。\n\n2. 請主管機關指定理事召集（人民團體法第32條）：理事會不能依法召開時，得由縣府指定理事一人召集。附上連署書、掛號回執、聯絡不上的紀錄，向社會處申請。\n\n3. 主管機關解除理事長職務（人民團體法第30條）：理事長無正當理由不召開理事會超過二個會次，應由主管機關解除其職務，另行改選。\n\n會議開成後：決議准辭（或依第30條由縣府解職）→ 候補理事遞補 → 理事長出缺自出缺日起一個月內補選，所遺任期不足六個月得由常務理事互推代理（選舉罷免辦法第17條）→ 函報縣府備查。\n\n若連理事會都湊不齊人、會務全面停擺，主管機關得依人民團體法第58條限期整理，由有意願的理監事組成整理小組（會務輔導辦法第21條）。',statutes:[P(23),E(27),G(13),P(32),P(30),E(17),P(58),G(21)],notes:['立案證書、圖記、帳冊若被帶走，連署召開的理事會可決議函請主管機關協處；整理小組階段得報請註銷重發立案證書（會務輔導辦法第22條）。','建議先打電話給社會處承辦說明狀況，承辦會告訴你連署書該怎麼寫。'],questionState:{focus:'chair-abandons',domain:'social'}};
}
function chairOtherGroupPosition(t){
 if(!/(理事長|理事|監事|會長|幹部|總幹事)/.test(t))return null;
 // 同一團體內理事↔監事互兼，交給 supervisorAsDirector
 if(/監事/.test(t)&&/理事/.test(t)&&!/(其他|別的|另一個|另外|兩個|二個|多個|其它|他會|別會)/.test(t))return null;
 if(!/(其他|別的|另一個|另外|兩個|二個|多個|其它|他會|別會)(協會|團體|學會|公會|工會|合作社|幹部|理事|監事|理事長|職務|職位|的|會)/.test(t))return null;
 if(!/(可以|可不可以|能不能|能否|行不行|可否|嗎|會不會)/.test(t))return null;
 if(/合作社/.test(t))return{category:'合作社會務',title:'合作社理監事不得兼任同業同級合作社或競爭事業的職務',summary:'有限制。合作社法第40條：理事、監事不得兼任其他業務性質相同之同級合作社之理事、監事，也不得兼任與合作社有競爭關係之團體或事業的職務；監事另不得兼任本社理事、事務員或技術員。業務性質不同、無競爭關係的團體（例如同時擔任某協會理事）法律未禁止。',statutes:[C(40)],questionState:{focus:'coop-other-position',domain:'coop'}};
 return{category:'人民團體會務說明',title:'協會理事長可以同時擔任其他團體的理監事或幹部：人民團體法未禁止',summary:'可以。人民團體法對理事、監事、理事長沒有「不得兼任其他團體職務」的規定；一個人同時是 A 協會理事長、B 協會理事，在法律上是允許的，實務上也很常見。\n\n要注意的三件事：\n1. 章程：各團體章程可以自訂限制（人民團體法第12條第9款，章程應載明理監事之選任與解任）。先看兩邊章程有沒有寫。\n2. 同一團體內不能兼：同一協會裡理事與監事不能一人兼任（選舉罷免辦法第16條），理監事也不能兼任該會的總幹事等工作人員。\n3. 利益迴避：兩個團體之間有補助、採購、合作案時，應在理事會揭露並迴避表決，避免被認定違反章程或妨害公益（人民團體法第58條）。\n\n公會等職業團體、合作社另有個別限制（合作社法第40條禁止兼任同業同級合作社理監事）。',statutes:[P(12),E(16),P(58)],notes:['若兩個團體都受縣府補助，各自的經費要分開管理，不能互相流用。'],questionState:{focus:'other-group-position',domain:'social'}};
}

// ===== P2 補充（2026-11-10）：每條數字均出自 data/statutes.json.gz 原文；法無明文者不寫 =====
const NUMQ=/(幾|多少|幾天|幾日|幾個月|幾年|多久|多長|多大|多高|比例|門檻|幾人|幾個人)/;
function p2MembershipFee(t){
 if(!/(會費|入會費|常年會費|年費)/.test(t)||/合作社|社員|股金/.test(t))return null;
 if(/(退會|退費|退還|出會)/.test(t))return null;
 if(!/(什麼時候|何時|期限|幾月|怎麼繳|怎麼收|遲繳|沒繳|不繳|欠|減免|分期|可以不|多少|訂|規定|標準|^(協會|社團|我們協會|本會)?的?(會費|入會費|常年會費|年費)(要)?(怎麼辦|怎麼處理))/.test(t))return null;
 return{category:'人民團體財務',title:'會費怎麼訂、何時繳、不繳怎麼辦：以章程與會員大會決議為準',summary:'法規只定「程序」，不定金額與日期：\n\n1. 標準與繳納方式要寫進章程（社會團體財務處理辦法第14條），且入會費、常年會費的數額與繳納方式須提經會員大會通過、報縣府核備後才能收（人民團體法第33條）。理事會不能自行調漲。\n2. 何時繳：看章程。常見寫法是入會時繳入會費、每年年初或大會前繳常年會費；章程沒寫的，依大會決議。\n3. 沒繳會費：法規未規定自動停權或除名；效果依章程「會員之權利與義務」與「出會與除名」條款（人民團體法第12條第7、8款）。章程若規定欠費停權，理事會應先催繳並留存紀錄，再依章程處理；除名須經會員大會出席三分之二以上同意（人民團體法第27條）。\n4. 退費：須由理事會訂退費原則，經會員大會通過後才能退（財務處理辦法第14條）。\n5. 減免、分期：法規未禁止，但同樣要經會員大會通過並報核備，不能個案私下減免。',statutes:[F(14),P(33),P(12),P(27)],notes:['改會費等於修章程或改大會決議，改完 30 日內要報縣府核備（人民團體法第54條）。'],questionState:{focus:'membership-fee',domain:'social'}};
}
function p2BoardNotice(t){
 if(!/(理事會|監事會|理監事|聯席會)/.test(t)||/會員大會|代表大會|成立大會/.test(t))return null;
 if(!/(通知|幾天前|幾日前|多久前|提前|開會前|議程|通知單|開會通知)/.test(t))return null;
 return{category:'人民團體會務說明',title:'理事會、監事會開會通知：7 日前，載明種類、時間、地點、議程',summary:'• 期限：應於開會 7 日前通知各應出席人員；因緊急事故召集臨時會議，於開會前 1 日送達通知者例外（會務輔導辦法第11條第1項）。\n• 內容：會議種類、時間、地點及議程四項是法定必載事項（同條）。\n• 誰發：理事會議由理事長召集，監事會議由監事會召集人（常務監事）召集；理監事聯席會議須分別經兩人同意後召集，通知期限同樣 7 日（同條第2、3項）。\n• 會員大會不同：會員（會員代表）大會是 15 日前通知，且應報請縣府派員列席（人民團體法第26條；會務輔導辦法第10條）。\n• 改選後第一次理監事會：應於大會閉會第 7 日起至 15 日內召開（選舉罷免辦法第12條）。\n\n通知方式法未限定，書面、電子郵件、通訊軟體皆可，但要留得下送達紀錄。',statutes:[G(11),P(26),G(10),E(12)],questionState:{focus:'board-notice',domain:'social'}};
}
function p2RecordRetention(t){
 if(!/(會議紀錄|會議記錄|紀錄|記錄|帳簿|帳冊|憑證|傳票)/.test(t))return null;
 if(/(送|報|備查|核備|簽到|簽名)/.test(t))return null;
 if(!/(保存|保留|留|放多久|多久|幾年|銷毀|丟掉|可以丟|查閱|調閱|看|申請看)/.test(t))return null;
 if(/選票|選舉票|罷免票/.test(t))return null;
 return{category:'人民團體會務說明',title:'會議紀錄與帳冊保存：帳冊至少 10 年；會議紀錄自行留存供會員查閱',summary:'會議紀錄（會務輔導辦法第12條）\n• 會員大會、理事會、監事會、理監事聯席會議紀錄，應載明開會日期、出缺席狀況、會議決議，閉會後由團體自行留存，提供會員查閱。\n• 會員大會紀錄另須於閉會後 30 日內報縣府備查。\n• 法規未訂會議紀錄保存年限；實務上與帳冊一併至少保存 10 年，涉及章程、立案、財產的紀錄建議永久保存。\n\n會計帳簿、憑證、報表（社會團體財務處理辦法第21條）\n• 年度決算辦理終了後至少保存 10 年；應永久保存或未結會計事項者不在此限。\n• 屆滿年限要銷毀，須經監事會點驗；要延長年限，須經理事會及監事會（或理監事聯席會議）通過。\n\n會員查閱：會議紀錄依法應提供會員查閱，團體不得拒絕；帳冊的查核權在監事會（財務處理辦法第22條），一般會員要看帳可請監事會查核或於會員大會提案。',statutes:[G(12),F(21),F(22)],questionState:{focus:'record-retention',domain:'social'}};
}
function p2CharterAmend(t){
 if(!/(章程)/.test(t)||!/(修改|修正|變更|修章|改章程|更改)/.test(t))return null;
 if(!/(門檻|比例|幾分之|三分之二|過半|多少人|幾人同意|怎麼算|怎麼修|流程|程序|怎麼辦|要報|備查|核備|生效)/.test(t))return null;
 if(/合作社|社員/.test(t))return null;
 return{category:'人民團體會務說明',title:'修改章程：出席會員三分之二以上同意，30 日內報縣府核備',summary:'兩道門檻都要過（人民團體法第27條）\n1. 成會：會員（會員代表）過半數出席。出席人數以簽到或報到人數計算（會務輔導辦法第16條）；社會團體會員可書面委託他人代理，每人以代理一人為限（人民團體法第42條）。\n2. 決議：出席人數三分之二以上同意。分母是「出席人數」，不是會員總數，也不是投票數。\n\n算法例：會員 100 人、出席 60 人（含委託），過半成會 ✓；同意需 ≥ 60×2/3 = 40 人。若只有 39 人同意，不通過。\n\n程序\n• 修章屬會員大會職權，應列入大會議程並於 15 日前通知（人民團體法第26條）；章程本身也應載明「章程修改之程序」（第12條第12款），若章程訂得更嚴（例如需全體會員三分之二），從其規定。\n• 通過後 30 日內檢附大會紀錄、修正條文對照表，報縣府核備（人民團體法第54條）；核備前對外仍以原章程為準。',statutes:[P(27),G(16),P(42),P(26),P(12),P(54)],notes:['理事會、監事會都無權修改章程，只能提案。'],questionState:{focus:'charter-amend',domain:'social'}};
}
function p2SupervisorAudit(t){
 if(!/(監事|監察)/.test(t)||/兼任|代理|經費.{0,4}(動用|用)|擅自/.test(t))return null;
 if(!/(查帳|查核|查誰|查什麼|可以查|審核|審查|監察|看帳|調帳|帳簿|憑證|權限|職權|怎麼查|發現.{0,4}問題|不當)/.test(t))return null;
 if(/合作社|社員/.test(t))return null;
 return{category:'人民團體會務說明',title:'監事會查核：對象、時機、發現問題怎麼辦',summary:'查什麼\n• 團體的財務查核由監事會為之（社會團體財務處理辦法第22條）：會計帳簿、憑證、報表、財產登記簿都在範圍內。\n• 理事會每次會議應提出經費收支及工作執行情形，並送監事會監察（會務輔導辦法第17條）。\n• 年度決算報告應先送監事會審核，審核結果一併提報會員大會（人民團體法第34條）。\n• 屆滿保存年限的財務檔案，須經監事會點驗才能銷毀（財務處理辦法第21條）。\n\n何時查：定期監事會議時執行定期查核，必要時得召開臨時監事會議臨時查核（財務處理辦法第22條）。監事會每 6 個月至少開會一次（社會團體，人民團體法第43條）。\n\n查到問題：提出糾正意見送理事會處理；理事會不處理，監事會得提報會員大會審議（會務輔導辦法第17條）；監事會也可函請理事長召開臨時會員大會（人民團體法第25條）。縣府亦得視需要抽查財務（財務處理辦法第22條）。\n\n界線：監事查核但不執行，不能自行動支經費或對外代表團體。',statutes:[F(22),G(17),P(34),F(21),P(43),P(25)],questionState:{focus:'supervisor-audit',domain:'social'}};
}
function p2CoopShares(t){
 if(!/(合作社|社員)/.test(t)||!/(股金|股|資本|出資)/.test(t))return null;
 if(!/(多少|幾|最低|最少|最多|上限|下限|怎麼算|怎麼繳|退股|退還|減資|增資|認購)/.test(t))return null;
 return{category:'合作社會務',title:'合作社股金：每股 6～150 元，每人至少 1 股、至多股金總額 20%',summary:'合作社法沒有「最低資本額」，只規範股的單位與比例：\n\n• 每股金額：至少新臺幣 6 元、至多 150 元，同一社內必須一律（合作社法第16條）；聯合社每股不得超過 150 元（第68-1條）。\n• 每人認股：至少 1 股，至多不得超過股金總額 20%；第一次繳款不得少於所認股款四分之一（第17條）。\n• 欠繳股款：合作社得以其應得股息及結餘撥充（第19條）；未繳股款不得與債權抵銷（第18條）。\n• 股息：年息不得超過 10%，無結餘不得發息（第22條）。\n• 減少每股金額：須經社員大會決議，並通知或公告債權人、指定一個月以上期限供異議（第21條）。\n• 退股：出社社員得依章程請求退還股金之一部或全部，股金依營業年度終了時財產計算，章程另有規定從其規定（第30條）。\n• 章程必載：社股金額及其繳納或退還之規定（第9-1條第6款）。\n\n股金總額屬可變動數，隨入社、退社增減，不須像公司一樣辦增減資登記；但章程所定每股金額變動要修章並報主管機關。',statutes:[C(16),C(17),C(19),C(22),C(21),C(30),C(9)],notes:['合作社稅務（股息所得、結餘課稅）請洽財政部南區國稅局 0800-000-321。'],questionState:{focus:'coop-shares',domain:'coop'}};
}
function p2FoundingMeeting(t){
 if(!/(成立大會|籌備|發起人|發起)/.test(t)||/合作社|社員|創立會/.test(t))return null;
 if(!/(幾人|多少人|人數|出席|到場|簽到|代簽|委託|不足|不夠|沒到|改期|延期|怎麼辦|流程|要做什麼)/.test(t))return null;
 return{category:'業務辦理',title:'成立大會：發起人 30 人以上、過半出席成會、簽到計人數、30 日內報立案',summary:'人數\n• 申請籌組時發起人須成年且 30 人以上（人民團體法第8條）。\n• 成立大會屬會員大會性質，應有應出席人員過半數出席才能成會（會務輔導辦法第16條）；出席人數以簽到或報到人數計算，不能代簽。\n• 社會團體會員不能親自出席時，得以書面委託其他會員代理，每人以代理一人為限（人民團體法第42條）；委託書要在簽到時交付。\n\n不足怎麼辦\n• 出席人員提出清查人數動議，經表決通過即清點；不足法定人數，主席應即宣布散會（會務輔導辦法第16條），擇期重開，不能「等人到再開」後補簽。\n• 改期後重新通知，並通知縣府派員列席（人民團體法第9條）。\n\n流程（人民團體法第9、10條）\n許可籌組 → 發起人會議推選籌備委員 → 籌備會（審查會員、擬章程草案、提理監事候選名單）→ 成立大會（通過章程、選理監事）→ 大會後 30 日內檢具章程、會員名冊、選任職員簡歷冊報縣府核准立案。籌備會會議及成立大會均應通知縣府，縣府得派員列席。',statutes:[P(8),G(16),P(42),P(9),P(10)],notes:['成立大會通過章程與選舉理監事，章程訂定需出席人數三分之二以上同意（人民團體法第27條）。'],questionState:{focus:'founding-meeting',domain:'social'}};
}
function p2ElectionPrep(t){
 if(!/(改選|換屆|屆滿|任期.{0,3}(到|滿|結束))/.test(t)||/合作社|社員/.test(t))return null;
 if(!/(前|準備|什麼時候|何時|時程|多久|幾個月|流程|要做什麼|該做|怎麼安排|延|來不及|逾期)/.test(t))return null;
 if(/選票|無效|候補|遞補|連任|帳|決算|報表|報縣府|報備|備查|核備|選前.{0,4}(理監事會|理事會|監事會)|一定要開/.test(t))return null;
 return{category:'人民團體會務說明',title:'改選時程：任期屆滿前 1 個月內辦理，最多可申請延 3 個月',summary:'法定時點（人民團體選舉罷免辦法第21條）\n• 理監事應於任期屆滿前一個月內辦理改選；確有困難得申請縣府核准延長，不得超過三個月。天災等不可抗力時縣府得公告暫緩。\n\n往前推的工作\n• 大會 15 日前：理事會審定出席會員資格、造具名冊供閱覽，並將會議種類、時間、地點、議程通知會員（會務輔導辦法第10條；人民團體法第26條），同時報請縣府派員列席。\n• 採通訊選舉者（章程須有訂）：開票日 45 日前理事會審定名冊，30 日前印製寄送選票；選舉辦法須經理事會通過並報備（選舉罷免辦法第23條）。\n• 理事會另應依章程決定選舉方式、候選人提名方式；法規未強制設「改選委員會」，由理事會決議推選選務人員即可。\n\n改選後\n• 大會閉會第 7 日起至 15 日內召開新任理事會、監事會選出理事長、常務監事（選舉罷免辦法第12條）。\n• 卸任理事長應將立案證書、圖記、檔案、財務、人事資料造具清冊，於新任理事長就任後移交，15 日內由新任理事長會同監交人接收完畢；逾期得報請縣府註銷重發立案證書（會務輔導辦法第18條）。\n• 選票包封保管至下屆改選完畢（選舉罷免辦法第26條）。',statutes:[E(21),G(10),P(26),E(23),E(12),G(18),E(26)],notes:['建議任期屆滿前 3 個月開始排程：確認會員名冊 → 理事會決議選舉方式 → 發通知 → 大會。'],questionState:{focus:'election-prep',domain:'social'}};
}
function p2MinutesContent(t){
 if(!/(會議紀錄|會議記錄|紀錄|記錄)/.test(t))return null;
 if(!/(要寫|寫什麼|記什麼|載明|內容|格式|怎麼寫|包含|哪些|簽名|蓋章|用印|誰簽|報備|備查|幾天內|多久內)/.test(t))return null;
 if(/保存|保留|銷毀|多久.{0,2}(要)?留/.test(t))return null;
 return{category:'人民團體會務說明',title:'會議紀錄必載三項：開會日期、出缺席狀況、會議決議；大會紀錄 30 日內報備',summary:'法定必載事項（會務輔導辦法第12條）\n1. 開會日期\n2. 出缺席狀況（應出席人數、實際出席、請假、缺席、委託；理監事連續二次無故缺席視同辭職，人民團體法第31條，所以缺席紀錄要留）\n3. 會議決議（含表決結果）\n\n實務上應一併記載（縣府審查時會看）\n• 會議名稱、屆次、時間、地點、主席、紀錄人\n• 列席人員（含縣府或公所列席者）\n• 各議案：案由、說明、決議；選舉案另記得票數、當選名單、候補名單\n• 主席與紀錄簽章；會員大會紀錄一般由理事長（主席）署名並加蓋團體圖記後報備\n\n報備\n• 會員（會員代表）大會紀錄：閉會後 30 日內報縣府備查。\n• 理事會、監事會、聯席會紀錄：自行留存供會員查閱；其中依法須報核辦的決議事項（如章程修改、理監事異動、不動產處分）檢附文件依法辦理（會務輔導辦法第12條；人民團體法第54條）。',statutes:[G(12),P(31),P(54)],notes:['紀錄寫「出席過半數」而沒有數字，縣府會退回補正。'],questionState:{focus:'minutes-content',domain:'social'}};
}
function p2DelegateSystem(t){
 if(!/(代表制|會員代表|代表大會)/.test(t))return null;
 if(!/(什麼時候|何時|幾人|多少人|超過|才能|可以|要不要|該不該|怎麼算|比例|分配|改回|改成|採用|改採)/.test(t))return null;
 if(/資格|誰可以當|條件|是什麼|什麼意思|差在哪|差別/.test(t))return null;
 return{category:'人民團體會務說明',title:'會員代表制：會員超過 300 人「得」分區選代表，非強制；劃分與名額報縣府核備',summary:'門檻（人民團體法第28條）\n• 會員（會員代表）人數超過三百人者，得劃分地區，依各區會員人數比例選出代表，合開代表大會行使會員大會職權。\n• 是「得」不是「應」：300 人以上可以繼續開全體會員大會；未滿 300 人則不得採分區代表制。\n\n名額怎麼算\n• 法規只要求「依會員人數比例」，具體比例（例如每 10 人選 1 名）由章程訂定（人民團體法第12條第9款：章程應載明會員代表之名額、職權、任期及選任與解任）。\n• 地區劃分與各區應選名額之分配，應報縣府核備（第28條第2項）。\n• 會員代表權利之行使與會員同，每一代表一權（第13、16條）。\n\n改採或改回\n• 兩個方向都是修改章程：須會員（會員代表）大會出席三分之二以上同意（第27條），30 日內報核備（第54條）。從代表制改回全體制時，由現任代表大會決議。',statutes:[P(28),P(12),P(13),P(16),P(27),P(54)],notes:['另一種會員代表是「會員單位推派」或「下級團體選派」（第13條），常見於聯合會與公會，與分區代表不同。'],questionState:{focus:'delegate-system',domain:'social'}};
}

// 2026-11-10 第三批實測
function nonprofitTaxThreshold(t){
 if(!/(稅|繳稅|免稅|課稅|報稅|所得稅)/.test(t))return null;
 if(/合作社|社員|營業稅|發票|統一發票|扣繳|薪資|二代健保|房屋稅|地價稅|娛樂稅|印花稅/.test(t))return null;
 if(!/(團體|協會|學會|促進會|基金會|非營利|公益|收入|結餘|多少|門檻|要不要|需不需要|要繳|免)/.test(t))return null;
 return{category:'人民團體財務',title:'協會收入要不要繳所得稅：沒有金額門檻，看「符不符合免稅 9 條件」與「是不是銷售所得」',summary:'協會（社會團體）的所得稅不是看收入多少，而是兩個問題：\n\n一、符合免稅標準 9 條件，本身所得免納所得稅（免納所得稅適用標準第2條）\n1. 已向主管機關立案。\n2. 除創設目的活動的必要費用外，不對捐贈人或其關係人變相分配盈餘。\n3. 章程明定解散後賸餘財產歸地方自治團體或主管機關指定的機關團體。\n4. 不經營與創設目的無關的業務。\n5. 基金及各項收入除零用金外都存金融機構或法定投資項目。\n6. 主要捐贈人及其配偶、三親等親屬擔任理監事不超過三分之一。\n7. 與捐贈人、理監事間無不正常業務財務關係。\n8. 用於創設目的活動的支出，不低於當年孳息及各項收入的 60%；但當年度結餘款在 50 萬元以下，或超過 50 萬元但已編列四年內使用計畫並經主管機關同意者，不在此限。\n9. 收支有合法憑證、完備會計紀錄，經國稅局查核屬實。\n\n二、銷售貨物或勞務的所得，仍要課稅（第3條）\n會費、捐款、補助款、利息不是銷售所得；義賣、賣商品、收費課程、場地出租等屬銷售貨物或勞務，其所得原則上要課所得稅，但其他收入不足支應創設目的活動支出的部分可以扣除。\n\n三、財產總額或年收入達 1 億元以上者，另須委託會計師查核簽證申報（第2條第2項）。\n\n申報義務、結算申報門檻、是否需辦理稅籍登記，請洽財政部南區國稅局 0800-000-321（屏東分局 08-7311166）。',statutes:[TX(2),TX(3)],notes:['本站法規庫僅收錄免稅適用標準，所得稅法本文與國稅局個案認定不在本站範圍。'],questionState:{focus:'nonprofit-tax',domain:'social'}};
}
function orgDisposeProperty(t){
 if(!/(賣|出售|變賣|抵押|出租|出借|過戶|處分|轉讓|送人|捐出)/.test(t))return null;
 if(!/(房|地|不動產|會址|辦公室|土地|財產|設備|車|建物)/.test(t))return null;
 if(!/(協會|團體|社團|學會|促進會|理事會|會員|可以|可不可以|能不能|能否|嗎)/.test(t))return null;
 if(/合作社|社員|商品|收費|補助|魅力|好讚|旅遊|聚餐|補習|贊助|販賣|販售/.test(t))return null;
 return{category:'人民團體會務說明',title:'協會可以賣掉或抵押房地、財產嗎：要經會員大會三分之二同意',
 summary:'可以，但不能由理事長或理事會單獨決定。依人民團體法第27條第4款，「財產之處分」（例如賣出、抵押、出租、過戶給他人）屬於會員大會的重大決議，須出席人數過半、且出席人數三分之二以上同意。\n\n實務上：\n1. 先由理事會擬具處分案，列入會員大會議程，並依章程於開會前通知會員（人民團體法第26條，十五日前通知）。\n2. 大會通過後，依章程與財務規定辦理，所得款項須入帳、掣給正式收據（社會團體財務處理辦法第17條）。\n3. 若是合作社或其他類型團體，依各自的法規辦理。\n\n不動產的過戶登記、稅費與地方規定，請洽地政機關或縣府社會處確認。',
 statutes:[P(27),P(26)],
 notes:['本答案依人民團體法原文；章程若訂有較嚴格的程序，以章程為準。']};
}
function sameAddressGroups(t){
 if(!/(同一|同個|同一個|同一棟|同地址|同一地址|同址)/.test(t))return null;
 if(!/(地址|地點|會址|住址|房子|住家|門牌)/.test(t))return null;
 if(!/(協會|團體|社團|學會|促進會|設立|成立|多個|兩個|二個)/.test(t))return null;
 if(/合作社|社員|公會|同業/.test(t))return null;
 return{category:'人民團體會務說明',title:'同一地址可以設立多個協會嗎：法條未禁止，但名稱不得相同或易誤認',
 summary:'人民團體法沒有禁止同一地址設立多個團體。依人民團體法第7條，在同一組織區域內，可以組織二個以上同級同類的團體，但名稱不得有下列情事：\n\n1. 與已許可團體的名稱相同。\n2. 易使人誤認與政府機關、政府捐助的財團法人或營利團體有關。\n3. 有歧視性或仇恨性的文字。\n\n另外，會址須在主管機關所在地區；若要設在其他地區，須經主管機關核准（人民團體法第6條）。\n\n實務上，同一地址的團體若有人員、財務或會議場所重疊，建議分別建立會籍、帳戶與會議紀錄，避免混淆。立案前請洽屏東縣政府社會處確認名稱與會址是否可以通過審查。',
 statutes:[P(7),P(6)],
 notes:['法條未禁止同址設立；名稱與會址的實際審查，以主管機關核定為準。']};
}
function homeAsOfficeTax(t){
 if(!/(住宅|住家|自用住宅|家裡|住處|自家|自己的房子|自宅)/.test(t))return null;
 if(!/(會址|辦公|團體|協會)/.test(t))return null;
 if(!/(稅|所得稅|房屋稅|地價稅|免稅|影響)/.test(t))return null;
 if(/合作社|社員/.test(t))return null;
 return{category:'人民團體財務',title:'自用住宅設為協會會址，會不會影響稅金：所得稅看免稅條件；房屋稅、地價稅請洽稅捐機關',
 summary:'分兩部分看：\n\n1. 所得稅：協會的所得是否免稅，主要看是否符合免稅標準的條件，例如是否經立案、不以任何方式分配盈餘、章程有解散後財產歸屬規定、不經營與創設目的無關的業務（教育文化公益慈善機關或團體免納所得稅適用標準第2條）。把住宅設為會址本身，並不是免稅條件的一項。\n\n2. 房屋稅、地價稅：這兩項屬於地方稅，本站的法條資料中未涵蓋，無法確認自用住宅改作會址後的稅率或是否喪失自用稅率。請洽當地稅捐稽徵機關（或地方稅務局）確認。\n\n另外，若會址房屋是借用或登記在他人名下，請留意產權與借用的文件，並依人民團體法第6條，會址須在主管機關所在地區。',
 statutes:[{title:'教育文化公益慈善機關或團體免納所得稅適用標準第2條',source:'財政部 免稅標準'},P(6)],
 notes:['房屋稅、地價稅不在本站法條範圍內，本答案不作判斷。']};
}
function chairStaffConflict(t){
 if(!/(理事長|會長)/.test(t))return null;
 if(!/(總幹事|秘書長|工作人員|幹事|職員|員工)/.test(t))return null;
 if(!/(打架|吵|衝突|不合|不聽|爭執|對立|不服從|誰說了算|誰管|誰決定|權限|越權|自己決定)/.test(t))return null;
 if(/合作社|社員|代理|代行|代理人|代召集/.test(t))return null;
 return{category:'人民團體會務說明',title:'理事長與總幹事意見不合：工作人員由理事會決定，理事長不能單獨決定',
 summary:'工作人員（含總幹事）依理事會訂定的資格條件遴選，提經理事會通過後聘僱；解聘也要經理事會通過（社會團體工作人員管理辦法第3條、第6條；人民團體法第24條）。因此，人事的聘任與解聘都要經理事會決議，理事長與總幹事都不能單獨決定。\n\n遇到衝突時可以這樣處理：\n1. 先依章程召開理事會，把爭議列入議程，由理事會決議。\n2. 若理事長長期不召開理事會（超過二個會次），主管機關可以解除理事長職務（人民團體法第30條）。\n3. 會員可在會員大會提出討論，重大事項須經會員大會決議（人民團體法第27條）。\n4. 仍無法協調時，可洽屏東縣政府社會處協助。',
 statutes:[SW(3),SW(6),P(24),P(30),P(27)],
 notes:['解聘工作人員還要符合勞動法令的規定。']};
}
function orgAcquireEquipment(t){
 if(!/(購置|購買|買|添購|採購|置產)/.test(t))return null;
 if(!/(設備|器材|電腦|影印機|音響|桌椅|辦公|車|不動產|房屋|土地|會址|財產)/.test(t))return null;
 if(!/(協會|團體|社團|學會|促進會|理事會|會員|可以|可不可以|能不能|能否|嗎)/.test(t))return null;
 if(/合作社|社員|補助|魅力|好讚|旅遊|聚餐|補習|收費|贊助|出售|賣|處分|過戶|抵押|借/.test(t))return null;
 return{category:'人民團體會務說明',title:'協會可以購置設備或房地嗎：可以，依章程與財務規定辦理，經費須有來源',
 summary:'可以。人民團體為達成宗旨可以購置辦公與活動所需的設備，但要依章程與財務規定辦理：\n\n1. 經費來源：會費、事業費、捐款、基金孳息等收入均屬合法經費來源（人民團體法第33條）；購置款項須列入預算，經理事會通過。\n2. 收據與支出：所有收入應掣給正式收據，提用存款時須由負責人、秘書長或總幹事及財務人員共同蓋章（社會團體財務處理辦法第17條）。\n3. 財產登記：購入的設備屬團體財產，應造冊登記，並依財務規定保管。\n4. 不同情形的差別：若是「處分」財產（例如賣出、抵押、出借不動產），依人民團體法第27條第4款，須經會員大會出席人數三分之二以上同意；單純購入設備不屬於此項。\n\n實務建議：購置前先在理事會通過預算與用途；金額較大或涉及不動產時，請依章程及目的事業主管機關規定辦理，必要時洽屏東縣政府社會處確認。',
 statutes:[P(33),P(27),F(17)],
 notes:['本答案依人民團體法與社會團體財務處理辦法原文；各團體章程若另有規定，以章程為準。']};
}
function sellGoodsAllowed(t){
 if(!/(賣|販賣|販售|銷售|義賣|做生意|營業|經營|開店|擺攤|收費|營利)/.test(t))return null;
 if(!/(團體|協會|學會|促進會|可以|可不可以|能不能|能否|行不行|嗎)/.test(t))return null;
 if(/合作社|社員|稅|發票/.test(t))return null;
 return{category:'人民團體會務說明',title:'協會可以賣商品或收費嗎：可以，但須與宗旨有關、不分配盈餘，且銷售所得要課稅',summary:'可以，有三個界線：\n\n1. 要跟宗旨有關：社會團體是以公益為目的的團體（人民團體法第39條）；免稅條件之一是「不經營與創設目的無關之業務」（免納所得稅適用標準第2條第4款）。例如環保協會賣環保袋、文化協會賣出版品、辦收費課程，屬「事業費」或「其他收入」（人民團體法第33條第3、7款）；若去做與宗旨無關的買賣，會失去免稅資格，情節重大者主管機關得依人民團體法第58條處理。\n\n2. 盈餘不能分給會員或理監事：不得以任何方式對捐贈人或關係人變相分配盈餘（免稅標準第2條第2款）；理監事為無給職（人民團體法第21條）。賺到的錢只能用在會務與宗旨活動。\n\n3. 收入進帳、所得課稅：所有收入應掣給正式收據、存入金融機構，不得坐抵（財務處理辦法第16、17條）；銷售貨物或勞務的所得原則上要課所得稅（免稅標準第3條），持續性銷售是否須辦稅籍登記、開發票，請洽國稅局 0800-000-321。\n\n實務建議：先在理事會通過該項業務計畫與收費標準，列入年度工作計畫與預算報縣府備查（財務處理辦法第11條）。',statutes:[P(39),TX(2),P(33),P(58),P(21),F(16),F(17),TX(3),F(11)],notes:['公益勸募（對外募款）另受公益勸募條例規範，與販售商品不同。'],questionState:{focus:'sell-goods',domain:'social'}};
}
function staffActingChair(t){
 if(!/(總幹事|秘書長|幹事|會務人員|工作人員|秘書|執行長)/.test(t)||!/(理事長|會長)/.test(t))return null;
 if(!/(代理|代行|代替|暫代|代為|代開|代召集|可以當|代表)/.test(t))return null;
 if(/合作社|社員/.test(t))return null;
 return{category:'人民團體會務說明',title:'總幹事不能代理理事長：工作人員不是選任職員，代理人須由常務理事（理事）互推',summary:'不可以。\n\n• 總幹事、秘書長是團體依章程聘僱的工作人員，辦理會務、業務（人民團體法第24條），不是會員選出的理事，沒有理事會的表決權，也不能對外代表團體。\n• 理事長出缺時，自出缺日起一個月內補選；所遺任期不足六個月，依章程或由常務理事互推一人代理，未設常務理事者由理事互推（選舉罷免辦法第17條）。\n• 理事長因故暫時不能執行職務，依章程所定代理程序辦理（會務輔導辦法第13條）；代理人同樣限於理事。\n• 財務上總幹事的角色是與負責人、財務人員共同蓋章提用存款（財務處理辦法第17條），這是共同控管，不是代理理事長。\n\n總幹事可以做的：依理事長或理事會指示處理日常行政、發開會通知、準備議案資料、代為聯繫縣府承辦；但召集會議、主持會議、簽署對外文件，必須是理事長或合法產生的代理理事。',statutes:[P(24),E(17),G(13),F(17)],notes:['章程若寫「理事長不能執行職務時由總幹事代理」，該條與選罷辦法第17條牴觸，建議洽承辦修正。'],questionState:{focus:'staff-acting-chair',domain:'social'}};
}

// 2026-11-10 第四批實測
function chairConvicted(t){
 if(!/(理事長|理事|監事|會長|幹部)/.test(t))return null;
 if(!/(判刑|判決|有期徒刑|坐牢|入監|服刑|被關|起訴|犯罪|前科|緩刑|褫奪)/.test(t))return null;
 if(/合作社|社員/.test(t))return null;
 return{category:'人民團體會務說明',title:'理事長或理監事被判刑：人民團體法沒有「判刑即解任」，但有四條處理路徑',summary:'先講結論：人民團體法對現任理事、監事沒有「判刑即喪失資格」的規定。第8條「因犯罪判處有期徒刑以上之刑確定、尚未執行或執行未畢（緩刑除外）」的限制，條文明定是對發起人，不是現任職員。所以要怎麼處理，看以下四條路：\n\n1. 章程有沒有規定：章程應載明理監事之選任與解任（人民團體法第12條第9款）。若章程把第8條的消極資格比照適用於理監事，判決確定即依章程解任；章程沒寫就不能直接解任。\n2. 罷免：會員（會員代表）大會得罷免理事、監事，須出席人數三分之二以上同意（人民團體法第27條第3款、第22條）。這是章程沒規定時最正當的途徑。\n3. 入監無法執行職務：理事長因故不能執行職務，依章程所定代理程序由常務理事代理（會務輔導辦法第13條）；理監事會議連續二次無故缺席視同辭職（人民團體法第31條），辭職後由候補遞補、理事長一個月內補選（選舉罷免辦法第17條）。\n4. 主管機關介入：犯罪事實若同時構成違反法令、章程或妨害公益（例如侵占會款），縣府得警告、限期改善，情節重大者撤免其職員（人民團體法第58條第1項第1款）。\n\n與會籍連動：若章程規定判刑確定即喪失會員資格，喪失會員資格者當然解任（理監事須具會員身分，人民團體法第17條）。\n\n建議：先確認判決是否確定、是否緩刑、罪名是否涉及團體事務，再由理事會提會員大會處理，並函報縣府備查。',statutes:[P(8),P(12),P(27),P(22),G(13),P(31),E(17),P(58),P(17)],notes:['職業團體（公會）與合作社另有個別法規的消極資格規定，不適用本則。'],questionState:{focus:'chair-convicted',domain:'social'}};
}
function chairDismissStaff(t){
 if(!/(總幹事|秘書長|幹事|會務人員|工作人員|秘書|職員|員工)/.test(t))return null;
 if(!/(理事長|會長)/.test(t)&&!/(解聘|解僱|開除|辭退|資遣)/.test(t))return null;
 if(!/(換|換掉|解聘|解僱|開除|辭退|資遣|炒|fire|更換|撤換|自己.{0,3}(聘|換|決定)|直接)/.test(t))return null;
 if(/合作社|社員|代理/.test(t))return null;
 return{category:'人民團體會務說明',title:'理事長不能自己決定換總幹事：聘僱和解聘都要經理事會通過',summary:'不可以。總幹事等工作人員，是依理事會訂定的資格條件遴選，提經理事會通過後聘僱（社會團體工作人員管理辦法第3條）；解聘也要由理事會通過（同辦法第6條）。理事長可以提案，但不能自己決定。\n\n另外有兩個限制：\n• 解聘要有理由：除了有勞動基準法第11條、第12條或第13條但書的情形，不得解聘工作人員（同辦法第6條）。違法解僱會變成勞資爭議，責任由協會承擔。\n• 接任的人選：工作人員不得由理事、監事擔任（同辦法第4條），也不得聘僱現任理事長的配偶及三親等以內的親屬（同辦法第5條）。\n\n建議的流程：理事長提案 → 召開理事會決議（開會通知要在7日前送達，人民團體會務輔導辦法第11條）→ 依勞動法令辦理終止和交接 → 新任人選經理事會通過後聘僱。',statutes:[SW(3),SW(6),SW(4),SW(5),G(11)],notes:['勞動法令的細節，請洽屏東縣政府勞動暨青年發展處。'],questionState:{focus:'dismiss-staff',domain:'social'}};
}
function chairDissolve(t){
 if(!/(解散|散會|收掉|關掉|結束.{0,3}(協會|團體)|不做了)/.test(t)||!/(理事長|會長|理事會|自行|自己|可以|可不可以|能不能|直接|單方)/.test(t))return null;
 if(/合作社|社員/.test(t))return null;
 if(/怎麼解散|流程|步驟|程序|要準備|文件|書表|清算/.test(t)&&!/(理事長|會長|自行|自己|單方|直接)/.test(t))return null;
 return{category:'人民團體會務說明',title:'理事長不能自行解散協會：解散是會員大會專屬權，須出席三分之二同意',summary:'不可以。協會的解散只有兩種合法方式：\n\n1. 會員（會員代表）大會決議（人民團體法第59條第5款）：應有會員過半數出席，出席人數三分之二以上同意（第27條第5款）。理事會、理事長都無權決議解散，只能提案。\n2. 主管機關處分（第58、59條）：團體違反法令章程情節重大、限期整理未完成、經廢止許可或破產時，由縣府解散。\n\n理事長片面宣布解散會怎樣：在法律上無效，團體仍然存在，立案仍然有效；會員可依第25條連署召開臨時大會另推人選，或請縣府依第32條指定理事召集。若理事長因此停止會務、不召開會議，可依第30條由縣府解除其職務。\n\n真的要解散的程序：大會 15 日前通知並報縣府派員列席（第26條）→ 大會決議解散並選清算人 → 清算（未登記法人者依章程或大會決議，章程未定由理事長或代理人任清算人，會務輔導辦法第27條）→ 賸餘財產依章程處理，不得分配給會員 → 檢附大會紀錄、清算報告函報縣府核准註銷。\n\n若理事長只是不想做了，正確做法是辭職（選舉罷免辦法第27條），不是解散團體。',statutes:[P(59),P(27),P(58),P(25),P(32),P(30),P(26),G(27),E(27)],notes:['會員人數不足或長期停擺的團體，可由縣府依第58條限期整理；整理不成才會走到解散。'],questionState:{focus:'chair-dissolve',domain:'social'}};
}

function memberCourseFee(t){
 if(!/會員/.test(t))return null;
 if(!/(開課|開設課程|課程|開班|上課|研習|講座|學費|講師費|鐘點費|才藝)/.test(t))return null;
 if(/(對外|招生|學生|兒童|小孩|孩子|學童|課後|安親|補習|課輔|不特定|民眾|合作社|社員)/.test(t))return null;
 return{category:'人民團體財務',title:'協會可以為會員開課並收學費、支付講師費：依章程任務辦理，收支入帳、開收據，學費收入要注意課稅',
 summary:'可以。為會員辦理研習或課程，只要屬於章程所定的宗旨與任務，協會可以收取學費，也可以支付講師費。要注意：\n\n1. 計畫與決議：課程與收費應列入年度工作計畫及收支預算（社會團體財務處理辦法第11條）；預算外新開的課程，依章程經理事會決議後辦理。\n2. 收入：學費收入要掣給正式收據並留存根（第17條），存入金融機構，不得收支坐抵（第16條）。\n3. 支出：講師費要取得講師簽收的領據等原始憑證並登帳（第7條、第8條），不得匿報或虛報（第20條）。\n4. 稅務：學費通常屬銷售勞務收入，依免稅標準第3條應課徵所得稅（其他收入不足支應宗旨活動支出的部分可扣除）。支付講師費的扣繳與申報，請洽國稅局確認。\n\n如果課程對外向不特定民眾招生收費，可能涉及補習班立案，請改問「協會可以開班收費嗎」。',
 statutes:[F(11),F(17),F(16),F(7),F(20),TX(3)],
 notes:['本站法規庫不含所得稅法，講師費扣繳率與申報方式以國稅局說明為準。']};
}

const CDP=n=>({title:'社區發展工作要點第'+n+'點',source:'https://dep.mohw.gov.tw/DOSAASW/lp-553-103.html'});
const SW=n=>({title:'社會團體工作人員管理辦法第'+n+'條',source:LAW+'D0050096'});
const VS=n=>({title:'志願服務法第'+n+'條',source:LAW+'D0050131'});
const VSC=n=>({title:'志願服務證及服務紀錄冊管理辦法第'+n+'條',source:LAW+'D0050132'});
const VSA=n=>({title:'志願服務獎勵辦法第'+n+'條',source:LAW+'D0050134'});
const VS_CONTACT='志願服務業務承辦：縣府社會處曾雅怡（08-7320415 轉 5317）。';
function minorJoinAssoc(t){
 const pupil=/(國中生|高中生|國小|小學生|國中|高中)/.test(t)&&/(加入|入會|會員)/.test(t);
 if(!pupil&&!/(未滿18|未滿十八|未成年|18歲以下|十八歲以下|小孩|孩子|小朋友|青少年)/.test(t))return null;
 if(!/(加入|入會|參加|成為會員|當會員|會員)/.test(t))return null;
 if(/(合作社|社員|工會|發起人|理事|監事|理事長)/.test(t))return null;
 return{category:'人民團體會務說明',title:'未滿18歲可以加入協會嗎：人民團體法沒有規定會員最低年齡，依章程規定；入會宜經法定代理人同意',
 summary:'人民團體法沒有規定一般會員的最低年齡。法律只要求「發起人」須為成年（人民團體法第8條第2項）；會員的入會資格，由各團體章程規定（人民團體法第12條第7款）。\n\n所以：\n1. 先看協會章程的會員資格。章程如果規定須年滿18歲，未滿18歲就不能成為（正式）會員；有些章程另設學生會員、青少年會員等類別。\n2. 章程沒有限制時，未滿18歲者原則上可以申請入會。但入會須繳交會費、負擔會員義務，未成年人入會宜取得法定代理人（父母）同意（民法第77條：限制行為能力人為意思表示，應得法定代理人之允許）。\n3. 理事、監事由會員中選舉（人民團體法第17條）；未成年會員能否被選任，依章程及選舉相關規定辦理，建議先洽縣府確認。',
 statutes:[P(8),P(12),P(17),CIV(77)],
 notes:['合作社社員的年齡規定不同，請在問題中寫明「合作社」。','若要擔任發起人，須為成年（人民團體法第8條）。']};
}

function volunteerTopics(t){
 if(!/(志工|志願服務|義工|祥和)/.test(t))return null;
 if(/(第\d+條|第[一二三四五六七八九十]+條|合作社|社員)/.test(t))return null;
 if(/(承辦|窗口|找誰|找哪|聯絡|電話|分機|業務是誰)/.test(t))return{category:'聯絡承辦',title:'志願服務業務承辦人：社會處曾雅怡（08-7320415 轉 5317）',
  summary:'志願服務相關業務，包括志工運用單位備案、祥和計畫志願服務隊、志願服務紀錄冊與獎勵申請，請洽屏東縣政府社會處曾雅怡，電話 08-7320415 轉 5317。',statutes:[VS(4)],notes:[]};
 if(/榮譽卡/.test(t))return{category:'志願服務',title:'志願服務榮譽卡：服務滿3年且時數達300小時以上，可向縣府申請',
  summary:'志工服務年資滿三年，服務時數達三百小時以上者，可以檢具證明文件向地方主管機關（屏東縣政府）申請核發志願服務榮譽卡（志願服務法第20條第1項）。\n\n持榮譽卡進入收費的公立風景區、未編定座次的康樂場所及文教設施，可以免費（同條第2項）。\n\n民防、義警、義交、義消、守望相助、災害防救團體等依其他法律編組的成員，符合同樣年資與時數者，準用並享半價優待（同條第3項）。',
  statutes:[VS(20)],notes:[VS_CONTACT]};
 if(/(紀錄冊|服務證)/.test(t))return{category:'志願服務',title:'志願服務證及紀錄冊：志工完成教育訓練後，由運用單位登錄系統申請並發給',
  summary:'志工完成教育訓練後，志願服務運用單位應發給志願服務證及服務紀錄冊（志願服務法第12條；志願服務證及服務紀錄冊管理辦法第2條）。\n\n申請方式：運用單位至全國志願服務資訊整合系統登錄志工基本資料、基礎訓練及特殊訓練完訓證明，由地方目的事業主管機關製作紀錄冊，再由運用單位發給志工（管理辦法第5條）。\n\n其他規定：\n• 服務證由運用單位製發及管理（第3條）。\n• 運用單位應將訓練、保險、服務日期時數內容、獎勵等登載於紀錄冊，並登錄資訊系統（第4條）；服務時數不包括在途往返時間（第9條）。\n• 轉換運用單位時紀錄冊繼續使用（第7條）；損壞或遺失可向運用單位申請換發或補發（第8條）。\n• 服務證及紀錄冊不得轉借、冒用（第6條）。',
  statutes:[VS(12),VSC(2),VSC(3),VSC(4),VSC(5),VSC(6),VSC(7),VSC(8),VSC(9)],notes:[VS_CONTACT]};
 if(/(獎勵|獎牌|金牌|銀牌|銅牌|績優|表揚|獎狀|時數.{0,4}獎)/.test(t))return{category:'志願服務',title:'志工獎勵：個人依累計時數申請銅銀金牌獎，績優團隊每三年選拔',
  summary:'衛生福利部的志願服務獎勵（志願服務獎勵辦法）：\n\n1. 志工個人（每年辦理一次）：累計服務三千小時以上銅牌獎、五千小時以上銀牌獎、八千小時以上金牌獎（第3條、第4條）。志工於每年5月31日前將申請表報運用單位，運用單位於6月30日前至全國志願服務資訊整合系統申請，轉地方目的事業主管機關受理（第5條）。\n\n2. 績優志工團隊（每三年辦理一次）：須成立滿三年、志工人數二十人以上，運作良好且績效特優；獲獎後六年內不得再申請（第3條、第7條）。運用單位於辦理年度5月31日前，將推薦書表報縣（市）政府或中央目的事業主管機關（第8條）。\n\n另外，運用單位應定期考核志工個人及團隊的服務績效（志願服務法第19條）。',
  statutes:[VS(19),VSA(3),VSA(4),VSA(5),VSA(7),VSA(8)],notes:[VS_CONTACT,'縣府自辦的志工表揚依縣府當年度計畫辦理。']};
 return null;
}

function volunteerTeam(t){
 if(!/(志工|志願服務|義工|祥和)/.test(t))return null;
 if(/(紀錄冊|服務證|榮譽卡|獎勵|獎狀|徽章|時數|第\d+條|第[一二三四五六七八九十]+條)/.test(t))return null;
 if(/(保險|投保|保勞保|勞保|保險費)/.test(t)&&!/(合作社|社員|僱用|雇用|聘用|支薪|薪水|工資)/.test(t))return{category:'志願服務',title:'協會運用志工：應為志工辦理意外事故保險',
 summary:'志願服務運用單位應為志工辦理意外事故保險，必要時並得補助交通、誤餐及特殊保險等經費（志願服務法第16條）。\n\n經政府立案的團體運用志工，就是志願服務運用單位（第3條第3款），運用前並應將志願服務計畫送主管機關備案（第7條）。\n\n至於勞工保險、全民健康保險是否需要投保，屬勞保、健保法規範圍，不在本站法規庫內，請洽勞動部勞工保險局或衛生福利部中央健康保險署確認。\n\n志願服務業務承辦：縣府社會處曾雅怡（08-7320415 轉 5317）。',
 statutes:[VS(16),VS(3),VS(7)],
 notes:['若是聘用支薪的工作人員（不是志工），適用勞動法規，請改問勞健保相關問題。']};
 if(!/(申請|成立|組|隊|備案|可以|能不能|可不可以|怎麼|如何|計畫)/.test(t))return null;
 if(/(合作社|社員|勞保|健保|勞健保|工資|薪|僱傭|僱用|雇用|職災|加班)/.test(t))return null;
 return{category:'志願服務',title:'協會可以成立志工隊、申請祥和計畫志願服務隊：立案團體可作為志願服務運用單位，運用前要先備案',
 summary:'可以。經政府立案的團體，屬於志願服務法所稱的「志願服務運用單位」（志願服務法第3條第3款）。\n\n要做的事：\n1. 備案：依志願服務計畫運用志工（第7條第1項），並在運用前檢具志願服務計畫及立案證書影本，送主管機關及該計畫的目的事業主管機關備案（第7條第3項）；運用結束後函報辦理情形。\n2. 教育訓練：志工須接受基礎訓練及特殊訓練（第9條）。\n3. 督導與安全：提供志工必要資訊並指定專人督導（第11條），確保服務環境安全衛生（第10條）。\n4. 保險：為志工辦理意外事故保險（第16條）。\n\n祥和計畫（社會福利類志願服務）：依衛生福利部彙編的函釋，運用單位為推展祥和計畫的服務項目可以召募志工，函報縣（市）主管機關備查；是否列為祥和計畫志願服務隊，請直接向縣府社會處洽辦。服務範圍只在屏東縣者，以屏東縣政府為主管機關。',
 statutes:[VS(3),VS(7),VS(9),VS(10),VS(11),VS(16),{title:'志願服務法釋義彙集（祥和計畫第4點等函釋）',source:'衛生福利部彙編，104年6月'}],
 notes:['志願服務業務承辦：縣府社會處曾雅怡（08-7320415 轉 5317）。','志工不是僱傭關係；若要聘用工作人員並支薪，適用勞動法規，請改問勞健保相關問題。']};
}

// 2026-11-10 第五批實測：立案 ≠ 目的事業許可
function runClassesPermit(t){
 if(!/(補習班|補教|開班|開課|授課|課後|安親|才藝班|招生|招收學生|學費|課輔|照顧班)/.test(t))return null;
 if(!/(協會|團體|學會|促進會|理事長|可以|可不可以|能不能|能否|要不要|需要|嗎)/.test(t))return null;
 if(/合作社|社員/.test(t))return null;
 return{category:'人民團體會務說明',title:'協會可以開班收費嗎：立案證書不等於補習班許可，對外招生收費要問教育處',summary:'先分清楚兩件事：\n\n一、協會「立案」只代表團體合法存在\n人民團體法管的是團體本身（籌組、會務、改選）；團體所辦的「目的事業」要受各該事業主管機關指導監督（人民團體法第3條但書）。辦教育課程的目的事業主管機關是教育處，不是社會處。\n\n二、什麼情況要另外申請許可\n• 對不特定公眾招生、固定場所、收費授課（不論學科或才藝、兒童或成人），原則上屬短期補習班或課後照顧服務，須依教育法規向屏東縣政府教育處申請設立許可，場地另須符合建管、消防規定。\n• 只對會員辦的研習、偶發性的公益講座、純推廣活動且與宗旨相符，一般不視為補習班，但收費仍屬事業費或其他收入，要經理事會列入計畫預算、掣給收據、入帳（人民團體法第33條；社會團體財務處理辦法第11、16、17條）。\n• 把學費改名「材料費」「捐款」「入會費」不會改變性質，教育處與國稅局都看實際對價。\n\n三、理事長或會員自己的補習班\n不能借協會名義招生或用協會帳戶收款；那是個人事業與團體之間的關係交易，應揭露、迴避，否則構成違反章程與妨害公益（人民團體法第58條）。\n\n本站法規庫未收錄短期補習班設立及管理準則與課後照顧服務相關辦法，具體認定（人數、場地、師資、收費上限）請洽屏東縣政府教育處；協會內部程序請洽社會處 08-7360316。',statutes:[P(3),P(33),F(11),F(16),F(17),P(58)],notes:['協會核發的結業證書只是參與證明，不是國家資格或政府認證，文宣不得誤導。'],questionState:{focus:'run-classes',domain:'social'}};
}
function residentialCarePermit(t){
 if(!/(收容|安置|照顧機構|養護|托育|托老|日照|日間照顧|長照|住宿|住進來|庇護|收留|機構)/.test(t))return null;
 if(!/(協會|團體|學會|促進會|可以|可不可以|能不能|能否|嗎)/.test(t))return null;
 if(/合作社|社員|會址|借|租|分支機構|分會|辦事處|附屬機構.{0,3}(是|指|定義)/.test(t))return null;
 return{category:'人民團體會務說明',title:'協會可以收容安置老人、兒少、身心障礙者嗎：不能只憑立案，必須另取得社會福利機構設立許可',summary:'不可以直接做。協會依人民團體法立案，只是團體合法成立；收容、安置、住宿式或日間照顧屬社會福利「目的事業」，要受各該事業主管機關指導監督（人民團體法第3條但書），而且法律上是「機構」業務，必須另行申請設立許可，未經許可即收容是違法的。\n\n要找誰、適用什麼法規（均不在本站法規庫，以下僅指引方向）：\n• 老人：老人福利法與老人福利機構設立標準 → 社會處老人福利科。\n• 兒童及少年：兒童及少年福利與權益保障法、兒少安置及教養機構設立標準 → 社會處兒少科。\n• 身心障礙者：身心障礙者權益保障法、身心障礙福利機構設立標準 → 社會處身障科。\n• 長期照顧（日照、住宿式長照）：長期照顧服務法 → 衛生局長照科。\n\n協會可以怎麼做：\n1. 以協會為「設立者」申請附設機構，須符合各該設立標準的場地、建管、消防、專業人員、財務規定，通過評鑑後才能收案；協會本身要先有經費與專業人力。\n2. 承接政府委託方案（例如社區關懷據點、日間托老、課後照顧）—— 由委託機關核定服務內容與規模，不是協會自行決定。\n3. 無住宿、非機構性質的社區服務（送餐、電話問安、共餐、關懷訪視）可以辦，但涉及餐食、醫療、用藥仍各有規範，先問承辦。\n\n理事會通過、會員大會同意，只是團體內部決議，不能取代主管機關許可（人民團體法第58條）。請先向社會處各科說明「服務對象、人數、是否住宿、是否收費」，由承辦分流。',statutes:[P(3),P(39),P(58)],notes:['社會處總機 08-7320415；各科分機請總機轉接。'],questionState:{focus:'residential-care',domain:'social'}};
}

/* ===== 2026-11-11 截圖回報校正（逐項核對：人民團體法、財務處理辦法、免稅標準取自本站法條資料；其餘來源見各則） ===== */
const CIV=n=>({title:'民法第'+n+'條',source:LAW+'B0000001'});
const GPA=n=>({title:'政府採購法第'+n+'條',source:LAW+'A0030057'});
const PT_SUBSIDY=n=>({title:'屏東縣政府及所屬各機關對民間團體及個人補捐助預算執行應注意事項第'+n+'點',source:'屏東縣政府115年9月18日屏府主歲字第1150258539號'});
function assocMayNotMeet(t){
 if(!/(可以|能|能不能|可不可以|可否)?(不開會|不用開會|不召開|免開會|不開大會|不開理事會)/.test(t))return null;
 if(/理事長|會長|召集|會員可以怎麼|怎麼辦|會怎樣|後果|處罰|罰|合作社|社員/.test(t))return null;
 return{category:'人民團體會務說明',title:'協會不能不開會：會員大會每年一次，理事會、監事會每六個月至少一次',
 summary:'不行。人民團體法規定會員（會員代表）大會的定期會議每年召開一次，由理事長召集（人民團體法第25條）；社會團體的理事會、監事會每六個月至少舉行會議一次（人民團體法第43條）。\n\n如果因故無法如期召開會員大會，年度工作報告、會計報告等可以先經理事會及監事會（或理監事聯席會議）通過，事後提大會追認，再報縣府備查（社會團體財務處理辦法第11條）。\n\n長期不依法開會屬違反法令，主管機關得予警告、撤銷決議、停止業務並限期改善（人民團體法第58條）。',
 statutes:[P(25),P(43),F(11),P(58)],
 notes:['若是理事長不召集、會員想要求開會，可以問「理事長一直不開會，會員可以怎麼做」。']};
}
function assocNurseryCenter(t){
 if(!/(托嬰|托育中心|公共托育|居家托育|托育機構)/.test(t))return null;
 return{category:'人民團體業務範圍',title:'協會想辦托嬰（托育）中心：協會立案不等於托嬰許可，須另依兒少福利法規申請設立許可',
 summary:'協會立案只是取得人民團體資格，不能直接收托嬰幼兒。托嬰中心屬兒童及少年福利機構，要依兒童及少年福利與權益保障法及「私立兒童及少年福利機構設立許可及管理辦法」向縣府申請設立許可，場地、人員、設施等另有專門規定。\n\n如果是承接縣府委託或招標的托育服務案，投標資格以招標或委託公告為準；政府採購法所稱「廠商」包含團體（政府採購法第8條）。\n\n不論哪一種，協會章程的宗旨與任務要涵蓋兒童福利或托育相關事項（人民團體法第39條）。',
 statutes:[{title:'私立兒童及少年福利機構設立許可及管理辦法（依兒童及少年福利與權益保障法第82條第3項訂定）',source:'衛生福利部，106年11月27日修正'},GPA(8),P(39)],
 notes:['設立許可的條件、程序與表件，請洽縣府社會處兒少福利／托育業務承辦人確認；本站不判斷個案是否符合設立標準。']};
}
function assocCareStation(t){
 if(!/(關懷據點|照顧關懷|社區照顧據點|巷弄長照)/.test(t))return null;
 if(!/(協會|團體|社區發展|我們|可以|能|申請|設|辦|成立)/.test(t))return null;
 return{category:'社區發展協會',title:'立案的協會（含社區發展協會）可以申請辦理社區照顧關懷據點',
 summary:'可以。內政部「建立社區照顧關懷據點實施計畫」所列的承辦單位，第一類就是「立案之社會團體（含社區發展協會）」，另包括章程明訂辦理社會福利事項的財團法人、宗教組織、文教基金會，以及其他非營利社區團體。\n\n實際申請時間、補助項目與表件，依縣府當年度計畫與公告辦理。\n\n關懷據點和長照機構是不同制度；據點若要提供長照服務（例如巷弄長照站），須另依長照相關規定申請。',
 statutes:[{title:'建立社區照顧關懷據點實施計畫 第肆點（承辦單位）',source:'內政部，94年5月18日'},P(39)],
 notes:['當年度申請窗口與補助標準，請洽縣府社會處確認。']};
}
function assocDonateGoods(t){
 if(!/(協會|團體|我們|社區發展協會)/.test(t))return null;
 if(!/(捐|捐贈|捐出|送給|贈送|贊助)/.test(t))return null;
 if(!/(物資|物品|東西|米|食物|款|錢|經費|給)/.test(t))return null;
 if(/(給協會|給我們|節稅|抵稅|扣除|收據|報稅|收現金|可以收|接受|現金捐款)/.test(t))return null;
 if(/(接受|收到|收受|收捐|募|勸募|捐款收據|收據|有人|別人|民眾|會員捐|企業捐|廠商捐|抵稅|扣除)/.test(t))return null;
 return{category:'人民團體財務',title:'協會可以對外捐贈物資：須符合章程宗旨、依預算及決議辦理並留存憑證',
 summary:'人民團體法沒有禁止協會對外捐贈。實務上要注意：\n\n1. 捐贈要符合協會宗旨；社會團體以公益為目的（人民團體法第39條）。\n2. 支出應列入年度工作計畫及收支預算，經會員大會通過（社會團體財務處理辦法第11條）。預算以外的支出，依章程經理事會決議後辦理。\n3. 支出要有原始憑證（例如受贈單位開立的收據）並登帳（社會團體財務處理辦法第5條、第7條、第8條），不得匿報或虛報（第20條）。\n4. 若協會適用所得稅免稅，不得以任何方式對捐贈人或與其有關係的人變相分配盈餘（免稅標準第2條）。\n\n另外，如果是向外界募集物資再轉送，屬於「募集」，可能涉及公益勸募條例，請改問「募物資要申請嗎」。',
 statutes:[P(39),F(11),F(5),F(7),F(20),TX(2)]};
}
function assocGovTender(t){
 if(!/(標案|投標|招標|政府採購|承攬|委託案|委辦案|委外案)/.test(t))return null;
 if(/合作社|社員/.test(t))return null;
 return{category:'人民團體業務範圍',title:'協會可以承接政府標案：採購法的「廠商」包含團體，但業務要符合宗旨，收入要注意課稅',
 summary:'可以。政府採購法所稱「廠商」，包括得提供工程、財物、勞務的法人、機構或團體（政府採購法第8條），因此協會可以依招標文件規定的資格投標。\n\n要注意：\n1. 承接的業務要符合協會章程宗旨（人民團體法第39條）；若協會適用所得稅免稅，不得經營與創設目的無關的業務（免稅標準第2條）。\n2. 標案收入通常屬於銷售勞務收入，依免稅標準第3條仍應課徵所得稅（以其他收入不足支應宗旨活動支出的部分可扣除）。營業稅與統編事項請洽國稅局。\n3. 是否須具備法人登記、統編、押標金或特定實績，以各招標文件為準。',
 statutes:[GPA(8),P(39),TX(2),TX(3)],
 notes:['本站不判斷個別標案資格，請以招標機關公告為準。']};
}
function subsidySettlement(t){
 if(!/(補助|補捐助|補助款|補助經費)/.test(t))return null;
 if(!/(核銷|結報|單據|繳回|結餘|不核銷|沒核銷|未核銷|報帳|憑證)/.test(t))return null;
 if(/勞退|勞保|健保|提繳/.test(t))return null;
 {const nb=subsidyBasics(t);if(nb)return nb;}
 return{category:'補助',title:'縣府補助的核銷：依核定公文及各機關作業規範結報，未依規定辦理可能被要求繳回或停止補助',
 summary:'縣府對民間團體的補（捐）助，依「屏東縣政府及所屬各機關對民間團體及個人補捐助預算執行應注意事項」辦理，重點如下：\n\n1. 結報方式由補助機關擇定：檢附收支清單及單據；或只附收支清單、單據自行保存備查；或依機關規定檢附佐證資料（第3點第4款）。\n2. 未依補助用途支用、虛報或浮報，除繳回該部分經費外，得依情節停止補助一年至五年（第3點第2款）。\n3. 單據毀損、滅失，得依情節酌減後續補助款或停止補助一年至五年（第3點第5款）。\n4. 有結餘款應按補助比例繳回（第3點第7款）；申請資料不實須自負責任（第3點第10款）。\n\n注意事項沒有直接寫明「不核銷」的效果；逾期或不核銷如何處理，依補助機關的核定公文與作業規範（第2點），可能影響已撥款項及後續補助。協會帳簿與憑證另須至少保存十年（社會團體財務處理辦法第21條）。',
 statutes:[PT_SUBSIDY(2),PT_SUBSIDY(3),F(21)],
 notes:['核銷期限與表件以核定公文為準，有疑問請洽核定補助的業務單位。']};
}
function corpRegistration(t){
 if(!/法人/.test(t))return null;
 if(/財團法人|合作社|公司|勸募/.test(t))return null;
 const cancel=/(註銷|撤銷|取消|廢止|解散|不要|放棄|消滅)/.test(t);
 if(!cancel&&!/(登記|成為|變成|申請|可以|要不要|怎麼辦|哪裡)/.test(t))return null;
 const court='臺灣屏東地方法院：屏東市棒球路9號，電話08-7550611（請轉登記處）。';
 if(cancel)return{category:'一般協會法人登記',title:'協會想註銷社團法人：須先依法解散並清算，再向法院辦理登記',
 summary:'社團法人登記跟著團體本身存在，法律沒有規定「團體繼續存在、只註銷法人資格」的程序。一般流程是：\n\n1. 經會員（會員代表）大會決議解散，須出席人數三分之二以上同意（人民團體法第27條第5款、第59條第1項第5款），並報縣府。\n2. 解散後由董事（即理事）辦理清算：了結現務、收取債權、清償債務、移交賸餘財產（民法第37條、第40條）。\n3. 依章程或總會決議解散的，董事應於十五日內報告法院；法人的清算屬法院監督（民法第42條）。\n\n'+court,
 statutes:[P(27),P(59),CIV(37),CIV(40),CIV(42)],
 notes:['法院登記應備文件與程序，請洽法院登記處確認。']};
 return{category:'一般協會法人登記',title:'協會可以登記為社團法人：先經縣府核准立案，再向法院聲請登記',
 summary:'可以。協會先經主管機關（縣府）核准立案，再向主事務所所在地的地方法院登記處聲請社團法人登記；法人非經登記不得成立（民法第30條），以公益為目的的社團於登記前應得主管機關許可（民法第46條）。\n\n'+court+'\n\n法人登記與否由團體自行決定；統編、銀行開戶等事項的需求，請以各受理機關規定為準。',
 statutes:[CIV(30),CIV(46)],
 notes:['登記應備文件請洽法院登記處確認。']};
}
function assocBoardPay(t){
 if(!/(理事|監事|理監事|理事長)/.test(t))return null;
 if(!/(薪水|薪資|月薪|支薪|領錢|報酬|酬勞|有給|待遇|津貼)/.test(t))return null;
 if(/合作社|社員/.test(t))return null;
 return{category:'人民團體財務',title:'協會理事、監事是無給職：可酌發出席費或交通費，不能領薪水',
 summary:'社會團體的理事及監事均為無給職。但理事或監事因執行職務需要，協會得參照政府機關所定標準酌發出席費，或按交通工具憑票證酌發交通費（社會團體財務處理辦法第19條）。',
 statutes:[F(19)],
 notes:['合作社理監事的規定不同，請在問題中寫明「合作社」。']};
}
function financeStaffConcurrent(t){
 if(!/(財務人員|會計|出納|財務)/.test(t))return null;
 if(!/(兼任|兼辦|兼職|兼|同一人)/.test(t))return null;
 if(/合作社|社員|理事.*監事|監事.*理事/.test(t))return null;
 return{category:'人民團體財務',title:'財務人員原則專任；團體編制不足時，可由其他工作人員兼辦',
 summary:'辦理會計、出納及財物管理的財務人員應為專任；但團體編制不足時，得由其他工作人員兼辦（社會團體財務處理辦法第17條第2項）。\n\n提用存款時，應由團體負責人、秘書長或總幹事及財務人員於領款憑證上共同蓋章（同條第1項）。',
 statutes:[F(17)]};
}
function staffHiring(t){
 if(!/(總幹事|秘書長|工作人員|會務人員|幹事)/.test(t))return null;
 if(!/(聘|聘用|聘任|任用|僱用|雇用|找人|請人|怎麼請)/.test(t))return null;
 if(/合作社|社員|開戶|銀行/.test(t))return null;
 return{category:'人民團體會務說明',title:'總幹事等工作人員：依理事會訂定的資格遴選，經理事會通過聘僱；理監事不得兼任',
 summary:'總幹事等工作人員的職稱、員額及資格條件由理事會訂定，依資格條件遴選後，提經理事會通過聘僱（社會團體工作人員管理辦法第3條）；解聘也要經理事會通過（第6條）。工作人員不得由理事、監事（選任之職員）擔任（第4條），也不得聘僱現任理事長的配偶及三親等以內血親、姻親（第5條，理事長接任前已聘僱者除外）。\n\n人民團體依章程聘僱工作人員辦理會務、業務（人民團體法第24條）；聘免後依章程報縣府備查。如有疑問請洽屏東縣政府社會處。',
 statutes:[SW(3),SW(4),SW(5),SW(6),P(24)]};
}

/* ===== 2026-11-11 第二批截圖校正 ===== */
const CHR=n=>({title:'公益勸募條例第'+n+'條',source:LAW+'D0050138'});
const ER=n=>({title:'人民團體選舉罷免辦法第'+n+'條',source:LAW+'D0050093'});
/* ── 2026-11-11 深層校正：直接回答「可不可以／幾個／怎麼辦」的規則 ── */
/* ── 2026-11-11 第二輪深層校正 ── */
function directorAbsence(t){
 if(!/(理事|監事|理監事)/.test(t)||/理事長|會長|召集人|常務監事/.test(t))return null;
 if(!/(請假|缺席|不來|沒來|不出席|沒出席|都不到|不參加|無故)/.test(t))return null;
 if(/合作社|社員|會員大會|代理|委託/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'理事、監事連續兩次無故缺席，視同辭職，由候補遞補',
 summary:'法規沒有規定可以請幾次假，但有一條底線：理事、監事要親自出席理事會、監事會，不能委託別人代理；連續二次無故缺席的，視同辭職，由候補理事、候補監事依次遞補（人民團體法第31條）。\n\n所以重點在「無故」：\n• 事先請假、有正當理由的，不算無故缺席。請假要怎麼辦、怎樣算正當理由，建議在章程或會議規則裡寫清楚。\n• 沒請假、連續兩次沒到的，不需要另外表決解任，直接視同辭職，由候補遞補，並把異動報縣府。\n\n協會請保留開會通知和簽到表，才能證明對方確實是連續兩次無故缺席。',
 statutes:[P(31)],notes:['遞補之後，理事或監事人數不到章程名額三分之二的，要辦理補選（人民團體選舉罷免辦法第17條）。']};
}
function chairElectionMethod(t){
 if(!/(理事長|會長)/.test(t))return null;
 if(!/(怎麼選|如何選|誰選|怎麼產生|如何產生|由誰選|選出來|怎麼當|直選|會員選|大會選|指定|欽點|內定|交棒給|傳給)/.test(t))return null;
 if(/合作社|社員|連任|補選|出缺|辭職|過世/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'理事長由理事互選產生：有常務理事的，從常務理事中選一人',
 summary:'理事長不是會員大會直接選的，而是分兩步：\n\n1. 會員大會先選出理事、監事。\n2. 理事再開理事會：設有常務理事的，先由理事互選常務理事，再從常務理事中選一人當理事長；沒有設常務理事的，直接由理事互選理事長（人民團體法第17條）。\n\n選舉理事長的理事會，要在大會閉會後第7日起到15日內召開，由原任理事長召集；也可以在大會當天接著開，但要在大會的開會通知裡一併通知（人民團體選舉罷免辦法第12條）。',
 statutes:[P(17),ER(12)],notes:['理事長的連任以一次為限（人民團體法第20條）。'],actions:[{label:'看改選流程',view:'meet',sub:'m-elect'}]};
}
function officerNumbers(t){
 if(!/(理事|監事|理監事|候補)/.test(t))return null;
 if(!/(幾個|幾人|幾名|幾位|多少人|多少個|名額|選幾個|選幾位|選幾名|選幾人)/.test(t)&&!(/候補/.test(t)&&/(是什麼|什麼意思|做什麼|幹嘛)/.test(t)))return null;
 if(/常務|副理事長|召集人|出席|職權|查核|委託|代理|開會|才能|通知|走了|辭|罷免|同意|決議|解任|不夠|不足|[一二兩三四五六七八九十]人|圈|選票|連任|合作社|社員|社區|任期|不足|出缺|剩|最少|至少|\d/.test(t))return null;
 const sub=/候補/.test(t);
 return{direct:true,category:'人民團體會務說明',title:sub?'候補理事、候補監事：正式理監事出缺時依序遞補，名額不超過理監事的三分之一':'理事、監事的名額：理事9到15人、監事至少3人且不超過理事的三分之一，人數要是奇數',
 summary:(sub?'候補理事、候補監事是「備取」：選舉時依得票順序排在正式當選人後面，等理事、監事出缺時，依次遞補（人民團體選舉罷免辦法第17條）。候補的名額不得超過理事、監事名額的三分之一（人民團體法第17條）。\n\n':'')+'理事、監事的名額由章程決定，但有上下限：\n• 下限：理事至少9人，監事至少3人，而且人數要定額、是奇數（人民團體會務輔導辦法第9條）。\n• 理事上限：縣（市）以下的團體不得超過15人（人民團體法第17條）。\n• 監事上限：不得超過理事名額的三分之一。\n• 候補理事、候補監事：可以設，名額不得超過理事、監事名額的三分之一。\n\n舉例：章程訂理事15人，監事最多5人，候補理事最多5人，候補監事最多1人。理事訂9人的話，監事就是3人。',
 statutes:sub?[ER(17),P(17),G(9)]:[P(17),G(9)],notes:['名額要寫在章程裡（人民團體法第12條）；要增減名額，須先修改章程。']};
}
function meetingNoticeChannel(t){
 if(!/(通知)/.test(t))return null;
 if(!/(line|LINE|Line|賴|簡訊|email|e-mail|電子郵件|電郵|訊息|群組|電話|口頭|臉書|FB|書面|紙本|掛號)/.test(t))return null;
 if(/合作社|社員|除名|連署/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'開會通知的方式：法規只要求在期限前「通知」到每位應出席的人',
 summary:'現行法規沒有限定一定要用紙本。規定是：\n• 會員大會：開會15日前，把會議種類、時間、地點和議程通知應出席的人（人民團體法第26條；人民團體會務輔導辦法第10條）。\n• 理事會、監事會：開會7日前通知（人民團體會務輔導辦法第11條）。\n\n所以用LINE、簡訊或電子郵件通知，法規沒有禁止，但要注意兩件事：\n1. 章程如果寫了通知的方式（例如「以書面通知」），就要照章程。\n2. 要能證明每一位都通知到了。不用LINE或沒有讀訊息的會員，要另外用書面或電話補通知，並留下紀錄；日後有人主張沒收到通知，決議的效力可能有爭議。',
 statutes:[P(26),G(10),G(11)],notes:['因緊急事故召開臨時會議的，開會前一日送達通知即可。']};
}
function budgetHowTo(t){
 if(!/(預算|工作計畫)/.test(t))return null;
 if(!/(怎麼編|如何編|怎麼做|怎麼寫|誰編|誰來編|要編|怎麼訂)/.test(t))return null;
 if(/合作社|社員|補助|核銷|魅力/.test(t))return null;
 return{direct:true,category:'社會團體財務報表',title:'年度預算：會計年度開始前由理事會編好，提會員大會通過後報縣府備查',
 summary:'預算由理事會負責編。在會計年度開始前，理事會要編好「年度工作計畫」和「收支預算表」；等年度結束後三個月內編好上年度的工作報告和會計報告（決算），連同當年度的工作計畫、收支預算表，一起提會員大會通過，再報縣府備查（社會團體財務處理辦法第11條）。\n\n編的時候可以這樣想：\n1. 先寫工作計畫：這一年要辦哪些活動、會務。\n2. 再估收入：會費、捐款、補助、其他收入各多少。\n3. 最後排支出：人事、辦公、業務活動等，和工作計畫一項一項對起來。\n\n來不及開大會的，可以先經理事會和監事會（或理監事聯席會議）通過，之後再提大會追認。',
 statutes:[F(11)],notes:[],actions:[{label:'下載財務書表',view:'forms',sub:''}]};
}
function renameGroup(t){
 if(!/(改名|更名|換名字|換名稱|改名稱|名稱變更|變更名稱|名字要改|改會名|(名稱|名字|會名).{0,4}(可以|能不能|可不可以|怎麼|要)改)/.test(t))return null;
 if(/合作社|社員|社區|理事長|證書上|負責人/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'協會改名：名稱寫在章程裡，要走修改章程的程序再報縣府',
 summary:'可以改，但不是理事會決定就好。團體名稱是章程必須記載的事項（人民團體法第12條），所以改名就是修改章程：\n\n1. 理事會先討論新名稱，列入會員大會的提案。\n2. 召開會員大會：會員過半數出席，出席人數三分之二以上同意（人民團體法第27條）。\n3. 大會通過後30日內，把修改後的章程和會議紀錄報縣府核備（人民團體法第54條）。\n\n新名稱不能和已經許可的團體相同，也不能讓人誤以為和政府機關或營利團體有關（人民團體法第7條），建議開會前先用「團體查詢」查一下有沒有同名的團體。\n\n核備之後，立案證書、圖記、統一編號的登記資料、銀行帳戶和法人登記（有辦的話）也要跟著更新，細節請洽承辦人。',
 statutes:[P(12),P(27),P(54),P(7)],notes:[],actions:[{label:'查詢團體名稱',view:'search',sub:''},{label:'聯絡承辦',view:'contact',sub:''}]};
}
function certificateLost(t){
 if(!/(立案證書|證書|當選證明)/.test(t))return null;
 if(!/(遺失|不見|弄丟|掉了|找不到|毀損|破損|補發|換發|重新申請)/.test(t))return null;
 if(/合作社|社員|會址|地址|搬/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'立案證書遺失或毀損：由理事長檢具申請書向縣府申請補發',
 summary:'可以補發。紙本的立案證書或其他會務證明書遺失、毀損的，由負責人（理事長）檢具申請書並說明理由，向主管機關申請補發或換發（人民團體會務輔導辦法第3條）。\n\n在屏東縣立案的團體，請向縣府社會處該團體的承辦人提出；申請書的格式和要附的文件，請先打電話確認。',
 statutes:[G(3)],notes:['縣府總機 08-7320415，可請總機轉該團體的承辦人。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function dormantGroup(t){
 const gov=/(縣府|主管機關|政府|社會處).{0,8}(解散|廢止|撤銷|註銷)|被(解散|廢止|撤銷)/.test(t);
 const idle=/(休會|暫停運作|停一年|恢復運作|重新運作|重新開始運作|沒運作|沒有運作|沒在運作|停擺|沒在動|沒活動|都沒開會|沒開會|停止運作|空殼|放著不管|荒廢|沒人管|好幾年沒|停止活動|停止會務|暫停活動|暫停會務|不想辦了|不運作)/.test(t);
 if(!gov&&!idle)return null;
 if(/合作社|社員|決議|理事長.{0,4}(不開|不召開)/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:gov?'主管機關可以解散協會：通常先警告、限期改善，限期整理沒完成才解散':'協會很久沒運作：可以恢復開會改選，或經會員大會決議解散',
 summary:(gov?'會，但有先後順序，不會一下子就解散。\n\n團體有違反法令、章程或妨害公益的情形（例如長期不開會、任期屆滿不改選），主管機關可以先警告、撤銷決議、停止業務並限期改善；逾期不改善或情節重大的，才會撤免職員、限期整理、廢止許可或解散（人民團體法第58條）。被廢止許可，或限期整理沒有如期完成的，就應予解散（人民團體法第59條）。\n\n':'')+'協會停擺了，有兩條路可以走：\n\n1. 恢復運作：請理事長召開理事會和會員大會，辦理改選。理事長不開或聯絡不上的，理事過半數或會員五分之一以上可以書面連署請求召開臨時會員大會（人民團體會務輔導辦法第15條）；會議還是開不成的，可以請縣府指定理事一人召集（人民團體法第32條）。\n\n2. 結束協會：召開會員大會決議解散，要會員過半數出席、出席人數三分之二以上同意（人民團體法第27條），再報縣府。\n\n放著不處理的話，主管機關可以依規定限期整理，甚至廢止許可、解散（人民團體法第58條、第59條）。建議先和承辦人聯絡，說明目前的狀況。',
 statutes:gov?[P(58),P(59),G(15),P(32),P(27)]:[G(15),P(32),P(27),P(58),P(59)],notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function lookupRegistered(t){
 const generic=/(查|找)/.test(t)&&/(一個協會|一個團體|某個|哪裡可以查|哪裡查|去哪查|怎麼查|如何查|可以查到)/.test(t)&&/(協會|團體|理事長|資料|電話|地址)/.test(t);
 if(!generic&&!/(有沒有立案|是否立案|立案了沒|有立案嗎|合不合法|是不是合法|是真的嗎|存不存在|有沒有登記)/.test(t))return null;
 if(!/(查|協會|團體|公會|社團)/.test(t))return null;
 if(/合作社|社員/.test(t))return null;
 return{direct:true,category:'團體查詢',title:'查協會的資料或有沒有立案：直接輸入團體名稱就能查',
 summary:'請直接在下面輸入團體的名稱（例如「屏東縣商業會」），我會比對屏東縣政府社會處的立案名冊，告訴您這個團體是不是存續中、理事長是誰、由哪位承辦人負責。\n\n記不清楚全名也沒關係，輸入名稱裡的兩三個字，或到「團體查詢」頁用鄉鎮和類別篩選。\n\n名冊收錄的是在屏東縣政府立案的社會團體和職業團體；全國性團體（向內政部立案）、合作社和社區發展協會不在這份名冊裡。',
 statutes:[],notes:[],actions:[{label:'前往團體查詢',view:'search',sub:''}]};
}
function coopWithdraw(t){
 if(!/(合作社|社員)/.test(t))return null;
 if(!/(退社|退股|退出|退還股金|領回股金|拿回股金)/.test(t))return null;
 if(/除名|過世|死亡|繼承/.test(t))return null;
 return{direct:true,category:'合作社會務',title:'合作社社員可以退社：年度終了時退，三個月前提出，股金依章程退還',
 summary:'可以。社員可以在年度終了的時候退社，但要在三個月前提出請求書；章程可以把這個期間延長到六個月（合作社法第27條）。\n\n退社之後，可以依章程的規定請求退還股金的一部或全部；金額是依合作社營業年度終了時的財產狀況計算，章程另有規定的依章程（合作社法第30條）。所以合作社有虧損的時候，退回來的不一定等於當初繳的金額，也不是提出當天就能領。\n\n建議先看章程裡關於退社和退還股金的規定，再用書面向合作社提出，並留下送達的證明。',
 statutes:[C(27),C(30)],notes:[]};
}
function groupTypeDifference(t){
 if(/工會/.test(t)&&/公會/.test(t)&&/(差在哪|差別|不一樣|不同|有什麼分別|怎麼分|區別|比較)/.test(t))return{direct:true,category:'業務分流',title:'工會和公會不一樣：工會是勞工組成的，公會是同業或同一職業的人組成的',summary:'名字只差一個字，但是兩種不同的團體：\n\n• 工會：由勞工組成，目的是保障勞工的權益，依工會法辦理，主管機關是勞工主管機關。在屏東縣請洽勞動暨青年發展處（08-7558048）。\n\n• 公會：屬於職業團體，由同一個行業的單位，或同一種職業的從業人員組成，目的是協調同業關係、增進共同利益（人民團體法第35條），主管機關是縣政府社會處。商業同業公會、工業同業公會另外適用商業團體法、工業團體法；醫師、社工師等專業公會，另外看各自的專業法律。\n\n簡單分：受僱的勞工組織起來是工會；老闆、同業或專業人員組織起來是公會。',statutes:[P(35)],notes:[]};
 const kinds=[/協會|社會團體|社團/,/公會|職業團體|工會/,/合作社/].filter(r=>r.test(t)).length;
 if(kinds<2)return null;
 if(!/(差在哪|差別|不一樣|不同|有什麼分別|怎麼分|區別|比較)/.test(t))return null;
 if(/社區發展/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'協會、公會、合作社的差別：目的不同，依據的法律也不同',
 summary:'簡單說，是「為了什麼而組成」不一樣：\n\n• 協會（社會團體）：為了文化、學術、醫療、衛生、宗教、慈善、體育、聯誼、社會服務等公益目的，由個人或團體組成（人民團體法第39條）。誰都可以依章程加入。\n\n• 公會（職業團體）：由同一個行業的單位，或同一種職業的從業人員組成，目的是協調同業關係、增進共同利益（人民團體法第35條）。醫師、社工師等專業公會，另外還要看各自的專業法律。\n\n• 合作社：社員共同出資、共同經營，目的是改善社員的經濟利益和生活，本身就是法人（合作社法第1條、第2條）。它依的是合作社法，不是人民團體法，社員要認購股金，結餘可以依規定分配。\n\n想辦公益活動、聯誼或服務，通常是成立協會；同業要組織起來，是公會；想一起做生意、共同採購或共同銷售，才是合作社。',
 statutes:[P(39),P(35),C(1),C(2)],notes:['工會（勞工組成）依工會法，由勞工主管機關主管，和公會不同。']};
}
/* ── 2026-11-11 使用者提供 FAQ 五題（逐條核對後收錄） ── */
function foundingCost(t){
 if(!/(成立|籌組|立案|設立|創立|籌備)/.test(t))return null;
 if(!/(多少錢|費用|規費|要錢|收費|繳費|繳錢|花多少|要花|資本額|立案費|申請費|成本|免費)/.test(t))return null;
 if(/合作社|社員|會費|入會費|常年會費|法人登記|研習|課程|活動/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'成立協會要多少錢：法律沒有規定資本額，主要是籌備過程的實際開銷',
 summary:'成立協會不用先準備一筆「資本額」。人民團體法規定的是程序：30位以上成年的發起人提出申請（第8條），經許可後開發起人會議、組籌備會、開成立大會（第9條），成立大會後30日內報請立案（第10條），條文裡沒有要求繳交固定金額。\n\n實際會花到的錢，大致是籌備過程的開銷：\n• 刻製圖記（印章）。圖記由協會自己刻製，再把印模送縣府備查（第10條）。\n• 文件的印製和郵寄。\n• 發起人會議、籌備會、成立大會的場地和雜支。\n\n另外兩種「錢」不要混在一起：\n• 入會費、常年會費：是協會成立之後依章程向會員收的收入，不是政府收的成立費用。\n• 法人登記：立案之後如果要向法院登記為社團法人（第11條），法院的費用另計。\n\n至於縣府受理立案申請收不收規費，請直接向承辦人確認。',
 statutes:[P(8),P(9),P(10),P(11)],notes:['縣府總機 08-7320415，可請總機轉人民團體的承辦人。'],actions:[{label:'看成立流程',view:'biz',sub:'social'},{label:'聯絡承辦',view:'contact',sub:''}]};
}
function prepMeetingCount(t){
 if(!/(籌備會|籌備會議|籌備委員)/.test(t))return null;
 if(!/(幾次|多少次|一次|兩次|二次|三次|次數|開幾|要開)/.test(t))return null;
 if(/合作社|社員/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'籌備會要開幾次：法律沒有規定次數，把該決定的事情決定完就可以',
 summary:'法律沒有規定籌備會一定要開兩次或三次。人民團體法第9條只規定順序：經許可設立後，先開發起人會議、推選籌備委員、組成籌備會，籌備完成後再開成立大會。\n\n所以重點是「籌備完成」：章程草案、會員入會的審查、工作計畫和預算、成立大會的時間地點和議程，這些事情如果一次會議就能決定完，不需要為了湊次數再多開；一次討論不完，就再開。\n\n要注意兩件事：\n• 每一次籌備會和成立大會，都要通知主管機關，主管機關可以派員列席（第9條）。\n• 發起人會議、籌備會、成立大會是三種不同的會議，不能合成一場，紀錄也要分開。',
 statutes:[P(9)],notes:['屏東縣的作業上對籌備會有沒有其他要求，請向承辦人確認。'],actions:[{label:'看成立流程',view:'biz',sub:'social'},{label:'聯絡承辦',view:'contact',sub:''}]};
}
function assemblyShortOfQuorum(t){
 if(!/(會員大會|大會|會員代表大會)/.test(t))return null;
 if(!/(人數不夠|人數不足|不足額|沒過半|未過半|未達半數|不到一半|流會|出席不足|來的人太少|人太少|沒到齊|湊不到|開不成)/.test(t))return null;
 if(/合作社|社員|理事會|監事會/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'會員大會出席人數不夠：不能表決或選舉，要重新召集',
 summary:'出席沒有過半，這次會議就不能作成決議，也不能辦選舉。會員大會的決議，要有會員（會員代表）過半數出席才算數（人民團體法第27條）。例如會員30人至少要16人、50人至少要26人、100人至少要51人。\n\n當天請這樣處理：\n1. 把實際出席的人數記下來，簽到表留存，宣布流會。\n2. 另外訂日期重新召集，一樣要在15日前通知會員，並報請主管機關派員列席（第26條）。\n3. 重開的那一次，出席門檻還是過半數，不會因為是第二次就降低。\n\n想提高出席率，可以用委託出席：社會團體的會員不能親自到場時，可以用書面委託其他會員代理，受委託的人算在出席人數裡，每位會員只能代理一人（第42條）。\n\n如果長期都開不成，請和承辦人聯絡；大會不能依法召開時，主管機關可以指定理事一人召集（第32條）。',
 statutes:[P(27),P(26),P(42),P(32)],notes:['開會前先由理事會審定會員名冊（人民團體會務輔導辦法第10條），已經出會或喪失資格的會員不列入，應出席人數才會正確。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function twoCommunityAssociations(t){
 if(!/(社區發展協會|社區協會|社區)/.test(t))return null;
 if(!/(兩個|二個|2個|第二個|另一個|再成立|再設|重複|可以有幾個|能有幾個|只能有一個|只能一個|已經有)/.test(t))return null;
 if(!/(村|里|社區)/.test(t)||/合作社|社員|理事|監事|幾個人|發起人/.test(t))return null;
 return{direct:true,category:'社區發展協會',title:'一個村可以有兩個社區發展協會嗎：現行規定沒有明文禁止，要由公所和縣府審查',
 summary:'不能直接說一定可以，也不能說一律不行。\n\n現行的規定是這樣：\n• 社區發展協會的組織區域以村里為單位，原則上不超出鄉（鎮、市、區）的行政區域範圍，由鄉（鎮、市、區）公所輔導居民依法設立（社區發展工作要點第4點）。要點沒有寫「一個村里只能有一個」。\n• 社區發展協會的設立適用人民團體法（要點第17點）；人民團體法允許同一組織區域內成立兩個以上同級同類的團體，但名稱不能和已經許可的團體相同（人民團體法第7條）。\n\n所以同一個村已經有社區發展協會，還想再成立一個，要看組織區域怎麼劃、名稱怎麼區別，以及公所和縣府的審查。建議先到所在地的鄉鎮市公所，說明想服務的範圍，再提出申請。\n\n補充：以前「由公所劃定社區範圍」的依據是社區發展工作綱要，已經在114年7月1日廢止，改用社區發展工作要點。',
 statutes:[CDP(4),CDP(17),P(7)],notes:['屏東縣和各公所對社區發展協會的設立如果另有作業規定，以公所和縣府的說明為準。'],actions:[{label:'看社區發展協會成立',view:'biz',sub:'community'},{label:'聯絡承辦',view:'contact',sub:''}]};
}
function villageChiefAsChair(t){
 const m=t.match(/村里長|村長|里長|鄰長|鄉民代表|鎮民代表|市民代表|代表會主席|議員|鄉長|鎮長|市長/);
 if(!m)return null;
 if(!/(理事長|理事|監事|幹部|會員)/.test(t))return null;
 if(!/(可以|能不能|可不可以|能否|兼|當|擔任|同一人)/.test(t))return null;
 if(/合作社|社員|總幹事|工作人員/.test(t))return null;
 const who=m[0],cd=/社區/.test(t),org=cd?'社區發展協會':'協會';
 return{direct:true,category:cd?'社區發展協會':'人民團體會務說明',title:who+'可以當'+org+'的理事長或理監事：人民團體法沒有禁止，但要經過選舉',
 summary:'可以。人民團體法'+(cd?'和社區發展工作要點都':'')+'沒有禁止'+who+'擔任'+org+'的理事長或理事、監事。\n\n不過不是因為身分就自動當選，要照一般的程序：先依章程入會成為會員，由會員大會選為理事（人民團體法第17條），再由理事互選為理事長；理事長連任以一次為限（人民團體法第20條）。\n\n同時有公職身分的人，要注意：\n• 協會的錢和公務的經費要分開，帳目各自獨立。\n• 協會向政府申請補助時，可能有公職人員利益衝突迴避法的身分揭露和迴避問題，申請前請先向補助機關確認。'+(cd?'\n\n要點本來就希望協會和村里辦公處多協調、聯繫（社區發展工作要點第10點），但兩者是不同的組織。':''),
 statutes:cd?[P(17),P(20),CDP(10)]:[P(17),P(20)],notes:['公職人員本身能不能兼任，另依各該身分適用的法令（例如公務員服務法），請向服務機關確認。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
/* ── 2026-11-11 第三輪深層校正 ── */
function officerAsFinanceStaff(t){
 if(!/(理事長|理事|監事|常務)/.test(t))return null;
 if(!/(會計|出納|財務人員|管帳|管錢|記帳)/.test(t))return null;
 if(!/(兼|當|擔任|做|來管|負責)/.test(t))return null;
 if(/合作社|社員|公會|職業團體|太太|先生|配偶|兒子|女兒|親戚|親屬|家人/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'理事、監事不能兼任會計或出納：財務人員是工作人員，不得由理監事擔任',
 summary:'不可以。辦理會計、出納和財物管理的人是協會的財務人員（社會團體財務處理辦法第17條），屬於工作人員；而工作人員不得由選任的職員，也就是理事、監事擔任（社會團體工作人員管理辦法第4條）。\n\n監事尤其不適合：協會的財務是由監事會負責查核的（社會團體財務處理辦法第22條），監事自己記帳、自己查帳，等於沒有人監督。\n\n協會人手不夠的話，法規允許的做法是：財務人員原則上要專任，但編制不足時，可以由其他工作人員兼辦（同辦法第17條）。也就是可以請總幹事或幹事兼管帳，但不能由理監事來做。',
 statutes:[F(17),SW(4),F(22)],notes:['提用存款時，要由理事長、總幹事（秘書長）和財務人員在領款憑證上共同蓋章（社會團體財務處理辦法第17條）。']};
}
function electionShowOfHands(t){
 if(!/(選舉|改選|選理事|選監事|選理監事|選理事長|投票|選)/.test(t))return null;
 if(!/(舉手|鼓掌|口頭|推舉|推派|用喊的|協調產生|不用投票|不投票|記名)/.test(t))return null;
 if(/合作社|社員|議案|提案|表決議/.test(t)||/無記名/.test(t)&&!/可以/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'選舉不能用舉手或鼓掌通過：理事、監事和理事長都要無記名投票',
 summary:'不可以。人民團體的選舉一律用無記名投票：應選名額只有一名的（例如選理事長），用無記名單記法；兩名以上的（例如選理事、監事），用無記名連記法（人民團體選舉罷免辦法第4條）。舉手、鼓掌通過或口頭推舉，都不符合「無記名」的要求，選舉結果可能有效力上的爭議。\n\n補充兩點：\n• 以集會方式選舉時，經出席人數三分之一以上同意，可以改用無記名限制連記法，圈選的名額不超過應選名額的二分之一（同條）。\n• 選舉要在同一個地點以集會方式辦理（同辦法第3條）。\n\n一般議案的表決方式（舉手、投票）則依章程和會議規則，和選舉不同。',
 statutes:[ER(4),ER(3)],notes:[],actions:[{label:'看改選流程',view:'meet',sub:'m-elect'}]};
}
function directorProxyVote(t){
 if(!/(理事|監事)/.test(t)||/理事長.{0,6}(代理|出缺)|代理理事長/.test(t))return null;
 if(!/(委託|代理|代替|代投|代為|請別人|找人代)/.test(t))return null;
 if(/大會|合作社|社員|公會|幾個人|幾人/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'理事、監事不能委託別人出席或投票：要親自出席理事會、監事會',
 summary:'不可以。理事、監事要親自出席理事會、監事會，不能委託別人代理（人民團體法第31條），所以也不能請別人代為投票或表決。\n\n不能到場的話，請事先請假。要注意：連續二次無故缺席，會視同辭職，由候補理事、候補監事依次遞補（同條）。\n\n會員大會就不一樣：社會團體的會員不能親自出席會員大會時，可以用書面委託其他會員代理，每位會員只能代理一人（人民團體法第42條）。',
 statutes:[P(31),P(42)],notes:[]};
}
function memberAdmissionWho(t){
 if(!/(入會|加入協會|新會員|成為會員)/.test(t))return null;
 if(!/(誰同意|誰決定|誰審|審查|審核|要經過|怎麼申請|程序|手續|流程|怎麼加入|如何加入|怎麼辦|條件|資格)/.test(t))return null;
 if(/合作社|社員|公會|職業團體|未滿|未成年|歲|拒絕|不讓|臨時|當天|外縣市|外國|外籍|全體|滿一年/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'新會員入會：依章程辦理，一般是填申請書、經理事會通過、繳會費',
 summary:'入會的資格和程序由各協會的章程規定，「會員入會、出會與除名」是章程一定要寫的事項（人民團體法第12條）。\n\n依屏東縣的社會團體章程範例，流程是：\n1. 填寫入會申請書。\n2. 提理事會審查通過。\n3. 繳納入會費和常年會費，之後才成為會員。\n\n所以不是理事長或總幹事一個人同意就算數，要看章程寫由誰審查；多數協會是理事會。入會之後，協會要更新會籍資料（人民團體會務輔導辦法第10條）。',
 statutes:[P(12),G(10),{title:'屏東縣社會團體章程草案範例第7條（入會經理事會通過）',source:'本站書表下載｜申請表'}],notes:['公會等職業團體不得拒絕具有會員資格的人入會（人民團體法第37條），和一般協會不同。'],actions:[{label:'下載書表',view:'forms',sub:''}]};
}
function memberRosterReport(t){
 if(!/(會員名冊|會籍|名冊)/.test(t)||/理監事名冊|職員名冊|簡歷冊/.test(t))return null;
 if(!/(報|送|備查|核備|更新|異動|多久|要不要|需要|怎麼辦|怎麼做|怎麼造|怎麼整理)/.test(t))return null;
 if(/合作社|社員|格式|範本|下載|哪裡/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'會員名冊：立案時要送縣府；平時由協會自己更新，開大會前由理事會審定',
 summary:'會員名冊主要是協會自己要維護好的資料，法規明文要求的有三個時點：\n\n1. 申請立案時：成立大會後30日內，要檢具章程、會員名冊和選任職員簡歷冊報請核准立案（人民團體法第10條）。\n2. 平時：協會要建立會籍資料，會員有入會、出會的異動要隨時更新（人民團體會務輔導辦法第10條）。\n3. 開會員大會前：理事會要在開會15日前審定可以出席的會員資格，造具名冊，寫明姓名、聯絡電話、地址和權利義務受限制的情形，並提供會員閱覽（同條）。辦理選舉或罷免時也一樣（人民團體選舉罷免辦法第5條）。\n\n立案之後依規定要在30日內報縣府核備的異動，是章程、選任職員簡歷冊和負責人名冊（人民團體法第54條），條文沒有列會員名冊。不過縣府在個別案件（例如改選報備）要求附上名冊時，請依承辦人的通知辦理。',
 statutes:[P(10),G(10),ER(5),P(54)],notes:[],actions:[{label:'下載書表',view:'forms',sub:''},{label:'聯絡承辦',view:'contact',sub:''}]};
}
function attendanceFeeAmount(t){
 if(!/(出席費|車馬費|交通費)/.test(t))return null;
 if(!/(多少|標準|上限|可以發|能發|怎麼發|金額)/.test(t))return null;
 if(/合作社|社員|魅力|補助|核銷|講師/.test(t))return null;
 return{direct:true,category:'人民團體財務',title:'理監事的出席費、交通費：法規沒有訂固定金額，參照政府機關的標準酌發',
 summary:'法規沒有訂一個固定的數字。理事、監事是無給職（人民團體法第21條），不能領薪水；但因為執行職務的需要，協會可以參照政府機關所定的標準酌發出席費，或按搭乘的交通工具憑票證酌發交通費（社會團體財務處理辦法第19條）。\n\n所以實際要發多少，由協會在這個原則下自己訂，建議：\n• 經理事會討論，列入年度預算，再提會員大會通過。\n• 金額不要高過政府機關開會出席費的標準。\n• 發放時留下簽收的憑證；交通費要有票證。',
 statutes:[P(21),F(19)],notes:['這裡說的是協會自己的經費。用政府補助款支付出席費，要另外依補助計畫的標準。']};
}
function auditByCPA(t){
 if(!/(會計師|簽證|查核簽證)/.test(t))return null;
 if(/合作社|社員|公會|勸募/.test(t))return null;
 return{direct:true,category:'社會團體財務報表',title:'決算金額1,500萬元以上的協會，可以委請會計師簽證',
 summary:'社會團體的決算金額在新臺幣1,500萬元以上的，「得」委請會計師簽證（社會團體財務處理辦法第11條第2項）。條文用的是「得」，是可以，不是一定要；決算沒有到1,500萬元的，條文沒有這項規定。\n\n不論有沒有會計師簽證，協會的財務都要由監事會查核（同辦法第22條），年度的會計報告也要提會員大會通過後報縣府備查（同辦法第11條）。',
 statutes:[F(11),F(22)],notes:['申請政府補助或辦理公益勸募時，補助機關或相關法規如果另外要求會計師查核，依各該規定。']};
}
function financeAnnounce(t){
 if(!/(公告|公開|公布|公佈)/.test(t))return null;
 if(!/(財務|帳|收支|報表|決算|經費)/.test(t))return null;
 if(/合作社|社員|勸募|募款|檢舉|會員.{0,4}(看|查)/.test(t))return null;
 return{direct:true,category:'人民團體財務',title:'協會的財務收支要定期公告：法規沒有指定地點，讓會員看得到就可以',
 summary:'要公告。社會團體處理財務收支，不得有匿報或虛報，並應定期公告（社會團體財務處理辦法第20條）。\n\n至於公告在哪裡、多久一次，條文沒有規定，由協會自己決定，重點是讓會員看得到。常見的做法是貼在會址的公布欄、印在會員大會手冊裡，或放在協會的網站、通訊群組。建議把公告的方式和頻率寫進章程或經理事會決議，以後就照著做。\n\n每年的工作報告和會計報告，另外還要提會員大會通過，再報縣府備查（同辦法第11條）。',
 statutes:[F(20),F(11)],notes:[]};
}
function coopBasics(t){
 if(!/合作社/.test(t))return null;
 if(/(社員大會|開會|開大會)/.test(t)&&/(要開|多久|幾次|一定要|要不要|每年|通知)/.test(t)&&!/委託|出席|人數|決議|解散/.test(t))
  return{direct:true,category:'合作社會務',title:'合作社每年至少要開一次社員大會，開會7日前書面通知',
  summary:'要。合作社的會議頻率，法律有明文規定（合作社法第45條）：\n• 社員大會：每年至少一次。\n• 社務會：每六個月至少一次。\n• 理事會、監事會：每三個月至少一次。\n\n社員大會由理事會召集，要在7日前用書面寫明召集事由和提議事項，通知社員（合作社法第46條）。\n\n要特別注意：連續二年沒有召開年度社員大會，經主管機關限期召開仍然不開的，主管機關可以命令解散（合作社法第55條之1）。',
  statutes:[C(45),C(46),C('55-1')],notes:[]};
 if(/(解散|結束|收掉|不做了)/.test(t)&&/(可以|怎麼|如何|程序|要多少|幾分之|流程)/.test(t)&&!/財產|資產|工資|債|登記被撤/.test(t))
  return{direct:true,category:'合作社會務',title:'合作社可以決議解散：全體社員四分之三出席、出席三分之二同意',
  summary:'可以。合作社解散的原因之一，就是社員大會決議解散；這項決議要有全體社員四分之三以上出席，出席社員三分之二以上同意（合作社法第55條）。\n\n決議之後還有三件事：\n1. 一個月內向主管機關聲請解散登記，並附社員大會的會議紀錄（合作社法第57條）。沒有如期辦理的，主管機關可以直接公告廢止登記。\n2. 一個月內分別通知各債權人並公告，給一個月以上的期限讓債權人提出異議（合作社法第59條）。\n3. 進行清算：清算人原則上由理事擔任，章程另有規定或社員大會另外選任的除外（合作社法第60條）。\n\n另外，社員不滿7人，或章程所定的解散事由發生，合作社也會解散（合作社法第55條）。',
  statutes:[C(55),C(57),C(59),C(60)],notes:[]};
 return null;
}
/* ── 2026-11-12 使用者提供 FAQ 第二批（逐條核對後收錄） ── */
const PT_GRANT=n=>({title:'屏東縣政府對民間團體補助經費作業要點第'+n+'點（111年2月16日修正）',source:'屏東縣政府111年2月16日屏府社政字第11103971000號函修正，111年3月1日生效'});
function advisorAppoint(t){
 if(!/(顧問|榮譽顧問|名譽顧問)/.test(t))return null;
 if(!/(聘|怎麼|如何|可以|能不能|誰決定|表決|投票|幾個|要不要報|報備|資格)/.test(t))return null;
 if(/合作社|社員|法律顧問費|顧問費可以核銷|補助/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'協會聘顧問：法規沒有規定，依章程辦理，一般由理事長提名、理事會通過',
 summary:'可以聘。人民團體法沒有關於顧問的條文，所以要不要設顧問、怎麼聘，由各協會的章程或內部規定決定。\n\n常見的做法是：理事長提出人選，提理事會討論通過後聘任，並發給聘書。建議在章程或理事會決議裡寫清楚顧問的人數、聘期、要做什麼，以及有沒有支領費用。\n\n要注意三件事：\n• 顧問不是選任的職員。理事、監事是由會員大會選舉產生的（人民團體法第17條），顧問不是，所以在理事會、監事會沒有表決權，可以列席提供意見。\n• 受聘為顧問，不會因此變成會員；要有會員的權利，還是要依章程辦理入會。\n• 聘顧問不必另外報縣府。依規定要在30日內報核備的異動，是章程、選任職員簡歷冊和負責人名冊（人民團體法第54條），不包括顧問。',
 statutes:[P(17),P(54)],notes:['榮譽理事長、名譽理事長也是一樣的道理：屬於榮譽性質，不是選任職員。']};
}
function sealKeeper(t){
 if(!/(圖記|印章|印信|大小章|會章|印鑑|關防)/.test(t))return null;
 if(!/(誰保管|保管|誰管|放在誰|由誰|放哪|誰拿|可以保管|帶走|拿走)/.test(t))return null;
 if(/合作社|社員|遺失|不見|弄丟|不交|不移交|不還|拒絕/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'協會印章由誰保管：法規沒有指定，由章程或理事會決定；改選時要移交新任理事長',
 summary:'平時由誰保管，法規沒有指定，要看協會的章程、內部規定或理事會的決議。\n\n法規有規定的是這三點：\n1. 圖記（協會的大印）由協會自己刻製，並把印模送縣府備查（人民團體法第10條）。\n2. 改選時要移交：每屆改選前，要把立案證書、圖記、檔案、財務等資料造具清冊；新任理事長就任後，連同立案證書和圖記移交給新任理事長和監交人，15日內接收完畢（人民團體會務輔導辦法第18條）。所以圖記不是哪一位理事長私人的東西。\n3. 領錢要三個章：提用存款時，要由理事長、總幹事（秘書長）和財務人員在領款憑證上共同蓋章（社會團體財務處理辦法第17條）。\n\n實務上建議：\n• 圖記、理事長的職章、銀行的印鑑分給不同的人保管，不要全部放在同一個人手上。\n• 準備一本用印登記簿，記下日期、用途、誰核准、誰蓋的。\n• 保管人換人的時候，寫一張交接單，雙方簽名。',
 statutes:[P(10),G(18),F(17)],notes:[]};
}
function assocTravel(t){
 if(!/(旅遊|出遊|自強活動|遊覽|旅行|一日遊|二日遊|兩日遊|進香|出國)/.test(t))return null;
 if(!/(協會|團體|社團|老人會|婦女會|我們|本會|會員|補助)/.test(t))return null;
 if(!/(可以|能不能|可不可以|能否|辦|舉辦|補助|核銷|申請)/.test(t))return null;
 if(/合作社|社員|魅力|好讚|勸募/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'協會可以辦旅遊，但旅遊性質的交通費、餐費、住宿費，縣府不予補助',
 summary:'可以辦。會員旅遊、聯誼、參訪這類活動，只要符合章程所定的宗旨和任務，法規沒有禁止。\n\n錢的部分要分清楚：\n\n1. 用協會自己的經費辦：建議列入年度工作計畫和收支預算，提會員大會通過（社會團體財務處理辦法第11條）；向會員收費的，要開收據、入帳（同辦法第17條）。\n\n2. 想申請縣府補助：旅遊性質的交通費、餐費和住宿費，屬於不予補助的項目（屏東縣政府對民間團體補助經費作業要點第5點）。所以一般的旅遊、自強活動，不能當成補助計畫來申請。\n\n3. 研習、參訪、觀摩不一樣：和協會宗旨有關的研習、參訪、觀摩活動，鐘點費、場地費、印刷費、交通費、保險費等是可以申請的項目（同要點第5點），但能不能補助、補助多少，還是要經過審查。把旅遊改個名字叫「參訪」沒有用，審查看的是實際的內容。\n\n另外，會員大會、理監事會議和例行會議，也是不予補助的項目。',
 statutes:[F(11),F(17),PT_GRANT(5)],notes:['對外公開招攬、收費辦旅遊，涉及旅行業的業務，請委由合法的旅行社辦理，並記得幫參加的人投保。','個別補助計畫另有標準的，以該計畫的核定函為準。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function activityReport(t){
 if(!/(活動|辦理|舉辦)/.test(t)||!/活動/.test(t))return null;
 if(!/(報備|報縣府|報社會處|要報|核准|許可|事先申請|要申請|備查|通知縣府|通知主管)/.test(t))return null;
 if(/合作社|社員|勸募|募款|補助|核銷|魅力|取消/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'協會辦活動要報備嗎：一般活動不用逐場報縣府社會處，但有幾種情形要另外辦',
 summary:'不一定。協會依章程的宗旨辦理一般的活動，例如會員聯誼、公益服務、講座，不需要每一場都向縣府社會處報備。\n\n但下面幾種情形，各有要辦的手續：\n• 會員大會：開會15日前通知會員，並報請主管機關派員列席（人民團體法第26條）；會議紀錄在閉會後30日內報縣府備查（人民團體會務輔導辦法第12條）。\n• 理事會、監事會：開會7日前通知，紀錄自行留存；決議的事項依法令要報核的，再檢附文件辦理（同辦法第11條、第12條）。\n• 公開向社會大眾募款或募物資：要先取得勸募許可（公益勸募條例第7條）。\n• 使用道路、公園、廣場或大型的戶外活動：要向場地或道路的管理機關申請。\n• 用政府補助辦的活動：依補助計畫和核定函的條件辦理，計畫有變更要先報准。\n\n要提醒的是：不用向社會處報備，不代表其他機關的許可也可以省略。',
 statutes:[P(26),G(12),G(11),CHR(7)],notes:['活動最好列入年度工作計畫，年度結束後寫進工作報告，提會員大會通過（社會團體財務處理辦法第11條）。']};
}
function assocFund(t){
 if(!/基金/.test(t)||/基金會/.test(t)&&!/基金[^會]/.test(t))return null;
 if(!/(協會|團體|社團|我們|本會|準備基金|可以|設|提列)/.test(t))return null;
 if(!/(可以|能不能|設|成立|提列|怎麼|動用|動支|多少)/.test(t))return null;
 if(/合作社|社員|生產建設|社區發展|勸募|股票|投資/.test(t))return null;
 return{direct:true,category:'人民團體財務',title:'協會可以設基金：每年可提列收入20%以下的準備基金，專戶存放，動用要經理事會通過',
 summary:'可以。「基金及其孳息」本來就是人民團體法定的經費來源之一（人民團體法第33條）。\n\n設基金有三個規定要守：\n1. 提列的上限：社會團體可以逐年提列準備基金，每年提列的金額是收入總額的20%以下（社會團體財務處理辦法第15條）。\n2. 專戶存放、動用要決議：基金和它的孳息要專戶存儲，沒有經過理事會通過，不可以動支（同條）。\n3. 帳要分開記：年度的會計報告要包含「基金收支表」（同辦法第12條），和預算、決算一起提會員大會通過，再報縣府（人民團體法第34條）；決算要先送監事會審核。\n\n如果想設的是有特定用途的專款，例如獎助學金、急難救助，建議由理事會訂一份管理辦法，寫清楚錢從哪裡來、可以用在哪裡、誰核准動用，再提會員大會通過。\n\n要分清楚的是：協會內部設基金，不等於成立「基金會」。基金會是財團法人，要另外依財團法人法向主管機關申請設立。',
 statutes:[P(33),F(15),F(12),P(34)],notes:['基金的來源如果要對外公開募款，要另外依公益勸募條例申請許可。']};
}
/* ── 2026-11-12 換句話說測試（153 題）後補上的直接回答 ── */
function annualMeetings(t){
 if(!/(每年|一年|年度|每一年|固定|定期|一定要開)/.test(t))return null;
 if(!/(開.{0,4}(什麼|哪些|幾次|幾場|多少次)會|(什麼|哪些)會|幾次會|開幾次|要開的會|哪些會議|什麼會議)/.test(t))return null;
 if(/合作社|社員|理事會多久|監事會多久/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'協會每年要開的會：會員大會一年一次，理事會、監事會至少每六個月一次',
 summary:'一般協會（社會團體）每年固定要開的會有三種：\n\n1. 會員大會：定期會議每年召開一次，由理事長召集（人民團體法第25條）。開會15日前通知會員，並報請縣府派員列席（第26條）。每年的工作報告、決算、工作計畫和預算，都是在這個會議通過。\n\n2. 理事會：至少每六個月開一次（人民團體法第43條），也就是一年至少兩次。\n\n3. 監事會：也是至少每六個月開一次（第43條）。\n\n章程可以規定開得更密，例如每三個月一次，但不能比上面的次數少。\n\n另外還有「臨時會議」：理事會認為有必要、會員五分之一以上請求，或監事會函請召集時，要召開臨時會員大會（第25條）。',
 statutes:[P(25),P(26),P(43)],notes:['公會等職業團體的理事會、監事會是每三個月至少一次（人民團體法第29條）。合作社依合作社法，另有規定。'],actions:[{label:'看會議怎麼開',view:'meet',sub:''}]};
}
function chairTermLimit(t){
 if(!/理事長/.test(t))return null;
 if(!/(兩任|二任|兩屆|二屆|第三任|第三屆|三任|三屆|再選|再當|再做|再連任|還能選|還可以選|一直連任|一直做|連任有限制|連任限制|連任的限制|可以連任嗎|能連任嗎|做太久|做很久|當太久|當很久)/.test(t))return null;
 if(/合作社|社員|社區|公會|工會|國際/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'理事長連任以一次為限：連續做滿兩任，下一屆不能再當理事長',
 summary:'有限制。理事、監事可以連選連任，但理事長的連任以一次為限（人民團體法第20條）。也就是同一個人最多連續當兩任理事長；已經連續做滿兩任的，下一屆不能再被選為理事長。\n\n要分清楚的是：\n• 限制的只有「理事長」這個職位。卸任的理事長如果還是會員，仍然可以被選為理事或監事。\n• 每一任最長四年（同條），所以連續擔任理事長最長是八年。\n• 章程可以訂得更嚴格，例如不得連任，但不能放寬成可以連任兩次以上。',
 statutes:[P(20)],notes:['社區發展協會的理事長也適用同樣的限制。'],actions:[{label:'看改選流程',view:'meet',sub:'m-elect'}]};
}
function assemblyQuorum(t){
 if(!/(會員大會|大會|會員代表大會)/.test(t))return null;
 if(!/(多少人|幾個人|幾人|過半|出席人數|才能開|才算|門檻|最少|至少|幾分之|同意|通過|表決)/.test(t))return null;
 if(/合作社|社員|委託|代理|人數不夠|人數不足|沒過半|未過半|流會|通知|幾天|罷免|除名|解散|章程|方式|舉手|投票|記名|視訊|通訊|成立大會|籌備|準備|議程|手冊|理事會通過|哪些事|土地|房子|不動產|連署|要求/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'會員大會要會員過半數出席才能開；一般事項出席過半同意，重大事項要三分之二',
 summary:'會員大會要有全體會員（會員代表）過半數出席，才能作成決議（人民團體法第27條）。例如會員30人，至少要16人；會員100人，至少要51人。出席人數是以簽到或報到的人數計算（人民團體會務輔導辦法第16條），書面委託出席的也算在內。計算「過半數」的基準是全體會員，請假、因公或生病不能來的人不能先扣掉（內政部97年3月6日台內社字第0970038254號函）。\n\n表決的門檻分兩種（人民團體法第27條）：\n• 一般事項：出席人數過半數或較多數同意。\n• 重大事項：出席人數三分之二以上同意。包括章程的訂定和變更、會員的除名、理事和監事的罷免、財產的處分、團體的解散，以及其他和會員權利義務有關的重大事項。\n\n出席不到半數就不能表決或選舉，要重新召集。',
 statutes:[P(27),G(16),{title:'內政部97年3月6日台內社字第0970038254號函（會員大會開會數額）',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256666'}],notes:[],actions:[{label:'看會議怎麼開',view:'meet',sub:''}]};
}
function urgentMeetingNotice(t){
 if(!/(臨時|緊急|來不及|突然|急著)/.test(t)||!/(通知|開會|會議|召開)/.test(t))return null;
 if(/合作社|社員|連署|請求召開/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'緊急召開臨時會議：開會前一天把通知送達就可以',
 summary:'有例外規定。平常開會員大會要在15日前通知、開理事會和監事會要在7日前通知；但因為緊急事故召集臨時會議的，只要在開會前一日把通知送達，就不受這個期限的限制（人民團體法第26條；人民團體會務輔導辦法第11條）。\n\n要注意三點：\n• 要真的是「緊急事故」，不能只是忘了發通知。會議紀錄裡最好寫明緊急的原因。\n• 是「送達」，不是發出去就好，要確認每一位應出席的人都收到了，並留下紀錄。\n• 會員大會還是要報請縣府派員列席（人民團體法第26條），請同時通知承辦人。',
 statutes:[P(26),G(11)],notes:[]};
}
function directorVacancy(t){
 if(!/(理事|監事|理監事)/.test(t)||/理事長|常務/.test(t))return null;
 if(!/(辭職|辭掉|不做了|不幹了|出缺|缺額|人數不夠|人數不足|遞補|補選|過世|往生|退出)/.test(t))return null;
 if(/合作社|社員|不足過半|過半|三分之|\d|[一二兩三四五六七八九十]人|罷免/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'理事、監事出缺：先由候補依次遞補，遞補後不到名額三分之二才要補選',
 summary:'不一定要補選，順序是這樣：\n\n1. 先遞補：理事、監事出缺時，由候補理事、候補監事依次遞補（人民團體選舉罷免辦法第17條）。候補的順序就是當初選舉時的得票順序。\n\n2. 遞補完還不夠，才補選：遞補之後，理事或監事的人數如果沒有達到章程所定名額的三分之二，就應該補選足額（同條）。還在三分之二以上的，可以先不補選。\n\n什麼情形算出缺（人民團體法第23條）：喪失會員資格、辭職經理事會或監事會決議通過、被罷免或撤免、受停權處分的期間超過任期的二分之一。所以理事只是口頭說不做了還不算，要提出書面辭職，經理事會決議通過。\n\n遞補或補選之後，選任職員的名冊有異動，要在30日內報縣府核備（人民團體法第54條）。',
 statutes:[ER(17),P(23),P(54)],notes:['理事長、常務理事、常務監事出缺，是另一回事：要在出缺之日起一個月內補選（人民團體選舉罷免辦法第17條）。']};
}
function recallOfficer(t){
 if(!/(罷免|解任|解除職務|拉下來|換掉理事|換掉監事)/.test(t))return null;
 if(!/(理事|監事|理監事)/.test(t)&&!/罷免.{0,4}(怎麼辦|程序|流程|怎麼做|要幾|門檻|條件)/.test(t))return null;
 if(/合作社|社員|總幹事|不來|缺席|請假|沒來|罷免後|被罷免|誰代理|代理/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'罷免理事、監事或理事長：選舉人三分之一以上連署，出席三分之二以上同意',
 summary:'可以罷免，但有條件和程序。\n\n前提：理事、監事執行職務違反法令、章程或會員大會的決議，可以經會員大會通過罷免（人民團體法第22條）。就任未滿六個月的，不能提出罷免（人民團體選舉罷免辦法第29條）。\n\n程序：\n1. 提案：用書面寫明理由，由選舉人總數三分之一以上簽署，向協會提出，並副知縣府（同辦法第30條）。\n2. 答辯：協會收到後15日內，把罷免書影本通知被罷免的人；對方在收到後15日內可以提出答辯書（同辦法第32條）。\n3. 開會表決：答辯期滿後15日內，召開被罷免人「原來當選的那個會議」，應出席人數過半數出席、出席人數三分之二以上同意，罷免才通過（同辦法第34條；人民團體法第27條）。\n\n「原來當選的會議」是關鍵：理事、監事是會員大會選的，就由會員大會罷免；理事長是理事會選的，就由理事會罷免。\n\n另外，開會人數不足而流會，視為否決（同辦法第35條）；罷免案被否決後，同一任期內不能用同一個理由再提（同辦法第37條）。',
 statutes:[P(22),ER(29),ER(30),ER(32),ER(34),P(27),ER(35),ER(37)],notes:['被罷免的人不能擔任那次會議的主席（人民團體選舉罷免辦法第38條）。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function boardResolution(t){
 if(!/(理事會|監事會|理監事會|理監事聯席|理監事)/.test(t))return null;
 if(!/(決議|通過|同意|表決|幾個人.{0,6}(開|出席)|出席.{0,4}(幾|多少|過半)|才能開|一起開|聯席|合開)/.test(t))return null;
 if(/合作社|社員|委託|代理|不執行|撤銷|無效|紀錄|通知|幾天|罷免|總幹事|解聘|聘|討論|審|財務|財報|月|議程|議題|方式|舉手|投票|記名|視訊|否決|推翻|多少錢|金額|花錢|以上/.test(t)||/[一二兩三四五六七八九十\d]+(人|名|位)/.test(t))return null;
 const joint=/(一起開|聯席|合開|合併開)/.test(t);
 return{direct:true,category:'人民團體會務說明',title:joint?'理事會和監事會可以一起開聯席會議，但出席和表決要分開算':'理事會、監事會：過半數出席才能開，出席過半數同意才通過',
 summary:(joint?'可以。理監事聯席會議要分別經理事長和監事會召集人（常務監事）同意後召集；原則上由兩人共同主持。開會時理事和監事要「各自」過半數出席，表決也是理事算理事的、監事算監事的，各以出席的過半數或較多數同意（人民團體會務輔導辦法第11條）。\n\n':'')+'理事會、監事會的決議，各要有理事、監事過半數出席，出席人數過半數或較多數同意（人民團體法第29條）。例如理事9人，至少要5人出席；出席5人，要3人同意才通過。\n\n幾個要注意的地方：\n• 理事、監事要親自出席，不能委託別人（人民團體法第31條）。\n• 候補理事、候補監事可以列席，但不算出席人數，也沒有表決權（第29條）。\n• 一般協會的理事會、監事會至少每六個月開一次（第43條）。',
 statutes:joint?[G(11),P(29),P(31),P(43)]:[P(29),P(31),P(43)],notes:[],actions:[{label:'看會議怎麼開',view:'meet',sub:''}]};
}
function annualFinanceFiling(t){
 const a=/(預算|決算)/.test(t)&&/(報|送|備查|核備|縣府|主管機關|要不要)/.test(t);
 const b=/(年底|年終|年度結束|每年)/.test(t)&&/(帳|報表|財務|做什麼帳|哪些帳)/.test(t);
 if(!a&&!b)return null;
 if(/合作社|社員|公所|社區|補助|核銷|什麼時候|何時|期限|多久|會計師|怎麼編|超過|哪些財務報表|哪些報表|幾張表|幾項/.test(t))return null;
 return{direct:true,category:'社會團體財務報表',title:'預算和決算每年都要提會員大會通過，再報縣府備查',
 summary:'要。每年要做兩件事（人民團體法第34條；社會團體財務處理辦法第11條）：\n\n1. 年度開始前：理事會編好當年度的工作計畫和收支預算表。\n2. 年度結束後三個月內：理事會編好上年度的工作報告和會計報告（決算），先送監事會審核。\n\n這四樣東西連同監事會的審核意見，一起提會員大會通過，再報縣府備查。來不及開大會的，可以先經理事會和監事會通過，之後再提大會追認。\n\n會計報告要包含四張表（同辦法第12條）：收支決算表、資產負債表、財產目錄、基金收支表。年度決算總收入在300萬元以下的協會，可以用比較簡單的格式。',
 statutes:[P(34),F(11),F(12)],notes:[],actions:[{label:'下載財務書表',view:'forms',sub:''}]};
}
function receiptAndWithdraw(t){
 if(/(領錢|提款|領款|提領|領出來|取款)/.test(t)&&/(章|蓋|簽|誰)/.test(t)&&!/合作社|社員/.test(t))
  return{direct:true,category:'人民團體財務',title:'協會領錢要蓋三個章：理事長、總幹事（秘書長）、財務人員',
  summary:'提用存款時，要由團體負責人（理事長）、秘書長或總幹事、財務人員，三個人在領款憑證上共同蓋章（社會團體財務處理辦法第17條）。\n\n所以開戶的時候，銀行的印鑑通常就是留這三個章，再加上協會的圖記。少一個章就領不出來，這是為了避免錢由一個人說了算。\n\n沒有聘總幹事或專任財務人員的協會，財務人員可以由其他工作人員兼辦（同條），但不能由理事、監事來當（社會團體工作人員管理辦法第4條）。',
  statutes:[F(17),SW(4)],notes:[]};
 if(/收據/.test(t)&&/(自己印|自行印|印製|格式|去哪買|哪裡買|怎麼印|可以印|統一格式|要編號)/.test(t)&&!/合作社|社員|勸募/.test(t))
  return{direct:true,category:'人民團體財務',title:'協會的收據可以自己印：法規沒有統一格式，但要是正式收據並留存根',
  summary:'可以。法規的要求是：協會的經費收入，都要開給正式收據，並留存根備查（社會團體財務處理辦法第17條）。條文沒有規定收據要向誰購買或用哪一種格式，所以協會可以自己設計、印製。\n\n建議收據上要有：協會全名和圖記、連續的編號、日期、繳款人、金額、款項的名目（會費、捐款等）、經手人。一式至少兩聯，一聯給對方，一聯存根留在協會。作廢的收據不要撕掉，註明作廢後連同存根一起保存。\n\n捐款人要拿收據申報所得稅扣除的，收據上的資料要完整。',
  statutes:[F(17)],notes:['經許可的公益勸募活動，收據另外要載明勸募許可文號等事項（公益勸募條例第16條）。'],actions:[{label:'下載書表',view:'forms',sub:''}]};
 return null;
}
function charterContents(t){
 if(!/章程/.test(t))return null;
 if(!/(要寫|寫哪些|寫什麼|載明|內容|包含|必要|一定要有|應該有|有哪些項目|怎麼寫|怎麼訂|怎麼擬)/.test(t))return null;
 if(/合作社|社員|範本|範例|下載|修改|變更|改章程/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'章程一定要寫的12項：名稱、宗旨、組織區域、會址、任務、組織等',
 summary:'人民團體法第12條規定，章程應該載明下面這些事項：\n1. 名稱\n2. 宗旨\n3. 組織區域\n4. 會址\n5. 任務\n6. 組織\n7. 會員入會、出會與除名\n8. 會員的權利與義務\n9. 會員代表及理事、監事的名額、職權、任期及選任與解任\n10. 會議\n11. 經費及會計\n12. 章程修改的程序\n另外還有其他依法令規定應該載明的事項。\n\n不用從頭自己寫，「書表下載」頁有屏東縣的章程草案範例，照著範例把協會自己的名稱、宗旨、名額填進去再調整就可以。章程的訂定要經成立大會通過，以後修改要經會員大會出席人數三分之二以上同意（人民團體法第27條）。',
 statutes:[P(12),P(27)],notes:[],actions:[{label:'下載章程範例',view:'forms',sub:''}]};
}
function dissolveVote(t){
 if(!/解散/.test(t))return null;
 if(!/(多少人|幾個人|幾分之|同意|門檻|決議|表決|通過|誰決定|要開會)/.test(t))return null;
 if(/合作社|社員|財產|資產|剩|縣府.{0,6}解散|被解散/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'協會解散：會員過半數出席、出席三分之二以上同意',
 summary:'解散要由會員大會決議，不是理事會或理事長可以決定的。門檻是：會員（會員代表）過半數出席，出席人數三分之二以上同意（人民團體法第27條）。例如會員60人，至少31人出席；出席31人，至少21人同意。\n\n決議之後：\n1. 把會員大會的會議紀錄報縣府。\n2. 辦理清算：有辦法人登記的，依民法的規定清算；沒有辦法人登記的，依章程或會員大會的決議辦理（人民團體會務輔導辦法第27條）。\n3. 清償債務後剩下的財產，依章程的規定處理，不能分給會員。\n\n會員大會一直開不成的，章程沒有規定時，由理事長或章程所定的代理人擔任清算人（同條）。建議先和承辦人聯絡。',
 statutes:[P(27),G(27)],notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function sealMake(t){
 if(!/(圖記|印章|印信|大印|會章)/.test(t))return null;
 if(!/(怎麼刻|刻|多大|尺寸|規格|大小|幾公分|去哪|誰發|縣府發|樣式|自己做|怎麼辦|怎麼申請|怎麼做|怎麼來)/.test(t))return null;
 if(/合作社|社員|遺失|不見|保管|不交|移交/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'協會的圖記自己刻：長、寬或直徑3公分以上，印模送縣府備查',
 summary:'圖記（協會的大印）不是縣府發的，由協會自己找刻印店製作。規定只有兩項（人民團體法第10條）：\n• 規格：長、寬、直徑或短徑要在3公分以上。形狀和字體沒有限制。\n• 備查：刻好之後，把印模（蓋出來的印文）送縣府備查。\n\n圖記上刻的是協會立案的全名。建議在收到立案證書之後再刻，名稱才會和證書一致。\n\n以後圖記損壞要換新的，一樣是自己重刻，再把新的印模送縣府備查。',
 statutes:[P(10)],notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function memberOnlyFundraising(t){
 if(!/(會員)/.test(t)||!/(募款|募集|勸募|募捐|樂捐|捐款)/.test(t))return null;
 if(!/(只|僅|內部|向會員|跟會員|對會員)/.test(t)||!/(申請|許可|要不要|可以|需要|合法)/.test(t))return null;
 if(/合作社|社員|對外|臉書|網路|不特定/.test(t))return null;
 return{direct:true,category:'人民團體財務',title:'只向會員募款不用申請勸募許可，但金額和方式要經會員大會通過',
 summary:'只向自己的會員募集，不是對社會大眾公開勸募，不需要申請公益勸募許可。\n\n不過還是有規定要守：\n• 會員捐款是協會法定的經費來源之一，它的繳納數額和方式，要提經會員大會通過，並報縣府核備後才能實施（人民團體法第33條）。所以不能由理事長或理事會自己決定每人要捐多少。\n• 收到的每一筆錢都要開正式收據、留存根，並且入帳（社會團體財務處理辦法第17條）。\n• 是自由樂捐，不能強迫，也不能用不捐就停權的方式變相強制。\n\n如果除了會員，還在臉書、LINE群組或公開場合向不特定的人募款，那就是公開勸募，要先取得許可（公益勸募條例第7條）。',
 statutes:[P(33),F(17),CHR(7)],notes:[]};
}
function communityBasics(t){
 if(!/(社區發展協會|社區協會|社區)/.test(t))return null;
 if(/(會員|入會|加入)/.test(t)&&/(住在|設籍|戶籍|居住|住社區|外地|外村|別村|搬走|不住)/.test(t))
  return{direct:true,category:'社區發展協會',title:'社區發展協會的會員資格：現行要點沒有規定一定要設籍居住，依協會章程',
  summary:'要看協會的章程。現行的社區發展工作要點規定，社區發展協會的會員資格和權利，適用人民團體法和相關規定（要點第17點）；而人民團體法是把「會員入會、出會與除名」交給章程規定（人民團體法第12條）。要點本身沒有「一定要設籍並居住在社區」的條文。\n\n所以：\n• 章程寫了要設籍或居住在本社區的，就照章程，搬走之後會員資格會受影響。\n• 章程沒有這樣寫的，就不受這個限制。\n\n以前「設戶籍並居住本社區」的依據是社區發展工作綱要，已經在114年7月1日廢止。很多協會的章程還是照舊的內容寫，要放寬的話，須經會員大會修改章程，再報縣府核備。',
  statutes:[CDP(17),P(12)],notes:['社區發展協會的組織區域以村里為單位（社區發展工作要點第4點）。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 if(/(公所|縣府|社會處|找誰|找哪|哪個單位|主管機關|誰管)/.test(t)&&/(找|問|送|還是|主管|誰管|哪)/.test(t)&&!/補助|魅力|好讚|核銷|決算|報公所|活動中心|場地|出租/.test(t))
  return{direct:true,category:'社區發展協會',title:'社區發展協會先找所在地的鄉鎮市公所，公所和縣府都是主管機關',
  summary:'建議先找所在地的鄉（鎮、市）公所。社區發展的主管機關有三層：中央是衛生福利部，縣是縣政府，鄉鎮市是鄉（鎮、市、區）公所（社區發展工作要點第3點）；其中公所負責輔導社區居民設立社區發展協會（要點第4點），是離社區最近的窗口。\n\n大致的分工是：\n• 公所：成立的輔導、平時會務的輔導、補助計畫的初審和轉送。\n• 縣府社會處：社區發展協會也是依人民團體法立案的團體，設立、組織、會員、財務適用人民團體法（要點第17點）；縣府辦理的補助和評鑑也在這裡。\n\n不確定某一件事該送哪裡，先問公所的社區業務承辦人；或撥縣府總機 08-7320415 轉社會處。',
  statutes:[CDP(3),CDP(4),CDP(17)],notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 return null;
}
function countyPhone(t){
 if(!/(社會處|縣府|縣政府|你們|櫃檯)/.test(t)||!/(電話|幾號|怎麼聯絡|聯絡方式|地址|在哪|上班時間)/.test(t))return null;
 if(/合作社|協會的|老人會|承辦人是誰|理事長/.test(t))return null;
 return{direct:true,category:'聯絡承辦',title:'屏東縣政府社會處：總機 08-7320415，地址屏東市自由路527號',
 summary:'屏東縣政府的總機是 08-7320415，接通後請總機轉社會處，並說明要問的是人民團體、合作社或社區發展協會的業務，就會轉給負責的承辦人。\n\n縣府地址：屏東市自由路527號。\n\n各類團體的承辦人和分機，可以在「聯絡承辦」頁查到；直接在這裡輸入團體的名稱，我也可以告訴您是哪一位承辦。',
 statutes:[],notes:[],actions:[{label:'看承辦人名單',view:'contact',sub:''}]};
}
function nonCompliance(t){
 if(!/(沒有?|不|未|忘了|逾期|過期|太久沒|很久沒)(辦)?(改選|報決算|送決算|報備|報縣府|報會議紀錄)/.test(t))return null;
 if(!/(會怎樣|怎麼樣|被罰|罰款|罰錢|罰則|後果|處分|有事|有關係|可以嗎|會不會|影響)/.test(t))return null;
 if(/合作社|社員|理事長.{0,4}(不開|不召開)/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'沒改選或沒報決算：不是罰錢，而是警告、限期改善，嚴重的會被限期整理或解散',
 summary:'人民團體法對一般協會沒有罰鍰的規定，但不代表沒有後果。\n\n主管機關可以做的處分（人民團體法第58條）：\n1. 先警告、撤銷決議、停止業務的一部或全部，並限期改善。\n2. 逾期不改善或情節重大的，可以撤免職員、限期整理、廢止許可或解散。\n限期整理沒有如期完成的，就應予解散（人民團體法第59條）。\n\n實際上更快感受到的影響是補助：縣府的補助規定把「會務不正常」列為不予補助的情形，例如一年沒有召開會員大會、任期屆滿沒有改選、沒有報送財務資料。\n\n所以建議儘快補正：該開的會補開、該改選的辦改選、該報的資料補報。改選來不及的，可以先向縣府申請延期。不確定從哪裡開始，請先和承辦人聯絡。',
 statutes:[P(58),P(59)],notes:['補正時請照實記載日期，不要用倒填日期的會議紀錄。'],actions:[{label:'看改選流程',view:'meet',sub:'m-elect'},{label:'聯絡承辦',view:'contact',sub:''}]};
}
function memberEligibilityOutside(t){
 if(!/(外縣市|別的縣市|其他縣市|外地|不住屏東|外國人|外籍|新住民|沒有戶籍|戶籍不在)/.test(t))return null;
 if(!/(加入|入會|會員|參加)/.test(t)||/理事|監事|發起人|補助|社區/.test(t))return null;
 if(/合作社|社員/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'外縣市或外國籍的人能不能入會：人民團體法沒有限制，看協會章程的會員資格',
 summary:'要看協會的章程。人民團體法沒有規定會員一定要設籍在哪裡，也沒有限制國籍；「會員入會、出會與除名」是交給各協會的章程規定的（人民團體法第12條）。\n\n所以：\n• 章程的會員資格寫了「設籍或居住在本縣」這類條件的，就要符合才能入會。\n• 章程沒有這樣的限制，只寫「贊同本會宗旨」的，外縣市的人或外國籍人士都可以依章程申請，經理事會審查通過後入會。\n\n請先翻章程裡「會員」那一章；想放寬或加上條件，要經會員大會修改章程，再報縣府核備。',
 statutes:[P(12)],notes:['社區發展協會的會員資格，另外請看該協會的章程。']};
}
function timeDeposit(t){
 if(!/(定存|定期存款|存定期)/.test(t)||/合作社|社員|以外/.test(t))return null;
 return{direct:true,category:'人民團體財務',title:'協會的錢可以存定存：要存在銀行、農會、漁會、信用合作社或郵局，用協會的名義',
 summary:'可以。法規要求協會的財務收入要存入銀行、農會、漁會、信用合作社或郵局，不能存放在其他公私企業或個人那裡（社會團體財務處理辦法第16條）。在這些金融機構、用協會的名義存定期存款，符合這項規定。\n\n要注意：\n• 戶名要是協會，不能用理事長或任何個人的名義。\n• 提領一樣要理事長、總幹事（秘書長）和財務人員共同蓋章（同辦法第17條）。\n• 如果是把錢提列為準備基金，要專戶存儲，沒有經理事會通過不能動用（同辦法第15條）。\n• 建議存定存之前先經理事會決議，並留一部分活期存款支應日常開銷。',
 statutes:[F(16),F(17),F(15)],notes:['買股票、基金等有風險的投資是另一回事，法規沒有明文允許，請先洽承辦人。']};
}
/* ── 2026-11-12 第三組換句話說測試後補上的直接回答 ── */
function coopMore(t){
 if(!/合作社/.test(t))return null;
 if(/(連任|連選|再選|做幾任)/.test(t)&&/(理事|監事|主席)/.test(t))
  return{direct:true,category:'合作社會務',title:'合作社理事、監事任期最長三年，原則上可以連選連任',
  summary:'可以。合作社理事、監事的任期不得超過三年；除了法律或章程另有規定以外，連選得連任（合作社法第33條）。\n\n所以要先看兩件事：\n• 章程：章程如果訂了連任的次數限制，就照章程。\n• 特別法：信用合作社等特別種類的合作社，另有專門的規定。\n\n這和一般協會不同：協會的理事長連任以一次為限，合作社法本身沒有這樣的限制。',
  statutes:[C(33)],notes:[]};
 if(/(分紅|紅利|分錢|賺的錢.{0,4}分|股息|配息)/.test(t))
  return{direct:true,category:'合作社財務',title:'合作社有結餘可以分配，但要先彌補短絀、付息並提撥公積金和公益金',
  summary:'可以分配，但不是像公司一樣按持股分紅。合作社年度有結餘時，順序是（合作社法第23條）：\n1. 先彌補累積的短絀，並支付社股的股息。\n2. 提撥公積金10%以上、公益金5%以上；理事、監事、事務員和技術員的酬勞金10%以下。\n3. 剩下的才能分配給社員，原則上是依社員和合作社的交易額比例分配。\n\n要注意：公積金社員不能要求分配；公益金只能用在社會福利、公益和合作教育訓練，不能拿來分。實際的分配案要經社員大會通過。',
  statutes:[C(23)],notes:['信用、保險等特別種類的合作社另有規定。']};
 if(/(年底|年終|年度|每年)/.test(t)&&/(報|送|做什麼|準備|書表|報表)/.test(t))
  return{direct:true,category:'合作社財務',title:'合作社年度終了要做五種書類，社員大會承認後一個月內報主管機關備查',
  summary:'年度終了時，理事會要製作五種書類（合作社法第36條）：\n1. 業務報告書\n2. 資產負債表\n3. 收支餘絀表\n4. 財產目錄\n5. 結餘分配案或短絀分擔案\n\n流程是：至少在社員大會開會10日前，送監事會審核 → 提報社員大會承認 → 社員大會承認後一個月內，用書面報主管機關備查。主管機關可以派員實地查核，合作社不能拒絕。',
  statutes:[C(36)],notes:['社員大會每年至少要開一次（合作社法第45條）。']};
 if(/(過世|死亡|往生|去世|繼承)/.test(t))
  return{direct:true,category:'合作社會務',title:'合作社社員過世就是出社：股金由繼承人承受，繼承人不是社員的退還股金',
  summary:'社員死亡，就當然出社（合作社法第26條）。他的社股由繼承人承繼權利和義務；繼承人如果不是社員，除非依規定申請加入合作社，否則合作社要把股金退還給繼承人（合作社法第20條）。\n\n退還的金額，依章程的規定和合作社年度終了時的財產狀況計算（合作社法第30條）。請繼承人準備繼承的證明文件，向合作社提出。',
  statutes:[C(26),C(20),C(30)],notes:[]};
 if(/(開除|除名|踢出|趕出|請出)/.test(t))
  return{direct:true,category:'合作社會務',title:'合作社可以除名社員：事由要寫在章程，經社務會理監事四分之三以上議決',
  summary:'可以，但有條件。除名的事由要訂在章程裡；程序上要經社務會出席的理事、監事四分之三以上議決，用書面通知被除名的社員，並向社員大會報告（合作社法第28條）。\n\n所以不能由理事主席一個人決定，也不能用章程沒有寫的理由除名。被除名的社員屬於出社（合作社法第26條），股金依章程規定辦理退還。',
  statutes:[C(28),C(26)],notes:[]};
 if(/(主管機關|誰管|承辦|找誰|找哪|哪個單位|電話)/.test(t)&&!/補助|稅|借|貸/.test(t))
  return{direct:true,category:'合作社會務',title:'合作社的主管機關是縣政府社會處，承辦人洪振育（08-7320415 轉 5312）',
  summary:'合作社的主管機關，中央是內政部，縣（市）是縣（市）政府；合作社經營的業務，另外要受各該事業主管機關的指導和監督（合作社法第2條之1）。例如農業合作社的業務和農業主管機關有關。\n\n在屏東縣，合作社的登記和社務由縣政府社會處辦理，承辦人是洪振育，電話 08-7320415 轉分機 5312。縣府地址：屏東市自由路527號。',
  statutes:[C('2-1')],notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 if(/公司/.test(t)&&/(差|不同|不一樣|比較|分別)/.test(t))
  return{direct:true,category:'合作社會務',title:'合作社和公司的差別：合作社是社員互助、一人一票，不是按出資多少決定',
  summary:'最大的差別在「為誰經營」和「誰說了算」：\n\n• 目的：合作社是依平等原則，在互助組織的基礎上，用共同經營的方法，謀求社員的經濟利益和生活改善（合作社法第1條）；公司則是以營利為目的。\n• 表決：合作社原則上每位社員一票，不因為出資多就票多；公司是按持股比例。\n• 分配：合作社的結餘要先提撥公積金、公益金，剩下的原則上依社員的交易額分配（合作社法第23條）；公司是按持股分配股利。\n• 主管機關：合作社向縣政府（社會處）登記（合作社法第2條之1）；公司向經濟主管機關登記。\n\n合作社本身就是法人（合作社法第2條）。',
  statutes:[C(1),C(23),C('2-1'),C(2)],notes:[]};
 return null;
}
function communityMore(t){
 if(!/(社區發展協會|社區協會|社區)/.test(t))return null;
 if(/(幾個人|幾人|多少人|幾位)/.test(t)&&/(發起|成立|籌組)/.test(t))
  return{direct:true,category:'社區發展協會',title:'成立社區發展協會要30位以上成年的發起人',
  summary:'社區發展協會的設立適用人民團體法（社區發展工作要點第17點），所以和一般協會一樣：發起人要成年，並且有30人以上（人民團體法第8條）。\n\n和一般協會不同的是，社區發展協會的組織區域以村里為單位（要點第4點），建議先到所在地的鄉鎮市公所，說明想成立的範圍，由公所輔導辦理。',
  statutes:[CDP(17),P(8),CDP(4)],notes:[],actions:[{label:'看社區發展協會成立',view:'biz',sub:'community'}]};
 if(/(村辦公處|里辦公處|村里辦公處|村長|里長)/.test(t)&&/(關係|差別|不同|一樣嗎|隸屬|管|上下)/.test(t))
  return{direct:true,category:'社區發展協會',title:'社區發展協會和村里辦公處是兩個不同的組織，彼此協調合作，沒有上下關係',
  summary:'兩者不一樣，也沒有誰管誰：\n• 村（里）辦公處是行政組織，村里長由選舉產生，辦理公所交辦的村里公務。\n• 社區發展協會是居民自己組成、依人民團體法立案的民間團體，理事長由理事互選，經費來自會費、捐款和補助。\n\n現行規定希望兩邊多配合：社區發展協會推動工作時，要和村里辦公處協調、聯繫（社區發展工作要點第10點）。村里長可以加入協會當會員，也可以被選為理事長，但不是當然的理事長；兩邊的經費和帳目要分開。',
  statutes:[CDP(10)],notes:[]};
 return null;
}
function outOfScope(t){
 let k=null;
 if(/政黨/.test(t)&&/(成立|申請|登記|找誰|怎麼)/.test(t))k=['政黨','政黨依政黨法辦理，主管機關是內政部，不是縣政府。要成立政黨，請向內政部申請備案。'];
 else if(/(基金會|財團法人)/.test(t)&&/(成立|申請|設立|找誰|怎麼|去哪)/.test(t)&&!/協會.{0,4}改/.test(t))k=['基金會（財團法人）','基金會是財團法人，是以「一筆捐助的財產」為基礎成立的，和由「人」組成的協會（社團）不同，不適用人民團體法。要成立基金會，是依財團法人法，向它的業務所屬的主管機關申請許可（例如社會福利類找社政機關、教育類找教育機關、文化類找文化機關），許可後再向法院辦理法人登記。'];
 else if(/祭祀公業/.test(t))k=['祭祀公業','祭祀公業不是人民團體，適用的是祭祀公業條例，申報和管理由所在地的鄉鎮市公所（民政單位）受理。'];
 else if(/(宮廟|寺廟|神壇|廟)/.test(t)&&/(成立|登記|立案|協會|要不要|找誰)/.test(t))k=['宮廟、寺廟','寺廟的登記是民政業務，請洽縣府民政處或所在地的公所。信徒如果想另外成立一個宗教性的協會（社會團體）來辦活動，那才是依人民團體法向社會處申請，兩者是不同的登記。'];
 else if(/(工會|職業工會|產業工會|企業工會)/.test(t)&&/(找誰|成立|籌組|申請|加入|承辦|哪個單位|去哪)/.test(t)&&!/公會/.test(t))k=['工會','工會依工會法辦理，主管機關是勞工主管機關，不是社會處。在屏東縣請洽屏東縣政府勞動暨青年發展處，電話 08-7558048。'];
 if(!k)return null;
 return{direct:true,category:'業務分流',title:k[0]+'不是這個櫃檯（人民團體）的業務，要找的單位不同',summary:k[1]+'\n\n這個櫃檯辦理的是屏東縣的社會團體（協會）、職業團體（公會）、社區發展協會和合作社。',statutes:[],notes:[]};
}
function whichAuthority(t){
 if(!/(公所|鄉公所|鎮公所|市公所)/.test(t)||!/(縣府|縣政府|社會處|還是|哪裡|找誰)/.test(t))return null;
 if(!/(協會|團體|社團|立案|成立|申請)/.test(t)||/社區|合作社|補助|魅力/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'鄉鎮市級的協會也是找縣政府：人民團體在縣的主管機關是縣政府',
 summary:'找縣政府。人民團體的主管機關，在縣（市）是縣（市）政府（人民團體法第3條），所以不論協會的組織區域是全縣，還是只在某一個鄉、鎮、市，成立、改選、報備都是向屏東縣政府社會處辦理，不是向公所。\n\n例外是社區發展協會：它的輔導窗口是所在地的鄉鎮市公所，通常先找公所。\n\n縣府總機 08-7320415，可以請總機轉人民團體的承辦人。',
 statutes:[P(3)],notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function volunteerMore(t){
 if(!/(志工|志願服務)/.test(t))return null;
 if(/(上課|訓練|課程|受訓|研習|要上什麼)/.test(t))
  return{direct:true,category:'志願服務',title:'志工要上兩種課：基礎訓練和特殊訓練',
  summary:'志工要接受兩種教育訓練，由運用志工的單位（例如協會）負責辦理（志願服務法第9條）：\n1. 基礎訓練：課程內容由中央主管機關（衛生福利部）統一訂定。\n2. 特殊訓練：課程由各目的事業主管機關或運用單位，依服務的需要自己訂定。\n\n參加運用單位提供的教育訓練，也是志工的義務（志願服務法第15條）。完成訓練之後，才由運用單位申請發給志願服務證和服務紀錄冊。',
  statutes:[VS(9),VS(15)],notes:['屏東縣志願服務的承辦人是社會處曾雅怡（08-7320415 轉 5317）。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 if(/(時數|紀錄冊.{0,4}用|有什麼用|好處|福利|優待|證明)/.test(t)&&!/怎麼申請|榮譽卡怎麼/.test(t))
  return{direct:true,category:'志願服務',title:'志工服務時數的用處：申請榮譽卡、服務績效證明，表現優良可以獲得獎勵',
  summary:'服務時數主要有三個用途：\n1. 志願服務榮譽卡：服務年資滿三年、服務時數達300小時以上，可以向縣府申請。憑卡進入收費的公立風景區、未編定座次的康樂場所和文教設施，可以免費（志願服務法第20條）。\n2. 服務績效證明書：服務成績良好的志工，因為升學、進修、就業需要，運用單位可以發給證明（志願服務法第17條）。\n3. 獎勵：志願服務表現優良的，應給予獎勵，並可以列入升學、就業的部分成績（志願服務法第19條）。\n\n時數要登記在志願服務紀錄冊裡，由運用單位登錄才算數。',
  statutes:[VS(20),VS(17),VS(19)],notes:['屏東縣志願服務的承辦人是社會處曾雅怡（08-7320415 轉 5317）。']};
 return null;
}
function submitWhere(t){
 if(!/(送件|送到哪|送去哪|寄到哪|郵寄|親自去|親送|臨櫃|線上送|線上申請|線上可以|跑一趟|要去縣府)/.test(t))return null;
 if(/合作社|社員|全國|內政部|投票|選舉|補助|勸募|法院|國稅/.test(t))return null;
 return{direct:true,category:'線上申辦',title:'文件送到屏東縣政府社會處；可以先在「線上申辦」填資料、確認要準備的文件',
 summary:'人民團體的申請和報備文件，受理的單位是屏東縣政府社會處，地址：屏東市自由路527號。\n\n建議這樣做：\n1. 先到本站的「線上申辦」，選擇要辦的項目，填寫團體名稱和聯絡資料，系統會列出應備文件並給您一個案件編號，之後可以查進度。\n2. 把書面文件備齊。正式文件要親自送、還是可以郵寄，以及要幾份，各個項目不太一樣，請依承辦人的通知；不確定的話先打電話問，可以少跑一趟。\n\n縣府總機 08-7320415，請總機轉該團體的承辦人。',
 statutes:[],notes:[],actions:[{label:'前往線上申辦',view:'apply',sub:''},{label:'聯絡承辦',view:'contact',sub:''}]};
}
function formTemplates(t,catalog){
 if(!/(範本|範例|樣本|空白表|怎麼填|怎麼寫|格式)/.test(t))return null;
 if(!/(名冊|簡歷冊|清冊|通知單|通知書|開會通知|委託書|申請書|簽到|移交)/.test(t))return null;
 if(/合作社|社員|社區/.test(t))return null;
 const a=formsDownload(t+'在哪裡下載',catalog);if(!a)return null;
 return Object.assign({},a,{direct:true,summary:'這類表格不用自己設計，「書表下載」頁有社會處提供的範本，下載後照欄位填寫就可以。\n\n'+(a.summary||'')});
}
function solicitationAfter(t){
 if(!/(勸募|募款|募來|募得|募到|捐款專戶)/.test(t))return null;
 if(/合作社|社員|會員/.test(t))return null;
 if(/(必要支出|支出上限|行政費|可以花多少|可以用多少|成本|薪水|人事費|付.{0,4}(薪|人事|工資))/.test(t))
  return{direct:true,category:'公益勸募',title:'勸募所得可以支應的必要支出有上限：1,000萬元以下最多15%',
  summary:'勸募來的錢主要要用在核准的計畫上，只有「辦理勸募活動的必要支出」可以從勸募所得支應，而且有上限（公益勸募條例第17條）：\n• 勸募所得在1,000萬元以下：15%。\n• 超過1,000萬元、未逾1億元：150萬元，加上超過1,000萬元部分的8%。\n• 超過1億元：870萬元，加上超過1億元部分的1%。\n\n例如募得200萬元，必要支出最多30萬元；募得1,200萬元，最多是150萬元加16萬元，共166萬元。\n\n所以辦這次勸募活動必要的人事、宣傳、行政費用，可以在上限內支應；但不能把募來的錢當成協會平常發薪水的經費。其餘的錢要依主管機關許可的使用計畫使用，不得移作他用（同條例第19條）。開支1萬元以上的，要用支票或匯款，不能付現金（同條例第18條）。',
  statutes:[CHR(17),CHR(19),CHR(18)],notes:['理事、監事是無給職，不能用任何名義從勸募所得領薪水（人民團體法第21條）。']};
 if(/(結束|期滿|之後|辦完|做完|結案|報告|公告|徵信|剩下|剩餘|餘款|沒用完|用不完)/.test(t)&&!/解散|清算/.test(t))
  return{direct:true,category:'公益勸募',title:'勸募結束後要報兩次：活動期滿30日內公告收支，錢用完後30日內再報成果',
  summary:'勸募結束之後有兩個時點要辦：\n\n1. 活動期滿：從期滿的隔天起30日內，把捐贈人的捐贈資料、勸募所得和收支報告公告、公開徵信，並報主管機關備查（公益勸募條例第18條）。\n\n2. 錢用完之後：使用計畫執行完畢後30日內，把使用情形提經理事會通過，公告並公開徵信，連同成果報告、支出明細和相關證明文件，報主管機關備查；有正當理由可以申請延長，最多30日（同條例第20條）。\n\n如果錢有剩：可以在計畫執行完畢後三個月內，依原勸募活動的同類目的另外擬使用計畫書，報經主管機關同意後動支；再執行的期限不能超過三年（同條例第19條）。',
  statutes:[CHR(18),CHR(20),CHR(19)],notes:['在屏東縣內的勸募，請撥縣府總機 08-7320415 轉社會處社會行政科。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 return null;
}
/* ── 2026-11-12 使用者提供 FAQ 第三批 13 題（逐條核對後收錄）＋函釋 ── */
const BT=n=>({title:'商業團體法第'+n+'條',source:LAW+'D0050100'});
const ETAX=(no,t)=>({title:'財政部稅務入口網 稅務問答 '+no+'「'+t+'」',source:'https://www.etax.nat.gov.tw/'});
const MOI_SUSPEND={title:'內政部112年11月2日台內團字第1100137213號函（理事之會員資格經停權是否仍得執行理事職務）',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=297790'};
const MOHW_SUSPEND={title:'衛生福利部102年9月26日衛部救字第1020105128號函（理事會依章程對會員停權）',source:'https://dep.mohw.gov.tw/DOSAASW/cp-552-4777-103.html'};
function subsidyDetails(t){
 if(!/補助/.test(t)&&!(/申請/.test(t)&&/(縣府|機關|單位|處室)/.test(t)&&/(活動|計畫|案)/.test(t)&&/(兩個|二個|重複|同時)/.test(t)))return null;
 if(/合作社|社員|魅力|好讚|勸募|社造/.test(t))return null;
 const tail='\n\n以上是「屏東縣政府對民間團體補助經費作業要點」（111年2月16日修正）的規定；個別的補助計畫可能另有標準，實際能不能補助，以您這一案的核定函為準。';
 if(/(設備|電腦|音響|桌椅|冷氣|投影機|機器|器材|財產|買東西|購置|添購)/.test(t))
  return{direct:true,category:'補助經費',title:'補助可以買設備嗎：部分可以，但要先經核准，買了要列入協會財產',
  summary:'部分可以，但不是所有設備都能補助，也不能自己先買了再來申請核銷。\n\n縣府明定不予補助的設備有三種（作業要點第5點）：\n• 職業團體（公會）的設備。\n• 私立社會福利機構的設備（不含財團法人）。\n• 其他經縣府認定超出使用效益的設備。\n另外，汽車、機車也不補助。\n\n其他的設備，要寫進補助計畫、說明為什麼需要，經縣府審查核准後才能買。核銷時除了核准補助文件影本、領款收據、實際支用明細表和各項單據，還要再附上「納入團體財產」的證明文件（作業要點第8點），也就是要登記在協會的財產目錄裡。'+tail,
  statutes:[PT_GRANT(5),PT_GRANT(8)],notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 if(/(人事費|薪水|薪資|工資|津貼|工作人員|專職|請人|鐘點費|講師費)/.test(t))
  return{direct:true,category:'補助經費',title:'補助可以付人事費嗎：工作津貼不補助；研習活動的講師鐘點費可以申請',
  summary:'協會工作人員的固定薪水，不能拿縣府這項補助來付。作業要點把「工作津貼」列為不予補助的項目（第5點），獎金和國外旅費也是。\n\n可以申請的，是和協會宗旨有關的研習、參訪、觀摩活動所需的費用，例如講師的鐘點費、撰稿費、場地費、印刷費、交通費、評審費和保險費（第5點）。這些以外的費用，要經縣府核准才算。\n\n所以要分清楚：請外面的講師來上課，鐘點費可以列；但不能把協會自己工作人員的薪水，改名叫「講師費」或「工作費」來核銷。'+tail,
  statutes:[PT_GRANT(5)],notes:['有些專案計畫（例如中央補助的方案）另外有人事費的規定，要看那個計畫自己的規範。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 if(/(兩個|二個|2個|多個|重複|同時|另外再|其他機關|別的單位|中央|公所|再申請)/.test(t))
  return{direct:true,category:'補助經費',title:'同一個活動不能向縣府兩個單位重複申請；跨機關補助要分開列明',
  summary:'要看是向誰申請：\n\n1. 都是屏東縣政府裡面的單位：不可以重複。同一年度的同一個補助案，只能一次向縣府的一個機關或單位提出，不得重複申請（作業要點第11點）。\n\n2. 一個是縣府、一個是中央或其他機關：要看各個補助計畫的規定。可以的話，計畫書和經費表要如實寫出每個機關各補助哪些項目、多少錢；核銷時也要列明各機關補助的項目和金額（作業要點第8點）。\n\n不論哪一種，同一張發票、同一筆支出，都不能向兩個機關重複核銷。'+tail,
  statutes:[PT_GRANT(11),PT_GRANT(8)],notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 return null;
}
function taxWithholding(t){
 if(/合作社|社員/.test(t))return null;
 if(/(講師|講座|演講|授課|鐘點費|老師的費用)/.test(t)&&/(扣|稅|申報|所得)/.test(t))
  return{direct:true,category:'稅務與扣繳',title:'講師費要扣稅嗎：演講費扣10%，單次2萬元以下免扣；課程授課的鐘點費算薪資',
  summary:'要先分清楚是「演講」還是「授課」，兩種的稅不一樣：\n\n1. 專題演講的鐘點費：屬於執行業務所得。講師是國內居住的個人時，按給付額扣繳10%；但每次應扣繳的稅額不超過2,000元的，可以免扣繳，也就是單次給付在2萬元以下不用先扣（財政部稅務問答1504）。\n\n2. 開班上課、研習課程的授課鐘點費：一般認定是薪資所得，要依薪資所得的扣繳規定處理。\n\n要提醒兩點：\n• 免扣繳不等於不用申報。協會隔年1月還是要把給付的金額列單申報。\n• 講師如果不是國內居住的個人，演講費是扣20%，規定不同。\n\n這次的費用到底算演講還是授課、要不要扣，建議向轄區國稅局（東港稽徵所或屏東分局）確認。',
  statutes:[ETAX('1504','執行業務所得如何辦理扣繳')],notes:['個人的稿費、演講鐘點費等，全年合計18萬元以內免納所得稅，這是講師自己報稅時適用的規定，和協會要不要扣繳是兩回事。']};
 if(/(扣繳|扣稅|扣繳憑單|扣繳義務)/.test(t)&&/(要不要|需要|要辦|要報|嗎|誰|怎麼)/.test(t)&&!/編號|統編|統一編號|申請|什麼時候|期限|何時/.test(t))
  return{direct:true,category:'稅務與扣繳',title:'協會沒有營利也可能要辦扣繳：付薪資、租金、講師費時，由協會負責扣繳和申報',
  summary:'要看協會有沒有「付錢給別人」。協會本身不營利，不代表不用辦扣繳。\n\n只要協會給付的是薪資、租金、利息、執行業務報酬（例如講師的演講費）這類所得，協會就是扣繳義務人，要在給付時依規定扣稅，並在期限內填報扣繳憑單（財政部稅務問答1501；所得稅法第89條）。現行規定的扣繳義務人是「團體」本身，不是理事長個人。\n\n常見的情形：\n• 聘了總幹事或工作人員，每個月付薪水。\n• 租會址，付租金給房東。\n• 請講師演講或上課，付鐘點費。\n\n即使金額小、依規定可以免扣繳，多半還是要列單申報。協會要先向國稅局辦妥扣繳單位的登記（也就是統一編號），才能申報。細節請洽轄區國稅局。',
  statutes:[ETAX('1501','誰是扣繳義務人')],notes:[],actions:[{label:'看統編怎麼申請',view:'biz',sub:''}]};
 if(/(理事長|負責人|會長)/.test(t)&&/(換|變更|改選|異動|交接)/.test(t)&&/(統編|統一編號|國稅局|扣繳單位)/.test(t))
  return{direct:true,category:'稅務與扣繳',title:'理事長換人，統編不用重新申請：辦「扣繳單位變更登記」，原來的統編繼續用',
  summary:'不用重新申請。協會還是同一個協會，只是負責人換了，原本的統一編號繼續使用；要辦的是向國稅局申請「扣繳單位變更登記」，把負責人改成新任理事長。\n\n建議的順序：\n1. 先把改選結果報縣府社會處，取得核備的公文或新的當選證明。\n2. 帶著原統編的資料、變更登記申請書、縣府的核備文件、新任理事長的身分證明和印章，向轄區國稅局辦理變更。\n3. 銀行帳戶的負責人和印鑑、法院的法人登記（有辦的話），也要分別去更新，不會自動同步。\n\n要準備的文件細項，請先向轄區國稅局（東港稽徵所或屏東分局）確認。',
  statutes:[{title:'財政部「扣繳單位設立（變更）登記申請書」',source:'https://www.etax.nat.gov.tw/'}],notes:[]};
 return null;
}
function commercialGuild(t){
 if(!/(公會|同業公會)/.test(t)||/工會|醫師|社工師|護理|律師|會計師|建築師/.test(t))return null;
 if(/(一定要加入|必須加入|強制|不加入|沒加入|可以不加入|要不要加入|需要加入|要加入嗎|不入會)/.test(t))
  return{direct:true,category:'職業團體',title:'公司、商號原則上要加入商業同業公會：開業後一個月內入會，不加入可能被罰',
  summary:'原則上要。領有公司登記或商業登記證照的公司、行號，應該在開業後一個月內，加入所在地區的商業同業公會成為會員；兼營兩種以上行業的，除了其他法律另有規定，至少要選一種行業加入（商業團體法第12條）。\n\n不加入會怎樣（商業團體法第63條）：\n1. 公會先用書面通知限期入會。\n2. 逾期不入會，公會報請主管機關，由主管機關通知在三個月內入會。\n3. 還是不入會，由主管機關處1,500元以上、1萬元以下的罰鍰。\n\n要注意：這是針對公司、行號的規定。一般的協會（社會團體）不是公司行號，沒有加入商業同業公會的義務。',
  statutes:[BT(12),BT(63)],notes:['醫師、社工師等專業人員加入公會，另依各該專業的法律。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 if(/(成立|籌組|組織|發起|設立|幾家|幾間)/.test(t)&&/(商業|同業|公司|行號|店|業)/.test(t))
  return{direct:true,category:'職業團體',title:'商業同業公會：同一縣市同業的公司、行號滿5家就應該組織，一個區域同類以一會為限',
  summary:'在同一個縣（市）內，領有公司登記或商業登記證照的同業公司、行號達到5家以上，就應該組織該業的商業同業公會（商業團體法第8條）。\n\n程序上（商業團體法第10條）：\n1. 發起組織要先報經主管機關許可。在屏東縣是縣政府社會處。\n2. 籌備和成立時，可以報請主管機關派員列席。\n3. 成立後，把章程、會員名冊、職員簡歷冊報請主管機關備查。\n\n申請前請先確認兩件事：\n• 有沒有已經成立的公會：同一區域內同類的商業同業公會，以一會為限（商業團體法第9條）。已經有了，就是加入，不是再成立一個。\n• 行業的分類：公會要冠上本業的名稱，行業怎麼歸類會影響能不能成立。\n\n這和成立一般協會（30位發起人）是不同的制度。',
  statutes:[BT(8),BT(10),BT(9)],notes:['屏東縣商業公會的承辦人是社會處羅宇軒（08-7320415 轉 5317）。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 return null;
}
function memberSuspension(t){
 if(/合作社|社員/.test(t))return null;
 if(/(沒繳|欠繳|不繳|未繳|沒交|欠).{0,6}(會費|錢)|會費.{0,6}(沒繳|欠繳|不繳|未繳|沒交)/.test(t)&&/(投票|選舉權|表決|參選|被選|出席|參加大會|開會)/.test(t)&&!/停權/.test(t))t=t+'停權';
 if(!/停權/.test(t))return null;
 const guild=/公會|同業/.test(t);
 const after=/(停權後|被停權|停權期間|停權的人|停權中|停權了)/.test(t)&&/(參加|出席|投票|選舉|開會|大會|表決|當選|理事|監事)/.test(t);
 if(after)
  return{direct:true,category:'人民團體會務說明',title:'被停權的會員能不能出席或投票：看章程訂的停權範圍；理監事停權超過任期一半才解任',
  summary:'要看章程或理事會決議裡，停權「停的是哪些權利」。\n\n會員本來有表決權、選舉權、被選舉權和罷免權（人民團體法第16條），停權通常就是暫停這些權利。停權的範圍和期間，法律沒有統一規定，由團體在章程或理事會決議中訂定（內政部112年11月2日台內團字第1100137213號函）。被停權的會員，理事會在大會前審定名冊時，要在他的姓名下面註明沒有選舉權、被選舉權或罷免權（人民團體選舉罷免辦法第5條）。\n\n如果被停權的是理事或監事：\n• 會員資格被停權，不會馬上失去理事、監事的職務；停權期間沒有超過任期的二分之一，仍然可以執行職務（同函）。\n• 停權期間超過任期二分之一的，應即解任，由候補遞補（人民團體法第23條）。\n\n停權要有章程的依據並經過應有的程序，不是理事長口頭宣布就算數。',
  statutes:[P(16),ER(5),P(23),MOI_SUSPEND],notes:[]};
 return{direct:true,category:'人民團體會務說明',title:guild?'公會會員欠繳會費：滿3個月勸告、6個月警告、9個月才停權':'會員沒繳會費可以停權嗎：要章程有規定，並經理事會決議，不能直接停',
 summary:guild?'商業團體有法定的三個步驟，不能跳過（商業團體法第64條）：\n1. 欠繳會費滿三個月：勸告。\n2. 欠繳滿六個月，經勸告仍不繳：警告。\n3. 欠繳滿九個月，經警告仍不繳：停權。停權後不得參加各種會議、不得當選理事或監事，也不能享受團體的一切權益；已經當選理事、監事的，應予解職。':'不能直接停。一般協會（社會團體）的停權，人民團體法沒有規定統一的事由和程序，屬於團體自治的事項，所以要符合兩個條件：\n1. 章程要有依據：欠繳多久、停什麼權、停多久，要寫在章程裡。\n2. 要經過程序：審定會籍是理事會的職權，停權要由理事會依章程決議，不是理事長或總幹事一個人決定。\n\n內政部和衛生福利部的函釋都採這個看法：停權的期間應由團體在章程或理事會議中訂定或議決；理事會依章程決議停權，並不違反法令，期間長短屬於團體自治。\n\n實務上建議先催繳並留下紀錄，再提理事會。會員補繳之後怎麼恢復權利，也最好在章程裡寫清楚。',
 statutes:guild?[BT(64)]:[MOI_SUSPEND,MOHW_SUSPEND,P(12)],notes:guild?[]:['停權和除名不同：除名是剝奪會員資格，要經會員大會出席人數三分之二以上同意（人民團體法第14條、第27條）。','商業同業公會欠繳會費的處理，另依商業團體法第64條。']};
}
function meetingProcedure(t){
 if(/合作社|社員/.test(t))return null;
 if(/(同票|票數相同|票數一樣|一樣多|平手|同數|各半|打平)/.test(t))
  return{direct:true,category:'人民團體會務說明',title:'表決同票：議案算沒有通過；選舉同票則用抽籤決定',
  summary:'要分「表決議案」和「選舉」兩種情形：\n\n1. 表決議案：同意和反對一樣多，議案沒有通過。會員大會、理事會、監事會的決議，都要出席人數過半數或較多數同意（人民團體法第27條、第29條）；票數相同，既不是過半數，也不是較多數。想再處理，可以修改提案內容後，下次會議重新提出。\n\n2. 選舉理事、監事或理事長：當選和候補的名次是依得票多寡排列，票數相同的時候用抽籤決定；當選人不在場，或在場但唱名三次仍不抽籤的，由會議主席代為抽定（人民團體選舉罷免辦法第15條）。所以選舉同票不用重選。',
  statutes:[P(27),P(29),ER(15)],notes:[]};
 if(/(主席|理事長)/.test(t)&&/(投票|表決|有沒有票|可以投|算一票|多一票)/.test(t)&&/主席/.test(t))
  return{direct:true,category:'人民團體會務說明',title:'主席可以投票嗎：理事長本來就有一票，當主席不會多一票，也不會少一票',
  summary:'法規沒有規定當主席就不能投票。\n\n理事長是會員，也是理事。會員大會上，每位會員有一個表決權、選舉權（人民團體法第16條）；理事會的決議，是以理事過半數出席、出席過半數同意（人民團體法第29條），理事長算在理事裡面。所以理事長擔任主席時，還是有他自己的一票，但不會因為當主席而多一票。\n\n分情形來說：\n• 選舉理事、監事、理事長：主席和其他人一樣領票、投票。\n• 表決一般議案：有些團體依議事慣例，主席不參加表決，只在可否同數時才表示意見。這是議事規則的問題，法規沒有強制，請依章程或該次會議通過的議事規則辦理。\n• 罷免案：被罷免的人不能擔任那次會議的主席（人民團體選舉罷免辦法第38條）。',
  statutes:[P(16),P(29),ER(38)],notes:[]};
 if(/(錄音|錄影|直播)/.test(t)&&/(開會|大會|理事會|監事會|會議)/.test(t))
  return{direct:true,category:'人民團體會務說明',title:'開會可以錄音、錄影嗎：法規沒有明文規定，建議開會前先告知並依章程或會議決定',
  summary:'人民團體的法規沒有規定開會可以或不可以錄音、錄影，所以要看章程、協會的議事規則，或由該次會議決定。\n\n協會為了製作和核對會議紀錄而錄音，是常見的做法，建議：\n1. 開會一開始就告訴大家：要錄音（或錄影）、用途是做紀錄、檔案由誰保管、保存多久。\n2. 有人反對時，依章程或由會議決定怎麼處理。\n3. 錄下來的內容有會員的個人資料和發言，不要任意公開或傳到群組。\n\n要注意：錄音檔只是輔助，不能取代會議紀錄。會議紀錄還是要寫，載明開會日期、出缺席狀況和會議決議，留存供會員查閱；會員大會的紀錄要在閉會後30日內報縣府備查（人民團體會務輔導辦法第12條）。\n\n個別會員自己想錄音、錄影或直播，同樣建議先徵得會議同意。',
  statutes:[G(12)],notes:['涉及個人資料和隱私的部分，另有個人資料保護法等規定。']};
 return null;
}
/* ── 2026-11-12 依使用者提供之現行「屏東縣政府對民間團體補助經費作業要點」全文（111年2月16日修正、111年3月1日生效） ── */
function subsidyBasics(t){
 if(!/補助/.test(t)||/合作社|社員|魅力|好讚|勸募|社造|志工/.test(t))return null;
 const src='（屏東縣政府對民間團體補助經費作業要點';
 if(/(核銷|結報|報帳)/.test(t)&&/(附|文件|資料|準備|怎麼|如何|期限|多久|幾天|什麼時候|何時|流程)/.test(t))
  return{direct:true,category:'補助經費',title:'補助核銷：計畫做完20日內，附核准文件影本、領款收據、支用明細表和單據',
  summary:'計畫執行完畢後20日內，要向縣府辦理核銷'+src+'第8點）。要附四樣資料：\n1. 核准補助文件的影本。\n2. 領款收據。\n3. 實際支用明細表。接受兩個以上機關補助的，要列明各機關補助的項目和金額。\n4. 各項支用的單據。\n\n另外：\n• 成果報告（含照片）依各補助單位的規定檢附。\n• 補助的是設備的話，還要附「納入團體財產」的證明文件。\n• 補助經費有剩，要繳回（第8點之1）。\n\n最重要的是期限：超過當年度沒有辦理核銷，縣府會把原來核准的補助註銷，而且不辦理經費保留，也就是這筆補助就沒有了。',
  statutes:[PT_GRANT(8),PT_GRANT('8之1')],notes:['個別補助計畫（例如魅力社區）有自己的核銷期限和表件時，依那個計畫的核定函。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 if(/(沒用完|用不完|剩|餘款|結餘|退|繳回|還回去)/.test(t))
  return{direct:true,category:'補助經費',title:'補助款沒用完要繳回',
  summary:'要。補助經費如果有剩餘，應該繳回'+src+'第8點之1）。不能留在協會帳上，也不能挪到別的活動用。\n\n核銷時，實際支用明細表要照實填寫花了多少；實際支出比核定的補助少，差額就是要繳回的金額。繳回的方式請依承辦人的通知辦理。',
  statutes:[PT_GRANT('8之1'),PT_GRANT(8)],notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 if(/(多少|上限|最多|金額|幾萬|二萬|兩萬|2萬)/.test(t)&&!/設備|人事|講師/.test(t))
  return{direct:true,category:'補助經費',title:'縣府補助的金額：同一個團體辦活動，一年以不超過2萬元為原則，但有例外',
  summary:'原則上，縣府對同一個民間團體的活動補助，每一年度以不超過新臺幣2萬元為原則'+src+'第4點）。\n\n不受2萬元限制的情形（第4點）：\n• 社區或民間團體推動具有教育、文化、環境及綠美化內容的活動。\n• 專案簽請核准的活動。\n• 依法令接受機關委託、協助或代辦業務的團體。\n• 依法設立的工會、農會、漁會、水利會、同業公會、體育會；或申請的計畫具有公益性質的教育、文化、社會福利團體。\n• 配合中央政府各機關補助計畫的補助。\n\n要提醒的是：2萬元是原則，不是每個團體都一定拿得到2萬元；符合例外也不代表一定會核給比較多。實際的金額看計畫內容、審查結果和年度預算。',
  statutes:[PT_GRANT(4)],notes:['魅力社區等專案計畫，另有各自的補助上限。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 if(/(沒照|不照|沒有照|未依|挪用|亂用|虛報|浮報|違規|被追|追繳|停止補助|罰|會怎樣|後果)/.test(t))
  return{direct:true,category:'補助經費',title:'補助沒有照用途使用：要追繳，還可能被停止補助1到5年',
  summary:'縣府可以定期或不定期督導考核補助經費的使用。發現成效不佳、沒有依補助的用途支用、虛報、浮報或其他違規的，除了追繳全部或一部分的款項，還可以依情節輕重，對這個團體停止補助1年到5年'+src+'第10點）。\n\n另外，沒有正當理由超過核銷期限的，縣府可以列管，並列入下一次補助的考量（第10點）；超過當年度沒有核銷的，原核准的補助會被註銷（第8點）。\n\n計畫真的需要變動，請在執行前先向補助單位提出，不要先改了再來核銷。',
  statutes:[PT_GRANT(10),PT_GRANT(8)],notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 if(/(會務不正常|沒改選|沒有改選|沒開會|沒開大會|沒報|剛成立|立案未滿|未滿一年|新成立|才成立|資格|哪些團體|誰可以|不能申請|不予補助|不補助)/.test(t)&&!/旅遊|設備|人事/.test(t))
  return{direct:true,category:'補助經費',title:'這五種情形縣府不予補助：一年沒開大會、屆滿未改選、限期整理、財務資料未報、立案未滿一年',
  summary:'可以申請補助的「民間團體」，是指經主管機關立案的團體、非營利組織、社會福利機構和財團法人；政治團體不在補助之列'+src+'第2點）。\n\n但有下列情形之一的，不予補助（第5點）：\n1. 一年沒有召開會員（代表）大會或董事會。\n2. 任期屆滿沒有改選。\n3. 被限期整理。\n4. 財務資料沒有依規定陳報。\n5. 立案未滿一年。\n\n所以想申請補助，先把會務和財務補齊：該開的大會開了、該改選的改選了、預算決算報了。剛成立的協會，要等立案滿一年。',
  statutes:[PT_GRANT(2),PT_GRANT(5)],notes:['個別補助計畫可能還有更嚴格的資格條件。'],actions:[{label:'看改選流程',view:'meet',sub:'m-elect'},{label:'聯絡承辦',view:'contact',sub:''}]};
 if(/(準備|要附|文件|資料|怎麼申請|如何申請|申請.{0,4}(流程|程序|手續)|要寫什麼)/.test(t)&&/申請/.test(t))
  return{direct:true,category:'補助經費',title:'申請縣府補助要準備：實施計畫、經費概算明細表、申請函和申請單位聲明書',
  summary:'申請補助要檢附四樣東西'+src+'第6點）：\n1. 詳實的實施計畫。\n2. 經費概算明細表。\n3. 申請函。\n4. 申請單位聲明書。\n經由鄉（鎮、市）公所陳報的，依公所的程序辦理。\n\n申請之前先確認三件事：\n• 找對單位：依活動的性質，向縣府主管那項業務的處室提出。同一年度的同一個案子，只能向縣府的一個機關或單位申請，不能重複（第11點）。\n• 項目可不可以補助：可以申請的是和協會宗旨有關的研習、參訪、觀摩活動的鐘點費、撰稿費、場地費、印刷費、交通費、評審費和保險費等；旅遊性質的交通、餐費、住宿，以及會員大會、理監事會議和例行會議，不予補助（第5點）。\n• 協會的會務正不正常：一年沒開大會、屆滿未改選、財務資料沒報、立案未滿一年的，不予補助（第5點）。\n\n送件後由受理的單位審查，簽奉核定才算通過；提出申請不等於一定核准。',
  statutes:[PT_GRANT(6),PT_GRANT(11),PT_GRANT(5)],notes:['各處室的專案補助另有受理期間和表件，以當年度公告為準。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 return null;
}
function videoElection(t){
 if(!/(視訊|遠距|google ?meet|zoom|線上會議|線上開會)/i.test(t))return null;
 if(!/(選舉|改選|補選|罷免|投票|選理事|選監事|選理事長)/.test(t))return null;
 if(/合作社|社員/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'選舉、補選、罷免不能用視訊：開會可以視訊（章程要訂明），但選舉要實體集會',
 summary:'不可以。開會和選舉要分開看：\n\n• 開會：章程訂明之後，會員大會、理事會、監事會可以用視訊會議召開（人民團體法第25條、第29條）。\n• 選舉、補選、罷免：仍然要以實體集會的方式辦理，不能用視訊進行（內政部112年5月1日公告）。人民團體的選舉或罷免，原則上應在同一個地點以集會方式辦理（人民團體選舉罷免辦法第3條）。\n\n所以如果那次會員大會有改選，就要開實體會議；只有報告和一般議案的會議，才可以依章程用視訊。\n\n章程想加入視訊開會的規定，要寫清楚視訊出席、簽到和表決的方式，經會員大會通過後報縣府。',
 statutes:[P(25),P(29),ER(3),{title:'內政部112年5月1日公告：人民團體得否以視訊方式召開會議應依團體章程之規定辦理',source:'https://www.moi.gov.tw/News_Content.aspx?n=15255&sms=12357&s=279353'}],notes:['會員不能到場的，可以用書面委託其他會員出席（人民團體選舉罷免辦法第7條）。'],actions:[{label:'看改選流程',view:'meet',sub:'m-elect'}]};
}
/* ── 2026-11-12 第四組換句話說測試後補上的直接回答 ── */
function conveneAndPetition(t){
 if(/合作社|社員/.test(t))return null;
 if(/(臨時大會|臨時會員大會|開大會|召開大會|開會員大會)/.test(t)&&/(連署|要求|請求|多少會員|幾個會員|幾分之|會員可以|會員能不能|理事長不開)/.test(t))
  return{direct:true,category:'人民團體會務說明',title:'會員可以要求開臨時大會：五分之一以上會員書面連署，理事長要在30日內召開',
  summary:'可以。下面三種情形，理事長要召開臨時會員大會（人民團體會務輔導辦法第15條；人民團體法第25條）：\n1. 理事過半數書面連署。\n2. 會員（會員代表）五分之一以上書面連署。\n3. 監事會發函請求召集。\n\n做法：\n• 連署書或函要用雙掛號寄給理事長，拿到掛號回執之後，報縣府備查。\n• 理事長收到後，要在30日內把臨時大會召開完畢。\n• 理事長逾期不開，縣府可以指定理事一人召集（人民團體法第32條）。\n\n出席臨時大會的人，以最近一次經理事會審定的會員名冊為準。例如會員100人，至少要20人連署。',
  statutes:[G(15),P(25),P(32)],notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 if(/(理事會|監事會)/.test(t)&&/(誰.{0,4}召集|誰可以開|誰來開|由誰|要求開|請求開|連署|理事可以.{0,4}開)/.test(t)&&!/大會|不用經過|自己開|委託|代理|代替|找人代|請別人/.test(t))
  return{direct:true,category:'人民團體會務說明',title:'理事會由理事長召集；理事過半數書面連署，理事長要在15日內召開臨時理事會',
  summary:'理事會由理事長召集，監事會由監事會召集人（常務監事）召集（人民團體會務輔導辦法第11條）。理監事聯席會議，要分別經理事長和監事會召集人同意後召集。\n\n理事長不開的時候，理事可以這樣做（同辦法第13條）：\n1. 理事過半數書面連署，要求召開臨時理事會（監事會則是監事過半數）。\n2. 連署書用雙掛號寄給理事長，取得回執後報縣府備查。\n3. 理事長要在收到後15日內把臨時會議開完；自己不能召集的，依章程的代理程序由代理人召集。\n\n還是不開，或連續三次以上召集都開不成的，縣府可以指定理事一人召集（同辦法第14條；人民團體法第32條）。理事長沒有正當理由超過兩個會次不開理事會的，主管機關應解除他的理事長職務（人民團體法第30條）。',
  statutes:[G(11),G(13),G(14),P(32),P(30)],notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 return null;
}
function assemblyPrepAndSignIn(t){
 if(/合作社|社員/.test(t))return null;
 if(/(簽到|報到)/.test(t)&&/(要|需要|一定|保留|保存|怎麼|嗎)/.test(t)&&!/範本|下載|格式|成立大會|多久|幾分鐘|時間/.test(t))
  return{direct:true,category:'人民團體會務說明',title:'開會一定要簽到：出席人數就是用簽到或報到的人數計算',
  summary:'要。人民團體的各項會議，要有應出席人員過半數出席才能開；而出席人數就是以簽到或報到的人數計算（人民團體會務輔導辦法第16條）。沒有簽到，就沒辦法證明這次會議有達到法定人數。\n\n幾個提醒：\n• 親自出席和委託出席要分開註記。報送縣府的會員大會紀錄，要寫明應出席人數、親自出席幾人、委託出席幾人。\n• 選舉時，委託出席和親自出席的人數，也是以簽到簿所列的為準（人民團體選舉罷免辦法第7條）。\n• 簽到簿請和會議紀錄一起保存。法規沒有特別規定簽到簿的保存年限，建議至少留到這一屆任期結束、沒有爭議之後。',
  statutes:[G(16),ER(7)],notes:[],actions:[{label:'下載書表',view:'forms',sub:''}]};
 if(/(大會|會員大會)/.test(t)&&/(準備|議程|手冊|流程|要做什麼|怎麼排|程序)/.test(t)&&!/成立大會|籌備/.test(t))
  return{direct:true,category:'人民團體會務說明',title:'開會員大會前的準備：15日前審定名冊、發通知和議程，並報請縣府派員列席',
  summary:'開大會前，法規要求的準備工作有這些：\n\n1. 開理事會：審定可以出席的會員名冊（寫明姓名、電話、地址和權利受限制的情形），並通過要提大會的議案。名冊要在大會15日前審定，提供會員閱覽（人民團體會務輔導辦法第10條）。\n2. 發開會通知：大會15日前，把會議種類、時間、地點和議程通知每一位應出席的會員（同條；人民團體法第26條）。\n3. 報請縣府派員列席（人民團體法第26條）。\n4. 準備大會資料：上年度的工作報告和決算（先送監事會審核）、當年度的工作計畫和預算（社會團體財務處理辦法第11條）；有改選的，另外準備選舉票和選務人員。\n\n常見的議程順序：報告出席人數並宣布開會 → 主席致詞 → 會務和財務報告、監事會監察報告 → 討論提案（決算、預算、章程修改等）→ 選舉（有的話）→ 臨時動議 → 散會。大會手冊通常就是把上面這些資料和會員名冊裝訂在一起。\n\n開完會，會議紀錄要在30日內報縣府備查（人民團體會務輔導辦法第12條）。',
  statutes:[G(10),P(26),F(11),G(12)],notes:[],actions:[{label:'看會議怎麼開',view:'meet',sub:''},{label:'下載書表',view:'forms',sub:''}]};
 if(/會議紀錄/.test(t)&&/(給會員看|會員.{0,4}(看|查|要)|公開|可以看|提供)/.test(t))
  return{direct:true,category:'人民團體會務說明',title:'會議紀錄要留存，並提供會員查閱',
  summary:'要。會員大會、理事會、監事會和理監事聯席會議的紀錄，都要載明開會日期、出缺席狀況和會議決議，閉會後由協會自行留存，並提供會員查閱（人民團體會務輔導辦法第12條）。所以會員要求看會議紀錄，協會不能拒絕。\n\n其中會員大會的紀錄，另外要在閉會後30日內報縣府備查（同條）。',
  statutes:[G(12)],notes:[]};
 return null;
}
function whatNeedsAssembly(t){
 if(/合作社|社員/.test(t))return null;
 const a=/(哪些事|什麼事|哪些事項|哪些決定).{0,8}(大會|會員大會)/.test(t)||/(理事會).{0,10}(還要|要不要|需要).{0,4}大會/.test(t)||/大會.{0,6}(職權|權限|可以決定什麼)/.test(t);
 const b=/(買|賣|處分|出售|購買|抵押).{0,6}(土地|房子|房屋|不動產|房地|會館)/.test(t)&&/(大會|同意|決議|通過|誰決定|可以|能不能|可不可以)/.test(t)&&!/登記|過戶|名下|稅/.test(t);
 if(!a&&!b)return null;
 return{direct:true,category:'人民團體會務說明',title:b?'買賣土地、房屋要經會員大會通過；特殊情形可先由大會授權，再提大會追認':'一定要會員大會決定的事：章程、除名、罷免、財產處分、解散、會費、預決算',
 summary:(b?'要。協會不動產的買賣、轉讓或設定抵押等權利，應經會員大會通過才能處理；有特殊需要的，可以先經大會授權理事會和監事會（或理監事聯席會議）通過，之後再提報大會追認（社會團體財務處理辦法第13條）。財產的處分屬於重大事項，要出席人數三分之二以上同意（人民團體法第27條）。理事長或理事會不能自己決定。\n\n':'')+'理事會是依會員大會的決議和章程執行職務的（人民團體法第18條），下面這些事，一定要提會員大會：\n\n要出席人數三分之二以上同意的（人民團體法第27條）：\n1. 章程的訂定和修改。\n2. 會員的除名。\n3. 理事、監事的罷免。\n4. 財產的處分。\n5. 團體的解散。\n6. 其他和會員權利義務有關的重大事項。\n\n要大會通過的（過半數）：\n• 理事、監事的選舉。\n• 入會費、常年會費、會員捐款的數額和繳納方式（人民團體法第33條）。\n• 每年的預算、決算（人民團體法第34條）。\n• 不動產的買賣、轉讓和設定權利（社會團體財務處理辦法第13條）。\n• 工作人員的薪給基準和福利事項（社會團體工作人員管理辦法第7條）。\n\n其他日常的會務，由理事會決定就可以。',
 statutes:b?[F(13),P(27),P(18)]:[P(18),P(27),P(33),P(34),F(13),SW(7)],notes:[]};
}
function feeAndMemberStatus(t){
 if(/合作社|社員|補助|勸募/.test(t))return null;
 if(/(會費|入會費|年費)/.test(t)&&/(調漲|調高|漲|調降|調整|免繳|免收|減免|優待|分期|不用繳|改|打折|半價)/.test(t))
  return{direct:true,category:'人民團體財務',title:'會費要調整、減免或分期：要經會員大會通過並報縣府核備，標準要寫進章程',
  summary:'可以，但不是理事會或理事長說了算。\n\n• 入會費、常年會費的繳納數額和方式，要提經會員大會通過，並報請主管機關核備之後才能實施（人民團體法第33條）。\n• 會費的標準和繳納方式要訂入章程（社會團體財務處理辦法第14條）。\n\n所以想調漲、調降，或是對長者、學生減免，或改成可以分期，做法是：理事會擬好方案 → 提會員大會通過（涉及修改章程的，要出席人數三分之二以上同意）→ 報縣府核備 → 實施。\n\n至於入會費和常年會費各收多少、比例如何，法規沒有規定，由協會自己決定（內政部101年3月22日內授中社字第1015931084號函）。',
  statutes:[P(33),F(14),{title:'內政部101年3月22日內授中社字第1015931084號函',source:'https://dep.mohw.gov.tw/DOSAASW/cp-552-4777-103.html'}],notes:['會員退會要不要退費：由理事會訂退費原則，提會員大會通過後實施（社會團體財務處理辦法第14條）。']};
 if(/會員/.test(t)&&/(過世|死亡|往生|去世|搬家|搬走|遷出|遷走|還算會員|喪失資格|自動退會)/.test(t)&&!/理事|監事/.test(t))
  return{direct:true,category:'人民團體會務說明',title:'會員過世就是出會；搬家算不算喪失資格，要看章程的會員資格',
  summary:'會員有下面情形之一的，就是出會（人民團體法第15條）：\n1. 死亡。\n2. 喪失會員資格。\n3. 經會員大會決議除名。\n\n所以：\n• 會員過世：當然出會，不需要另外決議。會員資格不能繼承或轉讓給家人。\n• 會員搬家：要看章程。章程的會員資格有「設籍或居住在本縣（本鄉鎮）」這類條件的，搬走之後就喪失會員資格；章程沒有這種限制的，搬家不影響。\n\n協會要做的事：會籍資料要隨時更新（人民團體會務輔導辦法第10條）。下次開大會前，理事會審定會員名冊時，把已經出會的人剔除，應出席人數才會正確。',
  statutes:[P(15),G(10)],notes:[]};
 return null;
}
function directorMustBeMember(t){
 if(!/(理事長|理事|監事)/.test(t)||/合作社|社員|總幹事|工作人員/.test(t))return null;
 if(!/(一定要是會員|要是會員|必須是會員|非會員|不是會員|外面的人|外縣市|外地人|住在屏東|設籍|戶籍|找外人)/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'理事、監事一定要是會員；理事長要不要住在本縣，看章程的會員資格',
 summary:'理事、監事一定要從會員裡選出來。人民團體的理事、監事，是就會員（會員代表）中選舉的（人民團體法第17條）；當選之後如果喪失會員資格，就要馬上解任，由候補遞補（人民團體法第23條）。理事長是由理事互選的，所以也一定是會員。\n\n至於外縣市的人、沒有住在屏東的人能不能當理事或理事長，人民團體法沒有規定戶籍，要看章程的會員資格：\n• 章程規定會員要設籍或居住在本縣的，就要符合才能入會，也才能被選為理事。\n• 章程沒有這種限制的，外縣市的會員一樣可以被選。\n\n相反地，總幹事等工作人員不一定要是會員，但不能由理事、監事兼任（社會團體工作人員管理辦法第4條）。',
 statutes:[P(17),P(23),SW(4)],notes:[]};
}
function auditAndYear(t){
 if(/合作社|社員|補助|勸募/.test(t))return null;
 if(/會計年度/.test(t)&&/(幾月|什麼時候|何時|怎麼算|起訖|開始|結束|從)/.test(t))
  return{direct:true,category:'社會團體財務報表',title:'協會的會計年度是1月1日到12月31日',
  summary:'社會團體的會計年度以曆年為準，從每年1月1日起到12月31日止（社會團體財務處理辦法第10條）。\n\n配合這個年度：\n• 年度開始前，理事會編好當年度的工作計畫和收支預算表。\n• 年度結束後三個月內（也就是3月底前），編好上年度的工作報告和決算，提會員大會通過後報縣府備查（同辦法第11條）。\n\n例外：國際性社會團體的章程另有規定，並報經主管機關核准的，可以不採曆年制（同辦法第10條）。',
  statutes:[F(10),F(11)],notes:[]};
 if(/(查帳|帳.{0,4}(誰查|給誰|誰看|誰審)|誰.{0,3}查.{0,2}帳|縣府.{0,6}(查|看).{0,3}帳|稽核|審核帳)/.test(t)&&!/會員.{0,4}(看|查)|監事可以/.test(t))
  return{direct:true,category:'人民團體財務',title:'協會的帳由監事會查核；縣府也可以要求協會限期提出財務報告',
  summary:'協會內部負責查帳的是監事會：\n• 協會的經費收支和工作執行情形，每次理事會都要提出審議，再由理事會送監事會監察；監事會發現有不當的，提出糾正意見送理事會處理，理事會不處理，監事會可以提報會員大會（人民團體會務輔導辦法第17條）。\n• 年度決算要先送監事會審核，審核結果一併提報會員大會（人民團體法第34條）。\n• 財務的查核是監事會的職權（社會團體財務處理辦法第22條）。\n\n縣府的部分：\n• 每年的預算、決算要報縣府（人民團體法第34條）。\n• 主管機關為了瞭解協會的業務或活動，可以通知協會限期提出實施計畫、執行情形和財務報告（人民團體會務輔導辦法第19條）。\n• 協會有違反法令、章程的情形，主管機關可以警告、限期改善（人民團體法第58條）。\n\n領了政府補助的，補助機關也可以督導考核經費的使用。',
  statutes:[G(17),P(34),F(22),G(19),P(58)],notes:[]};
 if(/(捐款|收入|會費|現金|錢)/.test(t)&&/(一定要存|要存進|存到帳戶|存銀行|放保險箱|放在.{0,4}(家|辦公室|抽屜)|不存|收現金|現金捐款)/.test(t))
  return{direct:true,category:'人民團體財務',title:'協會收到的錢要存進金融機構，隨收隨存；收現金可以，但要開收據並儘快存入',
  summary:'要存。協會的財務收入，應該存入銀行、農會、漁會、信用合作社或郵局，不能存放在其他公私企業或個人那裡，並以隨收隨存為原則，也不能「收支坐抵」，也就是不能把收到的現金直接拿去付別的支出（社會團體財務處理辦法第16條）。\n\n所以：\n• 收現金捐款或現金會費是可以的，但每一筆都要開正式收據、留存根（同辦法第17條），然後儘快存進協會的帳戶。\n• 不能長期放在理事長、總幹事或會計的家裡或個人帳戶。\n• 要用錢的時候，從帳戶提領，由理事長、總幹事（秘書長）和財務人員共同蓋章（同辦法第17條）。',
  statutes:[F(16),F(17)],notes:[]};
 return null;
}
function reorganization(t){
 if(!/(限期整理|整理小組)/.test(t)||/合作社|社員|補助/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'限期整理：由願意的理監事組成整理小組，三個月內清查會籍、開大會改選',
 summary:'限期整理是主管機關對會務不正常的團體所做的處分之一（人民團體法第58條）。意思是給協會一段期間，把會務重新整理好；沒有如期完成的，就應予解散（人民團體法第59條）。\n\n程序（人民團體會務輔導辦法第21條至第26條）：\n1. 組成整理小組：協會要用書面調查全體理事、監事的意願，由有意願的人共同組成，互推一人當召集人。人數不能超過章程所定理事、監事名額的總和；不滿5人的，從會員中找適當的人補足。成員是無給職。組成後30日內報縣府備查。\n2. 期限：三個月內完成整理。確實有困難的，可以申請延長，最多三個月，以一次為限。\n3. 整理小組的任務：接管立案證書、圖記、檔案、財務和人事資料；清查會員的會籍；召開會員大會，選舉理事、監事。\n4. 完成：新任理事長選出後10日內辦理交接，整理小組就解散。經限期整理選出的理監事，屆次視為新的一屆。',
 statutes:[P(58),P(59),G(21),G(22),G(25),G(26)],notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function staffResignReport(t){
 if(!/(總幹事|秘書長|幹事|工作人員|會計|出納)/.test(t)||!/(辭職|離職|換人|異動|新聘|聘了|解聘)/.test(t))return null;
 if(!/(報|備查|核備|通知縣府|要不要報|需要報)/.test(t)||/合作社|社員/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'總幹事等工作人員異動：法規沒有要求報縣府，但聘僱和解聘都要經理事會通過',
 summary:'法規沒有要求報縣府。協會依規定要在30日內報主管機關核備的異動，是章程、選任職員（理事、監事）簡歷冊和負責人名冊（人民團體法第54條）；總幹事是聘僱的工作人員，不是選任職員，不在這個範圍裡。\n\n但協會內部要完成的程序不能少：\n• 新聘：依理事會訂的資格條件遴選，提經理事會通過後聘僱（社會團體工作人員管理辦法第3條）。\n• 解聘：由理事會通過（同辦法第6條）。\n• 接任的人不能是理事、監事，也不能是現任理事長的配偶或三親等以內的親屬（同辦法第4條、第5條）。\n\n另外記得更新：銀行帳戶的印鑑（提款要總幹事的章）、勞健保的加退保。縣府如果在個別案件要求提供工作人員資料，再依通知辦理。',
 statutes:[P(54),SW(3),SW(6),SW(4),SW(5)],notes:[]};
}
function govCommission(t){
 if(!/(政府|機關|縣府|公所|公家).{0,6}(委託|委辦|委外)|受託|接受委託|承接.{0,4}(計畫|業務)/.test(t))return null;
 if(/合作社|社員|出席|大會|投票/.test(t))return null;
 const a=assocGovTender('協會可以承接政府標案嗎');if(!a)return null;
 return Object.assign({},a,{direct:true,title:'協會可以接受政府委託：委託收益是法定的經費來源，但要符合宗旨並依採購規定辦理',summary:'可以。「委託收益」本來就是人民團體法定的經費來源之一（人民團體法第33條）。\n\n'+a.summary,statutes:[P(33)].concat(a.statutes||[])});
}
function intlTermStart(t){
 if(!/國際/.test(t)||!/任期/.test(t))return null;
 if(!/(起算|開始|算起|哪天|哪一天|何時|什麼時候|怎麼算|怎麼計算|從哪)/.test(t))return null;
 if(/合作社|社員/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'國際性社會團體的任期起算：章程另有規定並經主管機關核准的，照章程',
 summary:'國際性社會團體可以有自己的任期起算方式，但要符合兩個條件：章程裡另外訂明，而且報經主管機關核准。兩個條件都具備，就照章程的規定起算（人民團體選舉罷免辦法第28條但書）。\n\n例如配合國際總會的年度，章程訂明理事長、理事、監事的任期自每年7月1日起算，並經主管機關核准的，就從7月1日起算。\n\n章程沒有另外規定，或還沒有報經核准的，就回到一般規定：理事、監事的任期，從召開本屆第一次理事會的那一天起算（同條本文），不是從會員大會選舉那天算。理事長由理事互選產生，任期跟著這一屆的理事起訖。\n\n要提醒的是，這個例外只是「從哪一天起算」可以不同，每一任最長四年、理事長連任以一次為限的規定仍然適用（人民團體法第20條）。',
 statutes:[ER(28),P(20)],
 notes:['國際性社會團體的會計年度也有同樣的例外：章程另有規定並報經主管機關核准的，可以不採曆年制（社會團體財務處理辦法第10條）。','屏東縣的國際團體由社會處羅宇軒承辦（08-7320415 轉 5317），章程是否已核准另訂起算日，可以向承辦人確認。'],
 actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function charmCommunityContact(t){
 if(!/魅力社區/.test(t))return null;
 if(!/(電話|找誰|問誰|要問|承辦|聯絡|窗口|分機|哪位|誰負責)/.test(t))return null;
 return{direct:true,category:'屏東魅力社區計畫',title:'魅力社區計畫承辦人：社會處陳怡伶（08-7320415 轉 5314）',
 summary:'魅力社區計畫請找屏東縣政府社會處陳怡伶，電話 08-7320415 轉分機 5314。\n\n打電話時先說明您的鄉鎮市和「魅力社區計畫」，再說想問的事情（申請資格、送件、核銷等）。社區發展協會的申請要經所在地的鄉鎮市公所轉送，也可以先問公所。\n\n縣府地址：屏東市自由路527號。',
 statutes:[],notes:['這是魅力社區計畫的窗口，和一般人民團體會務的承辦人不同。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function termLengthLimit(t){
 if(!/任期/.test(t))return null;
 if(/合作社|社員|國際|總會|公會|工會|農會|漁會|教育會|連任/.test(t))return null;
 const m=t.match(/(\d+|[一二兩三四五六七八九十])\s*年/);
 if(!m||!/(可以|能不能|可不可以|能否|訂|改成|延長|嗎)/.test(t))return null;
 const map={'一':1,'二':2,'兩':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10};
 const n=map[m[1]]||parseInt(m[1],10);if(!n)return null;
 const over=n>4;
 return{direct:true,category:'人民團體會務說明',title:over?'不可以：理事、監事的任期最長四年，章程不能訂'+n+'年':'可以：任期'+n+'年沒有超過四年的上限，由章程訂定',
 summary:(over?'不可以。':'可以。')+'人民團體理事、監事的任期不得超過四年（人民團體法第20條），理事長是由理事互選產生的，任期跟著理事走，所以也不能超過四年。\n\n'+(over?'章程如果訂成'+n+'年，會和法律牴觸，報縣府核備時會被要求修正。想讓幹部做久一點，法律允許的方式是連選連任：理事、監事可以連選連任，理事長的連任則以一次為限。':'任期要寫在章程裡（人民團體法第12條）；任期屆滿要辦理改選。理事、監事可以連選連任，理事長的連任以一次為限。'),
 statutes:[P(20),P(12)],
 notes:['醫師、社工師等專業公會的任期，另依各該專業法律的規定。']};
}
function officeAtHome(t){
 if(!/(住宅|住家|家裡|家中|自宅|自家|我家|租的|租屋|住處)/.test(t))return null;
 if(!/(會址|設址|地址|辦公)/.test(t))return null;
 if(/稅|合作社|社員|證書|換發/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'協會會址可以設在住家：法規沒有禁止，但要在組織區域內，並取得屋主同意',
 summary:'可以。人民團體法沒有限制會址一定要是辦公室或店面，設在理事長或會員的住家是常見的做法。\n\n要注意三件事：\n1. 地點：會址要設在主管機關所在的地區，也就是在屏東縣立案的團體，會址要在屏東縣內；要設在其他地區，須報經主管機關核准（人民團體法第6條）。\n2. 章程：會址是章程必須記載的事項（人民團體法第12條）。章程如果寫了完整的門牌，以後搬家就要先修改章程；只寫到縣市或鄉鎮，彈性比較大。\n3. 使用同意：房子不是協會自有的，報送時要附屋主出具的會址使用同意書。',
 statutes:[P(6),P(12)],
 notes:['住家設為會址之後，房屋稅、地價稅會不會受影響，屬於地方稅的問題，請洽屏東縣政府財稅局。'],
 actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function dissolvedAssets(t){
 if(!/(解散|結束|收掉|註銷)/.test(t))return null;
 if(!/(財產|資產|剩下|剩餘|賸餘|餘款|存款|錢|設備)/.test(t))return null;
 if(/合作社|社員|社區發展|補助/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'協會解散後的剩餘財產：不能分給會員，依章程歸屬地方自治團體或主管機關指定的團體',
 summary:'不能分給會員或理監事。\n\n協會解散後，要先清償債務；清償後剩下的財產，依章程的規定或會員大會的決議決定歸屬。但以公益為目的的法人解散時，剩餘財產不得歸屬於自然人或以營利為目的的團體；章程和大會都沒有決定的，歸屬於會址所在地的地方自治團體（民法第44條）。\n\n另外，協會要適用所得稅的免稅規定，章程必須明定解散後剩餘財產歸屬所在地的地方自治團體，或政府主管機關指定的機關、團體（教育文化公益慈善機關或團體免納所得稅適用標準第2條第1項第3款）。所以多數協會的章程已經有這一條，請先翻章程確認。',
 statutes:[CIV(44),TX(2)],
 notes:['有辦法人登記的協會，解散後還要依民法辦理清算，並向法院辦理解散、清算終結登記。','政府補助款購置的財產或未用完的補助款，另依補助機關的規定處理。'],
 actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function groupNameDuplicate(t){
 if(!/(名稱|名字|會名|取名|命名)/.test(t))return null;
 if(!/(重複|相同|一樣|同名|撞名|類似|相似|被用|用過|限制|規定)/.test(t))return null;
 if(/合作社|社員|公司|商號|改名|更名|變更/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'團體名稱不能和已經許可的團體相同',
 summary:'不可以重複。同一個組織區域內可以成立兩個以上同級、同類的團體，但名稱不得有下列情形（人民團體法第7條）：\n1. 和已經許可的團體名稱相同。\n2. 容易讓人誤認和政府機關（構）、政府捐助的財團法人或營利團體有關。\n3. 有歧視性或仇恨性的文字。\n\n籌組之前，可以先用本站的「團體查詢」輸入想用的名稱，看看屏東縣有沒有同名的團體；最後能不能使用，以縣府審查的結果為準。',
 statutes:[P(7)],notes:[],
 actions:[{label:'查詢團體名稱',view:'dir',sub:''}]};
}
function standingDirectorCount(t){
 if(!/常務理事|常務監事|常務理監事|監事會召集人/.test(t))return null;
 if(!/(幾|多少|名額|人數|上限|最多|可以設|要設|一定要|幹嘛|是什麼|職責|怎麼選|怎麼產生|誰選|由誰)/.test(t))return null;
 if(/合作社|社員|代理|出缺|補選/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'常務理事、常務監事由理事、監事互選，名額不超過總額的三分之一；監事會召集人由常務監事互推',
 summary:'法規只定了上限，實際名額由章程決定。\n\n理事、監事的名額在三人以上的，可以分別互選常務理事和常務監事，名額不得超過理事或監事總額的三分之一；理事長由理事從常務理事中選出一人擔任，沒有設常務理事的，就由理事互選（人民團體法第17條）。\n\n舉例：理事15人，常務理事最多5人；理事9人，最多3人。監事5人，常務監事最多1人。常務監事有三人以上時，要互推一人擔任監事會召集人。\n\n常務理事不是一定要設，規模小的協會可以不設，直接由理事互選理事長。',
 statutes:[P(17)],notes:['名額要寫在章程裡；想增減名額，要先修改章程。']};
}
function memberViewAccounts(t){
 if(!/(會員|我)/.test(t))return null;
 if(!/(帳本|帳簿|帳冊|帳目|帳|財務報表|收支|財報|會議紀錄)/.test(t))return null;
 if(!/(看|查閱|查看|調閱|閱覽|影印|公開|公布|公告|提供)/.test(t))return null;
 if(/合作社|社員|保存|幾年/.test(t))return null;
 return{direct:true,category:'人民團體財務',title:'會員想看協會的帳：財務收支應定期公告，決算要提會員大會，會議紀錄可以查閱',
 summary:'會員了解協會財務，法規上有三個管道：\n\n1. 定期公告：社會團體處理財務收支，不得有匿報或虛報，並應定期公告（社會團體財務處理辦法第20條）。\n2. 會員大會：每年的工作報告和會計報告（決算）要提會員大會通過（同辦法第11條），會員可以在大會上提問、要求說明。\n3. 會議紀錄：會員大會、理事會、監事會的會議紀錄，協會要留存並提供會員查閱（人民團體會務輔導辦法第12條）。\n\n至於個別會員能不能直接翻閱帳簿和憑證，法規沒有明文規定，要看章程；章程沒有規定時，可以請監事會查核，財務的查核本來就是監事會的職權（社會團體財務處理辦法第22條）。協會拒絕公開又不說明的，可以向縣府承辦人反映。',
 statutes:[F(20),F(11),G(12),F(22)],notes:[],
 actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function howToReportGroup(t){
 if(!/(檢舉|投訴|陳情|舉報)/.test(t))return null;
 if(!/(要|想|怎麼|如何|去哪|哪裡|向誰|找誰|可以)/.test(t)||/被檢舉|被投訴|被陳情|被舉報/.test(t))return null;
 if(!/(協會|團體|社團|理事長|總幹事|公會|老人會|婦女會)/.test(t))return null;
 if(/合作社|社員|募款|勸募/.test(t))return null;
 return{direct:true,category:'會務爭議',title:'想檢舉協會：備妥具體事證，向屏東縣政府社會處反映',
 summary:'在屏東縣立案的協會，主管機關是屏東縣政府社會處，可以用書面或電話向該團體的承辦人反映。\n\n反映時請說清楚：\n1. 團體的全名。\n2. 具體的事情和發生的時間，例如多久沒開會、沒有改選、帳目不公開。\n3. 手上的證明，例如開會通知、會議紀錄、收據、對話紀錄。\n\n縣府查證後，團體確有違反法令、章程或妨害公益的，可以警告、撤銷決議、停止業務並限期改善；逾期不改善或情節重大的，可以撤免職員、限期整理、廢止許可或解散（人民團體法第58條）。\n\n如果您本身是會員，也可以先走內部的管道：請監事會查核，或由會員五分之一以上請求召開臨時會員大會（人民團體法第25條）。',
 statutes:[P(58),P(25)],notes:['涉及侵占、詐欺等刑事問題，請向警察機關或地檢署提出。','縣府總機 08-7320415，可請總機轉該團體的承辦人。'],
 actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function groupReported(t){
 if(!/(檢舉|投訴|陳情|舉報|被告發)/.test(t))return null;
 if(!/(協會|團體|社團|理事長|我們|本會)/.test(t))return null;
 if(/合作社|社員|帳|財務|經費|募款|勸募|去哪|向誰|怎麼檢舉|如何檢舉|要檢舉|想檢舉/.test(t))return null;
 return{direct:true,category:'會務爭議',title:'協會被檢舉：主管機關會先查證並請團體說明，確有違規才會要求改善或處分',
 summary:'被檢舉不等於已經違規。縣府收到檢舉後，通常會先請協會提出說明和相關資料，查證之後再決定怎麼處理。\n\n建議這樣準備：\n1. 先弄清楚被檢舉的事項，是會務（開會、改選）、財務，還是業務活動。\n2. 把相關的會議紀錄、簽到表、帳簿和憑證整理好，在期限內以書面答覆。\n3. 確實有缺失的，儘快補正，例如補開會議、補報資料。\n\n查證後確有違反法令、章程或妨害公益的，主管機關可以警告、撤銷決議、停止業務的一部或全部，並限期改善；逾期不改善或情節重大的，才會進一步撤免職員、限期整理、廢止許可或解散（人民團體法第58條）。',
 statutes:[P(58)],notes:['涉及刑事責任（例如侵占、偽造文書）的，由司法機關處理，不是縣府能認定的。'],
 actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function anonymousDonation(t){
 if(!/(匿名|不具名|無名氏|不願具名|善心人士|不留名)/.test(t))return null;
 if(!/(捐|收據)/.test(t))return null;
 if(/合作社|社員/.test(t))return null;
 return{direct:true,category:'人民團體財務',title:'匿名捐款也要開收據、入帳：收據存根留存備查',
 summary:'要開。社會團體的經費收入，都要開立正式收據並留存根備查（社會團體財務處理辦法第17條），沒有「匿名就可以不開」的例外；款項也要照常入帳。\n\n捐款人不願意具名的，收據還是照開、照編號，存根留在協會；捐款人欄位要怎麼記載（例如寫「無名氏」），法規沒有明文規定，建議先向縣府承辦人確認。\n\n要提醒捐款人：收據上沒有姓名，就沒辦法拿來申報所得稅的捐贈扣除。',
 statutes:[F(17)],
 notes:['如果是經許可的公益勸募活動，收據還要載明勸募許可文號、捐贈人、金額或物品和日期（公益勸募條例第16條）。'],
 actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
/* ── 2026-11-12 第五批：副理事長、提案附議、貸款、年終獎金、交際費、英文名稱、未成年理事等（函釋逐字核對內政部解釋令彙編） ── */
const MOI=(d,no,s,n)=>({title:'內政部'+d+no+'函',source:'https://www.moi.gov.tw/News_Content.aspx?n='+(n||14119)+'&s='+s});
function viceChair(t){
 if(!/副理事長/.test(t)||/合作社|副理事主席/.test(t))return null;
 if(!/(可以|能不能|可不可以|設|置|怎麼|如何|產生|選|提名|幾|要不要|需要|有沒有|規定|代理|職權|一定)/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'協會可以設副理事長：不是法定必要職位，人數和產生方式要先寫進章程',
 summary:'可以設，但要先在章程寫清楚。\n\n人民團體法只規定協會要有理事、監事，理事可以互選常務理事，再選出一位理事長（第17條），沒有提到副理事長。內政部的函釋說：副理事長不是法規規定一定要有的職員，也不在人民團體選舉罷免辦法規定的範圍內，怎麼產生，在章程明定就可以。\n\n所以要設副理事長，請這樣做：\n• 在章程寫明設幾位、怎麼產生（例如由理事互選，或由理事長提名經理事會同意）、任期和職權（例如協助理事長、理事長請假時代理）。\n• 章程原本沒有這個職位的，要先修改章程：會員過半數出席、出席人數三分之二以上同意（第27條），通過後30日內報縣府核備（第54條）。\n• 章程還沒修改之前，請不要先選出或對外使用副理事長的名義。',
 statutes:[P(17),P(27),P(54),MOI('89年1月18日','台(89)內中社字第8910424號',218945,14143)],notes:['這份函釋當時是答復商業同業公會聯合會的詢問，協會可以參考同樣的原則；章程怎麼寫，可以先和承辦人討論。'],actions:[{label:'看函釋目錄',view:'law',sub:'函釋與問答'}]};
}
function motionSecond(t){
 if(!/(附議|連署提案|提案.{0,6}(幾個人|多少人|幾人|連署)|(幾個人|多少人|幾人).{0,6}(提案|附議))/.test(t))return null;
 if(/合作社|社員|議會|議員|罷免|臨時會|請求召開|召集/.test(t))return null;
 return{direct:true,category:'會議程序',title:'開會提案要不要有人附議：人民團體法沒有規定，先看章程和協會自己的議事規則',
 summary:'人民團體法和相關辦法都沒有規定提案要幾個人附議，所以先看協會的章程，或協會自己訂的議事規則怎麼寫。\n\n章程和議事規則都沒有寫的時候，一般會參考內政部訂的《會議規範》：會議中提出的動議，原則上要有其他出席的人附議才成立，成立後才進入討論和表決。內政部的函釋說明，《會議規範》雖然不是法律授權訂定的行政命令，仍然可以作為團體開會的參考依據。\n\n實務上請注意：\n• 事先寫進議程的提案（例如理事會提給大會的議案），依議程討論就可以。\n• 會員在大會當場提的臨時動議，建議主席先徵求附議，再開始討論。\n• 要修改章程，也可以在大會用臨時動議提出，但表決門檻不變：出席人數三分之二以上同意（人民團體法第27條）。',
 statutes:[P(27),MOI('101年11月16日','台內社字第1010356863號',256688),MOI('108年5月3日','台內團字第1080022434號',256745)],notes:['《會議規範》的附議人數和例外情形，本站沒有收錄條文原文，請以協會章程、議事規則為準；有爭議時可先電洽承辦人。']};
}
function assocLoan(t){
 if(!/(貸款|借錢|借款|舉債|融資|跟銀行借|向銀行借|抵押)/.test(t))return null;
 if(/合作社|社員|借給|借錢給|放款|個人|我自己|信用合作社|青年創業/.test(t))return null;
 if(!/(協會|團體|本會|我們會|理事|大會|可以|能不能|可不可以)/.test(t))return null;
 return{direct:true,category:'人民團體財務',title:'協會可以向銀行貸款嗎：法規沒有禁止，但要用協會的名義、先經會員大會同意',
 summary:'法規沒有明文禁止協會借款，但這是會加重全體會員負擔的大事，不能由理事長或理事會自己決定。\n\n請這樣辦：\n• 先提會員大會討論。借款屬於「與會員權利義務有關的重大事項」的，要有會員過半數出席、出席人數三分之二以上同意（人民團體法第27條）。\n• 如果要拿協會的土地或房子去設定抵押，這是不動產「他項權利之設定」，一定要經會員大會通過才能辦理；有特殊需要時，可以由大會授權理事會和監事會（或理監事聯席會議）通過，事後再提報大會追認（社會團體財務處理辦法第13條）。\n• 借款和還款都要編進年度收支預算和決算，提大會通過後報縣府備查（同辦法第11條）。\n• 要用協會的名義借，款項存進協會的帳戶；不要用理事長個人的名義借了再轉給協會。\n\n提醒您：銀行通常會要求協會已經辦好法人登記，還會要會員大會的會議紀錄；沒有辦法人登記的協會，實務上很難用協會的名義貸款，請先問銀行。',
 statutes:[P(27),F(13),F(11)],notes:['借款金額大或用途特殊時，建議先和承辦人討論議案怎麼寫。']};
}
function yearEndBonus(t){
 if(!/(年終|獎金|三節|紅包|酬勞金|慰勞金)/.test(t))return null;
 if(/合作社|社員|志工|摸彩|抽獎|獎學金|比賽|競賽|獎助|補助款|核銷|扣繳|所得稅|勞基法|結婚|婚喪|喜慶|喪|白包|包紅包|禮金/.test(t))return null;
 if(!/(理事長|理事|監事|理監事|總幹事|秘書長|工作人員|會計|出納|幹事|職員|員工|協會|發)/.test(t))return null;
 const officer=/(理事長|理事|監事|理監事)/.test(t)&&!/(總幹事|秘書長|工作人員|會計|出納|幹事|職員|員工)/.test(t);
 return{direct:true,category:'人民團體財務',title:officer?'理事長、理監事不能領年終獎金：理監事是無給職，只能領出席費或交通費':'年終獎金：聘僱的工作人員可以發，理事長和理監事不可以',
 summary:(officer?'不可以。':'要看發給誰。')+'\n\n理事長、理事、監事：不可以領年終獎金。理事、監事都是無給職（人民團體法第21條），只有在執行職務需要時，協會可以參照政府機關的標準酌發出席費，或按交通工具憑票證酌發交通費（社會團體財務處理辦法第19條）。內政部的函釋也說：會員大會決議送卸任理事長酬勞金，於法無據。\n\n聘僱的工作人員（總幹事、會計、幹事等）：可以發。工作人員的薪資和福利，由協會視財務狀況、由理事會訂定基準，提會員大會通過後實施，而且不能違反勞動法令（社會團體工作人員管理辦法第7條）。年終獎金請寫進這份薪給福利基準，並編入年度預算。',
 statutes:[P(21),F(19),SW(7),MOI('84年10月2日','台(84)內社字第8482083號',220055)],notes:['發給工作人員的獎金屬於薪資所得，扣繳和申報的問題請洽國稅局。']};
}
function entertainmentExpense(t){
 if(!/(交際費|公關費|應酬|請客|餐敘費|聚餐費|送禮|禮金|花籃|花圈|奠儀|紅白帖|紅白包|婚喪喜慶|包紅包|包白包|(結婚|過世|喪事|喜事).{0,8}(紅包|白包|包))/.test(t))return null;
 if(/合作社|社員|補助款|核銷|公司|營業|扣繳/.test(t))return null;
 return{direct:true,category:'人民團體財務',title:'協會可以編交際費（公關費）：要先編進年度預算、經會員大會通過，支出要有單據',
 summary:'可以，但要照預算走。法規沒有專門規定交際費，也沒有訂金額上限；它和其他支出一樣，要符合下面的規定：\n\n• 先編預算：理事會在年度開始前編好收支預算表，把交際費（公關費）列出來，提會員大會通過後報縣府備查（社會團體財務處理辦法第11條）。沒有編預算、或超過預算的，請先提理事會，再提大會追認。\n• 要有單據：每一筆都要有收據或發票，寫清楚日期、對象和事由；不能匿報或虛報，並定期公告（同辦法第20條）。\n• 監事會會查：財務由監事會查核，主管機關也可以抽查（同辦法第22條）；帳簿和憑證至少保存10年（同辦法第21條）。\n\n婚喪喜慶的禮金、花籃這類支出，建議由理事會先訂一個標準（對象和金額），以後照標準辦，比較不會有爭議。',
 statutes:[F(11),F(20),F(21),F(22)],notes:['政府補助款通常不能用在交際應酬，請看該補助計畫的規定。']};
}
function englishName(t){
 if(!/(英文名|英文會名|英文縮寫|英文簡稱|外文名)/.test(t)||/合作社|社員|公司/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'協會可以取英文名稱：立案審查的是中文名稱，英文名稱和縮寫不在審查範圍',
 summary:'可以。協會向主管機關申請立案時，團體名稱指的是中文名稱。內政部的函釋說明：人民團體法第7條名稱不得相同的限制，不包括英文名稱和英文縮寫。\n\n所以：\n• 英文名稱由協會自己決定，建議經理事會或會員大會討論後，寫進章程（例如在「本會名稱」那一條加註英文名稱），之後對外才有依據。寫進章程屬於章程變更，要大會出席人數三分之二以上同意（第27條），再報縣府核備（第54條）。\n• 立案證書、圖記和正式公文，都以中文名稱為準。\n• 雖然法規不審查英文名稱，還是建議不要和知名團體或機關的英文名稱一樣，避免讓人誤會。',
 statutes:[P(7),P(27),P(54),MOI('101年6月13日','台內社字第1010223561號',256684)],notes:['函釋引用的是當時的第7條條文；現行第7條審查的仍然是立案用的中文名稱。'],actions:[{label:'看函釋目錄',view:'law',sub:'函釋與問答'}]};
}
function minorOfficer(t){
 if(!/(未成年|未滿18|未滿十八|未滿20|未滿二十|小朋友|小孩|孩子|學生|國中生|高中生|青少年|兒童|幾歲|1[0-9]歲|年齡限制|年齡.{0,4}(規定|下限|上限))/.test(t))return null;
 if(!/(理事|監事|理監事|發起人|入會|加入|會員|幹部|參選|被選)/.test(t))return null;
 if(/合作社|社員|志工|志願服務|補助|活動|保險|課程|夏令營/.test(t))return null;
 const founder=/發起人/.test(t);
 return{direct:true,category:'人民團體會務說明',title:founder?'未成年人不能當發起人：發起人必須是成年人；入會和當理監事則看章程':'未成年人可不可以入會、當理事或監事：法規沒有年齡限制，看章程的會員資格；發起人則必須成年',
 summary:(founder?'不可以。發起人必須是成年人（人民團體法第8條）。\n\n至於入會和擔任理事、監事：':'法規沒有年齡限制，要看協會的章程。')+'\n\n• 入會：人民團體法沒有限制會員的年齡，會員資格由各協會在章程訂定，並由理事會審定。\n• 當理事、監事：理事、監事是從會員裡選出來的（第17條），每位會員都有選舉權和被選舉權（第16條）。內政部的函釋說明：只要符合章程的會員資格、加入成為會員，就享有這些權利。所以章程沒有年齡限制的話，未成年的會員依法可以被選為理事或監事。\n• 當發起人：不可以，發起人必須成年（第8條）。\n\n提醒您：理事要參與決議、理事長要對外代表協會簽約，未成年人做這些事通常需要法定代理人同意。協會如果希望理事、監事由成年人擔任，請不要自己口頭限制，先和承辦人討論章程的會員資格怎麼訂；辦法人登記時法院要哪些文件，也請先問法院登記處。',
 statutes:[P(8),P(16),P(17),MOI('108年4月1日','台內團字第1080009490號',256743)],notes:['內政部另有函釋指出，章程不應額外限制會員參選理事、監事的資格條件（102年11月5日台內團字第1020342168號函）。'],actions:[{label:'看函釋目錄',view:'law',sub:'函釋與問答'}]};
}
function assocInvest(t){
 if(!/(股票|ETF|etf|基金(?!會)|投資|當股東|入股|開公司|公司登記|虛擬貨幣|比特幣|債券)/.test(t))return null;
 if(/合作社|社員|準備基金|提列基金|基金專戶|發展基金|會務基金|基金孳息|設基金|成立基金|個人|我自己/.test(t))return null;
 if(!/(協會|團體|本會|會裡|公款|會費|經費|可以|能不能|可不可以)/.test(t))return null;
 const co=/(開公司|公司登記)/.test(t);
 return{direct:true,category:'人民團體財務',title:co?'協會不能自己登記開公司：公司以營利為目的，和社會團體的公益目的不符':'協會的錢拿去買股票、投資：內政部函釋以「不宜開放」為原則，定存才是安全的做法',
 summary:co?'不可以。內政部的函釋說明：公司登記和商業登記都是以營利為目的，社會團體則是以公益為目的；章程的任務如果有營利事業項目，就會被認定不是以公益為目的。所以協會去申請公司登記並當負責人，不符合社會團體許可立案的規定。\n\n協會可以辦和宗旨有關的業務並收取費用（事業費是法定的經費來源之一，人民團體法第33條），但收入要回到會務上，不能分配給會員。'
 :'原則上不宜。內政部的函釋說明：社會團體是非營利組織，經費多半來自會費和捐款；拿去投資營利事業當股東，或買股票這類風險較高的理財，萬一投資失當會影響會務，所以以不宜開放為原則。\n\n• 股票、入股公司：不宜。\n• ETF：內政部107年的函釋轉述金管會的意見，ETF能分散風險；如果要用自有資金投資臺股ETF，建議先建立內部的投資評估、管理和停損機制，並經過適當的授權審核程序。實際要做之前，請先和承辦人確認。\n• 定期存款：可以。協會的錢要存在銀行、農會、漁會、信用合作社或郵局，用協會的名義（社會團體財務處理辦法第16條）。',
 statutes:co?[P(33),MOI('105年10月18日','台內團字第1050434066號',256723)]:[F(16),MOI('103年6月12日','台內團字第1030164596號',256703),MOI('107年2月14日','台內團字第1071400191號',256738)],notes:[],actions:[{label:'看函釋目錄',view:'law',sub:'函釋與問答'}]};
}
function candidateDeposit(t){
 if(!/(保證金|押金)/.test(t)||!/(參選|候選|選理事|選監事|選舉|登記)/.test(t)||/合作社|社員|公職|議員|村長|里長/.test(t))return null;
 return{direct:true,category:'選舉與改選',title:'不適合要求參選理監事的人繳保證金：這是用財產限制會員的被選舉權',
 summary:'不適合。每位會員都有選舉權和被選舉權，而且每人一權（人民團體法第16條）。內政部的函釋說明：要求理監事參選人繳保證金，是用財產限制會員參與會務，違反這一條的立法精神，實屬不宜。\n\n同樣的道理，內政部另一份函釋也說：章程不應該另外限定會員參選理事、監事的資格條件（例如入會要滿一年才能參選）。',
 statutes:[P(16),MOI('105年4月7日','台內團字第1050018552號',256720),MOI('102年11月5日','台內團字第1020342168號',256699)],notes:[],actions:[{label:'看函釋目錄',view:'law',sub:'函釋與問答'}]};
}
function chairAndRecorder(t){
 if(!/(主席|主持)/.test(t)||!/(紀錄|記錄)/.test(t)||!/(同一|同時|兼|一個人|自己)/.test(t)||/合作社|社員/.test(t))return null;
 return{direct:true,category:'會議程序',title:'開會的主席和紀錄不適合是同一個人',
 summary:'不適合。內政部的函釋說明：人民團體開會，主席和紀錄同時各有職責，不宜由同一個人擔任。\n\n開會時請另外指定一位紀錄（通常是總幹事或工作人員），會議紀錄上分別寫出主席和紀錄的姓名。',
 statutes:[MOI('81年4月24日','台(81)內社字第8176308號',220233)],notes:[],actions:[{label:'看函釋目錄',view:'law',sub:'函釋與問答'}]};
}
function facebookGroup(t){
 if(!/(臉書|facebook|fb|line群|賴群|網路社團|社群)/i.test(t)||!/(算|是不是|要不要|需要|立案|登記|人民團體|合法)/.test(t)||/合作社|粉專經營|宣傳|公告|通知/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'臉書社團、LINE 群組不算人民團體：要向主管機關申請許可立案才是',
 summary:'不算。內政部的函釋說明：人民團體的籌組採許可制，要由發起人向主管機關申請許可（人民團體法第8條）；在臉書上成立的社團沒有申請許可立案，就不是人民團體法規範的團體。\n\n網路上的社團想變成正式的協會，要由30位以上的成年發起人，向會址所在地的主管機關申請籌組。在屏東縣請洽縣府社會處。',
 statutes:[P(8),MOI('101年4月3日','台內社字第1010143314號',256683)],notes:[],actions:[{label:'看成立流程',view:'biz',sub:'social'}]};
}

/* 函釋型直答：觸發詞、排除詞、標題、內文、依據 */
const RULING_RULES=[
 [/(過世|死亡|往生|去世).{0,12}委託書|委託書.{0,12}(過世|死亡|往生|去世)/,/合作社|社員/,'會員過世後，他生前簽的委託書就失效了','不能用了。會員死亡就是出會（人民團體法第15條），已經沒有會員資格，不能再以會員的身分委託別人出席。內政部的函釋說明：這種情形委託書失去效力。\n\n這一位也不再算進應出席人數，請理事會在審定會員名冊時一併更新。',()=>[P(15),MOI('108年8月21日','台內團字第1080054016號',256750)]],
 [/(叫|用|取名|名稱|改成|冠).{0,6}總會|總會.{0,6}(名稱|可以|能不能)/,/合作社|全國|體育總會/,'協會名稱用「總會」：要由團體會員組成、名實相符','要名實相符才適合。內政部的函釋說明：社會團體用「總會」當名稱，依一般社會通念，應該是由若干「團體」會員組成的團體，而且團體會員要有一定的代表性。\n\n如果協會的會員都是個人，不建議用「總會」。名稱另外不能和已許可的團體相同、不能讓人誤認和政府機關或營利團體有關，也不能有歧視性或仇恨性的文字（人民團體法第7條）。',()=>[P(7),MOI('106年5月4日','台內團字第1060013061號',256725)]],
 [/候補(理事|監事|理監事).{0,10}(總幹事|秘書長|工作人員|會計|出納|幹事|職員|員工)|(總幹事|秘書長|工作人員|會計|出納|幹事).{0,10}候補(理事|監事|理監事)/,/合作社|社員/,'候補理事、候補監事可以當工作人員；一旦遞補成理監事就不行','可以。內政部的函釋說明：社會團體的候補理事、候補監事可以擔任工作人員；但是一旦遞補成為理事或監事，就不能再擔任工作人員。\n\n所以候補理事當總幹事、會計沒有問題；等到他遞補為正式的理事或監事時，兩個身分只能留一個。',()=>[MOI('82年6月2日','台(82)內社字第8211459號',219694)]],
 [/流會.{0,14}(解職|解除|解任|撤換|換掉|處分|怎麼辦|會怎樣)|(一直|連續|好幾次|兩次|2次|二次).{0,6}流會/,/合作社|社員|大會|會員大會/,'理事會因為人數不夠而流會，理事長不會因此被解職；故意不召開才會','不會因此被解職。人民團體法第30條規定的是：理事長或監事會召集人「無正當理由不召開」理事會或監事會超過2個會次，由主管機關解除職務。內政部的函釋說明：這是指有召集權的人故意不召集；有依規定召集，只是出席人數不夠而流會2次以上，還不能直接認定符合第30條。\n\n不過會一直開不成，會務會停擺。請先了解理事不來的原因，改約大家方便的時間；理事連續2次無故缺席，依法視同辭職，由候補理事遞補（第31條）。',()=>[P(30),P(31),MOI('102年9月5日','台內團字第1020287241號',256698)]],
 [/(捐|贈|送).{0,8}(土地|房子|房屋|不動產|建物|會館).{0,6}給.{0,6}(協會|本會|我們|團體)|(受贈|接受捐贈).{0,6}(土地|房子|房屋|不動產)/,/合作社|社員|協會.{0,4}(捐|贈|送)給|捐給(政府|縣府|公所|學校)/,'有人捐土地或房子給協會：單純受贈不一定要先開會員大會，有附帶負擔才要','單純接受捐贈，不一定要先經會員大會通過。內政部的函釋說明：單純受贈不動產，不是處分協會原有的財產，也不是購置、出售、轉讓或設定他項權利，和人民團體法第27條第4款、社會團體財務處理辦法第13條規定的情形不同；純粹得到利益的，不以會員大會通過為必要。\n\n但是請注意：\n• 受贈的財產如果附帶負擔（例如有貸款、有使用條件），會影響協會其他的權利義務，還是要依章程和法令的程序提會討論。\n• 不動產要登記在協會名下，通常協會要先辦好法人登記，請先問地政事務所。\n• 受贈後請列入財產目錄，並建議在理事會、會員大會提出報告。',()=>[P(27),F(13),MOI('104年1月27日','台內團字第1040000870號',256709)]],
 [/(主動|自己|自動).{0,6}(捐|贈)|(沒有|沒|不).{0,4}(對外)?(募款|勸募).{0,10}(捐|收)|被動.{0,4}(捐|受贈)/,/合作社|社員|匿名|扣繳|抵稅|收據怎麼開/,'別人主動捐款給協會可以收：沒有對外公開募款，就算「其他收入」','可以收。內政部的函釋說明：已立案的社會團體，被動接受社會大眾（不是會員）的捐款，屬於人民團體法第33條經費來源裡的「其他收入」，依法沒有不許。\n\n但是如果協會有對外公開募款、發起勸募活動，就要適用公益勸募條例，先向主管機關申請勸募許可。\n\n收到捐款請開收據、入協會的帳戶，並列入年度的收支決算。',()=>[P(33),MOI('107年2月9日','台內團字第1071400341號',256737)]],
 [/決算.{0,10}(退回|核退|不通過|不同意|不簽|有意見)|監事會.{0,8}(退回|核退|不通過|不簽).{0,6}決算/,/合作社|社員/,'決算被監事會退回：把監事會的意見一起提到會員大會，大會通過仍然有效','可以連同監事會的意見一起提會員大會。年度決算要先送監事會審核，監事會造具審核意見書後，一併提報會員大會（人民團體法第34條）。內政部的函釋說明：決算雖然被監事會核退，只要提報大會時把監事會的核退意見一併提出，大會通過的決議於法沒有不合，不能認為無效。\n\n建議先請監事會把退回的理由寫清楚，理事會能補正的先補正；補不了的，就在大會上如實報告，由會員決定。',()=>[P(34),MOI('86年3月3日','台內社字第8605587號',220166)]],
 [/理事長.{0,6}(請長假|長期請假|請假.{0,4}(一年|兩年|半年|很久|多久|最長)|出國.{0,4}(一年|兩年|半年|很久))/,/合作社|社員/,'理事長不應該長期請假：請假期間要有人代理，太久應該辭職改選','不應該。內政部的函釋說明：理事長受全體會員付託，對內綜理會務、對外代表協會，責任重大，不應長期請假，以免影響會務進行。\n\n短期請假時，由誰代理請看章程（通常是由理事長指定常務理事一人代理，沒有指定時由常務理事互推）。如果確定很長一段時間都不能執行職務，建議書面提出辭職，經理事會決議後，在一個月內補選理事長（人民團體選舉罷免辦法第27條、第17條）。',()=>[ER(27),ER(17),MOI('74年8月19日','(74)台內社字第339064號',220217)]],
];
function rulingRules(t){
 for(const [re,ex,title,summary,st] of RULING_RULES){if(re.test(t)&&!ex.test(t))return{direct:true,category:'人民團體會務說明',title,summary,statutes:st(),notes:[],actions:[{label:'看函釋目錄',view:'law',sub:'函釋與問答'}]}}
 return null;
}

/* ── 2026-11-12 第六批：最基本的「○○怎麼辦理」要有固定答案，不交給資料庫比對 ── */
function electionHowTo(t){
 const due=/(任期|[三四3-4]年|屆滿|這一屆|這屆).{0,6}(到了|快到|滿了|期滿|到期|快滿|屆滿).{0,10}(怎麼辦|要做什麼|要辦什麼|做什麼|怎麼做|要幹嘛)/.test(t)&&!/連任|還沒改選|沒改選|逾期|過期/.test(t);
 const pick=/^(協會|社區發展協會|我們協會|本會)?的?(理事|監事|理監事)(和監事|跟監事)?(要)?(怎麼選|怎麼產生|如何產生|誰選|怎麼選出來)/.test(t);
 if(!/(改選|選舉|換屆)/.test(t)&&!due&&!pick)return null;
 if(!due&&!pick&&!/(怎麼辦|流程|步驟|程序|怎麼做|怎麼選|要做什麼|要辦什麼)/.test(t)&&!/^(社區發展協會|社區|協會|合作社|理監事|理事會|我們協會|本會)?的?(理監事|理事|理事長)?(改選|選舉)$/.test(t))return null;
 if(/票.{0,4}(怎麼|要怎麼)(做|印|製)|選票|視訊|線上|通訊|罷免|補選|延期|延後|來不及|過期|逾期|沒改選|同票|選票|圈選|連記|沒到齊|人沒到|到齊|不到|委託|國外|海外|糾紛|無效|爭議|公職|議員|村長|里長|會員代表|幾票|保證金|公文|文件|表格|下載|範本|時間|什麼時候|多久|幾年|移交|交接|不交|不承認|不服/.test(t))return null;
 if(/合作社|社員/.test(t))return{direct:true,category:'合作社會務',title:'合作社改選理事、監事：由社員大會從社員裡選出，任期最長3年',
  summary:'合作社的理事、監事，由社員大會從社員裡選任，理事至少3人、監事至少3人（合作社法第32條）；任期不能超過3年，除了法律或章程另有規定以外，連選可以連任（第33條）。\n\n辦理的順序：\n1. 任期快到之前，由理事會決定社員大會的日期和選舉的議程。\n2. 依章程規定的期限通知社員開會。\n3. 社員大會選出新一屆的理事、監事。\n4. 新的理事互推對外代表合作社的人（通常稱理事主席）（第34條），辦理交接。\n5. 把改選結果報縣府，並辦理變更登記。\n\n每個合作社的章程對名額、選舉方式和通知期限的規定不同，請先翻章程；要送哪些文件，請洽縣府社會處合作社承辦人洪振育（08-7320415 轉 5312）。',
  statutes:[C(32),C(33),C(34)],notes:[],actions:[{label:'合作社辦理說明',view:'biz',sub:'coop'}]};
 const cm=/社區/.test(t);
 return{direct:true,category:'選舉與改選',title:(cm?'社區發展協會':'協會')+'改選怎麼辦：任期屆滿前一個月內開會員大會選出新理監事，選後30日內報縣府',
 summary:(cm?'社區發展協會也是依人民團體法立案的社會團體，改選的程序和一般協會相同。\n\n':'')+'改選要在這一屆理監事任期屆滿前一個月內辦理；確實有困難的，可以向縣府申請延長，最多3個月（人民團體選舉罷免辦法第21條）。\n\n一步一步做：\n1. 開理事會：決定會員大會的日期、地點和議程，並審定會員資格、造具會員名冊。名冊要在開會15日前完成，提供會員閱覽（同辦法第5條）。\n2. 發開會通知：在開會15日前通知每一位會員，同時發文請縣府派員列席（人民團體法第26條）。\n3. 開會員大會：要有會員過半數出席才能開會（第27條）。選舉用無記名連記法；出席人數三分之一以上同意的，可以改用限制連記法（選舉罷免辦法第4條）。\n4. 開新一屆第一次理事會、監事會：理事互選常務理事和理事長，監事互選常務監事（人民團體法第17條）。新一屆的任期從這次理事會那天起算（選舉罷免辦法第28條）。\n5. 交接：上一屆把立案證書、圖記、帳冊、檔案造冊，新理事長就任後15日內交接完畢（人民團體會務輔導辦法第18條）。\n6. 報縣府：改選後30日內，把會議紀錄、新的理監事簡歷冊等報縣府核備（人民團體法第54條）。\n\n需要的公文和表格，可以到「書表下載」的「改選」分類下載。',
 statutes:[ER(21),ER(5),P(26),P(27),ER(4),P(17),ER(28),G(18),P(54)],notes:cm?['社區發展協會的改選文件，請洽縣府社會處或所在地的鄉（鎮、市）公所。']:[],actions:[{label:'下載改選書表',view:'forms',sub:'改選'},{label:'看改選流程',view:'meet',sub:'m-elect'}]};
}
function chairChangeTodo(t){
 if(!/理事長/.test(t)||!/(換人|換了|變更|異動|更換|改選後|新任|交接後|上任)/.test(t))return null;
 if(!/(怎麼辦|要辦什麼|要做什麼|要辦哪些|手續|流程|要通知|要報|程序|法院|變更登記)/.test(t))return null;
 if(/合作社|社員|聘約|員工|總幹事|統編|國稅|扣繳|銀行|開戶|印鑑|圖記|交接|移交|不交/.test(t))return null;
 return{direct:true,category:'選舉與改選',title:'理事長換人之後要辦的事：報縣府核備、交接、法院和國稅局、銀行的變更',
 summary:'理事長換人（不管是改選還是中途補選），後面有幾件事要接著辦：\n\n1. 報縣府核備：30日內把會議紀錄和新的理監事簡歷冊（負責人名冊）報縣府（人民團體法第54條）。\n2. 交接：前任把立案證書、圖記、帳冊、檔案造冊移交，新理事長就任後15日內會同監交人接收完畢（人民團體會務輔導辦法第18條）。\n3. 法院：已經辦法人登記的協會，要向法院登記處辦理理事長的變更登記。\n4. 國稅局：統一編號不用重新申請，但要辦扣繳單位的負責人變更。\n5. 銀行、郵局：更換帳戶的負責人和印鑑。\n\n如果理事長是任期中出缺，要在出缺之日起一個月內補選；剩下的任期不到6個月的，可以依章程規定或由常務理事互推一人代理（人民團體選舉罷免辦法第17條）。',
 statutes:[P(54),G(18),ER(17)],notes:['法院、國稅局和銀行各自要哪些文件，請直接向該機關確認。'],actions:[{label:'下載改選書表',view:'forms',sub:'改選'}]};
}
function byElection(t){
 if(/^(協會|我們協會|本會)?的?(理事|監事|理監事)(人數)?(不夠|不足|缺額|少了|出缺|缺人)了?(怎麼辦|要補選嗎|要不要補選)?[嗎呢？?]*$/.test(t))t=t+'補選怎麼辦';
 if(!/補選/.test(t)||!/(怎麼辦|流程|程序|怎麼做|什麼時候|何時|要不要|需要|多久|可以)/.test(t))return null;
 if(/合作社|社員|視訊|線上|通訊|會員代表|三分之二以上.{0,6}可以/.test(t))return null;
 return{direct:true,category:'選舉與改選',title:'補選怎麼辦：先由候補遞補；遞補後不到名額三分之二才補選，理事長出缺一個月內補選',
 summary:'理事、監事出缺時，先由候補理事、候補監事依序遞補，不是馬上補選。\n\n什麼時候要補選（人民團體選舉罷免辦法第17條）：\n• 理事、監事：遞補之後，人數還是不到章程名額的三分之二，就要開會員大會補選足額。\n• 理事長、常務理事、常務監事（監事會召集人）：出缺之日起一個月內補選。理事長剩下的任期不到6個月的，可以依章程規定或由常務理事互推一人代理；沒有設常務理事的，由理事互推。\n\n怎麼補選：\n• 補選理事、監事要開會員大會，程序和改選一樣（15日前通知、會員過半數出席）。\n• 補選理事長、常務理事由理事會辦理；補選常務監事由監事會辦理。\n• 補選後30日內，把會議紀錄和異動後的名冊報縣府核備（人民團體法第54條）。',
 statutes:[ER(17),P(54)],notes:[],actions:[{label:'下載改選書表',view:'forms',sub:'改選'}]};
}
function mergeGroups(t){
 if(!/(合併|併入|分立|拆成兩個|分成兩個)/.test(t)||!/(協會|團體|本會|兩個會)/.test(t)||/合作社|社員|縣市合併|改制|帳戶|報表|借用|沿用/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'協會合併或分立：各自開會員大會決議，報縣府核定後辦理',
 summary:'可以，但要經會員大會決議，並報主管機關核定。\n\n人民團體合併或分立時，人事、財產和其他權利義務要怎麼承受或移轉，應該經會員大會決議通過，報請主管機關核定後辦理（人民團體會務輔導辦法第7條）。\n\n實務上請注意：\n• 要合併的每一個協會，都要各自開會員大會通過。\n• 合併會牽涉到章程變更、財產處分甚至其中一個協會解散，這些事項都要出席人數三分之二以上同意（人民團體法第27條）。\n• 合併後要用哪一個名稱、理監事怎麼產生、屆次怎麼算，每個案子不一樣，請在開會前先和縣府承辦人討論。',
 statutes:[G(7),P(27)],notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function meetingHowTo(t){
 if(!/^(我們)?(協會|社區發展協會|社區|本會|團體)?的?(開會|會議)(要)?(怎麼辦|怎麼開|流程|程序|有什麼規定|規定|要注意什麼)[嗎呢？?]*$/.test(t))return null;
 return{direct:true,category:'會議程序',title:'協會開會怎麼辦：會員大會每年一次、15日前通知；理事會和監事會至少每6個月一次',
 summary:'協會的會議分成兩種，規定不一樣：\n\n會員大會\n• 每年至少開一次定期會議，由理事長召集（人民團體法第25條）。\n• 開會15日前通知每一位會員，並報請縣府派員列席（第26條）。\n• 要有會員過半數出席才能開會；一般議案由出席人數過半數同意，修改章程、除名、罷免、處分財產、解散等要出席人數三分之二以上同意（第27條）。\n\n理事會、監事會\n• 一般協會（社會團體）至少每6個月各開一次（第43條）；章程訂得比較密的，照章程。可以通知候補理事、候補監事列席（第29條）。\n• 理事、監事過半數出席，出席人數過半數同意才能決議（第29條）。\n• 理事、監事要親自出席，不能委託別人；連續2次無故缺席，視同辭職（第31條）。\n\n每次開完會都要做會議紀錄。會員大會的開會通知、簽到簿、會議紀錄範本，可以到「書表下載」找。',
 statutes:[P(25),P(26),P(27),P(43),P(29),P(31)],notes:['公會等職業團體的理事會、監事會是每3個月至少一次（第29條）。'],actions:[{label:'看會議辦理說明',view:'meet',sub:'m-assembly'},{label:'下載書表',view:'forms',sub:''}]};
}
function officerResignHow(t){
 if(!/(理事|監事)/.test(t)||/理事長|常務|合作社|社員|公會/.test(t))return null;
 if(!/(辭職|辭任|請辭|不做了|不幹了|辭掉)/.test(t)||!/(怎麼辦|怎麼辭|程序|流程|手續|要不要|需要|可以)/.test(t))return null;
 if(/全體|總辭|都辭|口頭|反悔|收回|撤回|再當選|再選/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'理事、監事辭職：書面提出，經理事會（監事會）決議通過後解任，由候補遞補',
 summary:'理事或監事要辭職，請這樣辦：\n\n1. 用書面提出辭職。\n2. 理事的辭職經理事會決議，監事的辭職經監事會決議，通過後解任（人民團體選舉罷免辦法第27條、人民團體會務輔導辦法第9條）。\n3. 缺額由候補理事、候補監事依序遞補；遞補後人數不到章程名額的三分之二，才要補選（選舉罷免辦法第17條）。\n4. 在下一次會員大會提出報告，並在30日內把異動後的名冊報縣府核備（人民團體法第54條）。\n\n提醒您：辭職之後，不能在原來的任期內再當選同一個職務，也不能退為候補（選舉罷免辦法第27條）。',
 statutes:[ER(27),G(9),ER(17),P(54)],notes:[]};
}
function finalAccountsWho(t){
 if(!/(決算|結算|年度帳|財務報告)/.test(t)||!/(給誰看|誰看|誰審|誰查|要不要公開|公布|要送誰|誰通過|經過誰)/.test(t)||/合作社|社員/.test(t))return null;
 return{direct:true,category:'人民團體財務',title:'決算要經過三關：監事會審核、會員大會通過、報縣府',
 summary:'協會每年的決算，要依序經過三關：\n\n1. 監事會：理事會編好決算後，先送監事會審核，監事會把審核結果寫成意見（人民團體法第34條）。\n2. 會員大會：決算連同監事會的審核意見，提會員大會通過（第34條）。年度結束後3個月內要編好，提大會通過（社會團體財務處理辦法第11條）。\n3. 縣府：大會通過後，報縣府備查（同辦法第11條）。\n\n另外，協會的財務收支要定期公告，讓會員知道（同辦法第20條）。',
 statutes:[P(34),F(11),F(20)],notes:[]};
}
function publicServantOfficer(t){
 if(!/(公務員|公務人員|公教人員|老師|教師|校長|軍人|警察|公職人員)/.test(t)||!/(理事長|理事|監事|理監事|幹部|發起人)/.test(t))return null;
 if(!/(可以|能不能|可不可以|能當|當|擔任|兼)/.test(t)||/合作社|社員|公會|教師會|教育會|家長會|總幹事|秘書長|工作人員|員工|領薪|薪水/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'公務員、老師可以當協會的理事長或理監事：人民團體法沒有禁止，但要符合自己服務機關的兼職規定',
 summary:'人民團體法沒有禁止。只要是協會的會員，就有選舉權和被選舉權（人民團體法第16條），可以被選為理事、監事或理事長（第17條）；理事、監事是無給職（第21條）。\n\n不過公務員、教師、軍警人員另外受自己身分的法規約束（例如公務員服務法對兼職的規定）。能不能兼任、要不要先報准，是由服務機關認定，請先問服務機關或學校的人事單位。\n\n聘僱的工作人員（總幹事、會計等）是有薪水的工作，公務員能不能兼，限制比較多，更要先問人事單位。',
 statutes:[P(16),P(17),P(21)],notes:[]};
}
function relativesAsOfficers(t){
 if(!/(夫妻|夫婦|父子|父女|母子|母女|兄弟|姊妹|姐妹|親屬|親戚|一家人|同一家|配偶|三親等|二親等)/.test(t))return null;
 if(!/(理事|監事|理監事|常務)/.test(t)||/合作社|社員|總幹事|秘書長|工作人員|會計|出納|幹事|職員|員工|聘/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'親屬可以同時當理事或監事：人民團體法沒有親等限制，但章程另有規定的照章程',
 summary:'人民團體法沒有限制親屬同時擔任理事、監事。理事、監事是由會員大會從會員裡選出來的（人民團體法第17條），每位會員都有被選舉權（第16條），夫妻、父子、兄弟只要都是會員、都當選，依法就可以同時擔任。\n\n要注意三件事：\n• 章程如果另有限制（例如規定理事長和監事不能是近親），就要照章程。\n• 同一個人不能同時當理事又當監事。\n• 監事會負責查核理事會的財務，理事長和監事是近親，容易讓會員質疑查帳不公正，建議盡量避開。\n\n聘僱的工作人員（總幹事、會計等）是不是可以用理事長的親屬，是另一個問題，請另外詢問。',
 statutes:[P(16),P(17)],notes:[]};
}
function receiptsBasic(t){
 if(!/收據/.test(t)||!/(可以開|能不能開|要不要開|需要開|一定要開|怎麼開|開收據)/.test(t))return null;
 if(/合作社|社員|補助|核銷|領款|抵稅|扣抵|列舉扣除|勸募|匿名|遺失|作廢|印花|格式|範本|下載|捐款|捐贈/.test(t))return null;
 return{direct:true,category:'人民團體財務',title:'協會可以開收據，而且收到錢就應該開：用協會的名義、蓋協會的章',
 summary:'可以，而且應該開。協會收會費、捐款或活動費用，都是法定的經費來源（人民團體法第33條），每一筆都要入帳，不能匿報或虛報（社會團體財務處理辦法第20條）。開給對方的收據，就是協會的對外憑證（同辦法第8條）。\n\n開收據請注意：\n• 用協會的全名，寫清楚日期、金額、付款人和事由（會費、捐款或活動費）。\n• 蓋協會的圖記，並由經手人簽章。\n• 收據要連號、留存根，年底才對得上帳。\n• 收到的錢要存進協會的帳戶。\n\n捐款人想拿收據去報稅扣除的，能不能扣、收據要寫哪些內容，請洽國稅局。',
 statutes:[P(33),F(20),F(8)],notes:[]};
}
function memberRepThreshold(t){
 if(!/會員代表/.test(t)||!/(幾人|多少人|幾個人|300|三百|人數|門檻|什麼時候可以|才可以|才能|可以選|可以設|要不要設|一定要)/.test(t))return null;
 if(/合作社|社員|團體會員|委託|出席|任期|上級|推派|更替|換人|死亡|當選理事/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'會員超過300人，可以分區選出會員代表，改開會員代表大會',
 summary:'會員（會員代表）人數超過300人的協會，可以劃分地區，依各區的會員人數比例選出代表，再合開會員代表大會，行使會員大會的職權（人民團體法第28條）。這是「可以」，不是一定要；會員不到300人的協會，就由全體會員開會員大會。\n\n要改開會員代表大會，請注意：\n• 地區怎麼劃分、每一區選幾位代表，要報請縣府核備（第28條）。\n• 會員代表怎麼選、任期多久，要寫進章程或另訂選舉辦法，經會員大會通過。\n• 會員代表要由會員選出來，不能由理事長或理事會指派。',
 statutes:[P(28)],notes:[]};
}

function annualAccountsHowTo(t){
 if(!/(決算|預算|年度報表|財務報表|年度報告|會計報告|年度財報|年度計畫|工作報告)/.test(t))return null;
 if(!/(怎麼辦|流程|程序|怎麼報|要做什麼|怎麼送)/.test(t))return null;
 if(/什麼時候|何時|期限|多久|幾月|合作社|社員|補助|核銷|會計師|退回|核退|誰看|誰審|格式|表格|下載|範本|怎麼填|超支|追加|魅力/.test(t))return null;
 return{direct:true,category:'人民團體財務',title:'每年的預算和決算怎麼辦：理事會編、監事會審決算、會員大會通過、報縣府',
 summary:'每年有兩份東西要做，都由理事會編，提會員大會通過後報縣府（人民團體法第34條、社會團體財務處理辦法第11條）。\n\n預算（今年要做什麼、要花多少）\n• 會計年度開始前，理事會編好年度工作計畫和收支預算表。\n\n決算（去年做了什麼、花了多少）\n• 會計年度結束後3個月內，理事會編好上年度的工作報告和會計報告。\n• 會計報告包括：收支決算表、資產負債表、財產目錄、基金收支表（同辦法第12條）。\n• 決算要先送監事會審核，把審核結果一起提報會員大會（人民團體法第34條）。\n\n接著\n• 把上年度的工作報告、會計報告，連同今年的工作計畫、收支預算表，一起提會員大會通過，再報縣府備查。\n• 來不及開會員大會的，可以先經理事會和監事會（或理監事聯席會議）通過，之後提大會追認，再報縣府。\n\n表格可以到「書表下載」找。',
 statutes:[P(34),F(11),F(12)],notes:['協會的會計年度是每年1月1日到12月31日。'],actions:[{label:'下載財務書表',view:'forms',sub:'財務'}]};
}
function boardMeetingHowTo(t){
 if(!/^(我們)?(協會|社區發展協會|本會)?的?(理事會|監事會|理監事會|理監事聯席會|理監事會議|理事會議|監事會議)(要)?(怎麼辦|怎麼開|流程|程序|有什麼規定|要注意什麼)[嗎呢？?]*$/.test(t))return null;
 return{direct:true,category:'會議程序',title:'理事會、監事會怎麼開：7日前通知、過半數出席、理監事要親自出席',
 summary:'理事會和監事會原則上分開開，各自這樣辦：\n\n• 多久開一次：一般協會（社會團體）至少每6個月各開一次（人民團體法第43條）；章程訂得比較密的，照章程。\n• 誰召集：理事會由理事長召集，監事會由監事會召集人（常務監事）召集（人民團體會務輔導辦法第11條）。\n• 什麼時候通知：開會7日前，把會議種類、時間、地點和議程通知應出席的人；緊急事故開臨時會，開會前一日送達通知也可以（同條）。\n• 幾個人才能開：理事（監事）過半數出席，出席人數過半數同意才能決議；可以通知候補理事、候補監事列席（人民團體法第29條）。\n• 不能委託：理事、監事要親自出席；連續2次無故缺席，視同辭職（第31條）。\n• 會議紀錄：寫明日期、出缺席和決議，協會自己留存，提供會員查閱（會務輔導辦法第12條）。\n\n理監事聯席會議要理事長和常務監事都同意才召集，由兩人共同主持；理事、監事要各自過半數出席、各自過半數同意（同辦法第11條）。',
 statutes:[P(43),G(11),P(29),P(31),G(12)],notes:['公會等職業團體的理事會、監事會是每3個月至少一次（第29條）。'],actions:[{label:'看會議辦理說明',view:'meet',sub:'m-board'}]};
}
function memberQuitHowTo(t){
 if(!/(退會|退出(協會|本會|社團|團體)|不想(再)?當會員|不當會員|退社團)/.test(t)||/合作社|社員|退會費|退費|名冊|公會|強制/.test(t))return null;
 if(!/(怎麼辦|手續|程序|流程|可以|怎麼退|要不要|需要|怎麼做)/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'會員想退會：人民團體法沒有規定手續，照章程辦，一般是書面向協會提出',
 summary:'可以退會。參加或不參加團體是個人的自由，協會不能強留。\n\n• 手續：人民團體法沒有規定退會的手續。會員的入會、出會要寫在章程裡（第12條），所以請先看章程；一般的做法是用書面向協會聲明退會，由理事會備查後，從會員名冊移除。\n• 名冊：協會要隨時更新會籍資料（人民團體會務輔導辦法第10條），退會的人不再算進應出席人數。\n• 已經繳的會費退不退，看章程；章程沒有寫的，通常不退。\n• 如果您是理事或監事，退會就喪失會員資格，理監事的職務也跟著解任，由候補的人遞補（第23條）。\n\n另外，法律上的「出會」還有三種情形：死亡、喪失會員資格、被會員大會決議除名（第15條）。',
 statutes:[P(12),P(15),P(23),G(10)],notes:[]};
}

function moneyMisuse(t){
 if(!/(亂花|亂用|A錢|a錢|污錢|挪用|侵占|私用|帳目不清|帳不清|不公開帳|不給看帳|做假帳|假帳|公款私用|中飽私囊|吞掉)/.test(t))return null;
 if(/合作社|社員|補助款|勸募/.test(t))return null;
 return{direct:true,category:'人民團體財務',title:'懷疑理事長或幹部亂用協會的錢：先請監事會查帳，再提會員大會或向縣府反映，涉及犯罪找司法機關',
 summary:'可以照下面的順序處理：\n\n1. 請監事會查帳。協會的財務由監事會查核，必要時可以開臨時監事會做臨時查核（社會團體財務處理辦法第22條）。協會的收支不能匿報或虛報，而且要定期公告（同辦法第20條）。\n2. 在會員大會提出來。每年的決算要先經監事會審核，再提會員大會通過（人民團體法第34條），會員可以在大會上要求說明；理事會不開大會的，會員五分之一以上可以請求召開臨時大會（第25條）。\n3. 向縣府反映。協會違反法令或章程的，主管機關可以警告、撤銷決議、限期改善，情節重大的可以撤免職員（第58條）；主管機關也可以抽查協會的財務（財務處理辦法第22條）。\n4. 找司法機關。如果有具體事證顯示有人把公款佔為己有，這已經是刑事問題，主管機關不能代替法院認定，請向警察機關或地檢署提出。\n\n提醒您：請先把手上的資料（收據、存摺明細、會議紀錄）整理好，用書面提出，比較容易處理。',
 statutes:[F(22),F(20),P(34),P(25),P(58)],notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function supervisorNoMeeting(t){
 if(!/監事會|常務監事/.test(t)||!/(不開|沒開|不召開|都沒開|一直沒開|不召集|擺爛|不做事)/.test(t)||/合作社|社員|召集人/.test(t))return null;
 return{direct:true,category:'會務糾紛與拒不召集',title:'監事會一直不開：常務監事無正當理由超過2個會次不召開，主管機關可以解除他的職務',
 summary:'監事會由監事會召集人（常務監事）召集，一般協會至少每6個月要開一次（人民團體法第43條）。\n\n• 先提醒：請其他監事或理事會用書面請常務監事召開，留下紀錄。\n• 還是不開：監事會召集人沒有正當理由，超過2個會次不召開監事會的，由主管機關解除他的職務，另行改選或改推（第30條）。可以把書面催告的紀錄送縣府，請縣府處理。\n• 監事會沒辦法依法召開的時候，主管機關也可以指定一位監事來召集（第32條）。\n• 內政部的函釋說明：「不召開」是指有召集權的人故意不召集；有召集、只是人數不夠而流會，不算。\n\n監事會不開，決算就沒有人審核，會影響會員大會，請儘早處理。',
 statutes:[P(43),P(30),P(32),MOI('102年9月5日','台內團字第1020287241號',256698)],notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function rosterView(t){
 if(!/(會員名冊|會員名單|會員資料|名冊)/.test(t)||!/(給會員看|可以看|能看|要看|查閱|閱覽|公開|公布|索取|拿到|影印|提供)/.test(t))return null;
 if(/合作社|社員|民意代表|議員|別的團體|機關/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'會員名冊要提供會員閱覽：開會員大會15日前造好名冊，會員可以看',
 summary:'要。理事會要在召開會員大會15日前，審定應出席的會員資格，造具名冊，寫明姓名、聯絡電話、地址和權利義務受限制的情形，提供會員閱覽（人民團體會務輔導辦法第10條）。辦理選舉或罷免的時候也一樣（人民團體選舉罷免辦法第5條）。\n\n請注意：\n• 法規寫的是「提供閱覽」，也就是讓會員到會所查看。要不要讓會員影印、拍照或整份帶走，法規沒有規定，由協會決定。\n• 名冊上有電話和地址，屬於個人資料；會員看了以後只能用在會務上（例如確認自己的資格、連署），不能拿去做別的用途。',
 statutes:[G(10),ER(5)],notes:[]};
}
function whoManagesMoney(t){
 if(/合作社|社員|補助|勸募/.test(t))return null;
 const petty=/零用金|週轉金|備用金|現金.{0,4}(放|留|保管)/.test(t);
 if(!petty&&!/((協會|會裡|本會|我們會)?的?(錢|公款|經費|存摺|帳戶).{0,6}(誰管|誰保管|誰負責|誰拿|由誰|放誰|歸誰管)|領(錢|款).{0,6}(誰蓋章|蓋誰|要誰|幾個章|哪些章)|存摺.{0,4}印章.{0,6}(同一|分開))/.test(t))return null;
 return{direct:true,category:'人民團體財務',title:petty?'協會的現金要隨收隨存：法規沒有零用金的規定，日常小額支出請理事會先訂額度':'協會的錢怎麼管：存在協會名下的帳戶，領錢要理事長、總幹事、財務人員三方一起蓋章',
 summary:(petty?'法規沒有「零用金」的規定。協會收到的錢，要存進銀行、農會、漁會、信用合作社或郵局，以隨收隨存為原則，不能拿收到的錢直接去付帳（社會團體財務處理辦法第16條）。\n\n日常確實需要一點現金付小額支出的，建議由理事會先決議一個固定的額度和保管人，用完憑單據報銷再補足，並記在帳上，監事會查帳時才交代得清楚。\n\n':'')+'協會的錢這樣管：\n• 存在哪裡：存進銀行、農會、漁會、信用合作社或郵局，不能放在個人或其他公司那裡（社會團體財務處理辦法第16條）。\n• 領錢：要由協會負責人（理事長）、秘書長或總幹事、財務人員，在領款憑證上共同蓋章（同辦法第17條）。\n• 誰辦：會計、出納和財物管理由財務人員辦理，原則上要專任；人手不足時，可以由其他工作人員兼辦（同條）。\n• 收錢：每一筆收入都要開正式收據、留存根（同條）。\n• 誰查：由監事會查核（同辦法第22條）。',
 statutes:[F(16),F(17),F(22)],notes:['存摺和印章建議分別由不同的人保管。'],actions:[]};
}
function donationDeduct(t){
 if(!/(捐款|捐錢|捐贈|捐給)/.test(t)||!/(抵稅|扣除|節稅|報稅|扣抵|列舉)/.test(t)||/合作社|社員|匿名/.test(t))return null;
 return{direct:true,category:'人民團體財務',title:'捐款給協會能不能抵稅：要看協會是不是稅法上的公益團體，請向國稅局確認',
 summary:'不一定。捐款人報稅時能不能把捐款列舉扣除，是依所得稅法認定，不是由縣府社會處決定。一般來說，受贈的協會要是依法立案的教育、文化、公益、慈善團體，捐款人也要拿到協會開的正式收據。\n\n協會這邊要做的事：\n• 每一筆捐款都開正式收據、留存根（社會團體財務處理辦法第17條），寫明捐款人、金額、日期。\n• 捐款入協會的帳戶，列入年度決算。\n\n本站沒有收錄所得稅法的條文，扣除的條件和上限，請捐款人或協會直接向國稅局確認。',
 statutes:[F(17)],notes:[],actions:[]};
}

function intlGroupWho(t){
 if(!/國際性(社會)?團體|國際性社團|國際性協會/.test(t)||/合作社|任期|起算|改選|理事長|章程|會計年度|年會|國外|海外/.test(t))return null;
 return{direct:true,category:'人民團體會務說明',title:'國際性團體分縣級和全國性兩種：屏東縣級的找縣府社會處，全國性的找內政部',
 summary:'國際性社會團體依組織區域，分成兩種：\n\n• 屏東縣級的國際性團體：向屏東縣政府社會處辦理，承辦人是羅宇軒（08-7320415 轉 5317）。\n• 全國性的國際性團體：向內政部合作及人民團體司辦理，電話 1996。\n\n國際性團體在理事監事任期起算、會計年度上，章程另有規定並報經主管機關核准的，可以從章程（人民團體選舉罷免辦法第28條、社會團體財務處理辦法第10條）。',
 statutes:[ER(28),F(10)],notes:['要確認團體屬於縣級還是全國性，請看立案證書上的組織區域。'],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function chairRelativeStaff(t){
 if(!/(理事長)/.test(t))return null;
 if(!/(太太|老婆|妻子|先生|老公|丈夫|配偶|兒子|女兒|小孩|孩子|爸爸|媽媽|父親|母親|兄弟|姊妹|姐妹|哥哥|弟弟|姊姊|姐姐|妹妹|親戚|親屬|女婿|媳婦|孫|姪|外甥|岳|公婆|三親等)/.test(t))return null;
 if(!/(總幹事|秘書長|工作人員|會計|出納|幹事|職員|員工|聘)/.test(t))return null;
 if(/合作社|社員|公會/.test(t))return null;
 return{category:'人民團體會務說明',title:'理事長的配偶或親屬可以當總幹事等工作人員嗎：不可以，三親等以內不得聘僱（接任前已聘者除外）',
 summary:'不可以。社會團體不得聘僱現任理事長的配偶及三親等以內血親、姻親為工作人員；但在該理事長接任前就已聘僱的，不在此限（社會團體工作人員管理辦法第5條）。\n\n三親等以內大致包括：父母、子女（一親等）；祖父母、孫子女、兄弟姊妹（二親等）；曾祖父母、曾孫、伯叔姑舅姨、姪子女、外甥（三親等）；以及配偶的上述親屬（姻親）。\n\n另外，工作人員也不得由理事、監事擔任（第4條）。',
 statutes:[SW(5),SW(4)],
 notes:['親等計算如有疑義，請洽縣府社會處確認。']};
}

function staffMustBeMember(t){
 if(!/(總幹事|秘書長|工作人員|會務人員|幹事)/.test(t))return null;
 if(!/(會員|非會員|外人|外部)/.test(t))return null;
 if(!/(一定|必須|要是|才可以|才能|可以|能不能|資格|限定|嗎)/.test(t))return null;
 if(/合作社|社員|開戶|銀行/.test(t))return null;
 return{category:'人民團體會務說明',title:'總幹事不一定要是會員：法規沒有要求，但理事、監事不能兼任總幹事',
 summary:'人民團體法只規定「人民團體依其章程聘僱工作人員，辦理會務、業務」（人民團體法第24條），社會團體工作人員管理辦法也沒有規定總幹事或其他工作人員必須具有會員身分。\n\n因此是否限定由會員擔任，要看團體章程有沒有規定；章程沒有限制時，非會員也可以受聘。\n\n要注意：工作人員不得由理事、監事（選任之職員）擔任（社會團體工作人員管理辦法第4條），也不得聘僱現任理事長的配偶及三親等以內親屬（第5條）。聘僱程序是依理事會訂定的資格條件遴選，提經理事會通過後聘僱（第3條）。',
 statutes:[P(24),SW(3),SW(4),SW(5)],
 notes:['人民團體法第17條規定理事、監事須由會員（會員代表）中選出；這項規定針對理監事，不適用於總幹事等工作人員。']};
}
function chairFundraising(t){
 if(!/(募款|募捐|募集|勸募|捐款活動|募資|籌款)/.test(t))return null;
 if(!/(理事長|會長|負責人|個人|自己)/.test(t))return null;
 if(/合作社|社員/.test(t))return null;
 return{category:'公益勸募與捐款',title:'理事長不能自行以團體名義募款：須經團體決議，對外募款還要符合公益勸募條例',
 summary:'分兩層看：\n\n1. 團體內部：募款是團體的業務，應列入工作計畫與預算或經理事會決議，不是理事長個人可以自行決定（社會團體財務處理辦法第11條）；經費收支要在每次理事會提出審議，並送監事會監察（人民團體會務輔導辦法第17條）。\n\n2. 對外募款：向不特定大眾募集財物，屬於公益勸募。可以發起勸募的團體限於公立學校、行政法人、公益性社團法人及財團法人（公益勸募條例第5條），而且要事先向縣府（跨縣市向衛生福利部）申請許可（公益勸募條例第7條），並開立捐款專戶（第13條）。\n\n如果只是向會員或所屬人員募集，或接受外界主動捐贈，不必申請勸募許可，但要開立收據、定期公開徵信、依指定用途使用，並於年度終了後五個月內函報主管機關備查（公益勸募條例第6條）。',
 statutes:[F(11),G(17),CHR(5),CHR(6),CHR(7),CHR(13)],
 notes:['理事長以個人名義對外募款，捐款不屬於團體收入，也不能開立團體收據。']};
}
function boardBelowHalf(t){
 if(!/(理事|監事|理監事)/.test(t))return null;
 if(!/(不足過半|不足半數|未過半|未達半數|少於一半|不到一半|不足法定|未達法定|不夠開會|無法成會|不足額|人數不足|出缺太多)/.test(t))return null;
 if(/合作社|社員|\d/.test(t))return null;
 return{category:'人民團體會務說明',title:'理監事人數不足：先由候補依序遞補，遞補後未達章程名額三分之二要補選',
 summary:'理事會、監事會開會，各須有理事、監事過半數出席才能決議（人民團體法第29條第2項）。人數不足時的處理順序：\n\n1. 理事、監事出缺，由候補理事、候補監事依次遞補（人民團體法第23條、人民團體會務輔導辦法第9條第3項）。\n2. 遞補後，理事或監事人數未達章程所定名額三分之二時，應補選足額（人民團體選舉罷免辦法第17條）；補選由會員（會員代表）大會辦理。\n3. 理事會不能依法召開時，主管機關得指定理事一人召集；監事會不能依法召開時，得指定監事一人召集（人民團體法第32條）。\n\n建議先清查章程所定名額、現任人數與候補名單，再洽縣府社會處確認補選程序。',
 statutes:[P(29),P(23),G(9),ER(17),P(32)],
 notes:['若想知道某個人數是否足以開會，可以直接問，例如「原定理事9人，剩下7人，開理事會要幾人出席」。']};
}

function verifiedRoundAnswer(q,ctx){
 const t=norm(q);
 return formTemplates(t,ctx&&ctx.catalog)||(/^(協會|社區發展協會|我們協會|本會)?的?(理事|監事|理監事)(和監事|跟監事)?(要)?(怎麼選|怎麼產生|如何產生|誰選)/.test(t)?electionHowTo(t):null)||intlGroupWho(t)||moneyMisuse(t)||supervisorNoMeeting(t)||rosterView(t)||whoManagesMoney(t)||donationDeduct(t)||annualAccountsHowTo(t)||boardMeetingHowTo(t)||memberQuitHowTo(t)||viceChair(t)||motionSecond(t)||assocLoan(t)||yearEndBonus(t)||entertainmentExpense(t)||englishName(t)||minorOfficer(t)||assocInvest(t)||candidateDeposit(t)||chairAndRecorder(t)||facebookGroup(t)||rulingRules(t)||byElection(t)||receiptsBasic(t)||memberRepThreshold(t)||officerResignHow(t)||finalAccountsWho(t)||publicServantOfficer(t)||relativesAsOfficers(t)||mergeGroups(t)||govCommission(t)||conveneAndPetition(t)||assemblyPrepAndSignIn(t)||whatNeedsAssembly(t)||feeAndMemberStatus(t)||directorMustBeMember(t)||auditAndYear(t)||reorganization(t)||staffResignReport(t)||videoElection(t)||subsidyDetails(t)||subsidyBasics(t)||taxWithholding(t)||commercialGuild(t)||memberSuspension(t)||meetingProcedure(t)||solicitationAfter(t)||coopMore(t)||communityMore(t)||outOfScope(t)||whichAuthority(t)||volunteerMore(t)||submitWhere(t)||timeDeposit(t)||nonCompliance(t)||memberEligibilityOutside(t)||annualMeetings(t)||chairTermLimit(t)||assemblyQuorum(t)||urgentMeetingNotice(t)||directorVacancy(t)||recallOfficer(t)||boardResolution(t)||annualFinanceFiling(t)||receiptAndWithdraw(t)||charterContents(t)||dissolveVote(t)||sealMake(t)||memberOnlyFundraising(t)||communityBasics(t)||countyPhone(t)||advisorAppoint(t)||sealKeeper(t)||assocTravel(t)||activityReport(t)||assocFund(t)||officerAsFinanceStaff(t)||electionShowOfHands(t)||directorProxyVote(t)||memberAdmissionWho(t)||memberRosterReport(t)||attendanceFeeAmount(t)||auditByCPA(t)||financeAnnounce(t)||coopBasics(t)||foundingCost(t)||prepMeetingCount(t)||assemblyShortOfQuorum(t)||twoCommunityAssociations(t)||villageChiefAsChair(t)||intlTermStart(t)||charmCommunityContact(t)||groupTypeDifference(t)||directorAbsence(t)||chairElectionMethod(t)||officerNumbers(t)||meetingNoticeChannel(t)||budgetHowTo(t)||renameGroup(t)||certificateLost(t)||dormantGroup(t)||lookupRegistered(t)||coopWithdraw(t)||termLengthLimit(t)||officeAtHome(t)||dissolvedAssets(t)||groupNameDuplicate(t)||standingDirectorCount(t)||memberViewAccounts(t)||howToReportGroup(t)||groupReported(t)||anonymousDonation(t)||chairRelativeStaff(t)||minorJoinAssoc(t)||volunteerTopics(t)||volunteerTeam(t)||memberCourseFee(t)||staffMustBeMember(t)||chairFundraising(t)||boardBelowHalf(t)||assocMayNotMeet(t)||assocNurseryCenter(t)||assocCareStation(t)||assocDonateGoods(t)||assocGovTender(t)||subsidySettlement(t)||corpRegistration(t)||assocBoardPay(t)||financeStaffConcurrent(t)||staffHiring(t)||coopVsAssocAccountingForms(t)||coopBalanceSheetReport(t)||delegateQuotaCalculation(t)||delegateConcurrentRole(t)||onlineVoting(t)||mailVoting(t)||assemblyVotingMethod(t)||boardVotingMethodDetail(t)||delegateElectionProcess(t)||delegateAssemblyRules(t)||coopMemberRemoval(t)||coopAdvertisingTaxability(t)||coopLoanToMemberTax(t)||coopBankLoanProcedure(t)||coopBankLoan(t)||branchAccountingPractice(t)||memberDelegateElection(t)||branchOrgSetup(t)||delegateProposalProcess(t)||annualMeetingVsAssembly(t)||vacancyQuorum(t)||supervisorConvenerNoMeeting(t)||supervisorMinimumMembers(t)||supervisorChairmanElection(t)||supervisorAuditPowers(t)||branchOrgAccounting(t)||runClassesPermit(t)||residentialCarePermit(t)||chairConvicted(t)||chairDismissStaff(t)||chairDissolve(t)||homeAsOfficeTax(t)||nonprofitTaxThreshold(t)||sameAddressGroups(t)||chairStaffConflict(t)||orgDisposeProperty(t)||orgAcquireEquipment(t)||sellGoodsAllowed(t)||staffActingChair(t)||p2MembershipFee(t)||p2BoardNotice(t)||p2RecordRetention(t)||p2CharterAmend(t)||p2SupervisorAudit(t)||p2CoopShares(t)||p2FoundingMeeting(t)||p2ElectionPrep(t)||p2MinutesContent(t)||p2DelegateSystem(t)||chairAbandonsOffice(t)||chairOtherGroupPosition(t)||chairSpendWithoutBoard(t)||supervisorSpend(t)||supervisorActingChair(t)||candidateSeatCount(t)||ballotRetention(t)||officerResignation(t)||invalidBallotReason(t)||delegateQualification(t)||substitutionOrder(t)||byElectionThreshold(t)||coopChairReelection(t)||chairmanReelectionLimit(t)||chairmanAbsence(t)||recordRetentionPeriod(t)||advertisingIncome(t)||staffBankAccountSetup(t)||meetingSigninDuration(t)||meetingVotingMethod(t)||preElectionBoardMeeting(t)||electionEffectiveDate(t)||politicalDonation(t)||communityReportingRequirements(t)||communityYearlyPlanDeadline(t)||communityVsAssociationDifferences(t)||supervisorAsDirector(t)||newChairTodo(t)||postElectionAccountingDeadline(t)||electionReportDeadline(t)||checkSignature(t)||feePeriods(t)||feeDeferral(t)||threeMonthsWording(t)||electionCandidates(t)||electionObjection(t)||minutesDeadline(t)||coopBoardQuorum(t)||coopTax(t)||communityRename(t)||communityReportTownship(t)||addressCertificate(t)||bankChairChange(t)||eventFee(t)||communityChairTerm(t)||invalidBallot(t)||feeAmount(t)||personalAccount(t)||delegateAssembly(t)||noSupervisor(t)||foundingDocs(t)||investStocks(t)||membershipRefused(t)||coopCapital(t)||receiveDonation(t)||hireEmployee(t)||lendToChair(t)||branchOrg(t)||supervisorMeeting(t)||noAnnualMeeting(t)||chairSpendingAuth(t)||communityVsGeneral(t)||coopDissolutionProperty(t)||charterAmendment(t)||coopSupervisorAudit(t)||publicSolicitation(t)||decisionRevoked(t)||chairResign(t)||memberExpulsion(t)||sealChange(t)||noHandover(t)||communityDissolutionProperty(t)||boardFinanceAgenda(t)||boardQuorumGeneral(t)||delegated(t)||chairNoMeeting(t)||feeAnswer(t)||coopAssemblyQuorum(t)||proxyCount(t)||concurrent(t)||financeQuestioned(t)||financeDeadline(t)||meetingFrequency(t)||videoMeeting(t)||coopMinimum(t)||financeForms(t)||formsDownload(t,ctx&&ctx.catalog)||dissolutionHowTo(t)||null||chairChangeTodo(t)||electionHowTo(t)||meetingHowTo(t);
}
const api={normalizeQuestion,withContext,verifiedRoundAnswer};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
Object.assign(root,api);
})(typeof window!=='undefined'?window:globalThis);
