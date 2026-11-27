(function(root){
'use strict';
const law=(title,code,n)=>({title:title+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const refs=[law('社會團體財務處理辦法','D0050097',10),law('社會團體財務處理辦法','D0050097',11),law('社會團體財務處理辦法','D0050097',12),law('人民團體法','D0050091',34)];
const types={assembly:'會員（代表）大會',board:'理事會',supervisor:'監事會',joint:'理監事聯席會議',boards:'理事會／監事會'};
const chinese=['','一','二','三','四','五','六','七','八','九','十','十一','十二'];
const clean=q=>String(q??'').normalize('NFKC').replace(/\s/g,'');
function meetingType(q){
 const t=clean(q);
 const assembly=/會員(?:[（(]?代表[）)]?)?大會|會員代表會議|開大會|召開大會|參加大會|協會(?:的)?大會(?:日期|時間)?|^大會$/.test(t);
 const joint=/理監事聯席|理事監事聯席/.test(t), broad=/理監事會議|理監事會|理事會[/、或及與]監事會/.test(t);
 const board=/理事會/.test(t), supervisor=/監事會/.test(t);
 if(assembly&&(joint||broad||board||supervisor))return null;
 return assembly?'assembly':joint?'joint':broad||(board&&supervisor)?'boards':supervisor?'supervisor':board?'board':null;
}
const taipeiCalendar=new Intl.DateTimeFormat('en',{timeZone:'Asia/Taipei',year:'numeric'});
const relativeYears={今年:0,本年:0,明年:1,去年:-1,後年:2,前年:-2};
// Use the same date grammar for parsing and for attaching dates to meetings.
const monthToken=String.raw`\d{1,2}|十[一二]?|[一二三四五六七八九]`;
const dayToken=String.raw`\d{1,2}|[二三]?十[一二三四五六七八九]?|[廿卅][一二三四五六七八九]?|[一二三四五六七八九]`;
const monthDay=String.raw`(${monthToken})月(?:(${dayToken})[日號])?`;
const relativeToken='今年|本年|明年|去年|後年|前年';
const lunarDate=/農曆|陰曆|舊曆/;
const fullDate=new RegExp(String.raw`(?:民國)?(\d{2,4})年`+monthDay);
const relativeDate=new RegExp('('+relativeToken+')'+monthDay);
const partialDate=new RegExp(String.raw`(?:^|[^0-9])`+monthDay);
function dateNumber(raw){
 if(/^\d+$/.test(raw))return Number(raw);
 const units=chinese.slice(0,10);
 if(/^[廿卅]/.test(raw))return (raw[0]==='廿'?20:30)+(raw[1]?units.indexOf(raw[1]):0);
 if(raw.includes('十')){
  const [t,u]=raw.split('十');
  return (t?units.indexOf(t):1)*10+(u?units.indexOf(u):0);
 }
 return units.indexOf(raw);
}
function dateOf(q,now=new Date()){
 const t=clean(q);
 if(lunarDate.test(t))return null;
 const full=t.match(fullDate)||t.match(/(?:^|[^0-9])(\d{2,4})[-/](\d{1,2})[-/](\d{1,2})(?!\d)/);
 const relative=t.match(relativeDate), monthOnly=t.match(partialDate);
 if(!full&&!relative&&!monthOnly)return null;
 const useRelative=relative&&(!full||relative.index<full.index);
 const qualified=useRelative?relative:full;
 let y=useRelative?Number(taipeiCalendar.format(now))+relativeYears[relative[1]]:full?Number(full[1]):null;
 if(y!==null&&y<1000)y+=1911;
 const m=dateNumber(qualified?qualified[2]:monthOnly[1]);
 const rawDay=qualified?qualified[3]:monthOnly[2],d=rawDay?dateNumber(rawDay):null;
 if(m<1||m>12||(y!==null&&(y<1912||y>2199))||(d!==null&&(d<1||d>days(y??2000,m))))return null;
 return {y,m,d};
}
function days(y,m){return new Date(Date.UTC(y,m,0)).getUTCDate();}
function linkedDates(q,now=new Date()){
 // Keep each meeting date attached to the meeting stated immediately before or after it.
 const t=clean(q);
 const stamp=new RegExp(String.raw`(?:(?:民國)?\d{2,4}年|${relativeToken})?`+monthDay+String.raw`|\d{2,4}[-/]\d{1,2}[-/]\d{1,2}`,'g');
 const exactKind='會員(?:[（(]?代表[）)]?)?大會|會員代表會議|理監事聯席會議|理事監事聯席會議|理事會(?:議)?|監事會(?:議)?|理監事會議|大會';
 const next=new RegExp('^(?:(?:要|將|預計|才|再|當天)*(?:召開|開|舉行))?(?:的)?('+exactKind+')');
 const prev=new RegExp('('+exactKind+')(?:開會日期|日期|開會|預定|預計|訂於|排在|定在|安排在|安排|定於|在|是|為)*$');
 const map={}, loose=[], found=[];
 for(const clause of t.split(/[，,。；;？！?!]/)){
  for(const m of clause.matchAll(stamp)){
   const f=dateOf(m[0],now);if(!f)continue;
   found.push(f);
   const before=clause.slice(0,m.index),after=clause.slice(m.index+m[0].length);
   const right=after.match(next),left=before.match(prev);
   const k=meetingType((right||left||[])[1]||'');
   if(k)(map[k]??=[]).push(f);
   else if(/^(?:(?:要|預計|才|再)*(?:召開|開會|舉行會議)|開會)/.test(after)||/(?:開會|會議日期|開會日期)(?:預計|訂於|在|為|是)*$/.test(before))loose.push(f);
  }
 }
 return {map,loose,found};
}
function uniqueDates(dates){
 return [...new Map(dates.map(f=>[[f.y,f.m,f.d].join('-'),f])).values()];
}
function optionsFor(state,kind){
 const specific=uniqueDates(state.linked?.map[kind]??[]);
 if(specific.length)return specific;
 if(Object.keys(state.linked?.map??{}).length)return [];
 return uniqueDates(state.linked?.loose??[]);
}
const taipeiMonth=new Intl.DateTimeFormat('en',{timeZone:'Asia/Taipei',year:'numeric',month:'numeric'});
function referenceMonth(t,now){
 const match=t.match(/(?:^|[^下])(下下|下|這|本|上)(?:個)?月.{0,9}(?:開會|大會|理事會|監事會|會議)/)||t.match(/(?:開會|大會|理事會|監事會|會議).{0,6}(下下|下|這|本|上)(?:個)?月/);
 if(!match)return null;
 const date=Object.fromEntries(taipeiMonth.formatToParts(now).map(p=>[p.type,p.value]));
 const shifted=new Date(Date.UTC(Number(date.year),Number(date.month)-1+({下下:2,下:1,這:0,本:0,上:-1}[match[1]]),1));
 return {y:shifted.getUTCFullYear(),m:shifted.getUTCMonth()+1,d:null};
}
function withKnownYear(date,known,mixedNotice){
 if(!mixedNotice||date.y||!known?.y||date.m!==known.m||!date.d||date.d>days(known.y,known.m))return date;
 return {...date,y:known.y};
}
function noticePlanDate(kind,f){
 if(!types[kind]||!f?.y||!f?.d)return '';
 // Scheduling buffer: don't present this as a legal last date or the emergency exception.
 const n=kind==='assembly'?15:7;
 const safer=new Date(Date.UTC(f.y,f.m-1,f.d-n-1));
 return '為預留完整通知期間，可以安排在'+safer.getUTCFullYear()+'年'+(safer.getUTCMonth()+1)+'月'+safer.getUTCDate()+'日或更早發送；這是保守的安排日，不是個案法定最後一天。若章程規定更長或要求特定方式，應依章程。';
}
const rescheduleSource={title:'內政部函釋：定期會員大會延期後的通知',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=220065'};
const dispatchSource={title:'內政部會務輔導辦法逐條說明：一般通知與緊急送達',source:'https://gazette.nat.gov.tw/EG_FileManager/eguploadpub/eg029116/ch02/type3/gov10/num4/Eg.pdf'};
const coopNoticeSource=law('合作社法','D0050112',46);
function cooperativeNotice(t){
 if(!/社員(?:代表)?大會/.test(t)||!/通知/.test(t)||!/15[天日]|十五[天日]|7[天日]|七[天日]|幾天|幾日|多久|提前|又怎麼算/.test(t)||/信用合作社|信合社|保險合作社|聯合社|選舉|罷免|改選|改期|解散|已開會|無效|紙本|退信|送達/.test(t))return null;
 const ordinary=/社員大會/.test(t), representative=/社員代表大會/.test(t);
 if(!representative)return null;
 const steps=[];
 if(ordinary)steps.push(['社員大會：不是照協會的十五日','依合作社法第46條，由理事會召集，應於七日前用書面通知社員，並載明召集事由及提議事項。']);
 steps.push(['社員代表大會：先確認社別及現行章程','合作社法第46條明定的是社員大會；不能只憑名稱，就把協會十五日規定或第46條直接當作所有社員代表大會的通知期限。合作社法施行細則有提到社員代表大會，但未在該處統一訂通知期限。請備妥社別、章程及會議議程，向主管機關核對適用規定；涉及選舉時另查選舉通知規則。']);
 return {direct:true,category:'合作社會務｜開會通知',title:'社員大會與社員代表大會的通知分開確認',summary:ordinary?'一般合作社社員大會是七日前書面通知；您也問到社員代表大會，需另外核對社別與章程。':'社員代表大會的通知，先核對社別及現行章程，不直接套用協會的十五日。',steps,refs:[coopNoticeSource,{title:'合作社法施行細則',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050113'},{title:'合作社選舉罷免辦法',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050022'}],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function noticeOnlyStart(q,now){
 const t=clean(q);
 if(t.length>180||!/通知|幾號.{0,6}(?:寄|發|送)/.test(t)||!/幾號|哪天|哪一天|何時|怎麼算|幾天|幾日|提前|什麼時候/.test(t)||!/開會|會議|大會|理事會|監事會|理監事/.test(t))return null;
 if(/財報|決算|收支|財務|會計|成立|創立|籌備|選舉|改選|罷免|除名|會址|場地|地點|章程|公告|補助|已寄|已送|寄了|退信|未收到|沒收到|電子郵件|寄錯|緊急|前一天|前一日|勞資|股東|公司|合作社|社員|公會|工會|農會|漁會|縣府|聯絡|不是(?:會員(?:代表)?大會|理事會|監事會)|能不能.{0,8}同一天|可不可以.{0,8}同一天|可否.{0,8}同一天/.test(t))return null;
 const rescheduled=/改到|改為|改成|延期|延到|改期|挪到/.test(t);
 const both=!rescheduled&&/會員(?:代表)?大會/.test(t)&&/理事會|監事會|理監事/.test(t)&&/兩種|兩場|兩個|各自|分別|各要|都幾|各幾/.test(t);
 let kind=meetingType(t);
 const needsSolar=lunarDate.test(t);
 let linked=needsSolar?{map:{},loose:[],found:[]}:linkedDates(t,now);
 let date=null;
 if(!needsSolar&&rescheduled){
  const tail=t.match(/(?:改到|改為|改成|延到|挪到|延期至|改期至|延後到)([^，,；;。？！?]+)/)?.[1];
  if(tail){
   const newDate=dateOf(tail,now);
   if(newDate){date=newDate;linked={map:{},loose:[date],found:[date]};}
   else linked={map:{},loose:[],found:[]};
  }else linked={map:{},loose:[],found:[]};
 }else if(!needsSolar&&!both){
  const candidates=kind?optionsFor({linked},kind):uniqueDates(linked.found);
  if(candidates.length===1)date=candidates[0];
  if(!date&&linked.found.length===1)date=linked.found[0];
  if(date&&!Object.keys(linked.map).length)linked.loose=[date];
 }
 if(!needsSolar&&!rescheduled&&!linked.found.length&&!/日期未定|還沒定|哪種|哪類/.test(t))return null;
 const boardKind=/理監事聯席|理事監事聯席/.test(t)?'joint':/理事會/.test(t)&&!/監事會/.test(t)?'board':/監事會/.test(t)&&!/理事會/.test(t)?'supervisor':'boards';
 const same=both&&/同一天|同日|同一日/.test(t)?uniqueDates(linked.found):[];
 const aDate=both&&(same.length===1?same[0]:optionsFor({linked},'assembly')[0]);
 const bDate=both&&(same.length===1?same[0]:optionsFor({linked},boardKind)[0]);
 const pair=both&&uniqueDates(linked.map.assembly??[]).length<=1&&uniqueDates(linked.map[boardKind]??[]).length<=1&&aDate?.y&&aDate?.d&&bDate?.y&&bDate?.d?[[ 'assembly',aDate ],[boardKind,bDate]]:null;
 return {q,kind,date,linked,needsSolar,notice:true,mixedNotice:false,noticeOnly:true,rescheduled,pair};
}
function noticeOnlyAnswer(s){
 const pairs=s.pair??[[s.kind,s.date]];
 const refs=[dispatchSource];
 const steps=pairs.map(([k,f])=>{
  const rule=noticeRule(k);refs.push(...rule.refs);
  const heading=types[k]+'｜'+labelDate(f)+'開會';
  return [heading,rule.text+' '+noticePlanDate(k,f)+(k==='assembly'?' 另應報請主管機關派員列席，不能用報縣府代替通知會員。':'')];
 });
 if(s.rescheduled){
  steps.unshift(['改期以新的開會日安排通知','舊通知所寫日期不再適用。若已寄出，宜由召集方用正確時地通知應出席人員並保留紀錄；定期大會改期不會自動變成緊急臨時會。若原先已報縣府，請向原受理窗口確認更正方式。']);
  if(s.kind==='assembly')refs.push(rescheduleSource);
 }
 if(s.pair)steps.push(['同日不等於同一種會議','通知分開算；若會員名冊審定、預算編造或決算審核須在大會前完成，不可等到大會當天才首次處理。是否能同日召開，仍須核對章程及其他相關程序。']);
 return {direct:true,category:'人民團體會務｜會議通知日期',title:s.pair?'同日或不同日開兩種會議，通知分開算':types[s.kind]+'：依'+(s.rescheduled?'改期後':'提供')+'的日期安排通知',summary:'以下按一般協會的規則計算保守發送安排日，不是個案法定最後一天，也不是一律要求這天送達。一般通知以可證明的發送時點安排；章程如有更長期限或指定方式，須依章程。',steps,refs:[...new Map(refs.map(r=>[r.source,r])).values()]};
}
function start(q,now=new Date()){
 const t=clean(q);
 const noticeOnly=noticeOnlyStart(q,now);if(noticeOnly)return noticeOnly;
 const mixedNotice=/協會|社會團體/.test(t)&&/(?:決算|期中收支|財報|會計報告).{0,16}(?:及|和|跟|以及|還有|另問).{0,9}(?:開會)?通知|(?:開會)?通知.{0,14}(?:及|和|跟|以及|還有|另問).{0,9}(?:決算|期中收支|財報|會計報告)/.test(t)&&!/沒收到|未收到|退信|送達|電子郵件|重寄|遲寄|前一天|議案|調漲|會費|臨時動議|改期|(?:今年|本年度|當年度|上上年度|前年度|兩年前|[0-9]{2,4}年)(?:的)?(?:年度)?決算/.test(t);
 if(!mixedNotice&&!/期中收支|收支報告|收支報表|收支決算|會計報告|財務報告|財務報表|財報|年度決算|決算(?:要做|做到|做哪|要準備)|準備決算/.test(t))return null;
 if(!/開會|會議|大會|理事會|監事會|理監事|召開/.test(t))return null;
 if(!mixedNotice&&!dateOf(t,now)&&!lunarDate.test(t)&&!/什麼時候|哪時|何時|多久前|做到|算到|哪一年|哪年度|哪一年度|哪段|哪一期|哪個期間|起訖|從哪|幾月|哪天|哪個月|什麼日期/.test(t))return null;
 if(/合作社|社員|公會|工會|商業團體|農會|漁會|財團法人|公司|股東|基金會|國際性|成立大會|第一次會員大會|補助|核銷|勸募|報稅|所得稅|公告|格式|下載|解散/.test(t))return null;
 const budget=/預算/.test(t)&&/明年|下年度|次年度/.test(t);
 if(/預算/.test(t)&&!budget)return null;
 const timing='何時|幾天|幾日|什麼時候|哪天|哪一日|多久|哪時';
 const notice=new RegExp('通知(?:單|書)?(?:又|也|還)?(?:要|須|應|應該|需要|最晚|最遲|提前)*(?:'+timing+')(?:之前|以前|前)?(?:寄|發|送|通知|寄發|前|[？?。！!，,]|$)|(?:'+timing+'|提前).{0,8}(?:寄|發|送)(?:開會|會議|大會)?通知').test(t);
 const kind=meetingType(q),needsSolar=lunarDate.test(t),linked=needsSolar?{map:{},loose:[],found:[]}:linkedDates(q,now);
 if(mixedNotice&&!needsSolar&&!linked.found.length){const m=referenceMonth(t,now);if(m)linked.loose.push(m);}
 const state={q,kind,date:null,linked,notice:notice||mixedNotice,budget,needsSolar,mixedNotice};
 const options=kind?optionsFor(state,kind):uniqueDates(Object.keys(linked.map).length?[]:linked.loose);
 state.date=options.length===1?options[0]:null;
 return state;
}
const labelDate=f=>[f.y?f.y+'年':'',f.m+'月',f.d?f.d+'日':''].join('');
function annualPeriod(y=null){
 const prior=y?(y-1)+'年（上年度）1月1日至12月31日':'上年度1月1日至12月31日';
 return '會議日期不會改變年度決算期間：正式年度收支決算做'+prior+'。一般曆年制協會的理事會應在'+(y?y+'年':'當年度')+'3月底前編好上年度工作報告和會計報告，不是到開會當天才開始做。';
}
function noticeRule(kind){
 if(!types[kind])return null;
 const period=kind==='assembly'?'開會十五日前':'開會七日前';
 return {
  text:'一般應於'+period+'通知應出席人員，告知會議種類、時間、地點及議程。只有因緊急事故召集臨時會議，且於開會前一日送達通知，才適用例外；不是前一天寄出就可以。',
  refs:kind==='assembly'?[law('人民團體法','D0050091',26),law('人民團體會務輔導辦法','D0020094',10)]:[law('人民團體會務輔導辦法','D0020094',11)]
 };
}
function answer({kind,date:f,notice=false,budget=false,mixedNotice=false}){
 if(!types[kind]||!f)return null;
 const current=f.y?f.y+'年':'當年度';
 const cut=f.m>1? (f.m===3&&!f.y?'2月底':(f.m-1)+'月'+days(f.y??2000,f.m-1)+'日'):
   (f.d>1?'1月'+(f.d-1)+'日':null);
 const general=annualPeriod(f.y);
 const process={
  assembly:'先由監事會審核年度決算，再把審核結果和報表提交會員（代表）大會，通過後報主管機關。若因故不能如期開大會，可先由理事會及監事會，或理監事聯席會議通過，之後提大會追認，再報主管機關備查。',
  board:'理事會負責編造上年度會計報告，年度決算還要送監事會審核，再提會員（代表）大會。理事會單獨通過不能代替大會；若大會不能如期開，依規定可由理事會及監事會或理監事聯席會議先通過，再提大會追認。',
  supervisor:'監事會是審核，不是編造決算。理事會編好後，監事會先審核年度決算，再把審核結果併同決算提會員（代表）大會。監事會單獨審核不是大會通過。',
  joint:'如果是因故不能如期開會員（代表）大會，理監事聯席會議可先通過上年度報告與決算，之後仍應提大會追認，再報主管機關備查。聯席會議不會把上年度決算變成今年的期中報告。',
  boards:'若開的是理事會，由理事會編造報告；若開的是監事會，由監事會審核年度決算。審核結果要與決算併提會員（代表）大會，不能把其中一次會議當成大會通過。若大會不能如期開，依規定可先由理事會及監事會，或由理監事聯席會議通過，再提大會追認。'
 };
 const currentInfo=cut?'若本次要報告會議當年度的實際收支，可另做期中表。例如已結帳至'+cut+'，就可列'+current+'1月1日至'+cut+'。':'若本次要報告會議當年度的實際收支，可另做期中表，列到當年度最近已完成結帳且早於會議的日期；若尚未有已結帳期間，不必假設已有完整月份。';
 const steps=[general,process[kind],currentInfo+' 這是報表範例，不是法定申報截止日，也不取代正式的年度決算。'];
 const sources=[...refs];
 if(notice){
  const rule=noticeRule(kind);
  steps.push(['開會通知',rule.text+(mixedNotice?' '+noticePlanDate(kind,f):'')]);
  if(mixedNotice&&kind==='assembly')steps.push(['通知會員與報請主管機關不同','會員（代表）大會另應依人民團體法第26條報請主管機關派員列席；不能用報縣府代替通知會員。']);
  sources.push(...rule.refs);
 }
 if(budget){
  steps.push(['明年預算','如果「明年」是指會議當年度的下一年，預算應做'+(f.y?(f.y+1)+'年度':'會議的下一年度')+'，由理事會在該會計年度開始前編造工作計畫與收支預算表。這是未來年度的計畫，不是前一年度的實際決算。']);
 }
 return {direct:true,category:'人民團體財務',title:labelDate(f)+' '+types[kind]+'：年度決算與期中收支要分開',summary:'年度決算做會議的上年度；會議當年度的實際收支另外列期中表。',steps,refs:sources};
}
function pairedAnswers(s){
 if(!/各要|各自|各是|各需要|分別|兩場|兩次|兩個會議/.test(clean(s.q)))return null;
 const pairs=Object.keys(s.linked.map).map(kind=>[kind,optionsFor(s,kind)]);
 if(pairs.length<2||pairs.some(([kind,opts])=>opts.length!==1||!opts[0].d))return null;
 const individual=pairs.map(([kind,[date]])=>({kind,date,result:answer({...s,kind,date})}));
 const steps=individual.map(({kind,date,result})=>[labelDate(date)+' '+types[kind],result.steps.map(x=>Array.isArray(x)?x.join('：'):x).join(' ')]);
 const sources=[...new Map(individual.flatMap(x=>x.result.refs).map(x=>[x.source,x])).values()];
 return {direct:true,category:'人民團體財務',title:'兩場會議的收支報告，依日期分開看',summary:'以下依問句的開會日期分列，不混用兩場會議的日期。',steps,refs:sources};
}
function createPlanner({board,showAnswer}){
 let active=null;
 const el=(tag,txt)=>{const n=board.ownerDocument.createElement(tag);if(txt)n.textContent=txt;return n;};
 function button(label,fn,kind){
  const b=el('button',label);b.className='btn ghost';b.type='button';if(kind)b.dataset.financeKind=kind;
  b.addEventListener('click',fn);return b;
 }
 function result(s){
  active=null;const a=s.noticeOnly?noticeOnlyAnswer(s):answer(s);showAnswer(s.q,a);
  const actions=board.querySelector('.actions');
  if(actions)actions.prepend(button('更改會議類型或日期',()=>{active={...s};draw(true,true);}));
 }
 function draw(forceType=false,forceDate=false,err=''){
  if(!active)return;
  const s=active;
  if(s.kind&&s.date?.d&&(!s.noticeOnly||s.date?.y)&&!forceType&&!forceDate){result(s);return;}
  const top=el('div');top.className='qline';const who=el('span','您問');who.className='who';top.append(who,el('b',s.q));
  const title=el('h2',!s.kind||forceType?'先選這次要開哪種會議':'這次預計哪一天開會？');title.className='atitle';title.tabIndex=-1;
  const section=el('section');section.className='sec';section.setAttribute('aria-label',s.noticeOnly?'開會通知日期指引':'會議收支報告指引');
  board.replaceChildren(top,title,section);
  if(s.noticeOnly){section.append(el('p',s.rescheduled?'以改期後的新日期為準，不用原日期計算。':'先選會議類型，再確認完整開會日期。'),el('p','以一般協會為例，大會一般十五日前；理事會、監事會或聯席會一般七日前。其他團體先確認適用規定。'))}
  else section.append(el('h3',s.date?.d?'已提供開會日期：'+labelDate(s.date):'先確認年度決算期間'),el('p',annualPeriod(forceType?null:s.date?.y)),
   el('p','若問的是今年的實際收支，可另外做期中表，以已完成結帳的期間為準，這不是法定截止日。選定開會日期後，可以再看期間範例。'));
  if(s.needsSolar)section.append(el('p',s.noticeOnly?'農曆日期不能直接當作國曆。請提供國曆開會日期。':'農曆日期不能直接當作國曆。請提供國曆開會日期，再看對應的報表期間。'));
  if((s.mixedNotice||s.noticeOnly)&&!s.kind&&s.date?.m)section.append(el('p','已知道：'+labelDate(s.date)+'；先選會議類型，不必再說一次月份。'));
 const rule=s.notice&&!forceType?noticeRule(s.kind):null;
  if(rule)section.append(el('h3','開會通知'),el('p',rule.text));
  else if(s.notice)section.append(el('p','開會通知的提前天數要看會議類型。請先選下面的會議類型。'));
  if(s.mixedNotice&&rule)section.append(el('p','已知道會議類型；補上確切日期，就可看報表範例與建議的通知安排日。'));
  const sources=el('p','依據：');
  (s.noticeOnly?(rule?.refs??noticeRule('assembly').refs):[refs[0],refs[1],...(rule?.refs??[])]).forEach((ref,i)=>{
   if(i)sources.append('、');
   const link=el('a',ref.title);link.href=ref.source;link.target='_blank';link.rel='noopener noreferrer';sources.append(link);
  });
  section.append(sources);
  if(!s.kind||forceType){
   section.append(el('p',s.noticeOnly?'會議類型不同，通知期限不同。':'會議類型不同，編製、審核及通過報表的角色也不同。'));
   const row=el('div');row.className='actions';
   for(const k of ['assembly','board','supervisor','joint']){
    const opts=optionsFor(s,k);
    row.append(button(types[k]+(opts.length===1&&Object.keys(s.linked?.map??{}).length?' · '+labelDate(opts[0]):''),()=>{
     if(k!==s.kind||!s.date){s.date=opts.length===1?opts[0]:null;}
     s.kind=k;draw(false,forceDate);
    },k));
   }
   section.append(row);
  }else{
   const p=el('p','會議類型：'+types[s.kind]+(s.date?'。目前知道：'+labelDate(s.date)+'。':'。'));
   const form=el('form'),label=el('label','開會日期'),date=el('input'),row=el('div');row.className='actions';
   date.type='date';date.id='finance-meeting-date';date.min='1912-01-01';date.max='2199-12-31';label.htmlFor=date.id;
   if(s.date?.y&&s.date?.d)date.value=[s.date.y,String(s.date.m).padStart(2,'0'),String(s.date.d).padStart(2,'0')].join('-');
   const go=el('button',s.noticeOnly?'查看建議通知日':'查看報表期間');go.type='submit';go.className='btn';
   row.append(go,button('更改會議類型',()=>draw(true,true)));
   if(s.date?.m&&(!s.noticeOnly||s.date?.y&&s.date?.d))row.append(button(s.date?.d?'使用已提供的日期':'日期未定，先看這個月份',()=>result(s)));
   const dateChoices=optionsFor(s,s.kind);
   if(dateChoices.length>1){
    const picks=el('div');picks.className='actions';
    for(const f of dateChoices)picks.append(button(labelDate(f),()=>{s.date=f;draw();}));
    section.append(el('p','問句有不只一個可能的日期，可點選或另填。'),picks);
   }
   const info=el('p',err||'可選日期，也可在下方回覆，例如「115年8月15日」。');info.setAttribute('role','status');
   form.append(label,date,info,row);
   form.addEventListener('submit',e=>{e.preventDefault();const value=dateOf(date.value);if(value?.y&&value?.d){s.date=value;result(s);}else{info.textContent='請選擇有效的開會日期。';date.focus();}});
   section.append(p,form);
  }
  if(typeof board.scrollIntoView==='function')board.scrollIntoView({behavior:'smooth',block:'start'});
  title.focus({preventScroll:true});
 }
 return function handle(q){
  const coop=cooperativeNotice(clean(q));if(coop){active=null;showAnswer(q,coop);return true;}
  const next=start(q);if(next){active=next;if(next.pair){active=null;showAnswer(q,noticeOnlyAnswer(next));return true;}const paired=next.noticeOnly?null:pairedAnswers(next);if(paired){active=null;showAnswer(q,paired);}else draw();return true;}
  if(!active)return false;
  const t=clean(q),kind=meetingType(q),f=dateOf(q);
  if(/^(?:開會日期(?:是|為)?|日期(?:是|為)?|預計|在)?(?:農曆|陰曆|舊曆)(?:閏)?(?:[0-9一二三四五六七八九十]+月|正月|臘月)/.test(t)&&t.length<26){active.needsSolar=true;active.date=null;draw();return true;}
  if(kind&&/^(?:是|要開|這次是|開)?(?:會員[（(]?代表[）)]?大會|會員大會|大會|理事會|監事會|理監事聯席會議|理監事會議)(?=[，,。！!？?]|$|(?:預計|在)?(?:(?:民國)?[0-9]|[一二三四五六七八九十]+月|今年|本年|明年|去年|後年|前年))/.test(t)){if(kind!==active.kind){const opts=optionsFor(active,kind);active.date=opts.length===1?opts[0]:null;}active.kind=kind;if(f){active.date=withKnownYear(f,active.date,(active.mixedNotice||active.noticeOnly));active.needsSolar=false;}draw();return true;}
  if(/^(?:開會日期(?:是|為)?|日期(?:是|為)?|開會(?:是|在)?|民國|預計|定在|在)?(?:國曆|陽曆)?(?:\d|[一二三四五六七八九十]+月|(?:今年|本年|明年|去年|後年|前年)(?:\d|[一二三四五六七八九十]))/.test(t)&&t.length<34){
   if(f){active.date=withKnownYear(f,active.date,(active.mixedNotice||active.noticeOnly));active.needsSolar=false;draw();}else draw(false,false,'日期無效。請輸入有效的開會日期，例如「115年8月15日」。');return true;
  }
  if(!active.noticeOnly&&active.kind&&active.date?.m&&/^(?:日期未定|只有月份|先看這個月份)/.test(t)){result(active);return true;}
  active=null;return false;
 };
}
if(typeof module!=='undefined'&&module.exports){module.exports={noticeOnlyStart,noticeOnlyAnswer,cooperativeNotice,meetingType,dateOf,linkedDates,optionsFor,start,answer,annualPeriod,noticeRule,pairedAnswers,createPlanner,noticePlanDate};return;}
root.createFinanceMeetingPlanner=createPlanner;
})(typeof window!=='undefined'?window:globalThis);
