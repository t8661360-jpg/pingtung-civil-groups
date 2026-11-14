const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const yes=[
['退會了還能參選理事嗎','重新入會'],['不是會員可以當理事嗎','重新入會'],
['沒繳費可以投票嗎','停權'],['欠會費還能參選嗎','停權'],
['兩年沒繳會費還算會員嗎','不會自動'],['欠會費不繳還是會員嗎','不會自動'],
['會員退會要通知縣府嗎','沒有規定每一位'],['退會的人還要通知縣府嗎','沒有規定每一位'],
['入會申請書要保留多久','查不到'],
['會員證要怎麼辦','沒有規定協會一定要發'],['協會一定要發會員證嗎','沒有規定協會一定要發'],
['退會多久生效','沒有規定退會從哪一天'],
['加入協會可以反悔嗎','退會'],
['會員可以請假不開會嗎','沒有規定會員一定要出席'],
['退會會費沒繳完怎麼辦','沒有規定退會前'],
];
const same=[['被除名的會員不服怎麼辦','除名'],['會員死了會籍怎麼辦','出會'],['會員一定要來開會嗎','沒有規定會員一定要出席']];
const no=['合作社社員退社還能參選嗎','公會會員欠會費不繳會怎樣','理事沒繳會費可以當理事嗎'];
let bad=0;
for(const [q,k] of yes){const x=A(q);if(!x||!x.direct||!(x.summary+x.title).includes(k)){console.error('FAIL',q,x&&x.title);bad++;}}
for(const [q,k] of same){const x=A(q);if(!x||!(x.title+x.summary).includes(k)){console.error('REGRESS',q,x&&x.title);bad++;}}
for(const q of no){const x=A(q);if(x&&/退會後就不是會員|欠會費不會自動|會員證：/.test(x.title)){console.error('OVERTRIGGER',q,x.title);bad++;}}
if(bad)throw new Error('patrol51 failed '+bad);console.log('ok');
