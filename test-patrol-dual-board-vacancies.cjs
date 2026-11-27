const assert=require('node:assert/strict');
const {answerMixed,dualBoardVacancies}=require('./verified-mixed-questions');
const qs=[
 '協會理事長辭職後，各只剩一位理事和監事，可以只報縣府就補選嗎？',
 '理監事各剩一人，協會有候補，可以直接去請縣府指定人開會嗎？',
 '只報縣府就可以補選嗎？協會的監事和理事都只剩一個了。'
];
for(const q of qs) {
 const a=answerMixed(q), s=a.steps.flat().join('\n');
 assert.match(a.summary,/不可以只報縣府就補選/);
 assert.match(s,/候補理事遞補理事，候補監事遞補監事.*各自章程名額的三分之二/);
 assert.match(s,/指定一名理事召集.*指定一名監事召集/);
}
const no=answerMixed('協會的理事和監事都辭光了，沒人召集，能由會員自己辦補選嗎？');
assert.match(no.summary,/不能由會員自行補選/);
assert.match(no.steps.flat().join(' '),/主管機關無法依第32條指定理事召集時，得依法限期整理/);
const leave=answerMixed('協會有理事和監事都請假，只剩各一位出席，可以當作缺額補選嗎？');
assert.match(leave.summary,/不可以把請假當成缺額補選/);
assert.doesNotMatch(leave.steps.flat().join(' '),/三分之二/);
assert.match(answerMixed('協會監事辭職只剩一人，可以代監事會審年度決算嗎？').summary,/不能由一名監事單獨/);
for(const q of ['我們是合作社，理事監事各剩一個，報縣府就能補選嗎？','協會理事長口頭說要辭職，監事可以代他召集理事會嗎？','協會理事監事要有幾個？','協會會費未繳，理監事可以除名嗎？'])assert.equal(dualBoardVacancies(q),null,q);
console.log('dual board vacancies OK');
