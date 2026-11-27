(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
function subject(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 const claim=/債權/.test(t)&&/申報|報債權|報明|來報/.test(t);
 if((!/清算|解散/.test(t)&&!claim)||!/登報|公告|公示|報紙|刊登|通知.{0,5}債權人|債權人.{0,5}通知|催告|報明債權/.test(t)&&!claim)return null;
 if(/信用合作社|計程車|儲蓄互助社|財團法人|祭祀公業|政黨|工會|公會|管委會|公司|破產|訴訟|公告.*登記生效/.test(t))return null;
 if(/合作社/.test(t))return 'coop';
 return /協會|社團|人民團體|人民組織|法人|清算人|債權/.test(t)?'association':null;
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
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(/沒在.{0,4}期限|沒有在.{0,4}期限|逾期|沒申報|沒有申報|未申報|沒報|來不及|過了期限|超過期限|期限過/.test(t)&&/債權/.test(t))
 return {...base,category:'人民團體會務說明',title:'債權人逾期沒申報債權：不列入清算，但清算人明知的債權人不在此限',
 summary:'已完成社團法人登記的協會，清算依民法第41條準用股份有限公司清算的規定。依公司法第327條，清算人公告時要聲明「逾期不申報者，不列入清算之內」，但為清算人所明知的債權人不在此限，而且清算人明知的債權人還要分別通知。\n不列入清算的債權人，對還沒分派的剩餘財產仍有請求權；但剩餘財產已經分派，且其中全部或一部已經領取的，就不能再請求（公司法第329條）。\n另外，清算人不得在申報期限內對債權人清償，有擔保債權經法院許可的除外（公司法第328條）。\n只有協會立案、沒有法人登記的，本站查不到明文規定，請洽承辦人員或律師。',
 statutes:[law('民法','B0000001',41),law('公司法','J0080001',327),law('公司法','J0080001',328),law('公司法','J0080001',329)]};
 return {...base,category:'人民團體會務說明',title:'協會解散要不要登報：先分辨解散消息和清算的債權人公告',
 summary:'單純對外發布「協會解散」的消息，和清算時依法催告債權人，是兩件事。\n\n已完成社團法人登記：依民法第40、41條及準用的公司法第327條，清算人就任後應即以三次以上之公告，催告債權人於三個月內申報；已知債權人另須分別通知。這是法定清算程序，不能由會員大會決定省略。第327條要求公告，沒有指定一律登報；在屏東辦理，請先向管轄法院確認接受的公告方式和應留存的證明。\n\n只有協會立案、未辦法人登記：依人民團體會務輔導辦法第27條，先依章程或會員大會決議辦清算；章程沒規定或大會開不成時，由理事長或章程代理人擔任清算人；無法產生時由主管機關選任。適用該條準用民法的情況，就不能把公告一律視為自由選擇；有債務或不確定適用哪種程序，先向主管機關確認。',
 statutes:[law('人民團體會務輔導辦法','D0020094',27),law('民法','B0000001',40),law('民法','B0000001',41),law('公司法','J0080001',327)]};
}
function liquidationFollowup(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!/清算|解散|債權人|債權/.test(t)||/信用合作社|合作社|儲蓄互助社|財團法人|祭祀公業|政黨|工會|公會|公司|破產|訴訟|管委會|沒有法人登記|未辦.{0,5}法人登記/.test(t))return null;
 const base={direct:true,notes:[],category:'人民團體會務說明',actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 if(/債權|債務/.test(t)&&/(先|可以|能不能|能否|可不可以|要不要).{0,4}(還|償|清償|付|給)/.test(t)&&/(期限|申報|公告|催告|報完)/.test(t))
  return {...base,title:'申報期限內能不能先還債權人：原則上不行，有擔保債權經法院許可才可以',
  summary:'已完成社團法人登記的協會，清算依民法第41條準用股份有限公司清算的規定。依公司法第328條，清算人不得在申報期限內對債權人清償；只有有擔保的債權，經法院許可才不在此限。\n沒有在期限內清償的債權，仍要負遲延給付的損害賠償責任；如果資產明顯足以還清負債，這類可能產生賠償責任的債權，經法院許可後可以先清償（公司法第328條）。\n只有協會立案、沒有法人登記的，本站查不到明文，請洽承辦人員或律師。',
  statutes:[law('民法','B0000001',41),law('公司法','J0080001',328)]};
 if(/清算/.test(t)&&/(完結|完成|完畢|結束|做完|辦完|完了)/.test(t)&&/(報告|報給|向誰|法院|收支表|損益表|報表)/.test(t)&&/(法人|法院)/.test(t))
  return {...base,title:'社團法人清算完結後：收支表、損益表要在承認後十五日內向法院聲報',
  summary:'已完成社團法人登記的協會，清算屬於法院監督（民法第42條）；清算的程序準用股份有限公司清算的規定（民法第41條）。\n依公司法第331條，清算完結時，清算人要在十五日內造具清算期內收支表、損益表，連同各項簿冊送審查並提請承認；收支表、損益表經承認後十五日內，要向法院聲報。\n另外，依章程規定或總會決議解散的，董事應在十五日內報告法院（民法第42條）。\n公司法條文寫的是「監察人」「股東會」，協會要怎麼對應（例如由監事審查、會員大會承認），條文沒有逐項寫明，細節請向管轄法院確認，並洽縣府承辦人員。',
  statutes:[law('民法','B0000001',41),law('民法','B0000001',42),law('公司法','J0080001',331)]};
 return null;
}
function keepNoticeQuestion(q,normalize){return (subject(q)||courtRegistrationNotice(q)||liquidationFollowup(q))?String(q):normalize(q);}
if(typeof module!=='undefined'&&module.exports){module.exports={courtRegistrationNotice,creditorNotice,liquidationFollowup,keepNoticeQuestion};return;}
const previous=root.verifiedRoundAnswer,normalize=root.normalizeQuestion;
root.verifiedRoundAnswer=function(q,ctx){return courtRegistrationNotice(q)||liquidationFollowup(q)||creditorNotice(q)||previous.call(this,q,ctx);};
root.normalizeQuestion=function(q){return keepNoticeQuestion(q,normalize);};
})(typeof window!=='undefined'?window:globalThis);
