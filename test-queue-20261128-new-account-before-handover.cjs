const assert=require('node:assert/strict');
const r=require('./round-fixes.js');
const handover=require('./association-handover-refusal.js');
const route=handover.route||handover;
/* 佇列 #108：交接完成前新任理事長能不能先開新帳戶 → 查無依據，回固定用語，不硬配交接答案 */
const ask=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
for(const q of ['協會改選完舊的理監事還沒交接，新理事長可以先開戶嗎','還沒移交，新任理事長可以先去銀行開新帳戶嗎','社團換屆還沒交接完，會長能不能另開一個帳戶','前任理事長不交存摺，新的理事長可以自己開新帳戶嗎','改選後舊理事長還沒移交，協會可以先換帳戶嗎']){
 const a=ask(q);
 assert.match(a?.title??'',/難倒小屏/,q);
 assert.match(a.summary,/第18條/,q);
 assert.match(a.summary,/08-7320415/,q);
 assert.equal(typeof route==='function'?route(q):null,null,q);
}
/* 一般交接拒收題仍由交接答案處理 */
assert.match((typeof route==='function'?route('協會新任理事長不肯接，舊理事長的移交清冊要給誰'):null)?.title??'',/交接|清冊|監交/);
console.log('queue-20261128 new account before handover ok');
