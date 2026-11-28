(function(root){
'use strict';
const official={title:'衛福部食藥署：食品捐贈安全衛生指引及問答',source:'https://www.fda.gov.tw/TC/siteContent.aspx?sid=12462'};
const law=(title,code,n)=>({title,source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const expiry=law('食品安全衛生管理法第15條：不得運送、贈送逾期食品','L0040001',15);
const stop=law('食品安全衛生管理法第7條：食品業者停止、回收、通報','L0040001',7);
const report=law('食品安全衛生管理法第6條：醫療機構和衛生單位通報','L0040001',6);
const local={title:'衛福部：實（食）物銀行資源與屏東窗口',source:'https://dep.mohw.gov.tw/dosaasw/cp-569-61374-103.html'};
const privacy=law('個人資料保護法第20條：使用必要範圍','I0050021',20);
const contribution=law('社會團體財務處理辦法第17條：收入收據','D0050097',17);
const labels=[['packed','常溫有包裝食品'],['cold','需冷藏或冷凍'],['home','散裝或自製熟食'],['incident','已發出且疑似有食安異常']];
const tracking=['追溯紀錄和救助名冊分開','記下來源、收受與發放日期、品項與數量、批次或辨識資訊、有效日期及必要的流向、保存或退回情形。依團體、據點或食品業者適用規定留存紀錄；只讓有必要的授權人員查閱，不公開捐贈人或受助者名單。'];
const receipt=['收據按實際合規收受開立','受贈團體依身分、適用財務或勸募規定處理捐贈收據及入帳。合格實收與拒收、退回、處理紀錄分開；收據不會使不安全食品變成可發放，也不代表一定能抵稅。'];
const answer=(title,summary,steps,refs,extra={})=>({direct:true,category:'社福｜食品捐贈與發放',title,summary,steps,refs,questionState:{focus:'cross-food-safety'},foodDonationContext:true,...extra});
function route(q,active){
 const raw=String(q??'').trim(),t=raw.normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>485||/^(?:另問|新題|換題)/.test(t))return null;
 const selected=t.match(/;櫃檯確認食品狀態:(packed|cold|home|incident)$/)?.[1];
 const food=/食品|食物|熟食|生鮮|餐食|食材|便當|送餐|供餐|共餐/.test(t);
 const giving=/捐|贈|發放|送給|發給|發下去|分發|已發|送出|物資銀行|食物銀行|送餐/.test(t);
 const scope=/協會|社會團體|人民團體|志工|物資銀行|食物銀行|公益|救助|弱勢|家戶/.test(t);
 const follow=active&&/^(?:補充|更正|假設|那|如果|其實)/.test(t)&&food&&giving;
 const specific=/即期|過期|效期|有效日期|保存期限|常溫|冷藏|冷凍|冷鏈|停電|破損|未標|沒標|自製|散裝|疑似中毒|疑似食品中毒|食安|沒過期/.test(t);
 if(!selected&&!(food&&giving&&(scope||follow||/捐.{0,9}食品|食品.{0,9}捐|捐.{0,9}熟食/.test(t))&&(specific||/食品捐贈|捐贈食品|發放食品/.test(t))))return null;
 const urgent=/食品中毒|食物中毒|吃.{0,20}(?:不舒服|不適|生病)|有人.{0,16}(?:不舒服|不適|嘔吐|腹瀉)|反映.{0,12}(?:不舒服|不適)/.test(t)&&!/沒有人.{0,6}(?:不舒服|不適)|未有人.{0,8}(?:不舒服|不適)/.test(t);
 if(urgent||selected==='incident'||/已發|發下去|已送出/.test(t)&&/停電|冷鏈中斷|確定過期|已過期/.test(t))return answer('先停止發放、隔離同批食品並通知衛生局','立即停止發放該批食品，隔離尚未送出的同批品，通知已收到的人先不要食用。有人不舒服請儘速就醫，情況緊急打 119。不要等更多人不適，也不自行判定中毒原因。',[
  ['通知所在地衛生局並保留可追溯資料','由發放單位先聯繫事發所在地衛生局，屏東案件可聯繫屏東縣政府衛生局。若是核定物資銀行據點，另依原方案通知主管機關。保留包裝、批號、批次名單、運送與溫度紀錄，剩餘食品按衛生局指示保全，不自行丟棄、試吃或重新發放。'],
  ['誰負責通報','食品業者知悉食品有危害安全之虞，須依食安法第 7 條立即停止相關作業、辦理回收並通報主管機關。醫療機構的通報義務另依第 6 條，不是據點等待的期限。'],
  tracking,['通知受助者不等於可公開個資','可以個別通知受影響家戶，也可發不含可識別個資的停食提醒。不得把受助人姓名、聯絡資料、症狀或救助名單貼到公開群組、小屏或公開回報。']
 ],[stop,report,official,privacy,local]);
 const bad=/(?:已|有些|部分|一部分)?(?:過期|逾期|過效期)|包裝(?:已)?破(?:損|了)|部分破損|效期已過|超過(?:有效日期|保存期限)/.test(t.replace(/(?:尚未|沒有|還沒|沒|未|不是)過期/g,''));
 if(bad)return answer('過期、破損或冷鏈不明的食品，先隔離，不寄送','不可以一併寄送或發放。逾有效日期的食品不得運送或當贈品；包裝破損或無法確認原保存條件的批次也先隔離，不拿來發放。免費或偏鄉受助不例外。',[
  ['只處理能確認安全的合格品','逐批檢查有效日期、包裝與保存，合格批次依原定冷藏、冷凍或常溫條件運送，並在有效日期內完成轉贈。無法維持冷鏈就不要送；拒收、退回或廢棄依據點規定及衛生主管機關指引處理。'],
  tracking,receipt
 ],[expiry,official,contribution,privacy,local]);
 const home=selected==='home'||/自製|散裝|沒標日期|未標日期|家庭熟食/.test(t);
 const cold=selected==='cold'||/冷藏|冷凍|冷鏈|停電/.test(t);
 const packed=selected==='packed'||/即期|常溫|有包裝|包裝食品|沒過期/.test(t);
 if(home)return answer('自製熟食保存狀況不明，先不要隔夜送','若不能確認製備時間、存放條件與食用安全，不要把室溫放過的自製熟食留到隔天發放。沒有變味也不是安全保證。先問據點或所在地衛生局是否接受及如何處理。',[
  ['散裝或現場調製食品要另外核對','依法本來不須標日期的散裝或現場調製食品，不能一概說違法；仍須確認無變質、適當盛裝，依必要條件運輸與貯存。不要自行補貼效期或用加熱代替查明保存。'],tracking,receipt
 ],[official,expiry,privacy,local]);
 if(cold||packed)return answer(cold?'冷藏或冷凍食品：先確定全程可維持原保存':'即期不等於過期，符合條件才能轉贈','免費發放也需符合食安規定。先確認包裝完整、效期清楚、原定保存條件沒有中斷，且受贈單位能接收，才能在有效日期內完成轉贈。',[
  ['保留原定保存條件','不要用重新包裝或重新冷凍改寫原效期；冷藏或冷凍品無法確保適當運送、保管時，先不發放。若是當天即期，確認家戶有時間在期限內妥善使用，不確定就不收。'],
  tracking,receipt
 ],[official,expiry,contribution,privacy,local]);
 return answer('先確認食品種類，再決定能否發放','捐贈前先確認效期、保存方式及包裝。逾期、有破損或無法確認安全的先不要發放，無需在小屏填捐贈人或受助者身分。',[],[official,expiry,local],{
  choiceHeading:'您要確認哪一種食品狀況？',
  choices:labels.map(([k,label])=>({label,question:raw+'；櫃檯確認食品狀態:'+k}))
 });
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationFoodDonationSafety=route;
})(typeof window!=='undefined'?window:globalThis);
