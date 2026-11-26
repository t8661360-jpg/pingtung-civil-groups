const assert=require('node:assert/strict');
const {creditorNotice}=require('./liquidation-creditor-notice');
for(const q of ['屏東的社團法人解散，清算時一定要登報通知債權人嗎？','協會解散一定要登報公告嗎？']){
 const a=creditorNotice(q);
 assert.match(a.summary,/三次以上之公告.*三個月內申報.*另須分別通知/,q);
 assert.match(a.summary,/沒有指定一律登報.*接受的公告方式/,q);
 assert.match(a.summary,/未辦法人登記/);
 assert.ok(a.statutes.some(s=>s.title==='公司法第327條'));
}
const coop=creditorNotice('合作社解散清算要怎麼公告通知債權人？');
assert.match(coop.summary,/指定至少一個月/);
assert.match(coop.summary,/就任後十五日內公告.*申報期限不得少於十五日/);
for (const q of ['我們社團不玩了要怎麼辦','協會違反章程可以撤銷嗎','公司解散要公告嗎','信用合作社清算要登報嗎','合作社清算完成後多久要報告'])assert.equal(creditorNotice(q),null,q);
console.log('liquidation creditor notice OK');
