(function(root){
'use strict';
function law(name,code,n){return {title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n};}
function postalAccountProtection(t){
 if(!/郵局|中華郵政|郵政存簿/.test(t)||!/存摺|存折|存簿|儲金簿|印鑑|帳戶|戶頭|網路郵局|行動郵局/.test(t))return null;
 if(/個人(?:戶|帳戶|名下)|私人帳戶|自己的帳戶|信用合作社|信合社|合作社|農會|漁會|劃撥|郵政匯票|金融卡/.test(t))return null;
 const held=/(?:被|由)?(?:前任|卸任|原任|舊任|上任|前理事長).{0,20}(?:不交|不給|留著|保管|留有|拿走|拿著|手[上中裡]|拒絕|不還)|(?:不交|不給|不還|拒絕移交|交不出).{0,12}(?:存摺|存折|存簿|儲金簿|印鑑)|(?:存摺|存折|存簿|儲金簿|印鑑).{0,14}(?:沒交接|未交接|拿不回|不在團體手上)/.test(t);
 const lost=/遺失|丟了|被偷|被搶|不見|找不到|脫離控制/.test(t);
 const reported=/已(?:經)?掛失|掛失後|掛失了|掛失完|已(?:經)?止付|只掛失/.test(t);
 const protective=/掛失|止付|保護帳戶|暫停|鎖帳|凍結|停用|被領走|亂領|冒領|被轉走|不認得|不明轉帳|可疑交易|不是我們轉/.test(t);
 if(!held&&!lost&&!reported&&!protective)return null;
 const suspect=/不認得|不明轉帳|可疑交易|不是我們轉|冒領|被轉走|盜領/.test(t);
 const digital=/網路|語音|行動郵局|電子/.test(t);
 return {direct:true,category:'人民團體財務與改選',questionState:{focus:'compound'},
 title:reported&&digital?'郵局團體戶：掛失存摺不等於網路郵局停用':'郵局團體戶：存摺或印鑑失去控制，先聯絡郵局',
 summary:reported&&digital?'只掛失存摺，不會因此一律終止電話語音或網路服務。電話受理時郵局可因安全考量另行暫停；請立即確認這一戶哪些功能仍開啟，必要時明確請郵局停用。':'先聯絡原開戶郵局或中華郵政24小時客服，詢問能否先辦暫予止付及何時生效；不用等完成改選更印才詢問。'+(held?'存摺或印鑑在前任手中，請照實說明，不要說成遺失。':''),
 steps:[
  ['現在可以先做什麼','撥中華郵政24小時客服 0800-700-365；手機請撥付費電話 (04)2354-2030。由現任有權代表團體的人說明情況，請郵局確認身分、代表權、可以採用的保護措施及生效狀態；不要把開戶資訊、密碼、帳號或證件貼到小屏。'],
  ['確認網路、電話語音及交易範圍','僅掛失存摺通常不會同時終止網路及電話語音。若怕電子交易仍可使用，請明確提出要一併停用網路及語音，並向郵局確認各項服務是否停止、何時生效。電話受理時郵局依約可以另行停止或暫停相關服務，但不能預設已凍結所有交易。'+(suspect?'如發現不認得的交易，立即告知郵局並保留日期、金額及交易紀錄，請郵局查核，不要等到更印才反映。':'')],
  ['再到原開戶郵局核對補辦與更印','法人或團體的郵政存簿帳戶是非通儲戶，應回原開戶郵局確認補辦；這類存簿帳戶不得領用金融卡。請依郵局要求備妥改選或代表權證明、團體文件、身分證件和印鑑；何人到場、能否同時補辦或改留印鑑，以郵局確認為準。'],
  ['帳戶保護與協會內部交接分開','可留下書面催交以及會議紀錄。若是整屆改選，應按人民團體會務輔導辦法第18條列冊、由新任理事長會同監交人接收；未交存摺本身不等於協會圖記已失效，也不等於郵局已止付。']
 ],refs:[
  {title:'中華郵政115.03開戶約定書：壹、五、六與貳、一（三）',source:'https://www.post.gov.tw/post/download/%E9%83%B5%E6%94%BF%E5%AD%98%E7%B0%BF%E5%8A%83%E6%92%A5%E5%84%B2%E9%87%91%E9%96%8B%E6%88%B6%E7%B4%84%E5%AE%9A%E6%9B%B8.pdf'},
  {title:'中華郵政：存簿掛失補副、暫予止付與24小時客服',source:'https://www.post.gov.tw/post/internet/Customer_service/index.jsp?ID=16020402&defaultAllOpen=1&sn=79B1AEF4-BBE8-43F9-82DF-A1BAB4326880'},
  {title:'郵政儲金匯兌法第15條',source:'https://www.post.gov.tw/post/internet/Law/index.jsp?ID=1701&ch_class_id=16&law_ch_no=211&law_id=211'},
  law('人民團體會務輔導辦法','D0020094',18)
 ]};
}
function associationAccountSeal(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>185||!/協會|社會團體/.test(t)||/不是(?:協會|社會團體)|(?:是|我們|本)(?:一間|一家)?(?:合作社|信合社|公會|農會|漁會|工會|基金會)|(?:農會|漁會)(?:自己|本身)的?理事長/.test(t))return null;
 const protection=postalAccountProtection(t);
 if(protection)return protection;
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
