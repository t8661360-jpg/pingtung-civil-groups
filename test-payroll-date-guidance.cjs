const assert=require('node:assert/strict');
const answer=require('./payroll-date-guidance.js');
for(const q of ['今年跟明年協會聘用工讀生最低時薪多少？','民國116年協會員工最低月薪','協會請員工的基本工資多少']){
 const s=answer(q).summary;assert.match(s,/2026 年[^\n]*29,500 元[^\n]*196 元/);assert.match(s,/2027 年[^\n]*1 月 1 日起[^\n]*30,900 元[^\n]*205 元/);
}
for(const q of ['協會一次付兼職薪資3萬元，2026年12月付與2027年1月付，個人補充保費有差嗎？','工讀生的薪資單筆多少要扣補充保費？']){
 const s=answer(q).summary;assert.match(s,/給付日適用/);assert.match(s,/2026 年 12 月給付達門檻/);assert.match(s,/2027 年 1 月給付未達門檻/);assert.match(s,/含等於/);assert.match(s,/法定免扣/);
}
assert.match(answer('協會自己負擔的二代健保也看單筆最低工資嗎？').summary,/正差額/);
assert.match(answer('協會要幫職員做勞保投保薪資分級，2027年最低級是多少？').summary,/部分工時/);
for(const q of ['協會兼職人員薪資如何扣所得稅和補充保費','協會付講師鐘點費要扣二代健保嗎','合作社職員的投保薪資怎麼算','工讀生加班薪資低於最低工資怎麼辦','協會要不要繳二代健保補充保費']) assert.equal(answer(q),null,q);
