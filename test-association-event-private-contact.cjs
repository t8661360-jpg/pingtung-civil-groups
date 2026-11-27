const assert=require('node:assert/strict');
const {contact}=require('./association-event-private-contact.js');
const c='社區活動中心借給協會辦活動，要公開借人的電話嗎？';
const q='合作社大會開到一半只剩幾個人，要怎麼算表決？';
for(const v of [c+'另外'+q,q+'另外'+c]){
 const a=contact(v);assert.ok(a,v);const txt=JSON.stringify(a);
 for(const x of ['不等於團體聯絡方式','第48條','至少51人','當然無效','公務分機'])assert.ok(txt.includes(x),x);
}
assert.match(contact('不是查協會名冊，我是問，如果另一個協會想跟我們合辦活動，能在公告上放聯絡人的私人手機嗎？')?.summary,/不要把聯絡人/);
for(const v of ['我要查協會的電話','合作社員大會人數不足如何表決？','協會的活動公告只公布團體電話不放私人電話，可以嗎？','信用合作社社員大會有人離席，可以讓大家拍照嗎？'])assert.equal(contact(v),null,v);
console.log('活動聯絡個資與合作社中途表決分流通過');
