const a=require('node:assert/strict');
const {route}=require('./grant-accrual-assets');
const advanced=["一般合作社送了補助申請，承辦只說有機會，年底要先當收入還是應收，可以把明年支出先抵掉嗎？","合作社用自籌先買設備驗收，縣府核定金額固定但還要核銷審定，年底有機器、尚無匯款，應收怎麼判，明年收到怎麼清帳？","我們合作社拿中央補助買一台冷氣，也用縣府補助和自籌付不同施工費。財產還在使用年限內但壞了，有維修報價，理事說要送別的社區，哪些資料先查，報廢、折舊、出售或退補助怎麼分，會計報告交誰？","一般協會有四筆：一筆縣府書面無條件核定還沒撥、一筆縣府說要結案才算、一筆商家已捐到帳戶且限定送餐、一筆理事暫墊設備。以前平時按現金收付，年底怎麼調、設備列哪，財報是否監事審和會員大會同意，券和薪資如何避免重報，自籌及補助餘額可不可以帶到下個年度？","更正，前面是一般消費合作社，不是協會，兩筆政府款都只是申請，沒有核定也沒有撥款。捐款已進合作社帳戶，仍限定送餐。其他情況先不變。","新題：南州鄉有哪些社會福利團體？","這筆補助要列帳嗎？"];
const complex=["一般勞動合作社這週送青年活動補助，沒有核定函，下月才知道結果；現在能把縣府補助記成應收放進今年決算嗎？","有核定設備款，合作社先付、機器已驗收，補助說要核銷通過才會撥款，年底要記機器和哪一筆補助，已收到再怎麼處理？","合作社拿中央合作事業補助買冷凍櫃，還有縣府用不同一張憑證補運費跟自籌。冷凍櫃壞了可以直接捐掉嗎，原價與折舊、退回或出售所得要怎麼分開？","協會原本用自籌先付租金，縣府已書面核定但還等核銷，另一筆民間商家已直接捐到會帳。這些要怎麼認列，監事誰審，明年進款會不會重算、結餘能不能自行轉下個計畫？","更正，我剛才那個是一般合作社，不是人民團體；補助只有口頭說可能有，沒有核定或撥款。","新題：潮州鎮有幾個老人福利類團體？"];
const quality=["一般合作社可不可以接受縣府補助？","縣府有一筆設備補助和自籌款，合作社已經買冰箱，機器壞了換新能把舊的送人嗎，單據和收入在哪裡記？","補助要怎麼入帳？我是合作社，但還沒收到核定函。","更正，這次是一般社區發展協會，只想問補助是已核准但還沒撥款，要記收入還是先列應收？","普通協會已經收到核定且完成支出，理監事會要不要審，會員大會可以不看補助款決算嗎？","新題：佳冬鄉有幾個學術文化類團體？"];
const all=r=>[r.summary,...r.steps.flat()].join(' ');
const pending=route(advanced[0]);a.match(all(pending),/不能先把未確定的補助記成收入、應收或現金.*第7–9條.*不能先用它抵掉.*社員大會承認/);
const cont=route(advanced[1]);a.match(all(cont),/先核對是否已確定能請款.*不把不確定的全額列確定應收.*沖減原應收.*原值、折舊額/);
const asset=route(advanced[2]);a.match(all(asset),/先別把用補助購買的設備送人.*累計折舊及帳面價值.*原補助機關.*報廢核准、除帳.*不得把同一張憑證.*開會10日前/);
const mixed=route(advanced[3]);a.match(all(mixed),/現金收付制.*必要條件辦妥.*核銷審定.*沖減原應收.*指定送餐.*代墊.*同一原始支出.*下個計畫.*第34條/);
const corr=route(advanced[4],mixed.grantAccrualContext);a.match(all(corr),/不能先把未確定的補助記成收入.*第7–9條.*指定送餐.*代墊.*第36條/);a.doesNotMatch(all(corr),/必要條件辦妥且金額可確認|人民團體法第34條/);
a.equal(route(advanced[5],corr.grantAccrualContext),null);
const unknown=route(advanced[6]);a.equal(unknown.choices.length,2);
for(const o of unknown.choices){const t=route(o.question,unknown.grantAccrualContext);a.equal(t.choices.length,4);const b=t.choices.map(ch=>all(route(ch.question,t.grantAccrualContext)));a.match(b[0],/不先列為應收/);a.match(b[1],/不把不確定的全額列確定應收/);a.match(b[2],/必要條件辦妥/);a.match(b[3],/沖減原應收/);}
a.match(all(route(quality[0])),/可以申請符合資格的計畫/);
a.match(all(route(complex[3])),/核銷審定.*沖減原應收.*自籌先付租金.*商家捐款.*第34條/);
a.match(all(route(complex[2])),/財產目錄.*原補助機關.*合規處分/);
for(const s of ['協會想聘前任理事當補助專案助理，他只寫信辭職還沒開理事會，鄉公所只准補雜支、不准補薪水。暫時可以給固定志工費嗎？','合作社退休金怎麼算','協會解散，政府補助設備可以分嗎？','信用合作社可以縣府補助、要如何入帳？','協會領補助款會引發所得稅嗎？'])a.equal(route(s),null,s);
console.log('Grant timing, accounting and asset control variants passed');
