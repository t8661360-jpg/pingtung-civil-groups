const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const yes=[
 ['入會要繳什麼','入會申請書'],['入會費跟常年會費有什麼不同','每年繳'],
 ['加入協會要理事會同意嗎','理事會審查'],['退會要提前多久講','提前多久'],
 ['退會 要寫申請書嗎','申請書'],['怎麼才算會員資格喪失','三種情形'],
 ['會員死了會籍怎麼辦','死亡就是出會'],['會員幾年沒來開會算自動退會嗎','不會自動退會'],
 ['會員欠會費可以開除嗎','不能由理事長直接開除'],['新會員要不要報縣府備查','不用逐一報縣府'],
 ['會員名冊要給縣府嗎','立案時要送縣府'],['會員可以轉讓會籍給別人嗎','沒有規定會籍可以轉讓'],
 ['想看會員名冊可以嗎','提供會員閱覽'],
];
const no=['合作社入會要繳什麼','合作社社員可以退社嗎','公會會員欠會費可以開除嗎','會員沒繳會費可以停權嗎','會費可以調漲嗎','退會之後會費能退嗎','理事會幾天前通知','理事死了怎麼辦','入會費比例有規定嗎'];
let bad=0;
yes.forEach(([q,e])=>{const a=A(q);const txt=a?(a.title+a.summary):'';if(!txt.includes(e)){bad++;console.log('✗',q,a&&a.title)}});
no.forEach(q=>{const a=A(q);if(a&&/membershipPatrol/.test('')||(a&&/入會申請書|出會有三種|會員死亡就是出會|不能由理事長直接開除/.test(a.title+a.summary)&&!/^會員欠/.test(q))){bad++;console.log('✗誤觸',q,a.title)}});
console.log(bad?'失敗 '+bad:'全部通過');process.exit(bad?1:0);
