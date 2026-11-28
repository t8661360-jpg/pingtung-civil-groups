(function(root){
'use strict';
const ref=(title,p)=>({title,source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+p});
const org=ref('人民團體法第5、6、10、11條','D0050091');
const guide=ref('人民團體會務輔導辦法第4–6條','D0020094');
const civil=ref('民法第103、167、170條：代理與權限','B0000001');
const localGrant={title:'屏東縣政府對民間團體補助經費作業要點（公告及附件）',source:'https://portal.ptc.edu.tw/bulletin/view.php?sn=B114003910'};
const foreign={title:'內政部：國際性民間團體及外國機構辦事處相關規定',source:'https://www.moi.gov.tw/News.aspx?_CSN=2830&n=14112&sms=12358'};
const determination={title:'內政部：分（支）會及分支機構的組織區別',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=220308'};
const norm=q=>String(q||'').normalize('NFKC').replace(/\s+/g,'');
const branches=/分會|支會|分社|分支機構|辦事處|分級組織|縣分|獅子會|總會/;
const a=/協會|社會團體|人民團體|立案證書|縣府立案/;
const subject=/發文|行文|發函|發公文|寫公文|附發文|公文.{0,6}(?:寫誰|名義)|蓋章|圖章|印章|借場|借用|場地|簽約|簽.{0,5}契約|簽租約|主管機關窗口|收補助|申請補助|領補助|拿補助|款項帳戶|開收據|正式收據|公有場地|誰代表/;
const opts={
  local:['自己有地方主管機關的立案證書','確認分會自己地方主管機關立案'],
  domestic:['是國內總會核准設立的分支','確認是國內總會的核准分支'],
  foreign:['是境外機構在臺登記的辦事處','確認是境外機構在臺辦事處'],
  unknown:['還沒確認是哪種登記','確認分會登記類型還不清楚']
};
const choices=Object.values(opts).map(([label,question])=>({label,question}));
function parse(q,prev){
 const t=norm(q);
 if(!t||t.length>570||/^新題/.test(t)||/銀行分行|商號|分公司|管委會|律師公會|工會|漁會|農會|信用合作社|職業工會|住址搬遷/.test(t))return null;
 const k=Object.keys(opts).find(k=>opts[k][1]===t);
 if(k)return {...prev,kind:k,picked:true,letter:prev?.letter??true};
 const correction=!!prev&&/^(?:更正|補充|其實|剛才說錯)/.test(t)&&/立案|法人登記|分會|辦事處|發函|問場地|借用|補助/.test(t);
 const letter=/發文|行文|發函|發公文|寫公文|公文|名義|聯繫|問詢/.test(t);
 const venue=/場地|教室|會議室|公所|活動中心|公有場|開放借用/.test(t);
 const directLocal=!branches.test(t)&&a.test(t)&&letter&&venue&&/立案|登記/.test(t);
 if(!directLocal&&!(branches.test(t)&&subject.test(t))&&!correction)return null;
 if(/如何成立分會|怎麼設分會|分會年費|分會選理事|查詢分會名冊|分會有幾個/.test(t)&&!/發文|行文|發函|公文|簽|借用|場地|收款/.test(t))return null;
 const onlyAsk=/只(?:是|有想|想|要)?(?:發函|寫信)?問|只發函問|問.{0,10}有沒有.{0,4}可借|只有想問|只是聯繫/.test(t);
 const nonlife=/沒(?:有)?(?:另外|再)?(?:去|向)?法院登記|沒(?:有)?(?:另(?:外)?|再)?辦(?:理)?(?:法院)?法人登記|尚未辦法人登記|沒去法院/.test(t);
 const nonInd=/沒(?:有)?(?:自己的|獨立|分會的)?立案(?:證書|證)?|不(?:是|具)?獨立立案|未獨立立案/.test(t);
 const independ=!nonInd&&/(?:自己|獨立|另立案).{0,13}(?:立案證書|在屏東.{0,5}立案|在縣府立案|政府立案|立案)|縣府立案證書|當地主管機關核准立案|立案證書是自己的/.test(t);
 const abroad=!/沒有國外總會|不是境外/.test(t)&&/(?:境外|外國|海外).{0,14}(?:辦事處|機構|組織).{0,6}(?:登記|核准)|已經內政部登記的外國辦事處/.test(t);
 const sub=/總會.{0,8}(?:設置|核准|同意|授權|口頭)|(?:依法|經主管機關)核准.{0,8}(?:設置|設立|設一個|辦事處|分支機構)|(?:總會|全國性協會).{0,18}(?:辦事處|分支機構)/.test(t)&&!/不是總會的分支|不是總會的辦事處/.test(t);
 const pairs=/兩個團體|兩邊|同時有|各自|一邊.{0,15}(?:立案|總會)|還有一個/.test(t)&&independ&&sub;
 let kind=pairs?'pair':abroad?'foreign':independ?'local':sub||nonInd?'domestic':null;
 if(correction&&!kind)kind=prev.kind;
 const noBonus=/沒(?:有)?(?:要)?申請補助|不申請補助|不收補助|不領補助|不拿補助/.test(t);
 const noDeal=/沒(?:有)?(?:要)?簽約|不簽(?:約|租約|契約)/.test(t);
 const grant=!noBonus&&/補助|撥款|核銷|代領|專戶|款項帳戶|收款|收據/.test(t);
 const deal=!noDeal&&/簽約|簽.{0,8}(?:契約|租約)|租約|合約|正式申請|代表簽|正式借用/.test(t);
 const partner=/合作社|共同主辦|合辦/.test(t);
 const intl=/獅子會|國際性|國際團體|國外總會/.test(t)&&!/沒有國外總會/.test(t);
 return {kind,letter:letter||correction&&onlyAsk||venue,venue,onlyAsk,nonlife,grant,deal,partner,intl,receipt:!noBonus&&/收據|收款|代領/.test(t)};
}
function route(q,prev){
 const x=parse(q,prev);if(!x)return null;
 const result=(title,summary,steps,refs,ask)=>({direct:true,category:'分會與辦事處｜名義、發函及授權',title,summary,steps,refs,branchCorrespondenceContext:x,questionState:{focus:ask?'clarify':'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}],...(ask?{choiceHeading:'請選手上文件顯示的情況',choices}:{})});
 const know=['先核文件，不看稱呼或印章猜身分','核對立案證書或設置／登記核准函、章程或組織簡則、代表或書面授權，以及收件機關的表單。證書要看核發機關及所載完整名稱，總會證書影本不等於分會自行立案。地區性名稱或國際團體、獅子會等稱呼本身，不能證明是哪一種。'];
 if(!x.kind||x.kind==='unknown'){
  const refs=[org,guide,determination,...(x.intl?[foreign]:[])];
  return result('分會能不能自己發函，先確認登記身分','先分清是詢問，還是要正式申請、簽約或領補助。只詢問可如實介紹自己是聯絡窗口；正式文件不要先把分會印章當作代表權，或把總會的立案證書寫成分會自己立案。',[know],refs,!x.picked);
 }
 const steps=[],refs=[org,guide];
 if(x.kind==='local'||x.kind==='pair'){
  steps.push(['自己立案的地方團體：可以用立案名稱聯繫','如果持有以本團體為名的地方主管機關立案證書，可以用該證書所載名稱向場地管理單位發函詢問，依章程由有代表權者署名，或由有授權的人聯繫。不需只為詢問先辦法院登記，也不要自稱「社團法人」。如仍有上級團體的章程限制，依實際規定核對；詢問可不代表正式借用已核准。']);
 }
 if(x.kind==='domestic'||x.kind==='pair'){
  refs.push(determination);
  steps.push(['若只是總會的分支，總會和聯絡窗口不要寫成兩個申請主體','人民團體會務輔導辦法第6條的國內分支機構按章程、組織簡則和主管機關核准文件設置；第4、5條的分級組織另查是否持有當地主管機關的獨立立案。只詢問可說明是總會在地方的聯絡窗口。正式文件的申請人通常依有權主體如實寫總會或實際獲准受理之名義，註明分會／辦事處與聯絡人；別把分會圖章當成獨立登記或全部授權。']);
  if(x.intl)steps.push(['國際團體另核身分，名稱不能代替文件','若實際是以外國機構在臺辦事處登記，另看內政部的核准資料及登記代表，不直接套用國內總會分支規定；若是國內團體僅有國際會籍，仍看自己的立案或分支資料。']);
  if(x.intl)refs.push(foreign);
 }
 if(x.kind==='foreign'){
  refs.push(foreign);
  steps.push(['境外機構在臺辦事處：查內政部的實際登記','依內政部辦事處登記文件核對在臺名稱、登記負責人和授權，以及活動或簽約是否在其範圍。登記成聯絡據點不等於取得地方社會團體自己的立案證書，也不自動具有補助資格。外國機構在臺辦事處與國際性民間團體設立，是不同規定。']);
 }
 if(x.venue)steps.push(['詢問場地和正式申請是兩步','活動中心可先向原管理機關問開放時間、申請對象、收費與文件。正式借用時，以場地表單接受的申請主體及授權人辦理，再確認保證金、使用限制與簽章；沒有拿到同意前不要把詢問信當作已借到。']);
 if(x.deal||x.grant){
  steps.push(['負責辦活動不等於有權代表簽約或收款','正式契約要釐清當事人、章程權限與實際代表人。代理人在權限內以本人名義簽，與自己成為當事人不同（民法第103條）；若只獲口頭說可以辦活動，不能推定也授權簽租約、申請款項、收款或用印，請備書面授權並請受理方核對。兩個團體合辦，各查各自代表及決議。']);
  refs.push(civil);
 }
 if(x.grant){
  steps.push(['補助看該案的資格，收款及收據要對得上核定','查屏東縣該年度、該項計畫的申請資格、立案年限、主辦單位與核定對象。由符合資格的主體送件，依核定和機關要求確認帳戶、領款收據及核銷憑證；不能因有分會章、同意辦活動或共同主辦，就由分會、個人或合作社代領。合作社若本身是核定主體，仍按它的核定與文件辦理；如要求代領或不同帳戶，先向原機關核對可否及所需書面依據。']);
  refs.push(localGrant);
 }
 steps.push(['哪個窗口看你要辦哪一件事','立案或分支身分找原核發機關；借場地找場地管理單位；補助找開放申請或原核定機關。向窗口提供立案名稱及文號即可先確認，不必在此貼未遮個資的證書、帳號或印鑑照片。']);
 const title=x.kind==='pair'?'地方獨立立案和總會分支，分別用正確名義':x.kind==='local'?'地方團體已自己立案：可用立案名稱發函詢問':x.kind==='foreign'?'境外機構辦事處要按在臺登記及授權':'總會的分支：聯絡名義和正式申請權要分開';
 const summary=x.kind==='local'?(x.onlyAsk&&!x.grant&&!x.deal?'依你補充的情況，只是問場地開放時間，可用自己立案名稱聯絡管理機關，不需先辦法院法人登記。':'若只是詢問，用自己立案名稱即可先聯繫，不需先拿法院法人證書。正式申請、簽約、補助則依各自資格及權限確認。'):x.kind==='pair'?'兩邊的立案／設置文件不同，不能拿一套公文、授權或帳戶處理。分開確認詢問、正式借用、契約和補助。':'可以先如實聯繫了解規則。正式借用、簽約或領款應先確定權限和對外主體，不能只憑分會名稱、印章或通用活動同意。';
 return result(title,summary,steps,refs);
}
if(typeof module==='object'&&module.exports)module.exports={route};else root.verifiedBranchCorrespondence=route;
})(typeof window==='object'?window:globalThis);
