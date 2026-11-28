(function(root){
'use strict';
const norm=q=>String(q??'').trim().normalize('NFKC').replace(/\s/g,'');
const ref=(name,p,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+p+'&flno='+n});
const county={title:'屏東縣政府對民間團體補助經費作業要點第8、8之一、9、10點',source:'https://ptc.familyedu.moe.gov.tw/fileRename.aspx?fid=40994&kid=2&site_id=19&uid=3454'};
const privacy=n=>ref('個人資料保護法','I0050021',n);
const incidentLaw={title:'個資法第12條現行條文：查明後通知當事人',source:'https://www.pdpc.gov.tw/News_Html/100/'};
function prep(q,prior){
 const t=norm(q);
 const correction=!!prior&&/^(?:更正|我說錯|補充|不是|還沒|已經|剛剛|確認)(?:[，,:：]|$|沒有|只)/.test(t)&&/補助|捐物|捐贈|報送|照片|公開|簽|社群|成果/.test(t)&&!/另問|新題|換一題|組織解散/.test(t);
 return {t,correction};
}
function route(q,prior=''){
 const raw=String(q??'').trim(),{t,correction}=prep(q,prior);
 const [beforeChoice,selection]=t.split('公開狀態確認:');
 const original=beforeChoice, active=selection||'';
 const scope=correction?norm(prior):t;
 if(!t||t.length>500||/社群廣告|大學考試|選舉名冊|共犯|記者揭露|票據法/.test(t))return null;
 const funding=/核銷|補助|核定|承辦|報送期限|備查/.test(t+scope)||/公所.{0,8}縣府.{0,8}核准|縣府.{0,8}公所.{0,8}核准/.test(t);
 const data=/成果|照片|簽到|簽領|受助|受扶助|相簿|人數|住址|服務日期|名冊|障礙人數/.test(t);
 const publicity=/遮臉|遮蔽|公開|社群|網頁|臉書|網路|誤貼|同意|允許|權限|外洩|看得出|辨識|電話|住址|識別/.test(t);
 const fundMix=/兩個.{0,9}(?:補助|機關)|各自核定|縣府.{0,12}公所|公所.{0,12}縣府|兩邊.{0,9}核准|多.{0,3}機關|兩套帳/.test(t);
 const originalVoucher=/原(?:本|始).{0,4}(?:單據|憑證|發票)|一張.{0,8}(?:發票|憑證)|(?:發票|單據|憑證).{0,7}(?:只|就|僅|共用)|支用明細/.test(t);
 if(!funding||!(data&&publicity||fundMix&&originalVoucher&&/退|兩次|重複/.test(t)))return null;
 const noPublic=/^(?:尚未公開|已公開)$/.test(active)?active==='尚未公開':/沒有公開照片|沒有公開|未公開|還沒貼|還沒公開|只有報送|不對外公開|不公開照片|不是給社群/.test(original);
 const publicYes=!noPublic&&(active==='已公開'||/誤貼|已(?:經)?公開|已(?:經)?貼|簽領表貼在網頁|相簿.{0,9}已上架|外洩|被轉傳/.test(original));
 const submitted=/已(?:經)?(?:經)?送(?:出|件)|核銷已送|已報送|先前有交|公文已送/.test(t);
 const counts=/人數|多少人|參加人次|統計/.test(t);
 const donated=/公司.{0,7}(?:實物|捐|食材)|企業.{0,10}捐|贊助者|捐物|送食材|公司.{0,8}送/.test(t);
 const multi=!/(?:公所|另方).{0,4}(?:沒有|沒|未)(?:補助|給錢)|只有(?:縣府|原補助單位)|只有一(?:個|家)補助/.test(t)&&fundMix;
 const entity=/協會和合作社|合作社|兩個團體|兩套帳|不同團體|另一家協會/.test(t);
 const remain=/餘款|退款|要退|沒(?:有)?用到|沒花完|沖下一場|退回/.test(t);
 const flow=/污染|錯匯|匯錯|跨活動|搬地點|改地點|延期|改期|變更場地/.test(t);
 const steps=[],refs=[county];
 if(data){
  if(publicYes){refs.push(incidentLaw);steps.push(['先下架或限制正在公開的資料，保留必要紀錄','立刻停止不必要的公開分享，限制相簿、簽領表或雲端連結的存取。私下記錄何時、哪些資料、受影響範圍與處理經過；不要為重做公開版而刪掉核銷原件。若違反個資法造成洩漏或其他侵害，依現行第12條查明情形後，以適當方式通知受影響者。依個案確認主管機關、補助條件或業別另有無事故通報要求，不自行套固定期限。']);}
  else if(noPublic)steps.push(['如果尚未公開，就先別放出可辨識的版本','就你提供的資訊，沒有必要當作已發生公開外洩。只有承辦要查核時，依核定函以合規方式交必要資訊；若只問統計人數，先確認機關需要參與人數還是人次，不必另外建立實名名單或附照片。']);
  refs.push(privacy(5),privacy(19),privacy(20),ref('政府資訊公開法','I0020026',18));
  steps.push(['公開成果不能直接貼正式報送原件','對外可用不具識別性的成果數字、場地或物資照片。若選照片，用無法辨識人身的構圖，或修掉臉、名牌、簽到／簽領文字、聯絡電話、住址與可相互辨認的日期和細節。單遮臉可能不夠；無法去除辨識資訊就別公開。屏東通案第9點是縣府公開補助事項、受補助團體與金額的規則，不表示受助民眾名冊或原成果附件也要上網。']);
  steps.push(['正式備查：只交法令或核定需要的證明','財務原本、正式報送資料、對外成果分開保管。只交承辦依法或依核定需要的必要資料，按原機關認可的管道送件，限制存取；不要轉傳含受助住戶、聯絡電話、服務日期等完整名單或整個雲端資料夾，也不要貼到小屏。'+(submitted?'已送件，請先聯絡原承辦核對是否可更正或補送；保留原版、修訂時間、內容及送達紀錄，不自行替換或倒填。':'如欄位或附件不確定，先問原承辦是否可交去識別照片、彙總人數或其他佐證，不先承諾一定接受。')]);
 }
 if(multi||originalVoucher||entity){steps.push(['一張發票不會變成兩份原本','保留原始單據、實際支用明細及付款證明，列活動、原核定項目、應負擔金額、實支、各資金來源及原本在哪裡。'+(multi?'有多個補助機關，分別列核定補助項目及金額，按各自核定與實際負擔分攤；先問各機關可否用註記已分攤金額的核認影本，以及哪方留原本。不能用同一張發票向兩機關各請同一筆，不做兩個原本。':'按實際付款與自籌或贊助來源登帳，不複製發票冒充原本。')+(entity?'協會、合作社及不同活動各自對帳、保留本身憑證，不能把他方金流直接當成自己的支出。兩個團體的銀行帳戶與付款人須對得上；發現錯匯，先保留紀錄並依合法程序核對更正或退回，不能逕拿錯收的錢抵自己這場支出。':'')]);}
 if(donated)steps.push(['公司捐物品不當成另一個補助機關的現金','企業實物捐贈另留實際收到的品項、數量、用途、收據和入帳依據。不是買入的現金支出，不能用它做不實核銷；同一物品有合法的實買、運費或其他費用時，各依來源及憑證核對。']);
 if(remain||flow)steps.push(['退回、改案和實際支出另處理','未支用的補助餘款依屏東通案第8點之一繳回，不自行沖到下一場。押金退回不列為實支；部分扣款及延期、改場地、錯匯，核對原核定、契約和實際金流，先向原補助機關確認能否變更或如何更正，保留原憑證及退款證明。']);
 const ambiguous=data&&!publicYes&&!noPublic&&/公開|貼|上架/.test(t)&&!/已送出|已經送/.test(t);
 const choices=ambiguous?[{label:'還沒公開',question:raw+'；公開狀態確認：尚未公開'},{label:'已經公開，需要先處理',question:raw+'；公開狀態確認：已公開'}]:[];
 return {direct:true,category:'補助核銷｜原始憑證、正式報送與公開成果',title:'補助成果與核銷：公開版和交承辦的原件分開',
 summary:publicYes?'先停止公開可辨識的資料，保留原始單據與處理紀錄，再做安全的公開版本及依法辦理的補件。':data?'可以先做不具識別性的公開成果，但不要更動或公開原單據、簽領表及名冊；報送資料與公開版各走自己的規定。':'原始單據留存、各案分攤如實列示，不能複製成兩份原本或重複請領。未用的補助餘款依規定繳回。',
 steps,refs,questionState:{focus:'compound'},proofContext:true,actions:[{label:'聯絡承辦',view:'contact',sub:''}],...(choices.length?{choiceHeading:'照片或完整簽領表目前有對外公開嗎？',choices}:{})};
}
if(typeof module==='object'&&module.exports)module.exports={route,prep};
else root.verifiedGrantEvidenceAndPrivacy=route;
})(typeof window==='object'?window:globalThis);
