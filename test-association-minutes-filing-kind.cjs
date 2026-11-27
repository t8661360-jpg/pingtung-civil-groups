const assert=require('node:assert/strict');
const {filingKind}=require('./association-minutes-filing-kind.js');
const missing='社會團體收到縣府叫我們補會議紀錄的通知，不知道是會員大會還是監事會，也沒有說日期，我要先交什麼？';
const actual=filingKind(missing);assert.equal(actual.choices.length,5);
const a=actual.choices.map(x=>filingKind(x.question));assert.match(a[0].summary,/開會日期/);assert.match(JSON.stringify(a[0]),/閉會後30日內/);
for(const x of a.slice(1,4)){assert.match(x.summary,/開會日期/);assert.match(JSON.stringify(x),/不要把大會閉會後30日/);}
assert.equal(a[4].choices,undefined);
const known=filingKind('協會收到補會議紀錄的通知，不確定是大會還是監事會，寫開會日期為115年6月10日，可以先交嗎？');
assert.ok(known?.choices.every((x,i)=>i===4||x.question.includes('115年6月10日')));
assert.match(filingKind(known.choices[2].question)?.summary,/「115年6月10日」/);
assert.match(filingKind('一般協會要補監事會會議紀錄，開會日期是115年6月10日')?.summary,/「115年6月10日」/);
for(const q of ['合作社收到縣府要補會議紀錄，不知道要哪一個日期？','協會監事會通知要提前幾天？','監事會會議紀錄應不應該公開？'])assert.equal(filingKind(q),null,q);
console.log('補件、日期及會議類型依第12條分流通過');
assert.equal(filingKind('協會收到來文說要補會議紀錄，但不確定是哪次會員大會，來文日期115年6月10日')?.choices?.length,5);
const twoDates=filingKind('一般協會補件的會議紀錄，已確認是監事會，開會日期是115年6月1日，發文日期115年6月15日');
assert.match(twoDates?.summary,/115年6月1日/);
assert.doesNotMatch(twoDates?.summary,/115年6月15日/);
