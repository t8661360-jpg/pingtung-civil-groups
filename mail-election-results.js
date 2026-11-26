(function(root){
'use strict';
const law23={title:'人民團體選舉罷免辦法第23條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0050093&flno=23'};
function isMailElectionResult(t){
 return !/(合作社|社員|股金|政黨|基金會|寺廟|宗教|工會|公會|職業團體|候選人|罷免)/.test(t)
  && /(通訊投票|通訊選舉|通訊改選|郵寄投票|郵寄選票|郵寄選舉|郵寄改選|寄選票)/.test(t)
  && /(當選|選舉結果|選舉的結果|開票結果|票選結果|改選結果|選出.{0,8}結果)/.test(t)
  && /(通知|公告|公布|公佈|張貼|貼出|宣布|宣佈)/.test(t);
}
function answerMailElectionResult(t){
 const base={direct:true,category:'改選與任期',notes:[],actions:[{label:'看改選一步一步怎麼辦',view:'meet',sub:'m-elect'},{label:'聯絡承辦',view:'contact',sub:''}]};
 const tail='\n\n其他細節請洽縣府社會處承辦人員，縣府總機 08-7320415。';
 if(isMailElectionResult(t))
  return Object.assign({},base,{title:'通訊選舉：當選人通知及公告方式，依團體訂定的通訊選舉辦法辦理',
  summary:'如果協會依章程用通訊方式選理事、監事，要依團體訂定的通訊選舉辦法通知當選人及辦理公告。人民團體選舉罷免辦法第23條第3項要求這份辦法載明當選人通知及公告等事項，由理事會通過，並報主管機關備查。\n\n全國性規定沒有指定一律貼在哪裡、用什麼媒介或何時張貼。先看本會通訊選舉辦法；如果漏訂通知或公告方式，應補訂，不能只用一般集會選舉的當場宣布取代。'+tail,
  statutes:[law23]});
 return null;
}
function addMailElectionGuidance(q,answer){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 const mail=answerMailElectionResult(t);
 if(mail)return mail;
 if(answer?.title?.startsWith('選舉結果要宣布：開票完當場宣布結果') && !/(合作社|社員|公會|工會)/.test(t)){
  return {...answer,summary:answer.summary.replace(
    '至於要不要另外張貼公告當選名單，辦法沒有逐項規定，請依章程辦理或洽承辦人員。',
    '一般集會選舉是否另外張貼當選名單，請看章程或團體選舉規則；通訊選舉則依第23條第3項及團體的通訊選舉辦法通知當選人及辦理公告。'),
    statutes:[...answer.statutes,law23]};
 }
 return answer;
}
function preserveMailElectionQuestion(q,normalize){
 return isMailElectionResult(String(q??'').normalize('NFKC').replace(/\s/g,'')) ? String(q) : normalize(q);
}
if(typeof module!=='undefined'&&module.exports){module.exports={addMailElectionGuidance,preserveMailElectionQuestion};return;}
const previous=root.verifiedRoundAnswer;
const normalize=root.normalizeQuestion;
root.verifiedRoundAnswer=function(q,ctx){return addMailElectionGuidance(q,previous.call(this,q,ctx));};
root.normalizeQuestion=function(q){return preserveMailElectionQuestion(q,normalize);};
})(typeof window!=='undefined'?window:globalThis);
