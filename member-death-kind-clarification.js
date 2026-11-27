(function(root){
'use strict';
const law=(title,p)=>({title,source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+p});
const aRefs=[law('人民團體法第12、13、15條：章程、推派與失去會籍','D0050091'),law('人民團體會務輔導辦法第10條：會籍資料更新','D0020094')];
const gRefs=[law('商業團體法第12、14、16條：會員公司或行號與代表','D0050100')];
const cRefs=[law('合作社法第11、14、20、26條：入社、社股及出社','D0050112')];
const tabs={
 association:{label:'一般協會的個人會員',question:'一般協會的個人會員過世，家人可以接他的會員資格嗎？'},
 commercial:{label:'商業同業公會的代表',question:'商業同業公會由公司行號推派的會員代表過世，家人可接會員代表資格嗎？'},
 coop:{label:'一般合作社的社員或股金',question:'一般合作社社員過世，家人可以繼承社員資格及股金嗎？'},
 other:{label:'其他職業公會或仍不確定',question:'會員過世家人可接會員資格嗎？我們仍不確定是其他職業公會或哪種團體。'}
};
const person=['一般協會：死亡為出會，家人不是自動接替','人民團體法第15條規定個人會員死亡為出會，不必另投票除名。條文沒有讓家人承接原會籍的明文；想加入請依章程申請，由協會更新名冊。若是團體會員所派代表而非個人會員，請原會員單位確認代表改派，不是家人繼承。'];
const guild=['商業同業公會：公司或行號與自然人代表是兩回事','會員通常是公司或行號。原派代表過世，原會員如仍存在而符合會員資格，可依法改派符資格者，家人不自動取得代表權。若是獨資負責人過世，先核對事業是否續營、完成登記或已廢業，再依該公會章程及商業團體法核對會籍。其他職業公會另有各目的事業法規，不可套用。'];
const share=['一般合作社：社員資格與社股分開','依合作社法第26條，死亡為出社原因。第20條處理社股繼承，非社員繼承人須符第11、14條入社才成為社員；不加入依規定退還股金。驗明繼承及入社資料請走合作社正式管道，不傳身分或財產證明到小屏。信用合作社另有特別規定。'];
function memberLoss(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>215||!/過世|身故|死亡/.test(t)||!/會員|社員|社股|股金/.test(t)||!/繼承|接他|接下|接任|承接|接替|接會員|接資格/.test(t)||/神明會|祭祀公業|寺廟|信用合作社|信合社|工會|公教保險|勞保|理事長職務/.test(t))return null;
 const general=/協會|社會團體/.test(t), biz=/商業同業公會|商業公會/.test(t), coop=/合作社/.test(t);
 const ending=/仍不確定是其他職業公會或哪種團體/.test(t);
 const ambiguity=/不確定|沒有說|不知道|還是|分不清|不清楚/.test(t)||((general?1:0)+(biz?1:0)+(coop?1:0)>1);
 const base={direct:true,category:'團體會籍｜死亡、改派及繼承',questionState:{focus:'compound'}};
 if(ending||ambiguity||!general&&!biz&&!coop)
  return {...base,title:'先分清團體和原本的身分',summary:'家人不要先拿過世者的名義出席、投票或辦理改派。若是一般協會的個人會員，死亡即出會；若是公會代表或合作社股金，規則不同。',steps:[person,guild,share],refs:[...aRefs,...gRefs,...cRefs],...(!ending?{choiceHeading:'原本是哪一種身分？',choices:Object.values(tabs)}:{})};
 if(biz)return {...base,title:'公司原派代表過世，由會員依法改派',summary:'家人不能自動接任公司或行號的公會代表。先確認會員是誰、是否續營，再辦代表改派。',steps:[guild],refs:gRefs};
 if(coop)return {...base,title:'繼承合作社社股，不等於自動取得社員資格',summary:'合作社員死亡為出社；社股依法另處理。繼承人不是社員的，要按資格申請加入，否則依規定退還股金。',steps:[share],refs:cRefs};
 return {...base,title:'一般協會個人會員死亡為出會，不自動承接',summary:'一般協會會員過世，依人民團體法第15條出會；家人要入會請依章程另行申請，不是自動接替。',steps:[person],refs:aRefs};
}
if(typeof module!=='undefined'&&module.exports){module.exports={memberLoss};return;}
root.verifiedMembershipDeathClarification=memberLoss;
})(typeof window!=='undefined'?window:globalThis);
