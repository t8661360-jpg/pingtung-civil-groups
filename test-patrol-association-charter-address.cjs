const assert=require('node:assert/strict');
const {charterAddress}=require('./association-charter-address');
for(const q of [
 '我們已立案的社區發展協會修章又改會址，要先送哪一件，期限一樣嗎？',
 '社區發展協會的會址和章程都已變更，可以一起報備嗎？幾天內要送？',
 '協會準備搬辦公室也要改章程，兩項要先送哪個？',
 '協會章程有舊門牌，改會址又要修章，怎麼辦？',
 '我們是已登記的社團法人協會，修正章程也搬登記會址，縣府和法院都要辦嗎？'
]){
 const a=charterAddress(q);
 assert.match(a.summary,/三十日內報核備.*第8條沒有另列同樣/);
 const body=a.steps.flat().join(' ');
 assert.match(body,/會員大會紀錄、修正對照表及修訂後章程/);
 assert.match(body,/理事會通過新址後/);
 assert.match(body,/不要假定一件送出就辦完兩項/);
 assert.equal(body.includes('另核法院變更登記'),q.includes('社團法人'));
 assert.equal(body.includes('先協調兩個決議'),q.includes('舊門牌'));
}
for(const q of [
 '協會搬辦公室但章程只寫屏東縣，不用修章的話要怎麼送縣府？',
 '協會章程寫了完整門牌，現在搬家改會址，要修章嗎？',
 '協會只修改章程，登記會址不變，需要開大會嗎？',
 '合作社社址跟章程同時變更，幾天內要送？',
 '協會要換理事長也遷會址，能一起報嗎？',
 '協會章程變更後備查是三十天嗎？'
])assert.equal(charterAddress(q),null,q);
console.log('charter and registered-address routing OK');
