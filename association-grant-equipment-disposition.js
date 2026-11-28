(function(root){
'use strict';
const law=(name,p,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+p+'&flno='+n});
const county={title:'屏東縣政府對民間團體補助經費作業要點（官方附件）',source:'https://portal.ptc.edu.tw/bulletin/view.php?sn=B114003910'};
const ledger={title:'社會團體財務處理辦法第4、5、12、21條：財產、憑證及保存',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050097'};
const labor={title:'勞動部：發生勞資爭議怎麼辦',source:'https://www.mol.gov.tw/1607/28690/89680/nodelist'};
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>390||/合作社|公會|工會|農會|漁會|公司|財團法人|基金會|不動產|房屋|土地|法院扣押|強制執行|150萬/.test(t))return null;
 if(!/協會|社會團體|社區發展|理事長/.test(t)&&!/補助.{0,12}(?:自籌|器材|設備)|(?:冷氣|電腦).{0,15}核銷/.test(t))return null;
 const equipment=/器材|設備|冷氣|電腦|機具|物資|音響/.test(t);
 const grants=/補助|核定函|核銷/.test(t);
 const loan=/借(?:用|的|來|了)|借給|借走|租借|不續借|借用單/.test(t);
 const isUncertain=/不確定|不知道|分不清|不清楚|查不到.{0,8}(?:借|產權)|找不到借用單/.test(t)&&loan&&grants;
 const correction=/(?:不是|並非|沒有)補助(?:購買|買)|只(?:借用|借出)|不續借/.test(t)&&loan&&!isUncertain;
 const state=t.match(/設備確認:(借用|補助購置|仍不清楚)/)?.[1];
 const closing=/解散|清算/.test(t)&&!/(?:沒有|不是|不打算|不準備|不會|取消)(?:要)?解散/.test(t);
 const dispose=/送給|送人|轉到|轉給|捐給|報廢|移設|移置|移轉|搬去|換據點|處分|歸還|交回|交還|不續借|返還|退還/.test(t);
 if(!equipment||(!grants&&!correction)||(!dispose&&!isUncertain&&!state))return null;
 const purchased=!correction&&(grants&&!loan||state==='補助購置');
 const loaned=correction||state==='借用';
 const unsure=!loaned&&!purchased;
 const where=['先查原始資料，不只看結案或財產編號','核對核定函和用途、借用或點交文件、採購憑證、付款來源、財產清冊及實際存放地。已結案、已核銷或貼了財產號，都不能單獨證明所有權或處分權。資料找不到先列缺件，再向原出借或原補助承辦核對，不補造憑證。'];
 const borrowed=['借用品找原出借單位辦歸還','沒有移轉所有權的器材不列作協會可處分的自有設備。按原借用約定聯絡縣府的出借或管理單位，確認地點及時間，按清單和配件點交，記錄損壞或缺件，留書面歸還證明；不續借不是報廢，不自行轉交別的團體。'];
 const owned=['補助購置的設備先核用途、移設與處分限制','若是核定補助購置，先查原補助的核定函、計畫與契約有無用途、地點、保管、年限、移設、報廢或轉讓條件；找原補助處室確認，再依章程、財產管理與有效決議辦理。自籌一半或結案不能自動解除原限制。已買的器材和可繳回的未支用補助款也不同，不推定一律交回。'];
 const inventory=['變動要更新財產清冊，不是會員名冊','核對財產編號、來源、金額、存放及使用單位；核准或確認後，留異動、點交或報廢紀錄及憑證，更新財產清冊。找不到採購發票就列缺並查可驗證舊紀錄，不補造。報廢舊品與另用會費購新設備分開，後者核對章程、預算和授權，不重列補助。'];
 const clear=['清算人未定、解散大會未開，先不要移轉設備','自願解散時，依法由會員（代表）大會作成決議。依人民團體會務輔導辦法第27條，已登記法人通常依民法；未登記則依章程或大會決議。未登記且章程未規定或大會無法召開時，由理事長或章程所定代理人擔任；無法產生時由主管機關選任。只有帳冊副本就先保全、逐項列缺並核對正本，不能視為已經完成清算。'];
 const funds=['設備、指定捐物、會費、補助與各筆欠款分開','指定捐物依接受時的用途與條件核對；會費及一般財產與受限制財物分開，未花完補助及已花未核銷款要分開和原補助單位核對。場租、員工薪資和其他債務列明，清算人依規辦理，不能在清償前先把普通餘產交別會；核定補助由原補助處室、解散則找原立案主管機關。'];
 const wage=/員工薪資|欠薪|工資|薪水/.test(t);
 const third=['追討欠薪另找工作地勞工窗口','工資已到期不因預計解散而消失。反映違反勞動法令可申訴，要處理給付可向勞務地勞工主管機關申請勞資爭議調解；不要把薪資、場租和補助合成一筆。勞動地在屏東可洽縣府勞動暨青年發展處。'];
 const original=String(q??'').trim();
 const choices=unsure&&!state&&original.length<265?[{label:'縣府只借用',question:original+'；設備確認：借用。'},{label:'核定補助購買',question:original+'；設備確認：補助購置。'},{label:'目前還不確定',question:original+'；設備確認：仍不清楚。'}]:[];
 return {direct:true,category:'人民團體財務｜器材來源與處理',title:closing?'協會解散前別先交設備，財產、補助和欠薪分開':loaned?'縣府只借用的器材：聯絡原出借單位歸還':purchased?'補助買的器材結案後，不能只憑結案就轉送或報廢':'先查器材是借用還是補助購置，別先移轉',
  summary:closing?'設備先保留並查權屬或核定限制，帳冊、補助餘款、指定捐物與欠款分開；解散決議及清算人先確認。':loaned?'協會不續借，請向原出借單位約定清點交回，不是報廢。':purchased?'先看原補助核定及財產管理程序；結案、自籌一部分或有財產清冊，不代表就能送人、搬據點或報廢。':'標籤或財產號不能單獨證明歸誰。先對借用單、核定函與財產清冊；未確認前不轉送、不報廢。',
  steps:[...(closing?[clear]:[]),...(loaned?[borrowed]:purchased?[owned]:[where]),...(loaned?[]:[inventory]),...(closing?[funds,...(wage?[third]:[])]:[])],
  refs:[ledger,...(loaned?[law('民法','B0000001',464),law('民法','B0000001',470)]:[county]),...(closing?[law('人民團體法','D0050091',59),law('人民團體會務輔導辦法','D0020094',27),law('民法','B0000001',40)]:[]),...(wage?[labor]:[])],choiceHeading:'設備是哪一種來源？',choices,questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationGrantEquipmentDisposition=route;
})(typeof window!=='undefined'?window:globalThis);
