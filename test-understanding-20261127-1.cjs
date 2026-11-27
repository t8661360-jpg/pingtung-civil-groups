/* 理解強化第1輪（2026-11-27）：配錯題與把關
   1. 同音錯字先改回正字（理是長＝理事長）
   2. 「成立協會要找幾個人」不是查名冊
   3. 個人福利（低收入戶）、公寓大廈管委會：業務分流，不硬配協會答案
   4. 理事長過世由配偶「繼承／接任」不是親屬同時任職
   5. 「開會通知幾天前要寄」是問期限，不是「寄出去算不算到達」
   6. answer-guard：兩種團體比較、一句問兩件事、自我介紹＋問題 */
const r=require('./round-fixes.js');
const vm=require('node:vm');const fs=require('node:fs');const path=require('node:path');
let bad=0;
const R=q=>{const a=r.verifiedRoundAnswer(r.normalizeQuestion(q),{});return a&&typeof a==='object'?a:null};
const has=(qs,m)=>{for(const q of qs){const a=R(q);if(!a||!String(a.title).includes(m)){bad++;console.log('✗',q,'=>',a&&a.title,'（應含）',m)}}};
const not=(qs,m)=>{for(const q of qs){const a=R(q);if(a&&String(a.title).includes(m)){bad++;console.log('✗',q,'=>',a.title,'（不應含）',m)}}};

/* 1 錯字 */
for(const [q,w] of [['理是長辭職了怎麼辦','理事長辭職'],['裡事長可以連任嗎','理事長'],['理市長任期幾年','理事長任期'],['總幹是可以由理事兼任嗎','總幹事'],['監是會多久開一次','監事會'],['協會改撰要準備什麼','改選'],['會員大匯怎麼開','會員大會'],['理監是有薪水嗎','理監事']]){
 const n=r.normalizeQuestion(q);if(!n.includes(w)){bad++;console.log('✗ 錯字未修正',q,'=>',n)}}
has(['理是長辭職了怎麼辦','裡事長辭職了怎麼辦','理市長辭職了怎麼辦'],'理事長請辭');
/* 「理事常常沒來」的「理事常」不是錯字 */
for(const q of ['理事常常沒去開會會怎麼樣','理事常常開會不到怎麼辦','可以監視會員嗎']){if(/理事長|監事會/.test(r.normalizeQuestion(q))&&!/理事長|監事會/.test(q)){bad++;console.log('✗ 誤改錯字',q,'=>',r.normalizeQuestion(q))}}

/* 2 成立要找幾個人 */
has(['新成立一個協會最少要找幾個人','籌組一個協會至少要找多少人','成立社團最少要找到幾個人','想成立協會要湊幾個人','成立協會至少要找幾位人','成立一個協會起碼要湊到多少人'],'發起人要30人以上');
not(['新成立一個協會最少要找幾個人','籌組一個協會至少要找多少人','新創一個協會要找幾位發起人','成立協會要找多少會員','發起一個協會要找幾個人'],'查協會的資料或有沒有立案');
has(['我想找一個協會的資料','怎麼查一個協會有沒有立案','哪裡可以查協會的理事長'],'查協會的資料或有沒有立案');

/* 3 業務分流 */
has(['我要申請低收入戶補助','中低收入戶怎麼申請','急難救助要去哪裡辦','老人津貼一個月多少','身心障礙手冊怎麼辦','低收入戶資格是什麼'],'個人福利不是這個櫃檯');
not(['我要申請低收入戶補助','低收入戶補助怎麼申請','中低收入戶補助有哪些','低收入戶補助多少錢','低收補助要去哪申請'],'補助款入帳');
has(['協會的補助款要記收入嗎','補助款要怎麼入帳'],'補助款入帳');
not(['協會可以幫低收入戶申請物資嗎','協會辦低收入戶關懷活動可以申請補助嗎','社區發展協會關懷據點服務低收入戶'],'個人福利不是這個櫃檯');
has(['公寓大廈管理委員會怎麼改選主委','大樓管委會主委可以連任幾次','社區大樓的管理委員會要怎麼成立','區分所有權人會議要多少人出席','公寓管委會的管理費可以調漲嗎','住戶可以罷免大樓主委嗎'],'公寓大廈管理委員會');
not(['協會可以承租大樓管委會的會議室嗎','協會改選怎麼辦','社區發展協會怎麼改選','宮廟管理委員會要怎麼登記'],'公寓大廈管理委員會');

/* 4 繼承、接任不是親屬同時任職 */
not(['理事長過世了，他的理事長職務可以由他太太繼承嗎','理事長往生了，可以由他兒子接任嗎','理事長過世，他老婆可以頂替嗎','理事長走了，職位可以給他女兒繼承嗎','理事長死亡後理事長可以由他先生接手嗎','理事長的位子可以給兒子接班嗎'],'親屬可以同時當');
has(['理事長的太太可以當監事嗎','理事長和他兒子可以同時當理事嗎','理事長的老婆可以當理事嗎'],'親屬可以同時當');

/* 5 通知期限 */
not(['開會通知幾天前要寄出去','大會通知最晚什麼時候要寄出','開會通知要提前幾天寄出','會員大會通知多久以前要寄出去','開會通知幾日前要寄到','會員大會通知最遲何時要寄出'],'寄出去算不算到達');
has(['開會通知用掛號寄出去就算送達了嗎','會員大會通知寄出去算不算到達'],'寄出去算不算到達');

/* 6 answer-guard：在 node 內模擬瀏覽器環境 */
const arb=require('./answer-arbiter.js');const cq=require('./question-understanding.js');
function ctxOf(){
 let shown=null;
 const app={console,document:{querySelector:()=>null,getElementById:()=>null,createElement:()=>({style:{},appendChild(){},setAttribute(){},querySelector:()=>({})})},
  location:{pathname:'/'},renderAnswer:(q,a)=>{shown=a},
  normalizeQuestion:r.normalizeQuestion,verifiedRoundAnswer:r.verifiedRoundAnswer,focusedQuestionAnswer:q=>cq.resolve(q,{}),exactArticleAnswer:()=>null,
  KB:[],STORE:{forms:{catalog:null}},AnswerArbiter:arb,
  keywordQuestions:()=>['公會跟協會差在哪','協會、公會、工會的規定都一樣嗎？','改選一步一步怎麼辦','會員大會怎麼開']};
 app.window=app;vm.createContext(app);
 vm.runInContext(fs.readFileSync(path.join(__dirname,'answer-guard.js'),'utf8'),app);
 return q=>{const nq=r.normalizeQuestion(q);let base=r.verifiedRoundAnswer(nq,{});if(!base||typeof base!=='object')base=cq.resolve(nq,{})||{category:'其他',title:'抱歉，這個問題難倒小屏了',summary:'抱歉，這個問題難倒小屏了，小屏暫時無法回答喔！建議您先電洽承辦人員詢問～',unanswered:true};
  shown=null;app.renderAnswer(q,base);return{base,out:shown}};
}
const ask=ctxOf();
const T=x=>[x.title,x.summary].join('｜');
/* 6a 兩種團體比較：答案沒有同時談到兩種團體或沒談到問的主題，就出選單 */
for(const q of ['社區發展協會跟公會的會員大會出席門檻一樣嗎','協會跟合作社的理事任期一樣嗎','公會跟協會開會通知的規定差在哪','合作社跟協會的會員大會出席門檻有什麼不一樣','社區發展協會和一般協會的改選規定有什麼不同','合作社跟公會的理事任期有什麼不同']){
 const {out}=ask(q);if(!out||!/您是不是要問|難倒小屏/.test(out.title)){bad++;console.log('✗ 比較題應出選單',q,'=>',out&&out.title)}}
for(const q of ['協會和合作社有什麼不同','工會跟公會的差別','公會跟協會差在哪']){const {base,out}=ask(q);if(!out||out.title!==base.title){bad++;console.log('✗ 一般差別題不該被擋',q,'=>',out&&out.title)}}
/* 6b 一句問兩件事：兩半都要有回應 */
for(const [q,m1,m2] of [
 ['協會理事要幾個人？合作社理事又是幾個人？','理事9到15人','合作社理事至少'],
 ['理事長一任幾年，還有最多可以連任幾次','最長四年','連任以一次為限'],
 ['社區發展協會理事長可以兼里長嗎，另外他可以領薪水嗎','里長可以當社區發展協會','無給職'],
 ['協會要解散的話財產怎麼處理，還有要不要去法院辦','剩餘財產','解散要不要去法院'],
 ['合作社社員退社股金怎麼退，協會會員退會的話會費可以退嗎','股金','會費要不要退'],
 ['會員大會多久開一次，理事會又是多久開一次','定期會議每年一次','每六個月至少一次'],
 ['合作社社員大會幾天前通知？協會會員大會呢？','7日前','十五日前通知'],
 ['章程怎麼改，另外圖記不見了怎麼辦','三分之二以上同意','圖記'],
 ['監事要幾個人？還有監事任期幾年？','監事至少3人','最長四年']]){
 const {out}=ask(q);const t=out?T(out):'';if(!t.includes(m1)||!t.includes(m2)){bad++;console.log('✗ 兩件事只答一半',q,'=>',out&&out.title,'｜缺',[m1,m2].filter(m=>!t.includes(m)).join('、'))}}
/* 6c 自我介紹＋問題：答後半的問題 */
for(const [q,m] of [['我是新上任的總幹事，前任沒有交接，請問今年的預算要什麼時候送縣府','年度預算'],['我是新上任的總幹事，請問今年的預算要什麼時候送縣府','年度預算'],['我是剛接任的總幹事，前任都沒交接，想請問今年的預算要什麼時候送縣府','年度預算'],['我是新來的總幹事，請問年度預算什麼時候要送縣府','年度預算'],['我是新上任的總幹事，前任沒有交接，請問年度預算要什麼時候送縣府','年度預算']]){
 const {out}=ask(q);if(!out||!String(out.title).includes(m)){bad++;console.log('✗ 自我介紹搶答',q,'=>',out&&out.title)}}
/* 6d 不該動的：承接問法、條件句、單一問題照原本回答 */
for(const q of ['理事可以委託別人出席理事會嗎？監事會也可以嗎？','如果會員大會出席人數不夠要流會，但是當天收到很多委託書，可以算進出席人數嗎','如果理事長出國半年，但是沒有指定代理人，理事會誰來主持','理事長可以連任幾次','章程想改，要過幾個人同意才行','三年都沒繳會費的人還算我們的會員嗎','我是新當選的理事長，想請問圖記要怎麼換','理監事辭職之後，同一任期內可以再選回來，或退為候補嗎？','合作社清算完成後，多久要報告？稅務和銀行還要辦什麼？']){
 const {base,out}=ask(q);if(!out||out.title!==base.title){bad++;console.log('✗ 不該被改寫',q,'=>',out&&out.title,'（原）',base.title)}}

if(bad){console.error('失敗 '+bad+' 項');process.exit(1)}
console.log('test-understanding-20261127-1 全部通過');
