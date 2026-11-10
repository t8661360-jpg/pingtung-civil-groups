const rf=require('./round-fixes.js'), qu=require('./question-understanding.js');
const qs=require('./eval-questions.cjs');
let n=0,rfHit=0,quHit=0,none=0;
for(const q of qs){n++;
 const a=rf.verifiedRoundAnswer(rf.normalizeQuestion(q),{});
 const f=qu.resolve(q,{});
 const u=qu.understand(q);
 let src='--',title='';
 if(a&&a.title){src='RF';title=a.title;rfHit++;} else if(a==='KB:解散'){src='KB';title='解散KB';rfHit++;}
 else if(f){src='QU';title=f.title;quHit++;} else none++;
 console.log(`${src} [${u.focus}/${u.domain}] ${q} => ${title.slice(0,40)}`);
}
console.log(`\n規則命中 ${rfHit}, 理解層命中 ${quHit}, 落到知識庫/承辦 ${none}, 共 ${n}`);
