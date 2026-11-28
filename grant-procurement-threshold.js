(function(root){
'use strict';
const ref=(title,source)=>({title,source});
const law=(title,pcode,n)=>ref(title+'第'+n+'條','https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+pcode+'&flno='+n);
const g=n=>law('政府採購法','A0030057',n), r=n=>law('政府採購法施行細則','A0030058',n);
const pcc=ref('工程會：政府採購法公告金額（150萬元）','https://www.pcc.gov.tw/content/cp.aspx?lang=1&n=7C2882A8AA7EB4B0');
const county=ref('屏東縣政府對民間團體補助經費作業要點（縣府公告附件）','https://portal.ptc.edu.tw/bulletin/view.php?sn=B114003910');
const art=ref('法人或團體接受機關補助辦理藝文採購監督管理辦法','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=H0170154');
const base={direct:true,questionState:{focus:'compound',domain:'grant-procurement-threshold'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
function money(q,pattern){
 const m=pattern.exec(q);
 if(!m)return null;
 const n=Number(m[1].replaceAll(',',''))*(m[2]==='萬'?1:m[2]==='千'?0.1:m[2]==='億'?10000:0.0001);
 return Number.isFinite(n)&&n>0?n:null;
}
function route(input){
 const raw=String(input??'').trim(),q=raw.normalize('NFKC').replace(/\s/g,'');
 if(!q||q.length>600||/公益勸募許可|行車|買股票|證券|信用合作社/.test(q))return null;
 const scope=/協會|社區|民間團體|社團|公益團體|藝文團體|受補助團體|合作社|補充:[^。]{0,30}採購/.test(q);
 const authority=/縣府|縣政府|公所|中央|國家|機關|公部門|教育處|文化處|政府/.test(q);
 const funded=/補助|獎助|機關.{0,12}(?:捐助|出錢)|縣府補|中央補|發包|代辦採購/.test(q);
 const procurement=/採購|招標|買.{0,10}(?:設備|器材|東西)|設備.{0,8}(?:預算|費|價|採購)|比價|報價|器材.{0,8}講師|拆.{0,4}發票|買屋/.test(q);
 const focused=/採購法|招標|監督|公告金額|達.{0,4}半數|過半|比價|核定函|發包|代辦採購|幾家|能不能買|先買|購買|預算|設備.{0,6}費/.test(q);
 const unknownSource=/兩(?:家|邊|筆|個)補助/.test(q)&&/只知道|還不知道|不確定/.test(q);
 if(!scope||(!authority&&!unknownSource)||!funded||!procurement||!focused)return null;
 if(/發票.{0,16}(?:都想用|兩邊.{0,4}全額|各.{0,3}全額)|重複核銷/.test(q)&&!/採購法|招標|公告金額|半數/.test(q))return null;
 const selected=/性質確認:([^。；]+)/.exec(q)?.[1]??'';
 const privateGrant=/非政府補助|不是政府補助|完全自籌|只有私人.{0,8}(?:贊助|捐助)/.test(q);
 const clarified=/補充:.*(?:全用於這批|同一採購補助|機關買服務|委託代辦採購)/.test(q);
 const unclear=!selected&&!clarified&&/可能.{0,35}(?:也可能|還是|或)|不知道補到哪|只知道.{0,8}(?:活動總額|計畫總額)|不確定.{0,14}(?:核定|補助還是|哪一筆)/.test(q);
 const modes=q.replace(/不是(?:機關)?委託(?:代辦)?採購|不是代辦採購|不(?:是|屬)發包/g,'').replace(/補充:[^；]{0,16}不是同一採購/g,'');
 const serve=selected==='機關買服務'||(!selected&&!unclear&&/機關買服務|發包.{0,12}(?:提供|請|承作)|政府委託.{0,7}(?:辦課|教課|上課|執行服務)/.test(modes)&&!/補助.{0,14}自辦/.test(modes));
 const delegate=selected==='委託代辦採購'||(!selected&&!unclear&&/(?:縣府|機關|政府).{0,8}委託.{0,8}(?:代辦|代為)採購/.test(modes));
 const arts=/藝文採購|藝文團體.{0,70}(?:演出|展演|創作)|補助.{0,55}(?:受託|舞團|劇團|團隊).{0,14}演出/.test(modes)&&!/不是藝文|非屬藝文/.test(q);
 const divided=/拆.{0,7}(?:發票|單|批)|分批|同規格.{0,9}器材|化整為零|能先拆開/.test(q);
 const u='(萬|千|億|元)';
 const n='([0-9][0-9,.]*)';
 const t=money(q,new RegExp('(?:採購計畫總價|採購預算|採購總價|採購金額|同一採購總價|設備採購|採購|器材報價|設備報價|報價)[為是:約]*'+n+u));
 const parts=[];
 for(const m of q.matchAll(new RegExp('(?:縣府|縣政府|中央(?:機關)?|公所|文化處|教育處|政府|甲機關|乙機關)(?:那|分別|的)?(?:補助|補|核給)?[為是:約]*'+n+u,'g'))){
   const next=q.slice(m.index+m[0].length,m.index+m[0].length+48).split(/[，,。；;？?]/)[0];
   if(/只補|只用於|另補|不同場次/.test(next)&&/講師|其他|另一|不同/.test(next))continue;
   if(/非同一採購|不是同一採購|不同採購|另件|另一案/.test(next)&&!/全用於這批|同一採購的補助/.test(next))continue;
   const v=money(m[0],new RegExp(n+u));if(v!==null)parts.push(v);
 }
 const separate=/不是同一採購|非同一採購|不同(?:個|項)?採購|只補不同場次/.test(q);
 const generic=money(q,new RegExp('(?:同一採購補助|這筆補助|補助金額|政府補助|補助總額|補助)[為是:約]*'+n+u));
 const ambiguousMoney=/活動總(?:額|預算)|整場活動|整案補助|不清楚.{0,12}(?:補|哪案)|不知道.{0,12}(?:補到|哪筆)/.test(q)&&!/不是領整個活動/.test(q)&&!/只補不同場次|全用於這批|同一採購補助/.test(q);
 const f=parts.length?parts.reduce((x,y)=>x+y,0):!separate?generic:null;
 const know=t!==null&&f!==null&&t>=f&&!ambiguousMoney&&!unclear;
 const eligible=know&&f>=150&&f*2>=t;
 const knownShort=know?(f<t/2?'沒達本採購金額半數': '達半數')+'，'+(f>=150?'補助本身達150萬元':'補助本身未達150萬元'):'';
 const show=x=>String(Math.round(x*100)/100);
 const refs=[g(4),r(2),r(3),pcc,county],steps=[];
 if(serve||delegate)refs.push(g(serve?3:5));
 if(arts)refs.push(art);
 if(serve||delegate)steps.push(['先看縣府是買服務，還是請協會代辦採購',serve?'縣府如果是花錢向協會購買長照授課等服務，原則由縣府依法辦自己的勞務採購（第3條），協會是服務提供者；不能拿補助是否過半來決定縣府的採購程序。':'機關若委託協會替它辦採購，依第5條等規定辦理並受委託機關監督，和協會受補助自辦、或機關向協會買服務不同。']);
 if(!serve&&!delegate&&!privateGrant){
  steps.push(['一般受補助自辦：兩個門檻要同時達到','按政府採購法第4條第1項，看用在「這一筆採購」的機關補助是否至少占該採購金額半數，且該補助金額本身至少150萬元。剛好半數或剛好150萬元均含在內；不能拿整個活動總預算、發票張數或非該採購的補助作分母或分子。'+(know?' 若核定與實際使用確是所列金額：補助'+show(f)+'萬元 ÷ 採購'+show(t)+'萬元＝'+show(100*f/t)+'%，'+knownShort+'。':' 現有資料不足時先核對該採購的預算、標的與核定用途，不認定已達或未達。')]);
  steps.push(['中央、縣府兩邊有錢，不必然都加','只有共同補助同一筆採購才加總；另場講師費或其他標的的款不併算。達到第4條門檻時，受補助者應通知各補助機關，由各機關共同或指定代表機關監督；包括依法應監督的開標、比價、議價、決標與驗收。'+(separate&&know?' 依你補充，應只以該設備的'+show(f)+'萬元計算。':'')]);
  if(!eligible||unclear)steps.push(['沒觸發本條，也不等於可以直接採買','先看這一案的核定函、預算表、適用的補助作業規範與採購／比價條件；不要假定一定要找固定家數。屏東縣政府對民間團體補助經費作業要點第4點第2款要求涉及採購時遵守相關規定，補助仍需按准予的項目及受理機關要求辦理。']);
 }
 if(arts&&!serve&&!delegate)steps.push(['符合定義的補助藝文採購：走另一套監督','屬受補助藝文採購者，不適用第4條第1項的一般採購途徑。補助占半數且金額達公告額時，依藝文採購監督管理辦法受補助機關監督並依規範辦理，不能當成無監督。用契約載明採購與權利義務，按規定提供資料；不是所有藝文團體購買一般設備都屬藝文採購。']);
 if(divided){
  refs.push(g(14),r(6));
  steps.push(['同一採購不能靠拆發票規避','同一採購即使有多次交貨或多張發票，不能藉分批規避適用。確有必要分批時，按該採購各批預算總額計算，事先向補助／監督機關確認第14條應辦的核准及招標方式，而不是拆單後自行判斷不用招標。程序依案件適用的規則，不是每案只有一種方式。']);
 }
 if(!privateGrant)steps.push(['先確認再簽約、下單或請款','先確認補助是政府機關或私人提供，再準備核定函、採購標的、完整預算和各機關補助用途，向該補助機關承辦確認。執行後按適用程序留存採購或比議價、契約、決標（如有）、驗收紀錄、付款證明、實際支用明細及原始憑證。屏東補助要點第8點另列核准文件、領款收據、實際支用明細及支用單據；多機關的補助項目和金額逐一列明，設備補助附納入團體財產證明。各計畫仍按各自核定條件核銷，不拿同一筆支出兩邊各請全額。']);
 const needs=!serve&&!delegate&&!privateGrant&&!arts&&(unclear||!know);
 return {...base,category:arts?'補助｜藝文採購及監督':'補助｜同一採購、金額門檻及監督',title:privateGrant?'純私人贊助不直接觸發機關補助採購規則':serve?'政府向協會買服務，不是統一當補助自辦':delegate?'機關委託協會代辦採購與補助自辦不同':arts?'藝文採購適用特別的監督規則':'先看是不是同一筆採購，再核對半數及150萬元',
 summary:privateGrant?'沒有機關補助且非政府委託採購，不因私人贊助觸發第4條；仍按捐助契約和組織程序辦理。':serve||delegate?'先認清案件是機關買服務、委託代辦採購或給團體補助；不同情況不能混著算。':arts?'先確認標的是否真的屬藝文採購。若屬之，在法定門檻下受補助機關依藝文採購規則監督，不套一般第4條第1項。':know?(eligible?'以所述情況，兩項門檻都達到，原則適用政府採購法並受補助機關監督。':'以所述情況，兩項門檻沒有同時達到，不因第4條第1項適用；核定函及補助條件仍要遵守。'):'先確認是補助自辦還是機關採購，以及該筆採購的預算和實際對應的補助，不拿整個活動金額直接算。',
 steps,refs:[...new Map(refs.map(r=>[r.title,r])).values()],needsProcFacts:needs,
 ...(needs&&!selected?{choiceHeading:'這筆是補助自辦、機關買服務，還是請協會代辦採購？',choices:[
 {label:'補助自辦採購',question:raw+'；性質確認：補助自辦採購。'},
 {label:'機關買服務',question:raw+'；性質確認：機關買服務。'},
 {label:'委託代辦採購',question:raw+'；性質確認：委託代辦採購。'}
 ]}:{})};
}
function follow(q){const s=String(q??'');return s.length<230&&!/另問|換(?:一|新)題|新問題/.test(s)&&/^\s*(?:補充[：:]|這批|這一筆)/.test(s)&&/這批|同一採購|採購預算|縣府補|機關買服|代辦採購/.test(s);}
if(typeof module!=='undefined'&&module.exports){module.exports={route,follow};return;}
root.verifiedGrantProcurementThreshold=route;
root.isGrantProcurementFactReply=follow;
})(typeof window!=='undefined'?window:globalThis);
