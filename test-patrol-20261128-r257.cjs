/* 第257輪：入會退會（家人代替當會員、退會與理事資格） */
const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
let bad=0;
const pos=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&a.title||'';if(!t.includes(k)){bad++;console.log('✗',q,'=>',t||'(無)','期望',k)}});
pos(['會員可以讓家人代替他當會員嗎','我可以叫我兒子代替我當會員嗎','會員可以找人代替他當會員嗎','我不當了讓我太太接替我的會員可以嗎','能不能由家人代替會員參加協會'],'會員資格可不可以轉讓');
pos(['會員退會算不算喪失理事資格'],'退會後就不是會員');
pos(['理事退會了還是理事嗎','監事退會算不算喪失監事資格','理事不是會員了還能當嗎','退會之後理事職務還在嗎'],'會員資格');
pos(['會員可以請人代替出席開會嗎','會員大會不能出席可以找人代理嗎'],'會員大會');
pos(['理事請假可以找人代理嗎'],'不能找人代打');
if(bad){console.log('失敗',bad);throw new Error('r257')}console.log('r257 OK');
