(function(root){
'use strict';
const a=(title,code,n)=>({title,source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const refs={
 filing:a('人民團體會務輔導辦法第12條：會議紀錄','D0020094',12),
 oversight:a('人民團體會務輔導辦法第17條：審議與監察','D0020094',17),
 year:a('社會團體財務處理辦法第10條：會計年度','D0050097',10),
 reports:a('社會團體財務處理辦法第11條：年度會計報告與追認','D0050097',11),
 audit:a('人民團體法第34條：決算審核','D0050091',34)
};
const labels={assembly:'會員（代表）大會',board:'理事會',monitor:'監事會',joint:'理監事聯席會議',both:'理事會、監事會'};
const norms=q=>String(q??'').normalize('NFKC').replace(/\s/g,'');
const minutesPatterns={
 assembly:/(?:會員(?:[（(]?代表[）)]?)?大會|會員代表會議|大會)(?:的)?(?:會議)?(?:紀錄|記錄|紀要)/,
 board:/理事會(?:的)?(?:會議)?(?:紀錄|記錄|紀要)/,
 monitor:/監事會(?:的)?(?:會議)?(?:紀錄|記錄|紀要)/,
 joint:/理監事聯席(?:會議)?(?:的)?(?:會議)?(?:紀錄|記錄|紀要)/
};
function kind(t){
 const fixed=t.match(/已確認要問的是(會員大會|理事會|監事會|理監事聯席會議)/)?.[1];
 if(fixed)return {'會員大會':'assembly','理事會':'board','監事會':'monitor','理監事聯席會議':'joint'}[fixed];
 const negAssembly=/不是.{0,4}(?:會員(?:代表)?大會|大會)|不(?:是|問).{0,5}開會員大會/.test(t);
 const stated=Object.entries(minutesPatterns).filter(([k,p])=>p.test(t)&&!(k==='assembly'&&negAssembly)).map(([k])=>k);
 if(stated.includes('board')&&stated.includes('monitor'))return 'both';
 if(stated.length===1)return stated[0];
 if(/還(?:沒|沒有)說是|沒(?:有)?說是|不確定是哪|分不清是哪|不知道(?:是|哪)/.test(t))return null;
 const clean=t.replace(/(?:不是|不問|不包括).{0,3}(?:會員(?:代表)?大會|大會)/g,'');
 const board=/理事會/.test(clean),monitor=/監事會/.test(clean), joint=/理監事聯席|理事監事聯席/.test(clean);
 if(joint)return 'joint';
 if(board&&monitor)return 'both';
 if(board)return 'board';
 if(monitor)return 'monitor';
 if(!negAssembly&&/會員(?:[（(]?代表[）)]?)?大會|開大會/.test(clean)&&!/明年.{0,18}大會|年度決算.{0,16}大會/.test(clean))return 'assembly';
 return null;
}
const assembly=['大會的會議紀錄：閉會後30日內備查','依人民團體會務輔導辦法第12條，會員（代表）大會紀錄在閉會後30日內報主管機關備查。保留會議日期、出缺席與決議，依法提供會員查閱；個別決議如需另為核備或核辦，分開依規定辦理。'];
const boards=['理事會、監事會或聯席會議：原則留存，不套大會的30日','依人民團體會務輔導辦法第12條，這些會議的紀錄原則自行留存，依法供會員或會員代表查閱，不是每一次都要閉會後30日報縣府。若個別決議依法要報核辦，或承辦依規定要求來文補件，才按相應規定和表件提供。'];
const annual=['下次的正式年度決算，仍要依年度程序','一般曆年制社會團體，上年度正式決算是1月1日至12月31日，不是以這次開會日回推一年。依財務處理辦法第11條，理事會於年度終了後3個月內編造上年度工作報告及決算，依人民團體法第34條先送監事會審，再提會員（代表）大會通過，報主管機關備查。不能如期開大會時，第11條容許先經理事會及監事會或理監事聯席會議通過，事後仍須提大會追認，再報備。'];
function period(k,date){
 let msg='這次審的是今年的期中收支，不是上年度的正式決算。可列「本年度1月1日至本次實際結帳日」，按團體已完成核對的帳務決定截點。';
 if(date?.m){
  const month=date.m, dateText=date.d?(month+'月'+date.d+'日'):(month+'月');
  if(month>1){
   const n=new Date(Date.UTC(date.y??2026,month-1,0)).getUTCDate();
   const prior=month===3&&!date.y?'2月底':(month-1)+'月'+n+'日';
   msg+='已知是'+dateText+'開會；如果你們採前一個月底結帳，可以寫「1月1日至'+prior+'」。這是填表例子，不是法定截止日；若實際不是在月底結帳，就填實際結帳日。';
  }else msg+='已知是1月開會；若還沒結出這個年度的帳，不要把去年期間寫成今年期中，請分開列已能確認的期間。';
 }else msg+='還沒確定會議日，也可先確認帳做到哪一天，不必等會議排好才確認結帳日。';
 msg+=' 理事會審議經費收支，監事會監察；同一天各自開會，不會因此各有一個固定月結期間，也不等於已經大會通過年度決算。';
 return ['期中表要寫實際結帳期間',msg];
}
function route(q,dateOf){
 const raw=String(q??'').trim(),t=norms(raw);
 if(!t||t.length>310||/信用合作社|信合社|合作社|農會|漁會|公會|工會|基金會|管委會|家長會|財團法人|國際性|公司|股東會|退社|補助|更正抬頭|法院|發文補件|來文|罷免|除名/.test(t))return null;
 const record=/(?:會議|大會|理事會|監事會|聯席會議?)?.{0,2}(?:紀錄|記錄|紀要)/.test(t)&&/報(?:縣府|主管機關|備|送|請)|送縣府|備查|閉會後|(?:30|三十)[日天]|幾(?:天|日).{0,3}(?:報|送)|要.{0,3}(?:報|送)|留存|自己留|內部留/.test(t);
 const interim=/(?:期中|中途|年中|到目前|截至現在|今年的帳|今年期中帳)/.test(t)&&/收支|財務|財報|報表|會計|期中帳|期中表|帳務/.test(t);
 const financing=interim&&(record||/多久|哪天|哪一天|幾月|截|期間|怎麼寫|今年的帳|一樣|區別|年度決算|要審/.test(t))&&/理事會|監事會|大會|開會|會議/.test(t);
 if(!record&&!financing)return null;
 if(!/協會|社會團體|人民團體|理事會|監事會|理監事聯席|會員(?:代表)?大會/.test(t))return null;
 const k=kind(t);
 if(!k&&!(record||financing))return null;
 const includeAnnual=financing&&/年度決算|年度會計報告|下年.{0,10}決算|年終決算|明年.{0,9}決算|年度帳/.test(t)
     &&!/只問.{0,16}期中|只想知道.{0,15}期中/.test(t);
 const date=financing&&typeof dateOf==='function'?dateOf(raw):null;
 const steps=[...(financing?[period(k,date)]:[]),...(record?(k?[k==='assembly'?assembly:boards]:[assembly,boards]):[]),...(includeAnnual?[annual]:[])];
 const status=record?(k==='assembly'?'會員大會的紀錄要在閉會後30日內報備。':k?'如果是一般協會，'+labels[k]+'紀錄原則自己留，不適用大會閉會後30日報備的通則。':'會員大會有30日報備通則，理事會或監事會通常自行留；先選這一次的會議。'):'期中收支按實際結帳日；年度決算另外辦。';
 const summary=financing?'這次的期中收支按實際結帳日，不是年度決算。'+(record?' '+status:''):status;
 const choices=!k&&raw.length<250?Object.entries({assembly:'會員大會',board:'理事會',monitor:'監事會',joint:'理監事聯席會議'}).map(([,label])=>({label,question:raw+'；已確認要問的是'+label+'。'})):[];
 return {direct:true,category:'協會會務｜期中報表與會議紀錄',title:financing?'這次的期中收支，和年度決算分開處理':k&&k!=='assembly'?'理監事會議紀錄，不套大會的30日報備':'大會與理監事會的紀錄，報備規則不同',summary,steps,refs:[...(record?[refs.filing]:[]),...(financing?[refs.oversight,refs.year]:[]),...(includeAnnual?[refs.reports,refs.audit]:[])],questionState:{focus:'compound'},...(choices.length?{choiceHeading:'這一次要問哪一種會議？',choices}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route:(q)=>route(q,require('./association-finance-meeting-month.js').dateOf),kind};return;}
root.verifiedAssociationMinutesFinance=q=>route(q,root.associationFinanceDateOf);
})(typeof window!=='undefined'?window:globalThis);
