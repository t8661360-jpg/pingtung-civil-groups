const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const yes=[['獅子會算不算人民團體','適用人民團體法'],['國際性社團跟一般協會有什麼不同','任期起算日'],['國際性社團的會員可以是外國人嗎','沒有限制外國人入會'],['國際性社團可以收國外的捐款嗎','政治團體'],['國際團體的分會要不要自己立案','設分支機構'],['國外總會要不要同意才能設分會','設分支機構'],['同濟會要怎麼成立','30人以上'],['國際性社團發起人要幾個人','30人以上'],['國際性社團年會可以在國外開嗎','選舉或罷免'],['國際性社團要不要每年報縣府','30日內'],['國際性社團名稱可以用英文嗎','名稱'],['國際性社團的章程誰核准','三分之二'],['國際性社團解散怎麼辦','三分之二'],['國際性社團理監事要選幾個人','不得逾15人'],['社團想加入國際組織可以嗎','沒有規定社團加入國際組織'],['國際性社團可以辦出國活動嗎','不得在國外']];
const no=['協會可以收國外的捐款嗎','合作社可以加入國際組織嗎','社區發展協會的理事要幾個人','協會名稱可以用英文嗎','工會解散怎麼辦','獅子會會員是不是要繳稅','協會章程怎麼改'];
let bad=0;
for(const [q,k] of yes){const x=A(q);if(!x||!x.direct||!(x.summary+x.title).includes(k)){console.error('FAIL',q,x&&x.title);bad++;}}
for(const q of no){const x=A(q);if(x&&/國際性/.test(x.title)&&!/國際/.test(q)){console.error('MISFIRE',q,x.title);bad++;}if(x&&/國際性社團/.test(x.title)&&/合作社|社區發展|工會/.test(q)){console.error('MISFIRE2',q,x.title);bad++;}}
if(bad)throw new Error('patrol45 failed '+bad);console.log('ok');
