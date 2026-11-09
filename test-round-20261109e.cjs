const assert=require('assert');const r=require('./round-fixes.js');const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const has=(a,s)=>a&&a.statutes&&a.statutes.some(x=>x.title.includes(s));
{const a=A('理事長請辭要怎麼辦');assert(a.title.includes('書面'));assert(has(a,'選舉罷免辦法第27條'));}
assert(A('合作社理事主席辭職怎麼辦').title.includes('辭職'));
{const a=A('會員被除名可以申訴嗎');assert(a.title.includes('三分之二'));assert(has(a,'人民團體法第14條'));}
assert(A('合作社社員被除名怎麼辦').title.includes('社務會'));
{const a=A('協會的印鑑要怎麼變更');assert(a.title.includes('圖記'));assert(has(a,'人民團體法第10條'));}
{const a=A('改選完理事長沒有移交怎麼辦');assert(a.title.includes('15日'));assert(has(a,'會務輔導辦法第18條'));}
assert(A('社區發展協會解散後財產歸誰').title.includes('歸屬'));
assert.equal(A('協會要辦改選'),null);
// chairNoMeeting handles this (round 3)
console.log('round 2026-11-09e: all cases passed');
