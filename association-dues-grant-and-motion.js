(function(root){
'use strict';
const art=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const assoc=n=>art('人民團體法','D0050091',n), fin=n=>art('社會團體財務處理辦法','D0050097',n);
const county={title:'屏東縣民間團體補助經費作業要點第5、8點（縣府115年度公告附件）',source:'https://portal.ptc.edu.tw/bulletin/view.php?sn=B114003910'};
const moi={title:'內政部台內團字第1080022434號函：大會修章臨時動議',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256745'};
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>240||!/協會|社會團體|人民團體|民間團體|本會/.test(t)||/合作社|社員|工會|公會|農會|漁會|公司|股東|基金會|管委會/.test(t))return null;
 const funding=/(?:縣府|屏東|屏縣|縣政府).{0,12}補助/.test(t)&&/會費|自有經費|自籌款|自籌經費|自籌的錢/.test(t)&&/大會|理監事會議|例行會議|例會/.test(t)&&/餐費|便當|場租|茶水|開會費|會議費|場地費/.test(t)&&/能|可以|能否|可否|不行|可不可以/.test(t)&&!/外縣市|其他縣|臺北|台北|新北|桃園|臺中|台中|臺南|台南|高雄|基隆|新竹|嘉義|苗栗|彰化|南投|雲林|宜蘭|花蓮|臺東|台東|澎湖|金門|連江|中央|公益彩券|受限制捐款/.test(t);
 if(funding)return {direct:true,category:'屏東民間團體｜補助與自有經費',title:'縣府補助不能核銷，不等於協會不能用自己的會費',summary:'這兩筆錢要分開。適用屏東通案要點時，會員大會、理監事會議與例行會議的費用不列入補助。協會以未受其他限制的自有會費支付必要會務支出，應符合章程、已通過的預算及內部核銷程序；並非一律不能，也不是可任意支出。',steps:[['補助額度內不能列這筆會議費','縣府要點第5點第2款第6目排除這類會議，第8點按核定項目及憑證核銷；不要將會議餐費或場租改名、混帳或重複報銷。'],['自有資金按預算和會計程序支付','查現行章程、已通過的收支預算及內部權限，確認金額合理、支出真實；尚未編列或超出預算，先依團體程序處理再支出。保留原始憑證並入帳，與補助分列；若用的是指定用途捐款或其他專款，不等同可自由動支的會費。']],refs:[county,fin(5),fin(8),fin(11),fin(20)],questionState:{focus:'compound'}};
 const motion=/臨時動議|臨時提案|會中臨時|現場臨時/.test(t)&&/會員(?:代表)?大會|大會/.test(t)&&/修章|修(?:正|改)章程|改章程|變更章程|章程變更/.test(t)&&/會費/.test(t)&&/調高|提高|調低|調漲|調降|調整|加收|漲|改.{0,4}會費/.test(t)&&!/除名|罷免|不增加會費|不調會費|解散|賣.{0,4}會產|撤銷|訴訟|已經收|退費/.test(t);
 if(!motion)return null;
 return {direct:true,category:'人民團體會務｜議程、修章及會費',title:'修章可提臨時動議；調整會費還有核備程序',summary:'依內政部函釋，章程修正案原通知未列出，並非就不能於合法召集的會員（代表）大會以臨時動議提出。修章與會費可以在同一場大會分別審議，但不是只做一次普通表決或當天就按新費率收費。',steps:[['先確認大會本身已合法召集','原本的開會通知、出席資格和法定人數仍須符合規定。補送章程修正資料，不會使本來不合期限的通知變合法。建議事前把草案、新舊對照及金額說清楚，會議紀錄分列修正條文與會費決議及票數。'],['修章要用特別門檻','人民團體法第27條：會員（代表）過半數出席，章程變更須出席人數三分之二以上同意；通過後依第54條於異動後30日內報主管機關核備。若新費率、標準或繳法和已核備章程不同，不能略過修章。'],['新會費在核備後才能實施','入會費及常年會費的標準、繳納方式應訂在章程；數額、繳納方式經會員（代表）大會通過後，依人民團體法第33條報主管機關核備後才施行。若會費案本身屬影響會員權利義務的重大事項，另核對第27條第6款及章程，不直接假定簡單多數即可。']],refs:[moi,assoc(26),assoc(27),assoc(33),assoc(54),fin(14)],questionState:{focus:'compound'}};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationDuesGrantAndMotion=route;
})(typeof window!=='undefined'?window:globalThis);
