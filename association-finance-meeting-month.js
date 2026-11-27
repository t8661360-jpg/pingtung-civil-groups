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
function dateOf(q,now=new Date()){
 const t=clean(q);
 const full=t.match(/(?:民國)?(\d{2,4})年(\d{1,2}|十[一二]?|[一二三四五六七八九])月(?:(\d{1,2})[日號])?/) ||
             t.match(/(?:^|[^0-9])(\d{2,4})[-/](\d{1,2})[-/](\d{1,2})(?!\d)/);
 const relative=t.match(/(今年|本年|明年|去年|後年|前年)(\d{1,2}|十[一二]?|[一二三四五六七八九])月(?:(\d{1,2})[日號])?/);
 const monthOnly=t.match(/(?:^|[^0-9])(\d{1,2}|十[一二]?|[一二三四五六七八九])月(?:(\d{1,2})[日號])?/);
 if(!full&&!relative&&!monthOnly)return null;
 const useRelative=relative&&(!full||relative.index<full.index);
 const qualified=useRelative?relative:full;
 let y=useRelative?Number(taipeiCalendar.format(now))+relativeYears[relative[1]]:full?Number(full[1]):null;
 if(y!==null&&y<1000)y+=1911;
 const raw=qualified?qualified[2]:monthOnly[1], rawDay=qualified?qualified[3]:monthOnly[2];
 const m=/^\d+$/.test(raw)?Number(raw):chinese.indexOf(raw);
 const d=rawDay?Number(rawDay):null;
 if(m<1||m>12||(y!==null&&(y<1912||y>2199))||(d!==null&&(d<1||d>days(y??2000,m))))return null;
 return {y,m,d};
}
function days(y,m){return new Date(Date.UTC(y,m,0)).getUTCDate();}
function linkedDates(q,now=new Date()){
 // Keep each meeting date attached to the meeting stated immediately before or after it.
 const t=clean(q);
 const stamp=/(?:(?:民國)?\d{2,4}年|今年|本年|明年|去年|後年|前年)?(?:\d{1,2}|十[一二]?|[一二三四五六七八九])月(?:\d{1,2}[日號])?|\d{2,4}[-/]\d{1,2}[-/]\d{1,2}/g;
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
function start(q,now=new Date()){
 const t=clean(q);
 if(!/期中收支|收支報告|收支報表|收支決算|會計報告|財務報告|財務報表|財報|年度決算|決算(?:要做|做到|做哪|要準備)|準備決算/.test(t))return null;
 if(!/開會|會議|大會|理事會|監事會|理監事|召開/.test(t))return null;
 if(!dateOf(t,now)&&!/什麼時候|哪時|何時|多久前|做到|算到|哪一年|哪年度|哪一年度|哪段|哪一期|哪個期間|起訖|從哪|幾月|哪天|哪個月|什麼日期/.test(t))return null;
 if(/合作社|社員|公會|工會|商業團體|農會|漁會|財團法人|公司|股東|基金會|國際性|成立大會|第一次會員大會|補助|核銷|勸募|報稅|所得稅|公告|格式|下載|解散/.test(t))return null;
 const budget=/預算/.test(t)&&/明年|下年度|次年度/.test(t);
 if(/預算/.test(t)&&!budget)return null;
 const timing='何時|幾天|幾日|什麼時候|哪天|哪一日|多久|哪時';
 const notice=new RegExp('通知(?:單|書)?(?:又|也|還)?(?:要|須|應|應該|需要|最晚|最遲|提前)*(?:'+timing+')(?:之前|以前|前)?(?:寄|發|送|通知|寄發|前|[？?。！!，,]|$)|(?:'+timing+'|提前).{0,8}(?:寄|發|送)(?:開會|會議|大會)?通知').test(t);
 const kind=meetingType(q),linked=linkedDates(q,now);
 const state={q,kind,date:null,linked,notice,budget};
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
function answer({kind,date:f,notice=false,budget=false}){
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
  steps.push(['開會通知',rule.text]);
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
 if(pairs.length<2||pairs.some(([kind,opts])=>opts.length!==1||!opts[0].y||!opts[0].d))return null;
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
  active=null;const a=answer(s);showAnswer(s.q,a);
  const actions=board.querySelector('.actions');
  if(actions)actions.prepend(button('更改會議類型或日期',()=>{active={...s};draw(true,true);}));
 }
 function draw(forceType=false,forceDate=false,err=''){
  if(!active)return;
  const s=active;
  if(s.kind&&s.date?.y&&s.date?.d&&!forceType&&!forceDate){result(s);return;}
  const top=el('div');top.className='qline';const who=el('span','您問');who.className='who';top.append(who,el('b',s.q));
  const title=el('h2',!s.kind||forceType?'先選這次要開哪種會議':'這次預計哪一天開會？');title.className='atitle';title.tabIndex=-1;
  const section=el('section');section.className='sec';section.setAttribute('aria-label','會議收支報告指引');
  board.replaceChildren(top,title,section);
  section.append(el('h3','日期未定，也能先確認年度決算'),el('p',annualPeriod(forceType?null:s.date?.y)),
   el('p','若問的是今年的實際收支，可另外做期中表，以已完成結帳的期間為準，這不是法定截止日。選定開會日期後，可以再看期間範例。'));
  const rule=s.notice&&!forceType?noticeRule(s.kind):null;
  if(rule)section.append(el('h3','開會通知'),el('p',rule.text));
  else if(s.notice)section.append(el('p','開會通知的提前天數要看會議類型。請先選下面的會議類型。'));
  const sources=el('p','依據：');
  [refs[0],refs[1],...(rule?.refs??[])].forEach((ref,i)=>{
   if(i)sources.append('、');
   const link=el('a',ref.title);link.href=ref.source;link.target='_blank';link.rel='noopener noreferrer';sources.append(link);
  });
  section.append(sources);
  if(!s.kind||forceType){
   section.append(el('p','會議類型不同，編製、審核及通過報表的角色也不同。'));
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
   const go=el('button','查看報表期間');go.type='submit';go.className='btn';
   row.append(go,button('更改會議類型',()=>draw(true,true)));
   if(s.date?.m)row.append(button('日期未定，先看這個月份',()=>result(s)));
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
  const next=start(q);if(next){active=next;const paired=pairedAnswers(next);if(paired){active=null;showAnswer(q,paired);}else draw();return true;}
  if(!active)return false;
  const t=clean(q),kind=meetingType(q),f=dateOf(q);
  if(kind&&/^(?:是|要開|這次是|開)?(?:會員[（(]?代表[）)]?大會|會員大會|大會|理事會|監事會|理監事聯席會議|理監事會議)(?=[，,。！!]|$|(?:預計|在)?(?:(?:民國)?[0-9]|今年|本年|明年|去年|後年|前年))/.test(t)){if(kind!==active.kind){const opts=optionsFor(active,kind);active.date=opts.length===1?opts[0]:null;}active.kind=kind;if(f)active.date=f;draw();return true;}
  if(/^(?:日期(?:是|為)?|開會(?:是|在)?|民國|預計|定在|在)?(?:\d|(?:今年|本年|明年|去年|後年|前年)(?:\d|[一二三四五六七八九十]))|^(?:[一二三四五六七八九十]+)月/.test(t)&&t.length<34){
   if(f){active.date=f;draw();}else draw(false,false,'日期無效。請輸入完整的年月日，例如「115年8月15日」。');return true;
  }
  if(active.kind&&active.date?.m&&/^(?:日期未定|只有月份|先看這個月份)/.test(t)){result(active);return true;}
  active=null;return false;
 };
}
if(typeof module!=='undefined'&&module.exports){module.exports={meetingType,dateOf,linkedDates,optionsFor,start,answer,annualPeriod,noticeRule,pairedAnswers,createPlanner};return;}
root.createFinanceMeetingPlanner=createPlanner;
})(typeof window!=='undefined'?window:globalThis);
