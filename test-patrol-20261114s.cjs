const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const yes=[
['社區發展協會怎麼改名字','修改章程'],['社區發展協會想換名稱可以嗎','修改章程'],['社發協會要更名怎麼辦','修改章程'],
['社區發展協會的章程誰核准','兩關'],['社區協會的章程誰通過','兩關'],
['社區協會一定要章程嗎','沒有章程無法立案'],['社區發展協會要不要有章程','沒有章程無法立案'],
['社發協會的會員代表怎麼產生','章程'],['社區協會的會員代表是誰選出來的','章程'],
['社區發展協會理事長可以不是本社區的人嗎','設籍'],
['社區發展協會的錢可以放在村長那裡嗎','不得存放'],
['社區發展協會的收據要去哪裡領','沒有規定取得方式'],
['社區發展協會的會員資格被取消怎麼辦','三分之二'],
];
const same=[['里長可以當社區發展協會理事長嗎','里長'],['社區發展協會理事長任期幾年','四年']];
const no=['合作社的章程誰核准','公會的章程要不要有','社區發展協會名稱怎麼取','一般協會的會員代表怎麼產生'];
let bad=0;
for(const [q,k] of yes){const x=A(q);if(!x||!x.direct||!(x.summary+x.title).includes(k)){console.error('FAIL',q,x&&x.title);bad++;}}
for(const [q,k] of same){const x=A(q);if(!x||!(x.title+x.summary).includes(k)){console.error('REGRESS',q,x&&x.title);bad++;}}
for(const q of no){const x=A(q);if(x&&/一定要有章程|章程誰核准|會員代表怎麼產生：人民|協會的錢不能放/.test(x.title)){console.error('OVERTRIGGER',q,x.title);bad++;}}
if(bad)throw new Error('patrol52 failed '+bad);console.log('ok');
