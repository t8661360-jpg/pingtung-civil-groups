const fs=require('fs'),vm=require('vm'),assert=require('assert');
const s=fs.readFileSync('counter-upgrade.js','utf8');
const f=s.slice(s.indexOf('function socialCashReportAnswer('),s.indexOf('function exactArticleAnswer('));
const a=vm.runInNewContext(f+';socialCashReportAnswer');
for(const x of ["\u5354\u6703\u73fe\u91d1\u51fa\u7d0d\u8868\u600e\u9ebc\u586b\uff1f","\u793e\u5340\u73fe\u91d1\u51fa\u7d0d\u8868\u586b\u5beb\u6b04\u4f4d"])assert(a(x));
for(const x of ["\u5408\u4f5c\u793e\u73fe\u91d1\u51fa\u7d0d\u8868\u600e\u9ebc\u586b\uff1f","\u5354\u6703\u89e3\u6563\u73fe\u91d1\u51fa\u7d0d\u8868\u600e\u9ebc\u586b\uff1f","\u73fe\u91d1\u51fa\u7d0d\u8868\u600e\u9ebc\u586b\uff1f","\u5354\u6703\u8ca1\u7522\u76ee\u9304\u600e\u9ebc\u586b\uff1f"])assert.equal(a(x),null);
const x=a("\u5354\u6703\u73fe\u91d1\u51fa\u7d0d\u8868\u600e\u9ebc\u586b\uff1f");assert(x.summary.includes("\u6b0a\u8cac\u767c\u751f\u5236"));assert(x.summary.includes("\u4e0d\u80fd\u76f4\u63a5\u7576\u4f5c\u73fe\u91d1"));console.log('cash report: 6 routing cases passed');