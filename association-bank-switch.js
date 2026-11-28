(function(root){
'use strict';
const finance={title:'社會團體財務處理辦法第15至17條：準備基金、存放與共同用印',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050097'};
const county={title:'屏東縣政府教育處公告附件：屏東縣政府對民間團體補助經費作業要點',source:'https://portal.ptc.edu.tw/bulletin/view.php?sn=B114003910'};
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>290||/農會本身|漁會本身|信用合作社本身|我們是合作社|我在合作社|本社是合作社|合作社員工|公會|工會|基金會|公司|法院扣押|強制執行|冒領|查封|遺失|被偷|捐款退還/.test(t))return null;
 const institution=/銀行|郵局|金融機構|信用合作社|農會|漁會/.test(t);
 const account=/帳戶|戶頭|存摺|專戶|開戶|關戶|銷戶|印鑑|留印|更印|用印/.test(t);
 if(!/協會|社會團體|社區發展|準備基?金|(?:新任|新)理事長|理事長印鑑/.test(t))return null;
 if(institution&&/銀行資料.{0,6}(?:變更|異動)|變更.{0,6}銀行資料/.test(t)&&!/補助|換銀行|印鑑|代表人|郵局|專戶/.test(t)){
  return {direct:true,category:'人民團體財務｜先確認銀行異動',title:'要換的是銀行、印鑑，還是補助收款帳戶？',
   summary:'先保留原帳戶，確認要變更的項目；三種處理對象不同。',
   choiceHeading:'這次要變更哪個資料？',choices:[
    {label:'更換往來銀行',question:'協會要換銀行帳戶，要理事會決議或報縣府嗎？'},
    {label:'同家銀行更換印鑑',question:'協會同一家銀行只變更理事長印鑑，怎麼做？'},
    {label:'變更補助匯款帳戶',question:'協會原帳戶正在等補助撥款，想用另設的帳戶收款，先找誰確認？'}
   ],refs:[finance]};
 }
 if(!account||!institution&&!/報縣府|補助|換戶|關戶|銷戶/.test(t))return null;
 const noGrant=/沒有(?:用|拿|使用|領|申請)?補助|沒(?:有用|拿|領|申請)補助|無補助|不涉及補助/.test(t);
 const noSwitch=/沒有換銀行|不換銀行|沒換銀行|同家銀行|同一家銀行|同一個銀行/.test(t)&&!/另開|另設|關戶|銷戶/.test(t);
 const seal=noSwitch&&/印鑑|留印|更印|用印/.test(t);
 const switching=!noSwitch&&(/換(?:開戶)?(?:銀行|郵局|金融機構|帳戶|戶頭|專戶)|變更.{0,6}(?:往來銀行|金融機構)|(?:換|移轉).{0,5}專戶|(?:原銀行|原帳戶|原戶|舊戶).{0,5}(?:停掉|關掉|關閉)|關戶|銷戶|(?:郵局|銀行).{0,7}(?:搬|改|轉)(?:去|到|往)?.{0,2}(?:銀行|郵局)|把.{0,7}(?:銀行|郵局|帳戶).{0,5}(?:停掉|關掉)/.test(t));
 const grant=!noGrant&&/補助|核定函|撥款|核銷/.test(t)&&/另開|另設|原帳戶|原戶|指定|關戶|銷戶|報帳|換戶|改戶|新戶/.test(t);
 const reserve=/準備基?金|基金專戶/.test(t);
 const waiting=/尚未就任|還沒就任|未上任|還沒上任|尚未接任|新任未就任/.test(t);
 if(!switching&&!seal&&!grant)return null;
 const base=['先查章程、授權與兩家機構','社會團體財務處理辦法第16條容許使用銀行、農會、漁會、信用合作社及郵局。第16、17條沒有列出一般換銀行一律須經理事會決議或一律報縣府的規定，不表示一定不用。查章程與團體內部授權，向原及新開戶機構確認開戶、移轉或結清須備哪些文件；對報縣府的要求不確定時，向原立案主管機關查明。提用存款時，依第17條由負責人、秘書長或總幹事及財務人員共同蓋章。不要先用私人帳戶過渡。'];
 const preserve=['準備基金仍然要專戶','第15條規定準備基金及孳息應專戶存儲，非經理事會通過不得動支。只換存放機構，與變更用途或拿來支出不同。不要和一般收入併到同一帳戶；先核對基金本金、孳息及新舊戶對帳記錄，依章程和機構文件確認由誰辦理，若有動支先經理事會決議。'];
 const g=['補助款另看核定函，先別停掉原帳戶','核定函或申請資料載明原帳戶，先在改匯或關戶前向給補助的處室確認是否須更改收款資料、何時生效及需哪些表件，並查目前撥款或核銷到哪一步。另開專案戶不會自動更改撥款指示；確認切換完成前保留原帳戶，不把補助匯入個人或準備基金帳戶。'];
 const authority=['先核對理事長就任日期，再辦印鑑或結清','已當選但尚未就任，可以向金融機構問文件或預約，不能用尚未生效的新任名義去關戶、提款或換印鑑。已就任的，依原帳戶金融機構核對代表權和印鑑資料；提用存款仍依第17條共同用印。'];
 return {direct:true,category:'人民團體財務｜團體帳戶與印鑑',title:seal?'只換理事長印鑑：不用當成換銀行':waiting?'新理事長尚未就任，先別用新任名義關戶':switching?'協會換銀行：先分一般帳戶、準備基金與補助':'補助指定原帳戶，先確認改匯再更換',
  summary:seal?'同家銀行的理事長印鑑異動，是確認代表權及更新留存印鑑，不是關閉舊戶。':waiting?'不能只因當選，就由尚未就任的新理事長去關戶。'+(grant?'補助款還在撥付時也不要先關原帳戶。':''):switching?'一般換銀行是否要理事會決議、報縣府，不能一概而論；先看章程、授權及金融機構要求。'+(reserve?'準備基金換到哪家都仍須專戶。':''):'核定函只寫原帳戶時，請先向補助承辦確認，再決定是否改匯或另開專案帳戶。',
  steps:seal?[authority]:[...(waiting?[authority]:[]),...(grant?[g]:[]),...(switching?[base]:[]),...(reserve?[preserve]:[])],
  refs:[finance,...(grant?[county]:[])],questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationBankSwitch=route;
})(typeof window!=='undefined'?window:globalThis);
