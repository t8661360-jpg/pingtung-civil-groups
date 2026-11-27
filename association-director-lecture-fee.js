(function(root){
'use strict';
const law=(title,code,n)=>({title:title+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const sfaa={title:'衛福部社家署115年11月12日社家老字第1150860661號函（據點與巷弄長照站）',source:'https://ws.yunlin.gov.tw/001/Upload/414/relfile/0/18801/0ecae9a9-93e9-4c3e-b02a-e522bf53590f.pdf'};
const pthg={title:'屏東縣政府對民間團體補助經費作業要點',source:'https://ptc.familyedu.moe.gov.tw/fileRename.aspx?fid=40994&kid=2&site_id=19&uid=3454'};
const board=['理監事本職是無給職', '開理監事會、執行章程或大會決議、監察或審議財務，不能領固定薪水或酬勞。依《社會團體財務處理辦法》第19條，確有執行職務需要時，得參照政府標準酌發出席費，或憑交通票證酌發交通費。兩者不是固定薪津，也不等於補助一定核銷。'];
const teaching=['確實授課，才檢查講座鐘點費','社家署社家老字第1150860661號函指，該類計畫的講座鐘點費是實際授課、演講或實習指導的費用。理監事確有授課且符合獎補助規定時可請領；已領專業服務費的專職人員不得重複請領。還要核對核定項目、內外聘認定、時數與計畫上限，不是只要有理監事身分就能領或一律不能領。'];
const staff=['值班、行政或例行協助不是授課','不能把值班或行政換成講師鐘點費。社會團體不得聘任選任理監事為辦理會務、業務的工作人員，不會因改名為講師、顧問或按小時計費就改變實質。'];
const shift=['這類據點或巷弄長照站：不能另外申領臨時工資','依社家署該函及所引長照基金規定，受獎助單位人員不得支領臨時工資，理監事在這類據點或巷弄長照站不能申領臨時工資。值班如果沒有授課，也不能列成講師費。'];
const privateFee=['自籌經費：先區分實際授課與理監事本職','不能用自籌款支付理監事本職薪酬，也不能聘任選任理監事辦理會務、業務。若是與本職不同的實際授課，應看章程、預算、決議及服務的真實性；不能用據點補助函代替一般協會個案判斷，也不把「以自籌款支付」當成自動核准。'];
const regularGrant=['其他補助：照該計畫與核定函', '以屏東縣一般民間團體補助為例，符合團體宗旨的研習等活動可列鐘點費；不是每一位理監事都符合，不得把工作津貼、值班或理監事例行會議改列講師費。依核定函、當年度計畫、補助機關與內外聘標準個別確認，勿拿別縣市上限套用。'];
const records=['核銷前查核三件事','對照核定函、課程表與實際師資時數，再備領據等計畫要求憑證；領款者宜揭露身分，避免參與自己的費用審核。沒有實際授課不能用補寫或借名掩蓋，已錯列可保留原始紀錄並向原核定機關詢問更正。不要在聊天框貼個資或領據。'];
function directorLecture(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>220||/工會|合作社|基金會|農會|漁會|同業公會/.test(t))return null;
 const station=/照顧關懷據點|社區據點|關懷據點|巷弄(?:長照)?站|長照(?:C|Ｃ)?據點|長照站/i.test(t);
 const role=/理監事|理事長|監事|理事(?!會)/.test(t);
 const org=station||/協會|社團|社會團體|人民團體/.test(t);
 const lecture=/鐘點|講師|講座|授課|教課|上.{0,8}課|演講|實習指導/.test(t);
 const pay=/領|請款|支付|支領|給|發|報(?:帳|支)|核銷|費|工資|薪|聘/.test(t);
 const duty=/臨時工資|值班|排班|例行|固定.{0,6}(?:費|領|薪)|掛名|開會|會務|行政/.test(t);
 if(!org||!role||!pay||(!lecture&&!(station&&duty)))return null;
 if(!station&&/欠薪|拖欠|勞資爭議|薪資代簽/.test(t)&&!/鐘點費|講師費/.test(t))return null;
 const negativeLesson=/沒(?:有)?(?:真的|實際)?(?:上課|授課|教課|開課)|(?:並未|未實際|不曾)(?:授課|上課|教課)|只是.{0,10}值班|沒有上台|掛名|借名|借別人/.test(t);
 const hasSeparateTeaching=t.split(/[。；;，,、?!？]/).some(c=>!/沒|未|不曾|掛名|借名/.test(c)&&/實際(?:有|去|會)?(?:授課|上課|教課|演講)|真的.{0,9}(?:授課|教課|上.{0,7}課)|(?:上午|下午|早上|晚上|當天).{0,7}(?:已|有|要)?(?:授課|上.{0,7}課|教課|演講)/.test(c));
 const noLesson=negativeLesson&&!hasSeparateTeaching;
 const self=/自籌|自有(?:經費|款)|自己出錢|會費出|無補助|沒申請補助/.test(t);
 const general=/縣府一般補助|一般民間團體補助|一般補助|屏東縣政府對民間團體補助/.test(t);
 const qualified=/領.{0,8}專業服務費|有.{0,8}專業服務費|專業服務費.{0,8}再領|專職.{0,10}再領/.test(t)&&!/沒(?:有)?領.{0,4}專業服務費|未領.{0,4}專業服務費/.test(t);
 const obvious=station||self||general||noLesson;
 const steps=noLesson?[staff,...(station?[shift]:[]),board,records]:station?[...(lecture?[teaching]:[]),...(duty?[shift]:[]),board,records]:[board,...(self?[privateFee]:general?[regularGrant]:[privateFee,regularGrant]),records];
 const choiceItems=obvious?[]:[
 {label:'協會用自籌經費',question:'協會理事真的授課，協會可用自籌款支付講師費嗎？'},
 {label:'屏東縣一般補助',question:'屏東縣一般民間團體補助研習，協會理事實際授課可核銷鐘點費嗎？'},
 {label:'關懷據點或巷弄長照站',question:'協會理監事在社區照顧關懷據點或巷弄長照站，實際授課可領講座鐘點費嗎？例行值班可領臨時工資嗎？'}
 ];
 const summary=noLesson?'不能。沒有實際授課，不能把值班、行政或掛名列為講師鐘點費核銷。':station?(qualified?'領專業服務費的專職人員，不得重複請領講座鐘點費；這類計畫的受獎助單位理監事也不能另領臨時工資。':lecture?(duty?'分兩件事：實際授課符合核定計畫、且沒有重複支領時可領講座鐘點費；值班不能列為授課，也不能另領這類計畫的臨時工資。':'依社家署函，理監事確實授課且符合此計畫的經費規定時可請領；已領專業服務費的專職人員不能重複請領。'):'社家署函指出，這類計畫的理監事不能請領臨時工資。不能改列成未實際授課的講師費。'):'理監事本職無給，不能用講師費名義發固定報酬。確實授課則是另一件事，能否支付要看實際工作、經費來源及適用規定。';
 return {direct:true,category:'社會團體｜理監事與鐘點費業務分流',title:noLesson?'沒有實際授課，不能核銷講師鐘點費':station?'關懷據點與巷弄長照站：真正授課和值班費分開':'協會理事授課：與理監事本職報酬分開',summary,steps,questionState:{focus:'compound'},refs:[law('人民團體法','D0050091',21),law('社會團體財務處理辦法','D0050097',19),law('社會團體財務處理辦法','D0050097',20),law('社會團體工作人員管理辦法','D0050096',2),law('社會團體工作人員管理辦法','D0050096',4),...(station?[sfaa]:self?[]:[pthg])],...(choiceItems.length?{choiceHeading:'這筆鐘點費要用哪種經費？',choices:choiceItems}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={directorLecture};return;}
root.verifiedAssociationDirectorLectureFee=directorLecture;
})(typeof window!=='undefined'?window:globalThis);
