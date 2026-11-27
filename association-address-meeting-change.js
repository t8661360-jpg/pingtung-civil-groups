(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const address=law('人民團體會務輔導辦法','D0020094',8);
const notice=law('人民團體會務輔導辦法','D0020094',10);
const members=law('人民團體法','D0050091',26);
const annual=law('人民團體法','D0050091',25);
const elections=law('人民團體選舉罷免辦法','D0050093',21);
const charter=law('人民團體法','D0050091',54);
const advice={title:'內政部台內社字第8735076號函：會員大會延期後通知',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=220065'};
const coopRef=n=>law('合作社法','D0050112',n);
function coopRoute(t){
 if(!/社員大會/.test(t)||!/社址|登記地址|辦公室.{0,4}搬/.test(t)||!/改期|延期|改日期|日期要改|換.{0,10}(?:場地|開會地點)|改.{0,6}(?:開會地點|場地)|改時間|延後/.test(t)||/不是合作社|信用合作社|信合社|已經開完|已表決|社員代表大會|停止營業/.test(t))return null;
 const stay=/(?:社址|登記地址).{0,8}(?:沒變|未變|不變|沒搬|不搬|沒有變|沒有搬)|只(?:是)?(?:換|改).{0,6}(?:開會場地|開會地點)|不涉及社址/.test(t);
 const move=!stay&&/搬|遷|社址也改|登記地址也改|新社址|社址要改/.test(t);
 const sent=/通知已(?:經)?(?:寄|發)|已(?:經)?寄出|已發.{0,4}通知|之前.{0,6}(?:寄了|通知)/.test(t)&&!/尚未|還沒/.test(t);
 const meeting=['先處理社員大會的新會期','合作社法第46條規定，社員大會由理事會召集，並於七日前以書面載明召集事由及提議事項通知社員。已發出的舊日期或舊地點通知不能拿來替代新會期，宜由召集方用新資料重新書面通知，保留紀錄。如涉及選舉，另核對選舉公告、書面通知及備查。'];
 const reg=['真的搬社址，另辦變更登記','社址是合作社法第9條的登記事項，也是第9-1條的章程事項。社址變更原則在一個月內辦理變更登記；若要修改章程，先經社員大會決議，並於決議後一個月內檢具會議紀錄書面申請。只更換社員大會場地，不必因而變更登記社址。'];
 return {direct:true,category:'合作事業｜社址與社員大會異動',title:'社員大會改期與社址登記，分開辦',summary:(stay?'社址沒有變，不必辦社址變更登記。':move?'若登記社址也搬了，變更登記和大會通知分開辦，不等登記完成才處理社員大會通知。':'若只改會議時間或場地，不等同變更登記社址；先核對社址是否真的異動。')+(sent?'原通知已寄，應按新會期以書面重新通知社員，並留足七日前的期限。':'社員大會應於新會期七日前以書面通知社員。'),steps:stay?[meeting]:[meeting,reg],refs:stay?[coopRef(46)]:[coopRef(46),coopRef(9),coopRef('9-1')],questionState:{focus:'compound'},...(!stay&&!move?{choiceHeading:'社址有跟著異動嗎？',choices:[{label:'社址沒變，只改開會',question:'合作社社員大會要改期，社址沒變，怎麼通知？'},{label:'登記的社址也搬了',question:'合作社社員大會要改期，登記社址也搬了，怎麼分開辦？'}]}:{})};
}
const venueChange=/改期|延期|延後|改(?:開會)?地點|改場地|改會場|換(?:開會)?地點|換場地|換會場|改日期|改時間|(?:換|改).{0,12}(?:場地|會場|地點)|改到別處/;
const venueAlone=/只(?:有|是)?(?:改|換)(?:協會(?:的)?)?(?:(?:會員(?:代表)?大會|大會|理事會|監事會)(?:的)?)?(?:開會)?(?:地點|場地|會場)/;
const unchanged=/(?:登記(?:會址|地址)|會址|辦公室).{0,9}(?:沒變|未變|不變|沒搬|不搬|沒有變|沒有搬|沒改|未改|不改|沒有改|沒異動|未異動|沒更動|未更動|沒動|未動)|不是.{0,7}(?:搬會址|變更會址|改登記地址)/;
const actualMove=/會址(?:也)?搬|會址也要搬|登記地址(?:也)?要變|辦公室(?:也)?搬家/;
const industry=n=>law('工業團體法','D0050103',n);
const factoryPart=['工業同業公會：會員工廠的停業、廢業，處理的是會籍','工廠確認廢業，依第14條辦退會；工廠停業滿一年且不能復業時，依第61條由公會報請主管機關轉請目的事業主管機關查復後，才註銷會籍。僅短期停業不因這條就立即註銷。這不是公會自己的會址異動。'];
function factoryMembership(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>160||!/工業同業公會/.test(t)||!/工廠|會員廠/.test(t)||!/會籍|退會|退公會/.test(t)||!/停業|暫停營業|停止營業|廢業|歇業/.test(t)||/協會|商業同業公會|合作社|公會本身|解散|合併|搬址|遷出|補助|改派|理事|監事/.test(t))return null;
 const short=/(?:只(?:是)?|暫時).{0,5}(?:停業|暫停營業|停止營業)(?:了|約|才)?(?:[1-9]|1[01]|[一二兩三四五六七八九十]|十一)個?月/.test(t)&&!/廢業|永久停業|滿一年/.test(t);
 return {direct:true,category:'工業同業公會｜會員工廠會籍',title:'會員工廠短期停業與廢業，會籍處理不同',summary:short?'如果確實只是短期停業、沒有廢業等其他退會事由，不到一年，不因這段停業就直接註銷會籍。':'先確認工廠是停業還是已經廢業；兩者的會籍處理不同，不以口語「歇業」直接判定。',steps:[factoryPart],refs:[industry(14),industry(61)],questionState:{focus:'compound'}};
}
function guildAndVenue(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>220||!/工業同業公會/.test(t)||!/會址異動|會址變更|變更會址|改會址/.test(t)
  ||/商業同業公會|合作社|社員|農會|漁會|工會|股東會|改章程|選舉|投票|合併|名冊|補助|退費|解任|稅|收據/.test(t))return null;
 const clauses=t.split(/[。！？!?；;,，]/).filter(Boolean);
 const a=clauses.findIndex(x=>/協會/.test(x)&&!/工業同業公會/.test(x)&&/大會/.test(x)&&venueChange.test(x)&&(venueAlone.test(x)||unchanged.test(x)));
 const b=clauses.findIndex(x=>/工業同業公會/.test(x)&&/停業|歇業|暫停營業|停止營業|廢業|不辦了|不再運作|停止運作|不運作|解散/.test(x));
 if(a<0||b<0||a===b||actualMove.test(t))return null;
 if(clauses.some((x,i)=>i!==a&&i!==b&&!/^(?:(?:這)?兩件事(?:都)?|(?:那|這)?(?:要|需要|還要|還需要|算)).{0,12}(?:會址異動|會址變更|變更會址|改會址)(?:嗎|呢)?$/.test(x)&&!unchanged.test(x)&&!/^(?:日期|時間|會期)(?:沒變|不變|未變|不改|沒改|沒有變|沒有改)$/.test(x)))return null;
 const guild=clauses[b], factory=/工廠|會員廠/.test(guild)&&!/公會(?:本身|自己)/.test(guild);
 const stop=/公會(?:本身|自己)|公會.{0,4}(?:不辦了|不再運作|不運作|停止運作|解散)/.test(guild)&&!/工廠|會員廠/.test(guild);
 const addressPart=['協會：只換大會場地，不用辦會址變更','前提是協會的登記會址沒變。大會通知應列正確會場；如果已送出舊資料，請更正並通知應出席者。若已將舊會場報送主管機關或請其派員列席，也向原窗口更正；如離開會日很近，請先核對補正或改期，不把原通知直接當作合規。'];

 const stopPart=['工業同業公會：公會本身不運作，不等於會員廠退會','停止會務不等於會址搬遷，也不能據此認定公會已解散。第63條規定主管機關對廢弛會務等情形得依法處分；若已收到處分，請依處分內容辦理。若尚未收到，請依公會層級向第5條的主管機關核對會務、組織狀態及後續程序，不套用會員廠退會或協會的會址備查。'];
 const unknownPart=['工業同業公會：先分清楚是誰停了','「歇業」可能指會員工廠停業或廢業，也可能指公會本身停止運作。兩者都不等於公會變更會址；會址是否變更要另外核對章程會址與實際異動。'];
 const step=factory?factoryPart:stop?stopPart:unknownPart;
 return {direct:true,category:'協會與工業同業公會｜會址分流',title:'協會換開會地點與工業同業公會停業，分開處理',summary:'協會只換會場、登記會址沒變，就不用辦會址變更。'+(factory?'會員工廠停歇業另按會籍處理。':stop?'公會本身停止運作也不等於會址搬遷。':'再確認是會員工廠停業，還是公會本身不運作。'),steps:a<b?[addressPart,step]:[step,addressPart],refs:[address,notice,industry(12),...(factory?[industry(14),industry(61)]:stop?[industry(5),industry(63)]:[])],questionState:{focus:'compound'},...(!factory&&!stop?{choiceHeading:'您說的「歇業」是指哪一方？',choices:[
  {label:'會員工廠停業或廢業',question:'工業同業公會的會員工廠停業或廢業；協會只換大會場地，兩件事都要辦會址變更嗎？'},
  {label:'公會本身不運作或接獲解散處分',question:'工業同業公會本身不運作或接獲解散處分；協會只換大會場地，兩件事都要辦會址變更嗎？'}
 ]}:{})};
}
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(/合作社|社員大會/.test(t)&&t.length<=240){const cooperative=coopRoute(t);if(cooperative)return cooperative;}
 const isAssembly=(/會員(?:代表)?大會|代表大會/.test(t)||(/協會/.test(t)&&venueAlone.test(t)&&/大會/.test(t)))&&!/不是會員(?:代表)?大會/.test(t);
 const isBoard=/理事會|監事會|理監事聯席/.test(t)&&!/不是.{0,3}(?:理事會|監事會)/.test(t);
 const kind=isAssembly&&!isBoard?'assembly':isBoard&&!isAssembly?'board':'unknown';
 if(!t||t.length>240||!/會址|辦公室(?:也)?搬|協會搬家|登記地址|辦公室遷/.test(t)||!venueChange.test(t)||(!isAssembly&&!isBoard&&!/開會|會議|寄給會員|通知.{0,6}寄/.test(t))||/合作社|社員|公會|工會|股東會|宗教團體|立案查詢|名冊|年度決算/.test(t))return null;
 const venueOnly=(unchanged.test(t)||venueAlone.test(t))&&!actualMove.test(t);
 const sameDate=/(?:日期|時間|會期).{0,8}(?:沒變|未變|不變|不改|沒有變|維持)/.test(t)||(venueAlone.test(t)&&!/改期|延期|延後|改日期|改時間|日期也(?:改|延)|會期也改|同時改日期/.test(t));
 const sent=/已(?:向縣府報送|通知會員|發出通知|寄出通知|公告改期|寄發)|已經(?:通知|寄出|寄了)|先前.{0,5}(?:通知|寄出)|原通知.{0,8}(?:已寄|已發)/.test(t);
 const pending=/還沒通知|尚未通知|未寄出|沒寄出|通知還沒寄/.test(t);
 const repeat=/幾次|次數|可以一直延期/.test(t);
 const site=['登記會址異動是獨立程序','人民團體會務輔導辦法第8條：會址設置或異動，先經理事會決議通過，再報主管機關備查。若新址涉及章程原文也要變動，另提大會依法修章，章程變更後依人民團體法第54條在30日內報主管機關核備；不是任何搬家都要修章，也不把30日直接當成會址備查期限。'];
 const room=['只換大會場地，不等於登記會址搬家','登記會址沒變，就不用僅因大會換地方而辦會址異動。改開會地點仍須把正確的時間、地點、會議種類及議程通知應出席者。'];
 const change=['大會改期、換地點，先確定新時間與地點再通知','若一般大會改期，內政部函釋指出，仍應以改定的開會時間守15日前通知應出席者的規定；不是拿原通知當成新日期的通知。若已發出舊通知，應更正並重新通知，保留發送紀錄。未發出者按確認後的正確資料通知。僅因原時地不方便或通知來不及，不當然適用緊急臨時會議例外。'];
 const venueMove=['日期不變，仍應通知新的正確會場','會務輔導辦法第10條要求通知列明正確的開會地點。舊通知若已發出，應以可證明的方式更正並重發給應出席者；若尚未發出，直接用新會場的正確資料通知。一般大會依法原則十五日前通知；若時間已很近，請儘速更正並向主管機關核對補正或改期，不以原通知地址、群組留言或臨時口頭轉告取代。'];
 const county=['原本有報請縣府派員時，另處理縣府端','人民團體法第26條另有報請主管機關派員列席之規定。曾報送舊日期或地點就儘速向原受理窗口更正，確認屏東縣府需要的文件或通報方式；不假定一律重送特定表單，也不以通知會員取代縣府端程序。'];
 const board=['理事會、監事會換時地：一般是七日前通知','依會務輔導辦法第11條，一般理事會或監事會須在七日前把正確時間、地點、種類與議程通知應出席者。已發的舊通知要更正並保留紀錄；只有因緊急事故召開且開會前一日確實送達，才可能適用緊急例外。'];
 const frequency=['改期次數和開會期限是兩件事','不能把查無統一改期次數上限解讀成可以一直拖。人民團體法第25條規定定期會員大會每年召開一次；如果是改選，依法在任期屆滿前一個月內改選，確有困難須申請主管機關核准，延長不得超過三個月。若章程另有更嚴規定，仍要遵守。'];
 const basis=venueOnly?[room]:[site,room];
 const baseRefs=venueOnly?[]:[address,charter];
 const stat=(venueOnly?'登記會址沒變，只換場地，不用辦會址異動。':'登記會址與會議通知分開辦，不能只等會址備查而錯過開會通知。');
 const state=pending?'未發舊通知，就按確定的新時地和期限通知。':sent?'已發舊通知，要以修正後的時地重新通知。':'';
 const suffix=venueOnly?'登記地址沒變，只換開會地點。':'登記會址也要搬。';
 const status=pending?'通知還沒寄出。':sent?'通知已經寄出。':'';
 return {direct:true,category:'人民團體會務｜會址與會議異動',title:kind==='assembly'?(sameDate?'日期不變只換會場，仍要更正開會通知':'登記會址變更和大會改期，分兩件事辦'):kind==='board'?'登記會址變更和理事會或監事會改期，分兩件事辦':'先分辨登記會址與會議地點，再選會議類型',summary:stat+(sameDate&&kind==='assembly'?' 原通知有舊會場而且已發出，應更正並重發。':'')+state+(kind==='unknown'?' 會議類型還不確定，先選會員大會或理事會／監事會。':''),steps:kind==='assembly'?[...basis,sameDate?venueMove:change,county,...(repeat?[frequency]:[])]:kind==='board'?[...basis,board]:basis,refs:kind==='assembly'?[...baseRefs,notice,members,advice,...(repeat?[annual,elections]:[])]:kind==='board'?[...baseRefs,law('人民團體會務輔導辦法','D0020094',11)]:baseRefs,questionState:{focus:'compound'},...(kind==='unknown'?{choiceHeading:'要改期的是哪一種會議？',choices:[{label:'會員（代表）大會',question:'協會會員大會要改期。'+suffix+status},{label:'理事會或監事會',question:'協會理事會或監事會要改期。'+suffix+status}]}:{})};

}
if(typeof module!=='undefined'&&module.exports){module.exports={route,guildAndVenue,factoryMembership};return;}
root.verifiedAssociationAddressMeetingChange=route;
root.verifiedGuildAndAssociationVenue=guildAndVenue;
root.verifiedIndustrialFactoryMembership=factoryMembership;
})(typeof window!=='undefined'?window:globalThis);
