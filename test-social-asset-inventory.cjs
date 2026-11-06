const fs=require('fs'),vm=require('vm'),assert=require('assert');
const s=fs.readFileSync('counter-upgrade.js','utf8');
const f=s.slice(s.indexOf('function socialAssetInventoryAnswer('),s.indexOf('function exactArticleAnswer('));
const a=vm.runInNewContext(f+';socialAssetInventoryAnswer');
for(const x of ["\u5354\u6703\u8ca1\u7522\u76ee\u9304\u600e\u9ebc\u586b\uff1f","\u793e\u5340\u8ca1\u7522\u76ee\u9304\u586b\u5beb\u6b04\u4f4d"])assert(a(x));
for(const x of ["\u5408\u4f5c\u793e\u8ca1\u7522\u76ee\u9304\u600e\u9ebc\u586b\uff1f","\u5354\u6703\u8ca1\u7522\u76ee\u9304\u6298\u820a\u600e\u9ebc\u586b\uff1f","\u5354\u6703\u8ca1\u7522\u76ee\u9304\u6350\u8d08\u600e\u9ebc\u586b\uff1f","\u8ca1\u7522\u76ee\u9304\u600e\u9ebc\u586b\uff1f"])assert.equal(a(x),null);
const x=a("\u5354\u6703\u8ca1\u7522\u76ee\u9304\u600e\u9ebc\u586b\uff1f");assert(x.summary.includes("\u8ca1\u7522\u7de8\u865f"));assert(x.summary.includes("\u6298\u820a"));console.log('property form: 6 routing cases passed');