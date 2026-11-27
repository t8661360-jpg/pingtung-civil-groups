(function(root){
'use strict';
function law(name,code,n){return {title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n};}
function associationWagesAndSigning(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>185||/信用合作社|信合社|合作社|公會|工會|基金會|農會|漁會|解散|清算|資遣費|退休金|薪資扣繳|所得稅/.test(t))return null;
 const named=/協會|社會團體|社區發展協會/.test(t);
 const chair=/理事長|副會長/.test(t), staff=/總幹事|秘書長|幹事|受僱|工作人員|聘僱|員工/.test(t);
 const nonAssociation=/不是(?:協會|社團|社會團體).{0,14}(?:公司|企業|商店)/.test(t);
 if(!named&&!(chair&&staff))return null;
 const anyWage=/薪水|薪資|工資|發薪|給薪|領薪|欠薪/.test(t);
 const unpaid=/欠薪|欠我.{0,12}(?:薪水|薪資|工資)|拖欠|積欠|延發|延後.{0,8}(?:發薪|薪水|薪資)|(?:沒|未|不)發|發不出|不給|沒給|沒收到|不簽|拒簽|等補助|暫停|逾期|未付|到期|時間到了|日子到了|不肯匯/.test(t);
 const signing=/(?:代|替|幫忙)簽|代用印|用印|領款憑證|印鑑|簽核權|代蓋章|代領款/.test(t);
 if(!anyWage||(!unpaid&&!signing))return null;
 if(nonAssociation){
  if(!unpaid||signing)return null;
  return {direct:true,category:'業務分流',title:'公司積欠薪水：找工作所在地的勞工主管機關',
   summary:'您問的是公司員工欠薪，不是協會會務。可向工作所在地的勞工局（處）申請勞資爭議調解，也可撥勞動部1955諮詢或申訴。',
   steps:[['先保留工作與欠薪證明','保留聘僱約定、薪資明細、出勤與付款紀錄，列出應給付日和欠薪月份。'+(/高雄/.test(t)?'若工作地在高雄，向高雄市政府勞工局洽詢。':'按實際工作地選相應的地方勞工主管機關。')]],
   refs:[law('勞動基準法','N0030001',22),law('勞資爭議處理法','N0020007',9),{title:'勞動部：發生勞資爭議怎麼辦',source:'https://www.mol.gov.tw/1607/28690/89680/'}]};
 }

 if(!signing&&!unpaid&&/補助|核銷/.test(t))return null;
 if(/誤餐費|交通費/.test(t)&&/志工/.test(t)&&!/受僱|聘僱|勞動契約|員工/.test(t))return null;
 const volunteer=/^.{0,65}(?:志工|志願服務|無給職)/.test(t)&&!/不是志工|非志工/.test(t);
 const away=/人在國外|出國|不在|請假|休假|出差/.test(t)&&!/拒簽|不肯|不願|故意|不簽字/.test(t);
 const countyMention=/屏東/.test(t),elsewhere=/台北|臺北|新北|桃園|台中|臺中|台南|臺南|高雄|基隆|新竹|宜蘭|花蓮|台東|臺東|苗栗|彰化|南投|雲林|嘉義|澎湖|金門|連江/.test(t)&&!countyMention;
 const pay=['薪資不能因為等補助就不發','若屬聘僱關係且工資已到約定給付日，協會是雇主。依勞動基準法第22、23條，工資原則全額直接給付勞工，依約定或法定週期按時發給並提供明細；如法令或勞雇雙方另有有效約定，依其規定，不是雇主可片面改期。補助未入帳或理事長尚未簽核，不會免除協會的給薪義務。是否能用某項補助支應，是另一件事，另核該案核定函。'];
 const authority=['副理事長不會因職稱自動有代簽權','先分清是內部薪資單簽核，還是從協會帳戶提用存款。後者依社會團體財務處理辦法第17條，團體負責人、秘書長或總幹事及財務人員須在領款憑證共同蓋章。要核對章程、代理或授權的有效文件，以及金融機構留存的印鑑與權限，不能只憑職稱代簽或代蓋。'+(away?'理事長暫時不在，不等於出缺。':'理事長仍在任卻不願簽，也不等於出缺，不適用缺額補選規則。')];
 const work=['先確認是否為受僱工作','職稱叫總幹事或志工，不能單獨決定是否屬勞動契約。請看實際工作分派、監督指揮、給付與約定；單純志願服務的費用補助不能直接當工資，若有實際受僱的疑問，可請勞工主管機關協助判斷。'];
 const help=['員工可怎麼處理','先保留聘僱或工作約定、薪資單、出勤紀錄、約定發薪日、匯款紀錄及對話，並可書面向協會請求給付。可撥勞動部1955諮詢或申訴，或向工作所在地的勞工行政主管機關申請勞資爭議調解。'+(elsewhere?'若工作地在其他縣市，請找當地勞工局（處）。':'工作地在屏東，可洽屏東縣政府勞動暨青年發展處，08-7558048 轉305或310。')+'不必等內部代簽問題先處理完才能詢問。請勿把薪資單或個人資料貼在聊天框。'];
 const finance=n=>law('社會團體財務處理辦法','D0050097',n),labor=n=>law('勞動基準法','N0030001',n);
 return {direct:true,category:'人民團體會務說明',questionState:{focus:'compound'},title:signing?'協會發薪與副理事長代簽是兩件事':'協會欠薪：工資和補助款是兩件事',
 summary:signing?'副理事長不能只憑職稱代簽，須查有效授權及金融機構留存資料；若是受僱員工的工資已到期，協會仍有按時發薪義務。':volunteer?'先確認是否有聘僱關係；如屬受僱且工資已到期，不能以等補助為由拖欠薪資。':'受僱員工的工資已到期，協會不能以等補助或尚未簽核為由拖欠薪資。可向工作所在地的勞工主管機關申請調解，也可撥1955。',
 steps:[...(signing?[authority]:[]),...(volunteer?[work]:[]),pay,help],
 refs:[...(signing?[finance(17)]:[]),labor(22),labor(23),labor(74),law('社會團體工作人員管理辦法','D0050096',7),law('勞資爭議處理法','N0020007',9),{title:'勞動部：發生勞資爭議怎麼辦',source:'https://www.mol.gov.tw/1607/28690/89680/'},...(elsewhere?[]:[{title:'屏東縣政府勞動暨青年發展處：勞資爭議調解',source:'https://www.pthg.gov.tw/planlab/ServicePage_1_3_5.html'}])]};
}
if(typeof module!=='undefined'&&module.exports){module.exports={associationWagesAndSigning};return;}
root.verifiedAssociationWagesAnswer=associationWagesAndSigning;
})(typeof window!=='undefined'?window:globalThis);
