(function(root){
'use strict';
const law=(title,p)=>({title,source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+p});
const social=law('社會團體工作人員管理辦法第2–5、7、8條','D0050096');
const socialMemo={title:'內政部110年修正說明：親屬限制適用專任及兼任',source:'https://www.moi.gov.tw/News_Content.aspx?n=145&s=235687'};
const sf=law('社會團體財務處理辦法第17、22條','D0050097');
const corp=law('工商團體會務工作人員管理辦法第7條第6款','D0050107');
const coop=law('合作社法第34、39、40條','D0050112');
const coopHr=law('合作社組織編制及人事管理準則第4–7條','D0050198');
const coopMoney=law('合作社財務報表及經費處理準則','D0050114');
const credit=law('信用合作社社員代表理事監事經理人應具備資格條件及選聘辦法第12–14、14之一條','G0380069');
const county={title:'屏東縣政府對民間團體補助經費作業要點第8、10點',source:'https://portal.ptc.edu.tw/bulletin/view.php?sn=B114003910'};
const norm=s=>String(s??'').normalize('NFKC').replace(/\s/g,'');
const family=/夫妻|配偶|親屬|親等|爸(?:爸)?|父親|母親|女兒|兒子|媽媽|太太|先生|老婆|老公|兄弟|姊妹|妹妹|哥哥|家人|另一半|血親|姻親/;
const positions=/經理|出納|會計|總幹事|秘書長|幹事|職員|事務員|技術員|員工|工作人員|會務/;
const hire=/兼任|兼著|兼職|任職|應聘|續聘|在職|續留|聘|任用|考選|面試|錄取|請當|準備用|津貼|薪水|薪資|薪給|領薪|蓋章|迴避|當選/;
const orgs={s:'一般協會／社區發展協會',c:'一般合作社',f:'信用合作社',g:'工商同業公會'};
const clean=(s)=>s.replace(/(?:不是|並非|不問|不談|不要答)(?:一般|社區發展)?(?:信用合作社|信合社|合作社|社區協會|協會|工商同業公會|商業同業公會|工業同業公會)/g,'');
function parse(q,prior){
 const full=norm(q);if(!full||full.length>600)return null;
 const fresh=/^新題[:：]?/.test(full),raw=full.replace(/^新題[:：]?/,'');
 const t=clean(raw);
 if(/職業工會|勞工工會|工會|管委會|家長會|農會|漁會|公司董事|外籍配偶|委託.{0,14}出席|照服員|公務員兼職/.test(t))return null;
 const creditOnly=/信用合作社|信合社/.test(t);
 const ordinary=/合作社/.test(t.replace(/信用合作社|信合社/g,''));
 const socialOrg=/協會|社會團體|社團法人|社區發展/.test(t);
 const guild=/工商(?:同業)?公會|商業(?:同業)?公會|工業(?:同業)?公會|工商團體/.test(t);
 const pick=Object.keys(orgs).find(k=>raw==='確認親屬任職團體:'+orgs[k]);
 const rolePick=raw.match(/^確認信用合作社職務:(總經理或代理總經理|僅分社經理|還不清楚職務)$/);
 const follow=!!prior&&!fresh&&(pick||rolePick||/^(?:更正|補充|確認|其實|不是|剛才|剛剛|那|只有)/.test(raw)&&(creditOnly||ordinary||socialOrg||guild||positions.test(t)||family.test(t))||creditOnly&&positions.test(t)&&/(?:也同樣|也是嗎|也可以嗎|也是一樣嗎)/.test(t));
 const p=follow?prior:{};
 const samePerson=/監事.{0,14}(?:兼|做事務員|做技術員)|(?:經理|會計|出納|聘任職員).{0,16}(?:當選|被選成|選上|同時當|兼(?:任|著)?)(?:了)?理事|理事.{0,12}(?:兼任|兼著|兼職).{0,8}(?:經理|會計|出納|聘任職員)|兼原職/.test(t);
 if(!follow&&ordinary&&/監事.{0,14}(?:兼|當|做)/.test(t)&&/會計|出納/.test(t)&&!family.test(t)&&!/理事主席|經理|薪/.test(t))return null;
 if(!follow&&!(family.test(t)&&((positions.test(t)&&hire.test(t))||/親屬關係.{0,10}(?:同時任職|可不可以)|爸爸和女兒.{0,10}做事|家人.{0,10}(?:錄取|聘|迴避)/.test(t))||samePerson&&ordinary))return null;
 const explicit=pick?[pick]:[...(socialOrg?['s']:[]),...(ordinary?['c']:[]),...(creditOnly?['f']:[]),...(guild?['g']:[])];
 const list=explicit.length?explicit:p.list||[];
 const changed=!pick&&!!p.list?.length&&explicit.length>0&&explicit.join('')!==p.list.join('');
 const has=(r,k)=>!!(r.test(t)||!changed&&p[k]);
 const blockGm=/(?:沒(?:有)?|並未|不|未曾)(?:兼任|擔任|代理|兼任或代理|代理或兼任){0,3}總經理/.test(t);
 const branch=rolePick?.[1]==='僅分社經理'||/分社經理|分行經理/.test(t)&&!/(?:兼任|也任|同時代理)總經理/.test(t)||blockGm&&/分社/.test(t);
 const gm=rolePick?.[1]==='總經理或代理總經理'||!blockGm&&/總經理/.test(t)&&!/副總經理/.test(t)&&!branch;
 const fRole=gm?'gm':branch?'branch':rolePick?'unknown':!changed?p.fRole:null;
 const old=/上任前|接任前|就任前|本來(?:就|已|聘)|原本.{0,7}(?:在職|已(?:經)?是|在做)|原聘|原本就在職/.test(t);
 const newHire=/新聘|上任後.{0,7}(?:聘|任用)|接任後.{0,7}(?:聘|任用)|要聘|想聘|應聘|應徵|剛錄取/.test(t);
 const knownEx=/^(?:補充|更正|只有|這次).{0,16}(?:沒有|無|不問)(?:另外|新的|政府|縣府)?補助/.test(t);
 return {list,fRole,old:old||!newHire&&!changed&&p.old,newHire:newHire||!old&&!changed&&p.newHire,
   chair:has(/理事(?:會)?主席|理事長|監事(?:會)?主席|首長|主席/,'chair'),family:has(family,'family'),
   staffChair:has(/理事長|主席/,'staffChair'),renew:has(/續聘|續留|續做|換(?:成|一份|新)?.{0,6}契約|新契約|續約|調職|加.{0,6}津貼/,'renew'),
   part:has(/兼職|兼任會計|每週.{0,6}半天|部分工時/,'part'),
   director:!!(samePerson&&!/監事.{0,10}(?:兼|事務員|技術員)/.test(t)||!changed&&p.director),
   supervisor:has(/監事.{0,15}(?:兼|當|做|原本).{0,8}(?:事務員|技術員|理事)|監事原本也做事務員/,'supervisor'),
   pay:has(/薪水|薪資|薪給|領薪|報薪|津貼|蓋章|薪核|核准|財務|查自己業務/,'pay'),
   grant:!knownEx&&!/(?:沒有|不涉及|不用|不問|並無)(?:政府|縣府)?補助/.test(t)&&has(/補助|核銷|縣府計畫/,'grant')};
}
function route(q,prev){
 const s=parse(q,prev);if(!s)return null;
 const refs=[],steps=[];
 const add=(h,b)=>steps.push([h,b]);
 const out=(title,summary,heading,choices)=>({direct:true,category:'團體人事｜親屬任職、兼職與迴避',title,summary,steps,refs,staffRelativeContext:s,questionState:{focus:choices?'clarify':'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}],...(choices?{choiceHeading:heading,choices}:{})});
 const general='先分開「親屬兩人各任一職」和「同一個人兼職」。團體種類、實際職務、何時聘僱，以及是不是在審核自己的案件，都會改變答案。';
 if(!s.list.length)return out('先確認團體及任職關係',general,'你問的是哪種團體？',Object.values(orgs).map(v=>({label:v,question:'確認親屬任職團體:'+v})));
 const multi=s.list.length>1;
 if(s.list.includes('s')){
   refs.push(social,socialMemo);
   add('一般協會：理事長親屬新聘與原已聘的人分開','社會團體工作人員管理辦法第5條：協會不得聘僱現任理事長的配偶及三親等以內血親、姻親為工作人員；理事長接任前已聘僱者例外。只聘半天或兼任，也受新聘限制。這不是理事長在理事會迴避表決就能新聘；其他一般理事的親屬不是第5條列的理事長親屬，不等於其他法令、章程或內控全不限制。');
   if(s.old||s.renew)add('換契約、加津貼先看是否仍是同一僱用關係','核對最初聘用日、理事長就任日、是否中斷、職務或契約是否另起。原任例外不等於任何新契約或津貼都能過，請以章程、理事會權限及勞動法規核對，疑義由主管機關依文件確認。');
   if(s.pay){refs.push(sf);add('協會的薪資決議和領款憑證也分開','先看薪資制度與章程。依社會團體財務處理辦法第17條，提用存款時依法由團體負責人、秘書長或總幹事及財務人員共同蓋章；這不是讓配偶或本人一人自行核薪。涉及自身利益應先揭露，按制度交無利害且有權核決者處理，監事會依第22條查核。');}
 }
 if(s.list.includes('c')){
   refs.push(coop,coopHr);
   add('一般合作社：親屬應聘與同人兼職不是同一條','已核對的一般合作社規定，沒有把社會團體理事長配偶的禁聘規則照搬過來，也不能因此認定一定能聘。合作社組織編制及人事管理準則第4–6條要求人事制度、理事會公開考選，或依人事規定授權公開遴選再經理事會通過；主席口頭同意或事後補決議不等於完成公開考選。揭露關係、由無利害且有權的人評審與留下紀錄，是可採的人事控管；是否依法必須迴避及門檻，查適用章程、人事規定或其他明文。');
   if(s.director||s.supervisor)add('理事、監事各有不同的同人兼職限制','準則第7條：理事不得兼任聘任職員，只有特殊情形經主管機關同意的例外。合作社法第40條另明列監事不得兼任理事、事務員或技術員，不能援用理事的例外。監事不能用查核權替自己審自己的事，依第39條查社務及書類。');
   if(s.pay){refs.push(coopMoney);add('薪資不能由本人申報後自己放行','按人事制度、薪級、工作及可核的實支，由無利害關係且依章程有權的人審查、保留薪資與核決憑證。親屬或主席不當然是唯一有權簽核人；給付的職員薪資和理監事津貼要分開，監事查核紀錄和依法領取的權利也不相同。');}
 }
 if(s.list.includes('f')){
   refs.push(credit);
   if(s.fRole==='gm')add('信用合作社：總經理和理事主席配偶不得同時任職','依第14條，現任總經理（含代理）與理事主席（含代理）或監事主席（含代理），若是配偶或二親等以內血親、姻親，不得同時擔任；一方或雙方代理都不例外。這是職務資格，不是只在理事會迴避或補一份決議就可同時任職。');
   else if(s.fRole==='branch')add('僅分社經理，不以「經理」兩字推定是總經理','若確實只是分社經理，且未兼任或代理總經理，第14條所列總經理限制不能直接套入；也不等於必然合格。由理事會依第13條及第14條之一審查資格、職務實態和適任性，再依金管規定及章程確認其他限制。');
   else add('信用合作社先分是總經理還是分社經理','第14條的明文針對現任總經理（含代理）和理事主席或監事主席（含代理），有配偶或二親等內血親、姻親時不得同時任職。分社經理另看第13條的資格及第14條之一的理事會審核，不單靠稱呼定論。');
 }
 if(s.list.includes('g')){
   refs.push(corp);
   add('工商同業公會：親屬的會務聘僱有專門限制','按工商團體會務工作人員管理辦法第7條第6款，現任理事、監事或秘書長（總幹事）的配偶或三親等以內血親、姻親不得任會務工作人員。新聘即使是兼職、有公開面試或提交理事會，仍不能以這些程序取代資格限制；是否屬適用的會務聘僱、以及原已任職等情況，帶實際契約向主管機關核對。');
 }
 if(s.grant&&(s.list.includes('c')||s.list.includes('s')||s.list.includes('g'))){
   refs.push(county);
   add('薪資是否可報補助，要另外核對計畫','人事決議不等於核准補助。以原核定、計畫人事費及實際工作和付款憑證核對，未獲同意不先報支；保留聘僱、核薪、利益關係處理及監事查核紀錄，不把自己人同意當成補助機關核准。');
 }
 const name=multi?'不同團體的親屬與兼職限制各自核對':s.list[0]==='s'?'協會親屬聘僱：新聘和原已在職分開':s.list[0]==='c'?'一般合作社：親屬應聘、同人兼職及薪核分開':s.list[0]==='g'?'工商同業公會新聘會務人員有親屬限制':s.fRole==='gm'?'信用合作社總經理（含代理）與配偶主席不得同時任職':s.fRole==='branch'?'信用合作社分社經理：另查資格及職務範圍':'信用合作社：先看是否為總經理或代理總經理';
 if(!multi&&s.list[0]==='f'&&!s.fRole)return out(name,general,'該經理實際擔任何種職務？',['總經理或代理總經理','僅分社經理','還不清楚職務'].map(v=>({label:v,question:'確認信用合作社職務:'+v})));
 return out(name,general);
}
if(typeof module==='object'&&module.exports)module.exports={route};
else root.verifiedStaffRelativeConflicts=route;
})(typeof window==='object'?window:globalThis);
