'use strict';
const assert=require('node:assert/strict');
const {officeStatus:f}=require('./association-office-status');
for(const [q,terms] of [
 ['理事長涉嫌侵占被起訴了，還能繼續當理事長嗎，要停職嗎',['不會僅因此自動停職或解任','有罪確定前推定無罪','監事會仍可依職權查帳']],
 ['協會理事長被起訴還沒判決，能停職嗎？監事會可以先查帳嗎？',['監事會仍可依職權查帳','必要時可召開臨時監事會查核']],
 ['只知道協會理事長被告，還沒起訴就一定要換人嗎？',['只被提告或仍在偵查','光憑這一點不會自動停職、解任或必須換人']],
 ['協會理事長有罪判決確定，發起人資格的限制就直接適用嗎？',['不直接套發起人限制','台內社字第0970158909號']],
 ['理事長一審判刑還在上訴，要停職嗎？',['判決尚未確定']]
]) for(const x of terms) assert.ok(JSON.stringify(f(q)).includes(x),q+' '+x);
for(const q of ['我們是合作社，理事主席被起訴是否同樣會解任？','協會理事長拒簽總幹事薪水能停職嗎？','協會理事長換人要準備什麼文件？']) assert.equal(f(q),null,q);
console.log('association office status tests passed');
