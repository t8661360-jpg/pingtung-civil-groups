(function(root){
'use strict';
const farm=n=>({title:'農會法第'+n+'條',source:'https://law.moa.gov.tw/LawContent.aspx?id=FL014814'});
const rule=n=>({title:'農會選舉罷免辦法第'+n+'條',source:'https://law.moa.gov.tw/LawContent.aspx?id=FL014821'});
const detail={title:'農會法施行細則第33條',source:'https://law.moa.gov.tw/LawContent.aspx?id=FL014815'};
function farmerRepresentative(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>200||!/農會|農事小組/.test(t)||/漁會|信用部|貸款|退出|農保|選縣長|選議員|立委選舉|地方公職/.test(t))return null;
 if(!/會員(?:大會)?代表|農事小組.{0,10}代表|農會.{0,24}代表|代表.{0,10}農會/.test(t)||!/選|投|候選|資格|當|報名|登記|票|大會/.test(t))return null;
 const compare=/一般協會|人民團體|社會團體|協會/.test(t)&&/一樣|同一|差(?:在哪|別|異)|比較|各自|和|跟|與/.test(t);
 const upper=/上級農會|(?:去|到|赴|派到|出席|參加|送到|推到|去參加).{0,7}(?:縣|縣市|市|全國)農會|鄉農會.{0,15}縣農會/.test(t);
 const base=/基層農會|農事小組|(?:鄉|鎮|區)農會|我.{0,5}農會會員|一般會員|普通會員/.test(t);
 const countTopic=/多少人|幾人|200|二百|兩百|250|人數|名額|[0-9]{2,5}(?:位|名|個|人)(?:普通|一般|有效|正式|具投票權)會員/.test(t);
 const known=t.match(/(\d{1,5})(?:位|名|個|人)(?:普通|一般|正式)會員|(?:不含|扣掉|扣除|除去)贊助會員(?:後|還有|只有|有|是|總共|剩下|剩|共|則為){0,3}(\d{1,5})(?:位|名|個|人)/);
 const n=known?Number(known[1]||known[2]):null;
 const sponsor=/贊助會員/.test(t)&&!/不含贊助會員|扣除贊助會員|扣掉贊助會員|除去贊助會員/.test(t);
 const below=/才[一二三四五12345](?:個)?月|只有[一二三四五12345](?:個)?月|入會未滿(?:六|6)(?:個)?月|入會.{0,4}[一二三四五12345](?:個)?月/.test(t);
 const signup=/登記|報名|參選|候選|選舉資格|證件|委託|代投|代領|代辦/.test(t);
 const faqBase=['基層農會：先扣除贊助會員，再看是否超過200人','依農會法第33條及施行細則第33條，不含贊助會員在200人以下（含200人），應開會員大會。超過200人，由各農事小組選出會員代表，再開會員代表大會。基層代表選舉按選區投票，採無記名單記：每張票選一人。'];
 const faqUpper=['下級農會選派參加上級農會的代表','依農會法第15條，由該下級農會的會員（代表）大會選舉，並非全體一般會員另行分區投票。下級農會理事長是上級農會會員代表大會的當然代表；應選名額由主管機關定。依選罷辦法第8、18條，採集會投票、無記名連記；應出席人數三分之一以上出具同意書可採限制連記，圈選不得超過應選名額的一半。'];
 const voter=['不是每一種會員都有投票權或參選資格','依農會法第12、13、15條之1，普通會員未滿六個月，沒有選舉權及被選舉權；農事小組會員代表選舉的入會年資以投票日前一日計。個人或團體贊助會員都沒有選舉權，得當選監事的例外不包括會員代表。滿六個月還要符合其他候選資格及當次名冊、登記。'];
 const paperwork=['候選登記可委託，投票不能請親友代投','辦法第13條：候選人於農會公告受理之日起五日內填表附證件；委託代辦時繳驗本人與受託人的身分證並附委託書。依第21、24條，投票須本人憑國民身分證領票、秘密圈投；不識字或身體障礙不能圈投而可表意者，得請指導員及監票員依本人意思共同協助，不是授權親友代投。不要在小屏輸入或上傳證件。'];
 const verify=['日期、選區和名額要看該農會公告','請向所屬農會查當次登記公告、投票時間地點及本人名冊。分區投票依法於投票日七日前公告並書面通知選舉人；先核名冊的資格或有無錯漏，若屬名冊公告期間得依法申請更正。'];
 const seat=['每個農事小組選幾席','施行細則第33條的基準是小組有選舉權會員50人以下選一席，超過50人時每滿50人增加一席；全會代表名額原則31至45人，不足或超過依會員比例調整，特定更名區農會有例外。實際每個選區名額以該農會公告為準。'];
 const association=['一般協會不套農會的200人門檻','如果問依人民團體法立案的一般協會，第28條及人民團體選舉罷免辦法第24條，是會員（代表）人數超過300人時，得按地區或會員屬性等類別按比例選出代表，並非像基層農會超過200人依規則辦代表大會。一般協會應訂代表選舉辦法，由理事會議通過後實施並報主管機關備查；會員單位推派等其他情形仍依適用規定。'];
 const path=upper?'upper':base||n!==null?'base':'unknown';
 const title=path==='upper'?'農會派往上級的代表：由下級大會選':path==='base'?'基層農會選會員代表：先看會員數，再按農事小組投票':'農會會員代表怎麼選？先區分基層和出席上級';
 const membershipCount=path==='base'&&n!==null?(n<=200?'不含贊助會員後若為'+n+'人，應開會員大會，不是透過農事小組另選本會代表。':'不含贊助會員後若為'+n+'人，已超過200人，由農事小組分區選會員代表。'):'';
 const summary=(below?'如果到農事小組投票日前一日仍未滿六個月，就不能投票或參選會員代表；委託登記不會補足年資。':sponsor?'贊助會員不能投票選會員代表，也不能當會員代表。'+membershipCount:path==='upper'?'不是全體普通會員另投。下級農會由會員（代表）大會選出赴上級農會的代表，下級理事長另是當然代表。':membershipCount?membershipCount:path==='base'?'不含贊助會員超過200人，才在基層由農事小組分區選會員代表；200人以下開會員大會。':'基層農會自己選代表，和下級農會派代表到上級，選法不同。請依這次的目的選擇。')+(signup?'候選登記可委託代辦，投票必須本人到場，不可委託。':'');
 const choices=path==='unknown'&&!compare&&!signup&&!sponsor&&!below?[
  {label:'基層農會的會員代表',question:'基層農會由農事小組選會員代表要怎麼投票？'},
  {label:'出席上級農會的代表',question:'鄉農會要選去縣農會的代表，是哪個會議投票？'}
 ]:[];
 return {direct:true,category:'農會選務',questionState:{focus:'compound'},title,summary:summary+(compare?'另列一般協會的代表選舉規則，不能沿用農會規則。':''),
  steps:[...(path==='upper'?[faqUpper]:path==='base'?[faqBase]:[faqBase,faqUpper]),voter,paperwork,...(countTopic&&path!=='upper'?[seat]:[]),...(compare?[association]:[]),verify],
  refs:[farm(12),farm(13),farm(15),farm('15-1'),...(path!=='upper'?[farm(33),detail]:[]),rule(7),rule(8),rule(10),rule(12),rule(13),rule(18),rule(21),rule(24),...(compare?[{title:'人民團體法第28條（一般協會）',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050091'},{title:'人民團體選舉罷免辦法第24條',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050093'}]:[])],
  ...(choices.length?{choiceHeading:'您問的是哪一級的代表？',choices}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={farmerRepresentative};return;}
root.verifiedFarmerRepresentative=farmerRepresentative;
})(typeof window!=='undefined'?window:globalThis);
