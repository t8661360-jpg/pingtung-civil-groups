(function(root){
'use strict';
const cite=(title,p,n)=>({title:title+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+p+'&flno='+n});
function associationLandAgent(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!/協會|社會團體|社團法人|人民團體/.test(t)||!/地政士|代書/.test(t)||!/土地|房地|不動產|建物/.test(t)||!/移轉|過戶/.test(t)||!/委託|代理|代辦|幫|找|請|要不要|一定要/.test(t))return null;
 if(/合作社|公會|工會|農會|漁會|公司|考試|執照到期|換照|補發|開業登記|會址變更/.test(t))return null;
 return {direct:true,category:'團體財產與登記',title:'協會辦土地或建物移轉登記，可以委託具開業資格的地政士',
 summary:'可以。土地法第37條之1允許委託代理；地政士法第16條明定地政士可以代理申請土地登記事項。一般不是一定要找地政士；符合法定申請方式的當事人也可自行送件。\n\n委託時，地政士應先核對委託人是權利人或權利關係人，確認身分。辦紙本登記原則上檢附委託書；申請書已載明委託關係時可免另附。如欲用具特別授權要件的委託書，讓委託人免在申請書簽章，應依第38條載明委託事項與標的等。\n\n委任地政士不等於協會已取得受讓資格，也不能代替團體內部依法應辦的決議。先確認協會是否已辦法人登記、這次是受贈、買受或處分，以及應以誰的名義登記，再向管轄該不動產的地政事務所確認文件。',
 statutes:[cite('土地法','D0060001','37-1'),cite('地政士法','D0060081',16),cite('地政士法','D0060081',18),cite('土地登記規則','D0060003',37),cite('土地登記規則','D0060003',38)],notes:[],actions:[]};
}
if(typeof module!=='undefined'&&module.exports){module.exports=associationLandAgent;return;}
const previous=root.verifiedRoundAnswer;
root.verifiedRoundAnswer=function(q,ctx){return associationLandAgent(q)||previous.call(this,q,ctx);};
})(typeof window!=='undefined'?window:globalThis);
