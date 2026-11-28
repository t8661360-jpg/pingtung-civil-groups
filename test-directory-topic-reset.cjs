'use strict';
const a=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const s=fs.readFileSync(require('node:path').join(__dirname,'index.html'),'utf8');
const f=s.slice(s.indexOf('function dirQueryFrom(q,intent){'),s.indexOf('/* ================= 路由'));
const constNames=['LEAD_RE','PROCESS_RE','QUERY_RE'];
const ctx={townOf:q=>/東港/.test(q)?'東港鎮':'',detectCat:q=>/社福|社會服務/.test(q)?'社會服務團體':'',detectType:()=>'',CAT_ALIAS:[['社會服務團體',/社福|社會服務/]]};
const script=constNames.map(k=>s.match(new RegExp('^const '+k+'=.*;$','m'))?.[0]).join('\n')+'\n'+f;
vm.runInNewContext(script,ctx);
for(const input of ['新題，我要查東港的社福團體有幾個。','另一個問題：想查東港鎮社會服務團體有幾個？','換一題，東港社福團體有幾個？','東港鎮社會服務團體有幾個？']){
 let r=ctx.dirQueryFrom(input,{});
 a.equal(r.kw,'',input);a.equal(r.d,'東港鎮');a.equal(r.c,'社會服務團體');
}
a.notEqual(ctx.dirQueryFrom('新問題，想問東港社福團體成立需要多少發起人？',{}).kw,'');
a.equal(ctx.dirQueryFrom('新題，查一下東港的名字',{name:'東港新題文化協會'}).kw,'東港新題文化協會');
