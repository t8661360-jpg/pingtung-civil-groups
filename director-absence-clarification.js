(function(root){
'use strict';
const heading='理事、監事連續兩次無故缺席，視同辭職，由候補遞補';
const interpretation={title:'內政部台（79）內社字第779204號函：無故缺席的認定',source:'https://www.moi.gov.tw/News_Content.aspx?n=14143&s=220159'};
function clarify(answer){
 if(!answer||answer.title!==heading)return answer;
 return {...answer,
  summary:'不一定。未事先請假不等於無故缺席；有沒有合法原因或正當理由，要由團體依議定的處理原則和實際情形判斷（內政部台（79）內社字第779204號函）。例如突發住院而來不及請假，可儘快補具說明，請團體先查明兩次缺席的原因，不宜只憑沒有請假就認定辭職。\n\n依人民團體法第31條，理事、監事須親自出席理事會、監事會，不得委託代理；只有連續二次無故缺席才視同辭職，不能把有正當理由的缺席算進去。依人民團體會務輔導辦法第9條第3項，視同辭職也須分別經理事會或監事會決議通過後解任，缺額由候補依次遞補。選任職員名冊有異動，應於三十日內報主管機關核備（人民團體法第54條）。',
  statutes:[...(answer.statutes||[]),interpretation]};
}
if(typeof module!=='undefined'&&module.exports){module.exports={clarify};return;}
const before=root.verifiedRoundAnswer;
if(typeof before==='function')root.verifiedRoundAnswer=function(q,ctx){return clarify(before.call(this,q,ctx));};
})(typeof window!=='undefined'?window:globalThis);
