(function(root){
'use strict';
const law=(title,p,n)=>({title:title+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+p+'&flno='+n});
const meeting=law('人民團體會務輔導辦法','D0020094',18);
const election=law('人民團體選舉罷免辦法','D0050093',17);
const civil=law('民法','B0000001',1148);
const privacy=law('個人資料保護法','I0050021',5);
const death=/過世|往生|身故|死亡|已故|辭世|去世|逝世|離世/;
const disputed=/不確定.{0,10}(?:過世|往生|辭職)|(?:過世|去世|往生).{0,5}還是.{0,3}辭職|只是辭職|只是辭任|只是離職|沒過世|沒有過世|不是過世/;
const office=/理事長|前任|卸任者/;
const handover=/交接|移交|接收|交給|交付|保管|圖記|公章|印信|立案證書|存摺|帳冊|帳本|手機|清冊|會議紀錄/;
const area=/合作社|公會|工會|農會|漁會|基金會|公司|管理委員會/;
function route(q,previous){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>340||area.test(t))return null;
 const fresh=/^(?:新題|另外一題|換題)/.test(t);
 const correction=!fresh&&previous&&/^(?:更正|補充|我只問|家屬只有)/.test(t);
 const data=/照片|相片|影像|手機|個資|隱私|密碼|群組|通訊軟體/;
 const specific=/沒有存[摺折]|不要談銀行|不要提銀行|只有.{0,7}(?:照片|個資)/;
 if(correction&&data.test(t)&&specific.test(t)){
  return {direct:true,category:'人民團體交接｜資料範圍',title:'可以先確認照片資料的交付範圍',
   summary:'可以。先請協會說明哪些照片是會務所需、指定哪位有權接收的人，以及交付方式；不必先交出整支私人手機、密碼或無關個資。',
   steps:[['先分出會務照片','只交付目的所需且有權交付的照片或檔案。不要在公開群組貼出志工姓名、臉部照片或聯絡資訊；用途、同意或權限不清楚時先暫存，不先轉傳。']],
   refs:[privacy],handoverDeathContext:previous};
 }
 if(previous?.choice&&/^協會交接補充:/.test(t)){
  const uncertain=/原因還沒確認/.test(t);
  if(uncertain||/是辭任/.test(t)){
   return {direct:true,category:'人民團體交接｜證書與公章先保管',title:uncertain?'出缺原因還沒確認：先保管，不先交件':'確定是辭任：先確認辭職是否生效、誰能接收',
    summary:'原先提到的證書和公章可以先列清單保管。'+(uncertain?'出缺原因不明，不能當作已過世或已辭職，也不先交給任何一位理事使用。':'依人民團體選舉罷免辦法第27條，理事長辭職以書面提出並經理事會決議准辭；先確認有無決議與出缺日期。'),
    steps:[['核對誰能接收','查章程、理事會決議與主管機關可確認的資料，再移交給有權接收者並留清單。確認是任期中出缺，依同辦法第17條，原則自出缺日起一個月內補選。若理事長剩餘任期不足六個月，可於出缺起一個月內依章程或由常務理事互推代理；未設常務理事的，由理事互推。']],
    refs:[election,law('人民團體選舉罷免辦法','D0050093',27)],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
  }
 }
 const ambiguous=/前任.{0,3}(?:走了|不在了)|理事長.{0,3}(?:走了|不在了)/.test(t)&&!death.test(t)&&!/辭職|辭任|離職/.test(t);
 if(!office.test(t)||!handover.test(t)||(!death.test(t)&&!ambiguous)||disputed.test(t)&&!ambiguous)return null;
 if(ambiguous){
  return {direct:true,category:'人民團體交接｜先確認出缺原因',title:'先確認前任是過世還是辭任',
   summary:'先把確定屬於團體的物品和會務文件列清單、妥善保管；先別交給身分未確認的人，也不要逕用舊印。兩種情況的出缺與交接處理不同。',
   choiceHeading:'前任目前是哪種情況？',choices:[
    {label:'確定已過世',question:'一般協會前任理事長確定過世，尚不清楚接任者，原先提到的證書和公章怎麼交接？'},
    {label:'是辭任，不是過世',question:'協會交接補充：前任是辭任，證書和公章要交給誰？'},
    {label:'出缺原因還沒確認',question:'協會交接補充：出缺原因還沒確認，證書和公章先怎麼處理？'}
   ],refs:[election,meeting],handoverDeathContext:{choice:true}};
 }
 const mid=/(?:不是|並非|沒有|未曾)整屆|補選|任期中|出缺/.test(t)&&!/已整屆改選|整屆理監事已改選/.test(t);
 const full=!mid&&/整屆|每屆|全屆|下屆|十五日|15日|15天|監交人/.test(t);
 const pending=/還沒.{0,7}(?:產生|確認|選出|就任)|尚未.{0,7}(?:產生|確認|選出|就任)|未選出|沒有.{0,6}人接|誰能接|接任者不明/.test(t);
 const personal=data.test(t);
 const seal=/公章|圖記|印信|舊章|印鑑|原章|銀行|存[摺折]|印章|立案證書/.test(t);
 const steps=[
  ['先盤點，再核對接收人','家屬若保管立案證書、圖記、存摺、帳冊、會議紀錄、未完成案件或其他會務資料，可先分開整理及留清單。只處理能確認屬於團體的項目；交給已核實具接收權限的人，逐項點收留存收據。缺件記「待查」或「未移交」，不要簽成已全數點交。'],
  ...(full?[['整屆改選的十五日','人民團體會務輔導辦法第18條：整屆理監事改選，自新任理事長就任起，由新任理事長與監交人於十五日內接收。監交人是新任監事會召集人（常務監事）或由新任監事互推。缺件可列在清冊，並向原主管機關確認如何處理，不等於已交接。屆期仍未完成可依法報請註銷並重發立案證書；第18條亦規定原備查圖記失效，不宜逕用舊印。']]:[
   ['先確認接任權限與是否任期中出缺','如果是任期中出缺，依人民團體選舉罷免辦法第17條，原則自出缺起一個月內補選。若理事長剩餘任期不足六個月，可於出缺起一個月內依章程或由常務理事互推代理；未設常務理事的，由理事互推。這和第18條整屆改選後十五日接收不同。依章程、決議及主管機關可核對的資料確認誰有權代理、召集或接收。'+(pending?' 新任還沒確認時，可先妥善保管，不能只因對方是理事就直接交付或讓他使用。':' 任期中已補選，不表示新任能直接使用遺失或未確認效力的舊印。')]
  ]),
  ...(seal?[['圖記或證書找不到，另外處理金融機構留印','向原主管機關說明遺失或未交接的情況，確認圖記、證書後續處理。涉及銀行留存印鑑、存摺或帳戶時，只有確認代表權和帳戶歸屬後才由有權人依原金融機構規定辦理。不要用舊章代簽、提款或交出私人帳戶資料。']]:[]),
  ...(personal?[['只移交必要的團體資料，不交整支私人手機','若只有照片、志工或會員個資，先確認用途、權限及必要資料範圍，能合法交付才用安全方式交付必要檔案。私人手機、帳號、密碼、私人照片及不相關的個資不在一般交接範圍；不要把完整資料貼到群組或送給無權的人。']]:[])
 ];
 return {direct:true,category:'人民團體交接｜理事長過世',title:'理事長過世：家屬不自動接任，團體物品要交給有權接收的人',
  summary:'家屬不會因親屬或繼承身分就成為理事長、代理人或監交人；協會的證書、圖記和會務資料也不是因為放在家裡就成了遺產。'+(full?' 若是整屆改選，自新任就任起按十五日交接；資料不齊就據實列缺件。':pending?' 接任人未確認，先清點保管，不交給任一理事或擅用印信。':' 若是任期中出缺，先分清補選、合法接收與圖記處理。'),
  steps,refs:[meeting,election,civil,...(personal?[privacy]:[])],questionState:{focus:'compound'},handoverDeathContext:{active:true},
  actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationDeceasedHandover=route;
})(typeof window!=='undefined'?window:globalThis);
