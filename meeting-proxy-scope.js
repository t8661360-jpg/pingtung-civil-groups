(function(root){
'use strict';
const law=(title,p)=>({title,source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+p});
const a=law('人民團體法第16、27、31、42條','D0050091');
const elect=law('人民團體選舉罷免辦法第7、8、25條','D0050093');
const minutes=law('人民團體會務輔導辦法第12、16條','D0020094');
const c=law('合作社法第48–50、53、54條','D0050112');
const cElect=law('合作社選舉罷免辦法：選務程序','D0050022');
const opt={aa:['協會會員（代表）大會','確認協會會員代表大會代理'],ab:['協會理事會／監事會','確認協會理事會或監事會代理'],ca:['一般合作社社員大會','確認一般合作社社員大會代理'],cb:['一般合作社理事會／監事會','確認一般合作社理事會或監事會代理']};
const norm=q=>String(q||'').normalize('NFKC').replace(/\s+/g,'');
const intent=/委託|代理|別人代.{0,4}(?:投|去|出席)|代投|替我.{0,5}(?:投|出席)|代我.{0,5}(?:投|出席)/;
const revokes=/撤回|終止|(?:怎麼|如何|能否|要不要)取消|作廢|本人.{0,6}(?:會到|到場|能到|能去|會出席|可能會去|去現場)|當天.{0,7}(?:能去|能到|能來|去了|出現|能出席)|突然.{0,8}(?:到場|可到|能到|可以去)|我自己能到|本來不能到.{0,8}(?:能|可).{0,3}(?:到|去)|簽到就好|還沒投票/;
const excluded=/信用合作社|信合社|工會|公會|漁會|農會|選舉公職|投票所|區權會|股東會|家長會|延期|改期|換場地|變更會址|住址|籌備會議/;
function parse(q,prev){
 const raw=norm(q);
 if(!raw||raw.length>550||/^新題/.test(raw)||excluded.test(raw))return null;
 const k=Object.keys(opt).find(x=>opt[x][1]===raw);
 if(k)return {...prev,org:k[0],assembly:k[1]==='a',board:k[1]==='b'};
 const corr=!!prev&&/^(?:更正|補充|其實|剛才說錯)/.test(raw)&&/協會|合作社|大會|理事會|監事會|投票|本人/.test(raw);
 const t=raw.replace(/(?:並非|不是|不問|不是問)(?:一般|普通)?(?:合作社(?:的)?|協會(?:的)?|社員(?:代表)?大會|會員(?:代表)?大會|理事會|監事會)/g,'');
 const noArrival=/(?:本人|我).{0,5}(?:不能|不會|無法|沒辦法)(?:來|到|親自|出席)|我人在外地/.test(t);
 const alternateArrival=/本來.{0,14}(?:當天|現在).{0,6}(?:能|可)|突然.{0,6}(?:到場|可到|能到)|書面.{0,8}(?:終止|撤回)|(?:還沒|沒)投票/.test(t);
 const hasProxy=intent.test(t), own=revokes.test(t)&&(!noArrival||alternateArrival);
 if(!hasProxy&&!corr)return null;
 const aa=/會員(?:代表)?大會|會員代表會議/.test(t);
 const ca=/社員(?:代表)?大會/.test(t);
 const aOrg=/社會團體|人民團體|協會/.test(t)||aa;
 const cOrg=/合作社/.test(t)||ca;
 if(aOrg&&cOrg)return null;
 const org=cOrg?'c':aOrg?'a':corr?prev.org:undefined;
 const assembly=aa||ca||corr&&!/(?:不是|不問)(?:社員|會員)(?:代表)?大會/.test(raw)&&!/理事會|監事會/.test(t)&&!!prev.assembly;
 const board=/理事會|監事會|理監事會|理監事聯席會/.test(t);
 const split=/分別委託|分開(?:委託|簽)|兩(?:個|位|名).{0,6}(?:會員|社員).{0,6}代|委託.{0,8}兩(?:人|個|位)|上午.{0,14}(?:委託|選).{0,14}下午|拆成.{0,5}(?:兩|2)張|同一(?:次|場).{0,16}(?:分開|拆)|已有(?:另一人|別人).{0,7}委託/.test(t);
 const taken=/另一(?:位|人).{0,8}(?:委託|代理)|已(?:經)?(?:替|代|拿|收|有|受).{0,12}(?:代理|委託)|別人的一份|一人代理兩人|同一人代理兩/.test(t);
 const election=/改選|選舉|罷免|選(?:理事|監事|理監事)|投票|選票|領票/.test(t)&&!/不辦選舉|沒有要改選/.test(t);
 const debate=/已經投|已投票|(?:代理人|他).{0,6}已(?:經)?投|票能不能重投|已經開票|另投一票/.test(t);
 const two=assembly&&board;
 const ambiguous=!org&&/不能到|不能出席|沒辦法去|不克出席|代投|拿委託書/.test(t);
 if(!corr&&!own&&!split&&!taken&&!two&&!ambiguous)return null;
 if(!corr&&!assembly&&!board&&org&&!own)return null;
 return {org,assembly,board,two,split,taken,election,own:own||corr&&/本人.{0,7}(?:會出席|會到|能到|到現場)|還沒投票/.test(t),debate,
   community:/社區發展協會|社區協會/.test(t),signed:/簽到|報到|出席計算|名冊|紀錄/.test(t),finance:/決算|財務|財報/.test(t)};
}
function route(q,prev){
 const x=parse(q,prev);if(!x)return null;
 const output=(title,summary,steps,refs,ids)=>({direct:true,category:'會議出席｜委託及本人投票',title,summary,steps,refs,meetingProxyScopeContext:x,questionState:{focus:ids?'clarify':'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}],...(ids?{choiceHeading:'請選您原本要出席的會議',choices:ids.map(k=>({label:opt[k][0],question:opt[k][1]}))}:{})});
 if(!x.org||!x.assembly&&!x.board){
   const ids=x.org==='a'?['aa','ab']:x.org==='c'?['ca','cb']:['aa','ab','ca','cb'];
   return output('先確認團體和會議，才知道能不能委託','先別把委託書交給任何人。同一團體的會員／社員大會和理事會的規則也不同；已受委託或本人改要到場，要在簽到領票前核對。',[],[],ids);
 }
 const coop=x.org==='c';
 const steps=[],refs=coop?[c]:[a,minutes];
 if(x.assembly){
  steps.push([coop?'社員大會可以書面委託其他社員，一位代理人最多代理一人':'會員大會書面委託同一團體的合格會員，一位代理人最多代理一人',
    coop?'合作社法第50條只處理社員不能出席社員大會時的書面代理。受託人若已代理另一名社員，就不能再代理您；第49條通常每名社員一個表決權。法人社員代表另核章程與規定。':
    (x.community?'社區發展協會同樣要核對會員大會簽到與合法代理。':'')+'人民團體法第42條：不能親自出席才可書面委託其他會員或會員代表；不是會員的親友不能代。已受另一名會員委託者不能再代理您。'+(x.election?'選舉或罷免另依選罷辦法第7條，會員有類別限制時應選同一類別。':'')]);
 }
 if(x.assembly&&x.split)steps.push(['同一場會議，不要把一個人的出席拆成兩張委託書','同一場大會先選舉、後決算，或上午下午兩段，並不因此變成兩次會議。不要讓兩人各拿同一會員的委託書、同時代簽到或把同一會員計兩次；選一位未代理別人的合格人員，將授權範圍寫清楚。若確實是另行召集的兩次會議，分別依各自的通知、名冊、委託書及表決規則辦。']);
 if(x.assembly&&x.own){
  if(coop){
   steps.push(['合作社已有委託而本人改到場：先找報到與選務處核對','不要讓本人與代理人同時行使同一社員權利。先向報到處說明要撤回，請核對章程、委託書及該次選務；建議帶書面撤回、讓名冊註銷或更正代理註記後再領票。合作社法第50條沒有直接寫協會選罷辦法的撤回程序，不等於不必核對或一定能重投。若代理人已投或已做表決，應先向主席或監票人員指出，留紀錄，不自行拿第二張票或宣稱舊票當然作廢。']);
   if(x.election)refs.push(cElect);
  }else{
   steps.push(['協會改為本人到場：書面終止委託，重新核對簽到後再行使權利','人民團體選舉罷免辦法第7條第3項：選舉／罷免時，已委託其他會員而本人親自到場，要先書面終止委託並辦理簽到，再行使本人權利。先把書面交報到或選務人員，更新原代理註記；代理人尚未投票時，照正確名冊安排領票。若已發票或已投票，請主席和監票人員按程序查明並記錄，不能自己再投一票。普通議案也要依章程核對撤回與報到，不把選務條文套到合作社。']);
   refs.push(elect);
  }
 } else if(x.assembly&&x.election&&!coop) refs.push(elect);
 if(x.board){
  steps.push(coop?['合作社原社員大會委託書，不能拿到理事會或監事會直接使用','合作社法第53、54條按實際理事／監事資格與出席計算。第50條的書面代理只適用社員大會，不能作為理事會代出席、代投票或計入出席的根據；如主張本社另有規定，先查章程、該會議的法規及主管機關口徑，未確認前不要把代理人算入。']:
   ['協會理事會、監事會由理事或監事本人出席，不能委託','依人民團體法第31條，不能用會員大會的委託書讓另一理事、監事或會員代出席、代投或算兩個出席；本人沒到就不列親自出席。同一天、同一個人兼兩種身分，也要按各自會議計算。']);
 }
 if(x.two||x.signed||x.debate)steps.push(['明確分開簽到、領票和會議紀錄','如同一天有大會及理事會，分開造具簽到與紀錄，區分本人出席、合法代理、書面撤回及選票發放；不要讓同一個權利或出席人數重複列入。若當場有票數、已投票效力或成會爭議，持原資料向主席或選務人員提出並留會議紀錄，不自行重投或改舊紀錄。']);
 if(x.finance&&x.assembly)steps.push(['決算是另一項議案，不是額外的會員身分','依法及章程核對核准程序、表決人數和簽到；同一場會員／社員大會的選舉與決算分開列議程及結果，但不把同一人拆成兩次出席。']);
 const title=x.two?'大會與理事會的委託和簽到要分開':x.board?(coop?'合作社理事會不沿用社員大會委託書':'協會理事會、監事會：本人出席，不可委託'):x.own?(coop?'合作社：原有委託而本人要到，先核對報到':x.election?'協會選舉：本人改要出席，先書面終止委託':'協會會員大會：本人改要到場，先核對委託撤回'):x.split?'同一次大會，不重複分派或登錄代理':coop?'社員大會可依法書面委託其他社員':'會員大會可依法書面委託其他合格會員';
 const summary=x.two?'大會可依法書面委託合格的人，但大會委託書不能直接帶到理事會。本人或代理人變動應先更新名冊，不能把同一權利算兩次。':x.board?(coop?'第50條不是理事會或監事會的代理依據。':'理事或監事不能找別人代出席、代投票。'):x.own?'本人能到場時，先讓報到處處理原委託，別同時讓代理人投，也別重複算出席。':x.split?'同一次大會先選舉再處理其他議案，仍是同一場，不要分兩張委託造成代理、簽到或投票重複。':'先確認受託人是同團體有資格的人，而且沒有代理另一人。委託採書面，不要只請別人代拿選票。';
 return output(title,summary,steps,[...new Map(refs.map(r=>[r.title,r])).values()]);
}
if(typeof module==='object'&&module.exports)module.exports={route};else root.verifiedMeetingProxyScope=route;
})(typeof window==='object'?window:globalThis);
