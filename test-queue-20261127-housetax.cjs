const assert=require('node:assert/strict');
const r=require('./round-fixes.js');
const ask=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
for(const q of ['我要申請房屋稅減免','我家的房屋稅可以減免嗎','房屋稅減免要找誰','房子淹水可以減免房屋稅嗎','房屋稅怎麼申請減半','房屋稅可以免稅嗎']){
 const a=ask(q);assert.match(a?.title??'',/房屋稅減免要向稅捐稽徵機關申請/,q);
 assert.match(a.summary,/房屋稅條例第15條第3項/);assert.match(a.summary,/開徵四十日以前/);
}
for(const q of ['農會理事長怎麼選','協會會員代表怎麼選','合作社房屋稅','協會的會址可以免房屋稅嗎','協會的房屋稅地價稅可以減免嗎','寺廟房屋稅減免嗎','協會理事長怎麼選','協會的錢可以存在農會嗎']){
 const t=ask(q)?.title??'';assert.doesNotMatch(t,/農會會員代表由農事小組|房屋稅減免要向稅捐/,q);
}
console.log('farm rep / house tax routing OK');
