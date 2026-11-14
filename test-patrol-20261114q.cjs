const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const yes=[
['協會的帳要誰來記','專任'],['會計誰負責','專任'],['協會可以有私房錢嗎','正式收據'],['協會可以有小金庫嗎','匿報'],
['會費收入要入帳嗎','入帳'],['收到的捐款要不要入帳','入帳'],
['協會要用哪種會計制度','權責發生制'],['協會要備哪些帳簿','日記簿'],
['收支帳要多久結一次','三個月'],['帳要多久結一次','三個月'],
['帳目有問題誰可以查','監事會'],['財務有疑問找誰查','抽查'],
['結餘款要怎麼處理','準備基金'],['協會剩的錢可以分給會員嗎','分配'],
['開支超過預算怎麼辦','理事會'],['經費不夠可以向理事借錢嗎','借款'],
];
const same=[['協會的錢可以放在理事長個人帳戶嗎','不能存在個人'],['會計年度是幾月到幾月','1月1日'],['協會要不要結餘超過50萬元','']];
const no=['合作社結餘怎麼分','解散後剩的錢怎麼處理','協會存款利息要報稅嗎','協會可以向銀行貸款嗎','補助款結餘要繳回嗎','結餘款超過50萬元是不是只要規劃超過的部分','勸募的錢剩下怎麼辦'];
let bad=0;
for(const [q,k] of yes){const x=A(q);if(!x||!x.direct||!(x.summary+x.title).includes(k)){console.error('FAIL',q,x&&x.title);bad++;}}
for(const [q,k] of same){const x=A(q);if(k&&x&&!(x.title+x.summary).includes(k)){console.error('REGRESS',q,x.title);bad++;}}
for(const q of no){const x=A(q);if(x&&/協會的結餘：本站|不可以有私房錢|協會向理事或會員借錢/.test(x.title)){console.error('OVERTRIGGER',q,x.title);bad++;}}
if(bad)throw new Error('patrol50 failed '+bad);console.log('ok');
