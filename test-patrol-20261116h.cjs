const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
let bad=0;
const cases=[
 [['合作社的財務報表一年要做幾次','合作社財報要報給誰','合作社決算要經過社員大會嗎','合作社的決算報表要送縣府嗎'],/決算和財務報表每年做一次/,/第36條/],
 [['合作社監事要查帳嗎','合作社監事多久查一次帳'],/監事要查帳/,/第5條/],
 [['合作社預算要不要社員大會通過'],/預算要不要社員大會通過/,/第15條/],
 [['合作社可以借錢給社員嗎'],/借錢給社員/,/第75條/],
 [['合作社的錢可以存哪裡'],/錢可以存哪裡/,/第25條/],
 [['合作社忘記做決算怎麼辦'],/忘了做決算/,/第74條/],
 [['合作社社員要繳什麼錢'],/社員要繳什麼錢/,/第17條/],
 [['合作社理事長可以領薪水嗎','合作社理監事有沒有車馬費'],/有沒有薪水/,/第11條/],
 [['合作社會計要有證照嗎'],/要不要有證照/,/第6條/],
 [['合作社帳冊要保存幾年'],/要保存幾年/,/第5條/],
 [['合作社股息最高多少'],/股息最高多少/,/第22條/],
 [['合作社要不要找會計師查帳'],/會計師查帳/,/第36條/],
];
for(const [qs,tt,ss] of cases)for(const q of qs){const x=A(q);if(!x||!x.direct||!tt.test(x.title)||!ss.test(x.summary)){console.error('FAIL',q,x&&x.title);bad++;}}
// 排除：不得被新規則搶走
for(const q of ['合作社年底要做哪些報表','合作社怎麼設立','協會的財務報表一年要做幾次','合作社盈餘怎麼分','合作社公積金要提多少','合作社向銀行借錢要怎麼辦','合作社理事任期幾年','合作社理事長可以連任嗎','合作社監事要選幾人','合作社借款給社員要繳稅嗎','合作社要不要繳營業稅','合作社股金可以退還嗎','公會的理事長可以領薪水嗎']){const x=A(q);if(x&&/決算和財務報表每年|監事要查帳|預算要不要|借錢給社員|忘了做決算|有沒有薪水|要不要有證照|帳冊要保存|股息最高|會計師查帳|錢可以存哪裡|要繳什麼錢/.test(x.title)){console.error('MISFIRE',q,x.title);bad++;}}
{const z=require('zlib'),fs=require('fs');const d=JSON.parse(z.gunzipSync(fs.readFileSync(__dirname+'/data/statutes.json.gz'))).laws;const C=d.D0050112.articles,F=d.D0050114.articles,S=d.D0050122.articles,H=d.D0050198.articles;
 if(!/一個月內/.test(C['36'])||!/年息不得超過百分之十/.test(C['22'])||!/殷實銀行/.test(C['25'])||!/必要時另以法律/.test(C['75'])||!/四千元以上二萬元/.test(C['74'])||!/無給職/.test(F['11'])||!/應置會計人員/.test(F['6'])||!/每半年至少/.test(S['5'])||!/不得兼任聘任職員/.test(H['7'])||!/三日前/.test(S['6-2'])||!/書面報告/.test(S['10'])){console.error('statute');bad++;}}
if(bad)throw new Error('patrol71 failed '+bad);console.log('ok');
