(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const guidance={title:'衛福部衛部救字第1040129137號及內政部內授中社字第0990704042號會議決議（官方彙編第1–2頁）',source:'https://www.penghu.gov.tw/uploaddowndoc?file=unit02%2F202504250810070.pdf&filedisplay=%E5%85%AC%E7%9B%8A%E5%8B%B8%E5%8B%9F%E6%A2%9D%E4%BE%8B%E9%87%8D%E8%A6%81%E6%B3%95%E4%BB%A4%E8%A7%A3%E9%87%8B%281091203%E7%89%88%29.pdf&flag=pdf'};
const current={title:'內政部：公益勸募許可申請、管轄與募款箱規定',source:'https://www.moi.gov.tw/News_Content.aspx?n=9&s=342876'};
function saleFundraising(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>190||/政治獻金|競選|校內教育儲蓄戶|回饋募資|食安|道路使用|場地申請/.test(t))return null;
 const sale=/義賣|義買|義演|賣商品|銷售商品|正常(?:價格|售價|對價)|照常販售/.test(t);
 const ask=/勸募|募款|募捐|許可|捐款箱|募款箱|要(?:不要|先)申請|需要.{0,3}申請|沒申請|先申請|申請嗎/.test(t);
 if(!sale||!ask)return null;
 if(/國稅局|營業稅|稅籍|開發票嗎|報稅|所得稅/.test(t)&&!/勸募|募款|捐款箱|募款箱/.test(t))return null;
 const coop=/信用合作社|信合社|合作社/.test(t);
 const box=/捐款箱|募款箱|自由捐|隨喜捐|另外收捐|另收捐|公開收捐|另向.{0,6}募款|向不特定.{0,9}捐款/.test(t)&&!/沒(?:有)?放(?:募款|捐款)箱|沒有另外募款|不(?:另|另外)?收捐款/.test(t);
 const received=/已(?:經)?(?:收到|收了|收下|募到|收款|開始|辦了)|先收了|收了(?:一些|捐款|款項)|辦完了/.test(t);
 const noPermit=/沒有(?:先)?申請|没(?:有)?申請|沒(?:有)?(?:先)?申請|未申請|未取得許可|沒(?:有)?許可|未經許可|無許可/.test(t);
 const secondhand=/二手|舊書|舊衣|環保回收|用過的物品/.test(t);
 const commercial=/商家|店家|公司|商號|店裡/.test(t)&&/正常(?:價格|售價|對價)|市價|照常販售/.test(t)&&/發票/.test(t)&&/自行|自己|自捐|提撥|撥出/.test(t)&&/捐|公益/.test(t);
 const group=/公益性社團法人|依法成立.{0,6}慈善(?:團體)?法人|慈善團體法人/.test(t);
 const fullPublic=group&&/公開|街頭|對外|一般民眾/.test(t)&&/全(?:數|部)?捐|全數.{0,8}(?:交|給|捐)|全部.{0,8}(?:交|給|捐)|所得全/.test(t)&&/弱勢|公益|慈善|社福/.test(t)&&!secondhand;
 const p=n=>law('公益勸募條例','D0050138',n), permit=n=>law('公益勸募許可辦法','D0050147',n);
 const roles=['先看是誰發起','公益勸募條例第5條列公立學校、行政法人、公益性社團法人及財團法人。一般立案不等於已符合勸募資格；'+(coop?'信用合作社或其他合作社不能只憑名稱或法人身分就認定為公益性社團法人。':'先核對法人登記與團體資格。')+'若不符合資格，不可用自己的名義公開發起。'];
 const place=['活動開始前怎麼申請','適用勸募許可時，依公益勸募許可辦法第2條，通常須於開始21日前備齊文件；緊急救災例外不等於一般活動可在舉辦後補申請。實體只在屏東，向屏東縣政府申請；實體跨直轄市、縣市，向中央衛生福利部申請。僅以網路、媒體或文宣寄送宣傳的，以勸募團體所在地為活動所在地，向當地縣市主管機關申請。取得許可後才依核准的方式、期間與區域進行。'];
 const stop=['如果已無許可收款，停止勸募並分開處理','先停止繼續募款，保留活動宣傳、銷售金流與捐贈紀錄，勿先動用款項，向勸募主管機關說明已收款情形。依公益勸募條例第22條，若屬未經許可等法定情形，已募得的財物應返還捐贈人；難以返還的，先報主管機關認定，再依其指示繳交。不要自行把捐款箱的款項當成售貨收入，日後許可不會自動處理先前款項。'];
 const explain=['義賣、販售和另外收捐款要分開','衛福部函釋所述的慈善團體法人公開義賣，收入扣必要費用後全數捐助弱勢團體供公益使用，應申請勸募許可。商家按正常對價販售開發票，另以自有營收提撥公益、未另向客人募款的，按該函釋屬商業銷售，不因此需要勸募許可。即使商品確有銷售，在現場另設捐款箱向不特定人募集，該部分仍須單獨判斷。難以按時價折算的二手環保物品，在特定函釋事實下另有處理，不能只看名稱。稅籍、發票與免稅是另一問題。'];
 const commercialStep=['這是商家自行提撥，不是向客人募款','按正常價格開發票出售商品，並由商家以自己的營收另行捐出一部分，若客人沒有另外捐款、未公開向外收捐，依內政部會議決議屬商業銷售，不因商家自行提撥就需要公益勸募許可。分開保存銷售與商家實際捐贈紀錄；稅務仍依國稅機關規定。'];
 const boxStep=['公開捐款箱不等於商品銷售','公開放置捐款箱向不特定人募集公益捐款，該部分是勸募；不能用義賣或一般銷售名目免掉許可。請把捐款款項與商品對價分開記錄。'];
 if(box&&received&&noPermit)return {direct:true,category:'公益勸募',questionState:{focus:'compound'},title:'義賣另外放公開捐款箱，無許可已收款：先停募',summary:'商品銷售和捐款箱分開。既已從公開捐款箱收款、未取得所需許可，請先停募、留存紀錄，聯絡活動所在地的勸募主管機關確認返還或繳交程序。',steps:[boxStep,stop,roles],refs:[p(5),p(7),p(22),current]};
 if(commercial&&!box)return {direct:true,category:'公益勸募與義賣',questionState:{focus:'compound'},title:'正常銷售後商家自行捐款，與公開勸募不同',summary:'照正常價格販售並開發票，款項由商家自行提撥、沒有另外向客人募款，就這個做法而言，不必申請公益勸募許可。',steps:[commercialStep,boxStep],refs:[p(3),p(7),guidance]};
 if(fullPublic&&!box)return {direct:true,category:'公益勸募',questionState:{focus:'compound'},title:'慈善團體法人公開義賣，全捐弱勢：先申請勸募許可',summary:'依您描述的公開義賣、扣除必要費用後全數捐助弱勢的做法，先向勸募主管機關申請許可，不是只辦稅籍。若活動只在屏東，向屏東縣政府申請。',steps:[explain,roles,place,...(received&&noPermit?[stop]:[])],refs:[p(3),p(5),p(7),permit(2),permit(3),guidance,current,...(received&&noPermit?[p(22)]:[])]};
 if(box||coop)return {direct:true,category:'公益勸募',questionState:{focus:'compound'},title:box?'義賣另收公益捐款：不是只看商品有無銷售':'合作社義賣與公開勸募：先確認主體、做法及有無已收款',summary:box?'公開另收的捐款須另按勸募規則；開始前先核資格與許可，若已無許可收款則不能只補送申請。':'先確認是正常銷售後由合作社自己捐，還是向民眾公開收捐款。不要只憑合作社有法人身分就發起勸募。',steps:[...(box?[boxStep]:[explain]),roles,place,...(noPermit||received?[stop]:[])],refs:[p(3),p(5),p(7),p(22),permit(2),permit(3),guidance,current]};
 return {direct:true,category:'公益勸募與義賣',questionState:{focus:'compound'},title:'義賣要不要申請勸募許可？先分清做法',summary:'不能單靠「義賣」這個名稱判斷。請先說明主辦團體資格、是否將所得全捐、商品是否按正常對價銷售，以及有沒有另外向民眾收捐款。',steps:[explain,roles],choiceHeading:'較接近您的做法是？',choices:[{label:'公益性社團法人公開義賣，全捐弱勢',question:'我們是已登記的公益性社團法人，要公開辦義賣、扣必要費用後全捐弱勢，還沒開始要先申請嗎？'},{label:'商家正常銷售，再自行捐款',question:'商家照正常價格賣商品開發票，再自己捐營收的5%，客人另外不捐款，也要先申請嗎？'},{label:'活動另外放公開捐款箱',question:'義賣現場另放公開捐款箱，還沒開始要申請勸募許可嗎？'}],refs:[p(3),p(5),p(7),guidance]};
}
if(typeof module!=='undefined'&&module.exports){module.exports={saleFundraising};return;}
root.verifiedCharitySaleFundraising=saleFundraising;
})(typeof window!=='undefined'?window:globalThis);
