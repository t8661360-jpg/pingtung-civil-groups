const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const yes=[
['社區發展協會一年要開幾次會','會員大會一年一次'],['社區發展協會每年要開哪些會','會員大會一年一次'],['社發協會要開什麼會','會員大會一年一次'],
['社區發展協會沒有會所怎麼辦','不行'],['社區發展協會沒有辦公室可以嗎','不行'],
['社區發展協會會員人數不夠怎麼辦','人數不夠'],['社發協會會員太少怎麼辦','人數不夠'],
['社區發展協會要設哪些工作會','沒有規定'],['社區發展協會要設工作組嗎','沒有規定'],
['社發協會理事要住在社區裡嗎','會員'],['社區發展協會幹部一定要設籍本村嗎','會員'],
['社區發展協會可以辦老人共餐嗎','章程'],['社區發展協會可以煮長輩午餐嗎','章程'],['社區發展協會能不能辦獨居長者送餐','章程'],
];
const no=['社區發展協會有補助嗎','社區發展協會評鑑是什麼','社區發展協會理事要幾人','社區發展協會大會一年開幾次','社區發展協會申請老人共餐補助','合作社一年要開幾次會','協會一年要開幾次會'];
let bad=0;
for(const [q,k] of yes){const x=A(q);if(!x||!x.direct||!(x.summary+x.title).includes(k)||x.category!=='社區發展協會'){console.error('FAIL',q,x&&x.title);bad++;}}
for(const q of no){const x=A(q);if(x&&typeof x==='object'&&x.category==='社區發展協會'&&/老人共餐嗎：要看章程|會員人數不夠|可以沒有會址|每年要開的會/.test(x.title)){console.error('OVERTRIGGER',q,x.title);bad++;}}
if(bad)throw new Error('patrol66 failed '+bad);console.log('ok');
