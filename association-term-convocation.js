(function(root){
'use strict';
const ref=(title,p)=>({title,source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+p});
const law=ref('人民團體法第25、26、32、54條','D0050091');
const ele=ref('人民團體選舉罷免辦法第5、12、21、28條','D0050093');
const rules=ref('人民團體會務輔導辦法第10、15條','D0020094');
const trade=ref('商業團體法第27、28、67條','D0050100');
const tradeRules=ref('商業團體法施行細則第45條','D0050101');
const trans={title:'內政部函：依法按期改選時前後屆任期銜接',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256713'};
const guildTrans={title:'內政部函：商業團體屆滿未改選及臨時會的個案',source:'https://www.moi.gov.tw/News_Content.aspx?n=14143&s=219453'};
const clean=s=>String(s??'').normalize('NFKC').replace(/\s+/g,'');
const stage=/召集階段確認:(任內|已到期|已改選|仍不確定)(?=[。；;]|$)/;
const other=/(?:不是|並非)(?:在問|指|問)?(?:一般)?(?:協會|社會團體|商業同業公會|工業同業公會|合作社)(?=[，,；;。]|$)/g;
function route(q){
 const raw=String(q??'').trim(),t=clean(raw);
 if(!t||t.length>690)return null;
 const z=t.replace(other,'');
 const named=/協會|社會團體|人民團體/.test(z);
 const assumed=!named&&!/公會|工業會|商業會|銀行|農會|聯合會/.test(z)&&/理事長/.test(z)&&/臨時會員大會/.test(z);
 const type=/商業(?:同業)?公會/.test(z)?'trade':named||assumed?'assoc':'';
 const tradeCompare=type==='trade'&&/商業團體.{0,10}一般協會.*(?:同|一樣|不同)/.test(z);
 if(!type||/合作社|信合社|信用社|工業(?:同業)?公會|工業會|工會|農會|漁會|牙醫師公會|基金會|管委會/.test(z))return null;
 if(type==='trade'&&!tradeCompare&&/協會|社會團體/.test(z))return null;
 const extend=/改選.{0,8}(?:展延|延後|延期|延長)|(?:展延|延後|延期|延長).{0,8}(?:辦)?改選/.test(z);
 const meeting=/臨時(?:會員|代表)?大會|(?:會員|會員代表)大會|連署.{0,12}(?:開|召)|發(?:開會)?通知|召集|首(?:次|場)理事會|第[一1](?:次|場)理事會/.test(z);
 const term=/任期|任滿|屆滿|到期|逾期|原任|舊理事長|原理事長|上(?:一)?任理事長|已(?:經)?改選|重選/.test(z);
 const lateRequest=/五分之一|1\/5|1分之5|監事會.{0,6}(?:發函|函請)|理事.{0,4}過半.{0,6}連署/.test(z)&&/連署|請求|發函|函請/.test(z)&&/臨時|大會|召集/.test(z);
 const authorityAsk=/誰.{0,10}(?:簽|通[知告]|召|當主席)|簽通知|發通知|先.{0,4}通知|以.{0,10}名義|可(?:以|否).{0,10}(?:召|通知|開|主持)|能.{0,8}(?:召|通知|開|擔任主席)|自行|自己|可不可以|適用/.test(z);
 const first=/(?:首(?:場|次)|第[一1](?:次|場))理事會/.test(z);
 const actualElected=/(?:已(?:經|依法|按期)?改選出|已(?:經|依法|按期)?選出|已(?:經|依法|按期)?完成改選)|已經改選|已改選.{0,12}(?:理事|還沒開|尚未)/.test(z)&&!/(?:未|還沒|沒有)改選/.test(z);
 const termOver=/(?:任期|理事長|理監事|原任).{0,12}(?:屆滿|滿了|已到期|已經到期|已經過期|過期)|已(?:經)?到期/.test(z)&&!/(?:租約|租金|契約).{0,5}已(?:經)?到期/.test(z);
 const uncertain=/(?:不清楚|不知道|不確定|還不曉得).{0,22}(?:任期|改選|到期|屆滿)/.test(z);
 const selected=z.match(stage)?.[1];
 const signed=/租約|承租|續租|簽約|代簽|對外代表|授權簽|簽契約/.test(z);
 const onlyExtend=extend&&(!meeting||/(?:不是|並非|不在)問(?:開會|召集)|只問.{0,14}(?:改選|展延)/.test(z))&&/多久|最[多長]|幾個月|自行|自己|可不可以|怎麼辦|可以.{0,4}(?:延期|展延|延後)/.test(z)&&!signed;
 const signingDuringExtension=type==='assoc'&&extend&&term&&signed&&/誰有權|能先決定|誰能代簽|代表權|誰可以簽/.test(z);
 if(!onlyExtend&&!lateRequest&&!signingDuringExtension&&!(meeting&&(term||extend||uncertain))&&!selected)return null;
 if(!onlyExtend&&!authorityAsk&&!lateRequest&&!signingDuringExtension&&!first&&!selected&&!uncertain)return null;
 if(!onlyExtend&&signed&&!first&&!lateRequest&&!signingDuringExtension&&!/臨時|會員大會|召集/.test(z))return null;
 if(/除名|開除會員|罷免|國際性|章程修正.{0,12}生效/.test(z)&&!lateRequest)return null;
 const extension=['改選展延要核准，最多三個月','人民團體選舉罷免辦法第21條要求在任期屆滿前一個月內改選。確有困難，向主管機關申請核准延長，期限不得超過三個月；申請中不是已核准。天災等不可抗力須另查主管機關公告。延長改選時程，不是只看「已核准」三字，就能判定原任對每場會議或新契約都還有權。'];
 const convene=['依法召集，不是會員連署後自己發通知','第25條的臨時會員（代表）大會，須由理事長依法召集。理事會認為必要、會員（代表）五分之一以上請求或監事會函請，是可發動臨時大會的情形，不是把召集權交給連署的會員。第26條通常在15日前通知各會員（代表），緊急臨時會議有開會前一日送達的例外，並報請主管機關派員列席。'];
 const petition=['連署或監事函已送達，另有30日的處理時點','依人民團體會務輔導辦法第15條，書面連署或監事會發函以雙掛號交寄理事長，取得回執，報主管機關備查。收到後30日內仍未召開完畢，主管機關得依人民團體法第32條指定理事一人召集。保留連署、回執與實際收件證明。若理事長失聯、資料退回或大會不能依法召集，先請主管機關確認第32條程序，不自己推算收到的日期或在未獲指定時先發通知。'];
 const chairs=['召集通知和當天誰主持，要各自確認','查適用法規、有效章程、主管機關核准函或指定書。即使以往由原理事長主持，逾期未改選或原任不在，也不能只憑舊圖記、頭銜或核准改選展延，就認定可用其名義。主管機關指定的是召集人，不是替團體選出新理事長。'];
 const agenda=['改選與租案先列清楚，不臨時加案','要同場處理改選及租案，先把召集權、通知議程、選舉名冊與會議權限各自核對。理監事選舉還有第5條名冊審定及閱覽；不能因急件就自行加上改選或把每一項租案都當成大會職權。'];
 const firstBoard=['已選出理監事，現在問的是新屆第一次理事會','依第12條，通常在大會閉會後第7日至第15日分別召開理事會、監事會，由原任理事長及原監事會召集人各自召集；原任逾期不召集，才有得票最多者或主管機關指定的備援。來不及開，得報請主管機關核准延長。若原任已失聯或無法召集，帶大會日期及選舉紀錄請主管機關確認接續安排，不由會員自行發首會通知。'];
 const signing=['簽租約和誰發首會通知不是同一項授權','不要只憑備查未完成、舊圖記或保管存摺，就認定誰可以代簽。要看章程、改選時間、現任代表、必要的決議與書面授權；已做法人登記還要核對法人登記。人民團體法第54條規定負責人名冊等異動循程序備查，不由一個收件日單獨決定私法簽約效力。若無法及時查清，先保留原租約及到期資料，向主管機關核對，不先用舊名義承諾。'];
 const actions=[{label:'聯絡承辦',view:'contact',sub:''}];
 if(onlyExtend)return {direct:true,category:'人民團體選舉｜改選展延',title:'理監事改選需核准才可延期，最多三個月',summary:'不能自行決定延期。確有困難須申請主管機關核准，期限最多三個月；不是不用改選。',steps:[extension],refs:type==='trade'?[tradeRules,ele]:[ele],actions,questionState:{focus:'compound'}};
 if(type==='trade')return {direct:true,category:'商業同業公會｜過渡與臨時大會',title:'商業同業公會任期屆滿：依商業團體規定處理臨時大會',summary:'商業同業公會依商業團體法第27條辦理，不能直接套一般協會。內政部曾就同類的逾期改選個案，指原任理監事在依法產生新屆及選出新理事長前仍行使職權；仍須核對本案主管機關通知、召集決議及章程。',steps:[
  ['法定召集途徑和原任過渡，是兩個問題','商業團體法第27條，通常經理事會決議、由理事長召集。理事會認為必要、會員代表五分之一請求或監事會函請可召臨時會；不能依法召集，主管機關得指定理事一人。第28條規範通知。不要由連署人自行發通知。'],
  ['內政部過去只就商業團體個案說明','內政部70年5月12日函要求該公會依法開臨時大會辦理改選，並說明原任過渡。這不是對一般協會、所有公會或每份私法契約的概括授權；先由公會核對主管機關實際函文。'],extension
 ],refs:[trade,tradeRules,ele,guildTrans],actions,questionState:{focus:'compound'}};
 if(signingDuringExtension&&!first&&!lateRequest&&!/臨時|會員大會|召集/.test(z))return {direct:true,category:'協會會務｜改選展延與急件簽署',title:'先看任期到期日，再分改選展延與租約授權',summary:'若目前還在任期內，不把「月底才到期」當成已逾期。改選延長還沒核准，也不能先當成已展延；租約能不能簽，要另查團體決議、章程和現任代表的權限。',steps:[extension,['接近到期的租案，先看是否已有合法授權','把理事會等內部決議、監事會的監督、對外簽字三件事分開。原理事長只有在有代表權且授權範圍內才可代表。若權限有疑義，向主管機關核對現況及改選安排，不先用舊印章或口頭同意。'],signing],refs:[law,ele],actions,questionState:{focus:'compound'}};
 if((first&&actualElected)||selected==='已改選')return {direct:true,category:'協會改選｜第一次理事會及過渡權限',title:'理監事已選出，第一次理事會的召集與簽約權分開',summary:'通常由原任理事長召集第一次理事會；原任逾期不召集，才由得票最多的理事或經主管機關指定的理事接續。'+(signed?'誰可代簽租約，要另核代表與授權。':''),steps:[...(/原理事長已經改選|理事長已經改選/.test(z)&&!/改選出理事|已選出理事/.test(z)?[['先確認已選出的是理事，還是理事長','若實際只是大會已選出理監事，下面是首次理事會的程序。若已另開理事會選出理事長，請以正式選舉和會議紀錄核對代表權，不重走第一次理事會的分支。']]:[]),firstBoard,...(signed?[signing]:[]),['不是所有逾期未改選都等於正常交接','第28條以首次理事會為新屆任期起算，內政部原新屆銜接函的前提是已依法按期改選；不能外推成任何屆滿未改選都由原任照常決定。']],refs:[law,ele,trans],actions,questionState:{focus:'compound'}};
 const hasKnown=selected||termOver||/正在任期|尚在任期|還沒到期|未屆滿|月底到期|這週到期|明天到期/.test(z)||actualElected;
 const shouldChoose=(uncertain||!hasKnown)&&!selected&&!lateRequest;
 const summary=lateRequest?'會員連署是請求召開，不是自行發通知。理事長收到書面連署逾30日仍未依法開完，可備妥回執向主管機關反映，請依規定指定理事召集。':
  selected==='任內'?'如果目前仍在有效任期，原則上由有權理事長依法召集。會員連署不是自己發通知；是否符合章程和法定通知仍要查。':
  selected==='已改選'?'已選出理監事時，要先分清您是在問會員大會，還是新屆第一次理事會。選罷辦法第12條的原任召集只適用第一次理事會，不等於可替所有會議召集。':
  termOver||selected==='已到期'?'任期已屆滿而未完成改選，不要只用原理事長名義發通知。先查章程、改選核准與主管機關有無指定召集人；不能依法召集可請主管機關依第32條處理。':
  '改選展延與臨時大會誰能發通知，是兩件事。先核對發通知當下的有效任期、展延核准函和章程；不能依法召集時，可走主管機關指定。';
 const steps=lateRequest?[petition,convene,chairs]:[convene,chairs,extension,petition];
 if(signed||/同次|兩案|順便改選/.test(z))steps.push(agenda,...(signed?[signing]:[]));
 return {direct:true,category:'協會會務｜任期屆滿與臨時會員大會',title:'任期屆滿或改選延期，分開查誰有權召集',summary:(assumed?'若是一般協會，':'')+summary,steps,refs:[law,rules,ele],actions,questionState:{focus:shouldChoose?'clarify':'compound'},...(shouldChoose?{choiceHeading:'目前進行到哪個階段？',choices:[['任期還沒屆滿','任內'],['已到期，還沒改選','已到期'],['已改選，還沒開第一次理事會','已改選'],['仍不確定','仍不確定']].map(([label,key])=>({label,question:raw+'；召集階段確認：'+key+'。'}))}:{})};
}
if(typeof module==='object'&&module.exports)module.exports=route;
else root.verifiedAssociationTermConvocation=route;
})(typeof window==='object'?window:globalThis);
