(function(root){
'use strict';
const cite=(x,pcode,n)=>({title:x,source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+pcode+'&flno='+n});
const rules={title:'屏東縣政府對民間團體補助經費作業要點（第2至10點）',source:'https://portal.ptc.edu.tw/bulletin/attachment.php?a_sn=33872&b_sn=B114003910'};
const sample={title:'屏東縣政府教育處115年度公告與申請、核銷表件示例',source:'https://portal.ptc.edu.tw/bulletin/view.php?sn=B114003910'};
const accounts=cite('社會團體財務處理辦法第16條：團體收入存放','D0050097',16);
const receipts=cite('社會團體財務處理辦法第17條：收據及存款領用','D0050097',17);
const clean=q=>String(q??'').normalize('NFKC').replace(/\s+/g,'');
const identity=['申請單位與負責人是兩個欄位',
 '以一般立案協會申請時，「申請單位」填協會的立案全名；「負責人」填依章程及有效任職文件有權代表協會的人。理事長以代表人身分簽署或用印，不會變成他個人申請。依要點第2、4點，通案民間團體補助不是補助個人舉辦的活動。'];
const filings=['尚未核定時，先準備團體申請文件',
 '要點第6、7點：由協會備申請函、申請單位聲明書、實施計畫與經費概算明細表，送該補助計畫受理機關；若經鄉（鎮、市）公所陳報，依該公所程序，不代表已核定。團體章、負責人章、印鑑、領據的欄位，依該補助案公告及核定函；不同專案不可照搬。'];
const settlement=['收款用團體帳戶，領款收據與代表簽章另看表單',
 '協會收入不得放在個人名下。依社會團體財務處理辦法第16、17條，補助是協會收入，報原核定機關可接受的協會團體帳戶並依規定出具正式收據；理事長在負責人欄簽名，不等於可以匯到他的私人戶頭。帳戶及領款文件以原補助機關要求為準，不要在櫃檯聊天貼存摺或帳號。'];
const routed=['若款已進私人戶頭，先留存真實紀錄再核對',
 '不要繼續用私人戶收團體款、任意支付下一場或自行填成已匯入團體戶。把撥付、入帳、支用及剩額據實對帳，由有權代表及財務人員向原核定機關確認更正、轉入團體戶、繳回或補件的適用程序；不稱有固定的補正做法。'];
const phases=['先確認核定函是否允許分期，不把一場當全案完成',
 '若兩場是同一份核定計畫，第一場辦完不等於全案執行完竣。先查看是否已有核定的分期核銷、撥付或個別條件；有才按該條件就已完成部分備真實成果與支用憑證。若沒有，不自行先當全案核銷，也不保證可分期；先向原核定補助機關書面確認。'];
const factual=['未辦的場次不能寫成完成，更不能用舊照片充當成果',
 '保留第一場真實的日期、照片、憑證與已用金額，第二場如實註明尚未辦理或變更待核准。不能拿前一場或以往照片冒充第二場、虛填結案，或把預計支出當已支出。要點第8、10點要求按實據核銷；虛報、未依用途支用可能追繳，並依情節影響後續補助。'];
const changes=['改期、調整預算或改用途，先由原核定機關書面確認',
 '把未辦原因、原定和擬改日期、已執行情形及擬調整的預算項目和金額，如印刷費改場地費，送原核定補助機關核對。核定的是原計畫，不等於同意改期或挪用項目；變更尚未核准，也不等於原補助未核定或已取消。是否得變更、用哪種表、依什麼期限辦，按該案核定函及機關的書面說明。'];
const claim=['全案合法完成後核銷；已撥剩款不能自行留到明年',
 '通案依第8點，在計畫實際執行完竣後20日內辦理核銷，並按核定函及當年度規定。逾當年度未依通案規定核銷，原核定經費會被註銷且不予保留；不保證可跨年度展延。依第8點之一，補助有剩餘應繳回，請向原核定機關確認退回金額與方式，不自行留用或挪給下一場。'];
function answer(q){
 const t=clean(q);
 const directGrant=/補助|補助款|補助金/.test(t);
 const stagedFunds=/核銷|核定案|核定計畫/.test(t)&&/第一場|第二場|兩場/.test(t)&&/核定|核銷|餘款|支用/.test(t)&&!/採購|標案|工程|承攬|委外/.test(t);
 const applied=/報活動|活動申請|活動計畫/.test(t)&&/鄉公所|縣府|縣政府/.test(t)&&/簽申請函|他個人申請|負責人.{0,6}簽/.test(t);
 const inferredLocal=directGrant&&/協會|社會團體/.test(t)&&/理事長/.test(t)&&/申請/.test(t)&&/名義|名字|申請人|申請單位|本人名|代表.{0,5}簽/.test(t)&&!/中央|部會|國科會|勞動部|文化部|衛福部|內政部|公益彩券回饋金/.test(t);
 if(!t||t.length>440||!directGrant&&!stagedFunds&&!applied||(!/屏東|縣府|縣政府|鄉(?:鎮|公所)/.test(t)&&!inferredLocal)||/勞保|勞工補助|醫療補助|急難救助|水電補助|房租補助|低收入戶|公會|公司申請|工會|合作社|信合社|農會|漁會/.test(t))return null;
 if(/不是屏東|非屏東/.test(t)||!/屏東/.test(t)&&/(?:臺北|台北|新北|桃園|臺中|台中|臺南|台南|高雄|新竹|苗栗|彰化|南投|雲林|嘉義|宜蘭|花蓮|臺東|台東|澎湖|金門|連江|基隆)/.test(t))return null;
 const social=/協會|社會團體|社團法人|人民團體|本會/.test(t);
 const personal=/不是(?:協會|團體)|我(?:只|是)個人|我自己辦|個人藝文|以個人身分|沒有團體/.test(t);
 const isPrivate=/私人|個人(?:銀行)?(?:戶|帳戶|帳號|存摺)|(?:他|本人|理事長).{0,4}(?:自己戶頭|本人戶頭|私人戶|個人戶)/.test(t);
 const accountAsk=/撥款|匯(?:款|到|進)|帳戶|帳號|戶頭|戶名|收款|領錢|領據|領款收據|先領|私戶/.test(t);
 const who=/理事長.{0,16}簽申請函|個人申請|申請單位|負責人.{0,5}(?:欄|身分)|申請人|個人名義|本人名義|以.{0,5}名義|理事長.{0,5}(?:名字|簽|名義)|誰.{0,5}(?:申請|簽章)|私人.{0,5}(?:申請|領錢)/.test(t);
 const multi=/同案|同(?:一|個).{0,8}(?:案|計畫)|一(?:份|個|件)(?:核定|補助|計畫)|兩場.{0,8}(?:活動|同案)|第一場.{0,22}第二場|第二場.{0,22}第一場/.test(t);
 const unfinished=/未辦|沒辦|還沒辦|沒做|還沒核准|未核准|延期|跨年|明年|改期|延到|舊照片|舊圖|只報.{0,8}(?:已|完成)|分期|分場|未完成/.test(t);
 const moved=/下一場|下次|隔年|明年|留用|發還|改項|挪用|印刷.{0,10}場地|場地.{0,10}印刷|費用.{0,6}(?:換|改)|從.{0,12}換.{0,8}/.test(t);
 const left=/剩款|剩額|剩餘|餘款|剩的|沒用完|留用/.test(t);
 if(personal&&!social||personal&&/不是(?:協會|團體)/.test(t)){
  if(!/一般民間團體|民間團體補助(?:要點|辦法)|用.{0,6}一般.{0,6}團體/.test(t))return null;
  return {direct:true,category:'屏東補助｜申請類型',title:'個人專案和民間團體補助，不是同一種申請',
   summary:'如果您是個人，不要以個人名義直接套屏東這份民間團體補助要點。通案的對象是符合條件的民間團體，也不以通案經費補助個人舉辦的活動。個人藝文或其他專案，另按該計畫公告的對象、表件及期限。',steps:[],refs:[rules],questionState:{focus:'compound'}};
 }
 if(!social&&!(stagedFunds&&/屏東/.test(t)))return null;
 if(/理監事會(?:議)?紀錄|年度財務資料未報|監事會(?:會議)?紀錄/.test(t)&&!/兩場活動|第二場/.test(t))return null;
 const partial=multi&&unfinished;
 const money=left&&(moved||isPrivate);
 if(!partial&&!money&&!who&&!(accountAsk&&isPrivate))return null;
 const steps=[];
 if(who)steps.push(identity,filings);
 if(partial)steps.push(phases,factual,changes,claim);
 else if(money)steps.push(claim);
 if(accountAsk||isPrivate||who)steps.push(settlement);
 if(isPrivate&&/(?:已|當初|之前|原本).{0,16}(?:收|匯|領|帳)|(?:收|匯|領).{0,9}(?:私人|個人戶)/.test(t))steps.push(routed);
 const title=partial?'屏東補助同案分場：核銷、改期、證明和餘款分開辦':who?'屏東協會申請補助：申請單位填協會，理事長可代表簽署':money?(isPrivate?'補助有剩不能移到下一場，私人戶先釐清':'補助剩餘不能自行留作下一場費用'):'屏東協會補助款不能匯到理事長私人戶頭';
 const summary=partial?'第一場已完成不等於整個計畫已完成。先看是否已核准分期；未辦第二場不能填完成，擬跨年度或調整預算經費須先找原核定機關確認。'+(accountAsk||isPrivate?'補助款是團體收入，不應匯到理事長私人戶頭。':''):
   who?'申請單位是協會，理事長有代表權可在負責人欄簽章。協會補助不應匯到代表人的私人戶頭。':
   money?'未用的補助不能自行留作下一場費用。'+(isPrivate?'若錢已入私人戶頭，先保全紀錄並向原核定機關核對，不繼續用該戶收支。':''):'協會補助應按核定文件用團體戶收款，不會因人員簽章就變成個人收入。';
 return {direct:true,category:'屏東縣補助｜申請主體與分場核銷',title,summary:(/屏東/.test(t)&&directGrant&&social?'':'如果您問的是屏東縣民間團體補助：')+summary,steps,
  refs:[rules,...(who?[sample]:[]),...(accountAsk||isPrivate||who?[accounts,receipts]:[])],questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}

const sameYearRule={title:'屏東縣政府對民間團體補助經費作業要點第2、3、4、5、6、8、10、11點',source:'https://portal.ptc.edu.tw/bulletin/attachment.php?a_sn=33872&b_sn=B114003910'};
const guildFinance={title:'工商團體財務處理辦法第25、26條：團體收入及收據',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050106'};
function applicantAndPayee(q){
 const raw=String(q??'').trim(),t=clean(raw);
 if(!t||t.length>520)return null;
 const z=t.replace(/(?:不是|並非|非屬)(?:一般|原來的)?(?:工商公會|商業(?:同業)?公會|工業(?:同業)?公會|公會|社會團體|協會|合作社)/g,'');
 if(/(?:沒有要|不再|不問|不是問)(?:再|請|談|問|申請)?(?:補助|補件)|個人生活補助|低收入戶|租屋補助|就業補助|醫療補助|護理師公會|職業公會|工會|信用合作社|合作社|農會|漁會|建築物租賃契約/.test(z))return null;
 const explicit=/補助|核銷/.test(z)||/縣府通案/.test(z)&&/領款收據/.test(z),implicit=/(?:聲明書.{0,30}(?:代簽|領據|核定)|已(?:經)?用協會申請.{0,30}(?:戶名|收據|領據))/.test(z);
 const assoc=/協會|社會團體|社團法人/.test(z)&&!/商業(?:同業)?公會|工業(?:同業)?公會/.test(z);
 const commerce=/商業(?:同業)?公會/.test(z),industry=/工業(?:同業)?公會/.test(z);
 const guild=commerce||industry;
 const loose=/未立案|沒(?:有)?立案|還沒成立|沒有成立|居民(?:小隊|團隊)|發起人|未登記(?:小隊|團體)/.test(z);
 const explicitApp=/用.{0,8}(?:自己|自已|本人|理事長|私人|個人).{0,8}(?:名字|名義|申請)|(?:個人|理事長|團體|協會).{0,5}(?:名字|名義|當申請人)|申請人|申請主體|申請單位|負責人.{0,8}(?:簽|蓋章)|代簽|代表.{0,6}簽/.test(z);
 const account=/私人(?:帳(?:戶)?|戶頭|存摺)|個人(?:銀行)?(?:帳(?:戶)?|戶頭|帳號|存摺)|自己(?:的)?(?:帳戶|戶頭)|轉給前任|匯給前任|(?:戶名|領款收據|領據|收據(?:抬頭|要開誰))|匯(?:入|進|到|至)?.{0,5}(?:團體|協會|公會|個人|私人)(?:帳戶|戶頭|戶)?|(?:團體|協會|公會)(?:的)?帳戶/.test(z);
 const local=/屏東|本縣|縣府|縣政府|公所/.test(z);
 const out=/中央|部會|文化部|衛福部|內政部|國科會|勞動部|公益彩券回饋金|(?:臺北|台北|新北|桃園|臺中|台中|臺南|台南|高雄|基隆|新竹|嘉義|彰化|苗栗|南投|宜蘭|花蓮|臺東|台東|雲林|澎湖|金門|連江)(?:市|縣)?(?:政府|縣府|市府|的(?:縣|市)?補助)/.test(z);
 if(out||!(explicit||implicit)||!(assoc||guild||loose)||!(explicitApp||account||loose&&/個人|名義|團體補助/.test(z)))return null;
 if(!local&&!implicit&&!guild&&!explicitApp&&!account)return null;
 if(/(?:紀錄|記錄).{0,8}(?:漏報|沒報|沒送|漏寄)|紀錄要寄/.test(z)&&!account&&!explicitApp)return null;
 const mixed=/同一(?:件|個|案|活動)|兩邊都送|重複|同一張.{0,8}(?:收據|發票|單據)/.test(z)&&/兩邊|重複|同一張|公所|另一(?:個|項|案)|多個/.test(z);
 const tag=t.match(/補助名義確認:(一般通案|另有專案|已核定給團體|不清楚)/)?.[1];
 const approved=tag==='已核定給團體'||/(?:已(?:經)?|原|原先|原來|當初).{0,12}(?:核定|核准)|核定是.{0,10}(?:協會|公會|團體)/.test(z)&&!/還沒核准|尚未核定|沒有核准|未核定/.test(z);
 const special=tag==='另有專案'||/青年(?:隊|提案)|個人專案|特別方案|特殊補助|特定計畫|另有.*(?:計畫|專案)/.test(z);
 const year=/未滿一年|未滿1年|立案.{0,8}(?:八|九|十|幾|[1-9]|1[01])個月/.test(z);
 const group=commerce?'商業同業公會':industry?'工業同業公會':assoc?(/社區發展協會/.test(z)?'社區發展協會':'協會'):'未立案團隊';
 const steps=[];
 if(!approved||explicitApp){
   if(tag!=='另有專案')steps.push(['一般民間團體補助，不用個人名義代替團體',
    (!local?'若是屏東縣一般民間團體補助，':'')+'相關要點第2、4點的申請對象是符合條件的民間團體，不以通案補助個人舉辦的活動。'+(year?'您說團體立案未滿一年，通案要點第5點列為不予補助，不能改成幹部名字送件來改變資格。':loose?'未立案的居民小隊，不能用發起人名字把活動改成這類團體補助；另有非營利方案時看其公告。':'依計畫公告查該團體是否符合資格，不因負責人有資格就能代替團體。')]);
   if(assoc||guild)steps.push(['代表簽署與個人當申請人不同',
     '以'+group+'申請時，申請單位填立案全名；依章程及有效任職文件有代表權的人，可在負責人欄按指定表件簽章。不能先用自己名字申請，再把個人獲核定的補助款當作團體收入；先核對申請人，不能靠改撥款帳戶改變原核定對象。核定案以原公告和核定函為準。通案一般附申請函、申請單位聲明書、計畫及經費概算；經公所陳報時依其程序。']);
   if(special||loose||tag==='不清楚')steps.push(['另有青年或個人專案，先取得計畫名稱',
    '先向原受理窗口確認公告接受的是個人、未立案團隊或立案團體，並確認申請人、領據、收款及能否合辦。未知道計畫名稱或公告，不能判定可申請，也不能將不同計畫的規則互套。']);
 }
 if(approved||account){
   steps.push(['核定給團體的款，不改匯前任或代表人私人帳戶',
    (approved?'先照原核定函確認受補助單位、戶名與撥款文件。':'以公告和核定函核對受補助單位、戶名與撥款文件。')+
    (assoc||guild?'團體收入不能存放於個人；公帳暫不能用，請原核定機關確認正式補正或帳戶異動方式，不先匯私人戶再轉手。':'若核定給立案團體，應按規定用團體帳戶；若屬另有個人專案，依該案規則。')]);
   steps.push(['領款收據、廠商發票和代墊，不是同一件事',
    '領款收據由獲核定的受補助單位按官方表件開立，負責人可依表件簽章；廠商發票依實際交易與原核定規定開立，別自行改抬頭。'+(/代墊|墊錢|私人卡|先付|先用私人/.test(z)?'前任或幹部先付的錢，由團體憑真實交易、支出憑證與合法授權另行審核；代墊不等於補助款應匯給個人。':'不能用個人領據取代團體應出具的正式收據。')]);
 }
 if(mixed)steps.push(['同一案及同一筆支出，先核對是否重複',
    '如適用縣府通案，第11點規定同年度同一申請案，不得向本府多個機關、單位重複申請；不要把轉報公所當成可以再送一份。不同計畫若允許分攤，要查各自書面規定，按實支及第8點列明各機關補助項目、金額；不能擅自用同一張單據把同一筆支出重複核銷。']);
 const opts=!tag&&!approved&&raw.length<330&&(special||loose||implicit&&!explicit)&&(!/一般民間團體的縣府補助|縣府一般民間團體補助/.test(z)||special);
 const summary=approved?'已核定給團體，不等於可以把款先匯私人帳戶；請原補助承辦確認正式補正。':
  tag==='另有專案'?'先看該專案公告允許何種申請人、誰可代表簽署，以及領款收據和入帳規定，不套用一般民間團體補助。':
  '先分清是團體通案或另有個人專案；同筆補助的申請人、代表簽署、領款收據與撥款不能混用。'+(account&&assoc?'團體名義核定才用協會帳戶，不能用理事長個人名義申請後再靠匯款改成協會補助。':'');
 return {direct:true,category:group+'｜補助申請名義、收據與收款',title:group+'：補助申請人、代表簽章和收款要分清',summary,steps,
 refs:[sameYearRule,sample,...(assoc?[accounts,receipts]:guild?[guildFinance]:[])],actions:[{label:'聯絡承辦',view:'contact',sub:''}],questionState:{focus:opts?'clarify':'compound'},
 ...(opts?{choiceHeading:'您目前問的是哪一種補助？',choices:[['一般民間團體補助','一般通案'],['另外公告的青年或個人專案','另有專案'],['已用團體名義獲核定','已核定給團體'],['還不清楚是哪一種','不清楚']].map(([label,key])=>({label,question:raw+'；補助名義確認：'+key+'。'}))}:{})};
}

if(typeof module!=='undefined'&&module.exports){module.exports=answer;module.exports.applicantAndPayee=applicantAndPayee;return;}
root.verifiedPingtungGrantApplicantAndStages=answer;
root.verifiedPingtungGrantApplicantAndPayee=applicantAndPayee;
})(typeof window!=='undefined'?window:globalThis);
