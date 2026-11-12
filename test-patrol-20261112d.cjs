const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const yes=[
 ['清算人是誰','理事長擔任'],['誰來當清算人','理事長擔任'],['協會解散多久內要辦清算','查不到明定期限'],
 ['我們協會不想辦了可以解散嗎','可以。'],['協會想結束營業怎麼辦','__skip'],
 ['搬到外縣市還是屏東縣的協會嗎','核准'],['協會會址想搬到高雄可以嗎','核准'],
 ['章程修改要多久送','30日'],['沒開會員大會就改章程可以嗎','不可以'],
 ['章程忘記寫會費怎麼辦','修改章程補上'],['章程跟法律衝突怎麼辦','修改'],
 ['解散了印章怎麼辦','沒有查到明文'],['解散後證書要繳回嗎','沒有查到明文'],
];
const no=['合作社清算人是誰','合作社不想辦了可以解散嗎','工會章程跟法律衝突怎麼辦','合作社章程修改要多久送','協會怎麼解散','解散要幾個人同意','會址變更要多久內報','公會會址搬到高雄'];
let bad=0;
yes.forEach(([q,e])=>{if(e==='__skip')return;const a=A(q);const txt=a?(a.title+a.summary):'';if(!txt.includes(e)){bad++;console.log('✗',q,a&&a.title)}});
no.forEach(q=>{const a=A(q);if(a&&/清算人由章程|不想辦了可以解散|章程修改後30日|章程和法律規定不一樣|會址要設到屏東縣外/.test(a.title)){bad++;console.log('誤觸',q,a.title)}});
console.log(bad?'失敗 '+bad:'全部通過');process.exit(bad?1:0);
