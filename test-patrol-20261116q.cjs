const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
let bad=0;
const cases=[
 [['員工上班受傷協會要負責嗎','員工發生職災要怎麼補償','員工在協會工作受傷醫藥費誰出','職員上班途中出車禍算職災嗎','員工得了職業病怎麼辦','總幹事工傷要給薪水嗎'],/工作受傷或生病/,/勞動基準法第59條/],
 [['協會要不要做員工的工資清冊','員工薪資明細要給嗎','薪水清冊要保存多久','員工的薪水單要留幾年','工資要每月發幾次'],/工資：每月至少發兩次/,/勞動基準法第23條/],
 [['員工的出勤紀錄要保存多久','協會要不要記員工打卡','員工可以要求看自己的出勤紀錄嗎','職員的上下班記錄要留嗎'],/出勤紀錄/,/勞動基準法第30條/],
];
for(const [qs,tt,ss] of cases)for(const q of qs){const x=A(q);const all=x&&(x.title+x.summary+JSON.stringify(x.statutes||[]));if(!x||!tt.test(x.title)||!ss.test(all)){console.error('FAIL',q,x&&x.title);bad++;}}
const no=['志工受傷怎麼辦','合作社員工受傷','公會員工發薪水','理事受傷可以請保險嗎','協會活動參加者受傷怎麼辦','會議紀錄要保存多久','簽到簿要保存多久','協會的帳冊要保存幾年'];
for(const q of no){const x=A(q);if(x&&/工作受傷或生病|每月至少發兩次|員工的出勤紀錄/.test(x.title)){console.error('MISFIRE',q,x.title);bad++;}}
const L=JSON.parse(require('zlib').gunzipSync(require('fs').readFileSync('data/statutes.json.gz'))).laws.N0030001.articles;
const chk=(n,kw)=>{if(!(L[n]||'').includes(kw)){console.error('ARTICLE MISMATCH',n,kw);bad++;}};
chk(59,'必需之醫療費用');chk(59,'五個月平均工資之喪葬費');chk(59,'四十個月平均工資之死亡補償');chk(61,'二年間不行使而消滅');chk(61,'不因勞工之離職而受影響');chk(23,'每月至少定期發給二次');chk(23,'工資清冊應保存五年');chk(30,'逐日記載勞工出勤情形至分鐘為止');chk(30,'雇主不得拒絕');
if(bad)throw new Error('patrol81 failed '+bad);console.log('ok');
