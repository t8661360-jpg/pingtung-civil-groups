/* 理解把關 2026-11-27 第8輪：
   沒錢不開大會會被解散嗎、大會延到明年、候選人當監票員、大會主席不讓會員發言（不是入會被拒）、
   欠繳會費的候補能不能遞補、換往來銀行、合作社和協會混問、講師費給多少＋扣稅 */
const fs=require('fs'),vm=require('vm');
const r=require('./round-fixes.js');
const list=JSON.parse(fs.readFileSync('./data/keyword-questions.json','utf8')).questions;
const win={keywordQuestions:()=>list};
const ctx={window:win,document:{querySelector:()=>null,getElementById:()=>null},console,localStorage:{getItem:()=>null,setItem(){}}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('./answer-guard.js','utf8'),ctx);
const g8=win.__understandingGuard8;
if(typeof g8!=='function')throw new Error('answer-guard.js 沒有匯出 __understandingGuard8');
let bad=0;
const N=q=>r.normalizeQuestion(q);
const A=q=>r.verifiedRoundAnswer(N(q),{});
const fail=(q,msg)=>{bad++;console.log('✗',q,'=>',msg)};
const MENU='您是不是要問以下相關的問題？';
const stub=(title,summary,extra)=>Object.assign({direct:true,category:'人民團體會務說明',title,summary:summary||title,steps:[],notes:[]},extra||{});
const normIs=(q,want)=>{const n=N(q);if(n!==want)fail(q,'正規化應為「'+want+'」，實際「'+n+'」')};
const normNot=(q,no)=>{const n=N(q);if(n===no)fail(q,'不該正規化成「'+no+'」')};
const titleNot=(q,no)=>{const a=A(q);if(a&&String(a.title).includes(no))fail(q,'不該是「'+no+'」')};
const blocked=(q,a,want)=>{const x=g8(q,a);if(!x)return fail(q,'沒有擋下：'+(a&&a.title));if(want&&!String(x.title).includes(want))fail(q,'應為「'+want+'」，實際「'+x.title+'」')};
const passes=(q,a)=>{const x=g8(q,a);if(x)fail(q,'不該擋：'+(a&&a.title)+' → '+x.title)};

/* 1. 沒錢不開大會、大會延到明年＝會員大會可以不開嗎 */
for(const q of ['理事長說今年沒錢不開大會了，這樣可以嗎？會被解散嗎','沒錢不開大會會被解散嗎','今年經費不夠不想開大會了','協會沒有經費今年不辦大會可以嗎','不開大會會不會被解散','會員大會可以延到明年開嗎','今年經費不足，大會可以延到明年嗎','今年大會不開了明年再一起開可以嗎'])normIs(q,'會員大會可以不開嗎');
for(const q of ['協會沒錢了可以解散嗎','會員大會可以延期嗎','合作社今年沒錢不開社員大會可以嗎','理事會今年不開會被罰嗎','我們沒錢想解散協會'])normNot(q,'會員大會可以不開嗎');
for(const q of ['協會沒錢了可以解散嗎','我們協會沒有經費了想解散'])if(!/沒有錢也可以解散/.test((A(q)||{}).title||''))fail(q,'應仍答「沒有錢也可以解散」');
/* 2. 候選人當監票員 */
for(const q of ['理監事選舉的候選人可以自己當監票員嗎','候選人可以當開票員嗎','改選的候選人能不能擔任唱票員','理事候選人可以兼監票員嗎','監事選舉候選人可以做選務人員嗎'])normIs(q,'候選人可以擔任監票員嗎');
titleNot('理監事選舉的候選人可以自己當監票員嗎','監事會召集人');
if(!/監事會召集人/.test((A('監事會主席怎麼選')||{}).title||''))fail('監事會主席怎麼選','應仍答監事會召集人');
/* 3. 主席不讓發言不是入會被拒 */
for(const q of ['會員大會主席可以不讓會員發言嗎','理事長可以不讓會員在大會講話嗎','大會主席可以不准會員提問嗎','開會時理事長拒絕讓會員表達意見可以嗎','主席可以不讓會員提案嗎'])titleNot(q,'協會入會依章程');
if(!/入會/.test((A('我被協會拒絕入會')||{}).title||''))fail('我被協會拒絕入會','應仍答入會被拒');
const JOIN=stub('協會入會依章程，一般須經理事會通過；被拒絕可先請協會說明理由','一般協會的入會資格與程序由章程訂定。');
for(const q of ['會員大會主席可以不讓會員發言嗎','會員在大會上一直講話主席可以叫他不要講嗎','理事會上理事長可以不准監事發言嗎','大會主席可以限制發言時間嗎','會員大會可以禁止會員提問嗎'])blocked(q,JOIN,MENU);
passes('主席可以限制每人發言時間嗎',stub('會議發言可以限制時間','依議事規則，主席可以限制每人發言時間。'));
/* 4. 欠繳會費＋遞補、出席、投票 */
const SUB=stub('理事、監事出缺：先由候補依次遞補','由候補理事、候補監事依次遞補（人民團體選舉罷免辦法第17條）。',{notes:['受停權處分的期間超過任期的二分之一']});
for(const q of ['如果會員欠繳會費兩年，但他是候補理事，可以遞補嗎','欠會費的候補監事可以遞補嗎','會費沒繳的候補理事輪到他遞補可以嗎','沒繳會費的人可以遞補理事嗎','候補理事欠會費三年還能遞補上去嗎'])blocked(q,SUB,MENU);
passes('沒繳會費的會員可以投票嗎',stub('欠繳會費會不會影響投票權：法規沒有明文，要看章程','欠繳會費…看章程。'));
passes('被停權的候補理事可以遞補嗎',stub('被停權的會員能不能出席或投票','停權期間超過任期二分之一…'));
passes('候補理事什麼時候可以遞補',SUB);
/* 5. 換往來銀行 */
const SEAL=stub('要。改選後提用存款要由新的負責人蓋章，銀行印鑑要辦變更，手續請向往來銀行確認','改選後負責人換人，要到往來銀行辦理負責人和印鑑的變更。');
for(const q of ['我們上個月改選完了，新理事長想換一家銀行，存摺要怎麼處理','協會可以換往來銀行嗎','理事長想把存款轉到另一家銀行要怎麼做','銀行想換別家要開會嗎','協會想更換銀行要報縣府嗎'])blocked(q,SEAL,MENU);
for(const q of ['理事長換人了銀行印鑑要換嗎','改選後銀行負責人要換嗎','理事長換人銀行的印章要換嗎'])passes(q,SEAL);
/* 6. 合作社和協會混問，答案兩種都沒談 */
const ANNUAL=stub('常年會=會員大會：定期會的習慣稱法','「常年會」和「會員大會」是同一概念。',{category:'服務說明'});
for(const q of ['合作社社員大會跟協會會員大會可以同一天一起開嗎','合作社跟公會的會員大會可以合併開嗎','合作社和協會的大會可以一起辦嗎','我們合作社和協會想同一天開會可以嗎','合作社跟工會可以一起開大會嗎'])blocked(q,ANNUAL,MENU);
passes('協會可以加入合作社當社員嗎',stub('協會或法人可以加入合作社當社員','合作社法第8條。'));
passes('合作社和協會有什麼不同',stub('合作社和協會不一樣','合作社依合作社法…協會依人民團體法。'));
/* 7. 講師費給多少 */
const TAXL=stub('講師費要扣稅嗎：國內居住的個人講師，扣10%','協會付講師費，協會是扣繳義務人。',{category:'稅務與扣繳'});
for(const q of ['協會辦研習要找講師，講師費可以給多少，要扣稅嗎','講師費一小時多少錢要扣稅嗎','講師費最多給多少，扣繳怎麼算','鐘點費可以給多少，要不要扣稅','講師費行情多少要扣稅嗎']){const x=g8(q,TAXL);if(!x)fail(q,'沒有加註');else if(!/查不到已核對的金額標準/.test(x.summary)||!/扣繳義務人/.test(x.summary))fail(q,'加註內容不對')}
passes('講師費要扣稅嗎',TAXL);
passes('出席費可以給多少',stub('理監事的出席費、交通費：法規沒有訂固定金額，參照政府機關的標準酌發','出席費…法規沒有訂固定金額。'));
blocked('誤餐費一個人可以報多少錢',TAXL,MENU);

if(bad)throw new Error('第8輪理解把關測試失敗 '+bad+' 項');
console.log('test-understanding-20261127-8 ok');
