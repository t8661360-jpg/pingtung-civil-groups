const assert=require('node:assert/strict');
const notice=require('./founding-meeting-notice.js');
const {normalizeQuestion}=require('./round-fixes.js');
for(const q of [
 '協會籌備會的決議貼在網站上，是否就算通知會員來開大會？',
 '我們的社區發展協會要開成立大會，只要在群組貼公告就好嗎？',
 '成立大會貼了公告就不用通知會員了嗎？'
]){
 const a=notice(normalizeQuestion(q));
 assert.match(a?.title??'',/不能取代通知/,q);
 assert.match(a.summary,/十五日前通知各應出席人員及主管機關/);
 assert.match(a.summary,/會議種類、時間、地點和議程/);
 assert.match(a.summary,/屏東縣政府，縣府得派員列席/);
 assert(a.statutes.some(s=>s.title.includes('第14點')));
}
for(const q of [
 '合作社成立大會只要貼公告就好嗎？','商業同業公會成立大會只要貼公告就好嗎？',
 '協會籌備會的會議通知要報縣府嗎？','籌備會可以用網站公告徵求會員嗎？',
 '開會員大會貼公告就算通知了嗎？','協會的公告要貼在哪裡？',
 '成立大會改期後再貼公告就算通知嗎？'
]) assert.equal(notice(normalizeQuestion(q)),null,q);
console.log('founding-meeting-notice ok');
