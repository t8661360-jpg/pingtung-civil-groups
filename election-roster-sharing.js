(function(root){
'use strict';
const ref=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const el=n=>ref('人民團體選舉罷免辦法','D0050093',n), co=n=>ref('合作社選舉罷免辦法','D0050022',n), pd=n=>ref('個人資料保護法','I0050021',n);
const gd=ref('人民團體會務輔導辦法','D0020094',10);
const pdpc={title:'個人資料保護委員會籌備處：現行第12條與修正生效狀態',source:'https://www.pdpc.gov.tw/News_Html/100/'};
const moj={title:'法務部：人民團體名冊利用的章程、目的與必要範圍',source:'https://mojlaw.moj.gov.tw/LawContentExShow.aspx?etype=etype5&id=FE281211&type=E'};
const moi={title:'內政部：主管機關收受資料與對外提供不同',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256715'};
function route(q){
 const raw=String(q??'').trim(),t=raw.normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>470||/信用合作社|信合社|保險合作社|商業同業公會|職業公會|工會|農會|漁會|政黨|公益勸募|捐款人|低收入戶/.test(t))return null;
 if(/公職|選舉委員會|立委選舉|縣長選舉|村里長候選|村長選舉|議員選舉/.test(t)&&!/不是公職|非公職/.test(t))return null;
 const roster=/名冊|名簿|簽到表|聯絡簿|全員簽名|選舉.{0,12}名單|選舉想.{0,10}名單|社員名單/.test(t);
 const filing=/主管機關.{0,14}(?:通知|只要|報|送|要求)|縣府.{0,12}(?:補報|要求|收)|送.{0,5}(?:主管機關|縣府)|當選.{0,5}簡歷|報備|核備/.test(t);
 const internal=/閱覽|查閱|核對|辦公室.{0,5}看|現場看|讓會員看/.test(t);
 const candidate=/候選人|群發工具|拉票|舊聯絡簿/.test(t);
 const distribute=/公開|讓大家看|下載|上網|網路|網站|網頁|LINE|轉傳|翻拍|拍照|影印|整份|電子檔/.test(t);
 const expires=/退會|刪除|刪掉|不想再收|不同意|退出|留多久|保存期限/.test(t);
 const exposed=/流出|外流|洩漏|泄漏|被傳出去|個資外洩/.test(t);
 const correction=/更正|有錯|是否正確|改正|寫信|抄錯/.test(t);
 const id=/身分證|身份證|證號|簽名|電話|手機|地址|個資/.test(t);
 const scope=/協會|合作社|人民團體|社會團體|社團法人|理事長|這一社|社員|當選.{0,5}簡歷/.test(t);
 /* 理解把關 2026-11-28：問退會後大會出席人數怎麼算，不是名冊對外分享 */
 if(/出席人數|應出席|成會|法定人數/.test(t)&&!distribute&&!exposed)return null;
 /* 交叉第35輪：候選人能不能當選舉大會主席，不是名冊分享 */
 if(/主席|主持/.test(t)&&!roster&&!distribute&&!exposed)return null;
 if(!scope||!(roster||(filing&&id)||(candidate&&/選舉|換屆/.test(t)))||!(distribute||filing||candidate||expires||exposed||correction)||/過世|死亡|遺產/.test(t))return null;
 if(!/選舉|投票|大會|改選|換屆|會員|社員|名冊/.test(t)&&!filing)return null;
 const inline=/補充[：:]是(?:一般)?(協會|合作社)/.exec(raw);
 const tagged=/；團體確認：/.test(raw)||!!inline;
 const ambiguous=!tagged&&(/不知道.{0,12}(?:協會|合作社)|不懂.{0,10}協會.{0,12}合作社|不確定.{0,14}(?:哪一種|協會|合作社)/.test(t));
 const coop=tagged?(/團體確認:一般合作社/.test(t)||inline?.[1]==='合作社'):/合作社|社員/.test(t)&&!/不是(?:一般)?合作社|非合作社/.test(t)&&(!/協會/.test(t)||/跟協會|與協會|比協會|不是(?:一般)?協會/.test(t));
 const common={direct:true,questionState:{focus:'compound',domain:'election-roster-sharing'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 if(ambiguous)return {...common,category:'名冊｜先確認團體',title:'先分協會與合作社名冊，再確認誰要查閱',summary:'名冊閱覽、送主管機關和向全網公開不一樣。先不要公開證號、身分證照片或完整名冊。',steps:[['先留住已知條件','選擇團體後，可再分是本人核對、會員選舉查閱，還是送主管機關。']],needsRosterFacts:true,choiceHeading:'要查的是哪一類團體？',choices:[
 {label:'一般協會的名冊',question:raw+'；團體確認：一般協會。'},{label:'一般合作社的名冊',question:raw+'；團體確認：一般合作社。'}
 ]};
 if(coop)return {...common,category:'合作社｜選舉公告與社籍更正',title:'合作社選舉名冊公告，不等於公開所有電話與證號',summary:'一般合作社的選舉名冊依法公告十五日，不是照協會會員閱覽的相同規則；不用因此在網路公開全體社員的身分證號、電話或證件照片。',steps:[
  ['合作社的公告與更正程序','依合作社選舉罷免辦法第12條，理事會通過合格社員、出社社員及準社員名冊及候選人登記日期、方法後，應於投票日六十日前公告，公告十五日並報主管機關備查。對社籍有異議者，可以於公告期間內以書面向合作社請求更正。'],
  ['更正只提供必要資料','寫明合作社、該次選舉、本人身分可供核對的方法、哪欄錯誤及正確內容。按合作社正式受理程序交最少且必要的佐證；不把身分證照片公開附在公告，也不要把整份名冊或證號、電話、地址當網路下載附件。確切表件若未公告，先向合作社確認。'],
  ['協會規則不同','協會選理監事通常依人民團體選舉罷免辦法第5條於會議十五日前審定資格、造具名冊供會員閱覽；不能用這條替代合作社公告、備查和更正。']
 ],refs:[co(12),el(5),pd(5),pd(19),pd(20)]};
 const steps=[],refs=[el(5),gd,pd(5),pd(19),pd(20)];
 steps.push(['提供會員查閱是義務，不等於每人可帶走一份',
   '一般協會理事、監事或會員代表選舉、罷免，理事會在會議十五日前審定資格，名冊列姓名、聯絡電話、地址及選舉權等必要註記，提供會員合理可及的閱覽。會員大會應出席名冊另有會務輔導辦法第10條，列權利義務受限制情形。法律要求提供閱覽，不等於允許對整份拍照、轉傳、下載；可在辦公室或適當管道核對身分、提供實際可使用的閱覽。'+(correction||/自己的/.test(t)?' 本人要查自己留的電話、地址或請求更正，另可依個資法第10、11條辦理，和要求全員檔案是兩件事。':'')]);
 if(candidate){steps.push(['候選人需要聯繫，不代表可拿全員電子檔','先確認是協會內部選務、章程與原蒐集特定目的是否涵蓋及有無法律依據，並限真正必要及適用對象。閱覽權不會自動變成候選人取得完整電話地址、私下拉票或匯入私人群發工具的權利。未確認前不要複製或匯出聯絡簿；可依公開一致的選務規則評估由協會代轉選務訊息，避免直接給整份資料。']);refs.push(moj);}
 if(filing){steps.push(['送主管機關：按正式來文的文件及最少欄位','改選結果或當選人簡歷、實際簽到表與供會員查閱的選舉名冊不是同一份。若主管機關只要當選簡歷，就按正式方式交所要求的文件；不要為了保險多附全員簽名、手機、身分證字號或證件影本。若來文確實要求另附名冊或簽到表，先核對各欄位與傳送管道並妥善保管；收到資料不等於可公開。']);refs.push(ref('人民團體法','D0050091',54),moi);}
 if(distribute||candidate)steps.push(['LINE 群組、可轉傳連結與公開網站不是法定閱覽','無法確保接收人、轉傳與下載範圍的 LINE 群組或連結，不適合放整份會員名冊或簽到表；不要在公開網站開放下載姓名、電話、地址、簽名或證號。若只是說明成會與出席，可用不辨識個人的人數，或會員驗證後限閱覽必要欄位。不要把資料貼給小屏或未確認的外部服務。']);
 if(expires){steps.push(['退會、拒絕使用與刪除：依紀錄目的分開','依個資法第11條，原目的消失或期限過後，原則刪除或停止處理利用；履行法令或業務確有必要等例外要逐筆確認。歷史簽到、合法選舉原始紀錄不要為退會直接改寫；調整現行選舉或會籍名冊。需要保存舊資料，不表示可以繼續向退會者寄活動通知或給候選人，無獨立依據就停止使用。']);refs.push(pd(11));}
 if(exposed){steps.push(['已流出：先關掉能繼續傳送的管道','撤下公開檔案、停用連結、收回可撤回權限；留必要的事故證據，查明哪些資料、期間及對象受影響，並請已收到者停止轉傳。依現行個資法第12條，若違反個資法致洩漏，查明後適當通知當事人；是否另需通報依適用的業別及當時生效法令確認，不在群組公開整份名冊當作通知。']);refs.push(pd(12),pdpc);}
 if(correction||/自己的/.test(t))refs.push(pd(10),pd(11));
 return {...common,category:'協會｜選舉名冊閱覽與個資',title:'協會名冊：分開看會員查閱、報送與對外分享',summary:exposed?'先停止外流。是否要讓會員核對名冊、報主管機關、提供候選人或公開下載，是四種不同用途。':expires?'退會不代表所有歷史紀錄都要抹除；保留必要資料，也不代表可以繼續拿來寄活動通知。':'會員要能查閱選舉名冊，但不因此可以拍照、取走全員檔案、放 LINE 或公開網站。',steps,refs:[...new Map(refs.map(x=>[x.title,x])).values()]};
}
function follow(q){const t=String(q??'');return t.length<150&&/^\s*補充[：:]/.test(t)&&/協會內部|合作社|閱覽|名冊|候選人/.test(t)&&!/另問|換一題|新問題/.test(t);}
if(typeof module!=='undefined'&&module.exports){module.exports={route,follow};return;}
root.verifiedElectionRosterSharing=route;
root.isElectionRosterSharingFactReply=follow;
})(typeof window!=='undefined'?window:globalThis);
