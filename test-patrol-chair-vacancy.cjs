const assert=require('node:assert/strict');
const {answerMixed,monthsRemaining}=require('./verified-mixed-questions');
const A=(n,kind='協會理事長')=>answerMixed(kind+'過世，剩'+n+'任期，要補選嗎？');
for(const n of ['三個月','3個月','兩個月']){const a=A(n);assert.match(a.summary,/符合不足六個月.*不必一定補選/);assert.match(a.steps[0][1],/出缺之日起一個月內.*章程.*常務理事.*沒有設常務理事/);}
for(const n of ['六個月','十個月','半年']){const a=A(n);assert.match(a.summary,/不適用不足六個月.*一個月內補選/);assert.doesNotMatch(a.steps.flat().join(' '),/可以在/);}
assert.equal(monthsRemaining('還剩三個月或剩七個月'),null);
assert.equal(monthsRemaining('還剩約六個月'),null);
assert.equal(monthsRemaining('還有６個月'),null); // caller normalizes.
let a=answerMixed('理事長去世了，任期快到了，應如何補選？');assert.equal(a.related.length,2);for(const q of a.related)assert.equal(answerMixed(q).related.length,0);
a=A('三個月','商業同業公會理事長');assert.match(a.title,/商業同業公會/);assert.ok(a.refs.some(x=>x.title==='商業團體法施行細則第45條'));
a=A('三個月','合作社理事會主席');assert.match(a.steps[0][1],/由理事互推一人代理/);assert.doesNotMatch(a.steps[0][1],/常務理事/);
a=A('六個月','合作社監事會主席');assert.match(a.summary,/一個月內召開監事會議補選/);
for(const q of ['合作社社員死亡股金誰繼承','理事長請辭任期還有三個月怎麼辦','醫師公會理事長死亡剩三個月怎麼補選','協會理事長過世了剩3個月，補選上來的人任期怎麼算？'])assert.equal(answerMixed(q),null,q);
console.log('chair vacancy applied to the remaining term');
