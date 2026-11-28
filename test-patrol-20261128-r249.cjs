/* 第249輪：章程與會址（組織區域） */
const r=require('./round-fixes.js');
const zlib=require('zlib'),fs=require('fs');
const st=JSON.parse(zlib.gunzipSync(fs.readFileSync('data/statutes.json.gz')));
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
let bad=0;
const pos=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&a.title||'';if(!t.includes(k)){bad++;console.log('✗',q,'=>',t||'(無)','期望',k)}});
const neg=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&a.title||'';if(t.includes(k)){bad++;console.log('✗反',q,'=>',t)}});
pos(['組織區域是什麼意思','協會的組織區域指什麼','什麼是組織區域'],'組織區域是什麼意思');
pos(['協會組織區域可以跨縣市嗎','組織區域可以跨到別的縣嗎','我們協會組織區域想跨縣市可以嗎'],'組織區域可以跨縣市嗎');
neg(['組織區域可以改嗎','組織區域要寫在章程嗎','社區發展協會的組織區域是什麼','名譽理事長要設籍在組織區域裡嗎'],'組織區域是什麼意思');
neg(['組織區域可以改嗎','社區發展協會組織區域可以跨村里嗎'],'組織區域可以跨縣市嗎');
const P=st.laws.D0050091.articles;
const chk=(n,s)=>{if(!P[n]||!P[n].includes(s)){bad++;console.log('✗法條',n,s)}};
chk(5,'以行政區域為原則，並得分級組織');chk(5,'向當地主管機關辦理');chk(12,'三、組織區域');chk(6,'報經主管機關核准者');
if(bad){console.log('失敗',bad);throw new Error('r249')}console.log('r249 OK');
