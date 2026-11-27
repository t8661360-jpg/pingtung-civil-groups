(function(root){
'use strict';
const law=(title,p)=>({title,source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+p});
const assocRefs=[law('人民團體法第9、10、11條：先立案，再選擇辦理法院法人登記','D0050091'),
 {title:'司法院：辦理社團法人登記之手續',source:'https://www.judicial.gov.tw/tw/cp-1358-2734-9a89f-1.html'},
 {title:'地方法院社團法人登記應備文件範例（請核對管轄法院清單）',source:'https://sld.judicial.gov.tw/tw/dl-17945-2ea191c6617d42ee877d10f35a851306.html'}];
const coopRefs=[law('合作社法第2、5、9、10條：法人及成立登記','D0050112'),law('合作社法施行細則第8條：主管機關核發成立登記證','D0050113')];
const a=['一般協會有兩個不同階段','先向人民團體主管機關辦成立及核准立案，領立案證書。若另要取得社團法人資格，再向主事務所所在地之管轄地方法院申請法人登記。法院常需立案證書、理事長當選證明、主管機關核准或備查文件、章程和會議紀錄等，按管轄法院清單備齊，不是只交一張證書。依第11條，完成法人登記後30日內把法院登記證書影本送原主管機關備查。'];
const c=['普通合作社不是以協會立案證書去法院登記','合作社依法為法人，走合作社主管機關的成立登記。創立會後依合作社法第9條於一個月內，檢具創立會紀錄、章程和社員名冊等依法辦理；核准後由合作社主管機關發給成立登記證。這不是協會立案後另申請地方法院社團法人登記的程序。專業業別的許可、金融及稅籍另外核對。'];
const x=['兩種都還沒有決定時，先釐清要做的事','是以會員共同興趣或公益會務為主，還是社員共同經營事業或服務？若只是另一機關說要「法人證明」，先確認它要求的文件名稱及用途，再選擇正確制度。不要把身分證、會員或社員名冊與財產文件放在聊天裡。'];
const opts=[
 {label:'一般協會要辦社團法人',question:'一般協會已立案，現在要向法院辦社團法人登記，準備什麼證書？'},
 {label:'要成立一般合作社',question:'我已確定要成立一般合作社，需到法院登記嗎，會拿到什麼證書？'},
 {label:'仍不確定要成立哪一種',question:'我仍不確定要成立哪一種團體，法院登記要的證書是協會還是合作社的？'}
];
function certificate(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>210||!/法院登記|法院.{0,9}(?:法人登記|登記)|社團法人.{0,7}登記/.test(t)||!/證書|證明|哪一張|立案證|備什麼|要什麼/.test(t)||/變更|清算|解散|換發|遺失|補發|信合社|信用合作社|祭祀公業|財團法人|公司|地政/.test(t))return null;
 const social=/一般協會|協會|人民團體/.test(t), coop=/合作社/.test(t);
 if(!social&&!coop)return null;
 const unknown=/(?:還沒確定|仍不確定|不確定|不知道|分不清).{0,10}(?:要成立|要設|哪一種團體|團體類型|是協會還是合作社)/.test(t);
 const base={direct:true,category:'法人及團體登記｜區分證書',questionState:{focus:'compound'}};
 if(social&&coop||unknown){
  const stop=/仍不確定要成立哪一種團體/.test(t);
  return {...base,title:'先選組織，協會與合作社不是同一張證書',summary:'一般協會先領主管機關的立案證書，想辦社團法人再去法院；一般合作社向合作社主管機關申請成立登記，核准後領成立登記證。若還未決定，先不要準備一套通用的法院文件。',steps:[a,c,x],refs:[...assocRefs,...coopRefs],...(!stop?{choiceHeading:'您打算辦哪一類？',choices:opts}:{})};
 }
 if(coop)return {...base,title:'一般合作社：向主管機關登記，領成立登記證',summary:'一般合作社不是走地方法院社團法人登記。創立會後向合作社主管機關登記，核准後領成立登記證。',steps:[c],refs:coopRefs};
 return {...base,title:'一般協會辦社團法人：先備立案證書和當選證明',summary:'已有主管機關的立案證書後，向管轄地方法院辦社團法人登記。先備立案證書、負責人當選證明及主管機關的核准設立文件，然後照該法院清單備齊。',steps:[a],refs:assocRefs};
}
if(typeof module!=='undefined'&&module.exports){module.exports={certificate};return;}
root.verifiedAssociationCoopCourtCertificate=certificate;
})(typeof window!=='undefined'?window:globalThis);
