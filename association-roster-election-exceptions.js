(function(root){
'use strict';
const art=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const guide=n=>art('人民團體會務輔導辦法','D0020094',n);
const assoc=n=>art('人民團體法','D0050091',n);
const elect=n=>art('人民團體選舉罷免辦法','D0050093',n);
const civil={title:'民法第56條：總會決議程序或內容違法的區別',source:'https://mojlaw.moj.gov.tw/LawContentExtent.aspx?LawNo=56&lsid=FL001351'};
const common=['一般定期會員大會：不能因為來不及就直接拿舊名冊','人民團體會務輔導辦法第10條原則上由理事會於大會15日前審定應出席資格、造具名冊。多數理事確因出會而無法成會審定時，第10條第5項才可依最近一次審定名冊召開大會，由大會辦理審定資格。不是只要理事缺席、忘了開或時間不足就符合。'];
const requested=['依法請求的臨時會員大會：用最近一次審定的名冊','依會務輔導辦法第15條，理事過半數或會員（代表）五分之一以上書面連署，或監事會發函請求所召開的臨時會員（代表）大會，應出席人員以最近一次經理事會審定的會員（代表）名冊為限，不需只因這場會再重審一份。連署或發函須以雙掛號寄理事長、取得回執後報主管機關備查；收件後30日未開完，主管機關得指定一名理事召集，不是連署者自行召集。'];
const past=['已開會有爭議：程序瑕疵與當然無效不是同一句話','先保存章程、召集依據、審定名冊和會議紀錄，向主管機關反映，人民團體法第58條有監督處理規定。如為社團法人，民法第56條就召集程序或決議方法違法或違章程，規定社員可於決議後3個月內請求法院撤銷；有出席者未當場表示異議，不得依該項請求撤銷。這不是縣府申訴期限。內容違法或違章程是另項規定，不由本站直接認定個案效力。'];
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>260||!/協會|社會團體|人民團體|社團法人|本會/.test(t)||/合作社|社員大會|公會|工會|農會|漁會|公司|股東|財團法人|管委會|學生會/.test(t))return null;
 const video=/視訊|線上|遠端|網路/.test(t), postal=/郵寄|通信|通訊|選票寄/.test(t), role=/理事|監事|理監事/.test(t), action=/選舉|改選|罷免|線上選|直接選|遠端選|選理|郵寄投票/.test(t);
 const remote=video&&/大會|視訊.{0,7}(?:選|投票|罷免)|線上選|遠端選/.test(t);
 if(role&&action&&(remote||postal)&&!/結果|票數|委託|補選|改選結果.{0,8}寄|寄通知單/.test(t)){
  const recall=/罷免/.test(t), electIntent=/選舉|改選|線上選|直接選|遠端選|選理/.test(t);
  const steps=[['視訊開會不等於能遠端選舉或罷免','人民團體法第25條容許在符合章程等法定條件時以視訊開會員（代表）大會；選舉罷免另依選罷辦法第3條原則在同一地點集會辦理。第6條允許電子選舉票或罷免票，指票的形式，不等於可以讓會員從家中視訊投票。']];
  if(!recall||electIntent)steps.push(['有章程依據才可另辦理監事紙本通訊選舉','第23條是另走的選舉程序，不是在視訊會議裡投票。章程須定有通訊選舉，理事會在開票日45日前開會審定資格及造冊供閱覽，開票日30日前印製及寄出紙本通訊選舉票；通知、投票、開票、異議等實施辦法須經理事會通過並報主管機關備查。第24條分區或分類選會員代表則是另一個制度。']);
  if(recall)steps.push(['不能把通訊選舉例外套在罷免','第23條規範的是理事、監事選舉，不授權以郵寄或視訊方式罷免理監事。請按罷免相關程序辦理。']);
  return {direct:true,category:'人民團體選務｜視訊與通訊投票',title:'視訊開會、現場選舉與郵寄選票是不同程序',summary:recall?'不能在視訊上直接辦理理監事罷免，也不能用第23條的郵寄選舉程序代替。':'不能直接在視訊上遠端選理監事；章程有依據且符合第23條完整程序，才可以另外辦紙本通訊選舉。',steps,refs:[assoc(25),elect(3),elect(6),elect(23),elect(24)],questionState:{focus:'compound'}};
 }
 if(!/會員(?:代表)?大會|臨時大會/.test(t)||!/名冊/.test(t)||!/審|舊|上次|最近一次/.test(t)||/閱覽|影印|查閱|索取|公布|提供一份|補助|改選|罷免|選舉|解散|視訊/.test(t))return null;
 const formal=/連署|聯署|五分之一|1\/5|監事會.{0,5}(?:函請|發函)|理事過半/.test(t)&&/臨時/.test(t)&&!/沒(?:有)?(?:書面)?連署|尚未(?:書面)?連署|未達五分之一|不到五分之一|監事會沒(?:有)?發函|不到過半|未過半/.test(t);
 const ordinary=/定期|年度|多數理事.{0,5}(?:出會|退會)|大會.{0,12}已開|開完.{0,11}大會/.test(t);
 if(!formal&&!ordinary&&!/來不及|沒開理事會|可.{0,4}用.{0,5}舊/.test(t))return null;
 const done=/已開|開完|已經開|表決完|決議.{0,5}(?:有效|無效|撤銷)|法院/.test(t);
 const uncertain=!formal&&!ordinary&&!done;
 const steps=formal?[requested,common]:[common,requested];
 if(done)steps.push(past);
 return {direct:true,category:'人民團體會務｜會員名冊與大會召集',title:formal?'依法書面請求的臨時大會，使用最近一次審定名冊':ordinary?'定期大會要先審名冊，不能因來不及就沿用舊名冊':'先分定期大會，還是依法連署或發函的臨時大會',summary:formal?'如果符合書面連署或監事會發函的法定程序，這場臨時大會用最近一次已由理事會審定的名冊。':'大會適用的名冊要看召集原因，不能只因時間不夠就一律使用舊名冊。',steps,refs:[assoc(25),guide(10),guide(15),...(done?[assoc(58),civil]:[])],questionState:{focus:'compound'},...(uncertain?{choiceHeading:'這場大會是怎麼召集的？',choices:[{label:'一般定期大會',question:'協會的定期會員大會沒有開理事會重新審會員名冊，大會還能照開嗎？'},{label:'已依法連署或發函的臨時大會',question:'協會會員達五分之一以上且已依規定書面連署，臨時會員大會可用上次理事會審的名冊嗎？'}]}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationRosterElectionExceptions=route;
})(typeof window!=='undefined'?window:globalThis);
