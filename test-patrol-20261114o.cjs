const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const yes=[['選舉票要怎麼印','三種'],['投票紙怎麼做','三種'],['理事沒有人要選怎麼辦','空白格'],['沒人想當理事要怎麼選','空白格'],['忘記改選已經超過任期怎麼辦','延長'],['可以不改選繼續做嗎','不可以不改選'],['理監事全部換掉可以嗎','全部換新人'],['會員可以自己推薦參選嗎','登記'],['一人可以投幾票','無記名'],['每個人幾票','無記名'],['改選當天人不夠怎麼辦','散會'],['監事怎麼選','無記名'],['選監事要怎麼投','無記名'],['改選的選務人員要誰當','監票'],['誰來當監票員','監票'],['理事選出來後多久要開第一次會','15日'],['新選的理事要幾天內開會','15日'],['改選公告要貼哪裡','十五日'],['理事長任期到了要怎麼改選','互選'],['理事長辭職要重選嗎','一個月'],['理事長走了多久內要選新的','一個月']];
const same=[['理事長可以連任幾屆','連任'],['票數相同怎麼辦','抽籤'],['選舉可以用舉手嗎','無記名'],['候補理事怎麼遞補','候補']];
const no=['合作社選票怎樣算無效','合作社沒人要選','社區發展協會理事沒人要選','工會一人幾票','社團沒人要當理事長只好解散怎麼辦','監事會主席怎麼選','協會理監事要選幾位'];
let bad=0;
for(const [q,k] of yes){const x=A(q);if(!x||!x.direct||!(x.summary+x.title).includes(k)){console.error('FAIL',q,x&&x.title);bad++;}}
for(const [q,k] of same){const x=A(q);if(!x||!(x.title+x.summary).includes(k)){console.error('REGRESS',q,x&&x.title);bad++;}}
for(const q of no){const x=A(q);if(x&&/改選與補選|選票怎麼做|沒有人登記參選|一個人可以投幾票|監事和理事一樣/.test(x.title)){console.error('OVERTRIGGER',q,x.title);bad++;}}
if(bad)throw new Error('patrol48 failed '+bad);console.log('ok');
