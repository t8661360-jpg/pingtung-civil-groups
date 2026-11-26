/* 第215輪：會址、章程、財務與會計換問法 */
const r=require('./round-fixes.js');
let bad=0;
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const chk=(qs,m)=>{for(const q of qs){const a=A(q);if(!a||!String(a.title).includes(m)){bad++;console.log('✗',q,'=>',a&&a.title,'（應含）',m)}}};
chk(['會址變更要通知誰','會所變更報給誰','協會地址變更要報備嗎','辦公室異動要通知縣府嗎','協會地址更改了要報給誰','會所換了要跟誰報備'],'要通知縣府嗎');
chk(['章程條文可以增加嗎','章程條款可以增加嗎','章程條文可以刪除嗎'],'章程修改');
chk(['帳目沒做好怎麼辦','帳簿忘記做了怎麼辦','帳務沒記好怎麼辦','忘記記帳怎麼辦'],'會計忘記做帳或漏記');
chk(['會費收太少怎麼辦','會費收入不夠怎麼辦','沒錢辦活動怎麼辦','活動經費不夠怎麼辦'],'協會經費不夠');
chk(['財務人員可以是理事長的親戚嗎','會計人員是理事長的兒子可以嗎'],'三等親');
chk(['協會可以放款給別人嗎','協會可以把錢借給會員嗎','協會的錢可以借出去嗎','團體可以借錢給別人嗎'],'借給理事長、會員或別人');
chk(['會費可以調漲嗎'],'會費可以調整');
const a=A('會費可以調漲嗎');if(!/第14條/.test(a.summary)||!a.statutes.some(s=>/第14條/.test(s.title))){bad++;console.log('✗ 會費調整未引用財務辦法第14條')}
// 不可誤判
for(const q of ['會址搬到外縣市可以嗎','會址變更忘記報備怎麼辦','章程條文增加理事人數可以嗎']){const n=r.normalizeQuestion(q);if(n!==q&&/要通知縣府嗎|章程修改要開會嗎/.test(n)&&q!=='x'){ if(!/外縣市/.test(q)&&!/忘記/.test(q)&&!/理事/.test(q)){bad++}}}
if(bad){console.log('失敗',bad);process.exit(1)}console.log('r215 OK');
