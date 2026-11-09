// 去識別回歸案例（2026-11-09 第12輪）
const assert=require('assert');
const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const has=(a,s)=>a&&a.statutes&&a.statutes.some(x=>x.title.includes(s));

// 1 理事長無故缺席
{const a=A('理事長無故缺席理事會會怎樣');assert(a&&a.title.includes('應解除職務'),a?a.title:'null');assert(has(a,'第30條'));}

// 2 廣告費記帳
{const a=A('廣告費收了要怎麼記帳');assert(a&&a.title.includes('決算'),a?a.title:'null');assert(has(a,'第33條')||has(a,'財務'));}

// 3 帳務保存期限
{const a=A('帳務報表要保存多久');assert(a&&a.title.includes('10年'),a?a.title:'null');assert(has(a,'第19條')||has(a,'會計'));}

// 4 總幹事銀行資料
{const a=A('總幹事要帶什麼資料去銀行');assert(a&&a.title.includes('身分證'),a?a.title:'null');assert(has(a,'第17條')||has(a,'財務'));}

// 5 會員簽到期限（含上下文）
{const a=r.verifiedRoundAnswer(r.normalizeQuestion(r.withContext('那要簽多久','會員大會要簽到嗎')),{});assert(a&&a.title.includes('章程'),a?a.title:'null');assert(has(a,'第25條')||has(a,'第12條'));}

// 6 改選前理監事會
{const a=A('改選前一個月是一定要開選前理監事會嗎');assert(a&&a.title.includes('不是'),a?a.title:'null');assert(has(a,'第25條')||has(a,'第43條'));}

// 7 監事會主席選舉
{const a=A('監事會主席怎麼選');assert(a&&a.title.includes('選舉'),a?a.title:'null');assert(has(a,'第43條')||has(a,'第29條'));}

// 8 改選日期計算
{const a=A('改選那一天才能算新的一屆嗎');assert(a&&a.title.includes('閉會'),a?a.title:'null');assert(has(a,'第19條')||has(a,'第12條'));}

// 9 政治獻金
{const a=A('協會可以接受政治獻金嗎');assert(a&&a.title.includes('不得'),a?a.title:'null');assert(has(a,'第33條'));}

console.log('✓ 第12輪測試全部通過');
