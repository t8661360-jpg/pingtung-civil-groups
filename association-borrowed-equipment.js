(function(root){
'use strict';
const norm=q=>String(q??'').normalize('NFKC').replace(/\s/g,'');
const ref=(title,id,n)=>({title:title+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+id+'&flno='+n});
const civil=n=>ref('民法','B0000001',n);
const finance=n=>ref('社會團體財務處理辦法','D0050097',n);
const grants={title:'屏東縣政府對民間團體補助經費作業要點',source:'https://ptc.familyedu.moe.gov.tw/fileRename.aspx?fid=40994&kid=2&site_id=19&uid=3454'};
function adjust(prior,q){
 const t=norm(q);
 if(!prior||!/^(?:更正|補充|不是|現在)/.test(t)||!/器材|設備|修繕|借用|租公所/.test(t)||/合作社|信合社|工會|財團法人|公會/.test(t))return q;
 return /協會|社會團體/.test(t)?q:'協會；'+q;
}
function route(q){
 const raw=String(q??'').trim(),t=norm(raw);
 const domain=t.replace(/(?:不是|並非)(?:一般)?合作社/g,'');
 if(t.length>410||!/協會|社會團體/.test(domain)||/合作社|信合社|商業公會|職業公會|工會|財團法人/.test(domain))return null;
 const objects=/器材|音響|設備|桌椅|消防器|投影機|機具|擴音器|帳篷|物品/.test(t);
 const official=/里辦公處|村辦公處|里辦|公所|縣府/.test(t);
 const borrow=/借用|租借|借來|借的|借了|借走|向.{0,14}借|洽借|想借|出借/.test(t);
 const damaged=/磨損|毀損|壞了|弄壞|損壞|修繕|維修|要修|修理|賠/.test(t);
 const sale=/送給|送人|捐給|捐出|轉送|移轉|拿走|交給|處分|拿去給|送別|賣|一起送/.test(t);
 const closing=/解散|清算/.test(t)&&!/(?:沒有|不是|不打算|不準備|不會|不要|取消)(?:要)?解散/.test(t);
 const receipt=/報名費|收錢|收費|代收|收款/.test(t);
 const label=/貼紙|公物標籤|財產標籤|所有權不清|不知道誰的/.test(t);
 const grant=/補助|核銷|縣府核准買|縣府核准購/.test(t);
 const explicitLicensedResidue=/(?:公益勸募|核准勸募|公開勸募).{0,13}(?:餘款|賸餘|剩餘)|(?:餘款|賸餘|剩餘).{0,10}(?:公開|核准)勸募/.test(t);
 if(!objects||!(official||borrow)||!(closing||damaged||sale||receipt)||explicitLicensedResidue)return null;
 if(/(?:參選|要選|競選|當選|就職|任期|兼職|兼任).{0,8}(?:里長|村長)|(?:里長|村長).{0,8}(?:能兼|可以兼|參選|當選|就職)/.test(t)&&!closing&&!receipt&&!damaged&&!sale)return null;
 const status=t.match(/財物確認[：:](借用不移轉|已合法捐贈入帳)/)?.[1];
 const unknown=(label||closing&&!/借用|租借|借來|借的|借了|向.{0,14}借/.test(t))&&!status;
 const isOwned=status==='已合法捐贈入帳';
 const steps=[],refs=[civil(464),civil(467)];
 if(unknown)steps.push(['只憑里辦公處貼紙不能認定所有權','把借用單、財產卡、原補助機關核定、捐贈接受或驗收與歸還文件對起來。未核實前暫停移轉。若確認已合法受贈才列入協會自有財產；若只交付供借用，就先還給原權利人。']);
 else steps.push(['借用、租用和捐贈是不同的關係',isOwned?'已確認是依法受贈入帳的自有財物，仍須查用途條件、補助限制及有權處分的程序，不因其他協會同意接收就可以交付。':'若器材只借來使用，所有權仍在原權利人；按借用紀錄、用途及約定清點歸還。協會不能捐給別的團體；未取得出借方同意，也不能讓其他團體自行拿去使用。']);
 if(official)steps.push(['找原出借或管理窗口，不把里辦公處當協會','依文件辨明有權管理的里辦公處、公所或縣府承辦。涉及公物處分、租借條件、修繕或由兼任者核准，要先按管理規則確認書面授權、避開同一人代表雙方決定；不能僅憑口頭承諾或自行在里辦公處代收。']);
 if(damaged){refs.push(civil(468));steps.push(['先查正常耗損還是保管失當','先通知出借方，不在交還前自行修理或更換。把借用當時與返還現況、照片、已有異常及原約定交原出借方核對。依約或按物的性質使用造成的正常磨損，與未盡保管注意造成的損害不同；不要自行拆換封條、報廢或推定一律由協會或里長賠。修繕費需另查契約、協會授權與原補助核定。']);}
 if(receipt){refs.push(finance(16),finance(17));steps.push(['活動報名費走協會自己的收據和帳','先核對活動主辦及場地／器材管理條件是否允許收費。合法的協會報名費由協會授權人員收、開正式收據及留存根、隨收隨存入協會帳戶，不用里辦公處或個人帳戶，也不把費用先在收入中坐抵。']);}
 if(grant){refs.push(grants);steps.push(['補助設備及未核銷款分開','設備是否須繳回、有無用途或年限限制，查原核定函，先向原補助機關確認；核准購買不一定就是補助，先核對是否適用補助規定。已花未核銷與根本未支用的錢不是同一筆。不是用另一團體的收據來抵，未支用餘款依適用規定繳回。']);}
 if(/會費/.test(t))steps.push(['會費和捐贈都要按來源核對','無指定捐贈如依法接受，留正式收據和帳憑；未收齊的會費先依章程釐清欠繳情形，不能直接當成已收到的費用或抵銷財物。請先保留原始帳務，不能把來源不同的錢整筆交給新協會。']);
 if(closing){
  refs.push(ref('人民團體法','D0050091',59),ref('人民團體會務輔導辦法','D0020094',27),civil(44));
  steps.push(['準備解散先核合法程序，不能先交設備或存摺','由會員（代表）大會依法作決議，按立案及法院法人登記狀態查應辦程序，保留會員大會的出席、投票和決議紀錄；沒開會、沒有可確認決議，不把理事長口頭承諾當成清算授權。有權清算人先分原權利人財物、補助、一般捐款、廠商費用或欠租與其他債務，處理債務後再依法確認自有賸餘。公益法人不得把賸餘給自然人或營利團體。']);
  if(/工資|薪資|員工|資遣/.test(t)){refs.push(ref('勞動基準法','N0030001',28));steps.push(['工資另核優先順位','依勞基法第28條查應付工資期間與法定順位，和一般租金或廠商費用分列，在清算中確認，不先分錢。']);}
  if(/勸募|募款/.test(t)&&!/(?:沒有|未|不)(?:向外|公開|核准)?(?:勸募|募款)/.test(t)){refs.push(ref('公益勸募條例','D0050138',22));steps.push(['原勸募案不要混進一般餘款','核對哪些是在許可內收的，有沒有逾許可期間募的。解散時許可勸募的賸餘財物，以及逾期募集所得，依第22條返還捐贈人；難返還先請原許可機關認定後繳交，不能帶進別的團體帳戶。']);}
 } else if(/理事會|修繕/.test(t))steps.push(['沒有解散就按現在的借用或租用走','若是租公所場地和另外借器材，各看各的契約、使用許可和費用。一般修繕費先分清誰負擔，再按章程及預算核對可支出與有權決議；理事會表決不改變器材所有權或補助用途。']);
 const choices=unknown&&raw.length<=280?[{label:'確認只是借用，未移轉所有權',question:raw+'；財物確認：借用不移轉。'},{label:'確認已合法捐贈，並列入帳冊',question:raw+'；財物確認：已合法捐贈入帳。'}]:[];
 return {direct:true,category:'協會會務｜借用器材與公私財物',title:closing?'借用器材與協會解散：先查所有權，再談歸還與清算':'借器材、修繕與活動費用：現場使用不等於有權處分',
 summary:unknown?'先查器材所有權，確認前不要交給別的協會，也不要先分錢。':closing&&!isOwned?'仍屬別人的借用器材，不能跟協會財產一起送給別人；先依約聯絡出借方，再把協會自己的債務和自有財產分開處理。':closing?'已受贈的資產也不能先交給新團體；先查來源、限制及合法清算程序。':receipt?'借用器材、場地使用及活動收費要分開。不要用里辦公處或個人名義代替協會收費，也不要先假定能修繕、轉借或轉送。':damaged?'先通知出借方並確認借用約定，不要自行修或轉送；記下損壞情形，再確認能否按時歸還與責任。':'先確認是不是協會自有財物，未確認不要轉借、轉送或擅自變更用途。',
 steps,refs,questionState:{focus:'compound'},borrowKeepContext:true,actions:[{label:'聯絡承辦',view:'contact',sub:''}],...(choices.length?{choiceHeading:'器材目前是哪一種所有權狀態？',choices}:{})};
}
if(typeof module==='object'&&module.exports)module.exports={route,adjust};
else {root.verifiedAssociationBorrowedEquipment=route;root.associationBorrowedEquipmentFollow=adjust;}
})(typeof window==='object'?window:globalThis);
