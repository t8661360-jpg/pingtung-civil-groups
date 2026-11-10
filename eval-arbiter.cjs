const rf=require('./round-fixes.js'), qu=require('./question-understanding.js'), ab=require('./answer-arbiter.js');
const qs=require('./eval-questions.cjs').concat(['候補監事有幾個','改選選票要留多久','理事辭職要寫什麼','選票怎麼樣算無效','合作社選票怎樣算無效','候補理事怎麼遞補','理事長可以連任幾屆']);
for(const q of qs){
 const a=rf.verifiedRoundAnswer(rf.normalizeQuestion(q),{}); const f=qu.resolve(q,{}); const u=qu.understand(q);
 const cands=[a&&a.title?a:null,f].filter(Boolean);
 if(!cands.length){console.log('--  '+q);continue;}
 const v=ab.judge(q,cands,u);
 const tag=v.answer?'OK ':v.clarify?'ASK':'REJ';
 const info=v.answer?v.answer.title:v.clarify?'反問':globalThis.__lastArbiter.scored.map(x=>x.title.slice(0,18)+'('+x.s+' '+x.reasons.join(';')+')').join(' | ');
 console.log(`${tag} ${q} => ${info.slice(0,110)}`);
}
