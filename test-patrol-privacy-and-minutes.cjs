const assert=require('node:assert/strict');
const {answerMixed:A,coopRegistryPrivacy:C}=require('./verified-mixed-questions');
const full=a=>[a.summary,...a.steps.flat(),...a.refs.map(x=>x.title)].join(' ');
for(const q of ['協會會員大會紀錄幾天內要報縣府？出席名單可以貼到官網嗎？','協會會員大會出席名單可以貼到官網嗎？會員大會紀錄幾天內要報縣府？']){
 const a=A(q);assert.match(full(a),/閉會後三十日內/);assert.match(full(a),/提供會員（會員代表）查閱/);assert.match(full(a),/無法確認有合法依據前，不要貼到公開網站或社群/);
 assert.equal(a.refs.filter(x=>x.title==='人民團體會務輔導辦法第12條').length,1);
}
const b=full(A('協會理事會紀錄要在三十天內送縣府嗎？出席名單可以公開嗎？'));
assert.match(b,/不套用大會紀錄通用的三十日期限/);assert.doesNotMatch(b,/閉會後三十日內/);assert.match(b,/不要貼到公開網站或社群/);
assert.doesNotMatch(full(A('協會會員大會出席名單可以貼到官網嗎？')),/閉會後三十日內/);
assert.doesNotMatch(full(A('協會會員大會紀錄幾天內要報縣府？')),/不要貼到公開網站或社群/);
assert.match(full(A('一般合作社社員可以要求查閱社員名冊，再把電話貼到社群嗎？')),/社員及合作社債權人可查閱.*不要把可識別個人資料貼上公開網站.*合作社法第37條/);
for(const q of ['信用合作社的社員名簿可以公開嗎','合作社選舉的社員名冊要公告多久','協會會員名冊能給別人查閱嗎'])assert.equal(C(q),null,q);
console.log('verified assembly filing and privacy composition');
