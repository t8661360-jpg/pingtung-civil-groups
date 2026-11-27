const assert=require('node:assert/strict');
const {route}=require('./association-recall-address-agenda.js');
const at=route('一般協會準備開會員大會，現在立案資料還是舊地址。罷免理事是單獨提案，還是要在章程違反那項裡一併寫？');
assert.match(at.summary,/獨立列/);assert.equal(at.choices.length,2);
assert.match(route(at.choices[0].question).summary,/另作決議與備查/);
assert.match(route(at.choices[1].question).summary,/不用因為場地變更辦會址備查/);
const clear=route('協會理事違反章程，想在現場加案罷免他；我們搬了會址，會議通知沒寫新地址，能直接投票嗎？');
assert.match(JSON.stringify(clear.steps),/答辯截止後十五日.*三分之二以上/);
assert.match(JSON.stringify(clear.steps),/已寄出錯誤場地，不要拿舊通知直接開會表決/);
assert.match(JSON.stringify(route('我們協會要查兩件事：一位理事違章程可否罷免，另一位會員是否也要除名。不知道先開哪種會？').steps),/會員違反法令.*危害團體/);
for(const q of ['一般協會罷免理事長，章程沒寫新會址','協會搬會址，如何通知會員大會？','協會理事違反章程，如何提罷免？'])assert.equal(route(q),null,q);

const c=route('合作社監事違反章程，已換社員大會場地，能現場提案解除職務嗎？');assert.match(c.summary,/全體社員過半數/);assert.match(JSON.stringify(c.steps),/七日前書面/);assert.equal(route('信用合作社監事違反章程，能現場提案解除職務嗎？'),null);
