const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
let bad=0;
const pos=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&a.title||'';if(!t.includes(k)){bad++;console.log('✗',q,'=>',t||'(無)','期望',k)}});
/* 第231輪：志工 */
pos(['志工服務時間要記錄嗎','志工做多久要記下來嗎','志工的服務紀錄要怎麼記','志工的服務時間要登記嗎','志工服務一定要記錄嗎'],'志工服務時數怎麼登記');
pos(['志工每天最多可以服務幾小時','志工服務時間有限制嗎'],'志工的服務時間有限制嗎');
pos(['志工手冊跟紀錄冊是什麼'],'志願服務證及紀錄冊');
pos(['志工滿多少小時有獎','志工做幾小時有獎牌','志工服務滿多久可以領獎'],'志工獎勵');
pos(['志工訓練沒上可以服務嗎','志工沒受訓可以服務嗎','志工訓練沒去上課會怎樣'],'志工要接受教育訓練嗎');
if(bad){console.log('失敗',bad);process.exit(1)}console.log('r231 ok');
