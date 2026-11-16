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

{const z=require('zlib');const d=JSON.parse(z.gunzipSync(fs.readFileSync(__dirname+'/data/statutes.json.gz')));
 for(const [c,n,a] of [['B0000001','民法','148'],['I0050021','個人資料保護法','1'],['G0340091','印花稅法','1']]){const l=d.laws[c];if(!l||l.name!==n||!l.articles[a]){console.error('missing law',n);bad++;}}}
{const x=r.verifiedRoundAnswer(r.normalizeQuestion('理事會可以舉手表決嗎'),{});if(!x||!/非法規規定|常見/.test(x.summary)){console.error('舉手 label');bad++;}}
if(!/300人也可以適用/.test(kb)){console.error('300');bad++;}
if(bad)throw new Error('patrol67 failed '+bad);console.log('ok');
