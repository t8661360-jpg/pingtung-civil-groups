/* 第254輪：入會與退會（「會員退出」＝退會口語、會員過世會籍給子女、退會後不能當理事） */
const r=require('./round-fixes.js');
const zlib=require('zlib'),fs=require('fs');
const st=JSON.parse(zlib.gunzipSync(fs.readFileSync('data/statutes.json.gz')));
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
let bad=0;
const pos=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&a.title||'';if(!t.includes(k)){bad++;console.log('✗',q,'=>',t||'(無)','期望',k)}});
pos(['會員退出以後還能當理事嗎','會員退出了還可以參選監事嗎','會友要退出了還能選理事嗎','會員已經退出可以當理事嗎','退會的人還能當理事嗎','已經退會可以參選理監事嗎','被除名的會員可以再當理事嗎','不是會員可以當理事嗎'],'退會後就不是會員');
pos(['會員死了會員資格可以給小孩嗎','會員過世會籍給兒子可以嗎','會員往生了會籍可以給女兒嗎'],'家屬不會自動取得會員資格');
pos(['會員過世子女可以接手會員嗎','會員過世了會籍可以繼承嗎','會員資格可以繼承嗎'],'子女可以繼承會籍');
pos(['會員資格可以讓給別人嗎','會員資格可不可以轉給朋友'],'會員資格可不可以轉讓');
pos(['被協會除名不服怎麼辦','被除名可以申訴嗎','會員被除名可以去哪裡告'],'被除名的會員可以申訴嗎');
/* 退出理事會、退出群組不是退會 */
const t=r.normalizeQuestion('會員退出理事會可以嗎');if(t.includes('退會')){bad++;console.log('✗ 退出理事會被換成退會',t)}
const L=st.laws;
const chk=(pc,n,s)=>{const a=L[pc]&&L[pc].articles[n];if(!a||!a.includes(s)){bad++;console.log('✗法條',pc,n,s)}};
chk('D0050091','15','死亡');chk('D0050091','17','會員');chk('D0050091','23','喪失會員（會員代表）資格');
if(bad){console.log('失敗',bad);throw new Error('r254')}console.log('r254 OK');
