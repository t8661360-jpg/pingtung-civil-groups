(function(root){
'use strict';
const cite=(name,p,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+p+'&flno='+n});
function boardVacancyCount(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!/(理監事|理事|監事)/.test(t)||!/(人數不足|名額不足|人數不夠|缺額|出缺|只剩|不到|未達|未滿|不足|不夠)/.test(t)||!/(過半|半數|一半|三分之二|2\/3)/.test(t))return null;
 if(/合作社|工會|公會|公司|農會|漁會|基金會|理事長|會長|主席|得票|投票|候選人|選舉|罷免|提案|決議|出席|到場|簽到|報到|開會/.test(t))return null;
 return {direct:true,category:'改選與任期',title:'理監事缺額：先由候補遞補，不足章程名額三分之二才補選',
  summary:'如果是理事或監事職位出缺，先讓同類候補依序遞補；遞補後仍未達章程所定名額的三分之二，應補選足額。理事、監事要分開看，不能把兩邊加起來算。這裡不是用「過半」當補選門檻（人民團體選舉罷免辦法第17條）。\n\n如果只是某次開會到場的人不夠，不代表職位出缺，也不能因此直接補選；理事會、監事會各自須有過半數出席才能作成決議（人民團體法第29條）。',
  statutes:[cite('人民團體選舉罷免辦法','D0050093',17),cite('人民團體法','D0050091',29)],notes:[],actions:[]};
}
if(typeof module!=='undefined'&&module.exports){module.exports=boardVacancyCount;return;}
const previous=root.verifiedRoundAnswer;
root.verifiedRoundAnswer=function(q,ctx){return boardVacancyCount(q)||previous.call(this,q,ctx);};
})(typeof window!=='undefined'?window:globalThis);
