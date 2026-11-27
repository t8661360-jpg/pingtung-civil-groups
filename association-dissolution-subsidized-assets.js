(function(root){
'use strict';
const ref=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const c=n=>ref('民法','B0000001',n);
const county={title:'屏東縣政府對民間團體補助經費作業要點第8點及第8點之一',source:'https://ptc.familyedu.moe.gov.tw/fileRename.aspx?fid=40994&kid=2&site_id=19&uid=3454'};
const liquidation={title:'內政部函：團體解散後的清算人及賸餘財產歸屬',source:'https://www.moi.gov.tw/News_Content.aspx?Create=1&n=14119&s=256754'};
const associationGuide=ref('人民團體會務輔導辦法','D0020094',27);
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>240||!/協會|社會團體/.test(t)||!/解散|清算/.test(t)||!/補助/.test(t)||!/設備|器材|購置|準備基金/.test(t)||!/繳回|歸還|返還|分給|分配|歸屬|剩餘財產|怎麼處理/.test(t)||/合作社|工會|公會|農會|漁會|財團法人|基金會|公司|國外/.test(t))return null;
 const corporate=/已(?:經)?(?:完成|辦好)?(?:法院)?(?:社團)?法人登記|已登記為(?:公益)?社團法人|是公益社團法人/.test(t)&&!/還沒|未辦|未完成/.test(t);
 const notCorp=/只立案|僅立案|還沒.{0,4}法人登記|未(?:辦|完成)?(?:法院)?法人登記/.test(t);
 const res=/準備基金/.test(t),cash=/補助.{0,8}(?:餘款|剩餘|剩下|沒花完)|(?:未用完|剩下)的補助款/.test(t);
 const estate=['一般賸餘財產要等清償後再定','若是公益社團法人，依民法第40、44條，清算了結現務、清償債務後，依法律、章程或總會決議處理，不能歸自然人或營利團體；無相應法律、章程或決議時，才依第44條第2項歸於住所所在地地方自治團體。未辦法人登記的協會，依會務輔導辦法第27條，先核對章程或大會決議，並請主管機關確認適用限制；不能只說「已解散」就把資產分給會員。'];
 const equipments=['補助買的設備，不等於還沒花完的補助款','屏東縣一般作業要點第8點要求設備補助核銷檢附納入團體財產證明；第8點之一是剩餘補助經費應繳回，不能據此推成所有已購設備一律交還縣府。請查這筆補助的核定函、計畫及契約，確認是否有使用年限、移交、報廢或返還條件；未核明前，先列冊並保留，不私分、變賣或自行移交。'];
 const steps=[equipments,...(cash?[['尚未支用的補助餘款','若適用屏東縣通案要點第8點之一，剩餘補助款應繳回；由原補助單位確認金額與方式，與設備的處置分開。']]:[]),...(res?[['先把準備基金和設備分欄對帳','第15條的準備基金及孳息原則專戶存儲，未經理事會通過不能動支；設備是財產項目，不能把設備寫成準備基金專戶內可動用的款。核對基金收支表、帳冊、補助核定與設備清冊，再由清算人分類處理。']]:[]),estate,
  ['先找對窗口查這筆核定','清算人彙整設備來源、補助機關、經費比例、設備清冊和實際狀態，向原補助單位查有無限制，再與團體主管機關核對清算財產歸屬。不要在小屏貼完整核定函或個資。']];
 return {direct:true,category:'人民團體解散｜補助設備、餘款與清算',title:'解散時，補助買的設備、補助餘款與其餘財產分開',
  summary:'先列冊保留，不能直接分給會員，也不能只因是補助買的就認定一定交回縣府。未花完的補助款另依適用規定辦理繳回；已購設備看原核定條件，清償後的其餘財產另看章程和適用法律。'+(corporate?' 已登記為公益社團法人者，清算餘財不得歸自然人或營利團體。':notCorp?' 未辦法人登記的團體，先依會務輔導辦法第27條核對章程或大會決議。':''),
  steps,refs:[county,c(40),c(44),associationGuide,liquidation,...(res?[ref('社會團體財務處理辦法','D0050097',15)]:[])],questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationDissolutionSubsidizedAssets=route;
})(typeof window!=='undefined'?window:globalThis);
