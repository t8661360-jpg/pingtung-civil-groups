/* 第240輪：志工 */
const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
let bad=0;
const pos=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&a.title||'';if(!t.includes(k)){bad++;console.log('✗',q,'=>',t||'(無)','期望',k)}});
const neg=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&a.title||'';if(t.includes(k)){bad++;console.log('✗反',q,'=>',t)}});
pos(['志願服務要向誰登記','沒有登記的志工可以服務嗎','志工要不要登記','志工需要向縣府登記嗎','志工沒登記可以嗎','志工要先登記才能做嗎','志工要去哪裡登記'],'志工要向誰登記');
neg(['志工時數要登記嗎','志工服務時數要怎麼登錄','志工簽到要登記嗎'],'志工要向誰登記');
pos(['志工要退場怎麼辦','志工想退場可以嗎','志工要離場怎麼辦'],'志工想退出可以嗎');
pos(['我們協會想招募志工要注意什麼','協會招募志工有什麼要做的','協會要召募志工流程是什麼','招募志工要先做什麼','我們要徵求志工需要準備什麼'],'招募志工要注意什麼');
neg(['協會招募志工要先備案嗎','招募志工要付錢嗎'],'招募志工要注意什麼');
pos(['榮譽卡可以免費進哪些地方','榮譽卡要幾小時才能申請','榮譽卡有什麼用'].map(q=>'志工'+q.replace(/^志工/,'')).slice(0,0),'x');
const N=r.normalizeQuestion;['榮譽卡可以免費進哪些地方','榮譽卡要幾小時才能申請','榮譽卡怎麼申請'].forEach(q=>{if(!/志願服務榮譽卡/.test(N(q))){bad++;console.log('✗榮譽卡',q,N(q))}});['銀行榮譽卡','會員榮譽卡怎麼辦'].forEach(q=>{if(/志願服務榮譽卡/.test(N(q))){bad++;console.log('✗反榮譽卡',q)}});
const st=JSON.parse(require('zlib').gunzipSync(require('fs').readFileSync(__dirname+'/data/statutes.json.gz')));
const V=st.laws.D0050131.articles;[[6,'公告'],[7,'備案'],[7,'不予經費補助'],[9,'基礎訓練'],[10,'安全及衛生'],[12,'服務紀錄冊'],[16,'意外事故保險']].forEach(([n,k])=>{if(!V[n].includes(k)){bad++;console.log('✗志服§'+n,k)}});
const C=st.laws.D0050132.articles;[[2,'服務紀錄冊'],[4,'全國資訊系統']].forEach(([n,k])=>{if(!C[n].includes(k)){bad++;console.log('✗辦法§'+n,k)}});
if(bad)throw new Error('r240 失敗 '+bad);
console.log('r240 ok');
