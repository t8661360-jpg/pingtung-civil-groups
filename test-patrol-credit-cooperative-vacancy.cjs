const assert=require('node:assert/strict');
const {answerMixed,creditCooperativeVacancy}=require('./verified-mixed-questions');
const questions=[
 '信用合作社理事、監事各剩一人，主管機關能指派人補足嗎？',
 '金管會可以派人暫代嗎？信用合作社只剩兩名理事，已經不能成會。',
 '信用合作社監事無人，金管會能派人代行嗎？',
];
for(const q of questions){
 const a=answerMixed(q);assert.match(a.summary,/理事未達三人且不能成會，或監事無人/);
 assert.match(a.steps.flat().join(' '),/指派必要人員暫代職權，期限到補選完成.*自出缺日起二個月/);
 assert.ok(a.refs.some(x=>x.source.includes('G0380069&flno=44')));
}
assert.match(answerMixed('信用合作社理事會照常開，只剩一位監事，金管會就會派人嗎？').summary,/不會只因還有一位監事.*不等於監事無人/);
assert.match(answerMixed('信用合作社理事出缺，遞補之後還要補選嗎？').steps[0][1],/章程規定名額的一半.*自出缺日起二個月/);
for(const q of ['一般合作社理事、監事各剩一人，能指派人嗎？','協會理監事只剩一人，報縣府就能補選嗎？','信用合作社股息和存款利息一樣嗎？','信用合作社監事會主席出缺，能先指派嗎？','信用合作社理事請假會議不能成會，可以指派嗎？'])assert.equal(creditCooperativeVacancy(q),null,q);
console.log('credit cooperative vacancy OK');
