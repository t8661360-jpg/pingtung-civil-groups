(function(root){
'use strict';
const groups={title:'人民團體法第14、22、26、27條：除名、罷免、通知及表決',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050091'};
const elections={title:'人民團體選舉罷免辦法第29至34條：罷免提案、答辯與會議',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050093'};
const scopes={title:'人民團體會務輔導辦法第8、10條：會址與會議通知',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0020094'};
const proposal=['正式提出罷免案，章程違反可寫入理由','理事、監事執行職務違反法令、章程或大會決議，得依人民團體法第22條由大會通過罷免，但不是寫在一般會務檢討或修章案裡就成立。按選舉罷免辦法第29、30條，就任未滿六個月不得提出；要以書面敘明事由，經原選舉人總數至少三分之一簽署，向團體提出並副知主管機關。'];
const deliberation=['不能臨時加案，跳過簽署和答辯程序','團體查核達法定簽署人數後，依規定送達罷免書影本讓被罷免人答辯。答辯截止後十五日內召開原選舉的會議；罷免一般協會的理事、監事，由會員（代表）大會按程序處理，應出席者過半數出席、出席者三分之二以上同意。把罷免案列為清楚可辨的項目，依適用規定通知，不用一條「違反章程」或臨時報告代替。'];
const mov=['真的搬登記會址：另走會址備查','會址確實搬遷時，依會務輔導辦法第8條，經理事會決議後報原主管機關備查。若章程明載舊地址而必須修改，另走修章議案及其報核程序；不是罷免案的一部分。'];
const venue=['會議通知上的場地，不等於登記會址','只換會議場地而登記會址沒變，不因而辦會址異動。會議通知仍應載正確會議種類、時間、地點、議程。已寄出錯誤場地，不要拿舊通知直接開會表決；先更正並依規定通知應出席人員，再核對需否改期或更正原報送資料。'];
const expulse=['另一位會員是否除名，不能跟罷免同案表決','依人民團體法第14條，會員違反法令、章程或不遵守大會決議，且已危害團體、情節重大，才可提會員（代表）大會除名；查章程及證據，列明議案並給說明機會，另依第27條達出席者三分之二以上同意。理事被罷免不當然失去會員資格，另一位會員也不會因理事被罷免就要除名。'];
const coopLaw={title:'合作社法第42、43、46條：解除職權與大會通知',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050112'};
const coopRules={title:'合作社選舉罷免辦法：正式罷免的程序',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050022'};
function cooperative(t){
 if(t.length>250||!/合作社|社員大會/.test(t)||!/理事|監事/.test(t)||!/章程|違法|失職/.test(t)||!/解除.{0,4}(?:職務|職權)|罷免/.test(t)||!/現場|臨時(?:提|加)|換.{0,9}(?:場地|會議地點)|會議通知/.test(t)||/信用合作社|信合社|聯合社|社員代表大會|不是合作社/.test(t))return null;
 return {direct:true,category:'合作事業｜理監事解除職權',title:'合作社違章失職的處理，不能套一般協會罷免門檻',summary:'不宜到場才加案直接表決。合作社理、監事違反法令或章程或失職時，依合作社法第42條由社員大會以全體社員過半數決議解除職權，不是算現場出席者的一半，也不是一般協會的三分之二。',steps:[
 ['會場換了，仍要處理通知與提議事項','合作社法第46條要求理事會召集大會，於七日前書面列明召集事由、提議事項並通知社員。把要處理的解除案和事由列清，告知正確場地；原通知未列或地點錯誤時，先依規定重新安排並通知，不逕判已作決議有效或無效。'],
 ['主管機關命令解除與社內處理不同','合作社法第43條另有主管機關在必要時得命令解除職權的程序。若實際辦法是正式罷免，另核對合作社選舉罷免辦法的提案、送達及投票程序；不要用一般人民團體的程序取代。']
 ],refs:[coopLaw,coopRules],questionState:{focus:'compound'}};
}
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 const coop=cooperative(t);if(coop)return coop;
 if(!t||t.length>250||!/協會|社會團體|人民團體/.test(t)||!/罷免.{0,4}(?:理事|監事)|(?:理事|監事).{0,22}罷免/.test(t)||!/章程|議程|提案|加案/.test(t)||/合作社|信合社|工會|公會|股東|管委會|罷免.{0,4}理事長|理事長.{0,8}罷免/.test(t))return null;
 const otherMember=/(?:另一位|另一個|另一名|另有|另問|另外).{0,7}會員.{0,14}(?:除名|開除)|(?:一般會員|普通會員).{0,8}(?:除名|開除)/.test(t);
 const hasAddress=/舊地址|新地址|會址|登記地址|場地|開會地點/.test(t);
 if(!hasAddress&&!otherMember)return null;
 if(!hasAddress&&otherMember)return {direct:true,category:'人民團體｜理監事罷免與會員除名',title:'理事罷免和另一位會員除名，要分案處理',summary:'一般協會是由會員（代表）大會依法處理，不用先猜是理事會或大會。罷免理事和會員除名是不同案：先完成罷免的書面提案、簽署及答辯，會員除名另按重大事由、章程與議程處理。不要把兩案綁成一票。',steps:[proposal,deliberation,expulse],refs:[groups,elections,scopes],questionState:{focus:'compound'}};
 const same=/(?:會址|登記地址).{0,8}(?:沒變|不變|沒有變|沒搬|未變)|只(?:有|是)?(?:換|改).{0,10}(?:場地|開會地點)/.test(t);
 const moved=!same&&/搬(?:了|遷|到|家)|會址.{0,6}(?:異動|搬|更換)|登記地址.{0,6}(?:異動|搬|要改)/.test(t);
 const base='建議獨立列「理事／監事罷免案」，把違反章程的具體情形寫成理由，不以修章或現場臨時表決取代法定罷免程序。';
 const cases=[{label:'登記會址真的搬了',question:'一般協會登記會址已搬遷，章程也許要改；要提罷免理事案，如何分開辦？'},{label:'會址沒變，只改會議場地',question:'一般協會登記會址沒變，只換大會場地；章程違反和罷免理事案怎麼分開辦？'}];
 return {direct:true,category:'人民團體｜罷免議案與會址／場地',title:'罷免理事與會址異動，分開處理',summary:base+(same?'登記會址沒變，不用因為場地變更辦會址備查，但應更正開會通知。':moved?'會址搬遷須另作決議與備查，開會通知也要有正確場地。':'舊地址可能是真搬家、也可能只是開會地點不同，先分清這兩個情況。'),steps:[proposal,deliberation,...(otherMember?[expulse]:[]),...(same?[]:[mov]),venue],refs:[groups,elections,scopes],questionState:{focus:'compound'},...(!same&&!moved?{choiceHeading:'您指的是哪種地址異動？',choices:otherMember?cases.map(c=>({...c,question:c.question+'另外，另一位會員可能也要除名，怎麼辦？'})):cases}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationRecallAddressAgenda=route;
})(typeof window!=='undefined'?window:globalThis);
