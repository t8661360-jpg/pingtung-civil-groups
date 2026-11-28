(function(root){
'use strict';
const law=(title,p)=>({title,source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+p});
const county={title:'屏東縣政府對民間團體補助經費作業要點第8、8之一及10點',source:'https://portal.ptc.edu.tw/bulletin/view.php?sn=B114003910'};
const assoc=law('人民團體會務輔導辦法第27條','D0020094');
const civil=law('民法第28、37–42、739條','B0000001');
const coop=law('合作社法第4、60–65條','D0050112');
const asset=/設備|財[物產]|機器|物品|東西|器材|桌椅|電腦|列管|冷氣|冰箱/;
const borrowed=/借(?:來|的|用|給)|跟.{0,8}借|向.{0,8}借|借(?:公所|縣府|機關)/;
const money=/剩(?:餘|下|款|的錢)|帳上還有|餘款|餘額|沒用完|沒花完|未(?:支用|用)/;
const wrong=/(?:報|申報|核銷)(?:錯|重複)|錯報|浮報|虛報|重複(?:報|核銷)|不合規.{0,3}(?:憑證|單據)|(?:憑證|支出).{0,5}退件|錯(?:的)?[單帳]|發票.{0,4}錯/;
const pending=/還沒(?:請款|核銷)|未(?:請款|核銷|結案)|沒請款|待(?:請款|核銷)|沒完成.{0,5}核銷|沒核銷|核銷.{0,4}(?:還沒|未完成)/;
const scopeOnly=/只(?:是|要|有|辦)?[^。！？]{0,12}(?:補助|活動|計畫)[^。！？]{0,12}(?:到期|結束|做完|結案|核銷)|(?:不是|不會|沒有|並未|不必|不想|不用|不打算|沒有要|不會辦|不要|沒要|不)(?:要|辦|真的){0,2}解散|(?:協會|團體|合作社|社區).{0,7}(?:繼續(?:運作|做|開)|還在運作|照常運作|照常開|繼續經營)/;
const close=/結案|到期|結束|做完|剛辦完|執行完畢|收尾|怎麼結/;
const death=/解散|清算/;
const owner=/社團法人|協會|社會團體|人民團體/;
function parse(q,prior){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>480||/^新題/.test(t))return null;
 const reduced=t.replace(/(?:不是|並非|而非)(?:一般)?(?:合作社|協會|社團法人)/g,'');
 if(/信合社|信用合作社|農會|漁會|工會|公會|管委會|財團法人|破產|公益勸募|土地|房屋|不動產/.test(reduced))return null;
 if(/(?:沒有|並無|未領|不涉及)(?:任何|政府)?補助.{0,12}自籌/.test(reduced))return null;
 const isCoop=/合作社/.test(reduced), isAssoc=owner.test(reduced);
 if(isCoop&&isAssoc)return null;
 const only=scopeOnly.test(reduced), exit=death.test(reduced)&&!only;
 const regNo=/未(?:辦|經|完成)(?:法院)?(?:法人)?登記|只有(?:縣府)?立案|只立案|沒有(?:辦)?(?:法院)?(?:法人)?登記/.test(reduced);
 const regYes=/已(?:經)?(?:向法院)?(?:辦理|完成|辦)?(?:法院)?(?:社團)?法人登記|已登記(?:的|為)(?:公益)?社團法人|法院登記的社團法人|有(?:辦|做)(?:法院)?(?:社團)?法人登記/.test(reduced);
 const follow=prior&&(/^(?:確認(?:一下)?|更正(?:一下)?|其實|補充(?:一下)?|不是|沒有要|不(?:是|要)解散|只(?:是|要|結)|這筆|剛剛|還是|而是)/.test(reduced)&&(only||exit||isCoop||isAssoc||regYes||regNo||borrowed.test(reduced)||/補助購買/.test(reduced)));
 const prev=follow?prior:{};
 const explicitGrant=/補助|核銷/.test(reduced);
 const uncertainGrant=!explicitGrant&&!follow&&isAssoc&&only&&close.test(reduced)&&wrong.test(reduced)&&pending.test(reduced)&&money.test(reduced);
 const hasAsset=asset.test(reduced.replace(/(?:個人|自己)(?:的)?財產/g,''));
 const asksLiability=/個人.{0,4}(?:賠|還|責任)|自掏(?:腰包|錢)|自己.{0,4}(?:賠|還)|誰.{0,5}負責/.test(reduced);
 const matchMixed=hasAsset&&money.test(reduced)||wrong.test(reduced)&&pending.test(reduced)||wrong.test(reduced)&&money.test(reduced);
 const matchExit=exit&&(matchMixed||hasAsset&&(borrowed.test(reduced)||pending.test(reduced))||asksLiability||/誰(?:接手|處理|負責|還|賠|扛)|縣府.{0,5}法院|清算人/.test(reduced)&&(/補助|核銷/.test(reduced)));
 if(!follow&&!uncertainGrant&&!(explicitGrant&&(matchExit||(only||close.test(reduced))&&matchMixed)))return null;
 const org=isCoop?'coop':isAssoc||regYes||regNo?'assoc':prev.org||null;
 const still=(re,k)=>re.test(reduced)||!!prev[k];
 const same=!prev.org||!org||prev.org===org;
 return {uncertainGrant,org,reg:org==='assoc'?(regNo?'no':regYes?'yes':same?prev.reg:null):null,
  mode:only?'project':exit?'exit':prev.mode||null, asset:hasAsset||!!prev.asset, borrowed:still(borrowed,'borrowed'),
  cash:still(money,'cash'), wrong:still(wrong,'wrong'), pending:still(pending,'pending'),
  bought:still(/(?:補助(?:款|有)?買|補助(?:款)?購(?:置|買)|補助設備|核定買|設備補助|原計畫.{0,7}買)/,'bought'),
  liable:asksLiability||still(/自己賠|賠嗎|賠錢|自己還|個人|自掏腰包|誰.{0,5}負責|保證|賠償|股金|代墊|自掏(?:錢|腰包)/,'liable'),
  limited:org==='coop'&&(/有限責任/.test(reduced)||same&&prev.limited), guarantee:still(/另(?:外|行)?簽.{0,5}保證|契約保證|保證人|背書/,'guarantee'),
  local:still(/屏東|縣府|縣政府/,'local')};
}
function route(q,prior){
 if(prior?.uncertainGrant&&/^(?:確認|補充|更正|不是|其實|沒有)[^。！？]{0,20}(?:沒有政府補助|沒有補助|只用自籌|全是自籌|全額自籌|我們自己出|團體自籌)/.test(String(q??'').normalize('NFKC').replace(/\s/g,''))){
  return {direct:true,category:'活動結案',title:'自籌活動的帳要據實更正，不走補助核銷',summary:'沒有政府補助，就不要套用政府補助的繳回規則。把錯報的發票、已付款但尚未申報的費用和活動餘額分開列，保留原單據與更正紀錄，由團體財務經手人依內部授權核對。理事長不因職稱就要自己賠，仍要看有沒有個人造成的損害或另外的法律、契約義務。',refs:[law('社會團體財務處理辦法第5、20、21條','D0050097'),civil],questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 }
 const s=parse(q,prior);if(!s)return null;
 if(s.uncertainGrant)return {direct:true,category:'活動結案',title:'先核對單據，別把活動結束當作團體解散',summary:'先保留發票與付款紀錄，分開列出誤報、已付款但未請領的支出和餘額。是否要繳回、向誰更正、理事長是否有個人責任，不能只看有沒有經手。',grantCloseoutContext:s,questionState:{focus:'compound'},choiceHeading:'這筆活動經費是哪一種？',choices:[{label:'有政府補助，團體繼續運作',question:'確認是政府補助，只結這筆補助案，不解散'},{label:'團體自籌，沒有政府補助',question:'確認沒有政府補助，團體自籌活動帳如何結算？'}],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 const steps=[], refs=[county];const {mode,org,reg}=s;const exit=mode==='exit';
 steps.push(['補助剩款先對明細，不跟團體存款混算','把原核定、實際支出和撥款明細交原補助機關對帳。若適用屏東縣通案要點第8點之一，未支用的補助餘款要繳回；由承辦確認應繳金額、期限和方式。不自行把它留給下一案，也不是把團體銀行帳戶的所有餘額都繳回。']);
 if(s.wrong)steps.push(['錯報的單據要通報、留原件，再補正','先保留原憑證和報送紀錄，列出錯在什麼欄位、金額或是否重複，儘速向原補助機關說明，依指示更正及繳回不應領取的款項，不塗改或另找單據補數。屏東通案要點第10點對虛報、浮報及其他違規有追繳規定；不能只憑「報錯」就判定是故意。']);
 if(s.pending)steps.push(['核准但還沒請款，要看實支及核銷期限','列出符合核定用途、已實付但未請領的項目，備核定文件、領款收據、實支明細及原始憑證；符合計畫核銷條件才請領。若適用屏東通案要點第8點，計畫執行完畢後20日內辦核銷。超過期限立即問原機關可否補件；不能保證仍可領，也不要和要退的款自行相抵。']);
 if(s.asset&&s.bought)steps.push(['用補助款買的設備要看補助核定函','查核定函、財產清冊、所有權、用途、使用年限與移轉限制。適用屏東通案要點第8點的設備補助，核銷還應附納入團體財產的證明。未查清前先列冊保留，不自行分送、變賣或報廢；也不因計畫結束就假定一律要繳回。']);
 if(s.asset&&!s.bought&&!s.borrowed)steps.push(['物品先查來源和所有權','先列清冊、留核定函或借用單；向原機關核對是用補助買的還是借來，兩類處理不同，先不要移交或報廢。']);
 if(s.borrowed)steps.push(['向公所借來的設備另外清點歸還','核對借用單或契約，聯絡原出借單位安排點交，保留歸還證明。別把借用設備當團體自有或當成可用補助餘額。']);
 if(exit&&org==='coop'){
   refs.push(coop);
   steps.push(['合作社解散後，由清算人接手尚未了結的補助案','依合作社法第60、61條，沒有章程另定或社員大會另選時，由理事擔任；依法不能定清算人時才由法院選派。把餘款、憑證、設備、債權債務一併移交。由清算人向原補助機關核對個案，並向合作社主管機關辦理清算相關報告，法院選派者另依規定向法院呈報。無限制的剩餘財產也要等債務清償後才處理。']);
 }
 if(exit&&org==='assoc'){
   refs.push(assoc,civil);
   if(reg==='yes')steps.push(['社團法人解散有三個不同窗口','由有權的清算人向原補助機關（例如原核定的縣府單位）結案；另向原立案主管機關辦解散會務。理事長如果沒有清算人資格，應交付資料，不單憑原職稱代清算人辦理。民法第37、38條原則由董事擔任清算人，除非章程另定或總會另有決議，不能確定時由法院選任。依章程或總會決議解散時，董事依民法第42條於解散後15日內向法院報告，不是在縣府辦完補助核銷就算辦完。']);
   if(reg==='no')steps.push(['未辦法人登記的協會，按章程或大會決議交清算','會務輔導辦法第27條：依章程或會員（代表）大會決議；章程無規定或大會無法召開時，由理事長或章程所定代理人擔任，不能產生時由主管機關選任。由清算人聯絡原補助機關結案，並向團體主管機關確認申報；不套用已登記社團法人的法院解散登記。']);
 }
 if(mode==='project')steps.push(['只有補助案到期，就不走解散清算','以原受補助團體名義，由現在有權辦理的人帶核定函、撥款紀錄和清冊向原補助機關處理；已知錯報或疑似超期先聯絡，不必等全部單據整理好才通知。']);
 if(s.liable){
   if(org==='coop'&&!refs.includes(coop))refs.push(coop);
   if(!refs.includes(civil))refs.push(civil);
   steps.push(['團體退款和個人賠償是兩回事','不能只因擔任理事長、理事或曾經手，就認定要自己墊付或賠償。實際要看誰是受領人，及個人有無造成損害的違法行為、法律或契約義務。'+(s.limited?'有限責任合作社的社員以認購股額為其社員責任上限（合作社法第4條），已繳股金不等於可立即領回。':'')+(s.guarantee?' 另行簽的保證是不同的契約義務，請把保證文件和金額交由法律專業核對有效性與範圍，不因社員身分就推定無效。':'')]);
 }
 const out={direct:true,category:'補助結案與團體清算',title:mode==='project'?'只結補助案，不必辦團體解散':exit?'團體要解散，補助款項和物品先分類交接':'補助案結束，先把錢和物品分開處理',summary:mode==='project'?'團體會繼續運作。先找原補助承辦對帳；補助款剩多少、單據有沒有錯、設備是買的還是借的，分開確認。':exit?'補助機關的核銷和團體的清算是兩件事。已有權接手的人先保留憑證、點清錢和物品，不要先關帳戶或分財產。':'先向原補助機關核對實支、未用款和物品清冊。補助計畫結束，不代表團體也要解散。',steps,refs,grantCloseoutContext:s,questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 const choose=(choiceHeading,pairs)=>({...out,choiceHeading,choices:pairs.map(([label,question])=>({label,question:'確認'+question}))});
 if(!mode)return choose('這次是只結束補助案，還是團體也要解散？',[['只結束這筆補助','只結這筆補助案，不解散'],['團體也要解散','團體真的要解散']]);
 if(exit&&(!org||org==='assoc'&&!reg))return choose(org?'協會有向法院辦法人登記嗎？':'團體是哪一種？',[
  ['協會已辦法院法人登記','協會已辦法院法人登記'],['協會只有縣府立案','協會只有縣府立案'],...(!org?[['一般合作社','一般合作社']]:[])]);
 if(s.asset&&!s.bought&&!s.borrowed)return choose('這些物品是哪一種？',[['用補助購買的物品','物品是補助購買'],['向公所或機關借的物品','物品是向公所借用']]);
 return out;
}
if(typeof module==='object'&&module.exports)module.exports={route};
else root.verifiedGrantProjectCloseout=route;
})(typeof window==='object'?window:globalThis);
