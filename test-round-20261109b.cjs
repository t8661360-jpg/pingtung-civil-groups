// 去識別回歸案例（2026-11-09 第2輪）。來源：本站 data/statutes.json.gz（全國法規資料庫，2026-11-05 核對）人民團體法第31、33、38、42條；合作社法第40、48、50、55條；社會團體財務處理辦法第11、14、17、21、22條；屏東縣社會團體章程草案範例第22條；社會處6項財務報表範本核章欄。
const assert=require('assert');const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const has=(a,s)=>a&&a.statutes&&a.statutes.some(x=>x.title.includes(s));
// 會費
{const a=A('社區協會可以收會費嗎');assert(a&&a.summary.startsWith('可以'));assert(has(a,'人民團體法第33條'));}
assert.equal(A('會員退會可以退會費嗎'),null);
// 合作社社員大會出席
{const a=A('合作社社員大會要多少人出席');assert(a.title.includes('過半數'));assert(has(a,'合作社法第48條'));}
// 委託人數
{const a=A('協會會員可以委託幾個人');assert(a.summary.startsWith('每位會員'));assert(has(a,'第42條'));}
assert(A('公會會員大會委託最多幾個').summary.includes('三分之一'));
assert(A('合作社社員可以代理幾個人').summary.includes('不得代理二人以上'));
assert(A('理事會可以委託幾個人代理').title.includes('不能委託'));
// 兼任
assert(A('理事可以兼總幹事嗎').summary.includes('不得由理事、監事擔任'));
assert(A('合作社監事可以兼任理事嗎').summary.startsWith('不可以'));
assert(A('監事可以兼任理事嗎').title.includes('無法確認'));
// 帳目被質疑
{const a=A('我們協會的帳被質疑怎麼辦');assert(a&&has(a,'第22條'));}
// 財務報告期限：現行辦法第11條三個月內
{const a=A('決算什麼時候要送縣府');assert(a.title.includes('三個月內'));assert(has(a,'財務處理辦法第11條'));}
// 核章與解散報表
assert(A('決算表要誰蓋章').summary.includes('製表、會計、總幹事、理事長'));
assert(A('解散的報表要填幾項').title.includes('5 項'));
assert(A(r.withContext('那要誰簽名','解散的報表要填幾項')).title.includes('蓋章'));
assert(A('協會要報哪些財務報表').title.includes('哪 6 項'));
// 理事長不開會（人民團體法第25、30、32條；會務輔導辦法第13條）
{const a=A('理事長不開會怎麼辦');assert(a.title.includes('15日'));assert(has(a,'會務輔導辦法第13條')&&has(a,'人民團體法第30條'));}
assert(A('理事長一直不召開會員大會').title.includes('五分之一'));
// chairResign now handles coop cases, tested in round e
console.log('round 2026-11-09b: all cases passed');
