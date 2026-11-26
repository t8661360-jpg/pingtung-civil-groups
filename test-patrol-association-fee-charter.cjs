'use strict';
const assert=require('node:assert/strict');
const {feeCharter}=require('./association-fee-charter');
for(const q of ['協會要調高常年會費，只要會員大會通過就好，還是要連章程一起修改？','協會章程寫常年會費500元，改成600元要修章嗎？','協會依章程調整會費一定要修章嗎？']){
 const a=feeCharter(q);
 assert.match(a.title,/寫死金額/);
 assert.match(a.summary,/必須一併修章/);
 assert.match(a.summary,/三分之二以上同意/);
 assert.match(a.summary,/不一定需要修章.*核備後才能實施/);
 assert.match(a.summary,/沒有明確標準，不能直接認定不用修章/);
 assert.equal(a.statutes[0].title,'社會團體財務處理辦法第14條');
}
for(const q of ['會費可以調漲嗎','商業同業公會會費調高要修章嗎？','協會調整章程後退費怎麼算？','章程規定不繳會費可以除名嗎？'])assert.equal(feeCharter(q),null,q);
console.log('association fee charter OK');
