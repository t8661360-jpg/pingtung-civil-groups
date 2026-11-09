// 去識別回歸案例（2026-11-09 第3輪）：理事出缺時的成會人數。來源：人民團體法第29、31條；人民團體會務輔導辦法第16條；人民團體選舉罷免辦法第17條（本站 data/statutes.json.gz，2026-11-05 核對）。
const assert=require('assert');const r=require('./round-fixes.js');const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
{const a=A('原定理事9人，當理事剩下7人時，召開理事會至少應有幾人出席才能成會？');assert(a.title.includes('至少要 4 人'));assert(a.summary.startsWith('至少要 4 人出席'));assert(a.summary.includes('5 人'));assert(a.summary.includes('不必補選'));}
{const a=A('理事原本十五人現在只剩九人，要幾人出席才能開會');assert(a.title.includes('至少要 5 人'));assert(a.summary.includes('不足章程名額'));}
{const a=A('監事3人剩2人，監事會要幾人出席');assert(a.title.includes('現任監事 2 人')&&a.title.includes('至少要 2 人'));}
assert(A('理事九人走了兩人，理事會要幾個人才能開').title.includes('現任理事 7 人'));
assert(A('理事會要幾人出席才能開會').title.includes('過半數'));
assert(A('理事會人數不足可以開嗎')===null||!A('理事會人數不足可以開嗎').title.includes('現任'));
console.log('round 2026-11-09c: all cases passed');
