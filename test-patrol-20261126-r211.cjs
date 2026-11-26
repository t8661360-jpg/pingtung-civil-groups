const fs=require('fs');
const h=fs.readFileSync(__dirname+'/index.html','utf8');
let bad=0;
const must=(s,m)=>{if(!s.includes(m)){bad++;console.log('✗ 缺',m)}};
/* 第211輪：會址怎麼變更不可只寫「不用開會員大會」，須補章程寫完整門牌時要修改章程 */
must(h,'單純換地址不用開會員大會；但章程條文如果寫的是完整門牌地址，就要走修改章程的程序');
if(h.includes('報縣府備查（人民團體會務輔導辦法第8條），不用開會員大會。')){bad++;console.log('✗ 舊矛盾文字仍在')}
const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
for(const q of ['換辦公室地址要改章程嗎','會址搬家要報嗎','會址變更要多久內報']){const a=A(q);if(!a){bad++;console.log('✗ 無答案',q)}}
if(bad){console.log('失敗',bad);process.exit(1)}console.log('r211 OK');
