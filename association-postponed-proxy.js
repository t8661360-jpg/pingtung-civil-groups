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
function route(q,year=localYear()){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
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
if(typeof module!=='undefined'&&module.exports){module.exports={route,isDateReply};return;}
root.verifiedAssociationPostponedProxy=route;
root.isPostponedProxyDateReply=isDateReply;
})(typeof window!=='undefined'?window:globalThis);
