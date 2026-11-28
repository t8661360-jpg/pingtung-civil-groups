const assert=require('node:assert/strict');
const {route}=require('./association-representative-quorum.js');
const {representative}=require('./association-representative-candidate.js');
/* 佇列 #90：「改成會員代表制」的「成會」被誤判為成會門檻題 → 交給會員代表制理事長資格答案 */
for(const q of ['協會改成會員代表制以後，理事長還一定要是會員代表嗎','我們協會改成會員代表大會了，理事長一定要是代表嗎','協會變成會員代表制，理事長要不要具備會員代表身分','社團改成會員代表制後，理事長必須是會員代表嗎','協會換成會員代表制，理事長是不是一定要是會員代表','改成會員代表大會以後，協會理事長還要是會員代表嗎']){
 assert.equal(route(q),null,q);
 assert.match(representative(q)?.title??'',/會員代表制：先確認理事候選資格，再選理事長/,q);
}
/* 真正問成會門檻的仍由出席門檻答案處理 */
for(const q of ['協會會員代表大會要幾人才能成會','協會開會員代表大會，算應出席代表過半嗎','協會改成會員代表大會以後，要多少代表出席才成會'])
 assert.match(route(q)?.title??'',/成會/,q);
for(const q of ['協會改成會員代表制以後，原本的理監事任期要重算嗎','協會會員代表任期幾年','協會會員代表可以委託出席嗎'])
 assert.equal(representative(q),null,q);
console.log('queue-20261128 representative chair ok');
