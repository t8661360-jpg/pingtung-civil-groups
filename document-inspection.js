(function(root){
'use strict';
const cite=(name,p,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+p+'&flno='+n});
const C=n=>cite('合作社法','D0050112',n);
const F=n=>cite('社會團體財務處理辦法','D0050097',n);
function documentInspectionAnswer(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!/(?:查閱|調閱|查帳|看|閱覽)/.test(t)||!/(?:可以|可否|能否|能不能|得否|要看|要求|想看|有權|看看|怎麼查)/.test(t))return null;
 if(/信用合作社|信合社|保險合作社|公司|工會|公會|基金會|買發票|開發票|補發|國稅局|報稅|抵稅|扣抵|下載|公開.{0,5}(?:個資|名冊)|需要什麼文件/.test(t))return null;
 if(/合作社/.test(t)&&/(社員|債權人)/.test(t)&&/(資產負債表|收支餘絀表|財產目錄|業務報告書|結餘分配案|短絀分擔案)/.test(t)&&!/((?:非|不是|並非)(?:合作社的?)?(?:社員|債權人)|給外人|外人可)/.test(t)){
  return {direct:true,category:'合作社會務',title:'合作社社員或債權人，可以查閱資產負債表等法定書類',
   summary:'可以。依合作社法第37條，社員和合作社的債權人都可以查閱第35、36條規定的書類。年度財務文件包括資產負債表、收支餘絀表、財產目錄，以及業務報告書和結餘分配或短絀分擔案。\n\n可向合作社提出查閱申請，說明要看的年度和文件。這裡的「查閱」不等於要求公開上網，也不等於可拿走原本。如果合作社阻礙或拒絕查閱，可向該管主管機關反映。',
   statutes:[C(35),C(36),C(37)],notes:[],actions:[]};
 }
 if(/(?:協會|社會團體|社區協會|社團)/.test(t)&&/會員/.test(t)&&/(發票|原始憑證|會計憑證|每(?:一)?張收據|所有收據)/.test(t)&&!/(合作社|(?:非|不是|並非)(?:協會的?)?會員|開會紀錄|會議紀錄)/.test(t)){
  return {direct:true,category:'社會團體財務',title:'協會會員可請求說明收支；定期公告不等於逐張發票都須提供',
   summary:'社會團體財務處理辦法第20條要求協會定期公告財務收支，不得匿報或虛報。第20條本身沒有規定會員能要求查閱每一張發票或原始憑證，不能只憑這一條判定協會必須逐張提供。\n\n建議先看章程或內部財務規定，指定要核對的期間、支出項目，向協會請求說明或申請查閱。對特定款項有疑義，也可請監事會查核；第22條規定監事會負責財務查核，主管機關必要時得抽查。至於會員查閱會議紀錄，是另一項規定。',
   statutes:[F(20),F(22),cite('人民團體會務輔導辦法','D0020094',12)],notes:[],actions:[]};
 }
 return null;
}
if(typeof module!=='undefined'&&module.exports){module.exports=documentInspectionAnswer;return;}
root.documentInspectionAnswer=documentInspectionAnswer;
})(typeof window!=='undefined'?window:globalThis);
