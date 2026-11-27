(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const county={title:'屏東縣政府對民間團體補助經費作業要點（第2至8、10點）',source:'https://ptc.familyedu.moe.gov.tw/fileRename.aspx?fid=40994&kid=2&site_id=19&uid=3454'};
const announcement={title:'屏東縣政府教育處115年度公告與申請、核銷表件（專案範例）',source:'https://portal.ptc.edu.tw/bulletin/view.php?sn=B114003910'};
const fin=n=>law('社會團體財務處理辦法','D0050097',n), events=n=>law('人民團體選舉罷免辦法','D0050093',n);
const minute=law('人民團體會務輔導辦法','D0020094',12);
const general={direct:true,questionState:{focus:'compound'}};
const sign=['協會是申請人，理事長是代表或聯絡人','屬屏東縣政府的民間團體活動補助時，依第2點與第6點用有資格團體的全名提出申請函、計畫書、經費概算與聲明書。理事長有權時可代表協會簽章，或在表格填代表人；這不是用他個人名義領補助。第4點也不以該項團體補助贊助個人舉辦的活動。'];
const receipt=['領款收據與帳戶，不改成代表人的私人款項','依第8點保留核定文件影本、領款收據、支用明細及憑證；收據應能對應核定的受補助團體。縣府通案要點未統一列出匯款帳戶欄位；但依社會團體財務處理辦法第16條，團體財務收入不得存放於個人。應用團體帳戶並依該案核定函及撥款文件核對戶名、附件；不可因尚未開戶就自行改用理事長私人帳戶。'];
const minutes=['先分理事會／監事會和會員大會','依人民團體會務輔導辦法第12條，理事會、監事會或聯席會議的紀錄通常由團體留存供會員查閱；有依法須報核的決議才另附相關文件送件。會員（代表）大會會議紀錄則須在閉會後30日內報主管機關備查。已逾期先確認原應報文件並儘速補報。'];
const financial=['補助是在申請，還是已經核定？','屏東縣通案要點第5點第3款列財務資料未依規定陳報、一年未開會（社）員大會等為不予補助事由。「有開、但漏報大會紀錄」不等同一年沒開；也不能把一份應自存的理監事會紀錄當作漏報財務。若漏的是應報的預決算，或專案要求特定會議證明，會影響資格審查；先向原承辦核對與補件。'];
const already=['已核定不是一律取消，也不是一定不受影響','先看核定函、各補助方案的條件與原機關審查。通案第8點另規定核銷資料與期限，逾當年度不辦理規定的核銷，才有該點所定的經費註銷及不保留效果；第10點是發現補助經費運用等違規時的處理。不能光因少一份紀錄就判已核定補助必然取消或必然撥款。'];
const elections=['法規規定須確定選務人員，但不能讀成候選人一定可以或一定禁止','人民團體選舉罷免辦法第8條要求辦理選舉前確定監票、發票、唱票、記票等人員；第9、10、13條等分別規範秩序、選票認定及驗簽。這些條文未直接寫候選人一律不得兼任，不能把公職選舉的規定套過來；仍要查章程、選務規則與主管機關對該案的要求。'];
const safeguard=['實務上應避開同一職務的當次候選人','為免自己監看、認定或計算自己的票而產生爭議，建議依議事或選務程序，改由沒有直接利害關係的人員執行並記在紀錄；這是程序建議，不是逕稱國家法律一律禁止。若已開完，保留會議、名單及選票等資料，向原主管機關確認，不直接認定整次選舉無效。'];
const objection=['已出席且發覺選務程序違規時，向團體提出異議','依人民團體選舉罷免辦法第25條，出席參加選舉或罷免的會員（代表）發現違反法令、章程或團體自訂規則，可當場向主席或主持人反映，或在結果宣布之日起十五日內向團體提出書面異議。團體收到異議書後十五日內須查明並書面回復；仍有爭議可依法向法院提起訴訟。兩個十五日起算不同；不因候選人兼監票就自動認定整次無效。'];
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>260||/合作社|社員|工會|公會|工業會|股東|管委會|政黨|公職選舉|里長選舉|里長候選人|縣長|議員/.test(t))return null;
 const elected=/候選人|參選人|被選舉人|有參選|有參加選舉|自己有選/.test(t)&&/監票|唱票|記票|計票|發票員|選務人員/.test(t)&&/選理事|選監事|會員大會|協會|社會團體|人民團體|理事.{0,7}候選人|監事.{0,7}候選人|候選人.{0,6}(?:理事|監事)/.test(t);
 const actualObjection=elected&&/已經選完|剛選完|選完|開票後|結果.{0,6}(?:公告|公布|宣布)|投票結束|當天有出席|出席當天|選後|已投票/.test(t)&&/異議|申訴|爭議|違反|違規|是否合法|算有效|期限|多久/.test(t);
 const absent=actualObjection&&/沒出席|沒有出席|未出席|沒到場|不在場|沒參加/.test(t)&&!/雖沒親自出席|有依法委託/.test(t);
 const voting=elected?{...general,category:'人民團體選務｜候選人兼任選務',title:actualObjection?'已選完且懷疑選務違規：看十五日異議期限':'候選人兼任監票，先查選務規則，建議另找無利害關係人',summary:(absent?'第25條這個十五日異議程序列明對象是出席參加選舉或罷免的會員（代表）。如果您沒有出席，不能逕把自己當成同條的出席異議人；先查當天名冊、是否有合法代理，以及章程或其他反映與救濟途徑。':actualObjection?'出席者若發現選務違反法令或章程等規定，可當場提出，或自結果宣布之日起十五日內向團體提出書面異議；團體自收件後十五日內書面回覆。':'一般協會的現行選罷辦法沒有在相關條文明定候選人一律不得監票。為避免爭議，建議候選人不要負責自己參選項目的監票、唱票或記票；這不等同一律違法。若章程、選務規則或主管機關另有要求，仍依其辦理。'),steps:actualObjection?[objection,elections]:[elections,safeguard],refs:[events(8),events(9),events(10),events(13),...(actualObjection?[events(25)]:[])]}:null;
 if(!/補助/.test(t)||/中央補助|外縣市|其他縣|台北市|高雄市|臺東縣/.test(t))return voting;
 const countyScope=/屏東|屏縣|縣府|縣政府/.test(t);
 const org=/協會|社會團體|民間團體|理監事|理事會|監事會|理事長/.test(t);
 if(!org)return voting;
 const application=/個人名義|個人帳戶|個人戶頭|私人帳戶|理事長.{0,6}(?:名字|名義|帳戶|戶頭)|負責人.{0,6}(?:名字|名義|帳戶)|以個人.{0,6}(?:申請|領)/.test(t)&&/申請|撥款|領款|收據|請領|領|匯/.test(t);
 const report=/會議紀錄|大會紀錄|會務資料|預決算|財務資料|收支報表/.test(t)&&/漏報|沒報|未報|還沒報|不報|報不齊|未陳報|不備查|忘了報|補報|有無報送|報送/.test(t)&&/取消|核銷|撥款|不能|不予|申請|影響|補助.{0,6}(?:能|被|會)/.test(t);
 if(!application&&!report)return voting;
 const qualify=countyScope?'適用屏東縣民間團體通案補助時，':'若您問的是屏東縣適用通案要點的民間團體補助，';
 const as=qualify+'用協會全名申請；理事長可以依法代表團體簽章，不能把自己當受補助人或用私人帳戶當團體帳戶。';
 const rs=qualify+'理監事會紀錄通常自存，大會紀錄須在閉會後30日內備查。是否影響補助，還要分未報的是會議紀錄或法定財務資料，以及補助是否已核定。';
 const funding={...general,category:'屏東民間團體｜補助與會務',title:application&&report?'申請人、領款與會務報送分開看':application?'用協會名義申請，不用理事長個人名義領補助':'漏報何種資料，與補助能否撥款分開看',summary:application&&report?as+' '+rs:application?as:rs,steps:[...(application?[sign,receipt]:[]),...(report?[minutes,financial,already]:[])],refs:[county,...(application?[fin(16),announcement]:[]),...(report?[minute,fin(11)]:[])]};
 if(!voting)return funding;
 const order=t.search(/補助/) < t.search(/監票|唱票|記票|計票|發票員|選務人員/);
 return {...funding,title:'選務人員與縣府補助，分開回答',summary:order?funding.summary+' '+voting.summary:voting.summary+' '+funding.summary,steps:order?[...funding.steps,...voting.steps]:[...voting.steps,...funding.steps],refs:[...funding.refs,...voting.refs]};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationCountyFundingElection=route;
})(typeof window!=='undefined'?window:globalThis);
