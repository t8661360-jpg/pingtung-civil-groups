const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const page=fs.readFileSync(__dirname+'/index.html','utf8');
const begin=page.indexOf('  if(typeof normalizeQuestion==="function"){');
assert.ok(begin>0);
const end=page.indexOf('  busy=true;',begin);
assert.ok(end>begin);
const guard=page.slice(begin,end);
function run(normalizeQuestion,withContext){
 const c={q:'原始問題',shownQ:'原始問題',prevQ:'前題',normalizeQuestion,withContext};vm.runInNewContext(guard,c);return c.q;
}
assert.equal(run(undefined,undefined),'原始問題');
assert.equal(run(()=>{throw new TypeError('normalize is not a function');},undefined),'原始問題');
assert.equal(run(x=>x,()=>{throw Error('optional context not ready');}),'原始問題');
assert.equal(run(x=>'整理後 '+x,(q,prev)=>prev+' '+q),'整理後 前題 原始問題');
