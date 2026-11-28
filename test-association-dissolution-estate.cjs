const assert=require('node:assert/strict');
const {route}=require('./association-dissolution-estate.js');
const digest=a=>[a.summary,...a.steps.flat()].join(' ');
const original='先問有沒有退費：團體原是一般協會、會員退會且以前繳會費又捐款，後來協會要解散，曾拿縣府補助買冰箱。能把冰箱及結餘分給離會會員、要先還縣府或先清債、捐款或會費能要求拿回、由誰接收財產、開大會要多少人同意？';
const a=route(original), d=digest(a);
for(const s of ['清債','三分之二','退費原則','受補助','歸屬','地方自治團體'])assert.ok(d.includes(s),s);
assert.equal(a.choices.length,2);
const yes=route(a.choices[0].question), no=route(a.choices[1].question);
assert.ok(digest(yes).includes('依法清算'));assert.ok(!digest(yes).includes('章程未規定或大會不能召開'));
assert.ok(digest(no).includes('章程未規定或大會不能召開'));assert.ok(!no.refs.some(x=>x.title==='民法第44條'));assert.ok(!yes.choices&&!no.choices);
for(const q of ['我們已登記公益社團法人協會，會員大會時正好一半出席、在場八成都同意解散。這樣有效嗎？如果改到更多人，剩餘財產可分會員、當初會費要退、理事自己的借款及捐款先分嗎？','假如剩餘財產分會員，連舊借款和捐款一起退嗎？我們已登記公益社團法人；解散的大會實際出席剛好半數，出席者全贊成，可以嗎？']){
 const r=route(q),dt=digest(r);assert.match(r.summary,/只有一半出席/);assert.match(dt,/公益社團法人，賸餘不得歸自然人或營利團體/);assert.match(dt,/不能只因是理事或曾出資就先付/);
}
const b=route('先問那台冰箱：協會已依法決議解散，出資的會員已離會，一半說是借協會使用，一半是縣府補助，全部文件還沒查到。沒有法院法人登記，冰箱能先交給他、縣府的款要不要全還、未繳給廠商的錢何時處理、自籌款結餘可分給誰、只有理事長就能決定嗎？');
assert.match(digest(b),/原補助機關/);assert.match(digest(b),/有證據是借用/);assert.match(digest(b),/廠商尾款/);assert.ok(!b.choices);
const g=route('屏東協會有縣府補助只買一半冰箱，另半自籌；未辦法人登記就解散，能直接把冰箱送另一協會嗎？未用補助餘額跟自己的會費結餘要一樣退縣府？');
assert.match(digest(g),/應繳回/);assert.match(digest(g),/自籌結餘/);assert.ok(!g.choices);
for(const q of ['合作社解散，社員退社可拿回股金嗎？','協會大會解散要多少人同意？','協會解散清算後收到縣府催報去年年度決算，怎麼辦？','協會清算完才發現欠繳會費，能否追收？','協會想辦法院法人登記，需要開會嗎？','協會解散，要不要把補助購置的設備繳回？','協會解散，準備基金和補助設備要繳回嗎？'])assert.equal(route(q),null,q);

assert.ok(route("一般協會解散，會員大會已同意，我們可以清償借款前就把自籌結餘平均分嗎？").choices.length===2);
