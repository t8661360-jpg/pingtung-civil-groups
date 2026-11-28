/* 理解把關 2026-11-28 第1輪：
   副理事長兼會計／出納／總幹事（不是「可不可以設副理事長」）、理事會監事會「只來幾個」問出席門檻、
   章程多年沒改有沒有問題、社區發展協會解散＋補助蓋的設施、會員委託出席（省略會議名稱）、
   後半「…也可以嗎」換團體、東西壞了誰要修（不是報廢）、駕照行照等監理業務、名稱跟別的協會一樣 */
const fs=require('fs'),vm=require('vm');
const r=require('./round-fixes.js');
const list=JSON.parse(fs.readFileSync('./data/keyword-questions.json','utf8')).questions;
const win={keywordQuestions:()=>list};
const ctx={window:win,document:{querySelector:()=>null,getElementById:()=>null},console,localStorage:{getItem:()=>null,setItem(){}}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('./answer-guard.js','utf8'),ctx);
const g9=win.__understandingGuard9;
if(typeof g9!=='function')throw new Error('answer-guard.js 沒有匯出 __understandingGuard9');
let bad=0;
const N=q=>r.normalizeQuestion(q);
const A=q=>r.verifiedRoundAnswer(N(q),{});
const fail=(q,msg)=>{bad++;console.log('✗',q,'=>',msg)};
const MENU='您是不是要問以下相關的問題？';
const stub=(title,summary,extra)=>Object.assign({direct:true,category:'人民團體會務說明',title,summary:summary||title,steps:[],notes:[]},extra||{});
const titleHas=(q,want)=>{const a=A(q);if(!a||!new RegExp(want).test(a.title))fail(q,'應為「'+want+'」，實際「'+(a&&a.title)+'」')};
const titleNot=(q,no)=>{const a=A(q);if(a&&new RegExp(no).test(a.title))fail(q,'不該是「'+(a&&a.title)+'」')};
const normIs=(q,want)=>{const n=N(q);if(n!==want)fail(q,'正規化應為「'+want+'」，實際「'+n+'」')};
const normNot=(q,no)=>{const n=N(q);if(n===no)fail(q,'不該正規化成「'+no+'」')};
const blocked=(q,a,want)=>{const x=g9(q,a);if(!x)return fail(q,'沒有擋下：'+(a&&a.title));if(want&&!String(x.title).includes(want))fail(q,'應為「'+want+'」，實際「'+x.title+'」')};
const passes=(q,a)=>{const x=g9(q,a);if(x)fail(q,'不該擋：'+(a&&a.title)+' → '+x.title)};

/* 1. 副理事長兼工作人員 → 理監事不能兼工作人員；問設不設、怎麼產生仍答副理事長 */
for(const q of ['副理事長可以兼會計嗎','副理事長可以兼出納嗎','副理事長可以當協會的會計嗎','我們副理事長想兼秘書長可以嗎','副理事長兼任工作人員可以嗎','副理事長可以擔任總幹事嗎'])titleNot(q,'協會可以設副理事長');
for(const q of ['副理事長可以兼會計嗎','副理事長可以兼出納嗎'])titleHas(q,'不能兼任會計或出納');
for(const q of ['副理事長可以設幾個','副理事長怎麼產生','協會可以設副理事長嗎'])titleHas(q,'協會可以設副理事長');
/* 2. 理事會、監事會「只來幾個」→ 出席門檻；人數不足還硬開仍答「沒有過半數就不能開會」；監事名額不受影響 */
for(const q of ['監事會三個監事只來兩個，但召集人有來，可以開嗎','理事會九個理事只來四個可以開嗎','監事會只到一個人算數嗎','理事會今天只有五個人來了，可以表決嗎','我們理事有十一個，只來六個，決議有效嗎','監事三個人只來了一個，監事會可以開嗎'])titleHas(q,'過半數出席才能開');
for(const q of ['理事會只來了四個人還是照開，決議算數嗎','監事會只到兩位監事還是照開可以嗎'])titleHas(q,'沒有過半數就不能開會');
for(const q of ['監事只有一個人可以嗎','我們監事只有兩個人可以嗎','會員大會只來了三十個人可以開嗎'])titleNot(q,'過半數出席才能開，出席過半數同意才通過');
/* 3. 章程多年沒改 → 章程不用每年換新；問怎麼改、照新規定做仍走原本答案 */
for(const q of ['我們協會成立十年了從來沒有改過章程，這樣會不會有問題','章程十幾年沒改過可以嗎','我們的章程從來沒修過要不要改','章程好幾年都沒動過會被罰嗎','章程一直沒有更新有沒有關係','協會章程很久沒改過，是不是違法'])normIs(q,'章程需要每年重新訂嗎');
for(const q of ['章程怎麼改','章程沒改直接照新規定做可以嗎','章程沒改過要怎麼改','章程要幾個人同意才能改'])normNot(q,'章程需要每年重新訂嗎');
/* 4. 社區發展協會解散＋補助買的、蓋的東西 */
for(const q of ['我們是社區發展協會，前年拿公所補助蓋了涼亭，現在想解散，涼亭怎麼辦','社區協會要收掉了，公所補助買的音響要還嗎','社區發展協會解散，補助蓋的活動中心歸誰','社區協會不辦了，之前拿補助買的設備怎麼處理','社區發展協會解散時補助款買的東西怎麼辦'])titleHas(q,'用補助款買的設備要看補助核定函');
titleNot('社區發展協會怎麼解散','補助款買的設備');
/* 5. 會員委託出席（沒講什麼會）＝會員大會；理事、公會不受影響 */
for(const q of ['協會會員可以委託別人出席嗎','會員可以委託出席嗎','會員可以委託家人出席嗎','會員代表可以委託別人出席嗎'])titleHas(q,'會員大會不能親自去');
titleHas('理事可以委託別人出席嗎','理事、監事不能委託');
titleNot('公會會員可以委託別人出席嗎','會員大會不能親自去');
/* 6. 東西壞了誰要修 → 不補「財產」、不答報廢；問報廢仍答報廢 */
for(const q of ['社區活動中心冷氣壞了誰要修','協會的冷氣壞掉了誰出錢修','協會投影機故障找誰修','協會音響壞了要找人修理'])titleNot(q,'報廢');
for(const q of ['協會的電腦壞了可以報廢嗎','協會的冷氣壞了可以報廢嗎'])titleHas(q,'報廢');
const SCRAP=stub('協會財產報廢：法規沒有專門的報廢程序，先經理事會決議並留下紀錄','社會團體財務處理辦法沒有訂報廢的專門程序。');
for(const q of ['社區活動中心冷氣壞了誰要修','協會的冷氣壞掉了誰出錢修','協會投影機故障找誰修','會館漏水誰負責修','協會的電腦壞了維修費誰付'])blocked(q,SCRAP,MENU);
passes('協會的電腦壞了可以報廢嗎',SCRAP);
passes('協會的冷氣壞了找人修理的錢可以用補助款嗎',stub('補助款可以付維修費嗎','維修費是否可以核銷，要看補助計畫。'));
/* 7. 駕照、行照、罰單 → 固定用語 */
const CAR=stub('房子、土地、車子怎麼登記到協會','要把房子或土地登記在協會名下…車子要依監理機關規定辦理。',{category:'業務辦理'});
for(const q of ['機車駕照怎麼考','汽車駕照到期怎麼換','我要考機車駕照','行照不見了怎麼補','駕照被吊銷了','收到罰單要怎麼繳'])blocked(q,CAR,'難倒小屏');
passes('協會可以買車嗎',CAR);
passes('牌照稅什麼時候繳',stub('協會的車輛要繳使用牌照稅','已立案社會福利團體專供使用的車輛，牌照稅可以申請免徵。'));
/* 8. 名稱跟別的協會一樣，答案沒談到相同 → 選單；答案有談到就放行 */
const RENAME0=stub('協會改名：名稱寫在章程裡，要走修改章程的程序再報縣府','團體名稱是章程必須記載的事項，改名就是修改章程。');
for(const q of ['協會要改名，名稱可以跟別的協會一樣嗎','我們想取的名稱跟別的協會重複怎麼辦','協會名字跟人家的一樣可以嗎','新協會可以跟現有的協會同名嗎','協會撞名了要改嗎'])blocked(q,RENAME0,MENU);
passes('協會要改名，名稱可以跟別的協會一樣嗎，要不要報內政部',stub('協會改名：名稱寫在章程裡，要走修改章程的程序再報縣府','新名稱不能和已經許可的團體相同（人民團體法第7條）。'));
passes('協會要改名要怎麼辦',RENAME0);
for(const q of ['新協會可以跟現有的協會同名嗎','協會撞名了怎麼辦','協會名字跟人家的一樣可以嗎','我們協會可以跟台北的協會同名嗎','社團名稱跟別的社團相同行不行'])normIs(q,'協會的名稱可以跟別的協會一樣嗎');
for(const q of ['屏東縣有沒有同名的協會','幫我查有沒有協會撞名','協會要改名，名稱可以跟別的協會一樣嗎，要不要報內政部','合作社可以同名嗎','解散後同名的協會還能申請嗎'])normNot(q,'協會的名稱可以跟別的協會一樣嗎');

if(bad)throw new Error('2026-11-28 第1輪理解把關測試失敗 '+bad+' 項');
console.log('2026-11-28 第1輪理解把關測試通過');
