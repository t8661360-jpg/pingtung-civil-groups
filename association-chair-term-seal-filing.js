(function(root){
'use strict';
const law=(title,code,n)=>({title:title+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>220||!/協會|社會團體/.test(t)||!/新任|新選|接任|改選|當選/.test(t)||!/任期.{0,7}(?:還沒|尚未|未開始|沒開始|還未)|尚未就任|人還沒就任|還沒接任|下個月才就任|先選好.{0,7}未就任/.test(t)||!/銀行|郵局|金融機構/.test(t)||!/印鑑|印章|用印|更印|代表人/.test(t)||/合作社|公會|工會|農會|漁會|基金會|公司|公務人員協會|舊戶冒領|遺失|被偷|拒絕交接|私帳|擅自提領|假印章|冒名/.test(t))return null;
 const records=/紀錄|記錄|文件|名冊|報縣府|備查|報備/.test(t);
 return {direct:true,category:'人民團體改選｜就任前更印與改選紀錄',title:'當選不等於已就任：銀行更印與大會紀錄分開',
  summary:'可以先向原開戶機構問能否備件或預約；新任代表權尚未生效，不應先用新任名義辦理提款或行使未生效的權限。代表何時生效及何時能更印，按章程、改選或就任資料與機構核對。'+(records?' 大會改選紀錄的30日，從大會閉會算，不是等新任就任才起算。':''),
  steps:[['先確認實際就任日、原銀行留存資料','看章程、改選及互選紀錄、就任日及縣府資料，問原開戶點要哪份代表權證明、誰到場及哪些印鑑要改。先準備並不保證可先啟用。依財務處理辦法第17條，提用存款仍須負責人、秘書長或總幹事及財務人員共同用印，不能因新任已選好就一人提款。'],
  ...(records?[['大會紀錄與負責人名冊是兩項計時','會務輔導辦法第12條：會員（代表）大會會議紀錄閉會後30日內報主管機關備查。人民團體法第54條：選任職員簡歷冊或負責人名冊異動後30日內報主管機關核備。不要把兩種期限等到銀行完成更印才一起辦；若選舉次序或生效有疑義，向原窗口確認受理文件。']]:[]),
  ['就任後交接有自己的15日','整屆改選依會務輔導辦法第18條，自新理事長就任後15日內與監交人接收資料、圖記等。這是交接期限，不是大會紀錄的期限；金融機構印鑑與團體圖記也不是同一件事。']],
  refs:[law('人民團體會務輔導辦法','D0020094',12),law('人民團體會務輔導辦法','D0020094',18),law('人民團體法','D0050091',54),law('社會團體財務處理辦法','D0050097',17)],questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationChairTermSealFiling=route;
})(typeof window!=='undefined'?window:globalThis);
