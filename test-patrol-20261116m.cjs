const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
let bad=0;
const cases=[
 [['沒有住在屏東可以入會嗎','我住高雄能加入屏東的協會嗎','不是屏東人可以當會員嗎'],/外縣市或外國籍的人能不能入會/],
 [['會員資格要審查多久','入會申請審核要多久'],/入會審查要多久/],
 [['會員被除名前要給他說明的機會嗎','除名前要不要讓他申辯'],/除名前要不要給會員說明的機會/],
 [['會員不想繳會費可以直接退會嗎','我不想繳會費了可以退會嗎'],/不想繳會費想退會/],
 [['入會的人太少想收會員怎麼收','要怎麼招募新會員'],/想多招募會員/],
];
for(const [qs,tt] of cases)for(const q of qs){const x=A(q);if(!x||!tt.test(x.title)){console.error('FAIL',q,x&&x.title);bad++;}}
for(const q of ['會員人數不夠怎麼辦','被除名的會員不服怎麼辦','合作社社員不想繳股金可以退社嗎','送件後多久會審查完','退會要怎麼退','社區發展協會會員太少怎麼辦','理事被除名要說明嗎']){const x=A(q);if(x&&/入會審查要多久|除名前要不要給|不想繳會費想退會|想多招募會員/.test(x.title)){console.error('MISFIRE',q,x.title);bad++;}}
if(bad)throw new Error('patrol76 failed '+bad);console.log('ok');
