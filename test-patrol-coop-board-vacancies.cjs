const assert=require('node:assert/strict');
const {answerMixed,coopBoardVacancies}=require('./verified-mixed-questions');
const qs=['我們是合作社，理事監事各剩一個，報縣府就能補選嗎？','報縣府就可補選嗎？我們合作社的監事和理事分別只剩一人。'];
for(const q of qs){
 const a=answerMixed(q);assert.match(a.summary,/不能只報縣府就補選/);
 assert.match(a.steps.flat().join(' '),/仍未達該組章程規定名額的半數.*應召開社員大會/);
 assert.ok(a.refs.some(x=>x.title==='合作社選舉罷免辦法第7條'));
}
const resign=answerMixed('合作社理事監事已用書面送到社址請辭，要理事會批准後才能補選嗎？');
assert.match(resign.summary,/不必等理事會或監事會批准/);
assert.match(resign.steps.flat().join(' '),/送達合作社社址所在地時即生效/);
const leave=answerMixed('合作社監事請假，只有一個到場，可以算出缺補選嗎？');
assert.match(leave.summary,/不可以把一次請假當成正式出缺/);
const chair=answerMixed('合作社理事會主席辭職，剩三個月要不要馬上選新主席？');
assert.match(chair.summary,/可.*互推一人代理/);
assert.match(chair.steps.flat().join(' '),/自出缺日起一個月內/);
for(const q of ['我們是信用合作社，理事監事各剩一個，能報縣府指定補足嗎？','我們是協會，理事監事各剩一個，報縣府就能補選嗎？','合作社每年要召開社員大會嗎？','合作社選舉結果要報主管機關嗎？','合作社理事出缺後候補可以遞補嗎？'])assert.equal(coopBoardVacancies(q), null,q);
console.log('cooperative board vacancies OK');
