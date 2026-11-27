(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const assoc=law('社會團體財務處理辦法','D0050097',14), union=law('工會法','N0020001',28), tier=law('工會法施行細則','N0020002',26);
const campaign=law('公益勸募條例','D0050138',16);
const receipt=law('社會團體財務處理辦法','D0050097',17);
const tax=law('教育文化公益慈善機關或團體免納所得稅適用標準','G0340012',3);
const transfer={title:'財政部台財稅字第09900359720號令：未轉售而公益轉贈',source:'https://law-out.mof.gov.tw/LawContent.aspx?id=GL008678'};
const auction={title:'財政部：免稅適用標準所稱銷售貨物或勞務之適用範圍',source:'https://law-out.mof.gov.tw/LawContent.aspx?id=GL003572'};
const vat={title:'財政部北區國稅局：慈善救濟事業義賣的營業稅和發票條件',source:'https://www.ntbna.gov.tw/forum/forumResponseMain?ewpt313UUID=2741688c2ced4fce8214cbc890dfffc2&svcId=7ad87d5a2dda489e881d8cecb58d652a'};
const n=q=>String(q??'').normalize('NFKC').replace(/\s/g,'');
function unionDues(q){
 const t=n(q);
 if(!t||t.length>220||!/工會/.test(t)||!/會費/.test(t)||/不是(?:企業|職業|產業)?工會|非(?:企業|職業|產業)?工會|聯合組織|總工會|商業同業公會|專業公會|入會資格|退費|欠費|催繳|退會|補繳|停權|勞健保|投保薪資|除名|召開|代理/.test(t))return null;
 if(!/常年|經常|每個?月|入會費|工資|自己訂|多少|收多少|標準|級距|調漲|會費.{0,6}怎麼算|會費.{0,6}怎樣算/.test(t))return null;
 const both=/協會|社會團體/.test(t)&&!/不是(?:一般)?(?:協會|社會團體)/.test(t);
 const monthly=['工會經常會費不是想訂多少就訂多少','依工會法第28條，對個別會員的經常會費不得低於當月工資的 0.5%；例如當月工資 40,000 元，該月法定下限 200 元。入會費另算，最低是入會時一日工資所得。施行細則第26條允許在工會章程訂收費級距，但仍要守法定下限。'];
 const handbook=['一般協會的「常年會費」不等同工會的「經常會費」','一般社會團體依社會團體財務處理辦法第14條，把入會費、常年會費標準和繳法寫入章程；不套用工會的 0.5% 下限。'];
 return {direct:true,category:'工會｜會員會費',title:both?'工會與一般協會的會費標準不同':'工會會費可在章程訂定，但有法定下限',summary:both?'不一樣。工會的經常會費有法定下限，普通協會按章程收費，不套工會算法。':'可以按章程訂收費級距，不能低於《工會法》第28條的下限。',steps:both?[monthly,handbook]:[monthly],refs:both?[union,tier,assoc]:[union,tier],questionState:{focus:'compound'}};
}
function donationSale(q){
 const t=n(q);
 if(!t||t.length>245||!/協會|社會團體|公益性社團法人/.test(t)||!/捐|受贈/.test(t)||!/物資|物品|食品|實物|電腦|設備|衣物|捐來的東西|受贈品/.test(t)||/合作社|工會|政治獻金|拍賣社產|不動產/.test(t))return null;
 const sale=/賣掉|拿去賣|轉售|出售|變賣|販售|義賣/.test(t.replace(/(?:不能|不要|沒有|並未|未曾|未|不是|不會|從不|沒有要|不)(?:賣掉|拿去賣|轉售|出售|變賣|販售|義賣)/g,''));
 if(!sale||!/稅|入帳|收據|發票|申報|列報/.test(t))return null;
 const noSale=['直接免費轉贈：要符合函令條件才能免列收入與支出','符合所得稅法第11條第4項的機關團體，未轉售受贈品，依創設目的免費轉贈給需要救助的個人或團體，並備妥受贈及轉贈登記簿、經手簽章及收據或清冊等證明，才可按財政部函令處理。'];
 const sell=['先賣再公益支出，是另外兩筆帳','即使把收入拿去公益，也不能把有償處分當作實物免費轉贈。要留受贈、售出及公益支出紀錄。一般銷貨所得依免稅適用標準第3條等規定核算；慈善救濟團體義賣若實際具有捐贈收入性質，財政部另有函釋，不能只因掛名「義賣」就判免稅。'];
 const receipts=['原捐贈人與購買人拿的憑證不同','原捐贈人可向團體索取載明品項、數量等的受贈證明；若屬公益勸募，按適用規定開立收據。購買人有領到物品，不能把買賣對價當成純捐贈開收據。是否開統一發票、能否免徵營業稅是另一件事，慈善救濟事業的義賣有特定條件，不因公益就一律免開。帶交易方式、證明和帳冊向管轄國稅局確認。'];
 return {direct:true,category:'人民團體財務｜受贈物品出售',title:'受贈品賣掉與免費轉贈，報稅和憑證不能混用',summary:'不相同。財政部允許符合條件的免費轉贈免列收入、支出，但先賣掉再把錢做公益，不適用這項簡化。另把原物資捐贈的證明和買方的交易憑證分開。',steps:[noSale,sell,receipts],refs:[transfer,tax,auction,vat,receipt,campaign],questionState:{focus:'compound'}};
}
if(typeof module!=='undefined'&&module.exports){module.exports={unionDues,donationSale};return;}
root.verifiedUnionDues=unionDues;
root.verifiedAssociationDonationSale=donationSale;
})(typeof window!=='undefined'?window:globalThis);
