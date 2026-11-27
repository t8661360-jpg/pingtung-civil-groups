const assert=require('node:assert/strict');
const fs=require('node:fs');
for(const name of ['index.html','answer-guard.js']){
 const s=fs.readFileSync(name,'utf8');
 assert.ok(!s.includes('小屏已經把這個問題記下來'),name+' still makes unsupported delivery claim');
 assert.ok(!s.includes('下次您再問就有囉'),name+' still promises next-time answer');
 assert.ok(s.includes('目前無法確認答案，也不能保證何時能補上。'),name+' lacks truthful fallback');
 assert.ok(s.includes('請勿貼姓名、證號或完整公文'),name+' lacks display-only privacy guidance');
 assert.ok(s.includes('reportUnanswered(q)'),name+' change must not remove the existing workflow');
}
assert.match(fs.readFileSync('index.html','utf8'),/answer-guard\.js\?v=[^"]+-fallback1"/);
console.log('備援文案不承諾已記錄與下次必有答案');
