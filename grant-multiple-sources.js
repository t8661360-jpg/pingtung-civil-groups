(function(root){
'use strict';
const county={title:'屏東縣政府對民間團體補助經費作業要點第8、10、11點',source:'https://portal.ptc.edu.tw/bulletin/attachment.php?a_sn=33872&b_sn=B114003910'};
const national={title:'行政院主計總處：中央補（捐）助預算執行應注意事項第4點',source:'https://law.dgbas.gov.tw/LawContent.aspx?id=FL033828&media=print'};
function route(q){
 const raw=String(q??'').trim(), t=raw.normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>430||/解散|清算|停辦|取消活動|補助.{0,4}(?:撤銷|廢止)|政府採購.{0,4}招標|營業稅怎麼|賣東西|公務員利衝迴避/.test(t))return null;
 const local=/屏東|屏縣/.test(t)&&!/不是屏東|非屏東|不在屏東|不是.{0,4}屏東縣府/.test(t);
 const away=/新北|台北|臺北|桃園|新竹|苗栗|台中|臺中|彰化|南投|雲林|嘉義|台南|臺南|高雄|台東|臺東|花蓮|宜蘭|基隆|澎湖|金門|連江|外縣市/.test(t);
 const gov=/縣府|縣政府|市府|市政府|鄉公所|鎮公所|區公所|中央|縣(?:的)?(?:社會處|教育處)|縣內.{0,8}局處/.test(t);
 const nationalNamed=/中央|部會|內政部|文化部|衛福部|教育部|農業部|體育署|運動部|勞動部|原民會/.test(t)&&!/沒有(?:申請|向)?中央|不是中央|非中央/.test(t);
 const countyPair=local&&!away&&!nationalNamed&&(/社會[處局].{0,28}教育[處局]|教育[處局].{0,28}社會[處局]|兩個都是屏東縣府單位|縣府.{0,8}兩(?:個|處|局)|兩(?:個|處|局).{0,10}縣府|第.?個縣府單位|縣府不同局處/.test(t));
 const inferred=/報|申請|請款|核銷|送件|告訴中央/.test(t)&&/(?:場租|場地|講師|印刷|保險|耗材|費用|單據|收據|發票)/.test(t);
 if(!/補[捐款助]|政府經費/.test(t)&&!(gov&&(inferred||/補(?:場地|場租|保險|印刷|講師)/.test(t))))return null;
 const multi=/兩(?:邊|筆|份|家|個|處|場)|二個以上|另(?:一個|一筆|一邊)|各自|各向|各一筆|多(?:個)?機關|同時|重複|重覆|雙邊|各報/.test(t)||countyPair||(gov&&nationalNamed&&/縣|市|公所/.test(t));
 if(!multi)return null;
 const distinct=/不同(?:活動|企劃|計畫|案|場次)|兩場.{0,5}不同|各辦一場|不是同一(?:場|案|計畫)/.test(t);
 const same=/同一(?:場|案|活動|個案|計[畫劃]|件)|同年度同一|同個活動|同件事|同一計/.test(t)&&!distinct;
 const condition=/重[複覆](?:申請|核銷|請領|請款|報)|同(?:一|張|筆).{0,12}(?:單據|發票|收據|憑證|費用|支出)|兩邊.{0,5}(?:申請|核銷|請款|報)|能.{0,5}都申請|可以.{0,8}申請|要.{0,6}(?:寫|揭露|列)|報帳|補救|更正|分攤|補保險|補印刷|各報/.test(t);
 if(!(same||distinct||condition))return null;
 // Give way to existing guidance when a primarily different fiscal question names two sources in passing.
 if(/抬頭|轉項|挪用|改列|餐費改|改成餐|個人名義/.test(t)&&!same&&!distinct&&!/重[複覆]|兩邊都核銷/.test(t))return null;
 const done=/已(?:經)?(?:都|先|各)?核銷|已(?:經)?向兩邊核銷|都(?:已經?|各|先)?核銷|(?:核銷|結案)(?:完|後)|已(?:經)?請過款|都撥款|各報整筆/.test(t)&&!/尚未核銷|還沒核銷|未核銷|還沒報/.test(t);
 const sent=!done&&/已(?:經)?(?:送|申請|報)|已經兩邊|都送了|送兩邊|送出(?:後|了)|都(?:先)?送件|先報了|送件之後|已送件/.test(t);
 const marked=/；來源確認：/.test(raw);
 const acrossYears=/不同年|跨年|去年.{0,20}今年|今年.{0,20}去年/.test(t);
 const external=away&&!/其實是屏東|因屏東縣府核定|是屏東縣府核定/.test(t);
 const division=/分攤|(?:只|各|分別)報.{0,9}金額|費用分開|分開.{0,10}(?:申請|補助)|各補不[同一]/.test(t);
 const scopes=[];
 if(external)scopes.push(['外縣市：不能直接套屏東規定','要看實際撥款機關與該案規定。若是中央機關另有補助，中央的揭露規範仍要核對；不能拿屏東縣要點直接判斷外縣市的申請。']);
 if(countyPair||local&&!external&&!nationalNamed){
  const v=distinct?'你說是不同活動、時間和計畫。只是同一協會在同一年分別辦兩案，不等於第11點說的「同一案件」；仍要核對有沒有把同一計畫拆件，及各計畫的年度上限或其他限制。':(countyPair&&same&&!acrossYears?'兩邊都是屏東縣府的單位，又是同年度同一案，不能兩邊都送。':'如果兩筆都是屏東縣府同年度的同一案，不能兩邊都送。')+' 屏東縣通案要點第11點要求，只向縣府一個機關或單位申請；把場租和講師費分開或用不同發票，不會讓同一案變兩案。';
  scopes.push(['縣府內兩個單位：先分辨是不是同一案',v]);
 }
 if(nationalNamed||!countyPair&&!local&&!external){
  const v=(nationalNamed?'有中央補助時，同一案有兩個以上受理機關，':'如果其中有中央機關的補助，同一案有兩個以上受理機關，')+'依中央注意事項第4點，申請時要揭露全部預算，以及向各機關申請的項目及金額；結報時另列用途、全部實支費用與各機關實際補助金額。明列不等於一定可併補，仍要按各計畫規定和核定函。'+(local&&!external?' 若適用屏東縣通案要點，第8點也要求實際支用明細表列出各機關補助項目與金額。':'');
  scopes.push(['兩個機關之間有中央補助：分項仍要揭露',v]);
 }
 const sameCost='不可以拿同一筆支出向兩邊各請領全額。'+(division||condition?' 若原機關同意同一張憑證分攤，仍須據實列各自負擔金額，合計不能超過實際支出，並依兩個核定機關要求註記及留存。':' 是否能分攤，先查兩個核定案。');
 const fix=done?'已核銷：先停止重送或再領款，留好原憑證、兩份核定函與已核銷明細，作一張逐筆對照表。用原收件窗口向各原核定機關說明，請確認更正書件及實際應繳回金額。不能逕斷兩案都全額退，也不能以改原單據方式補救。':sent?'已送件：把同一案的預算、已申請別處的項目及金額補充給各原受理機關，請確認能否補正、須否撤回其中一案；不要等撥款或改憑證日期。':'如果還沒送件：先列完整預算、各來源和各支出分攤，核對各計畫是否允許，再按正確管道送件。已送或核銷則先找原受理／補助機關補正，不要另送一件當更正。';
 const consequences=(local&&!external?' 如查有未按原用途支用或虛報等，屏東要點第10點規定可按實際情事追繳全部或一部分。':'')+(nationalNamed?' 若查實屬隱匿不實或造假，中央注意事項第4點規定撤銷並收回已撥款；不能僅憑一句「報了兩邊」就判定已構成。':'');
 const choices=!marked&&!countyPair&&!nationalNamed&&!external&&!done&&!distinct&&(local||!gov)?[
  {label:'兩個都是屏東縣府單位',question:raw+'；來源確認：兩個都是屏東縣府單位。'},
  {label:'其中有中央機關補助',question:raw+'；來源確認：其中有中央機關補助。'},
  {label:'同一筆已向兩邊核銷',question:raw+'；來源確認：同一筆已向兩邊核銷。'}
 ]:null;
 let summary=done?'先把兩邊的核銷金額逐筆對齊，找原機關更正；同一筆支出不能重複請領。':external?'不能直接套用屏東的規定。先分開核對地方與中央的計畫。':countyPair&&same&&!acrossYears?'同年度同一案不能向屏東縣府兩個單位重複申請，即使兩邊報的是不同費用。':distinct?'不同活動不因同一協會同一年就算重複申請，仍須核對兩案是否實質分開。':nationalNamed?'即使把不同費用分開，向中央申請時也要據實揭露同案向另一機關申請的金額與項目。':'先分清補助是哪兩個機關，以及是同一案或兩案；同一筆支出不能在兩邊各報全額。';
 return {direct:true,category:'補助｜多機關申請與分開核銷',title:'補助分兩邊：先分同一案、機關來源和實際支出',summary,steps:[...scopes,['同一張憑證不等於能請領兩次',sameCost],['依目前進度處理',fix+consequences]],refs:[...(local&&!external?[county]:[]),...(nationalNamed||!local&&!external?[national]:[])],questionState:{focus:'compound',domain:'grant-multiple-sources'},...(choices?{choiceHeading:'是哪兩個機關，還是同一筆費用已經核銷？',choices}:{}),...(!external?{actions:[{label:'聯絡承辦',view:'contact',sub:''}]}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedGrantMultipleSources=route;
})(typeof window!=='undefined'?window:globalThis);
