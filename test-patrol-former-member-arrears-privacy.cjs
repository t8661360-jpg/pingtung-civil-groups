const assert = require('node:assert/strict');
const {answerMixed, formerMemberArrearsPrivacy} = require('./verified-mixed-questions');
const social = [
  '我們協會要把會費欠繳的名單貼在公開網站，人已經退會了，可以嗎？',
  '如果會員雖然退會，協會還可以公布以前欠繳的金額嗎？',
  '先說他已退出協會，再請問他沒繳的會費金額可不可以上網公告？',
];
for (const q of social) {
  const a = answerMixed(q);
  assert.match(a.summary, /已退會.*不要公布/);
  assert.match(a.steps[1][1], /個資保護失效/);
  assert.match(a.steps[2][1], /不等於公布每人的欠費.*個別通知/);
  assert.ok(a.refs.some(x=>x.source.includes('D0050097')));
}
const cooperative = answerMixed('合作社社員退社後，還能把他欠繳的股金公布在網路嗎？');
assert.match(cooperative.summary, /已退社.*不要公布/);
assert.match(cooperative.steps[2][1], /第19條.*並未授權/);
assert.ok(!cooperative.refs.some(x=>x.source.includes('D0050097')));
for (const q of [
  '協會會員沒繳會費，理事長可以除名嗎？',
  '我們合作社社員退社後欠繳的股金要怎麼撥充？',
  '信用合作社的社員欠繳股金能公開嗎？',
  '協會定期公告收支，是否要列出每位會員姓名和會費？',
  '協會需要公告改選結果和票數嗎？',
]) assert.equal(formerMemberArrearsPrivacy(q), null, q);
console.log('former-member arrears privacy OK');
