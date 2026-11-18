const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const yes=[
['解散的會員大會通知要幾天前發','15 日前通知'],['解散忘了通知縣府派員怎麼辦','沒有寫補救'],
['理事會決議解散有效嗎','不算'],['理事會通過解散可以嗎','不算'],
['解散前要不要先改選','沒有要求解散前要先改選'],
['會員只剩十個人還能不能解散','至少要 6 人'],
['解散登記要去法院嗎','法人登記'],['沒有法人登記的協會解散要不要去法院','沒有規定要向法院'],
['解散後立案證書要還給縣府嗎','繳回立案證書'],['解散後圖記要怎麼處理','繳回立案證書'],
['解散以後會員名冊要保存嗎','由誰保管'],
];
const no=['合作社解散要通知社員嗎','工會理事會決議解散有效嗎','社區發展協會解散前要先改選嗎','活動結束後要不要通知縣府','理事任期結束要改選嗎','解散後帳戶要怎麼處理','合作社解散後立案證書要還嗎','臉書粉專要關掉嗎'];
let bad=0;
for(const [q,k] of yes){const x=A(q);if(!x||!x.direct||!(x.summary+x.title).includes(k)){console.error('FAIL',q,x&&x.title);bad++;}}
const pat=/15 日前通知會員，並報縣府派員列席|理事會決議解散不算數|解散前不一定要先改選|會員人數很少也可以解散|解散要不要去法院|繳回：依縣府解散書表|會員名冊、帳冊要保存/;
for(const q of no){const x=A(q);if(x&&typeof x==='object'&&pat.test(x.title)){console.error('OVERTRIGGER',q,x.title);bad++;}}
for(const q of ['協會要關掉了','怎麼註銷協會']){if(A(q)!=='KB:解散'){console.error('FAIL KB',q,A(q));bad++;}}
const f=A('協會解散後會館的房子歸誰');if(!f||!/不建議分給會員/.test(f.title)){console.error('FAIL assets');bad++;}
if(bad)throw new Error('patrol58 failed '+bad);console.log('ok');
