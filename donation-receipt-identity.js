(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
function receiptIdentity(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>185||/統一發票|會費|報價單|薪資|房租|租金|講師費|政治獻金|遺產稅|贈與稅|團體名稱預查|發票買受人/.test(t))return null;
 const receipt=/收據|證明|改開|重開|補開/.test(t);
 const change=/改(?:開|名|寫|成)|換.{0,6}(?:名|抬頭)|重開|補開|開.{0,8}(?:名|抬頭)|寫.{0,6}(?:名|我|配偶|太太|先生)|抬頭|名義|誤植|打錯|寫錯|填錯/.test(t);
 const household=/夫妻|配偶|太太|先生|妻子|丈夫|老公|老婆|受扶養|同戶|同一申報戶|合併.{0,6}(?:報|列舉)/.test(t);
 const together=/合併|共同申報|同戶|同一申報戶/.test(t)&&!/不是同戶|不同戶|不同申報戶|分開申報|各自申報/.test(t);
 const donor=/捐款|捐贈|勸募|善款/.test(t);
 const company=/公司|商號|企業|法人帳戶/.test(t);
 const actual=/公司(?:自己|實際|本身|全額)?(?:出錢|付錢|出資|捐|付|付款|匯錢|匯款)|企業(?:自己|實際|本身)?(?:出資|捐)|由公司.{0,8}(?:出資|付款|捐)/.test(t);
 const transfer=/代匯|代繳|代為付款|只是代|受託/.test(t);
 const paidPersonal=/個人(?:自己)?出錢|我自己出錢|我(?:的)?個人帳戶出|我本人.{0,4}(?:捐|出資|出錢)/.test(t);
 const filing=/綜所稅|所得稅|扣抵|抵稅|報稅|抵綜|列舉|扣除/.test(t);
 const mistake=/打錯|誤植|寫錯|填錯|漏字|錯字|資料不符/.test(t);
 const permit=/核准勸募|已許可勸募|經許可勸募|勸募許可|公益勸募/.test(t);
 if(!receipt||!change||(!donor&&!(company&&actual&&filing&&/協會|受贈單位/.test(t))&&!/協會的?收據.{0,10}別人的名字/.test(t)))return null;
 const accounting=['收據跟實際捐贈事實一致','先核對實際捐贈者與金流。社會團體財務處理辦法第17、20條要求開立正式收據、留存根，且收支不得匿報或虛報；'+(permit?'經許可的公開公益勸募，公益勸募條例第16條另明定收據應記載捐贈人。':'如屬經許可的公開公益勸募，條例第16條另規定收據應記載捐贈人。')+'不要為了報稅換成不是實際捐贈者的人。'];
 const spouse=['同一申報戶不必為報稅更換真實捐贈者','如果收據寫的配偶或受扶養親屬就是實際捐贈者、同一申報戶且採列舉扣除，所得稅法第17條允許一併列報符合資格的捐贈，不必改成申報人的姓名。受贈機構與金額仍須符合規定；不要重複列報。若不在同一申報戶，不能用改名代替申報資格。'];
 const business=['公司出資與個人捐贈是兩件事','公司自己出錢捐款，應照實開給公司；負責人不能把同一筆錢改成個人捐贈列抵綜所稅。公司列報費用另按營利事業所得稅規定，並備妥受領機關團體的收據或證明。若公司只是代匯，不要只看匯款帳戶就認定，請受贈單位按委託證明、款項來源與帳務紀錄核對。'];
 const correction=['真的有誤植或代匯：先請受贈單位核對','姓名錯字或漏字，請提供原收據及付款紀錄，讓受贈單位查原帳務後依作業更正，並留存更正紀錄。由他人代匯時，核對實際出資、捐贈意思及代匯的證明；不能只憑口頭要求換人，不要讓同一筆款有兩張有效收據。勿在聊天公開姓名、統編、帳號或證件。'];
 const refs=[law('社會團體財務處理辦法','D0050097',17),law('社會團體財務處理辦法','D0050097',20),law('公益勸募條例','D0050138',16),
  ...(household||filing?[law('所得稅法','G0340003',17),{title:'財政部：個人綜合所得稅捐贈列舉扣除',source:'https://www.etax.nat.gov.tw/etwmain/tax-info/understanding/tax-q-and-a/national/individual-income-tax/exemption-scope/deduction/2PENnej'}]:[]),
  ...(company?[{title:'財政部：營利事業捐贈須取得的收據或證明',source:'https://www.etax.nat.gov.tw/etwmain/tax-info/understanding/tax-q-and-a/national/profit-seeking-enterprise-income-tax/operating-expense-calculation/DGKWR5q'}]:[])];
 const summary=transfer?'代匯的人或公司的帳戶不必然是實際捐贈者。請先由受贈單位查核實際出資、捐贈意思與代匯憑證，再依查核結果處理收據。':
  company&&actual&&!paidPersonal?'如果是公司實際出資捐贈，不能改成負責人的個人名義抵綜所稅，應照實以公司為捐贈人。':
  household&&together?'如果配偶確實捐款、同戶採列舉扣除且符合資格，保留配偶實名的原收據，不必改開給申報人。':
  mistake?'可以請受贈單位核對原始付款與收據資料，確認是同一捐贈人的誤植再更正，不是換成別人。':(donor?'':'如果問的是捐款，')+'收據應依實際捐贈者，不宜改開給配偶、公司或其他沒有捐贈的人。若真的誤植、或有人代匯，請先核對原付款和捐贈證明。';
 return {direct:true,category:'捐贈、收據及報稅',questionState:{focus:'compound'},
  title:transfer?'捐款收據：代匯與實際捐贈者要分清':company&&actual&&!paidPersonal?'公司出資的捐款，不能改開負責人個人抵稅':household&&together?'夫妻同戶列舉，不必改開配偶捐款收據':'捐款收據照實寫捐贈者，誤植再核對更正',
  summary,steps:[accounting,...(household?[spouse]:[]),...(company?[business]:[]),correction],refs};
}
if(typeof module!=='undefined'&&module.exports){module.exports={receiptIdentity};return;}
root.verifiedDonationReceiptIdentity=receiptIdentity;
})(typeof window!=='undefined'?window:globalThis);
