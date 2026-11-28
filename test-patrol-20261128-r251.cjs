/* 第251輪：解散與清算（倒了誰負責＝債務責任、會員都走光、「會員大會被撤銷許可」不是會員除名） */
const r=require('./round-fixes.js');
const zlib=require('zlib'),fs=require('fs');
const st=JSON.parse(zlib.gunzipSync(fs.readFileSync('data/statutes.json.gz')));
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
let bad=0;
const pos=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&a.title||'';if(!t.includes(k)){bad++;console.log('✗',q,'=>',t||'(無)','期望',k)}});
const neg=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&a.title||'';if(t.includes(k)){bad++;console.log('✗反',q,'=>',t)}});
pos(['協會倒了誰負責','協會倒閉誰要還錢','協會倒了誰賠','社團倒了後誰負責','協會倒了以後誰來還債','協會解散欠廠商的錢誰要還','協會解散了誰來負責債務','協會欠債誰負責'],'負責');
pos(['會員都走光了怎麼辦','會員全部退會了協會怎麼辦','協會沒有會員了怎麼辦','會員都不來了協會還能存在嗎','所有會員都退會協會還在嗎','會員一個都沒有了怎麼辦'],'會員都走光了協會會自動解散嗎');
neg(['沒有召開會員大會被撤銷許可怎麼辦','會員大會被撤銷要怎麼辦'],'會員的資格可以被取消嗎');
pos(['會員被取消資格','會員的會籍可以被拿掉嗎'],'會員的資格可以被取消嗎');
neg(['會員要退會怎麼辦','我想退會','會員被除名了怎麼辦'],'會員都走光了協會會自動解散嗎');
neg(['協會倒了要怎麼辦','協會倒了財產給誰','協會解散財產給誰'],'負責');
const L=st.laws;
const chk=(pc,n,s)=>{const a=L[pc]&&L[pc].articles[n];if(!a||!a.includes(s)){bad++;console.log('✗法條',pc,n,s)}};
chk('D0050091','59','五、會員（會員代表）大會決議解散者');chk('D0050091','27','五、團體之解散');chk('D0050091','27','應有會員（會員代表）過半數之出席');
chk('B0000001','35','董事應即向法院聲請破產');chk('B0000001','35','應負賠償責任');chk('D0050091','58','廢止許可');
if(bad){console.log('失敗',bad);throw new Error('r251')}console.log('r251 OK');
