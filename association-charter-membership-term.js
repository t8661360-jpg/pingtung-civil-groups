(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const p=n=>law('人民團體法','D0050091',n);
const free={title:'司法院釋字第479號：不參與團體是結社自由的一環',source:'https://cons.judicial.gov.tw/docdata.aspx?fid=100&id=310660'};
const noPay={title:'內政部：章程上的退會要件和除名的法律程序不同',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256721'};
const mofaq={title:'內政部：修改理事、監事任期適用第幾屆',source:'https://www.moi.gov.tw/News_toggle3.aspx?PageSize=200&_CSN=1633&n=8361&page=1&sms=9015'};
const validity={title:'內政部：章程修正的決議門檻與效力',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256745'};
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>195||!/協會|社會團體/.test(t)||/合作社|信合社|公會|工會|農會|漁會|公司|基金會|職業團體|公務員|解散|清算/.test(t))return null;
 if(/退會|退出.{0,4}(?:協會|團體)/.test(t)&&/除名|開除會員|把.{0,5}除掉/.test(t)&&/章程/.test(t)&&/不准|不許|不得|不給|禁止|不讓|拒絕|須經|要經|要理事會/.test(t)&&!/基金|退費|股金|費用|追討|會費|理事辭職/.test(t)){
  const withdrawal=['自願退會：會員表達退出意願，不是理事會處分','結社自由包含不參與。依人民團體法第12條及內政部函釋，章程可定出會手續，但不得逾越法令，不宜以章程永久阻止會員退出。先依章程以書面表達退會，保留送達或收文證明；若協會拒收或要求一直不得退，帶章程與送達紀錄向原主管機關核對，不預判個案生效日。'];
  const removal=['除名：不能由理事會自行決定','依第14、27條，須有違反法令、章程或大會決議而致危害團體情節重大等要件。會員（會員代表）大會須過半數出席，出席人數三分之二以上同意；理事會可整理事證、提案，不能用拒絕受理退會或章程文字取代法定程序。'];
  const corporation=['已登記為社團法人：退會另核對民法第54條','社團法人的社員原則可隨時退社；章程可限定事務年度終或經過預告期，但預告期間不得超過6個月。這不是對所有僅立案協會一律套6個月，也不是允許永久禁止退出。'];
  return {direct:true,category:'協會｜自願退會與除名',title:'自願退會與組織除名，不是同一件事',
   summary:'理事會不能自行除名，也不能以章程永久強留會員。自願退會依法及章程辦手續；除名要查重大事由並經會員（代表）大會決議。',
   steps:t.search(/退會|退出/)<t.search(/除名|開除/)?[withdrawal,removal,corporation]:[removal,withdrawal,corporation],
   refs:[free,noPay,p(12),p(14),p(27),law('民法','B0000001',54)],questionState:{focus:'compound'}};
 }
 if(!/任期/.test(t)||!/理事長|理監事|理事.{0,4}監事/.test(t)||!/改(?:成|為|變)|修改|修正|修章|變更/.test(t)||!/已.{0,6}(?:通過|決議|過大會)|大會.{0,6}(?:通過|決議)|過大會/.test(t)||!/沒報|沒送|忘(?:了|記).{0,4}(?:報|送)|未(?:報|核備|送)|還沒核備|逾期|補報/.test(t)||/除名|格式|喪失|罷免|出缺|法人為|法院/.test(t))return null;
 const next=/非改選年|不是改選年|這次沒有改選|沒有辦改選|本屆中途|任期中途/.test(t);
 const current=!next&&/改選年|這次同時改選|當次改選|修章後才改選|同次大會有改選/.test(t);
 const owing=['先補報章程異動，不等於只報一般大會紀錄','人民團體法第54條要求章程異動於30日內報主管機關核備。已漏報請儘速備妥大會決議紀錄、修正前後條文、適用屆次及改選紀錄（如有），向受理機關確認逾期補報。依法定門檻通過，與履行核備義務是兩件事；沒有報送不等於當然無效，也不等於已核備或可直接延長任期。'];
 const when=['改選年和非改選年不同','內政部的一般說明：若於改選年由會員大會通過變更理事、監事任期，原則適用同次改選產生的新一屆；非改選年原則自次屆適用。若問理事長，還要核對修改的是任期長度或連任次數、章程、決議明定的適用屆次和改選紀錄，不能把任期長度和連任混作一件；理監事任期依第20條不得超過4年。'];
 const choices=[
  {label:'同次大會有改選',question:'一般協會修改理事長任期已經過大會，但忘了報縣府；同次大會有改選，這一屆能直接適用嗎？'},
  {label:'非改選年，本屆還在任期中',question:'一般協會修改理事長任期已經過大會，但忘了報縣府；非改選年，本屆還在任期中，可以直接適用嗎？'}
 ];
 return {direct:true,category:'協會會務｜任期與章程核備',title:'修章漏報要補件，新任期適用哪屆另看改選時點',
  summary:next?'非改選年原則自次屆適用，不宜直接延長或縮短現任任期；仍要補報章程變更。':current?'若確在改選年依法修章，原則適用同次改選產生的新一屆，不是追溯到上一屆；另須補報。':'不要只憑大會通過或是否報縣府，就認定現任直接適用新任期。先確認是否同次改選，再補辦章程核備。',
  steps:[owing,when],refs:[p(20),p(27),p(54),mofaq,validity],questionState:{focus:'compound'},...(!next&&!current?{choiceHeading:'這次大會有辦理改選嗎？',choices}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationCharterMembershipTerm=route;
})(typeof window!=='undefined'?window:globalThis);
