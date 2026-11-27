const assert=require('node:assert/strict');
const r=require('./round-fixes.js');
const ask=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
for(const q of ['農會理事長怎麼選','農會理事長是怎麼產生的','農會的理事要怎麼選','農會改選理事長要怎麼選','農會理監事怎麼改選','農會的常務監事怎麼選出來']){
 const a=ask(q);assert.match(a?.title??'',/農會理事長由理事互選產生/,q);
 assert.match(a.summary,/農會法第19條第3項/);assert.match(a.summary,/08-7320415/);
 assert(a.statutes.some(s=>s.title==='農會法第19條'));
}
for(const q of ['公司董事改選要報哪裡','公司董事長改選要去哪裡登記','我們公司的董事換人了要報縣府嗎','公司改選董事要向誰申請變更','公司監察人改選要報哪個單位']){
 const a=ask(q);assert.match(a?.title??'',/公司董事改選不是報縣府社會處/,q);
 assert.match(a.summary,/公司法第5條第1項/);
}
for(const q of ['協會理事長怎麼選','公司行號可否入會','協會的錢可以存在農會嗎','農會歸誰管','漁會理事長怎麼選']){
 const a=ask(q);assert.doesNotMatch(a?.title??'',/農會理事長由理事互選|公司董事改選不是/,q);
}
for(const q of ['協會的錢可以存在農會嗎','協會的錢可以存農會嗎','協會可以在農會開戶嗎','社區發展協會的錢可以存在農會嗎','協會的錢可以存在信用合作社嗎','我們協會可以在郵局開帳戶嗎','協會經費能不能存漁會']){
 const a=ask(q);assert.match(a?.title??'',/^可以：協會的錢可以存在/,q);
 assert.match(a.summary,/社會團體財務處理辦法第16條/);assert.match(a.summary,/共同蓋章（同辦法第17條）/);
}
for(const q of ['協會理事長換人了農會帳戶要怎麼辦','協會的錢可以放在理事長的戶頭嗎','協會可以跟農會借錢嗎','協會的錢要存在哪裡','合作社社員股金可以存農會嗎']){
 const a=ask(q);assert.doesNotMatch(a?.title??'',/^可以：協會的錢可以存在/,q);
}
for(const q of ['農會會員代表怎麼選','農會總幹事怎麼選出來的'])assert.doesNotMatch(ask(q)?.title??'',/農會理事長由理事互選/,q);
for(const q of ['協會理事長換人了農會帳戶要怎麼辦','協會在漁會的戶頭要換負責人嗎','理事長改選後農會存摺印鑑要換嗎'])assert.match(ask(q)?.title??'',/^要。.*(負責人|印鑑)/,q);
console.log('farm/company routing OK');
