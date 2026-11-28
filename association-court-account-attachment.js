(function(root){
'use strict';
const law=(title,n)=>({title,source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=B0010004&flno='+n});
const civil=law('強制執行法第12條：執行程序的聲請或聲明異議',12);
const bank=law('強制執行法第119條：第三人接到命令後的聲明異議',119);
const limit=law('強制執行法第115條：扣押、收取、移轉及支付轉給命令',115);
const service=law('強制執行法第118條：命令送達及效力',118);
const finder={title:'司法院：法院一覽與各法院聯絡方式',source:'https://www.judicial.gov.tw/tw/cp-1898-119101-8a7a0-1.html'};
const grants={title:'屏東縣政府對民間團體補助經費作業要點（官方公告附件）',source:'https://portal.ptc.edu.tw/bulletin/view.php?sn=B114003910'};
const finance={title:'社會團體財務處理辦法第16條：團體收入存放',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0050097&flno=16'};
const norm=x=>String(x??'').normalize('NFKC').replace(/\s+/g,'');
function route(q){
 const raw=String(q??'').trim(),t=norm(raw);
 if(!t||t.length>475||!/協會|社會團體|社團法人|社區發展協會/.test(t))return null;
 if(/法院.{0,13}(?:刑事|沒收)|檢察署|國稅局|行政執行分署|員警|警示帳戶|詐騙警示|工會|合作社|公司銀行帳戶|公會/.test(t.replace(/(?:不是|並非)(?:工商|商業|工業)?公會/g,'')))return null;
 const what=/法院|法官|民事執行處|執行法院|法院命令/.test(t)&&/扣押|凍結|查封|債務人|禁止處分|限制取用|強制執行|移轉命令|收取命令|支付命令|帳戶被.{0,4}限制|銀行.{0,15}(?:只能核對|請核對)/.test(t);
 if(!what||!/帳戶|帳號|戶名|公帳|銀行|存款|公款|補助款|戶頭/.test(t))return null;
 const type=t.match(/執行文件確認:(扣押|收取移轉支付|只有通知|不清楚)/)?.[1];
 const clean=t.replace(/(?:不知道|查不到|沒有看到|不確定)(?:有沒有|是否|有無)?(?:再發|收到)?(?:法院)?(?:收取|移轉|支付)(?:轉給)?命令/g,'').replace(/(?:不是|沒有)(?:收到)?(?:法院)?(?:收取|移轉|支付)(?:轉給)?命令/g,'');
 const unsure=type==='只有通知'||type==='不清楚'||!type&&/沒有看到命令|只有銀行通知|銀行只(?:是)?(?:來電|請核對|通知)|不知道.{0,6}(?:哪種|是否有)命令/.test(t);
 // A court payment order for the debt itself (支付命令) is not necessarily an
 // instruction to the bank to pay under §115(2).
 const collection=type==='收取移轉支付'||!type&&!unsure&&/(?:銀行|第三人).{0,10}(?:收到|接到).{0,8}(?:收取|移轉|支付轉給)命令|(?:已收到|又收到|又發了|這張是|發出|收到)(?:法院)?(?:收取|移轉|支付轉給)命令|命銀行.{0,10}(?:付給法院|付給債權人)/.test(clean);
 const attached=type==='扣押'||!type&&!unsure&&!collection&&/扣押命令|法院.{0,9}(?:扣押|凍結|查封)|被法院扣押/.test(t);
 const personal=/債務人(?:是|為|寫|寫的是|列的是)(?:理事長|負責人|前任|某會員).{0,5}(?:本人|個人)?|命令.{0,14}(?:理事長|負責人).{0,4}(?:本人|個人)|不是協會.{0,8}(?:是|而是)(?:理事長|負責人)/.test(t);
 const org=!personal&&/(?:命令上的)?債務人(?:寫的是|是|為|等於)(?:同一個)?(?:協會|社會團體|本會)|債務人(?:相同|相符|一致)|(?:戶名|帳戶).{0,9}(?:和|與|跟)債務人(?:是|相同|一致|同名)|債務人和戶名.{0,8}(?:都是|同為)協會/.test(t);
 const payOrder=/支付命令/.test(t)&&!/支付轉給命令/.test(t)&&!collection;
 const funded=/補助|專款|撥款/.test(t);
 const countyAsked=/(?:報|通報|通知|問|找|告知).{0,6}(?:縣府|縣政府|登記機關|主管機關)|(?:縣府|縣政府).{0,5}(?:備查|通報)/.test(t);
 const pending=funded&&/(?:補助.{0,6})?(?:還沒|尚未|未)(?:撥款|撥|入帳)|補助還在申請/.test(t);
 const next=collection?'若已核實銀行收到法院的收取、移轉或命銀行支付轉給的命令，已不是只有扣押；是否已收取、移轉或支付，仍看命令類型、送達及實際處理。不能光看餘額判定債務已清償。':
  attached?'只有法院扣押命令，先限制命令範圍內的存款取用或處分，禁止銀行就該部分向債務人付款；不等於錢已付給債權人。法院另發收取、移轉或命第三人支付轉給的命令，才是不同階段。':
  payOrder?'文件名稱若只是法院「支付命令」，不能把它等同於命銀行交付扣押款的命令；核對文書全名、收件人、發文單位及目前有沒有銀行存款執行命令。':
  '只有銀行通知，不能確定已扣押或已付款。先可向銀行官方窗口、發文法院的民事執行處核對實際文書及目前狀態；扣押只是限制取用，和收取、移轉或命銀行支付轉給是不同階段。';
 const role=personal?'您更正說被列為債務人的是理事長個人；這不能直接證明協會自己的帳戶也被扣押。請核對命令實際列的帳戶、戶名、範圍及當事人，有誤或權利受影響時，儘快找發文法院民事執行處或律師。':
  org?'您說命令上的債務人與戶名都是協會，先向發文法院或銀行確認送達日期、限制金額及有沒有後續命令。':
  '先查命令被列的債務人、銀行記錄的戶名、受限制的帳戶和金額、送達日期與發文法院。不能只因為理事長個人有債，就認定協會帳戶也在命令內。';
 const procedural='依強制執行法第119條，銀行這類第三人若對存款債權或數額等有爭議，是收受法院命令後10日內書面聲明異議；這不是協會作為債務人的一律10日期限。第12條的執行程序異議是當事人或利害關係人可在執行終結前提出，提出不會自動停止執行或解凍。爭執債權本身或款項權利，可能走不同程序，請儘快依文書向發文法院或律師核對。';
 const award=(pending?'補助還沒撥，不把預計入帳當成已被扣的存款，也不猜之後一定能撥：':'帳內若有已撥縣府專款，不能只因經費叫「補助」就認定免扣押，亦不能只憑帳戶受限就認定補助已取消。')+
  '是否需通知、能否展延或調整撥款、執行或核銷方式，查核定函及原補助計畫規定，聯絡核定函上的原補助承辦；不一律推定要報團體登記機關。法院命令仍找發文法院。不要自行改匯理事長或其他個人的帳戶。';
 const opts=!type&&!collection&&!attached&&!payOrder&&raw.length<310;
 const steps=[['先辨認法院文件及錢是否已轉出',next+'通常法院扣押等命令送達銀行這類第三人時發生效力（第118條）。'],['核對法院寫的債務人和銀行戶名',role],['不要把銀行的10日直接算給協會',procedural]];
 if(funded)steps.push(['補助要找原核定機關，法院命令找民事執行處',award]);
 else if(countyAsked)steps.push(['法院命令與縣府會務通報分開','上述強制執行規定並未要求協會一律向縣府通報。先找發文法院的民事執行處；如有縣府補助、委辦或其他個別規定，另查原核定函或契約並向業務承辦確認。']);
 if(/薪水|工資|場租|租約|廠商/.test(t))steps.push(['近期有應付款，先分列到期日與可合法動用的款項','工資、租金、廠商款與存款限制分開核對。請財務人員據實列出金額及到期日，盡速向法院、原補助機關或專業人士核對，不自行挪用受限或指定用途款。']);
 return {direct:true,category:'協會｜法院扣押、存款與補助',title:'協會帳戶被法院扣押，不等於款項已付給債權人',summary:personal?'命令若列理事長個人，不能據此判定協會帳戶已受扣押。先確認實際文書和帳戶範圍。':collection?'已核實是收取、移轉或命銀行支付的命令，就不只是先扣押；錢是否已出去，還要看實際處理。':attached?'只有扣押命令是限制取用，不表示錢已付給債權人。'+(funded?'若影響補助，另找原補助機關。':''):'先確認是扣押、後續收取或移轉命令，還是只有銀行通知。',
  steps,refs:[limit,service,bank,civil,finder,...(funded?[grants,finance]:[])],actions:[{label:'聯絡承辦',view:'contact',sub:''}],questionState:{focus:opts?'clarify':'compound'},
  ...(opts?{choiceHeading:'目前看到哪一類文件？',choices:[['法院扣押命令','扣押'],['法院收取、移轉或命銀行支付','收取移轉支付'],['只有銀行通知','只有通知'],['還不確定文件種類','不清楚']].map(([label,key])=>({label,question:raw+'；執行文件確認：'+key+'。'}))}:{})};
}
if(typeof module==='object'&&module.exports)module.exports=route;
else root.verifiedAssociationCourtAttachment=route;
})(typeof window==='object'?window:globalThis);
