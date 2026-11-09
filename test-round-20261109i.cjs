// 第9輪：投資、入會被拒、合作社增資。來源：社會團體財務處理辦法第15、16、20條；人民團體法第12、37條；本縣章程範例第7條；合作社法第9-1、16、17、21條。
const assert=require('assert');const r=require('./round-fixes.js');const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const has=(a,s)=>a&&a.statutes&&a.statutes.some(x=>x.title.includes(s));
{const a=A('協會可不可以買股票');assert(a.title.includes('無法確認'));assert(has(a,'財務處理辦法第16條'));}
{const a=A('會員入會被拒絕怎麼辦');assert(a.title.includes('理事會通過'));assert(has(a,'人民團體法第37條'));}
assert(A('公會拒絕我入會怎麼辦').title.includes('不得拒絕'));
{const a=A('合作社要怎麼增資');assert(a.summary.includes('百分之二十'));assert(has(a,'合作社法第16條'));}
assert.notEqual((A('合作社社員退社可以拿回股金嗎')||{}).title||'','合作社增資：社員增購社股或吸收新社員，每股金額有法定範圍');
assert(A('社區協會的會費要繳多少').title.includes('章程訂定'));
assert(A('協會可以把錢存在理事長戶頭嗎').title.startsWith('不可以'));
{const a=A('監事會召集人不開會怎麼辦');assert(a.title.includes('監事過半數'));assert(has(a,'人民團體法第32條'));}
assert(A('會員代表大會是什麼').title.includes('300人'));
assert(A('協會可以不設監事嗎').title.startsWith('不可以'));
{const a=A('成立大會要準備什麼文件');assert(a.title.includes('30 日內'));assert(has(a,'人民團體法第10條'));}
assert(A('理事長不開會怎麼辦').title.includes('理事長'));
console.log('round 2026-11-09i: all cases passed');
