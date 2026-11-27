const assert=require('node:assert/strict');
const {answerMixed:A,yearEndAuditVacancy:Y}=require('./verified-mixed-questions');
const all=a=>[a.summary,...a.steps.flat(),...a.refs.map(x=>x.title)].join(' ');
assert.match(all(A('協會監事辭職，只剩一名監事，可以單獨審年度決算嗎？')),/不能由一名監事單獨.*至少三名監事.*辭職是否經監事會決議生效.*候補監事依次遞補.*三分之二.*指定召集不等於授權一人代作決議/);
assert.match(all(A('可不可以直接送年度決算？我們協會監事會還沒開。')),/不能跳過監事會.*大會追認/);
assert.match(all(A('協會監事連續請公假，年度決算還要先經監事會嗎？剩下的人可以先簽嗎？')),/請假仍不是出缺.*不能直接扣除.*依法成會/);
for(const q of ['合作社監事只剩一人可以審決算嗎？','協會年度決算的監事會何時開？','協會申請補助要先送監事會審決算嗎？','工會監事只剩一名應如何審決算？'])assert.equal(Y(q),null,q);
console.log('vacancy, leave, and early submission are distinct');
