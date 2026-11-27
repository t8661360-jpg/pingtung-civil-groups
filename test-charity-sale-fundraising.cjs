'use strict';
const assert=require('node:assert/strict');
const {saleFundraising:f}=require('./charity-sale-fundraising');
for(const [q,terms] of [
 ['我們是已登記的公益性社團法人，要在屏東公開辦義賣、扣成本後全捐弱勢，還沒開始要先申請嗎？',['先申請勸募許可','向屏東縣政府申請','21日前']],
 ['商家照正常價格賣商品開發票，再自己捐營收的5%，客人另外不捐款，也要先申請嗎？',['與公開勸募不同','不必申請公益勸募許可']],
 ['義賣現場另放公開捐款箱，已經收到款但沒申請，接下來怎麼辦？',['先停募','返還捐贈人','報主管機關認定']],
 ['信用合作社辦義賣收捐款，如果沒申請勸募許可該補什麼？',['不能只憑名稱或法人身分','返還捐贈人']],
 ['義賣所得會捐社福，但還沒開始，我們需要先申請嗎？',['先分清做法','較接近您的做法']]
]) for(const x of terms) assert.ok(JSON.stringify(f(q)).includes(x),q+' '+x);
for(const q of ['協會賣義賣品要開發票嗎','義賣所得要怎麼報','政府機關名稱能不能用','義賣的收入用在公益，就可以免營業稅嗎？']) assert.equal(f(q),null,q);
console.log('charity sale and fundraising tests passed');
