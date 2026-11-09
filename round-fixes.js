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
 const fin=/(財務報表|資產負債表|基金收支表|財產目錄|現金出納表|收支決算表|收支預算表|預算表|決算表|六項|6項)/.test(t);
 if(!fin)return null;
 if(/合作社|工會|公會|補助核銷/.test(t))return null;
 const base={category:'社會團體財務報表',statutes:[],refs:[{title:FIN.title,cat:'官方書表',source:FIN.source,date:'2026-11-09'}],actions:[{label:'下載常年會書表',view:'forms',sub:'常年會'}]};
 if(/資產負債表/.test(t)&&/(不平|不平衡|不相等|不一樣|對不起來|不符|兜不攏|不相同|錯誤|請更正)/.test(t))return{...base,title:'資產負債表不平：左右合計一定要相同',summary:'資產負債表左邊「資產合計」必須等於右邊「負債、基金暨餘絀合計」，範本在兩方不相等時會顯示「兩方合計金額必須相同 請更正」。\n請依序檢查：\n1. 財產目錄的總金額，是否已列入資產負債表的「固定資產」或「其他資產」；範本會比對，不符時顯示「財產金額不正確 請更正」。\n2. 本期餘絀、上期餘絀是否由「決算與現金出納表」正確帶入；決算的收入或支出填錯，餘絀就會錯。\n3. 有提撥基金的，基金是否已由基金收支表帶入。\n4. 有價證券、預付款項、短期借款、雜項負債等科目，如果已經列入決算，就不要再重複填寫。\n5. 現金和銀行存款，要和實際現金、存摺餘額一致。',questionState:{focus:'balance-sheet-unbalanced',domain:'social'},notes:['範本公式：流動資產＋基金＋固定資產＋其他資產＝資產合計；流動負債＋長期負債＋其他負債＋基金＋餘絀＝負債、基金暨餘絀合計。']};
 if(/基金收支表/.test(t)&&/(沒有基金|無基金|沒基金|不用交|要交嗎|也要|免交|需要嗎)/.test(t))return{...base,title:'沒有基金，基金收支表仍要核章後送府',summary:'要。依社會處 6 項財務報表範本的填寫說明：基金應專戶儲存；如無基金，仍請核章後送府。\n有提撥基金的，金額會自動帶入資產負債表；動支基金時，要註明理事會通過的屆次和主管機關核備的文號。基金收支結存應與收支決算表、資產負債表的相關科目金額一致。',questionState:{focus:'fund-form-no-fund',domain:'social'},notes:['本表須經製表、出納、會計、總幹事、團體負責人蓋章。']};
 if(/(預算|預算表)/.test(t)&&/(結餘|餘絀|平衡|歸零|上年度|去年)/.test(t))return{...base,title:'預算表：上年度結餘不可列入今年收入，餘絀要歸零',summary:'依社會處範本的預算編列說明：一、上年度結餘款，不可列入今年的收入；二、預算表應依收支平衡原則編列，本期餘絀需歸零；三、用不到的預算科目可以自行刪除。\n預算與決算的科目名稱相同，修改預算科目名稱時，決算科目會自動跟著修改。',questionState:{focus:'budget-form',domain:'social'},notes:[]};
 if(/財產目錄/.test(t)&&/(折舊|報廢|年限)/.test(t))return{...base,title:'財產目錄範本未設折舊，到期可依規定報廢',summary:'社會處範本的財產目錄沒有設定折舊；財產使用年限到期，可以依規定辦理報廢。\n財產目錄依財產登記簿按固定資產科目編造，總金額要列入資產負債表的「固定資產」或「其他資產」。本表須經製表、保管、會計、總幹事及團體負責人蓋章。',questionState:{focus:'asset-form-depreciation',domain:'social'},notes:['報廢的具體程序請洽承辦人確認。']};
 if(/(六項|6項|哪幾項|哪六|有哪些|是什麼)/.test(t)&&/(財務報表|報表)/.test(t))return{...base,title:'6 項財務報表是哪 6 項',summary:'社會處「6項財務報表」範本（一般協會用）包含：收支預算表、收支決算表、現金出納表、財產目錄、資產負債表、基金收支表。\n範本中「收支決算表」和「現金出納表」放在同一個工作表（決算與現金出納表），所以 Excel 只有 5 個表格工作表，另有 1 張填寫說明。團體名稱只要在「預算」工作表輸入，其他工作表會自動帶入。',questionState:{focus:'six-reports-list',domain:'social'},notes:['解散時送的是不含預算表的 5 項財務報表。','合作社、社區發展協會是否使用相同表式，本站尚未確認，請洽承辦人。']};
 return null;
}
function dissolutionHowTo(t){
 if(!/解散/.test(t)||/合作社|多少人|同意|表決|門檻|幾成|比例|罷免/.test(t))return null;
 if(!/(辦|怎麼|如何|流程|準備|開會|要做|處理|手續|步驟)/.test(t)&&t.length>8)return null;
 return'KB:解散';
}
function delegated(t){
 const g=typeof root!=='undefined'?root:{};
 if(/社區/.test(t)&&/(年度計畫|工作計畫|計畫)/.test(t)&&/(什麼時候|何時|幾月|要送|多久|截止)/.test(t)&&!/成立|籌組/.test(t)&&typeof g.communityAnnualPlanAnswer==='function')return g.communityAnnualPlanAnswer((/社區發展協會/.test(t)?t:t.replace(/社區協會|社區/,'社區發展協會'))+(/年度計畫|工作計畫/.test(t)?'':'年度計畫')+'期限');
 if(/合作社/.test(t)&&/(盈餘|結餘)/.test(t)&&/(怎麼分|如何分|怎樣分|分多少|要分)/.test(t)&&typeof g.coopSurplusDistributionAnswer==='function')return g.coopSurplusDistributionAnswer(t.replace(/怎麼分|如何分|怎樣分|分多少|要分/,'怎麼分配'));
 return null;
}
function verifiedRoundAnswer(q,ctx){
 const t=norm(q);
 return delegated(t)||meetingFrequency(t)||videoMeeting(t)||coopMinimum(t)||financeForms(t)||formsDownload(t,ctx&&ctx.catalog)||dissolutionHowTo(t)||null;
}
const api={normalizeQuestion,withContext,verifiedRoundAnswer};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
Object.assign(root,api);
})(typeof window!=='undefined'?window:globalThis);
