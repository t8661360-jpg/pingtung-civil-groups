// 去識別回歸案例（2026-11-09 第4輪）：各月份理監事會財務審議。來源：社會團體財務處理辦法第11、12條；人民團體法第34條（本站 data/statutes.json.gz，2026-11-05 核對）。
const assert=require('assert');const r=require('./round-fixes.js');const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
{const a=A('9月召開理監事會，財務報表該審議甚麼？');assert(a.title.includes('半年度'));assert(a.summary.includes('上半年度'));}
{const a=A('2月召開理監事會，應該審議甚麼財報？');assert(a.title.includes('決算'));assert(a.summary.includes('收支決算表'));}
{const a=A('11月理事會要審什麼財務');assert(a.title.includes('工作計畫'));assert(a.summary.includes('預算'));}
{const a=A('5月理監事聯席會要討論什麼財務');assert(a.title.includes('是否已報送'));}
// boardQuorumGeneral now answers this (round 3)
assert.equal(A('9月要辦改選'),null);
console.log('round 2026-11-09d: all cases passed');
