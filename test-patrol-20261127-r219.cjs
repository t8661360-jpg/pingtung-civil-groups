/* 第219輪：解散與清算（債權人申報公告）、縣市合併改制屆次 */
const r=require('./round-fixes.js');const c=require('./liquidation-creditor-notice.js');
let bad=0;
const chk=(qs,m,fn)=>{for(const q of qs){const a=fn(q);if(!a||!String(a.title).includes(m)){bad++;console.log('✗',q,'=>',a&&a.title,'（應含）',m)}}};
chk(['債權人要怎麼申報債權','清算人要公告嗎','清算要不要公告債權人','解散後債權人要去哪裡報債權','清算人要通知債權人嗎','債權申報期限是多久','清算人就任後要做什麼公告'],'協會解散要不要登報',q=>c.creditorNotice(q));
chk(['協會解散債權人逾期沒申報怎麼辦','債權人沒在期限內申報債權怎麼辦','債權人過了期限才來申報可以嗎'],'逾期沒申報債權',q=>c.creditorNotice(q));
for(const q of ['縣市合併或改制之後，協會的屆次和理事長連任怎麼算？','縣市升格後理事長還能連任嗎','改制後協會理事長連任']){const a=r.verifiedRoundAnswer(r.normalizeQuestion(q),{});if(a&&/連任以一次為限/.test(a.title)){bad++;console.log('✗ 縣市合併被答成一般連任',q)}}
chk(['理事長連任幾次','理事長可以連任嗎'],'連任',q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{}));
const a=c.creditorNotice('合作社債權人怎麼申報債權');if(!a||!/合作社/.test(a.title)){bad++;console.log('✗ 合作社分流')}
chk(['債權人申報期限內可以先還錢嗎','協會解散公告期間能不能先還債權人','清算人在申報期限內可以先清償債務嗎','解散後債權人還沒報完可以先還錢給他嗎'],'申報期限內能不能先還債權人',q=>c.liquidationFollowup(q));
chk(['社團法人清算完結後要向法院報告嗎','已辦法人登記的協會清算完了要報法院什麼','社團法人清算完畢收支表要報給誰','法人協會清算完成要向法院聲報嗎'],'社團法人清算完結後',q=>c.liquidationFollowup(q));
for(const q of ['協會解散後會員的會費可以退嗎','清算要多久','清算完了要跟誰報告','合作社清算完結要報法院嗎','公司債權人可以先還錢嗎']){const a=c.liquidationFollowup(q);if(a){bad++;console.log('✗ 誤觸',q,a.title)}}
if(bad){console.log('失敗',bad);process.exit(1)}console.log('r219 OK');
