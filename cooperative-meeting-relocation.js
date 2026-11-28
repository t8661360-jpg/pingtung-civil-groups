(function(root){
'use strict';
const ref=(title,p)=>({title,source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+p});
const c=ref('合作社法第36、45、46、48、50條','D0050112');
const cRules=ref('合作社法施行細則第12-1、13條','D0050113');
const elect=ref('合作社選舉罷免辦法第11–18、29條','D0050022');
const a=ref('人民團體法第26條及第42條','D0050091');
const aRules=ref('人民團體會務輔導辦法第10–12條','D0020094');
const opt={
  ca:['合作社社員（代表）大會','確認合作社社員代表大會改通知'],
  cb:['合作社理事會／監事會','確認合作社理監事會改通知'],
  aa:['協會會員（代表）大會','確認協會會員代表大會改通知'],
  ab:['協會理事會／監事會','確認協會理監事會改通知'],
  same:['日期不變，只換會場','確認日期不變只換會場'],
  shift:['開會日期也變了','確認開會日期也變了']
};
const picks=keys=>keys.map(k=>({label:opt[k][0],question:opt[k][1]}));
const norm=q=>String(q??'').normalize('NFKC').replace(/\s+/g,'');
const venue=/換(?:到|了|成|個|新|小|大|別的|另一(?:個)?)?(?:教室|會館|會場|場地|地點|空間|理事會議室|會議室)|改(?:開會)?(?:會場|地點|場地)|只改(?:開會)?(?:場地|地點|會場)|換場地|(?:場地|會場|地點|活動中心).{0,8}(?:借不到|取消|改到|更改|換|不能用|不一樣|不同|沒空)|改到別的會館|改地方|改到另一館/;
const late=/已(?:經)?(?:發|寄|通知|報)|原(?:本|訂)?.{0,4}寄過|通知(?:和公告)?都發|原通知|書面通知發了|之前公告|有公告|縣府.{0,4}收過/;
const gate=/社員(?:代表)?大會|會員(?:代表)?大會|理事會|監事會|理監事會|開會|會議|通知|公告/;
function parse(q,prior){
  const raw=norm(q);
  if(!raw||raw.length>530||/^新題/.test(raw)||/信用合作社|信合社|工會|公會|農會|漁會|選舉公職|家長會|區權會|股東會|財團法人/.test(raw))return null;
  const key=Object.keys(opt).find(k=>opt[k][1]===raw);
  if(key){
    const h=prior||{};
    if(key==='same'||key==='shift')return {...h,change:key};
    return {...h,org:key[0],kind:key.slice(1)==='a'?'assembly':'board'};
  }
  const corr=!!prior&&/^(?:更正|補充|其實|剛剛說錯)/.test(raw)&&/日子|日期|改期|理事會|監事會|社員|會員|改選|會場|教室/.test(raw);
  const t=raw.replace(/(?:不是|並非|不問|不是要問)(?:一般|普通)?(?:社員(?:代表)?大會|會員(?:代表)?大會|合作社|協會)/g,'');
  const pre=/((?:還|尚)?沒(?:有)?(?:發|寄)(?:出)?(?:通知|公告)|(?:通知|公告).{0,3}(?:還沒|尚未)發)/.test(t);
  const earlier=!pre&&late.test(t);
  const hasVenue=venue.test(t);
  const same=/日期.{0,6}(?:沒有改|沒改|不改|不變|未變|照舊|照原|一樣|維持)|日子不變|那天不變|同天|同一天|同(?:一)?日|同日|日期一樣|不(?:要)?延期|沒(?:有)?改期|沒有要延期|只(?:是)?(?:把|將)?(?:換|改).{0,6}(?:地點|教室|會場|場地)|照原日期|只.{0,6}地點不一樣/.test(t);
  const tDate=t.replace(/(?:沒(?:有)?|不(?:是|會)?|不必|不用)(?:要)?(?:改期|延期|延後)/g,'');
  const shift=/改期|延期|延後|順延|改到.{0,6}(?:下個月|下月|兩個月後|下週|下周|下星期)|換日期|日期也(?:改|換|變)/.test(tDate);
  const relevant=gate.test(t)&&(hasVenue||shift||/通知.{0,12}(?:要改|更正)|改.{0,7}公告/.test(t));
  if(!relevant&&!corr)return null;
  const co=/合作社|社員(?:代表)?大會/.test(t), assoc=/協會|社會團體|人民團體|會員(?:代表)?大會/.test(t);
  if(co&&assoc&&!/合作社.{0,20}(?:不比照|不套|不是協會)/.test(raw))return null;
  let org=co?'c':assoc?'a':corr?prior.org:null;
  const hasAssembly=/社員(?:代表)?大會|會員(?:代表)?大會/.test(t);
  const hasBoard=/理事會|監事會|理監事會/.test(t);
  const kind=hasAssembly?'assembly':hasBoard?'board':corr?prior.kind:null;
  if(org==='a'&&!corr)return null; // Keep existing association-specific routing.
  const neg=/沒(?:有)?(?:要|辦|做)?(?:改選|選舉)|不改選|不辦選舉/.test(t);
  const election=!neg&&/(?:改選|補選|選(?:出|舉)?理(?:事)?[、與和及]?監事|選舉公告|候選(?:人|登記)|選務)/.test(t);
  const proxy=/委託書|代理書|原委託|代理人|代為出席/.test(t);
  const oldProxy=proxy&&/舊(?:日期|日子|日|時|地點)|原(?:定)?日期.{0,7}(?:委託|代理)|只填舊|寫舊日期|僅限舊/.test(t);
  const dateOnly=proxy&&/只寫(?:這一天|日期|同一天)|只載日期/.test(t);
  const authority=/主管機關|報縣府|縣政府|縣府|報備|報請|備查/.test(t);
  const finance=/決算|年度財務|財報|財務審核/.test(t);
  const term=/任期|屆滿|候選.{0,5}登記|候選資格/.test(t);
  const exceptional=/連署.{0,8}(?:理事|監事|開會)|(?:理事|監事).{0,5}連署|主席不召集|主席未召集/.test(t);
  const existing=earlier||corr&&prior.existing&&!pre;
  const change=shift?'shift':same?'same':corr&&prior.change&&hasVenue?prior.change:null;
  if(!org&&(!hasVenue&&!/只.{0,6}地點/.test(t)||/婚禮|門診|個人面試|學校課程|活動取消/.test(t)))return null;
  if(org==='c'&&!kind&&!hasVenue)return null;
  if(!org&&/原定|只|重[發寄]|重新通知|要改/.test(t)===false)return null;
  return {org,kind,change,hasVenue,pre,existing,election,proxy,oldProxy,dateOnly,authority,finance,term,exceptional};
}
function route(q,prior){
  const x=parse(q,prior);if(!x)return null;
  const answer=(title,summary,steps,refs,choiceHeading,keys)=>({direct:true,title,category:x.org==='a'?'協會會議｜更正通知':'合作社會議｜改期及更正通知',summary,steps,refs,coopMeetingRelocationContext:x,questionState:{focus:keys?'clarify':'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}],...(keys?{choiceHeading,choices:picks(keys)}:{})});
  if(!x.org||!x.kind){
    const keys=x.org==='c'?['ca','cb']:x.org==='a'?['aa','ab']:['ca','cb','aa','ab'];
    return answer('先確認是哪個團體、哪種會議','已發的通知若地點不對，先通知每位應出席的人並留更正紀錄。確切期限與是否要公告或報備，依團體及會議種類判斷，不用重新輸入已給的資料。',[],[], '請選原本要開的會議',keys);
  }
  const coop=x.org==='c', board=x.kind==='board';
  const kind=coop?(board?'合作社理事會／監事會':'合作社社員（代表）大會'):(board?'協會理事會／監事會':'協會會員（代表）大會');
  const notice=coop?(board?'一般理事會、監事會的通知方式與期限，查該社章程及適用的會議類型，不套社員大會的七日前，也不套協會的規定。':'合作社法第46條：社員大會由理事會召集，應在開會七日前書面載明召集事由及提議事項通知社員。寫上實際日期、時間及會場，便於應出席者到場。'):
    board?'依人民團體會務輔導辦法第11條，通常應在七日前通知會議種類、時間、地點與議程。緊急事故召集臨時會議才另看一日前送達的例外。':'依人民團體法第26條及會務輔導辦法第10條，通常應在十五日前通知會議種類、時間、地點與議程，並報請主管機關派員列席；緊急事故臨時會議才另看一日前送達的例外。';
  const steps=[['正確的日期、時間及會場要讓所有應出席者知道',notice+
    (x.pre?'通知還沒發，用新會場製作正式通知；議案不變就不用只為換場地而改議案，附件中的地點也同步修正。':x.existing?'通知已發就書面更正、註明哪份通知被取代，保留寄送、收悉及追蹤紀錄。不只改網站或留群組訊息，尤其有理監事沒收到簡訊時要另行聯絡，並依章程用合適方式通知。':'先核對正式通知是否發出；已發則補書面更正及留證，未發用正確資訊製作。')]];
  const refs=coop?[c]:[a,aRules];
  if(x.change==='shift')steps.push(['日期也改了：按新日期重排通知與會議','舊日通知不要直接沿用。由有權召集者決定新日期及會場，向應出席者說明原會議取消或延期，並按本類會議適用期限發新通知。原時間不夠，不要靠臨時換名目或把現在日期填回舊通知來補。']);
  if(x.change==='same'||x.hasVenue)steps.push(['只改會場，不等於正式地址搬遷','只換教室、場地而原登記地址沒搬，不因這一場會議就變更社址／會址。若日期不變且先前已通知，立即有效更正；查到的通則沒有對所有「只換會場」情形訂一律重算的期限。時間很近時，依章程和適用規定問原主管機關能否補正或須改期。']);
  if(coop&&x.election){
    steps.push(['改選另有公告、書面通知與備查三件事','合作社選舉罷免辦法第18條：按實際選舉日七日前公告選舉種類、時間、地點、應選與候補名額、選法，分別書面通知應出席者，並報請主管機關備查。採登記候選須公告候選人名單。公告及備查資料已有舊日期或舊場地時，讓原受理機關收到更正版本；時間不足或選務已進行，先確認如何補正或改期，不用一則群組訊息替代法定選務。']);
    refs.push(elect);
  }
  if(coop&&x.election&&x.term)steps.push(['候選資格、任期和會議日期分開核對','先列出本屆任期、社籍清查與公告、候選登記和資格審查進度，以及原定和擬改日期。提早持資料向原主管機關確認哪些選務須補做；改日期不是當然延任，也不能假設全部候選或公告資料有效或全部作廢。']);
  if(x.proxy){
    steps.push(['舊委託書看授權範圍，不能代填或擅改日期',coop?
    (x.oldProxy?'只授權舊日期的原件，不直接拿到新日期使用；請委託本人依最新通知另作正確書面委託。':x.dateOnly?'如果只寫同一會議日期且日期未改，也沒限制地點，換會場不等於一律作廢；仍核對章程、委託範圍、委託有無撤回。':'查委託書是否限定日期或會場；若原件只限已更改的日期或地點，請本人重作書面委託。')+'依合作社法第50條，社員不能出席社員大會可書面委託其他社員，每名受託人最多代理一人；如兼辦選舉，另依選務規則與章程核對。':
    '會員大會的書面代理依人民團體法第42條及章程；舊日期或場地若是授權限制，由委託人重作，不擅改。這不是理事會、監事會可找他人代出席的依據。']);
  }
  if(coop&&x.finance)steps.push(['決算另排監事會審核，不因改選或改期省略','依合作社法第36條，年度財務書類由理事會製作，原則至少於社員大會開會十日前送監事會審核，再提社員大會承認；臨時社員大會例外另核，不能只為趕期限自行套用。承認後一個月內書面報主管機關備查。']);
  if(x.authority||coop&&board){
   if(coop&&board){steps.push(['一般會議更正與連署召集的報備不一樣','先看章程、原通知及是否有主管機關列席或原來已送件。不是每場理事會只換教室都一律要報縣府；若是依合作社法施行細則第13條連署召集或過期自行召集，依法處理書面通知、雙掛號及備查，已送舊資訊就同步更新。']);refs.push(cRules);}
   else if(!coop&&!board)steps.push(['原先已報請派員的會議資料，也更新','向原受理機關更正日期或地點；不能只告知機關卻未通知應出席者。']);
   else if(coop&&!x.election)steps.push(['已送原會議資料就同步更正','通知原收件窗口更新，是否另需正式公文、派員或附件依章程及實際會議種類向該機關確認；不要把改選的備查條文當所有大會的同一規則。']);
  }
  if(!x.change)return answer(kind+'｜先確認是否也改日期','若會場已換，現在就可準備更正通知。日期有變時要按新日期重排；請確認，是只有地點變，還是日期也變？',steps,refs,'日期要不要改？',['same','shift']);
  return answer(kind+(x.change==='shift'?'改期：依新日期重排':'日期不變：重點是正確通知新會場'),x.change==='shift'?'召集與通知按新日期處理。若還辦理改選、決算或有舊委託書，分別按下列程序核對。':'只更換會場但日期不變，先讓每位應出席者確實收到正確地點；有選舉時，公告與主管機關備查也要核對。',steps,refs);
}
if(typeof module==='object'&&module.exports)module.exports={route};else root.verifiedCooperativeMeetingRelocation=route;
})(typeof window==='object'?window:globalThis);
