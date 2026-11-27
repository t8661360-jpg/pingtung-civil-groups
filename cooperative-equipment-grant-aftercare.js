(function(root){
'use strict';
const source={title:'內政部台內團字第1150281410號令：合作事業補助作業要點第10點第2款',source:'https://gazette.nat.gov.tw/EG_FileManager/eguploadpub/eg032053/ch02/type2/gov10/num2/Eg.pdf'};
const basis=['只有規定涵蓋的內政部設備適用','依第10點第2款第9目，內政部補助購置的營運或辦公設施設備，在使用年限內遇合作社解散，或業務停頓滿一年，移交當地主管機關保管運用。不能自行留下、處分或拿去分配。停業滿一年不必等正式解散才可能觸發。'];
const files=['依核定文件確認使用年限與移交方式','查補助機關、核定函、財產目錄、購置日期、使用年限及停頓紀錄。縣級合作社若適用上述規定，依所在地主管機關指示辦理清冊及交接。縣府自辦補助、自購，以及設備已超過使用年限應分別按原核定條件、章程或財產程序處理，不能把中央條款當成所有設備的通則。'];
const review=['先確認確實是內政部審核剔除，不只是提醒補件','依第10點第2款第7目，設備不符原核定目的用途或支出不合規定，經內政部審核剔除時，受補助單位可在文到十五日內提出具體理由申復。留存收文日期、剔除通知、原核定計畫、請款與支出憑證，按通知載明方式或原核轉窗口處理。逾期未申復或申復未獲同意，不予核銷。'];
const regular=['一般核銷起算點不同','第10點第2款第1目是計畫執行完竣十五日內送一般核銷資料。不是剔除後的申復期限；兩個十五日不可相互折抵，也不要擅自延後。其他機關自己辦的補助依原公告與來函。'];
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>245||!/合作社|合作事業補助/.test(t)||/信合社|信用合作社|儲蓄互助社|不是合作社/.test(t))return null;
 const ministry=/內政部|合作事業補助作業要點/.test(t)&&!/(?:非|不是)內政部/.test(t);
 const challenge=/剔除|被刪除|不准核銷|不予核銷/.test(t)&&/補理由|申復|異議|救濟|多久|期限/.test(t);
 if(challenge&&ministry&&/文到|收到|核定剔除|已遭剔除|已被剔除|剔除.{0,5}通知/.test(t))return {direct:true,category:'合作事業補助｜核銷剔除與申復',title:'先分文到申復和計畫完竣核銷',summary:'若已收到內政部審核剔除通知，文到十五日內可提出具體理由申復；一般核銷則是計畫執行完竣十五日內，起算日不同。',steps:[review,regular],refs:[source],questionState:{focus:'compound'}};
 if(!/設備|器材|設施|辦公電腦/.test(t)||!/停業|停頓|歇業|暫停.{0,6}(?:營業|業務)|停止營業|解散/.test(t)||!/交|保管|留著|留用|賣掉|處分|繼續用|怎麼辦|如何處理/.test(t)||!/補助|自己買|自購|自籌/.test(t))return null;
 const locally=/縣府(?:自己|自辦)?補助|縣政府(?:自己|自辦)?補助|自己買|自購|自籌/.test(t)&&!ministry;
 const expired=/已過使用年限|超過使用年限|使用年限已(?:屆滿|到期|過了)|已用滿使用年限/.test(t)&&!/還沒過|未過|沒有超過/.test(t);
 const still=!expired&&/使用年限內|仍在使用年限|還在使用年限|使用年限未(?:滿|到)|年限未到|尚未超過使用年限/.test(t);
 const dissolved=/已(?:經)?解散|辦完解散|完成解散|已辦理解散/.test(t)&&!/還沒解散|未解散|尚未解散|沒解散/.test(t);
 const month=/(?:業務停頓|暫停營業|停止營業|停業|停頓|歇業)(?:已經|已|滿|才|約|達|將滿)?((?:\d{1,3})|(?:[一二三四五六七八九]|十[一二]))個?月/.exec(t)?.[1];
 const mv=month?(Number(month)||({'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十一':11,'十二':12}[month]||0)):0;
 const long=(mv>=12||/停(?:業|頓)滿一年|停(?:業|頓)一年(?:以上|多|了)?|(?:暫停營業|停止營業|業務停頓).{0,6}(?:一年以上|一年多|兩年|二年|滿一年)/.test(t))&&!/未滿一年|尚未滿一年|還沒滿一年|不到一年|預計|將滿/.test(t);
 const short=!long&&((mv>0&&mv<12)||/不滿一年|未滿一年|尚未滿一年|不到一年/.test(t));
 const summary=locally?'縣府自辦補助或自購設備，不能直接套內政部設備移交規定。先查核定函與原補助機關。':expired?'設備已過使用年限，不符合這一目所指「使用年限內」的移交條件；仍應核對原補助條件及財產處理程序。':ministry&&still&&(dissolved||long)?'不能自行留下：若仍在使用年限內，已解散或業務停頓滿一年，應移交當地主管機關保管運用。停頓滿一年，即使還沒解散也可能適用。':ministry&&short&&!dissolved?'若只停業不到一年，而且未解散，尚未達到這一目的停頓移交門檻。仍要看核定條件；不能因此就自行出售。':'先核對補助機關、是否仍在使用年限，以及是否已解散或停頓滿一年。這些條件會改變是否要移交。';
 return {direct:true,category:'合作事業補助｜停業設備與財產',title:'停業與解散時，先查補助設備是否要移交',summary,steps:[...(locally?[]:[basis]),files],refs:[source],questionState:{focus:'compound'}};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedCooperativeEquipmentGrantAftercare=route;
})(typeof window!=='undefined'?window:globalThis);
