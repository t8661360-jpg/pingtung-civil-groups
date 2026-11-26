(function(root){
'use strict';
const law=n=>({title:'合作社法第'+n+'條',source:n===9?'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0050112&flno=9':'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050112'});
function matches(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 return /合作社/.test(t)
  && /社址|會址|地址|設址|登記.{0,5}(地點|處所)|辦公室/.test(t)
  && /買房|自有|自己(的|買|擁有)|所有權|權狀|房契|謄本|地契|租屋|租賃|租約|房東|借用|使用同意|使用權|房屋稅單/.test(t)
  && !/信用合作社|計程車|儲蓄互助社|社員住宅|住宅合作社|抵押|房貸|貸款|過戶|買賣|移轉|租金報稅|房屋稅(率|減免)|社址.{0,6}跨(縣|市)|民事糾紛/.test(t);
}
function coopAddressProof(q){
 if(!matches(q))return null;
 return {direct:true,category:'合作社會務',title:'合作社社址不必自有：所有權證明與使用權證明是兩件事',
 summary:'一般合作社不必自己買房才能登記社址。《合作社法》沒有要求合作社本身擁有房屋，也沒有規定所有權狀是社址變更唯一可附的文件。\n\n所有權證明是用來確認房屋是誰的；租約或屋主使用同意書是用來證明合作社可以使用該址。兩者用途不同，不要把租約直接當成所有權證明。若屏東的承辦機關同時要求兩類證明，不能假定只附一份租約就能代替另一類。\n\n本站未能確認屏東目前是否接受租約或同意書單獨送件、是否須加附屋主權狀或其他所有權證明。建議送件前向屏東縣政府社會處合作社承辦確認最新清單（縣府總機 08-7320415）；不要把一般協會或其他縣市的清單直接套用。\n\n社址列為登記事項（合作社法第9條第2項第4款），異動應於一個月內辦理變更登記（第3項）。社址也是章程應記載事項（第9-1條第3款）；如須修改章程，應由社員大會決議，並自決議後一個月內以書面檢具會議紀錄辦理變更登記（第9條第4項）。',
 statutes:[law(9),law('9-1')],notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function keepCoopProofQuestion(q,normalize){return matches(q)?String(q):normalize(q);}
if(typeof module!=='undefined'&&module.exports){module.exports={coopAddressProof,keepCoopProofQuestion};return;}
const previous=root.verifiedRoundAnswer,normalize=root.normalizeQuestion;
root.verifiedRoundAnswer=function(q,ctx){return coopAddressProof(q)||previous.call(this,q,ctx);};
root.normalizeQuestion=function(q){return keepCoopProofQuestion(q,normalize);};
})(typeof window!=='undefined'?window:globalThis);
