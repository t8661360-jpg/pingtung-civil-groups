const assert=require('node:assert/strict');
const {detect}=require('./community-cooperative-pause.js');
const a='社區發展協會要開會員大會宣布停辦',c='合作社可以先停業不解散，哪一邊要報縣府';
for(const q of [a+'，另外'+c+'？',c+'？另外'+a+'？',a+'，'+c+'？']){
 const r=detect(q);assert.ok(r,q);const z=JSON.stringify(r);
 for(const x of ['閉會後30日','稅籍','第55-1條','一個月內','可先問所在地公所'])assert.ok(z.includes(x),x);
}
for(const q of [a,c,a+'？另外信用合作社要停業怎麼辦？','公司可以暫停營業，另外社區發展協會停辦怎麼辦？'])assert.equal(detect(q),null,q);
console.log('停活動、復業及解散兩組分流通過');
const r=detect(a+'，另外'+c+'？');assert.equal(r.choices.length,2);
const x=r.choices.map(v=>detect(v.question));
assert.match(JSON.stringify(x[0]),/閉會後30日/);
assert.match(JSON.stringify(x[1]),/全體社員三分之二以上同意/);
x.forEach(r=>assert.match(JSON.stringify(r),/第55-1條/));
