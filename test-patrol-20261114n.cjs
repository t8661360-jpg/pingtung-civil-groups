const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const yes=[['志工一定要加入志工隊嗎','自由意志'],['志工一定要加入嗎','自由意志'],['志工訓練要多少小時','沒有寫時數'],['志工訓練誰辦','運用志工的單位'],['志工出勤要記錄嗎','服務紀錄冊'],['志工跟會員有什麼不一樣','兩回事'],['志工可以拒絕服務嗎','自由意志'],['志工誰來管理','指定專人'],['志願服務運用單位是啥','經政府立案團體'],['招募志工要公告嗎','公告'],['運用志工要先跟縣府講嗎','備案'],['志工年資多久','三百小時'],['外籍人士可以當志工嗎','國籍'],['退休人員可以當志工嗎','國籍'],['志工隊長是誰選的','沒有規定'],['志工活動途中發生車禍','保單'],['志工背心','沒有規定志工要穿']];
const same=[['志工不想做了要怎麼辦','志工想退出'],['志工要不要做考核','考核'],['志工受傷誰負責','意外'],['志工做錯事運用單位要賠嗎','賠償']];
const no=['協會會員跟會員有什麼不一樣','工會志工要訓練嗎','合作社志工','社區發展協會志工隊','魅力社區志工','協會理事長誰選的'];
let bad=0;
for(const [q,k] of yes){const x=A(q);if(!x||!x.direct||!(x.summary+x.title).includes(k)){console.error('FAIL',q,x&&x.title);bad++;}}
for(const [q,k] of same){const x=A(q);if(!x||!(x.title+x.summary).includes(k)){console.error('REGRESS',q,x&&x.title);bad++;}}
for(const q of no){const x=A(q);if(x&&/志願服務法|志工/.test((x.title||'')+JSON.stringify(x.statutes||''))&&/志願服務法第(3|6|7|9|11|13)條/.test(JSON.stringify(x.statutes||''))&&!/志工|志願/.test(q)){console.error('MISFIRE',q,x.title);bad++;}}
if(bad)throw new Error('patrol47 failed '+bad);console.log('ok');
