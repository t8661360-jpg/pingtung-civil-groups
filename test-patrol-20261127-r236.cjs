const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
let bad=0;
const pos=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&a.title||'';if(!t.includes(k)){bad++;console.log('✗',q,'=>',t||'(無)','期望',k)}});
const neg=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&a.title||'';if(t.includes(k)){bad++;console.log('✗反',q,'=>',t)}});
/* 第236輪：財務與會計 */
pos(['今年沒有編預算可以嗎','可以不編預算嗎','我們協會沒做預算書可以嗎','協會不編預算行嗎','沒有訂預算要不要緊'],'沒有編預算可以嗎');
pos(['收入跟支出要分科目嗎','帳要不要分科目','支出一定要分科目記帳嗎','會計科目一定要有嗎','收支科目要分嗎'],'要不要分科目');
pos(['年度預算沒有開大會通過可以先花錢嗎','預算還沒開會員大會通過，錢可以先用嗎','預算沒開大會通過就支出可以嗎','預算還沒通過可以先花嗎'],'預算');
neg(['預算沒開大會通過就支出可以嗎','預算還沒開會員大會通過，錢可以先用嗎'],'預算和決算都要提會員大會通過');
pos(['預算裡沒有編這筆可以花嗎','預算外的支出可以嗎'],'預算不夠或超支');
neg(['今年沒有編預算可以嗎'],'預算不夠或超支');
pos(['預算要誰通過','預算要經過大會通過嗎'],'預算');
/* 原文核對 */
const st=JSON.parse(require('zlib').gunzipSync(require('fs').readFileSync(__dirname+'/data/statutes.json.gz')));
const F=st.laws.D0050097.articles;
[[5,'資產、負債、基金暨餘絀、收入及支出'],[9,'收入傳票'],[11,'會計年度開始前'],[11,'事後提報大會追認'],[12,'收支決算表']].forEach(([n,k])=>{if(!String(F[n]).includes(k)){bad++;console.log('✗原文',n,k)}});
if(!st.laws.D0050091.articles[34].includes('每年編造預算')){bad++;console.log('✗§34')}
if(bad)throw new Error('r236 失敗 '+bad);
console.log('r236 ok');
