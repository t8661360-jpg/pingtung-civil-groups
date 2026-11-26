(function(root){
'use strict';
const cite=n=>({title:'菸害防制法第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=L0070021&flno='+n});
const health={title:'國民健康署：各縣市菸害申訴專線',source:'https://www.hpa.gov.tw/Pages/ashx/GetFile.ashx?lang=c&sid=295fe51182c849118b6d59d305f9865c&type=1'};
const contact='若在屏東，請記下時間、地點及情況，可向屏東縣衛生局菸害申訴專線 08-738-5372 反映，也可用市話撥 0800-531-531。';
function meetingSmokeFree(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!/會議|開會|大會|理事會|監事會|會場/.test(t)||!/(?:抽|吸|點|禁)(?:菸|煙)|二手(?:菸|煙)/.test(t))return null;
 if(/電子菸|電子煙|加熱菸|大麻|戒菸班|宣導課程|菸稅|煙火|煙霧|消防/.test(t))return null;
 const common={direct:true,category:'開會場所與菸害防制',notes:[],actions:[]};
 if(/戶外|室外|露天|廣場|庭院|騎樓|門口|陽台/.test(t)){
  return {...common,title:'戶外開會遇到抽菸：先查該場所是否依法禁菸或有禁菸公告',
    summary:'不能單靠「在戶外」判斷。請看廣場或場地是否屬法定禁菸場所、是否有主管機關公告，或是否設有合法吸菸區。會議室內依法全面禁菸，但戶外要看具體地點，不宜只憑有人抽菸就認定違規。\n\n若是禁菸區，可請場地負責人或工作人員勸阻。'+contact,
    statutes:[cite(18),cite(19),cite(21),health]};
 }
 return {...common,title:'會議廳、會議室內全面禁菸，理事長也不能抽菸',
  summary:'如果是在會議廳或會議室內開會，不能抽菸。菸害防制法第18條第1項第9款明定這些場所全面禁菸，不因吸菸者是理事長或主席、或會議只開放會員而例外。若改在戶外，須另外確認場地的禁菸規定。\n\n有人在禁菸場所吸菸時，場地負責人或工作人員應勸阻，其他在場者也可以勸阻（第21條）。經查證在禁菸場所吸菸，依法可處新臺幣2,000元至10,000元罰鍰（第40條第2項）。'+contact,
  statutes:[cite(18),cite(21),cite(40),health]};
}
if(typeof module!=='undefined'&&module.exports){module.exports=meetingSmokeFree;return;}
const previous=root.verifiedRoundAnswer;
root.verifiedRoundAnswer=function(q,ctx){return meetingSmokeFree(q)||previous.call(this,q,ctx);};
})(typeof window!=='undefined'?window:globalThis);
