(function(root){
'use strict';
const law=(title,code,n)=>({title:title+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const assoc=n=>law('人民團體法','D0050091',n);
const guide=n=>law('人民團體會務輔導辦法','D0020094',n);
const interpretation={title:'內政部台內團字第1020287241號函：依法召集但出席不足',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256698'};
function answer(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(/合作社|公會|工會|公司|董事|財團法人|農會|漁會|大廈|業主委員會|理監事聯席|會員(?:代表)?大會/.test(t))return null;
 if(!/協會|人民團體|社會團體|本會|理事會|監事會/.test(t))return null;
 if(/理事會|監事會/.test(t)&&/流會|開不成|未成會|不足額|出席不足|不到半數|沒有過半數出席|出席不夠/.test(t)&&/理事長|召集人|常務監事/.test(t)&&/撤換|罷免|解除|免職|不(?:召集|開會)|不為召集|同一回事/.test(t)){
  const spec=/監事會/.test(t)&&!/理事會/.test(t)?'監事':'理事';
  return {direct:true,category:'人民團體會務說明',title:'依法召集但流會，不等於召集人無故不開會',
   summary:'不一定要換人。若已依法令或章程召集，只因出席不足而流會，不能單憑兩次流會就依人民團體法第30條解除職務。',
   steps:[['無故不召開','第30條要件是無正當理由不召開對應的理事會或監事會，且超過二個會次；由主管機關依法解除理事長或監事會召集人職務，不是流會兩次就自動解任。'],
    ['會議仍開不成','依人民團體會務輔導辦法第14條，連續召集三次以上仍未成會，或未在收到合法書面連署後的法定期限內開完臨時會議時，主管機關得依第32條指定一名'+spec+'召集。這是協助成會，不是解除職務。可把通知、簽到和流會紀錄交主管機關判斷。']],
   refs:[assoc(29),assoc(30),assoc(32),guide(13),guide(14),interpretation]};
 }
 const direction=/監事會|監事.{0,4}(?:逾期|不開|未開|不召集|沒開)|常務監事.{0,4}(?:不開|不召集)/.test(t)&&/理事長|會長/.test(t)&&/代(?:為|替)?(?:召集|召開|開會|接手)|由理事長接手|理事長.{0,8}(?:接手|召集監事會|開監事會)|理事長來召集/.test(t);
 // When the actor is the supervisor and the office being deputized is the chair, retain that question's own route.
 if(!direction||/監事.{0,6}(?:代理|代替|代為執行)理事長/.test(t))return null;
 return {direct:true,category:'人民團體會務說明',title:'監事會逾期未開：理事長不能只憑職位直接接手',
  summary:'理事會與監事會分別召集。監事會原則由監事會召集人（常務監事）召集，不是由理事長直接代替；監事會不能依法召開時，主管機關得指定一名監事召集。',
  steps:[['先核對召集程序','監事過半數可以書面連署要求開臨時監事會，以雙掛號通知監事會召集人、取得回執後報主管機關備查。收到連署後15日內應開完；召集人不能親自召集時，按章程所定代理程序辦理，不能只憑理事長身分接管。'],
   ['請主管機關處理','若連續召集三次以上未成會，或未在法定期限內開完臨時監事會，主管機關得依人民團體法第32條及輔導辦法第14條指定一名監事召集。若監事會召集人無正當理由不開超過二個會次，則另依第30條處理解除職務、另行改推；不是理事長自行解任或取代。']],
  refs:[guide(11),guide(13),guide(14),assoc(30),assoc(32)]};
}
if(typeof module!=='undefined'&&module.exports){module.exports={answer};return;}
root.verifiedMeetingConveningAnswer=answer;
})(typeof window!=='undefined'?window:globalThis);
