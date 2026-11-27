(function(root){
'use strict';
const k=(title,code,n)=>({title:title+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const c=n=>k('民法','B0000001',n);
const h=k('人民團體會務輔導辦法','D0020094',27);
const court={title:'士林地方法院：社團法人登記及清算終結文件',source:'https://sld.judicial.gov.tw/tw/dl-17945-2ea191c6617d42ee877d10f35a851306.html'};
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>225||!/協會|社會團體|社團法人/.test(t)||!/解散|清算/.test(t)||!/會費/.test(t)||!/欠繳|積欠|沒繳|未繳|少繳|欠.{0,3}會費/.test(t)||!/追收|補收|收回|催繳|怎麼辦|要不要追|可以收/.test(t)||/合作社|公會|工會|基金會|公司|農會|漁會|股東|所得稅|贈與|執行命令/.test(t))return null;
 const closed=/清算(?:已經|已|都)?(?:完結|完畢|終結|完成|完才|結案)|已(?:經)?向法院聲報|法院已備查/.test(t)&&!/還沒(?:完|結|聲報)|尚未(?:完畢|終結|結案|聲報)/.test(t);
 const active=/正在清算|仍在清算|還在清算|清算中|尚未終結|還沒清算完|尚未聲報完結/.test(t)&&!closed;
 const identify=['先確認是解散前已成立、仍未清償的會費','核對當時有效章程、費額決議、到期日、會員狀態及繳費憑證；不是「帳上沒找到」就能認定欠款。若有爭議或隔太久，先確認請求權及時效，不能在解散後另創新的常年會費。'];
 const during=['仍在清算，可以依法處理既有債權','已登記的社團法人，依民法第40條由有權清算人收取既存債權、清償債務；補入帳冊、留收款憑證，並納入清算報表。在清算所需範圍內視為存續，不是恢復一般會務。'];
 const after=['已聲報或登記清算終結，又發現漏項','先不要自行用舊帳戶收款或由前任理事長發催繳。備妥原清算報表、法院聲報或終結資料及欠費證明，自行或由原清算人向原法院民事或法人登記承辦詢問適用程序、誰有權處理、是否須補充清算。民法第42條規定法人清算受法院監督；不能只因報過完結就認定債權消失，也不保證可逕行補收。'];
 const non=['未辦法人登記，由章程與會員大會清算規則處理','未辦法院法人登記的協會依會務輔導辦法第27條核對章程、會員（代表）大會決議及原清算人權限；疑有漏項，請原立案主管機關核對如何補正清算紀錄。不要直接套用社團法人的法院終結流程。'];
 return {direct:true,category:'人民團體解散｜清算與會費債權',title:closed?'清算完才發現欠費：先核對漏項與誰有權補辦':'解散後欠繳會費：先分是否仍在清算',
  summary:closed?'不能照平常會務直接催收。先確認是不是解散前已成立的債權與終結程序；已聲報或登記的社團法人，向原法院確認如何補辦及誰有權處理。':active?'清算中，依法有權的清算人可處理既存債權；不是重新收取解散後的新常年會費。':'先確認是不是已成立的債權，再分尚在清算或已結案，處理權限不同。',
  steps:[identify,...(closed?[after]:active?[during]:[during,after]),non],refs:[c(40),c(41),c(42),h,court],questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationLiquidationDues=route;
})(typeof window!=='undefined'?window:globalThis);
