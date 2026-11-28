(function(root){
'use strict';
const assoc={title:'人民團體會務輔導辦法第12條：會議紀錄留存與查閱',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0020094'};
const fin={title:'社會團體財務處理辦法第20至22條：收支、保存、財務查核',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050097'};
const pd={title:'個人資料保護法第5、19、20條',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=I0050021'};
const gov={title:'政府資訊公開法第3、9至12、18條',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=I0020026'};
const moi={title:'內政部函釋：會議紀錄調閱及主管機關持有文件',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256756'};
const coop={title:'合作社法第35至37、39條：社員及債權人查閱',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050112'};
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>500||/^(?:另問|另外問|新題)|信用合作社|信合社|農會|漁會|工業會|商業公會|工會|管委會|公司股東/.test(t))return null;
 const pick=t.match(/;櫃檯確認資料來源:(minutes|finance|gov)$/)?.[1];
 const b=t.replace(/;櫃檯確認資料來源:[a-z]+$/,'').replace(/(?:不是|並非)(?:在問|要問)?(?:一般)?(?:協會|合作社)(?=[,、;。是而])/g,'');
 const access=/查閱|查查看|調閱|閱覽|想看|想查|要查|能查|可以查|能看|要看|怎麼看|怎麼給|影印|複製|副本|整(?:份|卷)|索取|拍照|貼到|貼網路|看(?:紀錄|記錄|帳冊|書類|社務|財務)|調資料|申請公開/.test(b);
 if(!access&&!pick)return null;
 const social=/協會|社團法人|團體|社會團體|我是.{0,5}會員/.test(b);
 const ordinaryCoop=/合作社|社員|社務/.test(b);
 const government=/縣府|公所|政府|主管機關/.test(b);
 const nonMember=/不是會員|非會員|並非會員|只是(?:社區)?民眾|一般民眾/.test(b);
 const minutes=/(?:會議|大會|理事會|監事會|聯席會).{0,14}(?:紀錄|記錄|原始|檔案)|(?:原始會議|會議紀錄|會議記錄|簽到簿|簽到表)/.test(b);
 const finance=/財務|銀行明細|發票|憑證|員工薪資|報帳|監事報告|帳冊|帳簿|(?:出納|審查)明細|查帳|借款|決算/.test(b);
 const audited=/決算沒照|要向法院|應向法院|異議|申訴|拒絕|沒義務/.test(b);
 const fileGov=government&&/(?:持有|保有|報送|送給|核備|備查|結案報告|成果報告|政府公開|檔案|資訊公開)/.test(b);
 const answer=(title,summary,steps,refs,opts={})=>({direct:true,category:'團體資料｜查閱與個資',title,summary,steps,refs,questionState:{focus:'cross-record-access'},...opts});
 const care=['查閱不是無限制寄送或轉貼','按法定用途與必要範圍保留可查內容；電話、住址、簽名、銀行帳號、受益者或第三人資料，應核對是否必要及資料提供的依據。未確認前，不把原件電郵給無權人，也不把含個資的原件貼到社群；如需副本，優先詢問可否提供適當遮蔽的版本。請不要在這裡貼原件。'];
 const governmentStep=['縣府持有的資料：向持有機關申請','可依政府資訊公開法或檔案法向持有該文件的縣府機關申請，寫明年度、案名和想看的範圍；是否提供、是否有費用及個資遮蔽由機關依法審查。第18條有不予提供或限制的事由；可以分開的，應提供不受限制的部分。縣府有補助不等於掌管協會所有帳戶或原始憑證。'];
 if(ordinaryCoop){
  if(social&&/協會/.test(b))return null;
  if(!/社務|書類|帳|紀錄|憑證|財務|債權/.test(b))return null;
  return answer('合作社社員或債權人，向合作社查法定書類','依合作社法第37條，社員及合作社的債權人可向合作社請求查閱第35、36條書類，不要誤走社員大會投票的委託程序。',[
   ['指出要查的書類和年度','例如章程、社員名簿、社員大會紀錄及依法應備簿冊，或該年度法定業務報告、資產負債表、收支餘絀表、財產目錄及分配／分擔案。身分及範圍由合作社核對，不把查閱權等同任意複製或公開。'],care],[coop,pd]);
 }
 if(!social&&!fileGov&&!pick)return null;
 if(pick==='gov'||nonMember&&fileGov||fileGov&&!minutes&&!finance)return answer('非會員也可向縣府申請它持有的資料，但不等於可查協會的全部帳本','如果您想查的是縣府持有的補助結案報告或已報備資料，向實際持有該資料的機關申請。成為協會會員不是這條途徑的前提。',[governmentStep,care],[gov,moi,pd]);
 if(nonMember&&!fileGov&&!pick)return answer('非會員查資料，要先分文件由誰持有','協會會員依會務輔導辦法第12條查內部紀錄的權利，不會因活動獲縣府補助就自動給一般民眾。若您要的是縣府依法取得的資料，可另向縣府申請。',[governmentStep,care],[assoc,gov,moi,pd]);
 if(!pick&&!minutes&&!finance&&/不確定|查哪|哪些文件|沒說資料/.test(b))return answer('先確認您想查哪一種資料','內部會議紀錄、財務原始憑證，以及縣府持有的資料，規定與窗口不同。',[],[assoc,fin,gov],{choiceHeading:'哪一類是您要查的？',choices:[['我想查協會會議紀錄','minutes'],['我想核對協會財務','finance'],['我想向縣府申請資料','gov']].map(([label,k])=>({label,question:String(q??'')+'；櫃檯確認資料來源:'+k}))});
 if(!minutes&&!finance&&!pick)return null;
 const steps=[];
 if(minutes||pick==='minutes')steps.push(['會員可向協會查四種會議紀錄','依會務輔導辦法第12條，會員（會員代表）可請協會安排查閱大會、理事會、監事會及理監事聯席會議紀錄。先寫明日期和議案。大會紀錄閉會後30日報主管機關備查；理事、監事會等留存團體，除依法須報核的決議，不假定縣府持有。']);
 if(finance||pick==='finance')steps.push(['原始憑證、銀行明細與監事查核是另一條','財務處理辦法第22條的查核由監事會辦理；普通會員可具體列出要核對的款項、年度和理由，依章程向團體請求說明、在適當範圍查看資料，或請監事會依職權查核。不能把會議紀錄查閱權當成可向銀行任意調資料或取得所有原始憑證。']);
 if(minutes||/影印|整份|副本|電郵|代理|代幫|律師|複製/.test(b))steps.push(['影印、拍照、委託他人查或電郵是另一件事','第12條規定提供查閱，沒有一律要求寄送無遮蔽副本。先查有效章程及團體的查閱安排；若由員工、親友或律師代辦，先向協會確認是否接受書面委託、查身分與授權範圍。不能因同意查閱就視為同意公開。']);
 steps.push(care);
 if(government||audited)steps.push(governmentStep);
 if(audited)steps.push(['查資料不代替會務或法院救濟','若團體拒絕法定查閱，先留存書面請求與答覆，可向主管機關反映。若還要爭執決議，另依團體與問題性質確認異議、申訴或民事救濟及其期限；不要等到資料都拿齊才確認期限。']);
 return answer((minutes||pick==='minutes')?'會議紀錄可查閱；取得副本、公開或查帳需另外確認':'會員查財務，先分一般查閱與監事會查核',(minutes||pick==='minutes')?'會員可以向協會查法定會議紀錄，但查閱、委託、拿副本、公開及查看原始帳目不是同一件事。':'先說明要核對的款項、日期和依據；監事會依法查核，不把這個職權當成普通會員可直接取得所有憑證。',steps,[assoc,...(finance||pick==='finance'?[fin]:[]),pd,...(government||audited?[gov,moi]:[])]);
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedRecordAccessTriage=route;
})(typeof window!=='undefined'?window:globalThis);
