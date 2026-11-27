(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const cec={title:'中央選舉委員會：115年地方選舉競選活動規範',source:'https://web.cec.gov.tw/central/article/65794'};
const faq={title:'中央選舉委員會：115年投票日問答',source:'https://info.cec.gov.tw/vote2026/question/'};
const local={title:'屏東縣選舉委員會：08-734-1440',source:'https://web.cec.gov.tw/ptec/article/63546'};
const audit={title:'監察院政治獻金諮詢窗口',source:'https://sunshine.cy.gov.tw/cp.aspx?n=10&s=14'};
const civic=n=>law('公職人員選舉罷免法','D0020010',n);
const internalRef={title:'人民團體選舉罷免辦法：會內選務與會場秩序',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050093'};
const internalStep=['如果是協會內部選理監事','適用人民團體選舉罷免辦法及協會章程，不適用公職投票日禁助選的規定。若問會場能否發言或介紹候選人，先依已公布的選務程序和主席維持秩序的規則，不能妨礙投票或會議，也不能只因「站台」二字就認定當然能做或當然無效。'];
function electionAnswer(q,now=new Date()){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>190||!/協會|社會團體|人民團體/.test(t)||/合作社|社員|農會|漁會|基金會|工會|家長會|公民投票|公投案|罷免案|捐款收據/.test(t))return null;
 if(/與(?:公職)?(?:選舉|助選|拉票|站[台臺])無關|不是在問(?:公職)?(?:選舉|助選|拉票|站[台臺])/.test(t))return null;
 if(!/站[台臺]|助選|拉票|競選辦事處|競選總部|競選活動|候選人.{0,12}(?:場地|轉發|貼文|宣傳)|(?:場地|轉發|貼文|宣傳).{0,14}候選人/.test(t))return null;
 const inside=/會內|內部|會員(?:代表)?大會.{0,8}選(?:舉)?(?:理監事|理事|監事)|理事會.{0,5}(?:互選|選理事長)|協會選(?:理監事|理事|監事)/.test(t);
 const office=/公職|地方選舉|地方.{0,4}候選人|縣長|議員|村里長|村長|里長|鎮長|鄉長|市長|選委會|投票日|公開助選|競選辦事處|競選總部/.test(t);
 const room=/借.{0,7}場地|提供.{0,7}場地|競選辦事處|競選總部/.test(t);
 const funds=/免費|會費|經費|補助|政治獻金|場地|器材|人力/.test(t);
 const siteOnly=/競選辦事處|競選總部/.test(t);
 const ends=t.match(/(20\d\d|1\d\d)年/);
 const currentEdition=ends?['2026','115'].includes(ends[1]):/^2026-11-2[3-8]$/.test(new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(now));
 const date28=/11(?:月|[/.-])28(?:日|號)?|十一月二十八(?:日|號)|(?:明天|今天).{0,8}投票/.test(t);
 const date27=/11(?:月|[/.-])27(?:日|號)?|十一月二十七(?:日|號)/.test(t);
 const night=/(?:晚上|晚間|下午)(?:10|十)(?:[點時](?:半|[0-5]?\d分|後|以後))|晚(?:上|間)?(?:11|十一|12|十二)[點時]|22(?::(?:0[1-9]|[1-5]\d)|:00(?:以?後)|[點時](?:半|[0-5]?\d分|後|以後))|23(?::[0-5]\d|[點時])/.test(t);
 const otherDay=/投票日(?:的|之)?(?:前|後|隔天)|投票(?:前一|前兩|前二|後一|後兩|後二)天/.test(t);
 const electionDay=!otherDay&&(/投票(?:當天|當日|日)|(?:開票|投完票).{0,6}(?:以後|之後|後)|(?:當天|當日).{0,6}(?:投票|開票)/.test(t)||(currentEdition&&date28));
 const late=night&&(!electionDay)&&(date27||/今晚|競選(日|期)|公開助選|投票日(?:的|之)?前一[天日]/.test(t));
 if(inside&&!office)return {direct:true,category:'人民團體選務',questionState:{focus:'compound'},
  title:'協會內部選舉：依會內規則，不套公職投票日',summary:'選理事或監事是協會會內選務。是否安排候選人介紹，先看章程及公告的選務程序；不能妨礙會議秩序或影響會員自由投票。',steps:[internalStep],refs:[internalRef]};
 const clockStep=['助選有時段限制，跟有沒有用會費是兩件事','《公職人員選舉罷免法》第56條：競選期間每日07:00前、22:00後，原則上不得公開競選或助選；只對不妨礙居民生活或社會安寧的活動有但書，不要自行把公開站台當例外。投票日從凌晨00:00起整天不得競選或助選，包括在社群、LINE或簡訊轉發助選訊息。即使沒用會費、以個人名義，也不能在投票日助選。'];
 const edition=['115年地方公職人員選舉已公告的日期','依中選會公告，各類選舉的競選期間依職別不同，均至2026年11月27日止；投票日為2026年11月28日。以上是這一屆的日期，不是每次都在11月28日。'];
 const charter=['用協會名義，先查團體授權','在允許的時段，不代表理事長可以自行用協會名義為候選人站台；先釐清是個人參加還是代表協會，核對章程宗旨、理事長權限、團體決議及可能的身分限制。協會名義或補助經費能否使用有疑義，洽原立案／補助主管機關確認。'];
 const finance=['協會提供經費、場地或其他資源','免費借場地、低於合理對價提供服務或其他可估價利益，可能涉及政治獻金，不是沒收錢就一定無事；是否屬政治獻金及捐贈人資格、申報等由監察院政治獻金窗口確認。活動時段、行為或競選辦事處問題，問屏東縣選舉委員會（08-734-1440）；另查場地使用限制。'];
 const roomStep=['設競選辦事處和單次借場地不同','公職人員選舉罷免法第44條限制候選人競選辦事處不得設在依法設立的人民團體等處所；條文有政黨各級黨部辦公處的例外。單次活動借場地不是一概等同設競選辦事處，但仍另查場地規定、團體授權及政治獻金認定。'];
 const summary=inside?'公職選舉和會內選理事是兩套規則。':siteOnly?'候選人競選辦事處不能設在依法設立的協會等人民團體，不等於每一次借場地都是設辦事處。':electionDay?'不可以在公職投票日助選。即使理事長不用協會會費、以個人名義或只是轉發，也受投票日禁止助選的規定。':late?'晚上22:00後原則上不要公開競選或助選，包括公開站台；與投票日全天禁助選是不同規則。':room?'借場地是否涉及政治獻金，問監察院；競選方式、時段或候選人競選辦事處，問選委會。':'要先分是為公職候選人助選，還是協會內部選舉。如果是公職選舉，投票日不能助選；允許競選的時段也不等於理事長可自行用協會名義。';
 const choices=!office&&!inside&&!room&&!electionDay?[
  {label:'地方公職選舉／替候選人助選',question:'協會理事長能用協會名義替地方公職選舉候選人站台嗎？'},
  {label:'協會內部選理事或監事',question:'協會內部會員大會選理事或監事，候選人可以站台發言嗎？'}
 ]:[];
 return {direct:true,category:'業務分流',questionState:{focus:'compound'},
  title:'協會名義站台：公職助選、會內選務和資源分開確認',
  summary,steps:[...(inside?[internalStep]:[]),clockStep,...(currentEdition?[edition]:[]),...(room?[roomStep,finance,charter]:[charter,...(funds?[finance]:[])]),['選務時間或活動疑義','可向屏東縣選舉委員會（08-734-1440）查核適用的選舉、日期及行為。小屏不判定特定案例是否違法。']],
  refs:[civic(56),...(currentEdition?[cec,faq]:[]),local,...(room?[civic(44)]:[]),...(funds?[law('政治獻金法','D0020049',2),audit]:[]),...(inside?[internalRef]:[])],
  ...(choices.length?{choiceHeading:'您問的是哪一種選舉？',choices}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={electionAnswer};return;}
root.verifiedAssociationPublicElection=electionAnswer;
})(typeof window!=='undefined'?window:globalThis);
