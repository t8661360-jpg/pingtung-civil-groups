(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
function ledgerLoss(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>190||!/協會|社會團體/.test(t)||/合作社|社員|農會|漁會|公會|工會|公司|財團法人|基金會|管委會|房屋稅|地價稅|牌照稅/.test(t))return null;
 if(!/會計帳|帳冊|帳簿|憑證|記帳資料|財務帳|記帳本|帳本|帳務|財務檔案|核銷.{0,5}(?:發票|收據)|(?:發票|收據).{0,5}核銷/.test(t))return null;
 const signals=t.replace(/(?:沒有|沒|並未|並非|不曾|未)(?:被|遭|有)?(?:帳簿|帳冊|憑證)?(?:泡水|淹到|水災|火災|遺失|毀損|滅失|損毀)/g,'＿');
 const disaster=/淹|泡水|進水|水災|火燒|火災|起火|失火|地震|颱風|不可抗力|天然災害/.test(signals);
 const lost=/毀損|損毀|滅失|遺失|丟失|弄丟|不見|找不到|破損|爛了|燒掉|泡爛/.test(signals);
 if(!disaster&&!lost)return null;
 if(/(?:沒有|並未|並非|不曾)(?:泡水|淹到|遭水災|遺失|毀損)|(?:一切|帳簿|帳冊)都完好/.test(t)&&!lost)return null;
 if(/存摺|存折|存簿/.test(t)&&!/帳冊|帳簿|會計憑證|核銷資料/.test(t))return null;
 const mode=/只涉及一般會務帳冊|不是稅務或補助帳證/.test(t);
 const taxed=!mode&&/稅籍|國稅局|營業稅|營所稅|結算申報|稅務帳|營業人|課稅|有銷售|賣東西|銷售貨物|統一發票/.test(t);
 const grant=!mode&&/補助|補助核銷|核銷/.test(t);
 const repair=['先保全，再重建帳冊與憑證','等現場安全後，拍照記錄受災範圍，列出缺件的年度、帳簿與憑證，保全能辨識的原件與備份；不要自行丟掉。由財務人員用原始電子資料、銀行對帳單及交易對方補發的發票或收據等逐筆核對，記下來源與重建日期；核對不到的列缺件。補發或重建的資料要註明，不能冒充原件，也不要補造不實支出。'];
 const society=['一般協會會務：先通知內部並詢問原立案主管機關','社會團體財務處理辦法第21條要求會計帳簿、會計憑證及報表自年度決算辦理完畢後至少保存十年；應永久保存或有關未結事項不適用十年的一般期限。第20至22條沒訂一般協會帳冊災損要在三十日內報縣府的統一期限。建議盡快通知理事會與監事會、記錄受損清單及重建進度，由監事會查核；縣府立案者，可向社會處確認個案是否需函報或送資料。'];
 const irs=['如果有稅務帳簿或憑證：另外向轄區國稅局確認','非營利組織若有銷售貨物或勞務，仍可能適用營業人的帳證規定，不能只向縣府社會處備忘。財政部營所稅「帳簿憑證滅失」申辦資訊，列出不可抗力災害後的次日起三十日內申請；是否適用這一程序、怎麼查勘及接受何種補件，請儘快問團體登記地的國稅局，不要等帳重建完成。不是每個一般協會都用這個三十日，也不是報備就免除所有責任。'];
 const funding=['如果涉及補助核銷：對帳單不能自行當成所有憑證的替代品','儘快通知原補助機關，查核定函、補助契約及該計畫的期限。銀行對帳單可佐證付款，但未必能證明用途、品項或符合核銷憑證要求。先取補發憑證或電子原檔、保留災損照片和缺件清單，再詢問機關能否接受影本、其他說明或展延；未確認前不要假定可以核銷。'];
 const choices=!taxed&&!grant&&!mode?[
  {label:'一般會務帳冊',question:'協會只涉及一般會務帳冊，帳冊被淹壞了，要報縣府嗎，怎麼重建？'},
  {label:'稅務帳簿或營業憑證',question:'協會有稅籍，帳簿和營業憑證因水災滅失，應該報國稅局還是縣府？'},
  {label:'政府補助核銷憑證',question:'協會的補助核銷憑證泡水，對帳單能代替發票嗎？'}
 ]:[];
 return {direct:true,category:'人民團體會務與帳務',questionState:{focus:'compound'},
  title:'協會帳冊受損：先保全，再分會務、國稅與補助',
  summary:(taxed?'稅務帳簿或營業憑證請儘快問轄區國稅局，不能用報縣府取代。':grant?'先向原補助機關通報核銷憑證受損；銀行對帳單只能提供佐證，不能自行當作原始發票。':'先保全受損帳冊與備份、列缺件、再重建。一般協會會務沒有統一的三十日報縣府規定，但應儘快核對是否有另外的稅務或補助要求。')+(taxed&&grant?'若同時有政府補助，還要分別向原補助機關確認核銷資料。':''),
  steps:[repair,society,...(taxed?[irs]:[]),...(grant?[funding]:[]),...(!taxed&&!grant&&!mode?[['還要不要報其他機關？','如果涉及國稅帳證或政府補助，可能另有程序和期限。請依下面的索引標籤選該類資料；受損帳冊與發票不要上傳到小屏。']]:[])],
  refs:[...([5,20,21,22].map(n=>law('社會團體財務處理辦法','D0050097',n))),...(taxed?[
    {title:'財政部：帳簿憑證滅失報備（營所稅）',source:'https://www.gov.tw/News_Content_2_513452'},
    {title:'財政部：公益團體有銷售時的營業人規定',source:'https://www.etax.nat.gov.tw/etwmain/tax-info/understanding/tax-q-and-a/national/tax-collection-act/penalty/AGEKL8R'},
    {title:'財政部南區國稅局：管轄區域與各分局',source:'https://www.ntbsa.gov.tw/singlehtml/89c6b7678693468287b33f6443b9e19c'}]:[])],
  ...(choices.length?{choiceHeading:'受損的是哪一類帳證？',choices}:{}),actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
if(typeof module!=='undefined'&&module.exports){module.exports={ledgerLoss};return;}
root.verifiedAssociationLedgerLoss=ledgerLoss;
})(typeof window!=='undefined'?window:globalThis);
