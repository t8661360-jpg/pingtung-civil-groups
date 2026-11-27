const assert=require('node:assert/strict');
const {answerMixed, familyAssemblyProxy}=require('./verified-mixed-questions');
const no='我不是會員，可以代我太太到協會大會投票嗎？';
const reverse='協會會員大會投票，我可以拿老公的委託書代投嗎？我不是會員。';
const unknown='我先生可以拿我的委託書來協會會員大會投票嗎？我不知道他是不是會員。';
const yes='我們夫妻同是協會會員，她沒空我能拿她的委託書去投票嗎？';
for(const q of [no,reverse]){
 const a=answerMixed(q);
 assert.match(a.summary,/^不可以/);
 assert.match(a.steps.flat().join(' '),/每位受託人只能代理一人/);
 assert.ok(a.refs.some(x=>x.title==='人民團體選舉罷免辦法第7條'));
}
assert.match(answerMixed(unknown).summary,/^先確認.*不是就不能代理/);
assert.match(answerMixed(yes).summary,/^可以。.*同一協會.*書面委託/);
assert.match(answerMixed('協會會員不能出席大會，可不可以委託親友旁聽，但不投票？').steps.flat().join(' '),/即使准許，旁聽也不算代理出席/);
const trade=answerMixed('商業同業公會會員大會，我不是會員代表，可以代理我配偶嗎？');
assert.match(trade.summary,/^不可以/);
assert.match(trade.steps.flat().join(' '),/親自出席人數的二分之一/);
assert.deepEqual(trade.refs.map(x=>x.title),['商業團體法第19條']);
for(const q of ['合作社社員大會，我老公不是社員能代理嗎？','我是協會理事，我老婆可以代我參加理事會嗎？','協會會員大會可以把委託書交給另一名會員嗎？','協會會員可託另一名會員參加大會；理事會也能讓家人代理嗎？'])assert.equal(familyAssemblyProxy(q),null,q);
console.log('family assembly proxy OK');
