(function(root){
'use strict';
const law=(title,code,n)=>({title:title+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
function matches(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 return /會費/.test(t) && /章程|修章/.test(t)
  && /調高|調低|調降|調整|調漲|提高|漲|加收|改成|變更.{0,5}(費|金額|數額|標準)|改.{0,6}(收費|金額|數額|標準)/.test(t)
  && !/合作社|社員|公會|工會|農會|漁會|基金會|政黨|商業會|工業會|退費|退還|欠費|沒繳|補繳|不繳|拒繳|免繳|終身|追溯|按月分期/.test(t);
}
function feeCharter(q){
 if(!matches(q))return null;
 return {direct:true,category:'人民團體財務',title:'調整會費要不要修章：章程寫死金額或收費標準有變，就要修章',
 summary:'先看已核備的章程。一般社會團體依社會團體財務處理辦法第14條，入會費及常年會費的標準、繳納方式應訂入章程。\n\n• 章程寫了固定金額，例如每年500元要改600元，或要改章程所定的收費標準、繳納方式：必須一併修章，不能只通過一個和現行章程不同的收費案。修章須經會員（代表）大會過半數出席、出席人數三分之二以上同意，並依人民團體法第54條於異動後30日內報主管機關核備。\n\n• 若已核備章程有合法且明確的收費標準、繳納方式，新數額確實依原標準計算，且不需改任何章程條文，不一定需要修章。但入會費及常年會費的繳納數額和方式，仍須經會員（代表）大會通過並報主管機關核備後才能實施（人民團體法第33條第2項）。\n\n章程若只有「由大會決定」、沒有明確標準，不能直接認定不用修章。建議先拿現行核備章程和擬議金額向承辦確認適用程序。',
 statutes:[law('社會團體財務處理辦法','D0050097',14),law('人民團體法','D0050091',33),law('人民團體法','D0050091',27),law('人民團體法','D0050091',54)],notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function keepFeeCharterQuestion(q,normalize){return matches(q)?String(q):normalize(q);}
if(typeof module!=='undefined'&&module.exports){module.exports={feeCharter,keepFeeCharterQuestion};return;}
const previous=root.verifiedRoundAnswer,normalize=root.normalizeQuestion;
root.verifiedRoundAnswer=function(q,ctx){return feeCharter(q)||previous.call(this,q,ctx);};
root.normalizeQuestion=function(q){return keepFeeCharterQuestion(q,normalize);};
})(typeof window!=='undefined'?window:globalThis);
