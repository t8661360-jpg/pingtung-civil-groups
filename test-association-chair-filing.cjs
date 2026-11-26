const assert=require('node:assert/strict');
const answer=require('./association-chair-filing.js');
for(const q of ['新當選的理事長要送哪些資料？','選出新理事長要報什麼資料','選完理事長要報備什麼','協會補選理事長要交哪些文件？']){
 const a=answer(q); assert.match(a?.title??'',/30日內報異動.*理事會互選紀錄/,q);
 assert.match(a.summary,/如果這次也召開了改選理監事的會員大會/);
 assert.match(a.summary,/簡歷冊或名冊有異動/);
 assert(a.actions.some(x=>x.sub==='改選'));
 assert(a.statutes.some(x=>x.title==='人民團體法第54條'));
}
for(const q of ['理事長當選證明書怎麼拿','協會理監事改選後要報哪些資料','合作社選出新理事長要報什麼資料','職業公會新任理事長要報什麼資料','新任理事長要送法院哪些資料','新任理事長要交接哪些文件']){
 assert.equal(answer(q),null,q);
}
console.log('association-chair-filing ok');
