'use strict';
const assert=require('node:assert/strict');
const {route}=require('./association-leave-and-court-stages');
for(const q of ['我們是協會，會員大會有人請假但沒退會，算不算應出席？如果已退會但理事會先前審完名冊了呢？','已退會但還在舊名冊；協會會員大會另有一個只是請假，人數怎麼算？']){
 const a=route(q);
 assert.match(a.summary,/只是請假，仍算應出席.*退會要比較生效日與名冊審定日/);
 assert.match(a.steps[0][1],/沒有到場不算本人實際出席.*書面委託要另計/);
 assert.match(a.steps[1][1],/審定前已確定生效者，不列入.*在開會前向原主管機關確認.*不自行在原名冊刪人/);
}
const u=route('協會只有3名會員代表通過章程，想再到法院登記，有什麼門檻？');
assert.equal(u.choices.length,2);
assert.match(u.summary,/單憑幾位會員代表同意，不能判斷/);
assert.match(route(u.choices[0].question).steps[1][1],/領得立案證書後.*所在地管轄法院.*登記完成後30日內/);
assert.match(route(u.choices[1].question).steps[0][1],/民法第53條.*出席者四分之三.*原立案主管機關和原登記法院/);
const x=route('協會章程已在大會通過，3個代表同意，還沒拿到縣府立案證書，可以直接到法院設立法人嗎？');
assert.match(x.summary,/沒有主管機關核發的立案證書，不能直接辦/);
assert.match(x.steps[0][1],/過半數出席.*三分之二以上同意/);
for(const q of ['合作社社員大會，有人退社也有人請假，怎麼算應出席人數？','協會理事會有人請假和另有人退會，名冊怎麼算？','協會會員大會有人缺席、退會，還要改選理事，名冊怎麼算？','協會法院法人登記變更地址要申報章程嗎？','協會章程只能讓本地居民加入嗎？'])assert.equal(route(q),null,q);
