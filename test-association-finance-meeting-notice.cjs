const assert=require('node:assert/strict');
const a=require('./association-finance-meeting-month.js');
const today=new Date('2026-11-27T18:33Z');
const x=a.start('我只知道協會下個月要開會，決算和通知要怎麼辦？',today);
assert.equal(x.kind,null);assert.equal(x.notice,true);assert.deepEqual(x.date,{y:2026,m:12,d:null});
const y=a.start('協會115年12月17日開會，決算和通知都要怎麼做？',today);
assert.deepEqual(y.date,{y:2026,m:12,d:17});
for(const [kind,notice,safe] of [['assembly','開會十五日前','2026年12月1日'],['board','開會七日前','2026年12月9日'],['supervisor','開會七日前','2026年12月9日'],['joint','開會七日前','2026年12月9日']]){
 const r=a.answer({...y,kind});assert.ok(r.steps.flat().join(' ').includes(notice));assert.ok(r.steps.flat().join(' ').includes(safe));assert.ok(r.steps.flat().join(' ').includes('不是個案法定最後一天'));
 assert.equal(r.steps.flat().join(' ').includes('大會另應'),kind==='assembly');
}
assert.equal(a.noticePlanDate('assembly',{y:null,m:12,d:17}),'');
assert.equal(a.start('合作社決算和通知怎麼辦？',today),null);
assert.equal(a.start('協會開會員大會，決算和通知用電子郵件沒收到怎麼處理？',today),null);
