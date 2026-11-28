(function(root){
'use strict';
const by=(title,p)=>({title,source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+p});
const people=by('人民團體法第25–27、59條','D0050091');
const guide=by('人民團體會務輔導辦法第12、27條','D0020094');
const civil=by('民法第35、37–44、57條','B0000001');
const civilProcedure=by('非訟事件法第88、91條：解散與清算終結登記','B0010008');
const moi={title:'內政部合作及人民團體司 Q131：如何解散協會',source:'https://www.moi.gov.tw/News_toggle3.aspx?PageSize=10&_CSN=1633&n=8361&page=14&sms=9015'};
const court={title:'法院登記實務參考：社團法人解散及清算文件',source:'https://sld.judicial.gov.tw/tw/dl-17945-2ea191c6617d42ee877d10f35a851306.html'};
const view={title:'法務部法律字第11003504230號：特定人民團體及書面決議疑義',source:'https://mojlaw.moj.gov.tw/LawContentExShow.aspx?id=FE348483&type=E'};
const grants={title:'屏東縣政府對民間團體補助經費作業要點（官方附件）',source:'https://portal.ptc.edu.tw/bulletin/attachment.php?a_sn=33872&b_sn=B114003910'};
const labor={title:'勞動基準法第28條：積欠工資、退休金與資遣費',source:'https://laws.mol.gov.tw/FLAW/FLAWDOC01.aspx?flno=28&id=FL014930'};
const norm=s=>String(s??'').normalize('NFKC').replace(/\s/g,'');
const excluded=/合作社|信合社|公會|工會|農會|漁會|財團法人|管委會|股份有限公司|基金會|政治團體|政黨/;
const assoc=/協會|社會團體|人民團體|社團法人/;
const negReg=/(?:尚未|沒有|沒(?:有)?|未曾|不曾|從未|從來沒|還沒|未|並未)(?:經法院|去法院|向法院|到法院|辦理|辦|做|完成|過|法院){0,4}(?:登記為)?(?:社團)?(?:法人)?登記|(?:只有|僅有|只有辦|只辦|只有縣府|僅縣府|有縣府)立案|(?:沒|未)辦法人/;
const posReg=/已(?:取得|領有).{0,10}(?:社團法人)?證書|(?:已經|已|已經向)(?:去|向|在|到|法院|辦理|辦|完成|做|的){0,7}(?:社團)?法人登記|有(?:拿到|取得|領到|法院的|法院核發的){0,3}(?:社團)?法人(?:登記)?證書|法院登記的社團法人|有法院登記|有辦過社團法人/;
function identify(t){
 const plain=t.split(/如果|假如|那如果|若是|若沒/)[0];
 return negReg.test(plain)?'unregistered':posReg.test(plain)||/^社團法人(?:的)?解散/.test(plain)?'registered':null;
}
function parseCounts(t){
 const get=(re)=>+(t.match(re)?.slice(1).find(Boolean)||0);
 const total=get(/(?:總(?:共|數)|一共|全部|全體(?:會員(?:有|共)?)?|共有)(\d{1,5})(?:位|名|個|人)?|^(\d{1,5})(?:位|名)|[，,、；;。](\d{1,5})(?:位|名)(?=會員|[，,、；;。])|(\d{1,5})(?:位|名)會員/);
 const present=get(/(?:到場|出席(?:有|共|了)?|來了|到(?:了|場有)?|來了共|實際到場)(\d{1,5})(?:位|名|人)|(?:到場|出席|來了|到)(\d{1,5})(?=[，,、；;。])|(\d{1,5})(?:位|名|人)(?:到場|出席)/);
 const yes=get(/(\d{1,5})(?:位|名|票|人)(?:投票解散|投贊成|贊成|同意)|(?:同意|贊成)(?:有|共)?(\d{1,5})(?:位|名|票|人)/);
 return total&&present&&yes&&yes<=present&&present<=total?{total,present,yes}:null;
}
const options={registered:'已辦法院法人登記',unregistered:'只有立案，未辦法院法人登記'};
function parse(q,prior){
 const t=norm(q);if(!t||t.length>470||/^新題/.test(t))return null;
 const reduced=t.replace(/(?:不是|非|並非)(?:一家|一般)?(?:財團法人|合作社|信合社|公司|破產)/g,'');
 if(excluded.test(reduced))return null;
 const prefix=/^(?:更正(?:一下)?|補充(?:一下)?|確認|選擇|改成|其實)/.test(reduced);
 const specified=identify(reduced);
 const follow=prior&&prefix&&(specified||/清算人|結清|剛開完|沒有破產|法院法人已登記/.test(reduced));
 const c=follow?prior:{};
 const org=assoc.test(reduced)||!!c.org;
 if(!follow&&!/解散|清算|結束(?:營業|會務|運作)?|不做了/.test(reduced))return null;
 if(!follow&&!org&&!( /^(?:我們)?團體/.test(reduced)&&/解散/.test(reduced)&&/票|錢|財產/.test(reduced)))return null;
 if(!follow&&/被主管機關(?:命令|勒令)解散|命令解散|認定違法|欠錢還不起|(?:已|遭)宣告破產|停止業務/.test(reduced))return null;
 const votes=/表決|票|多少人|幾個人|幾人|多少會員|門檻|贊成|同意|半數|一半/.test(reduced);
 const debts=/欠|應(?:收|付)|債|廠商|押金|租金|員工|資遣|工資|薪水/.test(reduced);
 const assets=/設備|器材|桌椅|冷氣|投影機|電腦|物資|財產|捐[物贈款給]|會費|結餘|賸餘|餘款|錢|補助/.test(reduced);
 const filing=/哪個機關|找縣府|向法院|法院報|法院還是|送件|什麼資料|怎麼報|報縣府|清算人/.test(reduced);
 const account=/關(?:帳|賬|戶)|辦銷戶|結清|銀行|存款|定存|轉進|轉到/.test(reduced);
 if(!follow&&filing&&!votes&&!debts&&!assets&&!account&&!/縣府還是|法院還是|哪個機關|向法院.{0,9}幾天|法院報.{0,6}幾天/.test(reduced))return null;
 const written=/書面同意|書面(?:表決|決議)|通訊.{0,5}(?:投票|表決)|郵寄.{0,5}(?:同意|表決)/.test(reduced);
 const otherExample=/(?:如果|假如|若是|若)(?:還)?(?:沒有|沒辦|未辦|還沒).{0,8}(?:法人)?登記/.test(reduced);
 const realized=/已(?:經)?(?:決議|完成|確定)解散|正在清算|清算中/.test(reduced);
 if(!follow&&!(votes||filing||account||assets&&debts||assets&&/新(?:成立|設立|組成)?(?:的)?(?:社區)?(?:協會|團體)|捐給|贈與|移轉/.test(reduced)||written))return null;
 if(!follow&&/退會|退費|退還會費|停權|除名|公益勸募.{0,8}(?:剩餘財物|延長)專案/.test(reduced)&&!filing&&!written&&!votes)return null;
 const any=(x,key)=>!!(x||c[key]);
 return {org,reg:specified||c.reg||null,realized:any(realized,'realized'),counts:parseCounts(reduced)||c.counts||null,votes:any(votes,'votes'),debts:any(debts,'debts'),assets:any(assets,'assets'),filing:any(filing,'filing'),account:any(account,'account'),written:any(written,'written'),otherExample:any(otherExample,'otherExample'),grant:any(/補助/.test(reduced),'grant'),borrowed:any(/(?:借[來的給]|借用|借我們|借的)|公所.{0,10}借/.test(reduced),'borrowed'),restricted:any(/指定|限制用途|指定用途/.test(reduced)&&/捐|贊助|物資/.test(reduced),'restricted'),staff:any(/薪水|欠薪|工資|資遣|員工/.test(reduced),'staff'),deposit:any(/押金|保證金/.test(reduced),'deposit'),concreteLocal:any(/縣府|屏東|公所/.test(reduced),'concreteLocal'),bankrupt:/已宣告破產|確定破產/.test(reduced)&&!/沒有破產|未破產/.test(reduced)};
}
function route(q,prior){
 const s=parse(q,prior);if(!s)return null;
 const make=(title,summary,steps,refs)=>({direct:true,category:'協會會務｜解散、清算與財產',title,summary,steps,refs,liquidationPathContext:s,questionState:{focus:'compound',domain:'association-dissolution-estate'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]});
 const pending=make('先確認團體與法人登記情況','請先不要把存款交給新團體或把財產分掉。解散表決和清算做法，要看是哪一種團體、有沒有向法院辦理法人登記。',[],[people,guide,moi]);
 if(!s.org&&!s.reg)return {...pending,choiceHeading:'你問的是哪一類團體？',choices:[
  {label:'一般協會，已辦法院法人登記',question:'確認一般協會已辦法院法人登記'},
  {label:'一般協會，只有縣府立案',question:'確認一般協會只有縣府立案，未辦法人登記'},
  {label:'一般合作社',question:'一般合作社解散，社員大會的表決門檻和剩餘財產怎麼處理？'}
 ]};
 if(!s.reg)return {...pending,choiceHeading:'有沒有向法院登記為社團法人？',choices:Object.entries(options).map(([k,l])=>({label:l,question:k==='registered'?'確認已辦法院法人登記':'確認未辦法院法人登記'}))};
 const reg=s.reg==='registered';
 const count=s.counts;
 const numeric=count?(' 你提供全體'+count.total+'位、出席'+count.present+'位、贊成'+count.yes+'票。'):'';
 const unregVote='若各項資格、通知和票數依法有效，未辦法院法人登記的一般協會依人民團體法第27條，應超過應出席者半數出席，再由出席者三分之二以上同意。'+(count?(' 依這組數字應至少'+(Math.floor(count.total/2)+1)+'位出席、在'+count.present+'位有效出席時須'+Math.ceil(count.present*2/3)+'票贊成。你提供的數字'+(count.present>count.total/2&&count.yes>=Math.ceil(count.present*2/3)?'達到':'未達')+'這組人數門檻；是否已合法解散仍要另看程序。'):'');
 const regVote='已辦法院法人登記：民法另有全體社員三分之二可決的規定（第57條）。依內政部 Q131 和法院登記指引，先以全體合格社員（會員）三分之二以上同意來準備。'+(count?' 依這組數字要'+Math.ceil(count.total*2/3)+'票；'+count.yes+'票'+(count.yes>=Math.ceil(count.total*2/3)?'已達':'尚未達')+'此門檻。':'')+'法務部曾就個案說明人民團體程序先適用人民團體法第27條，其算法是過半出席、出席者三分之二同意。兩個算法不同，不宜只採較低門檻便認定法院會准；帶章程、有效會員名冊及表決資料向原主管機關和管轄法院核對。';
 const county=['另向原立案主管機關送大會紀錄與財務資料','大會會議紀錄依會務輔導辦法第12條於閉會後30日內報備查。另依主管機關要求備妥解散決議與日期、清算人、資產負債及決算表冊、財產歸屬清冊、立案資料及個案附件。內政部 Q131 是一般程序參考，屏東地方團體請向原立案承辦確認表件及送件方式，不直接套其他機關的清單。'];
 const person=reg?['已登記：先從章程、總會及董事確認清算人','民法第37、38條：除章程另有規定或總會另有決議，以董事為清算人；仍不能確定，才由法院依法選任。民法第42條：依章程或總會決議解散，董事於解散後15日內報告法院。這不同於清算人依非訟事件法第88條申請解散登記，及第91條在清算終結後的登記。請分開備文件向管轄法院確認；不拿其他種類公司的期限代入。']:['未登記：依章程或大會決議辦清算','依會務輔導辦法第27條，先按章程或會員（代表）大會決議。章程未規定或大會無法召開時，由理事長或章程所定代理人擔任；不能產生時由主管機關選任，並準用民法清算規定。這不是社團法人在法院的解散與清算終結登記，不套董事向法院報告的15日。'];
 const order=['先收款、清理各類債務，再談普通賸餘','由有權的清算人收回應收、處理未了契約和應付廠商、員工、租金等，保存帳冊、憑證及債權證明。不要自行約定所有欠款同順位，也不要把尚未核對的應收或求償算成已可贈與的現金。'];
 const balance=['沒有自動移轉給新協會','先按規定處理借用、補助、指定用途及欠款等；只有確定屬於原團體自有、無用途限制且清債後的賸餘才討論歸屬。'+(reg?'依民法第44條，先看特別法，再依法依章程或總會決議；沒有規定時，歸住所所在地地方自治團體。公益法人不得歸自然人或營利團體。':'未登記團體先查章程、大會決議及適用規定，向原主管機關確認接收對象；不直接套用法人歸屬規則。')+' 新團體不會因名稱相近而承接。'];
 const steps=[];
 if(s.votes||!s.realized)steps.push(['先確認解散決議，以及以哪個人數為分母',numeric+(reg?regVote+(s.otherExample?' '+unregVote:''):unregVote)]);
 if(s.written)steps.push(['書面同意不能先當作取代大會','法務部法律字第11003504230號說明，民法第57條是否能僅以書面通訊議決，實務見解並不一致；涉及人民團體程序時，另須確認適用的會員大會規則。不要把修章或選舉的書面作法直接套來解散。']);
 steps.push(person,county);
 if(s.debts||s.assets||s.account){
  steps.push(order);
  if(s.staff)steps.push(['員工債權的法定順位另核','勞基法第28條為特定欠薪、退休金與資遣費規定受償順位；請把薪資期間及有據的款項分列，由有權清算人核對，必要時洽勞工主管機關。不能視成一般租金，也不能說所有欠薪都取得相同優先順位。']);
  if(s.borrowed)steps.push(['公所或其他機關出借的器材不能送人','公所借來的桌椅或電腦不等於團體自有資產。對借用單與財產卡，依約向原出借單位辦歸還，不移交給新協會。']);
  if(s.grant)steps.push(['縣府補助設備、未支用餘額分開列','已用補助買的設備先查核定函、財產清冊、用途或年限及移轉限制，由清算人向原補助機關確認，不一概贈與或一概繳回。未用完的補助經費，若適用屏東通案要點第8點之一，依規定繳回；已支用但未核銷款另外對帳。']);
  if(s.restricted)steps.push(['指定用途的捐款、捐物不能改送給不相關的新團體','對捐贈約定、收據、財產或物資清冊，不能因解散自行改變幫助長者等用途。若屬核准公益勸募或有返還條件，另依適用的法令及捐的條件處理；不將指定款視作一般會費。']);
  if(s.deposit)steps.push(['押金可能是應收，也可能是應付','對契約和金流確認是團體已付、可收回的押金，還是代收須返還的款項；不要和租金、會費或可分的賸餘混列。']);
  steps.push(balance);
  if(s.account)steps.push(['不要先把帳戶、存款或定存轉給新協會','開完大會不代表能立刻結清或銷戶。由有權清算人保留經核對的收付款途徑，待收款、清債、對帳和賸餘處分完成，再按銀行及承辦所需的證明辦理結清；定存另看契約。']);
 }
 return make(reg?'已辦社團法人登記：按法院和主管機關兩條程序':'僅立案、未辦法院登記：按團體章程及主管機關程序',reg?'這是法院已登記的社團法人。解散表決、法院登記、清算和最後資產歸屬是不同步驟；不要先移轉財產。':'你說只有立案，沒有辦法院法人登記。先走適用的會員大會解散及原主管機關程序，不照搬社團法人法院登記；不要先關戶、轉款或分財產。',steps,[people,guide,moi,...(reg?[civil,civilProcedure,court,view]:[]),...(s.written&&!reg?[view]:[]),...(s.grant?[grants]:[]),...(s.staff?[labor]:[])]);
}
if(typeof module==='object'&&module.exports)module.exports={route};
else root.verifiedAssociationLiquidationPath=route;
})(typeof window==='object'?window:globalThis);
