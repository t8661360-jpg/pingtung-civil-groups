const assert=require('node:assert/strict');
const {answerMixed,temporaryMeetingNotice}=require('./verified-mixed-questions');
const raw='理事通知改期後，臨時會議最晚什麼時候要通知？';
const a=answerMixed(raw);assert.deepEqual(a.choices.map(x=>x.label),['會員大會','理事會','監事會']);
for(const [i,c] of a.choices.entries()){
 assert.ok(c.question.includes(raw));
 const b=answerMixed(c.question),s=b.steps.flat().join(' ');
 assert.match(s,i===0?/十五日前.*報請主管機關派員列席/:/七日前/);
 assert.doesNotMatch(s,i===0?/開會七日前/:/開會十五日前/);
 assert.match(s,/開會前一日送達.*寄出、沒有送達，不算符合例外/);
}
const no=answerMixed('協會臨時理事會要在前一天通知嗎？只是排不出時間，沒有緊急事故。');
assert.match(no.summary,/沒有緊急事故，不能用前一日/);
assert.match(answerMixed('協會因緊急事故臨時召開監事會，前一天晚上寄出可以嗎？').steps.flat().join(' '),/須於開會前一日送達/);
for(const q of ['我們合作社開臨時社員大會，通知要提前幾天？','協會年度決算要提到臨時會員大會，哪天截止？','協會會員大會改期，原日期不能開，要提前幾天通知？','臨時理事會議程想改，哪裡有範本？'])assert.equal(temporaryMeetingNotice(q),null,q);
console.log('temporary meeting notice OK');
