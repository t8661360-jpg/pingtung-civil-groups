'use strict';
const a=require('node:assert/strict');
const {coopRepresentativeSeats:seat}=require('./verified-mixed-questions');
const {route:report}=require('./association-finance-inventory-download');
const q='我們是一般消費合作社，有2500名社員，能選幾個社員代表？';
a.match(seat(q).summary,/2500名社員.*199名社員代表/);
a.match(seat('信用合作社有2,500名社員，可以選幾個社員代表？').summary,/2500名社員.*151名社員代表/);
a.match(seat('普通合作社有兩千五百位社員，可以選幾席社員代表？').summary,/2500名社員.*199名社員代表/);
a.match(seat('一般消費合作社有200名社員，能選幾名社員代表？').summary,/未超過200人/);
a.match(seat('一般消費合作社有201名社員，能選幾名社員代表？').summary,/最低51名/);
const unspecified=seat('合作社有2,500名社員，可以選幾個社員代表？');
a.equal(unspecified.choices.length,2);
for(const [choice,cap] of unspecified.choices.map((x,i)=>[x,i===0?199:151])){
 const x=seat(choice.question);a.match(x.summary,new RegExp('2500名社員.*'+cap+'名社員代表'));
}
a.doesNotMatch(seat('一般合作社有2500名社員，原有100名社員代表，現在能選幾位社員代表？').summary,/100名社員/);
a.equal(seat('協會有2500名會員，可以選幾個會員代表？'),null);
a.equal(seat('一般合作社社員代表大會有51人，幾人出席才算有效？'),null);
const r=report('協會財產目錄跟會員名冊每年都要報縣府嗎，什麼時候報？');
a.match(r.steps[0][1],/會計年度終了後3個月內編造.*提會員.*通過、報主管機關/);
a.match(r.steps[1][1],/平時|隨異動更新/);
a.match(r.steps[2][1],/閉會後30日內備查/);
a.match(report('協會會員名冊要年年送縣府嗎？財產目錄呢？').steps[0][0],/^會員名冊/);
for(const [choice,rule] of r.choices.map((x,i)=>[x,i===0?/須含財產目錄/:/可用附件二簡式/])){
 const x=report(choice.question);a.match(x.summary,rule);a.match(x.summary,/會員名冊/);a.equal(x.choices,undefined);
}
a.equal(report('合作社財產目錄跟社員名冊每年都要報縣府嗎？'),null);
a.equal(seat('合作社社員代表大會要幾人？'),null);
