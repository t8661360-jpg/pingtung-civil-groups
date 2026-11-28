(function (root) {
'use strict';
const law = (title, code) => ({title, source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+code});
const assocOffice = law('人民團體會務輔導辦法第3、8條','D0020094');
const assocCharter = law('人民團體法第12、27、54條','D0050091');
const coopOffice = law('合作社法第9、9-1條','D0050112');
const tenancy = law('民法第443條','B0000001');
const rentalHousing = law('租賃住宅市場發展及管理條例第9條','D0060125');
const building = law('建築法第73條','D0070109');
const court = law('法人及夫妻財產制契約登記規則第22、30條','B0010017');
const nonContentious = law('非訟事件法第82、85條','B0010008');
const finance = law('社會團體財務處理辦法第5條','D0050097');
const assocRe = /協會|人民團體|社會團體|社團法人/;
const coopRe = /合作社|社員大會/;
const officeRe = /會址|社址|正式地址|登記地址|主事務所|同址|同一(?:個)?(?:門牌|地址)|同[一個]*地點|地址|遷址/;
const contact = /通訊地址|聯絡地址|聯繫地址|收信地址|郵寄地址|收件地址|地址只.{0,5}(?:收信|收件)|只.{0,5}(?:改|換).{0,6}(?:收信|收件)/;
const shared = /同址|同一(?:個)?(?:門牌|地址)|同[一個]*層|同[一個]*棟|共用.{0,6}(?:地址|會址|社址|場地|電錶|電表|辦公室|會議室)|地址.{0,7}(?:共用|一起|分開)|使用同.{0,3}(?:地址|會址|社址)|一起.{0,5}登記/;
const crossRe = /跨縣市|換縣市|外縣市|遷(?:到|去)?(?:高雄|臺南|台南|臺東|台東)|搬(?:到|去)?(?:高雄|臺南|台南|臺東|台東)|跨(?:法院)?轄區|不同法院|舊法院.{0,12}(?:移|轉)/;
const narrowStop = /信用合作社|信合社|農會|漁會|工會|公會|財團法人|商業登記|戶籍|身分證|駕照|車籍|移民|選舉投票|開什麼會員大會的日期|過世|稅務申報/;
const options = {
  contact:['只改收信／聯絡地址','確認只改聯絡地址'],
  assoc:['協會正式會址變更','確認協會正式會址變更'],
  coop:['一般合作社社址變更','確認一般合作社正式社址變更'],
  shared:['協會和合作社共用地址','確認協會和合作社共用地址'],
  venue:['只是借場地，不登記地址','確認只借場地不登記地址'],
  registered:['有法院法人登記','確認協會已辦法院法人登記'],
  nonregistered:['沒有法院法人登記','確認協會未辦法院法人登記'],
};
const norm = q => String(q || '').normalize('NFKC').replace(/\s/g,'');
function parse(q, prior) {
  const t = norm(q);
  if (!t || t.length>520 || /^新題/.test(t) || narrowStop.test(t)) return null;
  const picked = Object.entries(options).find(([,p])=>p[1]===t)?.[0];
  const correction = !!prior && /^(更正(?:一下)?|補充(?:一下)?|其實|不是|我剛才說錯)/.test(t);
  const localMove = /搬(?:到|去)?隔壁|搬遷.{0,8}同(?:一)?鄉|搬.{0,13}還在原鄉/.test(t);
  if (!officeRe.test(t) && !localMove && !picked && !correction) return null;
  const reduced = t.replace(/(?:不是|並非|而非)(?:一般)?(?:勞動|社區)?(?:合作社|協會)/g,'');
  let a = assocRe.test(reduced), c = coopRe.test(reduced);
  /* 第259輪：「會址／會所」是人民團體（協會）的用語，合作社叫社址；沒提合作社也沒提社址，就當協會，不再反問 */
  if (!a && !c && /會址|會所/.test(t) && !/社址|合作社|社員|聯絡地址|通訊地址|收信|收件|登記地址|共用|同址|同一(?:個)?(?:門牌|地址)/.test(t)) a = true;
  const stationary = /合作社.{0,5}(?:不跟著搬|不一起搬|不搬|沒搬|不變|不動)|只有協會.{0,5}(?:搬|遷)|不是合作社.{0,3}(?:要|在)?(?:搬|遷)/.test(t);
  let cross = !/(?:沒有|不會?|沒|未)(?:跨縣市|跨轄區|跨法院)|還在同一(?:鄉|縣)|同一鄉地址/.test(t) && crossRe.test(t);
  let noncorp = /(?:沒有|沒|未曾?|尚未|並未)(?:辦過?|做過?|向)?(?:法院)?(?:辦理)?(?:法人)?登記|不是社團法人/.test(t);
  let corp = !noncorp && /(?:已(?:經)?|有)(?:向|辦過?|辦理|辦了)?(?:法院)?(?:辦理)?(?:法人)?登記|社團法人|法院登記(?:過|的)/.test(t);
  const local = /同一(?:鄉|縣|市)|隔壁|同一村|還在原鄉|留在原鄉/.test(t);
  const contactOnly = contact.test(t) && !/(?:不是|不只)(?:改|換)?(?:通訊|收信|聯絡)地址/.test(t) && (!/正式會址|登記地址|主事務所|登記會址|正式社址/.test(t) || /(?:正式會址|登記地址|主事務所|登記會址|正式社址).{0,4}(?:不變|沒變|不動|不改|不搬)/.test(t));
  const venueOnly = /只是借(?:場地|會議室)|只借場地/.test(t) && /不(?:做|辦)?登記(?:地址|會址|社址)|不(?:設|改)會址/.test(t);
  let sharing = !stationary && shared.test(t) && a && c;
  if (stationary) {a = a || correction && !!prior.a; c = false;}
  if (correction && !a && !c) {a=prior.a; c=prior.c;}
  if (correction && !cross && !local && !/沒有跨|不跨|沒跨/.test(t)) cross = prior.cross;
  if (correction && !noncorp && !corp) {noncorp=prior.noncorp; corp=prior.corp;}
  const grant= /補助|核銷|補助款|核定函/.test(t);
  const lease= /租約|房屋|屋主|房東|所有權人|所有人|借用|轉租|租客|承租|契約/.test(t);
  const act= /搬|改|遷|換|變更|異動|登記|設址|聯絡地址/.test(t);
  const mail= /公文|掛號|寄信|郵件|送達|收文/.test(t);
  const charter= !/不改(?:章程|組織區域)|沒有改(?:章程|組織區域)|章程.{0,5}(?:未|沒)(?:有)?(?:寫|載).{0,5}(?:門牌|地址)/.test(t) && /章程.{0,14}(?:改|寫|載|換|決議)|修章|組織區域.{0,5}(?:改|換)|完整門牌/.test(t);
  const directory = /有哪些|有幾個|名冊清單|查詢團體|清單|列出|地址在哪/.test(t) && !/要不要調|要改|異動|變更/.test(t);
  if(directory || /理事長住址|會員(?:聯絡|通訊)?地址|社員(?:聯絡|通訊)?地址|社員資料|開會地點|活動地點/.test(t) && !shared.test(t) && !/正式會址|社址|登記地址/.test(t)) return null;
  const x={a,c,stationary,sharing,cross,local,noncorp,corp,grant,lease,mail,charter,contactOnly,venueOnly};
  if(picked) {
    const maybe=prior||{};
    if(picked==='registered'||picked==='nonregistered') return {...maybe,a:true,c:false,question:false,corp:picked==='registered',noncorp:picked==='nonregistered'};
    if(picked==='contact') return {...maybe,a:maybe.a,c:maybe.c,question:false,contactOnly:true};
    if(picked==='assoc') return {...maybe,a:true,c:false,sharing:false,question:false,contactOnly:false,venueOnly:false};
    if(picked==='coop') return {...maybe,a:false,c:true,sharing:false,question:false,contactOnly:false,venueOnly:false};
    if(picked==='shared') return {...maybe,a:true,c:true,question:false,sharing:true,contactOnly:false,venueOnly:false};
    return {...maybe,question:false,venueOnly:true,contactOnly:false,sharing:false};
  }
  if(cross&&a&&!c&&/(?:可以|可不可以|行不行|能不能|可否|嗎)/.test(t)&&!/(?:已經|已|搬了|搬完|搬走|搬過去|遷了|遷完|之後|以後|後|法院|國稅|稅籍|銀行|登記)/.test(t)&&!sharing&&!contactOnly&&!venueOnly) return null;
  if(contactOnly||venueOnly||sharing||cross&&a&&act||a&&!c&&local&&act&&(localMove||lease||charter||correction)||correction&&a&&act&&stationary) return x;
  if(!a&&!c&&act&&t.length<55&&/搬家|地址|遷址|會址|社址/.test(t)&&!/開戶|稅籍|銀行|開課|工作場地/.test(t)) return {...x,question:true};
  return null;
}
const choice = keys => keys.map(k=>({label:options[k][0],question:options[k][1]}));
function route(q,prior) {
  const x=parse(q,prior);
  if (!x) return null;
  const result = (title,summary,steps,refs,extra) => ({direct:true,category:'會址與聯絡資料',title,summary,steps,refs,questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}],officeAddressContext:x,...extra});
  if (x.question) return result('先確認要改哪一種地址','只改收信地址、正式遷會址／社址，或兩個團體共用場地，辦法不一樣。先選一項，不用在這裡輸入完整地址或貼公文。',[],[assocOffice,coopOffice],{choiceHeading:'請選最符合的情況',choices:choice(['contact','assoc','coop','shared'])});
  const mail = ['舊公文與在途掛號不要當作失效','保留信封、收件日期及原文；通知發文機關更新聯絡資訊並核對現有期限。搬家、轉寄或換地址不會自動讓已收到的公文重起算；如有疑問持原件向發文機關確認，勿先假設可延後。'];
  if (x.contactOnly) return result('只改聯絡地址，不等於遷會址或社址','正式地址不變，就不要申報成正式遷址；但只通知會員可能不夠，仍應更新實際收信的管道。',[
   ['對外更新聯絡和收信資料','先確認主管機關名冊上是分開的通訊欄位，還是正式會址／社址欄。請原承辦確認通訊欄位如何更新，也通知會員或社員和仍寄件的機關；不要因此改動立案證書、合作社登記或法院所載主事務所。'],
   ...(x.mail?[mail]:[])
  ],x.c?[coopOffice]:x.a?[assocOffice]:[assocOffice,coopOffice]);
  if (x.venueOnly) return result('只借場地，不等於可以登記地址','先問場地管理人允許的使用日期、用途與簽約名義。借一次開會或拿到鑰匙，不等於可以長期辦公、收件或設址。',[
   ['租借證明不要當成正式設址文件','若之後還要設址，再取得有權人明確允許，核對契約、建物用途及主管機關需要的文件。']
  ],[tenancy,building]);
  const steps=[], refs = [];
  if (x.c && !x.a || x.sharing) {
   steps.push(['合作社只辦自己的社址','社址是合作社登記及章程事項；依合作社法第9、9-1條，若社址登記事項異動，依規定於一個月內辦變更。若章程也必須更改，由社員大會決議後於一個月內報主管機關辦理變更。不要因另一團體同址就代辦或沿用它的文件。']);
   refs.push(coopOffice);
  }
  if (x.a) {
   steps.push(['協會正式會址由理事會決議、向主管機關備查','先確認新址可使用，再把新址及決議寫入理事會紀錄，向立案主管機關備查；準備場地使用證明，書表及附件問承辦。若只換門牌而不必改章程，不因搬家就必須開會員大會。']);
   refs.push(assocOffice,assocCharter);
  }
  if(x.sharing || x.lease) {
   steps.unshift(['租約、所有人同意與實際用途要分別核對','同一門牌不代表必然可以或必然不能各自設址。明定禁止轉租，不能靠民法第443條房屋一部分轉租例外逕行轉租。由有權人與各方確認獨立租約、共同使用或明確書面變更；須釐清空間、用途、期限及可否登記，先不要認定一張同意書能替兩個團體辦。屬租賃住宅者，如適用租賃住宅市場發展及管理條例第9條，轉租住宅全部或一部分，都要先有出租人書面同意。']);
   steps.push(['先核對建物用途與各團體的資格','使用權與建物可否作辦公／辦活動是兩件事。把樓層或實際使用範圍、原核定用途交由地址所在地建管窗口核對；社區發展協會也要確認組織區域及在地主管機關口徑。不用先猜全國一律要幾張書件。']);
   refs.push(tenancy,rentalHousing,building);
  }
  if (x.cross || (x.a && x.charter)) {
   steps.push(['若改組織區域或章程所載地址，另辦修章','先拿現行章程及擬遷地址問原立案主管機關與新址可能管轄機關，確認跨區資格、可否遷移及受理順序。一般協會修章須會員（代表）過半出席、出席三分之二以上同意，按人民團體法第54條於異動後三十日內報核備；不要用理事會的會址決議取代，也不要自行把兩地縣市程序視為固定。']);
  }
  if (x.a && x.corp) {
   steps.push(['已做法人登記，要另辦法院主事務所變更','向法院法人登記處確認收件法院、書件、用印與主管機關文件；非訟事件法第85條由董事聲請並附變更證明，應經主管機關核准的事項另附核准文件。跨出原法院管轄而辦變更登記時，依登記規則第30條，原法院記明原因，將原登記簿謄本或影本移送管轄法院。不是自己搬登記簿，也不是重新成立法人。']);
   refs.push(court,nonContentious);
  } else if (x.a && x.noncorp) {
   steps.push(['沒有法院法人登記，本次不辦法院主事務所變更','依團體原立案主管機關的會址備查程序處理；不要把這次搬址當作法院設立。']);
  }
  if (x.sharing) steps.push(['租金、水電由實際負擔的一方列帳','共用電錶可先約定合理可查的分攤方式，保留契約、原帳單、分攤明細和各自付款證明。不是兩邊都把同一張帳單全額入帳或核銷；是否接受相關佐證仍問核定機關。']);
  if (x.grant) {
   steps.push(['補助與借用設備先找原機關，不要先自行改用','原核定只給協會，合作社不能拿同一費用列自己的補助，借設備也不能當成資產移轉。先看核定函、場地契約、借用清冊及實際付款；有變場地、用途、保管地址或餘款，問原機關是否須事先同意、歸還或繳回，不能假設一律能轉用或一律立即繳回。']);
   refs.push(finance);
  }
  if (x.mail) steps.push(mail);
  if (x.stationary) steps.push(['合作社沒搬，不跟著協會改社址','兩個團體的登記、租約與公文各自處理。']);
  const extra = x.cross && !x.corp && !x.noncorp ? {choiceHeading:'協會是否已做法院法人登記？',choices:choice(['registered','nonregistered'])} : undefined;
  return result(x.sharing?'同一門牌，兩個團體分開確認':x.cross?'跨區遷會址：主管機關與法院分開':x.a?'協會換正式會址':'一般合作社換正式社址',
    x.sharing?'先看場地使用權、租約和核定用途，再分開決議、登記與列帳。只有收信、借場地或共用電錶，不能當作兩個團體都有正式設址資格。':
    x.cross?'先核對章程的組織區域、新址使用權及新舊主管機關。已登記為社團法人者，另確認法院主事務所的變更。':
    '確認正式地址才走遷址程序；聯絡資料、章程與法院登記是否要跟著改，分開核對。',steps,refs,extra);
}
if (typeof module === 'object' && module.exports) module.exports = {route};
else root.verifiedAssociationSharedOffice = route;
})(typeof window === 'object' ? window : globalThis);
