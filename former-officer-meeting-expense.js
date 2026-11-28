(function(root){
'use strict';
const source=(title,p)=>({title,source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+p});
const social=source('社會團體財務處理辦法第5、7、11、19、20、21條','D0050097');
const business=source('工商團體財務處理辦法第8、11、12、28、29、30條','D0050106');
const people=source('人民團體法第21、23、41條','D0050091');
const county={title:'屏東縣政府對民間團體補助經費作業要點第5、8、10點（官方公告附件）',source:'https://portal.ptc.edu.tw/bulletin/view.php?sn=B114003910'};
function route(q){
 const raw=String(q??'').trim(),t=raw.normalize('NFKC').replace(/\s+/g,'');
 if(!t||t.length>480)return null;
 const z=t.replace(/(?:不是|並非|非屬)(?:一般|原來的)?(?:商業(?:同業)?公會|工業(?:同業)?公會|公會|社區發展協會|協會|社會團體|合作社)/g,'');
 if(/合作社|信用社|農會|漁會|工會|基金會|管委會|職業公會|職業團體/.test(z))return null;
 const type=t.match(/任內費用團體確認:(一般協會|商業同業公會|工業同業公會|另有團體)/)?.[1];
 const com=type==='商業同業公會'||!type&&/商業(?:同業)?公會/.test(z),ind=type==='工業同業公會'||!type&&/工業(?:同業)?公會/.test(z);
 const assoc=type==='一般協會'||!type&&/協會|社會團體/.test(z)&&!/公會/.test(z);
 const name=com?'商業同業公會':ind?'工業同業公會':/社區發展協會/.test(z)?'社區發展協會':'一般協會';
 if(!/理事|監事|理監事/.test(z)||!/車馬費|交通費|出席費|車票|交通票|交通補貼/.test(z)||
    !/卸任|離任|退任|前任|上屆|任內|屆滿|已辭|辭職|前(?:理事|監事)|改選後|退會|除名|出會|解任/.test(z)||
    !/補(?:請|發|付|辦|報)|未(?:付|匯|收到)|沒(?:匯|領|付)|才發現|核銷|追認|還能領|還可以領|還能請|之前.{0,7}給/.test(z))return null;
 if(/(?:不是|不問|不再問|沒有要)(?:要|問)?(?:補發|補請|報支|請領)?(?:出席費|交通費|車馬費)/.test(z))return null;
 const count=Number(com)+Number(ind)+Number(assoc);
 if(count!==1){
  if(count>1||!(/退會|除名|出會|解任|卸任|離任|退任/.test(z)&&/理事|監事/.test(z)))return null;
  const opts=type!=='另有團體'&&raw.length<305;
  return {direct:true,category:'理監事｜退會、卸任與任內費用',title:'卸任後能不能領原來的出席費？先確認團體類型',
   summary:'卸任與任內的出席費、交通費是兩件事。先查這筆費用當時適不適用、是否已核准且尚未支付；不能只憑退會或一張車票就判斷。',
   steps:[['看立案證書和當時的紀錄','協會與工商同業公會可發費用、適用的會議不同。請先看立案證書上的團體種類，以及原會議日期、出席紀錄和是否已報帳。其他團體要查自己的規定。']],
   refs:[social,business],actions:[{label:'聯絡承辦',view:'contact',sub:''}],questionState:{focus:opts?'clarify':'compound'},
   ...(opts?{choiceHeading:'這是哪一類團體？',choices:['一般協會','商業同業公會','工業同業公會','其他或不確定'].map((label,i)=>({label,question:raw+'；任內費用團體確認：'+(i===3?'另有團體':label)+'。'}))}:{})};
 }
 const leftByMembership=/退會|除名|出會/.test(z);
 const meeting=z.replace(/(?:不是|並非|沒(?:有)?開)(?:會員(?:代表)?大會|理監事(?:聯席)?會(?:議)?|理事會|監事會)/g,'');
 const board=/理事會|監事會|理監事會/.test(meeting), assembly=/會員(?:代表)?大會/.test(meeting);
 const approve=t.match(/任內費用確認:(已核未付|當時未核|不確定)/)?.[1];
 const notApproved=approve==='當時未核'||!approve&&/(?:以前|當時|原來|原本|任內|去年)?.{0,4}(?:沒(?:有)?|未|尚未)(?:定出席費|通過|核准|核定|核銷同意|編這筆|編列|編預算|決議)|事後才(?:訂|核准)/.test(z);
 const approved=approve==='已核未付'||!approve&&!notApproved&&/當時.{0,10}(?:補貼決議|已核准|已核定|同意支付|決議發給)|已(?:有|經).{0,6}(?:合法核准|正式核准)|任內已核准/.test(z);
 const dup=/同一趟|同一張.{0,5}(?:票|憑證)|重複|領過|報過/.test(z);
 const closed=/決算已報|已報決算|已經結帳|去年|前年度|跨年|今年才/.test(z);
 const grant=/補助|核銷/.test(z);
 const another=/(?:臺北|台北|新北|桃園|臺中|台中|臺南|台南|高雄|基隆|新竹|嘉義|彰化|苗栗|南投|宜蘭|花蓮|臺東|台東|雲林|澎湖|金門|連江)(?:市|縣)?(?:政府|縣府|市府|的(?:市|縣)?補助)/.test(t)&&!/屏東/.test(t);
 const rules=assoc?'協會理事、監事是無給職；依社會團體財務處理辦法第19條，因執行職務需要才可參照政府標準酌發出席費，或按交通工具憑票證酌發交通費，不是固定津貼。':
 '工商團體會議的出席者原則不得支領費用。依工商團體財務處理辦法第28條，例外是理事或監事出席理事會、監事會執行職務，可依團體財務狀況、參照政府標準酌發出席費，或憑票證酌發交通費。'+(assembly&&!board?'您這場是會員大會，不是這項例外。':!board?'請先核對當時是哪一種會議；會員大會不在這個例外。':'');
 const timing=assoc&&leftByMembership?'依人民團體法第23條，喪失會員（代表）資格時原則應即解任；社會團體如有依法核准的特別章程，亦需核對。退會後出席的新會議不能視同仍任職；退會前費用是否補發，該條與財務辦法第19條沒有直接規定。':'';
 const asOf=notApproved?'若當時沒有適用規定、合法核准或預算依據，不要用本屆新訂標準追溯作為去年的請款依據；車票可證明交通支出，不能代替授權。請財務人員查當時文件及程序再判斷。':
 approved?'若當時依法與內規核准、確有未付支出，後來卸任不會讓它自動消失。先查當時身分、出席／執行職務紀錄、核准標準、預算及已付款紀錄，再按原依據審核，不套用今年新標準。':
 '先查任內出席／執行職務、原核准規則、當年度預算及有沒有付過。卸任不自動取消原本合法核准的支出，但有車票、或預算有列，也不等於已成立一筆可請領的款項。';
 const archive=(closed?'跨年或決算已報，先交財務人員核對原年度帳及是否已有待付款／漏列，依實況和適用程序處理或更正，不倒填，也不自行改列今年的費用。':'財務人員應用會議及出席紀錄、支出憑證與支付紀錄核對並入帳。')+(dup?'同一趟若已領同一筆交通費，不再以別的經費來源重複報支。':'仍需核對同一費用是否已從其他活動或經費報過。');
 const funded=another?'這是外縣市方案，不套用屏東通案。查申請公告和核定函的對象、項目、期間、憑證及是否准許變更；沒有書面依據，不改用專案款。':
 '若適用屏東縣通案要點，第5點把會員大會、理監事會議和例行會議列為不予補助，工作津貼也不列支；專案如有不同規定，須先看公告、核定函及原機關書面確認。能用團體自己的經費，不等於能用補助；核銷也不能代替團體入帳。';
 const opts=!approve&&!approved&&!notApproved&&raw.length<315&&!(assembly&&!board&&!assoc);
 return {direct:true,category:name+'｜卸任前的出席費與交通費',title:name+'：卸任後補請任內出席費或交通費，先查原依據',summary:'卸任本身不是准駁理由。先確認當時費用是否依法核准、仍未支付且沒有重複報支，再分開檢查原年度帳與補助限制。',steps:[['先確認當時職務和會議種類',rules+timing],['原來已核准，還是現在才要補訂？',asOf],['核對同一趟、帳冊與憑證',archive],...(grant?[['補助可以用嗎？先看核定項目',funded]]:[])],refs:[assoc?social:business,...(assoc&&leftByMembership?[people]:[]),...(grant&&!another?[county]:[])],actions:[{label:'聯絡承辦',view:'contact',sub:''}],questionState:{focus:opts?'clarify':'compound'},...(opts?{choiceHeading:'這筆費用當時有核准嗎？',choices:[['當時已核准，還沒付','已核未付'],['當時沒有核准','當時未核'],['不清楚有沒有核准','不確定']].map(([label,key])=>({label,question:raw+'；任內費用確認：'+key+'。'}))}:{})};
}
if(typeof module==='object'&&module.exports)module.exports=route;
else root.verifiedFormerOfficerMeetingExpense=route;
})(typeof window==='object'?window:globalThis);
