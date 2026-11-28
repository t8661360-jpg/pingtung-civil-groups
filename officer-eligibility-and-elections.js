(function(root){
'use strict';
const law=(title,p)=>({title,source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+p});
const assocElect=law('人民團體選舉罷免辦法第15–17、25條','D0050093');
const assocAct=law('人民團體法第17、18、23、54條','D0050091');
const assocMinutes=law('人民團體會務輔導辦法第9、12條','D0020094');
const coopAct=law('合作社法第8、9、32、34、39、40條','D0050112');
const coopElect=law('合作社選舉罷免辦法第13、15、16、33、35、36條','D0050022');
const creditElect=law('信用合作社社員代表理事監事經理人應具備資格條件及選聘辦法第20、21條','G0380069');
const finance=law('信用合作社法第17條','G0380058');
const civil=law('民法第52、106條','B0000001');
const opinion={title:'法務部（84）法律決字第29716號：同一人代理雙方',source:'https://mojlaw.moj.gov.tw/LawContentExShow.aspx?id=FE077663&media=print&type=E'};
const orgA=/協會|社會團體|人民團體|社團法人/;
const orgC=/合作社|社員大會|創立會/;
const creditRe=/信用合作社|信合社/;
const positions=/理事|監事/;
const bothRoles=/理[、／/與和及、]?(?:事)?[、／/與和及兼與]?監事|理事.{0,32}監事|監事.{0,32}理事/;
const across=/不同(?:的)?(?:社會)?(?:團體|組織|協會)|另(?:一家|一間|一個)|另一邊|各自.{0,12}(?:改選|會員)|兩(?:個|家|間|邊).{0,12}(?:協會|社會團體|合作社|章程|職務)|甲會.{0,10}乙會|別(?:家|的)合作社|其他.{0,6}合作社|跨.{0,5}(?:團體|組織)|另(?:外)?一個會/;
const dual=/同時當選|都當選|同時(?:當|拿到|被選)|兩邊.{0,9}(?:都得票|同時就任)|又當(?:了)?監事|又(?:是|當)理事|同(?:一|個)(?:個|次|屆|場)?.{0,10}(?:選舉|選|改選)|同一個協會.{0,12}(?:又|兼)/;
const sameA=/同(?:一|個)(?:個|次|屆|場)?.{0,10}(?:協會|社會團體|人民團體)|(?:自己|自家|本|同一個)協會.{0,22}(?:又|同時|也想|兼|也當選)|社區發展協會.{0,12}同一次選舉/;
const sameC=/(?:本社|同一(?:間|家|個)?合作社).{0,28}(?:當選|兼任|票|又當)|(?:合作社|社員大會|創立會).{0,22}(?:同時當|雙料|都當選)/;
const startup=/成立|設立|創立會|發起人|先送件/;
const counts=/(?:[二兩三四五六七八九十2-9]+(?:名|位|個)?(?:理事|監事)|(?:理事|監事)(?:規劃|已有|只有|僅有|至少|要幾個|要幾人|需要|要有)?[零〇一二兩三四五六七八九十0-9]+(?:人|名|位)|[三3]加[三3])/;
const eligibility=/還不(?:是|算)社員|未入社|沒入社|未具社員|原任理事|曾任理事|原是本社理事|責任.{0,7}(?:解除|未解除)|資格|競爭關係|同業同級|同級同業/;
const contract=/契約|租金|租屋|簽約|訂約|簽租|租場地|有利害|迴避|兩邊簽|兩方簽|評議/;
const meetingRecord=/紀錄|記錄|紀要|選票|報備|備查|送件|登記|公告/;
const stop=/工會|農會|漁會|公會|財團法人|選舉公職|解散|罷免.{0,5}(?:過半|連署|名單)|財務報表|聘僱|支領薪資|薪資|薪水|多少出席費|證券事業|銀行董事|保險事業|就業保險|加班費|理事長兼會計/;
const assocLabel=['同一個協會／社會團體','確認同一協會的理事監事'];
const coopLabel=['同一個一般合作社','確認同一一般合作社的理事監事'];
const crossLabel=['不同團體各有一職','確認不同團體各有理事監事'];
const creditLabel=['信用合作社','確認信用合作社的理事監事'];
const choices=arr=>arr.map(([label,question])=>({label,question}));
const normalize=q=>String(q??'').normalize('NFKC').replace(/\s+/g,'');
function parse(q,prev){
 const original=normalize(q);
 if(!original||original.length>550||/^新題/.test(original)||stop.test(original))return null;
 const isPicked=[assocLabel,coopLabel,crossLabel,creditLabel].find(x=>x[1]===original);
 if(isPicked===assocLabel)return {a:true,sameA:true};
 if(isPicked===coopLabel)return {c:true,sameC:true};
 if(isPicked===crossLabel)return {cross:true,unknownType:true};
 if(isPicked===creditLabel)return {credit:true};
 const correction=!!prev&&/^(?:更正(?:一下)?|補充(?:一下)?|剛才說錯|其實)/.test(original)&&/理事|監事|不同.{0,5}團體|兼職|兼任/.test(original);
 if(!positions.test(original)&&!correction)return null;
 if(!creditRe.test(original)&&orgA.test(original)&&orgC.test(original)&&positions.test(original)&&
    /(?:理事|監事).{0,7}(?:幾(?:個|位|名)?人|幾名|幾位|多少人|名額|最少|最低)|(?:幾(?:個|位|名)?人|幾位|多少人).{0,5}(?:理事|監事)/.test(original)&&
    !/出席|成會|表決|簽|委託|同時當選|兼任|競爭/.test(original))return {countCompare:true,community:/社區發展協會|社區協會/.test(original)};

 const t=original.replace(/(?:沒有|不是|不是問|排除|並非|不談)(?:涉及)?(?:信用合作社|信合社)/g,'');
 const credit=creditRe.test(t);
 let a=orgA.test(t), c=orgC.test(t);
 const noSelf=/不是同一個|沒有選.{0,6}(?:當|做)?監事|沒有兼任同一|不是同一個團體兼任|不是同一間/.test(t);
 const noDeal=/不會彼此簽約|不簽契約|沒有跟.{0,20}簽約要處理|不(?:再|準備|打算)?跟.{0,12}簽約|沒有契約/.test(t);
 const cross=across.test(t)||a&&c&&/(?:候選監事|理事.{0,12}(?:又|也想|想當)|(?:兼職|兼任)|不同)/.test(t);
 const isDual=!noSelf&&bothRoles.test(t)&&dual.test(t);
 const explicitSameA=!noSelf&&sameA.test(t)&&bothRoles.test(t);
 const explicitSameC=!noSelf&&sameC.test(t)&&bothRoles.test(t);
 const sameAssoc=explicitSameA||a&&!c&&!cross&&isDual;
 const sameCoop=explicitSameC||c&&!a&&!cross&&isDual;
 const qualifyingCross=/能(?:當選|擔任|兼任)|可不可以|可以嗎|想(?:當|兼(?:任)?)|要不要(?:辭|解任)|職務|兼職|候選|改選|是否(?:能|可)/.test(t);
 const qualify=c&&(counts.test(t)||eligibility.test(t))&&(startup.test(t)||counts.test(t)&&bothRoles.test(t)||/監事資格|原任理事|責任.{0,7}(?:解除|未解除)/.test(t));
 if(correction&&!a&&!c){a=!!prev.a;c=!!prev.c;}
 if(credit){
  if(!bothRoles.test(t)||!/(登記|候選|同時當選|票數|同時當)/.test(t))return null;
  return {credit:true};
 }
 if(!(a||c)&&cross&&positions.test(t)&&!correction)return {question:true};
 if(!noDeal&&contract.test(t)&&cross&&!qualifyingCross&&!sameAssoc&&!sameCoop&&!qualify&&!correction)return null;
 if(qualify||sameAssoc||sameCoop||cross&&(bothRoles.test(t)||correction)||correction&&(c||a))return {a,c,cross,community:/社區發展協會|社區協會/.test(t),sameA:sameAssoc,sameC:sameCoop,qualify,
   counts:counts.test(t),startup:startup.test(t),registry:/候選登記|登記候選|登記.{0,6}候選/.test(t),late:/先送件|會後再補|先入社|再補/.test(t),tie:/票數.{0,4}(?:相同|一樣|一樣多)|同票/.test(t),absent:/不在|未到|已離場|人已離開/.test(t),
   records:meetingRecord.test(t),personal:!noDeal&&/(?:跟|找|與|向|和).{0,10}(?:自己|現任|該|本社)?理事(?:長)?(?:本人|個人).{0,8}(?:租|簽|訂|買|賣)/.test(t),deal:!noDeal&&contract.test(t),
   competed:/同業同級|同級同業|已確認.{0,8}競爭|確定.{0,5}競爭/.test(t)&&!/不確定|無競爭/.test(t),former:/責任/.test(t),cleared:/責任已(?:經)?解除/.test(t)&&!/責任還沒解除|責任未解除/.test(t),unknownType:!a&&!c};
 if(!a&&!c&&t.length<65&&(isDual||cross&&/兼|另(?:外)?一個會/.test(t))&&positions.test(t))return {question:true};
 return null;
}
function route(q,prev){
 const x=parse(q,prev);if(!x)return null;
 const a=(title,summary,steps,refs,extra)=>({direct:true,category:'理監事資格與選舉',title,summary,steps,refs,officerEligibilityContext:x,actions:[{label:'聯絡承辦',view:'contact',sub:''}],questionState:{focus:extra?'clarify':'compound'},...extra});
 if(x.countCompare)return a('屏東一般協會與一般合作社，理監事名額不同','一般縣級協會理事最少九人；一般合作社理事最少三人。兩者監事均至少三人，但協會另有限制。',[
  ['一般縣級協會：依章程定奇數，也有法定上限','人民團體會務輔導辦法第9條與人民團體法第17條：一般縣（市）以下社會團體的理事為九至十五人且為奇數；監事至少三人、須為奇數，不得超過理事名額三分之一。實際人數按章程，在會員或會員代表中選出。全國性或適用特別法的團體另核，不能直接用縣級上限。'+(x.community?'屏東縣立案的社區發展協會，請拿實際章程確認所定理監事名額，不要誤用區內合作社名額。':'')],
  ['一般合作社：理事、監事至少各三人','合作社法第32條，由社員大會從社員中選任。依章程核對應選名額；不是沿用協會九人或三分之一的規則。信用合作社另有專用規定。']
 ],[assocAct,assocMinutes,coopAct]);
 if(x.question)return a('先確認是同一個團體或不同團體','同一次選舉同時當選，與在不同團體各有職務，是兩件事。一般合作社、協會、信用合作社的選舉規定也不同。',[],[],{choiceHeading:'您問的是哪一種？',choices:choices([assocLabel,coopLabel,crossLabel,creditLabel])});
 if(x.credit)return a('信用合作社：不能同時登記理事及監事候選人','這是候選登記階段的限制，不是等選完再選一邊。不要套用一般合作社得票後擇一的規則。',[
  ['先對照信用合作社專用規定','依選聘辦法第20條，理事監事採登記候選且同一社員不得同時登記兩種。各類資格及審查依該辦法；金融機構間兼職另看信用合作社法第17條。']
 ],[creditElect,finance]);
 const steps=[],refs=[];
 if(x.qualify&&(!x.former||x.counts||x.startup)||x.c&&x.counts){
  steps.push(['普通合作社要有至少三位理事、三位監事，分別從社員中選出','依合作社法第32條，若只選出兩位監事，名額不足；還沒取得社員資格也不能選為監事。創立會依第8、9條辦理創立、通過章程與選任，不把不合資格或缺額寫成已選足後送件。先核對資格、章程和創立程序；若會已開或已送件，持紀錄請主管機關確認如何補正或重辦。已成立合作社另核對名冊公告後才入社的當屆選舉資格限制。']);
  refs.push(coopAct,coopElect);
 }
 if(x.sameA){
  steps.push(['同一協會同時當選理事與監事，當場擇一，不可兩職都就任','協會這邊，'+(x.community?'社區發展協會適用人民團體選舉規定；其理監事選舉、名冊及議事紀錄不能改用合作社書表。':'')+'依人民團體選舉罷免辦法第16條：本人不在或無法擇定，以較高票的職位為準；同票抽籤。若一項正式當選、一項候補，保留正式當選的職位；不要把不同團體的票數拿來比較。依實際當選與候補順序處理缺額；若兩職早已對外登載，保留原始紀錄並請主管機關確認更正，不先宣稱兩職都有效或逕認需罷免。']);
  refs.push(assocElect,assocAct,assocMinutes);
 }
 if(x.sameC){
  steps.push(['一般合作社先看是登記候選還是其他選舉方式','採登記候選時，第15、16條規定不能同時被連署推薦為理事和監事候選人。非該方式的同時當選，依第35條當場擇一；缺席或未擇定，由高票職位當選，同票由會議主席抽籤；同時當選一個正式與另一個候補，以正式職位為準。合作社法第40條禁止監事兼任理事、事務員或技術員。']);
  refs.push(coopAct,coopElect);
 }
 if(x.c&&(x.cross||x.former)){
  steps.push(['合作社另查原任理事責任與跨團體競業限制',
   (x.cleared?'原任理事責任確已解除，則第40條第2項在這一點不再擋他當選；仍要確認已具社員資格、候選資格及其餘限制。':'曾任理事的社員，責任尚未解除前不得當選監事。')+
   (x.competed?'你說另一家是同業同級合作社，不能同時擔任兩家的理監事。':'理事、監事不得兼任其他業務性質相同的同級合作社理監事，也不得兼任與本社有競爭關係的團體或事業職務。合作辦活動本身不等於競爭。')+
   '兩邊同意、迴避表決或備查，都不能取代法定資格。']);
  refs.push(coopAct);
 }
 if(x.cross&&(x.a||x.unknownType)){
  steps.push(['不同團體各有一職，不套「同一團體當場擇一」','若是兩家一般協會，沒有單因各有一職就必須辭一邊的通則；請分別核對會員資格、各協會章程、特別法及各自選任程序。若一邊是合作社，另核對合作社第40條。合辦活動與職務資格分開；只在一邊當選不會自動改另一邊名冊。']);
  refs.push(assocAct,assocElect);
 }
 if(x.deal||x.personal){
  if(x.personal)steps.push(['合作社向自己的理事本人租屋，監事代表合作社這一方','依合作社法第39條第1項第4款，理事本人作為契約相對方；主管機關備查或另一組織人員到場，均不會改變誰是契約當事人。']);
  if(x.cross||!x.personal)steps.push(['兩個組織要簽約，各找有權代表，不讓同一人直接簽兩邊','依民法第106條及法務部函釋，雙方代理要另外核對事前許諾、依法作成的承認或其他法定例外，不能只靠兩個職稱。若是協會與合作社互為相對人，不是合作社向自己理事本人訂約，不因第39條就讓監事代表。']);
  steps.push(['在有利害關係的議案先揭露並核對迴避','分開記載各團體的議案、利害關係、出席與迴避、票數及授權。若適用民法第52條，社員與社團法人總會議案有自身利害且有損害社團利益之虞時，不得加入表決或代人投票；不是單憑兼職就所有案件都不能投。其他會議按適用法令與章程核對。']);
  refs.push(civil,opinion,...(x.c?[coopAct]:[]));
 }
 if(x.records){
  steps.push(['選務與簽約分別留紀錄，異動各向各自主管機關辦','保留票數、擇一或抽籤過程、逐職當選及候補結果；選票及異議依適用選罷辦法處理。協會選任職員等名冊異動依人民團體法第54條三十日內報核備；普通合作社依變更事項、選舉及登記規定報原主管機關，不把協會報備當成合作社已完成。']);
  refs.push(...(x.a?[assocAct,assocMinutes]:[]),...(x.c?[coopAct,coopElect]:[]));
 }
 const title=x.c&&x.former&&!x.cross&&!x.sameC?'一般合作社：曾任理事的人要先確認責任是否解除':x.cross?'先分清同一團體雙重當選，和不同團體兼職':x.sameA?'同一協會理事、監事不可同時就任':x.sameC?'同一合作社理事、監事不能同時擔任':'普通合作社：理事與監事各至少三人，均須為社員';
 const summary=x.c&&x.former&&!x.cross&&!x.sameC?'原任理事的責任是否已依法解除，與目前是否符合社員及監事候選資格，要分開核對。':x.cross?'同一團體選出兩職、跨團體資格、以及替誰簽約，要分成不同問題；不同團體不自動互斥，但合作社有具體競業限制。':x.sameA||x.sameC?'先依團體類型及選舉方式處理。不要因兩邊都得票就同時就任。':'依你描述的名額與身分先核資格，不把兩位監事或非社員人選當成已符合規定。';
 return a(title,summary,steps,[...new Map(refs.map(r=>[r.title,r])).values()]);
}
if(typeof module==='object'&&module.exports)module.exports={route};
else root.verifiedOfficerEligibilityAndElections=route;
})(typeof window==='object'?window:globalThis);
