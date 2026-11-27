/* 第238輪：入會與退會 */
const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
let bad=0;
const pos=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&a.title||'';if(!t.includes(k)){bad++;console.log('✗',q,'=>',t||'(無)','期望',k)}});
const neg=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&a.title||'';if(t.includes(k)){bad++;console.log('✗反',q,'=>',t)}});
pos(['退會要怎麽辦','怎麽退會','我想退會要怎麽辦'],'會員想退會');
pos(['連續沒來開會幾次可以除名','連續三次不來開會可以開除嗎'],'不來開會或不參加活動會被除名嗎');
/* 既有規則已能答的同類問法：不可再是難倒小屏，且要談到除名或資格 */
['會員不想參加活動會被除名嗎','好幾次沒參加活動會被踢出協會嗎','會員一直不出席大會會被開除嗎','常常缺席活動可以取消會員資格嗎'].forEach(q=>{const a=A(q);const t=a&&a.title||'';if(!/(除名|資格|退會)/.test(t)){bad++;console.log('✗',q,'=>',t||'(無)')}});
neg(['理事連續缺席會解任嗎','理事長不來開會可以除名嗎','理事會缺席要怎麼辦'],'會員不來開會或不參加活動');
pos(['理事長可以決定誰能入會嗎','理事會能不能決定誰可以入會','會長可以核准誰入會嗎'],'會員資格或入會誰決定');
pos(['不喜歡理事長可以退會嗎','討厭理事長想退出協會可以嗎','對理事會不滿可以退會嗎'],'會員想退會');
neg(['不喜歡理事長可以退會嗎'],'理事、監事退會');
pos(['理事長不批退會怎麼辦'],'協會不讓會員退會');
pos(['團體會員怎麼入會','團體會員入會要怎麼申請','團體會員如何加入'],'團體會員怎麼入會');
pos(['團體會員是什麼'],'團體會員是什麼');
pos(['會籍資料可以給別人看嗎','會籍資料可以交給外人嗎'],'會員名冊可以給外人看');
pos(['會員的會籍資料要多久更新一次'],'會員資料多久更新');
const st=JSON.parse(require('zlib').gunzipSync(require('fs').readFileSync(__dirname+'/data/statutes.json.gz')));
const P=st.laws.D0050091.articles;
[[14,'得經會員（會員代表）大會決議予以除名'],[27,'會員（會員代表）之除名'],[13,'其權利之行使與會員同'],[12,'會員入會、出會與除名']].forEach(([n,k])=>{if(!String(P[n]).includes(k)){bad++;console.log('✗人團法§'+n)}});
if(!st.laws.B0000001.articles[54].includes('不得超過六個月'))bad++;
if(bad)throw new Error('r238 失敗 '+bad);
console.log('r238 ok');
