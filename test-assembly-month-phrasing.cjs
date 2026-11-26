const assert=require('node:assert/strict');
const canonical=require('./assembly-month-phrasing.js');
const r=require('./round-fixes.js');
for(const q of [
 '協會的會員大會非得在一月開嗎？','我們協會的會員大會一定得在一月開嗎？',
 '社區發展協會的會員大會非要在３月開嗎？','請問，會員代表大會只能排在11月舉辦嗎？',
 '協會定期會員大會非在十二月舉行不可嗎？','協會會員大會必須開在二月份才行嗎？'
]){
 const c=canonical(r.normalizeQuestion(q));
 assert(c,q);
 const a=r.verifiedRoundAnswer(c,{});
 assert.match(a?.title??'',/沒有規定一定要在哪個月開/,q);
 assert.match(a.summary,/每年召開一次/);
 assert.match(a.summary,/貴會章程/);
 assert(a.statutes.some(s=>s.title==='人民團體法第25條'));
}
for(const q of [
 '合作社社員大會非得在一月開嗎？','工會會員大會非得在一月開嗎？','公會會員大會非得在一月開嗎？',
 '會員大會可以在餐廳舉辦嗎','會員大會能改在三月嗎？','會員大會一定要在一月開嗎？章程原本寫一月',
 '會員大會已通知一月開，是否可以改二月？','改選會員大會一定要在一月開嗎？',
 '協會成立大會非得在一月開嗎？','今年兩次會員大會非得在一月開嗎？',
 '協會會員大會一定要在1月15日開嗎？','協會會員大會只能在13月開嗎？'
]) assert.equal(canonical(r.normalizeQuestion(q)),null,q);
assert.match(canonical('社區發展協會的會員大會非要在３月開嗎？'),/三月/);
assert.match(canonical('會員代表大會只能排在11月舉辦嗎？'),/十一月/);
console.log('assembly-month-phrasing ok');
