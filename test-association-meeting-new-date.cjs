'use strict';
const a=require('node:assert/strict');
const mod=require('./association-postponed-proxy');
const answer=q=>mod.route(q,2026);
const words=r=>r.steps.flat().join(' ');
const exact='我們不是法人，是屏東立案協會。原本6月28日會員大會，颱風要取消改7月5日，有會員的委託書只寫6月28日。是不是原本的通知跟委託書都能沿用，還是要重辦？';
const swapped='新日期是7/5，原本6/28會員大會取消；我們是協會。舊委託只填6/28，當天還有修章。新通知跟紀錄要何時送？';
for(const q of [exact,swapped]){
 const r=answer(q); a.ok(r); a.equal(r.followNewDate,false);
 a.match(words(r),/新會議是7月5日.*基準是6月20日/);
 a.match(words(r),/原委託只適用原日期.*另簽.*只能代理一人/);
 a.match(words(r),/按新日期重新通知.*15日前/);
}
a.match(words(answer(swapped)),/章程修正.*三分之二.*30日內.*取消而未開.*30日內/);
const multi='屏東立案的協會原本準備同一天開會員大會修章改選，再開新舊理監事交接跟第一次理事會，遇到颱風兩個都得改。委託只填原日期、原任期快到了、會議紀錄還沒送縣府，新的日期還沒定。我應該先做什麼，哪個可以一起通知，哪些不能直接展延？';
const r=answer(multi);
a.equal(r.followNewDate,true);
for(const part of [/另簽本次書面委託/,/任期屆滿前一個月內.*最多三個月/,/第7日起至15日內.*一併通知.*全體/,/就任後.*15日內/,/散會後30日內/])a.match(words(r),part);
const correction='更正，不是要改選，理監事任期還有三個月。只要改期開會員大會報年度會務財務、同一天排理監事會；新的日期還沒定。原本通知和委託、會後紀錄，要怎麼分開做？';
a.equal(mod.isMeetingDateCorrection(correction),true);
const resumed=mod.applyMeetingDateCorrection(multi,correction);
const edit=answer(resumed);
a.equal(edit.followNewDate,true);
a.match(words(edit),/通常7日前通知.*年度會務、決算/);
a.match(words(edit),/原委託只適用原日期/);
a.doesNotMatch(words(edit),/延長最多三個月|第7日起至15日內|修章是另列/);
const after=answer(resumed+'；續問日期：7/5');
a.equal(after.followNewDate,false);
a.match(words(after),/新會議是7月5日.*基準是6月20日/);
a.equal(answer(resumed+'；續問日期：2月30日').followNewDate,true);
for(const q of ['合作社社員大會6/28改7/5，舊委託書只寫6/28。','商業公會會員代表大會延期，原通知委託都要更新嗎？','協會想要辦緊急臨時會員大會，改7月5日，紀錄何時送？','我們協會不是會員大會，是監事會改期，紀錄怎麼送？','協會這次會員大會臨時提除名，改7月5日，新通知呢？'])a.equal(answer(q),null,q);
for(const q of ['我們協會要開例行監事會，不是會員大會，提前幾天通知？','我們社區發展協會只要開例行監事會，沒有會員大會，要幾天前通知？']){
 const r=answer(q);a.match(r.title,/監事會：七日前通知/);a.match(words(r),/監事會召集人（常務監事）/);
}

const march='立案協會年度會員大會延期改3月10日，委託書只填原日，紀錄要何時送？';
const leap=mod.route(march,2026);a.equal(leap.followNewDate,true);
a.match(words(leap),/只需補年份以核對閏年/);
a.match(words(mod.route(march+'；續問日期：2028年3月10日',2026)),/2028年3月10日.*2028年2月24日/);
