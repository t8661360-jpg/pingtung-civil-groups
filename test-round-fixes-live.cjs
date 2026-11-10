const api=require('/tmp/repo/round-fixes.js');
const qs=['選票怎麼樣算無效','無效票有哪些情形','合作社無效票怎麼判','誰可以當會員代表','資格：會員代表要什麼條件','候補理事怎麼遞補','候補理事都用完了怎麼辦','理事長可以連任幾屆','合作社理事長可以連任嗎','理事9人改選三分之二是幾人','理事9人，只有4名出席，可以開會嗎','理事長辭職怎麼辦'];
let ok=0;
for(const q of qs){let r=null,err='';try{r=api.verifiedRoundAnswer(q,{});}catch(e){err=e.message}
 const t=r?(r.title||'').slice(0,40):'(null)'; console.log((r?'✔':'✘'),q,'=>',t,err); if(r)ok++;}
console.log(`${ok}/${qs.length} 有回答`);
