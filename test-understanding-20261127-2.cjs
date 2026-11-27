/* 理解把關 2026-11-27 第2輪：答案把關（answer-guard.js 的 understandingGuard）與口語正規化。
   用真正的規則答案（round-fixes.js）當輸入，確認「對不上的答案」會改成選單或固定用語，「對得上的答案」不會被擋。 */
const fs=require('fs'),vm=require('vm');
const r=require('./round-fixes.js');
const list=JSON.parse(fs.readFileSync('./data/keyword-questions.json','utf8')).questions;
const win={keywordQuestions:()=>list};
const ctx={window:win,document:{querySelector:()=>null,getElementById:()=>null},console,localStorage:{getItem:()=>null,setItem(){}},
 verifiedRoundAnswer:r.verifiedRoundAnswer,normalizeQuestion:r.normalizeQuestion};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('./answer-guard.js','utf8'),ctx);
const guard=win.__understandingGuard2;
if(typeof guard!=='function')throw new Error('answer-guard.js 沒有匯出 __understandingGuard2');
let bad=0;
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const fail=(q,msg)=>{bad++;console.log('✗',q,'=>',msg)};
const MENU='您是不是要問以下相關的問題？',FIXED='抱歉，這個問題難倒小屏了';
// stub：模擬一則已核對但不相干的直接答案
const stub=(title,summary)=>({direct:true,category:'人民團體會務說明',title,summary:summary||title,steps:[],notes:[]});
const blocked=(q,a,want)=>{const g=guard(q,a);if(!g)return fail(q,'沒有擋下：'+(a&&a.title));if(want&&!String(g.title).includes(want))fail(q,'應為「'+want+'」，實際「'+g.title+'」')};
const passes=(q,a)=>{const g=guard(q,a);if(g)fail(q,'不該擋：'+(a&&a.title)+' → '+g.title)};

/* 1. 捐款抵稅：不管原本配到什麼，一律只答「請洽國稅局」 */
for(const q of ['捐款給協會可以抵多少稅','捐錢給協會可以抵掉多少稅','捐給社團的錢報稅抵得了稅嗎','捐款收據可以拿去抵所得稅嗎','公司捐款給協會可以節稅嗎','捐款給協會列舉扣除額上限多少','我捐款給協會，可以抵多少稅']){
 const g=guard(q,stub('協會收入要不要繳所得稅：沒有金額門檻'));
 if(!g||!/國稅局/.test(g.title))fail(q,'抵稅沒有改答請洽國稅局：'+(g&&g.title));
}
// 正規化本身也要把「抵多少稅」交給國稅局規則
for(const q of ['捐款給協會可以抵多少稅','捐錢給協會可以抵掉多少稅','我捐款給協會，可以抵多少稅']){const a=A(q);if(!a||!/國稅局/.test(a.title))fail(q,'規則層沒有答請洽國稅局：'+(a&&a.title))}

/* 2. 不是本櫃檯的對象：大樓管委會 → 既有的業務分流答案；學校家長會 → 固定用語 */
const el=stub('改選完要報縣府：會員大會紀錄 30 日內報請備查','改選是在會員（會員代表）大會中完成的，大會的會議紀錄要在閉會後30日內報請主管機關備查。');
for(const q of ['公寓大廈管理委員會主委改選要報哪裡','大樓管委會的主委可以連任幾次','管委會的財務報表要送縣府嗎','社區主委任期幾年要改選','大樓主委改選完要報備嗎','管理委員會的會議紀錄要送哪裡'])blocked(q,el,'不是這個櫃檯');
for(const q of ['家長會長改選要報縣府嗎','國小家長會的會費可以怎麼用','家長委員改選要幾個人出席','學校家長會改選要通知誰','家長會的會議紀錄要送縣府嗎'])blocked(q,el,FIXED);
// 答案本身就在談管委會的，不擋
passes('社區發展協會就是大樓的管理委員會嗎？',stub('社區發展協會就是大樓的管理委員會嗎？','不是。大樓的管理委員會是依公寓大廈管理條例成立的，和社區發展協會不同。'));

/* 4. 一句問兩件事：只答到一半就出選單 */
const pairs=[['理事長可以連任幾次？另外總幹事可以由理事兼任嗎？','理事長可以連任幾次'],['監事可以兼任會計嗎，還有理事長的配偶可以當監事嗎','理事長的配偶可以當監事嗎'],['協會解散後剩下的錢可以分給會員嗎，如果章程沒寫怎麼辦','章程要不要發給會員'],
 ['理事可以兼會計嗎？監事任期幾年？','監事任期幾年'],['會費可以調漲嗎，還有理事長可以領薪水嗎','理事長可以領薪水嗎'],['會員大會多久開一次？另外圖記遺失怎麼辦？','圖記遺失怎麼辦'],['協會可以開分會嗎，還有統編要去哪裡申請','協會可以開分會嗎'],['監事可以查帳嗎？順便問總幹事可以投票嗎？','總幹事可以投票嗎'],['理事長任期幾年？會員大會要幾個人出席才算數？','理事長任期幾年']];
const TERM=stub('一般協會理監事任期：最長四年','一般人民團體理事、監事的每屆任期不得超過四年，實際幾年要看章程。理事長連任另有一次的限制。');
const half=h=>h==='理事長的配偶可以當監事嗎'?A('理事長和會計可以是三等親嗎'):/任期幾年/.test(h)?TERM:A(h);
for(const [q,h] of pairs){const a=half(h);if(!a||typeof a!=='object'){fail(q,'找不到半題答案：'+h);continue}blocked(q,a,MENU)}
// 單一問題（前半是背景）不擋
for(const q of ['理事不來開會好幾次了可以把他換掉嗎','入會費跟常年會費，我們想調漲，自己理事會講好就行了嗎','協會可以收捐款嗎？收了要開收據嗎？']){const a=A(q);if(a&&typeof a==='object')passes(q,a)}

/* 5. 順便一起辦兩件事（改名＋換會址）：只答一件就出選單 */
const rename=stub('協會改名：名稱寫在章程裡，要走修改章程的程序再報縣府','團體名稱是章程必須記載的事項，所以改名就是修改章程，經會員大會通過後報縣府核備。');
for(const q of ['我們協會想改名字，順便也要換會址，要一起辦還是分開辦？','我們協會要改名，同時會址也要搬，怎麼辦','協會換會址順便想把名稱也改掉要怎麼做','協會要改名還有統編也要一起改嗎','想一起辦改名和法人登記可以嗎','改名另外圖記也要重刻嗎'])blocked(q,rename,MENU);
// 答案兩件事都有談到的不擋
passes('想一起辦改名和圖記重刻可以嗎',stub('協會改名後圖記要重刻嗎','人民團體的圖記由團體自行製用；改名後圖記如果刻有舊名稱，建議重刻並送印模備查。'));

/* 6. 問句的關鍵細節答案完全沒提到：颱風停班、住院、被罰 */
const meet=stub('改選原則上要集會辦理：理事、監事由會員大會選出','理事、監事要從會員中選舉產生，選舉原則上要在同一地點以集會方式辦理。');
for(const q of ['改選當天颱風停班停課大會還要開嗎','開會員大會那天遇到颱風停班怎麼辦','理事會當天地震停電還要開嗎','豪雨淹水那天的理監事會怎麼處理','颱風天停課，改選大會可以取消嗎','我爸是協會的總幹事最近中風住院了，會裡的事情沒人處理怎麼辦','去年的預算決算到現在都還沒送縣府會被罰嗎'])blocked(q,meet);
// 答案有回應到細節的不擋
passes('颱風天停課，改選大會可以取消嗎',stub('天災、疫情能不能暫緩改選','因天災、事變或其他不可抗力的情事，主管機關得公告暫緩辦理改選。'));
passes('補助沒準時核銷會被罰嗎',stub('補助核銷來不及','超過當年度沒核銷補助會被註銷。'));
passes('理事長生病住院誰代理',stub('理事長不能視事時由副理事長代理','理事長因故不能執行職務時，由副理事長代理。'));

/* 7. 台語式寫法要和國語問法得到同一個答案 */
const same=(tw,zh)=>{const a=A(tw),b=A(zh);const ta=a&&a.title,tb=b&&b.title;if(ta!==tb)fail(tw,'和「'+zh+'」答案不同：'+ta+' ／ '+tb)};
same('阮協會欲改名愛按怎辦','我們協會要改名要怎麼辦');same('阮協會敢會使收捐款','我們協會可以收捐款嗎');same('理事長毋做矣欲按怎','理事長不做了要怎麼');
same('阮協會欲換理事長愛按怎辦','我們協會要換理事長要怎麼辦');same('開會通知愛偌久進前寄','開會通知愛多久之前寄');same('阮社團欲解散愛按怎辦','我們社團要解散要怎麼辦');
const n=r.normalizeQuestion('阮協會的會費偌濟才著');if(!/多少/.test(n)||/阮|偌濟/.test(n))fail('阮協會的會費偌濟才著','台語沒有轉成國語：'+n);

/* 8. 貪心規則排除詞：不再搶答 */
const not=(q,bad)=>{const a=A(q);if(a&&typeof a==='object'&&String(a.title).includes(bad))fail(q,'仍被搶答：'+a.title)};
for(const q of ['理事長可以連任幾次？另外總幹事可以由理事兼任嗎？','總幹事可以由理事兼任嗎，可以連任嗎','理事長連任幾次，總幹事能不能兼會計','理事可以兼總幹事嗎還有理事長連任限制','監事連任幾屆，另外幹事可以由監事兼嗎'])not(q,'沒有法定任期');
for(const q of ['協會解散後剩下的錢可以分給會員嗎，如果章程沒寫怎麼辦','解散剩的財產要給會員嗎章程沒規定','清算後剩餘財產分給會員章程沒寫','協會解散，錢可以分給會員嗎，章程沒有寫','章程沒寫的話解散後財產給會員可以嗎'])not(q,'章程要不要發給會員');
for(const q of ['改選當天颱風停班停課大會還要開嗎','改選那天地震停電一定要開大會嗎','選舉當天豪雨淹水大會要不要開','改選遇到颱風天還是一定要集會嗎','疫情期間改選一定要開大會嗎'])not(q,'改選原則上要集會辦理');
for(const q of ['社區發展協會和一般協會的會員大會出席人數規定一樣嗎？','會員大會規定要多少人出席','會員出席大會的法定人數規定','會員大會出席人數要過半的規定','會員參加大會的人數規定一樣嗎'])not(q,'會員一定要參加活動嗎');
// 原本該答的還是要答
{const a=A('總幹事可以連任嗎');if(!a||!/沒有法定任期/.test(a.title))fail('總幹事可以連任嗎','應答沒有法定任期：'+(a&&a.title))}
{const a=A('會員一定要參加協會的活動嗎');if(!a||!/會員一定要參加活動嗎/.test(a.title))fail('會員一定要參加協會的活動嗎','應答會員義務：'+(a&&a.title))}
{const a=A('章程要發給每個會員嗎');if(!a||!/章程要不要發給會員/.test(a.title))fail('章程要發給每個會員嗎','應答章程發給會員：'+(a&&a.title))}

/* 9. 選單、固定用語、名冊查詢本身不再把關 */
passes('大樓管委會的主委可以連任幾次',{title:FIXED,unanswered:true,summary:''});
passes('合作社和協會的通知期限各是幾天',{title:MENU,questionState:{focus:'keyword-menu'},summary:''});
if(bad)throw new Error('理解把關測試失敗 '+bad+' 項');
console.log('test-understanding-20261127-2 全部通過');
