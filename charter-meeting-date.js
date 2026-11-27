(function(root){
'use strict';
const ref=(title,source)=>({title,source});
const art=n=>ref('人民團體法第'+n+'條','https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0050091&flno='+n);
const remedy=ref('內政部：延期召開之定期會員大會仍適用通知期限','https://www.moi.gov.tw/News_Content.aspx?n=14119&s=220065');
const guide=n=>ref('人民團體會務輔導辦法第'+n+'條','https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0020094&flno='+n);
function chairDateCharter(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>155||!/會員(?:代表)?大會|定期大會/.test(t)||!/理事長|會長/.test(t)||!/章程/.test(t)
 ||!/自己.{0,6}(?:修|更|改)|(?:修|改).{0,6}自己|自行|單方面/.test(t)
 ||!/(?:改|更換|變更).{0,7}(?:日期|開會日|會期)|改期|延期/.test(t)||/合作社|公司|工會|公會|農會|漁會|管委會|成立大會|除名|罷免|補助/.test(t))return null;
 const stay=/不動會址|(?:會址|登記地址).{0,8}(?:沒改|沒搬|沒動|未動|不搬|不變|沒有變|未變)/.test(t);
 if(!stay)return null;
 return {direct:true,category:'協會會務｜會議日期與章程',title:'理事長不能自行修章；只換會議日期不是會址變更',
  summary:'理事長不能自己修改章程。會員大會只改日期而登記會址未變，不用辦會址異動。',
  steps:[['先確認章程允不允許新的會議日期','若現行章程固定會期且未留調整方式，不能只改通知就當作符合章程；先查現行條文和適用程序。改定日期後，按會員大會的新日期依法通知；定期會員大會延期仍須於新會期15日前通知，並報請主管機關派員列席。'],
  ['真的要改章程，另提會員（會員代表）大會','理事長可提案，不能自行改。依人民團體法第27條，會員（會員代表）大會過半數出席、出席人數三分之二以上同意；章程異動後30日內依第54條報主管機關核備。']],
  refs:[art(25),art(26),art(27),art(54),guide(8),guide(10),remedy],questionState:{focus:'compound'}};
}
function charterMeetingDate(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 const shortAssembly=/協會|社會團體|人民團體/.test(t)&&/(?:每年|固定)[一二三四五六七八九十0-9]+月(?:的)?大會/.test(t);
 const fixed=/(章程.{0,16}(每年|固定|限定|年底|年初|年中|上半年|下半年|[一二三四五六七八九十\d]+月)|[一二三四五六七八九十\d]+月.{0,10}章程)/.test(t);
 if(!fixed||(!shortAssembly&&!/會員(代表|（代表）|\(代表\))?大會|定期大會/.test(t))||!/改到|改在|改成|改期|延期|延到|延後|提前|換到|挪到|挪去|變更月份/.test(t))return null;
 if(/章程.{0,4}(沒寫|未寫|沒規定|未規定|沒有規定)|理事會|監事會|成立大會|臨時大會|公司|合作社|公會|工會|農會|漁會|政黨/.test(t))return null;
 return {direct:true,category:'會員大會',title:'章程已訂定期會員大會月份：改期要看章程，不是同一年開就可以',
  summary:'先看章程是寫「固定某月」還是「原則於某月／得依規定調整」。人民團體法第25條要求定期大會每年一次，但不是只要同年召開，就可以不管章程另訂的月份。章程若明訂會議期間且未留調整條款，不宜自行改到條文範圍以外，不能只改開會通知；如有特殊原因確實來不及，請先把章程條文、原因及擬定新日期備妥，向屏東縣政府社會處確認個案作法。\n\n一次延期和永久改變月份，是兩件事。以後要固定採用與現行條文不同的月份，須依法修正章程：會員大會過半數出席、出席人數三分之二以上同意，章程異動於30日內報主管機關核備（第27、54條）。\n\n定期大會改期不會因此變成緊急臨時會；內政部函釋說明，定期大會延期，仍須在新會議日期15日前通知會員；依第26條應報請主管機關派員列席。若原通知或報請已發出，個案的補行程序請向縣府承辦確認；若涉及理監事任期屆滿，也要另外確認改選期限。',
  statutes:[art(25),art(26),art(27),art(54),art(58),guide(10),remedy],notes:[],actions:[]};
}
if(typeof module!=='undefined'&&module.exports){module.exports=charterMeetingDate;module.exports.chairDateCharter=chairDateCharter;return;}
root.verifiedCharterMeetingDate=charterMeetingDate;
root.verifiedChairDateCharter=chairDateCharter;
const previous=root.verifiedRoundAnswer;
root.verifiedRoundAnswer=function(q,ctx){return charterMeetingDate(q)||previous.call(this,q,ctx);};
})(typeof window!=='undefined'?window:globalThis);
