(function(root){
'use strict';
const coop={title:'合作社法第11、14、18–27、30、36、37條',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050112'};
const credit={title:'信用合作社法第12條之1：退社、退股計算及給付',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=G0380058&flno=12.1'};
const norm=q=>String(q??'').normalize('NFKC').replace(/\s/g,'');
const cType=/信用合作社|信合社/;
const gType=/一般(?:[\p{Script=Han}]{0,6})合作社|(?:消費|勞動|生產|運銷|照顧服務)合作社|有限責任合作社|保證責任合作社|無限責任合作社/u;
const noCloseRE=/(?:不是|不會|並未|沒有(?:要)?|不打算|並非|不辦|不用|尚未|未曾|沒(?:有)?打算|不考慮|不)(?:全社|整(?:個|間)社|在辦|要)?(?:解散|清算)|(?:解散|清算)(?:是不可能的|沒有要辦|先不辦)|(?:社|合作社)還在營業/g;
const genuine=/(?:確定|已經|已|決議|命令|公告|正式|打算|要|須|準備|全社)(?:依法|辦理|通過)?(?:解散|清算)|(?:解散|清算)(?:了|人|之後|後|事務|登記)|餘產/;
const deathRE=/過世|喪生|死亡|亡故|身故|繼承|遺產/;
const stockRE=/社股|股金|股款|退股|股份|股息/;
const debtRE=/代墊|抵銷|抵充|抵扣|抵帳|拿.{0,8}抵|欠(?!缺)|債[權務]|貨款|房貸|貸款|定存|存款|質押/;
const profitRE=/盈餘|結餘|按(?:社員)?交易|按(?:採購|購買)量|公積金|公益金|股息/;
const clean=t=>t.replace(noCloseRE,'');
function underDiscussion(q){
 const t=norm(q);if(clean(t)===t)return false;
 return !genuine.test(clean(t));
}
function readType(t){
 const cleanType=t.replace(/(?:不是|並非|不屬於|不算)(?:一家|一間)?(?:信用合作社|信合社|一般合作社)/g,'');
 if(cType.test(cleanType)&&gType.test(cleanType))return null;
 if(cType.test(cleanType))return 'credit';
 if(gType.test(cleanType))return 'general';
 return null;
}
function parse(raw,prior){
 const t=norm(raw);
 const follow=prior&&/^(?:(?:等等|啊)?(?:更正(?:一下)?|補充(?:一下)?|改成|不是|其實|確認|選擇))/.test(t)&&/(?:信用合作社|信合社|一般合作社|消費合作社|過世|自願退社|自己退社|全社解散)/.test(t)&&t.length<95;
 if(follow){
  const b=readType(t);
  const mode=/不是(?:全社)?解散|(?:自己|本人|自願|自請)退社/.test(t)?'exit':/全社解散|(?:確定|已經)解散/.test(t)?'close':deathRE.test(t)?'death':null;
  return {...prior,type:b||prior.type,mode:mode||prior.mode,agent:/不是(?:請)?家人代領|自己(?:領|辦|退社)/.test(t)?false:prior.agent};
 }
 if(t.length>410||!/合作社|信合社/.test(t)||/農會|漁會|保險合作社|聯合社|公會|工會|財團法人|協會|有限公司|股東/.test(t))return null;
 const inactive=underDiscussion(t), realClose=genuine.test(clean(t))&&!inactive;
 if(realClose)return null;
 const type=readType(t), debt=debtRE.test(t), death=deathRE.test(t);
 const explicitExit=/退社|出社|退股|退出|不做社員|社員.{0,8}離開/.test(t);
 const refund=stockRE.test(t);
 const money=/結餘|盈餘|公積金|公益金/.test(t);
 const operation=money&&/(?:分|提撥|交易額|怎麼算|彌補|公積金).{0,7}|營業/.test(t);
 if(!explicitExit&&!(death&&(refund||debt||/代.{0,4}投票/.test(t)))&&!(operation&&(!/解散|清算|餘產|剩餘財產/.test(t)||inactive)))return null;
 if(type==='credit'&&!explicitExit)return null;
 /* 交叉巡檢第32輪：問退社後還能不能當理事監事、多久可以再入社（沒有問股金退還），交給 round-fixes */
 if(/(?:當|擔任|選|繼續當).{0,3}(?:理事|監事)|再(?:請)?入社|重新入社|再加入/.test(t)&&!/股金|退錢|退還|股款|社股/.test(t))return null;
 // Leave specialized meeting continuity, resignation and data-disclosure cases with their existing routes.
 if(/(?:理事會主席|理事長|監事|理事).{0,7}(?:辭|離職|卸任)|辭(?:掉|去|了).{0,8}(?:主席|理事長|理事)|(?:社員大會|社務會).{0,13}(?:法定人數|仍列入|要算|要扣|算我|扣人數|出席|表決)|(?:公告|公開|公布|貼網|上網).{0,9}(?:欠|名冊|名單)|(?:股款|股金|欠繳).{0,9}(?:上網|公布|公開|貼網)/.test(t))return null;
 if(type==='credit'&&!inactive&&!/房貸|貸款|質押|一(?:起|併).{0,5}(?:抵|扣)|代領|代辦|授權|委託/.test(t))return null;
 if(/除名|被(?:退社|踢出)|要把.{0,8}(?:趕走|退社)/.test(t)&&!death&&!/自願|自請|自行|想退/.test(t))return null;
 const mode=death?'death':explicitExit?(/社員.{0,8}離開/.test(t)&&!/退社|退股|退出/.test(t)?null:'exit'):'operate';
 return {type,mode,debt,unpaid:/還(?:有|沒).{0,8}(?:股款|沒繳)|欠繳|未繳|股款.{0,7}(?:沒繳|欠)|認股.{0,8}未繳|股金.{0,8}還沒繳/.test(t),profit:profitRE.test(t),liability:/無限責任|保證責任/.test(t),agent:/代領|代辦|授權|委託/.test(t)};
}
function route(q,prior){
 const s=parse(q,prior);if(!s)return null;
 if(s.mode==='close')return null;
 const common=['退社先看年度、章程和書面送達','自願退社一般在營業年度結束時生效，要提前三個月提出書面請求。章程可把提前期延為六個月；法人社員可延至一年。先跟社方確認營業年度末日和有效章程，留好送達紀錄。社員死亡不是自願退社，不適用這個預告期。'];
 const debt=['未繳股款、已繳社股和外部帳款要分開','依合作社法第18條，認了但沒繳的股款，不能拿對合作社或其他社員的債權（例如經核實的代墊款）抵銷；也不能直接拿已繳的股款抵自己欠合作社或其他社員的債。依第19條，合作社可以把社員應得的股息或結餘補繳股款。若已另形成應付的退股款或有其他債權爭議，請先核對帳、章程、請求權人和契約，不替個案判定可自動抵銷。'];
 const auth=['先問正式代辦方式，不在這裡送資料','是否能代辦或代領、要帶什麼，先請社方確認代理權和核驗方式。請不要在小屏填寫姓名、證件、存款或貸款資料。'];
 const equity=['結餘先補虧、再依法提撥；可分部分看交易額','依合作社法第22至24條，沒有結餘不得發股息，有結餘時社股年息不得超過10%。結餘先補累積短絀與付息，再提至少10%公積金、至少5%公益金，理監事及法定人員的酬勞金不超過10%；公積金已超過股金總額兩倍時，得自定當年提撥數。依法可分的餘額按社員交易額，不是按股金多寡；社員大會決議不分，也可轉增認股金或撥公積。'];
 const reserve=['公積金不是社員可請求分回的錢','合作社存續時，社員不能請求分配既有公積金。公益金也有法定用途，不是可分紅的錢。請先看理事會決算及提報社員大會的結餘分配案，社員可依第37條查閱。'];
 const liability=['無限或保證責任，出社不代表舊責任立刻解除','依合作社法第31條，出社前對合作社債權人的責任原則上要從出社決定起滿兩年才解除；該社若在出社後六個月內解散，該社員視為未出社。'];
 const make=(title,summary,steps,refs=[coop])=>({direct:true,category:'合作社｜'+title,title,summary,steps,refs,coopStockContext:s,questionState:{focus:'compound'}});
 const pick=(base,title,choices)=>({...base,choiceHeading:title,choices});
 if(s.mode==='operate'){
  if(s.type==='credit')return null;
  return make('存續中的年度結餘與公積金','社還在經營，就不是在分解散餘產。應先把當年的結餘與以前留下的公積金分開。',[equity,reserve]);
 }
 if(!s.type){
  return pick(make('先確認合作社種類','退社不一定領回全額。先分清是一般合作社還是信用合作社，再看是自願退社、社員過世，還是整個社解散。',[]),'您問的是哪一種？',[
   {label:'一般合作社',question:'確認一般合作社'},
   {label:'信用合作社（信合社）',question:'確認信用合作社'}
  ]);
 }
 if(!s.mode){
  return pick(make('先確認出社原因','退社、過世和全社解散不是同一種程序。已繳股金和欠款也不能直接混在一起結算。',[]),'您知道這是哪一種情況嗎？',[
   {label:'本人自願退社',question:'確認自願退社'},
   {label:'社員過世',question:'確認社員過世'},
   {label:'全社解散',question:(s.type==='credit'?'信用合作社':'一般合作社')+'已決議整個社解散。'+(s.debt?'有欠款需要先核對。':'')+'請問如何辦理解散登記、公告債權人及分配剩餘財產？'}
  ]);
 }
 if(s.type==='credit'){
  if(s.mode==='death')return make('信用合作社社員過世','社員過世不是自願退社。先由信用合作社依適用法令、章程及繼承文件確認請求權人及股金如何核退，家人不會因此自動取得投票資格。',[auth],[credit]);
  return make('信用合作社退社與退股','個人退股不是信用合作社解散。不按原始股金保證全退，也不會因決算有盈餘而領超過每股面額。',[common,
   ['以決算淨值估算，通過後三個月內退','依信用合作社法第12條之1，先確認依法提足評價準備，按營業年度末經社員代表大會通過的決算淨值除以股數計算，每股不超過面額。退股款應於該決議通過後三個月內退，不是從提出申請日開始算。只聽到有虧損，還不能斷定完全不退。'],
   ...(s.debt?[['房貸、定存、退股款分開核對','退社並不使貸款或定存自動終止，也不能僅因退社就把貸款、存款和股金一併扣抵。請向原信合社索取個別書面結算，核對契約的到期、質押及抵銷條件。']]:[]),...(s.agent?[auth]:[])],[credit]);
 }
 if(s.mode==='death')return make('一般合作社社員過世：股金與會籍分開','社員過世即屬出社。家人不是接下原社員身分，不能用過世者名義投票；社股則依法辦理繼承及核退。',[
  ['先確認繼承人是否依法入社','依合作社法第20、26條，社股繼承人承繼社股相關權利義務。不是社員的繼承人，若沒有依第11、14條加入，就依法核退股金；請透過社方正式窗口核對繼承人、章程和入社程序，金額不先承諾全退。'],
  ...(s.debt||s.unpaid?[debt]:[]),...(s.liability?[liability]:[]),...(s.agent?[auth]:[])]);
 return make('一般合作社自願退社與股金','這是個人出社，不是全社解散。能退多少、何時領，先看營業年度及有效章程。',[common,
  ['股金按年度末社產及章程核算','依合作社法第30條，可按章程請求退一部或全部股金，原則上以營業年度終了的財產狀況計算，章程另有規定則依其規定。不能直接套信用合作社的法定付款期限。'],
  ...(s.debt||s.unpaid?[debt]:[]),...(s.liability?[liability]:[]),...(s.agent?[auth]:[])]);
}
if(typeof module!=='undefined'&&module.exports){module.exports={route,underDiscussion};return;}
root.verifiedCooperativeStockExit=route;
root.cooperativeNoLiquidation=underDiscussion;
})(typeof window!=='undefined'?window:globalThis);
