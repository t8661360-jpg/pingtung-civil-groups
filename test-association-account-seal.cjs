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
for(const [q,terms] of [
 ['協會只換理事長，帳戶在郵局，前任不交存摺，要怎麼先保護帳戶？',['暫予止付','0800-700-365','照實說明','代表權']],
 ['協會郵局存摺還在前任手上，現在郵局關了，能先打電話保護帳戶嗎？',['暫予止付','24小時','不要說成遺失','非通儲戶']],
 ['協會存摺已掛失，網路郵局還能用嗎？',['掛失存摺不等於網路郵局停用','電話受理時','明確提出要一併停用網路及語音']],
 ['協會存摺被前任留著，另有發現郵局網路轉帳不認得，能先請郵局暫停嗎？',['不認得的交易','保留日期、金額及交易紀錄']]
]) for(const term of terms) assert.ok(JSON.stringify(answer(q)).includes(term),q+' '+term);
for(const q of ['我的郵局個人帳戶存摺遺失，如何掛失？','協會存摺遺失在農會，怎樣掛失止付？','我們是信用合作社，郵局存摺不見了']) assert.equal(answer(q),null,q);
console.log('association account seal tests passed');
