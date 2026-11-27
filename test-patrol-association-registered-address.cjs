const assert=require('node:assert/strict');
const {answerMixed,associationRegisteredAddress}=require('./verified-mixed-questions');
const content=a=>a.steps.flat().join(' ');
for(const q of ['我們協會改的是登記會址，不是開會地點，要怎麼報備？','不是換會議室，是我們協會要搬辦公室換會址，要先開大會嗎？']){
 const a=answerMixed(q);assert.match(a.summary,/登記會址.*理事會決議通過.*原立案主管機關備查/);
 assert.match(content(a),/不因換門牌就另開會員大會/);
}
assert.match(answerMixed('協會章程寫了完整門牌，現在搬家改會址，要修章嗎？').summary,/搬家就涉及修章/);
const mixed=answerMixed('社區發展協會要遷會址、換理事長，兩種異動能一起報嗎？');
assert.match(content(mixed),/三十日內報主管機關核備.*同一份公文併送，請向原立案主管機關確認/);
assert.match(content(answerMixed('我們是全國性協會，要換理事長也遷會址，能一起報嗎？')),/加附新會址使用同意書/);
for(const q of ['協會只換會員大會場地，日期不變，沒有要改登記會址，要通知嗎？','不是變更登記會址，協會會員大會只換場地，需要重新通知嗎？']){
 assert.equal(associationRegisteredAddress(q),null,q);
 assert.match(answerMixed(q).summary,/新地點通知應出席的會員或會員代表/);
}
for(const q of ['合作社搬家變更社址，要檢附什麼文件？','銀行因協會換會址需改地址嗎？','協會大會要改期，會址仍不變，什麼時候通知？']) assert.equal(associationRegisteredAddress(q),null,q);
console.log('association registered address OK');
