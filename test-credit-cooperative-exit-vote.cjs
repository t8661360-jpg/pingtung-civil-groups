const a=require('node:assert/strict');
const {route}=require('./credit-cooperative-exit-vote.js');
const flat=r=>r.steps.flat().join(' ');
for(const q of ['我們信用合作社有人確定已經退社，股金還沒拿到，下次社員代表大會還能用他的社員資格投票嗎？','下次社員代表大會還能算他的票嗎？他已經退社，是信合社的，股金還沒拿到。']){
 const r=route(q);a.match(r.summary,/不能靠原社員資格再投票/);a.match(flat(r),/代表大會決議通過.*三個月內退還/);a.match(flat(r),/代表資格和名冊/);a.equal(r.choices,undefined);
}
const q=route('信合社辦退社但是股金未退，可以投票嗎？');
a.equal(q.choices.length,2);a.match(route(q.choices[0].question).summary,/不能靠原社員資格再投票/);
a.match(route(q.choices[1].question).summary,/只交退社申請不等於已退社/);
a.equal(route('合作社社員已經退社，沒退股金還能投票嗎？'),null);
a.equal(route('信合社社員股金怎麼算，要在幾個月內退？'),null);
console.log('credit cooperative: shareholder status, representative role and refund are separated');
a.match(route('信合社退社還沒領股金，社員大會可以投票嗎？').choices[0].question,/在社員大會/);
a.match(route('我們信合社辦退社，選代表時可以投票嗎？').choices[0].question,/選社員代表時/);
