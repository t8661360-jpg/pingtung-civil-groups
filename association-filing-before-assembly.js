(function(root){
'use strict';
const r=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const F=r('社會團體財務處理辦法','D0050097',11), P=r('人民團體法','D0050091',34), M=r('人民團體會務輔導辦法','D0020094',12);
const annual=['年度預決算：先通過、後追認、再報備','一般社會團體的年度決算須由監事會先審核；因故不能如期開大會，依財務處理辦法第11條，可以先由理事會及監事會或理監事聯席會議正式通過，之後仍須提會員（代表）大會追認，再報主管機關備查。只是兩會開過，不等於通過該案。不必假稱已完成大會程序；如縣府有來函要求資料，可先詢問是否接受階段文件及補件期限。'];
const minutes=['只問理監事會紀錄：通常留存，不是替代大會紀錄','依會務輔導辦法第12條，理事會、監事會及聯席會議紀錄應自行留存，依法應報主管機關的決議另依規定送件。會員（代表）大會的會議紀錄須在閉會後30日內報備；還沒召開，不會有這次大會的紀錄可以先送。不得用理監事紀錄充當大會紀錄。是否仍需開大會，要看原事項是否應由大會決定，不能從送報理監事紀錄推定已完成。'];
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>225||!/協會|社會團體/.test(t)||!/沒開大會|未開大會|還沒.{0,5}大會|沒辦.{0,5}大會|大會.{0,6}(?:無法如期|還沒開|沒有開|沒開|尚未開)|未召開.{0,6}大會|不能如期.{0,6}大會/.test(t)||!/理事會.{0,12}監事會|監事會.{0,12}理事會|理監事聯席|理監事會/.test(t)||!/先.{0,6}(?:報|送|交)|報.{0,5}備查|先辦報備/.test(t)||/合作社|公會|工會|農會|漁會|基金會|公務人員協會|補助|法院|開戶|解散|罷免|選舉|改選|修章|搬遷/.test(t))return null;
 const a=/年度(?:決算|預算|預決算)|年度工作計畫|(?:預|決)算/.test(t),m=/理事會.{0,13}會議紀錄|監事會.{0,13}會議紀錄|理監事.{0,8}紀錄|各自的紀錄|只問.{0,10}會議紀錄/.test(t);
 if(a&&!m)return {direct:true,category:'人民團體財務｜大會未開與報備',title:'年度預決算：理監事先通過不等於可先報備',summary:'正式報備要等會員大會追認。只是理事會、監事會都開過，不能視為財務案已經通過。',steps:[annual],refs:[F,P],questionState:{focus:'compound'}};
 if(m&&!a)return {direct:true,category:'人民團體會務｜理監事會紀錄',title:'理監事會紀錄可以留存，但不能代替大會報備',summary:'理監事會紀錄原則自行保存；依法應送件的特定決議另辦。未開的會員大會沒有大會紀錄可先報。',steps:[minutes],refs:[M],questionState:{focus:'compound'}};
 return {direct:true,category:'人民團體會務｜報備資料類型',title:'先分縣府要哪一份資料，再看要不要補開大會',summary:'理事會和監事會都開過，不代表每一種資料都能先報縣府，也不代表可以免開大會。',steps:[annual,minutes],refs:[F,P,M],questionState:{focus:'compound'},...(!a&&!m?{choiceHeading:'要報的是哪一類資料？',choices:[{label:'年度預算或決算',question:'協會還沒開大會，理事會和監事會都開過，年度預決算可以先報備查嗎？'},{label:'只問理監事會紀錄',question:'協會還沒開大會，理事會和監事會都開過，只問理事會及監事會會議紀錄可以先報嗎？'}]}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationFilingBeforeAssembly=route;
})(typeof window!=='undefined'?window:globalThis);
