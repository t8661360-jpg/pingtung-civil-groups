(function(root){
'use strict';
const a=n=>({title:'合作社法第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0050112&flno='+n});
const county={title:'屏東縣政府對民間團體補助經費作業要點第8點、第8點之一',source:'https://ptc.familyedu.moe.gov.tw/fileRename.aspx?fid=40994&kid=2&site_id=19&uid=3454'};
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>225||!/合作社/.test(t)||!/股息|股利|配息|發給社員|分給社員|社員分紅/.test(t)||!/補助|公益金/.test(t)||/信用合作社|信合社|股東|公司股票|協會|工會|公會|稅|所得|解散|清算|節能|退社|轉讓/.test(t))return null;
 const grants=/補助/.test(t),publicFund=/公益金/.test(t);
 const steps=[
 ...(grants?[['補助結餘先看核定用途，不當可分配盈餘','核對補助機關、核定計畫、核銷狀態及餘款。若適用屏東縣通案補助要點，第8點之一要求剩餘補助經費繳回；其他專案按原核定及主管機關規定。不能只看帳有結餘或社員大會通過，就把受用途限制的補助款拿去配息。']]:[]),
 ...(publicFund?[['公益金是指定用途，不是股息來源','第23條公益金用於社會福利、公益事業或合作事業教育訓練與宣導，不得移作他用，即使還有剩也不能用來發社員股息；不是能用一般多數決解除的限制。這與可分配的一般結餘不同。']]:[]),
 ['真正的可分配結餘另按財務表及合作社法核算','合作社法第22條：無結餘不得發社股年息，年息不得超過10%。依第23條先彌補累積短絀、付息及法定提撥，再依第24條以社員交易額比例分配其餘額；這是剩餘結餘分配，不等於社股年息。先由會計及監事核對來源分類、財報和應辦大會程序。']];
 return {direct:true,category:'合作社財務｜補助、公益金與股息',title:'補助餘款及公益金，不是發社員股息的來源',
 summary:(grants?'不能先把受用途限制的補助結餘當成可分配盈餘。':'')+(publicFund?'公益金即使有結餘，也不得挪作社員股息。':'')+'是否有可以發息的自有結餘，要另核財報。',
 steps,refs:[a(22),a(23),a(24),...(grants?[county]:[])],questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedCoopGrantAndDividend=route;
})(typeof window!=='undefined'?window:globalThis);
