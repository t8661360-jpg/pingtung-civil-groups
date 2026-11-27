'use strict';
const assert=require('node:assert/strict');
const {route}=require('./association-postponed-proxy');
const both=route('協會會員代表大會從3月改到4月，之前簽好的委託書能照用嗎？如果另一位代表已經換人要不要重審名冊？');
assert.match(both.summary,/改期本身不使所有原委託書失效.*另一位代表.*另審定/);
assert.match(both.steps[1][1],/15日前由理事會重新審定/);
const limited=route('協會會員大會延期但代表一個都沒換，舊委託書寫只限原本日期，能在新日期用嗎？');
assert.match(limited.summary,/不能直接在新會期使用/);
assert.match(limited.steps[1][1],/並未要求只因延期就重審一次/);
const reminder=route('協會大會延期時名冊和委託書沒變，但重新通知會員代表仍要提前15天嗎？');
assert.match(reminder.steps[2][1],/新會議日期15日前通知.*報請主管機關列席/);
assert.equal(route('合作社社員大會延期，有委託書能繼續用嗎？'),null);
assert.equal(route('一般協會會員大會的委託書要去哪裡下載？'),null);
const testAssert=require('node:assert/strict');
const reopened=require('./association-postponed-proxy.js');
const batch=[
'協會會員大會從今年十二月二十日延到明年一月十日，這樣今年算有開嗎？新通知最晚哪天發？有一份委託書寫只限原來那一天，還能用嗎？',
'新會議是明年一月十日，不是原本今年十二月二十日，協會會員大會這樣算今年有開嗎？新通知哪天前發？只適用原日的委託書還能用？'];
for(const q of batch){
 const r=reopened.route(q,2026);
 testAssert.match(r.summary,/明年開不算今年已開.*不能直接在新會期使用/);
 testAssert.match(r.steps.flat().join(' '),/2027年1月10日.*2026年12月26日/);
 testAssert.equal(r.followNewDate,false);
}
const missing='我們協會大會原通知寄了，章程固定年底開，今年想改到明年一月，新通知最晚何時寄、要不要重找縣府列席，還能不能用原來的委託書？';
testAssert.equal(reopened.route(missing,2026).followNewDate,true);
testAssert.equal(reopened.isDateReply('15日'),true);
testAssert.equal(reopened.isDateReply('我要問一般合作社，15日要開會'),false);
testAssert.equal(reopened.isDateReply('民國116年一月十五日'),true);
const continued=reopened.route(missing+'；續問日期：15日',2026);
testAssert.match(continued.steps.flat().join(' '),/2027年1月15日.*2026年12月31日/);
testAssert.match(continued.steps.flat().join(' '),/原先已報請主管機關派員列席的/);
testAssert.equal(reopened.route(missing+'；續問日期：2027-02-30',2026).followNewDate,true);
