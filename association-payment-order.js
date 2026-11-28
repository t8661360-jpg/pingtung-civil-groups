(function(root){
'use strict';
const cpc=(n,title)=>({title:'民事訴訟法第'+n+'條：'+title,source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=B0010001&flno='+n});
const guide={title:'司法院：支付命令及提出異議',source:'https://www.judicial.gov.tw/tw/cp-1450-1785-e18e0-1.html'};
const model={title:'司法院：民事異議狀（對支付命令異議）',source:'https://www.judicial.gov.tw/tw/cp-1365-4072-a184f-1.html'};
const labels={payment:'法院支付命令',hearing:'法院開庭通知',unknown:'尚未確認公文標題'};
const scope=/協會|社團法人|人民團體|社會團體|理事長|總幹事/;
function route(q,active=false){
 const raw=String(q??'').trim(),t=raw.normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>440||/^(?:另問|新題|換題)|合作社|公會|工會|管委會/.test(t))return null;
 const pick=t.match(/;櫃檯確認法院文書:(payment|hearing|unknown)$/)?.[1];
 const explicitNo=/不(?:是|叫|屬於)(?:法院)?[「『]?(?:民事)?支付命令|並非(?:法院)?[「『]?(?:民事)?支付命令/.test(t);
 const hearing=/法院開庭通知|民事開庭通知|言詞辯論(?:期日|通知)/.test(t);
 const unsure=/不確定|分不清|不知道|看不懂|可能|不曉得|還沒確認|還沒看/.test(t);
 const court=/法院|司法|民事/.test(t);
 const order=/支付命令/.test(t);
 const ambiguity=(!order&&!hearing&&court&&unsure&&/通知|信|公文|文書/.test(t)&&/不確定(?:是|哪|什麼)|分不清|不知道(?:是|哪|什麼)|看不懂|不曉得(?:是|哪|什麼)|還沒(?:確認|看)/.test(t)&&!/調解通知|刑事|行政訴訟|扣押命令|執行命令/.test(t))||(order&&hearing&&unsure&&!explicitNo);
 const related=/^(?:更正|補充|不是|那|我剛|其實|剛看|剛才|確定)/.test(t)&&/法院|支付命令|開庭通知/.test(t);
 if(!pick&&!scope.test(t)&&!(active&&related))return null;
 const build=(title,summary,steps,refs,extra={})=>({direct:true,category:'團體會務｜法院文書與期限',title,summary,steps,refs,questionState:{focus:"cross-court-document"},...extra});
 if(pick==='hearing'||(!pick&&hearing&&(explicitNo||active&&!order&&related))){
   return build('法院開庭通知：先確認到庭與書面要求','民事開庭通知不是支付命令，不能套用支付命令的 20 天異議程序，也不能自行認定只寄書面就能取代到庭。',[
    ['先看通知、再確認是否須到庭','依通知確認日期、庭別、通知對象、是否指定本人到場及要帶的資料。若時間有衝突、想改期或只提交書面，請在期日前向法院書記官確認，未獲法院同意不要自行不到。'],
    ['依本案代表權判斷','協會應由依法有代表權的人辦理；總幹事職稱本身不是代表權。如要委任非律師代為訴訟，須依規定取得審判長許可。']
   ],[cpc(52,'團體代表人'),cpc(68,'非律師代理須經許可')]);
 }
 if(pick==='unknown'||(!pick&&ambiguity)){
  const clear=raw.replace(/[;；]櫃檯確認法院文書:[a-z]+$/i,'');
  return build('先辨認法院文書，再處理期限','法院的支付命令和開庭通知是兩種程序，請先看第一頁標題和文書要求；不必輸入案號、姓名、地址或上傳完整文書。',[
   ['如果封面看不懂','請用法院官網查到的電話找發文法院書記官，核對文書性質、送達日、期限或庭期，不要只看信封，也不要等到最後一天。']
  ],[guide],{choiceHeading:'文書第一頁寫的是哪一種？',choices:Object.entries(labels).map(([id,label])=>({label,question:clear+'；櫃檯確認法院文書:'+id}))});
 }
 if(!pick&&(!order||explicitNo))return null;
 // Avoid answering the creditor’s different application procedure as a debtor’s objection.
 if(!pick&&/(?:我們|協會).{0,12}(?:要|想|怎麼|如何|打算).{0,8}(?:聲請|申請|發).{0,5}支付命令/.test(t)&&!/收到|異議|通知/.test(t))return null;
 const steps=[
  ['有爭議：向發命令的法院提出異議','被列為債務人的人或團體，可在合法送達後 20 日內，向發命令的法院對全部或一部提出異議，不必說明理由。只爭執一部分時，寫清楚異議的金額或範圍。'],
  ['寄到舊址、轉收或寄存：先核對送達','實際轉交到手的日期不一定是法律上的送達日，也不能只憑舊址斷定無效。留好信封、招領或寄存資料，立刻向發命令的法院核對送達日、異議截止日及收件方式；不要等到開庭或縣府回覆。'],
  ['異議後的程序','在期限內合法異議的範圍，支付命令失效，該範圍轉入民事訴訟或調解；之後若另收到法院通知，再按通知辦理。未依法及時異議的範圍，支付命令可以成為強制執行的依據。']
 ];
 if(/總幹事|代送|代簽|代辦|理事長|代表人|委任|簽名/.test(t))steps.push(['代送與代簽不是一回事','總幹事拿已由有權代表的人簽妥的異議狀去遞交，和用自己的名字代表協會提出異議不同。先確認文書列的債務人是協會或個人、簽署權和應附文件，必要時向法院確認。總幹事不因職稱自動取得訴訟代理權。']);
 if(/縣府|補助|申報|備查|通報/.test(t))steps.push(['向縣府反映不等於向法院異議','縣府不是支付命令異議的收件機關。若另牽涉縣府補助、契約或團體內部通報，再依各自的規定核對，不能用該程序替代法院異議，也不宜假定只要收件就一律要向縣府申報。']);
 return build('法院支付命令：不等開庭，先核對異議期限','支付命令本身不是開庭通知，收到它不等於理事長須親自出庭。有異議時，應依送達期限先向發命令的法院處理。',steps,[guide,cpc(516,'20 日期限及全部或一部異議'),cpc(519,'異議後程序'),cpc(521,'未異議的執行效力'),model]);
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationPaymentOrder=route;
})(typeof window!=='undefined'?window:globalThis);
