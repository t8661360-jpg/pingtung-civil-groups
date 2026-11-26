'use strict';
const assert=require('node:assert/strict');
const {coopAddressProof}=require('./cooperative-address-proof');
for(const q of ['合作社社址變更只能附建物所有權嗎','合作社租屋換地址，租約能代替所有權狀嗎','合作社一定要自己買房才能登記社址嗎','合作社社址可以用房東同意書嗎？']){
 const a=coopAddressProof(q);
 assert.match(a.title,/社址不必自有/);
 assert.match(a.summary,/所有權證明是用來確認房屋是誰的；租約或屋主使用同意書/);
 assert.match(a.summary,/未能確認屏東目前是否接受租約或同意書單獨送件/);
 assert.match(a.summary,/第9條第2項第4款.*第3項.*第9條第4項/);
 assert.equal(a.statutes[0].title,'合作社法第9條');
}
for(const q of ['合作社社址變更怎麼辦','一般協會租屋換會址，租約能用嗎','信用合作社換地址，租約就可以嗎？','合作社社址房屋過戶要帶權狀嗎？'])assert.equal(coopAddressProof(q),null,q);
console.log('cooperative address proof OK');
