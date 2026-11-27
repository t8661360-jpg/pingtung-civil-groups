const assert=require('node:assert/strict');
const {answerMixed:A,overdueFundraising:F}=require('./verified-mixed-questions');
const all=a=>[a.summary,...a.steps.flat(),...a.refs.map(x=>x.title)].join(' ');
assert.match(all(A('協會已經報名公益勸募，活動延期遇到許可到期，可以繼續收款嗎？退款誰負責？')),/活動延期不會自動延長.*由勸募團體處理返還捐贈人.*先報原主管機關認定/);
assert.match(all(A('已許可的公益勸募逾期收到一筆款，但找不到捐款人，可以自行轉捐嗎？')),/不要自行轉捐.*繳交主管機關/);
assert.match(all(A('公益勸募在許可期間收款，結束後還沒發完，可以跟逾期收到的款一起退嗎？')),/不是所有合法捐款都要退.*三個月內.*不得逾三年.*依第19條.*逾期勸募/);
assert.match(all(A('找不到捐款人，公益勸募期滿後收到的錢，可以自行轉捐嗎？')),/不要自行轉捐.*先報原主管機關認定/);
for(const q of ['協會收到民眾主動送來的物資可以轉贈嗎？','縣府補助核銷逾期能不能退款？','公益勸募捐款可以抵多少所得稅？','公益勸募活動最長多久？','公益勸募活動期滿後多久內公開徵信？'])assert.equal(F(q),null,q);
console.log('fundraising expiry differs from donor refund and lawful remainder');
