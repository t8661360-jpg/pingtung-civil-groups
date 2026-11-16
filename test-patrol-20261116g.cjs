const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
let bad=0;
const cases=[
 [['協會的財務報表一年要做幾次','財務報表要報給縣府嗎','財報一年要報幾次','決算報告每年要送縣府嗎'],/每年編一次/,/第11條/],
 [['誰來監督協會的錢','協會的帳誰在監督','協會的錢由誰稽核'],/誰來監督/,/第22條/],
 [['收支簿要怎麼記','帳本要怎麼記','帳簿如何登載'],/帳怎麼記/,/第4條/],
 [['經費不夠可以向會員追加收費嗎','錢不夠能向會員加收嗎','臨時加收會費可以嗎'],/要先經大會通過/,/第33條/],
];
for(const [qs,tt,ss] of cases)for(const q of qs){const x=A(q);if(!x||!x.direct||!tt.test(x.title)||!ss.test(x.summary)){console.error('FAIL',q,x&&x.title);bad++;}}
// 年度結餘分給會員：交給既有結餘答案
for(const q of ['年度結餘可以分給會員嗎','今年的盈餘可以發給理事嗎']){const x=A(q);if(!x||!/協會的結餘/.test(x.title)){console.error('FAIL',q,x&&x.title);bad++;}}
// 排除
for(const q of ['合作社的財務報表一年幾次','6項財務報表怎麼填','決算報告要經過監事會嗎','財務報表要蓋章嗎','合作社經費不夠向社員收錢','公會的錢誰監督','帳冊要保存幾年','補助款經費不夠要怎麼辦','預算上年度結餘']){const x=A(q);if(x&&/每年編一次|誰來監督|帳怎麼記|向會員加收/.test(x.title)){console.error('MISFIRE',q,x.title);bad++;}}
{const z=require('zlib'),fs=require('fs');const d=JSON.parse(z.gunzipSync(fs.readFileSync(__dirname+'/data/statutes.json.gz')));const F=d.laws.D0050097.articles,P=d.laws.D0050091.articles;
 if(!/三個月內/.test(F['11'])||!/日記簿/.test(F['4'])||!/監事會/.test(F['22'])||!/會員捐款/.test(P['33'])||!/標準及繳納方式/.test(F['14'])||!/曆年/.test(F['10'])){console.error('statute');bad++;}}
if(bad)throw new Error('patrol70 failed '+bad);console.log('ok');
