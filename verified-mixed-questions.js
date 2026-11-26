(function(root){
'use strict';
const association=n=>law('人民團體法','D0050091',n);
const coop=n=>law('合作社法','D0050112',n);
function law(title,code,n){return {title:title+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n};}
const topics={
 report:{hit:t=>/清算/.test(t)&&/報告|呈報|報送/.test(t)&&/多久|幾天|何時|期限|什麼時候/.test(t),
  line:['清算終結報告','清算事務終了後，清算人應於20日內造具報告書，呈報主管機關並分送各社員；由法院選派者，另須呈報法院。'],laws:[coop(65)]},
 interest:{hit:t=>/股息|社股(?:年)?息|股金利息/.test(t)&&/上限|多少|最高|有沒有限制|限制|幾%|幾成/.test(t),
  line:['社股年息','有上限：一般合作社的社股年息不得超過百分之十，沒有結餘就不能發息。這是一般年度股息規則，不是清算剩餘財產的分配比例。'],laws:[coop(22)]},
 admission:{hit:t=>/入會|加入|當會員/.test(t)&&/不住|沒住|外縣市|外地|戶籍|設籍|居住|住在/.test(t),
  line:['外地居民能否入會','不住屏東不一定不能加入。一般社會團體要對照該會現行章程的入會資格，看是否要求特定戶籍、居住地或其他條件；不能單憑「不住屏東」就判定。'],laws:[association(12)]},
 expulsion:{hit:t=>/踢掉|踢出|開除|除名/.test(t)&&/理事長|會長|理事會|會員大會|誰/.test(t),
  line:['誰能決定除名','理事長或理事會不能自行決定。若會員違反法令、章程或不遵守大會決議，致危害團體情節重大，須由會員（代表）大會決議，並經出席人數三分之二以上同意。'],laws:[association(14),association(27)]}
};
function identify(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>130||/信用合作社|儲蓄互助社|農會|漁會|工會|公會|商業團體|職業團體|財團法人|管委會|信用部/.test(t))return null;
 const c=/合作社/.test(t),a=/協會|社會團體|人民團體/.test(t);
 if(c===a)return null;
 if(c&&/清算(?:剩餘|賸餘)財產|遺產|股息扣繳|課稅|欠稅/.test(t))return null;
 if(a&&/基金退還|退費|自願退會|章程要怎麼改/.test(t))return null;
 const keys=c?['report','interest']:['admission','expulsion'];
 const chunks=t.split(/[?？。；;！!]|[,，](?=(?:那|還|另|以及|而|同時|另外|又))|另外|還想問/).filter(x=>x.length>2);
 if(chunks.length>2)return null;
 if(chunks.length===2&&chunks.some(x=>!keys.some(k=>topics[k].hit(x))))return null;
 if(!keys.every(k=>topics[k].hit(t)))return null;
 const rank=k=>t.search(({report:/清算/,interest:/股息|社股(?:年)?息|股金利息/,admission:/入會|加入|當會員/,expulsion:/踢掉|踢出|開除|除名/})[k]);
 return keys.sort((x,y)=>rank(x)-rank(y));
}
function answerMixed(q){
 const keys=identify(q);if(!keys)return null;
 const isCoop=keys.includes('report');
 return {direct:true,category:isCoop?'合作社財務':'人民團體會務說明',
  title:isCoop?'合作社清算報告與股息上限，分開看':'協會入會資格與會員除名，分開看',
  summary:'你問了兩件事，分別如下。',steps:keys.map(k=>topics[k].line),refs:keys.flatMap(k=>topics[k].laws)};
}
if(typeof module!=='undefined'&&module.exports){module.exports={identify,answerMixed};return;}
root.verifiedMixedQuestionAnswer=answerMixed;
})(typeof window!=='undefined'?window:globalThis);
