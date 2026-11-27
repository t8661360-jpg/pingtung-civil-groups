const assert=require('node:assert/strict');
const {designated}=require('./association-designated-donation-cooperative-deficit.js');
const a='協會收到這筆指定捐款可以拿去補赤字嗎',c='合作社年度短絀是不是也要理監事負責';
for(const q of [a+'？另外'+c+'？',c+'？另外'+a+'？',a+'，'+c+'？']){
 const r=designated(q);assert.ok(r,q);const s=JSON.stringify(r);
 for(const p of ['不能任意挪補','第19條','第36條','短絀分擔案','第4條有限、保證、無限責任'])assert.ok(s.includes(p),p);
}
for(const q of [a,c,'信用合作社年度短絀要理監事出錢嗎？'+a])assert.equal(designated(q),null,q);
console.log('協會指定用途、責任與合作社短絀分流通過');
