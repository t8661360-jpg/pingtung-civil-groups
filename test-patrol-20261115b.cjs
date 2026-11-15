const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const yes=[
['成立後多久要召開成立大會','6 個月內'],['許可籌組後多久內要成立','6 個月內'],['籌備超過六個月還沒成立怎麼辦','廢止'],['籌備期限可以延長嗎','最長 3 個月'],
['籌備會備查要報哪裡','通知'],['籌備會要通知縣府嗎','派員列席'],
['發起人名冊要附身分證影本嗎','身分證正反面影本'],['發起人要不要附身分證','身分證正反面影本'],
['名稱可以用屏東縣開頭嗎','沒有規定一定要'],['協會名稱要不要加屏東縣','沒有規定一定要'],
['還沒立案可以先辦活動嗎','沒有明文'],['沒立案可以先收會費嗎','沒有明文'],['還沒立案可以先開戶嗎','沒有明文'],
['章程修正後要報縣府嗎','30 日內'],['章程改了要不要報備縣府','30 日內'],
];
const no=['合作社成立後多久要開創立會','社區發展協會籌備要多久','公會名稱可以用屏東縣開頭嗎','成立要多久才會核准','解散後還沒立案怎麼辦','章程修改要多久報備','協會成立大會要通知誰','法人章程修正要報法院嗎'];
let bad=0;
for(const [q,k] of yes){const x=A(q);if(!x||!x.direct||!(x.summary+x.title).includes(k)){console.error('FAIL',q,x&&x.title);bad++;}}
const pat=/6 個月內要完成成立|超過 6 個月還沒成立|籌備會議：要通知縣府|發起人要附身分證|名稱要不要冠上|還沒立案前能做什麼|章程修改完要報縣府/;
for(const q of no){const x=A(q);if(x&&typeof x==='object'&&pat.test(x.title)){console.error('OVERTRIGGER',q,x.title);bad++;}}
if(bad)throw new Error('patrol59 failed '+bad);console.log('ok');
