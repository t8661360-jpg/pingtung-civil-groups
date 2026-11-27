(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const p=n=>law('政治獻金法','D0020049',n);
const auditor={title:'監察院政治獻金諮詢窗口',source:'https://sunshine.cy.gov.tw/cp.aspx?n=10&s=14'};
const recipient=['普通協會不是政治獻金的收受對象','政治獻金法第5條把收受政治獻金者限於政黨、政治團體及擬參選人。一般社會團體和法律上的政治團體不同，不得作為政治獻金收受對象。人民團體法第33條列的是團體經費來源，不能拿它當政治獻金或境外資金禁令。'];
const sources=['先辨別資金來源及用途','依政治獻金法第2條，提供金錢、物品或其他利益是否屬政治獻金，要核對是否出於競選或其他政治活動。不能只看捐款人是議員、候選人、政黨，或只看收據寫「公益」。請核對實際出資者、來源、用途及有無要求協會助選或回饋；不明先不要收款或開一般捐款收據，向監察院政治獻金窗口確認。'];
const privateStep=['本人的私人款捐公益，不是看到公職身分就拒收','若確為本人自有款、非競選或其他政治活動、沒有附帶政治用途或助選要求，可能是一般公益捐贈。內政部就已立案社團被動收受非會員普通捐款，列人民團體法第33條其他收入；這不代表所有捐款一律能收。仍查章程、使用限制和財務程序，接受後按真實捐贈人開收據、入帳，公開勸募則另適用勸募規定。'];
const funds=['進行中的競選經費，不能直接當成一般公益捐款','第23條連結第20條，政治獻金有法定支出用途，不得自行把專戶的競選捐款當協會辦活動的經費。未確認用途適用前勿收、勿將專戶款換名列一般捐款。這與已依法成為「賸餘」的處分不同；請候選方先向監察院確認，不要由協會代收代轉。'];
const surplus=['依法形成的賸餘政治獻金，才查第23條公益用途','依法登記候選人於選後，政治獻金確有賸餘，可依第23條第1項第3款捐教育、文化、公益或慈善機構或團體。不能只因對方稱「選後剩下」就收；先查賸餘事實及受贈資格。支出憑證或證明應載明政治獻金專戶名稱，不能以候選人個人名義列舉扣除。'];
const limits=['賸餘用途的期限與金額不是一般捐款規則','捐給同一機構或團體每年合計不得逾新臺幣200萬元；超過10萬元的金錢捐贈，應由原專戶匯款。使用賸餘款須於每年度結束後三個月內申報；自第21條第1項規定申報日起四年內仍未支用完，應繳交監察院辦理繳庫。常規已登記案件與未登記、資格撤銷案件分開辦。'];
const denied=['沒有依法登記或候選資格遭撤銷，不走公益捐贈分支','依政治獻金法第21條第3項，未依法登記為候選人或資格被撤銷，應停止收受政治獻金，三個月內申報，賸餘款於申報時繳庫，不是自行捐給協會。'];
function politicalDonation(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>205||!/協會|社會團體|公益(?:社團|團體)|慈善團體/.test(t)||/合作社|農會|漁會|工會|公司自己|贊助會員|公投|罷免案/.test(t))return null;
 if(/(?:協會|社會團體)(?:能|可|要|該|想|打算).{0,5}(?:捐給|贈予|給候選人|捐政治獻金|捐贈政治獻金)|(?:候選人|擬參選人).{0,6}(?:收受|接受).{0,6}協會/.test(t))return null;
 const campaign=/政治獻金|競選捐款|競選專戶|政治專戶|競選資金|競選經費|選舉經費|選舉結餘/.test(t);
 const candidate=/候選人|參選人|參選者|議員|民代|鎮長|鄉長|里長|村長|立委|政治人物/.test(t);
 const donate=/捐|資助|贊助|開收據|給協會|交給|給社會團體|收受|接受?|收款|收入/.test(t);
 if(!campaign&&!(candidate&&donate))return null;
 if(campaign&&!donate&&!/款項|用途/.test(t))return null;
 const personal=/自己的錢|本人(?:出資|自有|私人|名義)|(?:私款|自掏腰包|個人款|私人款|自有款|個人資金)|個人(?:名義)?(?:捐|出資)|個人帳戶|私人捐款/.test(t);
 const actualPrivate=personal&&!/改開|換名|改名|掩飾|借名|先用個人|改成個人|專戶.{0,8}匯到個人/.test(t)&&!/競選專戶|競選經費|競選捐款|政治獻金專戶/.test(t);
 const balance=campaign&&!actualPrivate&&/賸餘|剩餘|餘款|有餘|剩下|結餘|結存|選後剩|選完剩/.test(t);
 const presentlyBeforeRegistration=/還沒到登記|尚未到登記|登記期間還沒開始|登記還沒開始/.test(t);
 const unregistered=campaign&&!actualPrivate&&!presentlyBeforeRegistration&&/未(?:依法)?登記|沒(?:有)?(?:依法)?登記|未完成登記|資格.{0,8}(?:撤銷|取消)|沒有參選|不參選|退選/.test(t);
 const before=presentlyBeforeRegistration||/還沒投票|選前|投票前|正在競選|還在選|競選期間|未結算/.test(t);
 const use=/交給|轉給|拿去|拿來|捐給|匯給|匯進|轉入|改列|可以收下|當作|辦活動|給協會/.test(t);
 const unknown=!balance&&!unregistered&&!actualPrivate&&!use;
 const ordered=unregistered?[denied,recipient,sources]:before&&campaign?[funds,sources,recipient]:balance?[surplus,limits,denied,recipient]:actualPrivate?[privateStep,sources,recipient]:campaign&&use?[funds,recipient,surplus]:[recipient,sources];
 const title=unregistered?'未依法登記或資格遭撤銷：政治獻金賸餘不能自行轉捐':before&&campaign?'競選中的專戶款，不能當協會的一般捐款':balance?'選後賸餘政治獻金：須確定公益用途及受贈資格':actualPrivate?'私人公益捐款和政治獻金，不能只看捐款人身分':campaign&&use?'競選捐款不能直接交協會當一般經費':'一般協會不能直接收政治獻金，先辨別是哪種款';
 const summary=unregistered?'未依法登記為候選人或候選資格被撤銷時，賸餘款依第21條申報繳庫，不可自行捐給協會。':
 before&&campaign?'競選期間的專戶款受政治獻金法用途限制，不要直接交付協會辦活動或改開個人捐款收據。':
 balance?'依法形成的賸餘政治獻金，可有條件捐作公益；這不等於一般協會可直接收受政治獻金。先確認候選人依法登記、受贈資格及金流。':
 actualPrivate?'不一定。議員或候選人以自己私人款捐公益，不會只因身分就變成政治獻金；仍要核對來源、用途及有無助選要求。':
 campaign&&use?'不能把競選捐款直接交給協會充作一般會務。先辨別這是競選期間款，還是符合第23條的選後賸餘；未確認前先不要收款或開據。':
 '若指法律上的政治獻金，一般協會不能作為直接收受者，依據是政治獻金法第5條。若指私人公益捐款，或依法使用的選後賸餘，規則不同。';
 return {direct:true,category:'業務分流',questionState:{focus:'compound'},title,summary,steps:ordered,
  refs:[p(2),p(5),...(!actualPrivate?[p(20),p(21),p(23)]:[{title:'內政部：已立案社團被動接受一般捐款',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256737'},law('人民團體法','D0050091',33)]),auditor],
  ...(unknown?{choiceHeading:'這筆款從哪裡來？',choices:[
   {label:'競選專戶的款，還在競選',question:'政治獻金的競選專戶還在競選期間，可以交給一般協會辦活動嗎？'},
   {label:'已依法形成的選後賸餘',question:'候選人依法登記、選後賸餘政治獻金捐給公益協會，可以嗎？'},
   {label:'政治人物用自己的私人款',question:'議員用自己的錢捐給協會做公益，算政治獻金嗎？'}
  ]}:{})};
}
function legacyPoliticalDonation(q,answer){
 if(answer?.title!=='協會不得接受政治獻金')return null;
 return politicalDonation(q)||{direct:true,category:'業務分流',questionState:{focus:'compound'},title:'政治獻金的收受對象與一般公益捐款不同',summary:'政治獻金法第5條限政黨、政治團體及擬參選人收受政治獻金。普通協會不是當然收受者。是否屬政治獻金則要核對資金來源及實際用途；有疑問可洽監察院。',refs:[p(2),p(5),auditor]};
}
if(typeof module!=='undefined'&&module.exports){module.exports={politicalDonation,legacyPoliticalDonation};return;}
root.verifiedAssociationPoliticalDonation=politicalDonation;
root.verifiedLegacyPoliticalDonation=legacyPoliticalDonation;
})(typeof window!=='undefined'?window:globalThis);
