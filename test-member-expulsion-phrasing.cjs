const assert=require('node:assert/strict');
const canonical=require('./member-expulsion-phrasing.js');
const rules=require('./round-fixes.js');
for(const question of ['理事長說他要把我踢出協會，可以自己決定嗎？','理事長說要把我踢出協會，這樣可以嗎？','理事會能不能把會員趕出社區發展協會？','會長可以把我逐出社團嗎？']){
 const routed=canonical(question);
 assert(routed,question);
 const a=rules.verifiedRoundAnswer(rules.normalizeQuestion(routed),{});
 assert.match(a.title,/會員除名/);
 assert.match(a.summary,/出席人數三分之二以上同意/);
 for(const article of [14,27]) assert(a.statutes.some(x=>x.title.includes('第'+article+'條')));
}
for(const q of ['合作社的理事長可以把我踢出協會嗎？','理事長能把我踢出協會的LINE群組嗎？','理事長把我踢出協會，我想向法院申訴，可以嗎？','理事長說他不會把我踢出協會，還能直接退會嗎？','我還沒入會，理事長可以把我踢出協會嗎？','理事長可以把我趕出開會的會場嗎？']) assert.equal(canonical(q),null,q);
console.log('member-expulsion-phrasing ok');
