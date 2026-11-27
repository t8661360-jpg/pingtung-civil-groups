const assert = require('node:assert/strict');
const {answerMixed, changedMeetingVenue} = require('./verified-mixed-questions');
const lines = q => {const a=answerMixed(q);return [a.summary,...a.steps.flat(),...a.refs.map(x=>x.title)].join('\n')};
for(const q of [
 '臨時下雨，協會會員大會日期不變但換地址，要通知所有會員還是只跟縣府說？',
 '會員大會改到隔壁會議室，日期不變，需要重新通知會員嗎？',
 '要通知所有會員嗎？只跟縣府說可以嗎？協會會員大會日期不變，場地改了。'
]){
 assert.match(lines(q),/新地點通知應出席的會員或會員代表/);
 assert.match(lines(q),/開會十五日前.*報請主管機關派員列席/);
 assert.match(lines(q),/未另定只換地點是否一律重新起算/);
 assert.doesNotMatch(lines(q),/開會七日前/);
}
const board=lines('協會理事會開會日期不變，只換地點，要重新算七天嗎？');
assert.match(board,/開會七日前/);
assert.doesNotMatch(board,/十五日前|人民團體法第26條/);
const ask=answerMixed('原訂日期不變，但會議地點改了，要怎麼通知？');
assert.deepEqual(ask.choices.map(x=>x.label),['會員大會','理事會','監事會']);
for(const [i,x] of ask.choices.entries()){
 const a=answerMixed(x.question);
 assert.ok(!a.choices);
 assert.match(a.steps[1][0],new RegExp(['會員','理事會','監事會'][i]));
}
for(const q of ['協會要辦理登記會址變更，需要通知縣府嗎？','我們協會改的是登記會址，不是開會地點，要怎麼報備？','會員大會改期，原日期不能開，要提前幾天通知？','合作社社員大會換場地，還要通知全體社員嗎？','商業同業公會會員大會換地址要通知誰？','開會地點一定要在登記會址嗎？']) assert.equal(changedMeetingVenue(q),null,q);
console.log('changed meeting venue OK');
