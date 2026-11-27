const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
let bad=0;
const pos=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&a.title||'';if(!t.includes(k)){bad++;console.log('✗',q,'=>',t||'(無)','期望',k)}});
const neg=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&a.title||'';if(t.includes(k)){bad++;console.log('✗反',q,'=>',t)}});
/* 第234輪：勸募與補助 */
pos(['會員自己捐錢算不算勸募','會員捐款算勸募嗎','理事自己出錢算不算勸募','幹部自己捐錢給協會算勸募嗎','監事自己捐款算不算募款'],'向會員募款或收會員捐款');
pos(['協會不是法人可以募款嗎','沒立案的社團可以勸募嗎','未立案的團體可以向外募款嗎','我們沒有登記法人能不能勸募'],'');
pos(['協會不是法人可以募款嗎','沒立案的社團可以勸募嗎'],'能發起勸募的只有四種團體');
pos(['募款申請書要填啥','勸募申請書要寫什麼','勸募申請書要填哪些內容'],'申請勸募許可要附的文件');
pos(['募款時誰可以簽收據','募款收據誰簽名','勸募收據由誰簽發'],'勸募收據誰簽發');
pos(['我們社團想辦活動募款要申請嗎'],'向社會大眾募款要先申請許可');
/* 反向：原本答案不能被搶走 */
neg(['我是會員算不算入會成功','我有沒有入會成功'],'勸募');
pos(['我是會員算不算入會成功'],'有沒有入會成功');
pos(['勸募的錢可以全部拿來辦活動嗎'],'勸募的錢要用在許可的用途');
pos(['捐款收據誰可以簽發'],'捐款收據誰可以簽發');
pos(['理事長可以自己發起募款嗎'],'理事長不能自行以團體名義募款');
pos(['我自己捐錢給協會要開收據嗎'],'理事或會員自己捐錢給協會');
/* 條文原文核對 */
const z=require('zlib'),fs=require('fs');const d=JSON.parse(z.gunzipSync(fs.readFileSync(__dirname+'/data/statutes.json.gz')));const L=d.laws||d;
const has=(c,n,k)=>{const x=(L[c].articles[n]||'');if(!x.includes(k)){bad++;console.log('✗原文',c,n,k)}};
has('D0050138','16','勸募許可文號');has('D0050138','6','向會員或所屬人員募集財物');has('D0050138','5','公益性社團法人');has('D0050146','9','種類、數量及時價');has('D0050146','10','至少保存五年');has('D0050097','17','領款憑證');
if(bad){console.log('失敗',bad);process.exit(1)}console.log('r234 ok');
