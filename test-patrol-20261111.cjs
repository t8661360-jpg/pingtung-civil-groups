// 2026-11-11 每日巡檢：真正呼叫 verifiedRoundAnswer（含仲裁層），不只比對字串
const assert = require('node:assert/strict');
const rf = require('./round-fixes.js');
const ab = require('./answer-arbiter.js');
const qu = require('./question-understanding.js');
const ask = q => rf.verifiedRoundAnswer(rf.normalizeQuestion(q), {});
const judged = q => { const a = ask(q); const f = qu.resolve(q, {}); const c = [a && a.title ? a : null, f].filter(Boolean); if (!c.length) return null; const v = ab.judge(q, c, qu.understand(q)); return v.answer || null; };
let n = 0;
const hit = (q, re, pcode) => { const a = ask(q); assert.ok(a && a.title, 'no answer: ' + q); assert.match(a.title, re, q + ' => ' + a.title); if (pcode) assert.ok(a.statutes.some(s => s.source.includes(pcode)), q + ' lacks ' + pcode); const j = judged(q); assert.ok(j && j.title === a.title, 'arbiter rejected: ' + q); n++; };
const miss = (q, re) => { const a = ask(q); if (a && a.title && re) assert.doesNotMatch(a.title, re, q + ' wrongly => ' + a.title); if (!re) assert.equal(a, null, q + ' should be null, got ' + (a && a.title)); n++; };

// 1. 常務理事、常務監事名額（人民團體法第17條第2項：不得超過理事或監事總額三分之一）
hit('常務理事幾個人', /常務理事、常務監事名額/, 'D0050091');
hit('常務監事可以設幾人', /常務理事、常務監事名額/, 'D0050091');
hit('理事15人常務理事最多幾個', /三分之一/, 'D0050091');
assert.match(ask('常務理事幾個人').summary, /理事 15 人 → 常務理事最多 5 人/);
miss('候補理事幾個人', /常務理事、常務監事名額/);           // 候補名額另有規則
miss('常務理事幾個人才能開會', /常務理事、常務監事名額/);   // 出席門檻不在本則
miss('合作社常務理事幾人', /常務理事、常務監事名額/);       // 合作社無此制度
miss('常務理事可以連任嗎', /常務理事、常務監事名額/);

// 2. 理監事薪水（人民團體法第21條、社會團體財務處理辦法第19條；合作社：經費處理準則第11、12條、合作社法第23條）
hit('理監事可以領薪水嗎', /不能領薪水/, 'D0050091');
hit('理事長有薪水嗎', /不能領薪水/, 'D0050097');
hit('理監事可以領出席費嗎', /出席費或交通費/, 'D0050097');
hit('合作社理事可以領薪水嗎', /合作社理事、監事是無給職/, 'D0050114');
assert.ok(ask('合作社理事可以領薪水嗎').statutes.some(s => s.source.includes('D0050112')), 'coop salary lacks 合作社法§23');
miss('總幹事薪水多少', /不能領薪水/);         // 工作人員薪資是勞動關係
miss('理事長薪水要扣稅嗎', /不能領薪水/);     // 稅務導向國稅局
miss('理事可以兼任有薪的總幹事嗎', /不能領薪水/); // 兼任題交給 concurrent

// 3. 委託書張數（人民團體法第42條、第38條、合作社法第50條）
hit('委託書一個人可以拿幾張', /每位會員最多代理一人/, 'D0050091');
hit('會員大會委託書一人最多幾張', /每位會員最多代理一人/, 'D0050091');
hit('合作社委託書一個人幾張', /每位社員最多代理一人/, 'D0050112');
hit('公會委託書一個人可以拿幾張', /每位會員最多代理一人/, 'D0050091');
assert.ok(ask('公會委託書一個人可以拿幾張').statutes.some(s => s.title.includes('第38條')));
miss('委託出席比例多少', /每位會員最多代理一人/); // 比例題不在本則

console.log('patrol 2026-11-11 regression: ' + n + ' cases passed');
