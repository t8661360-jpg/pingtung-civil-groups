const assert=require('node:assert/strict');
const answer=require('./association-cooperative-conversion.js');
for(const q of ['已經有一個協會了，可以直接改名變成合作社嗎？','我們協會可以改組為合作社嗎？','原本的社會團體可以轉成合作社嗎？']){
 const a=answer(q);assert.match(a?.title??'',/不能只靠改名/,q);
 assert.match(a.summary,/七人以上.*創立會.*一個月內/);
 assert.match(a.summary,/不會因為改名就自動變成社員/);
 assert(a.statutes.some(x=>x.title==='合作社法第9條'));
}
for(const q of ['合作社要改名怎麼辦？','協會改名之後，要重新申請統編嗎？','合作社變成協會怎麼辦？','協會可以成為合作社員嗎？','協會改名變成信用合作社可以嗎？','協會和合作社有什麼不同？'])assert.equal(answer(q),null,q);
console.log('association-cooperative-conversion ok');
