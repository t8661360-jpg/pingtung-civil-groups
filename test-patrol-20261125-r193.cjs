const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
let bad=0;
const pos=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&a.title||'';if(!t.includes(k)){bad++;console.log('✗',q,'=>',t||'(無)','期望',k)}});
/* 第193輪（稅務與財務：收據哪裡來） */
pos(['收據要跟縣府領嗎','收據本要向誰買','收據要蓋縣府的章嗎','收據是縣府發的嗎','協會收據要怎麼來','收據要買嗎','收據要去社會處拿嗎','收據可以自己印嗎'],'收據可以自己印');
pos(['收據弄丟了可以補嗎'],'收據用完或遺失');
if(bad){console.log('失敗',bad);process.exit(1)}console.log('r193 ok');
