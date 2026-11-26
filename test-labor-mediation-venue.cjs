const assert=require('node:assert/strict');
const clarify=require('./labor-mediation-venue.js');
const r=require('./round-fixes.js');
const prior=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const q1='協會登記在屏東，但我在高雄上班，被資遣要到哪裡申請勞資爭議調解？';
const q2='我在屏東上班，協會總部在高雄，被開除不服要找哪裡調解？';
const q3='我在屏東和高雄都有工作，被資遣應在哪裡申請勞資爭議調解？';
for(const q of [q1,q2,q3]){
 const old=prior(q);
 const a=clarify(q,old);
 assert.match(a?.title??'',/工作地，不是協會登記地/,q);
 assert.match(a.summary,/在高雄工作，向高雄市/);
 assert.match(a.summary,/在屏東工作，則向屏東縣/);
 assert.match(a.summary,/跨縣市工作.*確認受理單位/);
 assert.doesNotMatch(a.summary,/協會在屏東縣的話/);
 assert.deepEqual(a.statutes,old.statutes);
}
const q='協會員工被資遣不服怎麼辦？';
const a=clarify(q,prior(q));
assert.match(a.title,/員工被協會開除或資遣/);
assert.match(a.summary,/勞務提供地/);
assert.doesNotMatch(a.summary,/協會在屏東縣的話/);
for(const q of ['會員被開除不服怎麼辦？','員工資遣費怎麼算？','協會要幫員工提繳勞退百分之幾？','協會會員大會怎麼開？']){
 const x=prior(q); assert.equal(clarify(q,x),x,q);
}
console.log('labor-mediation-venue ok');
