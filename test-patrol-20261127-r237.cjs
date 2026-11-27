/* 第237輪：解散與清算 */
const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
let bad=0;
const pos=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&a.title||'';if(!t.includes(k)){bad++;console.log('✗',q,'=>',t||'(無)','期望',k)}});
const neg=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&a.title||'';if(t.includes(k)){bad++;console.log('✗反',q,'=>',t)}});
pos(['解散後可以再成立同名的嗎','解散後同名的協會還能申請嗎','協會解散了名字還能用嗎','解散後想重新申請同樣名稱的協會'],'解散後名稱能不能給別人用');
pos(['清算人要不要立案','清算人要去登記嗎','清算人需不需要備案','清算人要領證書嗎','清算人要不要另外登記'],'清算人要不要立案');
neg(['誰來清算','清算人怎麼產生','清算人可以拿錢嗎'],'清算人要不要立案');
pos(['解散可以用通訊投票嗎','解散案能用郵寄投票嗎','解散決議可以用書面投票嗎'],'會議表決');
neg(['改選可以用通訊投票嗎','理事選舉可以郵寄投票嗎'],'會議表決');
pos(['解散大會出席人數不夠怎麼辦','解散大會人數不夠怎麼處理'],'人數不夠');
pos(['協會會員人數不足會被解散嗎'],'會員少到幾個人會被解散');
pos(['協會要停業一年可以嗎','協會休業半年行嗎','協會停業可以嗎'],'暫停運作');
neg(['商業公司停業要怎麼辦'],'暫停運作');
pos(['立案證書要繳回嗎','立案證要還給縣府嗎','立案證書要不要還給縣府'],'立案證書');
neg(['立案證書遺失要繳回嗎'],'解散後立案證書');
pos(['協會解散税要怎麼處理','解散要繳稅嗎','解散後稅要怎麼報'],'稅務');
/* 「不做了怎麼結束」轉寫成解散流程問句 */
['不做了怎麼結束','不辦了要怎麼收尾','做不下去了怎麼結束','協會不做了怎麼結束'].forEach(q=>{if(!/解散協會要做什麼/.test(r.normalizeQuestion(q))){bad++;console.log('✗正規化',q,r.normalizeQuestion(q))}});
['理事長不做了怎麼辦','會計不做了怎麼結束交接'].forEach(q=>{if(/解散協會要做什麼/.test(r.normalizeQuestion(q))){bad++;console.log('✗反正規化',q)}});
['協會想停辦要怎麼做','社團要停辦了'].forEach(q=>{if(!/解散協會要做什麼/.test(r.normalizeQuestion(q))){bad++;console.log('✗停辦',q)}});
if(r.normalizeQuestion('協會停辦一年可以嗎')!=='協會暫停運作可以不開會嗎'){bad++;console.log('✗停辦一年')}
if(r.normalizeQuestion('協會停辦活動怎麼辦')!=='協會停辦活動怎麼辦'){bad++;console.log('✗停辦活動不該轉寫')}
/* 原文核對 */
const st=JSON.parse(require('zlib').gunzipSync(require('fs').readFileSync(__dirname+'/data/statutes.json.gz')));
const M=st.laws.B0000001.articles;
[[37,'章程有特別規定'],[38,'選任清算人'],[42,'十五日內報告法院']].forEach(([n,k])=>{if(!String(M[n]).includes(k)){bad++;console.log('✗民法§'+n)}});
if(!st.laws.D0020094.articles[27].includes('清算人無法產生時，由主管機關選任'))bad++;
if(bad)throw new Error('r237 失敗 '+bad);
console.log('r237 ok');
