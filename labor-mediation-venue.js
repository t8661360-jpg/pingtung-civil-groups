(function(root){
'use strict';
// Article 9 venue follows where the employee provides labour, not the association's registration.
const wrong='協會在屏東縣的話，請洽縣府勞工主管單位（縣府總機 08-7320415）。';
const details='不能只看協會登記地或總部。例如，若協會登記在屏東、您是在高雄工作，向高雄市的勞工主管機關申請；若是在屏東工作，則向屏東縣的勞工主管機關申請。若您跨縣市工作、無法判斷勞務提供地，先向勞工主管機關說明工作地點與實際出勤情形，確認受理單位。';
function clarifyLaborVenue(q,a){
 if(!a?.summary?.includes(wrong)||!a.title?.startsWith('員工被協會開除或資遣、不服怎麼辦')||!a.statutes?.some(s=>s.title==='勞資爭議處理法第9條'))return a;
 const venue=/(哪裡|哪邊|哪個縣市|哪一縣市|去哪|管轄|登記地|總部|工作地|勞務提供地)/.test(String(q));
 const intro=venue?'勞資爭議調解要向實際工作地的勞工主管機關申請（勞資爭議處理法第9條）。'+details+'\n\n':'';
 return {...a,
  title:venue?'勞資爭議調解：要看員工的工作地，不是協會登記地':a.title,
  summary:intro+a.summary.replace(wrong,venue?'':details)
 };
}
if(typeof module!=='undefined'&&module.exports){module.exports=clarifyLaborVenue;return;}
const previous=root.verifiedRoundAnswer;
root.verifiedRoundAnswer=function(q,ctx){return clarifyLaborVenue(q,previous.call(this,q,ctx));};
})(typeof window!=='undefined'?window:globalThis);
