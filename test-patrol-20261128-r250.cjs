/* 第250輪：工作人員（工作規則30人門檻、薪水編預算、「X是理監事可以嗎」） */
const r=require('./round-fixes.js');
const zlib=require('zlib'),fs=require('fs');
const st=JSON.parse(zlib.gunzipSync(fs.readFileSync('data/statutes.json.gz')));
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
let bad=0;
const pos=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&a.title||'';if(!t.includes(k)){bad++;console.log('✗',q,'=>',t||'(無)','期望',k)}});
const neg=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&a.title||'';if(t.includes(k)){bad++;console.log('✗反',q,'=>',t)}});
pos(['協會雇人要多少人才要訂工作規則','協會員工幾人要訂工作規則','協會要訂工作規則嗎','工作規則要送縣府嗎','協會有訂工作規則的義務嗎','員工滿30人要怎樣','員工超過三十人要訂什麼','工作規則要報縣府備查嗎','我們協會請了35個員工要不要訂工作規則'],'協會要不要訂工作規則');
pos(['工作人員的薪資要不要編預算','協會人事費要編預算嗎','薪水要不要列入預算','聘員工的錢要編進預算嗎','總幹事的薪水要編預算嗎','員工薪資要不要編進年度預算'],'工作人員的薪水要不要編預算');
pos(['總幹事是理監事可以嗎','會計是監事可以嗎','出納是理監事可以嗎','幹事是理事可以嗎','總幹事由理事擔任可以嗎'],'理事、監事可以兼任工作人員嗎');
neg(['合作社要訂工作規則嗎','工會的工作規則怎麼訂','理事出席費要編預算嗎','志工車馬費要編預算嗎','協會年度預算怎麼編'],'協會要不要訂工作規則');
neg(['理事出席費要編預算嗎','志工車馬費要編預算嗎','協會年度預算怎麼編','員工薪水超支怎麼辦'],'工作人員的薪水要不要編預算');
const L=st.laws;
const chk=(pc,n,s)=>{const a=L[pc]&&L[pc].articles[n];if(!a||!a.includes(s)){bad++;console.log('✗法條',pc,n,s)}};
chk('N0030001','70','三十人以上者');chk('N0030001','70','報請主管機關核備後並公開揭示');chk('N0030001','71','違反法令之強制或禁止規定');chk('N0030001','4','在縣（市）為縣（市）政府');
chk('D0050097','11','編造年度工作計畫及收支預算表');chk('D0050097','11','提經會員（會員代表）大會通過後');
chk('D0050096','7','提會員（代表）大會通過後實施');chk('D0050096','8','由理事會訂定實施');chk('D0050096','4','選任之職員');
if(bad){console.log('失敗',bad);throw new Error('r250')}console.log('r250 OK');
