const assert=require('node:assert/strict');
const rule=require('./cooperative-election-threshold.js');
const {normalizeQuestion}=require('./round-fixes.js');
const ask=q=>rule(normalizeQuestion(q));
for(const q of ['合作社理事選舉要過半嗎？','合作社的監事候選人票數沒過半，還能當選嗎？','合作社選理事一定要一半以上社員出席嗎？']){
 const a=ask(q);
 assert.match(a?.title??'',/不要求候選人得票過半/,q);
 assert.match(a.summary,/原則上須有具出席資格者過半數出席/);
 assert.match(a.summary,/重開.*應出席人數三分之一/s);
 assert(a.statutes.some(s=>s.title==='合作社選舉罷免辦法第33條'));
}
const a=ask('合作社理事會主席選舉沒有人得票過半怎麼辦？');
assert.match(a?.title??'',/首輪.*半數/);
assert.match(a.summary,/第一、第二的候選人再行投票/);
for(const q of ['信用合作社理事選舉要過半嗎？','協會選理事一定要超過半數票嗎？','合作社理事罷免要過半嗎？','合作社理事會通過一般議案需要過半嗎？']){
 assert.equal(ask(q),null,q);
}
for(const q of ['我是合作社的理事，想辭職要先經理事會准許嗎？','合作社理事辭職須理事會過半同意嗎？']){ const a=ask(q); assert.match(a?.title??'',/書面送達合作社社址即生效/,q); assert(a.statutes.some(s=>s.title==='合作社選舉罷免辦法第8條')); }
console.log('cooperative-election-threshold ok');
