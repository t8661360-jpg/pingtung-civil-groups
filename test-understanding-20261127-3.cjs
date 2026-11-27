/* 理解把關 2026-11-27 第3輪：
   1. 口語正規化（當理事有沒有錢可以領、協會停擺想重新弄起來）與兩條貪心規則的排除詞（理監事名額、沒繳會費要不要通知）。
   2. answer-guard.js 的 understandingGuard3：農會／漁會／公司董事等不是本櫃檯對象 → 固定用語；一般勞資糾紛 → 選單；
      條件加例外，最後問的那一句答案沒談到 → 選單；前後兩句各問一種團體、答案只談一種 → 選單。
   3. 細節把關新增「典禮／儀式」。 */
const fs=require('fs'),vm=require('vm');
const r=require('./round-fixes.js');
const list=JSON.parse(fs.readFileSync('./data/keyword-questions.json','utf8')).questions;
const win={keywordQuestions:()=>list};
const ctx={window:win,document:{querySelector:()=>null,getElementById:()=>null},console,localStorage:{getItem:()=>null,setItem(){}},
 verifiedRoundAnswer:r.verifiedRoundAnswer,normalizeQuestion:r.normalizeQuestion};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('./answer-guard.js','utf8'),ctx);
const g2=win.__understandingGuard2,g3=win.__understandingGuard3;
if(typeof g3!=='function')throw new Error('answer-guard.js 沒有匯出 __understandingGuard3');
let bad=0;
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const fail=(q,msg)=>{bad++;console.log('✗',q,'=>',msg)};
const MENU='您是不是要問以下相關的問題？',FIXED='抱歉，這個問題難倒小屏了';
const stub=(title,summary)=>({direct:true,category:'人民團體會務說明',title,summary:summary||title,steps:[],notes:[]});
const titleIs=(q,want)=>{const a=A(q);if(!a||!String(a.title).includes(want))fail(q,'應為「'+want+'」，實際「'+(a&&a.title)+'」')};
const titleNot=(q,no)=>{const a=A(q);if(a&&String(a.title).includes(no))fail(q,'不該是「'+no+'」')};
const blocked=(g,q,a,want)=>{const x=g(q,a);if(!x)return fail(q,'沒有擋下：'+(a&&a.title));if(want&&!String(x.title).includes(want))fail(q,'應為「'+want+'」，實際「'+x.title+'」')};
const passes=(g,q,a)=>{const x=g(q,a);if(x)fail(q,'不該擋：'+(a&&a.title)+' → '+x.title)};

/* 1. 當理事有沒有錢可以領＝理事有沒有薪水 */
for(const q of ['當理事有沒有錢可以領','當監事有錢拿嗎','理監事有沒有錢領','當理事長有錢可以領嗎','理監事是做義務的嗎','當理事會有錢領嗎'])titleIs(q,'無給職');
// 「理事長可以自己去銀行領錢嗎」是提款，不能被改成薪水
titleNot('理事長可以自己去銀行領錢嗎','無給職');

/* 2. 協會停擺想重新弄起來：不是在問理監事名額 */
for(const q of ['我們協會已經五六年都沒在運作了，理監事也都散了，現在幾個老會員想重新弄起來','協會停擺好幾年了想再搞起來','協會荒廢好幾年，現在有人想重新整理','我們協會好幾年沒活動了想重新開始','協會沒在運作很久了，理監事都散了，幾個會員想把它弄起來','協會停擺很久了，理監事都找不到人，幾個朋友想重新運作'])titleIs(q,'協會很久沒運作');
// 一般的名額問法不受影響
for(const q of ['理事要選幾個人','理監事要幾位','理事名額是多少'])titleIs(q,'理事、監事的名額');

/* 3. 沒繳會費＋理事會：不是在問「開會員大會要不要通知他」 */
for(const q of ['如果會員沒繳會費被停權，但他是理事，還能出席理事會嗎','理事沒繳會費可以出席理事會嗎','沒繳會費的人他是理事可以開理事會嗎','監事沒繳會費還能出席監事會嗎','欠繳會費的理事可以出席理監事會嗎','會員欠繳會費，但他也是監事，可以出席監事會嗎'])titleNot(q,'開會員大會還要通知他嗎');
titleIs('沒繳會費的會員可以出席大會嗎','開會員大會還要通知他嗎');

/* 4. 不是本櫃檯對象（農會、漁會、農田水利會、公司董事股東）：答案沒談到 → 固定用語 */
const el=stub('理事長由理事互選產生：有常務理事的，從常務理事中選一人','理事長不是會員大會直接選的，由理事互選。');
for(const q of ['農會理事長怎麼選','漁會怎麼改選','農會總幹事怎麼聘','農田水利會會長任期幾年','農會會員代表怎麼選','漁會理事可以連任嗎','公司董事改選要報哪裡','股份有限公司董事任期多久','公司股東會要幾個人出席','有限公司的董事可以連任嗎','公司監察人可以兼董事嗎'])blocked(g3,q,el,FIXED);
// 答案本身在談公司／農會的，不擋
passes(g3,'公司可以加入協會當會員嗎',stub('公司行號能不能入會：要看協會章程是否開放團體會員'));
passes(g3,'協會可以投資公司當股東嗎',stub('協會的錢拿去買股票、投資','協會不宜投資公司當股東。'));
passes(g3,'農會可以加入協會嗎',stub('農會能不能入會','農會是否可以成為團體會員，看章程。'));

/* 5. 一般勞資糾紛：答案沒談勞資 → 選單或固定用語 */
for(const q of ['勞資糾紛要找誰調解','勞資爭議要去哪裡申請調解','我跟老闆有勞資糾紛怎麼辦','勞資調解要找哪個單位','勞資爭議調解要準備什麼','勞資問題要問誰'])blocked(g3,q,stub('人民團體業務承辦人','已立案團體的會務，由名冊指定的承辦人辦理。'));
passes(g3,'協會員工被資遣不服可以申請勞資調解嗎',stub('員工被協會開除或資遣、不服怎麼辦','爭議可向縣府勞工主管機關申請勞資爭議調解。'));

/* 6. 條件加例外：最後問的那一句，答案沒談到 → 選單 */
const fee=stub('會費沒繳可以停權嗎：人民團體法沒有「停權」的明文，要看章程怎麼訂','會員沒繳會費能不能停權，法規沒有明文，要看章程。');
for(const q of ['如果會員沒繳會費被停權，但他是理事，還能出席理事會嗎','如果會員沒繳會費被停權，可是他是監事，還能出席監事會嗎','假如會員被停權，但是他是理事長，還能主持理事會嗎','要是會員沒繳會費，不過他是常務理事，可以參加常務理事會嗎','萬一會員被停權，但他是會員代表，還能出席會員代表大會嗎','如果會員沒繳會費，但是他想選理事，可以登記參選嗎'])blocked(g3,q,fee);
// 答案有談到最後一句的，不擋
passes(g3,'如果出席人數不夠要流會，但當天收到很多委託書，可以算嗎',stub('委託出席算不算出席人數：受委託人到場簽到，人數以簽到簿為準','委託書可以算，受委託人到場簽到就算出席人數。'));
passes(g3,'如果理事辭職了，但是沒有候補理事，要補選嗎',stub('理事、監事出缺：先由候補依次遞補，遞補後不到名額三分之二才要補選','沒有候補理事可以遞補時，人數不到三分之二要補選。'));

/* 7. 前後兩句各問一種團體，答案只談一種 → 選單 */
const feeHow=stub('會費怎麼收','協會的會費標準要訂入章程，經會員大會通過。');
for(const q of ['社區發展協會可以收會費嗎，合作社也是嗎','協會可以收會費嗎，公會可以嗎','協會要繳會費嗎？合作社要繳嗎？','公會會費怎麼訂，合作社會費又是怎麼訂','協會會費誰決定？工會的會費誰決定？','社區發展協會會費可以調漲嗎，合作社可以嗎'])blocked(g3,q,q.startsWith('公會')?stub('公會會費怎麼訂','公會的會費依章程。'):feeHow,MENU);
passes(g3,'協會可以收會費嗎，合作社也是嗎',stub('協會與合作社要分別適用規定','協會收會費，合作社收的是股金。'));
passes(g3,'我們是社區發展協會，想成立合作社可以嗎',stub('社區發展協會可以另外成立合作社','社區發展協會和合作社是不同的組織。'));

/* 8. 典禮、儀式：答案完全沒提到 → 選單（或固定用語） */
const hand=stub('新舊任理事長要辦交接：列清冊，新任就任後15日內由新理事長會同監交人接收完畢','要。每屆改選前要造具清冊，15日內接收完畢。');
for(const q of ['理事長交接要不要辦交接典禮','新任理事長交接典禮要請縣府長官嗎','理事長就職要不要辦布達儀式','新舊任理事長交接要辦什麼儀式','理事長交接典禮的費用可以報帳嗎','交接典禮一定要在會員大會辦嗎'])blocked(g2,q,hand);
passes(g2,'新舊任理事長要辦交接嗎',hand);

/* 9. 「調會費要不要連章程一起修改」不是在問補差額、退會（verified-mixed-questions.js 的調漲會費規則加排除） */
{const {changedAssociationDues:D}=require('./verified-mixed-questions');
 for(const q of ['協會要調高常年會費，只要會員大會通過就好，還是要連章程一起修改？','協會調漲會費，大會通過後要不要修章','協會提高會費，會員大會通過還要改章程嗎','協會調整會費需不需要修章，還是大會決議就好','協會調高入會費，大會通過後章程要一起修嗎','協會會費調漲經大會通過，要一併修章嗎'])if(D(q))fail(q,'不該由調漲會費（補差額、退會）規則回答');
 for(const q of ['協會章程改了會費，已繳年度會費要補差額嗎？會員不同意可以退會嗎？','協會理事會把會費提高但還沒召開會員大會，可以開始收新費率嗎？'])if(!D(q))fail(q,'調漲會費規則應該回答');}

if(bad)throw new Error('理解把關第3輪測試失敗 '+bad+' 項');
console.log('理解把關第3輪測試全部通過');
