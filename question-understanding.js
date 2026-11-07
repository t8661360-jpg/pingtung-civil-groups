/* Focused, source-backed answers. No keyword score may replace a known question focus. */
(function(root){
 'use strict';
 const source=(code,name,number)=>({title:name+'第'+number+'條',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+code});
 const P=n=>source('D0050091','人民團體法',n),E=n=>source('D0050093','人民團體選舉罷免辦法',n),C=n=>source('D0050112','合作社法',n),CE=n=>source('D0050022','合作社選舉罷免辦法',n),G=n=>source('D0020094','人民團體會務輔導辦法',n);
 function understand(input,prior=null){
  let q=String(input||'').normalize('NFKC').replace(/\s+/g,'');
  if(prior&&prior.focus==='notice'){
   if(/^(?:\u90a3|\u90a3\u9ebc|\u90a3\u8acb\u554f)?(?:\u7406\u4e8b\u6703|\u76e3\u4e8b\u6703|\u7406\u76e3\u4e8b\u6703)(?:\u5462|\u5462\u003f|\u5982\u4f55|\u662f\u5462)[?]?$/u.test(q))return {...prior,board:true};
   if(/^(?:\u90a3|\u90a3\u9ebc|\u90a3\u8acb\u554f)?(?:\u6703\u54e1\u5927\u6703|\u793e\u54e1\u5927\u6703)(?:\u5462|\u5982\u4f55|\u662f\u5462)[?]?$/u.test(q))return {...prior,board:false};
  }
  if(prior&&/^(那|如果|所以|可以|最多|最長|多久|幾天|合作社呢|協會呢)/.test(q)&&!/工會|公會|信用合作社|成立|解散|財務|統編|第[\d一二三四五六七八九十百-]+條/.test(q)){
   const domain=/合作社/.test(q)?'coop':/協會/.test(q)?'social':prior.domain;
   if(/^(那|如果是|所以)?(合作社|協會)呢[?？]?$/.test(q))return{...prior,domain};
   if(!/改選|任期|理事長|會員大會|社員大會|理監事|理事會|監事會/.test(q)){
    const anchor={'election-window':'改選',extension:'改選',process:'改選',notice:prior.board?'理事會通知':domain==='coop'?'社員大會通知':'會員大會通知','term-length':'理監事任期',reelection:prior.chair?'理事長連任':'理監事連任','meeting-frequency':'理監事會'}[prior.focus];
    if(anchor)q=(domain==='coop'?'合作社':'一般協會')+anchor+q;
   }
  }
  if(/第[\d一二三四五六七八九十百-]+條/.test(q))return{focus:'article',domain:'explicit'};
  if(/信用合作社|工會|公會|商業團體|工業團體/.test(q))return{focus:'special-law',domain:'special'};
  const coop=/合作社|理事主席|理事會主席|社員/.test(q);
  const domain=coop&&/協會|人民團體|社會團體/.test(q)?'mixed':coop?'coop':'social';
  const election=/改選|選舉|選理事|選監事|換屆/.test(q),term=/任期|任滿|到期|屆滿|屆期|期滿|當幾年|做幾年|一屆|每屆/.test(q);
  const timing=/多久|多早|何時|什麼時候|幾天|幾個月|多少|以前|之前|提前|期限|最晚|前要|前改選|後改選/.test(q);
  if(/通知|寄發|發通知/.test(q)&&/大會|會員|社員|理事會|監事會|改選|選舉|開會/.test(q))return{focus:'notice',domain,board:/理事會|監事會|理監事會/.test(q)};
  if(/連任|連選|幾屆|兩屆/.test(q))return{focus:'reelection',domain,chair:/理事長|主席/.test(q)};
  if(/起算|開始算|從.*算/.test(q)&&term)return{focus:'term-start',domain};
  if(/辭職|出缺|過世|死亡|補選|代理/.test(q)&&/理事長|理事|監事|主席|理監事/.test(q))return{focus:'vacancy',domain,chair:/理事長|主席|常務/.test(q)};
  if(/不改選|沒改選|未改選|未辦.*改選|過期|逾期/.test(q)&&/怎樣|怎麼辦|處理|任期|到期|屆滿|超過|過期|逾期/.test(q))return{focus:'overdue',domain};
  if(/延長|延期|延任|延後|來不及|趕不及/.test(q)&&(election||term))return{focus:'extension',domain};
  if(/改選完|改選後|選後/.test(q)&&/多久|幾天|期限|最晚/.test(q)&&/送|報|備查|縣府|資料|文件/.test(q))return{focus:'report-deadline',domain};
  if(/幾年.*改選|改選.*幾年/.test(q))return{focus:'term-length',domain};
  if((election||term)&&/流程|審查|核准|辦完|辦好|處理/.test(q)&&/多久|幾天|幾個月/.test(q))return{focus:'duration',domain};
  if((election&&(timing||/屆滿|屆期|期滿|任滿|到期/.test(q)))||(term&&/屆滿|屆期|期滿|任滿|到期/.test(q)&&timing))return{focus:'election-window',domain};
  if(term&&/多久|多長|幾年|幾個月|上限|最長/.test(q))return{focus:'term-length',domain};
  if(/理事會|監事會|理監事會/.test(q)&&/多久|幾次|幾個月|頻率|每年|半年|三個月/.test(q))return{focus:'meeting-frequency',domain};
  if(/大會/.test(q)&&/多久|幾次|頻率|每年|一年/.test(q))return{focus:'assembly-frequency',domain};
  if(election&&/文件|資料|應備|送什麼|送哪些|帶什麼|準備哪些|要備/.test(q))return{focus:'documents',domain};
  if(election)return{focus:'process',domain};
  return{focus:'other',domain};
 }
 function resolve(input,context={}){
  const state=understand(input,context.prior),{focus,domain}=state;
  if(['article','special-law','other'].includes(focus))return null;
  const coop=domain==='coop';
  const answer=(title,summary,statutes=[],notes=[])=>({category:coop?'合作社會務說明':'人民團體會務說明',title,summary,statutes,notes,focus,questionState:state,actions:[{label:'查看相關法規',view:'law',sub:coop?'合作社':'人民團體'},{label:'下載對應書表',view:'forms',sub:coop?'合作社':'改選'}]});
  if(domain==='mixed')return answer('協會與合作社要分別適用規定','一般協會與合作社不能只因職稱相似，就套用同一套任期及選務規則。\n一般人民團體理監事任期最長四年，合作社理監事最長三年；會員大會一般十五日前通知，合作社社員大會一般七日前通知。\n如果您問的是改選期限，一般人民團體適用屆滿前一個月內改選的規定；合作社則須另核對合作社法、選舉罷免辦法及章程。',[P(20),C(33)]);
  if(focus==='overdue')return answer('任期已到但未改選：請儘速洽主管機關處理',coop?'合作社任期已到仍未改選，不能直接套用一般協會的延期規定。請提供合作社章程、任期及原定選舉安排，儘速向主管機關確認處理方式。':'一般人民團體原應於任期屆滿前一個月內改選。未完成改選，不等於可以自行無限期延任。\n確有困難而要延期，須申請主管機關核准，法定延長期限不得超過三個月。已經逾期時，請儘速說明原因、任期及預定改選日期，洽主管機關處理。',coop?[C(33)]:[E(21)]);
  if(focus==='report-deadline')return answer('改選後的報送期限：先核對本次應報事項','您問的是改選後多久要報送，不是改選日期或寄通知的期限。\n報送期限應依團體類型、應報事項及承辦機關函文確認；請提供主管機關通知或團體類型，才能核對確切天數。\n例如一般人民團體選出理監事後，第一次理事會、監事會另有召開期間規定，但那不是所有改選文件通用的報送期限。',coop?[]:[E(12)]);
  if(focus==='election-window'||focus==='extension'){
   if(coop)return answer('合作社改選時程要另外確認','合作社不能直接套用一般協會「屆滿前一個月內改選」的規定。\n合作社選任人員任期屆滿三個月前，理事會應成立社員社籍清查小組；選舉日至少七日前，應完成選舉公告及書面通知。這兩個期限分別是準備及通知期限，不是通用的改選日或自動延期期間。\n請提供合作社種類、章程任期及屆滿日期，再依適用規定確認改選安排；需要延期時，請先洽主管機關確認。',[CE(11),CE(18)]);
   return answer(focus==='extension'?'改選需要延期：先申請核准，最長三個月':'改選時間：任期屆滿前一個月內','如果您問的是一般協會／適用人民團體選舉罷免辦法的團體，理事、監事應在任期屆滿前一個月內辦理改選。理事長的改選也應配合理監事換屆及章程安排。\n白話說，就是在任期到期前的最後一個月內辦理，不是「至少提前一個月以前完成」，也不是等任期過了才開始準備。\n確有困難時，須申請主管機關核准延長，延長期限不得超過三個月；不能自行決定延任。\n改選日期與寄發開會通知的期限是兩件事。準備工作可以提早安排，會員大會原則上還要在開會十五日前通知會員。',[E(21)],['合作社、工會及各種公會可能適用不同規定；若不是一般協會，請先告訴我團體類型。']);
  }
  if(focus==='notice'){
   if(coop&&state.board)return answer('合作社理監事會通知：先核對章程及會議種類','如果是合作社的一般理事會或監事會，請先核對章程及本次會議種類，不能把社員大會或選舉日的七日前通知，當成所有理監事會一律適用的規定。\n若本次是選舉會議，則另須依選舉罷免辦法核對公告及通知。',[CE(18)]);
   if(coop)return answer('合作社開會／選舉通知：原則上七日前','合作社社員大會應在七日前，以書面載明召集事由及提議事項通知社員。\n如是選舉，合作社還應於選舉日七日前公告選舉種類、時間、地點、名額及方式，書面通知應出席人員，並報主管機關備查。\n這是通知期限，不是任期屆滿改選的期限。',[C(46),CE(18)]);
   if(state.board)return answer('理事會、監事會：原則上七日前通知','一般人民團體的理事會、監事會及理監事聯席會議，應於七日前將會議種類、時間、地點及議程通知應出席人員。\n因緊急事故召開臨時會議時，通知在開會前一日送達者，才有例外。',[G(11)]);
   return answer('會員大會：原則上十五日前通知','一般人民團體召開會員或會員代表大會，應在十五日前通知各會員或會員代表。\n只有因緊急事故召開臨時會議，且在開會前一日送達通知時，才有例外。不能因為來不及改選，就一律改用一天前通知。',[P(26)]);
  }
  if(focus==='term-length')return coop?answer('合作社理監事任期：最長三年','合作社理事、監事每屆任期不得超過三年；實際任期請看該社章程。不是所有合作社都固定三年，也不能直接套用一般協會的四年上限。',[C(33)]):answer('一般協會理監事任期：最長四年','一般人民團體理事、監事的每屆任期不得超過四年，實際幾年要看章程。\n「一屆幾年」和「可以連任幾次」是不同問題。理事長連任另有一次的限制。',[P(20)]);
  if(focus==='reelection'){
   if(coop)return answer('合作社連任要依合作社法及章程確認','合作社理事、監事每屆任期最長三年；除法律或章程另有規定外，連選得連任。\n若問的是理事會主席或監事會主席，還要核對職務及章程規定，不能直接套用一般協會理事長的連任限制。',[C(33)]);
   return state.chair?answer('一般協會理事長：連任以一次為限','一般人民團體理事長的連任以一次為限，也就是當選一屆後，最多再連續當選一屆。這是連任限制，不是終身只能擔任兩屆。\n每屆任期及其他資格限制，仍須核對法律與章程。',[P(20)]):answer('一般協會理事、監事：原則上連選得連任','現行人民團體法規定，理事、監事除法律另有規定或章程另有限制外，連選得連任。不能再一律套用「連任理監事不得超過二分之一」的舊說法。\n理事長則另外受到連任一次的限制，兩者要分開看。',[P(20)]);
  }
  if(focus==='term-start')return coop?answer('合作社任期起算：請核對章程與登記資料','合作社的任期起算，請提供章程及本屆選舉、就任日期核對。不能直接把人民團體的第一次理事會起算規定套用到合作社。',[C(33)]):answer('一般人民團體任期：從本屆第一次理事會起算','理事、監事任期原則上從召開本屆第一次理事會的日期開始計算，不是單看會員大會選舉日。\n國際性社會團體章程另有規定，並經主管機關核准者，有例外。',[E(28)]);
  if(focus==='vacancy'){
   if(coop)return answer(state.chair?'合作社主席出缺：原則上一個月內補選':'合作社理事、監事出缺：先依序遞補',state.chair?'合作社理事會主席、監事會主席出缺時，應自出缺日起一個月內分別召開理事會、監事會補選；所遺任期未滿六個月時，得分別互推一人代理。':'合作社一般理事或監事出缺，先由候補人員依序遞補；遞補後仍不足章程名額半數時，應召開社員大會或社員代表大會補選。',[CE(7)]);
   return answer(state.chair?'理事長出缺：原則上一個月內補選':'理事、監事出缺：先依序遞補',state.chair?'理事長、常務理事或監事會召集人出缺時，應自出缺日起一個月內補選。\n理事長所遺任期不足六個月時，可於出缺日起一個月內，依章程規定或由常務理事互推一人代理；沒有常務理事時，由理事互推代理。\n這與任期屆滿的改選不同。':'一般理事、監事出缺先由候補者依序遞補；遞補後不足章程名額三分之二時，應補選足額。理事長出缺的處理方式另有規定。',[E(17)]);
  }
  if(focus==='meeting-frequency')return coop?answer('合作社理事會、監事會：每三個月至少一次','合作社理事會、監事會每三個月至少召開一次；社務會每六個月至少一次。\n會議種類不同，頻率也不同；實際安排還要核對章程。',[C(45)]):answer('一般人民團體：理事會、監事會每三個月至少一次','如果是一般人民團體或協會，理事會、監事會每三個月至少舉行一次；章程若訂得更頻繁，也要照章程辦。\n這是開會頻率，與七日前寄發理監事會通知是不同期限。職業團體、公會等另依適用法律確認。',[P(29)]);
  if(focus==='assembly-frequency')return coop?answer('合作社社員大會：每年至少一次','合作社社員大會每年至少召開一次。這是會議頻率；召集通知則應另依通知期限辦理。',[C(45)]):answer('一般協會會員大會：定期會議每年一次','一般人民團體的會員或會員代表大會，定期會議每年召開一次；有法定事由時，另得召開臨時會議。\n每年開一次定期大會，不代表每年都必須改選；是否改選，要看本屆任期是否屆滿。',[P(25)]);
  if(focus==='duration')return answer('改選整體需要多久：沒有一律固定的總天數','整個改選作業多久能完成，要看會員資格整理、通知、選舉及會後作業，不能只用一個固定天數回答。\n'+(coop?'合作社應另核對社籍清查、公告及通知時程。':'一般協會的改選仍應排在任期屆滿前一個月內，會員大會原則上要十五日前通知。'),coop?[CE(11),CE(18)]:[E(21),P(26)]);
  if(focus==='documents'){
   if(coop)return answer('合作社改選文件：使用合作社書表','合作社應依選舉方式準備社員或社員代表名冊、選舉公告、通知、簽到、選票、會議紀錄及相關理監事資料。實際送件清單及份數，請使用合作社書表並核對承辦人要求。\n不要直接套用一般協會的改選文件。',[CE(18),CE(29)]);
   return {...answer('一般協會改選：要準備哪些文件','這題問的是文件，請先看下方應備清單；送件份數及本次特殊要求，再依承辦人提供的書表核對。',[]),docs:context.electionDocuments||[],actions:[{label:'下載改選書表',view:'forms',sub:'改選'},{label:'看完整改選流程',view:'meet',sub:'m-elect'}]};
  }
  // Existing procedural guides remain responsible for how-to questions.
  return null;
 }
 const api={understand,resolve};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CounterQuestions=api;
})(typeof window!=='undefined'?window:globalThis);

