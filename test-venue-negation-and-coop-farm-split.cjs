'use strict';
const assert=require('node:assert/strict');
const {route:venue}=require('./association-address-meeting-change');
const {route:coop}=require('./cooperative-expired-chair-lease');
const {farmerRepresentative:farm}=require('./farmer-association-representative');
const {route:join}=require('./coop-farm-verified-split');
const v=venue('協會只換會員大會場地，日期不變，登記會址也沒改，通知已寄出需要重寄嗎？');
assert.match(v.summary,/登記會址沒變.*不用辦會址異動.*重發/);
assert.ok(!v.refs.some(r=>r.source.endsWith('&flno=8')));
assert.match(venue('協會辦公室也搬家，會員大會改期，登記地址要變。').summary,/登記會址與會議通知分開/);
const c='合作社的理事任期屆滿又沒改選，原理事主席還能代表簽約嗎？';
const f='農會會員代表又是怎麼選的？';
assert.match(coop(c).summary,/簽契約/);
assert.doesNotMatch(coop(c).steps.flat().join(' '),/租約/);
for(const [q,first] of [[c+f,'合作社'],[f+c,'農會']]){
 const a=join(q,coop,farm);
 assert.match(a.steps[0][0],new RegExp(first));
 assert.match(a.steps.flat().join(' '),/合作社法第33條/);
 assert.match(a.steps.flat().join(' '),/下級農會的會員（代表）大會選舉/);
 assert.deepEqual(a.choices.map(x=>x.label),['基層農會的會員代表','出席上級農會的代表']);
}
assert.equal(join(c+'農會信用部貸款如何辦？',coop,farm),null);
assert.equal(join(c+'農會會員代表怎麼選？協會也可以嗎？',coop,farm),null);
