const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
let bad=0;
const pos=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&a.title||'';if(!t.includes(k)){bad++;console.log('✗',q,'=>',t||'(無)','期望',k)}});
/* 第232輪：解散與清算 */
pos(['會員都跑光了協會自動解散嗎','會員全部都不來了協會算解散了嗎','會員都散了協會還在嗎','協會沒會員了會自己消失嗎'],'會員都走光了協會會自動解散嗎');
pos(['被命令解散要怎麼辦','縣府命令我們協會解散怎麼辦','被勒令解散了接下來怎麼辦','許可被廢止後協會要做什麼','限期整理沒完成會怎樣，接下來怎麼辦'],'被縣府解散或廢止許可之後');
pos(['解算人是誰'],'清算人由章程或會員大會決定');
pos(['我想退出協會跟協會解散不一樣吧','退會跟解散有什麼不同','個人退會和協會解散差在哪'],'退會和解散不一樣');
pos(['會員不來開會算退會嗎'],'會員不來開會算退會嗎');
pos(['協會被縣府廢止許可不服怎麼辦','協會被撤銷立案了怎麼辦'],'不服怎麼辦');
const a=r.verifiedRoundAnswer(r.normalizeQuestion('協會登記證怎麼註銷'),{});if(!/^解散後要把立案證書/.test(a.summary)){bad++;console.log('✗ 怎麼註銷開頭')}
if(bad){console.log('失敗',bad);process.exit(1)}console.log('r232 ok');
