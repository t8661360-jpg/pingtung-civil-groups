(function(root){
'use strict';
const cite=n=>({title:'人民團體法第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0050091&flno='+n});
function companyAssociationMembership(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!/公司|行號|商號|企業|廠商|店家/.test(t)||!/入會|加入.{0,8}(協會|社團|社會團體)|(?:當|成為|申請|做|作為).{0,10}(?:正式|團體)?會員/.test(t))return null;
 if(/(?:公司|行號|商號|企業|廠商|店家)(?:的|裡的)?(?:員工|職員|同仁)|以個人名義/.test(t))return null;
 if(/商業公會|同業公會|公會|公所|商業會|工業會|工會|合作社|農會|漁會|政黨|考試|設立公司|開公司|強迫|強制|一定要|必須|入股|發起|入會費|理事|監事|負責人|捐款|投票|表決|選舉|罷免|退會/.test(t))return null;
 return {direct:true,category:'人民團體會務說明',title:'公司行號能不能入會：要看協會章程是否開放團體會員',
 summary:'人民團體法沒有規定公司、行號不能入會。一般社會團體可以由個人或團體組成，但能不能以公司或行號名義成為正式會員，要看該協會章程是否開放這類團體會員，以及公司是否符合資格，再依章程辦理申請和審查（第39條、第12條第7、8款）。章程如果只收個人會員，公司不能用公司名義入會。\n\n團體會員可依規定推派代表行使會員權利（第13、16條）。如果公司只符合贊助會員資格，就不能把贊助身分當成正式團體會員；不會因為捐助或擔任贊助會員而自動轉為正式會員，仍須符合適用章程的正式會員資格。\n\n如果問的是登記開業後是否必須加入商業同業公會，則是商業團體法的另一套規定，不能用一般協會章程判斷。',
 statutes:[cite(39),cite(12),cite(13),cite(16)],notes:[],actions:[]};
}
if(typeof module!=='undefined'&&module.exports){module.exports=companyAssociationMembership;return;}
const previous=root.verifiedRoundAnswer;
root.verifiedRoundAnswer=function(q,ctx){return companyAssociationMembership(q)||previous.call(this,q,ctx);};
})(typeof window!=='undefined'?window:globalThis);
