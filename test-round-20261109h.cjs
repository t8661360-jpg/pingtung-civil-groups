const assert=require('assert');const r=require('./round-fixes.js');const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const has=(a,s)=>a&&a.statutes&&a.statutes.some(x=>x.title.includes(s));
// 線上投票
{const a=A('會員大會可以線上投票嗎');assert(a.title.includes('沒有開放'));}
assert(A('合作社可以電子投票嗎').title.includes('章程規定'));
// 通訊選舉
{const a=A('理監事改選可以用通訊投票嗎');assert(a.title.includes('章程訂定'));assert(has(a,'選舉罷免辦法第23條'));}
assert(A('合作社通訊投票怎麼辦').title.includes('章程規定'));
// 捐款
{const a=A('社區發展協會可以收捐款嗎');assert(a.title.includes('正式收據'));assert(has(a,'人民團體法第33條'));}
// 聘僱
{const a=A('協會可以雇員工嗎，要保勞健保嗎');assert(a.title.includes('勞健保'));assert(has(a,'人民團體法第24條'));}
assert.equal(A('協會要辦改選'),null);
console.log('round 2026-11-09h: all cases passed');
