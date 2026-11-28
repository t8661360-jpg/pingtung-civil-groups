(function(root){
'use strict';
const cite=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const e=n=>cite('人民團體選舉罷免辦法','D0050093',n),c=n=>cite('合作社選舉罷免辦法','D0050022',n);
const court={title:'最高行政法院：人民團體內部選舉與主管機關核備的區別',source:'https://www.judicial.gov.tw/tw/communique/dl-1016-4178862d025349198c6eeced26823c14.html'};
const association=/(?:一般|屏東|立案)?協會|社會團體|社團法人/;
const coops=/合作社/;
const election=/選舉|改選|開票|點票|投票|選票|選理|選社員代表|當選|算錯票|選務/;
const problem=/異議|干擾.{0,8}圈寫|妨礙.{0,8}投票|無效|保全|銷毀|沒當場提|不能當場提|原始檔|證據|賄選|買票|換選票|換投|餽贈|饋贈|請客|請.{0,6}吃飯|公告.{0,12}(?:算錯|漏)|重算|監票.{0,8}(?:反映|說)|向主席.{0,9}(?:提|反映|說)|有疑義/;
function route(q){
 const raw=String(q??'').trim(), t=raw.normalize('NFKC').replace(/\s+/g,'');
 if(!t||t.length>445||!election.test(t)||!problem.test(t)||/信用合作社|信合社|保險合作社|商業同業公會|職業公會|工會|農會|漁會|政黨黨內/.test(t))return null;
 const nonPublic=/不是公職|非公職|不是(?:議員|村里長|里長|村長)(?:選舉)?/.test(t);
 if(!nonPublic&&/公職選舉|里長選舉|村長選舉|立委選舉|鄉長選舉|議員選舉|選舉委員會/.test(t))return null;
 const declared=/；團體確認：/.test(raw);
 const assoc=declared?/團體確認:一般協會/.test(t):association.test(t)&&!/不是(?:一般)?協會/.test(t);
 const coop=declared?/團體確認:一般合作社/.test(t):coops.test(t)&&!/不是(?:一般)?合作社|非合作社/.test(t)&&!assoc;
 const contrast=coop&&/人民團體的|協會的|直接套用/.test(t);
 const marked=/；出席確認：/.test(raw);
 const notHere=marked?/出席確認:我沒出席/.test(t):/沒(?:有)?去|沒有到場|未出席|不在場|沒出席|未到場/.test(t)&&!/比照沒|比照未|不是沒|不是未/.test(t);
 const here=marked?/出席確認:我有出席/.test(t):!notHere&&/我有到|當時我.{0,6}說|我去(?:了)?|我有出席|我在現場|我當時.{0,8}(?:監票|反映|主席)|當天我.{0,8}反映|我.{0,8}當場提/.test(t);
 const announced=/結果.{0,10}(?:宣布|公布|公告)|(?:宣布|公布|公告).{0,5}結果|開票後|點完票|開票完|已經開票|已開票|開票那天|出席確認/.test(t);
 const past=/十[六七八九](?:天|日)|二十(?:天|日)|[2-9]\d(?:天|日)|1[6-9](?:天|日)|超過(?:十五|15)(?:天|日)|逾(?:十五|15)(?:天|日)/.test(t)&&(announced||/已經第|第十[六七八九]/.test(t));
 const inProgress=!announced&&/現在正在|正在投票|還在投票|還沒開票|投票進行中|現場有人正在/.test(t);
 const paper=/紙票|紙本|拆封|封存/.test(t), electronic=/電子投票|電子選票|原始檔|電子紀錄/.test(t);
 const doubleRounds=/兩輪|兩場|兩個會|分兩次|理事又互選/.test(t);
 const askedEvidence=/保全|銷毀|拆封|保存|保留|法院|證據|名單公開|姓名|私訊/.test(t);
 const considerVoting=/賄選|買票|轉.{0,8}換投|拿錢|換選票|餽贈|饋贈|請客|請.{0,8}吃飯|送錢|送禮|耳語/.test(t);
 const common={direct:true,questionState:{focus:'compound',domain:'election-objection'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 if(!assoc&&!coop){
  return {...common,category:'選舉｜先確認團體和進度',title:'先保留選舉資料，再確認是協會還是合作社',summary:'僅憑傳聞不能判定選舉無效；先保存原有通知、紀錄及合法取得的證據，不要翻拍選票或公開私訊。協會和合作社的異議對象及時間不同。',steps:[['已開票的話','先記下選舉何時宣布結果、你有沒有出席、是否已向會議主席或主持人反映。確認團體後，可再比對書面期限。']],needsElectionFacts:true,choiceHeading:'這是哪一種團體的選舉？',choices:[
   {label:'一般協會選舉',question:raw+'；團體確認：一般協會。'},
   {label:'一般合作社選舉',question:raw+'；團體確認：一般合作社。'}
  ]};
 }
 if(coop){
  const nonmeeting=/通訊投票|通訊選舉|非會議方式|網路投票|線上投票/.test(t)&&!/不是通訊|沒有通訊/.test(t);
  const deadlines=here?'你有出席，依第37條應在主席宣布時當場向主席提出；不能改用未出席人員的會後三日書面程序。':notHere?'你沒出席，依第37條應於會議後三日內，以書面直接向主管機關提出，不是只寄合作社；以郵寄方式提出者，以郵戳為準。':'出席的選舉人或被選舉人，須在主席宣布結果時當場向主席提出；未出席者於會議後三日內書面向主管機關提出，寄送以郵戳為準。';
  const options=!here&&!notHere&&!nonmeeting&&!marked?[
    {label:'我有出席選舉會議',question:raw+'；出席確認：我有出席。'},
    {label:'我沒有出席選舉會議',question:raw+'；出席確認：我沒出席。'}
  ]:null;
  return {...common,category:'一般合作社｜選舉結果與異議',title:'合作社選舉異議：出席當場提，未出席三日內向主管機關',summary:nonmeeting?'如果確實是非會議方式辦理，先查經備查的合作社選舉辦法及異議程序，不可直接套用一般現場選舉的時點。':(contrast?'人民團體的十五日不直接套用。':'')+deadlines,steps:[
    ['一般集會選舉與非會議方式分開',nonmeeting?'確認合作社是否就社員代表選舉依第3條合法採非會議方式，取得自己的選務規則；其法定可選範圍不等於所有職位都能通訊。':deadlines+' 現場選舉第37條的事後或逾期異議不予受理；章程與實際方式另需確認。'],
    ['保護證據，不等同宣布重選','把職別、開票及宣布時間、出席與否、原始通知或紀錄、具體爭議及請求分開寫。不要擅取票或公布私訊與姓名。若另爭議社員大會召集程序或決議方法，合作社法第49條之一是不同程序，並非拿來自動補救選舉異議逾期；若仍有私權爭議，帶資料諮詢法律專業。']
   ],refs:[c(3),c(37),cite('合作社法','D0050112','49-1')],needsElectionFacts:!!options,...(options?{choiceHeading:'你有沒有出席這場選舉會議？',choices:options}:{})};
 }
 const report=/監票(?:員)?(?:.{0,8})(?:反映|提過)|向監票/.test(t);
 const toChair=/向主席|跟主席|向主持人|向會議主席/.test(t);
 const pastText=past?'你說結果已宣布超過十五天，通常的十五日書面異議期間可能已過。'+(report&&!toChair?'只向監票員反映不當然等於當場向主席或主持人異議，先查是否轉告主席並找見證。':'先核對有無依法當場向會議主席或主持人異議及可證明的時間。')+' 不能認定所有救濟都已失效，儘快請法律專業依實際日期確認。':announced?'若你是出席選舉的會員或代表，仍在宣布日起十五日內就直接書面向該協會提出並保留收件，不要只送縣府。':'先確認是否已宣布結果、哪一天宣布，以及你有沒有出席。出席的會員或代表可當場向會議主席或主持人提出，或於宣布日起十五日內以書面向協會提出。';
 const steps=[];
 if(considerVoting||inProgress)steps.push(['指控、票的效力與結果是否重辦，不能混在一起','請客或轉傳訊息不當然等於有利益交換，也不能只憑這件事決定選舉自動無效、由理事長單方宣布重選。看實際行為、證據、章程和選舉規定，不套公職選舉法；第10條主要是個別票的效力。'+(inProgress||/干擾|妨礙|探看|圈寫/.test(t)?' 如果正在現場干擾圈寫或投票，依第9條可先請監票員警告；不聽時報主席，由主席按規定提經出席者三分之二以上同意後處理，並記載會議紀錄。':'' )]);
 steps.push(['理監事或理事長改選：何時向哪裡提出異議',pastText+' 依人民團體選舉罷免辦法第25條，協會收到異議書後十五日內查明並書面回覆；有爭議可向法院起訴。'+(doubleRounds?' 選理事與選理事長是兩場選舉，分列每場的角色、各自宣布日、主席、事實與請求，留各場的收件證明；不能用同一個日期算兩場，也不能預設兩場都重選。兩件可分項列清，但別把一場的異議當成另一場已受理。':'' )]);
 steps.push(['選票及原始紀錄：先由協會保存，不把證據拿走','依第26條，紙本選票由主席與監票員驗簽包封，交協會保管；電子投票保留原始流程及結果的電磁紀錄，並異地備份。即使沒有爭訟，也到任期屆滿且下次改選完成後才銷毀，不是滿十五天就可以拆封銷毀。可以書面請協會保存，不代表承認結果或保證會重新驗票。'+(askedEvidence||paper||electronic?' 如證據有滅失或日後難以使用之虞，可詢問依民事訴訟法第368條聲請保全，由法院判斷；不是任何異議都必須先提告。':'')]);
 steps.push(['書面資料先留原件，不公開個人資訊','列出團體、選舉職位、宣布日時、在場情況、當場向誰反映、存在哪些選票或紀錄、具體違反事項及訴求。保留合法取得的原始訊息、時間和來源，不自行公開姓名、私訊或完整選票。可以向原主管機關諮詢一般監督，不能取代向協會的法定書面異議；主管機關備查不等於決定選舉私權效力。'+(past?' 屬總會召集或決議方法的民事爭議會涉及民法第56條及其要件，不自行認定所有選舉適用同一期限。':'')]);
 return {...common,category:'協會｜選舉異議、結果與證據保全',title:'協會選舉爭議：分開處理書面異議、選票保全和選舉效力',summary:past?'先請協會留存選票及相關紀錄。十五日是書面異議期間，不是選票保管期限，不要因為第十六天就自行拆封。':inProgress?'現場先向主席或主持人提出；如果涉及有人干擾投票，可請監票員依規定處理。':'不能只憑傳聞宣布選舉無效。先記清結果宣布時間；已參加選舉的會員或代表，按規定向協會提出異議。',steps,refs:[e(25),e(26),...(inProgress||considerVoting?[e(9),e(10)]:[]),cite('民事訴訟法','B0010001',368),...(past?[cite('民法','B0000001',56)]:[]),court],needsElectionFacts:!announced};
}
function follow(q){
 return /^\s*(?:補充[：:]|是(?:一般)?(?:協會|合作社)(?:[，,。\s]|$)|我(?:有|沒(?:有)?)出席(?:[，,。\s]|$))/.test(String(q??''))&&!/(?:另問|換[一個]?題|新的問題)/.test(String(q??''))&&String(q??'').length<=135;
}
if(typeof module!=='undefined'&&module.exports){module.exports={route,follow};return;}
root.verifiedElectionObjectionPreservation=route;
root.isElectionObjectionFactReply=follow;
})(typeof window!=='undefined'?window:globalThis);
