'use strict';
const assert=require('node:assert/strict');
const {associationAccountSeal:answer}=require('./association-account-seal.js');
const first=answer('我們協會戶頭在農會，理事長換人，總幹事不變，只要換理事長印鑑嗎？');
assert.match(first.summary,/不代表只帶新理事長的章.*不代表其餘印鑑都要重刻/);
assert.match(JSON.stringify(first),/領款憑證共同蓋章/);
assert.ok(first.refs.some(x=>x.source.endsWith('flno=17')));
for(const [q,term] of [
 ['先去縣府換圖記還是去農會改存摺印鑑？我們協會選出新任理事長','異動後30日內'],
 ['協會在郵局的團體戶理事長改選了，三個人的印鑑都得換嗎？','原開戶郵局'],
 ['協會在信用合作社的帳戶換負責人，舊印鑑還要帶嗎？','原開戶信用合作社'],
 ['協會漁會存摺留存印鑑，換會計後是不是重簽？','原開戶漁會信用部'],
 ['協會改選，銀行的帳戶印鑑異動需要什麼文件？','往來銀行的原開戶單位']
]) assert.ok(JSON.stringify(answer(q)).includes(term),q);
for(const q of ['農會理事長怎麼改選，圖記給誰','合作社理事長改選，農會戶頭印鑑怎麼換','協會新任理事長要換圖記嗎？','協會農會帳戶印鑑不見了怎麼辦','銀行帳戶理事長不簽薪資，協會副理事長代簽嗎','我們是信用合作社，不是協會，理事長交接後帳戶印鑑要換嗎？']) assert.equal(answer(q),null,q);
console.log('association account seal tests passed');
