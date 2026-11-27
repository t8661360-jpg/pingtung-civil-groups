'use strict';
const assert=require('node:assert/strict');
const {receiptIdentity:f}=require('./donation-receipt-identity');
for(const [q,terms] of [
 ['夫妻合併列舉，捐款原始收據寫我太太，須改開我嗎？',['保留配偶實名的原收據','所得稅法第17條']],
 ['公司自己出錢，老闆可以請協會改開他的名字抵綜所稅嗎？',['不能改成負責人的個人名義','照實以公司為捐贈人']],
 ['捐款是我個人出錢，公司只是代匯，收據要寫誰的名字？',['代匯與實際捐贈者要分清','代匯憑證']],
 ['核准勸募的捐款收據姓名誤植，可以重開嗎？',['同一捐贈人的誤植再更正','第16條另明定收據應記載捐贈人']],
 ['協會的收據可以開別人的名字嗎',['收據應依實際捐贈者','真的有誤植或代匯']]
]) for(const x of terms) assert.ok(JSON.stringify(f(q)).includes(x),q+' '+x);
for(const q of ['申請協會的名字可以用公司名嗎？','義賣發票可以開我公司名字嗎？','協會會費收據寫錯可以重開嗎？'])assert.equal(f(q),null,q);
console.log('donor receipt identity tests passed');
