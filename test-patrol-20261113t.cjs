const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const yes=[
['搬到別的縣市還是同一個協會嗎','第6條'],['會址可以搬到外縣市嗎','核准'],
['如果協會被廢止立案財產怎麼辦','不能分給會員'],['社團被撤銷後錢怎麼辦','第59條'],
['解散要開什麼會議才算數','會員（會員代表）大會'],['協會解散要開什麼會','三分之二'],
['解散要跟縣政府說嗎','30日內'],
['清算人怎麼報備','沒有明文'],['清算人要報縣府嗎','第27條'],
['協會解散後名稱可以給別人用嗎','第7條'],['解散後名字別人可以用嗎','沒有明文'],
['章程沒寫的事可以做嗎','第12條第5款'],['章程沒寫的活動可以辦嗎','第58條']];
const no=['合作社解散要開什麼會','合作社章程沒寫的事可以做嗎','章程一定要寫什麼','章程漏寫會員權利怎麼辦','協會解散後剩餘財產給誰','會址搬家要怎麼辦','協會搬到外縣市辦活動','解散了要多久內報備'];
const mine=/(會址想搬到別的縣市|協會被廢止許可或解散後的財產|解散要開會員|清算人要不要報備|解散後名稱能不能|章程沒寫的事能不能做)/;
let bad=0;
yes.forEach(([q,e])=>{const a=A(q);const x=a&&a.title?(a.title+a.summary):'';if(!x.includes(e)||!a.direct){bad++;console.log('✗',q,a&&a.title)}});
no.forEach(q=>{const a=A(q);if(a&&a.title&&mine.test(a.title)){bad++;console.log('✗誤觸',q,a.title)}});
console.log(bad?'失敗 '+bad:'全部通過');process.exit(bad?1:0);
