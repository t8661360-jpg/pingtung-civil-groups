(function(root){
'use strict';
const law=(title,code)=>({title,source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+code});
const aRefs=[law('人民團體法第27、58、59條：解散決議與法定解散','D0050091'),law('人民團體會務輔導辦法第12、27條：會議紀錄與清算','D0020094'),law('民法第42、57條：法人解散報告與社團總會決議','B0000001')];
const cRefs=[law('合作社法第36、45、55、55-1、57條：會務、解散與登記','D0050112'),law('加值型及非加值型營業稅法第31條：停復業稅籍通報','G0340080'),law('稅籍登記規則第9條：停業期間','G0340087')];
const aTemp=['社區發展協會｜暫停活動不等於解散','暫停某活動、停止承辦補助計畫、暫停全部會務與依法解散不同。若只是暫停一個活動，先核對計畫與核定函是否需要變更或報告；團體仍立案就不能當成已免開會、改選或報表。若會員大會已開，即使只有暫停事項，大會紀錄仍依會務輔導辦法第12條於閉會後30日內報主管機關備查。可先問所在地公所的社區業務窗口，確認屏東縣主管機關的送件方式。'];
const aEnd=['社區發展協會｜確定要終止，就依法辦解散','未辦法人登記的一般協會，依人民團體法第27條召開會員（代表）大會，過半數出席、出席者三分之二以上同意。已辦社團法人登記，還須核對民法第57條的全體社員三分之二以上同意與法院程序，不要直接套出席者的門檻。請依原主管機關規定檢附大會決議及所需文件辦理解散，後續依法清算，不是貼上停辦公告就結束。'];
const cTemp=['一般合作社｜要分登記主管機關與國稅局','暫停實際營業不等於合作社已解散。先向原合作社登記主管機關確認類型、章程、決議、停止哪些業務及需否報備；沒有一項可套所有合作社的縣府停業證。若屬辦有營業稅稅籍的營業人，暫停與復業依營業稅法第31條各於事前向主管稽徵機關申報核備，另依稅籍規則第9條；不是把合作社當公司作停業登記，也不是只報縣府即完成。'];
const cEnd=['一般合作社｜仍存續的會務不能停擺；解散有獨立程序','仍存續原則須依合作社法第36、45條處理財務、法定會議等。連續兩年未開年度社員大會，主管機關通知限期仍不開，可能依第55-1條命令解散。若社員大會依法決議解散，依第55、57條在一個月內向原登記主管機關申請解散登記並附紀錄，並處理清算，不能用稅籍停業代替。'];
function detect(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>260||/信用合作社|信合社|金融機構|公司|行號/.test(t)||!/社區(?:發展)?協會/.test(t)||!/合作社/.test(t))return null;
 const parts=t.split(/[；;。？！?!]+|另外|順便|[，,](?=(?:一般)?(?:合作社|社區))/).filter(Boolean);
 const a=parts.findIndex(x=>/社區(?:發展)?協會/.test(x)&&/停辦|停活動|暫停|解散|終止/.test(x));
 const c=parts.findIndex(x=>/合作社/.test(x)&&/停業|停辦|暫停|解散|歇業/.test(x));
 if(a<0||c<0||a===c)return null;
 const knownA=/只(?:是|想|要)?(?:暫停活動|停一個活動|停部分業務)|已(?:經)?決議(?:正式)?解散|要依法解散/.test(parts[a]);
 const ending=/只(?:是|想|要)?(?:暫停活動|停一個活動|停部分業務)/.test(parts[a])?'temp':/已(?:經)?決議(?:正式)?解散|要依法解散/.test(parts[a])?'end':'';
 const aSteps=ending==='temp'?[aTemp]:ending==='end'?[aEnd]:[aTemp,aEnd];
 const choices=[{label:'只是暫停活動，團體不解散',question:'社區發展協會只是暫停活動不解散，開過會員大會後要報縣府嗎？另外一般合作社暫停營業不解散，要向哪裡報？'},
 {label:'已決議正式解散協會',question:'社區發展協會已決議正式解散，應怎麼報縣府？另外一般合作社暫停營業但不解散，要向哪裡報？'}];
 return {direct:true,category:'跨類團體｜停辦、停業與解散',title:'協會停辦及合作社停業不能用同一份申報',summary:'社區協會若已開會員大會，應報大會紀錄；是否還要報計畫變更或辦解散，要看是停活動還是終止組織。一般合作社暫停營業，先問原登記主管機關；有營業稅稅籍的，另按稅法向國稅局申報，不能把停業當作解散。',steps:a<c?[...aSteps,cTemp,cEnd]:[cTemp,cEnd,...aSteps],refs:[...aRefs,...cRefs],questionState:{focus:'compound'},...(!knownA?{choiceHeading:'您說協會停辦，是哪一種？',choices}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={detect};return;}
root.verifiedCommunityCooperativePause=detect;
})(typeof window!=='undefined'?window:globalThis);
