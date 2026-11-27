const assert=require('node:assert/strict');
const {answerMixed:A,publishDocumentPrivacy:P}=require('./verified-mixed-questions');
const all=a=>[a.summary,...a.steps.flat(),...a.refs.map(x=>x.title)].join(' ');
assert.match(all(A('公布年度收支時，協會可以附上會員姓名和繳費金額嗎？')),/定期公告.*會費合計.*不必列出.*未確認前不要公開.*個人資料保護法第20條/);
assert.match(all(A('協會把每位會員還沒繳會費的名單貼在會員群組，和公開年度收支一樣嗎？')),/個別通知.*會員群組不是可以任意散布/);
assert.match(all(A('協會會員大會紀錄的簽名要公開到網站嗎？可以只提供會員查閱嗎？')),/沒有要求上網公開.*保存原本.*閉會後三十日內.*不等於符合個資法/);
const b=all(A('協會理事會紀錄上的簽名可以公告嗎？'));assert.match(b,/不套用大會紀錄通用的三十日期限/);assert.doesNotMatch(b,/閉會後三十日內/);
for(const q of ['協會財務收支多久公告一次？','公益勸募協會公開徵信要列會員姓名嗎？','合作社員工繳費明細要公開嗎？','協會會員大會紀錄幾天內要送縣府？','協會會員大會開會通知簽章要用什麼？'])assert.equal(P(q),null,q);
console.log('document privacy, filing, and financial notices stay separate');
