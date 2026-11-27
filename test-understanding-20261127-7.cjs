/* 理解把關 2026-11-27 第7輪：
   1. normalizeQuestionU7：理事長／理事／監事「說他不想做了」（含台語式）、理事會紀錄寄給誰、章程全部重寫、錯字「監是」、跟農會學校廟一起辦活動、同時當兩個協會的總幹事。
   2. patrol19 的理監事兼任規則：兼「別的協會」的總幹事不接。
   3. answer-guard.js：understandingGuard7（合作社社員同時是協會會員、成立 N 年卻答怎麼成立、大會收費、個人的稅）；
      第3輪條件句把關：最後一句太短時連同前一句比對，合起來完全沒談到才出選單；農會例外：協會跟農會合辦活動。 */
const fs=require('fs'),vm=require('vm');
const r=require('./round-fixes.js');
const list=JSON.parse(fs.readFileSync('./data/keyword-questions.json','utf8')).questions;
const win={keywordQuestions:()=>list};
const ctx={window:win,document:{querySelector:()=>null,getElementById:()=>null},console,localStorage:{getItem:()=>null,setItem(){}},
 verifiedRoundAnswer:r.verifiedRoundAnswer,normalizeQuestion:r.normalizeQuestion};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('./answer-guard.js','utf8'),ctx);
const g3=win.__understandingGuard3,g7=win.__understandingGuard7;
if(typeof g7!=='function')throw new Error('answer-guard.js 沒有匯出 __understandingGuard7');
let bad=0;
const N=q=>r.normalizeQuestion(q);
const A=q=>r.verifiedRoundAnswer(N(q),{});
const fail=(q,msg)=>{bad++;console.log('✗',q,'=>',msg)};
const MENU='您是不是要問以下相關的問題？',FIXED='抱歉，這個問題難倒小屏了';
const stub=(title,summary,extra)=>Object.assign({direct:true,category:'人民團體會務說明',title,summary:summary||title,steps:[],notes:[]},extra||{});
const titleIs=(q,want)=>{const a=A(q);if(!a||!String(a.title).includes(want))fail(q,'應為「'+want+'」，實際「'+(a&&a.title)+'」')};
const titleNot=(q,no)=>{const a=A(q);if(a&&String(a.title).includes(no))fail(q,'不該是「'+no+'」')};
const blocked=(g,q,a,want)=>{const x=g(q,a);if(!x)return fail(q,'沒有擋下：'+(a&&a.title));if(want&&!String(x.title).includes(want))fail(q,'應為「'+want+'」，實際「'+x.title+'」')};
const passes=(g,q,a)=>{const x=g(q,a);if(x)fail(q,'不該擋：'+(a&&a.title)+' → '+x.title)};

/* 1. 說他不想做了＝辭職 */
for(const q of ['阮理事長講伊無欲做矣，按怎辦','理事長說他不想做了怎麼辦','我們理事長說他不要做了','理事長講他不想再當了怎麼辦','理事長不願意做了怎麼辦','理事長表示不想繼續做了'])titleIs(q,'理事長請辭');
titleIs('監事說她不想做了要怎麼處理','監事要辭職');
for(const q of ['選出來的理事不想當怎麼辦','當選理事後不想當可以嗎','剛選上的監事說不想做了'])titleIs(q,'當選了不想當');
/* 2. 紀錄寄給誰 */
for(const q of ['理事會紀錄要寄給誰','監事會紀錄要寄給誰','理事會的會議紀錄要交給誰','理監事聯席會紀錄要送哪裡','理事會議紀錄要呈給誰','監事會的紀錄要給誰'])titleIs(q,'理監事會議紀錄');
/* 3. 章程全部重寫 */
for(const q of ['我們協會的章程是很久以前訂的現在想全部重寫一遍不知道從哪裡開始','章程想整份重新訂','我們的章程太舊了想全部改過','協會章程要全面翻修要怎麼做','章程打算通通重寫可以嗎','本會章程想重新寫一遍'])titleIs(q,'修改章程');
if(/修改章程要怎麼做/.test(N('合作社章程想全部重寫')))fail('合作社章程想全部重寫','合作社不該改寫成協會修改章程');
/* 4. 錯字「監是」 */
for(const [q,w] of [['監是可以兼總幹是嗎','兼任工作人員'],['監是辭職要怎麼辦','監事要辭職']])titleIs(q,w);
for(const q of ['監是任期幾年','監是可以連任嗎','監是會多久開一次','常務監是要怎麼選'])if(!/監事/.test(N(q)))fail(q,'錯字「監是」沒有改成監事：'+N(q));
if(/監事/.test(N('總監是誰')))fail('總監是誰','「總監是」不該改');
/* 5. 跟農會、學校、廟一起辦活動 */
for(const q of ['社區發展協會跟農會可以一起辦活動嗎','協會可以跟學校合辦活動嗎','我們跟廟一起辦活動可以嗎','協會跟學校一起辦活動可以嗎','我們跟公所合辦活動要報備嗎','協會可以跟漁會一起辦活動嗎','協會跟村辦公處合辦活動可以嗎'])titleIs(q,'合辦活動');
titleNot('合作社可以跟農會一起辦活動嗎','協會可以和別的團體合辦活動');
titleIs('協會可以跟其他協會合併嗎','合併');
/* 6. 同時當兩個協會的職務 */
for(const q of ['理事長可以同時當兩個協會的總幹事嗎','理事可以同時當兩個協會的理事嗎','理事長能不能同時擔任兩個協會的理事長','監事可以同時兼別的協會的總幹事嗎','理事長可以同時當好幾個社團的理事長嗎'])titleIs(q,'其他團體');
for(const q of ['監事可以兼總幹事嗎','理事可以兼本會的總幹事嗎'])titleIs(q,'兼任工作人員嗎：不可以');

/* 7. guard7 A：合作社社員同時是協會會員 */
const COOP=stub('協會或法人可以加入合作社當社員，但法人只限非營利的','合作社法第8條。',{category:'合作社會務'});
for(const q of ['合作社的社員可以同時是協會的會員嗎，會費要繳兩份嗎','我是合作社社員也可以同時是協會會員嗎','協會會員可以同時加入合作社當社員嗎','合作社社員同時加入協會有限制嗎','社員可以同時當協會的會員嗎'])blocked(g7,q,COOP,MENU);
blocked(g7,'我是合作社社員也可以同時是協會會員嗎',{category:'團體查詢',title:'查詢結果',summary:'',groups:[{}]},MENU);
passes(g7,'協會可以加入合作社當社員嗎',COOP);
passes(g7,'合作社社員可以加入合作社嗎',COOP);
/* guard7 C：成立 N 年卻答怎麼成立 */
const FOUND=stub('怎麼成立社會團體','發起人30人以上…',{direct:false,steps:['a','b','c']});
for(const q of ['我們協會成立三年了一直沒有開大會，現在想開會要注意什麼','協會成立五年了一直沒開會','社團成立一年了，會員要怎麼增加','協會成立三個月了要報什麼','我們成立兩年了不知道要做什麼'])blocked(g7,q,FOUND,MENU);
for(const q of ['協會怎麼成立','成立協會要多久','成立協會要幾個人'])passes(g7,q,FOUND);
/* guard7 D：大會收費 */
const SELL=stub('協會可以賣商品或收費嗎：可以，但須與宗旨有關','與宗旨有關。');
for(const q of ['會員大會可以收費嗎，入場要繳錢','開會員大會可以跟會員收錢嗎','參加大會要繳報名費嗎','會員大會入場要收門票可以嗎','開會要會員交錢才能進場嗎','大會可以跟出席的人收費嗎'])blocked(g7,q,SELL,MENU);
passes(g7,'會員大會可以發出席費嗎',SELL);
passes(g7,'協會辦活動可以收報名費嗎',SELL);
passes(g7,'會員大會可以收會費嗎',stub('會員大會當天可以收常年會費','會員大會當天可以收。'));
/* guard7 E：個人的稅 */
const TAXA=stub('協會可以申請免稅嗎','協會…');
for(const q of ['我要申請房屋稅減免','我家的地價稅可以減免嗎','我要問牌照稅','我的綜所稅怎麼報','個人房屋稅要去哪裡繳','我爸的遺產稅怎麼算'])blocked(g7,q,TAXA,FIXED);
for(const q of ['協會的房子可以免房屋稅嗎','我捐錢給協會可以抵所得稅嗎','我們協會會館的地價稅可以減免嗎','我是理事長，協會要繳房屋稅嗎'])passes(g7,q,TAXA);

/* 8. 第3輪條件句：最後一句太短連同前一句比對 */
const QUORUM=stub('出席人數沒有過半數就不能開會：到場人數不足時，主席要宣布散會','人民團體各項會議應有應出席人員過半數出席才能成會（輔導辦法第16條）。');
for(const q of ['如果理事會人數不夠開不成，但是要報預算，可以先送嗎','如果理事會開不成，但是工作計畫要交了，可以先寄嗎','如果理事會流會，可是補助要核銷，可以先送嗎','如果理事會沒開成，但是決算要報，可以先報嗎','假如理事會開不起來，但是經費要撥，可以先撥嗎'])blocked(g3,q,QUORUM,MENU);
passes(g3,'如果出席人數不夠要流會，但當天收到很多委託書，可以算嗎',stub('委託出席算不算出席人數：受委託人到場簽到，人數以簽到簿為準','委託書…受委託人到場簽到，出席人數以簽到簿為準。'));
/* 農會例外 */
passes(g3,'社區發展協會跟農會可以一起辦活動嗎',stub('協會可以和別的團體合辦活動：本站查到的法規沒有禁止','可以。'));
blocked(g3,'農會的理事任期幾年',stub('一般協會理監事任期：最長四年','四年。'),FIXED);

if(bad)throw new Error('第7輪理解把關測試失敗 '+bad+' 項');
console.log('test-understanding-20261127-7 ok');
