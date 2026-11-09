const assert=require('assert');const r=require('./round-fixes.js');const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const has=(a,s)=>a&&a.statutes&&a.statutes.some(x=>x.title.includes(s));
// 章程修改
{const a=A('協會章程要怎麼修改');assert(a.title.includes('三分之二'));assert(has(a,'人民團體法第27條'));}
assert(A('公會章程怎麼變更').title.includes('三分之二'));
// 合作社監事查帳
{const a=A('合作社監事可以看帳嗎');assert(a.title.includes('法定職權'));assert(has(a,'合作社法第57條'));}
// 公益勸募
{const a=A('社區發展協會可以申請公益勸募嗎');assert(a.title.includes('公益勸募'));assert(a.summary.includes('法人登記'));}
assert(A('合作社可以勸募嗎').title.includes('無法確認'));
// 決議被撤銷
{const a=A('理事會決議被撤銷怎麼辦');assert(a.title.includes('撤銷'));assert(has(a,'人民團體法第58條'));}
// 不該觸發的
assert.equal(A('章程要怎麼填'),null);
// concurrent() handles this (round 5)
console.log('round 2026-11-09f: all cases passed');
