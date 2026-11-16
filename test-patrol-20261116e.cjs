const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const yes=['大會可以臨時動議修改章程嗎','臨時動議可以罷免理事嗎','臨時動議可以賣房子嗎','現場提案要解散協會可以嗎','開會當天臨時提案改章程行不行'];
const no=['臨時動議是什麼','臨時動議要幾個人附議','合作社臨時動議可以修章程嗎','公會臨時動議可以罷免嗎'];
let bad=0;
for(const q of yes){const x=A(q);if(!x||!x.direct||!/要看通知、議程和章程/.test(x.title)){console.error('FAIL',q,x&&x.title);bad++;}}
for(const q of no){const x=A(q);if(x&&/要看通知、議程和章程/.test(x.title||'')){console.error('OVERTRIGGER',q);bad++;}}
const g=r.verifiedRoundAnswer(r.normalizeQuestion('監事會怎麼監察協會的經費收支'),{});
if(!g||!/第17條/.test(JSON.stringify(g))&&bad++)console.error('audit');
const fs=require('fs');const kb=fs.readFileSync(__dirname+'/data/knowledge.json','utf8');
for(const t of ['可以用臨時動議來修改章程、罷免理監事或賣房子嗎？','可以在會員大會用臨時動議提出修改章程嗎？']){if(kb.includes('"title":"'+t+'"')){console.error('KB still has',t);bad++;}}
if(/不能由理事會指定支持者/.test(kb)){console.error('KB 指定支持者');bad++;}
if(bad)throw new Error('patrol67 failed '+bad);console.log('ok');
