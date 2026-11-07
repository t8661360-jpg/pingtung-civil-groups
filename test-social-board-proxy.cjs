const fs=require('fs'),vm=require('vm'),assert=require('assert');
const s=fs.readFileSync('counter-upgrade.js','utf8');
const f=s.slice(s.indexOf('function socialBoardProxyAnswer('),s.indexOf('function exactArticleAnswer('));
const a=vm.runInNewContext(f+';socialBoardProxyAnswer');
for(const q of ["\u793e\u5340\u767c\u5c55\u5354\u6703\u7406\u4e8b\u6703\u53ef\u4ee5\u59d4\u8a17\u5225\u4eba\u51fa\u5e2d\u55ce\uff1f","\u5354\u6703\u76e3\u4e8b\u6703\u53ef\u4ee5\u4ee3\u7406\u51fa\u5e2d\u55ce","\u4eba\u6c11\u5718\u9ad4\u7406\u76e3\u4e8b\u6703\u53ef\u4ee5\u59d4\u8a17\u55ce"]){const x=a(q);assert(x&&x.summary.includes("\u4e0d\u80fd\u59d4\u8a17"));}
for(const q of ["\u5408\u4f5c\u793e\u7406\u4e8b\u6703\u59d4\u8a17\u4ee3\u7406","\u5354\u6703\u6703\u54e1\u5927\u6703\u59d4\u8a17\u51fa\u5e2d","\u5354\u6703\u7406\u4e8b\u6703\u591a\u4e45\u958b\u4e00\u6b21","\u5de5\u6703\u7406\u4e8b\u6703\u59d4\u8a17\u4ee3\u7406"])assert.equal(a(q),null);
console.log('board meeting proxy: 7 cases passed');
