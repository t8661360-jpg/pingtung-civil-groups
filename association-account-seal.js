(function(root){
'use strict';
function law(name,code,n){return {title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n};}
function associationAccountSeal(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>185||!/協會|社會團體/.test(t)||/不是(?:協會|社會團體)|(?:是|我們|本)(?:一間|一家)?(?:合作社|信合社|公會|農會|漁會|工會|基金會)|(?:農會|漁會)(?:自己|本身)的?理事長/.test(t))return null;
 const institution=/農會|漁會|郵局|信合社|信用合作社|金融機構|銀行/;
 const account=/帳戶|帳號|戶頭|團體戶|存摺|存款|開戶|留存|印鑑卡/;
 const seal=/印鑑|用印|印章|大小章|蓋章|圖記|印信/;
 const change=/換|變更|異動|更替|重新留|改選|交接|新任|接任|辭職|補選/;
 const actor=/理事長|負責人|代表人|總幹事|秘書長|財務人員|會計|出納/;
 if(!institution.test(t)||!seal.test(t)||!change.test(t)||(!account.test(t)&&!actor.test(t)))return null;
 if(/遺失|遺落|被偷|不見|拒絕交接|不交接|不簽|代簽|欠薪|解散|清算|換名稱|改名|改地址|改會址|社股|社員代表|農保/.test(t))return null;
 const farm=/農會|漁會/.test(t), post=/郵局/.test(t), credit=/信合社|信用合作社/.test(t);
 const target=farm?(/農會/.test(t)&&/漁會/.test(t)?'原開戶的農會或漁會信用部':/農會/.test(t)?'原開戶農會信用部':'原開戶漁會信用部'):post?'原開戶郵局':credit?'原開戶信用合作社':/銀行/.test(t)?'往來銀行的原開戶單位':'原開戶金融機構';
 const two=/圖記|印信|縣府|縣政府|主管機關/.test(t);
 const unchanged=/總幹事不變|總幹事沒換|總幹事沒有換|秘書長不變|原班人馬|其他人不變|只有理事長|只換理事長/.test(t);
 const finance=n=>law('社會團體財務處理辦法','D0050097',n);
 const refs=[finance(16),finance(17),law('人民團體會務輔導辦法','D0020094',18),law('人民團體法','D0050091',10),...(two?[law('人民團體法','D0050091',54)]:[]),...(farm?[{title:'農會信用部辦理印鑑變更示例（五結鄉農會，非各農會統一文件）',source:'https://wjfarm.org.tw/%E8%BE%B2%E6%9C%83%E6%9C%8D%E5%8B%99/%E4%BF%A1%E7%94%A8%E9%83%A8/'},{title:'農業金融署：查詢原開戶農漁會信用部',source:'https://www.afna.gov.tw/list.php?theme=credit_department'}]:[])];
 return {direct:true,category:'人民團體財務與改選',questionState:{focus:'compound'},
 title:'協會改選：帳戶留存印鑑和團體圖記分開處理',
 summary:'請向'+target+'辦理帳戶代表人及需要異動的留存印鑑。'+(unchanged?'即使總幹事等其他用印人不變，也不代表只帶新理事長的章就能辦完，更不代表其餘印鑑都要重刻。':'要換哪一顆章、是否需重新留存其他印鑑，依原留存資料及開戶單位的規定。')+'團體圖記本身不會因理事長換人就一定要重刻。',
 steps:[
  ['先確認開戶單位留存資料','社會團體財務處理辦法第16條允許在銀行、農會、漁會、信用合作社或郵局存款。請問'+target+'：要改哪些代表人資料及印鑑、舊印鑑是否要帶、是否要其他用印人到場或重簽印鑑卡，以及改選備查函、當選證明、會議紀錄、立案證書、存摺及身分證件等該帶哪些。這是行前核對清單，不是每一家都要同一組文件。不要把證件或帳戶資料貼到聊天框。'],
  ['變更一人，不代表提款只要一人用印','依社會團體財務處理辦法第17條，提用存款時由團體負責人、秘書長或總幹事，以及財務人員在領款憑證共同蓋章。即使留存印鑑只異動一人，仍應辦好權限交接，不能由新任理事長單獨用印提領。'],
  ['團體圖記另外交接','若為整屆改選，依人民團體會務輔導辦法第18條，立案證書、原有團體圖記等列入交接清冊，新任理事長就任後15日內會同監交人接收。若另重新刻製團體圖記，依法拓印送主管機關備查；金融機構印鑑卡異動不等同重刻圖記。'],
  ...(two?[['縣府和開戶單位各辦什麼','若選任職員簡歷冊或負責人名冊有異動，依人民團體法第54條，應於異動後30日內報主管機關核備。可同時先向原開戶單位問需要什麼；若其要求縣府備查函或證明，再依該機構通知補件。不能一概說所有人都須先重刻圖記才能辦帳戶。']]:[])
 ],refs};
}
if(typeof module!=='undefined'&&module.exports){module.exports={associationAccountSeal};return;}
root.verifiedAssociationAccountSeal=associationAccountSeal;
})(typeof window!=='undefined'?window:globalThis);
