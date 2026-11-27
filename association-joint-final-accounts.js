(function(root){
'use strict';
const law=(title,code,n)=>({title:title+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const h=law('人民團體會務輔導辦法','D0020094',11),f=law('社會團體財務處理辦法','D0050097',11),p=law('人民團體法','D0050091',34);
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>195||!/聯席會|聯合開|理事及監事一起開/.test(t)||!/決算|預決算/.test(t)||!/理事|監事/.test(t)||!/只.{0,5}(?:到|出席|一位|兩位)|過半|不夠|不足|缺席|都到|全到|應到|實到|少.{0,3}(?:一|兩|二|三)|來了/.test(t)||/合作社|社員|社務會|農會|漁會|工會|公會|基金會|公司|解散|法院|罷免/.test(t))return null;
 const one=/監事.{0,6}(?:只.{0,3}(?:一位|一人|1位|1人)|(?:一位|一人|1位|1人)(?:出席|到|來))/.test(t);
 const checked=/一般協會|協會|社會團體/.test(t);
 const exact=t.match(/監事(?:應到|應出席)([0-9]{1,3})(?:位|人).{0,12}(?:實到|實際出席|出席)([0-9]{1,3})(?:位|人)/);
 const required=exact&&Number(exact[1])>0&&Number(exact[2])<=Number(exact[1]);
 const floor=required?Math.floor(Number(exact[1])/2)+1:null;
 return {direct:true,category:'人民團體財務｜聯席會議出席門檻',title:'理監事聯席會議要兩邊各過半；不能只靠理事到齊',
  summary:(checked?'':'如果是一般協會，')+'理事和監事要分開、各自有過半數出席；理事全到也不能補監事人數。'+(required?'以應到'+exact[1]+'位監事計，至少'+floor+'位才過半；'+(Number(exact[2])<floor?'本次未達監事出席門檻，不能由這場聯席會議通過決算。':'這組數字達監事出席門檻，還須核對理事出席、召集及表決程序。'):one?'若依法應到3位、實到1位，監事須至少2位才過半，這場不能通過決算。':'請核對兩組應到與實到人數，再判斷能否成會。'),
  steps:[['分別核對兩邊出席和同意票','依會務輔導辦法第11條，理監事聯席會議應具理事及監事各過半數的出席，決議也分組算，各以出席者過半或較多數同意。一次只有一人到，不等於監事出缺；如有正式出缺，依章程及法規另行處理，不把另一組人數合併計。'],
  ['財務程序不能用不足額會議補過','依人民團體法第34條，年度決算先送監事會審核，依法提會員（代表）大會。若大會因故不能如期開，依財務處理辦法第11條，可由兩會或合法聯席會議先通過，但仍須大會追認後才正式報備。欠缺法定出席，應另依程序安排，不能先記成已通過。']],
  refs:[h,f,p],questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationJointFinalAccounts=route;
})(typeof window!=='undefined'?window:globalThis);
