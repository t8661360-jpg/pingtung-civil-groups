const assert=require('node:assert/strict');
const {answerMixed,missedSupervisorNotice}=require('./verified-mixed-questions');
const s=q=>{const a=answerMixed(q);return [a.summary,...a.steps.flat()].join(' ')};
for(const q of ['協會開理事會沒有通知監事列席，決議算數嗎？','決議有效嗎？協會章程要求監事列席理事會，可是我們漏通知。']){
 assert.match(s(q),/章程.*程序瑕疵.*不能只因漏通知/);
 assert.match(s(q),/通知及送達紀錄/);
}
const joint=s('我們是協會理監事聯席會議，只通知理事沒通知監事，還可以通過決議嗎？');
assert.match(joint,/理事、監事各要過半數出席.*不能只靠理事一方表決通過/);
const accounts=s('協會理事會要審年度決算，不通知監事就直接送縣府可以嗎？');
assert.match(accounts,/不可以把未經監事會審核.*先送監事會審核/);
for(const q0 of ['合作社理事會不通知監事，會議決議有效嗎？','協會監事報請縣府指定召集人，還是要先開理事會嗎？','臨時理事會要提前幾天通知？','協會的監事可以列席理事會嗎？'])assert.equal(missedSupervisorNotice(q0),null,q0);
console.log('missed supervisor notice OK');
