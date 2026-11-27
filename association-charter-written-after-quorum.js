(function(root){
'use strict';
const refs=[
 {title:'人民團體法第27條：大會出席與修章門檻',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050091'},
 {title:'民法第53條：社團法人章程變更',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=B0000001&flno=53'},
 {title:'內政部常見問答：立案團體與已登記社團法人的修章門檻',source:'https://www.moi.gov.tw/News_toggle3.aspx?PageSize=200&_CSN=1633&n=8361&page=1&sms=9015'}
];
const noPatch=['開會時成會與否，不能靠會後湊票回補','「過半數」不是「達到一半」。若大會當時只有應出席人數的一半，就不能把該次修章表決記成依法通過。按合法的出席及表決結果記錄；不要回填出席或把缺席者事後簽名塞進原票數。若有委託代理，核對會議當時已符合章程及規定的委託，不以事後補件創造當時出席。'];
const registered=['已經法院登記為社團法人：書面同意是另一個完整方式','依民法第53條，會議方式為全體社員過半數出席且出席社員四分之三以上同意；亦可採全體社員三分之二以上書面同意。書面同意是針對同一確定版本的獨立修章決議，分母是全體社員，不能把原本不足額的一次會議，和幾份後補同意書混算。再依適用程序向主管機關及法院辦理。'];
const filed=['只有立案、未辦法院法人登記：按人民團體法重新走大會','一般人民團體修章，需會員（會員代表）過半數出席、出席者三分之二以上同意。原大會不足額，應依章程、通知及議程合法重開，不用民法第53條的書面方式來補一場未達門檻的大會。'];
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>240||!/修章|修改章程|章程.{0,7}(?:變更|修正)|變更章程/.test(t)||!/書面|補票|補簽|會後.{0,6}(?:簽|收同意)/.test(t)||!/缺席|未出席|沒出席|沒有出席|一半|半數|成會|流會|出席不足|不足額|散會|補票|重開|無法開會/.test(t)||/合作社|社員大會|工會|公會|股東|管委會|基金會|公職/.test(t.replace(/全體社員(?!大會)/g,'')))return null;
 const notRegistered=/未(?:經|辦|做|完成).{0,4}法人登記|還沒.{0,4}法人登記|沒有.{0,4}法人登記|只有.{0,5}立案|僅立案|非法人協會/.test(t);
 const yes=/已(?:經|辦理|向法院|完成|經法院)?.{0,5}法人登記|社團法人|有法院的法人登記/.test(t)&&!notRegistered&&!/不確定是不是|還不知道/.test(t);
 const p='不能用會後書面補票，把當天不足過半的會議補成有效決議。';
 return {direct:true,category:'人民團體｜修章出席與書面同意',title:'修章未達開會人數，不能事後補票',summary:p+(yes?' 已登記社團法人可另評估民法第53條的完整書面同意程序，不是補原票。':notRegistered?' 未辦法院法人登記的一般協會，請依法重新通知、召開大會。':' 立案與法院法人登記不同，請選團體狀態再看修章方式。'),steps:yes?[noPatch,registered]:notRegistered?[noPatch,filed]:[noPatch,filed,registered],refs:yes?refs:notRegistered?[refs[0],refs[2]]:refs,questionState:{focus:'compound'},...(!yes&&!notRegistered?{choiceHeading:'協會有辦法院法人登記嗎？',choices:[{label:'已登記為社團法人',question:'我們是已登記為社團法人的協會，大會修章時出席只有一半，能用書面補票嗎？'},{label:'只有主管機關立案',question:'我們協會只有主管機關立案，未經法院辦法人登記。大會修章出席只有一半，能用書面補票嗎？'}]}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationCharterWrittenAfterQuorum=route;
})(typeof window!=='undefined'?window:globalThis);
