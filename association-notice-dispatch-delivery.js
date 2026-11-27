(function(root){
'use strict';
const refs=[
 {title:'人民團體法第26條：大會通知及緊急送達例外',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0050091&flno=26'},
 {title:'人民團體會務輔導辦法第10、11條：大會及理監事會通知',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0020094'},
 {title:'內政部台內團字第1080040493號：章程規定書面通知',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256748'},
 {title:'內政部台內團字第1080050300號：可證明的通知及相對人可取閱',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256749&sms=12360'},
 {title:'內政部會務輔導辦法第10、11條說明：發送時點與舉證',source:'https://www.puli.gov.tw/attachment/31550_%E4%BA%BA%E6%B0%91%E5%9C%98%E9%AB%94%E6%9C%83%E5%8B%99%E8%BC%94%E5%B0%8E%E8%BE%A6%E6%B3%95%E7%B8%BD%E8%AA%AA%E6%98%8E.pdf'}
];
const faq={title:'內政部 FAQ：12月15日開大會的通知日期例子',source:'https://www.moi.gov.tw/News_toggle3.aspx?PageSize=30&n=174&page=83&sms=9015'};
const paper=['先查章程和大會通過的通知方式，不限所有團體都須紙本','一般會議可採能證明確實通知的郵寄、電子郵件等方式。章程明定書面或特定方式時，要依章程，不能只在群組公告當作每位應出席者都已收到。通知應含會議種類、時間、地點及議程，對象依審定名冊；以電郵通知可留寄件、收件人清單與退信紀錄，不在聊天室張貼。'];
const read=['有寄件紀錄，不等於退信或寄錯也有通知','內政部就一般大會通知的時點採發送日觀點，但也要求團體發生爭議時舉證；通知須使相對人可以取閱。不是要每位會員都回覆或點開才有效；若退信、地址錯誤或根本沒寄給應出席人，儘速依適用方式補送、保留紀錄；無法確保法定程序前，先考慮改期，不逕判任何一場有效或無效。'];
const urgent=['真正緊急才可用前一日送達例外','臨時會議不等於當然緊急。要有緊急事故，而且在開會前一日確實送達；今天只寄出、不能證明收件人可取閱，不等於明天可以依法召開。如果只是來不及，按一般通知期安排。'];
const admin=['通知成員不等於通知主管機關','會員（代表）大會依法另有報請主管機關派員列席之規定；向縣府報送與通知會員是不同程序，不用其中之一替代另一個。若問的是縣府收件、紙本掛號或電子報送，依各機關申辦規定確認送達。'];
function route(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>230||!/大會|理事會|監事會|理監事|開會|會議/.test(t)||!/通知|寄信|送達/.test(t)||/合作社|社員|工會|公會|區分所有權|管委會|學校|股東|法院通知|公告地址/.test(t))return null;
 if(!/電子郵件|電郵|沒收到|未收到|退信|寄錯|紙本|寄出.{0,5}(?:或|還是)送達|最晚哪天.{0,9}(?:寄|送)|今天寄.{0,8}明天|前一天.{0,5}(?:寄|送達)/.test(t))return null;
 const board=/理事會|監事會|理監事/.test(t)&&!/不是(?:臨時)?(?:理事會|監事會|理監事)/.test(t);
 const assembly=/大會/.test(t)&&!/不是(?:臨時)?(?:會員|會員代表)?大會/.test(t);
 const isUrgent=/前一天|前一日|今天|明天|緊急/.test(t)&&/臨時|緊急/.test(t);
 const usual=assembly&&!board?'會員（代表）大會原則十五日前通知。':board&&!assembly?'一般協會理事會、監事會或理監事聯席會議，原則七日前通知。':'先分會議：大會原則十五日前、理事會或監事會原則七日前。';
 const example=assembly&&!board&&/12月15日|12月15號/.test(t)&&/最晚|哪天/.test(t);
 const summary=isUrgent?usual+' 如果只是今天寄信、明天要開，不能僅憑寄出就算符合緊急例外。':usual+(example?' 內政部以12月15日開大會為例，說明應在12月1日前通知會員；保險起見建議在11月30日或更早發出，並保存證明。':' 使用電子郵件前先核對章程或大會決議；已知有人未收到，先確認退信、收件地址與通知紀錄再決定是否補送或改期。');
 return {direct:true,category:'人民團體會務｜開會通知時點',title:'一般會議發送通知，和緊急例外送達要分開',summary,steps:[paper,read,urgent,...(assembly?[admin]:[])],refs:example?[...refs,faq]:refs,questionState:{focus:'compound'}};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationNoticeDispatch=route;
})(typeof window!=='undefined'?window:globalThis);
