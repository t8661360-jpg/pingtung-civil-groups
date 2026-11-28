/* 第256輪：稅務（沒有統編開收據、稅單寄舊地址、免稅證明） */
const r=require('./round-fixes.js');
const zlib=require('zlib'),fs=require('fs');
const st=JSON.parse(zlib.gunzipSync(fs.readFileSync('data/statutes.json.gz')));
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
let bad=0;
const pos=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&a.title||'';if(!t.includes(k)){bad++;console.log('✗',q,'=>',t||'(無)','期望',k)}});
pos(['沒有統編可以開收據嗎','還沒申請統編能不能收會費開收據','沒統編可不可以開收據給會員','協會還沒有統編，收據怎麼開','統編還沒下來可以開收據嗎','協會沒有統一編號可以開收據嗎','我們還沒有統編收會費要怎麼開收據'],'還沒有統編可以開收據');
pos(['稅單寄到舊地址怎麼辦','國稅局的信寄到舊會址怎麼辦','稅務通知寄到舊的地址怎麼辦','扣繳憑單寄到舊會址怎麼辦','協會搬家了稅單還寄到舊地址'],'稅籍或扣繳單位資料要不要改');
pos(['免稅證明要去哪裡申請','協會免稅證明哪裡辦','免稅證明去哪申請'],'免稅證明要去哪裡申請');
pos(['協會免稅要多久才核准'],'協會免稅要多久才核准');
pos(['協會沒有統一編號可以嗎'],'向國稅局申請統一編號');
pos(['向店家買東西要不要打統編'],'打統編');
const L=st.laws;
const a=L['D0050097'].articles['17'];if(!a.includes('正式收據')){bad++;console.log('✗法條 F17')}
const x=A('沒有統編可以開收據嗎');if(!x||!(x.statutes||[]).some(s=>/財務處理辦法第17條/.test(s.title))){bad++;console.log('✗ 缺F17')}
if(bad){console.log('失敗',bad);throw new Error('r256')}console.log('r256 OK');
