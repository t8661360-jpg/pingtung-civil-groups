const assert=require('node:assert/strict');
const {deficit}=require('./association-deficit-personal-liability.js');
for(const [q,expect] of [
 ['協會年度決算虧損，理監事要自掏腰包補嗎？','不等於理監事個人必須自掏腰包'],
 ['沒有簽個人保證，社團法人年度短絀幾萬元，能讓新理事自費補嗎？','未簽個人保證的新理事'],
 ['我是上屆理事長有簽個人保證，協會虧損是不是跟我沒關係？','不能只因卸任'],
]){
 const a=deficit(q);assert.ok(a,q);assert.ok(a.summary.includes(expect));assert.match(JSON.stringify(a),/監事會審核/);assert.match(JSON.stringify(a),/民法第35條/);
}
for(const q of ['合作社短絀要理監事個人負責嗎？','協會幹部只是先墊活動費，要怎麼核銷墊款？','協會年度決算虧損報表怎麼填？'])assert.equal(deficit(q),null,q);
console.log('決算短絀、保證及個別責任分流通過');
const reserve=deficit('我們協會年度決算有赤字，有專戶準備基金，能直接轉出補決算嗎？');
assert.match(reserve?.summary,/不要未經決議/);
assert.match(JSON.stringify(reserve),/收入總額20%/);
