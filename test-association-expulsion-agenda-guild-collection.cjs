const assert=require('node:assert/strict');
const {agendaCollection}=require('./association-expulsion-agenda-guild-collection.js');
const first='股份有限公司借用同業公會名義收款';
const next='協會臨時會員大會可以在會上決議除名嗎';
for(const q of [first+'，另外'+next+'？',next+'？另外'+first+'，可以嗎？',first+'，'+next+'？']){
 const r=agendaCollection(q);assert.ok(r,q);const s=JSON.stringify(r);
 for(const a of ['不同問題','代收授權','受款戶名與收據','過半數出席','三分之二以上同意','正式提案或可用臨時動議，法無明文'])assert.ok(s.includes(a),q+' '+a);
}
const unknown='我們一般協會要召開臨時會員大會處理除名，但我不確定通知有沒有把除名寫進議程，該怎麼做？';
const a=agendaCollection(unknown);assert.equal(a?.choices?.length,2);
assert.match(agendaCollection(a.choices[0].question)?.summary,/可以依章程/);
assert.match(agendaCollection(a.choices[1].question)?.summary,/不能一概/);
assert.match(agendaCollection('一般協會理事會可以直接把人除名嗎？')?.summary,/不能由理事會直接除名/);
assert.match(agendaCollection('同業公會要我把報名費匯到公司帳戶，可以嗎？')?.summary,/正式管道/);
for(const q of ['合作社臨時社員大會通知沒寫除名，可以嗎？','一般協會會員大會要如何罷免理事長？','工業同業公會公司被處分怎麼辦？','股份有限公司借用同業公會名義收款？另外合作社清算多久要報？'])assert.equal(agendaCollection(q),null,q);
console.log('公會授權與協會除名分流通過');
