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
for(const q of ['場地沒有變，純協會會址搬家要辦什麼？','協會大會改期，會員資格有變要重做名冊嗎？','工會大會延期也搬會址，我要怎麼做？'])assert.equal(route(q),null,q);

const unchanged=route('社員大會通知已寄出，合作社的會議日期要改，社址沒變，要不要重新寄通知？');
assert.match(unchanged.summary,/不必辦社址變更登記.*重新通知.*七日前/);
assert.equal(unchanged.steps.length,1);
const withMove=route('合作社的登記地址跟開社員大會的地方都搬了，而且要改期，哪個程序先辦？');
assert.match(withMove.summary,/分開辦.*七日前/);
assert.match(JSON.stringify(withMove.steps),/決議後一個月內/);
assert.equal(route('信用合作社要換社員大會日期，社址未變'),null);
assert.equal(route('合作社改社址決議後多久登記？'),null);
assert.equal(route('合作社社員大會通常要提前幾天書面通知？'),null);
const unclear=route('合作社社員大會要改期，辦理社址登記是同一件事嗎？');
assert.equal(unclear.choices.length,2);
assert.match(route(unclear.choices[0].question).summary,/不用|不必辦/);
assert.match(route(unclear.choices[1].question).summary,/分開辦/);
