(function(root){
'use strict';
const refs=[
 {title:'人民團體選舉罷免辦法第17、27條：出缺、代理與辭職程序',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050093'},
 {title:'社會團體財務處理辦法第17條：提用存款共同蓋章',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0050097&flno=17'},
 {title:'人民團體法第54條：選任職員或負責人異動核備',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0050091&flno=54'},
 {title:'內政部：理事長於大會口頭辭職是否生效',source:'https://www.moi.gov.tw/News_Content.aspx?Create=1&n=14119&s=219866'}
];
const common=['協會提款不能只看舊當選證明','舊屆理事長證明、仍留原印鑑或仍能登入銀行，不代表現在有權提款。一般社會團體依財務處理辦法第17條，由團體負責人、秘書長或總幹事及財務人員於領款憑證共同蓋章；另依開戶單位核對有權代表、留存印鑑與帳戶權限。'];
const verify=['先釐清辭職是否已依法處理','依選舉罷免辦法第27條，理事長辭職應書面提出，經理事會決議准其辭職，並於會員（代表）大會報告。只有口頭宣布或已送辭職書但尚無理事會決議，不宜直接當成已出缺。核對現在的職務及代表權，不用舊證明猜。'];
const vacancy=['欠缺代表人時，依法補選或代理','理事長出缺，原則在出缺日起一個月內補選。所遺任期不足六個月，得於一個月內依章程或由常務理事互推一人代理；未設常務理事，由理事互推。代理並不是由持有證明的人自行接任。選任職員或負責人異動另按人民團體法第54條於30日內報主管機關核備。'];
const bank=['確認原開戶單位的異動資料；有急件也不借舊權限','按銀行或郵局要求備妥決議、代理或補選證明、主管機關文件、印鑑等。若急需按時付款，先確認現任有權人與銀行可接受的證明；權限未核對前，先處理展延或正式授權流程，不冒用前任章、不借帳戶、不擅自以私人戶代收或代付。勿貼證件、帳號或印鑑。'];
function resignedWithdrawal(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>245||!/協會|社會團體/.test(t)||!/理事長/.test(t)||!/辭職|請辭|辭呈|辭掉|辭任/.test(t)||!/領錢|提款|提領|領款|動支|銀行.{0,8}(?:用印|印鑑)|存款|團體戶/.test(t)||/合作社|公會|工會|公司|解散|清算|信用|農會/.test(t))return null;
 const approved=/決議(?:已)?准|已(?:經)?准辭|同意辭職|准予辭職|確認出缺|補選完|已(?:經)?補選|代理人已/.test(t)&&!/尚未決議|還沒決議|未通過|沒有同意|尚未補選|還沒補選/.test(t);
 const unapproved=/口頭|還沒決議|尚未決議|未通過|還沒審|只交辭/.test(t);
 const summary=approved?'辭職已依法處理且原任不再具有代表權，就不能憑上一屆當選證明提款。請由依法補選或代理的有權人，依銀行程序和共同用印要求辦理。':unapproved?'不能只憑上一屆證明提款。只有口頭請辭或理事會尚未決議，先確認辭職是否生效和現任代表權，不自行認定由別人接手。':'不要只憑上一屆當選證明領協會款。關鍵是辭職有沒有經理事會依法決議、目前誰有代表權，以及銀行是否已確認提款權限。';
 const choices=[{label:'理事會已決議准辭',question:'協會理事長辭職，理事會已決議准予辭職，可以拿上一屆證明領錢嗎？'},{label:'只提出辭職，尚未決議',question:'協會理事長只提出辭職，理事會尚未決議，能用前屆證明領錢嗎？'}];
 return {direct:true,category:'協會會務與財務｜請辭及提款權',title:'理事長請辭：舊當選證明不是現行提款授權',summary,steps:[common,verify,vacancy,bank],refs,questionState:{focus:'compound'},...(!approved&&!unapproved?{choiceHeading:'理事會處理到哪一步？',choices}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={resignedWithdrawal};return;}
root.verifiedAssociationResignedWithdrawal=resignedWithdrawal;
})(typeof window!=='undefined'?window:globalThis);
