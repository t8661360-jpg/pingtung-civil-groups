/* 理解把關 2026-11-28 第2輪：臨時加議案＝臨時動議、疫情/天災順延任期＝暫緩改選、監事是理事的配偶＝親屬、
   協會＋合作社同問退出＝兩邊各答、兩件事只答一半＝選單 */
const fs=require('fs'),vm=require('vm');
const r=require('./round-fixes.js');
const list=JSON.parse(fs.readFileSync('./data/keyword-questions.json','utf8')).questions;
const win={keywordQuestions:()=>list};
const ctx={window:win,document:{querySelector:()=>null,getElementById:()=>null},console,localStorage:{getItem:()=>null,setItem(){}},
  verifiedRoundAnswer:r.verifiedRoundAnswer,normalizeQuestion:r.normalizeQuestion};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('./answer-guard.js','utf8'),ctx);
const g10=win.__understandingGuard10;
if(typeof g10!=='function')throw new Error('answer-guard.js 沒有匯出 __understandingGuard10');
let bad=0;
const N=q=>r.normalizeQuestion(q);
const A=q=>r.verifiedRoundAnswer(N(q),{});
const fail=(q,msg)=>{bad++;console.log('✗',q,'=>',msg)};
const titleHas=(q,want)=>{const a=A(q);if(!a||!new RegExp(want).test(a.title))fail(q,'應為「'+want+'」，實際「'+(a&&a.title)+'」')};
const titleNot=(q,no)=>{const a=A(q);if(a&&new RegExp(no).test(a.title))fail(q,'不該是「'+(a&&a.title)+'」')};
const normNot=(q)=>{const n=N(q);if(n!==q)fail(q,'不該被改寫：'+n)};
const stub=(title,summary,extra)=>Object.assign({direct:true,category:'人民團體會務說明',title,summary:summary||title,steps:[],notes:[]},extra||{});
const blocked=(q,a)=>{const x=g10(q,a);if(!x)fail(q,'沒有擋下：'+(a&&a.title))};
const passes=(q,a)=>{const x=g10(q,a);if(x)fail(q,'不該擋：'+(a&&a.title)+' → '+x.title)};

/* 1. 臨時加議案、議程沒有的案子現場提 */
for(const q of ['大會當天可以臨時加提案嗎','議程上沒有的案子現場提可以嗎','開會時有人臨時要加議題要怎麼辦','會議通知沒寫的議案當天可以討論嗎','議程可以當場增加項目嗎','會員大會的議程可以臨時加議案嗎','大會可以臨時提動議嗎'])titleHas(q,'大會的臨時動議');
for(const q of ['大會當場用臨時動議換掉理事長可以嗎','會員代表大會臨時動議撤換會長可以嗎','臨時動議可以修改章程嗎','開會通知要幾天前寄','會員大會的議程要在幾天前通知','緊急召開臨時會議要多久前通知'])titleNot(q,'^大會的臨時動議：法規沒有專條');
/* 2. 疫情、天災期間任期延長、順延 */
for(const q of ['因為颱風理事長任期可以延長嗎','疫情期間理監事任期可以順延嗎','理事長任期可以因為疫情延長嗎','天災理事任期可以展延嗎','地震後任期可以延後嗎','疫情任期能不能延一年'])titleHas(q,'天災、疫情能不能暫緩改選');
for(const q of ['理事長任期是幾年','理事長任期可以連任幾次','疫情期間理事長任期怎麼算'])titleNot(q,'天災、疫情能不能暫緩改選');
/* 3. 監事是理事的配偶 */
for(const q of ['監事可以同時是理事的配偶嗎，如果不行已經當選了怎麼辦','理事長跟監事是夫妻，兩個都當選了怎麼辦','理事長的太太同時當選監事可以嗎','老公當理事老婆同時當選監事可以嗎','理事跟監事同時是兄弟可以嗎'])titleHas(q,'親屬可以同時當理事或監事');
for(const q of ['一個人同時當選理事和監事怎麼辦','同時當選理事跟監事要選哪個'])titleHas(q,'一個人同時當選理事和監事');
/* 4. 協會＋合作社同問退出：不可以被「差別」或單答合作社吃掉（瀏覽器環境才有 resolvePart，這裡只驗證出兩邊分開答或選單、不是原答案） */
const DIFF=stub('協會、公會、合作社的差別：目的不同，依據的法律也不同');
const COOP=stub('合作社社員可以退社：年度終了時退，三個月前提出，股金依章程退還');
for(const q of ['合作社社員跟協會會員退出有什麼差別','協會會員要退出跟合作社社員要退出要怎麼辦','協會跟合作社的會員退出方式有什麼不一樣','協會退會跟合作社退社一樣嗎','社員退社和會員退會的差異'])for(const a of [DIFF,COOP])blocked(q,a);
for(const q of ['合作社社員要退社怎麼辦','協會會員要退會怎麼辦','合作社社員退社股金怎麼退','協會跟合作社有什麼差別','協會和合作社哪個適合做生意'])passes(q,COOP);
/* 5. 兩件事只答一半 → 選單；兩件事都有答到不擋 */
const BANK=stub('銀行印鑑要辦變更','改選後提用存款要由新的負責人蓋章，銀行存摺和印章、印鑑要辦變更。');
const FEE=stub('調整會費要不要修章','入會費、常年會費的標準和繳納方式要訂入章程，會費數額要經會員大會通過。');
const NUM=stub('理事、監事人數可以修改嗎','可以，但要修改章程，而且不能超過上限、低於下限。名額要經大會通過。');
for(const [q,a] of [['理事長要卸任了，交接清冊要寫什麼，還有銀行存摺印章要怎麼換',BANK],['協會想增加會員代表名額，另外也想調高會費，一起提大會可以嗎',FEE],['想改章程增加監事名額，還有入會費要調高，可以同一次大會嗎',FEE],['想增加理事名額，另外也想調高會費，一起提大會可以嗎',NUM]])blocked(q,a);
const HAND=stub('新舊任理事長要辦交接','列清冊，新任就任後15日內由新理事長會同監交人接收完畢，清冊要列立案證書、圖記、財產。');
passes('交接的時候要列哪些東西，還有立案證書放哪裡',HAND);
passes('理事長要卸任了，交接清冊要寫什麼',HAND);
passes('想調高會費要不要修章',FEE);
if(bad)throw new Error('test-understanding-20261128-3 失敗 '+bad+' 題');
console.log('understanding-20261128-3 ok');
