(function(root){
'use strict';
const src=(title,p)=>({title,source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+p});
const socialRules=src('社會團體財務處理辦法第5、7、8、20、21、22條','D0050097');
const guildRules=src('工商團體財務處理辦法第8、31條','D0050106');
const coopRules=src('合作社財務報表及經費處理準則第5條','D0050114');
const coopLaw=src('合作社法第35、36條：應備簿冊與年度書表','D0050112');
const handover=src('人民團體會務輔導辦法第18條：改選移交清冊','D0020094');
const grantLink={title:'屏東縣政府對民間團體補助經費作業要點第8、10點（官方公告附件）',source:'https://portal.ptc.edu.tw/bulletin/view.php?sn=B114003910'};
function route(q){
 const raw=String(q??'').trim(),t=raw.normalize('NFKC').replace(/\s+/g,'');
 if(!t||t.length>535)return null;
 if(/投票|開票|參選|候選人|選務/.test(t)&&/監票|唱票|記票|發選舉票/.test(t)&&!/統一發票|電子發票|開(?:立|具)發票|會計憑證|收支憑證|支出(?:憑證|傳票)|年度決算|報帳|核銷|會計帳/.test(t))return null;
 const z=t.replace(/(?:不是|並非|不屬於)(?:一般|原本的)?(?:信用合作社|工商(?:同業)?公會|商業(?:同業)?公會|工業(?:同業)?公會|公會|合作社|協會)(?=$|[，,；;。])/g,'');
 if(/信用合作社|信合社|農會|漁會|工會|基金會|財團法人|管委會|政治獻金|公益勸募/.test(z))return null;
 const guild=/工商(?:團體|(?:同業)?公會)|商業(?:同業)?公會|工業(?:同業)?公會/.test(z);
 const coop=/合作社/.test(z);
 const assoc=/協會|社會團體|社團法人/.test(z);
 if(!(guild||coop||assoc))return null;
 if(guild&&(coop||assoc)&&!/(?:不是|並非)(?:問)?(?:一般)?協會/.test(t))return null;
 const compare=coop&&assoc&&/(?:跟|與|和|比照).{0,8}協會|協會.{0,8}(?:一樣|相同|不同)|一不一樣/.test(t);
 if(coop&&assoc&&!compare)return null;
 const name=guild?(/商業/.test(z)?'商業同業公會':/工業/.test(z)?'工業同業公會':'工商同業公會'):coop?'一般合作社':/社區發展協會/.test(z)?'社區發展協會':'協會';
 const file=/(?:原始|原本|舊|紙本|電子|支用|支出)?(?:發票|憑證|憑據|單據|收據)|收支傳票|傳票|總帳|日記簿|會計帳冊|舊帳冊|每月報表|月報|資產負債表|簿冊|決算報表|(?:紙本|電子)正本|掃描檔/.test(z);
 if(!file)return null;
 const facts=z.replace(/(?:沒有|沒|並無)(?:要|想)?(?:報|申請|領)?補助(?:案|款)?|(?:不是|並非)(?:問|要|在問)?(?:補助案|補助|保存年限|銷毀)|(?:沒|沒有|不會|不要|不打算)(?:要|想)?銷毀/g,'');
 const auditor=/監事會.{0,10}(?:查|看|調閱)|(?:請|由|讓)監事會.{0,10}(?:查|看|調閱)|監事(?:想|要|來)(?:查|看)/.test(facts);
 const noDestroy=/沒(?:有)?要銷毀|不會銷毀|不是問保存年限|不是問.{0,5}銷毀/.test(z);
 const life=/保存|保留|保管|留多久|留幾年|留.{0,5}(?:年|多久)|留存|(?:三|五|十|3|5|10)年|從哪(?:天|日|時)|何時起算|開始算/.test(facts);
 const destroy=/銷毀|銷燬|掃描|刪(?:掉|除|檔)|丟掉|粉碎|清掉|掃了|不能銷/.test(facts)&&!noDestroy;
 const pending=/未結|還沒結|沒結案|等答覆|查核中|正在查核|還在查核|還在審查|補助在審查|核銷.{0,5}(?:沒結束|未結束)|還沒核銷完|已核銷一半|打官司|訴訟|借款在法院/.test(facts);
 const subsidy=/補助|核銷|專案.*公所/.test(facts);
 const hand=/離任|前任|上任|上一任|換會計|換財務|前一任|前財務|會計交接|移交|交給誰|要接|該接/.test(facts);
 const caseUnit=/改選|新任理事長|換理事長|剛換理事長/.test(facts);
 const publicAsk=/公開|會員(?:可|要|能)|群組|給會員/.test(z);
 if(!(life||destroy||auditor||hand&&subsidy&&pending))return null;
 if(/要先審|誰先審|要附什麼|稅籍登記|稅號|稅務查核|多少會費|選舉名冊|理監事會議出席費|捐贈物資漏報/.test(facts)&&!(life||destroy&&file))return null;
 const doc=t.match(/財務檔案確認:(收支憑證|年度書冊|未結或查核|不知道)/)?.[1];
 const ledgers=/帳冊|帳簿|總帳|日記簿|傳票|憑證|憑據|發票|收據|單據/.test(facts);
 const closure=/年度(?:預)?決算|資產負債表|年度預算|財產(?:清冊|登記簿)/.test(facts);
 const reports=/月報|每月報表|日報/.test(facts);
 const auditOnly=auditor&&noDestroy&&!life;
 const dates=assoc&&!coop&&!guild?'依社會團體財務處理辦法第21條，會計帳簿、會計憑證與會計報告表冊，都是自年度決算程序辦理終了後起算，至少保存十年；不是發票開立、購買或會計交接那一天起算。先查該年度決算實際完成日期。':
 guild?'工商團體財務處理辦法第31條按文件分類，不能都從一個日期掃描後銷掉，也不要把一般協會的起算規則直接套上。':
 '合作社財務報表及經費處理準則第5條將會計檔案整理、保管列為會計事務；合作社法第35、36條另規定備置簿冊和年度書表。這些條文沒有給每種原件同一個銷毀年限，不能把協會十年或工商公會月報三年套到一般合作社。';
 const steps=[];
 if(!auditOnly)steps.push(['先按團體類型及文書判斷保存年限',dates]);
 if(guild){
  steps.push(['年度預決算、正式支出憑證與月報分開',
   '年度預決算案、資產負債表等永久保管；一般收支帳冊、支出傳票、憑證、日記簿及總分類帳保管十年；臨時憑證及短期借貸等五年；日報表、月報表與留底三年。不要把正式支用憑據當臨時憑證或月報。']);
  steps.push(['屆期後經監事會點驗，掃描不等於可銷毀',
   '只有已屆規定年限的檔案，經監事會點驗後才可銷毀；不是理事長或監事本人同意即可。特殊原因延長，由理事會、監事會通過並報主管機關備查。查核或爭議所需的檔案，先保留並核對適用程序，不只憑掃描就丟正本。']);
 }else if(coop){
  steps.push(['還在查核或尚未確定適用規範，先留正本與電子檔',
   '請原登記主管機關，以及該案補助或稅務承辦（如適用），按合作社種類、實際文件及年度說明規則；不要因掃描、舊會計說法或他團體年限逕行刪除。'+(compare?'協會不同：依社會團體財務處理辦法第21條，自年度決算程序終了後至少十年，未結事項和永久文件例外。':'')]);
 }else if(!auditOnly){
  steps.push(['還沒結案或屆期，不要先刪原件',
   '不到十年不可銷毀；應永久保存的檔案，及未結會計事項相關資料，不適用屆期就銷毀。'+(pending?'您提到仍有核銷、查核或爭議，與該案相關的紙本正本、原電子憑證或唯一可讀掃描檔，先不要刪除、粉碎或丟棄。':'若有核銷、查核、借款或訴訟未結案，先保留相關檔案。')+'已到期且無例外，由監事會點驗後才可以銷毀，不是監事本人同意就夠。特殊需要延長，可經理事會與監事會或理監事聯席會議通過。']);
 }
 if(subsidy)steps.push(['正本已交補助機關，留能追查的團體存檔',
  '按核定函與補助承辦要求查原件應由誰保存；若已送出，在團體檔案保存可讀副本或電子憑證、傳票或編號、送件清單、收文號／回執、交件日期及原件所在。這些不是一律能取代正本的規定；原件不在時，向原補助承辦確認認可的留存或補正做法，未結案先不刪。']);
 if(hand||caseUnit)steps.push(['前任手上的資料，移交到團體管得住的地方',
  (caseUnit&&!coop&&!guild?'若是每屆改選的正式交接，依人民團體會務輔導辦法第18條造清冊，新任理事長就任後會同監交人於15日內接收。':'一般會計或工作人員交接，依職務與內規交給接任且有權處理的團體財務人員，勿把正式改選的15日套到所有離職。')+
  '分列原件、電子檔、保管位置、帳冊對應及未結項目。從個人手機妥為交付必要的團體檔案，先讓接任人驗收可讀、完整及已備份，再依團體程序處理私人裝置上的副本；不要求交個人手機、密碼或上傳小屏。']);
 if(assoc&&!coop&&!guild&&(auditor||publicAsk))steps.push(['監事會查帳與會員拿走原始資料是兩件事',
  '依第22條，由監事會在定期監事會議，必要時在臨時監事會議依職權查核。請財務人員備妥原始發票或單據及傳票、註記待查項目，在受控方式下給監事會查閱。第20條要求財務收支定期公告，並不因此要把所有原始憑證或個資貼到會員群組。會員若要調閱，另外核對章程、查閱範圍及涉及個資的處理方式。']);
 if(!steps.length)return null;
 const rawKnown=ledgers||closure||reports;
 const opts=!doc&&raw.length<300&&(coop&&!compare&&!pending&&!rawKnown||guild&&/資料|文件/.test(facts)&&!closure&&!reports&&!/傳票|憑證|月報/.test(facts));
 let summary=auditOnly?'您只問監事會查原始發票，不是補助或銷毀。可由團體財務人員備妥憑證給監事會依職權查核，不必把原始檔案貼到群組。':
  coop?'一般合作社的檔案規則不同，不直接套協會或工商公會的年限；仍在查核或未結案，請先保留。':
  guild?'工商公會文件分為永久、十年、五年和三年；掃描後不能一律銷毀。':
  '協會的會計憑證從年度決算程序辦理終了後起算，至少保存十年。'+(pending?'未結案相關文件先不要刪掉。':'發票日期不是起算日。');
 if(guild&&doc==='年度書冊')summary='您選的是年度預決算或資產負債表：依第31條永久保管，不能當月報、到三年就清掉。';
 if(guild&&doc==='收支憑證')summary='您選的是日常收支憑證：正式支出傳票、憑證與日記簿原則保管十年；臨時憑證另有五年分類，先核對文件種類。';
 if(doc==='未結或查核')summary='仍在查核、核銷或爭議中的相關文件先保留；不要因一般年限屆滿就刪除唯一原始憑證。';
 return {direct:true,category:name+'｜會計憑證保存與查核',title:compare?'一般合作社與協會：分開看憑證保管':name+(auditOnly?'：監事會查原始憑證，和公開文件不同':'：會計憑證的保存年限、交接和銷毀'),summary,steps,
  refs:[...(guild?[guildRules]:coop?[coopRules,coopLaw,...(compare?[socialRules]:[])]:[socialRules]),...(hand&&caseUnit?[handover]:[]),...(subsidy&&/屏東|本縣|縣府|縣政府|公所/.test(facts)?[grantLink]:[])],actions:[{label:'聯絡承辦',view:'contact',sub:''}],questionState:{focus:opts?'clarify':'compound'},...(opts?{choiceHeading:'需要辨認哪一類資料？',choices:[['日常收支憑證','收支憑證'],['年度財務書冊','年度書冊'],['還在查核或未結案','未結或查核'],['不確定文件種類','不知道']].map(([label,key])=>({label,question:raw+'；財務檔案確認：'+key+'。'}))}:{})};
}
if(typeof module==='object'&&module.exports)module.exports=route;
else root.verifiedFinanceRecordRetention=route;
})(typeof window==='object'?window:globalThis);
