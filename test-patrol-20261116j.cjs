const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
let bad=0;
const cases=[
 [['拿了補助沒花完怎麼辦','補助款花不完要繳回嗎'],/沒用完要繳回/,/第8點之1/],
 [['核銷要在多久內完成','補助核銷期限多久'],/20日內/,/第8點/],
 [['補助款可以跨年度用嗎'],/超過當年度沒核銷/,/當年度/],
 [['發票遺失了還能核銷嗎','核銷的收據弄丟了怎麼辦'],/沒有收據發票/,/單據/],
 [['核銷時要附活動照片嗎'],/成果報告/,/照片/],
 [['補助款用錯項目怎麼辦','補助款花錯用途會怎樣'],/追繳/,/第10點/],
 [['志工誤餐費能核銷嗎'],/餐點/,/第5點/],
 [['講師費要怎麼核銷'],/講師費/,/第8點/],
 [['核銷要理事長蓋章嗎'],/誰蓋章/,/第8點/],
 [['補助核銷被退件怎麼辦'],/核銷被退件/,/20日內/],
 [['補助款入帳要記到帳上嗎'],/記到協會帳上/,/第16條/],
];
for(const [qs,tt,ss] of cases)for(const q of qs){const x=A(q);if(!x||!x.direct||!tt.test(x.title+x.summary)||!ss.test(x.summary)){console.error('FAIL',q,x&&x.title);bad++;}}
for(const q of ['合作社補助款沒花完怎麼辦','魅力社區補助核銷要附什麼','勸募的錢沒花完怎麼辦','協會理事會要多久開一次','財務報表要幾天內送','申請補助被退件怎麼辦']){const x=A(q);if(x&&/補助款沒用完|核銷被退件|講師費|入帳要不要記/.test(x.title)&&!/申請補助被退件/.test(q)){console.error('MISFIRE',q,x.title);bad++;}}
{const z=require('zlib'),fs=require('fs');const d=JSON.parse(z.gunzipSync(fs.readFileSync(__dirname+'/data/statutes.json.gz'))).laws;const F=d.D0050097.articles;
 if(!/不得存放於其他公私企業或個人/.test(F['16'])||!/不得有匿報或虛報/.test(F['20'])){console.error('statute');bad++;}}
if(bad)throw new Error('patrol73 failed '+bad);console.log('ok');
