const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const s = fs.readFileSync('counter-upgrade.js', 'utf8');
function load(name, next) {
  return vm.runInNewContext('(' + s.slice(s.indexOf('function '+name+'('),s.indexOf('function '+next+'(')).trim() + ')');
}
const social = load('socialProxyAnswer','focusedQuestionAnswer');
assert.ok(social('\u5354\u6703\u6703\u54e1\u5927\u6703\u6211\u53ef\u4ee5\u63a5\u53d7\u5169\u500b\u4eba\u7684\u59d4\u8a17\u55ce'));
assert.equal(social('\u5354\u6703\u7406\u4e8b\u6703\u59d4\u8a17\u4ee3\u7406'), null);
assert.equal(social('\u5408\u4f5c\u793e\u793e\u54e1\u5927\u6703\u59d4\u8a17'), null);
assert.match(social('\u5354\u6703\u6703\u54e1\u5927\u6703\u59d4\u8a17').statutes[0].source,/D0050091/);
console.log('social proxy routing regression: 4 cases passed');
