(function(root){
'use strict';
const act='https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050091';
const exRefs=[
 {title:'人民團體法第12、14、25、26、27條：章程、除名與大會程序',source:act},
 {title:'人民團體會務輔導辦法第10條：大會通知及議程',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0020094&flno=10'},
 {title:'內政部台內社字第1010320591號：除名是正式提案還是臨時動議',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256687&sms=12360'}
];
const collRefs=[
 {title:'民法第103、169、170條：代理權及對本人效力',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=B0000001'},
 {title:'商業團體法第12條：公司、行號與公會會員身分',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0050100&flno=12'}
];
const vote=['除名的事由和決議門檻','有違反法令、章程或不遵守大會決議，且危害團體情節重大，才能依人民團體法第14條提大會決議；還要核對章程所定程序。依第27條，會員（代表）過半數出席，出席者三分之二以上同意。理事會可依章程查明與提案，不能以自身決議取代會員（代表）大會。'];
const notice=['先核對通知、議程和章程','依法召集的臨時會員大會可以審議除名，但它和會議現場才提出的臨時動議不同。通常應於大會十五日前把會議種類、時間、地點及議程通知應出席者。緊急事故的例外須於開會前一日送達，不是來不及準備就適用。這不免除除名的重大事由與決議門檻。'];
const floor=['通知沒寫，不能只憑「臨時動議」認定有效或無效','內政部台內社字第1010320591號函說，除名要正式提案或可用臨時動議，法無明文。仍要核對通知與議程、章程及召集程序。較穩妥是先列除名案與理由、依法通知及給當事人說明機會，再開會表決；已表決的個案請保留通知、表決及會議紀錄，逐案核對。'];
const check=['公司以公會名義收款｜會員身分不是代收授權','先不要匯入尚未核實的公司或個人帳戶。用同業公會公開的聯絡方式另外核對：是否真有這筆費用、由誰收、是否有委託代收及授權範圍、正式收款帳戶與戶名、應開立何種收據或憑證。不要只靠催款訊息中的電話或連結。'];
const effect=['若已付款，保留收款通知及交易憑證','公司是商業同業公會會員，不等同有代理收款權。民法的代理或無權代理效果要看授權、對方表現和個案事證；僅看名稱不能斷定合法、違法或已向公會清償。若已付款而無法核對，保留通知與交易證明，透過公會及原金融機構的官方管道查核；不必把完整帳號、身分資料貼在聊天中。'];
const base={direct:true,category:'一般協會會議｜除名與議程',questionState:{focus:'compound'}};
const unknown=s=>/不確定|不知道|不清楚|分不清|看不出|忘了/.test(s);
function expulsionPart(s){
 if(!/協會|社會團體|人民團體/.test(s)||!/除名|開除會員/.test(s)||/公會|合作社|工會|不是除名|非除名|罷免(?:理事|監事|理事長)/.test(s))return null;
 if(!/臨時(?:會員|代表)?大會|臨時動議|議程|理事會.{0,16}(?:除名|開除會員)|(?:除名|開除會員).{0,10}理事會/.test(s))return null;
 const board=/理事會.{0,16}(?:直接|表決|決定|可以|能不能).{0,14}(?:除名|開除會員)|(?:除名|開除會員).{0,15}只經理事會/.test(s)&&!/臨時(?:會員|代表)?大會|臨時動議/.test(s);
 const notListed=/沒(?:有)?(?:寫|列)|未(?:列|列入|寫|通知)|現場.{0,10}(?:臨時|加案|才提|才說)|臨時動議/.test(s);
 const listed=!notListed&&/已(?:經)?(?:列|寫).{0,8}(?:議程|除名|通知)|通知.{0,8}已經列|議程.{0,6}有寫/.test(s);
 const unsure=unknown(s)&&/通知|議程/.test(s)&&!board;
 const summary=board?'不能由理事會直接除名。理事會可查明事由與提案，除名須由會員（代表）大會依法決議。':unsure?'先查看通知和議程是否列有除名案；不清楚前不要直接認定現場能表決。會員除名仍屬大會職權。':listed?'若通知已列除名案，依法召集的臨時會員大會可以依章程及法定門檻審議，不是臨時會議就一律不能除名。':notListed?'通知未列、現場才提除名，不能一概說可以、有效或無效。先核對章程及通知程序；較穩妥是正式列議程後依法通知。':'依法召集的臨時會員大會與現場臨時動議不是一回事。若已列議程且程序正確，仍須符合重大事由及法定表決門檻。';
 return {summary,steps:board?[vote]:[vote,notice,...(!listed?[floor]:[])],unsure,board};
}
function collectionPart(s){
 return /公司|行號/.test(s)&&/同業公會|商業公會/.test(s)&&/名義|代收|要我.{0,6}匯|匯到公司|匯到.{0,6}公司/.test(s)&&/收款|繳費|款項|匯|費用|會費|報名費/.test(s);
}
function agendaCollection(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>270)return null;
 const parts=t.split(/[；;。？！?!]+|另外|順便|再(?:請)?問|[，,](?=(?:至於|除此之外|一般協會|我們協會|協會|公司))/).filter(Boolean);
 const c=parts.findIndex(collectionPart);
 let e=parts.findIndex(x=>Boolean(expulsionPart(x)));
 let x=e<0?null:expulsionPart(parts[e]);
 if(c<0&&parts.length>1)x=expulsionPart(t)||x;
 if(c>=0&&!x){
  if(parts.some((p,i)=>i!==c&&!/^(?:怎麼辦|怎麼查|可不可以|安全嗎|可以嗎|要不要先付)$/.test(p)))return null;
  return {...base,category:'商業團體｜受託收款與查核',title:'公司以公會名義收款，先查證代收授權',summary:'即使是公會會員，也不能只憑公司或公會名稱認定這筆款有權代收。匯款前先用公會正式管道查明。',steps:[check,effect],refs:collRefs};
 }
 if(!x)return null;
 const mixed=c>=0&&e!==c;
 const choicePrefix=mixed?'股份有限公司以同業公會名義收款要怎麼查？另外':'';
 const choices=[{label:'通知已列除名案',question:choicePrefix+'一般協會臨時會員大會，通知已列除名議程，能決議嗎？'},{label:'通知未列，現場才提',question:choicePrefix+'一般協會臨時會員大會通知未列除名，現場能加案或表決嗎？'}];
 const collectSummary='公司是公會會員，不等於有權代收；先獨立核對委託、受款戶名與收據。';
 return {...base,title:mixed?'公會代收款與協會除名，是兩個不同問題':x.board?'理事會不能直接取代會員大會除名':'先分清臨時會員大會與現場臨時提除名',summary:mixed?(c<e?collectSummary+' '+x.summary:x.summary+' '+collectSummary):x.summary,steps:mixed?(c<e?[check,effect,...x.steps]:[...x.steps,check,effect]):x.steps,refs:mixed?[...collRefs,...exRefs]:exRefs,...(x.unsure?{choiceHeading:'開會通知是否已列除名？',choices}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={agendaCollection};return;}
root.verifiedAssociationAgendaGuildCollection=agendaCollection;
})(typeof window!=='undefined'?window:globalThis);
