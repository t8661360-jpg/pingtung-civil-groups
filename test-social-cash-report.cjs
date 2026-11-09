const fs=require('fs'),vm=require('vm'),assert=require('assert');
const s=fs.readFileSync('counter-upgrade.js','utf8');
const f=s.slice(s.indexOf('function socialCashReportAnswer('),s.indexOf('function exactArticleAnswer('));
const a=vm.runInNewContext(f+';socialCashReportAnswer');
for(const x of ["\u5354\u6703\u73fe\u91d1\u51fa\u7d0d\u8868\u600e\u9ebc\u586b\uff1f","\u793e\u5340\u73fe\u91d1\u51fa\u7d0d\u8868\u586b\u5beb\u6b04\u4f4d"])assert(a(x));
for(const x of ["\u5408\u4f5c\u793e\u73fe\u91d1\u51fa\u7d0d\u8868\u600e\u9ebc\u586b\uff1f","\u5354\u6703\u89e3\u6563\u73fe\u91d1\u51fa\u7d0d\u8868\u600e\u9ebc\u586b\uff1f","\u5354\u6703\u8ca1\u7522\u76ee\u9304\u600e\u9ebc\u586b\uff1f"])assert.equal(a(x),null);
const x=a("\u5354\u6703\u73fe\u91d1\u51fa\u7d0d\u8868\u600e\u9ebc\u586b\uff1f");assert(x.summary.includes("\u6b0a\u8cac\u767c\u751f\u5236"));assert(x.summary.includes("\u4e0d\u80fd\u76f4\u63a5\u7576\u4f5c\u73fe\u91d1"));console.log('cash report: 6 routing cases passed');for(const x of ["社區發展協會的現金出納表期末結餘怎麼算？","協會現金出納表結存如何計算？","社會團體現金出納表餘額怎樣算"]){const r=a(x);assert(r && r.summary.includes("期初結存＋本期實際收入－本期實際支出"));}
for(const x of ["合作社現金出納表期末結餘怎麼算","協會解散現金出納表結餘怎麼算"])assert.equal(a(x),null);
console.log('cash balance routing: 6 cases passed');

// 未指明團體類型時，回答須明示以協會為範圍並提醒合作社另確認（2026-11-09 更新）
{const u=a('現金出納表怎麼填？');assert(u&&u.title.includes('協會')&&u.summary.includes('合作社'));}
console.log('cash report untyped scope: passed');
