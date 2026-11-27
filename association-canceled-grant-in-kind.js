(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const county={title:'屏東縣政府民間團體補助作業要點第8、8-1、10點',source:'https://portal.ptc.edu.tw/bulletin/attachment.php?a_sn=33872&b_sn=B114003910'};
const publicAct=n=>law('公益勸募條例','D0050138',n);
const bookkeeping={title:'社會團體財務處理辦法第4、5、8、20、21條',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050097'};
const disclosure=law('公益勸募條例施行細則','D0050146',6);
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>240||!/屏東|縣府/.test(t)||!/補助/.test(t)||!/活動.{0,7}(?:取消|停辦|不辦)|(?:取消|停辦|不辦).{0,7}活動/.test(t)
 ||!/物資|物品|財物/.test(t)||!/主動捐|主動送|自己送|自發送|自願捐|自動送/.test(t)
 ||/合作社|信合社|工會|公會|學校|公司|基金會|公開募款已許可|已有勸募許可|拿到勸募許可|也有公開募|另外公開募|有發文募|申請到勸募許可/.test(t))return null;
 if(/沒有取消|未取消|不取消|沒有停辦/.test(t))return null;
 const paid=!/未到帳|尚未撥|還沒撥|沒有收到補助|未收到補助|還沒收到補助/.test(t)&&/補助.{0,9}(?:已撥|已入帳|已到帳)|拿到補助款|收到補助款|已領到補助|補助已收到/.test(t);
 const notPaid=/未到帳|尚未撥|還沒撥|還沒入帳|沒有收到補助|未收到補助|還沒收到補助|尚未收到補助/.test(t);
 const paidState=paid&&!notPaid?'paid':notPaid?'notPaid':null;
 const designated=/指定.{0,9}(?:原活動|此活動|特定用途)|指定用途|指定給/.test(t)&&!/沒有指定|未指定/.test(t);
 const nonprofit=/已登記為公益性社團法人|本會是公益性社團法人|我們是公益性社團法人|^公益性社團法人/.test(t);
 const noSolicitation=['民眾自己送來的物資，不等同協會向外公開募集','先核對取得方式。如果沒有向不特定民眾發起募集，只是被動接受物資，不要要求填一個不存在的公開勸募許可文號。'+(nonprofit?'符合公益勸募條例第5條的公益性社團法人，以公益目的收到外界主動捐贈，仍適用第6條。':'若協會依法屬第5條的公益性社團法人等勸募團體，以公益目的收受時，仍適用第6條；不能只看名稱叫協會就認定資格。')];
 const receipt=['物資收據與轉贈證明要分開留','適用第6條時須開收據、依指定用途使用、至少每6個月依規公開徵信，並於年度終了後5個月內將辦理情形及收支決算報原設立、立案或監督機關備查。用團體名義開具或保留物資收受憑證，可列收受日期、品項、數量、收據編號與有依據的價值；不臆填價值，不公布不必要個資。'+(designated?'題目已有捐贈指定用途，先核對是否可照原指定轉贈，不因活動取消就自行改作他用。':'擬全部轉贈，先核對捐贈者是否指定用途；若原本指定取消的活動，不要先自行改贈。')];
 const ledger=['補助和物資分開留可核對的帳務紀錄','補助保留核定函、入帳或未撥資訊、已發生支出及繳回憑證；民間物資另留收受清冊、憑證、轉贈日期及受領證明，依帳簿和會計報告規則處理，不用民捐物資沖抵補助應繳款。會計紀錄不等同所得稅列報，稅務是否另有例外要另外查。'];
 const subsidy=['取消活動先找原核定的補助單位',paidState==='paid'?'補助款已入帳：請原核定單位依核定函確認取消、已發生費用是否可核銷及繳款方式；適用屏東通案要點時，剩餘補助款依第8-1點繳回，留存繳回證明。第8點的20日是一般計畫執行完竣後的核銷期限，不能直接當成取消後的期限。':paidState==='notPaid'?'補助尚未收到：先請原核定單位確認取消核定案與後續處理。未領到補助款就沒有該筆已收款可退；如已支出，要先核對核定條件及承辦指示，不表示可自行核銷。':'先查是否已撥款及是否有已發生支出。已領且有剩餘依屏東通案第8-1點繳回；未領要找原核定補助單位處理取消，不把核定金額當成已收款。一般完竣後20日核銷，不當作取消後一律20日。'];
 const steps=t.search(/補助/)<t.search(/物資|物品|財物/)?[subsidy,noSolicitation,receipt,ledger]:[noSolicitation,receipt,subsidy,ledger];
 const carry='屏東協會縣府補助活動取消，民眾主動捐物資，想全數轉贈，收據與帳務怎麼留？'+(designated?'捐贈人有指定用途。':'')+(nonprofit?'我們是公益性社團法人。':'');
 return {direct:true,category:'協會｜補助取消與民間物資',title:'活動取消的補助款，和民眾主動捐的物資分開辦',
  summary:(paidState==='paid'?'已收到的縣府補助若有剩款，向原核定單位確認繳回。':paidState==='notPaid'?'未收到補助款，先向原核定補助單位處理取消。':'補助有沒有入帳會影響繳回方式；先找原核定補助單位。')+'民眾主動捐物是另一件事，收據、用途和帳務分開核對。',
  steps,refs:[county,publicAct(5),publicAct(6),publicAct(7),disclosure,bookkeeping],questionState:{focus:'compound'},
  ...(!paidState?{choiceHeading:'縣府這筆補助款已經入帳了嗎？',choices:[
   {label:'已收到補助款',question:'已收到補助款。'+carry},{label:'尚未收到補助款',question:'尚未收到補助款。'+carry}
  ]}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationCanceledGrantInKind=route;
})(typeof window!=='undefined'?window:globalThis);
