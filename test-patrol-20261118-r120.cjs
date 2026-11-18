/* 第120輪：社區發展協會基本問題與理事／監事任期比較（人團法§12、17、20、27、54；選罷辦法§28；民法§53；要點§4、§17） */
const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
let bad=0;
const txt=a=>a&&a.title?(a.title+a.summary+JSON.stringify((a.statutes||[]).map(x=>x.title))):'';
const yes=[
['監事任期可以比理事長長嗎','都不得超過四年'],['監事任期可以比理事長短嗎','沒有規定誰要比較長'],['監事跟理事長任期要一樣嗎','不一定要一樣'],['監事的任期和理事長一樣嗎','不一定要一樣'],['理事長任期比監事長可以嗎','第20條'],['理事跟監事任期一樣嗎','不一定要一樣'],['理事和監事的任期要相同嗎','第20條'],
['社區發展協會是做什麼的','依章程推動社區發展工作'],['社區發展協會的任務是什麼','第12條第5款'],['社區協會的工作內容有哪些','社區發展工作要點第4點'],['社區發展協會要有哪些工作項目','洽所在地鄉鎮市公所'],['社區發展協會的業務範圍','章程'],['社區發展協會要做哪些事','章程'],
['社區發展協會一定要辦活動嗎','沒有規定'],
['社區居民一定要加入社區發展協會嗎','沒有規定社區居民一定要加入'],['不加入社區協會可以嗎','沒有強制'],['社區的住戶可以不參加協會嗎','沒有強制'],
['不是本社區的人能當會員嗎','依協會章程'],['社區發展協會可以收別的社區的人當會員嗎','章程'],['別的社區的人可以加入社區協會嗎','章程'],
];
for(const [q,k] of yes){const a=A(q);const t=txt(a);if(!a||!t.includes(k)){bad++;console.log('FAIL',q,'=>',a&&a.title,'缺',k)}}
const no=[
['監事任期幾年','任期：都不得超過四年'],['社區發展協會要開幾次理事會','社區發展協會的任務'],['社區發展協會每年要做什麼','社區發展協會的任務'],['社區發展協會要辦什麼活動','不一定要加入'],['社區發展協會理事長可以連任嗎','任期：都不得超過四年'],['社區發展協會會員怎麼退會','不一定要加入'],['合作社監事任期比理事長長嗎','任期：都不得超過四年'],
];
for(const [q,k] of no){const a=A(q);const t=a&&a.title||'';if(t.includes(k)){bad++;console.log('FAIL(誤觸)',q,'=>',t)}}
const z=require('zlib'),fs=require('fs');const d=JSON.parse(z.gunzipSync(fs.readFileSync('data/statutes.json.gz')));
const must=[['D0050091','20','不得超過四年'],['D0050091','20','理事長之連任，以一次為限'],['D0050091','17','互選之'],['D0050091','12','任務'],['D0050091','27','章程之訂定與變更'],['D0050091','54','三十日內'],['B0000001','53','全體社員過半數之出席'],['B0000001','53','四分三以上'],['D0050093','28','第一次理事會之日起計算']];
for(const [c,n,k] of must){const t=d.laws[c]&&d.laws[c].articles[n]||'';if(!t.includes(k)){bad++;console.log('FAIL(原文)',c,n,k)}}
/* index.html 內建答案不得再有舊說法 */
const html=fs.readFileSync('index.html','utf8');
if(/出席四分之三以上同意，或全體會員三分之二以上書面同意/.test(html)){bad++;console.log('FAIL index.html 仍有漏「全體社員過半數出席」的舊說法')}
if(/同一個社區原則上只成立一個協會/.test(html)){bad++;console.log('FAIL index.html 仍有無依據的「只成立一個協會」')}
if(bad){console.log('共',bad,'項失敗');process.exit(1)}
console.log('第120輪測試全數通過：正向',yes.length,'反向',no.length);
