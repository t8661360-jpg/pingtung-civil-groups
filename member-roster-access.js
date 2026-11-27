(function(root){
'use strict';
const law=(title,code,n)=>({title:title+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
function matches(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(/合作社|社員|公會|工會|農會|漁會|政黨|基金會|管委會|外洩|外泄|洩漏|被偷|竊取|遺失|漏報|廠商|外人|非會員|第三方|民意代表|縣府|主管機關|社會處|更新|刪除|更正|查詢我(的|自己)|會員名冊.{0,4}(有幾個|有幾人)/.test(t))return false;
 return /會員(?:代表)?(?:的)?(名冊|名單)|選舉人名冊|應出席名冊/.test(t)
  && /提供|查閱|閱覽|調閱|看|索取|影印|複印|複製|拍照|下載|發給|傳給|寄給|公開/.test(t)
  && /會員|協會|社團|人民團體|理監事|改選|選舉|罷免/.test(t);
}
function rosterAccess(q){
 if(!matches(q))return null;
 return {direct:true,category:'人民團體會務說明',title:'會員名冊可依法閱覽，但不等於可拿走整份名冊',
 summary:'如果是供會員確認大會出席或選舉資格，協會不能一概以個資為由拒絕閱覽；但法律要求提供閱覽，不等於要交付整份名冊副本或對外公開。\n\n會員（代表）大會：理事會應在大會召開15日前審定應出席資格，備妥姓名、聯絡電話、地址及權利義務受限制情形，提供會員閱覽（人民團體會務輔導辦法第10條）。\n\n理事、監事或會員代表的選舉及罷免：理事會應在會議15日前審定相應資格，名冊供會員閱覽，並註明權利限制（人民團體選舉罷免辦法第5條）。依法採理監事通訊選舉的，適用第23條：理事會應於開票日45日前審定資格並造冊供閱覽。\n\n若只是平時想拿副本、把資料寄給會員群組或公開到網路，不能把法定閱覽當成同意散布；須另確認用途、必要範圍及合法依據（個人資料保護法第5、20條）。若要查閱，先向協會詢問閱覽時間與方式，並說明要核對的會務或選務事項。',
 statutes:[law('人民團體會務輔導辦法','D0020094',10),law('人民團體選舉罷免辦法','D0050093',5),law('人民團體選舉罷免辦法','D0050093',23),law('個人資料保護法','I0050021',5),law('個人資料保護法','I0050021',20)],notes:[],actions:[]};
}
function electionRosterCopy(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!/改選|選舉|選前|罷免/.test(t)||!/影印|複印|複製|拍照|下載|帶(?:回家|走)/.test(t)||/交接|前任|新任|新理事長|承辦保管|移交|給非會員/.test(t))return null;
 const a=rosterAccess(q);if(!a)return null;
 return {...a,questionState:{focus:'compound'},summary:'選舉前依法可閱覽名冊，但第5條並未規定必須讓會員影印、拍照或帶走整份名冊。可先向協會申請閱覽核對必要事項；複製整份、攜回家或轉傳之前，另查合法用途及必要範圍。\n\n'+a.summary};
}
function keepRosterQuestion(q,normalize){return matches(q)?String(q):normalize(q);}
if(typeof module!=='undefined'&&module.exports){module.exports={rosterAccess,keepRosterQuestion,electionRosterCopy};return;}
root.verifiedElectionRosterCopy=electionRosterCopy;
const previous=root.verifiedRoundAnswer,normalize=root.normalizeQuestion;
root.verifiedRoundAnswer=function(q,ctx){return rosterAccess(q)||previous.call(this,q,ctx);};
root.normalizeQuestion=function(q){return keepRosterQuestion(q,normalize);};
})(typeof window!=='undefined'?window:globalThis);
