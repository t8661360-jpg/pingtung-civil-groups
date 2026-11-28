(function(root){
'use strict';
const law=(title,p)=>({title,source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+p});
const charity=law('公益勸募條例第2、3、5–7、13、16、22條','D0050138');
const permit=law('公益勸募許可辦法','D0050147');
const social=law('社會團體財務處理辦法第5、16、17、20條','D0050097');
const coopBooks=law('合作社財務報表及經費處理準則','D0050114');
const tax={title:'財政部：綜合所得稅列舉扣除捐贈的條件',source:'https://www.etax.nat.gov.tw/etwmain/tax-info/understanding/tax-q-and-a/national/individual-income-tax/exemption-scope/deduction/2PENnej'};
const sponsorRef=law('營利事業所得稅查核準則：廣告費及捐贈憑證','G0340051');
const findings={title:'公益勸募重要法令解釋：企業贊助與對價',source:'https://orgws.kcg.gov.tw/001/KcgOrgUploadFiles/273/relfile/67252/113763/ea055770-8d6f-47dd-9b8c-43969560ef3e.pdf'};
const norm=q=>String(q||'').normalize('NFKC').replace(/\s+/g,'');
const opt={fee:['一定要付的報名費、材料費或商品價款','確認活動款是固定費用或售價'],public:['主動邀請民眾捐款、放捐款箱或加購捐','確認活動有公開募集捐款'],gift:['對方沒被邀請，自己拿錢或物品來捐','確認是對方主動送來捐贈'],ad:['事先約定給廣告或其他回饋','確認有約定廣告或其他回饋']};
const campus=/親子課|教材費|材料費|學費|學習班|報名費|課程費|上課|報名|學員|課程|辦活動|開活動|收活動|活動的錢|市集|成果展|義賣|商品|結帳|收銀/;
const excluded=/政治獻金|選舉募款|政黨|競選|宗教活動募款|寺廟|宮廟|公會|農會|工會|信用合作社|登記會址|貸款|支付罰鍰/;
function parse(q,prev){
 const raw=norm(q);
 if(!raw||raw.length>610||/^新題/.test(raw)||excluded.test(raw))return null;
 const k=Object.keys(opt).find(x=>opt[x][1]===raw);
 if(k)return {...prev,fee:k==='fee',public:k==='public',gift:k==='gift',ad:k==='ad',picked:true};
 const correction=!!prev&&/^(?:更正|補充|其實|剛才說錯)/.test(raw)&&/協會|合作社|點心|報名|廣告|捐|活動/.test(raw);
 const t=raw.replace(/(?:並非|不是|不談|不問)(?:一般|普通)?(?:協會|合作社|人民團體|社會團體)/g,'');
 const a=/協會|人民團體|社會團體/.test(t), c=/合作社/.test(t);
 if(a&&c)return null;
 const any=/捐|贊助|公益勸募|廣告|收據|收費/.test(t);
 const keys=campus.test(t)||/投錢|桌上放箱|活動背板|活動海報/.test(t);
 if(!correction&&!(any&&keys))return null;
 const fee=/報名費|材料費|教材費|學費|課程費|要付.{0,9}才|一定要付|不付.{0,10}不能上課|報名.{0,7}(?:交|收|繳|付)|固定.{0,6}(?:收費|交|付)|定價|標價|商品.{0,7}(?:收費|價款)|賣商品/.test(t)&&!/不收(?:取)?報名費|沒有報名費|不用付材料費/.test(t);
 const noPublic=/不公開.{0,5}(?:募|捐)|不對外.{0,6}(?:勸募|募款|邀捐)|沒有(?:放)?(?:捐款)?箱子|不勸募|沒有向.{0,5}招募|沒有箱子/.test(t);
 const publicFund=!noPublic&&/捐款箱|捐贈箱|投箱|投錢|請.{0,7}(?:捐助|捐款|大家捐)|擺.{0,3}箱|放箱|加捐|勾選.{0,8}捐|結帳時.{0,12}(?:問|自願)|主動邀|收銀台.{0,12}捐|自願給的錢/.test(t);
 const ad=!/不要求.{0,7}(?:刊登|廣告|宣傳)|也沒(?:有)?說要宣傳|沒有廣告|不做廣告/.test(t)&&/商標|商號|海報.{0,9}(?:露出|標榜|商標|宣傳)|廣告|背板.{0,8}(?:放|商號)|露出|品牌|贊助.{0,8}(?:回饋|曝光)/.test(t);
 const gift=/主動(?:捐|拿來|送)|自發(?:送|捐)|自動送來|私下.{0,6}(?:送|捐)|自己.{0,5}帶點心/.test(t)&&!/和主動.{0,10}一樣嗎/.test(t);
 const taxAsk=/抵稅|報稅|扣除|免稅|所得稅/.test(t);
 const sale=/義賣|商品|蔬菜|蔬果|市集商品|買東西/.test(t);
 const selfDonate=/由合作社自己捐|合作社本身捐|自己捐出去|營收.{0,12}自己捐|收入.{0,9}由合作社/.test(t);
 const already=/已有.{0,8}(?:入帳|收款)|已(?:經)?收過|已(?:經)?入帳|已收.{0,5}捐款|已(?:經)?代收/.test(t);
 const mismatch=/別(?:的)?(?:場地|日期|週)|許可.{0,14}(?:別|過期|原本.{0,5}場地)|期間不一樣|許可內容不符/.test(t);
 const other=/代收|代領|給.{0,8}公益團體|給外面的|聯辦|共同主辦|合辦|合作.*公益團體/.test(t);
 const hasCorp=!/沒有(?:辦)?(?:法院)?法人登記|沒辦法人登記/.test(t)&&/社團法人|完成法院法人登記/.test(t);
 const receipts=/捐款收據|捐贈證明|捐款證明|混開|開收據|發票|收據/.test(t);
 const org=c?'c':a?'a':correction?prev.org:null;
 if(!correction&&!((fee||publicFund||gift||ad||sale)&&any||/收錢|收費|收活動.{0,4}錢/.test(t)&&receipts))return null;
 if(!correction&&!org&&!/費用|固定|一定要|學員|親子課|收錢|收活動|報名|合作社/.test(t))return null;
 return {org,fee,public:publicFund,ad,gift,tax:taxAsk,sale,selfDonate,already,mismatch,other,hasCorp,receipts,food:/便當|餐盒|餐點/.test(t),community:/社區發展協會|社區協會/.test(t)};
}
function route(q,prior){
 const x=parse(q,prior);if(!x)return null;
 const output=(title,summary,steps,refs,ask)=>({direct:true,category:'活動收費、贊助與公益勸募',title,summary,steps,refs,eventFinanceContext:x,questionState:{focus:ask?'clarify':'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}],...(ask?{choiceHeading:'最接近哪一種收款？',choices:Object.values(opt).map(([label,question])=>({label,question}))}:{})});
 if(!x.fee&&!x.public&&!x.ad&&!x.gift&&!x.sale)return output('先分辨活動費用、捐款或有回饋的贊助','不是所有進帳都能開捐款收據：一定要付才能參加，通常是費用；捐款則須看是否自願、由誰邀請、受款團體及實際用途。',[],[charity],true);
 const refs=[x.org==='c'?coopBooks:social],steps=[];
 if(x.fee||x.sale){
  steps.push([x.sale?'商品價款與額外捐款分兩筆':'固定報名費、教材費或材料費，不是捐款',
   (x.community?'社區發展協會辦課程也應依款項實質分開。':'')+
   (x.sale?'固定價格換取商品的部分，依實際交易記銷售及開立應有憑證，不因名稱叫義賣就改開捐款收據；若售價和商品價值明顯不相當、主要是邀請捐助，仍核對實際活動安排。':'若不付就不能報名、上課或取得教材，這筆應照實記活動／課程或材料費，不開公益捐款收據。依實際收款人及稅籍開該有的收據、發票或其他憑證，種類可向國稅局確認。')]);
 }
 if(x.selfDonate)steps.push(['合作社拿自己的收入捐贈，捐贈人不是購買者','銷售收入依實際全額記錄；合作社將自己的一部分收入捐出，依章程、有效授權及實際付款另記，由受款團體對實際捐贈人開適當證明。客人另加捐款時再按公益募集處理，不把兩筆混為一筆。']);
 if(x.ad){
  steps.push(['有約定廣告曝光，與單純致謝不同',(x.food?'供應商贊助的便當或餐點要按實際約定判斷：':'先看實際約定：')+'如果贊助商交錢或物資是為換商標露出、攤位、廣告或其他商業回饋，應按有對價的交易／贊助和實際憑證處理，不當作無償捐贈開捐款收據。若只是事後致謝、未承諾交換利益，不能單憑印名字就認定有對價；保存約定、價值及交付證明，具體稅務另向國稅局確認。']);
  refs.push(findings,sponsorRef);
 }
 if(x.gift)steps.push(['真的自發捐送，另存受贈紀錄','若沒被團體或代收方主動邀捐，也不要求廣告或回饋，是另一筆無償贈與。按受贈團體的資格、章程、用途及適用財務規定，保存來由、品名、數量、日期和真實憑證；不和報名費或銷售混開。符合公益勸募條例第5條的團體，另核第6條的收據、徵信、指定用途及年度備查。']);
 if(x.public){
  steps.push(['向不特定人邀捐，即使可不捐，也要查勸募資格及這一場的許可',
   '若為公益目的主動放捐款箱、在報名頁或結帳頁邀請民眾捐款，不能當作對方自發送來。依公益勸募條例第5、7條先確認適格勸募主體、目的與許可，單一縣市向活動所在地主管機關，跨縣市向中央。'+
   (x.org==='c'?'普通合作社不是第5條列舉的勸募團體；與公益團體合作，不表示自己可直接發起或代收。':x.hasCorp?'你說已辦社團法人登記，仍要確認符合法定公益性及這一場的許可，不是登記後就能直接放箱。':'若是一般協會，僅立案不等同公益性社團法人；即使已辦法人登記，仍要確認符合公益性及這一場的許可。')]);
  steps.push(['收款與捐款收據由實際合法勸募主體處理',
   '確認許可文號、時間、地點、活動方式、帳戶及誰有權收款。合辦、擺箱或收銀台協助不會自動授權代收。較穩妥的是讓想捐者直接透過有權團體的合規管道捐，捐款收據由合法勸募團體依第16條載明實際捐贈人、款項或品項、日期及許可文號；不混開或用合作社名義開一張總捐款收據給大家。']);
  if(x.already||x.mismatch)steps.push(['許可人、場所或期間不符，先停新增收款，已收分開保全',
   '不要沿用別場或過期許可、先轉給其他人或動用。保留各筆來源、金額和交易／捐款證明，儘速持資料請原許可或所在地主管機關確認。若屬第22條列舉的非適格發起、未許可或逾期等，原則應返還捐贈人；難以返還要報請主管機關認定後依規處理，不自行認定全數應返還或先花掉。']);
  refs.push(permit,charity);
 } else if(x.gift)refs.push(charity);
 if(x.tax)steps.push(['能不能列舉扣除，不是看到「收據」就算','個人所得稅依所得稅法第17條確認是真正的捐贈、受贈方符合資格並取得正確憑證；固定費用不是捐贈，不能把它拿去列報捐贈扣除。實物估價及企業贊助另有適用規則，勿只憑收據保證可扣。']);
 if(x.tax)refs.push(tax);
 if(steps.length>1)steps.push(['帳目按性質分開，先對上實際收款或受贈人','用收費／銷售、無償捐贈、廣告或有對價贊助、合法代收或勸募等實際情況分別記錄，保留各自的收款、發票或收據、授權和證據；不要只在總帳把不同來源寫成同一筆捐款。']);
 const title=x.public?'活動收入與公開勸募要分開，不能混開捐款收據':x.fee||x.sale?'固定收費或售價不能改開捐款收據':x.ad?'先查贊助有沒有約定交換利益':'無附條件的主動捐贈，另列受贈紀錄';
 const summary=x.public?'一定要付的費用或商品價款不是捐款；公開邀請加捐、貼文或投箱另核資格和許可。贊助要看有沒有約定回饋。':x.fee||x.sale?'付費才可參加或購買，照實開費用或交易憑證。如果有人另行無償捐送，分開記錄。':x.ad?'看是否事先約定給廣告或其他利益，再決定如何開憑證，不能先都寫捐贈。':'用該團體的實際收款或受贈資料辦理，不與費用或其他收入混開。';
 return output(title+(x.tax?'；扣除資格由國稅局核對':''),summary,steps,[...new Map(refs.map(r=>[r.title,r])).values()]);
}
if(typeof module==='object'&&module.exports)module.exports={route};else root.verifiedEventFeesAndFundraising=route;
})(typeof window==='object'?window:globalThis);
