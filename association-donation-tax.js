(function(root){
'use strict';
const ref=(title,source)=>({title,source});
const law=(title,code,n)=>ref(title+'第'+n+'條','https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n);
const list='https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=G0340012';
const std=law('教育文化公益慈善機關或團體免納所得稅適用標準','G0340012',2);
const income=n=>law('所得稅法','G0340003',n);
const gift=ref('財政部台財稅字第09900359720號令：受贈物資非出售的轉贈','https://law-out.mof.gov.tw/LawContent.aspx?id=GL008678');
const pct=ref('財政部台財稅第0890453088號：計算口徑（舊比例不適用）','https://law-out.mof.gov.tw/LawContent.aspx?id=GL003552');
const ntb=ref('財政部臺北國稅局：機關團體結算申報及補助分類','https://www.ntbt.gov.tw/singlehtml/41ae3594197f4f69b47753ce08188516?cntId=e247e17e39324d39b8245eecb5987ad6');
const penalty=law('稅捐稽徵法','G0340001','48-1');
function route(q){
 const raw=String(q??'').trim(),t=raw.normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>510||/信用合作社|信合社|保險合作社|工會|公會|農會|漁會/.test(t))return null;
 const assoc=/協會|教育文化公益慈善|機關團體|公益團體|社會團體|社團法人|基金會/.test(t);
 const cooperative=/合作社/.test(t)&&!/不是(?:一般)?合作社|非合作社/.test(t);
 const ratio=/百分之六十|六[成％%]|60[%％]|執行率|支出比例|免稅.{0,8}(?:門檻|分母|結餘|保留計畫)|公益支出/.test(t);
 const tax=/所得稅|營所稅|免稅|補稅|繳稅|補報|漏報|漏列|申報|課稅/.test(t);
 const physical=/物品|物資|捐物|輪椅|食品|盲盒/.test(t)&&/捐|轉贈|贈與|領用|發放/.test(t);
 const report=/更正|補報|補稅|補帳|漏報|漏記|漏列|漏[、，。？]|帳上漏|沒(?:入帳|記|估價|列|登記)|已(?:經)?報|報過|帳沒|罰|前一年度已報|忘(?:了)?報|回到去年/.test(t);
 const pre=t.replace(/不是(?:全|全部|純)?免費(?:送|發)?|並非全免費/g,'非全免').replace(/不(?:一定|應|是|會)?(?:轉售|販售|義賣)|沒有(?:再)?(?:賣|轉售|義賣)|未(?:有)?轉售|沒賣|不賣|無轉售/g,'無載售');
 const free=/免費|無償|白送|都送|全送|轉贈.{0,7}(?:弱勢|救助)|無載售/.test(pre);
 const sale=/義賣|轉售|賣(?:掉|了|剩下|一部|一半|出)|有售價|販售|銷售/.test(pre);
 const mix=/一半.{0,30}(?:一半|其餘)|一部分.{0,30}(?:一部分|其餘)|部分.{0,30}(?:其餘|也有|另一批)|混合|部分出售、部分免費轉贈/.test(pre);
 const split=physical&&(/物資用途確認:部分出售/.test(t)||(free&&sale)||mix);
 const allSold=physical&&(/物資用途確認:全數出售/.test(t)||(sale&&!free));
 const sent=physical&&(/轉送|轉贈|送弱勢|送給|發放|免費送|收據/.test(t));
 const countGrant=/政府補助|縣府補助|公部門補助|受託|對價|委託|接案|標案|契約|核銷/.test(t);
 if(cooperative&&tax&&(ratio||/社員股金|社員出資|不對外營業.{0,8}(?:免稅|申報)|消費合作社/.test(t))&&!/合作社.{0,7}(?:捐給|捐贈給).{0,8}協會/.test(t)){
  return {direct:true,questionState:{focus:'compound',domain:'association-donation-tax'},category:'合作社｜年度所得稅',title:'一般合作社不能套用公益團體的年度六成免稅標準',summary:'一般合作社與教育、文化、公益、慈善機關團體不是同一種所得稅申報身分。未對外營業，不會讓所有合作社自動免稅。',steps:[
   ['先分消費合作社與其他合作社','所得稅法第4條第1項第14款，指依法經營、不對外營業的消費合作社；一般合作社不能只以不對外營業主張適用，也不要把該款當成營業稅免稅。合作社法第7條「得」免所得稅，仍須依租稅法規及實際營運判斷。'],
   ['股金與銷售收入分開','社員真正的出資入股，通常是股金權益，不因入帳就成為銷售收入；如果實際是收貨款、服務費或其他對價，按實質分類。依年度帳目與主管國稅局確認應用的申報身分與表件，不套用協會的六成或結餘計畫。']
  ],refs:[income(4),law('合作社法','D0050121',7),ref('財政部：合作社所得稅處理','https://law-out.mof.gov.tw/LawContent.aspx?id=GL003591')]};
 }
 if(!assoc||(!ratio&&!(physical&&(tax||report))&&!(tax&&countGrant&&/對價|受託|委託.*(?:辦|教)|接案/.test(t))))return null;
 if(!physical&&!ratio&&/勸募許可|募款許可/.test(t))return null;
 const steps=[],refs=[];
 const known=free||allSold||split;
 const percent=t.match(/(?:公益支出|執行率|支出比例|支出)[^，。；]{0,12}?(\d{2})(?:%|％)/)?.[1]??(/(?:正好|剛好|等於|已達|只有|只到)六成/.test(t)?'60':undefined);
 const rem=t.match(/結餘(?:款)?[^，。；]{0,6}?(\d+(?:\.\d+)?)萬(?:元)?/)?.[1];
 if(physical){
  refs.push(gift,income(11));
  if(!known||!allSold||split)steps.push(['符合規定的免費轉贈：補登真實紀錄，不是硬補一筆收入','適用於所得稅法第11條第4項的機關團體，且物資未轉售、依創設目的直接轉贈給實際需救助的個人或機關團體。符合者可另設登記簿，不列入所得稅的收入和支出計算；立案或免費本身並不代表一定符合。分開記受贈與轉贈的對象、日期、品名、數量及雙方各該經手人的簽章。']);
  if(!allSold||split)steps.push(['證據不齊，先補佐證；不要倒填日期或虛估單價','向原捐贈方核對交付、入庫等原始資料；發放端保存受贈者或代理人簽章的收據、清冊或其他證明，轉給機關團體由收受團體開具具法定欄位的簽章收據。涉及個資的完整憑證只在受保護的帳冊保留，不公開、不貼到小屏。符合上項者不用為了所得稅硬估單價；若會計、其他申報或捐方扣抵需要估值，另按日期、品項與狀況收集可靠市價或交易證據，不自行改開單據。轉贈令不要求原捐方一律重開收據。']);
  if(allSold||split){
    refs.push(ref('機關或團體免納所得稅適用標準第3條',list),ntb);
    steps.push(['出售的批次要另算，不能整批免列','有售價的義賣或轉售，按實際清點分開登記出售及免費發放的數量與憑證。出售部分依實際收入及可核實成本費用處理，不可用轉贈令整批免列；免費部分須另符合前述條件才適用。不可把物資和縣府補助併成同一項。'+(allSold&&!split?'如果全數出售，整批就不能按無償轉贈處理。':'')]);
  }
 }
 if(report){
  refs.push(ntb,penalty);
  steps.push(['已申報年度：先復原帳簿和附件，再判斷如何更正','依交易實際發生年度整理原件和補登說明，再比對該年度已送出的所得稅結算申報書、收支表及相關附表。單純補齊另簿並非一定要補稅，也不等於全部不用更正；已送報表的金額或應揭露內容若有誤，向國稅局確認原年度更正方式。有實際銷售時另核對營業稅資料是否也受影響，不把兩種申報混在一起。'],
  ['罰不罰，要先看實際漏稅與案件狀態','不是漏記就必然漏稅或有罰。若有漏稅，稅捐稽徵法第48-1條規定，未經檢舉、未受調查而自動補報並補繳漏稅，才可能適用相關逃漏稅免罰；實際補繳稅款仍依法計息。只知道沒收到通知，不等於未受調查。即使沒有漏稅，也要核對帳簿與憑證義務。']);
 }
 if(ratio||countGrant){
  refs.push(std,ref('機關或團體免納所得稅適用標準第3條',list),pct,ntb);
  if(ratio)steps.push(['六成怎麼算？不是只拿會費當分母','按第2條第1項第8款，分子是與創設目的相關活動的支出（含銷售與非銷售支出）；分母含創設目的相關的各項收入（含銷售、非銷售及基金孳息），另加創設目的以外所得額及附屬作業組織所得額。創設目的之外的虧損不能拿來墊高分子；依法另簿、不列所得稅收入及支出的合格轉贈，不把物資臆估金額塞進兩邊。']);
  steps.push(['把會費、補助與義賣收入分開看','先看有沒有交付貨物或提供服務的對價。通常無對價的政府補助或會費屬非銷售收入，受政府委託依契約提供講課等服務取得的款項可屬銷售勞務收入，不因名稱寫補助就全免。義賣以取得貨物為對價，不能因公益用途就免；依第3條算銷售所得（不是對全部營收直接課），符合規定時可扣除非銷售收入不足支應創設目的活動支出的部分。']);
  if(ratio){
   const a=percent===undefined?'':Number(percent)>=60?'如果依正確口徑已達60%（正好六成也算達標），不會只因結餘超過50萬元就必須送四年計畫。':(rem!==undefined&&Number(rem)<=50?'如果未達60%但當年度結餘正好或低於50萬元，仍可適用比例例外；不代表其他免稅條件也都符合。':'已知未達60%，先核對該年度結餘款，再判斷是否需要計畫。');
   steps.push(['達標與結餘例外分開判斷',a+' 現行是至少60%。未達時，當年度結餘50萬元以下（含50萬元）不受比例限制；超過50萬元，須將該結餘款編列次年度起四年內依創設目的使用的計畫，經主管機關查明同意，不是送件就算。這是支出比例一項，仍需符合其他免稅規定。']);
  }
 }
 if(steps.length===0)return null;
 steps.push(['下一步：備好原年度資料找對窗口','把申報書、帳簿、受贈與發放憑證或出售明細整理後，向所屬國稅局確認所得稅的分類及更正；若要申請結餘使用計畫，再向團體的主管機關確認。先用不含個資的摘要諮詢，不要上傳受助者清冊。']);
 const missing=physical&&!known;
 return {direct:true,questionState:{focus:'compound',domain:'association-donation-tax'},category:'機關團體｜物資轉贈與年度所得稅',title:physical?'受贈物資先分免費轉贈和出售，再核對原年度申報':'公益團體的六成支出、補助及義賣要分開判斷',summary:physical?(split?'免費轉贈和有價義賣分批核對，不要把整批都當成免列；再核對原年度資料。':allSold?'有售價的出售不能套無償轉贈。先把出售明細、成本和原年度申報對起來。':sent?'先把受贈、轉贈的實際紀錄補齊。符合條件的無償轉贈可另簿，不等於漏認一筆課稅收入。':'先分物資最後是送出還是有價出售，再核對帳簿和應申報的內容。'):'六成是年度創設目的支出比例，不是所有收入一體免稅。先確認收款是否有對價，再判斷比例、結餘與應否更正。',
 steps,refs:[...new Map(refs.map(x=>[x.title,x])).values()],needsDonationFacts:missing,
 ...(missing?{choiceHeading:'這批物資最後怎麼處理？',choices:[
  {label:'全數免費轉贈',question:raw+'；物資用途確認：全數免費轉贈。'},
  {label:'部分出售、部分免費轉贈',question:raw+'；物資用途確認：部分出售、部分免費轉贈。'},
  {label:'全數有價出售',question:raw+'；物資用途確認：全數出售。'}
 ]}:{})};
}
function follow(q){const s=String(q??'');return s.length<220&&!/另問|換(?:一|新)題|新問題/.test(s)&&(/^(?:\s*補充[：:]|\s*這批)/.test(s)||/^(?:全(?:部|數|免費)|沒有賣|有一半|不是免費)/.test(s))&&/物資|賣|發放|轉送|轉贈|免費|出售|年前|年度|買賣|未查核/.test(s);}
if(typeof module!=='undefined'&&module.exports){module.exports={route,follow};return;}
root.verifiedAssociationDonationTax=route;
root.isAssociationDonationTaxFactReply=follow;
})(typeof window!=='undefined'?window:globalThis);
