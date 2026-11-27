const assert=require('node:assert/strict');
const {volunteerInsurance}=require('./association-volunteer-insurance.js');
for(const [q,parts] of [
 ['志工保險要協會自己出錢嗎，可以用補助款付嗎？',['第16條','不等於協會只能用自有經費','核定的用途和金額','不重複報支']],
 ['我們協會正式志工可先不保，等縣府補助下來再保嗎？',['不能等到縣府補助下來','確認保障生效後再安排服務']],
 ['縣府核定的項目沒保險，可把活動場地費改志工意外保險並核銷嗎？',['先不要把場地費自行改成志工保費','未獲准前','不要假定保單可追溯']],
 ['屏東社區協會可用這場研習補助核銷全年志工意外保費嗎？',['不代表全年志工保費自動都可以報','活動、期間、對象與額度']],
 ['縣府補助款可以報志工意外保費嗎？我們協會一定要先自費？',['不等於協會只能用自有經費','核對被保險對象']],
 ['在屏東協會，活動的公共意外責任險和正式志工保險都要自費嗎？',['不同','不可只看保單名稱就互相替代']],
]){const a=volunteerInsurance(q);assert.ok(a,q);const txt=JSON.stringify(a);for(const s of parts)assert.ok(txt.includes(s),q+' missing '+s);}
for(const q of ['協會活動的參加者怎麼辦公共意外責任保險？','屏東祥和計畫有哪些志工隊和資格？','協會受僱員工的勞保誰出？','正式志工意外保險可以向保險公司理賠嗎？'])assert.equal(volunteerInsurance(q),null,q);
console.log('志工保險出資、核定及保障區分通過');
const choice=volunteerInsurance('協會活動有人短期來幫忙，我不確定算不算正式志工，補助可付保險嗎？');
assert.equal(choice?.choices?.length,2);
assert.match(volunteerInsurance(choice.choices[0].question)?.summary,/志願服務運用單位辦理/);
assert.match(volunteerInsurance(choice.choices[1].question)?.title,/不直接套用/);
