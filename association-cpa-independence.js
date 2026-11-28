(function(root){
'use strict';
const act=(title,pcode,n)=>({title:title+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+pcode+'&flno='+n});
const f=n=>act('社會團體財務處理辦法','D0050097',n);
const procedure=act('人民團體法','D0050091',34);
const license=act('會計師法','G0400067',47);
const ethics={title:'會計師公會全國聯合會：查核與核閱之獨立性，第62、63、74、76條',source:'https://www.roccpa.org.tw/news/more_nomal?id=1274e871005b40a6b45225e45fb70efd'};
const org=/協會|社會團體|人民團體|社團法人/;
const outside=/基金會|工會|公會|農會|漁會|管委會|公司股東會|上市公司/;
const coop=/合作社|社員大會/;
const credit=/信合社|信用合作社|信用部/;
const profession=/會計師|法人事務所|(?:理事長|同一間|同家|管理顧問).{0,10}事務所|外部簽證|同所.{0,6}(?:簽|查核)|該所.{0,6}(?:簽|查核)/;
const signature=/簽證|查核簽|查核.{0,6}(?:簽|出報告)|出具.{0,7}(?:查核|審計)|會計師查(?:帳|核)/;
const report=/決算|財報|財務報告|年度報表|年結/;
const amounts=t=>{
 const clauses=t.split(/[。；;？?！!]/).filter(x=>report.test(x));
 if(!clauses.length)return null;
 const amounts=new Set(clauses.join('，').match(/(?<![\d.,])(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?(?:萬(?:元)?|元)/g)||[]);
 if(amounts.size>1)return null;
 t=clauses.join('，');
 const m=t.match(/(?<![\d.,])(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d+))?(萬(?:元)?|元)/);
 if(m)return Number(m[1].replace(/,/g,'')+(m[2]?'.'+m[2]:''))*(m[3].startsWith('萬')?1e4:1);
 if(/一千五百萬|千五百萬|一仟伍佰萬|壹仟伍佰萬/.test(t))return 15e6;
 if(/一千四百九十九萬|一仟肆佰玖拾玖萬/.test(t))return 1499e4;
 if(/一千六百萬|千六百萬|一仟陸佰萬/.test(t))return 16e6;
 return null;
};
function threshold(n){
 const general='依社會團體財務處理辦法第11條第2項，年度決算達新臺幣1,500萬元（含）是「得」委請會計師簽證，不是「應」。若特別法令、適用章程或補助契約另有要求，須另核對其適用範圍，不能用本條免除。';
 return ['1,500萬元（含）是「可以委託」，不是一律強制',n===null?general:(n===15e6?'剛好1,500萬元已達門檻；依本條沒有因金額就必須委託會計師簽證。':n<15e6?'依所述金額，低於1,500萬元；第11條第2項不因該金額要求簽證，也不能由此推論該團體永遠不得接受獨立專業服務。':'依所述金額，已達1,500萬元；依本條沒有因金額就必須委託會計師簽證。')+general];
}
const review=['監事會先審，再由會員大會表決，最後報主管機關',
 '無論有沒有外部會計師簽證，依人民團體法第34條，理事會編製的年度決算要先送監事會審核，將審核結果連同決算提報會員（會員代表）大會；大會通過後才送原主管機關備查。在屏東立案且由縣府主管者，才報縣府；不要把會計師、理事長或主管機關的查核當成監事會先審。監事會根本沒審，應先補作審核，不把決算直接交大會表決或送縣府；已審但不同意是另一種情況，不能把反對意見隱去。'];
const personal=['協會理事長不要替自己的年度財報作獨立會計師簽證',
 '協會理事長若代表團體、主持理事會或參與預算與決算等財務決策，不宜再以外部會計師身分查核自己參與的事項。公報第62、63條對董監事、經理人及非純例行行政的治理角色有獨立性限制。只領車馬費、沒有固定薪資或在簽證時才迴避，都不能消除原有的管理及自我查核風險。以理事長身分簽一般行政文書或財務報表，不等於出具獨立的會計師查核簽證。會計師法第47條列有明確不得承接的事由，沒有逐字列「協會理事長」；仍須依實際職權查核獨立性，最穩妥是改委託無利害關係的其他事務所。'];
const firm=['不能只換同一家事務所的另一位來簽',
 '要查同所會計師實際的聘僱／職務、近期任職、投資或財務利益及資金借貸關係。若同所任何執業會計師有第47條第1項第1、2、4、5款情事，依第2項，同所其他執業會計師也不得簽證。就算未落入該四款，仍要評估同一家事務所或聯盟事務所的管理角色與查核獨立性；光更換簽名者、合夥人或由理事長迴避不等於符合。無法確認時，另找真正獨立的外部事務所。'];
const incorporated=['法人會計師事務所替協會管理帳務，股東不能只換人簽',
 '如果法人會計師事務所與協會有第47條第1項第4到6款情事（如投資／財務利益、資金借貸，或足以影響獨立性的管理顧問或其他非簽證業務），依第3項，其股東不得承辦該協會財務報告簽證。若事務所實際控制帳務、代作管理決策並再查核，不能靠換一位股東簽證來解決。並非只要做過任何行政工作都一律禁止；有不清楚之處，先由獨立會計師確認服務內容與利害關係。'];
function answer(q){
 const raw=String(q??'').trim(),t=raw.normalize('NFKC').replace(/\s+/g,'');
 if(!t||t.length>400||outside.test(t)||credit.test(t)||!profession.test(t)||/所得稅|營業稅|稅務簽證|國稅局|設立登記|資本額簽證|驗資|薪資扣繳|審計準則考試/.test(t))return null;
 const signed=signature.test(t)||/簽決算/.test(t)&&/同所|事務所|迴避|自己查核/.test(t),annual=report.test(t),chair=/理事長|財務長|監事.{0,6}(?:本身是會計師|是會計師|兼會計師|本人簽)|會計師.{0,8}(?:當|兼任)監事/.test(t),kind=t.match(/簽署性質確認:(外部簽證|內部簽署|仍不確定)/)?.[1];
 const independent=signed&&(chair||/合夥人|股東|管理顧問|法人.{0,4}事務所|自己查核|同所|同家.{0,5}事務所/.test(t));
 const legal=/法人.{0,4}事務所|法人會計師事務所/.test(t);
 const governance=/監事會|監事先|先審|大會|報縣府|備查/.test(t);
 const mandatory=annual&&(signed||/(?:聘|找|請|要|須|必須|委託|委請|沒有|沒).{0,6}會計師|會計師.{0,8}(?:必要|必須|強制|一定|簽)|沒會計師/.test(t));
 const vague=annual&&chair&&!signed&&/簽(?!證)|蓋章|用印/.test(t);
 if(!independent&&!mandatory&&!vague&&!kind)return null;
 const amount=amounts(t);
 const orgTag=t.match(/團體性質確認:(一般協會|一般合作社)/)?.[1];
 const coopStep=['一般合作社年度決算適用自己的程序',
  '合作社法第36條規定，年度法定書類原則上在社員大會開會十日前送監事會審核，再提社員大會；社員大會承認後一個月內報原主管機關備查。臨時社員大會另依該條但書，不把社會團體的1,500萬元規定當一般合作社的規則。若有特殊業別、章程或委託條件，再核對應否有外部簽證，不能拿簽證替代本來應辦的監事程序。'];
 const coopLaw=act('合作社法','D0050112',36);
 const compare=org.test(t)&&coop.test(t)&&/比較|差異|有何不同|分別|兩者|兩種團體/.test(t)&&!orgTag;
 if(compare&&annual&&mandatory&&!independent){
  return {direct:true,category:'協會與一般合作社｜年度決算',title:'協會與一般合作社的決算程序要分開看',summary:'兩者都要分清外部簽證與內部監事會審核；協會的1,500萬元規定不能直接套到合作社。',steps:[threshold(null),review,coopStep],refs:[f(11),procedure,coopLaw],questionState:{focus:'compound'}};
 }
 if(orgTag==='一般合作社'||coop.test(t)){
  if(!annual||!mandatory||!(governance||amount!==null||/套|比照|協會/.test(t)))return null;
  return {direct:true,category:'一般合作社｜年度決算與外部簽證',title:'一般合作社不套用協會的1,500萬元簽證規定',summary:'一般合作社依合作社法第36條辦理，與社會團體財務處理辦法不同。不能把協會的金額門檻或備查程序照搬。',steps:[coopStep],refs:[coopLaw,f(11)],questionState:{focus:'compound'}};
 }
 if(!org.test(t)){
  if(!mandatory||!governance||amount===null||raw.length>325)return null;
  return {direct:true,category:'決算簽證｜先選團體類型',title:'先確認您問的是一般協會還是一般合作社',summary:'已記下您提供的年度決算金額；外部會計師簽證和監事會內部審核是兩件事。請選團體類型，再按適用法規說明。',steps:[['兩種團體的依據不同','一般協會依人民團體法及社會團體財務處理辦法，一般合作社依合作社法。若為信用合作社、公會或其他團體，請直接說類型，不用填團體名稱。']],refs:[f(11),procedure,coopLaw],choiceHeading:'您問的是哪一種團體？',choices:['一般協會','一般合作社'].map(label=>({label,question:raw+'；團體性質確認：'+label+'。'})),questionState:{focus:'clarify'}};
 }

 if((vague&&!signed)||kind){
  const choices=kind?[]:[['會計師查核簽證','外部簽證'],['理事長在內部文件簽名','內部簽署'],['還不確定','仍不確定']].map(([label,code])=>({label,question:raw+'；簽署性質確認：'+code+'。'}));
  const steps=[['先區分這一筆簽名的用途','若只是協會內部文件簽名，需依文件類型、章程與指定欄位確認權限；這不讓理事長兼任會計或出納，也不等於會計師簽證。外部簽證需要對年度財報作獨立查核。'],...(kind==='外部簽證'?[personal,firm]:kind==='仍不確定'?[['先確認文件名稱','若文件寫「會計師查核報告」或要求會計師簽證，先找獨立事務所確認；如果只寫「負責人／理事長」，先依原機關表件與章程確認，不必貼完整財報或簽名。']]:[]),...(amount!==null?[threshold(amount)]:[]),review];
  return {direct:true,category:'協會｜年度決算與簽署',title:'協會內部簽名與會計師簽證是兩件事',summary:!kind?'您說的「簽」是外部查核簽證，還是理事長欄位的內部簽名？已提供的金額及監事會程序仍會保留。':kind==='外部簽證'?personal[0]+'；改找獨立的外部會計師。':'先核對文件欄位與用途；仍要依規定送監事會審核。',steps,refs:[f(11),f(17),f(22),procedure,...(kind==='外部簽證'?[license,ethics]:[])],questionState:{focus:kind?'compound':'clarify'},...(choices.length?{choices,choiceHeading:'您指哪一種簽署？'}:{})};
 }
 const steps=[...(independent?[...(legal?[incorporated]:[personal,firm])]:[]),threshold(amount),review];
 const title=legal?'法人會計師事務所應先確認股東的簽證獨立性':independent?'協會理事長不宜替自己的協會簽證':'1,500萬元可委託簽證，但年度決算仍須監事會先審';
 const summary=legal?'若法人事務所為協會作管理顧問並控制帳務，影響獨立性時，其股東不得承辦；在一般規定下，達1,500萬元並非一律要簽證，監事會仍要先審。':independent?'由無利害關係的外部會計師查核較妥當；理事長不領薪或改找同所另一位，不等於可以。是否委託外部簽證，與監事會先審，是兩件事。':(amount!==null&&amount<15e6?'低於1,500萬元不會因本條而被要求簽證。':'決算達1,500萬元（含），可以委託會計師簽證，但不是這條規定強制。')+'監事會仍要先審，再送大會通過後報主管機關。';
 return {direct:true,category:'協會｜會計師簽證獨立性與決算先審',title,summary,steps,refs:[f(2),f(11),f(22),procedure,...(independent?[license,ethics]:[])],questionState:{focus:'compound'}};
}
if(typeof module!=='undefined'&&module.exports){module.exports=answer;return;}
root.verifiedAssociationCPAIndependence=answer;
})(typeof window!=='undefined'?window:globalThis);
