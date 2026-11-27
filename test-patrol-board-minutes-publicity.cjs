const assert=require('node:assert/strict');
const {answerMixed,inspectAndPublishBoardMinutes}=require('./verified-mixed-questions');
const qs=[
 '我們協會的監事可以要求看理事會紀錄嗎？可不可以直接放在官網？',
 '協會理事會議事錄可以公開上網嗎？監事能調閱嗎？',
 '協會監事查閱理事會紀錄，和把名單貼在網路，是一樣的權利嗎？',
];
for(const q of qs){
 const a=answerMixed(q),s=a.steps.flat().join(' ');
 assert.match(a.summary,/會內查閱.*不代表/);
 assert.match(s,/理事會要送監事會監察.*會員（代表）大會紀錄閉會後三十日內報備.*原蒐集目的.*無法辨識個人的摘要/);
 assert.ok(a.refs.some(x=>x.title==='個人資料保護法第20條'));
}
for(const q of ['一般協會的會員想查閱理事會紀錄，不要公開，有什麼規定？','我們合作社監事能看理事會的紀錄，可以貼上網嗎？','協會會員大會紀錄的簽名要公開到網站嗎？可以只提供會員查閱嗎？','理事會紀錄要保留多久？']) assert.equal(inspectAndPublishBoardMinutes(q),null,q);
console.log('board minutes publicity OK');
