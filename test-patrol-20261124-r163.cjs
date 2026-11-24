const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
let bad=0;
const pos=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&a.title||'';if(!t.includes(k)){bad++;console.log('✗',q,'=>',t||'(無)','期望',k)}});
const no=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&a.title||'';if(t.includes(k)){bad++;console.log('✗ 誤觸',q,'=>',t)}});
/* 第163輪（稅務、勸募與補助換問法） */
pos(['捐錢給協會可以扣稅嗎','民眾捐款給社團能不能減稅','捐款給社團可以省稅嗎','我捐錢給協會報稅時可以少繳稅嗎','捐贈協會可以退稅嗎','贊助協會的錢能不能扣稅','捐款給協會可以扣所得稅嗎','捐了錢給社團可以抵稅嗎'],'捐款能不能抵稅');
pos(['協會要申請統一編號嗎','協會沒有統一編號可以嗎','社團要不要統編','協會沒統編可以嗎','協會一定要申請統編嗎','協會需要申請統一編號嗎'],'協會立案後要自己向國稅局申請統一編號');
no(['統編要去哪辦','協會怎麼申請統一編號','統編怎麼申請'],'協會立案後要自己向國稅局申請統一編號');
no(['協會收到捐款要繳稅嗎','協會收到捐款要不要免稅'],'捐款能不能抵稅');
no(['合作社捐錢可以扣稅嗎'],'捐款能不能抵稅');
if(bad){console.log('失敗',bad);throw new Error('r163')}
console.log('r163 ok');
