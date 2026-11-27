(function(root){
'use strict';
const elect='https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050093';
const group='https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050091';
const refs=[
 {title:'人民團體選舉罷免辦法第12、21、28條',source:elect},
 {title:'人民團體法第32、54、58條',source:group},
 {title:'內政部：已按期改選團體的原、新屆任期銜接',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256713'},
 {title:'屏東縣政府對民間團體補助經費作業要點第3、5點',source:'https://ptc.familyedu.moe.gov.tw/fileRename.aspx?fid=40994&kid=2&site_id=19&uid=3454'}
];
const addressFAQ={title:'內政部 Q2475：任期屆滿及變更會址的程序示例',source:'https://www.moi.gov.tw/News_toggle3.aspx?PageSize=30&n=174&page=83&sms=9015'};
const expulsionRefs=[
 {title:'人民團體法第14、27條：除名事由與決議門檻',source:group},
 {title:'人民團體會務輔導辦法第10條：大會通知與議程',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0020094&flno=10'},
 {title:'內政部台內社字第1010320591號：正式提案或臨時動議',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256687&sms=12360'}
];
const expulsion=['臨時會員大會和臨時動議不同','依法通知召開的臨時會員大會，並非一律不能審議除名。依人民團體法第14條，須有違反法令、章程或不遵守大會決議而致危害團體情節重大的事由；依第27條，會員或代表過半數出席、出席者至少三分之二同意，不是由理事會決定。若通知未列、在現場才提，內政部函釋指出法律對正式提案或臨時動議沒有明文；仍須核對現行會務輔導辦法第10條的議程與通知、章程和召集程序，不等於現場可直接表決一定有效，也非一概無效。較穩妥是先正式通知，把擬除名及理由列入議程並給當事人說明機會。'];
const address=['若同時要換會址，先依程序完成代表權和會址決議','內政部 Q2475 的例子是在依法辦理改選的同時，將會址變更列為理事會議案，備妥會議紀錄、會址使用同意等文件。屏東縣級團體依屏東縣主管機關的送件規定核對。三年租約的簽署人以及授權要另行確認，不能把會址文件當成舊理事長仍能代表簽約的證明。'];
const timing=['改選期限與延長不是一回事','一般人民團體的理、監事依法應在任期屆滿前一個月內改選。確有困難須報主管機關核准延長，最長三個月；沒有核准不能自行延期，過了一年仍未改選也不能靠這個規定補稱原任自動續任。'];
const regular=['已依法按期改選，但新屆第一次理事會尚未開','選後通常應自大會閉會第7日至第15日分別開第一次理事會、監事會；必要時依法核准延長，當天舉行須符合法定通知等條件。一般新屆理、監事任期自本屆第一次理事會之日起計。內政部個案函釋以已按期辦妥改選為前提，原屆至新屆第一次理事會召開之日交接；不能把這個過渡套用到已逾期未改選一年。'];
const signing=['誰能簽約與契約效力要分開核對','看章程、改選或延期證明、現任代表權、適當的會議決議及書面授權。已辦法人登記的團體另核對法院登記資料。舊當選證明、印章在手或換人資料尚未核備，都不能單獨證明有權簽約。若代表權未確認，不要先用舊名義簽新長期租約或處分財產；已簽的契約不因逾期改選一律有效或無效，依法律、事實與個案文件判斷；應保留契約與簽署當時的授權、決議和代表資料，必要時由專業人員逐案檢視。'];
const urgent=['已在依法交接期，有急件怎麼做','若已按期改選，可由仍有權的原屆在權限內辦理必要例行事務。先核對章程和決議；如是新的重大承諾或簽署權仍有疑義，優先確認可依法簽署的人、請求展延或等新屆依法就任。前任職權並不由備查函寄達日期單獨決定。'];
const oversight=['縣府可能如何處理','先備妥屆期、是否核准延長、已有選務及會議資料。若大會或理事會無法依法召開，可向主管機關確認《人民團體法》第32條指定理事召集的程序。另依第58條，違法、違章程或妨害公益時，主管機關得警告、撤銷決議、停止部分或全部業務並限期改善；未改善或情節重大才可能有撤免或限期整理等進一步處分，不是逾期即自動罰款或解散。'];
const grant=['屏東一般補助須另外評估','對適用屏東縣民間團體一般補助要點的案件，第5點把任期屆滿未改選列為不予補助情形。專案若另有規定，依實際方案核對。這是補助資格，不是契約效力的判斷。'];
function singleTerm(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>240||/商業同業公會|工業會|工業同業公會|合作社|信合社|農會|漁會|工會|基金會|管委會|國際性/.test(t))return null;
 if(!/理事長|理監事|理事會|現任代表|協會|人民團體|社會團體/.test(t)||!/簽約|租約|契約|代表權|代表.{0,5}簽|用印|續簽|公文|急件|蓋章|縣府會怎樣|主管機關會怎樣|縣府怎麼處理/.test(t))return null;
 const pending=/沒改選|未改選|沒有改選|還沒選|尚未改選|延後改選|延期改選/.test(t);
 const overdue=/(?:任期|屆期).{0,10}(?:屆滿|已滿|過期|過了|到期|結束)|任期.{0,12}到|(?:屆滿|過期|逾期).{0,10}(?:改選|近一年)|已逾.{0,4}個月/.test(t)&&pending;
 const transition=/已(?:依法)?(?:按期|如期|準時).{0,5}(?:改選|選出)|(?:按期|如期|準時).{0,6}(?:改選|選出)|依期限辦完改選/.test(t)&&/(?:還沒|尚未|未開|未召開|等待|還未).{0,8}(?:理事會|第一次|就任)|(?:第[一1]次|首場).{0,10}(?:還沒|尚未|沒開|未開)/.test(t);
 const unclear=!overdue&&!transition&&/(?:不確定|搞不清|不知道).{0,18}(?:按期|如期|屆期|有沒有改選|是否改選)|(?:改選|期限).{0,8}(?:不確定|不知道)/.test(t);
 if(unclear) return {direct:true,category:'人民團體｜任期及代表權',title:'先確認是否按期完成改選',summary:'是否依限改選、是否獲准延期、新屆第一次理事會日期會影響判斷。不用提供人名或契約；未確認現任代表權前，不要先簽新長約。',steps:[timing],refs:refs.slice(0,2),questionState:{focus:'compound'},choiceHeading:'您是哪一種情況？',choices:[
  {label:'已逾期，還沒改選',question:'協會任期屆滿，沒改選也沒核准延期，原理事長可簽租約嗎？'},
  {label:'按期改選，第一次理事會還沒開',question:'協會已依法按期改選，但第一次理事會還沒開，理事長可簽必要公文嗎？'}
 ]};
 if(!overdue&&!transition)return null;
 const known=/協會|社會團體|人民團體|老人會/.test(t);
 const summary=transition?'已依法按期改選但還沒開新屆第一次理事會，和屆滿長期未改選不同。必要例行急件先查原屆現有代表權及章程授權；新長約不要未核對就簽。':(known?'任期屆滿未改選，不能僅憑舊理事長名義就先簽新長約。':'如果您問的是一般協會，任期屆滿未改選不能僅憑舊理事長名義就先簽新長約。')+'先查期限、核准及代表權，再安排改選或由適當的權責人員處理；縣府會依實際情形及法定程序處理。';
 const changeAddress=/會址|會址使用|換地址|搬會館/.test(t);
 return {direct:true,category:'人民團體｜任期、改選及代表權',title:transition?'依法按期改選後、第一次理事會前的代表權':'逾期未改選，先確認理事長代表權再簽約',summary,steps:[...(transition?[regular,urgent,signing]:[timing,signing,oversight,grant,regular]),...(changeAddress?[address]:[])],refs:changeAddress?[...refs,addressFAQ]:refs,questionState:{focus:'compound'}};
}
function overdueTerm(q){
 const base=singleTerm(q);
 if(!base||base.choices)return base;
 if(/除名|開除會員/.test(q)&&/臨時(?:會員|代表)?大會|臨時動議|臨時提案|現場.{0,7}(?:加案|提案|表決)/.test(q)){
  return {...base,title:'理事長任期與大會除名分開判斷',summary:base.summary+' 除名由會員（代表）大會依法決議；要區分臨時大會和在現場臨時加案。',steps:[...base.steps,expulsion],refs:[...base.refs,...expulsionRefs]};
 }
 return base;
}
if(typeof module!=='undefined'&&module.exports){module.exports={overdueTerm};return;}
root.verifiedAssociationOverdueTerm=overdueTerm;
})(typeof window!=='undefined'?window:globalThis);
