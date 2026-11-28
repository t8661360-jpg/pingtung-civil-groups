(function(root){
'use strict';
const link=(title,pcode,n)=>({title,source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+pcode+'&flno='+n});
const ref=(title,source)=>({title,source});
const mo=ref('財政部09900359720號令：非轉售之實物轉贈及憑證','https://law-out.mof.gov.tw/LawContent.aspx?id=GL008678');
const charityRuling=ref('財政部841607554號函：義賣所得之性質','https://law-out.mof.gov.tw/LawContent.aspx?id=GL003572');
const nt=ref('國稅局：機關團體非常態銷售、407與繳款期限','https://www.ntbk.gov.tw/singlehtml/8edee6a2f90d4254a5e8d38c1db38137?cntId=ae51d7775e7146939270e008db8a9bdf');
const pt=ref('南區國稅局：屏東各地服務轄區','https://www.ntbsa.gov.tw/singlehtml/89c6b7678693468287b33f6443b9e19c');
const std=ref('教育文化公益慈善機關或團體免納所得稅適用標準第2、3條','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=G0340012');
const vat=n=>link('加值型及非加值型營業稅法第'+n+'條','G0340080',n);
const normalize=s=>String(s??'').normalize('NFKC').replace(/\s/g,'');
function follow(q){
 const t=normalize(q);
 return t.length<240&&/^(?:我說錯|不是|補充|更正|其中|這批|無償|一次|還有|如果免費)/.test(t)&&/收費|必須付|不付|售價|園遊會|捐|收據|發票|無償|免費|國稅局|只辦|有稅籍|營業|合作社/.test(t)&&!/換(?:一|新)?題|另問|新問題/.test(t);
}
function route(q){
 const raw=String(q??'').trim(),t=normalize(raw);
 if(!t||t.length>680||!/協會|社會團體|社團法人|公益機關團體/.test(t))return null;
 if(/(?:我們|本會|本社)(?:是|屬於|為)(?:一般|有限責任|保證責任)?合作社|我們不是協會|商業同業公會|職業工會/.test(t))return null;
 const tail=t.split('更正事實:').at(-1);
 const physical=/物資|物品|食品|食物|教具|贈餐|桌椅|鞋子|受贈品|捐物|捐了.{0,10}(?:貨|車)|送物|食物平台/.test(t);
 const donation=/捐|受贈|(?:企業|商家|廠商).{0,10}送/.test(t);
 const offer=/有價賣|網路.{0,5}賣|賣給|賣舊|寄賣|固定.{0,5}(?:價格|收費|二十元|20元)|不付.{0,6}不能拿|每(?:包|份|次).{0,6}(?:元|收費)|工本費|改收費|要收費|販售|轉售|義賣|銷售/.test(t.replace(/未(?:有)?轉售|沒有轉售|無轉售|不曾轉售|不會轉售|不轉售/g,''));
 const free=/免費|無償|送弱勢|發給需要|轉贈/.test(t);
 const tax=/申報|稅籍|國稅局|扣繳|營業|報稅|所得稅|營所稅|營業稅|免列|補帳|補正|稅表|估價|購買價/.test(t);
 const once=/單次|只辦過?一次|只辦了?一(?:次|場)|非常態|一次性|並非固定經營|不是進行固定經營/.test(t);
 const withholdingOnly=/只有扣繳統編|只有扣繳(?:號|編號)|沒有營業稅稅籍|沒辦理?(?:營業稅)?稅籍|未辦(?:理)?(?:營業稅)?稅籍/.test(t);
 const continuing=!once&&/持續固定經營|持續販售|每月|每個月|每周|每週|經常性販售/.test(t);
 const registered=/已有營業稅稅籍|已辦(?:理)?營業稅稅籍|原本已是營業人/.test(t);
 const alreadyFiled=/所得稅已經?報|已(?:經)?申報|已報過|申報完|漏列|都沒記進去|上一年度帳漏|忘了報|已報年度/.test(t);
 const receipt=/收據|憑證|發票|單據/.test(t);
 const grant=/縣府補助|政府補助|補助還沒|指定款|定向捐款|指定用途|用途變更|募款許可|勸募許可/.test(t);
 if(!donation||!offer||!(physical||/義賣/.test(t))||!(tax||free&&receipt||grant&&receipt))return null;
 const passive=/沒有公開(?:叫人|募|邀|發文)|沒有向大眾|企業真的自己送|企業是自己送|主動送|主動捐|被動受贈/.test(tail);
 const steps=[], refs=[mo,vat(3),vat(6),vat(8),vat(28),std];
 const summary='先把免費轉贈、實際銷售和真正捐贈分開。固定付錢才能取得貨物或餐點，不會因叫「工本費」或開了捐款收據，就變成無償捐贈。';
 steps.push(['先按批次盤點，別把混合批全列免費','按收受、免費送出、有價賣出和現有庫存分列品名、日期、數量、價金及憑證。可追溯的不同批次不要混寫；同批混用或來源成本無法追溯時，不自行把所有金額免列或攤估。留原捐方交付、可核對時價與交易證據，請國稅局確認如何拆分。']);
 if(free)steps.push(['合格免費轉贈：受贈與轉贈兩頭都要能證明','須符合所得稅法第11條第4項，所涉物資未轉售、依創設目的送真正需救助的個人或團體，依財政部09900359720號令另設簿、記對象日期品名數量及經手簽章；才可能不列入所得稅收入及支出。個人要保存受贈人或代理人簽章收據、清冊或其他合法證明；另一受贈協會要由該團體開具簽章收據，含團體名稱、扣繳編號、地址、負責人、品名、數量及日期。完整個資留在依法受保護的帳冊，不輸入小屏或公開。']);
 steps.push(['真捐贈與購買憑證不能混開','捐物收據只反映原企業或個人實際捐物，不替捐贈方保證扣除。購買人繳的是貨款，不應開成全額捐贈；已誤開就以原單、收付款紀錄、品項與領用資料核對，請管區國稅局確認更正或作廢重開方式，保留原件與更正軌跡，不倒填。'+(passive?'你說企業是主動送來、並未對外邀募，這筆先依受贈事實分類，不直接併入另一個核准公開募款案；仍按原指定用途。':'若同時有核准勸募，先分是否實際回應該案的對外邀募，沒有邀募的主動受贈和專案款不能當成同一批。')]);
 if(/幹部帳|私人帳|個人帳|匯回協會/.test(t))steps.push(['私人代收已匯回，也要按原金流對帳','逐筆依實際收款日期、買方或捐方性質、匯回明細及用途入帳，避免把匯回又當新一筆捐款。留下流水、憑證與異常說明，未能辨識先列待核，不自行補造單據。']);
 if(grant)steps.push(['指定捐贈、勸募和縣府補助不能互相補洞','勸募有許可的依核准用途；指定捐款先尊重捐方和適用規範；縣府未結案的補助及有財產管制的設備，另按核定用途、變更及繳回條件，未獲適法確認不先挪作購置、轉售或拿去核銷。會費另入會費帳，不能用捐物或貨款混列。']);
 if(/義賣|園遊會/.test(t)){refs.push(charityRuling);steps.push(['義賣的營業稅例外和所得稅不同','營業稅法第8條第1項第12款，要是依法組織的慈善救濟事業，且在必要費用以外的收入全部供本身事業使用，才適用該義賣免稅條件。只是一次、寫公益或賣超過市價都不自動免；財政部841607554號函另有含捐贈性質的所得稅認定，不能自行用市價差作分類或用所得稅解釋取代營業稅。']);}
 if(!registered){refs.push(nt);
  steps.push(['營業稅：先看是否應稅、是否非常態及有無營業稅稅籍',continuing?'你說會持續辦，別把它當成一次性交易。開始或繼續前，先向國稅局核對營業稅稅籍、發票或其他銷售憑證及報繳期別；只拿扣繳統編不代表已完成營業稅稅籍。':once&&withholdingOnly?'你說只辦一次、只有扣繳統編；若確未辦營業稅稅籍且這批是不免營業稅的非常態銷售，國稅局指引可於交貨或收款時逐筆用407繳款書，通常在銷售次月15日前報繳。這筆若已逾期，請直接核對補報方式，不等年度所得稅申報。':'扣繳統編不等於已辦營業稅稅籍。若是不免營業稅的非常態銷售且未辦營業稅稅籍，國稅局說明逐筆使用407、次月15日前報繳。持續有價經營應先向管區國稅局確認稅籍及統一發票或其他憑證義務。']);
 }
 if(registered)steps.push(['已有營業稅稅籍，依既有申報身分更正','這題不套未辦稅籍的407特例。請對照既有銷售憑證、營業稅申報期別和實際交易，向國稅局確認更正；所得稅仍另算。']);
 if(alreadyFiled||/補報|所得稅|申報/.test(t)){
  refs.push(link('稅捐稽徵法','G0340001','48-1'));
  steps.push(['已報的年度所得稅另核對','整理原年度已報申報書、受贈及轉贈證明、銷售和成本明細，請國稅局確認哪些要更正；不是漏記就一定補稅，也不能一張免列把兩批沖掉。如確實有漏稅，未經檢舉、未受調查而自動補報補繳，才依稅捐稽徵法第48-1條判斷相關免罰，仍依法計息，不保證全面免罰。']);
 }
 if(/東港/.test(t)){refs.push(pt);steps.push(['會址在東港，兩種稅先問同一轄區窗口','可找財政部南區國稅局東港稽徵所，分別說明年度所得稅和這一批的營業稅憑證、日期、是否逾期；諮詢先用不具名摘要。']);}
 const askMissing=!once&&!registered&&!continuing&&!/經常|每個月|每周|不同月份|固定經營/.test(t)&&withholdingOnly&&!raw.includes('；銷售狀態：')&&/營業稅|稅籍|國稅局/.test(t);
 return {direct:true,category:'協會稅務｜免費轉贈、收費與補報',title:'先分免費轉贈、固定收費和原年度報稅',summary,steps,refs:[...new Map(refs.map(x=>[x.title,x])).values()],trackMixedGoods:!raw.includes('；銷售狀態：'),questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}],...(askMissing?{choiceHeading:'有收費的活動，是一次還是持續辦？',choices:[{label:'只辦一次',question:raw+'；銷售狀態：只辦一次。'},{label:'持續辦理',question:raw+'；銷售狀態：持續固定經營。'}]}:{})};
}
if(typeof module==='object'&&module.exports)module.exports={route,follow};
else {root.verifiedInKindMixedSales=route; root.isInKindMixedSalesFollow=follow;}
})(typeof window==='object'?window:globalThis);
