(function(root){
'use strict';
const link=(title,code,n)=>({title,source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const p=n=>link('人民團體法第'+n+'條','D0050091',n);
const m=n=>link('人民團體會務輔導辦法第'+n+'條','D0020094',n);
const e=n=>link('人民團體選舉罷免辦法第'+n+'條','D0050093',n);
const moiCharter={title:'內政部：人民團體及法人登記後的章程變更',source:'https://www.moi.gov.tw/News_toggle3.aspx?PageSize=200&_CSN=1633&n=8361&page=1&sms=9015'};
const norm=s=>String(s??'').normalize('NFKC').replace(/\s/g,'');
const association=/協會|社會團體|人民團體/, other=/合作社|信合社|公會|工會|農會|漁會|公司|管委會|財團法人/;
const correction=/(?:不是|並非)會員(?:[（(]?代表[）)]?)?大會.{0,18}(?:理事會|理監事會)|(?:只談|只問|說的是)理事會.{0,18}(?:不是|而非)會員大會/;
const same=/同(?:一)?日|當日|當天|同一天|馬上|接著/;
const afterElection=['改選後的新理事會要另看通知與召集','確認理監事已依法選出。原則在大會閉會後第7日至第15日，由有權召集人分別開理事會、監事會；逾期或需展延依選罷辦法第12條處理。要在大會當天開，須在召開大會時一併通知。若法令或章程允許未出席者當選，要同日開還需要當選的全體理事、監事同意；全體同意也不能取代一併通知。'];
const votes=['修章、除名與選舉分開辦','先確認會員大會依法成會。未辦法人登記的一般協會，修章和除名各須出席者三分之二以上同意、分開表決；除名另須符合人民團體法第14條及章程。已辦法人登記的章程變更，依內政部說明與民法第53條，在全體社員過半數出席時，須出席者四分之三以上同意，或有全體社員三分之二以上書面同意；受設立許可者變更章程還要取得主管機關許可。不要把法人修章門檻拿來算除名或改選。理監事選舉另依適用的選罷辦法與章程，不用修章、除名的同意門檻當當選門檻。'];
const agenda=['議程沒列，先查會議規範再處理','先核對開會通知、章程及適用會議規範。內政部說明，人民團體法沒明定能否用臨時動議提出除名；不代表任何臨時提案都合法。建議把修章及除名明列議程並事前通知，讓會員有機會說明；改選另按通知與選務規定處理，不以臨時表決取代。'];
const moiRemoval={title:'內政部：大會以臨時動議提出除名之疑義',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256687'};
const records=['每一案的結果都分開記','把出席、程序異議、各案同意票與決議、選舉結果和沒表決完的項目分開列。在閉會後30日內將大會紀錄報主管機關備查，並另核對章程變更應送資料與期限。'];
function result(title,summary,steps,refs){return {direct:true,category:'協會會務｜會員大會與理事會',title,summary,steps,refs,questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]};}
function route(q,prior=''){
 const s=norm(q);
 if(!s||s.length>390||other.test(s))return null;
 if(correction.test(s)&&/席|委託|表決|開會|出席/.test(s)&&(association.test(s)||association.test(prior)||/理事會/.test(s))){
   const seats=+(s.match(/(?:理事會.{0,14}|理事共|應到|總共)(\d{1,3})(?:席|人|位)/)?.[1]||0);
   const present=+(s.match(/(\d{1,3})(?:人|位)?(?:親自|本人|實到|在場)|(?:親自|本人(?:到場)?|實到|在場)(\d{1,3})(?:個|人|位)?/)?.slice(1).find(Boolean)||0);
   const summary=seats&&present&&present<=seats?'理事會'+seats+'席至少要'+(Math.floor(seats/2)+1)+'位理事親自出席；'+present+'位本人'+(present>seats/2?'的人數已過半，仍要核對召集與資格。':'不夠，不能把委託算進去或繼續表決。'):'只看理事會，不沿用會員大會簽到人數。理事須親自出席，出席要超過理事總數的一半，不能用委託票補足。';
   return result('只核理事會人數，不用會員大會名冊',summary,[['本人出席才算','依人民團體法第29、31條，理事不得委託。未過半數，不能以這場作成表決或進行理事會選舉；已成會也要依議案與章程計算同意票。']], [p(29),p(31)]);
 }
 if(!/大會/.test(s))return null;
 const isNewBoard=/首(?:次|屆)|第[一1]次|新(?:任|屆)?理事會|理(?:監)?事會.{0,28}(?:一併通知|通知沒寫|互選理事長)|(?:同日|當天)開理事會|同日理事會/.test(s)&&/理事會|理監事會/.test(s);
 const recount=/清查|清點|離席|離場/.test(s)&&/應到|應出席|簽到|在場|散會|\d{1,4}人/.test(s);
 if(recount&&isNewBoard&&same.test(s)&&(association.test(s)||/會員大會/.test(s))){
   const total=+(s.match(/(?:應到|應出席)(?:人數)?(?:有|是|為)?(\d{1,4})|(\d{1,4})(?:人)?(?:應到|應出席)|(?:有|共)(\d{1,4})名有權會員/)?.slice(1).find(Boolean)||0);
   const sign=+(s.match(/(?:簽到|報到)(?:是|有|共)?(\d{1,4})|(\d{1,4})(?:人)?(?:簽到|報到)/)?.slice(1).find(Boolean)||0);
   const now=+(s.match(/(?:清查|清點)(?:後|結果)?(?:剩下|剩|只剩|為|有)?(\d{1,4})|(\d{1,4})(?:人)?在場/)?.slice(1).find(Boolean)||0);
   const left=+(s.match(/(\d{1,4})(?:人|位|個)(?:本人|自己)?(?:中途|先)?(?:離席|離場|走了|先走)/)?.[1]||0);
   const min=total&&Math.floor(total/2)+1;
   const cleared=/已(?:依法)?(?:清查|清點)|已依法通過清查|清查動議(?:已)?通過|清點結果/.test(s)&&!/沒通過|未通過|尚未|還沒/.test(s);
   const numeric=min&&now&&now<=total?'依'+total+'位應出席者計算，大會最少要'+min+'位；'+(cleared?'依法清查':'若依法清查')+'只剩'+now+'位，'+(now<min?'主席應立即宣布散會。':'人數仍達門檻，但其他程序和表決門檻要另算。'):min&&sign&&sign<=total&&left&&left<sign?'若原簽到'+sign+'位均有效，原先達到大會最低'+min+'位的成會人數；若無人補進且離席'+left+'位各自只算本人，最多剩'+(sign-left)+'位；如另影響代理出席，可能更少。這只是估算，不是正式清查。':'先分已依法清查或只是現場估算，不要拿原簽到表掩蓋已依法確認的不足。';
   const boardNoticeMissing=/通知沒(?:寫|列)|未(?:一併)?通知.{0,14}(?:第一場|理事會)|沒有一併通知/.test(s);
   const status=/清(?:查|點)(?:動議)?(?:沒|未|不)通過/.test(s)?' 既然清查動議未通過，不能拿現場的估算替代簽到或當成正式結果。':'';
   const boardAnswer=boardNoticeMissing?['沒一併通知，就不能在大會當天開新理事會',afterElection[1]]:afterElection;
   const proxy=['書面委託和本人分開記','社會團體大會，不能親自出席者得書面委託其他合格會員或代表，每位代理人只能代理一位。檢查書面、資格及有無重複，簽到表分列本人與被代理者；原簽到數已含有效代理，不再重加。代理人中途離席時，應就依法清查時的實際狀況分別核對，不能假定全部委託都有效。'];
   const process=['先核人數，只有依法清查結果才是這一刻的依據','依人民團體會務輔導辦法第16條，大會出席通常按簽到或報到；出席人提出清查動議，主席交現場表決，經表決人數較多數同意後才清查；進入選舉時另依選罷辦法第20條。依法清查不足即散會，不得再修章、除名或選舉。若先前已依法完成決算或其他決議，不因後來離席就自動失效；依每案當時的程序及紀錄確認。'];
   return result('先清查大會，再看能否表決或同日開新理事會',numeric+status+(boardNoticeMissing?' 沒一併通知，不能當天開新理事會。':' 大會和新理事會不是同一場。'),[proxy,process,votes,...(/沒排除名|臨時除名|臨時動議|議程沒列/.test(s)?[agenda]:[]),boardAnswer,records],[m(16),e(20),p(42),p(27),p(14),link('民法第53條','B0000001',53),moiCharter,moiRemoval,e(12),m(12)]);
 }
 if(association.test(s)&&/修章|改章程|修改章程|章程.{0,6}(?:要改|想改)/.test(s)&&/除名|開除會員/.test(s)&&/改選|重選|選理監事|選舉/.test(s)){
   return result('同場修章、除名、改選：不能用一張票算三案','可以把適法議題排在同場，但要分開通知、處理、表決和記錄；不能把修章、除名和改選用同一個同意門檻。',[votes,agenda,records],[p(14),p(26),p(27),link('民法第53條','B0000001',53),moiCharter,e(4),e(15),m(12),moiRemoval]);
 }
 return null;
}
if(typeof module==='object'&&module.exports)module.exports={route};
else root.verifiedAssociationMeetingSequence=route;
})(typeof window==='object'?window:globalThis);
