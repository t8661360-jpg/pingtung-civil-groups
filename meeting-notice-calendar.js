(function(root){
'use strict';
const p={title:'人民團體法第26條：會員大會通知與列席',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050091'};
const r={title:'人民團體會務輔導辦法第10、11條：各類會議通知',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0020094'};
const c={title:'合作社法第46條：社員大會書面通知',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050112'};
const m={title:'內政部函釋：大會延期後的通知及委託書',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=220065&sms=12360'};
const labels={assembly:'會員（代表）大會',directors:'理事會',supervisors:'監事會',joint:'理監事聯席會',coop:'合作社社員大會'};
const classRe=/(?:會員(?:（會員代表）|\(會員代表\)|代表)?大會|社員大會|理(?:事及|事、)?監事聯席(?:會議|會)|理事會(?:議)?|監事會(?:議)?)/g;
const dateRe=/(?:(民國|西元)?(\d{2,4})年|(明年|今年))?(?:(下個月|下月|這個月|本月)([一二三四五六七八九十廿兩\d]{1,3})(?:日|號)|([一二三四五六七八九十廿兩\d]{1,3})(?:月|[/-])([一二三四五六七八九十廿兩\d]{1,3})(?:日|號)?)/g;
function num(x){
 if(!x)return 0;if(/^\d+$/.test(x))return +x;
 const v='〇一二三四五六七八九'.indexOf(x);
 if(v>=0)return v;if(x==='兩')return 2;
 if(x.startsWith('廿'))return 20+num(x.slice(1));
 if(x.includes('十')){const [a,b]=x.split('十');return (a?num(a):1)*10+num(b);}
 return 0;
}
const type=w=>w.includes('社員')?'coop':w.includes('聯席')?'joint':w.includes('理事')?'directors':w.includes('監事')?'supervisors':'assembly';
function partsTaipei(now){const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(now);return Object.fromEntries(p.filter(x=>x.type!=='literal').map(x=>[x.type,Number(x.value)]));}
const stamp=d=>d.getUTCFullYear()+'年'+(d.getUTCMonth()+1)+'月'+d.getUTCDate()+'日';
function readDates(t,now){
 const cur=partsTaipei(now);
 return [...t.matchAll(dateRe)].flatMap(h=>{
  let y=h[2]?(+h[2]+(h[1]==='民國'||+h[2]<1911?1911:0)):h[3]?cur.year+(h[3]==='明年'?1:0):0;
  let mo=num(h[6]),d=num(h[7]||h[5]);
  if(h[4]){y=cur.year;mo=cur.month+(/下/.test(h[4])?1:0);if(mo===13){mo=1;y++;}}
  if(mo<1||mo>12||d<1||d>31)return [];
  const dd=new Date(Date.UTC(y||2000,mo-1,d));
  if(dd.getUTCMonth()+1!==mo||dd.getUTCDate()!==d)return [{i:h.index,end:h.index+h[0].length,label:h[0],invalid:true}];
  return [{i:h.index,end:h.index+h[0].length,date:y?dd:null,label:y?stamp(dd):mo+'月'+d+'日'}];
 });
}
const labelDays=k=>k==='assembly'?15:7;
function route(input,now=new Date(),previous=null){
 const t=String(input??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>380||/^(?:新題|另問|另外問)|信用合作社|信合社|工會|公會|農會|漁會|管委會|基金會|成立大會|籌備|理監事改選|罷免|補選|視訊|章程|委員會|核銷|補助|決算/.test(t))return null;
 const dateReply=previous&&/^(?:(?:日期|改成|定在|在|是)[：:]?)?(?:(?:民國|西元)?\d{2,4}年|明年|今年)?(?:(?:下個月|下月|這個月|本月)[一二三四五六七八九十廿兩\d]{1,3}(?:日|號)|[一二三四五六七八九十廿兩\d]{1,3}(?:月|[/-])[一二三四五六七八九十廿兩\d]{1,3}(?:日|號)?)。?$/.test(t);
 if(dateReply&&labels[previous.kind]&&previous.kind!=='coop')return route(labels[previous.kind]+'開會通知 '+t+'；通知日期確認:'+previous.kind,now);
 const chosen=t.match(/;通知日期確認:(assembly|directors|supervisors|joint|coop)$/)?.[1];
 const b=t.replace(/;通知日期確認:[a-z]+$/,'').replace(/(?:本來|原本|原先)(?:說|是|要開|要辦)?(?:會員大會|理事會|監事會)[，,、]?改(?:成|為)/g,'').replace(/(?:不是|不再是|不辦|並非)(?:一般協會的?)?(?:會員大會|理事會|監事會|大會|聯席會|合作社)(?=[、也而,是;。])/g,'');
 if(!/通知|提前.{0,4}(?:日|天)|幾天前|幾日前/.test(b)||!/開會|大會|理事會|監事會|會議|會議要|到時候開/.test(b))return null;
 const meets=[...b.matchAll(classRe)].map(h=>({k:type(h[0]),i:h.index,end:h.index+h[0].length}));
 const unique=[...new Set(meets.map(x=>x.k))];
 const hasCoop=/合作社|社員大會/.test(b);
 if(hasCoop&&unique.some(k=>k!=='coop'))return null;
 const ds=readDates(b,now);
 const hasChange=/挪到|改到|改成|改在|換到|延期|改期|延到|改為/.test(b);
 const relative=/下個?月|這個月|本月|今年|明年/.test(b);
 if(!chosen&&unique.length<2&&!relative)return null;
 if(!chosen&&unique.length<2&&!ds.length)return null;
 const isEmergency=/緊急事故|颱風|地震|前一日|前一天|明天就要/.test(b);
 if(isEmergency)return null;
 const output=(title,summary,steps,refs)=>({direct:true,category:'團體會議｜通知日期',title,summary,steps,refs,questionState:{focus:'cross-meeting-notice-calendar'}});
 if(!chosen&&!unique.length){
  if(hasCoop)return null;
  return {...output('日期有了，還要確認會議類型','不同會議的通知天數不一樣。您說的日期是'+ds[0].label+'，只要選會議類型，不必重填日期。',[],[p,r,c]),choiceHeading:'這次是開哪一種會？',choices:['assembly','directors','supervisors','coop'].map(k=>({label:labels[k],question:String(input??'')+'；通知日期確認:'+k}))};
 }
 const kinds=chosen?[chosen]:unique;
 const groups=Object.fromEntries(kinds.map(k=>[k,[]]));
 const allDates=kinds.length===1?ds:[];
 if(kinds.length>1){
  const move=/(?:挪到|改到|改在|換到|延到|延期到|改為)/.exec(b);
  const moveAfter=move&&ds.find(d=>d.i>=move.index+move[0].length);
  const first=meets[0];const assemblyFirst=kinds[0]==='assembly';
  if(moveAfter&&assemblyFirst&&move.index<first.i&&/大會.{0,12}(?:通知|先|已寄)/.test(b))groups.assembly.push(moveAfter);
  for(const d of ds){
   if(moveAfter&&move.index<first.i&&d.end<first.i)continue;
   const clauseStart=Math.max(b.lastIndexOf(',',d.i),b.lastIndexOf(';',d.i),b.lastIndexOf('。',d.i),b.lastIndexOf('、',d.i))+1;
   const end=b.slice(d.end).search(/[,;。]/);
   const clauseEnd=end<0?b.length:d.end+end;
   const same=meets.filter(x=>x.i>=clauseStart&&x.i<clauseEnd);
   if(same.length===1)groups[same[0].k].push(d);
   else if(d===moveAfter&&move&&move.index>=first.i&&!same.length&&/^(?:想|要|擬|決定|得|需要)?(?:挪到|改到|改在|換到|延到|延期到|改為)/.test(b.slice(clauseStart))){
    const earlier=meets.filter(x=>x.i<move.index).at(-1);
    if(earlier)groups[earlier.k].push(d);
   }
  }
 }
 const missing=[];
 const steps=kinds.map(k=>{
  const dates=kinds.length===1?allDates:groups[k];
  const distinct=[...new Map(dates.map(d=>[d.label,d])).values()];
  const d=distinct.length===1?distinct[0]:distinct.length>1&&hasChange?distinct.at(-1):null;
  if(kinds.length>1&&!d?.date)missing.push(k);
  const n=labelDays(k);const normal=k==='coop'?'依合作社法第46條，由理事會以書面載明召集事由及提議事項通知社員。':k==='assembly'?'依人民團體法第26條通知應出席會員（代表），並報請主管機關派員列席。':'依人民團體會務輔導辦法第11條，通知應出席者會議種類、時間、地點和議程。';
  let when=d?.invalid?'這個日期不存在，請確認這場的年月日。':d?.date?'會議日期：'+d.label+'；按一般'+n+'日前回推，應在'+stamp(new Date(+d.date-n*86400000))+'或更早完成通知。':d?'已知會議日是'+d.label+'，請補年份再換算通知日。':'這場的開會日期還沒確認，請只補這場的年月日。';
  if(hasChange&&k==='assembly'&&/委託書|已寄|已發/.test(b))when+=' 大會改期通知請以新日期重發，已報列席的也請更新。舊委託書如果明寫原日期，先確認委託範圍，必要時請委託人就新日期重出；不是所有委託書都因延期失效。';
  if(hasChange&&k!=='assembly'&&/還沒寄|未寄|沒發|未發/.test(b))when+=' 尚未寄出的通知用這場確認的新日期，不沿用其他會議日期。';
  return [labels[k]+'：通常'+n+'日前通知',when+' '+normal];
 });
 const title=kinds.length>1?'不同會議分開算，不用重選已說明的類型':labels[kinds[0]]+'：按這場開會日期推算通知日';
 const result=output(title,'先按各場會議的類型及日期分開。一般會員大會是15日前，理事會、監事會或聯席會是7日前；普通合作社社員大會則是7日前以書面通知。以下是一般規則，不把緊急事故臨時會議當成通常情況。',steps,[...(kinds.includes('assembly')?[p]:[]),...(kinds.some(k=>['directors','supervisors','joint'].includes(k))?[r]:[]),...(kinds.includes('coop')?[c]:[]),...(hasChange&&kinds.includes('assembly')?[m]:[])]);
 return missing.length===1?{...result,nextNoticeDate:{kind:missing[0]}}:result;
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedMeetingNoticeCalendar=route;
})(typeof window!=='undefined'?window:globalThis);
