// 去識別回歸案例（2026-11-09 校正輪）。來源：人民團體法第25、29、43條、合作社法第8、9、45、55條（本站 data/statutes.json.gz，2026-11-05 核對）；社會處 6 項財務報表範本填寫說明。
const assert=require('assert');
const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{catalog:{folders:[{id:'改選',label:'改選'}],files:Array.from({length:23},(_,i)=>({f:'改選',name:'檔案'+i+'.docx'}))}});
// 1 協會理監事會頻率：社會團體六個月（第43條），不可答三個月
for(const q of['協會理事會多久要開一次','理監是會要多久開一次','社區發展協會監事會幾個月開一次']){const a=A(q);assert(a&&a.title.includes('六個月'),q);assert(a.statutes.some(s=>s.title.includes('第43條')),q);}
assert(A('公會理事會多久開一次').title.includes('三個月'));
assert(A('合作社理事會多久開一次').title.includes('三個月'));
{const a=A('理事會開會要幾天前通知');assert(a===null||a.title.includes('7 日'));}
// 2 視訊會議：須章程訂明（第25、29條）；合作社不臆測
{const a=A('理事會可以用視訊開嗎');assert(a.summary.startsWith('可以，但要先在章程裡訂明'));assert(a.statutes.some(s=>s.title.includes('第29條')));}
assert(A('合作社可以視訊開社員大會嗎').title.includes('無法確認'));
// 3 合作社最少人數：7人（合作社法第8條）
for(const q of['合作社成立最少幾個人','要幾人才能設立合作社'])assert(A(q).title.includes('7人'),q);
assert(A('合作社社員大會出席要多少人').title.includes('過半數'));// 第2輪起由社員大會出席規則回答，不可答成7人
// 4 財務報表：依官方範本
assert(A('資產負債表不平怎麼辦').summary.includes('兩方合計金額必須相同'));
assert(A('基金收支表沒有基金也要交嗎').summary.startsWith('要。'));
assert(A('預算表去年結餘可以算今年收入嗎').summary.includes('不可列入'));
assert(A('六項財務報表是哪六項').summary.includes('基金收支表'));
assert.equal(A('合作社資產負債表不平怎麼辦'),null);
// 5 書表下載：直接指出分類，不先講流程
{const a=A('改選要用的表在哪下載');assert(a.title.includes('改選'));assert(a.actions[0].view==='forms'&&a.actions[0].sub==='改選');}
assert(A('合作社的表格在哪下載').title.includes('沒有收錄'));
// 6 解散辦理：導向解散說明，不可答成改選
assert.equal(A('我要辦解散'),'KB:解散');
assert.equal(A('協會解散要多少人同意'),null);
// 7 錯字與追問
assert.equal(r.normalizeQuestion('協會改選要送什麼文鍵'),'協會改選要送什麼文件');
assert(r.withContext('那要準備什麼','協會要辦理解散').startsWith('協會要辦理解散'));
assert.equal(r.withContext('那要準備什麼',''),'那要準備什麼');
assert.equal(r.withContext('協會改選要準備什麼','協會要辦理解散'),'協會改選要準備什麼');
console.log('round 2026-11-09: all cases passed');
