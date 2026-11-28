'use strict';
const assert=require('node:assert/strict');
const {route}=require('./cooperative-meeting-relocation.js');
const printable=a=>JSON.stringify(a);
const plain=route('合作社的社員大會日期不變，只把開會場地改到隔壁，七天前的通知需要重發嗎？');
assert.match(plain.title,/日期不變/);
assert.match(printable(plain),/沒有對所有.+一律重算/);
assert.match(printable(plain),/不因這一場會議就變更社址/);
const broad=route('我們普通合作社社員大會因場地取消要改期，有人提出原通知期限不夠、理事改選有公告及書面通知，有兩位社員只填舊日期的委託書，縣府之前收過文件、候選人資格和任期也卡住、監事還沒看完決算、前一屆又有臨時理事會，原地址不是登記社址。先處理哪一項、誰通知、縣府何時收、可以臨時開還是要重排？');
for(const s of ['通知已發就書面更正','七日前公告','實際選舉日','報請主管機關備查','只授權舊日期','不能代填','改日期不是當然延任','十日前送監事會'])assert.ok(printable(broad).includes(s),s);
const corrected=route('更正：沒有改選、沒有改期、也不是社員大會。只是理事會同一天換小教室，只有簡訊，要確認每個人收到。',broad.coopMeetingRelocationContext);
assert.match(corrected.title,/理事會／監事會日期不變/);
assert.match(printable(corrected),/不是每場理事會只換教室都一律要報縣府/);
assert.doesNotMatch(printable(corrected),/第18條|十日前送監事會|七日前書面載明/);
const before=route('普通合作社的社員大會改到別的會館，開會那天不變；通知還沒發，要先改議程或先改通知地址？');
assert.match(printable(before),/議案不變就不用只為換場地而改議案/);
const mix=route('一般合作社原定週六開社員大會並選理監事，通知和公告已出，○○活動中心不能用，日期一樣改到另一館，之前的委託書只寫這一天，選務要怎麼重做？');
assert.match(printable(mix),/換會場不等於一律作廢/);assert.match(printable(mix),/七日前公告/);
const unclear=route('我們的開會通知發了，現在要改會場，需要幾天前更正？');
assert.equal(unclear.choices.length,4);
for(const [i,button]of unclear.choices.entries()){
 const next=route(button.question,unclear.coopMeetingRelocationContext);
 assert.equal(next.choices.length,2);
 const final=route(next.choices[1].question,next.coopMeetingRelocationContext);
 assert.match(final.title,/依新日期重排/);
 if(i===0)assert.match(printable(final),/第46條/);
 if(i===1)assert.match(printable(final),/不套社員大會的七日前/);
 if(i===2)assert.match(printable(final),/十五日前/);
 if(i===3)assert.match(printable(final),/第11條/);
}
for(const q of ['新題：崁頂鄉有哪些社區發展協會？','信用合作社理事會改地點要通知誰？','一般合作社準備遷社址，社員大會已開完，變更登記期限多久？','協會會員大會改期，舊委託書能用嗎？','婚禮開會討論通知發了要改會場嗎？'])
 assert.equal(route(q,broad.coopMeetingRelocationContext),null,q);
