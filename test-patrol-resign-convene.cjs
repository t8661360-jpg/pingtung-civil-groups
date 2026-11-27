const assert=require('node:assert/strict');
const {answerMixed:A,resignationAndMeeting:R}=require('./verified-mixed-questions');
const all=a=>[a.summary,...a.steps.flat(),...a.refs.map(x=>x.title)].join(' ');
assert.match(all(A('協會理事長辭職了，理事會跟會員大會都還能開嗎？')),/尚未准辭.*書面提出.*自出缺之日起一個月內補選.*不足六個月.*主管機關指定理事一人召集/);
assert.match(all(A('協會理事長口頭說要辭職，監事可以代他召集理事會嗎？')),/口頭請辭不生效.*監事不會因此取得理事會召集權/);
assert.match(all(A('協會理事長辭職已生效，副理事長就能直接主持會員大會嗎？')),/副理事長不會因稱謂.*一個月內補選/);
for(const q of ['協會理事長過世剩三個月要補選嗎？','協會理事長辭職銀行印鑑要不要改？','合作社理事會主席辭職誰召集會議？','協會理事長辭職後，各只剩一位理事和監事，可以只報縣府就補選嗎？'])assert.equal(R(q),null,q);
console.log('resignation and convening conditions are distinct');
