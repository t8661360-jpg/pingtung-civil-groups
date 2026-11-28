(function(root){
'use strict';
const ref=(title,pcode,n)=>({title:title+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+pcode+'&flno='+n});
const ap=n=>ref('人民團體法','D0050091',n);
const cf=n=>ref('合作社法','D0050112',n);
const af=n=>ref('社會團體財務處理辦法','D0050097',n);
const med=ref('人民團體會務輔導辦法','D0020094',12);
const admin=ref('行政程序法','A0030055',127);
const county={title:'屏東縣政府對民間團體補助經費作業要點第5、8、8-1、10點（115年官方公告附件）',source:'https://portal.ptc.edu.tw/bulletin/attachment.php?a_sn=33872&b_sn=B114003910'};
const coopElection={title:'合作社選舉罷免辦法：選舉會議紀錄另依規定備查',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050022'};
const locOther=/(?:臺北|台北|新北|桃園|臺中|台中|臺南|台南|高雄|基隆|新竹|嘉義|彰化|苗栗|南投|宜蘭|花蓮|臺東|台東|雲林|澎湖|金門|連江)(?:市|縣)?(?:政府|縣府|市府|的(?:市|縣)?補助)/;
const signaled=/(?:會議)?紀錄|會議記錄|議事錄|大會.{0,12}記錄/;
const missing=/(?:沒|未|漏|欠|缺|忘|逾期|不曾|沒有).{0,14}(?:送|報|紀錄|記錄|提交|交|份資料)|(?:紀錄|記錄|相關文件).{0,14}(?:沒|未|漏|缺|少|遲|超過|逾期|忘)|(?:補件|補報).{0,12}(?:紀錄|記錄)|(?:缺一份|少一份).{0,12}(?:會議|紀錄|記錄)/;
const adverse=/取消|作廢|撤銷|廢止|追[回繳]|退回|先還|先匯|收回|核銷|不撥|領到|匯入|會不會被|保得住|補件|影響|卡在|能不能領|繳回|不讓申請|要等/;
const orig=/理監事會?|理事會|監事會|理事會議|監事會議|會員(?:代表)?大會|社員大會|社員代表大會/;
function meet(t){
 const tag=t.match(/未報文件確認:(大會紀錄|理監事會紀錄|年度決算資料|資料不確定)/)?.[1];
 if(tag)return ({大會紀錄:'assembly',理監事會紀錄:'board',年度決算資料:'financial',資料不確定:'unknown'})[tag];
 const clauses=t.split(/[，,。；;？?！!]/);
 for(const x of clauses){
  if(/^(?:但)?(?:不是|並非|並不是|沒漏|未少|沒缺|也不是|而非|不同於)/.test(x))continue;
  if(!signaled.test(x)||!missing.test(x))continue;
  if(/社員(?:代表)?大會|會員(?:代表)?大會/.test(x))return 'assembly';
  if(/理監事會?|聯席會議|理事會|監事會/.test(x))return 'board';
 }
 if(/(?:不是|並非).{0,6}(?:理監事會|理事會|監事會)/.test(t)&&/會員(?:代表)?大會|社員(?:代表)?大會/.test(t))return 'assembly';
 if(/不是.{0,12}(?:會員|社員)(?:代表)?大會/.test(t)&&/理監事會?|理事會|監事會/.test(t))return 'board';
 if(/(?:會員|社員)(?:代表)?大會.{0,28}(?:紀錄|記錄).{0,5}(?:沒|未|漏|缺)|(?:沒|未|漏|缺).{0,14}(?:會員|社員)(?:代表)?大會.{0,8}(?:紀錄|記錄)/.test(t))return 'assembly';
 if(/理監事會?|理事會|監事會/.test(t)&&!/(?:會員|社員)(?:代表)?大會/.test(t))return 'board';
 if(/只缺(?:少)?(?:年度)?(?:決算|財務|預算)(?:報告|表|資料)|確定沒報(?:年度)?(?:決算|財務資料)/.test(t)&&!/(?:只缺|確定缺).{0,12}(?:紀錄|記錄)/.test(t))return 'financial';
 if(/(?:會員|社員)(?:代表)?大會/.test(t)&&!(/理監事會?|理事會|監事會/.test(t)))return 'assembly';
 if(/(?:社員|會員)(?:代表)?大會.{0,10}(?:有合法|先開了|有開|已開|已過|開完)|會議已過.{0,4}天/.test(t)&&/只(?:漏|缺)(?:這一份|一份|會議|紀錄)|決算除紀錄外/.test(t))return 'assembly';
 return null;
}
function options(raw,heading,tag,values){
 if(raw.length>330)return {};
 return {choiceHeading:heading,choices:values.map(([label,key])=>({label,question:raw+'；'+tag+'：'+key+'。'}))};
}
function answer(q){
 const raw=String(q??'').trim(),t=raw.normalize('NFKC').replace(/\s+/g,'');
 if(!t||t.length>415||!/補助|經費|核銷/.test(t)||!adverse.test(t)||!signaled.test(t)||!missing.test(t)||!orig.test(t))return null;
 if(/信用合作社|信合社|保險合作社|公會|工會|農會|漁會|基金會|管委會|公司股東會|選舉補助款/.test(t)||/封鎖|前任.{0,8}拒交|法人登記|借錢給.{0,7}理事長|章程變更一定要送|志工便當|欠薪/.test(t))return null;
 const tag=t.match(/補助會務團體確認:(一般協會|一般合作社)/)?.[1];
 const coop=tag==='一般合作社'||!tag&&/合作社|社員(?:代表)?大會|本社/.test(t)&&!/不是(?:一般)?合作社/.test(t);
 const assoc=tag==='一般協會'||!coop&&/協會|社會團體|人民團體|社團法人/.test(t)&&!/不是(?:一般)?協會/.test(t);
 const kind=meet(t);
 const grantStatus=t.match(/補助進度確認:(申請中|已核定未必已撥|已入帳|不確定)/)?.[1];
 const paid=grantStatus==='已入帳'||/已(?:經)?(?:領到|收到款|撥入|撥款|入帳|領款)|已領(?!取收據)|已(?:經)?匯入|補助.{0,8}匯(?:到|入)|款項.{0,7}(?:已到|已入|入帳)/.test(t)&&!/尚未撥|沒入帳|還沒領|未領/.test(t);
 const approved=paid||grantStatus==='已核定未必已撥'||/已(?:經)?核定|已核准|核定的|核准的|核定款|核定函已/.test(t)&&!/還沒有核定|尚未核定|沒核定/.test(t);
 const applied=!approved&&(grantStatus==='申請中'||/申請中|正在申請|要申請|還沒核定|申請階段/.test(t));
 const requested=/已(?:經)?(?:收到|接到).{0,12}(?:補件|補報|補正)|縣府.{0,8}(?:要求|請).{0,6}(?:補件|補報|補正)/.test(t)&&!/沒(?:有)?收到.{0,8}(?:補件|補報|補正)/.test(t);
 const notWarned=/(?:沒有|沒|還沒|尚未)(?:收到|正式告知|通知|發文).{0,8}(?:追繳|追回|取消)/.test(t);
 const financeSent=/(?:已(?:經)?|早就|有|確定|按時|在.{0,12}(?:一個月|期限內)).{0,6}(?:報|寄|送)(?:了|出|件|備查|交)?(?:年度)?(?:決算|財務資料)|(?:決算|財務資料).{0,25}(?:已送|已報|有報(?:了)?|有送(?:了)?|確定已送|早就報|有按時報|已經陳報|按時送)/.test(t)&&!/決算.{0,6}(?:也沒|也未|一起沒)/.test(t);
 const days=t.match(/(?:閉會|開完|會議).{0,9}(?:超過|已過|過了|已經過了|已隔|後)(\d{1,3})(?:天|日)/)?.[1];
 const late=days&&Number(days)>30;
 const outside=locOther.test(t)&&!/屏東(?:縣府|縣政府|的補助)/.test(t);
 const pt=/屏東/.test(t)&&!outside;
 const exactFile='把會務備查和補助核銷各自確認；保留送件清單、回執或收文號，必要時請原受理單位核對，不能只有自己存檔就算縣府收件。';
 const records=assoc?[
   kind==='board'?'補助不會只因一份普通理監事會紀錄未報就自動取消':kind==='assembly'?'先補會員（代表）大會紀錄，不是重送已備查的每一份資料':'先分理監事會紀錄、會員大會紀錄和年度決算',
   kind==='board'?'依人民團體會務輔導辦法第12條，理事會、監事會及理監事聯席會議紀錄通常是團體自行留存供會員查閱；依法須報核的決議，或補助核定函要求的證明文件，則另按要求檢附處理。會員（會員代表）大會的會議紀錄才有閉會後30日內備查的一般規定。':kind==='assembly'?'依人民團體會務輔導辦法第12條，會員（會員代表）大會紀錄在閉會後30日內報原主管機關備查。'+(late?'您說已過'+days+'天，已超過30日，請儘快補報這份會議紀錄。':'請核實際閉會日；逾期就儘快補報。')+'應據實記載開會日期、出缺席及決議，不補改日期，也不把有開大會但漏送紀錄說成一年沒開。':'依人民團體會務輔導辦法第12條，理監事會議紀錄一般留存，依法需送的決議另報；會員（會員代表）大會紀錄閉會後30日內送備查。決算由監事會先審、會員大會通過後報備，與會議紀錄是兩件事。'
 ]:coop?[
   '一般合作社用合作社規定，不照搬協會的30日',
   '合作社法第35條要求備置社員大會紀錄等法定簿冊；第36條的年度會計等法定書類，在社員大會承認後一個月內書面報原主管機關。'+(kind==='board'?'日常理事會、監事會的會議紀錄，不等於這條的年度書類；是否需報該筆，另核實際決議、章程、縣府通知及特定法規（例如選舉紀錄），不說一律要送或一律免送。':'確認缺件是大會紀錄、年度書類或特殊決議附件；第36條的一個月期限不能概括套到每一份紀錄，選舉紀錄依法另報。')
 ]:['先確認團體類型再判斷應報哪些會務資料','年度決算、日常理監事會紀錄、大會紀錄和補助核銷資料是不同文件。一般協會與一般合作社的期限及報送事項不同。不能只因聽到有一份紀錄沒報，就認定已核定補助被取消或已領款要退。'];
 const finance=['核對已送或缺少的是哪一份資料',
   (financeSent?'您已說年度決算有送，不用先猜它也漏了。請用回執或收文號核對是否收件及現有缺件清單。':kind==='financial'?'若實際缺的是應報年度決算或其他法定財務資料，請向原主管機關核對年度、應送文件及補報程序，不能只送會議紀錄頂替。':'請先核對缺的確是會議紀錄、不是預決算等法定財務資料；可用回執、收文號與已送附件清單區分。')+(requested?'既已收到補件要求，請按通知列的實際資料、期限和窗口補正，不要等另有追繳通知才處理。':'沒有收到通知，不會自動免除原本法定或核定案的期限。')+exactFile];
 const local=(pt?'屏東縣':'若適用屏東縣')+'民間團體通案第5點第3款把未依規定陳報財務資料、一年未開會（社）員大會等列為不予補助事由，不等於任何理監事會紀錄沒送都同樣處理。第8點原則上計畫辦完20日內辦核銷，逾當年度不按規定辦理可能註銷，不和大會紀錄30日混用；第8-1點繳回結餘及第10點違規追繳另行處理。仍看該團體是否適用和專案規定。';
 const funding=['申請、核定、已入帳，要分三個階段處理',
   (outside?'本案不是屏東補助，不套用屏東通案要點；請看您縣市、核定機關的方案。':local)+(applied?'您說仍在申請中：先依通知補件、向申請窗口確認缺這一件是否影響審查及補件期限，不保證一定可以或一定要等。':approved?'您說補助已核定'+(paid?'而且已入帳':'')+'，不因漏一份紀錄就必然撤銷、取消或追回。先核對核定函和原機關的正式通知；若仍須核銷，按原期限備齊文件並先問缺件怎麼補，不能把備查處理當作期限自動延長。':'先查目前是申請審查、已核定未撥款，還是已入帳。各階段要補的資料及可能後果不同；不在沒有條件時保證接受、撥款或認定須退。')];
 const returnMoney=['已領款不先自行匯回，先核對正式要求',
  (notWarned?'您說沒有收到追繳通知，先查缺件及核定要求。':'先查原補助機關是否已有正式要求。')+'不要只因口頭說紀錄缺件，或收到不明匯款訊息，就自行把補助匯回。若確認是因行政處分失效而依法追繳，行政程序法第127條要求以書面處分確認返還範圍和期限；核銷後依法／依核定條件繳回結餘或契約款另行處理，不因同一條文而一概不用退。請用原核定函或官方聯絡方式核對機關、金額、期限與指定帳戶。'];
 const close=['會務補報與補助處理，分開找對窗口',
   '紀錄、年度決算與其他應備查資料找原登記／主管機關的會務承辦；補助補件、核銷、撥款或追繳找核定函上的原補助機關。不是每個案子都由同一窗口受理。'+(assoc&&/罰|處罰/.test(t)?'只憑一般協會大會紀錄逾期，不自行認定有固定罰鍰；人民團體法第58條的監督處理及個案已收到的期限，與是否追繳補助是不同問題。':'')];
 let index={};
 if(!assoc&&!coop)index=options(raw,'您是哪一類團體？','補助會務團體確認',[['一般協會','一般協會'],['一般合作社','一般合作社']]);
 else if(!kind&&/哪份|哪個|不清楚|只有一份|紀錄|資料/.test(t))index=options(raw,'原窗口說缺哪一份？','未報文件確認',[['會員／社員大會紀錄','大會紀錄'],['理監事會議紀錄','理監事會紀錄'],['年度決算資料','年度決算資料'],['還不清楚','資料不確定']]);
 else if(!approved&&!applied&&!grantStatus)index=options(raw,'補助目前到哪個階段？','補助進度確認',[['還在申請','申請中'],['已核定，還沒領到','已核定未必已撥'],['已收到補助款','已入帳'],['不清楚','不確定']]);
 const needReturn=paid||/匯回|要不要先還|先繳回|退回|追繳|追回|撤銷核定/.test(t)&&approved;
 return {direct:true,category:coop?'一般合作社｜會議紀錄與補助':assoc?'協會｜會議紀錄、核銷與補助':'補助與漏報資料｜先確認團體',
 title:kind==='assembly'&&assoc?'漏報會員大會紀錄要補報，補助不會當然取消':!assoc&&!coop?'先確認團體類型，漏一份紀錄不等於取消補助':'理監事會紀錄與補助取消或追繳，要分開判斷',
 summary:kind==='assembly'&&assoc?'先補原應備查的會員（會員代表）大會紀錄；年度決算和補助核銷分開核對。已核定補助不因一份紀錄沒報就必然取消。':'先分清缺的是會議紀錄、年度決算，還是核定案要求的附件。只漏紀錄並不當然取消補助或要求退錢。',steps:[records,finance,funding,...(needReturn?[returnMoney]:[]),close],
 refs:[...(assoc?[med,ap(34),af(11),...(/罰|處罰/.test(t)?[ap(58)]:[])]:coop?[cf(35),cf(36),coopElection]:[med,cf(36)]),...(!outside?[county]:[]),...(needReturn?[admin]:[])],questionState:{focus:index.choices?'clarify':'compound'},...index};
}

// This narrow route runs before standalone meeting and grant answers, so one
// subject cannot swallow the other. The older association/coop route remains.
function combined(q){
 const raw=String(q??'').trim(),t=raw.normalize('NFKC').replace(/\s+/g,'');
 if(!t||t.length>520||!/補助|核銷/.test(t)||!signaled.test(t))return null;
 if(/(?:沒有|不是|不再|不問|不用|沒有要)(?:在|要|申請|報|談|問){0,3}(?:補助|核銷)|工會|合作社|基金會|管委會|勸募|車馬費|出席費/.test(t))return null;
 const named=t.replace(/(?:不是|並非|非屬)(?:一般|縣級|原本的)?(?:工業(?:同業)?公會|商業(?:同業)?公會|社區發展協會|協會|社會團體)/g,'');
 const com=/商業(?:同業)?公會/.test(named),ind=/工業(?:同業)?公會/.test(named);
 const assoc=/協會|社會團體/.test(named)&&!/公會/.test(named);
 if(Number(com)+Number(ind)+Number(assoc)!==1)return null;
 const name=com?'商業同業公會':ind?'工業同業公會':/社區發展協會/.test(named)?'社區發展協會':'一般協會';
 const knownKind=t.match(/會務補助會議確認:(大會|理監事|不清楚)/)?.[1];
 const facts=named.replace(/(?:不是|並非|沒(?:有)?開)(?:會員(?:代表)?大會|理監事(?:聯席)?會(?:議)?|理事會|監事會)/g,'');
 const kind=knownKind==='大會'?'assembly':knownKind==='理監事'?'board':knownKind?null:
  /(?:開的?|召開|這場|這次).{0,5}會員(?:代表)?大會/.test(facts)&&!/開的是(?:理事會|監事會|理監事)/.test(facts)?'assembly':
  /(?:開的是|召開的是)(?:理事會|監事會|理監事)/.test(facts)?'board':meet(facts);
 const recordsIssue=/(?:紀錄|記錄).{0,26}(?:沒|未|漏|逾期|遲|只(?:寄|發|把|傳|送)|要(?:寄|報|送))|(?:沒|未|漏|補).{0,15}(?:報送|報|寄|分送|送).{0,15}(?:紀錄|記錄)|只.{0,12}(?:給|寄|傳).{0,10}(?:理事|出席)|補發|紀錄.{0,20}送誰/.test(t);
 const moneyIssue=/核銷|註銷|撤銷|取消|罰款|罰鍰|追繳|還錢|補件|已撥|沒撥|未撥|撥款|缺件|缺收據|收據.{0,5}漏|影響.{0,6}補助|補助.{0,10}影響/.test(t);
 if(!recordsIssue||!moneyIssue)return null;
 if(assoc&&!/社區發展協會|收據|單據|會務補助(?:進度|會議)確認/.test(t)&&kind&&missing.test(t)&&!/(?:不是|並非).{0,3}(?:工業|商業)/.test(t))return null;
 const meetingRef=assoc?med:com?{title:'商業團體法施行細則第25條',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050101'}:{title:'工業團體法施行細則第30條',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050104'};
 const mechRef=com?{title:'商業團體法第6條',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050100'}:{title:'工業團體法第5條',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050103'};
 const heading=kind==='assembly'?'這場會員（代表）大會':kind==='board'?'這場理事會或監事會':'先確認會議種類';
 const days=com?'15日':ind?'7日':'30日';
 const explicitDay=t.match(/(?:會後第?|(?:紀錄)?到第|過了|已過)(\d{1,3})(?:天|日)/)?.[1]||(/(?:會後第?|到第)八(?:天|日)/.test(t)?'8':null);
 const late=(explicitDay&&Number(explicitDay)>Number(days.slice(0,-1)))||/去年.{0,12}(?:開|的).{0,4}(?:理事會|監事會|大會)|紀錄.{0,10}(?:逾期|超過期限)/.test(t);
 const fix=late?'依您描述，會務已過原期限。請照實儘快補送並查詢補正方式，保留送件證明，不要倒填日期；換年度不會把該義務變成補助核銷。':'按各自的會議日期計算。如只傳給出席者或理事，補送其餘會員並核對兩邊收文；若已逾期，請照實儘快補送並詢問補正。';
 const records=assoc?(kind==='assembly'?'會員（會員代表）大會紀錄應於閉會後30日內報主管機關備查。'+(late?'依您提供的時間，已過原期限，請儘快照實補報。':'如已過期限請儘快照實補報。'):
 kind==='board'?'一般理事會、監事會及理監事聯席會議紀錄原則上留存供會員查閱，不是每次都要報縣府；有法令要求核辦的決議才另附文件辦理。':'若是大會，閉會後30日內送團體主管機關備查；若是普通理事會、監事會或理監事聯席會議，紀錄一般留存供會員查閱，依法須報核的決議另案送件。'):
 '依'+meetingRef.title+'，會員大會、理事會或監事會各自於會後'+days+'內把紀錄分送各會員，不只寄出席者，並報團體主管機關及目的事業主管機關。'+fix;
 const who=assoc?'需備查的會務文件找立案主管機關；補助附件則找核定函上的原補助承辦。':
 (com?'縣級商業同業公會的團體主管機關是縣政府；目的事業主管機關看行業。':'依立案證書核對團體主管機關：直轄市工業同業公會由市政府主管，特定地區及全國者由內政部主管；縣（市）工業會不是工業同業公會。目的事業主管機關依行業及層級確認。')+'補助補件或核銷另送核定函上的原補助承辦，不用兩個流程互相代替。';
 const stage=t.match(/會務補助進度確認:(未撥|已入帳|收到正式通知|不確定)/)?.[1];
 const noPay=stage==='未撥'||!stage&&/(?:沒(?!有沒有)|尚未|還未|未|尚無)(?:有)?(?:收到(?:補助)?款|收到補助|撥款?|入帳|領到)|沒有預撥/.test(t.replace(/有沒有(?:已經)?(?:撥款?|入帳|領到|收到款)/g,''));
 const paid=stage==='已入帳'||!stage&&!noPay&&/已(?:經)?(?:收到款|入帳|領到|撥款)|款.{0,4}已入帳/.test(t);
 const written=stage==='收到正式通知'||!stage&&!/(?:沒|未).{0,8}(?:正式|書面)(?:處分|通知)/.test(t)&&/已(?:收到|接到).{0,9}(?:書面|正式)(?:通知|處分)/.test(t);
 const status=(written?'已收到正式通知，先按公文核對是補正、註銷、追繳或其他處理，確認期限及原因。':
 '紀錄漏送不等於補助已取消。電話提醒也不足以判定已註銷。請用核定函、原補助窗口及收文號查是未核定、已核定待審、可補件，還是已正式註銷。')+
 (noPay?'您提到款還沒撥，先查核銷與核定狀態；確無撥款或預撥，就沒有已領的本金可退。':
 paid?'您提到已入帳，先核對是否有結餘或正式追繳及書面依據，不憑口頭提醒就匯款。':'有沒有已撥或預撥，也會影響是否涉及退回。');
 const outside=locOther.test(t)&&!/屏東(?:縣府|縣政府|的補助)/.test(t);
 const cutoff=outside?'本案是外縣市補助，不套用屏東通案；以原公告、核定函和原補助機關確認補件、核銷及年度期限。':
 '若適用屏東縣通案第8點，計畫完成後20日內辦核銷，逾核定年度未依規定辦理，原核准補助經費依該點註銷、不保留。跨年或期限有疑義，請原機關按年度、完成日、實際送件日及適用規則查個案，不保證補件就能保留。';
 const docs='核對核准文件影本、領款收據、實際支用明細、支用單據，依原方案補成果、照片或設備財產證明。缺收據或核定函，先向原承辦查詢可接受的補正方式及期限；只有核定函、公告或補助機關要求的會議紀錄，才當補助附件送。';
 const sanctions=/罰款|罰鍰|追繳|還錢|繳回|退回/.test(t)?[['逾期不直接等同罰款、停補助或追繳','不能只憑紀錄漏報就認定有固定罰款。'+(!outside?'適用屏東要點時，第8-1點的補助結餘要繳回；第10點無正當理由逾核銷期限可列下次審查考量，與未依用途等違規追繳是不同處理。':'核銷期限、是否追繳及有無裁處，都以該方案適用規定及正式通知分別核對。')]]:[];
 const index=assoc&&!kind&&!knownKind?options(raw,'您要補的是哪一場的紀錄？','會務補助會議確認',[['會員（代表）大會','大會'],['理事會／監事會／聯席會議','理監事'],['不清楚是哪一場','不清楚']]):
 !stage&&!noPay&&!paid&&!written?options(raw,'目前比較符合哪一種補助狀況？','會務補助進度確認',[['還沒收到補助款','未撥'],['補助款已入帳','已入帳'],['已收到正式通知','收到正式通知'],['還不清楚','不確定']]):{};
 return {direct:true,category:name+'｜會議紀錄與補助',title:name+'：會議紀錄和補助分開辦',summary:'先按團體及會議種類處理紀錄，再找原補助機關核對核銷或補件。單憑會議紀錄沒送，不能判定補助已取消。',steps:[[heading,records],['分清會務與補助收件窗口',who],['確認補助現在到哪一步',status],['核銷期限及缺件怎麼處理',cutoff+docs],...sanctions],refs:[meetingRef,...(assoc?[]:[mechRef]),...(!outside?[county]:[])],actions:[{label:'聯絡承辦',view:'contact',sub:''}],questionState:{focus:index.choices?'clarify':'compound'},...index};
}

if(typeof module!=='undefined'&&module.exports){module.exports=answer;module.exports.combined=combined;return;}
root.verifiedGrantMissingMeetingRecord=answer;
root.verifiedCombinedMeetingRecordAndGrant=combined;
})(typeof window!=='undefined'?window:globalThis);
