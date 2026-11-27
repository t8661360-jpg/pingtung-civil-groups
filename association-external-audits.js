(function(root){
'use strict';
const act=(title,code,n)=>({title:title+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const county={title:'屏東縣政府對民間團體補助經費作業要點第8、10點（115年度公告附件）',source:'https://portal.ptc.edu.tw/bulletin/attachment.php?a_sn=33872&b_sn=B114003910'};
const moi={title:'內政部：國稅局得依法查閱協會帳冊',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=220031'};
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>185||!/協會|社會團體/.test(t)||/合作社|社員|公司|公會|工會|基金會|勸募|違法|罰多少|罰鍰|可以拒絕|補報|補稅|漏報|徵收房屋稅|營業稅|刑事/.test(t))return null;
 const tax=/國稅局|國稅稽徵所/, grant=/縣府|縣政府/;
 if(!tax.test(t)||!grant.test(t)||!/補助/.test(t)||!/查帳|查核|調帳|調閱|調查|督導|抽查|查我的補助/.test(t))return null;
 if(!/(?:縣府|縣政府)[^？?；;。]{0,14}(?:查|督導|調閱)[^？?；;。]{0,10}補助|(?:縣府|縣政府)[^？?；;。]{0,10}補助[^？?；;。]{0,10}(?:被查|查核|抽查|督導)|補助[^？?；;。]{0,10}(?:被|由)(?:縣府|縣政府)[^？?；;。]{0,8}(?:查|督導|調閱)/.test(t))return null;
 if(!/(?:國稅局|國稅稽徵所)[^？?；;。]{0,18}(?:查帳|查核|調帳|調閱|調查|抽查)|(?:查帳|查核|調帳|調閱|調查|抽查)[^？?；;。]{0,10}(?:國稅局|國稅稽徵所)/.test(t))return null;
 const taxStep=['國稅局查帳：按查核通知準備該年度資料','稅捐稽徵法第30條允許稅捐機關調查課稅資料；內政部函釋亦說明可依法查閱協會帳冊。先看通知的年度、稅目、指定資料和期限。常見可先備當年度申報書、帳簿與收支報表、通知所列的收支原始憑證及可對帳的資料；實際送件以通知為準。手邊缺件時，在期限內聯絡通知上的查核承辦確認補件方式，不把縣府的補助核銷資料一律當作稅務資料。'];
 const grantStep=['屏東縣府查補助款：依核定案整理支出憑證','按屏東縣作業要點第8、10點，縣府可督導考核。可先整理核准補助文件、領款收據、實際支用明細及各項支用單據；依補助單位要求附成果報告與照片，設備案另備納入團體財產的證明。按查核通知和核定函確認查哪一案、是否要正本與其他附件；不能拿年度所得稅申報書取代核銷資料。'];
 return {direct:true,category:'協會會務｜外部查帳與補助稽核',title:'國稅局查帳與屏東縣府查補助，分兩套資料',
  summary:'國稅局核對課稅及申報資料；縣府看補助案是否依核定用途支出。先各看收到的通知，不把兩者當成協會監事的內部查帳。',
  steps:t.search(tax)<t.search(grant)?[taxStep,grantStep]:[grantStep,taxStep],refs:[act('稅捐稽徵法','G0340001',30),moi,county],questionState:{focus:'compound'}};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationExternalAudits=route;
})(typeof window!=='undefined'?window:globalThis);
