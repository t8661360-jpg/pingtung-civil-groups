(function(root){
'use strict';
const law='https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0050091&flno=9';
const guidance='https://ws.moi.gov.tw/Download.ashx?icon=..pdf&n=56S%2B5pyD5ZyY6auU5rOV6KaP5b2Z57eoMTEzLjEyLnBkZg%3D%3D&u=LzAwMS9VcGxvYWQvNDAwL3JlbGZpbGUvMTIzNTgvMjM3NzM1LzQ1MWVmYjQzLWFlYTQtNDQzZS05NDE0LTFlMzM2MGY5YTc3MC5wZGY%3D';
// Distinguish the founding meeting notice from member recruitment and prep-meeting minutes.
function foundingMeetingNotice(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(/合作社|商業|同業|公會|工會|基金會|教育會|工業會|祭祀|農會|漁會|公司|學校|學生會|政黨|宗教|補助|勸募|募款|罷免|改期|延期|取消|重發|通知書範本|通知單範本/.test(t))return null;
 if(!/(成立大會|(?:籌備會|籌備委員).*(?:開大會|開會員大會|第一次會員大會))/.test(t))return null;
 if(!/(?:網站|網路|臉書|群組|公告|張貼|公布|貼文|貼在)/.test(t))return null;
 if(!/(?:通知(?:全體)?會員|通知(?:各)?應出席|算(?:是)?通知|代替通知|取代通知|不用通知|通知了嗎|(?:只|光|單)要?(?:貼|公告|公布)|貼(?:了|上去)就|公告(?:就|可以嗎|行嗎))/.test(t))return null;
 return {direct:true,category:'人民團體會務說明',title:'社會團體成立大會：只在網站貼公告，不能取代通知',
 summary:'成立大會不是籌備會，也不是公開招募會員。按內政部《社會團體許可立案作業規定》第14點，籌備會主任委員應於成立大會十五日前通知各應出席人員及主管機關。通知要寫明會議種類、時間、地點和議程。只把籌備會決議或成立大會資訊貼在網站，不能取代通知；可另用來提醒。\n\n屏東縣地方性社會團體也要通知屏東縣政府，縣府得派員列席（人民團體法第9條）。宜保留發送紀錄；如要用電子郵件或通訊軟體逐一通知，或大會已辦但疑有漏通知，請先洽縣府承辦確認，不宜直接認定程序有效或無效。',
 statutes:[{title:'社會團體許可立案作業規定第14點（內政部法規彙編）',source:guidance},{title:'人民團體法第9條',source:law}],notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
if(typeof module!=='undefined'&&module.exports){module.exports=foundingMeetingNotice;return;}
const previous=root.verifiedRoundAnswer;
root.verifiedRoundAnswer=function(q,ctx){return foundingMeetingNotice(q)||previous.call(this,q,ctx);};
})(typeof window!=='undefined'?window:globalThis);
