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
function keepNoticeQuestion(q,normalize){return subject(q)?String(q):normalize(q);}
if(typeof module!=='undefined'&&module.exports){module.exports={creditorNotice,keepNoticeQuestion};return;}
const previous=root.verifiedRoundAnswer,normalize=root.normalizeQuestion;
root.verifiedRoundAnswer=function(q,ctx){return creditorNotice(q)||previous.call(this,q,ctx);};
root.normalizeQuestion=function(q){return keepNoticeQuestion(q,normalize);};
})(typeof window!=='undefined'?window:globalThis);
