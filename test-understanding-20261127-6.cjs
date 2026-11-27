/* 理解把關 2026-11-27 第6輪（同一天另一個工作階段已推送第5輪，本輪只留不重複的部分）：
   1. 口語正規化 normalizeQuestionU6：家人代會員出席（我爸是會員，我可以代他去嗎）、開大會請縣府的人來、財務報表／帳給誰審。
   2. 貪心規則排除：「理事長不能自行解散協會」不接「解散後理事長還要負責嗎」這類問解散以後的問法。
   3. answer-guard.js：問解散以後的事而答案沒談解散、清算 → 選單；
      understandingGuard6：一句兩問其中一件答案完全沒談到、也沒有已核對答案 → 開頭明講沒有把握。 */
const fs=require('fs'),vm=require('vm');
const r=require('./round-fixes.js');
const list=JSON.parse(fs.readFileSync('./data/keyword-questions.json','utf8')).questions;
const win={keywordQuestions:()=>list};
const ctx={window:win,document:{querySelector:()=>null,getElementById:()=>null},console,localStorage:{getItem:()=>null,setItem(){}},
 verifiedRoundAnswer:r.verifiedRoundAnswer,normalizeQuestion:r.normalizeQuestion};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('./answer-guard.js','utf8'),ctx);
const g2=win.__understandingGuard2,g6=win.__understandingGuard6;
if(typeof g6!=='function')throw new Error('answer-guard.js 沒有匯出 __understandingGuard6');
let bad=0;
const N=q=>r.normalizeQuestion(q);
const A=q=>r.verifiedRoundAnswer(N(q),{});
const fail=(q,msg)=>{bad++;console.log('✗',q,'=>',msg)};
const MENU='您是不是要問以下相關的問題？',FIXED='抱歉，這個問題難倒小屏了';
const stub=(title,summary,extra)=>Object.assign({direct:true,category:'人民團體會務說明',title,summary:summary||title,steps:[],notes:[]},extra||{});
const normHas=(q,want)=>{const n=N(q);if(!n.includes(want))fail(q,'正規化應含「'+want+'」，實際「'+n+'」')};
const normNot=(q,no)=>{const n=N(q);if(n.includes(no))fail(q,'正規化不該含「'+no+'」，實際「'+n+'」')};
const titleIs=(q,want)=>{const a=A(q);if(!a||!String(a.title).includes(want))fail(q,'應為「'+want+'」，實際「'+(a&&a.title)+'」')};
const titleNot=(q,no)=>{const a=A(q);if(a&&String(a.title).includes(no))fail(q,'不該是「'+no+'」')};
const blocked=(g,q,a,want)=>{const x=g(q,a);if(!x)return fail(q,'沒有擋下：'+(a&&a.title));if(want&&!String(x.title).includes(want))fail(q,'應為「'+want+'」，實際「'+x.title+'」')};
const passes=(g,q,a)=>{const x=g(q,a);if(x)fail(q,'不該擋：'+(a&&a.title)+' → '+x.title)};

/* 1. 家人代會員出席：不能直接答「可以」，要導到「不能委託非會員代理」 */
for(const q of ['我爸爸是協會會員，他中風沒辦法去開會，我可以代他去嗎','我媽是會員，我可以代替她去開會員大會嗎','我可以代替我爸爸去開協會的會員大會嗎','我阿嬤是協會會員，可以由我去開大會嗎','我媽媽是會員，大會那天我可以替她投票嗎','我可以幫我阿公去大會簽到嗎','我岳父是會員，我能不能代他出席大會']){
 normHas(q,'會員的家人可以代替他出席會員大會嗎');titleIs(q,'不能委託非會員代理');}
for(const q of ['我爸是會員我也是會員，我可以代他出席大會嗎','我媽媽是會員，我自己也是會員，大會我可以替她投票嗎']){normNot(q,'家人可以代替');titleIs(q,'可以書面委託其他會員代理');}
for(const q of ['我爸爸過世了，他的會籍我可以繼承嗎','我不是會員，可以代我太太到協會大會投票嗎','我爸爸是合作社社員，我可以代他去開社員大會嗎','我爸爸是理事，我可以代他去開理事會嗎','我媽媽想加入協會要怎麼辦'])normNot(q,'家人可以代替他出席');

/* 2. 開大會請縣府的人來＝報請縣府派員列席 */
for(const q of ['開大會要不要請縣府的人來','開會員大會一定要請縣政府的人到場嗎','大會要邀請社會處長官出席嗎','改選要請縣府的承辦人來監票嗎','大會沒請縣府的人來有效嗎','會員大會需不需要找縣府人員列席']){
 const n=N(q);if(!/報請(縣府|縣政府|社會處)派員列席/.test(n))fail(q,'正規化應為報請派員列席，實際「'+n+'」');
 const a=A(q);if(!a||!/派員列席/.test(a.title))fail(q,'應答派員列席，實際「'+(a&&a.title)+'」');}
normNot('合作社社員大會要請縣府的人來嗎','報請');
normNot('請縣府的人幫忙查帳可以嗎','報請');

/* 3. 財務報表／帳給誰審＝決算要給誰審 */
for(const q of ['財務報表要給誰審','協會的帳誰來審','我們是去年才成立的協會，今年第一次要開大會，請問財務報表要給誰審','協會的帳目由誰審核','收支決算表誰審','帳冊要給誰看過才能送大會']){normHas(q,'決算要給誰審');titleIs(q,'決算要先給誰審');}
for(const q of ['合作社的帳要給誰審','財報誰核章','補助的帳誰審','財務報表什麼時候編？由誰審核？','勸募的帳誰審'])normNot(q,'的決算要給誰審');

/* 4. 「理事長不能自行解散協會」不接解散以後的問法 */
for(const q of ['解散後原本的理事長還要負責嗎','解散後理事長還有責任嗎','解散之後理事長要做什麼','協會已經解散了理事長還要管事嗎','協會解散以後理事長還能用協會名義嗎','協會收掉之後理事長還要處理什麼'])titleNot(q,'理事長不能自行解散');
for(const q of ['理事長可以自己解散協會嗎','理事長想把協會收掉可以嗎','理事長可以直接宣布解散嗎'])titleIs(q,'理事長不能自行解散');
const DIS=stub('理事長的權限看章程，重大事項不是理事長一個人說了算','理事長對外代表團體，權限依章程。');
for(const q of ['解散之後理事長要做什麼','協會解散以後理事長還有什麼事要辦','協會已經解散了理事長還要管事嗎'])blocked(g2,q,DIS,MENU);
passes(g2,'協會解散後公章要繳回嗎',stub('解散後立案證書、圖記要繳回','解散書表要繳回立案證書、圖記。'));
passes(g2,'解散後還要不要開會',stub('解散後還要不要開會','清算依章程或會員大會決議辦理。'));

/* 5. 一句兩問，其中一件答案完全沒談到、也沒有已核對答案 → 開頭明講沒有把握 */
const VIL=stub('村長可以當社區發展協會的理事長或理監事：人民團體法沒有禁止，但要經過選舉','可以。人民團體法沒有禁止村長擔任社區發展協會的理事長或理事、監事，兼任要經過選舉。');
const half=(q,a,lost)=>{const x=g6(q,a);if(!x||!/^您一次問了兩件事/.test(x.summary||''))return fail(q,'沒有說明另一半沒把握');if(!x.summary.includes(lost))fail(q,'沒有點出「'+lost+'」');if(x.title!==a.title)fail(q,'標題不該變');};
half('社區發展協會的理事長可以兼任村長嗎，還有可以兼社區巡守隊隊長嗎',VIL,'巡守隊');
half('社區發展協會的理事長可以兼任村長嗎？可以養流浪狗嗎？',VIL,'流浪狗');
const FREQ=stub('一般協會會員大會：定期會議每年一次','一般人民團體的會員大會，定期會議每年召開一次。');
half('會員大會多久開一次？會場可以放鞭炮嗎？',FREQ,'鞭炮');
half('會員大會多久開一次，另外停車場可以借給夜市嗎',FREQ,'夜市');
half('會場可以放鞭炮嗎？會員大會多久開一次？',FREQ,'鞭炮');
half('會員大會多久開一次？可以請樂隊表演嗎？',FREQ,'樂隊');
passes(g6,'會員大會多久開一次？',FREQ);
passes(g6,'會員大會多久開一次？定期會議是每年嗎？',FREQ);
passes(g6,'社區發展協會的理事長可以兼任村長嗎，還有理事可以嗎',VIL);

if(bad){console.log('失敗 '+bad);throw new Error('test-understanding-20261127-6 失敗 '+bad+' 項');}
console.log('全部通過');
