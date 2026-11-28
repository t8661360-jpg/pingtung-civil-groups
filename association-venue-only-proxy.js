(function(root){
'use strict';
const cite=(x,pcode,n)=>({title:x,source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+pcode+'&flno='+n});
const refs={
 notice:cite('人民團體法第26條：會員大會通知與派員','D0050091',26),
 venue:cite('人民團體會務輔導辦法第10條：通知地點','D0020094',10),
 record:cite('人民團體會務輔導辦法第12條：大會紀錄','D0020094',12),
 proxy:cite('人民團體法第42條：書面委託','D0050091',42),
 elections:cite('人民團體選舉罷免辦法第7條：改選代理出席','D0050093',7),
 coop:cite('合作社法第46條：社員大會召集','D0050112',46)
};
const norm=q=>String(q??'').normalize('NFKC').replace(/\s+/g,'');
const subject=/協會|社會團體|人民團體|社團法人/;
const venue=/改(?:了|到)?(?:開會)?(?:場地|會場|地點|場所)|換(?:了|到)?(?:別的|另外|一個|新(?:的)?)?(?:開會)?(?:場地|會場|地點|場所)|(?:會場|場地|開會地點).{0,10}(?:變更|更新|換|改|從.{1,5}到)|(?:大會|會議|會場).{0,12}(?:搬到|挪到|移到).{1,12}(?:場地|地方|地點|原址|新址|會場)|大會.{0,9}從.{0,9}(?:搬到|換到|移到)|遷移會場|改到別處/;
const dateSame=/(?:日期|會期|原日|原訂時間).{0,5}(?:不變|未變|沒改|沒變|沒有變|沒有改|不改|照舊|原定)|沒改日期|未改日期|不改日期|只(?:是)?(?:改|換).{0,6}(?:場地|地點|會場)|只(?:把|將).{0,14}(?:換到|換|改).{0,8}(?:場地|會場|地點)|照(?:原訂|原定)(?:日期|日子)|[0-9一二三四五六七八九十]{1,3}天後照開/;
const dateUnknown=/還沒說(?:是否|有沒有)|不確定.{0,9}日期|日期.{0,8}(?:還沒定|未定|尚不確定)|可能也改日期|換場地.{0,8}是否.{0,4}改日期/;
const newDate=/(?:日期|會期).{0,6}(?:也改了|也要改|也變|已改|提前|延後)|(?:改期|延期).{0,14}(?:同時|順便|也)(?:換|改)(?:會場|地點)|(?:同時|也要)(?:改(?:期|日期)|提前開|延後開)|改(?:成|到).{0,9}(?:新日期|明年.{0,8}月)/;
const power=/委託書|原委託|代理人|代為出席|委託代理|委託出席|重簽/;
const filed=/縣府|縣政府|主管機關|派員|列席|會議資料|報備|備查/;
function route(q){
 const raw=String(q??'').trim(),t=norm(raw);
 if(!t||t.length>365||!venue.test(t)||/工會|公會|農會|漁會|家長會|公司股東|管委會|基金會|成立大會/.test(t))return null;
 if(/(?:一般)?合作社/.test(t)&&/社員(?:代表)?大會/.test(t)&&/協會|七天|七日|15天|15日|十五|要通知|社址/.test(t)&&!/信合社|信用合作社/.test(t)){
  if(subject.test(t)&&!/一樣|比照|跟|和|如同/.test(t))return null;
  return {direct:true,category:'一般合作社｜社員大會場地',title:'合作社社員大會改場地，不套協會的15日',
   summary:'一般合作社社員大會依合作社法第46條，會前七日以書面載明召集事由及提議事項並通知社員；更換場地時，須讓社員收到正確的開會時間和地點。不使用協會會員大會的15日通則。僅換會場而社址沒搬，不用因此變更合作社登記社址。',
   steps:[['儘快把新地點書面通知應出席者','已先發出舊地點時，應更正通知及保留送達證明。離開會很近時，不能自行認定原通知一定仍合規；先向原主管機關確認如何補正或改期。']],refs:[refs.coop],questionState:{focus:'compound'}};
 }
 if(!subject.test(t)||!/會員(?:[（(]?代表[）)]?)?大會|會員代表會議|協會.{0,5}大會/.test(t)||/合作社|信合社|社員大會|不是協會|只有.{0,6}登記會址|只有.{0,6}會址搬/.test(t))return null;
 const wantProxy=power.test(t),wantCounty=filed.test(t);
 if(!wantProxy&&!wantCounty&&!/更新|通知|不到|天後|提早|重發|期限/.test(t))return null;
 const choice=t.match(/場地變更確認:(日期不變|日期也變)/)?.[1];
 const unclear=!choice&&(dateUnknown.test(t)||wantProxy&&!dateSame.test(t)&&!newDate.test(t));
 const shifted=choice==='日期也變'||!choice&&!unclear&&newDate.test(t);
 if(shifted&&!choice&&/(?:改到|延到|延至|延期|改期).{0,15}(?:明年|次年|[0-9一二三四五六七八九十]{1,3}月)/.test(t))return null; // let existing planner retain a concrete new date
 const same=choice==='日期不變'||!unclear&&!shifted&&dateSame.test(t);
 if(!same&&!shifted&&!unclear&&!wantProxy)return null;
 const limited=/寫死.{0,7}(?:舊|原|會場|場地)|只限.{0,10}(?:舊|原|甲地|舊址|甲址)|限定.{0,12}(?:舊|原|甲地)|指定給.{0,5}(?:舊|原).{0,3}(?:會場|場地|地址)|明(?:定|寫|載).{0,7}只限/.test(t);
 const identifies=/只寫日期|寫會議日期(?:沒|不)限定地點|沒有限定地點|不限定場地|未限定地點|只記載原地址|寫到原地址|記載原地址/.test(t)&&!limited;
 const notices=['把新會場通知每一位應出席者，別只改系統',
  '會員（代表）大會的會前通知一般應於15日前通知，依會務輔導辦法第10條應載種類、時間、地點與議程。已通知過舊會場時，要儘快把新會場和原訂日期、時間通知每一位應出席的會員或會員代表，並保留更新及送達紀錄。只在網站、系統或群組改地址，不一定等於依法通知所有應出席者。'];
 const notifyCounty=['把列席資料同步更正給原承辦窗口',
  '已報請縣府派員列席的，向原受理機關或承辦更正開會地點及相關會議資料；還沒報請的依人民團體法第26條辦理。可與更正會員通知同步，不必先等縣府回覆才通知會員，也不能只通知縣府就不通知會員。開完後，大會紀錄依第12條記實際地點等資訊、閉會後30日內報備。'];
 const deadline=['只改地點不等於日期改了，也不是緊急臨時會議',
  '一般的15日是會前通知規則；只換地點並無一律重新起算的明文，也不能因此認定舊通知在任何情形都夠。若只剩少於15日，尤其您說不是緊急臨時會，就不套一日前送達的例外；應立即更正通知並向原主管機關確認能否補正或須另訂日期。'];
 const check=['原委託書要看有沒有把場地寫成限制',
  (limited?'您說明原委託書明限舊會場或地址，不宜拿到新會場直接當作有效；如果本人仍希望委託，請由本人重新作成載明正確會議的書面委託，不要代填或代簽。':identifies?'若只寫會議日期，而日期、議程及會議本身不變、也沒把地點寫成限制，不因只換場地就一律要求每張重簽。仍應核對章程、委託是否撤回及雙方資格。':'若原件明定只限原地點，應請本人重新書面委託；若地址只是用來識別同一場會議、沒有把舊址作限制，依章程、委託內容與雙方資格核對，不一概認定有效或失效。')
  +'依人民團體法第42條，大會委託須書面，由其他具資格的會員（代表）代理，每人以代理一人為限。'];
 const calendars=['如果連開會日期也改了','不再是只換會場。按新開會日期依15日前的通常期限通知應出席者，並更正已報請派員資料。原委託書若明限原日期或原場地，請本人重新書面委託；未限定的仍查章程、範圍及雙方資格。若要算新通知日期，只需補新的開會日期。'];
 const steps=shifted?[calendars,...(wantCounty?[notifyCounty]:[])]:[notices,...(wantProxy?[check]:[]),...(wantCounty?[notifyCounty]:[]),deadline];
 const choices=unclear&&raw.length<285?[
  {label:'日期不變，只換會場',question:raw+'；場地變更確認：日期不變。'},
  {label:'日期也改了',question:raw+'；場地變更確認：日期也變。'}
 ]:[];
 return {direct:true,category:'協會大會｜會場更正與書面委託',title:unclear?'先確認日期是否也改，換場地的通知可先準備':shifted?'日期也改了，通知和委託要按新會議核對':'會員大會日期不變：更正場地，原委託書看限制',
  summary:unclear?'先選日期有沒有變；您已說會場要換，不必重填其他資料。':shifted?'日期和地點都不同，不能直接沿用舊通知或明限原日時地的委託書。':
   '新地點要通知應出席者'+(wantCounty?'，也要同步更新原列席承辦資料':'')+'。'+(wantProxy?(limited?'原委託書明限舊場地時，請本人重新書面委託。':'先核對原委託的範圍，不因只換地點就一律作廢或要求重簽。'):''),
  steps,refs:[refs.notice,refs.venue,...(wantProxy?[refs.proxy]:[]),...(wantCounty?[refs.record]:[]),...(/選舉|改選/.test(t)&&wantProxy?[refs.elections]:[])],questionState:{focus:choices.length?'clarify':'compound'},
  ...(choices.length?{choiceHeading:'除了會場，開會日期也改了嗎？',choices}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports=route;return;}
root.verifiedAssociationVenueOnlyProxy=route;
})(typeof window!=='undefined'?window:globalThis);
