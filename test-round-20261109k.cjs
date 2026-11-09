// 第11輪新規則測試
const assert=require('assert');const r=require('./round-fixes.js');const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
assert(A('協會監事可以同時當理事嗎').title.includes('無法確認'));
assert(A('改選結束要多久內報縣府').title.includes('30 日'));
assert(A('理事長可以簽支票嗎').title.includes('簽署'));
assert(A('會費可以分好幾期繳嗎').summary.includes('法律沒有禁止'));
assert(A('會員不繳會費要怎麼辦').title.includes('除名'));
assert(A('章程寫三個月改選，還是三個月內').title.includes('三個月內'));
assert(A('改選的人選要不要公告').summary.includes('沒有強制'));
assert(A('有人反對改選決議可以抗議嗎').summary.includes('當場'));
console.log('✓ round 2026-11-09k: 8 new rules passed');
