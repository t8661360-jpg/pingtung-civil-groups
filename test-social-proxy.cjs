const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const s = fs.readFileSync('counter-upgrade.js', 'utf8');
function load(name, next) {
  const i=s.indexOf('function '+name+'(');return vm.runInNewContext('(' + s.slice(i,s.indexOf('\nfunction ',i+10)).trim() + ')');
}
const social = load('socialProxyAnswer','proxyRatioAnswer');
assert.ok(social('\u5354\u6703\u6703\u54e1\u5927\u6703\u6211\u53ef\u4ee5\u63a5\u53d7\u5169\u500b\u4eba\u7684\u59d4\u8a17\u55ce'));
assert.equal(social('\u5354\u6703\u7406\u4e8b\u6703\u59d4\u8a17\u4ee3\u7406'), null);
assert.equal(social('\u5408\u4f5c\u793e\u793e\u54e1\u5927\u6703\u59d4\u8a17'), null);
assert.match(social('\u5354\u6703\u6703\u54e1\u5927\u6703\u59d4\u8a17').statutes[0].source,/D0050091/);
console.log('social proxy routing regression: 4 cases passed');
const ratio = load('proxyRatioAnswer','focusedQuestionAnswer');
assert.ok(ratio('\u4eba\u6c11\u5718\u9ad4\u59d4\u8a17\u4eba\u6578\u4e0d\u5f97\u8d85\u904e\u51fa\u5e2d\u4eba\u6578\u591a\u5c11'));
assert.ok(ratio('\u8077\u696d\u5718\u9ad4\u59d4\u8a17\u51fa\u5e2d\u6bd4\u4f8b\u4e0a\u9650'));
assert.ok(ratio('\u793e\u6703\u5718\u9ad4\u6703\u54e1\u5927\u6703\u59d4\u8a17\u4eba\u6578\u4e0a\u9650'));
assert.equal(ratio('\u5de5\u6703\u59d4\u8a17\u4eba\u6578\u6bd4\u4f8b'), null);
assert.equal(ratio('\u5408\u4f5c\u793e\u59d4\u8a17\u51fa\u5e2d\u4eba\u6578'), null);
console.log('proxy ratio routing regression: 5 cases passed');
