const assert=require('node:assert/strict');
const {normalizeQuestion,verifiedRoundAnswer}=require('./round-fixes.js');
const ask=q=>verifiedRoundAnswer(normalizeQuestion(q));
/* 佇列 #53：大小章不見了 → 圖記遺失（人民團體法第10條第2項） */
for(const q of ['我們協會的大小章都不見了怎麼辦才好','協會大小章遺失','公章弄丟了怎麼辦','協會的關防不見了要怎麼處理','大章壞掉了怎麼辦','協會圖記找不到了','協會的圖記被偷了']){
 const a=ask(q);assert.match(a?.title??'',/圖記遺失、損壞或要換新/,q);
 assert.match(a.summary,/人民團體法第10條第2項/,q);
}
assert.match(ask('協會解散後大小章怎麼處理')?.title??'',/解散後/);
assert.match(ask('前任理事長不交大小章')?.title??'',/不移交/);
assert.doesNotMatch(ask('大小章要誰保管')?.title??'',/圖記遺失/);
/* 佇列 #58：學校家長會不是人民團體（國民教育法第48條第2項） */
for(const q of ['家長會長改選要報縣府嗎','國小家長會改選要報社會處嗎','家長會要不要立案','學校家長會長任期多久','家長會成立要找誰','家長會長要怎麼選']){
 const a=ask(q);assert.match(a?.title??'',/學校家長會不是向社會處立案的協會/,q);
 assert.match(a.summary,/國民教育法第48條第2項/,q);
 assert.match(a.summary,/08-7320415/,q);
}
for(const q of ['家長協會改選要報縣府嗎','家長會長可以當協會理事長嗎','會長改選要報縣府嗎','社區發展協會理事長改選要報縣府嗎'])
 assert.doesNotMatch(ask(q)?.title??'',/學校家長會/,q);
console.log('queue-20261127 seal/parent ok');
