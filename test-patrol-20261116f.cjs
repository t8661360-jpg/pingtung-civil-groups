const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
let bad=0;
const cases=[
 [['什麼情況募款不用申請許可','哪些募款不用申請','小型募款免許可嗎'],/沒有「金額小、規模小就免許可」/,/第6條/],
 [['勸募可以請公司代辦嗎','募款活動能找別人幫忙辦嗎','勸募活動可以委託別人辦嗎'],/法規沒有明文，責任仍在勸募團體/,/第15條/],
 [['勸募期間最長多久','募款最長可以募多久'],/最長一年/,/第12條/],
 [['勸募的錢誰在管','勸募的錢誰管'],/主管機關可隨時檢查帳冊/,/第21條/],
];
for(const [qs,tt,ss] of cases)for(const q of qs){const x=A(q);if(!x||!x.direct||!tt.test(x.title)||!ss.test(x.summary)){console.error('FAIL',q,x&&x.title);bad++;}}
for(const [q,re] of [['勸募許可要等多久',/等多久/],['勸募結束後要公告什麼',/報兩次/],['不能出席可以委託別人嗎',null],['合作社募款不用許可嗎',/__none__/]]){const x=A(q);if(re===null){if(x&&/勸募/.test(x.title||'')){console.error('OVER',q);bad++;}}else if(x&&/沒有「金額小/.test(x.title||'')){console.error('OVER',q);bad++;}else if(re.source!=='__none__'&&(!x||!re.test(x.title))){console.error('REG',q,x&&x.title);bad++;}}
{const z=require('zlib'),fs=require('fs');const d=JSON.parse(z.gunzipSync(fs.readFileSync(__dirname+'/data/statutes.json.gz')));const L=d.laws.D0050138.articles;
 if(!/最長為一年/.test(L['12'])||!/向會員或所屬人員/.test(L['6'])||!/政治活動/.test(L['3'])||!/隨時檢查/.test(L['21'])){console.error('statute');bad++;}}
if(bad)throw new Error('patrol69 failed '+bad);console.log('ok');
