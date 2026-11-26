const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
let bad=0;
const pos=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&(a.title+a.summary)||'';if(!t.includes(k)){bad++;console.log('✗',q,'=>',a&&a.title||'(無)','期望',k)}});
const neg=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&(a.title+a.summary)||'';if(t.includes(k)){bad++;console.log('✗不應命中',q,'=>',a.title)}});
/* 第205輪（入會退會、會費、除名） */
pos(['會費收據要開嗎','會費要不要給收據','收會費一定要開收據嗎','入會費需要開收據嗎','常年會費要不要開收據'],'均應掣給正式收據');
pos(['會費可以用捐款名義收嗎','把會費改成捐款收可以嗎','會費改叫贊助款收可以嗎','會費可以算成捐款嗎','常年會費能不能改用捐款名義'],'分開列為不同的經費來源');
pos(['除名要開會嗎','除名程序','除名要怎麼做','會員除名的流程是什麼','除名要有哪些步驟'],'要經會員大會決議');
pos(['會員做壞事怎麼處罰','會員違規怎麼處罰','會員行為不當可以處分嗎'].slice(0,2),'只明文規定「除名」');
pos(['會員被除名理事長還是會員嗎','理事被除名還能當理事嗎'],'失去會員資格');
pos(['理事會可以開除會員嗎','理事長可以直接把會員踢掉嗎'],'不能直接開除');
neg(['會費要不要給收據','收會費要開收據嗎'],'協會花錢要有憑證');
neg(['合作社社員除名要開會嗎'],'人民團體法第14條');
neg(['會費可以減免嗎','會費逾期可以加收滯納金嗎'],'分開列為不同的經費來源');
if(bad){console.log('失敗',bad);process.exit(1)}console.log('r205 OK');
/* 沒帶會員證 */
const bad1=bad;
pos(['沒帶會員證可以開會嗎','忘記帶會員證可以投票嗎','會員證沒帶能參加大會嗎'],'審定的名冊');
neg(['會員證要發嗎','會員證掉了可以補發嗎'],'審定的名冊');
if(bad){console.log('失敗',bad);process.exit(1)}console.log('r205b OK');
