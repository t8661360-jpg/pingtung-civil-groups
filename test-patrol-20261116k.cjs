const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
let bad=0;
const cases=[
 [['理事長是理事互選還是會員直接選','理事長是誰來選的'],/由理事選出來/,/第17條/],
 [['選舉要有選舉辦法嗎','改選要先成立選務小組嗎'],/沒有規定一定要另外訂/,/第8條/],
 [['選出來的理事不想當怎麼辦','理事當選了可以放棄嗎'],/放棄當選/,/第15條/],
 [['會員代表可以被選為理事嗎','代表可以參選監事嗎'],/可以。人民團體的理事/,/第17條/],
 [['舊理事長不肯交印信怎麼辦'],/移交/,/第18條/],
];
for(const [qs,tt,ss] of cases)for(const q of qs){const x=A(q);const all=x&&(x.title+x.summary+JSON.stringify(x.statutes||[]));if(!x||!x.direct||!tt.test(all)||!ss.test(all)){console.error('FAIL',q,x&&x.title);bad++;}}
for(const q of ['合作社理事長是理事互選嗎','公會要有選舉辦法嗎','理事長任期多久','通訊選舉辦法怎麼訂','理事辭職怎麼辦','協會的圖記怎麼刻','社區發展協會會員代表可以當理事嗎']){const x=A(q);if(x&&/理事長不是會員直接選|不另訂選舉辦法|另訂選舉辦法|當選了不想當|會員代表可以當選/.test(x.title)){console.error('MISFIRE',q,x.title);bad++;}}
{const z=require('zlib'),fs=require('fs');const d=JSON.parse(z.gunzipSync(fs.readFileSync(__dirname+'/data/statutes.json.gz'))).laws;const E=d.D0050093.articles;
 if(!/得當場或於就任前以書面提出放棄當選/.test(E['15'])||!/確定監票|監票、發票、唱票及記票/.test(E['8'])||!/應訂定相關辦法/.test(E['23'])||!/名冊/.test(E['5'])||!/選舉辦法|選舉票/.test(E['6'])){console.error('statute');bad++;}
 if(!/就常務理事中選舉一人為理事長/.test(d.D0050091.articles['17'])){console.error('statute17');bad++;}}
if(bad)throw new Error('patrol74 failed '+bad);console.log('ok');
