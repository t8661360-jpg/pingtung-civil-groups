(function(root){
'use strict';
const finances={title:'社會團體財務處理辦法第10、11條：年度決算、大會通過與備查',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0050097&flno=11'};
const people={title:'人民團體法第34條：預算、決算、監事審核與大會程序',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0050091&flno=34'};
const county={title:'屏東縣政府對民間團體補助經費作業要點第3、5至8、10、11點',source:'https://portal.ptc.edu.tw/bulletin/attachment.php?a_sn=33872&b_sn=B114003910'};
const letters={title:'內政部：監事核退意見應併提大會審議',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=220166'};
const norm=q=>String(q??'').normalize('NFKC').replace(/\s+/g,'');
const labels={rejected:'大會已開，但決算未通過',notHeld:'大會還沒召開',filed:'大會已通過，已送件等回函',late:'已逾期，尚未報送或正在補報'};
function route(q,prior){
 let raw=String(q??'').trim(),t=norm(raw);
 if(!t||t.length>430||/^(?:新題|另問|另外問)|合作社|社員|公會|工會|農會|漁會|公司|管委會|社區大樓|財團法人|公益勸募/.test(t))return null;
 let selected=t.match(/;決算進度:(rejected|notHeld|filed|late)$/)?.[1];
 if(!selected&&prior&&/^(?:我們|本會)?(?:已經|已|是)?(?:大會沒開|還沒開大會|大會還沒召開|已開但沒通過|大會沒通過|已送件等回函|已送等回函|已逾期補報|逾期沒報|還未到期限)[!?.。]?$/.test(t)){
  selected=/沒開|還沒召開|還沒開/.test(t)?'notHeld':/沒通過/.test(t)?'rejected':/等回函/.test(t)?'filed':/逾期/.test(t)?'late':'notDue';
  raw=prior.raw;
 }
 const b=norm(raw).replace(/;決算進度:[a-z]+$/,'');
 const grantNeg=/(?:沒有|沒有任何|不問|不是問|只問財報.{0,5}不談)(?:縣府|活動)?補助|(?:沒有|沒)(?:申請|要申請)補助/.test(b);
 const grant=/補助|補件.{0,8}核定/.test(b)&&!grantNeg;
 const tellsFinance=/決算|財報|年報|會計報告|財務資料|財務年度|財務報告|結算報送/.test(b);
 const explicitIssue=/不通過|沒通過|未通過|還沒過|還沒經|未經|沒過|否決|駁回|沒有通過|沒辦.{0,6}大會|還沒開|來不及|逾期|未報|沒報|收執|回函|備查函|核備函|報送期限|沒收到|補報|補件|年報年度|哪種年度|是否已送|大會.{0,8}(?:延期|延後|流會)/.test(b);
 const rejection=/大會.{0,12}(?:否決|駁回|退回|票沒過|表決沒過)|(?:已開|有開|開了|召開過|開過).{0,12}(?:大會|會議).{0,10}(?:沒過|未過|沒通過|未通過)|開.{0,8}大會但沒過|決算.{0,8}(?:否決|駁回|票沒過)|(?:大會|會員).{0,8}把決算否決/.test(b);
 if(!selected&&!(tellsFinance&&(grant&&explicitIssue||rejection||grantNeg&&explicitIssue&&/大會/.test(b))))return null;
 const late=/(?:決算|財報|上年度|報送|財務資料).{0,12}(?:已逾期|逾期|補報|補交)|逾期.{0,12}(?:財報|決算|補報)|已補報|過了.{0,6}(?:財報|報送)期限/.test(b);
 const notDue=/(?:還沒到|尚未到|未到|沒到|尚未屆).{0,12}(?:期限|財報|結算)|報送期限.{0,5}(?:還沒到|未到|尚未屆)/.test(b);
 const filed=/(?:已送|送了|送出|已交|已報|已陳報|已寄|送件後|送縣府|縣府已收).{0,20}(?:回函|備查函|核備函|待回|等回|沒收到|未收到)|大會.{0,10}通過.{0,14}(?:已送|送了|已報)/.test(b);
 const notHeld=/大會.{0,8}(?:還沒開|沒開成|不能如期|尚未召開|來不及開|延期|延後|流會)|(?:還沒|未能|沒能|來不及|不能如期)(?:召開|開)[^，,。;]{0,10}大會/.test(b);
 const status=selected||(rejection?'rejected':late&&!notDue?'late':filed?'filed':notDue?'notDue':notHeld?'notHeld':null);
 const grantScope=/中央補助|國家補助|其他縣市|高雄市|臺北市|台北市|社家署補助|文化部補助|內政部補助|衛福部補助|公益彩券盈餘專案/.test(b);
 const out=(title,summary,steps,extra={})=>({direct:true,category:grant?'協會決算｜屏東補助與財務陳報':'社會團體會務｜決算審議',title,summary,steps,refs:[finances,people,...(grant&&!grantScope?[county]:[]),...(status==='rejected'?[letters]:[])],actions:[{label:'聯絡承辦',view:'contact',sub:''}],...extra});
 const ordinary='理事會編造上年度工作報告和會計報告（含決算），年度終了後三個月內辦理；決算先送監事會審核，再連同審核意見提會員（代表）大會，經通過後報主管機關備查。';
 const steps=[];
 if(status==='rejected')steps.push(['大會已開但否決或未通過','先如實記錄表決和原因，理事會補正後送監事會審核，再依章程及會議程序重提大會。' + ordinary+'不能送成「大會已通過」，也不能把只在大會未能如期召開時才可使用的先審追認程序倒過來。']);
 if(status==='notHeld')steps.push(['未如期召開大會時，先審不是正式通過','可先由理事會及監事會，或理監事聯席會議通過，之後仍須大會追認，追認後再報主管機關備查。不要將先審中的報告當成已完成陳報，也不要把已開大會遭否決當成未開。']);
 if(status==='filed')steps.push(['送件已受理但還沒回函，是不同階段','已經過大會並依規定送出時，等待備查回函不等於未陳報。請保留大會紀錄、財務報表與發文或收文憑證，確認該年度已受理且是否需要補正。不能用寄出憑證替代所有補助計畫指定文件。']);
 if(status==='notDue')steps.push(['尚未屆財報期限，不直接算逾期','先核對各案要求的財報年度及補助收件日。財報原期限尚未到，不表示補助承辦一定可以等、也不表示您逾期；有寄件或收文憑證時保留，確認可否先收件、須否補正及最晚日。']);
 if(status==='late')steps.push(['先補報且保存收文，不當成已符合資格','若財務資料確實逾期未依規定陳報，'+(grantScope?'應查本案公告是否影響申請。':'適用屏東通案要點時，是第5點第3款第4目的不予補助情形。')+'補報正在審，不保證能補件、追回本次資格或如期核定。先釐清補報是否已受理、何時完成及申請案採何種截止日。']);
 if(!status)steps.push(['先確認決算的辦理階段',ordinary+'如果還沒有大會決議，不能把理事會或聯席會資料當成大會已通過。']);
 if(!grant)return out(status==='rejected'?'決算遭大會否決：補正後重提，不當作大會沒開':'先核對決算、大會與財務報送','只看會務時，先確認決算是否經大會通過；未通過、尚未開會與已送件待回函，處理方式不同。',steps);
 steps.push(['再看補助規定與送件日',grantScope?'先查這個中央或專案計畫；不要直接套屏東通案要點。本案是否收件和可否補正依其當年度文件與辦理機關。':'若這案適用屏東縣對民間團體通案作業要點，第5點第3款第4目規定「財務資料未依規定陳報」不予補助。各機關仍可依第3點訂審查規範。請用計畫名稱分別核對所要的財報年度、申請附件、回函證明、能否補正及期限，不把所有活動或設備案當成相同。']);
 if(!grantScope&&/設備|器材|兩案|兩項|同時|活動/.test(b))steps.push(['活動與設備要分案查各自用途','通案基本資料包括申請函、申請單位聲明書、實施計畫和經費概算；設備如獲補助，核銷時另查納入團體財產證明。若是同年度同一補助案件，不向縣府不同機關重複申請。']);
 if(!grantScope&&/上次|去年|以前|未結|沒結|核銷.{0,7}(?:逾期|還沒)/.test(b))steps.push(['前案未結與本案補件是兩個問題','先釐清前案的執行及核銷期限；依通案第10點，無正當理由逾越核銷期限得列管並列入下次補助考量，不等於所有未結案一律不予。']);
 if(!grantScope)steps.push(['別把已送申請當成已核定','適用屏東通案時，第7點是審查、簽奉核定後辦理。先辦活動、先買設備或先支付費用，不要自行認定可核銷；如申請期限將到，先用正式公告及承辦說明核對。']);
 const title=status==='rejected'?'決算遭大會否決，不能拿先審版本當作通過':'決算報送與補助申請是兩道程序';
 const summary=status==='filed'?'已通過並按規定送件、等回函，與根本未陳報不同；補助是否需回函或准補件，要看這一個計畫。':status==='late'?'補報不代表立刻恢復本次補助資格；先分清報送進度、前案核銷與本次補助。':status==='notHeld'?'大會還沒開，先審的決算不等於完成陳報；能否申請須另外查本案條件。':status==='rejected'?'有開大會但決算沒過，不可用聯席會先過的版本當成大會通過，也別自行保證補助能受理。':status==='notDue'?'還沒到財報期限，不等於逾期；補助截止日和需要的證明另看當年度公告。':'先看決算是大會沒開、表決未過，還是已送件等回函；只有適用本案規定且完成必要程序，才能確認下一步。';
 return out(title,summary,steps,status?{}:{choiceHeading:'您目前的年度決算進度是？',choices:Object.entries(labels).map(([key,label])=>({label,question:raw+'；決算進度:'+key})),grantFinanceContext:{raw}});
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationGrantFinancialReadiness=route;
})(typeof window!=='undefined'?window:globalThis);
