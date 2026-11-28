(function(root){
'use strict';
const law=n=>({title:'人民團體選舉罷免辦法第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0050093&flno='+n});
function matches(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(/合作社|社員|農會|漁會|公會|工會|職業團體|政黨|基金會|寺廟|宮廟/.test(t))return false;
 return /理事會|監事會|理監事會/.test(t)
  && /改選|換屆|選出|選完|選上|當選|新任|新一屆|成立大會/.test(t)
  && /第一次|首次|第一場|幾天|何時|什麼時候|多久|期限|限期|當天|當日|同一天|隔天|隔日|翌日|延後|延期|逾期|不召集/.test(t)
  && !/多久一次|每幾個月|幾個月開一次|任期.{0,4}(?:起算|開始|幾年)|任期[^，。？?]{0,20}算|會議紀錄.{0,5}(?:備查|核備|報)|補選|缺額|簽到|出席人數|出席門檻|幾人出席/.test(t)
  && !/怎麼投票|投票方式|誰可以當理事長/.test(t);
}
function firstMeetingAnswer(q,previous){
 if(!matches(q)&&!previous?.title?.startsWith('改選後第一次理事會要在幾天內開：'))return previous;
 const meeting=/監事會/.test(q)&&!/理事會|理監事會/.test(q)?'監事會':'理事會';
 return {direct:true,category:'改選與任期',
  title:'改選後第一次'+meeting+'要在幾天內開：原則上是大會閉會後第7日起至第15日內',
  summary:'依人民團體選舉罷免辦法第12條，理事、監事選出後，原則上應於大會閉會後第7日起至第15日內，分別召開第一次理事會和監事會。不是在15天內任選一天；隔天不在這個通常期間。無法在期限內召開，可報請主管機關核准延長，不能自行延長。\n\n如果要在大會當天一起開，須在通知會員（代表）大會時一併通知。依法令或章程，未出席大會者也能當選理事或監事的，原則上不得在大會當天開，除非全體當選理事、監事都同意。\n\n改選後，由原任理事長、原任監事會召集人分別召集；許可設立中的團體由籌備會召集人召集。逾期未召集，由得票最多的理事、監事，或由主管機關指定的理事、監事召集。\n\n第28條是任期起算的規定，不是開會期限：原則上任期自本屆第一次理事會召開之日起算；國際性社會團體章程另定並經核准者例外。',
  statutes:[law(12),law(28)],notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function keepFirstMeetingQuestion(q,normalize){return matches(q)?String(q):normalize(q);}
if(typeof module!=='undefined'&&module.exports){module.exports={firstMeetingAnswer,keepFirstMeetingQuestion};return;}
const previous=root.verifiedRoundAnswer,normalize=root.normalizeQuestion;
root.verifiedRoundAnswer=function(q,ctx){return firstMeetingAnswer(q,previous.call(this,q,ctx));};
root.normalizeQuestion=function(q){return keepFirstMeetingQuestion(q,normalize);};
})(typeof window!=='undefined'?window:globalThis);
