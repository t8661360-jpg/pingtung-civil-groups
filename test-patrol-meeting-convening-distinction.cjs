const assert=require('node:assert/strict');
const {answer:a}=require('./meeting-convening-distinction');
const supervisor='協會監事逾期不開會，是否可以由理事長代為召集？';
const alternate='協會監事會一直不開，主任監事可以不經縣府就由理事長接手嗎？';
for(const q of [supervisor,alternate,'協會理事長可不可以直接召集監事會？']){
 const r=a(q);assert.match(r.summary,/指定一名監事/);assert.match(r.summary,/不是由理事長直接代替/);
 assert.match(r.steps.flat().join(' '),/監事過半數.*雙掛號.*15日內.*指定一名監事.*超過二個會次/);
}
for(const q of ['協會連續兩次理事會出席不足而流會，就一定要撤換理事長嗎？','協會理事會沒有過半數出席，和理事長根本不召集，是同一回事嗎？']){
 const r=a(q);assert.match(r.summary,/不能單憑兩次流會/);assert.match(r.steps.flat().join(' '),/超過二個會次.*三次以上.*指定一名理事/);
 assert.ok(r.refs.some(x=>x.title.includes('1020287241')));
}
for(const q of ['常務監事可以代理理事長嗎？','協會理事長不召集理事會怎麼辦？','合作社監事會一直不開，可由理事長代為召集嗎？','會員大會流會兩次，就一定應解除理事長職務嗎？'])assert.equal(a(q),null,q);
console.log('meeting convening distinction OK');
for(const q of ['理事長一個人可以決定不召開會員大會嗎？','會員大會要不要開，協會理事長自己決定就好嗎？','協會理事長拒絕召開會員代表大會，怎麼辦？']){
 const r=a(q);assert.match(r.summary,/每年召開一次/);assert.match(r.steps.flat().join(' '),/五分之一.*雙掛號.*30日內.*指定一名理事/);assert.ok(r.refs.some(x=>x.title.includes('第15條')));
}
const clarify=a('理事長一人能不能決定要不要開會');
assert.equal(clarify.choices.length,3);
assert.match(a(clarify.choices[0].question).summary,/每年召開一次/);
assert.match(a(clarify.choices[1].question).summary,/理事過半數正式連署/);
assert.match(a(clarify.choices[2].question).summary,/監事過半數正式連署/);
assert.equal(a('合作社理事長一個人可以決定不召開社員大會嗎？'),null);
assert.equal(a('公務人員協會理事長可以自己決定不召開會員大會嗎？'),null);
const {scope:quorum}=require('./meeting-quorum-kind-clarification');
assert.equal(quorum('理事長一人能不能決定要不要開會'),null);
assert.ok(quorum('只有幾個人到，能不能開會？'));
