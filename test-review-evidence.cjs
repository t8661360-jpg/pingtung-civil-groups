'use strict';
// Read-only evidence for the 2026-11-13 pending list. No network, no API keys.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const zlib = require('node:zlib');
const laws = JSON.parse(zlib.gunzipSync(fs.readFileSync('data/statutes.json.gz'))).laws;
assert(laws && typeof laws === 'object');
const picks = {
 '人民團體法':['6','8','10','11','12','20','21','24','27','29','32','54','58'],
 '人民團體會務輔導辦法':['9','12','18','27'],
 '社會團體財務處理辦法':['9','11','14','15','19','21','22'],
 '社會團體工作人員管理辦法':['3','4','5','7'],
 '合作社法':['23','32','33','34','59','60','61','62','63','64','65'],
 '合作社選舉罷免辦法':['4','5','14','15','16'],
 '合作社業務提供非社員使用辦法':['8']
};
console.log('REVIEW_LAW_CATALOG', JSON.stringify(Object.entries(laws).map(([code,l])=>({code,name:l.name}))));
for (const [name, articles] of Object.entries(picks)) {
 const entry = Object.entries(laws).find(([,law])=>law.name === name);
 if (!entry) { console.log('REVIEW_MISSING_LAW', name); continue; }
 const [pcode, law] = entry;
 for (const article of articles) console.log('REVIEW_ARTICLE', JSON.stringify({pcode,name,article,text:law.articles[article] ?? null}));
}
const source = fs.readFileSync('round-fixes.js','utf8').split('\n');
const names = ['supervisorMinimumMembers','chairNoMeeting','officeMove','addressCertificate','coopDissolutionProperty','coopRepresentativeAssembly','coopMemberDeath','patrol19','patrol18','patrol12'];
for (const name of names) {
 const hits = source.flatMap((line,index)=>line.includes('function '+name+'(')||line.includes('function '+name+' (')?[index]:[]);
 for (const start of hits) {
  let end=start+1;
  while(end<source.length && end<start+85 && !/^\s*function\s+\w+\s*\(/.test(source[end])) end++;
  console.log('REVIEW_FUNCTION_BEGIN',name,start+1,end);
  source.slice(start,end).forEach((line,i)=>console.log(String(start+i+1).padStart(5,' ')+' '+line));
  console.log('REVIEW_FUNCTION_END',name);
 }
}
console.log('REVIEW_EXPORTS',source.slice(-45).join('\n'));
const kb = JSON.parse(fs.readFileSync('data/knowledge.json','utf8'));
console.log('REVIEW_KB_SHAPE',Array.isArray(kb)?'array':Object.keys(kb));
const entries = Array.isArray(kb)?kb:Object.values(kb).find(Array.isArray)||[];
const terms=/會址怎麼變更|理事長交接和圖記|協會聘顧問|試用期|沒有法人資格|解散後.*財產|協會可以登記為社團法人/;
for(const item of entries) if(terms.test(String(item.title||item.question||''))) console.log('REVIEW_KB_ENTRY',JSON.stringify(item));
console.log('PASS read-only evidence: statutes schema exists; no website data modified');
