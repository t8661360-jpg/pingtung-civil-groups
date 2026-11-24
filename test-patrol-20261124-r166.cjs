const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
let bad=0;
const pos=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&a.title||'';if(!t.includes(k)){bad++;console.log('✗',q,'=>',t||'(無)','期望',k)}});
const no=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&a.title||'';if(t.includes(k)){bad++;console.log('✗ 誤觸',q,'=>',t)}});
/* 第166輪（社區發展協會換問法） */
pos(['社區發展協會的會址要在哪裡','社區發展協會的會址要設在哪','協會會址要在哪','社區發展協會的辦公室要在哪','會址要設在哪裡','協會的會址可以設在哪些地方','協會辦公室要放在哪裡'],'會址要設在哪裡');
no(['會址要在哪裡變更','協會會址可以設在住家嗎','會址要設在社區裡嗎','合作社會址要設在哪'],'會址要設在哪裡');
pos(['社區發展協會跟里辦公室誰比較大','社區發展協會跟村辦公室誰大','社區發展協會和里長誰的位階高','社區協會跟里辦公室誰管誰','社區發展協會跟村里辦公室有關係嗎'],'沒有上下關係');
pos(['社區發展協會要選里長當顧問嗎','社區發展協會要請里長當顧問嗎','社區協會要聘村長當名譽顧問嗎'],'顧問');
pos(['協會的會議紀錄要存在哪','社區發展協會的大會紀錄要放哪','理事會紀錄要自己留嗎','會議記錄要保管在哪','監事會紀錄要存放在哪裡'],'會議紀錄與帳冊保存');
no(['會議紀錄要報縣府嗎','解散會議紀錄怎麼寫'],'會議紀錄與帳冊保存');
const rr=A('理事長不想做了怎麼辦');
if(!rr||!/第54條/.test(JSON.stringify(rr.statutes||[]))){bad++;console.log('✗ 辭職答案應列人民團體法第54條')}
if(bad){console.log('失敗',bad);throw new Error('r166')}
console.log('r166 ok');
