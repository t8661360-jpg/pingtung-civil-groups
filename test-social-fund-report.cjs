const fs=require('fs'),vm=require('vm'),assert=require('assert');
const s=fs.readFileSync('counter-upgrade.js','utf8');
const f=s.slice(s.indexOf('function socialFundReportAnswer('),s.indexOf('function exactArticleAnswer('));
const a=vm.runInNewContext(f+';socialFundReportAnswer');
for(const x of ["\u5354\u6703\u6c92\u6709\u57fa\u91d1\u4e5f\u8981\u586b\u57fa\u91d1\u6536\u652f\u8868\u55ce\uff1f","\u793e\u5340\u6c92\u63d0\u5217\u57fa\u91d1\u6536\u652f\u8868\u8981\u5831\u55ce\uff1f"])assert(a(x));
for(const x of ["\u5408\u4f5c\u793e\u6c92\u6709\u57fa\u91d1\u4e5f\u8981\u586b\u57fa\u91d1\u6536\u652f\u8868\u55ce\uff1f","\u5354\u6703\u89e3\u6563\u6c92\u6709\u57fa\u91d1\u4e5f\u8981\u586b\u57fa\u91d1\u6536\u652f\u8868\u55ce\uff1f","\u6c92\u6709\u57fa\u91d1\u4e5f\u8981\u586b\u57fa\u91d1\u6536\u652f\u8868\u55ce\uff1f","\u5354\u6703\u57fa\u91d1\u6536\u652f\u8868\u600e\u9ebc\u586b\uff1f"])assert.equal(a(x),null);
const x=a("\u5354\u6703\u6c92\u6709\u57fa\u91d1\u4e5f\u8981\u586b\u57fa\u91d1\u6536\u652f\u8868\u55ce\uff1f");assert(x.summary.includes("300\u842c\u5143"));assert(x.summary.includes("\u627f\u8fa6\u4eba\u78ba\u8a8d"));console.log('fund report: 6 routing cases passed');