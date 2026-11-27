const assert=require('node:assert/strict');
const {coopFundAsset}=require('./cooperative-fund-quorum-asset-borrowing.js');
const c='合作社理事會剩兩位，還能表決動用公益金嗎';
const a='協會理事會決議借公用電腦，要把借用人的電話公告嗎';
for(const q of [c+'？另外'+a+'？',a+'？'+c+'？',c+'，'+a+'？']){
 const ans=coopFundAsset(q),z=JSON.stringify(ans);assert.ok(ans,q);
 for(const k of ['還不能判定','第23條','第53條','應有5席','不要公告借用人的電話','不含可識別資料'])assert.ok(z.includes(k),q+' '+k);
}
for(const q of [c,a,'請問屏東縣野外協會電話在哪裡？','信用合作社理事會剩兩位還可動用公益金嗎？另外'+a])assert.equal(coopFundAsset(q),null,q);
console.log('公益金、理事會不足與設備個資跨類通過');
