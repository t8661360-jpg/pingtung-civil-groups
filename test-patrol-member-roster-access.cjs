'use strict';
const assert=require('node:assert/strict');
const {rosterAccess}=require('./member-roster-access');
for(const q of ['協會要提供會員名冊給其他會員嗎？','會員大會前，我可以查閱會員名冊嗎？','協會改選前會員名冊可以影印帶回家嗎？','通訊選舉的會員名冊什麼時候能閱覽？','可以把會員名冊傳給會員群組嗎？']){
 const a=rosterAccess(q);
 assert.match(a.title,/可依法閱覽.*不等於可拿走/,q);
 assert.match(a.summary,/15日前.*提供會員閱覽/,q);
 assert.match(a.summary,/開票日45日前/,q);
 assert.match(a.summary,/交付整份名冊副本或對外公開/,q);
 assert.equal(a.statutes[0].title,'人民團體會務輔導辦法第10條',q);
}
for(const q of ['協會發現會員個資外洩，要通知會員嗎？','協會會員名冊外洩要通報縣府嗎？','協會能提供會員名冊給廠商嗎？','會員名冊可以給外人看嗎','合作社社員名冊可以給社員查閱嗎？','為什麼要提供會員名冊給縣府？','可以查閱理事會會議紀錄嗎？']) assert.equal(rosterAccess(q),null,q);
console.log('member roster access OK');
