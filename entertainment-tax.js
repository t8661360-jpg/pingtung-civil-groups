(function(root){
'use strict';
const r=(title,source)=>({title,source});
const law=r('娛樂稅法第2、3、4、7條：課稅範圍、代徵及程序','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=G0340106');
const list=r('財政部115年5月22日公告：其餘九類娛樂項目','https://law-out.mof.gov.tw/LawContent.aspx?id=GL011738&media=print');
const local=r('屏東縣財稅局：115年5月22日娛樂稅新制','https://www.etax.nat.gov.tw/etwmain/announcement/news/g71zlJQ');
const change=r('財政部：藝文及競技比賽已移出課稅','https://www.mof.gov.tw/singlehtml/384fb3077bb349ea973e7fc6f13b6974?cntId=7a2072a013304fbbb9170d8deb1de6e0');
const charity=r('公益勸募條例第5至7條：收捐與主動募集','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050138');
const finance=r('社會團體財務處理辦法第5、16、17、20條','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050097');
const vat=r('加值型及非加值型營業稅法','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=G0340080');
const option={arts:'只有表演、放映或比賽',extra:'另有收費的娛樂設施',market:'只有市集賣東西，沒有娛樂設施',old:'是115年5月22日前的舊活動'};
const norm=s=>String(s||'').normalize('NFKC').replace(/\s/g,'');
function time(t){
 if(/修法前|新制前|舊活動|舊案|115年5月22日(?:以)?前|2026年5月22日(?:以)?前/.test(t))return 'old';
 const d=t.match(/(?:(?:民國|西元)?(\d{2,4})年(\d{1,2})月(\d{1,2})(?:日|號)?|(\d{3,4})[\/-](\d{1,2})[\/-](\d{1,2}))/);
 if(!d)return /修法後|新制後|現在|今年11月|明年/.test(t)?'now':null;const y=+(d[1]||d[4]),yyyy=y<1911?y+1911:y;
 return (yyyy*10000+Number(d[2]||d[5])*100+Number(d[3]||d[6]))<20260522?'old':'now';
}
function route(q,prior){
 const raw=norm(q);const mark=/^(?:換題|新題|另問)(?=$|[,:。，;!?])/;
 if(mark.test(raw))prior=null;
 const t=raw.replace(/^(?:換題|新題|另問)(?=$|[,:。，;!?])[,.:。，;!?]*/,'');
 if(!t||t.length>480)return null;
 const selected=t.match(/^櫃檯娛樂稅確認:([a-z]+)$/)?.[1];
 if(selected&&(!prior||!option[selected]))return null;
 const follow=prior&&/^(?:更正|補充|那|所以|如果|我剛)/.test(t)&&/娛樂稅|販賣機|售票|票款|免稅|活動|場地|設施|日期/.test(t);
 const artsRe=/音樂會|演唱(?:會|活動)|歌唱表演|藝文(?:演出|表演)|售票表演|表演票|舞台劇|戲劇演出|電影|放映|競技比賽|球賽|音樂表演|樂團.{0,5}表演/;
 const facility=/舞廳|舞場|高爾夫|視聽視唱|KTV|資訊娛樂|實境解謎|密室逃脫|娛樂性.{0,3}射擊|卡丁車|動力車輛|夾娃娃機|卡匣.{0,4}販賣機|電子遊戲機|水上動力|空中動力/i;
 const cleaned=t.replace(/(?:不是|不辦|沒(?:有)?)\s*(?:另外)?(?:協會)?(?:的)?(?:辦)?(?:售票)?(?:表演|演唱會|音樂會|放映|電影|球賽)/g,'');
 const isArts=artsRe.test(cleaned);
 const isFacility=facility.test(cleaned.replace(/(?:沒(?:有)?|並無|未設|不設|不含)(?:另外)?(?:收費的)?(?:KTV|密室逃脫|夾娃娃機|高爾夫球場|舞廳|舞場|電子遊戲機)/gi,''));
 const sales=/純.{0,5}(?:市集|擺攤)|賣.{0,5}(?:農產|東西|商品|物資)|市集|攤商/.test(cleaned);
 const mixed=/材料費|教材費|代收|國稅局|營業稅|發票|收據|票款|售票平台|收款|捐|勸募/.test(t);
 const unclear=/不知道|不確定|不清楚|不曉得|未確認/.test(t)||/市集.{0,9}還是/.test(t);
 const tax=/娛樂稅|地方稅務局|地方財稅局|財稅局/.test(t);
 if(!selected&&!follow&&!(tax&&(isArts||isFacility||sales||unclear||/活動|售票/.test(t))))return null;
 const kept=selected||follow?prior||{}:{};
 const period=selected==='old'?'old':time(t)||kept.period||'now';
 const area=selected==='arts'?'arts':selected==='extra'?'extra':selected==='market'?'market':unclear?'unknown':isFacility?'extra':isArts?'arts':sales?'market':kept.area||'unknown';
 const charityTalk=/捐|樂捐|勸募/.test(t)||!!kept.charityTalk;
 const transactions=mixed||!!kept.transactions||area==='market';
 let title,summary;
 if(period==='old'){
  title='舊活動先查舉辦日期，不直接套115年5月22日新法';
  summary='115年5月22日前的活動，要用當時有效的規定。先把演出或活動日期、收費方式及是否申報給活動所在地財稅機關確認；不能因新法把舊案一律銷掉，也不要先重複申請。';
 }else if(area==='arts'){
  title='115年5月22日起，音樂會、藝文表演及競技比賽不課娛樂稅';
  summary='如果只有音樂會、演唱會等藝文表演，不論售票或免費，自115年5月22日起已不是娛樂稅課稅項目，不用為這場表演辦理娛樂稅登記或申請免徵。這不是因主辦方是公益團體或捐出票款才免。';
 }else if(area==='market'){
  title='只有市集或賣農產，不是娛樂稅課稅項目';
  summary='只是租場地販賣農產或一般商品，沒有另提供收費的應稅娛樂場所或設施，就不是娛樂稅的課稅項目。農產品銷售的營業稅、憑證是否有例外，另按實際業務找國稅局。';
 }else if(area==='extra'){
  title='另有收費娛樂設施：和表演門票分開判斷';
  summary='若有KTV、密室逃脫、夾娃娃機或其他財政部公告項目，先把各別收費和經營者弄清楚，向活動所在地財稅機關確認。表演移出課稅，不代表現場所有設施都免。';
 }else{
  title='活動、娛樂設施、售票或賣商品，先按實際內容分';
  summary='115年5月22日起，只有表演、放映、競技比賽或一般市集銷售，不屬娛樂稅課稅範圍。可能課的是舞廳或舞場、高爾夫及財政部公告的其他項目；請選最接近的一類。';
 }
 const steps=[['地方娛樂稅 vs 國稅','娛樂稅由活動所在地財稅機關處理，在屏東向屏東縣政府財稅局確認。若是仍在課稅範圍的臨時對外售票或收費活動，依第7條事前辦登記及徵免；另以飲品或設施收費也要看實際。營業稅、發票和平台代收的帳務不由這條娛樂稅一併處理，問國稅局。']];
 if(area==='extra'||area==='unknown'||period==='old')steps.push(['不要把公益銷售一概說成免稅','有應稅活動時，娛樂稅法第4條所列免徵須核實，例如合格團體收入全部作本事業使用，和收入捐另一團體不是同一條件。實際能否免、由誰代徵、票上已收稅或合併售票，先帶活動日期和各項收費資料問財稅機關。']);
 if(transactions)steps.push(['費用、票款及平台收付分開','材料費與售票價款屬有對價的給付，按實質登帳，查實際收款人及適用的收據或發票；即使收入最後捐出去，也不把付費者的票券或材料費改開成捐款收據。']);
 if(charityTalk)steps.push(['公益捐助另外判斷','真正可自由決定、與入場或取得物品無關的捐贈，和固定售票費是兩筆。若主動向外界募集，另按公益勸募規定向活動所在地社政主管核對資格或許可。把部分或全部售票收入捐出，不替代應辦的會計或募款程序。']);
 const choices=area==='unknown'&&!selected&&period!=='old'?Object.entries(option).map(([k,label])=>({label,question:'櫃檯娛樂稅確認:'+k})):null;
 return {direct:true,title,summary,category:'活動收費｜娛樂稅、營業稅與勸募',steps,refs:[law,list,local,change,...(transactions?[finance,vat]:[]),...(charityTalk?[charity]:[])],questionState:{focus:'cross-event-entertainment-tax'},entertainmentTaxContext:{area,period,charityTalk,transactions},...(choices?{choiceHeading:'先確認活動類型或實際日期',choices}:null)};
}
if(typeof module==='object'&&module.exports)module.exports={route};
else root.verifiedEntertainmentTax=route;
})(typeof window==='object'?window:globalThis);
