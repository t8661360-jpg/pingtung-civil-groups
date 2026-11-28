(function(root){
'use strict';
const law=(name,p,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+p+'&flno='+n});
const election=n=>law('人民團體選舉罷免辦法','D0050093',n);
const oral={title:'內政部：理事長於會員大會口頭辭職',source:'https://www.moi.gov.tw/News_Content.aspx?Create=1&n=14119&s=219866'};
const clock={title:'內政部：理事長准辭及補選如何起算',source:'https://www.moi.gov.tw/News_toggle3.aspx?PageSize=30&n=174&page=82&sms=9015'};
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>260||/合作社|公會|工會|基金會|農會|漁會|管委會|管理委員會|公司|過世|往生|死亡|身故|撤回|收回辭呈|辭呈.撤回|辭去理事職/.test(t))return null;
 const chair=/理事長/.test(t)||/辭呈|准辭/.test(t)&&/理事會/.test(t)&&/代理|出缺|補選|得票最高|誰接|任期/.test(t);
 if(!chair)return null;
 const verbal=/口頭.{0,8}(?:不做|不當|辭|卸任)|(?:不做|不當|辭職).{0,9}口頭/.test(t);
 const pending=/不准.{0,6}辭|拒絕.{0,6}(?:准辭|辭職|辭任)|(?:不開|不排|不處理|拖著|不表決|未決議|不議|沒人.{0,4}接).{0,12}/.test(t)&&/辭職|辭任|辭呈|准辭/.test(t);
 const approved=/已准辭|准辭後|決議准辭|已經.{0,5}准辭|已(?:通過|核准|同意).{0,5}(?:辭職|辭任|辭呈)/.test(t)&&!/沒有決議准辭|尚未決議准辭|不准辭|沒准辭|未准辭/.test(t);
 const noShortTerm=!/(?:不到|不足|未滿|少於).{0,2}(?:六|6)個月/.test(t)&&/(?:剩|還有|尚有|所遺|任期還|任期尚).{0,5}(?:六|七|八|九|十|[6-9]|1[0-9])個月|(?:六|6)個月(?:以上|整)/.test(t);
 const noStanding=/沒有常務理事|沒設常務理事|未設常務理事|無常務理事/.test(t);
 if(!verbal&&!pending&&!(approved&&/一個月|起算|任期|補選|代理|互推|出缺|生效|多久/.test(t)))return null;
 const oralStep=['不是由會員大會口頭宣告就生效','人民團體選舉罷免辦法第27條：理事長須以書面辭職，由理事會決議准辭，會員（代表）大會舉行時再提出報告。理事會是否准辭要看正式會議紀錄，不以口頭宣告或收到辭呈代替。'];
 const hold=['理事會不准或一直不處理時','第27條規定准辭程序，沒有明定理事會可因沒人接而無限期不議，也沒規定拖到某日自動出缺。可留書面辭呈、收件證明、催請列入議程的紀錄與章程。向原主管機關請教可如何依法召集、列案與確認權限；此時不要只憑票數最高就直接接任。'];
 const next=['從准辭決議日算，才進入補選或代理','內政部說明，理事會決議准辭之日為出缺日；從該日起一個月內原則補選。理事長所遺任期不足六個月，可在同一個月內依章程或由常務理事互推代理；未設常務理事時，由理事互推。'+(noStanding?' 您說沒有常務理事，所以符合不足六個月且選擇代理時，走理事互推。':' 得票最高的理事不是當然代理人。')];
 return {direct:true,category:'人民團體會務｜理事長辭職與代理',title:approved?'理事長已准辭：從理事會准辭決議日算一個月':verbal?'會員大會只口頭說不做，不等於已完成辭職':'理事會不准辭或不開會：先確認辭職程序，不直接視為出缺',
 summary:approved?(noShortTerm?'您說的剩餘任期不符合「不足六個月」的代理例外，應在一個月內補選。':'若只剩不到六個月，可在期限內依法互推代理，不一定得補選。')+'期限從准辭決議日算，不是收辭呈或大會報告的日期。':verbal?'只在會員大會口頭說不做，又沒有書面辭職和理事會准辭，不因這句話就卸任。':'理事長辭職要書面提出，由理事會決議准辭。條文未明定不准辭或久不議的效果，不能因此說理事會可無限期拒絕，也不能把最高票理事直接當接任人。',
 steps:approved?[next,oralStep]:verbal?[oralStep,next]:[hold,oralStep,next],refs:[election(27),election(17),oral,clock],questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationChairResignationDeadlock=route;
})(typeof window!=='undefined'?window:globalThis);
