const assert=require('node:assert/strict');
const rule=require('./meeting-smoke-free.js');
const {normalizeQuestion}=require('./round-fixes.js');
const ask=q=>rule(normalizeQuestion(q));
for(const q of ['理事長可以在會議過程中抽菸嗎','協會租會議室開會，主席可以抽煙嗎？','理事會開會有人抽菸該找誰？']){
 const a=ask(q);assert.match(a?.title??'',/會議室內全面禁菸/,q);
 assert.match(a.summary,/場地負責人或工作人員應勸阻/);
 assert.match(a.summary,/2,000元至10,000元/);
 assert.match(a.summary,/08-738-5372/);
 assert(a.statutes.some(x=>x.title==='菸害防制法第18條'));
}
const outdoor=ask('我們在戶外廣場開會，有人抽菸能檢舉嗎？');
assert.match(outdoor?.title??'',/戶外.*禁菸公告/);
assert.match(outdoor.summary,/不能單靠「在戶外」判斷/);
for (const q of ['理事會開會有人一直打斷發言怎麼辦？','理事長可以在會議室抽電子菸嗎？','抽菸要怎麼戒？','開會通知能不能用群組？']){
 assert.equal(ask(q),null,q);
}
console.log('meeting-smoke-free ok');
