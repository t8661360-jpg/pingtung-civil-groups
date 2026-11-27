(function(root){
'use strict';
const association=n=>law('人民團體法','D0050091',n);
const coop=n=>law('合作社法','D0050112',n);
function law(title,code,n){return {title:title+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n};}
const shareInterest=/股息|社股(?:的)?(?:年)?息|股金(?:的)?(?:年)?利息/;
const stockCompany=/股份有限公司|股份公司/;
const companyRef=n=>law('公司法','J0080001',n);
const topics={
 companyInterest:{hit:t=>stockCompany.test(t)&&/股息|股利|紅利/.test(t)&&/上限|多少|最高|有沒有限制|限制|幾%|幾成/.test(t),
  line:['股份有限公司股息','不適用合作社的社股年息上限。依公司法的一般盈餘分派規則，公司應先彌補虧損並依法提列法定盈餘公積；通常按股東持股比例分派。法律另有規定或涉及特別股時須另核對，不能套用合作社的固定上限。'],laws:[companyRef(232),companyRef(235)]},
 creditor:{hit:t=>/清算/.test(t)&&/就任|上任|到任/.test(t)&&/公告|催報|催告/.test(t)&&/債權/.test(t)&&/多久|幾天|幾日|何時|期限|什麼時候/.test(t),
  line:['清算人就任後的債權公告','清算人應在就任後十五日內公告催告債權人申報；債權申報期限不得少於十五日。已知的債權人另須分別通知。這不是清算終結的報告期限。'],laws:[coop(64)]},
 report:{hit:t=>/清算/.test(t)&&/多久|幾天|幾日|何時|期限|什麼時候/.test(t)
  && !/就任|上任|到任|報明債權|催告債權人|聲請解散登記/.test(t)
  && (/報告|呈報|報送/.test(t)||(/完成清算|清算(?:事務)?(?:完成|結束|終了|終結|完畢|完結)|清算完了/.test(t)&&/報(?:縣府|主管機關)|主管機關.{0,6}備查/.test(t))),
  line:['清算終結報告','清算事務終了後，清算人應於20日內造具報告書，呈報主管機關並分送各社員；由法院選派者，另須呈報法院。'],laws:[coop(65)]},
 interest:{hit:t=>shareInterest.test(t)&&/上限|多少|最高|有沒有限制|限制|幾%|幾成/.test(t),
  line:['社股年息','有上限：一般合作社的社股年息不得超過百分之十，沒有結餘就不能發息。這是一般年度股息規則，不是清算剩餘財產的分配比例。'],laws:[coop(22)]},
 admission:{hit:t=>/入會|加入|(?:當|成為)[^，,？?。；;]{0,9}會員/.test(t)&&/不住|沒住|不是屏東人|非屏東人|外縣市|外地|外鄉|外村|外里|不是里民|戶籍|設籍|居住|住在/.test(t),
  line:['外地居民能否入會','不住屏東不一定不能加入。一般社會團體要對照該會現行章程的入會資格，看是否要求特定戶籍、居住地或其他條件；不是屏東人、未設籍、未居住是不同情形，不能混為一談；社區發展協會還要核對章程的組織區域與會員類別。'],laws:[association(12)]},
 expulsion:{hit:t=>/踢掉|踢出|開除|除名/.test(t)&&/理事長|會長|理事會|會員大會|誰/.test(t),
  line:['誰能決定除名','理事長或理事會不能自行決定。若會員違反法令、章程或不遵守大會決議，致危害團體情節重大，須由會員（代表）大會決議，並經出席人數三分之二以上同意。若問題是遷出後是否喪失資格，這是第15條的出會事由，與懲戒除名不同；先核對現行章程及資格事實，不宜只因不是里民就當成已除名。'],laws:[association(14),association(15),association(27)]}
};
function identify(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>130||/信用合作社|儲蓄互助社|農會|漁會|工會|公會|商業團體|職業團體|財團法人|管委會|信用部/.test(t))return null;
 const chunks=t.split(/[?？。；;！!]|[,，](?=(?:那|還|另|以及|而|同時|另外|又))|另外|還想問/).filter(x=>x.length>2);
 const c=/合作社/.test(t),a=/協會|社會團體|人民團體/.test(t);
 const financeExclusion=/清算(?:剩餘|賸餘)財產|遺產|股息扣繳|課稅|欠稅|銀行|貸款|借款|存款/;
 if(/公司/.test(t)){
  if(a||financeExclusion.test(t)||/特別股|資本公積|開業前|解散分配/.test(t))return null;
  if(!c&&chunks.length===1&&topics.companyInterest.hit(chunks[0]))return ['companyInterest'];
  if(c&&chunks.length===2){
   const legs=chunks.map(x=>topics.companyInterest.hit(x)&&!/合作社/.test(x)?'companyInterest':/合作社/.test(x)&&!/公司/.test(x)&&topics.report.hit(x)?'report':null);
   if(legs.includes('companyInterest')&&legs.includes('report'))return legs;
  }
  return null;
 }
 if(c&&!a&&chunks.length===2&&!financeExclusion.test(t)){
  const legs=chunks.map(x=>topics.creditor.hit(x)?'creditor':topics.report.hit(x)?'report':null);
  if(legs.includes('creditor')&&legs.includes('report'))return legs;
 }
 if(c===a)return null;
 if(c&&/清算(?:剩餘|賸餘)財產|遺產|股息扣繳|課稅|欠稅|銀行|貸款|借款|存款/.test(t))return null;
 if(a&&/基金退還|退費|自願退會|章程要怎麼改/.test(t))return null;
 const keys=c?['report','interest']:['admission','expulsion'];
 if(chunks.length>2)return null;
 if(chunks.length===2&&chunks.some(x=>!keys.some(k=>topics[k].hit(x))))return null;
 if(!keys.every(k=>topics[k].hit(t)))return null;
 const rank=k=>t.search(({report:/清算/,interest:shareInterest,admission:/入會|加入|(?:當|成為).{0,9}會員/,expulsion:/踢掉|踢出|開除|除名/})[k]);
 return keys.sort((x,y)=>rank(x)-rank(y));
}
function verifiedComparison(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>140)return null;
 if(/信用合作社/.test(t)&&/合作社/.test(t.replace(/信用合作社/g,''))&&/股息|股利|社股(?:年)?息/.test(t)&&/結餘|盈餘|上限|一樣|相同|差別|不同|多少|發不發|能發/.test(t)&&!/公司|存款|銀行利息|貸款|借款|扣繳|清算|退股|保險合作社/.test(t)){
  const b1=['一般合作社','合作社法第22條規定，沒有結餘不能發息；社股年息不得超過百分之十。這不是保證給付。'];
  const b2=['信用合作社','依信用合作社法第23條，當年度沒有盈餘也不得分配社股股息；有稅後盈餘時，先彌補累積虧損，再依規定提列法定盈餘公積，才能分配股息。第24條是公積提撥的例外。第23、24條沒有另寫股息百分比上限，其他法規的適用須依合作社法第3條之1及相關規定核對，不能從這兩條推論沒有上限。'];
  return {direct:true,category:'合作社財務',title:'一般合作社與信用合作社的股息，分開看',summary:'沒有結餘或盈餘時，兩者都不能發社股股息；有盈餘時，適用的分配順序不同。',steps:t.indexOf('信用合作社')===t.indexOf('合作社')-2?[b2,b1]:[b1,b2],refs:[coop(22),law('合作社法','D0050112','3-1'),law('信用合作社法','G0380058',23),law('信用合作社法','G0380058',24)]};
 }
 if(/協會|社會團體/.test(t)&&/會員(?:[（(]?代表[）)]?)?大會|會員.{0,9}大會/.test(t)&&/理事會|監事會/.test(t)&&/委託|代理|代.{0,3}出席/.test(t)&&!/職業團體|合作社|工會|公會|公司|董事|投票|選舉|罷免|法人代表/.test(t)){
  const a1=['會員（代表）大會','一般社會團體會員不能親自出席時，可以書面委託其他會員（會員代表）代理，每位受託人最多代理一人。非會員家人不能只憑親屬關係代理。'];
  const a2=['理事會或監事會','理事、監事要親自出席各自的理事會或監事會，不得委託他人代理。即使是另一位理事或監事，也不能代為出席。'];
  return {direct:true,category:'人民團體會務說明',title:'會員大會可書面委託，理事會與監事會不能比照',summary:'要先看是會員身分出席大會，還是以理事、監事身分出席各自的會議。',steps:t.search(/理事會|監事會/)<t.search(/大會/)?[a2,a1]:[a1,a2],refs:[association(42),association(31)]};
 }
 return null;
}
function answerMixed(q){
 const comparison=verifiedComparison(q);if(comparison)return comparison;
 const keys=identify(q);if(!keys)return null;
 const isCoop=keys.includes('report');
 return {direct:true,category:isCoop?'合作社財務':'人民團體會務說明',
  title:keys.includes('companyInterest')?(isCoop?'股份有限公司股息與合作社清算報告，分開看':'股份有限公司股息依公司法，不是合作社社股年息'):
    keys.includes('creditor')?'合作社清算：就任後公告與終結報告，分別計算':isCoop?'合作社清算報告與股息上限，分開看':'協會入會資格與會員除名，分開看',
  summary:keys.length===1?topics[keys[0]].line[1]:'你問了兩件事，分別如下。',steps:keys.length>1?keys.map(k=>topics[k].line):[],refs:keys.flatMap(k=>topics[k].laws)};
}
if(typeof module!=='undefined'&&module.exports){module.exports={identify,answerMixed};return;}
root.verifiedMixedQuestionAnswer=answerMixed;
})(typeof window!=='undefined'?window:globalThis);
