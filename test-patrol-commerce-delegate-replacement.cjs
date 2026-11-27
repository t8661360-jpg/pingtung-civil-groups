const assert=require('node:assert/strict');const {answerMixed,commerceDelegateReplacement:f}=require('./verified-mixed-questions');
const a=answerMixed('如果商業同業公會會員代表改派，新人可直接當理事嗎？');
assert.match(a.summary,/不能直接接任.*由會員代表互選/);
assert.ok(a.refs.some(x=>x.title==='商業團體法第25條'));
assert.match(answerMixed('商業同業公會會員公司派了新代表，舊代表原本是公會監事，還能留任嗎？').summary,/原任監事應即解任/);
assert.match(answerMixed('原公司還沒正式改派，但商業同業公會的會員公司換了負責人，舊代表已卸任理事嗎？').summary,/不能直接判定原代表已解任/);
assert.match(answerMixed('商業同業公會的會員代表正式改派，新的代表是第二順位候補理事，能跳過第一順位嗎？').summary,/不能跳過原候補順位/);
for(const q of ['商業同業公會會員代表要幾人？','團體會員改派後，新人可直接當協會理事嗎？','工業同業公會會員代表改派後，原代表的理事席次由誰遞補？','全國商業同業公會聯合會更換上級代表能續任理事嗎？','合作社改派代表，新人能當監事嗎？'])assert.equal(f(q),null,q);
console.log('commerce delegate replacement OK');
