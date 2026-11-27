const assert=require('node:assert/strict');const {answerMixed,outsideCounterNoiseReferral:f}=require('./verified-mixed-questions');
const a=answerMixed('我家隔壁很吵要找誰檢舉');
assert.deepEqual(a.choices.map(x=>x.label),['鄰居吵鬧或犬吠','工地、工廠或店家機具']);
assert.match(answerMixed(a.choices[0].question).summary,/轄區派出所.*110/);
assert.match(answerMixed(a.choices[1].question).steps.flat().join(' '),/0800-066-666.*08-7351928/);
assert.doesNotMatch(JSON.stringify(f('高雄住家旁工地每天施工噪音，要向哪個單位陳情？')),/08-7351928/);
for(const q of ['協會會員大會現場有人吵鬧，主席可以怎麼處理？','隔壁的噪音車要怎麼檢舉？','工廠可以申請成立合作社嗎？'])assert.equal(f(q),null,q);
console.log('neighbor noise referral OK');
