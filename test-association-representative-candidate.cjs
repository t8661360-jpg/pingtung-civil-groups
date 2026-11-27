const assert=require('node:assert/strict');
const {representative}=require('./association-representative-candidate.js');
for(const q of ['協會改成會員代表制以後，理事長還一定要是會員代表嗎？','一般協會用會員代表大會改選，有個會員未當代表可以當理事嗎？','不是會員代表不代表沒有會員資格，協會要選理事長到底可以先提名這個人嗎？']){
 const r=representative(q);assert.equal(r?.choices?.length,3);
 assert.match(r.summary,/先分兩關/);assert.match(JSON.stringify(r),/不代認這位候選人資格/);
 const p=r.choices.map(x=>representative(x.question));assert.match(p[0].summary,/不能直接提名/);assert.match(p[1].summary,/任職資格仍有效/);assert.match(p[2].summary,/第19條/);
}
for(const q of ['合作社社員代表能當理事長嗎？','商業同業公會會員代表可以選理事長嗎？','協會理事長一年可以罷免嗎？'])assert.equal(representative(q),null,q);
console.log('一般代表制與上級團體法定例外分流通過');
