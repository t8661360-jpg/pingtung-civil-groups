(function(root){
'use strict';
const law=(title,code)=>({title,source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+code});
const cBooks=law('合作社財務報表及經費處理準則第2、5、7–9條','D0050114');
const cAct=law('合作社法第2條之1、第36、37條','D0050112');
const aBooks=law('社會團體財務處理辦法第3、5、7、11、12、16、20條','D0050097');
const aAct=law('人民團體法第34條','D0050091');
const county={title:'屏東縣政府對民間團體補助經費作業要點',source:'https://portal.ptc.edu.tw/bulletin/attachment.php?a_sn=33872&b_sn=B114003910'};
const ministry={title:'內政部合作事業補助作業要點（最新修正公告）',source:'https://gazette.nat.gov.tw/egFront/eguploadpubWrapper?file=%2FEG_FileManager%2Feguploadpub%2Feg032053%2Fch02%2Ftype2%2Fgov10%2Fnum2%2FEg.htm&metaid=164390'};
const central={title:'主計總處：中央政府補（捐）助預算執行應注意事項第4點',source:'https://law.dgbas.gov.tw/LawContent.aspx?id=FL033828'};
const norm=s=>String(s??'').normalize('NFKC').replace(/\s/g,'');
const stop=/信合社|信用合作社|農會|漁會|工會|公會|財團法人|所得稅|扣繳|解散|清算|破產|補助個人|福利補助低收入|審核個資|社團法人設立/;
const aid=/補助|補捐助|核銷|核定設備款|核定款/;
const books=/入帳|列帳|記帳|應收|應付|認列|會計報告|決算|財報|記成|清帳|怎麼記|怎麼列|折舊|明年.{0,6}(?:收|支出)|收支如何/;
const flag={
 pending:/未(?:經|收到|有|獲|正式|書面)?核(?:定|准)|沒有核(?:定函?|准)|沒核(?:定|准)|還沒收到核定|沒有正式核定|只是申請|只說有機會|通過才知道|只(?:有)?口頭|才知道結果|尚未核定|還沒有核定/,
 fixed:/無條件.{0,5}核(?:定|准)|無條件.{0,5}核定|(?:確認|已確定)可收|權利.{0,5}(?:已)?確定|核定.{0,8}無條件|已經通過核銷|核銷已(?:經)?通過/,
 contingent:/還(?:要|等|需|得).{0,8}(?:核銷|結案|審定|驗收)|核銷.{0,8}才.{0,5}(?:撥|算)|結案.{0,7}才算|仍待(?:核銷|審查)|附有條件|核銷通過才/,
 notPaid:/沒(?:有)?撥款|還沒撥|還未撥|未入帳|尚無匯款|未匯款|尚未收到|未撥/,
 approved:/已(?:經|書面)?核(?:定|准)|有核定|收到核定|核定金額|書面.{0,6}核定|核定.{0,9}還.{0,5}撥/,
 paid:/已(?:經)?撥(?:款|下)|已收到(?:補助款|款項)|補助款.{0,10}(?:進帳|到帳|到會帳|入帳)|款已進|已匯入/
};
function parse(q,prior){
 const t=norm(q);if(!t||t.length>470||/^新題/.test(t))return null;
 const red=t.replace(/(?:不是|而非|並非)(?:一般)?(?:合作社|協會|人民團體|社會團體)/g,'');
 if(stop.test(red))return null;
 const follow=prior&&/^(?:更正(?:一下)?|補充(?:一下)?|改成|確認|選擇|其實)/.test(red)&&/合作社|協會|補助|已核|未核|撥款|只有申請|應收|核銷/.test(red);
 const c=follow?prior:{};
 const coop=/合作社/.test(red), assoc=/協會|社會團體|人民團體/.test(red);
 if(coop&&assoc)return null;
 const org=coop?'coop':assoc?'assoc':c.org||null;
 const asset=/設備|財產|機器|冷氣|冰箱|冷凍櫃|施工|折舊|器材|報廢/.test(red);
 const dispose=/報廢|出售|丟掉|換新|送人|捐掉|轉贈|送別的社區|退補助|繳回設備|壞了|使用年限|維修報價/.test(red);
 const base=aid.test(red);
 const review=/決算|會計報告|財報|年底|年終|交誰|監事.{0,3}審|會員大會.{0,6}看/.test(red);
 const f=Object.fromEntries(Object.entries(flag).map(([k,re])=>[k,re.test(red)]));
 const statusCount=['pending','fixed','contingent','notPaid','approved','paid'].filter(k=>f[k]).length;
 const eligible=/接受|可不可以.{0,8}補助|能不能.{0,8}補助|補助.{0,5}資格|申請對象/.test(red);
 const retain=(x,k)=>!!(x||c[k]);
 const generic=!org&&base&&books.test(red)&&red.length<27;
 if(!follow){
  if(!base||!(org||generic))return null;
  if(org==='coop'&&!(books.test(red)||eligible||dispose||statusCount&&asset))return null;
  if(org==='assoc'&&!(books.test(red)&&(statusCount||review&&/補助款|核定/.test(red)))&&!(dispose&&asset&&/驗收|採購|應收|入帳|會計/.test(red)))return null;
 }
 const phase=red.startsWith('確認補助還在申請')?'pending':red.startsWith('確認已核定仍有條件')?'contingent':red.startsWith('確認已確定應收')?'fixed':red.startsWith('確認補助已撥款')?'paid':null;
 const correctionPending=!!follow&&f.pending&&!f.fixed;
 let state={};
 if(phase)state={[phase]:true};
 else if(correctionPending)state={pending:true};
 else if(statusCount)state=f;
 else state=c.state||{};
 const clearPolicy=org&&c.org&&org!==c.org;
 return {org,state,asset:retain(asset,'asset'),dispose:retain(dispose,'dispose'),review:retain(review,'review'),money:retain(books.test(red),'money'),eligible:retain(eligible,'eligible'),
  donation:retain(/捐到|捐款|已捐|捐贈|商家.{0,7}捐/.test(red),'donation'),restrictedDonation:retain(/定.{0,6}送餐|限定|指定用途|限定用途/.test(red)&&/捐|商家/.test(red),'restrictedDonation'),
  rent:retain(/租金|場租|房租/.test(red),'rent'),advance:retain(/暫墊|理事先付|先墊付|墊款/.test(red),'advance'),central:clearPolicy?/中央|內政部/.test(red):retain(/中央|內政部/.test(red),'central'),county:clearPolicy?/縣府|屏東/.test(red):retain(/縣府|屏東/.test(red),'county'),
  carried:retain(/帶到|延到|下個年度|下個計畫|餘款|餘額|結餘|先抵/.test(red),'carried'),
  funding:retain(/自籌|憑證|工資|薪資|重報|單據|分攤|兩邊|補運費|施工費/.test(red),'funding'),
  later:retain(/明年|再收到|到帳後|進款|清帳|已收到再/.test(red),'later')};
}
const pending=['還在申請或只口頭說可能有，不先列為應收','若沒有具體核定、確定的權利或可核對金額，先列申請／追蹤清單，不把可能收到的款當補助收入、應收款或銀行存款。預算可註明預估及未核定，不能先用它抵掉已發生或明年度的支出。'];
const confirmed=['已確定有權收、金額可確認，和到帳是兩個步驟','若核定函與適用規則顯示權利已確定、必要條件辦妥且金額可確認，依適用會計規則認列應收；尚未收到不記作銀行款。補助對應的收入或其他會計科目、認列期間，要依補助性質、適用會計政策及是否涉及設備或返還，不一概把所有核定額當本期收入。'];
const conditional=['有核定還不等於已能請款','核銷審定、結案、驗收或指定條件如果仍會改變請領權或確定金額，先列待核銷與證據，不把不確定的全額列確定應收；若只剩行政撥款而實質條件已完成，按已確定應收的方式核對。不要只看核定函的標題或撥款日。'];
const receipt=['收到時對銀行與原應收，不能重算收入','看銀行明細及撥款通知；若對應款已列應收，收到時沖減原應收、對帳，不再次把同一款列本期收入。先收到但仍有附條件、返還或待核銷性質的款，按實際機關條款及會計政策列，不因收到就全部當無限制收入。'];
const disposal=['設備故障或想換新，不等於可直接報廢、捐掉或出售','留原核定函、財產卡、使用／保留年限、維修報價、照片及財物權屬資料；先問原補助機關，核對是否需事前書面同意、通報、換購或繳回，及團體內部處分程序。不要先送別的社區，不假定故障或折舊歸零就可移轉。合規處分時分開保存報廢核准、除帳、實際售款或退回補助，設備舊帳和新設備不得合併成同一筆。'];
function route(q,prior){
 const x=parse(q,prior);if(!x)return null;
 const c=x.org==='coop',s=x.state;
 const make=(title,summary,steps,refs)=>({direct:true,category:c?'合作社財務｜補助與資產':'協會財務｜補助入帳與決算',title,summary,steps,refs,grantAccrualContext:x,questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]});
 if(!x.org){
  const a=make('補助入帳先確認團體類型','申請、核定、符合條件與實際撥款不是同一件事；先別把未確定的金額放進收入。實際收支要據實登載；一般協會不得匿報或虛報。',[],[aBooks,cBooks]);
  return {...a,choiceHeading:'您是哪一種團體？',choices:[{label:'一般協會',question:'確認一般協會補助入帳'},{label:'一般合作社',question:'確認一般合作社補助入帳'}]};
 }
 const refs=[c?cBooks:aBooks,c?cAct:aAct,...(x.central?[ministry,central]:[]),...(x.county||x.eligible?[county]:[])];
 const steps=[];
 if(c&&x.eligible)steps.push(['合作社可以申請符合資格的計畫，不是所有補助都能領','先確認已完成適用的成立登記，核對計畫列的申請對象、地區、用途、期間及同案補助限制。縣府當年度公告、內政部合作事業專案與原核定函分開查；不得用一般協會或他處已准案例推定你的合作社一定符合。']);
 if(x.money||s.pending||s.fixed||s.contingent||s.notPaid||s.approved||s.paid){
  steps.push(['今年的帳先看何時權利、義務確定',c?'合作社財務報表及經費處理準則第7–9條採權責發生制；收益確定應收、費用確定應付時記錄，平時若用現金收付，年終按應歸屬年度調整。保留核定與憑證，按適用規則和會計政策辦理。':'依社會團體財務處理辦法第3、5條，協會採權責發生制；平時若採現金收付制，決算按權責發生制調整。以憑證和實際權利／義務為準，不只看銀行入款日期。']);
  if(s.pending||!Object.values(s).some(Boolean))steps.push(pending);
  if(s.fixed||s.approved&&!s.pending||!Object.values(s).some(Boolean))steps.push(confirmed);
  if(s.contingent||s.approved&&!s.fixed&&!s.pending||!Object.values(s).some(Boolean))steps.push(conditional);
  if(x.later||s.paid||s.notPaid||s.fixed||s.contingent)steps.push(receipt);
 }
 if(x.asset)steps.push(['設備及折舊和補助來源分開保存','設備若經驗收、屬團體所有且符合資產認列條件，按實際取得成本作財產登錄；若不是自有先區分借用與保管。'+(c?'合作社經費準則第2條的財產目錄應按實際保留原值、折舊額、累計折舊及帳面價值。':'協會依適用會計格式列入資產負債表及財產目錄（會計報告），留存成本、驗收與財物管理紀錄。')+' 資金來源另列補助、自籌、運費／施工等依據，不因補助未撥就少列實際資產或應付款。']);
 if(x.dispose)steps.push(disposal);
 if(x.rent)steps.push(['自籌先付租金，按實際使用期間核對','租金先看租約、實際使用期間及支付憑證。已付的自籌租金不是補助已入帳；若付的是未來使用的期間，先按適用會計政策核對預付款，不因先付就全列本年度支出。補助款、租金和民間捐款不能直接互相沖抵。']);
 if(x.donation)steps.push(['商家捐款是另一筆，不跟政府補助相抵','按實際銀行入款、捐贈約定、受領證明及適用規則另行入帳；'+(x.restrictedDonation?'指定送餐或其他特定用途的捐款，另保留用途和服務／支出明細，不能轉成一般自籌或別的活動。':'如有指定用途就按約定記錄和使用。')+' 如屬依法公開勸募，另依原核准計畫，不在此假定每筆捐款都屬勸募。']);
 if(x.advance)steps.push(['理事代墊不是捐款或補助','憑原發票、驗收、個人付款和核准紀錄，確認團體依法應給付的代墊款，另列應付款；若無償提供或借用，按實際約定判斷，不把本人支付當團體已結清。']);
 if(x.funding||x.central&&x.county)steps.push(['每筆券、薪資或購置費依實際金額記一次','同案按核定分項，留原始單據、付款、薪資或共同分攤表；各資金明細對回同一原始支出。合計不得超過實支，也不得把同一張憑證在不同機關照全額再報。中央或縣府有交代時，另依適用規定揭露其他實際補助與自籌。']);
 if(x.carried)steps.push(['補助餘款不因跨年就變成可自由花的自籌','要改用途、延到下一年或下個計畫，先看核定有無保留／展延及原機關同意，未花完的補助依適用規定繳回；若適用屏東通案要點第8點之一依其規定。決算的會計結餘不等於補助餘款；團體真正自籌餘額也應按預決算處理，限定用途的捐款不能自動改用。']);
 if(x.review)steps.push(c?['合作社決算先監事會審核，再提社員大會','合作社法第36條：理事會於年度終了製作財務書類，通常至少於社員大會開會10日前送監事會審核，再提社員大會承認，承認後一個月內報主管機關備查。臨時社員大會例外另看，單案核銷不取代年度財報。']:['協會決算先監事會、後會員（代表）大會','人民團體法第34條與社會團體財務處理辦法第11條，理事會編年度會計報告，監事會先審決算，再提會員／會員代表大會通過，報主管機關。已完成單案核銷不代表能從總帳、決算或會員大會省略相關款項。若確實不能如期開大會，依第11條的先行程序後仍要大會追認。']);
 const summary=s.pending&&!s.fixed&&!s.contingent?'你說還沒有核定、或只有口頭說明，不能先把未確定的補助記成收入、應收或現金。':s.contingent&&!s.fixed?'已核定但還須完成核銷或其他條件，先核對是否已確定能請款。設備、實支和款項是否到帳要分開記。':x.dispose?'先別把用補助購買的設備送人或除帳。先核對所有權、原補助機關規則與財產資料，再拆開補助和自籌。':x.eligible?'合作社可以申請符合對象與用途條件的補助計畫，不是登記後就當然可以領。':'申請、核定、應收、到帳及實際支出分開。請按各款的條件和證據逐筆處理，不把補助、自籌或指定捐款混成一筆。';
 const a=make(c?'合作社補助：資格、應收與財產分開':'協會補助：按核定條件逐筆入帳',summary,steps,refs);
 if(!Object.values(s).some(Boolean)&&x.money&&!x.dispose&&!x.eligible)return {...a,choiceHeading:'這筆補助目前到哪一步？',choices:[{label:'還在申請／沒有核定',question:'確認補助還在申請'},{label:'已核定仍待核銷或審定',question:'確認已核定仍有條件'},{label:'已確定應收，還沒撥款',question:'確認已確定應收'},{label:'已收到補助款',question:'確認補助已撥款'}]};
 return a;
}
if(typeof module==='object'&&module.exports)module.exports={route};
else root.verifiedGrantAccrualAssets=route;
})(typeof window==='object'?window:globalThis);
