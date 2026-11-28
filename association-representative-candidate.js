(function(root){
'use strict';
const refs=[
 {title:'人民團體法第12、13、16、17、19、23、28、41條：代表、選任及例外',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050091'},
 {title:'人民團體選舉罷免辦法第5、9、12條：審定名冊及被選舉資格',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050093'},
 {title:'內政部台內團字第1020342168號：不得任意限制理監事參選資格',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256699&sms=12360'},
 {title:'內政部函：團體會員改派代表，不是直接遞補理監事',source:'https://www.moi.gov.tw/News_Content.aspx?Create=1&n=14119&s=256716'}
];
const standard=['在一般協會，提名理事和選理事長是兩道程序','依人民團體法第17條，先按法令與有效章程確認理、監事候選資格，由會員或會員代表大會選理、監事；理事長通常由理事就常務理事中選出，未設常務理事則由理事互選。不是開代表大會後，任一有一般會員資格的人就能跳過理事選舉直接當理事長。章程另有依法核准的選法時，再依該規定。'];
const criteria=['先看代表制來源與正式章程、選務公告','分區選出的代表、團體會員推派的代表，和上級團體由下級團體選派的代表不是同一種。第17條寫理監事就會員（會員代表）中選舉；不得隨意臨時增加候選資格限制。要判斷某位普通會員可否列候選，核對有效章程的被選舉資格、是否限代表、理事會審定的名冊與主管機關。不要把「未出席大會」誤認成「不具候選資格」，也不要把「沒有代表資格」當成一律可或一律不可。需在名單或選票確定前核對；沒有屏東承辦或章程明確資料，不代認這位候選人資格。'];
const upper=['上級團體有明文例外，不外推到每個採代表制的協會','人民團體法第19條規定，上級人民團體理事、監事之當選不限於下級團體選派出席的代表。若原本是團體會員推派並以該身分任理監事，代表資格被合法更換後，依第23條和內政部函釋，須審認是否已失該資格並依規定遞補，不是把代表或理監事職務直接交給新代表。'];
const options=[
 {label:'只是普通會員，還沒當選理事',question:'一般協會會員代表制，候選人只是普通會員還沒當選理事，可以提名理事長嗎？'},
 {label:'已依法當選理事',question:'一般協會會員代表制，他已依法當選理事但不是代表，可以參選理事長嗎？'},
 {label:'上級聯合會，由下級團體派代表',question:'上級人民團體聯合會採會員代表，候選人非下級選派代表，能當理事再選理事長嗎？'}
];
function representative(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>225||!/協會|社團|社會團體|人民團體|上級團體/.test(t)||!/會員代表|代表制|代表大會/.test(t)||!/理事長|理事|監事/.test(t)||!/資格|可|能|提名|當選|一定|是不是|身分|必須|要是|需要是/.test(t)||/合作社|農會|漁會|工會|公會|體育團體|公司|罷免|選舉票|委託出席/.test(t)||/(同時|兼任?|也是|又是|又當|也當).{0,6}監事|監事(和|跟|與|兼|又是|也是).{0,4}會員代表/.test(t))return null;
 const u=/上級人民團體|上級團體|下級團體.{0,8}(?:派|選)/.test(t);
 const elected=/已依法當選理事|已當選理事/.test(t)&&!/還沒當選|未當選/.test(t);
 const simple=/還沒當選理事|尚未當選理事|不是理事/.test(t);
 const summary=u?'上級人民團體理監事候選，不限下級團體派出的出席代表（第19條）；仍須查其他資格。要選理事長，先確認已依法成為該會理事或常務理事。':elected?'如確已合法當選理事且任職資格仍有效，可先核對章程是否設常務理事及理事長選法；不以是否列在出席代表名單單獨決定。':simple?'只是普通會員、還沒當選理事，在一般理事互選流程不能直接提名當理事長。能不能先列「理事」候選，還要按章程及名冊核對。':'先分兩關：能否列理事候選，和已當選理事後能否參選理事長。不能只憑「是普通會員」就確認能參選，也不能只因沒出席代表大會就說不行。';
 return {direct:true,category:'人民團體選舉｜代表、理事及理事長',title:'會員代表制：先確認理事候選資格，再選理事長',summary,steps:u?[upper,standard,criteria]:[standard,criteria,upper],refs,questionState:{focus:'compound'},...(!u&&!elected&&!simple?{choiceHeading:'您問的是哪一種情況？',choices:options}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={representative};return;}
root.verifiedAssociationRepresentativeCandidate=representative;
})(typeof window!=='undefined'?window:globalThis);
