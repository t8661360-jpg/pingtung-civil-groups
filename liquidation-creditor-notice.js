(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
function subject(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!/清算|解散/.test(t)||!/登報|公告|公示|報紙|刊登|通知.{0,5}債權人|債權人.{0,5}通知|催告|報明債權/.test(t))return null;
 if(/信用合作社|計程車|儲蓄互助社|財團法人|祭祀公業|政黨|工會|公會|管委會|公司|破產|訴訟|公告.*登記生效/.test(t))return null;
 if(/合作社/.test(t))return 'coop';
 return /協會|社團|人民團體|人民組織|法人/.test(t)?'association':null;
}
function courtRegistrationNotice(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!/法院|司法網站|法人登記公告/.test(t)||!/清算終結|清算完成|清算完畢|解散/.test(t)||!/公告|公布|刊登|登報|通知債權人/.test(t))return null;
 if(!/社團法人|協會法人|已辦.{0,5}法人登記|法人登記公告/.test(t)||/合作社|財團法人|公司|工會|公會|破產|未辦.{0,5}法人登記|沒有法人登記/.test(t))return null;
 // A question solely about asking a court to publish the liquidator's notice is not a registration question.
 if(/請法院|委託法院|聲請法院|向法院申請/.test(t)&&!/登記公告|解散登記|清算終結登記/.test(t))return null;
 const closing=/清算終結|清算完成|清算完畢/.test(t);
 const askingAboutCreditors=/債權人|債權申報/.test(t);
 const filing=closing
  ?'清算終結後，由清算人向法院登記處聲請清算終結登記，並附清算各事項已獲承認的證明。法院辦妥登記後，才會發布清算終結的登記公告。'
  :'如果法院網站刊登的是「解散登記公告」，它公開的是已完成的法人解散登記。解散登記通常由清算人聲請；法院或有關機關命令解散的情形，由有關機關囑託登記。';
 return {direct:true,notes:[],category:'人民團體會務說明',
  title:closing?'法院登記公告：社團法人清算終結登記後會發布':askingAboutCreditors?'法院登記公告不能取代清算人通知債權人':'法院登記公告：社團法人解散登記後會發布',
  summary:filing+'\n\n依非訟事件法第93條，法院登記處應在登記後三日內於公告處公告七日以上，並在法院網站刊出公告副本或摘要；必要時也可命登載於公報或報紙。可到司法院的「法人登記公告」查詢。\n\n這項法院登記公告不能取代清算人的債權申報公告或個別通知。依民法第41條準用公司法第327條，清算人就任後應立即公告至少三次，催告債權人於三個月內申報；已知債權人還要個別通知。公告媒介及所需證明，請向管轄法院確認；屏東地方法院總機 (08) 755-0611。',
  statutes:[law('非訟事件法','B0010008',closing?91:88),law('非訟事件法','B0010008',93),law('民法','B0000001',41),law('公司法','J0080001',327),
   {title:'司法院法人登記公告查詢',source:'https://www.judicial.gov.tw/tw/lp-144-1.html'},{title:'司法院：各法院聯絡資訊',source:'https://www.judicial.gov.tw/tw/cp-1889-119101-8a7a0-1.html'}]};
}
function creditorNotice(q){
 const kind=subject(q);
 if(!kind)return null;
 const base={direct:true,notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 if(kind==='coop')return {...base,category:'合作社會務',title:'合作社解散有兩道債權人通知程序：解散或合併公告、清算人催告',
 summary:'第一道：合作社解散或合併時，應於一個月內分別通知各債權人並公告，指定至少一個月讓債權人提出異議（合作社法第59條）。\n\n第二道：開始清算時，清算人應於就任後十五日內公告，催告債權人限期申報債權；申報期限不得少於十五日。已知的債權人還要分別通知（合作社法第64條）。這不是第59條的異議期間，不要把兩個起算日或期限混在一起。\n\n條文要求公告，但上述兩條未指定一律刊登報紙。應向合作社主管機關確認公告方式及送件證明；不能只通知已知人就省略法定公告。',
 statutes:[law('合作社法','D0050112',59),law('合作社法','D0050112',64)]};
 return {...base,category:'人民團體會務說明',title:'協會解散要不要登報：先分辨解散消息和清算的債權人公告',
 summary:'單純對外發布「協會解散」的消息，和清算時依法催告債權人，是兩件事。\n\n已完成社團法人登記：依民法第40、41條及準用的公司法第327條，清算人就任後應即以三次以上之公告，催告債權人於三個月內申報；已知債權人另須分別通知。這是法定清算程序，不能由會員大會決定省略。第327條要求公告，沒有指定一律登報；在屏東辦理，請先向管轄法院確認接受的公告方式和應留存的證明。\n\n只有協會立案、未辦法人登記：依人民團體會務輔導辦法第27條，先依章程或會員大會決議辦清算；章程沒規定或大會開不成時，由理事長或章程代理人擔任清算人；無法產生時由主管機關選任。適用該條準用民法的情況，就不能把公告一律視為自由選擇；有債務或不確定適用哪種程序，先向主管機關確認。',
 statutes:[law('人民團體會務輔導辦法','D0020094',27),law('民法','B0000001',40),law('民法','B0000001',41),law('公司法','J0080001',327)]};
}
function keepNoticeQuestion(q,normalize){return (subject(q)||courtRegistrationNotice(q))?String(q):normalize(q);}
if(typeof module!=='undefined'&&module.exports){module.exports={courtRegistrationNotice,creditorNotice,keepNoticeQuestion};return;}
const previous=root.verifiedRoundAnswer,normalize=root.normalizeQuestion;
root.verifiedRoundAnswer=function(q,ctx){return courtRegistrationNotice(q)||creditorNotice(q)||previous.call(this,q,ctx);};
root.normalizeQuestion=function(q){return keepNoticeQuestion(q,normalize);};
})(typeof window!=='undefined'?window:globalThis);
