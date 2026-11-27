const a=require('node:assert/strict'), answer=require('./charter-meeting-date.js');
for(const q of ['協會章程寫每年三月開會員大會，可以改到四月嗎？','章程規定每年3月開定期大會，想永久改成4月','協會章程固定五月開會員代表大會，能延期嗎？']){
 const x=answer(q); a.match(x.summary,/不宜自行改到四月/);a.match(x.summary,/三分之二以上同意/);a.match(x.summary,/新會議日期15日前/);
}
for(const q of ['協會章程沒寫幾月開會員大會，能延期嗎？','協會臨時大會可以改期嗎','工會章程固定五月開會員大會，可以延期嗎','章程可以訂會員大會每兩年開一次嗎','依章程五月召開的理事會能延期嗎'])a.equal(answer(q),null,q);

const shorthand=answer('協會章程固定每年三月大會，今年還沒開所以改到四月，下次仍三月，要修章嗎？');
a.ok(shorthand);
a.match(shorthand.summary,/一次延期和永久改變月份，是兩件事/);
a.equal(answer('合作社章程固定每年三月大會，今年改到四月可以嗎？'),null);
