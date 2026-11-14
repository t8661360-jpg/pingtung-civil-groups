const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const yes=[
['解散決議要送縣府核准嗎','沒有寫解散決議還要縣府核准'],['會員大會通過解散後縣府要核准嗎','沒有寫解散決議還要縣府核准'],['解散決議要不要報縣府同意','沒有寫解散決議還要縣府核准'],
['協會解散要找清算人嗎','建議一併決定清算人'],['清算人要不要另外選','建議一併決定清算人'],['解散之後要不要找清算的人','建議一併決定清算人'],
['解散要不要先開理事會','理事會自己決定解散是不算數'],['解散案要先經過理事會提案嗎','理事會自己決定解散是不算數'],['理事會決定解散可以嗎','理事會自己決定解散是不算數'],
['解散時帳目要怎麼結算','帳目要編哪些表'],['解散要結帳嗎','帳目要編哪些表'],['解散前的帳要先結嗎','帳目要編哪些表'],
['協會解散報告要什麼時候交','沒有另外訂期限'],
['協會欠會員錢解散怎麼辦','先清償債務'],['協會欠錢可以解散嗎','先清償債務'],
['協會沒人理了怎麼辦','恢復'],['協會沒人管了要怎麼處理','恢復'],['協會解散銀行帳戶怎麼辦','沒有查到明文'],
];
const same=[['清算人是誰當','理事長'],['理事長可以自己宣布解散嗎','會員大會'],['協會解散要多少人同意','三分之二'],['社區發展協會解散要不要核准','會員']];
const no=['合作社解散要找清算人嗎','公會解散要不要核准','社區發展協會的帳目要怎麼結'];
let bad=0;
for(const [q,k] of yes){const x=A(q);if(!x||!x.direct||!(x.summary+x.title).includes(k)){console.error('FAIL',q,x&&x.title);bad++;}}
for(const [q,k] of same){const x=A(q);if(!x||!(x.title+x.summary).includes(k)){console.error('REGRESS',q,x&&x.title);bad++;}}
for(const q of no){const x=A(q);if(x&&/解散決議要不要縣府核准|解散要有清算人|解散時的帳目怎麼結/.test(x.title)){console.error('OVERTRIGGER',q,x.title);bad++;}}
if(bad)throw new Error('patrol53 failed '+bad);console.log('ok');
