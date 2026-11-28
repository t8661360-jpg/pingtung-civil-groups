(function(root){
'use strict';
const ref=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const c=n=>ref('民法','B0000001',n), p=n=>ref('人民團體法','D0050091',n);
const guide=ref('人民團體會務輔導辦法','D0020094',27), dues=ref('社會團體財務處理辦法','D0050097',14);
const interpretation={title:'法務部法律字第11003504230號：人民團體解散程序',source:'https://mojlaw.moj.gov.tw/LawContentExShow.aspx?id=FE348483&type=e'};
const county={title:'屏東縣政府對民間團體補助經費作業要點第8、8之一及10點',source:'https://portal.ptc.edu.tw/bulletin/attachment.php?a_sn=33872&b_sn=B114003910'};
function route(q){
 const input=String(q??'').trim(), t=input.normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>460||!/協會|社會團體|社團法人/.test(t)||!/解散|清算/.test(t)||/合作社|公會|工會|農會|漁會|財團法人/.test(t))return null;
 const estate=/剩[餘下]|賸餘|結餘|分[配錢給財]|平均分|可分給|能分給|財產.{0,8}(?:歸|接收)|誰接收|自籌/.test(t);
 const fees=/會費|退費|退會|離會|退休會員/.test(t);
 const own=/捐[贈款給]|贊助|借[款用給]|借協會|出資|設備|器材|冰箱|所有權/.test(t);
 const grants=/補助/.test(t);
 const debt=/債務|債權|清債|清償|欠款|廠商|先還|借款/.test(t);
 const vote=/大會.{0,12}(?:同意|過半|出席|多少人|表決|決議)|半數.{0,5}出席|有多[少數]人同意|理事長.{0,8}決定|這樣有效|表決門檻|理事會和大會/.test(t);
 const process=/返還|歸還|繳回|拿回|還縣府|還給|退給|退掉|分[配錢給財]|平均分|均分|能分|可分|送另|交給|發還|誰接收|歸屬|分三類|分開處理|怎麼處理|如何處理|應該找誰|可以嗎|是不是|有效/.test(t);
 if(!(own||estate||grants)||![estate,fees,debt,vote].some(Boolean)||[estate,fees,own,grants,debt,vote].filter(Boolean).length<2||!process)return null;
 if(/準備基金/.test(t)||(/欠繳|積欠|欠費/.test(t)&&/催繳|追收|補收/.test(t)&&!estate&&!own&&!grants))return null;
 // Do not infer registration just because the user asks about courts.
 const unregistered=/只(?:有)?立案|僅立案|(?:未(?:辦|做|完成|經)?|沒有|沒辦|還沒|不曾)(?:向)?(?:法院)?(?:辦理)?(?:社團)?法人登記|確認：未辦/.test(t);
 const registered=!unregistered&&/以?公益(?:為目的之)?(?:的)?(?:社團|協會)?法人|民法登記的社團法人|(?:已|有)(?:經|辦|完成|辦好|辦理)*法院法人登記|(?:已|有)(?:經|辦|完成|辦好|辦理)*法人登記|已登記(?:為|的)?(?:公益)?社團法人|確認：已辦/.test(t);
 const publicPurpose=registered&&/公益/.test(t);
 const exactHalf=/正好(?:只有)?一半|剛好(?:只有)?一半|出席(?:人數)?(?:剛好|正好|只有|僅)?(?:半數|一半)|一半出席/.test(t);
 const established=/已(?:經)?依法決議|解散已生效|已經完成解散程序/.test(t);
 const suppliedRegistration=/；登記狀態確認：/.test(input);
 const countyNamed=/屏東|縣府/.test(t);
 const balance=/未(?:用|花|核銷)|還沒(?:核銷|花|用)|剩[餘下].{0,6}補助|補助.{0,6}(?:餘額|餘款)|補助餘/.test(t);
 const labels=[], refs=[guide,c(40)];
 if(vote||!established){
  const voteDetail=(exactHalf?'如果實際出席剛好一半，還沒達到開會門檻；在場八成或全數贊成也不能補足。':'')+'依人民團體法第27條及第59條，會員（會員代表）大會須超過應出席人數的一半，並由出席人數三分之二以上同意，才達到自願解散的法定票數門檻。理事會同意或理事長點頭不能取代大會。若已辦法院法人登記，內政部及法院指引另依民法第57條，以全體會員三分之二以上同意為門檻；法務部對特定人民團體個案曾採第27條程序。兩者分母不同，先拿章程與名冊向原主管機關、管轄法院確認，不只用較低門檻。';
  labels.push(['要不要重新開大會？先看出席、再算同意票',voteDetail]);refs.push(p(27),p(59),interpretation);
 }
 labels.push(['先清點、清債，剩下的才叫清算賸餘','請依法有權的清算人先分清第三人財產、團體資產、應收款和應付債務。結束既有業務、收回債權並清償依法應付的款項後，才處理可分配的賸餘；不能由理事長單獨把財產拿走。'+(debt?'廠商尾款、會員或理事墊款／借款，先核對契約、借據與金流；不能只因是理事或曾出資就先付。':'')]);
 if(own||fees){
  const ownership=own?'冰箱、器材或款項，先看原始收據、捐贈／借用約定、財產清冊與金流。若有證據是借用且所有權仍屬對方，依約查明歸還；若已捐贈給團體，不能只因對方退會或解散就要求拿回，另有返還條件或負擔則查約定。若是已成立的借款或墊款，另當債務核對，不是分賸餘。':'';
  const paid=fees?'已繳的會費不是當然可退。社會團體財務處理辦法第14條規定入會費與常年會費的標準及繳納方式應寫入章程；如有退費需要，退費原則，須由理事會訂定並經會員（會員代表）大會通過，不能借「退費」名義分配補助資產或清算賸餘。退會也不等於擁有團體財產。':'';
  labels.push(['會費、捐贈、借用物與真正借款是四件事',ownership+paid]);if(own)refs.push(c(406),c(412),c(464));if(fees)refs.push(dues);if(registered&&fees)refs.push(c(55));
 }
 if(grants){
  const cash=balance?'尚未核銷不等於全數沒花；把已支用待核銷與未支用的餘額分開。':'';
  const locality=countyNamed?'如果適用屏東縣通案要點，第8點的設備核銷要有列入團體財產的證明，第8點之一的剩餘補助經費應繳回；第10點另處理查實未依核定用途等應繳回事由。':'如果適用屏東縣通案要點，未用完的補助經費依第8點之一應繳回；其他補助則核對自己的原核定條件。';
  labels.push(['補助設備、補助餘款、自籌款分開列冊',cash+locality+'已購的設備不等於未花的補助款，部分自籌也不表示可先送人或交給舊會員。留存補助核定公文、財產清冊、收據與出資比例，由清算人向原補助機關確認是否需繳回或可移轉；不要把自籌結餘一併當成補助款。']);refs.push(county);
 }
 const corporate='已辦法院法人登記：依法清算，依民法第44條先看特別法，再依章程或有效大會決議；若均無規定，賸餘歸法人住所所在地的地方自治團體。'+(publicPurpose?'你提的是公益社團法人，賸餘不得歸自然人或營利團體，即使全體會員同意也不能平分。':'若是公益社團法人，賸餘不得歸自然人或營利團體，即使大會同意也一樣。');
 const notCorporate='未辦法院法人登記：依人民團體會務輔導辦法第27條，先查章程或會員（會員代表）大會決議。章程未規定或大會不能召開時，由理事長或章程指定人當清算人；無法選任時由主管機關選任並準用民法清算規定。由有權清算人向原立案主管機關確認合法接收人，不能只按出資比例平分，也不要直接套用法人的地方自治團體歸屬規則。';
 labels.push(['誰能接手剩下的財產？',registered?corporate:unregistered?notCorporate:corporate+' '+notCorporate]);if(!unregistered)refs.push(c(44));
 const summary=exactHalf?'只有一半出席，解散表決的出席門檻不夠。其餘要分清清債、補助財物、會費和賸餘；不能一次表決就平分。':publicPurpose?'先依法清債。公益社團法人即使理事會和大會同意，也不能把清算賸餘分給會員個人。':'先不要交付設備或發款。由清算人把真正需要歸還的錢或物、團體欠款、受補助財產和最後的賸餘分清楚。';
 return {direct:true,category:'社會團體｜解散、清債與財產處理',title:'協會解散：先清債，再分辨補助、會費和賸餘財產',summary,steps:labels,refs,questionState:{focus:'compound',domain:'association-dissolution-estate'},actions:[{label:'聯絡承辦',view:'contact',sub:''}],...(!registered&&!unregistered&&!suppliedRegistration?{choiceHeading:'有沒有辦過法院的社團法人登記？只有縣府立案不算。',choices:[
 {label:'已辦法院法人登記',question:input+'；登記狀態確認：已辦法院法人登記'},
 {label:'僅立案，未辦法人登記',question:input+'；登記狀態確認：未辦法院法人登記'}
 ]}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationDissolutionEstate=route;
})(typeof window!=='undefined'?window:globalThis);
