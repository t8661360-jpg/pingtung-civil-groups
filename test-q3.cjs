const r=require('./round-fixes.js');
const q='常年會就是會員大會嗎';
const a=r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
console.log('Q:',q);
console.log('A:',a);
if(a) console.log('Title:',a.title);
console.log('Has "同":',a&&a.title.includes('同'));
