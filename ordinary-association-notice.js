(function(root){
'use strict';
const LAW='https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=';
const cite=(name,code,n)=>({title:name+'第'+n+'條',source:LAW+code+'&flno='+n});
const P=n=>cite('人民團體法','D0050091',n);
const ER=n=>cite('人民團體選舉罷免辦法','D0050093',n);
// Issues #47 and #48: general association postings only; leave regulated notices to their own routes.
function ordinaryAssociationNotice(t){
 if(!/^(?:(?:我們|本會)?(?:的)?(?:一般協會|社區發展協會|社發協會|社區協會|協會|社團|本會)(?:的)?|我們的)?(?:一般|會務|普通)?(?:公告欄|公告|佈告欄|布告欄)/.test(t))return null;
 if(!/(貼|張貼|掛|放|設|哪裡|哪邊|何處|多久|幾天|期間|怎麼公告|如何公告)/.test(t))return null;
 if(/合作社|公會|工會|基金會|財務|收支|帳|報表|決算|改選|選舉|罷免|勸募|募款|捐|通知|開會|大會|理事會|監事會|會議|紀錄|記錄|個資|名冊|縣府|公所|補助|志工|招募|活動|登報/.test(t))return null;
 return {direct:true,category:'人民團體會務說明',title:'協會的一般會務公告：沒有統一的張貼地點或天數，先看章程',
  summary:'如果您問的是一般會務公告，不是開會通知、罷免或公益勸募公告，相關會務規定沒有統一指定張貼地點或天數。先看協會章程或既定規則；沒有規定時，可選會員平常看得到的管道，例如會址公布欄、協會網站或會員群組。\n\n特定事項要另外看規定：會員大會通常要在十五日前通知各會員，單貼公告不能取代通知（人民團體法第26條）；因罷免案開會時，罷免書及答辯書須分發給出席者並現場公告（人民團體選舉罷免辦法第36條）；公益勸募的公告及公開徵信另有期限和刊登管道（公益勸募條例第18、20條及其施行細則第5條）。',
  statutes:[P(26),ER(36),cite('公益勸募條例','D0050138',18),cite('公益勸募條例','D0050138',20),cite('公益勸募條例施行細則','D0050146',5)],notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}

if(typeof module!=='undefined'&&module.exports){module.exports=ordinaryAssociationNotice;return;}
const previous=root.verifiedRoundAnswer;
root.verifiedRoundAnswer=function(q,ctx){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 return ordinaryAssociationNotice(t)||previous.call(this,q,ctx);
};
})(typeof window!=='undefined'?window:globalThis);
