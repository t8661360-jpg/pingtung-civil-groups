const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
let bad=0;
const pos=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&a.title||'';if(!t.includes(k)){bad++;console.log('✗',q,'=>',t||'(無)','期望',k)}});
const neg=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&a.title||'';if(t.includes(k)){bad++;console.log('✗反',q,'=>',t)}});
/* 第229輪：會址與章程 */
pos(['地址換了','地址換了嗎'],'報縣府備查');
pos(['協會地址變了要通知嗎','會址變了要報備嗎'],'報縣府備查');
pos(['舊章程不符合新法怎麼辦','章程不合現行法規怎麼辦','修法後章程要改嗎','章程要是不符合法令'],'章程和法律規定不一樣');
pos(['章程可以隨便改嗎','章程改了要報縣府嗎'],'章程');
neg(['章程可以隨便改嗎'],'章程和法律規定不一樣');
neg(['我的住址換了','理事長地址換了怎麼辦'],'協會搬家');
pos(['章程幾年要檢查一次'],'章程要不要定期檢討');
if(bad){console.log('失敗',bad);process.exit(1)}console.log('r229 ok');
