const assert=require('node:assert/strict'); const {creditCustody}=require('./credit-cooperative-funds-custody.js');
const cases=[
 ['我們信用合作社是存款機構，出納把社裡收的錢先放個人郵局戶頭可不可以？',['不可以','正式收款與入帳流程','法遵與內部稽核','第21條']],
 ['信合社員工用自己的私人銀行帳號收了幾筆客戶存款，明天再入機構帳，可以嗎？',['不能把出納、理事或員工的私人郵局、銀行戶頭當作收款','已入私人帳戶或帳款不符','重大偶發事件通報要件']],
 ['我是信用合作社存戶，行員請我匯存款到他的個人帳號再補存摺，安全嗎？',['先不要匯到行員私人帳戶','信用合作社的官方管道','不因私人轉帳就保證已是受保障存款']],
];
for(const [q,yes] of cases){const a=creditCustody(q);assert.ok(a,q);const s=JSON.stringify(a);for(const x of yes)assert.ok(s.includes(x),q+' missing '+x);}
for(const q of ['我們協會把公款存在信用合作社的團體帳戶可以嗎？','協會款用理事長私人帳戶代放，改用信用合作社團體戶可以嗎？','我想在信用合作社開一個個人帳戶存款，有什麼文件？','合作社出納可以把社款放自己私人戶頭嗎？'])assert.equal(creditCustody(q),null,q);
console.log('信合社自身款與一般團體存款分流通過');
const {associationAccountSeal}=require('./association-account-seal.js');
const credit='我們信用合作社是存款機構，出納把社裡收的錢先放個人郵局戶頭可不可以';
const assoc='我們協會理事長改選，信用合作社帳戶的印鑑需要變更嗎';
for(const q of [credit+'？另外'+assoc+'？',assoc+'？另外'+credit+'？']){
 const a=creditCustody(q,associationAccountSeal);assert.match(a.title,/兩件事/);assert.match(a.summary,/不可以/);assert.match(a.summary,/辦理帳戶代表人/);assert.ok(a.refs.length>=7);
}
const clarify=creditCustody('信用合作社要收這筆款，我還不知道帳戶是機構還是個人戶，怎麼辦？');
assert.equal(clarify?.choices?.length,2);
assert.match(creditCustody(clarify.choices[0].question)?.summary,/不可以/);
assert.match(creditCustody(clarify.choices[1].question)?.summary,/先不要匯/);
