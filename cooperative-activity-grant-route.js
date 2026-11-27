(function(root){
'use strict';
const refs=[
 {title:'屏東縣政府對民間團體補助經費作業要點第2、3、5、6、7點',source:'https://ptc.familyedu.moe.gov.tw/fileRename.aspx?fid=40994&kid=2&site_id=19&uid=3454'},
 {title:'行政院公報：114年4月18日修正內政部合作事業補助作業要點第2、4至8點',source:'https://gazette.nat.gov.tw/EG_FileManager/eguploadpub/eg031070/ch02/type2/gov10/num3/Eg.htm'}
];
const local=['屏東縣府的一般或社會處活動補助：先看該案列的申請對象','縣府通案要點第2點定義民間團體範圍，第3點允許依補助性質有個別規範，第5點列部分可補助活動及用途。合作社是依合作社法成立，不會因為和協會一起辦活動或辦在社區，就自動成為某個限立案社會團體計畫的合格申請人。看到公告明列合作社、或原補助機關確認涵蓋，才按該計畫備件，不拿協會資格掛名代領。'];
const central=['另有現行合作事業補助，不是套協會活動經費','內政部合作事業補助作業要點第2點明列合作社等對象，第5點有合作教育、研討、宣導、示範觀摩及政策性補助等。依第7點，縣（市）級合作社向所在地縣政府提出，由縣府審核後將合規申請送內政部核辦；全國級及省級合作社向內政部提出。這是中央配合地方核轉的方案，不代表同時符合屏東縣社會團體活動經費。'];
const eligibility=['中央方案先查第4點補助要件','先核對近一年無違反勞動法令受裁罰、已依法選任理監事及召開法定會議，相關紀錄與年度決算已依規定報送。業務須正常、社員權益淨值不得為負數；另核對當年考核規定及新社等例外。這是中央合作事業方案的門檻，不把相同條件直接套到屏東的其他計畫。'];
const file=['先拿計畫名稱，核對申請期與附件','一般性合作事業補助以每年六月底前申請為原則，當年度是否受理、額度及政策性專案依公告與機關確認。第8點列計畫書、登記證明、相關會議紀錄等；合作教育、研討或宣導再附課程表。請詢問屏東縣政府的合作事業承辦或該補助公告所列窗口。若不清楚要哪一案，只要說計畫名稱、年度和活動型態，不上傳具名文件到聊天。'];
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
if(typeof module!=='undefined'&&module.exports){module.exports={activityGrant};return;}
root.verifiedCooperativeActivityGrant=activityGrant;
})(typeof window!=='undefined'?window:globalThis);
