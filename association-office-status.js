(function(root){
'use strict';
function law(name,code,n){return {title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n};}
function officeStatus(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>180||!/理事長|理監事|理事.{0,8}(?:被|涉嫌)|監事.{0,8}(?:被|涉嫌)/.test(t))return null;
 if(/合作社|社員|信合社|工會|職業公會|商業公會|同業公會|農會|漁會|公司|基金會|管委會|校長|公務員/.test(t))return null;
 const alleged=/起訴|未判|沒判|被告|一審|二審|有罪判決|判決確定|判刑|侵占|侵佔|涉刑案|法院裁定/.test(t);
 const status=/續任|繼續當|還能當|繼續擔任|還能擔任|能不能當|還可以當|解任|停職|停權|拔掉|換人|要下台|職務|取消.{0,4}資格|發起人資格|直接適用/.test(t);
 if(!alleged||!status)return null;
 if(/(?:我要|想|如何)成立.{0,10}協會|發起人資格.{0,6}(?:有何|有哪些)/.test(t)&&!/現任|續任|還能繼續|直接適用/.test(t))return null;
 const notFinal=/未.{0,4}判決|沒.{0,4}判決|沒判刑|尚未確定|還沒確定|未確定|未定讞|尚未定讞|還沒定讞|仍在上訴|判了.{0,3}還能上訴|還在上訴/.test(t);
 const final=!notFinal&&/判決(?:已|業已)?確定|判刑(?:已)?確定|有罪確定|判刑定讞|判決定讞/.test(t);
 const before=/還沒起訴|尚未起訴|未被起訴|沒起訴|還在偵查|只有人提告|被告還沒有起訴/.test(t);
 const unproven=before||notFinal||(/起訴|被告|涉嫌|一審|二審/.test(t)&&!final);
 const audit=/監事會.{0,10}查|查帳|帳務|侵占|侵佔|款項|財務|挪用/.test(t);
 const people=n=>law('人民團體法','D0050091',n);
 const appoint={title:'內政部台內社字第0970158909號：理事長刑事判決確定的資格疑義',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256667&sms=12360'};
 const stage=before?'只被提告或仍在偵查':unproven?'被起訴或判決尚未確定':'有刑案或判決';
 return {direct:true,category:'人民團體會務說明',questionState:{focus:'compound'},
 title:final?'判決確定也不直接套發起人限制，續任要核對個案':stage+'：不會僅因此自動停職或解任',
 summary:final?'《人民團體法》第8條是成立團體時發起人的限制，不能直接套到現任理事長；是否影響續任，要查章程、會籍、有無處分及具體事實。':stage+'，不等於有罪確定；在一般協會，光憑這一點不會自動停職、解任或必須換人。若有已生效的處分、法院裁定或依法有效的章程程序，須另行確認。'+(audit?'監事會仍可依職權查帳。':''),
 steps:[
  ['案件階段與團體職務分開','依刑事訴訟法第154條，有罪確定前推定無罪。人民團體法第23條列理事、監事喪失會籍、辭職經決議、被罷免或撤免，以及受停權處分逾半任期等解任事由，沒有把提告或起訴列為當然解任，也沒有單憑起訴一律停職的規定。'],
  ['發起人限制不能直接套到理事長','內政部台內社字第0970158909號函說明，人民團體法第8條第2項是籌組時發起人的資格限制；理事長資格沒有明文直接適用。即使有罪確定，也要看是否實際影響執行職務或團體名譽信用，再依會籍、章程、人民團體法第14、15、23條等法定程序判斷，而非自動失去職位。'],
  ['要停職或解除職務，先查權限與程序','請核對團體章程、是否已有具體裁定或處分，以及哪個職位被處理。若有執行職務違法等具體事實，可依法查核第22條及相應的罷免程序；第58條是主管機關對違法、違章程或妨害公益的個案權限，不是理事會只憑起訴就能停職。請保存正式書面資料、避免對外散布未證實指控。'],
  ...(audit?[['監事會不必等刑事判決確定才查帳','依社會團體財務處理辦法第22條，財務查核由監事會辦理，必要時可召開臨時監事會查核。保留帳簿、憑證及會議紀錄，依法在團體內查核或提主管機關，不把查核結果當刑事定罪，也不要把個資或案情貼到公開聊天區。']]:[])
 ],refs:[law('刑事訴訟法','C0010001',154),people(8),people(22),people(23),people(58),appoint,...(audit?[law('社會團體財務處理辦法','D0050097',22),law('人民團體會務輔導辦法','D0020094',17)]:[])]};
}
if(typeof module!=='undefined'&&module.exports){module.exports={officeStatus};return;}
root.verifiedAssociationOfficeStatus=officeStatus;
})(typeof window!=='undefined'?window:globalThis);
