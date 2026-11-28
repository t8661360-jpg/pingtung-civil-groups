(function(root){
'use strict';
const ref=(title,pcode,n)=>({title,source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+pcode+'&flno='+n});
const refs={
 minutes:ref('人民團體會務輔導辦法第12條：會議紀錄','D0020094',12),
 flow:ref('人民團體會務輔導辦法第17條：理事會審議及監事會監察','D0020094',17),
 year:ref('社會團體財務處理辦法第10條：會計年度','D0050097',10),
 annual:ref('社會團體財務處理辦法第11條：年度會計報告','D0050097',11),
 check:ref('社會團體財務處理辦法第22條：監事會查核','D0050097',22),
 audit:ref('人民團體法第34條：決算先送監事會審核','D0050091',34),
 grant:{title:'屏東縣政府對民間團體補助經費作業要點第3、5、10點',source:'https://portal.ptc.edu.tw/bulletin/attachment.php?a_sn=33872&b_sn=B114003910'}
};
const norm=q=>String(q??'').normalize('NFKC').replace(/\s+/g,'');
const interim=/期中|年中|上半年|這半年|今年收支|當年收支/;
const annual=/年度(?:決算|結算|會計報告|報告|帳)|上年度|去年決算|年終決算|上年決算|(?:期中|年中).{0,12}(?:或|還是)年度/;
const separate=/同一天|同日|同一天內|當天|同個日期|同一日|同時|都排|都訂|都在|均在|個別開|分開開|各自開|兩場|兩會|兩邊|先開.{0,9}再開|先開理事會.{0,18}後開監事會/;
const uncertainty=/不確定|還沒決定|還未決定|沒有決定|還沒定|未定|未選|還沒選|還不知|不知道|分不清|還是|或是|哪(?:一)?份|哪(?:一)?種|二選一/;
const subject=/協會|社會團體|人民團體|社團法人/;
const outside=/合作社|信用社|信合社|農會|漁會|工會|公會|基金會|管委會|公司|家長會|國際性/;
const record=['理事會、監事會紀錄分開留存，不套大會30日',
 '若同日各自開會，不等於聯席；各自留下日期、出缺席、議案及決議，依法供會員（代表）查閱。理事會、監事會及聯席會議紀錄原則自行留存，不必例行報縣府；個別決議依法要核辦的，另按該規定附送。會員（代表）大會紀錄才有閉會後30日內報主管機關備查的通則。'];
const formal=['上年度正式決算：年度期末不是這次開會日',
 '一般社團採曆年制，年度自1月1日至12月31日。理事會在會計年度終了後3個月內編造上年度工作及會計報告；決算先送監事會審核，審核結果一併提報會員（代表）大會。大會通過後報主管機關備查；不能如期開大會時可先經理監事會或聯席會議按規定通過，日後仍須大會追認，再報備。'];
const progress=['當年度期中收支：兩會可共用一個已核對的截止日',
 '從今年1月1日列到實際已完成結帳並核對的日期。理事會先審議收支，再送監事會監察；監事會應實際查核，而非用理事會同意代替。不因兩場同天或分開進行，就需要不同的法定期中截止日。可共用同一版本的資料，但兩個會議各做自己的審議／監察紀錄。'];
function dateNote(raw,dateOf){
 if(typeof dateOf!=='function')return '';
 const source=raw.normalize('NFKC').replace(/((?:都排|都訂|均在|都在|排在|訂在|預定)(?:民國)?(?:\d{2,4}年)?(?:\d{1,2}|[一二三四五六七八九十]{1,3})月(?:\d{1,2}|[一二三四五六七八九十廿卅]{1,3}))(?=\s*[,，。;；?!！？]|$)/g,'$1日');
 const hit=dateOf(source);
 if(!hit?.m)return '';
 const moments=[...source.matchAll(/(?:\d{1,2}|[一二三四五六七八九十]{1,3})月\s*(?:\d{1,2}|[一二三四五六七八九十廿卅]{1,3})?[日號]?/g)].map(x=>dateOf(x[0])).filter(Boolean);
 if(moments.some(x=>x.m!==hit.m||x.d&&hit.d&&x.d!==hit.d))return '';
 return '已知會議在'+(hit.y?hit.y+'年':'')+hit.m+'月'+(hit.d?hit.d+'日':'')+'，不用重填；這是開會時間，不會自動變成收支截止日。';
}
function exactReply(q){
 const t=norm(q).replace(/[。！!?？]$/,'');
 return /^(?:選|看|要選|我要|我要問|那就|就是)?(?:當年度期中收支|今年期中(?:收支)?|本年期中(?:收支)?|期中(?:收支|報表)?|上年度正式決算|上年度決算|去年(?:的)?年度決算|去年決算|年度決算|年度(?:結算|報表))$/.test(t)
     ?(interim.test(t)?'期中':'年度'):null;
}
function filingAndGrant(t){
 if(!/補助|補助款/.test(t)||!/紀錄|記錄|紀要/.test(t)||!/縣府|縣政府|屏東/.test(t)||!/理監事會|理事會|監事會/.test(t)
     ||!/沒(?:有)?(?:另外|再|單獨|分別)?(?:報|送)|沒(?:有)?(?:將|把).{0,16}(?:另送|另報|送縣|報縣)|只在.{0,9}留存|尚未(?:報|送)|未(?:另|另外)?(?:報|送)|不(?:另|另外)?(?:報|送)|(?:該|要|應)(?:另)?(?:報|送)/.test(t)
     ||!/繳回|收回|取消|撤銷|影響|追繳|能不能領|不予|補不了/.test(t))return null;
 const filed=/(?:財務|財報|決算|會計報告).{0,10}(?:已核備|已備查|已經報|已報|有送|都報)|已(?:經)?報(?:過)?(?:年度)?決算/.test(t);
 return {direct:true,category:'協會｜會議紀錄與屏東補助',title:'理監事會紀錄原則留存，不因未另報就一律追回補助',
  summary:'一般協會沒有把兩份理監事會議紀錄都另送縣府，不能單憑這一點就說已核定的補助一定取消或要繳回。先分清是否有依法必報的個別決議，再看核定函及專案條件。'+(filed?'您說年度決算已報或核備；先保留原備查憑據，不因這題自動補報。':''),
  steps:[record,formal,['補助資格和追回已核定款項是兩件事','屏東補助要點第5點第3款之4列財務資料未依規定陳報為不予補助事由。兩份原則自行留存的會議紀錄，不等於應報而未報的年度財務資料。第10點另處理未依用途支用、虛報等違規的追繳；核定函、目的事業主管機關或專案規則若另有條件，請以原核定單位對這一案的書面說明為準，不保證個案結果。']],
  refs:[refs.minutes,refs.year,refs.annual,refs.audit,refs.grant],questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function route(q,dateOf){
 const raw=String(q??'').trim(), t=norm(raw);
 if(!t||t.length>425||!subject.test(t)||outside.test(t)||/不是(?:一般)?協會|不是問協會/.test(t))return null;
 const grant=filingAndGrant(t);if(grant)return grant;
 if(/補助|核銷|除名|罷免|辭職|交接|回報|租約/.test(t))return null;
 const recordAsk=/紀錄|記錄|紀要|留存/.test(t);
 const both=/理事會/.test(t)&&/監事會/.test(t);
 if(!both||!separate.test(t)||!/收支|財務|期中|報表|決算|結算|結帳|截止/.test(t))return null;
 const chosen=t.match(/報表種類確認:(期中|年度)/)?.[1];
 const negInterim=/(?:不是|不問|不做|不用|不審)(?:今年(?:的)?|當年度(?:的)?)?(?:期中|年中|上半年)/.test(t);
 const negAnnual=/(?:不是|不問|不做|不用|不審)(?:上年度|去年)?(?:年度決算|年度結算|決算|年終)/.test(t);
 const isInterim=interim.test(t)&&!negInterim,isAnnual=annual.test(t)&&!negAnnual;
 const confuse=/當(?:成|作)?(?:正式)?年度決算|直接.{0,7}(?:年度決算|報(?:縣府|備))|沒(?:有)?查核|未(?:經|送).{0,4}監事會/.test(t);
 const ambiguous=!chosen&&!confuse&&((isInterim&&isAnnual&&uncertainty.test(t))||(!isInterim&&!isAnnual&&/哪種|不確定|還沒決定|這份報表/.test(t)));
 let state=chosen||(ambiguous?null:isInterim?'期中':isAnnual?'年度':null);
 if(!state&&!ambiguous&&!recordAsk)return null;
 const d=dateNote(raw,dateOf);
 const note=d?[['保留您已經提供的日期',d]]:[];
 const steps=[...note];
 if(ambiguous)steps.push(['同日分開開，可以共用已核對的資料','同一天的理事會與監事會可以看同一套同期間資料，並不各有一個法定結帳日；但今年的期中收支與去年的正式年度決算涵蓋不同期間，不能把兩種報表當一份。先選這次要處理哪種。']);
 if(state==='期中')steps.push(progress);
 if(state==='年度'||confuse||isAnnual&&!ambiguous&&isInterim)steps.push(formal);
 if(confuse)steps.push(['理事會的期中審議不能取代年度決算審核','期中已經討論或通過，不等於監事會已審年度決算，更不能把上半年的收支當一整年的結果直接報縣府。若監事會尚未查核，補足實際應辦程序後再依法處理。']);
 if(recordAsk||ambiguous)steps.push(record);
 const title=ambiguous?'兩會同日：先選期中收支或年度決算':state==='年度'?'兩會同日：上年度決算的截止日不隨會議改':confuse?'期中收支不能直接當成年度決算':'理事會和監事會可共用同一份期中收支資料';
 const summary=ambiguous?'兩場會議可共用同一套已核對的資料，不會各自多出一個法定截止日。先選期中收支還是年度決算。':
  state==='年度'?'兩會可看同一份上年度決算；一般曆年制截止12月31日，先經監事會審核再提會員大會，不用會議日當截止日。':
  confuse?'不可以把期中收支直接當年度決算，也不要跳過監事會查核。':
  '兩會可用同一個實際已結帳的截止日；不要把今年的期中帳當去年的年度決算。';
 const choices=ambiguous&&raw.length<340?[{label:'當年度期中收支',question:raw+'；報表種類確認：期中。'},{label:'上年度正式決算',question:raw+'；報表種類確認：年度。'}]:[];
 return {direct:true,category:'協會會務｜同日會議與財報',title,summary,steps,
  refs:[refs.flow,refs.year,refs.check,refs.annual,refs.audit,...(recordAsk||ambiguous?[refs.minutes]:[])],
  needsReportChoice:choices.length>0,questionState:{focus:ambiguous?'clarify':'compound'},
  ...(choices.length?{choiceHeading:'這次要審哪一種收支報表？',choices}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route:q=>route(q,require('./association-finance-meeting-month.js').dateOf),exactReply};return;}
root.verifiedAssociationSameDayFinance=q=>route(q,root.associationFinanceDateOf);
root.sameDayFinanceReply=exactReply;
})(typeof window!=='undefined'?window:globalThis);
