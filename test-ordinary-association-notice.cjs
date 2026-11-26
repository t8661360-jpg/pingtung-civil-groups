const {strict:assert}=require('node:assert');
const rules=require('./round-fixes.js');
const notice=require('./ordinary-association-notice.js');
const ask=q=>notice(rules.normalizeQuestion(q))||rules.verifiedRoundAnswer(rules.normalizeQuestion(q),{});
for(const q of ['協會的公告要貼在哪裡','社區發展協會的公告要貼在哪裡','我們社區協會的公告要貼在哪裡？','公告要貼幾天？','公告欄要放哪裡？']){
 const a=ask(q);
 assert.match(a.title,/一般會務公告/,q);
 assert.match(a.summary,/現場公告/);
 assert.match(a.summary,/單貼公告不能取代通知/);
 assert.match(a.summary,/另有期限和刊登管道/);
 assert(a.statutes.some(s=>s.title.includes('選舉罷免辦法第36條')));
}
for(const q of ['募款結束後收支要公告在哪裡、多久內？','開會員大會貼公告就算通知了嗎？','理事會有開，但沒提前通知，怎麼辦？','合作社公告要貼幾天','公告要貼在哪裡才符合募款規定','協會的財務公告貼哪裡','縣府公告在哪裡看','罷免公告貼幾天']){
 assert(!ask(q)?.title.includes('協會的一般會務公告'),q);
}
assert.match(ask('理事會有開，但沒提前通知，怎麼辦？').title,/開會通知/);
console.log('ordinary-association-notice ok');
