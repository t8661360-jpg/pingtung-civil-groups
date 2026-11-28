(function(root){
'use strict';
const assoc={title:'人民團體法第25、26、27、29、42條：會議、通知、修章及委託',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050091'};
const guide={title:'人民團體會務輔導辦法第10、11條：通知、議程及審定名冊',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0020094'};
const moi={title:'內政部台內社字第8735076號：大會延期及名冊',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=220065'};
const video={title:'內政部：視訊會議須依章程及選務法規',source:'https://www.moi.gov.tw/News_Content.aspx?n=9&s=279373'};
const dateRule={title:'內政部：會議通知發送方式、可取閱及舉證',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256749&sms=12360'};
const types={assembly:'會員（代表）大會',board:'理事會',supervisor:'監事會',joint:'理監事聯席會議'};
const normalize=s=>String(s??'').normalize('NFKC').replace(/\s/g,'');
const dateRe=/(?:(民國|西元)?(\d{2,4})年|(明年|今年))?(\d{1,2})(?:月|[\/-])(\d{1,2})(?:日|號)?/g;
function dateInfo(t){
 const q=t.replace(/[；;]會議確認:[^；;]+/,'');const hits=[...q.matchAll(dateRe)];
 const m=hits.at(-1);if(!m)return null;
 const timeWord=m[3]||(!m[2]&&hits.length===1?t.match(/明年|今年/)?.[0]:'')||'';
 const y=m[2]?(+m[2]<1911?+m[2]+1911:+m[2]):null,M=+m[4],D=+m[5];
 if(M<1||M>12||D<1||D>31)return null;
 const year=y||(M===2&&D===29?2028:2026);
 const d=new Date(Date.UTC(year,M-1,D));if(d.getUTCMonth()!==M-1||d.getUTCDate()!==D)return null;
 if(!y&&M===2&&D===29)return {label:timeWord+M+'月'+D+'日',uncertain:true};
 return {label:(m[2]?(m[1]||'')+m[2]+'年':timeWord)+M+'月'+D+'日',date:d,uncertain:false};
}
function kind(t){
 if(/(?:不確定|不知道|沒確認|分不清).{0,10}(?:理事會|監事會|大會|會議類型)|到底是.{0,15}(?:還是|或)/.test(t))return null;
 if(/(?:改成|改為|改開|變成|確認是)(?:臨時)?(?:會員|會員代表)?大會/.test(t))return 'assembly';
 if(/(?:改成|改為|改開|變成|確認是)(?:臨時)?理監事/.test(t))return 'joint';
 if(/(?:改成|改為|改開|變成|確認是)(?:臨時)?監事會/.test(t))return 'supervisor';
 if(/(?:改成|改為|改開|變成|確認是)(?:臨時)?理事會/.test(t))return 'board';
 const clean=t.replace(/(?:不是|並非|沒有要開|非)(?:一般協會)?(?:臨時)?(?:會員代表大會|會員大會|理監事聯席會議|理監事會議|理事會|監事會)/g,'');
 const xs=Object.keys(types).filter(k=>({assembly:/會員(?:代表)?大會|會員\(代表\)大會|臨時大會/,board:/理事會/,supervisor:/監事會/,joint:/理監事聯席|理事監事聯席/})[k].test(clean));
 return xs.length===1?xs[0]:null;
}
function route(q,prior){
 const raw=String(q??'').trim(),t=normalize(raw);
 if(!t||t.length>355||/^(?:新題|另問)|合作社|社員|公會|工會|農會|漁會|股東|管委會|管委|成立大會|發起人|補助核銷|勸募|解散/.test(t))return null;
 const priorKind=prior?.type;
 const selection=t.match(/會議確認:(?:會員大會|理事會|監事會|理監事聯席會議)/)?.[0]?.split(':')[1];
 const choice={會員大會:'assembly',理事會:'board',監事會:'supervisor',理監事聯席會議:'joint'}[selection];
 const dateOnly=/^(?:(?:民國|西元)?\d{2,4}年|明年|今年)?\d{1,2}(?:月|[\/-])\d{1,2}(?:日|號)?$/.test(t);
 const type=choice||kind(t)||(dateOnly?priorKind:null);
 const delayed=/改期|延期|延到|改到|改時間|改日期|取消.{0,10}(?:原訂|原定|會議|大會)|會場關閉|場地臨時|未召開|改成|改為|改同天/.test(t);
 const notice=/通知|送達|寄送|重發|哪天|何時|怎麼分|幾天|名冊|委託/.test(t);
 const dated=!!dateInfo(t);
 const trueAdjourn=/簽到不足|人數不足|已宣布流會|主席宣告流會/.test(t)&&!/(?:不是|沒有|沒宣布)流會/.test(t);
 if(trueAdjourn||!choice&&!(priorKind&&dateOnly)&&!((delayed||dated)&&notice&&/會議|大會|理事會|監事會|理監事/.test(t)))return null;
 const range=type==='assembly'?15:7;
 const d=dateInfo(t);
 const emergency=/因緊急事故|確有緊急|災害緊急/.test(t)&&!/非緊急|不是緊急|沒有緊急/.test(t);
 const justChange=/時間|改期|延期|改到|延到/.test(t)&&!/新任|任期|補選/.test(t);
 const hasProxy=/委託/.test(t)&&!/(?:沒有|沒|不用|不用談)委託/.test(t);
 const hasRoster=/名冊|新會員|會員申請|新申請/.test(t);
 const visual=/視訊/.test(t);
 const day=d?.date?new Date(d.date.valueOf()-(emergency?1:range)*86400000):null;
 const estimated=day?day.getUTCMonth()+1+'月'+day.getUTCDate()+'日':null;
 if(!type){
  const ch=Object.entries(types).map(([k,label])=>({label,question:raw+'；會議確認：'+(k==='assembly'?'會員大會':label)+'。'}));
  return {direct:true,category:'人民團體會務｜改期通知',title:'先確認這場是會員大會、理事會還是監事會',
   summary:'若原會議根本沒有召開，先通知取消或改期，不把它當成已成會或流會。'+(d?'您已有日期 '+d.label+'；只要再選會議類型。':'不用貼完整通知，先選類型；要算日期再補新的月日。'),
   choiceHeading:'要改的是哪一種會議？',choices:ch,refs:[assoc,guide]};
 }
 const title=types[type]+'：'+(delayed?'改期用新的會議通知':'依實際開會日安排通知');
 const general=emergency?'只有確屬緊急事故召集臨時會議，才可用開會前一日送達；不是前一天寄出就算。':types[type]+'原則在開會'+range+'日前通知各應出席人員。';
 const summary=(delayed?'原通知如果是舊的會議種類、時間、地點或議程，不宜當成新一場的通知。':'')+general+(estimated?'以 '+d.label+' 開會，'+(emergency?'緊急前一日是 '+estimated+'，要確實送達。':'為保留完整通知時間，建議 '+estimated+' 或更早發出。這是保守倒算，另核章程及通知方式，不當成個案最晚送達日。'):d?.uncertain?'2月29日請再補年份，確認是否存在。':'');
 const steps=[['用新資訊通知並留紀錄','將實際會議種類、日時、地點或視訊方式及議程告知應出席者，留發送與可取閱的佐證。'+(delayed?'有改期或取消，先通知原收件人，再依新一場的適用期限處理。':'')+(type==='assembly'&&/(?:原本|原先).{0,9}理事會/.test(t)?'原來只寄「理事會」不能替代大會通知。':'')+'一般發送與真正緊急的前一日送達是不同要求，另依章程或大會決議所定方式辦理。']];
 if(type==='assembly'&&delayed)steps.push(['大會改期與主管機關列席','會員（代表）大會仍應報請主管機關派員列席；已送舊函的，向原承辦說明取消或新日期、地點及議程，確認更正方式，不擅猜地方表單或期限。內政部就定期大會延期有依新日期十五日前通知的解釋。']);
 if(type==='assembly'&&hasRoster)steps.push(['核對會員資格，不把待審申請者先算進去','依審定名冊通知；資格有變更時，再依第10條按新一場會議核對應出席名冊。已送申請、尚未依法依章程取得會員資格的人，不當然能領票或表決。']);
 if(type==='assembly'&&hasProxy)steps.push(['舊的委託書先查日期、議程與範圍','有日期、會次、議程或章程限制時，不直接沿用。請各委託人就新一場書面確認；是否可委託依章程及人民團體法第42條，受託人每人最多代理一人。']);
 if(type==='assembly'&&/修章|改章程/.test(t))steps.push(['新修章議案列入通知','依人民團體法第27條，通常須會員（代表）過半出席、出席者三分之二以上同意；不能用原通知的不同議程或理事會代替。']);
 if(visual)steps.push(['同一天改晚上視訊也要看章程與議程','章程須允許視訊或有適用中央公告；有選舉、補選或罷免時，另依現行選務法規，不自行把實體選務改視訊。']);
 if(!d&&justChange)steps.push(['只需補新的月日','請提供改定的開會月日；遇2月29日再補年份。不用貼具名通知。']);
 return {direct:true,category:'人民團體會務｜改期通知',title,summary,steps,refs:[assoc,guide,dateRule,...(type==='assembly'&&delayed?[moi]:[]),...(visual?[video]:[])],noticeContext:!d?{type}:null,questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationRescheduledNotice=route;
})(typeof window!=='undefined'?window:globalThis);
