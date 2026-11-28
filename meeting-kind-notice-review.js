(function(root){
'use strict';
const reference=(title,code)=>({title,source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+code});
const act=reference('人民團體法第25–27、32、34、54條','D0050091');
const meetings=reference('人民團體會務輔導辦法第10–13、17條','D0020094');
const finance=reference('社會團體財務處理辦法第3、5、11條','D0050097');
const delayRule={title:'內政部台內社字第8735076號函：定期會員大會延期',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=220065'};
const agendaRule={title:'內政部台內團字第1080022434號函：補充修章議程',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256745'};
const coopAct=reference('合作社法第36、46、52條','D0050112');
const norm=s=>String(s??'').normalize('NFKC').replace(/\s/g,'');
const form={assembly:'會員（會員代表）大會',board:'理事會',supervisors:'監事會',joint:'理監事聯席會',coopBoard:'社務會'};
const assoc=/協會|人民團體|社會團體/;
const other=/信用合作社|信合社|商業同業|商業會|工業會|工業同業|公會|工會|農會|漁會|管委會|財團法人|股份有限公司|國際性|合作社聯合社/;
const names=/會員(?:(?:\((?:會員)?代表\)|代表))?大會|會員代表會議|理監事聯席會(?:議)?|理監事會議?|理事會議?|監事會議?|社務會(?:議)?/g;
const kind=s=>/^會員/.test(s)?'assembly':/^理監事/.test(s)?'joint':/^理事/.test(s)?'board':/^監事/.test(s)?'supervisors':'coopBoard';
function readKinds(t){
 const p=[];
 for(const m of t.matchAll(names)){
  const before=t.slice(0,m.index);
  if(/(?:不是|並非|沒有(?:要)?(?:召)?開|沒(?:有)?(?:要)?召開|不開|不辦|不召開|而非|不屬於|取消)$/.test(before))continue;
  const active=/(?:只|單獨|單就|先|改成|換成|改開)(?:想|要|會|打算|召)?(?:只)?(?:開|召開)?$|(?:開的是|說的是|請選擇)$/.test(before);
  p.push({type:kind(m[0]),active});
 }
 return p;
}
function asNum(s){
 if(/^\d+$/.test(s))return Number(s);
 const nums={零:0,〇:0,一:1,二:2,兩:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9};
 if(s.includes('十')){const [a,b]=s.split('十');return (a?nums[a]:1)*10+(b?nums[b]:0);}
 return nums[s];
}
function coopNumeric(t){
 const end='([一二兩三四五六七八九十\\d]{1,3})(?:位|人|名|席|票)';
 const value=(p)=>{const a=t.match(new RegExp(p+end));return a?asNum(a[1]):null;};
 const directors=value('理事(?:共|有|共計|一共|總共|是|為)?'), supervisors=value('監事(?:共|有|共計|一共|總共|是|為)?');
 if(!directors||!supervisors)return '';
 const total=directors+supervisors, min=Math.ceil(total*2/3);
 let present=value('(?:實到|實際到場|實際出席|出席共有|一共到場|總共到場|到場共|現場有)');
 if(present==null){
  const absences=[...t.matchAll(/([一二兩三四五六七八九十\d]{1,3})(?:位|人|名)(?:理事|監事)(?:請假|不能到|不克出席|沒到|無法出席|缺席|不到)/g)];
  if(absences.length===2&&/理事/.test(absences[0][0])!==/理事/.test(absences[1][0]))present=total-absences.reduce((a,b)=>a+asNum(b[1]),0);
 }
 const intro='你提供理事'+directors+'位、監事'+supervisors+'位，合計'+total+'位，至少要'+min+'位出席。';
 if(present==null||present<0||present>total)return intro+' 再用實際出席人數確認同意票門檻，不假定請假以外的人都到了。';
 const needs=Math.floor(present/2)+1;
 if(present<min)return intro+' 依你提供的人數若實到'+present+'位，不能成會表決。';
 const vote=t.match(/([一二兩三四五六七八九十\d]{1,3})票/);
 const agreed=vote?asNum(vote[1]):null;
 return intro+' 若其餘人皆實到、共'+present+'位，可以成會；一般決議至少要'+needs+'票同意。'+(agreed!=null&&agreed<=present?' 你問的'+agreed+'票'+(agreed>=needs?'達到':'未達到')+'一般決議的票數門檻。':'');
}
const book=['付款日、憑證到手日和年度歸屬分開','依社會團體財務處理辦法第3、5條，決算採權責發生制，平時若用現金收付也要在決算調整。核對何時取得服務、驗收或產生付款義務、款項是否預付，並保留原始憑證和付款證明。不能僅因晚拿憑證就改成另一筆或單按憑證日期認列；若是補助案，另核對補助核銷規定。'];
const annual=['年度決算先監事會審核，再交大會','人民團體法第34條：年度決算先由監事會審核，連同審核結果提經會員或會員代表大會通過，再報主管機關核備。依社會團體財務處理辦法第11條，若確實未能如期開大會，可先經理事會及監事會，或依法成會的理監事聯席會議通過，但事後仍要提大會追認，再報備；理事會、監事會或聯席會都不能永久取代大會。'];
const charter=['理事會能討論草案，不能替大會改章程','人民團體法第27條把章程的訂定或變更列為大會決議事項。先把草案列入大會議程與通知，依團體身分和章程核對表決門檻；第54條的章程異動30日內報請核備，與閉會後報備大會紀錄是兩個事項。若已辦理法人登記，另確認民法及法院變更登記程序。'];
const stamp=String.raw`(?:民國)?(\d{2,4})(?:年|[-/])(\d{1,2})(?:月|[-/])(\d{1,2})(?:日|號)?`;
function selectedDate(t,shortOnly){
 const all=[...t.matchAll(new RegExp(stamp,'g'))];
 if(!all.length)return null;
 const current=all.findLast(m=>/(?:改至|延至|改定在|改到|延到|新日期(?:是|為)?|改期到|日期更正為|改訂|改(?:在|為)|原定.{0,10}改於)$/.test(t.slice(0,m.index)));
 const m=current||((shortOnly||all.length===1&&!/原定|原訂|舊日期|原本|以前/.test(t))?all[0]:null);
 if(!m)return null;
 let [y,mn,d]=m.slice(1,4).map(Number);
 if(y<1911&&y>=12&&y<=288)y+=1911;
 const date=new Date(Date.UTC(y,mn-1,d));
 return y>=1912&&y<=2199&&date.getUTCMonth()===mn-1&&date.getUTCDate()===d?{y,mn,d}:null;
}
function scheduleNote(f,date){
 if(!date)return null;
 const {y,mn,d}=date, n=f==='assembly'?15:7;
 const safe=new Date(Date.UTC(y,mn-1,d-n-1));
 const fmt=(a,b,c)=>a+'年'+b+'月'+c+'日';
 return ['本次日期及保留完整通知期間的安排','按你指定的'+fmt(y,mn,d)+'，若走通常程序，可保守安排在'+fmt(safe.getUTCFullYear(),safe.getUTCMonth()+1,safe.getUTCDate())+'或更早通知。這是安排日，不是個案法定最後一天；若章程要求更長期間或特定方式，按合適程序辦理。'];
}
const chairMissing=['不在場不等於已有合法代理權','如理事長出差或無法召集，先確認章程有無適用的代理機制、以及是否已由有權人召集。不能依法召開時，依人民團體法第32條洽主管機關指定適格召集人，不先自行推定副理事長或代理主席可以發通知。'];
const assemblyNotice=['大會要另行通知及報請派員列席','一般協會由理事長召集會員或會員代表大會，通常15日前通知具出席資格的會員或會員代表，載明種類、時間、地點和議程，並報請主管機關派員列席。因緊急事故召集臨時會議，通知在開會前一日送達才適用例外；不是只要臨時改期就算緊急。'];
function route(raw,prior){
 const t=norm(raw);if(!t||t.length>500||/^新題/.test(t))return null;
 const clean=t.replace(/(?:而)?(?:不是|並非|而非)(?:一般)?(?:勞動)?合作社/g,'');
 if(other.test(clean))return null;
 const dateOnly=new RegExp('^(?:(?:改到|延到|日期|改成|預定|更正[：:]?)(?:是|為)?)?'+stamp+'[。!！]?$').test(clean);
 const follow=prior&&((prior.change&&dateOnly)||(/(?:會員|理事會|監事會|理監事聯席|社務會|決算|會議日期|開會日期)/.test(clean)&&/^(?:更正(?:一下)?|我選|確認這次|確認現在|確認是|請選擇|補充(?:一下)?|現在只開|改成|改開)/.test(clean)));
 const entries=readKinds(clean);
 const highlighted=entries.filter(x=>x.active);
 const focus=(highlighted.at(-1)||entries[0])?.type;
 const qYear=/年度|上年|去年|今年|年終|年底|決算/.test(clean)&&/決算|會計報告|年度報表/.test(clean);
 const qCharter=/修章|改章程|修改章程|章程修正|章程.{0,10}(?:草案|變更|定案|議程|跟決算)/.test(clean);
 const agendaUnchanged=/日期.{0,10}(?:不變|照舊|不改|沒改|未改)|不改日期|原日期照舊|同一(?:天|日期)|原(?:時地|時間地點).{0,6}(?:不變|照舊)/.test(clean)&&/地點.{0,6}(?:不變|照舊|不改|沒改|未改)|同一地點|原地點|原(?:時地|時間地點).{0,6}(?:不變|照舊)|日期.{0,4}地點.{0,8}(?:不變|照舊|不改|沒改|未改)/.test(clean);
 const agendaOnly=qCharter&&agendaUnchanged&&/(?:只|僅|補|新增|加上|增列|漏).{0,12}(?:議程|提案|修章|章程)|議程.{0,8}(?:多|補|漏|加)/.test(clean);
 const qNotice=/通知|邀請|幾天|誰召集|誰主持|誰發|要(?:不要)?到/.test(clean);
 const qRecord=/紀錄|記錄|備查|報(?:縣府|主管機關)|要報/.test(clean);
 const qChange=/改期|改(?:成只)?開|改成|換成|延到|改日期|舊通知|原(?:本|訂).{0,45}(?:週|日|送|通知)|通知.{0,6}(?:已寄|已送|沿用)|延後/.test(clean);
 const qJointFail=/監事.{0,10}(?:沒過半|未過半|未達過半|沒達半數|不到一半|不足一半)|理事.{0,10}(?:沒過半|未過半|未達過半)/.test(clean);
 if(!follow&&/(?:首(?:次|屆)|第[一1]次|新(?:任|屆)?理事會).{0,20}理事會|(?:同日|同一天|大會當天).{0,8}開理事會|書面委託|委託書|代理出席|實際清查|清點人數|聯名|連署/.test(clean))return null;
 if(!follow&&/補推|補選|候補|理事長.{0,8}(?:辭職|辭任)|改選|重選/.test(clean.replace(/(?:沒有要|不會|不需要|不必|沒有|不)(?:辦理|辦)?(?:重選|改選)/g,'')))return null;
 if(focus==='coopBoard'&&/除名|選舉|罷免/.test(clean.replace(/(?:沒有要|不是要|不打算|不要|不會|不)(?:辦理|辦)?(?:除名|選舉|罷免)/g,'')))return null;
 const carry=(follow&&prior)||{};
 const condition={
  focus:focus||(agendaOnly&&carry.focus==='assembly'?'assembly':null)||carry.focus,org:/合作社/.test(clean)||focus==='coopBoard'?'coop':assoc.test(clean)?'assoc':carry.org,
  annual:qYear||!!carry.annual,charter:!/(?:先不|不要|不用)(?:再)?處理章程|章程先不/.test(clean)&&(qCharter||!!carry.charter),
  expense:((/憑證|收據|發票/.test(clean)&&/付款|支出|先付|入帳/.test(clean))||!!carry.expense)&&!/(?:不|先不)問(?:憑證|發票|帳務)/.test(clean),
  notice:qNotice||!!carry.notice,record:qRecord||!!carry.record,change:!agendaOnly&&(qChange||!!carry.change),
  jointFail:qJointFail,
  date:selectedDate(clean,dateOnly)||((follow&&!qChange&&!agendaOnly)?carry.date:null),
  missingChair:/理事長.{0,9}(?:出國|出差|不在|不能|無法|請假)/.test(clean)||!!carry.missingChair,
  assemblyLater:focus!=='assembly'&&entries.some(x=>x.type==='assembly')&&/後|補開|另|再|不再/.test(clean)
 };
 const f=condition.focus;
 const make=(title,summary,steps,refs)=>({direct:true,category:condition.org==='coop'?'合作社會務｜社務會':'協會會務｜通知、決算與報備',title,summary,steps,refs,noticeReviewContext:condition,questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]});
 if(f==='coopBoard'){
  if(!follow&&!qNotice&&!qYear&&!qRecord&&!/(?:成會|表決|幾票|多少人)/.test(clean))return null;
  const numeric=coopNumeric(clean);
  const stated=/不是要除名|沒有要除名|不是辦除名/.test(clean)?'你說這次不是除名，而是社務會的一般議案。':'';
  return make('社務會不是社員大會',stated+'社務會由理事會召集，不是理事長以個人身分召集；主席由理事、監事互選。'+(numeric||'要有全體理事與監事合計三分之二出席；一般決議要出席理事、監事過半數同意。'),[
   ['通知先看社務會本身的章程與程序','通知應出席的理事與監事，留存議程、通知和出席紀錄。合作社法第46條的七日規定是社員大會，不能直接套給社務會；社務會通知提前幾天，先核對有效章程與適用規定。'],
   ...(condition.annual?[['社務會討論，不取代年度決算的社員大會','依合作社法第36條，理事會編年度財務書類；原則至少在社員大會開會10日前送監事會審核，再提社員大會承認，承認後一個月內報主管機關備查。臨時社員大會另有例外。']]:[])
  ],[coopAct]);
 }
 if(/合作社|社員大會/.test(clean))return null;
 if(!follow&&!((qNotice&&qRecord)||(qYear&&(qNotice||qRecord||f==='joint'))||(qCharter&&(qNotice||qRecord))||(f==='joint'&&qJointFail)))return null;
 /* 理解把關 2026-11-28：修改章程只能在會員大會，不用再問哪一種會議；沒有改期時交給既有的修章答案 */
 if(!f&&qCharter&&!qYear&&!(qNotice&&qRecord)&&!condition.change&&!follow)return null;
 if(!f){
  const a=make('先確認是哪一種會議','改期時，誰應收到通知、提前幾天、紀錄要不要報備，都要先看開的是哪一種會。',[],[act,meetings]);
  return {...a,choiceHeading:'您要改的是哪種會議？',choices:Object.entries(form).filter(([k])=>k!=='coopBoard').map(([k,label])=>({label,question:'請選擇一般協會的'+label}))};
 }
 if(!condition.org&&f!=='assembly'&&!/會員大會|縣府/.test(clean)&&!follow)return null;
 const hasInternal=f!=='assembly';
 const internal=f==='board'?['理事會由理事長召集','通知應出席的理事；一般會員不用因這次理事會而出席或表決。']:f==='supervisors'?['監事會由監事會召集人（常務監事）召集','通知應出席的監事；一般會員不用因這次監事會而出席。']:['理監事聯席會由雙方同意召集','先由理事長及監事會召集人（常務監事）分別同意召集，通知應出席的理事和監事。雙方都同意不等於已成會，理事及監事各須過半數出席；監事不足，不能先表決。'];
 const notice=hasInternal?[internal[0],internal[1]+' 依會務輔導辦法第11條，通常在開會7日前通知會議種類、時間、地點與議程；因緊急事故召集臨時會議，通知最晚須在開會前一日送達。']:assemblyNotice;
 const record=(f==='assembly')?['大會紀錄閉會後30日內報備查','大會紀錄要留存供會員或代表查閱，並於閉會後30日內報主管機關備查；決算報表、章程異動另按其規定及表件辦理。']:['這場紀錄原則留存，不是大會30日報備','依會務輔導辦法第12條，記開會日期、出缺席及決議，閉會後留存供會員或代表查閱；某項決議若依法須報主管機關或目的事業主管機關核辦，再附相關文件送件。'+(condition.assemblyLater||condition.annual||condition.charter?' 日後實際召開會員或會員代表大會，大會紀錄才有閉會後30日內報備查的通則。':'')];
 const supplement=['只補章程修正議案，不必重新起算15日','原大會已依法通知，日期、地點及會議種類都沒有變，只補送修章議案，依內政部台內團字第1080022434號函屬補充議程，不影響原通知時效。建議儘早把修章內容送給原應出席者；全國通則沒有要求修正對照表一定要跟原通知同寄，但要核對章程及適用的特別規定。如果實際改了日期或會議類型，就不是此例。'];
 const changed=['會議變更後，以新通知為準','原通知若列的是不同的會議種類、日期或地點，不宜沿用。清楚通知原邀請對象取消或改期，再依法向新一場的應出席人員發更正通知，留存送達紀錄。若原大會已報縣府派員，請向原承辦說明變更並確認如何辦理，不自行假定另一個法定截止日。需要算最晚哪天時，請提供改定的完整年月日。'];
 if(f==='assembly'&&condition.change)changed[1]+=' 依內政部台內社字第8735076號函，原定期大會延期後，仍應按新會議日期重新於15日前通知。';
 return make(form[f]+'：通知與辦理程序',agendaOnly&&f==='assembly'?'這是同一場大會，只補送修章議案。原通知若已依法發出，就不必重算15日。':condition.jointFail&&f==='joint'?'監事沒有過半，這場聯席會不能先表決；即使理事已過半，決算也不能靠這場定案。':hasInternal?'依目前要開的'+form[f]+'處理，不把會員大會的通知及紀錄規則套在這一場。':'會員或會員代表大會的通知、開會紀錄及各議案的報備，要分開辦。',[
  ...(agendaOnly&&f==='assembly'?[supplement,['大會的法定程序仍要完成','原大會照有效通知召開；仍按人民團體法第26條報請主管機關派員列席。若原報送議程已有變動，可附補充資料向原承辦確認辦理方式，不用把這次補送當成改期。']]:[notice]),...(condition.change?[condition.date?[changed[0],changed[1].replace('需要算最晚哪天時，請提供改定的完整年月日。','')]:changed]:[]),...(scheduleNote(f,condition.date)?[scheduleNote(f,condition.date)]:[]),...(condition.missingChair&&f!=='supervisors'?[chairMissing]:[]),...(condition.annual?[annual]:[]),...(condition.charter?[charter]:[]),...(condition.expense?[book]:[]),...(hasInternal&&(condition.assemblyLater||condition.annual||condition.charter)?[assemblyNotice]:[]),record
 ],[act,meetings,...(agendaOnly&&f==='assembly'?[agendaRule]:[]),...(f==='assembly'&&condition.change?[delayRule]:[]),...(condition.annual||condition.expense?[finance]:[])]);
}
if(typeof module==='object'&&module.exports)module.exports={route};
else root.verifiedMeetingKindNoticeReview=route;
})(typeof window==='object'?window:globalThis);
