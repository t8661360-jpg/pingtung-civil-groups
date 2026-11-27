/* 第242輪：解散與清算 */
const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
let bad=0;
const pos=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&a.title||'';if(!t.includes(k)){bad++;console.log('✗',q,'=>',t||'(無)','期望',k)}});
const neg=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&a.title||'';if(t.includes(k)){bad++;console.log('✗反',q,'=>',t)}});
pos(['解散後要辦清算嗎','協會解散要辦清算嗎','解散要清算嗎','解散之後要不要辦清算','解散了還要清算嗎','社團解散一定要清算嗎','解散後需要辦清算嗎'],'解散後要辦清算');
pos(['沒錢了可以直接不做嗎','沒錢了協會可以不要了嗎','協會沒經費了可以直接停掉嗎','沒人做了協會可以擺著嗎','協會沒錢了不想做了怎麼辦','經費用完了協會想結束可以嗎'],'協會沒錢了或不想辦了，不能直接不做');
pos(['社團沒有錢了可以直接關掉嗎'],'沒有錢也可以解散');
pos(['協會解散了發票統編怎麼辦','協會解散統一發票和統編怎麼辦','解散後發票購票證要怎麼處理'],'協會解散後的發票與營業稅稅籍');
neg(['協會沒有錢了怎麼辦','協會有錢可以分給會員嗎','協會沒有錢了','合作社沒錢了可以直接不做嗎'],'協會沒錢了或不想辦了');
neg(['協會沒有錢了怎麼辦'],'協會的結餘');
const st=JSON.parse(require('zlib').gunzipSync(require('fs').readFileSync(__dirname+'/data/statutes.json.gz')));
const P=st.laws.D0050091.articles,V=st.laws.G0340080.articles,M=st.laws.D0020094.articles;
[[59,'會員（會員代表）大會決議解散者'],[27,'五、團體之解散'],[58,'限期令其改善']].forEach(([n,k])=>{if(!P[n].includes(k)){bad++;console.log('✗人團§'+n,k)}});
if(!V[30].includes('十五日內')||!V[46].includes('一千五百元以上一萬五千元以下')){bad++;console.log('✗營業稅法')}
if(!M[27].includes('清算人無法產生時，由主管機關選任之')){bad++;console.log('✗輔導辦法§27')}
if(bad)throw new Error('r242 失敗 '+bad);
console.log('r242 ok');
