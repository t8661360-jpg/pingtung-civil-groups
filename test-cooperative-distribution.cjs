const assert=require('node:assert/strict');
const rule=require('./cooperative-distribution.js');
const r=require('./round-fixes.js');
const ask=q=>rule(r.normalizeQuestion(q));
for(const q of ['股息怎麼分配','合作社每年股息都能發嗎？','合作社有結餘要按股金還是交易額分？','合作社股金怎麼分配']){
 const a=ask(q);
 assert.match(a?.title??'',/按已繳股金計算.*按社員交易額分配/,q);
 assert.match(a.summary,/百分之十.*無結餘時不得發息/);
 assert.match(a.summary,/先彌補累積短絀.*依法提撥/);
 assert.match(a.summary,/社員大會若決議不分配/);
}
for(const q of ['信用合作社的股息怎麼分？','信合社盈餘怎麼分配？']){
 const a=ask(q);
 assert.match(a?.title??'',/^信用合作社/,q);
 assert.match(a.summary,/先提列法定盈餘公積.*再分配社股股息/);
 assert.match(a.summary,/當年度無盈餘不得分配/);
 assert.doesNotMatch(a.summary,/10%|百分之十/);
}
assert.match(ask('公司股票股息怎麼分配？').title,/不適用合作社/);
for(const q of ['股息','合作社解散後股息和結餘怎麼分？','合作社欠繳股金可以扣股息嗎','合作社股息要報稅嗎','合作社每股多少錢','協會可以用會費買股票領股息嗎']){
 assert.equal(ask(q),null,q);
}
console.log('cooperative-distribution ok');
