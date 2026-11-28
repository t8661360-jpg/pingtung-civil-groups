(function(root){
'use strict';
const law=(title,code)=>({title,source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+code});
const people=law('人民團體法第21、23、34、54條','D0050091');
const staff=law('社會團體工作人員管理辦法第3、4、7、8條','D0050096');
const accounting=law('社會團體財務處理辦法第3、5、7、11、19條','D0050097');
const volunteer=law('志願服務法第2、3、16條','D0050131');
const election=law('人民團體選舉罷免辦法第17、27條','D0050093');
const coopPersonnel=law('合作社組織編制及人事管理準則第4–7條','D0050198');
const coopCosts=law('合作社財務報表及經費處理準則第11、12、15條','D0050114');
const labor={title:'勞動基準法第2、9、22、23、70條',source:'https://laws.mol.gov.tw/FLAW/FLAWDAT0201.aspx?id=FL014930'};
const relationship={title:'勞動部：勞動契約認定指導原則',source:'https://laws.mol.gov.tw/FLAW/FLAWDAT01.aspx?id=FL092317'};
const cooperative={title:'勞動部（原勞委會）函：勞動合作社社員的勞動關係依個案認定',source:'https://laws.mol.gov.tw/FLAW/PrintFLAWDOC03.aspx?datatype=etype&no=FE255812'};
const grant={title:'屏東縣政府對民間團體補助經費作業要點（官方附件）',source:'https://portal.ptc.edu.tw/bulletin/attachment.php?a_sn=33872&b_sn=B114003910'};
const norm=s=>String(s??'').normalize('NFKC').replace(/\s/g,'');
const disabled=/信合社|信用合作社|農會|漁會|商業同業|工業會|職業公會|工會|公會|管委會|財團法人|清算|解散|選務|薪資所得稅|勞資調解|工傷|職災/;
const person=/工資|薪資|薪水|員工|勞工|工作人員|行政助理|專案助理|事務員|人事規定|聘|雇用|僱用|排班|打卡/;
const source=/補助|核銷|自籌|專案|憑證|決算|雜支/;
const money=/津貼|出席費|交通費|車錢|車馬費|交通票|搭車|客運票|車票|火車票|票證|報兩次|核兩次|差旅|補貼/;
const officer=/理事長|理事|監事|選任職員/;
const noHire=/沒(?:有)?(?:聘用|聘僱|聘任|聘他|雇用|僱用|聘)|不是員工|沒有工資|沒領工資|無工資/;
const which={worker:'受聘人員／工資',officer:'理監事執行職務的費用',volunteer:'志工服務的費用',both:'同時是理監事與志工'};
function parse(raw,prior){
 const t=norm(raw);if(!t||t.length>500||/^新題/.test(t))return null;
 const cleaned=t.replace(/(?:不是|而非|並非)(?:一般)?(?:勞動)?(?:協會|合作社)/g,'');
 if(disabled.test(cleaned))return null;
 const prefix=/^(?:更正(?:一下)?|補充(?:一下)?|確認|選擇|說的是|改成)/.test(cleaned);
 const follow=prior&&prefix&&/合作社|協會|員工|受聘|雇用|僱用|志工|理事|監事|車錢|票/.test(cleaned);
 const c=follow?prior:{};
 const assoc=/協會|社會團體|人民團體/.test(cleaned);
 const coop=/合作社/.test(cleaned);
 if(assoc&&coop)return null;
 const strict=person.test(cleaned), exp=money.test(cleaned), off=officer.test(cleaned), vol=/志工|志願服務/.test(cleaned);
 const assumed=!coop&&!assoc&&!c.org&&off&&vol&&exp;
 const org=coop?'coop':assoc?'assoc':c.org|| (assumed?'assoc':undefined);
 if(!org)return null;
 const fixed=/固定(?:來|排班|領|交通津貼|薪水|志工費|的?津貼)|每月.{0,5}(?:給|付|領|津貼)|工作津貼|固定津貼|固定.*出席費/.test(cleaned);
 const roles=/不確定|到底|不清楚|分不清|該列哪一種|是員工還是|員工.{0,12}或志工/.test(cleaned)&&!noHire.test(cleaned);
 const scope=/工作規則|30人|三十人|聘任|人事規定|勞基法|內部薪資/.test(cleaned);
 const paidWork=/志工費|固定津貼|車錢|行政助理|聘.*助理|幫忙.{0,8}領/.test(cleaned);
 if(!follow){
  if(org==='coop'){
   if(!(scope&&strict&&(/社員|理事|事務員/.test(cleaned)))||/信用|選舉|加班費怎麼算/.test(cleaned))return null;
  }else if(!(off&&(vol&&exp||strict&&(source.test(cleaned)||fixed||exp)||fixed&&exp)||roles&&(exp||strict)))return null;
 }
 const role=cleaned.startsWith('確認受聘人員')?'worker':cleaned.startsWith('確認理監事執行')?'officer':cleaned.startsWith('確認志工服務')?'volunteer':cleaned.startsWith('確認同時是理監事與志工')?'both':off&&vol&&(!strict||noHire.test(cleaned))?'both':vol&&!strict?'volunteer':off&&!strict&&!roles?'officer':undefined;
 const pick=!!roles&&!role&&!follow;
 const changedOrg=!!(follow&&org!==c.org);
 const expenses=(exp||!!c.expenses);
 const members=+(cleaned.match(/(\d{1,4})(?:名|位|個)社員/)?.[1]||0);
 const employees=+(cleaned.match(/(\d{1,4})(?:名|位|個)(?:已確認受僱(?:人員)?|受僱人員|員工|事務(?:和外勤)?人員|聘僱職員)/)?.[1]||0);
 const individual=/個案核准|主管機關.{0,7}(?:已同意|同意)|依規定核准/.test(cleaned);
 return {org,assumed,role:role||(changedOrg?undefined:c.role),roleUnknown:pick,unpaid:noHire.test(cleaned)||(!changedOrg&&!!c.unpaid),off:off||(!changedOrg&&!!c.off),vol:vol||(!changedOrg&&!!c.vol),fixed:fixed||(!changedOrg&&!!c.fixed),paidWork,expenses,work:strict||(!changedOrg&&!!c.work),project:source.test(cleaned)&&/補助|專案|核銷|自籌|雜支/.test(cleaned)||(!changedOrg&&!!c.project),forbidWage:/不(?:能|准|得|可)(?:補|報|核)?.{0,5}(?:薪水|薪資|工資)|只准補雜支/.test(cleaned)||(!changedOrg&&!!c.forbidWage),resign:/辭職|請辭|卸任|辭掉|辭理事|辭監事|辭去|前任/.test(cleaned),pending:/還沒.{0,4}開理事會|尚未開會|沒(?:有)?決議|尚未通過|只寫信/.test(cleaned),actualTransit:/火車票|客運票|交通票|一張票|同一張|車票|搭車的票/.test(cleaned),headCount:/30人|三十人|工作規則|算勞工|聘一位|一位聘任/.test(cleaned),count:members&&employees?{members,employees}:null,internal:scope,employeeContract:/定期契約|契約|報酬/.test(cleaned),approved:individual,availablePlan:/核定的志工計畫|備查.*志(?:願服務|工)計畫/.test(cleaned),follow};
}
const employment=['從實際工作判斷，不能用職稱或付錢名目替代','依勞動部指導原則，核對誰排班、指揮監督、考勤、怎麼付報酬、是否納入組織。固定給付可能涉及工資，不能光叫「補貼」就不是勞動契約；單有交通票也不能認定受僱。若確有勞動關係，依法處理給薪、勞動條件及適用的保險退休提繳。'];
const officerFees=['出席費和交通費不是固定工資','人民團體法第21條：理事、監事為無給職。依社會團體財務處理辦法第19條，因執行職務需要，可依法參照政府機關標準酌發出席費，或憑交通工具票證酌發交通費。先核實會議、出席和旅程及適用規定，不用每月固定交通津貼或工作津貼代薪。'];
const volunteerFee=['志工交通費按核定計畫和服務事實','適用志願服務法的運用單位，依第2、16條得酌補必要交通、誤餐等費用，並應辦理意外事故保險。志工服務不是以獲取報酬為目的；核對志工計畫、服務紀錄、經費及原始票證，不能用每月固定志工費掩蓋有薪工作。'];
const separated=['同一張票的同一次支出，只核一次','先辨認那趟路是理監事職務、志工服務，或兩者共用。各按適用的規則列明日期、活動、用途及核給依據；共用或分攤須有合理佐證，同一交通費合計不得重複請領。不同性質、符合標準的會議出席費應另外列，不把它當作再報同一張車票或當薪水。年度決算按實際費用分列，例如理監事會議出席費、理監事職務交通或志工計畫交通；附各自的會議、服務與付款紀錄，票證及分攤明細集中核對，不能把同一付款在兩個科目各記全額。'];
const paySupport=['工資是同一筆，資金來源分開列','留存聘僱決議、契約、出勤／工時、薪資明細和付款紀錄。總帳把實際薪資記一次，再在明細區分核准補助與自籌、分攤金額和原始憑證；若涉及兩個案，依補助機關的憑證及分攤規則，不複報。實際差旅另外依合資格項目和證明核算。年度決算列整筆依憑證確認的薪資支出，不按兩個來源重列；專案核銷則只列核准的分攤額。'];
const appointments=['有效離任後，另依程序聘用，不倒填','依選罷辦法第27條，理事或監事要書面請辭並經各自會議決議准辭；只是寄信尚未解任。離開選任職務後，私人符合資格仍須另經理事會依法遴聘，留存決議、正確起聘日，並核對法令及補助條件；不能用志工名義先付原本不許兼領的固定薪水。'];
const contract=['契約期間、工資和明細另外看','勞基法第9條原則上繼續性工作用不定期契約，臨時、短期、季節或特定性工作才得定期，不能只因計畫到期或按件計酬便省略核對。依法支付工資並提供各項計算明細（第22、23條），不要把員工工資混入職務公費。'];
function route(q,prior){
 const s=parse(q,prior);if(!s)return null;
 const make=(title,summary,steps,refs)=>({direct:true,category:s.org==='coop'?'合作社會務｜聘任與工作規則':'協會財務｜員工、理監事與志工',title,summary,steps,refs,staffExpenseContext:s,questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]});
 if(s.org==='coop'){
  const count=['30人算實際僱用的勞工，不是社員名冊','勞基法第70條，雇主僱用勞工達30人，要訂工作規則、報勞工主管機關核備並公開揭示。低於30人不因第70條必須送工作規則，但仍要依法處理僱用與工資。'+(s.count?(' 不能直接合計'+s.count.employees+'名確實受僱人員和'+s.count.members+'名社員。若兩群不重複、前者確實受僱且沒有其他受僱人員，'+(s.count.employees>=30?'已符合30人門檻。':s.count.employees+s.count.members<30?'即使這些社員全部實際受僱，也未達30人。':'至少需再確認'+(30-s.count.employees)+'名社員實際受僱才達30。')+'先逐人核對工作事實。'):' 排班管理、領固定薪、打卡等是要查的事實；社員自主接案或支領報酬，仍需按個案而不是按名稱分類。')];
  const policy=['合作社內部人事規定另由合作社主管機關備查','依合作社組織編制及人事管理準則第4–6條，理事會依規定遴選並通過聘任；內部組織、員額、人事管理規定（含薪給）由理事會提社員大會或社員代表大會通過，報合作社主管機關備查，修正也一樣。這不是勞基法30人工作規則的核備。'];
  const coopOfficer=['理事兼任、工資、職務公費分開','依同準則第7條，理事原則不得兼任聘任職員，特殊情形須主管機關同意。'+(s.approved?' 你提個案核准，仍要核對對象、期間和核准範圍，不是全部理事都能兼任。':'')+' 依法聘任的工資和理事職務費不是一筆。合作社經費準則第11、12、15條：理監事無給；駐社辦公或監查得酌給公費，已領這項公費不得再領出席費；費用基準由社務會訂定，提社員或代表大會通過並報合作社主管機關備查。'];
  return make('合作社員工工作規則與內部人事分開','先按實際工作關係分出社員與受僱勞工。勞基法工作規則、合作社內部聘任與薪資制度是兩件事，送核備／備查的窗口也不同。',[employment,count,policy,...(s.off?[coopOfficer]:[]),...(s.employeeContract?[contract]:[])],[labor,relationship,cooperative,coopPersonnel,...(s.off?[coopCosts]:[])]);
 }
 if(s.roleUnknown){
  const a=make('先確認是受聘、理監事職務還是志工服務','固定來幫忙或只領車錢，不足以判定這筆帳。先查是否受僱、當天是什麼活動及給付用途；同一張票不要重複報。',[],[labor,staff,accounting,volunteer]);
  return {...a,choiceHeading:'當天是哪一種工作或費用？',choices:Object.entries(which).map(([k,label])=>({label,question:'確認'+label.replace(/／.*/,'')}))};
 }
 const role=s.role;
 const noPay=s.unpaid||role==='volunteer'||role==='both'||role==='officer';
 const lead=role==='worker'&&!s.unpaid?'如果已確認是合法受聘的員工，依工作事實列工資與必要費用，區分薪資和實報支出。':noPay?'依你說的職務和志工服務來分，這不是用固定津貼給薪。同一張票、同一趟交通支出不能報兩次。':s.fixed?'不能把選任理事或監事當成有薪行政助理，也不能每月用固定交通或志工津貼當薪水。':s.resign?'先確認請辭已由有權會議准辭，再另行聘任；工資、實際差旅和補助分攤分開處理。':'選任理事、監事不可同時當協會聘僱的工作人員。先辨別實質職務，再分工資、出席費和交通。';
 const app=['聘任和薪資標準的核准不是同一件事','社會團體工作人員管理辦法第3、4、7、8條：現任選任職員不得作聘僱工作人員；聘任由理事會依法遴選通過。薪給、福利、保險、資遣退休等由理事會訂定，提經會員或會員代表大會通過；服務、差假、考核與獎懲由理事會訂定。'];
 const scope=['補助不准薪資，就不要改列雜支',''+(s.forbidWage?'你說原核定只補雜支、明禁薪資。該案不能用補助付工資，也不能改標成雜支、交通或志工費。真有合法工資義務仍應依法給付並另尋合法財源。':'先看原補助核定是否准列該薪資或差旅、額度、分攤及事前變更程序。不要推定任何一種補助都可支付，未核定的項目不能自行改列。')];
 const steps=[...(!noPay?[app,employment]:[]),...(!noPay&&s.resign?[appointments]:[]),...(s.off||role==='officer'||role==='both'||s.fixed?[officerFees]:[]),...(s.vol||role==='volunteer'||role==='both'?[volunteerFee]:[]),...(s.expenses||s.actualTransit?[separated]:[]),...(!noPay&&s.project?[scope,paySupport]:[]),...(!noPay&&role==='worker'&&!s.project?[paySupport]:[])];
 return make(noPay?'志工費、理監事費與薪資分開核對':'協會聘任與志工或理監事費用分開',(s.assumed?'以下先按一般協會說明；如是合作社或其他團體，請補充。':'')+lead,steps,[people,staff,accounting,...(s.vol||role==='volunteer'||role==='both'?[volunteer]:[]),...(!noPay?[labor,relationship]:[]),...(!noPay&&s.resign?[election]:[]),...(s.project?[grant]:[])]);
}
if(typeof module==='object'&&module.exports)module.exports={route};
else root.verifiedStaffVolunteerCost=route;
})(typeof window==='object'?window:globalThis);
