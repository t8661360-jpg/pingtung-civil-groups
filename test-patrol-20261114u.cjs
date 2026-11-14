const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const yes=[
['搬家要多久內報縣府','沒有寫報備的期限'],['會址變更要在幾天內報縣府','沒有寫報備的期限'],
['換地址要不要改章程','完整門牌'],['搬家一定要改章程嗎','完整門牌'],
['章程可以自己亂寫嗎','一定要寫的事項'],['章程能隨便寫嗎','一定要寫的事項'],
['章程忘了放任期怎麼辦','提案補'],['章程沒寫任期要怎麼處理','提案補'],
['章程可以把理事長任期改成不限次數嗎','不可以'],['章程能不能寫會長可以一直連任','不可以'],
['沒有辦公室可以登記嗎','沒有規定一定要有辦公室'],['沒有會址可以申請成立協會嗎','沒有規定一定要有辦公室'],
['章程可以規定會員要多少人才能開會嗎','過半數出席'],
];
const no=['合作社章程可以自己亂寫嗎','社區發展協會沒有辦公室可以登記嗎','解散時章程要怎麼處理','協會章程怎麼修改','理事長可以連任幾次'];
let bad=0;
for(const [q,k] of yes){const x=A(q);if(!x||!x.direct||!(x.summary+x.title).includes(k)){console.error('FAIL',q,x&&x.title);bad++;}}
for(const q of no){const x=A(q);if(x&&/會址搬家要多久|換地址要不要改章程|章程不能想怎麼寫|章程漏寫|不限次數連任|沒有辦公室也可以|會員大會開會人數/.test(x.title)){console.error('OVERTRIGGER',q,x.title);bad++;}}
if(bad)throw new Error('patrol54 failed '+bad);console.log('ok');
