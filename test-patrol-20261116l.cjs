const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
let bad=0;
const cases=[
 [['解散要附什麼文件','協會解散要交給縣府哪些文件','解散報告表要附什麼'],/解散會員大會紀錄、5項財務報表、解散報告表/,/第12條/],
 [['解散登記要去哪裡辦','解散要去哪個單位辦'],/縣政府社會處/,/./],
 [['協會結束後帳本要留幾年','解散後帳簿要保存多久'],/帳冊要保存多久：本站查不到明文/,/./],
 [['協會倒了欠的錢誰還'],/債務誰負責：有法人登記的看民法第35條/,/./],
];
for(const [qs,tt,ss] of cases)for(const q of qs){const x=A(q);const all=x&&(x.title+x.summary+JSON.stringify(x.statutes||[]));if(!x||!tt.test(all)||!ss.test(all)){console.error('FAIL',q,x&&x.title);bad++;}}
for(const q of ['合作社解散要附什麼文件','解散要幾項財務報表','解散後立案證書要繳嗎','這次活動結束後帳本要留幾年','協會結束營業','解散大會紀錄多久內報']){const x=A(q);if(x&&/解散要送縣府的文件|帳冊要保存多久/.test(x.title)){console.error('MISFIRE',q,x.title);bad++;}}
if(bad)throw new Error('patrol75 failed '+bad);console.log('ok');
