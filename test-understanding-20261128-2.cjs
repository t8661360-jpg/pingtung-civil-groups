/* 理解把關 2026-11-28 第2輪（處理待確認：別的排程新增的模組太貪心）：
   補助款買的設備不是借用器材、印花稅與單純會址借用不是借場地、國稅局／補助機關／會計師查帳不是監事會查核、
   退會後出席人數不是名冊分享、寄選票表決修章不是通訊選舉、「理事長不肯召集大會」「會員代表要幾個人才能開會」不用再問會議種類、
   理監事退職金＝無給職、選單不列民眾原句 */
const fs=require('fs'),vm=require('vm');
let bad=0;const fail=(q,m)=>{bad++;console.log('✗',q,'=>',m)};
const mod=f=>require('./'+f);
const isNull=(fn,q,name)=>{const r=fn(q);if(r)fail(q,name+' 不該接手：'+(r.title||JSON.stringify(r).slice(0,60)))};
const notNull=(fn,q,name)=>{const r=fn(q);if(!r)fail(q,name+' 應該仍然接手')};

/* 1. 借用器材模組 */
const be=mod('association-borrowed-equipment.js').route;
for(const q of ['社區發展協會要解散，剩下的錢跟公所的補助設備要給誰','補助款買的設備，協會解散後要還給縣府嗎','協會解散，補助款買的電腦可以送給別的協會嗎','協會要解散了，縣府補助購置的音響怎麼處理','社區協會解散時，公所補助的器材要給誰'])isNull(be,q,'借用器材');
for(const q of ['協會向里辦公處借的音響，解散時要還嗎','協會借公所的帳篷弄壞了要賠嗎','協會解散，器材上貼里辦公處的貼紙，不知道是誰的'])notNull(be,q,'借用器材');
/* 2. 場地與會址模組 */
const vu=mod('association-venue-use-and-grants.js').route;
for(const q of ['屏東協會租房，房東在租約上簽名寫已收租金和押金，要貼印花稅嗎？','協會可以借用朋友的公司當會址嗎','協會會址可以借用理事長家嗎','協會想借用別的協會的會址登記可以嗎','協會租約要不要貼印花稅，押金也要嗎'])isNull(vu,q,'場地與會址');
for(const q of ['協會借活動中心辦活動，押金退了，補助核銷怎麼寫','協會借里民中心當會址，也在那裡辦活動，水電費怎麼分'])notNull(vu,q,'場地與會址');
/* 3. 監事會查核模組 */
const au=mod('association-audit-borrowing.js').route;
for(const q of ['協會被國稅局查帳怎麼辦','補助款被查帳要準備什麼','要不要請會計師查帳','協會帳目要請會計師查帳嗎','縣府補助單位來查帳要準備什麼'])isNull(au,q,'監事會查核');
for(const q of ['監事可以查帳嗎','監事會要怎麼查帳'])notNull(au,q,'監事會查核');
/* 4. 名冊分享模組 */
const er=mod('election-roster-sharing.js');const ern=er.route||er;
for(const q of ['協會退會已生效，不過名冊早已審定，大會出席人數怎麼算？','名冊審定後有人退會，應出席人數要扣掉嗎','協會退會的人還算在名冊裡，法定人數怎麼算'])isNull(ern,q,'名冊分享');
notNull(ern,'協會改選前會員名冊可以影印帶回家嗎？','名冊分享');
/* 5. 通訊選舉模組 */
const me=mod('mail-election-organization.js');const men=me.route||me;
for(const q of ['我們協會想用寄選票來表決修章，可以順便把投票名冊公布嗎？','協會修改章程可以用通訊投票表決嗎','協會的議案可以寄選票表決嗎'])isNull(men,q,'通訊選舉');
/* 6. 會議種類選擇 */
const mc=mod('meeting-convening-distinction.js');const mcn=mc.answer||mc.route||mc;
for(const q of ['理事長不肯召集大會怎麼辦','理事長不想召開大會可以嗎','理事長拒絕召集大會怎麼辦']){const r=mcn(q);if(!r||!/會員大會/.test(r.title||''))fail(q,'應直接答會員大會召集，實際「'+(r&&r.title)+'」')}
{const r=mcn('理事長不想開會怎麼辦');if(r&&/會員大會/.test(r.title||''))fail('理事長不想開會怎麼辦','沒講哪種會，應該先問會議種類')}
const mq=mod('meeting-quorum-kind-clarification.js');const mqn=mq.scope||mq.route||mq;
for(const q of ['會員代表要幾個人才能開會','會員代表要多少人出席才能開會','會員代表要幾個人才能成會'])isNull(mqn,q,'會議種類選擇');
notNull(mqn,'要幾個人才能開會','會議種類選擇');
/* 7. 理監事退職金＝無給職 */
const r=require('./round-fixes.js');
for(const q of ['理事長卸任可以拿退職金嗎','理監事做滿兩屆有退休金嗎','理事長下台可以領慰勞金嗎','監事卸任有沒有退職金']){const a=r.verifiedRoundAnswer(r.normalizeQuestion(q),{});if(!a||!/無給職/.test(a.title))fail(q,'應答理監事無給職，實際「'+(a&&a.title)+'」')}
for(const q of ['總幹事離職有退職金嗎','員工退休金怎麼提撥']){const a=r.verifiedRoundAnswer(r.normalizeQuestion(q),{});if(a&&/無給職/.test(a.title))fail(q,'受僱人員不該答無給職')}
/* 8. 選單不列民眾原句 */
const QQ='協會理事會紀錄要在三十天內送縣府嗎？出席名單可以公開嗎？';
const list=[QQ,'理事會紀錄要寄給誰','理事會決議要報縣府嗎','志工的名冊可以公開嗎'];
const win={keywordQuestions:()=>list};
const ctx={window:win,document:{querySelector:()=>null,getElementById:()=>null},console,localStorage:{getItem:()=>null,setItem(){}}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('./answer-guard.js','utf8'),ctx);
const g9=win.__understandingGuard9;
const m=g9('協會名字跟別的協會一樣可以嗎',{direct:true,category:'x',title:'協會改名',summary:'改名就是修改章程。',steps:[],notes:[]});
if(!m||!m.related||m.related.includes('協會名字跟別的協會一樣可以嗎'))fail('選單','不該列出民眾原句');

if(bad)throw new Error('2026-11-28 第2輪理解把關測試失敗 '+bad+' 項');
console.log('2026-11-28 第2輪理解把關測試通過');
/* 9. 修章報縣府、修章要不要通知會員：不用再問哪一種會議 */
{const nr=require('./meeting-kind-notice-review.js').route;let b2=0;
for(const q of ['章程修正後要報縣府嗎','修章程要事先通知會員嗎','章程改完要不要送縣府','修改章程前要通知會員嗎']){const x=nr(q);if(x&&/先確認是哪一種會議/.test(x.title)){b2++;console.log('✗',q,'不該再問會議種類')}}
if(b2)throw new Error('第2輪第9項失敗 '+b2);}
