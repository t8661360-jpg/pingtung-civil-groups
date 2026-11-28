(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const c=n=>law('合作社法','D0050112',n);
const a=n=>law('人民團體法','D0050091',n);
const f=n=>law('信用合作社法','G0380058',n);
const civil=law('民法','B0000001',106);
const moi={title:'法務部（84）法律決字第29716號：同一人代表雙方訂約',source:'https://mojlaw.moj.gov.tw/LawContentExShow.aspx?id=FE077663&type=e'};
const soc=/協會|社會團體|社團法人/;
const support=/理事|董事|主席|監事|會長|代表/;
const finance=/銀行|保險|證券|金融機構|其他信合社|其他信用合作社/;
const normalize=q=>String(q??'').normalize('NFKC').replace(/\s+/g,'');
const notParty=/不是(?:我|該)?(?:個人|理事(?:長|主席|會主席)?(?:本人)?)(?:出租|承租|訂約|簽約|的|名下)|不是(?:與|和|跟|向)理事(?:長|主席)?本人|不是(?:我|理事)個人出租/;
const party=/理事(?:長|主席|會主席)?(?:本人|個人)(?:名下|所有|出租|承租|當房東)?|(?:向|與|和|跟|找).{0,7}(?:自家|本社|本人的)?理事.{0,7}(?:訂|簽|租|買|賣)|(?:理事|主席)(?:本人)?(?:是|當)房東/;
const renter=/共同承租|一起承租|都是承租|同為承租|跟協會一起租|同(?:一|個|一個)場地|同列承租人|都(?:當|是)房客/;
const opposite=/兩個團體彼此|(?:協會|合作社).{0,8}(?:互相簽|互簽|出租給|承租)|彼此(?:是|簽)|房東和房客|作為.{0,6}相對方|兩個團體.{0,5}互簽/;
const dispute=/爭議|法院|訴訟/;
const business=/競爭|同業|相同業務|同類業務/;
const outside=/工會|公會|漁會|農會|基金會|保險合作社|計程車合作社|清算|解散|勞資|欠薪|社員退社|選舉公職/;
const report=/報備|備查|變更登記|報縣府|報公所|核准|哪.{0,3}主管機關/;
function answers(q){
 const raw=String(q??'').trim(),t=normalize(raw);
 if(!t||t.length>420||!/合作社|信合社/.test(t)||!support.test(t)||outside.test(t))return null;
 const credit=/信用合作社|信合社/.test(t);
 const assoc=soc.test(t);
 const bilateral=/同一(?:個|位)?人.{0,10}簽|一個人.{0,8}簽|自己.{0,8}簽.{0,5}(?:雙方|兩邊)|兩邊.{0,7}(?:自己|都可|都由|同人|一起簽)|雙方代理|代雙方簽|代兩個.{0,6}簽|另派|各自.{0,8}簽|代表.{0,5}簽/.test(t);
 const contract=/租約|契約|合約|租房|訂約|承租|出租|簽合同|簽約|簽名|簽署|房東|房客/.test(t);
 const contractQuestion=contract&&/簽|誰|代表|怎麼辦|章程/.test(t);
 const concurrency=/(?:同時|想|能|要|可不可以|能不能|可以|得|續)?(?:兼任|兼當|兼做|兼|同時當)|兩個身分|兩邊(?:可|能)兼/.test(t)&&!/(?:不是|不問|不談|並非)兼任/.test(t);
 const bank=credit&&finance.test(t.replace(/非金融(?:協會|團體)/g,''));
 const decisionOnly=assoc&&concurrency&&report.test(t)&&business.test(t);
 const mode=t.match(/租約關係確認:(理事本人|兩團體互為對方|兩團體共同承租|仍不清楚)/)?.[1];
 if(!(credit&&(assoc||bank)&&/(兼|同時|想當|兩個身分|兩邊).{0,15}/.test(t))&&!(assoc&&contractQuestion)&&!decisionOnly&&!mode)return null;
 if(credit){
  const flags=bank?['金融職務原則不得兼，投資例外要中央主管機關核准',
   '依信用合作社法第17條，理事、監事、經理人或職員不得兼任其他信用合作社、銀行、保險、證券事業或其他金融機構的任何職務。因投資關係並經中央主管機關核准者，才可兼被投資銀行董事或監察人。銀行邀請、兩邊書面同意或章程允許，不能替代法定例外及核准。']:null;
  const nonprofit=['非金融協會不直接套銀行規定，也不因名稱就一定可兼','非金融協會的理事長不會僅因是協會職務就落入第17條所列金融機構；仍依雙方實際業務性質、任職資格及章程判斷。有競爭疑慮要核信用合作社法第2條及合作社法第40條的補充適用，不能僅用兩邊同意自行認定可兼。信合社的金融事項找中央金融主管機關或依法受託主管單位；協會任職、名冊或報備找協會原主管機關。'];
  const steps=[...(bank?[flags]:[]),...(assoc?[nonprofit]:[])];
  return {direct:true,category:'信用合作社｜銀行與協會職務分流',title:bank&&assoc?'銀行董事與非金融協會理事長的兼任規定不同':bank?'信合社理事原則不能兼銀行董事':'非金融協會理事長不是銀行董事，要另核兼任資格',
   summary:(bank?'銀行董事只有符合投資關係、被投資銀行及經中央金融主管機關核准，才可能適用例外。':'非金融協會不直接等於金融機構。')+(assoc?'協會職務、章程與實際業務另核，不是兩邊同意就一定能兼。':''),steps,refs:[f(2),f(3),f(17),...(assoc?[c(40),a(17)]:[])],questionState:{focus:'compound'}};
 }
 const no=/沒有.{0,10}競爭|不競爭|並無競爭|無業務競爭|沒有跟.{0,12}做一樣/.test(t)&&!/不確定|不清楚|不知道/.test(t);
 const yes=!no&&!/不確定|不清楚|不知道|算不算|會不會是/.test(t)&&/競爭業務|已有競爭|互相競爭|確實有競爭|已確認有競爭|與.{0,6}有競爭|有競爭關係/.test(t);
 const different=/不同.{0,6}(?:代表|人).{0,12}簽|各自.{0,8}(?:合法代表|有權代表)|不是同一人簽/.test(t);
 const pos=mode==='理事本人'||!mode&&party.test(t)&&!notParty.test(t);
 const sharedRenter=mode==='兩團體共同承租'||renter.test(t);
 const mutual=mode==='兩團體互為對方'||opposite.test(t)&&!sharedRenter||notParty.test(t)&&/互相簽|互簽|彼此|相對方/.test(t);
 const branch=pos?'personal':sharedRenter?'coTenant':mutual?'mutual':different||bilateral?'shared':'unknown';
 const leaseApproval=/都同意|開會同意|兩份會議|都通過|有決議|決議同意/.test(t);
 const conflict=['是否可兼任，與一筆租約誰能簽，是兩件事',
   (no?'若確定雙方沒有競爭關係，第40條的競業限制不因這筆租約就適用；不代表其他章程或任職資格已符合。':yes?'已知兩邊有競爭關係，依合作社法第40條不得兼任，兩邊同意、聲明迴避或送報備不能解除這個法定禁止。':'依合作社法第40條，不得在與本社有競爭關係的團體任職；是否競爭要看商品、服務、市場或交易對象，不能只因有租約或共用場地就判定。')+'同業同級其他合作社理監事也另有限制；協會理事長須依各自章程與會議選任。'];
 const who1=['合作社真的與自家理事本人訂約，合作社由監事代表',
  '合作社法第39條第1項第4款規定，合作社與其理事本人訂租約或為訴訟行為時，監事代表的是合作社一方。理事以其本人作房東的一方簽；若協會也是共同承租人，協會另由自己依法有權的人簽署，同一監事不因第39條就能代協會簽。三方權利義務及授權仍須核契約和各自決議。'];
 const who2=['兩個團體互為契約對方，不等於租理事本人的房子',
  '若房東和房客分別是合作社與協會，沒有理事個人當事人，第39條第1項第4款不使合作社監事當然能代簽；合作社依第34條及章程查有代表權的人，協會也查章程與有效授權。'+(leaseApproval?'兩邊會議同意出租／承租，不必然等於已合法許諾同一人同時代表雙方；要看決議內容是否明確。':'')+'參照民法第106條及法務部函釋，同一人不得僅憑兩個職稱就代雙方訂約；事前許諾與專為履行既有債務等例外須依法個別查。較穩妥是各派不同且有權的代表；已簽件不在此認定有效或無效。'];
 const who3=['共同承租的兩團體，不要和兩團體互租混在一起',
  '兩個團體同為房客、房東是第三人時，先看合約是否也在兩團體之間分配租金、押金、賠償或其他義務；只說共同承租，不能確定是否為民法第106條所稱雙方代理，也不表示一人當然能代兩個團體簽。先核兩個團體各自的法人或立案身分及授權，不自行假定協會也是法人；較穩妥是由不同且合法的代表簽租約。合作社若另與理事本人訂約，才按第39條由監事代表合作社。'];
 const who4=['先核對租約上實際列的是哪些當事人',
  '若合作社向理事本人承租，合作社這方由監事代表；若兩團體互簽，不能直接用第39條讓監事簽。若是各自與第三方共同承租，則看同筆契約有無兩團體之間的權利義務。各自核代表權、章程及決議；不因一人有兩個職稱就可自行在兩邊簽名。'];
 const office=['是否需報備，按團體及實際職務變更分開',
  '合作社的選任異動依法辦理合作社登記或報送；協會選任職員簡歷冊／負責人名冊異動，依人民團體法第54條30日內報原主管機關核備。具體窗口按原登記資料與該次會務處理，地方合作社事務依合作社法第2-1條確認縣市主管與目的事業主管；不要把協會或合作社都一律送公所，也無法用登記／報備把法定競業禁制變成可兼。'];
 const steps=[];
 if(contractQuestion||mode)steps.push(branch==='personal'?who1:branch==='mutual'||branch==='shared'&&bilateral&&!different?who2:branch==='coTenant'?who3:who4);
 if(concurrency||business.test(t)||decisionOnly)steps.push(conflict);
 if(report.test(t))steps.push(office);
 let choices={};
 if(contractQuestion&&branch==='unknown'&&!mode&&raw.length<=320)choices={choiceHeading:'租約上的當事人是哪種？',choices:[['合作社與理事本人訂約','理事本人'],['合作社與協會互為契約對方','兩團體互為對方'],['兩個團體都是承租方','兩團體共同承租'],['目前還不清楚','仍不清楚']].map(([label,value])=>({label,question:raw+'；租約關係確認：'+value+'。'}))};
 const title=contractQuestion?(branch==='personal'?'合作社與理事本人訂約，監事代表合作社而非協會':branch==='coTenant'?'共同承租先查契約及兩團體各自授權':'合作社與協會簽約，先分當事人和兩邊代理'):'已確認有競爭時，雙方同意或報備都不能解除兼任限制';
 const summary=contractQuestion?(branch==='personal'?'合作社側由監事代表；如協會也是承租人，協會另查自己的合法代表。':branch==='coTenant'?'共同承租先看第三方以及團體間的義務；兩邊都須各自合法授權。':'不要只因身兼兩職就直接同一人簽。合作社與理事本人訂約和合作社與協會互簽是兩種不同情況。'):(yes?'有競爭關係依第40條不得兼。':'先確認是否具競爭關係；依第40條，若具競爭關係不得兼任。')+'兩邊書面同意或主管機關備查不能替代法定禁制。';
 return {direct:true,category:'合作社與協會｜兼任、契約及代理',title,summary,steps,refs:[...(contractQuestion?[c(34),c(39),civil,moi]:[]),...(concurrency||business.test(t)?[c(40),a(17)]:[]),...(report.test(t)?[c('2-1'),a(54)]:[])],questionState:{focus:choices.choices?'clarify':'compound',domain:'coop-conflict'},...choices};
}
if(typeof module!=='undefined'&&module.exports){module.exports=answers;return;}
root.verifiedCoopConflictsAndContracts=answers;
})(typeof window!=='undefined'?window:globalThis);
