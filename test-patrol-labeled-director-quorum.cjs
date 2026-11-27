const assert=require('node:assert/strict');
const {answerMixed,associationDirectorsQuorum:f}=require('./verified-mixed-questions');
const qs=['協會章程寫九席，六人還在任、三人出席，可以開理事會嗎？','三人到場可以決議嗎？我們協會理事會現任六人，章程規定理事九席。'];
for(const q of qs){
 const a=answerMixed(q);assert.match(a.summary,/不能成會.*章程9席、在任6人、到場3人.*至少要4人/);
 assert.match(a.steps.flat().join(' '),/以章程9席為基準，則至少要5人/);
}
assert.match(answerMixed('協會只剩五個理事，三個人到場，理事會能決議嗎？').summary,/在任5人、到場3人.*確認章程所定理事席次/);
assert.match(answerMixed('協會章程有九位理事，三人只是請病假，可以先把他們扣掉再算過半嗎？').summary,/請假不能.*章程9席，至少要5人/);
assert.match(answerMixed('我們一般協會章程原本就寫理事五席，今天三人到能開理事會嗎？').summary,/至少9人.*不能用這個席次直接判定成會/);
assert.match(answerMixed('協會理事會章程十一席，在任十一人，實際出席六人，可以開會嗎？').summary,/章程11席，至少要6人.*達到人數門檻/);
assert.match(answerMixed('協會章程有9席理事，現任5人，6人出席可以開理事會嗎？').summary,/互相矛盾/);
for(const q of ['合作社理事只剩五人三人到場，理事會可以開嗎？','協會理事會和監事會可聯席開會嗎？','協會理事會被要求指定召集人，三人到場可以開嗎？','協會理監事的章程可以把理事人數從九人減為七人嗎？'])assert.equal(f(q),null,q);
console.log('labeled director quorum OK');
