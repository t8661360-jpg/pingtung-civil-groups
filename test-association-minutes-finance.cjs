const a=require('node:assert/strict');
const {route}=require('./association-minutes-finance.js');
const flat=r=>r.steps.flat().join(' ');
const q='我們協會不是開會員大會，是監事會。八月十五日要審今年期中收支，不是年度決算；期間怎麼寫，監事會紀錄是不是也要30天報縣府，明年年度決算還要經會員大會嗎？';
const r=route(q);
a.match(r.summary,/監事會紀錄原則自己留/);
a.match(flat(r),/8月15日.*1月1日至7月31日.*不是法定截止日/);
a.match(flat(r),/監事會審，再提會員（代表）大會通過.*大會追認/);
a.equal(r.choices,undefined);
a.match(route('理事會紀錄閉會後也要30天報嗎？我問理事會，不是會員大會。').summary,/理事會紀錄原則自己留/);
a.match(route('我們協會只問理事會紀錄和監事會紀錄，不是會員大會。都要閉會後三十天報，還是只有大會？').summary,/理事會、監事會紀錄原則自己留/);
const unknown=route('我們協會會議紀錄要送縣府嗎？當場還沒說是哪一種。');
a.equal(unknown.choices.length,4);
a.match(route(unknown.choices[0].question).summary,/30日內報備/);
a.match(route(unknown.choices[2].question).summary,/監事會紀錄原則自己留/);
for(const q of [
 '合作社監事會紀錄是否要30日內備查？','我們協會收到縣府來文補件，監事會紀錄怎麼報備？',
 '協會會員大會通知一定要15日前嗎？','協會年終只問決算期間是幾個月？'
]) a.equal(route(q),null,q);
console.log('association minutes and interim finance: negation, date, annual procedure and meeting options passed');
const colloquial=route('我們協會的監事會不是會員大會。八月十五日審本年期中財務，期中表是不是一定到七月底？這場的紀錄幾天內報？');
a.match(colloquial.summary,/監事會紀錄原則自己留/);
a.match(flat(colloquial),/1月1日至7月31日.*不是法定截止日/);
