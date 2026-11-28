(function(root){
'use strict';
const art=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const p=n=>art('人民團體法','D0050091',n),g=n=>art('人民團體會務輔導辦法','D0020094',n);
const moi={title:'內政部台內社字第8735076號函：大會延期、委託書與代表變更',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=220065'};
const zh='零〇一二三四五六七八九十';
const unit='[0-9'+zh+']{1,3}';
const datePiece=new RegExp('(?:(今年|明年|次年|下年|(?:民國)?[0-9]{2,4}年))?('+unit+')月(?:('+unit+')(?:日|號))?');
const slashDate=/(\d{2,4})[\/-](\d{1,2})[\/-](\d{1,2})/g;
const dayReply=new RegExp('^(?:新(?:會議)?日期(?:是|為)?[：:]?)?(?:(?:今年|明年|次年|下年|(?:民國)?[0-9]{2,4}年)?'+unit+'月)?'+unit+'(?:日|號)[。！!？?]?$|^(?:新(?:會議)?日期(?:是|為)?[：:]?)?(?:[0-9]{2,4}[\/-])?[0-9]{1,2}[\/-][0-9]{1,2}[。！!？?]?$');
function isDateReply(q){return dayReply.test(String(q??'').normalize('NFKC').replace(/\s/g,''));}
function num(s){
 if(/^\d+$/.test(s||''))return Number(s);
 const m=String(s??'').match(/^([一二三四五六七八九])?十([一二三四五六七八九])?$/);
 if(m)return (m[1]?zh.indexOf(m[1])-1:1)*10+(m[2]?zh.indexOf(m[2])-1:0);
 return s&&s.length===1?zh.indexOf(s)-1:NaN;
}
const localYear=()=>Number(new Intl.DateTimeFormat('en',{year:'numeric',timeZone:'Asia/Taipei'}).format(new Date()));
function resolveDate(w,month,day,year){
 let y=year;
 if(/明年|次年|下年/.test(w||''))y=year+1;
 else if(w&&/\d/.test(w)){let n=Number(w.match(/\d+/)[0]); y=n<1911?n+1911:n;}
 const m=num(month),d=num(day);
 if(y<1912||y>2300||m<1||m>12||d<1||d>31||!Number.isFinite(m)||!Number.isFinite(d))return null;
 const v=new Date(Date.UTC(y,m-1,d));
 if(v.getUTCMonth()!==m-1||v.getUTCDate()!==d)return null;
 return {y,m,d,v};
}
function findNewDate(t,year){
 const mark=/新(?:會議)?日期(?:是|為)?|新會議(?:是|在|改為)|改(?:到|為|成)|(?:延|挪)(?:期)?到/;
 const f=t.split('續問日期:'),raw=f[0],follow=f[1]||'';
 const span=raw.match(mark);let area=span?raw.slice(span.index+span[0].length):'';
 if(!area&&/跨年|明年|次年/.test(raw)){const z=raw.match(/(?:明年|次年|下年)/);if(z)area=raw.slice(z.index);}
 const date=area.match(datePiece), iso=[...area.matchAll(slashDate)][0];
 const yearToken=date?.[1]||(/明年|次年/.test(raw)?'明年':'今年');
 if(follow){const a=follow.match(datePiece),i=[...follow.matchAll(slashDate)][0],n=follow.match(new RegExp('('+unit+')(?:日|號)'));
  const short=follow.match(/^(\d{1,2})[/-](\d{1,2})$/);
  if(i)return resolveDate(i[1],i[2],i[3],year);
  if(a?.[3])return resolveDate(a[1]||yearToken,a[2],a[3],year);
  if(short)return resolveDate(yearToken,short[1],short[2],year);
  if(n&&date?.[2])return resolveDate(yearToken,date[2],n[1],year);
 }
 if(iso&&(!date||iso.index<date.index))return resolveDate(iso[1],iso[2],iso[3],year);
 return date?.[3]?resolveDate(yearToken,date[2],date[3],year):null;
}
function dateLabel(v){return v.getUTCFullYear()+'年'+(v.getUTCMonth()+1)+'月'+v.getUTCDate()+'日';}
const yearFaq={title:'內政部：不能如期召開會員大會的處理',source:'https://www.moi.gov.tw/News_toggle3.aspx?PageSize=30&_CSN=1633&n=8361&page=1&sms=9015'};
const e=n=>art('人民團體選舉罷免辦法','D0050093',n);
const mDate='(?:今年|民國[0-9]{2,3}年|[0-9]{4}年)?'+unit+'月'+unit+'(?:日|號)';
const shortCalendar='[0-9]{1,2}[/-][0-9]{1,2}';
const fullCalendar='(?:[0-9]{2,4}[/-])?'+shortCalendar;
const freshCalendar=new RegExp('(?:新(?:會議)?日期(?:是|為)?[：:]?|改(?:到|為|成|在)?|延(?:期)?(?:到|至)|挪到|換到)('+mDate+'|'+fullCalendar+')(?![0-9/])');
function calendar(s,year){
 const cleaned=String(s||'').replace(/^(?:新(?:會議)?日期(?:是|為)?[：:]?)/,'').replace(/[。！!？?]$/,'');
 const date=cleaned.match(new RegExp('^'+datePiece.source+'$'));
 if(date?.[3])return resolveDate(date[1],date[2],date[3],year);
 const sl=cleaned.match(/^(?:(\d{2,4})[/-])?(\d{1,2})[/-](\d{1,2})$/);
 return sl?resolveDate(sl[1],sl[2],sl[3],year):null;
}
function onlyRoutineBoardNotice(t){
 if(!/協會|人民團體|社會團體/.test(t)||!/例行|定期/.test(t)||!/(?:理監事聯席會|理監事會|理事會|監事會)/.test(t)||!/(?:不是|沒有|不開|不用開)(?:要開)?會員(?:代表)?大會/.test(t)||!/(?:提前|幾天|幾日|多久|何時|什麼時候).{0,10}(?:通知|寄|發)/.test(t)||/合作社|公會|工會|農會|漁會|改選|臨時會|第.{1,3}次|修章|罷免|除名/.test(t))return null;
 const kind=/理監事聯席會|理監事會/.test(t)?'理監事聯席會議':/監事會/.test(t)?'監事會':'理事會';
 return {direct:true,category:'協會會務｜例行會議通知',title:kind+'：七日前通知',summary:'您問的是'+kind+'，不是會員大會。例行會議應於七日前把種類、時間、地點、議程通知應出席人員。',steps:[['按會議類型決定召集人',kind==='理監事聯席會議'?'須由理事長及監事會召集人（常務監事）分別同意後召集。':kind==='監事會'?'由監事會召集人（常務監事）召集。':'由理事長召集。']],refs:[g(11),g(13)],questionState:{focus:'single'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function sameYearPlan(t,year){
 const [body,follow]=t.split('續問日期:');
 if(!/協會|人民團體|社會團體/.test(body)||!/會員(?:代表)?大會|協會.{0,18}大會/.test(body)||/跨年|明年|次年|下年|成立大會|合作社|股東|公會|工會|農會|漁會|財團法人|除名|罷免|不動產|臨時(?:會員(?:代表)?)?大會|緊急臨時/.test(body))return null;
 const negAssembly=/(?:不是|沒有|不用開|不開)(?:要開)?(?:會員(?:代表)?)?大會/;
 if(negAssembly.test(body))return null;
 if(!/改期|延期|延後|取消|延至|颱風/.test(body)&&!freshCalendar.test(body))return null;
 const wantsProxy=/委託書|原.{0,7}委託|委託出席|委託只(?:寫|填|限)/.test(body);
 const minutes=/紀錄|記錄|報備|備查/.test(body);
 const charter=/修章|章程修正/.test(body);
 const dateQuestion=/最晚|哪天前|什麼時候.{0,7}(?:通知|發|寄)|何時.{0,7}(?:通知|發|寄)|提前多久|日期.{0,4}(?:沒定|未定|不確定)|新(?:會議)?日期(?:是|為)|改日期最晚/.test(body);
 const board=/理監事會|理事會|監事會/.test(body);
 const elective=/改選|選舉|新舊理監事|新任理監事|任期.{0,6}(?:快|將|屆滿|到期)/.test(body)&&!/(?:不是|沒有|不辦|不用|不必|不會|不想)(?:要|這次|現在|打算)?(?:改選|選舉)/.test(body);
 const first=elective&&/第一次|首次|新舊理監事|交接/.test(body);
 if(/名冊|會員代表.{0,6}(?:更換|異動)|重審/.test(body)&&!minutes&&!charter&&!elective&&!board)return null;
 if(!minutes&&!charter&&!dateQuestion&&!elective&&!board&&!(wantsProxy&&freshCalendar.test(body)))return null;
 const picked=body.match(freshCalendar);
 const rawDate=follow||picked?.[1]||'';
 const explicitYear=/今年|(?:民國)?[0-9]{2,4}年|[0-9]{2,4}[/-][0-9]{1,2}[/-][0-9]{1,2}/.test(rawDate);
 const date=rawDate?calendar(rawDate,year):null;
 const shift15=(v)=>new Date(v.getTime()-15*86400000);
 const monthDay=(v)=>(v.getUTCMonth()+1)+'月'+v.getUTCDate()+'日';
 const febLeap=date?shift15(new Date(Date.UTC(2028,date.m-1,date.d))):null;
 const febNormal=date?shift15(new Date(Date.UTC(2027,date.m-1,date.d))):null;
 const needsYear=!!(!explicitYear&&date&&((date.m===2&&date.d===29)||monthDay(febLeap)!==monthDay(febNormal)));
 const limited=new RegExp('委託(?:書)?.{0,12}(?:只(?:能|填|寫|限|適用)?|限定?|上面寫).{0,12}(?:'+mDate+'|'+fullCalendar+'|原(?:本|來|定)?(?:日期|那天)|當天|當日)|(?:只限|只適用).{0,12}(?:原(?:本|來|定)?日期|原日|當天|當日)|已(?:經|書面)?(?:取消|終止|撤回)委託').test(body);
 const approved=/(?:原先|原本|之前|已).{0,9}(?:報請|申請|邀請).{0,10}(?:列席|派員)/.test(body);
 const steps=[['先換成新日期通知，不沿用寫舊日期的通知','把會議種類、日期、時間、地點和議程按新日期重新通知應出席人員，通常須在會員大會15日前完成，並按規定報請主管機關列席。改期本身不等於緊急臨時會。'+(approved?'原已報請列席，請把更正資料送原窗口，不是用原通知繼續。':'縣府會不會派員、原送件如何更正，請向原承辦確認。')]];
 if(needsYear){
  steps.push(['只需補年份以核對閏年',''+monthDay(date.v)+'已知道；遇到閏年，往前15日的日期可能不同。請輸入同一會期、含年份的完整日期，無須重講其他條件。']);
 } else if(date){
  const basis=shift15(date.v);
  const label=explicitYear?dateLabel:monthDay;
  steps.push(['用新日期算通知','新會議是'+label(date.v)+'。往前推15個日曆日的基準是'+(!explicitYear&&basis.getUTCFullYear()<date.y?'前一年':'')+label(basis)+'；請預留送達時間、留存通知紀錄，不是從原會議日倒推。']);
 } else if(dateQuestion||board||minutes){
  steps.push(['可以先辦上面的事，確定後再補日期','請直接輸入新的會員大會日期，例如「7月5日」；其他條件不用重講。日期未定前無法算出確切通知日。']);
 }
 if(wantsProxy)steps.push(['舊委託要看書面限制',limited?'原委託只適用原日期或已終止，不可用在新日期。若會員不能出席，請另簽本次書面委託，交其他具資格的會員（代表），每位受託人只能代理一人。':'改期不讓所有舊委託自動失效。請核對是否只限原日期、是否終止、委託及受託人是否仍具本次資格；有任一障礙就不要沿用。每位受託人只能代理一人。']);
 if(charter)steps.push(['修章是另列的議程','把章程修正列入新通知議程，不以臨時動議取代。法定出席門檻為應出席者過半，修章需出席者三分之二以上贊成；議決後應於30日內報主管機關備查。']);
 if(elective)steps.push(['改選與任期不能自動展延','理監事改選原則在任期屆滿前一個月內辦理。確有困難應向主管機關申請核准，延長最多三個月；天災、事變等則查主管機關有無公告及適用期間，不因颱風或改期就自行展延。']);
 if(board)steps.push(first?['改選後第一次理事會、監事會','原則分別於大會閉會後第7日起至15日內舉行。要排大會當日就須隨大會通知一併通知；如果允許不在場者當選，原則不得排同日，除非當選的全體理事、監事同意。先確定新大會日，再排會。']:['同日另排例行理事會或監事會','例行理事會、監事會或理監事聯席會議不是會員大會；各自確認召集人及議程，通常7日前通知。不把「改選後第一次會議」的規定套到例行會議。']);
 if(first&&/交接/.test(body))steps.push(['交接跟著就任，不跟著舊日期','改選前先造具立案證書、印信、未結案件、檔案、財務及人事清冊，新任理事長就任後由其會同監交人於15日內接收完畢。']);
 if(minutes)steps.push(['會議紀錄看實際開會日','取消而未開的場次，不填成已召開或已有決議。實際會員大會散會後30日內向主管機關報備；已實際開完的另一場會議不因本場改期而重算。理監事會議紀錄通常自行留存，依法需報的決議另附文件辦理。']);
 if(/年度.{0,12}(?:會務|財務|決算)|年度財報|會務財務/.test(body))steps.push(['年度會務與財務列入這次議程','請把年度會務、決算等資料依章程及財務程序準備，明列議程供會員審議。只改開會日期，不必把要審的年度期間改成新會期。']);
 return {direct:true,title:'會員大會改期：新通知、原委託和會後事項分開辦',category:'協會會務｜大會改期',summary:'按新日期重新通知，不能只拿原通知開會。'+(wantsProxy&&limited?' 委託明定只限原日，就要另簽。':'')+(elective?' 另查改選與任期，不自動展延。':''),steps,refs:[p(26),g(10),...(wantsProxy?[p(42),moi]:[]),...(charter?[p(27),p(54)]:[]),...(elective?[e(21)]:[]),...(board?[first?e(12):g(11)]:[]),...(first&&/交接/.test(body)?[g(18)]:[]),...(minutes?[g(12)]:[])],questionState:{focus:'compound'},followNewDate:needsYear||(!date&&(dateQuestion||board||minutes)),actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function isMeetingDateCorrection(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 return /^(?:更正|補充|我說錯了|不是改選)[，,:：、]?/.test(t)&&/改期|延期|新日期|原定|只要改|同一天/.test(t)&&!/合作社|公會|工會|農會|漁會/.test(t);
}
function applyMeetingDateCorrection(prior,q){
 // Keep only the established organization type. Revised agenda/date/meeting facts come from the correction.
 const reason=prior.match(/協會|人民團體|社會團體/);
 const sameAssembly=/(?:仍|只|還是|一樣).{0,12}(?:開|是)會員(?:代表)?大會/.test(q)&&!/委託.{0,12}(?:不限|改成|另|沒寫)|(?:不是|改成).{0,8}(?:監事會|理事會)/.test(q);
 const limited=prior.match(/委託(?:書)?只(?:填|寫|限)(?:原(?:本|定)?日期|[0-9]{1,2}月[0-9]{1,2}日|[0-9]{1,2}[/-][0-9]{1,2})/);
 return [reason?.[0],q,sameAssembly?limited?.[0]:null].filter(Boolean).join('；');
}
function route(q,year=localYear()){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 const revised=t&&t.length<=360?(sameYearPlan(t,year)||onlyRoutineBoardNotice(t)):null;if(revised)return revised;
 if(!t||t.length>270||!/協會|社會團體|人民團體/.test(t)||!/大會/.test(t)||!/延期|延後|改期|挪到|改到|延到|改成.{0,12}月|新(?:會議|日期)(?:是|在|為)|延至/.test(t)||/合作社|社員|公會|工會|農會|漁會|公司|股東|管委會|財團法人|選票|罷免|除名|改選|監事會|成立大會|不動產/.test(t))return null;
 const proxy=/委託書|代理人|委託出席/.test(t),roster=/名冊|代表.{0,7}(?:換|異動|變更)|重審/.test(t);
 const crossYear=/跨年|今年.{0,26}(?:明年|次年|下年)|(?:明年|次年|下年).{0,25}今年|年底.{0,10}(?:明年|次年|下年)|明年.{0,25}原定年底/.test(t);
 if(!proxy||(!crossYear&&!roster&&!/照用|有效|能用|還能用|沿用|重簽|只限|撤回|取消委託/.test(t)))return null;
 const limited=/委託書.{0,12}(?:寫|限|載明|註明).{0,11}(?:原(?:來|本|訂)?日期|當天|當日|指定日期)|只(?:限|適用).{0,8}(?:原(?:來|本|訂)?日期|原(?:來|本)?那(?:一)?天|原日|當天|當日)|(?:已經?|已書面|已)(?:取消委託|終止委託|撤回委託|取消代理)/.test(t);
 const changed=/代表.{0,10}(?:已經換|已換|換人|異動|被改派|改派了)|另(?:一位|位)代表.{0,6}換人/.test(t)&&!/代表.{0,8}(?:一個都沒換|一個也沒換|沒有變更|沒換|不變|未異動|都沒變)/.test(t);
 const stays=/代表.{0,8}(?:一個都沒換|一個也沒換|沒有變更|沒換|不變|未異動|都沒變)|名冊(?:也)?(?:都)?(?:沒變|未異動)/.test(t);
 const proxyStep=['先看原委託書的限制，再判斷能否沿用',limited?'委託書已寫只限原會議日期，或委託已終止，就不能用原件在新日期代理。仍要委託時，請依規定另作書面委託。':'內政部函釋說明，原委託書不因大會延期就自動失效；但若委託書限定原日期或另設限制、委託人已終止，或任一方已不具資格，就不能視為當然仍有效。依人民團體法第42條，社會團體會員（代表）可書面委託其他具資格者，每位只得代理一人。'];
 const rosterStep=['代表更換與名冊：是另一件事',changed?'會員代表既然已換人，先核對新代表是依法及章程產生，不是由他人代坐。依函釋及現行會務輔導辦法第10條，最遲於新會議15日前由理事會重新審定有變動的代表資格並造具名冊。確認與本次委託有沒有重疊；舊名冊不能忽略已知的變動。':stays?'代表若確實沒有變動，函釋並未要求只因延期就重審一次；仍要核對會籍與應出席資格、表決和代理資料。如果查到代表更換，再依法處理。':'先查代表有無更換或資格有無變動；如有更換，最遲於新會議15日前重新審定。若沒有變動，不能只因延期就一律認定必須重審。'];
 const reminder=['新日期的通知與列席要重核','原定期大會改期，不因延期就成為緊急臨時會。依第26條及會務輔導辦法第10條，按新會議日期15日前通知應出席人員，並報請主管機關列席。原通知已寄就更正會議資料；原先已報請主管機關派員列席的，也要把新資料更正到原窗口。'];
 const next=crossYear?findNewDate(t,year):null;
 const wantsDate=/最晚|哪(?:一)?天.{0,4}(?:發|寄|通知)|幾號.{0,4}(?:發|寄|通知)|哪天前|何時.{0,5}(?:通知|寄|發)/.test(t);
 const yearStep=['先分開今年有沒有實際開會，與明年新日期','人民團體法第25條規定定期會員（會員代表）大會每年一次。若今年這場定期會議尚未舉行，延到明年才開，不能視為今年已完成；先按章程（例如是否明定年底召開）確認，並把延期原因、新日期與承辦核對。若另涉及理監事任期屆滿，依選罷辦法第21條另辦，延期不會自動展延任期。'];
 let items=[...(crossYear?[yearStep]:[]),...(next?[['用新日期倒推，不用舊日期','新會議是'+dateLabel(next.v)+'。往前推15個日曆日的基準是'+dateLabel(new Date(next.v.getTime()-15*86400000))+'；建議提前通知並保留通知紀錄。這不是從舊的開會日期或原通知日計算。']]:[]),proxyStep,...(!crossYear||roster?[rosterStep]:[]),reminder];
 if(crossYear&&wantsDate&&!next)items.push(['只需補新開會的確切日期','你已提供的會議種類與其他條件不用再說一次；請接著輸入新日期。如果已經說了月份，可以只補日期，例如「15日」。']);
 const summary=(crossYear?'如果今年原定這場定期大會沒開，明年開不算今年已開。':'')+(limited?'原委託書明定只限原日期或委託已終止，就不能直接在新會期使用。':'大會改期本身不使所有原委託書失效；先看是否限定原日期、已終止，並核對雙方資格。')+(changed?' 另一位代表若已依法更換，要另審定新代表資格。':' 大會通知仍要依新日期處理。');
 return {direct:true,category:'協會會務｜大會延期、委託與名冊',title:crossYear?'協會大會延到明年：今年會務、新通知和原委託分開看':'大會延期：委託書、代表名冊和新通知分開看',summary,steps:items,refs:[...(crossYear?[p(25),yearFaq]:[]),moi,p(26),p(42),g(10)],questionState:{focus:'compound'},followNewDate:crossYear&&wantsDate&&!next,actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route,isDateReply,isMeetingDateCorrection,applyMeetingDateCorrection};return;}
root.verifiedAssociationPostponedProxy=route;
root.isPostponedProxyDateReply=isDateReply;
root.verifiedSameYearAssociationMeetingDate=(q)=>{const t=String(q??'').normalize('NFKC').replace(/\s/g,'');return t.length<=360?(sameYearPlan(t,localYear())||onlyRoutineBoardNotice(t)):null;};
root.isMeetingDateCorrection=isMeetingDateCorrection;
root.applyMeetingDateCorrection=applyMeetingDateCorrection;
})(typeof window!=='undefined'?window:globalThis);
