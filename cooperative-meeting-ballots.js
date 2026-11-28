(function(root){
'use strict';
const coop={title:'合作社法第9、11、36、46、48、50、51條',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050112'};
const elect={title:'合作社選舉罷免辦法第3至5、23條',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050022'};
const ministry={title:'內政部：防疫視訊措施與指揮中心解編後的適用說明',source:'https://www.moi.gov.tw/News_Content.aspx?n=15255&s=279353'};
const assoc={title:'人民團體法第25至27、29條',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050091'};
const credit={title:'信用合作社社員代表理事監事經理人應具備資格條件及選聘辦法',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=G0380069'};
const normalized=q=>String(q??'').normalize('NFKC').replace(/\s/g,'');
function route(q){
 const t=normalized(q);if(!t||t.length>540||/^(?:新題|另問|另外問)/.test(t))return null;
 const selection=t.match(/;櫃檯確認合作社議程:(rep|board|business)$/)?.[1];
 const head=t.replace(/;櫃檯確認合作社議程:[a-z]+$/,'');
 const b=head.replace(/(?:不是(?:在|要)?問|不是|並非|不談)(?:一家|一般|普通)?(?:信用合作社|合作社|協會|社員代表大會|社員大會)/g,'');
 const isCoop=/合作社|社員(?:代表)?大會|選社員代表|社員代表(?=.{0,26}代表大會)/.test(b);
 const association=/一般協會|社會團體|社區發展協會|協會會員大會/.test(b);
 const remote=/視訊|線上開|遠距|混合會議|zoom|teams/i.test(b);
 const postal=/郵寄|回郵|寄票|寄選票|寄.{0,4}選票|通信投票|通訊投票|電子投票|通信表決|通訊表決|書面表決|書面投票|線上投票|網路投票|群組投票|[Ll][Ii][Nn][Ee]|線上選/.test(b);
 const fail=/流會|人數不足|沒過半|沒湊到|沒湊齊/.test(b);
 const finance=/財報|財務報表|決算|收支餘絀|預決算|(?:年度|年終)帳/.test(b);
 const charter=/修章|改章|(?:修|訂|改|修改|變更)(?:合作社)?章程|章程變更/.test(b);
 const rep=/分組選|(?:選(?:出)?|改選|選舉|罷免|選罷)(?:.{0,4})社員代表(?!大會)|社員代表.{0,4}(?:的選舉|選舉|罷免)|社員代表(?!大會).{0,9}(?:郵寄|投票)/.test(b);
 const board=/選(?:出)?新?(?:理監事|理事|監事)|改選.{0,5}(?:理監事|理事|監事)|(?:理監事|理事|監事).{0,4}(?:選舉|改選|補選|罷免)|(?:選舉|補選|罷免).{0,4}(?:理監事|理事|監事)|(?:理監事|理事|監事).{0,18}(?:LINE|群組|郵寄|線上).{0,10}(?:投票|選)/i.test(b);
 const proxy=/委託|代理|代投/.test(b), associate=/準社員/.test(b);
 const repMeeting=/代表大會/.test(b), mailRepHistory=/只.{0,8}(?:選社員代表|社員代表選舉)/.test(b);
 if(association&&!isCoop&&remote&&finance&&!board&&!rep&&/大會/.test(b)&&/章程(?:有|已|明訂|載明).{0,12}視訊/.test(b)&&!/章程(?:沒有|沒寫|未)|(?:不知道|不確定).{0,12}章程/.test(b))return {direct:true,category:'一般人民團體｜視訊會員大會',title:'一般協會章程已明訂視訊，年度決算可排入視訊會員大會',summary:'這次若只辦年度決算，未涉及選舉、補選或罷免，可依人民團體法第25條及有效章程召開視訊會員大會。理事會、監事會視訊另看第29條及各自的章程條款。',steps:[['先分清是報告或提請審議','年度決算若依規定需提交會員大會審議，不能把口頭報告當成通過。依法通知，確認本人身分、出席數與表決方式，並將結果記入紀錄。'] ],refs:[assoc,ministry]};
 if(!isCoop||association||/公會|工會|農會|漁會|基金會|管委會|公司股東/.test(b))return null;
 if(!selection&&!((remote||postal)&&(rep||board||finance||charter||/社員(?:代表)?大會/.test(b))||fail&&(finance||board||charter||rep)))return null;
 const out=(title,summary,steps,refs=[coop,elect])=>({direct:true,category:'一般合作社｜會議及選務',title,summary,steps,refs});
 if(/信用合作社|信合社/.test(b))return {direct:true,category:'信用合作社｜會議及選務',title:'這是信用合作社：先分開社員代表選舉、理監事選舉和一般議案',summary:'信用合作社另有專門選舉規定，不能把一般合作社的郵寄或電子選舉辦法直接移用。先查信用合作社的核定章程、專門選舉辦法及這次議程。',steps:[],refs:[credit]};
 if(!selection&&!rep&&!board&&!finance&&!charter)return {...out('先確認您要表決的是什麼','郵寄、通訊或視訊不是同一種做法。選社員代表、改選理監事和表決一般議案，各有不同程序。',[]),choiceHeading:'您這次處理哪一項？',choices:[['選社員代表','rep'],['改選理監事','board'],['表決財報或修章','business']].map(([label,key])=>({label,question:String(q??'')+'；櫃檯確認合作社議程:'+key}))};
 const doRep=selection==='rep'||rep&&!mailRepHistory;
 const doBoard=selection==='board'||board;
 const business=finance||charter||selection==='business';
 const two=/(?:兩|二|2|貳)(?:場|次)|(?:第2|第二)次|流會.{0,6}(?:三|3)次/.test(b);
 const explicitOnce=/(?:只|才)(?:流會)?(?:一|1)次|流會(?:一|1)次(?!以)/.test(b);
 const steps=[];
 if(doRep){
  steps.push(['先確認有沒有設社員代表的依據','一般合作社須超過200名社員，才能依章程分組選代表；章程沒寫分組的，也須先取得主管機關核准。分組核准不等於可以用郵寄或電子投票。']);
  steps.push(['理事會通過但還未備查，不要寄選票','非會議方式須有理事會決議並報主管機關備查。若要郵寄或用電子投票，章程還要明訂，選務辦法須經社員大會或社員代表大會通過，再報主管機關備查後才能辦。請依登記層級找該管合作社主管機關；屏東縣主管的社，向縣府承辦確認。']);
 }
 if(!doRep&&(repMeeting||/社員代表/.test(b))&&/法定程序未確認|是否合法|尚未確認/.test(b))steps.push(['先核對社員代表大會是否依法設立','一般合作社的社員超過200人，仍要查章程中的分組規定或主管機關核准，以及代表選出及備查文件；可向登記層級的合作社主管機關確認，縣屬向縣府承辦。']);
 if(doBoard){
  steps.push(['不能把選社員代表的程序拿來改選理監事','理事、監事應由社員大會或社員代表大會以會議投票選出。選社員代表的通訊或電子投票例外，不適用理監事；也不能改用同一張表決票、郵寄選票、LINE 或一般視訊代替法定選舉會議。']);
  if(fail)steps.push(['選舉會議流會要另排會議','選舉會議人數不足流會，依選罷辦法第3條應於15日內重開；才可依章程以實際出席數開會選舉，但不得低於應出席人數三分之一。']);
 }
 if(business&&fail){
  steps.push(['社員大會流會兩次以上，才有書面通信表決',(explicitOnce?'只流會一次，還不能依第51條改用通信表決。':'')+'依合作社法第51條，理事會以書面列明應議事項，請全體社員通信表決，期限至少10日，不是7日。7日是第46條通常召集社員大會的書面通知期。這條文不是理監事選舉的替代程序，也不能拿來認定LINE補票有效。'+(repMeeting?'如果流會的是社員代表大會，不要直接套用通知全體社員的這一條；先確認會議類型及適用規定。':'')]);
 }
 if(business&&remote)steps.push(['財報、修章要分開確認視訊會議依據','公衛應變期間的合作社視訊大會措施已隨指揮中心解編結束。不能以當時公告，或已備查的選代表投票辦法，當作這次社員（代表）大會視訊審議的依據。若想採視訊，先帶章程及議程請該管合作社主管機關確認適用程序，不把未確認的視訊結果當成決議。']);
 if(business&&!remote&&!fail&&!selection)steps.push(['一般議案與選舉分開','把財報、修章放在法定議程依適用程序審議。非屬法定通信表決情形，不以郵寄、電子票或即時通訊群組直接取代大會。']);
 if(business&&selection==='business'&&!remote&&!fail)steps.push(['先看社員大會是否確實流會兩次','未達兩次，不用第51條通信表決；達兩次才由理事會書面通知全體社員，至少給10日回覆。普通社員大會通知與表決期限不要混淆。']);
 if(finance||selection==='business')steps.push(['年度決算及財報需要監事會審核，不是一名監事代簽','年度終了由理事會編製業務報告、財務表及餘絀處理案，通常在社員大會開會至少10日前送監事會審核，審核後提大會；臨時社員大會有第36條例外。不要以單一監事的簽名代替監事會審核或大會審議。']);
 if(charter||selection==='business')steps.push(['修章還有決議與變更登記','依合作社法第9條第4項，修章須經社員大會決議，並於決議後一個月內檢具紀錄辦變更登記。若擬用通信表決修章，先確認這次具第51條條件、該修章議題及其通過門檻、可供登記的紀錄；不要把寄送議案等同通過。']);
 if(proxy||associate||doRep)steps.push(['不要把一般委託和通訊選舉混用',(associate?'準社員依合作社法第11條沒有表決、選舉、被選舉及罷免權，不能委託理事代行這些權利。':'')+'一般社員大會不能出席，可書面委託另一名社員，每人限代理一人；但社員代表採非會議方式或通訊／電子投票選舉，不得委託代理。']);
 if(!steps.length)return null;
 const title=doBoard&&(business||doRep)?'合作社的理監事改選，不能和一般議案或選代表共用同一張票':doBoard?'合作社理監事改選要另開法定選舉會議':doRep?'合作社要郵寄選社員代表，先完成章程、辦法與備查':'合作社視訊及書面表決：先查會議性質與流會次數';
 const summary=doBoard?'不能沿用選社員代表的通訊投票辦法來改選理監事。'+(business&&fail?'年度決算、財報和修章另看社員大會流會兩次以上的書面程序，答覆期限至少10日。':'一般議案應另查適用開會與決議程序。'):doRep?'如果還沒完成備查，不要先寄投票資料。選社員代表和改選理監事的程序不同。':fail?(two?'社員大會流會兩次以上才有法定通信表決程序。':'先確認有無兩次社員大會流會。')+'答覆期最少10日，普通召集通知的7日不是答覆期。':'先確認是一般議案、選代表，還是改選理監事；不可直接沿用防疫期間視訊措施。';
 return out(title,summary,steps,[coop,elect,...(remote?[ministry]:[])]);
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedCooperativeMeetingBallots=route;
})(typeof window!=='undefined'?window:globalThis);
