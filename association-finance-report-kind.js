(function(root){
'use strict';
const refs=[
 {title:'社會團體財務處理辦法第4、11條：會計年度、編造與報送',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?PCode=D0050097'},
 {title:'人民團體法第34條：監事會審核決算',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0050091&flno=34'},
 {title:'人民團體會務輔導辦法第18條：屆期改選交接',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0020094&flno=18'}
];
const annual=['上年度決算：採上一會計年度完整曆年','一般協會會計年度為1月1日至12月31日。若本次要補的是上年度決算，不是填今年期中，也不隨大會何時開而改變。若縣府追補的是更早的年度，依來文所列年度填完整曆年，不把它擅自換成去年。'];
const review=['先編造、再審核及報備，不等於三月底一律交縣府','依第11條，理事會於會計年度終了後三個月內編造上年度工作報告及會計報告；年度決算先由監事會審核，再提大會，通過後報備。因故大會不能如期開，可以先由理事會及監事會或理監事聯席會議通過，再提大會追認，之後報主管機關備查。縣府來文的補件期限與應補表件以來文或原發文承辦確認為準。'];
const interim=['期中、專案或特定期間：照來文涵蓋的範圍','期中收支不是年度決算。若要求當年度累計，通常是該年1月1日起到指定日；若要求單月、季報或其他起訖，照指定的日期填。不以會議當天、當月月底或前月底自動推定。'];
const handover=['改選交接：以交接清冊、帳簿及通知核對','整屆改選前應備妥前後任交接清冊，包括財務等資料；新任理事長就任後會同監交人於15日內接收。交接用的結算範圍應依核定或約定的交接基準、帳簿與來文核對；不能當作正式年度決算來填。'];
const askIssuer=['通知不清楚：核對四個欄位再填','看來文或附件：是上年度決算、期中收支還是交接資料？要求哪一年、起訖到哪一天、補交期限何時？若沒寫，向原發文承辦確認。只要說表名和所問日期，不要把含個資的公文、帳冊或證件上傳到聊天中。'];
const choices=[
 {label:'上年度決算',question:'協會補件的會計報告，確定是上年度決算，要填哪一段期間？'},
 {label:'期中收支',question:'協會補件的會計報告，確定是期中收支，期間怎麼填？'},
 {label:'改選交接',question:'協會補件的會計報告，確定是改選交接，要填哪一段期間？'},
 {label:'通知仍看不出種類',question:'協會補件的會計報告，通知仍看不出種類，可以先填今年嗎？'}
];
const tpl={direct:true,category:'社會團體財務報表｜期間辨識',questionState:{focus:'compound'}};
function financeReportKind(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>230||!/財務(?:報告|報表|資料)|財報|會計(?:報告|報表)|收支(?:報告|報表)|決算/.test(t)||!/協會|社會團體|團體財務|我們的團體/.test(t)||/合作社|社員|工會|公會|農會|漁會|財團法人|公司|基金會|國際性|補助|核銷|勸募|報稅|所得稅|解散/.test(t))return null;
 const notice=/縣府|來文|公文|通知|補件|補正|要求補|要補|請補|會議還沒排|會議還沒定|大會來不及|大會未能如期/.test(t);
 const period=/期間|起訖|哪一年|哪年度|時段|填今年|填去年|截止|截至|算到|做到|哪一段|哪一期|先填/.test(t);
 if(!notice||!period)return null;
 const cutoff=t.match(/(?:截至|截止(?:到|日為)?)(?:本年度|當年|今年|去年|(?:民國)?\d{2,4}年)?(?:\d{1,2}|[一二三四五六七八九十]{1,2})月(?:(?:\d{1,2}|[一二三四五六七八九十]{1,3})[日號]|底)?/)?.[0];
 const still=choices[3].question===q;
 const maybe=/不確定|看不出|看不懂|分不清|不知道.{0,12}(?:類|哪一|去年|今年|期中)|沒寫.{0,6}(?:類|報表|期間)|沒說.{0,6}(?:類|報表|期間)/.test(t)&&!/(?<!不)確定是/.test(t);
 if(still||maybe)return {...tpl,title:'先辨報告種類，再填期間',summary:'先不要直接填今年或猜截止日。縣府要補的可能是年度決算、期中收支或改選交接，三者期間不同。',steps:[askIssuer,annual,interim],refs:refs.slice(0,2),...(!still?{choiceHeading:'通知寫的是哪一種？',choices:cutoff?choices.map((c,i)=>i===1?{...c,question:'協會補件的會計報告，確定是期中收支，通知寫'+cutoff+'，期間怎麼填？'}:c):choices}:{})};
 if(/上年度決算|去年決算|(?:民國)?\d{2,4}年(?:度)?決算/.test(t))return {...tpl,title:'年度決算：填指定會計年度的完整曆年',summary:'以該會計年度的1月1日至12月31日填列。大會尚未排定不會改變會計期間；若來文指定別的年度，按該年度填。',steps:[annual,review],refs:refs.slice(0,2)};
 if(/期中收支|期中(?:財務|報告)|期中.*(?:截至|截止)/.test(t)){
  return {...tpl,title:'期中收支：依指定的起訖填，不套全年',summary:cutoff?'保留來文「'+cutoff+'」的界線，不用改成12月31日。再核對通知是當年度累計還是單月、單季，及所屬年度。':'先核對縣府要求的起訖和年份。期中收支不是年度決算，不用直接填全年。',steps:[interim,...(!cutoff?[askIssuer]:[])],refs:refs.slice(0,2)};
 }
 if(/改選交接|財務交接/.test(t))return {...tpl,title:'改選交接：依交接基準核對範圍',summary:'先確認來文要的是截至哪一天的交接資料，不要直接填今年全年或去年決算。',steps:[handover,askIssuer],refs};
 return null;
}
if(typeof module!=='undefined'&&module.exports){module.exports={financeReportKind};return;}
root.verifiedAssociationFinanceReportKind=financeReportKind;
})(typeof window!=='undefined'?window:globalThis);
