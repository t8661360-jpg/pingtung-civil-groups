const assert=require('node:assert/strict');
const {accountProof}=require('./association-company-bank-proof.js');
for(const q of [
 '一般協會的理事長當選證明能辦銀行印鑑，公司負責人換了也用這張證明嗎？',
 '公司董事長改選要到銀行變更印鑑，能不能用協會理事長當選證明，兩邊同一人？',
]){const a=accountProof(q);assert.ok(a,q);const s=JSON.stringify(a);for(const x of ['不能用協會的理事長當選證明','最新公司變更登記事項表','第17條','原開戶銀行','非各銀行'])assert.ok(s.includes(x),q+' missing '+x);}
for(const q of ['協會理事長改選，銀行改印鑑要不要當選證明？','公司負責人變更時去銀行換印鑑帶什麼？','信用合作社理事長換人需變更該社機構帳戶嗎？','協會想開出捐款收據給公司，當選證明要附嗎？'])assert.equal(accountProof(q),null,q);
console.log('團體戶與公司戶的文件及代表權分流通過');
