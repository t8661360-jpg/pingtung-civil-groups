const assert=require('node:assert/strict');
const rule=require('./board-vacancy-count.js');
const {normalizeQuestion}=require('./round-fixes.js');
const ask=q=>rule(normalizeQuestion(q));
for(const q of ['理監事人數不足過半','理監事出缺未達章程三分之二怎麼辦','協會理事缺額遞補後不到一半，需要補選嗎？']){
 const a=ask(q);assert.match(a?.title??'',/先由候補遞補.*三分之二才補選/,q);
 assert.match(a.summary,/理事、監事要分開看/);
 assert.match(a.summary,/到場的人不夠，不代表職位出缺/);
}
for(const q of ['理事會出席人數未過半怎麼辦？','協會選理事一定要超過半數票嗎？','合作社理監事人數不足過半','理事長出缺怎麼辦','候選人得票不到一半可以當選嗎？'])
 assert.equal(ask(q),null,q);
console.log('board-vacancy-count ok');
