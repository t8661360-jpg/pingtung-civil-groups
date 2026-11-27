const assert=require('node:assert/strict');
const {answerMixed,duesAndAssemblyRights}=require('./verified-mixed-questions');
for(const q of [
 '會員欠會費和退會不一樣，協會大會資格可以先扣掉嗎？',
 '協會會員大會的名冊先審定了，欠費會員就不能進場和投票嗎？',
 '我是協會會員，欠了一年的會費，當天不讓我出席會員大會，能不能也不算人數？',
]){
 const a=answerMixed(q);
 assert.match(a.summary,/不能只因欠會費就刪名/);
 assert.match(a.steps.flat().join(' '),/限制投票也不等於不准出席.*審定名冊上記明/);
 assert.ok(a.refs.some(x=>x.title==='人民團體會務輔導辦法第10條'));
}
assert.ok(answerMixed('協會會員欠費，大會改選時可以限制投票嗎？').refs.some(x=>x.title==='人民團體選舉罷免辦法第5條'));
for(const q of ['商業同業公會欠繳會費滿九個月，可以參加會員大會嗎？','協會會員會費沒繳，理事長可以把他除名嗎？','協會退會已生效，不過名冊早已審定，大會出席人數怎麼算？','合作社欠繳股金，社員大會可以投票嗎？','協會會員欠費名單可以公開嗎？'])assert.equal(duesAndAssemblyRights(q),null,q);
console.log('dues and assembly rights OK');
