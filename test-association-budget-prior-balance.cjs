const assert=require('node:assert/strict');
const {route}=require('./association-budget-prior-balance.js');
const primary='協會理事監事都還沒開會，決算可以先交縣府？如果預算是去年度剩餘的又怎麼算？';
const a=route(primary);
assert.match(a.summary,/不能當已通過直接報備/);
assert.match(a.steps[0][1],/事後仍須提大會追認，再報備/);
assert.equal(a.choices.length,3);
const children=a.choices.map(({question})=>route(question));
for(const x of children){assert.equal(x.choices,undefined);assert.match(x.summary,/不能當已通過直接報備/);assert.equal(x.steps.length,2);}
assert.match(children[0].steps[1][1],/重複算成今年新收入/);
assert.match(children[1].steps[1][1],/非經理事會通過不得動支/);
assert.match(children[2].steps[1][1],/補助經費有剩餘應繳回/);
assert.ok(children[2].refs.some(x=>x.title.includes('第8之1點')));
assert.equal(route('社會團體今年編預算，去年餘款同時來自自有結餘和補助').choices.length,3);
assert.equal(route('協會今年預算，去年剩下的還不確定是準備基金').choices.length,3);
assert.equal(route('去年剩下的團體自有結餘，今年協會可以拿來編預算？確定是一般結餘').steps.length,1);
for(const x of ['合作社去年剩下的自有結餘，可以編今年預算嗎？','同業公會及協會，去年自有結餘可以算今年預算嗎？','協會年度收支決算要開會嗎？','協會要除名，去年度剩餘的預算怎麼處理？'])assert.equal(route(x),null,x);
