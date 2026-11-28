const assert=require('node:assert/strict');
const { route }=require('./association-fine-liability.js');
let a=route('縣府處分書只寫協會，逾期沒繳，理事長個人帳戶會被扣嗎？');
assert.match(a.summary,/不能只因他是理事長/);
assert.match(JSON.stringify(a.steps),/第42條排除/);
a=route('教練是員工，協會被罰，處分上另列代表人且提到重大過失，這筆與協會的是同一筆嗎？');
assert.match(JSON.stringify(a.steps),/未盡防止義務/);
const found=route('協會罰款收到執行署通知，但我不知道處分書列協會還是我，要先查什麼？');
assert.deepEqual(found.choices.map(x=>x.label),['只列協會','也另對個人裁罰','不確定列誰']);
assert.equal(new Set(found.choices.map(x=>route(x.question).title)).size,3);
for(const other of ['不是罰鍰，是廠商向協會請款，理事長私下有簽保證書','合作社罰款沒繳','另問：佳冬鄉文化類團體幾個？','協會怎麼成立','協會要變更銀行印鑑']){
 assert.equal(route(other),null,other);
}
console.log('協會罰鍰的原義務人、行政執行與個人處分通過');
