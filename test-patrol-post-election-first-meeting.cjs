'use strict';
const assert=require('node:assert/strict');
const {firstMeetingAnswer,keepFirstMeetingQuestion}=require('./post-election-first-meeting');
const {normalizeQuestion,verifiedRoundAnswer}=require('./round-fixes');
const ask=q=>{const t=keepFirstMeetingQuestion(q,normalizeQuestion);return firstMeetingAnswer(t,verifiedRoundAnswer(t,{}));};
for(const q of ['協會改選完第一次理事會要幾天內開？','會員大會改選隔天就能開第一次理事會選理事長嗎？','改選完多久要開第一次理事會','協會改選當天開理事會可以嗎？','改選後第一次監事會什麼時候開？','新任理事第一次開會期限是幾天']){
 const a=ask(q);
 assert.match(a.title,/第7日起至第15日內/,q);
 assert.match(a.summary,/隔天不在這個通常期間/,q);
 assert.match(a.summary,/主管機關核准延長/,q);
 assert.match(a.summary,/一併通知.*全體當選理事、監事都同意/,q);
 assert.match(a.summary,/得票最多的理事、監事/,q);
 assert.equal(a.statutes[0].title,'人民團體選舉罷免辦法第12條',q);
}
for(const q of ['合作社改選完第一次理事會要幾天內開？','新任理事長什麼時候開始算？','協會理事會可以隔多久開一次？','協會改選後理事會會議紀錄要報備嗎？']){
 assert.equal(firstMeetingAnswer(q,null),null,q);
}
console.log('first meeting OK');
