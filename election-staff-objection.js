(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const assoc=n=>law('人民團體選舉罷免辦法','D0050093',n);
const coop=n=>law('合作社選舉罷免辦法','D0050022',n);
const credit=n=>law('信用合作社社員代表理事監事經理人應具備資格條件及選聘辦法','G0380069',n);
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>200||!/候選人|候選|被選舉人|參選人/.test(t)||!/監票|唱票|記票|發票員|選務人員/.test(t)
  ||!/兼|自己當|自己作|自己做|自己監票|可以當|能當|擔任|同時當|同時做/.test(t)
  ||/農會|漁會|工會|公會|里長|里民|立委|議員|市長|區長|總統|公司|股東|管委會|補助|罷免|罷選/.test(t))return null;
 const kind=/信用合作社|信合社/.test(t)?'credit':/合作社|社員代表/.test(t)?'coop':/協會|社會團體|人民團體|理監事|理事候選|監事候選/.test(t)?'assoc':null;
 if(!kind)return null;
 const nonMeeting=/通訊投票|電子投票|通訊選舉|郵寄選票|非會議/.test(t);
 const before=/(?:還|尚)?沒開票|未開票|開票前|尚未宣布|還沒公布|尚未公布|還沒投票|未投票|投票前/.test(t);
 const after=/昨天公布|已公布|已宣布|結果宣布後|事後|開完票|開票完|已開票|結果.{0,6}(?:公布了|揭曉)|提出無效/.test(t)&&!before;
 const absent=/未出席|沒出席|沒有出席|不在場|缺席|沒去/.test(t)&&!/不是沒出席|沒有缺席/.test(t);
 const present=/有出席|我在場|我有到場|我有參加|我有投票|本人.{0,4}(?:在場|到場)|出席了/.test(t)&&!absent;
 const hasOfficial=/已(?:經)?公告.{0,8}候選|公告名單上的候選|候選人.{0,8}已(?:經)?公告/.test(t)&&!/未公告|沒公告|還沒公告/.test(t);
 const valid=['有疑義不等於當選一定無效','先保存選務人員名單、候選公告、選舉規則和會議紀錄，並保留異議及送達證明。不要只因兼任或有人反映，就自行宣布重選或當選無效；須依適用規定及實際爭議處理。'];
 if(kind==='assoc'){
  const rules=['候選人兼選務：查團體的規定，不先認定一律可或不可','人民團體選舉罷免辦法第8條要求確定監票、發票、唱票、記票等選務人員，但該條未明定候選人一律不得擔任。先查適用法令、章程及自訂選舉規則；開票前宜改由無利害關係的選務人員，並記錄決定。'];
  const now=['仍在會場：向會議主席或主持人當場提出','依第25條，出席參加選舉的會員或會員代表發現程序可能違反法令、章程或自訂規則，可當場提出，請將具體疑義與處理寫入紀錄；不是等有票數差額才可反映。'];
  const later=['結果宣布後：15日內書面向該協會提出','出席參加選舉的會員或會員代表，可於結果宣布日起15日內書面向該團體提出異議。協會收件後另有15日查明並書面回覆；仍有爭議得依法向法院提起訴訟。向縣府反映不是向協會送異議的替代。'];
  return {direct:true,category:'協會選舉｜候選人兼選務與異議',title:'候選人兼任選務有疑義，先提出並保留紀錄，不是當然無效',
   summary:nonMeeting?'通訊等非現場方式先查適用規定和團體核備選舉辦法；不要直接套現場程序。':before?'還在現場，出席參加選舉的會員或代表可先向會議主席或主持人提出，請列紀錄。':after?'結果已宣布，出席參加選舉的會員或代表可在宣布日起15日內書面向協會提出；不代表當選自動無效。':'目前是還在選舉現場，或結果已宣布？兩個階段的處理不同。',
   steps:nonMeeting?[rules,['非現場選舉先核對方式','若屬第23條理、監事通訊選舉，先核對章程、團體核備的通訊選舉辦法、開票結果及適用的異議程序，不先保證特定送件對象或期限。'],valid]:[...(before?[now,rules,later]:after?[later,rules]:[rules,now,later]),valid],
   refs:[assoc(8),assoc(25),assoc(26),...(nonMeeting?[assoc(23)]:[])],questionState:{focus:'compound'},
   ...(!before&&!after&&!nonMeeting?{choiceHeading:'選舉現在進行到哪個階段？',choices:[{label:'還在現場，未開票',question:'協會候選人兼監票員，還沒開票，怎麼提出異議？'},{label:'結果已宣布',question:'協會候選人兼監票員，結果已宣布，異議先找誰？'}]}:{})};
 }
 const ordinary=kind==='coop';
 const appointment=ordinary?['一般合作社：依法公告的候選人不能兼任選務','合作社選舉罷免辦法第20條明定，依第18條第2項公告的候選人，不得兼任選務人員，包括監票、發票、唱票、記票及代書。'+(hasOfficial?'題目已說候選人依法公告，應依這項禁止處理。':'先核對是否為該項公告名單上的候選人，不把所有未公告的情形都當作已確認。')]:
 ['信用合作社：另核金管會選聘辦法','不要套一般協會第8條或一般合作社的資格規定。先請監選人員核對選務人員安排、候選名單與適用選舉辦法。'];
 const meeting=ordinary?['一般合作社結果異議：分出席或未出席','依合作社選舉罷免辦法第37條，出席會議的選舉人或被選舉人，對宣布的結果有異議，應當場向會議主席提出；未出席的選舉人或被選舉人，應於會議後3日內書面向主管機關提出，以郵寄時的郵戳為準。這不是協會15日內向團體提出的程序。']:
 ['信用合作社結果異議：現場向監選人員','依金管會選聘辦法第38條，選舉人或被選舉人對結果有異議，應當場向監選人員提出；未出席者可於選舉揭曉後3日內書面向直轄市政府財政局或縣（市）政府提出，郵寄以郵戳為憑。不是一般合作社會議主席的窗口。'];
 const nonRows=['通訊或電子投票，不先套現場時點','一般合作社社員代表若以非會議方式辦理，先看第3條及其備查辦法；採通訊或電子投票時，依該社經決議並報備查的辦法確認選舉爭議程序。不能只拿現場選舉第37條算日。'];
 return {direct:true,category:ordinary?'合作社選舉｜候選人兼選務與異議':'信用合作社選舉｜結果異議',
  title:ordinary?'一般合作社依法公告的候選人不得兼選務；異議另看是否出席':'信用合作社選舉異議，不和一般合作社或協會混用',
  summary:nonMeeting?(ordinary?'社員代表若採通訊或電子投票，先看該社備查規則，不直接套現場期限。':'先核實信用合作社實際選舉方式，不能直接拿其他類團體的期限。'):before?'還在現場，立即向'+(ordinary?'會議主席':'監選人員')+'指出選務疑義並請記錄，不自行接觸票匭或宣告結果。':absent?'未出席的選舉人或被選舉人，'+(ordinary?'會議後':'選舉揭曉後')+'3日內書面向主管機關提出；郵寄以郵戳為準。':present?'有出席就應在現場向'+(ordinary?'會議主席':'監選人員')+'提出結果異議；不是事後一律還有3日。':'先分清是否出席；現場提出與未出席者的3日書面程序不同。',
  steps:nonMeeting?(ordinary?[appointment,nonRows,valid]:[appointment,valid]):[appointment,meeting,valid],
  refs:ordinary?[coop(3),coop(18),coop(20),coop(29),coop(30),coop(37)]:[credit(38)],questionState:{focus:'compound'},
  ...(!nonMeeting&&!before&&!present&&!absent?{choiceHeading:'您有出席這場選舉嗎？',choices:[{label:'有出席',question:(ordinary?'一般合作社':'信用合作社')+'選社員代表候選人兼監票，我有出席，異議要向誰提？'},{label:'未出席',question:(ordinary?'一般合作社':'信用合作社')+'選社員代表候選人兼監票，我未出席，異議要向誰提？'}]}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedElectionStaffObjection=route;
})(typeof window!=='undefined'?window:globalThis);
