const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const yes=[
['我想加入協會要怎麼做','先看它的章程'],['想入會要怎麼辦','先看它的章程'],
['入會申請書要寫什麼','沒有統一格式'],['入會申請書要填哪些','沒有統一格式'],
['退會要理事會同意嗎','沒有規定退會必須'],['退會要不要經過同意','沒有規定退會必須'],
['會員證要發嗎','沒有規定協會一定要發會員證'],['協會一定要發會員證嗎','沒有規定協會一定要發會員證'],
['退會跟除名差在哪','退會是會員自己決定'],['除名和退會有什麼不同','退會是會員自己決定']];
const no=['合作社社員退社要同意嗎','怎麼成立協會','入會要繳什麼','入會費要繳多少','公會可以不讓我入會嗎','加入協會要繳多少錢','除名要幾分之幾同意','會員除名可以申訴嗎','社區發展協會怎麼加入','退會可以退會費嗎'];
const mine=/(想加入協會：|入會申請書寫什麼|退會要不要經理事會|會員證要不要發|退會是會員自己提出)/;
let bad=0;
yes.forEach(([q,e])=>{const a=A(q);const x=a&&a.title?(a.title+a.summary):'';if(!x.includes(e)||!a.direct){bad++;console.log('✗',q,a&&a.title)}});
no.forEach(q=>{const a=A(q);if(a&&a.title&&mine.test(a.title)){bad++;console.log('✗誤觸',q,a.title)}});
console.log(bad?'失敗 '+bad:'全部通過');process.exit(bad?1:0);
