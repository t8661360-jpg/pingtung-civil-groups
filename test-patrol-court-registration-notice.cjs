const assert=require('node:assert/strict');
const {courtRegistrationNotice:answer,creditorNotice,keepNoticeQuestion}=require('./liquidation-creditor-notice');
const mixed='法院網站已經公告社團法人解散，我還要再通知債權人嗎？';
const closing='社團法人清算終結，法院會公告嗎？';
const registration='社團法人解散登記後，法院網站會公布嗎？';
for(const q of [mixed,closing,registration,'協會已辦法人登記，清算完成法院會刊登嗎？']){
 const a=answer(q);
 assert.match(a.summary,/三日內於公告處公告七日以上.*法院網站/,q);
 assert.match(a.summary,/不能取代.*公告至少三次.*三個月內申報.*已知債權人還要個別通知/,q);
 assert.ok(a.statutes.some(s=>s.title==='非訟事件法第93條'));
 assert.equal(keepNoticeQuestion(q,()=>''),q);
}
assert.match(answer(closing).summary,/清算人向法院登記處聲請清算終結登記.*已獲承認的證明/);
assert.ok(answer(closing).statutes.some(s=>s.title==='非訟事件法第91條'));
assert.ok(answer(registration).statutes.some(s=>s.title==='非訟事件法第88條'));
for(const q of ['合作社解散法院網站會公告嗎？','股份有限公司清算完成，法院會公告嗎？','財團法人清算終結法院會公告嗎','協會沒有法人登記，清算完成法院會公告嗎','社團法人清算時可請法院代我公告通知債權人嗎？','屏東的社團法人解散，清算時一定要登報通知債權人嗎？','協會的公告要貼在哪裡']){
 assert.equal(answer(q),null,q);
}
assert.match(creditorNotice('合作社解散清算要怎麼公告通知債權人？').summary,/就任後十五日內公告/);
console.log('court registration notice OK');
