(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const p=n=>law('人民團體法','D0050091',n);
const f=n=>law('社會團體財務處理辦法','D0050097',n);
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>240||!/協會|社會團體/.test(t)||!/決算/.test(t)||!/會費/.test(t)||!/調整|改|調漲|漲|調降|提高|減收|新會費/.test(t)||!/大會|議案|議程|一起討論|一起表決/.test(t)||/合作社|基金會|董事會|公會|工會|農會|漁會|公務人員協會|退費|補差額|追繳|決算短絀|解散/.test(t))return null;
 const own=/(?:今年度?|本年度?|當年度?)(?:的)?(?:收支)?決算|決算.{0,7}(?:算|是|屬於)(?:今年度?|本年度?|當年度?)/.test(t)&&!/(?:去年|去年度|上年度?)(?:的)?(?:收支)?決算/.test(t);
 const dec=/12月|十二月|年底|年末/.test(t);
 const decision=own&&dec?'一般協會會計年度到12月31日止。若會議開在年度結束前，手上的收支只能是截至某日的報告，不能當全年決算通過；就算在年度最後一天，也要等年度結束及帳務、審核程序完成。':'先確認決算是哪個年度。只有該會計年度終了、帳務結清並完成審核，才是可提報大會的年度決算，不要把當年度尚未結束的收支當作全年決算。';
 return{direct:true,category:'人民團體財務與會務｜決算和會費',title:'年度決算與調整會費，建議分列議案',
 summary:'兩件事的依據和程序不同，建議分列、各自表決並記錄。如果兩案均已依程序備妥，可以排在同一場依法召集的大會。'+(own&&dec?' 12月開會時，不要把未結帳的今年收支當成全年決算。':''),
 steps:[['年度決算：先確認年度和審核',decision+' 理事會於年度終了後三個月內編造年度工作及會計報告；決算先送監事會審核並附結果，再依法提大會通過及報主管機關。'],['調整會費：確認章程、擬議數額與生效年度','把舊／新費額、繳法、生效時點寫清楚。依人民團體法第33條及社會團體財務處理辦法第14條，會費標準與繳法要訂入章程，經會員（代表）大會通過並報主管機關核備後才實施。若要改章程，依第27條重大決議門檻辦理。'],['議程、通知和紀錄分清楚','建議在開會通知的議程中分列「年度決算審議」與「調整會費／相關章程修正」，會議紀錄各自記載結論及表決。並非一律不能同場，也不要把兩案綁成一次表決而看不出各案是否依法通過。']],
 refs:[f(10),f(11),f(14),p(26),p(27),p(33),p(34),law('人民團體會務輔導辦法','D0020094',10)],questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationYearEndDuesAgenda=route;
})(typeof window!=='undefined'?window:globalThis);
