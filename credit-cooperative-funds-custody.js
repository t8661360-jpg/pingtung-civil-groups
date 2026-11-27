(function(root){
'use strict';
const refs=[
 {title:'信用合作社法第21條：內部控制及稽核',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=G0380058&flno=21'},
 {title:'金管會金融控股公司及銀行業內控與稽核辦法第2、10、12條',source:'https://law.fsc.gov.tw/LawContent.aspx?id=FL049894'},
 {title:'金管會金融機構通報重大偶發事件規範',source:'https://law.fsc.gov.tw/LawContent.aspx?id=GL002087'}
];
const general=['禁止把機構款項放入個人帳戶','不論是客戶存款、代收款或社內款項，應走信用合作社核定的業務、出納與帳務流程，由機構正式入帳及留存交易憑證，依規定使用機構受控帳戶。不能把出納、理事或員工的私人郵局、銀行戶頭當作收款、代管或隔夜過渡帳；先存一下、事後再轉回也無法取代正式流程。'];
const internal=['已入私人帳戶或帳款不符：先停止同樣做法並保全紀錄','保留入帳、交易憑證與可查的往來紀錄，立即經機構正式管道回報主管、法遵與內部稽核，核對機構帳、款項來源與應入帳方式。不要私下改帳、抹掉紀錄、找別人代收或擅自從他人帳戶轉款。若達金管會重大偶發事件通報要件，應由金融機構依規定處理，信用合作社依規也知會所在地縣市政府；不把所有狀況直接認定為犯罪。'];
const customer=['如果您是存戶或代付款的人','先不要再轉入工作人員私人帳戶。用信用合作社官方公布的電話、分社或申訴管道，確認機構指定的收款帳號與您的存款是否正式入帳；保存當初的收據、通知和轉帳資料，不再把完整帳號、存摺或身分資料貼在聊天中。有疑義可走正式金融消費申訴途徑，不因私人轉帳就保證已是受保障存款。'];
const different=['不要把信用合作社當一般合作社或借用別的規則','信用合作社本身是受金融監理的機構，《信用合作社法》第21條要求建內控及稽核，金管會辦法第2條納入銀行業，第12條要求出納、存款、會計流程與權限分工。一般協會把自己的團體款存入合作社的團體帳戶，則是另一個問題。'];
function singleCreditCustody(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>220||!/信用合作社|信合社/.test(t)||!/私人|個人|出納.{0,8}(?:自己|戶頭|帳戶)|員工.{0,8}(?:自己|戶頭|帳戶)|理事.{0,8}自己的/.test(t)||!/帳戶|帳號|戶頭|郵局|存摺/.test(t)||!/款|收的錢|資金|存款|存一下|要我匯|代收|先存/.test(t))return null;
 const customerSide=/我是存戶|存戶|存款戶|請我匯|要我匯|叫我匯|行員.{0,10}(?:叫我|請我|讓我|要我)|客戶被要求/.test(t);
 const institution=/我們(?:是)?(?:信用合作社|信合社)|(?:信用合作社|信合社)(?:本身|的出納|的行員|的員工|存款機構)|出納.{0,12}(?:社裡|社內|團體收到)|本社|金融機構|存款機構/.test(t);
 if(/協會|人民團體|社團法人|一般合作社/.test(t)&&!customerSide&&!institution)return null;
 const ambiguous=/不確定|搞不清楚|還不知道|沒看到戶名|不清楚/.test(t)&&!/已匯|先放|已(?:經)?收|出納.{0,6}(?:把|存)/.test(t);
 if(ambiguous&&!customerSide) return {direct:true,category:'金融機構｜信用合作社資金業務分流',title:'先認清是正式機構帳戶還是私人帳戶',summary:'若是信合社的收款或存款，先不要匯到未核實的帳戶。請用信用合作社官方電話或親洽分社核對戶名及入帳流程。不用提供帳號或姓名。',steps:[different],refs,questionState:{focus:'compound'},choiceHeading:'哪一種情況最符合？',choices:[
  {label:'信合社員工代收機構款',question:'我們是信用合作社，員工能用自己私人帳戶代收機構款嗎？'},
  {label:'我是存戶，被要求匯款',question:'我是信用合作社存戶，被行員要求匯存款到個人帳戶，安全嗎？'}
 ]};
 if(!institution&&!customerSide&&!/(?:員工|出納|主管|理事|經理|行員).{0,14}(?:私人|個人|自己)|(?:私人|個人).{0,8}(?:代收|收存款)/.test(t))return null;
 return {direct:true,category:'金融機構｜信用合作社資金業務分流',title:'信用合作社的收款不得用工作人員私人戶頭',summary:customerSide?'先不要匯到行員私人帳戶。透過信用合作社的官方管道核對收款帳號及是否已正式入帳。':'不可以。信用合作社收到的機構款或客戶存款，不能暫放出納的個人郵局或銀行戶頭，要走信用合作社的正式收款與入帳流程。',steps:customerSide?[customer,general,different]:[general,different,internal,customer],refs,questionState:{focus:'compound'}};
}
function creditCustody(q, associationAnswer){
 const t=String(q||'');
 const parts=t.split(/[；;？?。]|[，,]?(?:另外|順便|還想問|再問)/).map(x=>x.trim()).filter(Boolean);
 if(parts.length===2&&typeof associationAnswer==='function'){
  for(const a of [0,1]){
   const credit=singleCreditCustody(parts[a]), association=associationAnswer(parts[1-a]);
   if(!credit||credit.choices||!association||association.choices||!/協會|社會團體/.test(parts[1-a]))continue;
   const pair=a===0?[credit,association]:[association,credit];
   return {...credit,title:'信合社自己收款與協會帳戶是兩件事',summary:pair.map(x=>x.summary).join(' '),steps:pair.flatMap(x=>x.steps||[]),refs:pair.flatMap(x=>x.refs||[])};
  }
 }
 return singleCreditCustody(t);
}
if(typeof module!=='undefined'&&module.exports){module.exports={creditCustody};return;}
root.verifiedCreditCooperativeCustody=creditCustody;
})(typeof window!=='undefined'?window:globalThis);
