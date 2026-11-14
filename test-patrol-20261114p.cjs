const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const yes=[
['勸募許可被撤銷怎麼辦','返還'],['募款的許可被廢止了還能募嗎','返還'],
['勸募許可可以用多久','起迄日期'],['勸募許可忘記延期怎麼辦','7日前'],['募款活動超過期限還能募嗎','起迄'],['勸募許可到期了還可以繼續募款嗎','起迄'],
['勸募活動地點在外縣市可以嗎','衛生福利部'],['我們想到台北募款要向誰申請','衛生福利部'],
['要募款先去哪裡','活動所在地'],['募款要找哪個單位申請','活動所在地'],
['捐款人可以要求退款嗎','異議'],['捐款的人反悔想要回捐款可以嗎','異議'],
['社團可以叫人捐錢嗎','勸募'],['可不可以邀請民眾捐款買物資','勸募'],['協會可以號召大家捐款嗎','勸募'],
['勸募完要不要公開收支','30日'],['募款成果要寫給誰看','備查'],['募款活動辦完多久要報告','30日'],
];
const same=[['勸募要向誰申請','活動所在地'],['勸募所得可以付薪水嗎','必要支出'],['勸募結束後要怎麼報告','30日'],['只對會員募款要許可嗎','會員'],['沒有許可就募款會怎樣','返還']];
const no=['合作社可以募款嗎','政黨募款要許可嗎','宗教團體募款要許可嗎','捐款可以抵稅嗎','會員退會可以退會費嗎','協會去外縣市旅遊可以嗎','協會想請民眾來參加活動','理事長收到捐款要開收據嗎','補助款核銷要報告多久','社區發展協會去外縣市參訪'];
let bad=0;
for(const [q,k] of yes){const x=A(q);if(!x||!x.direct||!(x.summary+x.title).includes(k)){console.error('FAIL',q,x&&x.title);bad++;}}
for(const [q,k] of same){const x=A(q);if(x&&!(x.title+x.summary).includes(k)){console.error('REGRESS',q,x.title);bad++;}}
for(const q of no){const x=A(q);if(x&&x.category==='公益勸募'&&/被撤銷|期間|外縣市|先向活動|退款|主動邀請/.test(x.title)){console.error('OVERTRIGGER',q,x.title);bad++;}}
if(bad)throw new Error('patrol49 failed '+bad);console.log('ok');
