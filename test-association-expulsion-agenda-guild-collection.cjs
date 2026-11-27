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
const ambiguousVotes=agendaCollection('我先問兩件事，協會想把會員除名，十五人裡要幾個同意？然後大會可以臨時加這個議題嗎？');
assert.match(ambiguousVotes.summary,/至少 10 票.*先要 8 人/);
assert.match(JSON.stringify(ambiguousVotes.steps),/法無明文/);
assert.equal(ambiguousVotes.choices.length,2);
assert.match(agendaCollection(ambiguousVotes.choices[0].question).summary,/實際出席 15 人計算，需至少 10 票/);
assert.match(agendaCollection(ambiguousVotes.choices[1].question).summary,/總數 15 人，至少 8 人出席才成會/);
assert.match(agendaCollection('協會應出席十五人，要幾票才能除名？能臨時加案表決嗎？').summary,/總數 15 人，至少 8 人/);
assert.match(agendaCollection('現場臨時加這個議題嗎？協會全體會員30人，實際出席15人，除名要幾票同意？').summary,/沒有過半/);
assert.match(agendaCollection('現場臨時加這件事嗎？協會全體會員30人，實際出席16人，除名要幾票同意？').summary,/11 票同意/);
for(const q of ['合作社社員有十五人，臨時加除名要幾票？','不是除名，是罷免理事，只來十五個人能臨時加案嗎？'])assert.equal(agendaCollection(q),null);
