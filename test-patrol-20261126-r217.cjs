/* 第217輪：入會退會、會員大會／理事會換問法 */
const r=require('./round-fixes.js');
let bad=0;
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const chk=(qs,m)=>{for(const q of qs){const a=A(q);if(!a||!String(a.title).includes(m)){bad++;console.log('✗',q,'=>',a&&a.title,'（應含）',m)}}};
chk(['理事開會不到怎麼辦','理事開會沒到怎麼辦','理事常常開會不到怎麼辦','理事都不來開會怎麼辦'],'連續兩次無故缺席');
chk(['理事會決議不服可以怎樣','大會的決議不服能怎樣','理事會的決定不同意可以怎麼辦'],'對決議不服');
chk(['大會要不要錄音','大會可以錄音嗎','理事會可以錄影嗎'],'開會可以錄音');
chk(['協會活動可以拍照嗎'],'拍照、錄影要經過同意');
for(const q of ['理事人數不到怎麼辦']){const a=A(q);if(a&&/連續兩次無故缺席/.test(a.title)){bad++;console.log('✗ 誤觸缺席',q)}}
if(bad){console.log('失敗',bad);process.exit(1)}console.log('r217 OK');
