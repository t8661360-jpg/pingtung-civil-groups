'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const zlib = require('node:zlib');
const { spawnSync } = require('node:child_process');
const { articleNumber, checkReply } = require('./scripts/legal-citation-check.cjs');
const NLU = require('./nlu-enhancements.js');
let passed = 0;
function test(name, fn) {
  fn(); passed += 1; console.log('PASS', name);
}
const law = 'Test Law';
const original = 'The liquidator shall collect debts and settle liabilities.';
const index = { [law]: {articles: {'61': original, '62': 'A majority decides.'}}};
const item = {id: 'test', question: 'A fixture, not legal advice', statutes: [{law,article:'61'}]};
const base = {conclusion:'A fixture conclusion', cites:[{law, article:'61', quote:'collect debts and settle liabilities.'}], confidence:'high',gaps:''};
const copy = () => JSON.parse(JSON.stringify(base));
const blocked = r => assert.equal(checkReply(item,r,index).status,'待人工');
test('article labels and full width',()=>{
  for(const s of ['61','第61條','６１條']) assert.equal(articleNumber(s),'61');
});
test('inserted article formats',()=>{
  for(const s of ['9-1','第9之1條','第9條之1']) assert.equal(articleNumber(s),'9-1');
  for(const s of ['nonsense','第九條','61abc','第9之1條之2']) assert.equal(articleNumber(s),null);
});
test('valid literal quote remains subject to human review',()=>{
  const r=checkReply(item,base,index);
  assert.equal(r.problems.length,0);
  assert.equal(r.legal_approval,false);
  assert.equal(r.requires_human_review,true);
  assert.match(r.status,/仍待人工/);
});
test('empty quote rejected',()=>{const r=copy();r.cites[0].quote='';blocked(r);});
test('missing quote rejected',()=>{const r=copy();delete r.cites[0].quote;blocked(r);});
test('whitespace quote rejected',()=>{const r=copy();r.cites[0].quote=' \n ';blocked(r);});
test('non-string quote rejected',()=>{const r=copy();r.cites[0].quote=123;blocked(r);});
test('invented wording rejected',()=>{const r=copy();r.cites[0].quote='All property is divided equally.';blocked(r);});
test('outside supplied article scope rejected',()=>{
  const r=copy();r.cites=[{law,article:'62',quote:'A majority decides.'}];blocked(r);
});
test('unknown law rejected',()=>{const r=copy();r.cites[0].law='Other Law';blocked(r);});
test('unknown article rejected',()=>{const r=copy();r.cites[0].article='999';blocked(r);});
test('no citations rejected',()=>{const r=copy();r.cites=[];blocked(r);});
test('invalid top-level outputs rejected',()=>{blocked(null);blocked([]);blocked('text');});
test('empty conclusion rejected',()=>{const r=copy();r.conclusion='';blocked(r);});
test('invalid confidence rejected',()=>{const r=copy();r.confidence='approved';blocked(r);});
test('low confidence held for review',()=>{const r=copy();r.confidence='low';blocked(r);});
test('missing gaps rejected',()=>{const r=copy();delete r.gaps;blocked(r);});
test('required conclusion words checked',()=>{
  const r=checkReply({...item,mustInclude:['missing term']},base,index);
  assert.equal(r.status,'待人工');
});
test('no-law claims carry source-completeness warning',()=>{
  const r=copy();r.conclusion='法規無明文';
  assert(checkReply(item,r,index).reminders.some(s=>s.includes('全部現行法規')));
});
const nlu=new NLU();
test('NLU does not generate old unverified legal claims',()=>{
  for(const domain of ['social','coop']){
    const s=nlu.generateEnhancedPrompt('chairReelection',domain);
    assert.doesNotMatch(s,/法律上沒有限制|連任以一次為限|合作社法第\s*20/);
    assert.match(s,/不是法律結論/);
  }
});
test('NLU uses approved switchboard',()=>{
  const r=nlu.comprehendQuestion('協會理事長可以連任幾屆');
  assert(r.nextSteps.join(' ').includes('08-7320415'));
  assert(!JSON.stringify(r).includes('7360316'));
});
test('decimal percentages retain fractional values',()=>{
  const r=nlu.validateCalculation('200人改選75.5%');
  assert.equal(r.result,151);
  assert.equal(r.mathematicalOnly,true);
  assert.equal(r.requiresLegalBasis,true);
});
test('invalid fractions and totals rejected',()=>{
  for(const q of ['0人改選50%','5人改選0分之1','5人改選101%','5人改選0%','無關問題'])
    assert.equal(nlu.validateCalculation(q),null);
});
test('strict-majority cannot be silently inferred from rounding',()=>{
  assert.match(nlu.validateCalculation('10人改選50%').warning,/過半數/);
});
test('CLI mock never calls a real provider and keeps approval false',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'review-safety-'));
  try{
    fs.mkdirSync(path.join(dir,'data'));
    fs.mkdirSync(path.join(dir,'verify'));
    fs.writeFileSync(path.join(dir,'data/statutes.json.gz'),
      zlib.gzipSync(JSON.stringify({laws:{TEST:{name:law,articles:index[law].articles}}})));
    fs.writeFileSync(path.join(dir,'queue.json'),JSON.stringify([item]));
    const replyFile=path.join(dir,'mock.json');
    fs.writeFileSync(replyFile,JSON.stringify({test:base}));
    const script=path.resolve(__dirname,'scripts/gpt-verify.cjs');
    let r=spawnSync(process.execPath,[script,'queue.json','report.json'],
      {cwd:dir,encoding:'utf8',env:{...process.env,GPT_MOCK:replyFile,OPENAI_API_KEY:''},timeout:10000});
    assert.equal(r.status,0,r.stderr);
    const report=JSON.parse(fs.readFileSync(path.join(dir,'report.json'),'utf8'));
    assert.equal(report[0].legal_approval,false);
    assert.equal(report[0].problems.length,0);
    r=spawnSync(process.execPath,[script,'queue.json','--brief'],
      {cwd:dir,encoding:'utf8',env:{...process.env,OPENAI_API_KEY:''},timeout:10000});
    assert.equal(r.status,0,r.stderr);
    assert.match(fs.readFileSync(path.join(dir,'verify/brief.md'),'utf8'),/本題提供原文未載/);
  } finally { fs.rmSync(dir,{recursive:true,force:true}); }
});
console.log(`Review safety: ${passed} test groups passed; fixtures do not validate real legal conclusions.`);
