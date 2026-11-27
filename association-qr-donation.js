(function(root){
'use strict';
const lawful={title:'衛生福利部：公益勸募條例第5、6、7、16條',source:'https://dep.mohw.gov.tw/DOSAASW/fp-590-5066-103.html'};
const finance={title:'社會團體財務處理辦法第17條：收入正式收據',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0050097&flno=17'};
const officialQR={title:'衛福部：勸募活動 QR Code 用來查活動資訊',source:'https://www.mohw.gov.tw/cp-16-46266-1.html'};
const civicNotice={title:'內政部：公開、網路公益勸募的許可與收據',source:'https://www.moi.gov.tw/News_Content.aspx?n=9&s=342876'};
const publicInfo=['有向不特定民眾主動募集：先看資格與許可','用貼文、網站或公開場合號召民眾為公益捐款，不能因用 QR 付款就當成一般自願捐款。須先具公益勸募條例第5條資格並依第7條取得許可後再募集；尚未登記為公益性社團法人、只立案的一般協會不是該法列舉的勸募團體。已許可活動實收財物後依第16條開收據，載勸募許可文號、捐贈人、金額或物品及捐贈日期。活動 QR 不是許可文件本身。'];
const voluntary=['沒有對外號召，民眾主動捐贈：仍要正式收據','一般協會財務收入依社會團體財務處理辦法第17條開正式收據、留存根；有付款成功的電子紀錄不等於團體已開收據。符合公益勸募條例第6條的勸募團體接受主動公益捐贈，另應依該條開收據、按指定用途使用、公開徵信及辦理備查。不要把未取得的勸募許可文號寫到一般捐贈收據。'];
const info=['先確認 QR 是查詢還是付款','衛福部公益勸募活動 QR 可用於查詢活動；看到 QR 或掃到活動頁，不表示已付款。請核對活動許可文號、有效期間、募款用途及專戶；若另用支付碼完成捐款，收據仍按實際收款的性質辦理。不要在聊天框貼付款碼、完整帳號或個資。'];
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>220||!/協會|社會團體|勸募團體/.test(t)||!/QR(?:CODE)?|二維碼|掃碼/i.test(t)||!/捐款|捐贈|勸募|募款/.test(t)||!/收據|許可|同一|一樣|算不算|號召|不特定|查詢活動/.test(t)||/合作社|農會|漁會|工會|公會|發票|義賣|賣東西|政黨|選舉獻金|宮廟|寺廟|宗教活動|退款|境外/.test(t))return null;
 const lookup=/只查詢活動不付款|只用來查詢活動|不會付款的查詢碼/.test(t)&&!/也能付款|也要付款/.test(t);
 const active=/已對外主動募集|已公開向不特定民眾號召|正在對不特定民眾公開號召/.test(t)&&!/沒有公開|不確定/.test(t);
 const passive=/沒有對外主動號召|沒有公開招募|只接受民眾自發公益捐贈|完全沒有對外勸募/.test(t)&&!/也有發文號召|之前已公開/.test(t);
 const defined=Number(lookup)+Number(active)+Number(passive)===1;
 const known=defined?(lookup?'info':active?'public':'passive'):'';
 let steps=known==='info'?[info]:known==='public'?[publicInfo,info]:known==='passive'?[voluntary,info]:[voluntary,publicInfo,info];
 return {direct:true,category:'捐款與公益勸募｜QR碼及收據',title:'QR碼只是工具，先分辨捐款、對外勸募與活動查詢',
  summary:known==='info'?'活動查詢碼本身不是付款，不會只因掃碼而開捐款收據。':known==='public'?'主動對不特定民眾進行公益募款，先查勸募主體資格與許可；實收須開勸募收據。':known==='passive'?'沒有對外號召的主動捐贈，與發起公益勸募不同；社會團體收到捐款仍要開正式收據。':'若協會實際收到捐款，不能只給付款成功畫面；要開哪種收據、要不要先取得勸募許可，要看有沒有向不特定民眾主動募集，不是看是否用 QR。',
  steps,refs:[finance,lawful,officialQR,civicNotice],questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}],...(!known?{choiceHeading:'這個 QR 碼是怎麼使用的？',choices:[{label:'有公開號召民眾捐款',question:'協會已公開向不特定民眾號召，QR碼收捐款需要許可和開收據嗎？'},{label:'沒有號召，只收主動捐款',question:'協會沒有對外主動號召，只接受民眾自發公益捐贈，QR付款要開收據嗎？'},{label:'只是查詢活動，不是付款',question:'協會的公益勸募QR碼只查詢活動不付款，需要開捐款收據嗎？'}]}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationQrDonation=route;
})(typeof window!=='undefined'?window:globalThis);
