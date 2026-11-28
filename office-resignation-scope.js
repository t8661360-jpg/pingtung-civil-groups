(function(root){
'use strict';
const link=(title,source)=>({title,source});
const byCode=(title,p)=>link(title,'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+p);
const people=byCode('人民團體法第15–17、23、25、29、32、33、54條','D0050091');
const elect=byCode('人民團體選舉罷免辦法第17、21、27、28條','D0050093');
const records=byCode('人民團體會務輔導辦法第9、10、12條','D0020094');
const moi=link('內政部：兼任多項職務者應寫明所辭職務','https://www.moi.gov.tw/News_toggle3.aspx?PageSize=10&_CSN=1633&n=8361&page=12&sms=9015');
const oral=link('內政部：理事長口頭辭職及補選','https://www.moi.gov.tw/News_Content.aspx?n=14119&s=219866');
const coop=byCode('合作社法第26、27、30、34、53、54條','D0050112');
const coopElect=byCode('合作社選舉罷免辦法第7、8條','D0050022');
const coopRules=byCode('合作社法施行細則第13條','D0050113');
const norm=s=>String(s??'').normalize('NFKC').replace(/\s/g,'');
const excluded=/信合社|信用合作社|合作社聯合社|工業會|同業公會|公會|工會|農會|漁會|管委會|財團法人|股份有限公司/;
const noTitle=/(?:不|沒(?:有)?|不是|先不)(?:要|打算|想)?(?:辭(?:去|掉)?|卸下?)(?:理事長|主席|理事|監事)|(?:只有|僅有)監事/g;
const resignation=/辭|請辭|卸(?:任|下)?|不想做|不做/;
const labels={chair:'協會理事長',director:'協會理事',supervisor:'協會監事',coopChair:'合作社主席卸任'};
function parse(raw,prior){
 const t=norm(raw);if(!t||t.length>440||/^新題/.test(t)||excluded.test(t))return null;
 const text=t.replace(/(?:不是|而非|不屬於)(?:一般)?協會/g,'');
 const prefix=/^(?:確認|更正(?:一下)?|補充(?:一下)?|改成|選擇|其實)/.test(text);
 const follow=prior&&prefix&&/理事|監事|主席|會籍|退會|社員|書面|口頭|決議|准辭|同意/.test(text);
 const c=follow?prior:{};
 const hasCoop=/合作社/.test(text);
 const hasAssoc=/協會|社會團體|人民團體/.test(text);
 if(hasCoop&&hasAssoc)return null;
 const clean=text.replace(noTitle,'');
 const onlySupervisor=/(?:只有|只有一位|只剩|僅有|只)(?:一位)?監事.{0,12}(?:辭|不做|不想|口頭)/.test(text);
 const chairOnly=/(?:只|僅|單純|只寫|只申請)(?:想|要)?(?:辭(?:掉|去)?|卸下?)(?:理事長|主席)|(?:不|沒(?:有)?)辭理事(?!長)|(?:留|還(?:是|當)|仍(?:是|當|任))理事(?!長)|不卸理事/.test(text);
 const hasChair=/理事長|(?:理事會|監事會)主席|辭主席|卸主席|主席卸任/.test(clean);
 const director=/確認(?:一般)?協會理事(?!長)|(?:辭|請辭|卸任).{0,6}理事(?!長)|理事(?!長).{0,8}(?:辭|不想做|不做|卸任)/.test(clean);
 const supervisor=/確認(?:一般)?協會監事|(?:辭|請辭).{0,6}監事|監事.{0,12}(?:口頭|辭|不做|不想做|卸任)|只(?:有)?監事/.test(clean)||onlySupervisor;
 const mixed=!onlySupervisor&&!chairOnly&&((director&&supervisor)||(/一起|都|通通|集體|同時/.test(clean)&&/理事/.test(clean)&&/監事/.test(clean)));
 let role=onlySupervisor?'supervisor':mixed?'multiple':hasChair?'chair':supervisor?'supervisor':director?'director':null;
 if(hasCoop&&role==='chair')role='coopChair';
 if(c.org==='coop'&&!hasAssoc&&role==='chair')role='coopChair';
 const org=hasCoop||role==='coopChair'?'coop':hasAssoc||role==='chair'||role==='multiple'?'assoc':c.org||null;
 const votes=/投票|表決|簽到名冊|有票|投票權/.test(text);
 const replacement=/出缺|候補|補推|補選|補人|遞補|代理|暫代|接班|提前選|任期/.test(text);
 const agenda=/大會|開會|通知|召集|主持|例會/.test(text);
 const register=/名冊|名單|報縣府|報主管機關|報備|紀錄/.test(text);
 const holding=/保留|仍是|還是(?:理事|社員|會員)|不退(?:社|會)|沒有退會|不退出|不卸理事/.test(text)||chairOnly;
 const shares=/股金|股款|社股|退股/.test(text);
 const print=/簽約|用印|蓋章|代簽|對外|印信/.test(text);
 const opposition=/口頭|沒有書面|沒(?:有)?開(?:理事會|監事會)|還沒開|尚未|未決議|只交.{0,6}(?:書面|辭職書)|沒同意/.test(text);
 const accepted=/(?:理事會|監事會).{0,7}(?:已(?:經)?(?:同意|通過|准辭|決議)|也同意|先同意|已准)|(?:已(?:經)?)(?:議決|生效|決議通過|決議准辭|同意.{0,3}辭職)/.test(text);
 const received=/已.{0,4}送達(?:社址|合作社)|合作社.{0,6}已(?:簽收|收受)|(?:郵寄|書面).{0,8}已送達/.test(text);
 const negExit=/(?:沒(?:有)?|不|不是)(?:要|打算)?(?:退社|退出合作社)|社員身分不變|仍(?:是|為)社員|還是.*社員/.test(text);
 const status=opposition&&!mixed?'pending':(org==='coop'?received:accepted)&&!mixed?'effective':null;
 if(!follow){
  if(!resignation.test(text)||(!role&&!(replacement&&(votes||agenda))))return null;
  if(/提款|提領|領款|領錢|存款|銀行.{0,8}(?:用印|印鑑)|私(?:人)?帳戶|移交.{0,10}(?:印信|印鑑)|改選延期|罷免|聯名補選|被迫退會/.test(text))return null;
  if(org==='coop'&&role!=='coopChair')return null;
  if(role==="coopChair"&&(!negExit&&/(?:已|另|想|決定|請|申請).{0,5}(?:退社|退出合作社)/.test(text)||!(negExit||chairOnly||holding)))return null;
  if(org!=='coop'&&!mixed&&!chairOnly&&!(votes||agenda&&replacement||holding&&replacement||onlySupervisor&&opposition))return null;
 }
 const clear=/其餘不變|其他條件|剛才/.test(text);
 const num=v=>/^\d+$/.test(v)?Number(v):({一:1,二:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9,十:10}[v]||null);
 const seats=text.match(/理事會(?:章程|章定|法定|應到|應出席)(?:名額)?(\d{1,2}|[一二三四五六七八九十])(?:席|位|人)/), present=text.match(/(?:在場(?:這次有|有)?|實到|實際出席)(\d{1,2}|[一二三四五六七八九十])(?:位|人)/);
 const set=(a,b)=>!!(a||b);
 const state={org,seats:seats?num(seats[1]):(clear?c.seats:null),present:present?num(present[1]):(clear?c.present:null),role:role||c.role||null,status:status||(prefix&&role&&c.role!==role?null:c.status)||null,only:chairOnly||!!(follow&&!role&&c.only),votes:set(votes,c.votes),replacement:set(replacement,c.replacement),agenda:set(agenda,c.agenda),register:set(register,c.register),holding:set(holding,c.holding),shares:set(shares,c.shares),fees:/會費|入會費/.test(text)||!!c.fees,print:set(print,c.print),negExit:set(negExit,c.negExit),exactSix:/(?:剛好|恰好|正好|整整)(?:6|六)個月/.test(text)||!!(follow&&!role&&c.exactSix),underSix:/不到(?:6|六)個月|不足(?:6|六)個月|剩.{0,3}[一二兩三四五1-5]個月/.test(text)||!!(follow&&!role&&c.underSix),chairContinues:/理事長.{0,5}(?:沒(?:有)?辭職|繼續任職|不辭職)/.test(text)||!!(clear&&c.chairContinues)};
 if(/^確認(?:辭職已生效|已書面准辭|仍未生效)/.test(text)&&follow)state.status=/仍未/.test(text)?'pending':'effective';
 return state;
}
function route(q,prior){
 let s=parse(q,prior);if(!s)return null;
 const make=(title,summary,steps,refs)=>({direct:true,category:s.org==='coop'?'合作社會務｜主席與社員資格':'協會會務｜辭職、出缺與投票',title,summary,steps,refs,officeResignationContext:s,questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]});
 const branch=(a,heading,choices)=>({...a,choiceHeading:heading,choices});
 if(!s.role){
  return branch(make('先確認辭的是哪個職務','卸任理事長、卸任理事或監事，和退出團體是不同的事。補人及投票先以實際辭任職務為準。',[],[people,elect]),'請選擇辭去的職務',Object.entries(labels).map(([k,label])=>({label,question:'確認'+label})));
 }
 const refs=s.org==='coop'?[coop,coopElect,coopRules]:[people,elect,records,moi,oral];
 const effective=s.status==='effective', pending=s.status==='pending';
 if(s.role==='coopChair'){
  return make('合作社只卸主席：不會因此退社或退股','辭主席不等於退社。若仍是社員，不能只因辭去主席就要求按退社程序立即退還股金。',[
   ['主席職務要分已出缺還是單次缺席','合作社選舉罷免辦法第8條，辭職應以書面，送達合作社社址時生效，並完成交接及會議報告。只辭主席，不等於另辭理事席次。確定主席出缺，依第7條，理事會應在出缺日起一個月內補選；剩餘任期未滿六個月，可由理事互推一人代理。只是一場會議主席缺席，依施行細則第13條由理事互推一人主持該場理事會。'],
   ...(s.print||s.agenda?[['主持一次會議不等於可以簽約或用印','依合作社法第34、53條，看對外代表人、章程、理事會決議及授權。互推主持例會的人不因此自動取得簽房租契約或用印權限；個別契約也不在這裡逕判有效。']]:[]),
   ['沒有退社，不啟動退社退款','若日後另行自請退社，才依合作社法第27、30條處理書面、年度終了和股金核算。股金是否應退、退多少及付款日，不以主席辭職日為準。']
  ],refs);
 }
 const statusStep=['先確認書面及准辭的機關','依人民團體選舉罷免辦法第27條，理事長、常務理事或理事向理事會，常務監事及監事向監事會提出書面，由對應的會議決議准辭，並於會員或會員代表大會報告。僅口頭請辭、尚未決議，不能先當成出缺。'];
 const votes=['會員大會和理事、監事會的投票名單分開','辭職不等於退會。只要仍具合格會員或會員代表身分及表決權，可依大會審定名冊在會員大會投票。理事或監事若已解任，就不再以該職務出席表決；只辭理事長而仍是理事，可按其理事身分參與理事會，不能再以舊理事長職權行事。理監事會名單按實際職務異動更新，會員名冊不要因卸職一併刪除。'];
 const fees=['仍是會員，就按已核備的會費規則辦','卸任不會自動免掉會員會費。依人民團體法第33條，會費數額、繳納方式按會員大會通過並報備的有效規定；若已經繳交同一期，不必因卸任重繳同一筆。'];
 const minutes=['職務異動和大會會議紀錄是兩件事','適用的選任職員簡歷冊或負責人名冊異動，依人民團體法第54條，異動後30日內報主管機關核備。實際召開大會後，會務輔導辦法第12條所定大會紀錄，自閉會後30日內報備查，不是同一個起算點。'];
 const assemble=['原大會能否照開，先核對有權召集與原通知','理事長請辭、主席調換或有幾個職務空出，不會自動取消已發通知的大會。確認當初是否由有權人依法召集、原通知日期及議程有無改、開會當時誰可主持。理事長確已出缺時，依章程與合法代理或補選處理；不能依法召開，依人民團體法第32條向主管機關確認指定召集人。組織仍應依法開大會，不能把未列入通知的改選臨時加進去。'+(s.chairContinues?' 如果原理事長仍合法在任，並未因這幾人的請辭而當然失去召集權。':'')];
 const vacancy=['理事或監事實際出缺，才分別依序遞補','依選舉罷免辦法第17條，先核每一案已依法准辭與職務；只辭理事長而保留理事不會產生理事缺額。理事、監事出缺分別由候補依序遞補，遞補後不足章程該類職務名額三分之二才補選足額。不能把個別補選當成提前改選新一屆或全部重算任期；請核對章程名額、實際名單、同意生效日及大會議程。'];
 const quorum=s.seats&&s.present&&s.present<=s.seats?['把章程名額、有效出席與補選底線分開算','若章程定理事'+s.seats+'席，補選門檻以章程名額計，遞補後至少還要有'+Math.ceil(s.seats*2/3)+'位在任理事，才不因這一項觸發補選。你提到現場'+s.present+'位，若均仍是在任、具資格的理事，且開會當時應出席'+s.seats+'人，過半需'+(Math.floor(s.seats/2)+1)+'位。先核是否有已離任者或出席數有變，不能把在場人數當成補完後的在任名額。']:null;
 const chairs=['理事長實際出缺後，由理事會依法補選','理事長出缺日起一個月內，由理事會依人民團體法第17條辦理。設常務理事時，由理事自常務理事中互選；未設時，由理事互選。所遺任期不足六個月，始得依章程或由常務理事互推代理；未設常務理事由理事互推。'+(s.exactSix?'恰好六個月不符合「不足六個月」，應辦補選。':'')+(s.underSix?'若你說的剩餘任期確實不足六個月，才可採前述代理例外。':'')];
 if(s.role==='multiple'){
  return make('多位理監事請辭：先算已生效的實際缺額','書面、口頭、理事會已准辭及監事會尚未決議不能混算。一位准辭，不表示其他人或全體也卸任。',[statusStep,vacancy,...(quorum?[quorum]:[]),...(s.agenda?[assemble]:[]),...(s.votes?[votes]:[]),...(s.fees?[fees]:[]),...(s.agenda||s.register?[minutes]:[])],refs);
 }
 if(s.role==='chair'){
  const lead=pending?'只口頭表示或尚未依法准辭，不能先當成理事長出缺，也不用先遞補理事。':s.only?'可以只辭去理事長；書面僅辭理事長時，不等於一起辭理事、常務理事或退出會員。'+(s.exactSix?'剩任期剛好六個月，不適用不足六個月的代理例外。':''):'先確認辭的是理事長還是連理事也辭，並看是否已依法准辭。';
  const scope=['兼任多重職務，書面寫清楚','依內政部對多重職務的說明，逐一寫明辭去的職務。只辭理事長、如依法確認仍是理事或常務理事，就沒有該席缺額，不由候補頂替；原任期內不得再當選同一已辭職務。'];
  const r=make('只辭理事長，和理事席次、會籍分開',lead,[statusStep,scope,chairs,...(s.agenda?[assemble]:[]),...(s.votes?[votes]:[]),...(s.fees?[fees]:[]),...(s.register||s.agenda?[minutes]:[])],refs);
  return !s.status&&s.agenda?branch(r,'辭職目前到哪一步？',[{label:'已書面且理事會准辭',question:'確認已書面准辭'},{label:'口頭或還沒有決議',question:'確認仍未生效，尚無理事會決議'}]):r;
 }
 const who=s.role==='supervisor'?'監事':'理事', body=s.role==='supervisor'?'監事會':'理事會';
 const summary=pending?'目前不能把'+who+'當成出缺；要書面請辭，經'+body+'決議才解任。':effective?'若辭職已由'+body+'決議生效，就不能再以'+who+'身分在該會表決；仍有會員資格，則可依法在會員大會投票。':'投票先看辭職是否生效和要開哪一種會。仍合格的會員可以在會員大會投票；'+who+'席次有無解任要另核對。';
 const r=make(who+'辭職：職務表決與會員投票分開',summary,[statusStep,votes,...(s.fees?[fees]:[]),...(s.replacement?[vacancy]:[]),...(s.agenda&&s.replacement?[assemble]:[]),...(s.register?[minutes]:[])],refs);
 return !s.status?branch(!s.org?{...r,summary:'若是一般協會，'+r.summary}:r,'辭職是否已經依法通過？',[{label:'已書面且 '+body+' 已准辭',question:'確認已書面准辭'},{label:'只口頭或還沒准辭',question:'確認仍未生效，尚無'+body+'決議'}]):r;
}
if(typeof module==='object'&&module.exports)module.exports={route};
else root.verifiedOfficeResignationScope=route;
})(typeof window==='object'?window:globalThis);
