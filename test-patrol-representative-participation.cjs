const assert=require('node:assert/strict');
const {answerMixed,assemblyRepresentativeParticipation}=require('./verified-mixed-questions');
const generic=answerMixed('會員代表選出來之後，一般會員還可以出席大會發言嗎');
assert.deepEqual(generic.choices.map(x=>x.label),['會員大會','會員代表大會']);
assert.match(answerMixed(generic.choices[0].question).summary,/合格會員可以正式出席/);
assert.match(answerMixed(generic.choices[1].question).summary,/不能投票/);
for(const q of ['協會開會員代表大會，我不是代表，可以旁聽、提案又投票嗎？','不是代表，但我是協會會員，可以旁聽會員代表大會而且提案嗎？','我只是列席協會的會員代表大會，會把我算進出席人數嗎？','會員代表大會一般會員可以旁聽嗎']){
 const a=answerMixed(q);
 assert.match(a.summary,/不計入正式出席人數，不能投票/);
 assert.match(a.steps.flat().join(' '),/能否直接提案.*章程及議事規則.*建議交給代表轉提/);
 assert.ok(a.refs.some(x=>x.title==='人民團體會務輔導辦法第10條'));
}
assert.match(answerMixed('我是立案協會的會員但不是代表，可以拿代表的委託書去會員代表大會投票嗎？').summary,/不能拿代表的委託書/);
for(const q of ['合作社普通社員不是社員代表，可以去社員代表大會發言或投票嗎？','律師公會普通會員可以旁聽會員代表大會嗎','理事會紀錄能否提供會員代表查閱？','我不是會員，可以代我太太到協會大會投票嗎？','會員代表大會要多少代表才能合法開會？','我是會員代表，協會的會員代表大會可以投票嗎？'])assert.equal(assemblyRepresentativeParticipation(q),null,q);
console.log('assembly representative participation OK');
