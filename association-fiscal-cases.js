(function(root){
'use strict';
const county={title:'屏東縣政府對民間團體補助經費作業要點第3、5、8、8-1、10、11點',source:'https://portal.ptc.edu.tw/bulletin/attachment.php?a_sn=33872&b_sn=B114003910'};
const invoice={title:'統一發票使用辦法第24條：記載事項錯誤',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=G0340082&flno=24'};
const transfer={title:'財政部台財稅字第09900359720號令：未轉售的受贈品公益轉贈',source:'https://law-out.mof.gov.tw/LawContent.aspx?id=GL008678'};
const income={title:'教育文化公益慈善機關或團體免納所得稅適用標準第2、3條',source:'https://law-out.mof.gov.tw/LawContent.aspx?id=FL005944&media=print'};
const charity={title:'財政部台財稅第841607554號函：銷售與慈善救濟團體義賣',source:'https://law-out.mof.gov.tw/LawContent.aspx?id=GL003572'};
const norm=q=>String(q??'').trim().normalize('NFKC').replace(/\s/g,'');
const adjustment=['不要先拿講師費付未核定的餐費，再期待補報','縣府通案要點第5點以核定的項目為準，旅遊性質餐費另屬不予補助項目。講師更換與預算改列餐費是兩件事。先拿核定函、原經費表及變更說明，向原核定補助單位確認是否准許及如何事前申請；若已花，分開列出並請承辦確認可否補正，不要自己把它填成原本核定的講師費。第10點對挪用、虛報等有追繳等規定。'];
const timing=['計畫執行完竣後20日內辦核銷','依縣府通案要點第8點，備核准補助文件影本、領款收據、實際支用明細表及各項支用單據。成果、照片及設備納產證明依核定案補齊；有特別方案規定，按第3點及個別核定函，不假定可以跨年度保留。'];
const rest=['補助有剩：向原核定補助單位確認繳回','依第8點之一，剩餘補助應繳回。先把各來源剩款在支用表分開，再向原核定補助單位確認退回金額、繳款方式及證明，不匯到未經確認的帳戶，也不要用其他來源收支沖抵。'];
const personInvoice=['發票開成個人抬頭：不要自行改字或逕送','先確認真正買受人和核定函要求。若實際是協會支出且統一發票的應記載事項確實寫錯，依統一發票使用辦法第24條請原開立店家依法另開，保留更正與交易紀錄；若確實是個人交易，不可改稱協會買受。若是人員先代墊、無法更正或有別的憑證，拿單據和支出事實請原承辦確認可否補件，不保證都能核銷。'];
function grant(q){
 const raw=String(q??'').trim(),t=norm(q);
 const explicitGrant=/補助/.test(t);
 const assumedGrant=!explicitGrant&&/機關.{0,5}認列/.test(t)&&/報兩份|同張發票/.test(t);
 if(t.length>325||(!explicitGrant&&!assumedGrant)||!/屏東|屏縣/.test(t)||/合作社|信合社|公司行號|中央本來不是縣府|解散|取消活動|活動(?:已)?取消|停辦|縣府(?:已)?撤銷/.test(t))return null;
 if(!/協會|民間團體|社區發展|屏東縣府補助|屏東縣政府補助/.test(t))return null;
 const duplic=/重複(?:用|報|認列|核銷|申請)|同(?:一|張|筆|樣).{0,10}(?:發票|單據|憑證|支出)|報兩(?:份|邊)|兩(?:家|個)?(?:單位|機關)|另一(?:個)?機關|二個以上機關/.test(t);
 const amend=/講師費|餐費|餐點|便當|科目|項目/.test(t)&&/改(?:列|用|成|付)|轉(?:成|列|用)|轉為|挪用|變更|先花|事後補/.test(t);
 const docs=/個人(?:的)?(?:名義|抬頭|名字|姓名)|發票.{0,8}(?:抬頭|統編|填錯|打錯|開錯|開(?:成|作)?個人)|代墊/.test(t);
 const limit=/核銷|結報|完竣|結案/.test(t);
 const left=/剩款|餘款|剩餘|剩.{0,4}(?:補助|款項)|退給|繳回|退回|有剩/.test(t);
 if([duplic,amend,docs,limit,left].filter(Boolean).length<2&&!duplic)return null;
 const same=/兩個都是屏東縣府單位|兩個縣府單位|同為縣府|縣府內兩個/.test(t),distinct=/另有(?:中央|外部機關)|另一.{0,8}(?:中央|部會)|中央與縣府|不同層級/.test(t);
 const scope=same?'你已說兩邊都是縣府單位。同年度同一案件，依縣府要點第11點只能向本府一個機關或單位提出，不可重複申請。':distinct?'你已說另一筆是中央或外部機關的補助。先查兩方計畫是否允許共同補助；若可以，第8點要求分列各機關補助項目及金額。':'先分兩種：同年度同一案，依第11點不能向兩個屏東縣府機關或單位重複申請；不同層級機關如各自規定允許共同補助，第8點要求分列各機關的補助項目及金額。';
 const duplicate=['同一筆支出不能在兩邊重覆核銷',scope+' 不可拿同張發票向兩邊各報整筆；同一原始憑證可否依法分攤、怎樣註記及存放，先依各核定機關規定確認，不能只憑有兩筆補助就認為可以。'];
 const opts=duplic&&!same&&!distinct&&t.length<245&&/機關|兩邊|兩份/.test(t);
 const summary=duplic?((assumedGrant?'如果你問的是屏東縣府補助核銷：':'')+'不要拿同一筆支出向兩邊重覆請款。先確認各自補助來源和核定內容。'):'先按原補助機關的核定函，分開處理'+[...(amend?['用途變更']:[]),...(limit?['核銷']:[]),...(left?['繳回剩款']:[]),...(docs?['憑證補正']:[])].join('、')+'。';
 return {direct:true,category:'屏東縣補助｜來源、變更、憑證及核銷',title:'補助核銷：先分清哪個機關補哪筆支出',summary,
  steps:[...(duplic?[duplicate]:[]),...(amend?[adjustment]:[]),...(limit?[timing]:[]),...(left?[rest]:[]),...(docs?[personInvoice]:[])],refs:[county,...(docs?[invoice]:[])],questionState:{focus:'compound'},...(opts?{choiceHeading:'另一筆補助是哪一類？',choices:[
  {label:'兩個都是屏東縣府單位',question:raw+'；兩個都是屏東縣府單位。'},
  {label:'另有中央或其他機關',question:raw+'；另有外部機關補助。'}
 ]}:{})};
}
function tax(q){
 const t=norm(q);
 if(t.length>270||!/協會|社會團體|公益性社團法人/.test(t)||!/捐|受贈|收到的實物|送物資給/.test(t)||!/物資|物品|實物|食品|捐來的東西/.test(t)||!/所得稅|申報|結算|列入|不列|入帳/.test(t)||/合作社|營業稅|遺產稅|政治獻金|免開發票|公益勸募許可/.test(t))return null;
 const free=/免費|無償|完全沒賣|未轉售/.test(t)&&/轉贈|轉送|轉出|送出|贈|送給|送物資|救助/.test(t);
 const sold=/賣|出售|轉售|變賣/.test(t.replace(/(?:不是|沒有|沒|未|不曾|不|不會)(?:拿去)?(?:賣掉|賣|出售|轉售|變賣)/g,''));
 const split=/一半|一部分|分成|分開|另(?:一)?批|兩批|各(?:要|自|留)|一批.{0,20}(?:另|一批)/.test(t);
 if(!free||!sold||!split)return null;
 const steps=[
  ['沒賣、免費轉贈的一批：符合條件才可不列收入和支出','依財政部台財稅字第09900359720號令，所得稅法第11條第4項所定機關團體，如未轉售，依創設目的做公益慈善活動並轉贈給需受救助者或其他機關團體，可按令設簿，以實際受贈、轉贈紀錄支持免列。保留兩段登記：人或團體、日期、品名、數量及相應經手簽章；也保存收受或送交的證明。'],
  ['賣掉的一批：出售與日後公益支出要分開留證','有對價的出售不能使用該未轉售的免列規定。保留受贈及領出紀錄、實際交易憑證、入帳與日後公益支用證明。銷售所得依免稅適用標準第3條等核算；符合資格的慈善救濟團體義賣、所得具有捐贈收入性質時另有函釋，單純把售款拿去做公益不會自動變成免費轉贈。'],
  ['同一批物資分流，先確保每一部分能對得起來','建議從最初收貨就按品項、數量和去向分帳，總數能跟實物進出及憑證核對。若同一批部分有償、部分免費，不能把全部列成無償；該批能否逐項適用函令或如何申報，帶帳簿及憑證向所在地國稅局核對，不憑描述認定全部免列或全部應稅。']
 ];
 return {direct:true,category:'協會稅務｜捐贈實物分流',title:'免費轉贈與轉售要分帳，不能把兩批都當作免列',summary:'兩批不能一概不列。完全未轉售而免費公益轉贈的部分，符合條件才可免列；出售的部分及日後公益支出要分開記錄。',steps,refs:[transfer,income,charity],questionState:{focus:'compound'}};
}
if(typeof module!=='undefined'&&module.exports){module.exports={grant,tax};return;}
root.verifiedAssociationFiscalGrant=grant;
root.verifiedAssociationFiscalTax=tax;
})(typeof window!=='undefined'?window:globalThis);
