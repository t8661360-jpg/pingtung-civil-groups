const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
let bad=0;
const cases=[
 [['理事會可以請人代打嗎','理事可以找人代替我開會嗎'],/不能找人代打/,/第31條/],
 [['常務理事會可以代替理事會嗎','常務理事會能取代理事會嗎'],/常務理事會能不能代替/,/第29條/],
 [['理事長不肯召集大會怎麼辦','會長拒絕召集大會怎麼辦'],/不肯召集會員大會/,/第15條/],
 [['理事長不肯召集理事會怎麼辦'],/不肯召集理事會/,/第13條/],
 [['大會要不要報縣府','會員大會要通知縣府嗎'],/大會要報縣府/,/第26條/],
 [['大會時間地點寫錯通知了怎麼辦','開會通知日期打錯怎麼辦'],/通知寫錯/,/第58條/],
 [['一個人可以拿幾張委託書','大會委託書一個人可以收幾張'],/一位會員最多/,/第42條/],
];
for(const [qs,tt,ss] of cases)for(const q of qs){const x=A(q);if(!x||!x.direct||!tt.test(x.title)||!ss.test(x.summary)){console.error('FAIL',q,x&&x.title);bad++;}}
for(const q of ['合作社理事長不肯召集社員大會怎麼辦','公會的理事可以找人代打嗎','公會大會要報縣府嗎','協會理事會多久開一次','理事長代理人是誰','協會聘請員工可以找人代班嗎','大會會議紀錄要報縣府嗎','改選結果要報縣府嗎','會員大會要提前幾天通知','合作社社員大會委託書最多幾張','理事可以委託別人出席嗎','社區發展協會理事長沒空可以請人代理嗎','成立大會後要準備哪些文件報縣府','協會會員可以委託幾個人']){const x=A(q);if(x&&/不能找人代打|常務理事會能不能|不肯召集|大會要報縣府|通知寫錯|一位會員最多/.test(x.title)){console.error('MISFIRE',q,x.title);bad++;}}
{const z=require('zlib'),fs=require('fs');const d=JSON.parse(z.gunzipSync(fs.readFileSync(__dirname+'/data/statutes.json.gz'))).laws;const P=d.D0050091.articles,G=d.D0020094.articles;
 if(!/不得委託他人代理/.test(P['31'])||!/代理一人為限/.test(P['42'])||!/報請主管機關派員列席/.test(P['26'])||!/指定理事一人/.test(P['32'])||!/三十日內報請主管機關備查/.test(G['12'])||!/三十日內召開/.test(G['15'])||!/十五日內/.test(G['13'])||!/連續三次/.test(G['14'])){console.error('statute');bad++;}}
if(bad)throw new Error('patrol72 failed '+bad);console.log('ok');
