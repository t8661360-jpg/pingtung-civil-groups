(function(root){
'use strict';

const cite=(law,pcode,n)=>({title:law+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+pcode+'&flno='+n});
const assoc=n=>cite('人民團體選舉罷免辦法','D0050093',n);
const coop=n=>cite('合作社選舉罷免辦法','D0050022',n);
const credit=n=>cite('信用合作社社員代表理事監事經理人應具備資格條件及選聘辦法','G0380069',n);
const privacy=n=>cite('個人資料保護法','I0050021',n);
const organization=/信用合作社|信合社|(?:一般|普通|消費|生產|勞動|運輸|供給|公用|利用)?合作社|社區發展協會|協會|社會團體|人民團體/g;
const other=/保險合作社|儲蓄互助社|農會|漁會|工會|公會|政黨|村長|里長|總統|學生會|管委會|公司股東/;
const mail=/通訊|郵寄|寄票|寄(?:送|發)?(?:紙本)?選票|寄.{0,4}投票|選票.{0,12}寄|改寄|遠距/;
const election=/選舉|投票|票選|(?:通訊|郵寄)(?:選|投)|選票|開票|寄票|當選|代投|社員代表|選(?:理|監|代表)|選(?:舉)?幹部|公布.{0,4}名冊/;
const proxy=/代理|代投|幫投|委託|親自|到場|本人.{0,7}(?:不能|不得|不會|不便|要|來|到)|(?:人|我).{0,5}(?:回不去|不在場)|不用.{0,4}出席/;
const timing=/幾[天日]|多久|何時|哪[天日]|甚麼時候|什麼時候|期限|開票[前日]|寄(?:出|發|送)/;
const dispute=/異議|申訴|爭議|沒收到|未收到|選票沒來|找誰|向誰|去哪|誰收件/;
const seats=/名額|最多|幾[位個人名]|各幾|各要多少|各多少|上限/;
const result=/當選名單|當選人|當選公告|結果.{0,5}(?:宣布|公告|公布|公開|貼)|(?:公布|公告|公開|宣布).{0,5}(?:結果|當選)|公告.{0,5}名冊/;
const listing=/名冊|通訊錄|全(?:部|體).{0,3}(?:社員|會員).{0,3}名單|住址|地址|電話/;
const expose=/公開|上網|官網|網站|貼|公布|公佈|公告|遮|隱去/;

function type(name){return /信用合作社|信合社/.test(name)?'credit':/合作社/.test(name)?'coop':'assoc';}
function route(q){
 const source=String(q??'').normalize('NFKC').replace(/\s/g,'').replace(/(?<=\d),(?=\d{3}(?!\d))/g,'');
 if(!source||source.length>435||other.test(source)||!election.test(source))return null;
 /* 理解把關 2026-11-28：用寄選票「表決修章、議案」不是理監事通訊選舉 */
 if(/修章|修改章程|章程修改|議案|提案/.test(source)&&/表決|投票|同意/.test(source)&&!/選舉|改選|當選|選理事|選監事|理監事選/.test(source))return null;
 // Exclude negated aliases (e.g. 「不是一般合作社，是信用合作社」).
 const t=source.replace(/(?:不是|並非|非屬)(信用合作社|信合社|一般合作社|普通合作社|合作社|一般協會|協會)/g,'不是這類');
 const names=[...t.matchAll(organization)].map(m=>type(m[0]));
 const unique=[...new Set(names)];
 let scope=unique.length===1?unique[0]:null;
 const sharedHeads=/都有|都是|各有|兩家.{0,8}各|兩邊.{0,8}各|分別/;
 const bothSeats=unique.includes('credit')&&unique.includes('coop')&&sharedHeads.test(t)&&seats.test(t)&&/社員代表/.test(t);
 const assocMail=[],coopMail=[],creditVote=[];
 const clauses={assoc:[],coop:[],credit:[]};
 let nCoop=false,nCredit=false, wantCreditResults=false, assocResults=false, coopResults=false;
 for (const part of t.split(/[,.!?;，。！？；：:\n]+|另外|還有|順便/)) {
   if (!part) continue;
   const mentions=[...part.matchAll(organization)].map(m=>type(m[0]));
   const same=[...new Set(mentions)];
   // A pure list of organizations is not the subject of a subsequent anonymous clause.
   if(same.length===1)scope=same[0];
   else if(same.length>1)scope=null;
   if(same.length>1){ // comparisons can explicitly ask whether the credit co-op follows the other rules
     if(same.includes('credit')&&mail.test(part)&&/能|可|比照|照|一樣|相同/.test(part))creditVote.push(part);
     continue;
   }
   if(scope)clauses[scope].push(part);
   if(scope==='assoc'&&mail.test(part)&&(election.test(part)||timing.test(part)))assocMail.push(part);
   if(scope==='coop'&&mail.test(part)&&(election.test(part)||dispute.test(part)))coopMail.push(part);
   if(scope==='credit'&&(proxy.test(part)||mail.test(part)))creditVote.push(part);
   if(scope==='credit'&&result.test(part))wantCreditResults=true;
   if(scope==='assoc'&&result.test(part))assocResults=true;
   if(scope==='coop'&&result.test(part))coopResults=true;
   if(seats.test(part)&&/社員代表/.test(part)){
      if(scope==='coop')nCoop=true;
      if(scope==='credit')nCredit=true;
   }
 }
 if(mail.test(clauses.assoc.join('；'))&&(election.test(clauses.assoc.join('；'))||timing.test(clauses.assoc.join('；'))))assocMail.push('context');
 if(mail.test(clauses.coop.join('；'))&&(election.test(clauses.coop.join('；'))||dispute.test(clauses.coop.join('；'))))coopMail.push('context');
 if(seats.test(clauses.coop.join('；'))&&/社員代表/.test(clauses.coop.join('；')))nCoop=true;
 if(seats.test(clauses.credit.join('；'))&&/社員代表/.test(clauses.credit.join('；')))nCredit=true;
 // Continuations such as 「沒收到選票向誰申訴」 have implicit subjects, even if the preceding clause has a comma.
 if(unique.length===1){
  if(unique[0]==='assoc'&&mail.test(t))assocMail.push(t);
  if(unique[0]==='coop'&&mail.test(t)&&/社員代表|通訊選.{0,4}代表|通訊.{0,8}投票|選票|開票/.test(t))coopMail.push(t);
  if(unique[0]==='credit'&&(proxy.test(t)||mail.test(t)))creditVote.push(t);
 }
 const roster=listing.test(t)&&expose.test(t)&&(result.test(t)||/名冊|通訊錄|全(?:部|體).{0,3}(?:社員|會員).{0,3}名單/.test(t));
 const known=assocMail.length||coopMail.length||creditVote.length||nCoop||nCredit||bothSeats;
 const wantVote=/通訊|郵寄|寄.{0,4}選票|代投/.test(t);
 const choose=!unique.length&&!known&&wantVote&&/選票|投票|開票|當選|通訊選舉|代投/.test(t)&&(timing.test(t)||proxy.test(t));
 // Do not take over an unrelated roster request, regular general-co-op election, or general election objection.
 if(!known&&!choose&&!(roster&&wantVote&&unique.length))return null;
 const steps=[],refs=[];
 const distinctQuestion=t.split(/[?？]/).some(s=>/(補助|核銷|股金|薪資|報稅|解散|租約|員工|補選|罷免|章程修改|移交清冊)/.test(s)&&!election.test(s));
 if(assocMail.length){
  steps.push(['協會：紙本選票最晚在開票日30日前寄出',
   '章程有訂通訊選理事、監事時，理事會須在開票日45日前開會審定會員（代表）資格，造名冊供會員查閱；開票日30日前按名冊印製並寄送紙本選票。選務辦法還要訂通知、投票、異議與當選公告，經理事會通過並報主管機關備查。'+
   (assocResults?'當選通知及公告按這份辦法做，不等於把全體會員名冊公開。':'')]);refs.push(assoc(23),assoc(5));
 }
 if(coopMail.length){
  steps.push(['一般合作社：通訊選的是社員代表；異議照備查辦法',
   '只有社員代表的選舉或罷免可依第3條例外採非會議方式，須經理事會決議並報主管機關備查。若用通訊或電子投票，章程須有規定，選務辦法須經社員大會或社員代表大會通過、報備查後才能辦；不能把這個例外套給一般合作社的理事或監事選舉。'+
   (dispute.test(clauses.coop.join('；'))||unique.length===1&&dispute.test(t)?'沒收到選票或對結果有異議，請儘快向合作社索取備查的辦法，依其中指定的受理人、方式及期限提出，保留通知或寄送證明。若找不到受理窗口，先向該社或主管機關確認；不直接套用現場選舉或其他團體的期限。':'請向合作社確認備查辦法內的通知、寄票及選舉爭議程序，不要套用協會30日寄票規定。')+
   (coopResults?'通訊選舉結果依這份辦法通知及公告，不等於公布整份社員名冊。':'')]);refs.push(coop(3));
 }
 if(creditVote.length){
  steps.push(['信用合作社（信合社）：選舉人須親自出席，不可委託或郵寄代替',
   '社員代表、理事或監事的選舉，須由有資格的選舉人本人到場核驗身分、領取選票並當場投入票箱。不能請其他社員代投，也不能因自己不能出席，改用一般合作社的通訊或郵寄方式。本人在場但因不識字或身體失能不能圈選時，可請監選人按本人意思代為圈寫，這不是代理出席。']);refs.push(credit(27),credit(28),credit(29));
 }
 if(wantCreditResults||((creditVote.length||nCredit||bothSeats)&&roster&&result.test(t))){
  steps.push(['信合社當選公告與完整名冊不同','社員代表、理事、監事的選舉，應當場宣布並揭示當選人與候補人名單；這不等於必須把全體社員名冊貼上網。']);refs.push(credit(35));
 }
 if(nCoop||nCredit||bothSeats){
  const readCount=v=>{
   const m=v.match(/(?:^|[^\d])(\d{1,7})(?:名|位|個|人)社員/)||v.match(/(?:人數|社員數)(?:都|各)?(?:是|為|有)?(\d{1,7})(?!\d)/);
   return m?Number(m[1]):null;
  };
  const both=bothSeats||nCoop&&nCredit;
  const ga=bothSeats?readCount(t):readCount(clauses.coop.join('；'));
  const gc=bothSeats?readCount(t):readCount(clauses.credit.join('；'));
  const limitCoop=(nCoop||both)?'一般合作社超過200名社員，可依章程採代表制；章程未定時須經主管機關核准。代表名額原則是10%，至少51人、最多199人。':'';
  const limitCredit=(nCredit||both)?'信合社超過200名社員可推選代表。代表人數按10%計算，但至少51人、最多151人。':'';
  const estimate=(n,label,cap)=>{
   if(n===null)return '';
   if(n<=200)return label+'的'+n+'名社員未達超過200人的條件。';
   const v=n/10;
   if(v>=cap)return label+'按10%算為'+v+'人，仍以'+cap+'位為上限。';
   if(v<=51)return label+'按10%算為'+v+'人；若依法採代表制，最低為51位。';
   return label+'按10%算為'+v+'人；實際席次依適用規則及章程核對，不自行猜小數進位。';
  };
  const numbers=bothSeats&&ga!==null&&ga/10>=199
   ?'以題目的'+ga+'名社員來看，10%是'+ga/10+'人，所以一般合作社上限199位，信合社上限151位。'
   :(limitCoop?estimate(ga,'一般合作社',199):'')+(limitCredit?estimate(gc,'信合社',151):'');
  steps.push([both?'社員代表席次：兩種團體上限不同':'社員代表席次怎麼算',limitCoop+limitCredit+numbers]);
  if(limitCoop)refs.push(coop(4));if(limitCredit)refs.push(cite('信用合作社法','G0380058',13));
 }
 if(roster){
  steps.push(['公告結果不等於公開整份名冊','不要只因舉辦選舉，就把載有姓名、電話或聯絡地址（住址）的完整會員、社員名冊貼到公開網站。供有權會員閱覽、依規定公告必要的當選資料、以及向任何人公開整份名冊，是三件事。只遮住住址並不一定匿名，姓名、電話或其他資料仍可能識別個人。沒有適用的利用依據時不要公開；依法公告也只揭露完成目的所必要的資料。']);refs.push(privacy(5),privacy(20));
 }
 if(distinctQuestion)steps.push(['另有非選務問題','上面的回答只涵蓋這次選舉與名冊。您提到的其他事項尚未核對；可另開一題，小屏會按該事項適用的規則回答。']);
 const out={direct:true,category:'選舉與名冊',title:choose?'先選團體，再核對寄票或投票規則':unique.length>1?'選務與名冊公開，按團體分開處理':steps[0]?.[0]||'選務與名冊',
   summary:choose?'寄票與可否到場的規則取決於團體的類型。小屏先不假定您的團體是協會或合作社。':roster?'請按您提到的團體看下列說明；公告選舉結果，不表示可以公開全體名冊。':'以下按您提到的團體及選舉方式說明。',
   steps,refs:[...new Map(refs.map(x=>[x.source,x])).values()],notes:[],actions:[]};
 if(choose){
  out.questionState={focus:"clarify"};
  out.choiceHeading='您問的是哪一類團體？';
  out.choices=['協會','一般合作社','信用合作社'].map(label=>({label,question:label+'：'+source}));
 }
 return out;
}
if(typeof module!=='undefined'&&module.exports){module.exports=route;return;}
root.verifiedElectionOrganization=route;
})(typeof window!=='undefined'?window:globalThis);
