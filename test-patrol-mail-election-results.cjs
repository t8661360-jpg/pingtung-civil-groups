'use strict';
const assert = require('node:assert/strict');
const { normalizeQuestion, verifiedRoundAnswer } = require('./round-fixes.js');
const { addMailElectionGuidance, preserveMailElectionQuestion } = require('./mail-election-results.js');
const ask = (q) => {
  const t = preserveMailElectionQuestion(q, normalizeQuestion);
  return addMailElectionGuidance(t, verifiedRoundAnswer(t, {}));
};
for (const q of [
  '協會採通訊選舉，當選名單要公告嗎？',
  '協會通訊選舉結果要怎麼通知當選人？',
  '郵寄選票選出理監事後要公布結果嗎？',
  '社區發展協會郵寄投票後要怎麼公告當選人？'
]) {
  const answer = ask(q);
  assert.match(answer.title, /當選人通知及公告方式/, q);
  assert.match(answer.summary, /第23條第3項.*理事會通過.*報主管機關備查/, q);
  assert.match(answer.summary, /沒有指定一律貼在哪裡/, q);
  assert.equal(answer.statutes[0].title, '人民團體選舉罷免辦法第23條', q);
}
const ordinary = ask('選舉結果出來要公告嗎');
assert.match(ordinary.summary, /宣布結果/);
assert.match(ordinary.summary, /通訊選舉則依第23條第3項/);
assert.match(ask('合作社通訊投票可以嗎？').title, /合作社/);
assert.match(ask('協會可以通訊選舉理監事嗎？').title, /章程訂定/);
console.log('mail election results OK');
