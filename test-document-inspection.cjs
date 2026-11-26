const assert=require('node:assert/strict');
const rule=require('./document-inspection.js');
for(const q of ['我是合作社員，可以看合作社的資產負債表嗎？','合作社債權人可以查閱收支餘絀表嗎？']){
 const a=rule(q);
 assert.match(a?.title??'',/可以查閱/,q);
 assert.match(a.summary,/社員和合作社的債權人/);
 assert(a.statutes.some(s=>s.title==='合作社法第37條'));
}
for(const q of ['我是協會會員，可以要求看每一張發票嗎？','社區發展協會會員能不能調閱原始憑證？']){
 const a=rule(q);
 assert.match(a?.summary??'',/定期公告財務收支/,q);
 assert.match(a.summary,/沒有規定會員能要求查閱每一張發票/);
 assert.match(a.summary,/監事會查核/);
}
for(const q of ['協會會員可否查閱理事會會議紀錄？','會員想看合作社理監事名單','信用合作社社員能否查閱資產負債表？','我不是合作社社員，可以看資產負債表嗎？','協會員工開發票要寫統編嗎？','公司股東有權查閱公司資產負債表嗎？']){
 assert.equal(rule(q),null,q);
}
console.log('document-inspection ok');
