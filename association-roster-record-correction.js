(function(root){
'use strict';
const l=(n,p,x)=>({title:n+'第'+x+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+p+'&flno='+x});
const p=x=>l('人民團體法','D0050091',x),g=x=>l('人民團體會務輔導辦法','D0020094',x),e=x=>l('人民團體選舉罷免辦法','D0050093',x);
const mo={title:'內政部函：團體會員改派代表不得逕接任理監事',source:'https://www.moi.gov.tw/News_Content.aspx?Create=1&n=14119&s=256716'};
const types=['大會與理事會的報備不同','會員（代表）大會會議紀錄原則在閉會後30日內報主管機關備查；理事會及監事會的紀錄原則自行留存，依法須報的特定決議另行辦理。但兩種類別都必須照實記錄出缺席情形及決議，出席門檻也不能混算。'];
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>230||!/協會|社會團體|人民團體/.test(t)||/合作社|工會|農會|漁會|公司|董事會|公會|公務人員協會|公布完整名冊|上傳會員個資/.test(t))return null;
 const replace=/團體.{0,6}(?:派|改派)|會員代表/.test(t)&&/改派|改推|重新指定|新代表|換代表|換了代表/.test(t)&&/(?:接|繼|遞補|當|接任).{0,6}(?:理事|監事)|(?:理事|監事)職務/.test(t)&&/會議紀錄|人名|紀錄|名冊/.test(t)&&!/出席一次|臨時委託|不是團體會員/.test(t);
 if(replace)return {direct:true,category:'人民團體選務｜改派和會議紀錄',title:'新代表不能直接接理監事，舊會議紀錄不倒填',
  summary:'代表改派與理監事選任是兩件事。新代表不能直接接任；原會議紀錄按當天的實際出席和決議記載，不因事後改派把原人名換成新人。',
  steps:[['確認原任資格何時依法喪失','若原任是按團體會員正式推派的代表資格當選，後來合法改派而喪失該代表資格，依人民團體法第23條及內政部函釋，原任應解任、由候補依次遞補；依選罷辦法第17條，遞補後不足法定人數時辦補選。新代表仍須依選舉程序，不直接取得席次。原人是否另有依法獨立取得的任職資格，按章程、選務資料及主管機關確認。'],['既有紀錄與新異動，各有自己的日期','把團體改派函、生效日及後續遞補或補選記在後續異動文件。原紀錄若當時有誤植，按章程和原受理機關指示作有日期、有依據的更正，保留原件及更正原因；不能把新人寫成當時已出席、當選或簽名。'],types],
  refs:[p(23),p(54),g(12),e(17),mo],questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 const sign=/簽到(?:表|簿)?|報到紀錄|出席名冊/.test(t);
 const recovery=/補送|補件|補簽|補報|補交|可以補|如何補|怎麼補|漏附|漏送|漏檔|搞丟/.test(t);
 const context=/會議|大會|開會|理事會|監事會/.test(t);
 if(!sign||!recovery||!context||/影印|公開|不給看|出售/.test(t))return null;
 const noRecord=/當天未簽|當天沒(?:有)?簽|當天確定沒有簽到|當時沒(?:有)?簽|根本沒.{0,4}(?:簽|記錄)|從沒做簽到|沒有真的簽到/.test(t)&&!/不確定/.test(t);
 const existing=/有原(?:本|始)簽到|當天(?:真的|有|確實有)簽到|原始簽到(?:表|簿).{0,7}(?:漏附|漏寄|沒附)|確有真實簽到/.test(t)&&!/不確定|不知/.test(t);
 const a=existing&&!noRecord,b=noRecord&&!existing;
 const truth=['不能拿後補簽名當成當天出席','依會務輔導辦法第16條出席以簽到或報到計。當天若根本沒有簽到或記錄，不要讓未出席者補簽、代簽或倒填日期。保全當時可驗證的紀錄，請原主管機關確認補正方式；無法證明成會或程序有疑義，不要先認定決議有效，視需要依法重開。'];
 const actual=['有真的原始簽到表，只是漏附','保留原表及送件日期，以原本的資料準備副本或說明，向原受理窗口核對可否補送、需要補什麼、是否有期限。資料補送不等於重製簽到，不能把事後新增的人當成那天出席。'];
 return {direct:true,category:'人民團體會務｜會議紀錄與簽到補正',title:'先分「真的有原表漏送」和「當天沒簽到」',
  summary:a?'有原始簽到表可先問原窗口如何補送，不用把紀錄重做。':b?'沒有當天的真實簽到，不能倒填或代簽。先保全實際紀錄，請承辦核對補正或重開。':'補送既有文件和事後補造簽到不一樣；已報縣府也不能以補簽當成當天出席。',
  steps:[...(a?[actual]:b?[truth]:[actual,truth]),types],refs:[g(12),g(16),p(27),p(29)],questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}],...(!a&&!b?{choiceHeading:'當天有可核對的原始簽到嗎？',choices:[{label:'有原始簽到，只是漏附',question:'協會會員大會原始簽到表漏附，當天確實有簽到，已報縣府後可以補送嗎？'},{label:'當天沒有簽到紀錄',question:'協會會員大會當天確定沒有簽到，已報縣府可補件嗎？若是理事會怎麼做？'}]}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationRosterRecordCorrection=route;
})(typeof window!=='undefined'?window:globalThis);
