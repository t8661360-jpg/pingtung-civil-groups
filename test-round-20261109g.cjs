const assert=require('assert');const r=require('./round-fixes.js');const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const has=(a,s)=>a&&a.statutes&&a.statutes.some(x=>x.title.includes(s));
// 借錢給理事長
{const a=A('協會的錢可以借給理事長嗎');assert(a.title.includes('不可以'));assert(has(a,'財務處理辦法第17條'));}
// 分支機構
{const a=A('協會可以設分支機構嗎');assert(a.title.includes('報主管機關核准'));assert(has(a,'人民團體法第6條'));}
// 監事會自行召開
{const a=A('監事會可以自己開會嗎不用經過理事長');assert(a.title.includes('不需要'));assert(has(a,'人民團體法第43條'));}
// 未開大會
{const a=A('協會年度沒有開會員大會會怎樣');assert(a.title.includes('行政處分'));assert(has(a,'人民團體法第58條'));}
// 理事長花錢權限
{const a=A('理事長可以自己決定花錢嗎');assert(a.title.includes('不能'));assert(has(a,'財務處理辦法第17條'));}
// 社區vs一般
{const a=A('社區發展協會跟一般協會有什麼不一樣');assert(a.title.includes('差別'));assert(a.summary.includes('社區發展工作綱要'));}
// 合作社解散財產
{const a=A('合作社解散後財產怎麼處理');assert(a.title.includes('清算人先收債'));assert(has(a,'合作社法第61條'));assert(!a.summary.includes('章程沒寫的依社員大會決議'));}
// 不該觸發
assert.equal(A('協會要辦改選'),null);
// 第9輪起由 coopCapital 回答
console.log('round 2026-11-09g: all cases passed');
