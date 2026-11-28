(function(root){
'use strict';
const law='https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050131';
const refs=[
 {title:'志願服務法第3、7、16條：適用、服務計畫與意外事故保險',source:law},
 {title:'屏東縣政府對民間團體補助經費作業要點第3、5、7、8、10點',source:'https://ptc.familyedu.moe.gov.tw/fileRename.aspx?fid=40994&kid=2&site_id=19&uid=3454'}
];
const duty=['誰負責投保，不是誰一定要出全部保費','依志願服務法第16條，由志願服務運用單位為其志工辦理意外事故保險。若協會就是該服務計畫的運用單位，應由協會負責辦理；有合規補助可以依核定用途支應，沒有補助也不能把保障擱置。勿讓志工在未確認保障生效時先上工。'];
const funding=['屏東補助可否核銷，要看該案的核定項目','縣府一般補助作業要點第5點把保險費列為與團體宗旨有關的研習、參訪、觀摩等所列活動可補助的項目之一，但不代表這一案已核准，也不代表全年志工保費自動都可以報。核對計畫、核定函和經費表的保險種類、活動、期間、對象與額度；以實際符合核定用途的部分報支，不重複報支；有專案規定時也要一併核對。'];
const changes=['場地費不是保險費，不要自行流用','如果核定表沒有志工意外事故保險，或只核准某一次活動，請先向原補助機關確認能否辦理變更、如何取得核准；未獲准前不要把場地費改列保險補助或先報後補。若不能用這筆補助，可用合法自籌或其他符合用途的經費先把保障安排好，不要為了等補助讓志工無保障服務，也不要假定保單可追溯。'];
const scope=['先識別志工、短期協助者與受僱者','第16條處理志願服務法適用的志工及其運用單位，不把一般參加民眾、偶發親友協助或受僱人員都當成正式志工。活動公共意外責任保險、參加者保險、志工意外保險與受僱人員依法適用的保險目的不同，不可只看保單名稱就互相替代。'];
const records=['確認保障與留存核銷證明','核對被保險對象、服務日期、保障範圍及保單實際生效；核銷依核定要求留存憑證與保障證明；一般要點第8點列核准文件、領款收據、實際支用明細及支用單據。有兩個以上機關補助須列明各項目及金額。不要把志工名冊、證號或保單個資貼在聊天中。'];
function volunteerInsurance(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(/活動參與者與短期幫手/.test(t)&&/並未按計畫運用為正式志工/.test(t)&&/協會/.test(t))
  return {direct:true,category:'活動保障｜參加者與短期協助',title:'活動參與者不直接套用正式志工投保義務',summary:'請依活動與場地規定、補助條件、參加方式及人員實際角色，向主辦單位及承保機構核對公共意外責任或參加者保障。若實際是依法運用的志工，再依第16條由運用單位辦理。',steps:[scope,records],refs:refs.slice(0,1),questionState:{focus:'compound'}};
 if(!t||t.length>230||!/(?:志工|志願服務)/.test(t)||!/(?:保險|保費|加保|投保|先不保|在保)/.test(t)||/祥和.{0,8}(?:有幾隊|幾歲|資格|隊數)|理賠|保單受益人|續保年齡/.test(t))return null;
 if(/監事/.test(t)&&/(?:兼|擔任|當)/.test(t)||/會費/.test(t)||/(?:編|列)(?:在|入|進)?.{0,4}預算/.test(t))return null; /* 第37輪交叉：監事兼志工、保費用會費／列預算交給 round-fixes */
 const location=/協會|社區(?:發展)?協會|社會團體|屏東|運用單位|縣府|本會/.test(t);
 const cost=/自費|保費|出錢|自己出|補助|核銷|出資|誰付|誰出|經費|場地費|挪|流用/.test(t);
 const delay=/先不保|先服務|先上工|等.{0,6}(?:補助|核定)|晚點保|事後保|還沒投保/.test(t);
 const change=/挪|流用|場地費|核定.{0,6}(?:沒有|沒列|沒寫|不含)|變更.{0,6}項目|項目.{0,6}(?:改成|改列)/.test(t);
 if(!location||!cost&&!delay&&!/誰負責|一定要|要不要/.test(t))return null;
 if(/勞保|勞退|雇傭|雇用|聘僱/.test(t)&&!/志工(?:的|要|意外|保費|保險)|志願服務運用單位/.test(t))return null;
 const uncertain=/不確定|不知道|稱不上|分不清/.test(t)&&/志工(?:還是|或)|算不算.{0,4}志工|只是.{0,6}幫忙|一般活動(?:參加者|幫手)/.test(t);
 if(uncertain) return {direct:true,category:'志願服務｜人員保障與屏東補助',title:'先看這些人是正式志工還是活動參與者',summary:'兩者可能需要不同的保障。先確認是不是依志願服務計畫指派服務的志工；不用提供姓名、名冊或證號。若是正式志工，由運用單位在安排服務前確認意外事故保險已生效。',steps:[scope],refs:refs.slice(0,1),questionState:{focus:'compound'},choiceHeading:'您要問哪一種？',choices:[
  {label:'正式志工的意外保險',question:'協會正式志工的意外保險要自己出錢嗎，可用縣府補助？'},
  {label:'活動參與者與短期幫手',question:'協會的活動參與者與短期幫手，並未按計畫運用為正式志工，該怎麼確認保險？'}
 ]};
 let summary=change?'先不要把場地費自行改成志工保費。志工保障要先安排，補助能否變更或核銷需查核定表及原補助機關規定。':delay?'不能等到縣府補助下來才替正式志工保：先由運用單位辦理意外事故保險，並確認保障生效後再安排服務。':'志工意外事故保險由志願服務運用單位辦理，不等於協會只能用自有經費。可否用屏東縣補助，要看這個案子核定的用途和金額。';
 return {direct:true,category:'志願服務｜人員保障與屏東補助',title:'志工意外事故保險：投保責任與保費來源分開',summary,steps:[duty,...(cost?[funding,changes]:[]),scope,records],refs:cost?refs:refs.slice(0,1),questionState:{focus:'compound'}};
}
if(typeof module!=='undefined'&&module.exports){module.exports={volunteerInsurance};return;}
root.verifiedAssociationVolunteerInsurance=volunteerInsurance;
})(typeof window!=='undefined'?window:globalThis);
