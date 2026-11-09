// 第10輪。來源：人民團體法第20、27、30、32、33條；會務輔導辦法第12、18條；財務處理辦法第16、17、20條；選罷辦法第4、10條；合作社法第36、45、52、53條；合作社選罷辦法第29、31條。
const assert=require('assert');const r=require('./round-fixes.js');const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const has=(a,s)=>a&&a.statutes&&a.statutes.some(x=>x.title.includes(s));
assert(A('社區發展協會理事長可以連任幾次').title.startsWith('社區發展協會理事長'));
assert(has(A('監事會召集人不開會怎麼辦'),'人民團體法第30條'));
assert(A('選票怎樣算無效').title.includes('13 種'));
assert(A('合作社選舉廢票有哪些').title.includes('合作社'));
assert(A('會員大會紀錄多久要送').title.includes('30 日'));
assert(A('理監事會議記錄要報縣府嗎').title.includes('自行留存'));
assert(A('合作社理事會幾個人才能開').title.includes('過半數'));
assert(A('合作社結算後盈餘要繳稅嗎').title.includes('無法確認'));
assert(A('社區發展協會可以改名嗎').title.includes('修改章程'));
assert(A('社區協會要跟公所報什麼').title.includes('未能確認'));
assert(A('協會改地址要不要換證書').title.includes('請洽承辦'));
assert(A('理事長換人銀行要改嗎').title.startsWith('要'));
assert(A('社區發展協會可以辦活動收報名費嗎').title.includes('可以收'));
assert(A('我是新任理事長要做什麼').title.includes('15 日'));
assert(A(r.withContext('那要多久內完成','我是新任理事長要做什麼')).title.includes('15 日'));
assert(A('會員大會紀錄多久要送').summary.startsWith('會員（會員代表）大會紀錄應於閉會後三十日內'));
assert(A('理監事會議記錄要報縣府嗎').summary.startsWith('理監事會議紀錄不用每次都報縣府'));
for(const q of ['2月召開理監事會，應該審議甚麼財報？','11月理事會要審什麼財務']){const a=A(q);assert(!/20\d\d/.test(a.title+a.summary),q);}
console.log('round 2026-11-09j: all cases passed');
