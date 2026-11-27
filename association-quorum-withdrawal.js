(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const digits='[0-9零〇一二兩三四五六七八九十]{1,3}';
const units='零一二三四五六七八九';
function value(x){
 if(!x)return null;if(/^\d+$/.test(x))return +x;
 x=x.replaceAll('兩','二').replaceAll('〇','零');
 if(x.includes('十')){const [a,b]=x.split('十');return (a?units.indexOf(a):1)*10+(b?units.indexOf(b):0);}
 return x.length===1?units.indexOf(x):null;
}
function quorumWithdrawal(q){
 const raw=String(q||'').trim(),t=raw.normalize('NFKC').replace(/\s/g,'');
 if(t.length>190||/合作社|社員|農會|漁會|同業公會|職業公會|工會|基金會|管委會|公司|股東|罷免|選舉|不動產|土地|財產處分|補助核銷/.test(t))return null;
 if(!/理事會|理事.{0,7}簽到/.test(t)||!/提款|領錢|領款|領存款|提領|取款|拿存款|錢能領|能領嗎|用印|蓋章/.test(t))return null;
 if(!/離席|退場|走掉|先走|開到一半|清查|點到|表決|決議|支出|通過/.test(t))return null;
 const director=value(t.match(new RegExp('(?:章程(?:訂定|規定|為)|共有|總共|共|全體)?('+digits+')(?:名|位|個)理事'))?.[1]);
 const signed=value(t.match(new RegExp('('+digits+')人(?:已經?|有)?(?:簽到|報到)'))?.[1]);
 const present=value(t.match(new RegExp('(?:點到|點名剩|實點(?:剩|有)?|清點(?:剩|有)?|清查(?:只剩|剩|有|結果為)?)('+digits+')人'))?.[1]);
 const afterVote=/(?:表決|決議|通過).{0,7}(?:之後|以後|後|才).{0,10}(?:離席|退場|走|離開)/.test(t);
 const noRecount=/沒(?:有)?(?:提(?:出)?|做)?清查|未(?:提(?:出)?|做)?清查|清查動議(?:沒|未|不)通過/.test(t);
 const recount=!noRecount&&/清查動議.{0,6}(?:通過|表決通過)|清查出席.{0,9}(?:通過|點名)|清查通過/.test(t);
 const onlyChair=/只(?:剩|有)?(?:蓋)?(?:理事長|負責人).{0,6}(?:章|用印|蓋)|(?:理事長|負責人)一個人.{0,4}(?:蓋|用印)|僅(?:由)?(?:理事長|負責人).{0,6}蓋/.test(t);
 const quorum=director?Math.floor(director/2)+1:null;
 const insufficient=!!(director&&recount&&present!==null&&present>=0&&present<=director&&present<quorum&&!afterVote);
 const steps=[
  ['先分清理事會決議是否符合程序','人民團體法第29條規定理事過半數出席，再依議案計出席人數過半數或較多數的同意。依人民團體會務輔導辦法第16條，出席原以簽到或報到計；有人提出清查出席的動議，現場表決較多數同意後才清點人數，清查不足法定成會人數，主席應立即宣布散會。沒有清查時，不能只從「有人走了」推定整場或該決議一定無效。'],
  ...(insufficient?[['依您提供的清查結果','若章程所訂理事名額為'+director+'人，至少要'+quorum+'人出席。清查動議通過後只剩'+present+'人，低於法定成會門檻，應立即宣布散會，不能再表決支出。'+(signed!==null?'原先'+signed+'人簽到，也不能取代已依法完成的清查結果。':'')+'即使後來三方都蓋章，也不能補正會議程序。']]:[]),
  ...(recount&&!insufficient&&!afterVote?[['既然通過清查動議，以清點結果核對','請查當時點到的在場人數及章程所定理事名額。清查後人數未過半，應散會；達成會門檻後，也還要確認該案同意票符合要求。']]:[]),
  ...(noRecount&&!afterVote?[['沒有依法完成清查，先查簽到與表決紀錄','出席以簽到或報到人數為起點，不能把事後推估人數當正式清查結果。仍請核對表決時的出席、同意票、章程及會議紀錄，有爭議先請主管機關查明。']]:[]),
  ...(afterVote?[['人是表決後才離席','若該案在離席前已依程序達成法定出席及同意門檻，不能只因有人事後離席就要求重表決。後續議案及清查另按當時紀錄判斷；要領款仍須符合用印程序。']]:[]),
  ['理事會有決議，仍要另辦提款','依社會團體財務處理辦法第17條，提用存款時須由團體負責人、秘書長或總幹事，以及財務人員在領款憑證上共同蓋章。'+(onlyChair?'只有理事長蓋章不符合這項規定。':'理事會通過支出不能取代共同蓋章；反過來，共同蓋章也不能把不合程序的支出表決變成有效。')],
  ['先核對會議及財務紀錄','請查章程所定理事名額、簽到或報到人數、離席是在表決前或後、清查動議／點名結果、同意票及領款憑證。經費收支應依會務輔導辦法第17條在理事會審議及送監事會監察；紀錄有爭議、支出單據不全時，先不要依這個有爭議的決議動支，請團體及主管機關核對。']
 ];
 const choices=(!recount&&!noRecount&&!afterVote&&!onlyChair&&/離席|退場|走掉|有人走|開到一半/.test(t))?[
  {label:'有通過清查動議',question:'我們協會清查動議已通過：'+raw},
  {label:'沒清查或清查動議沒通過',question:'我們協會沒有清查出席人數：'+raw}
 ]:[];
 return {direct:true,category:'人民團體財務與會議',questionState:{focus:'compound'},
 title:'理事會支出決議和提款共同用印，是兩道程序',
 summary:insufficient?'清查後人數不足應散會，不能再表決支出；三方用印不能補正該決議。':onlyChair?'即使理事會合法通過支出，也不能只憑理事長一人蓋章提款。':afterVote?'若支出在離席前已合法通過，不必只因事後離席重表決；提款仍須依法共同蓋章。':'不宜只因剩下的人說「通過」就直接提用存款。先核對是否依法成會及表決，再看領款憑證是否由法定三類人員共同蓋章。',
 steps,refs:[law('人民團體法','D0050091',29),law('人民團體會務輔導辦法','D0020094',16),law('人民團體會務輔導辦法','D0020094',17),law('社會團體財務處理辦法','D0050097',17)],...(choices.length?{choiceHeading:'當時有沒有通過清查動議？',choices}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={quorumWithdrawal};return;}
root.verifiedQuorumWithdrawal=quorumWithdrawal;
})(typeof window!=='undefined'?window:globalThis);
