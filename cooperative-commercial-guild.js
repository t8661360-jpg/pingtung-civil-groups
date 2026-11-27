(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const primary={title:'內政部台內中社字第0910012947號：合作社是否應加入商業同業公會',source:'https://www.moi.gov.tw/News_Content.aspx?n=14143&s=219772'};
const background={title:'內政部台內社字第83700號：合作社持適用證照自願入會',source:'https://www.moi.gov.tw/News_Content.aspx?n=14143&s=219868'};
const required=['不是所有合作社都必須入商業同業公會','《商業團體法》第12條強制入會對象為符合區域及營業條件，並依《公司法》或《商業登記法》取得登記證照的公司、行號。主管機關函釋明確說明，未依這兩部法律取得登記證照的合作社，不因以合作社立案就負這項強制入會義務。合作社登記證、統一編號、稅籍或開發票不是同一種資格。'];
const optional=['有適用業別證照：可因業務需要申請自願加入','若合作社依法持有符合業別的工廠登記、商業登記證照或特許專業登記證照，可以依業務需要向相符的商業同業公會申請。依現行登記資料核對申請主體、實際營業項目、所在地區和公會章程，由公會審查；有證照不等於每個商業公會都會收。舊函證照名稱不一定和現行相同，不必另去找已停用的舊名稱證照。'];
const next=['怎麼確認：先看具體業別，再向該公會核對當前書表','可先列明合作社類型、所營業別、是否有相關核准許可或登記，再問該商業同業公會是否為其組織區域與行業，需哪些入會附件。這一題只說商業同業公會；工業同業公會、工會或特許執業專法另看各自規定。若合作社另設公司、行號，該公司、行號的義務獨立判斷，不等於合作社或其個別社員同時入會。不要在聊天框貼登記證書或代表個資。'];
function coopGuild(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>180||!/合作社/.test(t)||/工業(?:同業)?公會/.test(t)||!/商業(?:同業)?公會|商業.{0,4}同業公會/.test(t)||!/加入|入會|[加入](?:該|本地)?商業|業必歸會|(?:當|成為|成|作)會員/.test(t))return null;
 const relatedCompany=/(?:另(?:外)?(?:成立|設立|開|設)|也成立).{0,9}(?:公司|商號|行號)/.test(t);
 const compare=/一樣|差別|各自|分別|另外成立|另開|另設|另外問|跟有|和有/.test(t);
 const noRegistration=/只有.{0,14}(?:合作社登記|合作社立案|統編|稅籍)|沒有.{0,9}(?:營業登記|商業登記|公司登記|特許|工廠)|未(?:依.{0,15})?(?:有|辦)?(?:商業登記|取得登記證照)|無(?:合用|其他|相關)?(?:業別)?證照/.test(t);
 const yesRegistration=/(?<!沒|不|未)(?:持|領|有|取得|依法取得).{0,10}(?:特許|工廠登記|職業登記|專業登記|商業登記).{0,5}(?:證|登記|許可|合法)?/.test(t)&&!/不確定|不知道|不清楚/.test(t);
 const unknownRegistration=/不確定|不清楚|不知道/.test(t)&&/證|文件|登記|許可/.test(t);
 const know=relatedCompany||!unknownRegistration&&(noRegistration||yesRegistration);
 const concreteComparison=compare&&noRegistration&&yesRegistration;
 const summary=relatedCompany?'兩個主體分開看。商號或公司有適用登記、同業及區域條件時，依第12條判斷強制入會；合作社不能用另設公司或商號的證照，就當成合作社也有同一義務或資格。':unknownRegistration?'先看證明文件的核發機關、登記種類與營業項目。只有合作社立案或統編不是產業證照；若有適用業別的許可或登記，另向公會核查自願申請資格。':concreteComparison?'不同。只有合作社登記或統編，不會自動有入會資格或強制義務；依法持有適用業別證照，才可以按內政部函釋向相關商業同業公會申請。':noRegistration?'只有合作社登記或統編，不會因此負第12條的強制入會義務，也不能單憑這些資料確定具備自願入會資格。':yesRegistration?'依內政部函釋，持符合同業需求的適用證照，可因業務需要自願申請。公會仍要依現行登記、行業與區域審查，並非自動成為會員。':'要先分「法律要求一定要入會」與「可否自願申請」。合作社不是一律強制入會；是否能自願加入，要看實際業別與相關證照。';
 return {direct:true,category:'合作社｜商業同業公會業務分流',title:'合作社加入商業同業公會：是否強制與可否自願申請要分開',summary,steps:yesRegistration&&!noRegistration&&!relatedCompany?[optional,required,next]:[required,optional,next],refs:[primary,background,law('商業團體法','D0050100',12),law('商業團體法','D0050100',13),law('商業團體法施行細則','D0050101',8)],questionState:{focus:'compound'},...(!know?{choiceHeading:'目前有哪種登記或許可？',choices:[
   {label:'只有合作社登記或統編',question:'合作社只有合作社登記和統編，沒有其他業別證照，一定要入商業同業公會嗎？'},
   {label:'有該業工廠、商業或特許登記',question:'合作社持有業別特許登記或工廠登記，有實際營業，需要時可自願加入商業同業公會嗎？'}
 ]}:{})};
}
function guildQuestion(q, merger){
 if(typeof merger!=='function')return coopGuild(q);
 const t=String(q||'').normalize('NFKC').trim();
 if(t.length>220||!/工業(?:同業)?公會/.test(t)||!/商業(?:同業)?公會/.test(t)||!/合作社/.test(t))return coopGuild(t);
 const clauses=t.split(/(?:另外(?:想|再)?(?:請)?問|另外|再(?:請)?問|順便(?:請)?問|[；;?？。])/).map(x=>x.trim()).filter(Boolean);
 if(clauses.length!==2)return null;
 const a=clauses.map(x=>/工業(?:同業)?公會/.test(x)?merger(x.replace(/兼併/g,'合併')):coopGuild(x));
 if(a.some(x=>!x)||!a.some(x=>x.category.startsWith('工業'))||!a.some(x=>x.category.startsWith('合作社')))return null;
 const picked=a.findIndex(x=>x.choices?.length);
 const steps=a.flatMap(x=>[[x.title,x.summary],...x.steps]);
 const choices=picked<0?[]:a[picked].choices.map(x=>({label:x.label,question:picked===0?x.question+' 另外 '+clauses[1]:clauses[0]+' 另外 '+x.question}));
 return {direct:true,category:'同業公會｜跨組織業務分流',title:'兩個公會問題，分開看各自的資格',summary:'原工業同業公會會籍與代表不會因買賣就直接移轉；合作社是否能加入商業同業公會另看登記與證照。',steps,refs:[...new Map(a.flatMap(x=>x.refs).map(x=>[x.source,x])).values()],questionState:{focus:'compound'},...(choices.length?{choiceHeading:a[picked].choiceHeading,choices}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={coopGuild,guildQuestion};return;}
root.verifiedCooperativeCommercialGuild=q=>guildQuestion(q,root.verifiedIndustrialGuildMerger);
})(typeof window!=='undefined'?window:globalThis);
