(function(root){
'use strict';
const assoc={title:'人民團體法第25、26、27、29、31、42條：會議、通知、修章及委託',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050091'};
const guide={title:'人民團體會務輔導辦法第10、11條：通知、議程及審定名冊',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0020094'};
const moi={title:'內政部台內社字第8735076號：大會延期及名冊',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=220065'};
const video={title:'內政部：視訊會議須依章程及選務法規',source:'https://www.moi.gov.tw/News_Content.aspx?n=9&s=279373'};
const dateRule={title:'內政部：會議通知發送方式、可取閱及舉證',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256749&sms=12360'};
const coopLaw={title:'合作社法第36、46、48、50、51條',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050112'};
const types={assembly:'會員（代表）大會',board:'理事會',supervisor:'監事會',joint:'理監事聯席會議'};
const normalize=s=>String(s??'').normalize('NFKC').replace(/\s/g,'');
const dateRe=/(?:(民國|西元)?(\d{2,4})年|(明年|今年))?(\d{1,2})(?:月|[\/-])(\d{1,2})(?:日|號)?/g;
const hanNum=s=>{const m={'〇':0,'零':0,'一':1,'二':2,'兩':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9};if(s.includes('十')){const [a,b]=s.split('十');return (a?m[a]:1)*10+(b?m[b]:0)}return [...s].map(x=>m[x]).join('')};
const numericDays=t=>t.replace(/([〇零一二兩三四五六七八九十]{1,3})(?=月|日|號)/g,(_,s)=>String(hanNum(s)));
function dateInfo(t){
 t=numericDays(t);
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
function cooperativeShift(t,prior){
 const neg=/信用合作社|信合社|(?:會議|大會).{0,10}改選|(?:要|有|辦)(?:改選|補選|選舉)|候選登記/.test(t.replace(/(?:沒(?:有)?|不)(?:要)?(?:改選|補選|選舉)/g,''));
 if(neg)return null;
 const explicit=/社員(?:代表)?大會/.test(t)&&/合作社|社員大會/.test(t)&&/(?:改期|延期|改到|延後|順延)/.test(t)&&/委託|代理/.test(t);
 const follow=prior?.type==='coop-assembly'&&/^(?:那|如果|所以|已經|請問)/.test(t)&&t.length<78&&/流會|不足|沒(?:有)?達成|未達|沒有成會/.test(t)&&!/換題|會員大會|理事會|保險/.test(t);
 if(!explicit&&!follow)return null;
 const lack=follow||/人數不足|流會|沒有成會|沒有達到開會|未達成會|沒有達成開會/.test(t);
 const second=/兩次以上|二次以上|第2次|第二次|連續.{0,4}(?:2|二|兩)次|已經.{0,5}(?:2|二|兩)次/.test(t);
 const datedProxy=/委託書.{0,14}(?:有列|只列|記載|填|限|寫).{0,10}(?:原日期|舊日期|原定|日期)|只能.{0,6}原日期/.test(t);
 const summary=lack?'原本有人到場但出席未過全體社員半數，沒有成會；記錄為流會，不是原會議可以繼續表決。由理事會依法重新召集。':(datedProxy?'委託書若限定原日期或原場次，不要直接用在新日期；先請委託人重新出具當次書面。':'改期後先核對委託書是否確實涵蓋新日期及當次議程；不確定就請本人重新出具書面。')+' 同時依新日期發出書面通知。';
 const steps=[['用新日期重新通知','合作社法第46條：由理事會召集，開會七日前以書面載明召集事由及提議事項，通知應出席社員並列實際日時、地點。若已不能保留期限，不要硬用原通知。'],['代理資格另核對','合作社法第50條：不能出席者以書面委託其他社員；同一受託人最多代理一人。舊日期是否限制以委託文義為準，不自行替委託人擴張或改寫。'],['決算先讓監事會審核','審年度決算前，依合作社法第36條在社員大會十日前送監事會審核；會議變更時核對實際時間與先前審核紀錄。']];
 if(lack)steps.push(['流會及再召集',second?'已流會兩次以上，依第51條理事會得就議案書面請全體社員通信表決，期限至少十日；選舉及有特別規定者另行確認。':'依第48條成會需全體社員過半出席。這次流會不要做成有效決議；依法重新召集，不能第一次就用第51條通信表決。流會兩次以上才另看第51條，書面通信表決期限至少十日。']);
 return {direct:true,category:'合作社會議｜改期、授權及流會',title:lack?'一般合作社未成會，另行召集':'一般合作社社員大會改期：按新日期通知、核對委託',summary,steps,refs:[coopLaw],noticeContext:{type:'coop-assembly'},questionState:{focus:'cross-coop-rescheduled-quorum'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function route(q,prior){
 const raw=String(q??'').trim(),t=normalize(raw);
 const coopAnswer=cooperativeShift(t,prior);if(coopAnswer)return coopAnswer;
 if(!t||t.length>355||/^(?:新題|另問)|合作社|社員|公會|工會|農會|漁會|股東|管委會|管委|成立大會|發起人|補助核銷|勸募|解散/.test(t))return null;
 const priorKind=prior?.type==='coop-assembly'?null:prior?.type;
 const selection=t.match(/會議確認:(?:會員大會|理事會|監事會|理監事聯席會議)/)?.[0]?.split(':')[1];
 const choice={會員大會:'assembly',理事會:'board',監事會:'supervisor',理監事聯席會議:'joint'}[selection];
 const dateOnly=/^(?:(?:民國|西元)?\d{2,4}年|明年|今年)?\d{1,2}(?:月|[\/-])\d{1,2}(?:日|號)?$/.test(numericDays(t));
 const type=choice||kind(t)||(dateOnly?priorKind:null);
 const delayed=/改期|延期|延到|延後|延一週|延一周|順延|改到|改時間|改日期|取消.{0,10}(?:原訂|原定|會議|大會)|會場關閉|場地臨時|未召開|改成|改為|改同天/.test(t);
 const notice=/通知|送達|寄送|重發|哪天|何時|怎麼分|幾天|名冊|委託/.test(t);
 const dated=!!dateInfo(t);
 const trueAdjourn=/簽到不足|人數不足|已宣布流會|主席宣告流會/.test(t)&&!/(?:不是|沒有|沒宣布)流會/.test(t);
 if(trueAdjourn||!choice&&!(priorKind&&dateOnly)&&!((delayed||dated)&&notice&&/會議|大會|理事會|監事會|理監事/.test(t)))return null;
 const range=type==='assembly'?15:7;
 const d=dateInfo(t);
 const emergency=/因緊急事故|確有緊急|災害緊急/.test(t)&&!/非緊急|不是緊急|沒有緊急/.test(t);
 const justChange=/時間|改期|延期|延後|順延|改到|延到/.test(t)&&!/新任|任期|補選/.test(t);
 const hasProxy=/委託/.test(t)&&!/(?:沒有|沒|不用|不用談)委託/.test(t);
 const hasRoster=/名冊|新會員|會員申請|新申請/.test(t);
 const visual=/視訊/.test(t);
 const day=d?.date?new Date(d.date.valueOf()-(emergency?1:range)*86400000):null;
 const estimated=day?((d.date.getUTCFullYear()!==day.getUTCFullYear()?'開會年份的前一年':'')+(day.getUTCMonth()+1)+'月'+day.getUTCDate()+'日'):null;
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
 if(type==='assembly'&&hasProxy)steps.push(['舊的委託書先查日期、議程與範圍','有日期、會次、議程或章程限制時，不直接沿用。請各委託人就新一場書面確認；內政部函釋：若確為同一會議延期，原委託沒有限制、未終止，才可能沿用。是否可委託依章程及人民團體法第42條，受託人每人最多代理一人。']);
 if(type!=='assembly'&&/代理|委託|代出席|代為出席|代替出席/.test(t))steps.push(['理事、監事親自出席','依人民團體法第31條，理監事須親自出席，不得請同事或他人代理，也不能把代理人算進出席。延期後通知各該應出席理監事，不按會員大會通知全體會員。']);
 if(type==='assembly'&&/修章|改章程/.test(t))steps.push(['新修章議案列入通知','依人民團體法第27條，通常須會員（代表）過半出席、出席者三分之二以上同意；不能用原通知的不同議程或理事會代替。']);
 if(visual)steps.push(['同一天改晚上視訊也要看章程與議程','章程須允許視訊或有適用中央公告；有選舉、補選或罷免時，另依現行選務法規，不自行把實體選務改視訊。']);
 if(!d&&justChange)steps.push(['只需補新的月日','請提供改定的開會月日；遇2月29日再補年份。不用貼具名通知。']);
 return {direct:true,category:'人民團體會務｜改期通知',title,summary,steps,refs:[assoc,guide,dateRule,...(type==='assembly'&&delayed?[moi]:[]),...(visual?[video]:[])],noticeContext:!d?{type}:null,questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationRescheduledNotice=route;
})(typeof window!=='undefined'?window:globalThis);
