(function(root){
'use strict';
const cite=(name,p,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+p+'&flno='+n});
function associationCooperativeConversion(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!/協會|社會團體|社團法人/.test(t)||!/合作社/.test(t)||/信用合作社|保險合作社|合作社(?:改成|變成|轉成)(?:協會|社團)/.test(t))return null;
 if(!/(?:改名|更名|換名字|改章程|轉型|改組|改制|變更組織|用原.{0,8}立案).{0,12}(?:合作社|變成|轉成|改成|成立)|(?:協會|社會團體|社團法人).{0,15}(?:直接)?(?:改成|轉成|變成|改制為|改組為|轉型為|轉型成|轉為)合作社/.test(t))return null;
 return {direct:true,category:'協會與合作社設立',title:'協會不能只靠改名變成合作社，要另依合作社法辦理設立',
  summary:'協會改名是變更原協會的章程，不會把協會的立案變成合作社的成立登記（人民團體法第12、27、54條；合作社法第6、8、9條）。\n\n如果要成立一般合作社，須有七人以上，召開創立會、通過章程、選出理監事並組織社務會，再於創立會後一個月內，備妥會議紀錄、章程和社員名冊，向所在地主管機關申請成立登記。\n\n原協會會員不會因為改名就自動變成社員，原有財產、契約或補助款也不能只改名就當作由新合作社承接。如果還要調整原協會的運作、財產或補助款，請先把兩邊要怎麼處理向主管機關確認。',
  statutes:[cite('人民團體法','D0050091',12),cite('人民團體法','D0050091',27),cite('人民團體法','D0050091',54),cite('合作社法','D0050112',6),cite('合作社法','D0050112',8),cite('合作社法','D0050112',9)],notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
if(typeof module!=='undefined'&&module.exports){module.exports=associationCooperativeConversion;return;}
root.associationCooperativeConversion=associationCooperativeConversion;
})(typeof window!=='undefined'?window:globalThis);
