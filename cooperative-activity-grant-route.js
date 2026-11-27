(function(root){
'use strict';
const refs=[
 {title:'屏東縣政府對民間團體補助經費作業要點第2、3、5、6、7點',source:'https://ptc.familyedu.moe.gov.tw/fileRename.aspx?fid=40994&kid=2&site_id=19&uid=3454'},
 {title:'行政院公報：115年3月25日修正內政部合作事業補助作業要點第2、4、5、10點與第8點附件一',source:'https://gazette.nat.gov.tw/EG_FileManager/eguploadpub/eg032053/ch02/type2/gov10/num2/Eg.pdf'},
 {title:'行政院公報：第7、8點之申請程序與附件（114年4月18日修正）',source:'https://gazette.nat.gov.tw/EG_FileManager/eguploadpub/eg031070/ch02/type2/gov10/num3/Eg.htm'}
];
const local=['屏東縣府的一般或社會處活動補助：先看該案列的申請對象','縣府通案要點第2點定義民間團體範圍，第3點允許依補助性質有個別規範，第5點列部分可補助活動及用途。合作社是依合作社法成立，不會因為和協會一起辦活動或辦在社區，就自動成為某個限立案社會團體計畫的合格申請人。看到公告明列合作社、或原補助機關確認涵蓋，才按該計畫備件，不拿協會資格掛名代領。'];
const central=['另有現行合作事業補助，不是套協會活動經費','內政部合作事業補助作業要點第2點明列合作社等對象，第5點有合作教育、研討、宣導、示範觀摩及政策性補助等。依第7點，縣（市）級合作社向所在地縣政府提出，由縣府審核後將合規申請送內政部核辦；全國級及省級合作社向內政部提出。這是中央配合地方核轉的方案，不代表同時符合屏東縣社會團體活動經費。'];
const eligibility=['中央方案先查第4點補助要件','先核對近一年無違反勞動法令受裁罰、已依法選任理監事及召開法定會議，相關紀錄與年度決算已依規定報送。業務須正常、社員權益淨值不得為負數；無本部補助尚未核銷、有最近三年內指派人員參加合作教育訓練的紀錄，並核對稽查與考核條件；一般須達乙等、示範觀摩須達甲等，新社等有明定例外。這是中央合作事業方案的門檻，不把相同條件直接套到屏東的其他計畫。'];
const file=['先拿計畫名稱，核對申請期與附件','一般性合作事業補助以每年六月底前申請為原則，當年度是否受理、額度及政策性專案依公告與機關確認。第8點列計畫書、登記證明、相關會議紀錄等；合作教育、研討或宣導再附課程表。請詢問屏東縣政府的合作事業承辦或該補助公告所列窗口。若不清楚要哪一案，只要說計畫名稱、年度和活動型態，不上傳具名文件到聊天。'];
const giftRef={title:'民法第412條：附負擔贈與',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=B0000001&flno=412'};
const funded=['內政部合作事業補助：按核定項目、期間及進度執行','設備款不能自行挪去發社員福利。依115年3月25日修正的要點第10點，確需變更時，說明理由並向內政部申請，取得同意後才按變更內容支用。未經同意變更不予核銷，並停止補助一年；這不是所有機關或所有私人資助案都共用的處分。'];
const localUse=['其他政府方案：看自己的核定函、經費表與補助機關規定','未確認補助來源前，先不要支出，也不能只憑社員大會或理事會同意就變更。向原補助機關確認能否變更及程序；已誤支則先停止續支、保留帳目和憑證，請原補助機關指示如何更正，不以原項目掩蓋。'];
const gift=['企業指定用途出資：先確認捐贈或契約條件','企業資助可能是有條件的捐贈，也可能依契約或合作方案給付，不能只靠口頭名稱判斷。若屬附負擔贈與，未履行約定負擔，依民法第412條，贈與人可以請求履行或撤銷贈與；先核對原約定，確需變更先取得企業書面同意，不能逕用於社員福利。'];
function changeGrant(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>245||!/合作社/.test(t)||!/補助|補貼|企業資助/.test(t)||!/挪(?:用|去|嗎|到)?|移作|改(?:用|做|買|成|作)|變更.{0,5}(?:用途|項目|計畫)|調整.{0,5}(?:用途|項目|計畫)|不同用途|換.{0,6}(?:支出|項目|買)|拿去.{0,9}(?:福利|津貼|聚餐)/.test(t)||/信用合作社|信合社|不是合作社/.test(t))return null;
 const central=/內政部合作事業補助|確定是.{0,5}內政部/.test(t);
 const other=/確定是.{0,7}(?:其他政府|縣府|縣政府)|縣府核定|縣政府核定/.test(t);
 const privateOnly=/確定是.{0,8}(?:企業|公司)(?:指定用途的?)?(?:資助|捐款|捐贈|補助)/.test(t);
 const compare=/兩筆|兩種|有一筆.{0,25}另一筆/.test(t)&&/企業|公司|捐/.test(t);
 const choices=[
  {label:'內政部合作事業補助',question:'合作社確定是內政部合作事業補助，設備款可以挪作社員福利嗎？'},
  {label:'縣府或其他政府方案',question:'合作社確定是其他政府補助，設備款可以挪作社員福利嗎？'},
  {label:'企業指定用途資助',question:'合作社確定是企業指定用途資助，不是政府補助，設備款可以挪作社員福利嗎？'}
 ];
 return {direct:true,category:'合作事業｜補助款用途變更',title:'設備補助不能自行挪為社員福利',summary:compare?'政府補助和企業指定捐贈是兩筆錢，帳務及用途不能混在一起，各按核定文件或原約定處理。':privateOnly?'既然是企業指定用途資助，先核對原約定並取得同意；不套用內政部補助的核銷或停補規定。':central?'內政部核定的設備補助不得自行移作社員福利，須先申請變更並取得同意。':other?'先依原核定用途執行。要改用途，須依原補助機關的規定先確認並辦理變更，不直接套用內政部方案的處分。':'先不要挪用。請看核定函或資助約定，分清是政府核定補助，還是企業指定用途的資助；不能把設備補助當無條件捐款。',steps:compare?[central?funded:localUse,gift]:privateOnly?[gift]:central?[funded]:other?[localUse]:[funded,localUse,gift],refs:compare?[...refs,giftRef]:privateOnly?[giftRef]:central?refs.slice(1):other?[]:[refs[1],giftRef],questionState:{focus:'compound'},...(!compare&&!central&&!other&&!privateOnly?{choiceHeading:'這筆錢是哪一種？',choices}:{})};
}
function activityGrant(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>230||!/合作社/.test(t)||(!/活動補助|活動經費|社會團體.{0,9}補助|縣府.{0,8}補助|合作事業補助/.test(t)&&!(/補助/.test(t)&&/社會團體|協會|縣府|屏東|合作事業/.test(t)))||!/申請|資格|可以拿|能不能拿|一樣|補助對象|哪裡送|直接拿/.test(t)||/信合社|信用合作社|貸款|利息補助|志工保險|捐款|勸募|核銷/.test(t))return null;
 const unsure=/不確定|不清楚|不知道|還沒確認/.test(t)&&/哪個單位|哪一個單位|哪一項|哪個計畫|什麼計畫/.test(t);
 const localOnly=/確定是.{0,6}(?:社會處|縣政府).{0,8}活動補助/.test(t);
 const centralOnly=/明確問.{0,6}合作事業補助|確定是.{0,6}合作事業補助/.test(t);
 const choices=[
  {label:'屏東縣社會處的活動補助',question:'一般合作社要申請，確定是縣政府社會處活動補助，跟協會資格一樣嗎？'},
  {label:'內政部合作事業補助',question:'縣級合作社要申請，明確問內政部合作事業補助，哪裡送？'}
 ];
 return {direct:true,category:'合作事業｜活動補助資格及窗口',title:'合作社的活動補助，不等同協會補助',summary:unsure?'先不要用合作社或協會名義送件。兩團體合辦不能自動借用對方資格，先確認補助機關、計畫全名及誰可以當申請人。':'屏東縣社會處某項活動經費是否受理合作社，要看該計畫公告，不能直接套協會資格。一般合作社可以另查內政部合作事業補助；縣級合作社向縣府申請，由縣府審核合規後送內政部核辦。',steps:localOnly?[local,file]:centralOnly?[central,eligibility,file]:[local,central,eligibility,file],refs,questionState:{focus:'compound'},...(unsure?{choiceHeading:'您要問哪種補助？',choices}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={activityGrant,changeGrant};return;}
root.verifiedCooperativeActivityGrant=activityGrant;
root.verifiedCooperativeGrantChange=changeGrant;
})(typeof window!=='undefined'?window:globalThis);
