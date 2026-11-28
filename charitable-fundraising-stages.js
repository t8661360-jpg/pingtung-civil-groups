(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const f=n=>law('公益勸募條例','D0050138',n), r=n=>law('公益勸募許可辦法','D0050147',n), s=n=>law('公益勸募條例施行細則','D0050146',n), a=n=>law('社會團體財務處理辦法','D0050097',n);
const moi={title:'內政部：立案社會團體的被動捐贈收入',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256737'};
const online={title:'衛福部：單一縣市、網路媒體與跨縣市勸募申請',source:'https://dep.mohw.gov.tw/DOSAASW/fp-609-58848-103.html'};
const notice={title:'內政部：115年10月30日公益勸募行政公告',source:'https://www.moi.gov.tw/News_Content.aspx?n=9&s=342876'};
const glossary=/公益|募款|勸募|邀捐|請.{0,8}捐|捐贈|主動捐|收捐|捐款人|募物資/;
function route(q){
 const raw=String(q??'').trim(), t=raw.normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>460||!glossary.test(t)||/公司稅|營業稅|所得稅申報|扣繳|勞動契約|採購標案|政治獻金|競選經費|宗教活動經費|寺廟香油錢|合作社|工會|農會|財團法人.{0,5}解散/.test(t))return null;
 const tagged=/；方式確認：/.test(raw);
 const noncorp=/未(?:辦|完成|有)?(?:法院)?(?:社團)?法人登記|還沒辦(?:法院)?法人登記|只(?:有|是)?立案|沒有法人登記/.test(t);
 const eligible=!noncorp&&/公益(?:性)?社團法人|公益.{0,2}法人登記|公立學校|行政法人|財團法人/.test(t);
 const purelyPassive=/主動(?:捐|送|交)|自己(?:要)?送|自願(?:來)?捐|被動收|沒.{0,6}(?:對外邀請|公開募集|發文|貼帳號)|不曾公開/.test(t);
 const openAsk=/公開(?:收捐|募|邀)|社群.{0,20}(?:外人|捐|募)|對外(?:邀|募|收捐)|放.{0,14}帳號|貼帳號|網路.{0,14}募|官網.{0,14}募|直播.{0,14}(?:捐|募)|請外人|網址全台|發文.{0,8}(?:募|邀捐)/.test(t.replace(/沒(?:有)?(?:對外邀請|對外募集|貼帳號)|不曾公開邀請/g,''));
 const membership=/會員群|會員內募|只.{0,6}會員|向會員|限定會員/.test(t);
 const repost=/轉到公開|轉貼|轉傳|轉發|擴散/.test(t);
 const personal=/個人帳|私人帳|理事長的帳|理事長帳戶/.test(t);
 const website=/官網|網站|網路|網頁|社群|直播|媒體|文宣/.test(t);
 const permit=/許可|字號/.test(t);
 const place=/外縣市|跨縣市|衛福部|縣府|屏東|申請.{0,4}(?:機關|向)|管轄/.test(t);
 const end=/期滿|活動.{0,5}(?:已?結束|結案)|已獲許可.{0,12}結束|還沒執行完|滿30天/.test(t);
 const plan=/使用計畫|改用|改(?:用途|作)|指定用途|指定買|剩餘|賸餘|剩下.{0,7}想/.test(t);
 const reports=/公開徵信|公告收支|公告.{0,8}(?:一次|哪)|報備|備查|公告.{0,6}(?:收支|成果)/.test(t);
 const identity=/身分證|身份證|證號|證件照片|身份資料/.test(t);
 const item=/物資|物品|贈物|輪椅|一箱/.test(t);
 const grant=/縣府補助|政府補助|公部門補助/.test(t);
 const hasSituation=purelyPassive&&(openAsk||reports||noncorp||/要先分|算不算募款|許可/.test(t))||membership&&(repost||personal)||website&&place&&(openAsk||permit)||end&&(reports||plan||grant)||identity&&reports||plan&&permit&&/捐|募/.test(t);
 if(!hasSituation&&!tagged)return null;
 const add=[], refs=[];
 const forcePassive=tagged&&/方式確認:對方主動送/.test(t);
 const forcePublic=tagged&&/方式確認:向外公開邀捐/.test(t);
 const forceMembers=tagged&&/方式確認:只對會員募集/.test(t);
 const active=(openAsk&&!forcePassive&&!forceMembers)||forcePublic, passive=(purelyPassive&&!forcePublic)||forcePassive, members=membership||forceMembers;
 if(passive||members){
  const duty=eligible?'若是符合第5條的勸募團體，這種被動捐贈或只向會員募集，不走對外勸募許可；依公益勸募條例第6條開收據、依指定用途，原則上至少每六個月公開徵信，非公立學校的勸募團體於年度終了後五個月內，公立學校於二個月內，向許可其設立、立案或監督的機關報辦理情形及收支決算，重大災害或國際人道救援另按月公告。':noncorp?'若確實是別人自己送來、並沒有公開邀捐，已立案協會可依章程作為其他收入或受贈物資入帳，開正式團體收據並留存根；不因還沒辦法人登記就不能收，也不要套用公益性社團法人五個月的年度報備規則。':'先確認團體有無公益性社團法人資格。已立案協會真正被動受贈，通常可作其他收入、依章程入帳並開收據；若是第5條的勸募團體，依第6條另辦定期公開徵信與年度備查（公益性社團法人於年度終了後五個月內）。';
  add.push(['被動收物資或會員內募，不等於向外界公開邀捐',duty+(item?' 物資記品項、數量、用途及可核實的價值，不虛列現金，也不保證個人可以抵稅。':'')]);refs.push(f(5),f(6),s(6),law('人民團體法','D0050091',33),a(16),a(17),moi);
 }
 if(active||repost){
  const msg=noncorp?'你已說還沒辦法人登記，不能用一般立案協會的名義張貼帳號請不特定外人捐公益財物。':eligible?'已具公益性社團法人資格不等於已有許可；以公開社群、直播或官網邀請不特定人捐款或物資，需依第7條在合法許可範圍內辦理。':'主動向不特定人公開邀請捐款或贈物，先核對是否屬第5條勸募團體（協會須為公益性社團法人），並依第7條取得許可。';
  add.push(['公開邀捐要和被動受贈分開處理',msg+(repost?' 會員自行轉貼不代表每筆都已變成公開勸募；要看團體是否授意、延伸使用貼文邀捐、實際徵求哪些人。不能只看原本群組限會員。留存轉貼、實際付款及原活動資料，先停公開邀捐並請主管機關核對。':'')]);refs.push(f(5),f(7),notice);
 }
 if(website&&place&&(active||permit)){
  const local=/屏東/.test(t);
  const externalSite=/到外縣市|外縣市.{0,8}(?:實體|現場)|兩縣市.{0,8}(?:募|活動)|跨縣市.{0,8}實體/.test(t)&&!/不(?:會|去|辦|到).{0,8}外縣市|沒有外縣市現場|不辦外縣市現場/.test(t);
  add.push(['網站或直播新增方式：先看原許可的地區、方式和日期',
   (externalSite?'如實際跨縣市辦實體勸募，依第7條向中央衛生福利部申請。':'據衛福部說明，只用網站、媒體或文宣而不跨縣市辦現場勸募，原則向會址所在地縣市政府'+(local?'（會址在屏東就是屏東縣政府）':'')+'辦理；網站全台可見不必然改找衛福部。')+' 如果改原許可的活動方式或期程，原則由理（董）事會先同意，事實發生七日前報主管機關許可；活動地區或許可載明的使用目的有變更，要重行申請。舊許可不能自動涵蓋新方法，先核對再做。一般案件須在開始二十一日前申請，緊急救災是放寬申請天數，不是允許先募再補。']);
  refs.push(f(4),f(7),r(2),r(3),online);
 }
 if(personal||repost||active&&permit&&(place||end)){
  add.push(['錢與物分開登帳，由團體依實開收據',
   (personal?'不能讓協會收入留在理事長個人帳戶。先停止讓款項繼續進個人帳，保存原金流與捐贈資料；會計核對合法收入、應返還款及更正紀錄，不能只改備註當作所有人都是會員。 ':'')+'已獲合法許可的款依原案走捐款專戶與專簿，由勸募團體開立收據，填實際許可文號、捐贈人、日期、金額或物品。未經許可、超過許可期間等第22條情形依法返還，難返請主管機關認定；不要把不明款項直接挪用或補貼收據文號。']);
  refs.push(f(13),f(16),f(22),s(8),s(9),a(16),a(17));
 }
 if(end||plan){
  if(end){add.push(['先後有兩個期限：不是等錢用完才公告','期滿的次日起三十日內，先公告募得財物及收支、公開徵信，並報備查。就算使用計畫還沒做完，第一份仍要先報。等使用計畫真的執行完竣，再於三十日內經理（董）事會同意，另公告使用情形，附成果、支出明細與憑證報備查；有正當理由可申請延長，至多三十日。'+(grant?'另外一筆縣府補助另按核定與核銷規則，和捐款分開列帳、不能一起充作同一筆來源或重複報支。':'')]);refs.push(f(18),f(20));}
  if(plan){add.push(['指定用途與剩餘財物：未許可不能改作他用','捐款或物資要照許可的使用計畫與已核對的指定用途，不能先拿來買便當或改成他用。計畫完竣有剩，依第19條三個月內提出原同類目的計畫，主管機關同意後再動支，執行至多三年。若是變更使用計畫，依許可辦法第6條先經適當決議，七日內報主管機關許可，並通知捐贈人或公告，留至少一個月異議期；期限內異議者，應返還其捐贈財物。變更許可載明的使用目的，依第3條須重行申請，不等於單純變更使用計畫。']);refs.push(f(19),f(22),r(3),r(6));}
 }
 if(item&&(end||identity)||identity&&reports){
  add.push(['公開徵信不需要身分證照片：公告和留存分開','公開名單和報主管機關的完整資料不是同一份。按適用法定欄位公告捐贈者資料及收支，不公開證件照片、證號、匯款截圖或其他非必要資料。物品不經現金帳戶也要開收據，依實列品項、數量、時價和用途，留下收據存根、使用與移交紀錄。勸募團體的收據存根決算後至少保存五年，會計帳簿與報表至少十年（未結事項另處理）。']);refs.push(s(5),s(9),s(10),s(14),s(15));
 }
 const needs=!tagged&&!eligible&&!noncorp&&!openAsk&&!repost&&!end&&!identity&&/要先分|算不算募款|不確定|不知道/.test(t);
 if(!add.length)return null;
 const summary=identity?'公開徵信不必放身分證照片或證號。捐贈、收支與公開的資料應分開留存。':end?'先看活動期滿的收支公告，再看使用計畫完竣後的成果；指定捐款、物資與補助款不要混用。':active&&passive?'別人主動送物資，和在社群公開請外人捐是兩件事。先分清，再決定是否要申請勸募許可。':repost?'不能只看原群組是否限會員。先停止在個人帳戶收款，核對團體有沒有公開邀捐、款項該如何處理。':website&&place?'先分是否只是網路宣傳、實際跨縣市，以及有無變更原許可；能上網看不等於跨縣市活動。':'捐贈方式與團體資格不同，應走不同程序；先核對是否主動對外邀捐。';
 return {direct:true,category:'公益勸募｜收受、許可、用途與徵信',title:'捐贈物資與公益勸募：分開確認收受方式、許可和帳務',summary,steps:add,refs:[...new Map(refs.map(x=>[x.title,x])).values()],questionState:{focus:'compound',domain:'charitable-fundraising-stages'},actions:[{label:'聯絡承辦',view:'contact',sub:''}],needsCharityFacts:needs,...(needs?{choiceHeading:'你們實際上是哪一種收受方式？',choices:[
   {label:'對方主動送，沒有對外邀捐',question:raw+'；方式確認：對方主動送。'},
   {label:'我們準備向外公開邀捐',question:raw+'；方式確認：向外公開邀捐。'},
   {label:'只對會員或所屬人員募集',question:raw+'；方式確認：只對會員募集。'}
 ]}:{})};
}
function follow(q){const t=String(q??'');return t.length<145&&/^\s*補充[：:]/.test(t)&&/公益社團法人|捐贈|邀捐|募款|沒貼帳號|物資/.test(t)&&!/另問|換一題|新問題/.test(t);}
if(typeof module!=='undefined'&&module.exports){module.exports={route,follow};return;}
root.verifiedCharitableFundraisingStages=route;
root.isCharitableFundraisingFactReply=follow;
})(typeof window!=='undefined'?window:globalThis);
