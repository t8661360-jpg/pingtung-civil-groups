const a=require('node:assert/strict'), answer=require('./charter-meeting-date.js');
for(const q of ['協會章程寫每年三月開會員大會，可以改到四月嗎？','章程規定每年3月開定期大會，想永久改成4月','協會章程固定五月開會員代表大會，能延期嗎？']){
 const x=answer(q); a.match(x.summary,/不能只改開會通知/);a.match(x.summary,/三分之二以上同意/);a.match(x.summary,/新會議日期15日前/);
}
for(const q of ['協會章程沒寫幾月開會員大會，能延期嗎？','協會臨時大會可以改期嗎','工會章程固定五月開會員大會，可以延期嗎','章程可以訂會員大會每兩年開一次嗎','依章程五月召開的理事會能延期嗎'])a.equal(answer(q),null,q);

const shorthand=answer('協會章程固定每年三月大會，今年還沒開所以改到四月，下次仍三月，要修章嗎？');
a.ok(shorthand);
a.match(shorthand.summary,/一次延期和永久改變月份，是兩件事/);
a.equal(answer('合作社章程固定每年三月大會，今年改到四月可以嗎？'),null);
const yearEnd=answer('協會的章程寫年底開會員大會，今年想改到3月，要改章程還是只改通知？');
a.match(yearEnd.summary,/條文範圍以外，不能只改開會通知/);
a.doesNotMatch(yearEnd.summary,/四月/);
a.match(yearEnd.summary,/每年一次/);
const change=answer.chairDateCharter('我們只改會員大會日期不動會址，理事長可以連章程都自己一起改嗎？');
a.match(change.summary,/理事長不能自己修改章程.*不用辦會址異動/);
a.match(change.steps[0][1],/新會期15日前通知/);
a.match(change.steps[1][1],/三分之二以上/);
a.equal(answer.chairDateCharter('我們只改社員大會日期不動社址，合作社理事長可以把章程自己改嗎？'),null);
