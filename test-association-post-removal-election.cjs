const assert=require('node:assert/strict');
const {route}=require('./association-post-removal-election.js');
const data=[
 ['協會理事長被罷免，仍是理事，同一任期可以參加補選嗎？',/未明訂.*不等於本案當然可以/],
 ['會員大會只罷免理事職位，他也是理事長，章程是理事互選，可否先代理後補選？',/原理事資格代理或參選.*三分之二/],
 ['協會收到主管機關撤免理事長，還能再選或代理嗎？',/不等於協會內部罷免/],
 ['更正：不是協會，是一般合作社，理事被罷免，同一任期能再選同一職嗎？',/第46條明文禁止/],
 ['更正：一般合作社監事，已把書面辭職書送達社址，同一任期可以再選原職嗎？',/送達合作社社址所在地即生效/],
];
for(const [q,r] of data)assert.match(JSON.stringify(route(q)),r,q);
const a=route('板子上只寫罷免，他的理事身分是否一併沒有我不清楚，我要先辨認哪項職務？');
assert.equal(a.choices.length,4);
assert.equal(new Set(a.choices.map(x=>route(x.question).title)).size,4);
for(const q of ['協會想罷免理事長，需要幾人連署？','協會理事長辭職後可以再選嗎？','信用合作社理事被罷免可再選嗎？'])assert.equal(route(q),null,q);
console.log('罷免、撤免、理事席次及合作社離任分流通過');
