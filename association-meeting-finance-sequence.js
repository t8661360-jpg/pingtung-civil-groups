(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const p=n=>law('人民團體法','D0050091',n);
const g=n=>law('人民團體會務輔導辦法','D0020094',n);
const f=n=>law('社會團體財務處理辦法','D0050097',n);
const county={title:'屏東縣民間團體補助作業要點第5、8點（115年度公告附件）',source:'https://portal.ptc.edu.tw/bulletin/attachment.php?a_sn=33872&b_sn=B114003910'};
const term={title:'內政部：理監事任期變更在改選年或非改選年的適用屆次',source:'https://www.moi.gov.tw/News_toggle3.aspx?PageSize=200&_CSN=1633&n=8361&page=1&sms=9015'};
const delay={title:'內政部：定期大會延期仍適用會前通知期限',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=220065'};
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>240||!/協會|社會團體/.test(t)||/合作社|公會|工會|農會|漁會|財團法人|公司|獎勵金|會址|罷免|除名|公益勸募|清算|法院/.test(t))return null;
 const amended=/任期/.test(t)&&/理事長|理監事/.test(t)&&/改(?:了|成|為|變)|改理事長任期|修改|修正|修章|變更/.test(t);
 const missing=/漏(?:報|送)|忘.{0,5}(?:報|送)|還沒報|未報|沒有報|還沒核備/.test(t);
 const delayed=/大會.{0,10}(?:延期|延後|改期)|(?:延期|延後|改期).{0,10}大會/.test(t);
 const audit=/決算.{0,15}(?:還沒|沒給|未|沒經).{0,12}審|監事會.{0,12}(?:沒審|未審|還沒審)/.test(t);
 const subsidy=/補助/.test(t)&&/撥|核定|核准|申請|撤銷/.test(t);
 if(!amended||!missing||!delayed||!audit||!subsidy)return null;
 const noElection=/沒有改選|沒改選|非改選年|不是改選年|任期中途/.test(t);
 const elected=!noElection&&/這次有改選|同次.{0,4}改選|在改選年|已辦理改選/.test(t);
 const approved=/已(?:經)?核定|已(?:經)?核准|補助款.{0,5}(?:等著撥|待撥|等撥)/.test(t)&&!/尚未核定|未核准|沒核定/.test(t);
 const sent=/通知.{0,5}(?:已寄|已發)|已.{0,3}(?:寄|發).{0,4}(?:通知|公文)|原通知寄了/.test(t);
 const file=['先補報章程，同時核對適用屆次','準備大會決議、修正條文與對照表，向原立案主管機關確認逾期補報；人民團體法第54條是章程異動後30日內核備，不是只送大會紀錄。'+(noElection?'您已說沒有改選：依內政部一般說明，非改選年的任期變更原則自次屆適用，不直接延長或縮短當屆。':elected?'若確在改選年依法修章，原則適用同次改選產生的新一屆，不追溯到上一屆。':'若不是改選年，原則自次屆；若同次依法改選，原則看該次改選產生的新一屆。')+'另核對章程與修正決議，任期長度也不等於連任次數。'];
 const accounts=['監事會先審決算，再安排大會表決','人民團體法第34條要求先送監事會審核，將結果提報會員（代表）大會。依社會團體財務處理辦法第11條，因故未能如期開大會，可先按理事會及監事會或聯席會程序處理，但仍須由大會追認後再報主管機關，不能把未審或只經會議初步處理的決算當成已完成。'];
 const meeting=['核對章程及年度義務，再確認新會期','定期大會依第25條每年一次，延期不是免開，也不必等章程補件辦完才準備。確認新日期後，原則於新會期15日前通知應出席者，並報請主管機關派員列席。'+(sent?'已發舊通知要更正並重新通知應出席者；已報送舊日期的，向原受理窗口更正。':'如果舊通知或列席資料已送出，用確定後的新日期更正並保留紀錄。')];
 const grant=['補助也可同步查，不把申請限制當核准款已取消',approved?'如補助已核定正在等撥，先向該補助承辦核對核定函、撥款條件、補正期限及缺件；不能只因延期或決算待審就認定一定能撥或一定撤回。適用屏東通案要點時，第5點的一年未開大會、財務資料未依規定陳報等是申請審查事由；第8點的核銷文件也不是每案現階段的撥款清單。':'若尚在申請，適用屏東通案要點時，一年未開大會或財務資料未依規定陳報可能影響資格；若已核定待撥，另按該案核定函確認條件及期限，不能用申請資格直接判定撥款結果。'];
 return {direct:true,category:'協會｜會議、決算與補助進度',title:'先補章程、送監事會審決算；延期與補助並行確認',
  summary:(noElection?'既然這次沒有改選，新任期原則自次屆起。':'新任期先核對這次是否同時改選。')+'補報章程與向補助承辦確認可同時做；決算先由監事會審，大會日期確定後另辦通知，不必等所有文件都補完才聯絡。',
  steps:[file,accounts,meeting,grant],refs:[p(20),p(25),p(26),p(34),p(54),g(10),f(11),term,delay,county],questionState:{focus:'compound'}};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationMeetingFinanceSequence=route;
})(typeof window!=='undefined'?window:globalThis);
