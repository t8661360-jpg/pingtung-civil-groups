(function(root){
'use strict';
const refs=[
 {title:'人民團體會務輔導辦法第12條：會議紀錄及報請備查',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0020094&flno=12'},
 {title:'人民團體法第54條：章程、選任職員或負責人名冊異動',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0050091&flno=54'}
];
const labels={assembly:'會員（代表）大會',board:'理事會',supervisor:'監事會',joint:'理監事聯席會議'};
const status={direct:true,category:'社會團體會務｜會議紀錄補件',questionState:{focus:'compound'}};
const essentials=['現在先檢查手上資料，不用先全部送出','準備來文、其附件、對應屆次與開會日期。依第12條，會議紀錄應寫開會日期、出缺席狀況和決議，留存並供會員或會員代表查閱。只準備來文要求的正式紀錄及附件；不要在小屏上貼具名名冊、證號或完整公文。'];
const askIssuer=['核對來文上的開會種類、場次和補件期限','若通知沒有講清楚，依原發文機關的正式聯絡方式，提供文號或案件編號並問應補哪一場、哪些附件及期限；不自行把監事會改填成會員大會，也不倒填日期。送件方式依來文指示，不假定可以只寄電子郵件。'];
const assembly=['會員（代表）大會紀錄','會務輔導辦法第12條一般要求閉會後30日內報主管機關備查。這與來文指定的補件期限是兩件事；若已過期限，仍應按來文或承辦確認補正，不以新日期取代原日期。'];
const boards=['理事會、監事會或聯席會議紀錄','原則由團體自行留存；若決議事項依法應報主管機關或目的事業主管機關核辦，依該事項檢附會議紀錄等相關文件，例如特定改選、補選或章程異動所需證明。不要把大會閉會後30日的通則直接套到每次理監事會。若已收到特定補件通知，仍要依通知核對，不是所有理監事會紀錄都不送。'];
const dates=/(?:民國)?\d{2,4}年(?:\d{1,2}|[一二三四五六七八九十]{1,2})月(?:(?:\d{1,2}|[一二三四五六七八九十]{1,3})[日號])?|\d{2,4}[/-]\d{1,2}[/-]\d{1,2}|(?:\d{1,2}|[一二三四五六七八九十]{1,2})月(?:\d{1,2}|[一二三四五六七八九十]{1,3})[日號]/;
function filingKind(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>235||!/協會|社會團體|人民團體/.test(t)||!/會議紀錄|會議記錄|會議紀要|大會紀錄/.test(t)||!/補件|補正|(?:通知|縣府|來文).{0,14}(?:補|紀錄)|(?:要|要求|收到).{0,8}補/.test(t)||/合作社|社員|信合社|工會|公會|基金會|家長會|農會|漁會|公司|勸募|解散|招標/.test(t))return null;
 const unknown=/不知道|不確定|不清楚|沒(?:有)?寫|沒(?:有)?說|看不出|分不清/.test(t)&&/會議|通知|來文|大會|日期/.test(t);
 const explicit=/(?:已確認(?:是)?|(?<!不)確定是|來文明確指定|通知寫的是)(?:會員(?:[（(]?代表[）)]?)?大會|理事會|監事會|理監事聯席)/.test(t);
 const precise=t.match(new RegExp('(?:原開會日期|開會日期|會議日期|開會日)(?:是|為|：|:)?('+dates.source+')'))?.[1];
 const candidates=[...new Set(t.match(new RegExp(dates.source,'g'))||[])];
 const date=precise||(candidates.length===1&&!/發文日期|來文日期|收文日期/.test(t)?candidates[0]:''); const d=date?('，開會日期為'+date):'';
 const choices=[...Object.values(labels).map(label=>({label,question:'一般協會補件的會議紀錄，已確認是'+label+d+'，現在要先交什麼？'})),
 {label:'仍不確定是哪一場',question:'一般協會要補會議紀錄，通知仍看不出會議種類或場次，我要先交什麼？'}];
 const end=/通知仍看不出會議種類或場次/.test(t);
 if(end||unknown&&!explicit)return {...status,title:'補會議紀錄前，先確認是哪一種會議',summary:'先不要猜是哪一份紀錄，也不要把不同會議的資料全送出。先看來文與附件；如果不清楚，就請原發文承辦確認。'+(date?'已提供「'+date+'」，先保留這個日期。':'') ,steps:[essentials,askIssuer],refs,...(!end?{choiceHeading:'縣府通知要補哪一種？',choices}:{})};
 const types=[...(/會員(?:[（(]?代表[）)]?)?大會|會員代表會議/.test(t)?['assembly']:[]),...(/理監事聯席/.test(t)?['joint']:[]),...(/理事會/.test(t)?['board']:[]),...(/監事會/.test(t)?['supervisor']:[])];
 if(types.length!==1)return null;
 const k=types[0];
 return {...status,title:'確認是'+labels[k]+'，再對照補件通知',summary:(date?'先以您提到的「'+date+'」核對這一場，確認它是原開會日期而不是來文日期。':'還需要知道這一場的開會日期。您可以只補充日期，例如「一般協會要補監事會會議紀錄，開會日期是115年6月10日」。')+(k==='assembly'?' 大會紀錄與縣府來文要求一併核對。':' 這類紀錄通常自行留存，但來文已要求時應按個案確認。'),steps:[essentials,k==='assembly'?assembly:boards,askIssuer],refs};
}
if(typeof module!=='undefined'&&module.exports){module.exports={filingKind};return;}
root.verifiedAssociationMinutesFilingKind=filingKind;
})(typeof window!=='undefined'?window:globalThis);
