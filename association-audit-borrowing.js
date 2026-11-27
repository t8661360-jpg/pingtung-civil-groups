(function(root){
'use strict';
const ref=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const f=n=>ref('社會團體財務處理辦法','D0050097',n);
const g=n=>ref('人民團體會務輔導辦法','D0020094',n);
const p=n=>ref('人民團體法','D0050091',n);
const c=n=>ref('民法','B0000001',n);
const audit=['監事會要定期查核，必要時也可臨時查核','社會團體財務處理辦法第22條規定，監事會於定期監事會議執行定期查核，必要時可以召開臨時監事會議查核。依人民團體會務輔導辦法第17條，經費收支與工作執行情形，每次理事會應提審議、送監事會監察；發現不當要提糾正意見送理事會，理事會不處理時，監事會可提會員（代表）大會審議。這些程序不等於監事本人可以代簽契約或直接宣布無效。'];
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>225||/合作社|公會|工會|董事會|公司|股東|農會|漁會|管委會|公務人員協會|財團法人|基金會|個人保證|連帶保證/.test(t))return null;
 const social=/協會|社會團體/.test(t);
 const money=/借款|貸款|借錢|授信|長期借|簽.{0,5}借據/.test(t);
 const authority=/追認|補決議|補開會|授權|違反章程|違反程序|沒經|未經|逕自|擅自|硬是/.test(t);
 const monitoring=/監事|監察|查帳|核對帳目/.test(t)&&/查核|查帳|檢查|監察|查帳目|審查收支|定期|臨時|怎麼(?:處理|做|查|看)|要做什麼|不處理|糾正/.test(t)&&!/辭職|缺額|投票|改選|罷免|名額|清算|解散/.test(t);
 if(social&&money&&authority){
  const collateral=/抵押|設(?:定)?負擔|不動產|房地|土地作擔保/.test(t);
  return {direct:true,category:'人民團體財務｜借款權限與監察',title:'理事長已簽借款：先分內部補決議與對外契約效力',
  summary:'不能只因會員大會事後表決，就認定借款一定有效；也不能只憑未經內部程序，判定對外當然無效。先查誰有核准權、誰簽約、章程及對方是否善意。監事會可依規定查核、提出糾正意見。',
  steps:[['先查章程及本件借款、授權與簽約身分','核對借款由哪個機關依法或依章程批准、章程有無金額或期限限制、是團體借款還是個人借款。事後要補作內部決議，也須由依法有權的機關依通知、議程、出席與表決規定辦理；大會不能以追認掩蓋違反強制規定。'],
  ['對外效力是另一件事','已登記為社團法人而涉及法定代表權的內部限制，民法第27條有善意第三人保護；若實際是無代理權人以代理人名義簽約，第170條另看有權的本人是否承認。兩種不能互換，未見契約和授權資料，不能一概判有效或無效。若有付款或期限，持原件請法律專業人員確認，不要自行當成不存在。'],
  ...(collateral?[['不動產抵押或其他權利設定，要另看財務辦法','若同時以協會不動產設定抵押等權利，社會團體財務處理辦法第13條另有大會通過規定；特殊需要者須先經大會授權理事會及監事會或理監事聯席會議通過，再提大會追認。這不是所有借款一律可以先簽再補。']]:[]),audit,
  ['留存資料並追蹤處理','請監事會核對契約、支付紀錄、相關授權和會議紀錄，記下發現及函送處理結果；持資料洽原立案主管機關確認會務程序，契約效力由法律專業判斷。不要把完整契約或個資貼到櫃檯。']],
  refs:[p(12),p(27),g(17),f(22),c(27),c(170),...(collateral?[f(13)]:[])],questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 }
 if(!monitoring||!/財務|經費|帳|收支|憑證|借款/.test(t)||/法院|強制執行|告訴|貸款利率/.test(t))return null;
 return {direct:true,category:'人民團體財務｜監事會查核',title:'監事會須定期查核協會財務，必要時可臨時查核',summary:(social?'有規定。':'若是一般協會或社會團體，有規定；其他團體須另看其法規。')+'一般社會團體的監事會在定期監事會議執行財務查核；必要時可召開臨時監事會議。發現不當先提糾正，理事會不處理再提大會。',steps:[audit,['核對資料、不要把查核當代簽','依章程及決議查閱會議紀錄、報表和憑證；年度決算另依人民團體法第34條先由監事會審核，並把審核結果提大會。資料提供或程序有爭議時留存紀錄，請原立案主管機關依法查明。']],refs:[f(22),g(17),p(34)],questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationAuditBorrowing=route;
})(typeof window!=='undefined'?window:globalThis);
