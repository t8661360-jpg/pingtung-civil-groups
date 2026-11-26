(function(root){
'use strict';
// Route simple named-month questions to the existing source-checked answer.
// Leave rescheduling, establishment, elections, reporting and other entities alone.
const M='(?:0?[1-9]|1[0-2]|一|二|三|四|五|六|七|八|九|十|十一|十二)月(?:份)?';
const monthPattern=new RegExp(M);
const months=['一','二','三','四','五','六','七','八','九','十','十一','十二'];
const Q=new RegExp('^(?:(?:(?:請問|想問)(?:一下)?)[，,]?)?(?:(?:(?:我們的?|本|這個|這間)?(?:社區發展協會|社區協會|協會|社團|社會團體)|本會|我們)的?)?(?:定期)?(?:會員大會|會員代表大會|會員[（(]代表[）)]大會)(?:(?:非得|非要|只能|必須|一定得|一定要)(?:(?:在|於|排在)'+M+'(?:開|召開|舉行|舉辦)|(?:開|召開|舉行|舉辦)(?:在|於)'+M+')(?:(?:才行|才可以|才合法))?|非(?:在|於)'+M+'(?:開|召開|舉行|舉辦)不可)(?:嗎|嗎呢|呢|是不是)?[?？。！!]*$');
function canonicalAssemblyMonth(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!Q.test(t))return null;
 const month=t.match(monthPattern)[0].split('月')[0];
 return '我們協會的會員大會一定得在'+(months[Number(month)-1]||month)+'月開嗎？';
}
if(typeof module!=='undefined'&&module.exports){module.exports=canonicalAssemblyMonth;return;}
const previous=root.verifiedRoundAnswer;
root.verifiedRoundAnswer=function(q,ctx){return previous.call(this,canonicalAssemblyMonth(q)||q,ctx);};
})(typeof window!=='undefined'?window:globalThis);
