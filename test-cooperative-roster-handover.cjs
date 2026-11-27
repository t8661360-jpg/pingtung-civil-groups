const assert=require('node:assert/strict'); const {rosterCoop}=require('./cooperative-roster-handover');
const cases=[
 ['先問合作社舊社長把社員名冊留在自己的雲端，再問協會新理事長能要求交還名冊嗎？',['合作社法第35條','新任理事長就任後15日內會同監交人接收','兩類不能套用同一交接期限']],
 ['合作社新理事會接任，舊主席不交社員名簿只留個人雲端，怎麼辦？',['理事會要在合作社備置','不要求交出私人帳號密碼','不要先刪唯一原檔']],
 ['合作社主席辭職後社員名冊交接要在15天內完成嗎？',['交接、辭職和遞補於會議提報','不是名簿移交期限','不直接套一般協會15日交接規則']],
 ['合作社舊社長把社員名簿放私人雲端交接，社員可以直接公開整本嗎？',['不等於一律可把整份另存、轉傳或公開','不要僅因使用雲端就宣告外洩']],
];
for(const [q,yes] of cases){const a=rosterCoop(q);assert.ok(a,q);const r=JSON.stringify(a);for(const x of yes)assert.ok(r.includes(x),q+' missing '+x);}
for(const q of ['一般協會新理事長可把會員名冊帶回家嗎？','合作社社員名簿可不可以由社員依法查閱？','信用合作社名冊如何交接？'])assert.equal(rosterCoop(q),null,q);
assert.match(rosterCoop('合作社新社員加入名冊多久要報備？').summary,/許可加入後一個月內/);
const variant=rosterCoop('先問一般協會新任理事長何時收會員名冊，再請問合作社主席辭職怎麼交社員名簿？');
assert.ok(variant?.summary.includes('兩類不能套用同一交接期限'));
const uncertain=rosterCoop('我們新舊幹部交接，有人想把舊名簿留一份，要看團體是合作社或協會嗎？');
assert.equal(uncertain.choices.length,2);
assert.ok(rosterCoop(uncertain.choices[0].question));
assert.equal(rosterCoop(uncertain.choices[1].question),null);
console.log('合作社與協會名簿交接不混用');
