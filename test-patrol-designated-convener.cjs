const assert=require('node:assert/strict');
const {answerMixed,designatedMeetingConvener}=require('./verified-mixed-questions');
const slots=answerMixed('協會監事報請縣府指定召集人，還是要先開理事會嗎？');
assert.match(slots.summary,/不是一律先開理事會/);
assert.deepEqual(slots.choices.map(x=>x.label),['會員大會','理事會','監事會']);
for(const [choice,duration,role] of slots.choices.map((v,i)=>[v,i===0?'三十日':'十五日',i===2?'指定一名監事':'指定一名理事'])){
 const a=answerMixed(choice.question), steps=a.steps.flat().join(' ');
 assert.ok(steps.includes(duration)&&steps.includes(role),a.title);
 assert.match(steps,/雙掛號/);
}
const dual=answerMixed('協會理事會和監事會都無法合法開會，縣府能指定同一人召集嗎？');
assert.match(dual.summary,/理事會指定一名理事，監事會指定一名監事/);
assert.match(answerMixed('協會監事會書面請理事長開臨時會員大會，超過三十天了，可以請縣府指定召集人嗎？').summary,/不是由監事自行召集/);
assert.match(answerMixed('協會監事過半數書面連署，收到十六天還沒開監事會，縣府可以指定誰？').summary,/得指定一名監事/);
for(const q of ['信用合作社理事、監事各剩一人，主管機關能指派人補足嗎？','協會理事長辭職後，可以指定召集人補選嗎？','協會監事會要提前幾天通知？','協會的里長可以指定理事長嗎？'])assert.equal(designatedMeetingConvener(q),null,q);
console.log('designated convener OK');
