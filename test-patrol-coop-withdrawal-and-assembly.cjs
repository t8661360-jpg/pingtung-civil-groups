const assert=require('node:assert/strict');
const {answerMixed,coopWithdrawalAndAssembly}=require('./verified-mixed-questions');
const generic=answerMixed('合作社社員退社後，社員大會的法定人數怎麼算？');
assert.match(generic.summary,/已生效不列入/);
assert.match(generic.steps.flat().join(' '),/全體社員過半數出席.*至少要11人出席/);
assert.ok(generic.refs.some(x=>x.title==='合作社法第48條'));
for(const [choice,match] of generic.choices.map((x,i)=>[x,i===0?/不再列入/:/仍列入/])) assert.match(answerMixed(choice.question).summary,match);
assert.match(answerMixed('勞動合作社退社申請送了但還沒到年底，這週開社員大會還要算我嗎？').summary,/仍列入/);
assert.match(answerMixed('合作社社員已經在年底退社，下一次社員大會還要算他的人數嗎？').summary,/不再列入/);
assert.match(answerMixed('社員連續兩年都沒到場，合作社能當他退社直接扣人數嗎？').summary,/不能/);
assert.match(answerMixed('下一次社員大會還要算人數嗎，合作社社員已經在年底退社，股金又怎麼退？').steps.flat().join(' '),/退股金與成會是兩件事/);
for(const q of ['合作社社員退社只想知道怎麼退股金？','合作社準社員退社會影響社員大會人數嗎？','信用合作社社員代表大會有人退社如何算出席人數？','合作社社員代表大會有社員退社，如何算應到人數？','協會會員退會後會員大會要算人數嗎？']){
 assert.equal(coopWithdrawalAndAssembly(q),null,q);
}
console.log('coop withdrawal and assembly OK');
