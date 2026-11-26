const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
let bad=0;
const pos=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&(a.title+a.summary)||'';if(!t.includes(k)){bad++;console.log('✗',q,'=>',a&&a.title||'(無)','期望',k)}});
const neg=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&(a.title+a.summary)||'';if(t.includes(k)){bad++;console.log('✗不應命中',q,'=>',a.title)}});
/* 第206輪（解散、會址、章程） */
pos(['搬去高雄要怎麼辦','搬到外縣市怎麼辦','搬到台北可以嗎','遷到外縣市要怎麼辦','協會遷出屏東縣要怎麼辦','會址遷出屏東縣','會址搬出本縣怎麼辦'],'人民團體法第6條');
pos(['章程通過後要交給誰','章程修好了要送給誰','章程改好了要送去哪','修改完的章程要報給誰','章程修正好要交給誰'],'核備');
pos(['剩餘財產可以捐給別的協會嗎','剩餘財產可以轉給其他團體嗎','剩餘財產能捐給慈善機構嗎'],'章程');
pos(['理監事都跑光了怎麼解散','理事跟監事都走光了協會要怎麼收掉','幹部全部辭職了想解散怎麼辦','理監事都不幹了怎麼結束協會'],'理事已經一個都不剩');
neg(['理事長搬去高雄了會址要跟著搬嗎'],'理事已經一個都不剩');
neg(['協會捐款給別的協會可以嗎'],'解散');
neg(['理監事都跑光了怎麼辦'],'理事已經一個都不剩');
neg(['理事長失聯了協會怎麼解散'],'理事已經一個都不剩');
if(bad){console.log('失敗',bad);process.exit(1)}console.log('r206 OK');
pos(['修改章程增加了理監事名額，是直接辦補選嗎？','章程修改後增加理事名額要補選嗎','修章增加監事名額怎麼辦','修改章程加了理監事名額要怎麼產生','章程改了多了幾個理事名額要選舉嗎'],'先由候補理事');
neg(['章程修改了理監事的任期，從哪一屆開始適用？','理事出缺怎麼補'],'增加的名額');
if(bad){console.log('失敗',bad);process.exit(1)}console.log('r206b OK');
