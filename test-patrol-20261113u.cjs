const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const yes=[
['協會的帳要怎麼記','第20條'],['年度預算什麼時候要通過','會計年度開始前'],
['監事可以查帳嗎','第22條'],['監事能不能查協會的帳','監事會'],
['會計一定要請專業的嗎','沒有規定'],['理事長可以自己管錢嗎','共同蓋章'],['會長一個人可以管錢嗎','共同蓋章'],
['協會的存款利息要不要入帳','不得匿報'],['利息算不算收入要入帳嗎','第20條'],
['沒開會員大會預算算不算數','追認'],['帳目有問題監事發現了怎麼辦','糾正意見'],['財報要幾份','沒有規定']];
const no=['合作社的帳要怎麼記','理事長借錢給協會','協會的錢可以放在個人帳戶嗎','忘記做決算怎麼辦','預算不夠用要怎麼辦','社區發展協會預算什麼時候通過','公會的會計一定要專業嗎','利息要不要報稅','協會解散要開什麼會','理事長可以借錢給會員嗎','監事不給查帳怎麼辦'];
const mine=/(協會的帳怎麼記|年度預算什麼時候編|監事可以查帳|監事發現帳目|會計一定要請專業|理事長不能一個人管錢|存款利息要入帳|沒開會員大會，預算|財報要送幾份)/;
let bad=0;
yes.forEach(([q,e])=>{const a=A(q);const x=a&&a.title?(a.title+a.summary):'';if(!x.includes(e)||!a.direct){bad++;console.log('✗',q,a&&a.title)}});
no.forEach(q=>{const a=A(q);if(a&&a.title&&mine.test(a.title)){bad++;console.log('✗誤觸',q,a.title)}});
console.log(bad?'失敗 '+bad:'全部通過');process.exit(bad?1:0);
