(function(root){
'use strict';
const cite=n=>({title:'合作社選舉罷免辦法第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0050022&flno='+n});
function cooperativeElectionThreshold(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(/合作社/.test(t)&&!/信用合作社|信合社|保險合作社|罷免|解任|解除|員工|工作人員/.test(t)&&/理事|監事/.test(t)&&/辭職|請辭|辭掉|不想當/.test(t)&&/怎麼|如何|可以|要先|同意|批准|准許|過半|生效/.test(t)){
  return {direct:true,category:'合作社選務',title:'合作社理事、監事辭職：書面送達合作社社址即生效，不必先經會議准許',
   summary:'依合作社選舉罷免辦法第8條，理事會主席、監事會主席、理事、監事或社員代表辭職，應以書面提出。辭職書送達合作社社址所在地時就生效，不必等理事會或監事會表決准許。\n\n請保留送達證明並完成交接，交接、辭職和遞補情形要在會議提出報告。一般理事、監事出缺由候補依序遞補；主席職務另依第7條辦理補選或代理。辭職生效後，同一任期內不得再當選原職。',
   statutes:[cite(7),cite(8)],notes:[],actions:[]};
 }
 if(!/合作社/.test(t)||!/理事|監事/.test(t)||!/選|當選|得票/.test(t)||!/(?:過半|半數|一半|最多票|票最多|最高票|得票多少|幾票)/.test(t))return null;
 if(/信用合作社|信合社|保險合作社|罷免|解任|解除|辭職|修章|修改章程|一般議案|其他議案|股息/.test(t))return null;
 const base={direct:true,category:'合作社選務',notes:[],actions:[]};
 if(/理事會主席|監事會主席|理事主席|監事主席/.test(t)){
  return {...base,title:'合作社理事會或監事會主席：首輪得票要超過出席人數半數',
   summary:'理事會主席、監事會主席，分別由理事、監事在各自會議互選。依合作社選舉罷免辦法第6條，首輪須得票超過出席人數半數才當選。若無人過半，由得票第一、第二的候選人再行投票，得票較多者當選；同票以抽籤決定。這和社員大會選出一般理事、監事時看得票排序的規則不同。',
   statutes:[cite(6),cite(33)]};
 }
 if(/理事長|監事長|主席/.test(t))return null;
 return {...base,title:'合作社選理事、監事：按得票高低當選，不要求候選人得票過半',
  summary:'若您問的是候選人得票：依合作社選舉罷免辦法第5條及第33條，社員大會或社員代表大會選理事、監事時，依應選名額按得票高低決定當選及候補，同票抽籤。候選人不必得票過半。\n\n若您問的是出席人數：選舉會議原則上須有具出席資格者過半數出席。若因此流會，應在十五日內重開；重開時可依章程按實際出席人數開會選舉，但仍須達應出席人數三分之一（第3條）。\n\n理事會主席、監事會主席另由理事或監事互選，首輪才有得票過半的規則（第6條）。',
  statutes:[cite(3),cite(5),cite(6),cite(33)]};
}
if(typeof module!=='undefined'&&module.exports){module.exports=cooperativeElectionThreshold;return;}
const previous=root.verifiedRoundAnswer;
root.verifiedRoundAnswer=function(q,ctx){return cooperativeElectionThreshold(q)||previous.call(this,q,ctx);};
})(typeof window!=='undefined'?window:globalThis);
