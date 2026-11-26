(function(root){
'use strict';
const cite=(name,p,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+p+'&flno='+n});
function associationChairFiling(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!/理事長/.test(t)||!/(當選|新任|新理事長|選出|選完|補選|換理事長)/.test(t)||!/(報|送|交|備查|核備)/.test(t)||!/(資料|文件|書表|附件|要附|要報什麼|報備什麼|報什麼|送什麼|交什麼)/.test(t))return null;
 if(/合作社|社區發展協會|公會|工會|基金會|公司|體育團體|農會|漁會|政黨|法人登記|法院|國稅局|銀行|印鑑|移交|交接|全國性|省級|視訊|罷免|成立大會|第1次成立/.test(t))return null;
 return {direct:true,category:'改選與任期',title:'協會選出新理事長：30日內報異動，備妥理事會互選紀錄',
  summary:'一般協會是先由會員大會選理事，理事長再由理事互選，不是由會員大會直接選出（人民團體法第17條）。送件時先備妥載明互選結果的理事會紀錄，以及異動後的選任職員簡歷冊或負責人名冊。簡歷冊或名冊有異動，要在30日內報主管機關核備（第54條）。\n\n如果這次也召開了改選理監事的會員大會，大會紀錄另應在閉會後30日內報主管機關備查（人民團體會務輔導辦法第12條）。如果只補選理事長，先以這次實際召開的理事會紀錄確認補選結果，不要把它和整屆改選混在一起。\n\n如要申請理事長當選證明書，本站「書表下載 → 改選」有申請表。屏東縣實際還要哪些附件、幾份，請依最新書表並向縣府承辦確認；全國性團體的申報表不可直接套用。',
  statutes:[cite('人民團體法','D0050091',17),cite('人民團體法','D0050091',54),cite('人民團體會務輔導辦法','D0020094',12)],notes:[],
  actions:[{label:'下載改選書表',view:'forms',sub:'改選'},{label:'聯絡承辦',view:'contact',sub:''}]};
}
if(typeof module!=='undefined'&&module.exports){module.exports=associationChairFiling;return;}
root.associationChairFiling=associationChairFiling;
})(typeof window!=='undefined'?window:globalThis);
