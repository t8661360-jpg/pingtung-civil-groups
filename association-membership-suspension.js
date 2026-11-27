(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const p=n=>law('人民團體法','D0050091',n);
const g=n=>law('人民團體會務輔導辦法','D0020094',n);
const charter={title:'內政部台內團字第1050019228號：停權範圍與章程程序',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256719'};
const duties={title:'內政部台內團字第1110131620號：理監事停權與解任效力',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=297791'};
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>235||!/協會|人民團體|社會團體/.test(t)||!/停權|停表決權|停(?:止|掉)會員權/.test(t)||!/會員/.test(t)||!/出席|出席數|投票|表決|申訴|申復|救濟|理事職權|監事職權|解任/.test(t)||/合作社|公會|工會|農會|漁會|公務人員協會|基金會|董事會|股東|選舉爭議|罷免提案|除名程序|欠繳|沒繳會費|逾期會費/.test(t))return null;
 const office=/(?:會員同時是|我是|本人是|本身是|當選為|現任|協會的|這位|某位)(?:理事(?!長|會)|監事(?!會))|理事職權|監事職權|還能.{0,6}(?:理事會|監事會)投票|(?:理事|監事).{0,6}只因會員身分|(?:理事|監事).{0,5}解任/.test(t);
 const voteOnly=/只(?:限制|停止|暫停|停)(?:會員)?表決權|只(?:停|限制)投票權|僅(?:停止|限制)表決權/.test(t)&&!/不確定|不知道|沒有說明/.test(t);
 const alsoAttendance=/明定不得出席(?:會員大會|大會)|明載不得出席(?:會員大會|大會)|停權決議已生效，?確定同時停止出席/.test(t)&&!/還沒生效|不確定|不知道/.test(t);
 const only=voteOnly&&!alsoAttendance, all=alsoAttendance&&!voteOnly;
 const general=['大會出席和表決須分開核對','依現行章程、依法作成且已生效的決議、起訖日期及限制項目，核對大會前依會務輔導辦法第10條審定的名冊和限制記載。內政部函釋說明停權範圍、期間及是否屬重大事項要依章程與具體情形判斷。不能看到「停權」兩字，就把出席和投票一起扣掉；也不能把停權等同除名。'];
 const vote=['只限制表決，沒有取消出席資格','仍有出席資格且列應出席名冊時，不能只因表決權被停就把他從應出席名冊一併刪掉。到場可依保留的出席資格計出席，但不能投受限制的票；如對出席者或某項議案的計票基準有爭議，請先由承辦依章程與適用法規核對。'];
 const out=['依法有效且明確也限制出席','限制期間內，既然有效處分也排除該次出席，就不要以原會員身分讓其簽到或表決。請用依法審定並載明限制的名冊確認應出席和實際出席；不要在當天僅憑口頭命令把人從名冊或票數剔除。'];
 const review=['對停權有異議，不先假定行政申訴期限','先索取停權通知與決議，核對章程所定機關與程序、限制範圍、原因及起訖。依章程規定向團體書面申復或請求複核、保留送達證明；仍有爭議，可向原立案主管機關反映並請其查核。涉及決議效力或權利受侵害時，持文件詢問法律扶助或律師，不把團體內部決議當成縣府的行政處分。'];
 const board=['當選理監事的職務是另一個身分','內政部函釋指出，僅會員資格被停權，不會因此當場停止理事等選任職權；和大會表決權的限制分開。人民團體法第23條第4款看實際停權期間是否逾任期二分之一，不是先宣布的期間超過一半就立即解任。若另有已喪失會員資格或合法解任等情形，再依法分開判斷。'];
 const steps=[general,...(only?[vote]:all?[out]:[vote,out]),...(office?[board]:[]),review];
 return {direct:true,category:'人民團體會務｜會員停權與大會權利',title:office?'停止會員權利，不等於當場解除理監事職務':'停權後能否出席、表決：看有效處分究竟停了什麼',
  summary:office?'要分現在問的是會員大會的權利，還是已當選理事、監事的職務。會員停權本身不等於當場解任。':only?'若只停表決權、仍具出席資格，合資格到場可計出席；不能投受限制的票。':all?'若處分已有效且明確限制出席，期間內不列為該項出席或表決；依審定名冊確認，不在現場臨時刪人。':'先看停權是否生效、範圍和名冊。只停表決權和同時不准出席，不能用相同方式計算與投票。',
  steps,refs:[p(12),p(16),p(27),g(10),charter,...(office?[p(23),duties]:[])],questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}],...(!office&&!only&&!all?{choiceHeading:'這次停權決議的範圍是？',choices:[{label:'只停表決權，仍可出席',question:'協會會員停權只停表決權，仍有出席資格，大會能算出席和投票嗎？如何申訴？'},{label:'已生效，且明載不得出席',question:'協會會員停權已生效且明載不得出席會員大會，可以算出席或表決嗎？如何申訴？'}]}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationMembershipSuspension=route;
})(typeof window!=='undefined'?window:globalThis);
