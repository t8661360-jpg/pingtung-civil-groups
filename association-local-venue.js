(function(root){
'use strict';
const norm=q=>String(q??'').trim().normalize('NFKC').replace(/\s/g,'');
const centers={
 fangshan:{name:'枋山鄉鄉有活動中心',source:{title:'屏東縣枋山鄉鄉有活動中心管理自治條例第4、5條',source:'https://www.puli.gov.tw/attachment/33375_%E5%B1%8F%E6%9D%B1%E7%B8%A3%E6%9E%8B%E5%B1%B1%E9%84%89%E9%84%89%E6%9C%89%E6%B4%BB%E5%8B%95%E4%B8%AD%E5%BF%83%E7%AE%A1%E7%90%86%E8%87%AA%E6%B2%BB%E6%A2%9D.pdf'},
  summary:'向枋山鄉公所申請。已立案的符合資格團體辦非營利活動，經公所專案同意，免繳可包含租金、場地費、清潔費和保證金；實際水電費仍須負擔。村長口頭同意不是專案核准。'},
 chaozhou:{name:'潮州鎮老人活動中心',source:{title:'屏東縣潮州鎮老人活動中心使用管理自治條例第5、6、9條',source:'https://ws.yunlin.gov.tw/Download.ashx?n=5bGP5p2x57ij5r2u5bee6Y6u6ICB5Lq65rS75YuV5Lit5b%2BD5L2%2F55So566h55CG6Ieq5rK75qKd5L6LLnBkZg%3D%3D&u=LzAwMS9VcGxvYWQvNTMyL3JlbGZpbGUvMjA5MjIvNDYzODQzLzRlOTM4OTlhLTJmY2YtNGExZi1hNTQ5LTgwOTZiZjAyZmU3ZS5wZGY%3D'},
  summary:'向潮州鎮公所於活動7日前申請，填寫申請單或以公文送件。立案非營利團體辦老人福利或其他公益性活動，專案核准可以免場地使用費，但清潔費仍要繳。不要從免場地費推定押金也全免。'}
};
const civil={title:'民法第464、467、468、470條：借用、第三人使用、保管和返還',source:'https://mojlaw.moj.gov.tw/LawContent.aspx?LSID=FL001351&TypeSort=4&lawNumber=464'};
const county={title:'屏東縣政府對民間團體補助經費作業要點第5、8、8之一、10點',source:'https://ptc.familyedu.moe.gov.tw/fileRename.aspx?fid=40994&kid=2&site_id=19&uid=3454'};
function venue(s){
 const x=norm(s);
 const f=/枋山(?:鄉)?(?:公所)?(?:的)?(?:鄉有)?活動中心/.test(x);
 const c=/潮州(?:鎮)?(?:公所)?(?:的)?老人活動中心/.test(x);
 return f===c?'':f?'fangshan':'chaozhou';
}
function prepare(q,prior){
 const raw=String(q??'').trim(), t=norm(raw);
 const auto=!!prior&&!!venue(t)&&/^(?:續問場地|地點更正|地點是|更正|我說錯|不是|換成|改成|枋山|潮州)/.test(t)&&t.length<180&&!/另問|新題|合作社|解散準備|要辦解散/.test(t);
 if(!auto)return {raw,t,extra:'',continued:false};
 return {raw,t,extra:(/其他.{0,5}一樣|其他.{0,5}不變|同一件|原本情況/.test(t)||/^(?:枋山鄉鄉有活動中心|潮州鎮老人活動中心)[。！!？?]?$/.test(t))?prior:'',continued:true};
}
function route(q,prior=''){
 const x=prepare(q,prior),t=x.t, raw=x.raw;
 if(!t||t.length>340||/私人會議室|合作社|信合社|公會|工商團體/.test(t)||/遷址登記|要辦解散|準備解散|清算中/.test(t))return null;
 const id=venue(t);
 const application=/借|租|活動|公所|申請/.test(t);
 const fees=/清潔費|保證金|押金|場租|場地費|場地使用費|免收|減免/.test(t);
 const repair=/音響|器材|修理|修繕|設備/.test(t+x.extra);
 const grant=/補助|報帳|核銷|實報/.test(t+x.extra);
 const asksVenue=/活動中心|里民中心/.test(t)&&/還沒(?:確認|決定|選)|哪個鄉|不知道哪|不確定哪|不同鄉鎮|還沒定場地/.test(t);
 if(!x.continued&&!(application&&(id&&(fees||repair||grant||/多久|期限|核准|下週/.test(t))||asksVenue&&fees)))return null;
 const steps=[], refs=[];
 if(id){
  const o=centers[id];refs.push(o.source);
  steps.push([o.name+'的場地使用及申請',o.summary+' 請再向公所確認目前開放時段、適用收費表與應備證明；不先認定您的活動核准。']);
  if(id==='chaozhou'&&/下[週周]|後天|明天|還沒核准|急|來不及/.test(t))steps.push(['不要先當場地已核准','請按確切活動日期對照7日前的期限。未獲核准前不要向參加者保證場地，也不要以為先墊款就能事後請領。若時間不足，先和管理單位確認能否另排日期。']);
 } else steps.push(['不一定。租金和其他收費不能一起推定','免場租不一定也免清潔費、押金或水電。不同鄉鎮、不同活動中心各有管理規則；不要只憑口頭同意、或拿別處免收規定套用。確定場館後向有權管理單位申請，並拿到核准與費用方式。']);
 if(repair){
  refs.push(civil);
  steps.push(['另外借的音響或器材，不是場租的一部分','先區分場館固定設備和從居民或其他單位另借的東西。若是另借的音響，記下插孔等原有與實際損壞，先通知出借人；不要自己先修或無同意轉借鄰里。正常磨損與保管疏失責任不同，依使用、借用約定和證據核對；場地減免不決定器材責任。']);
 }
 if(grant){
  refs.push(county);
  steps.push(['修理費、保證金、補助，各有判斷依據','縣府補助只列原核定允許而且實際負擔的支出；先核對修理責任和原核定項目，未核准勿先承諾可報。會退回的押金不是實際租金或修理費，留收付憑證；若後來有扣款，仍先查原契約、責任與補助是否允許。']);
 }
 const choices=!id?[{label:'枋山鄉鄉有活動中心',question:'續問場地：枋山鄉鄉有活動中心；其他情況一樣。'},{label:'潮州鎮老人活動中心',question:'續問場地：潮州鎮老人活動中心；其他情況一樣。'}]:[];
 return {direct:true,category:'活動中心借用｜場地費、清潔費及押金',title:id?centers[id].name+'：申請和費用分開核對':'活動中心免場租，不一定免清潔費或押金',
 summary:id?(id==='fangshan'?'枋山符合條件並獲專案同意，才可能把清潔費、保證金一起免除；水電仍按實際用量。':'潮州鎮老人活動中心可申請專案免場地費，但清潔費仍須繳，並要在活動7日前向公所申請。'):'先確認鄉鎮與場館全名，再核對場租、清潔費、押金各自是否可免。已知器材及補助條件不用再說一遍。',
 steps,refs,questionState:{focus:'compound'},localVenueFact:x.continued?(x.extra||raw):raw,actions:[{label:'聯絡承辦',view:'contact',sub:''}],...(choices.length?{choiceHeading:'是哪一個活動中心？也可直接輸入其他鄉鎮與場館全名。',choices}:{})};
}
if(typeof module==='object'&&module.exports)module.exports={route,venue,prepare};
else root.verifiedAssociationLocalVenue=route;
})(typeof window==='object'?window:globalThis);
