const assert=require('node:assert/strict');
const {verifiedClauses}=require('./verified-clause-routing.js');
const a='我的協會不滿意理事長是要罷免，不是除名';
const b='合作社員查章程可以拍走整份社員名簿嗎';
for(const q of [a+'；另外'+b+'？',b+'？另外'+a+'。',a+'，'+b+'？']){
 const ans=verifiedClauses(q);assert.ok(ans,q);
 for(const p of ['不是除名會員','三分之一以上簽署','原當選會議','不代表可拍走整份名簿','第37條'])assert.ok(JSON.stringify(ans).includes(p),p);
}
for(const q of [a,b,'協會理事長不是要罷免，是要除名；'+b,'合作社主席要罷免不是社員除名？'+b,a+'？請問會計有幾天要送？','協會理事長要罷免還是除名？'+b])assert.equal(verifiedClauses(q),null,q);
console.log('雙邊明示、否定與單題回歸通過');
