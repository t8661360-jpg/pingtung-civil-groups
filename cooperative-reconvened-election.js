(function(root){
'use strict';
const normal=q=>String(q??'').normalize('NFKC').replace(/\s/g,'');
const ref=(n,act='D0050022')=>({title:(act==='D0050022'?'合作社選舉罷免辦法':'合作社法')+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+act+'&flno='+n});
const outside=/信用合作社|信合社|保險合作社|消費金融|商業同業公會|職業公會|工會|農會|漁會|股份有限公司|股東/;
function eligibleTotal(t){
 const patterns=[/(?:共|共有|全體|全社)?(?:具(?:有)?(?:出席|投票)?資格(?:的)?(?:社員)?|應出席(?:的)?(?:社員)?|合格(?:的)?社員|有權投票(?:的)?(?:社員)?|有(?:投票|出席)權(?:的)?(?:社員)?)(?:共有|有|是|為|總共)?(\d{1,5})(?:人|位|名)(?![^。；，、]{0,5}(?:來了|到場|到會))/,/(?:共|共有|總共)?(\d{1,5})(?:人|位|名|個)(?:有資格|能投票|可(?:以)?投票|有投票權|具有表決權)/];
 for(const p of patterns){const m=t.match(p);if(m&&Number(m[1])>0)return Number(m[1]);}
 return null;
}
const answer=(title,summary,steps,refs,more={})=>({direct:true,category:'一般合作社｜選舉程序',title,summary,steps,refs,questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}],...more});
function chairCase(t){
 if(!/理事會(?:要|將|改|另|重新|來)?(?:另|再|重)?選.{0,3}(?:理事會)?主席|(?:選|補選|互選)(?:理事會主席|理事主席|監事會主席|監事主席)|理事會選主席|監事會選主席/.test(t)||!/通知|出席|幾人|開會|缺額|出缺|補選/.test(t))return null;
 if(/(?:社員大會|社員代表大會).{0,15}(?:先|次|同時|再).{0,10}(?:選理事|選理監事)|(?:章程|會員)大會議程/.test(t))return null;
 const supervisory=/監事會(?:選主席|主席)|監事主席/.test(t)&&!/理事會主席|理事主席/.test(t);
 const people=supervisory?'監事':'理事',board=people+'會';
 const size=t.match(new RegExp(people+'(?:總共|共有|現有|合計|有)([0-9]{1,4})(?:位|人|名)'));
 const n=size&&Number(size[1])||null;
 const vacant=/主席.{0,12}(?:出缺|死亡|過世|辭職|離職|辭掉|懸缺)|出缺|補選/.test(t),newBoard=/剛(?:剛)?選出|新一屆|新任理監事|剛改選|首次|第一次/.test(t);
 return answer(board+'內選主席，和大會選理監事是兩件事','這次由'+people+'互選。'+(n?('若共有'+n+'位有出席資格的'+people+'，至少須'+(Math.floor(n/2)+1)+'位出席才成會。'):'成會要實際出席人數超過應出席人數的一半。')+' 首輪當選另看得票是否超過出席人數的一半，不是看全體社員。',[
  ['先看是改選後第一次，還是原主席出缺',vacant?'主席出缺後一個月內由該會議補選；剩餘任期未滿六個月，才可由該會成員互推一人代理。':newBoard?'新一屆'+people+'選出後，由原任'+board+'主席在15日內召集；逾期由得票最多的'+people+'召集。設立中的合作社另由籌備會主任委員召集。':'新一屆'+people+'選出後，原任'+board+'主席在15日內召集；若是原主席出缺，原則上出缺後一個月內補選，剩餘任期未滿六個月才可互推代理。'],
  ['先通知，再由有資格的'+people+'投票','安排會議時，依選罷辦法第18條在選舉日前7日公告選舉資訊、書面通知應出席者及報主管機關備查。社員大會的社員委託書不是本會'+people+'出席資格。'],
  ['首輪無人過半再投','首輪無人得票超過出席人數一半，由最高和次高票者再投，票較多者當選，同票抽籤。']
 ],[ref(3),ref(6),ref(7),ref(18),ref(supervisory?54:53,'D0050112')]);
}
function route(q){
 const raw=String(q??'').trim(),t=normal(raw);
 const domain=t.replace(/(?:不是|並非|不是問|不屬於)(?:信用合作社|信合社|合作社聯合社|聯合社|協會|社會團體|人民團體)/g,'');
 if(!/合作社/.test(domain)||outside.test(domain)||/(?:不是|並非|不屬於)(?:一般)?合作社|協會|人民團體|社會團體/.test(domain)||t.length>345||/罷免|解任|股息|清算|理監事.{0,5}辭職/.test(t))return null;
 const chair=chairCase(t);if(chair)return chair;
 const elect=/選(?:舉|票|出|任|理監事|理事|監事|社員代表)|改選|開票|投票|沒有選成|沒選成/.test(t);
 const reconvene=/流會|重開|重召|重新(?:召開|開會)|第一次.{0,24}(?:不夠|不足|沒.{0,5}(?:半|選成)|過半就)|三分之一.{0,20}(?:重開|再開)|第一次.{0,24}(?:差|不到).{0,12}(?:過半|一半|成會)|前(?:一|兩|二)次.{0,20}(?:出席不足|人沒到齊)/.test(t);
 if(!elect||!reconvene||!/社員大會|社員代表|理監事|理事|監事|選舉會/.test(t))return null;
 if(/聯合社/.test(domain))return null;
 const outcome=t.match(/章程確認[：:](可採三分之一|沒有減額規定)/);
 const noChapter=/章程[^，；。]{0,16}(?:沒(?:有)?(?:明文|寫|規定|允許)|未(?:有|寫|規定|訂)|無規定|不允許|不准)[^，；。]{0,19}(?:重開|三分之一|減額|降低|按實際)|章程(?:沒寫|沒規定|未規定|無規定)[，。；？！?]|沒有章程(?:規定|依據)/.test(t);
 const yesChapter=/章程[^，；。]{0,20}(?:准許|允許|明定|規定|寫|明文|可)[^，；。]{0,24}(?:三分之一|1\/3|按實際|降低|減額)/.test(t)&&!noChapter;
 const chapter=outcome?(outcome[1]==='可採三分之一'?'yes':'no'):noChapter?'no':yesChapter?'yes':'unknown';
 const n=eligibleTotal(t),base=n?Math.floor(n/2)+1:null,lower=n?Math.ceil(n/3):null;
 const directMin=chapter==='yes'?(n?'重開至少'+lower+'人。':'依有效章程可降至全體具資格人數的三分之一以上。'):chapter==='no'?(n?'重開仍須至少'+base+'人。':'重開仍須全體具資格者過半數出席。'):(n?'若章程允許按三分之一門檻，至少'+lower+'人；章程無減額規定，就仍至少'+base+'人。':'章程允許減額時，重開至少達具資格者三分之一；沒有減額規定，仍須過半。');
 const late=/第(?:1[6-9]|[2-9][0-9]|十[六七八九]|二十|三十)天|超過(?:15|十五)日|已逾(?:15|十五)日/.test(t);
 const rush=/後補|事後補|先開|直接重開|今天.{0,12}重開|先投.{0,8}再補|下禮拜再補/.test(t);
 const dated=/委託(?:書)?[^，；。]{0,12}(?:只寫|只填|只限|限定|僅)[^，；。]{0,14}(?:上次日期|原日期|舊日期|上次|當天|[0-9]+月[0-9]+日|[0-9]+\/[0-9]+)/.test(t);
 const representative=/選(?:舉)?社員代表/.test(t)&&!/(?:不是|並非|沒有要|不)選(?:舉)?社員代表|選(?:理事|監事|理監事)/.test(t);
 const steps=[['社員大會選舉：先核本次具資格人數與章程',(n?'本次若共有'+n+'人具出席資格，首次至少'+base+'人。':'第一次須有本次具出席資格者超過半數。')+directMin+' 「達三分之一」有小數須進到下一個整數；不得自行降門檻。'],['排重開日，也排公告和送達','因未成會流會，應在流會後15日內重新召開選舉。重開日期仍須預留7日，公告選舉種類、日期時間、地點、應選及候補名額、方式；書面分送應出席者並報主管機關備查。採候選登記方式也要公告候選人名單。'+(late?' 排到第16天或以上，已不是15日內。':'')+(rush?' 不能先開再補通知。':'')+' 若已逾期或無法同時符合兩個期限，請先把流會記錄及已通知的日期交原承辦確認，不當作已合規。']];
 if(/委託|代理|代投/.test(t))steps.push(['舊委託不能不查就照用',(dated?'已說那一張只限上次日期，不能拿來代理重開的這一天；要委託請另簽。':'逐張核對是否只限上次會議、委託是否有效及雙方資格；原件不會因名稱相同就當然適用。')+' 無法出席的社員可書面委託另一具資格社員。每位受託人只能接一份有效委託，領票時交件並登記；委託人發票前親自到場，先書面終止再報到。']);
 if(/電子|線上|遠端|通訊|改成網路|視訊/.test(t))steps.push(['電子投票的例外只看選舉對象',representative?'若確實是「選社員代表」而非社員代表大會選理監事，非會議方式須理事會決議及報備；通訊或電子投票另須章程及選務規則、社員（代表）大會決議和備查，且不得用委託代理。':'若這次選「理事、監事」，仍應在會議投票，不能把社員代表選舉的通訊或電子投票例外搬來使用，也不能改成一般線上投票。']);
 if(/紀錄|記錄|備查|結果|保存|選票|登記/.test(t))steps.push(['重開後的會議紀錄與選票','主席當場宣布結果，選票、名冊等依法封存或留存至任期屆滿，選舉會議紀錄另報主管機關備查。不把保存到任期屆滿當作會議紀錄的送件期限。']);
 const choices=chapter==='unknown'&&raw.length<240?[{label:'章程允許按三分之一',question:raw+'；章程確認：可採三分之一。'},{label:'章程沒有減額規定',question:raw+'；章程確認：沒有減額規定。'}]:[];
 return answer('合作社選舉流會：重開期限、出席門檻與通知要一起核對','流會後15日內重開，仍要預留7日公告和書面通知。'+directMin,steps,[ref(3),ref(18),ref(23),ref(29),ref(51)],{trackCoopElection:true,...(choices.length?{choiceHeading:'這次章程允許重開時降低出席門檻嗎？',choices}:{})});
}
function continuation(prior,q){
 const t=normal(q);
 return prior&&/^(?:更正|補充|我說錯|不是社員大會)/.test(t)&&/主席|理事會|監事會/.test(t)&&!/社員大會.*(?:先|再)選理事|信用合作社|信合社|公會|工會|農會|漁會/.test(t)?'一般合作社；'+q:q;
}
if(typeof module!=='undefined'&&module.exports){module.exports={route,continuation,eligibleTotal};return;}
root.verifiedCooperativeReconvenedElection=route;
root.cooperativeReconvenedElectionFollow=continuation;
})(typeof window!=='undefined'?window:globalThis);
