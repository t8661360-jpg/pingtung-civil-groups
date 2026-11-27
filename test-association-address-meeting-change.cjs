const assert=require('node:assert/strict');
const {route}=require('./association-address-meeting-change');
const mixed='會址搬家了，開會員大會也延期；先變更還是先報改期？';
assert.match(route(mixed).summary,/分開辦/);
assert.match(JSON.stringify(route(mixed).steps),/15日前/);
const unknown='我們協會要改日期跟地點，原本寄給會員的通知已經寄了，辦公室也搬家，能等變更會址後再通知嗎？';
const a=route(unknown);
assert.match(a.summary,/已發舊通知/);assert.equal(a.choices.length,2);
for(const [i,k] of ['15日前','七日前'].entries()){const b=route(a.choices[i].question);assert.match(b.summary,/已發舊通知/);assert.ok(JSON.stringify(b.steps).includes(k));}
const pending=route('我們協會會員大會要延期，但一封通知還沒寄，會址也要搬。已經有次數限制嗎？');
assert.match(pending.summary,/未發舊通知/);assert.match(JSON.stringify(pending.steps),/延長不得超過三個月/);
const venue=route('協會的登記地址沒變，只換會員大會的場地；要先辦會址異動嗎？');
assert.match(venue.summary,/不用辦會址異動/);assert.ok(!JSON.stringify(venue.steps).includes('先經理事會決議'));
for(const q of ['場地沒有變，純協會會址搬家要辦什麼？','合作社的登記地址跟開社員大會的地方都搬了，而且要改期，哪個程序先辦？','協會大會改期，會員資格有變要重做名冊嗎？','工會大會延期也搬會址，我要怎麼做？'])assert.equal(route(q),null,q);
