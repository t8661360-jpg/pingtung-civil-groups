(function(root){
'use strict';
const cite=(name,p,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+p+'&flno='+n});
const C=n=>cite('合作社法','D0050112',n);
const B=n=>cite('信用合作社法','G0380058',n);
const F=n=>cite('合作社財務報表及經費處理準則','D0050114',n);
function cooperativeDistribution(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(/發放日|幾月|哪天|何時|什麼時候|納稅|課稅|報稅|免稅|扣繳|股利所得|解散|清算|退社|退股|退還|退回|出社|繼承|轉讓|欠繳|登記|貸款|借款|存款利率|罰鍰|處罰|保險合作社/.test(t))return null;
 const payout=/(股息|股利|紅利|(?:結餘|盈餘).{0,22}(?:分配|分給|怎麼分|怎麼發|分嗎|按|交易額)|交易額.{0,8}分)/.test(t);
 if(!payout)return null;
 if(/信用合作社|信合社/.test(t)){
  return {direct:true,category:'信用合作社財務',title:'信用合作社的股息：先補虧損並提列法定盈餘公積，再分配社股股息',
   summary:'信用合作社先用稅後盈餘彌補累積虧損，再依《信用合作社法》第23條的順序處理：先提列法定盈餘公積（原則至少40%），再分配社股股息（當年度無盈餘不得分配），之後依法提列公益金、理監事酬勞金，最後才是社員交易分配金。第24條對符合法定條件的公積提列另有規定。實際發多少，請向該信用合作社查詢當年度的盈餘分配表。不要用一般合作社的提列順序直接套算。',
   statutes:[B(23),B(24),C('3-1')],notes:[],actions:[]};
 }
 if(/公司股票|股份有限公司|上市公司|上櫃公司/.test(t)&&!/(協會|公會|工會|合作社|社團|基金會)/.test(t)){
  return {direct:true,category:'服務範圍說明',title:'公司股票的股息：請查公司公告，不適用合作社分配規定',
   summary:'如果您問的是股份有限公司的股票配息，請查該公司公開的盈餘分配或股利公告。這和合作社的社股股息、社員結餘分配不同，本站不提供個別公司的配息金額或投資建議。',
   statutes:[],notes:[],actions:[]};
 }
 if(/公司|公會|工會|協會|社團|基金會|上市|上櫃|ETF|股票/i.test(t))return null;
 if(!/合作社/.test(t)&&!/^股息怎麼分配[?？。]*$/.test(t))return null;
 if(/^合作社股息[?？。]*$/.test(t))return null;
 if(!/(結餘|交易額|股息|股利)/.test(t))return null;
 return {direct:true,category:'合作社財務',title:'一般合作社：股息按已繳股金計算，剩餘結餘按社員交易額分配',
  summary:'如果您問的是一般合作社，股息和剩餘結餘要分開看。\n\n一、社股股息：用社員已繳股金乘以章程規定或社員大會決議的年息比例，年息不得超過百分之十（10%），不是保證每年都有；無結餘時不得發息。\n\n二、剩餘結餘：先彌補累積短絀、付息，再依法提撥公積金、公益金及相關酬勞金。最後的餘額按社員和合作社的交易額比例分配，不是按股金比例。社員大會若決議不分配，可用來增認社股或撥入公積金。\n\n想核對本人分得多少，可請合作社提供當年度結餘分配案及本人的交易額計算依據。信用合作社的盈餘分配另有規定。',
  statutes:[C(22),C(23),C(24),F(2)],notes:[],actions:[]};
}
if(typeof module!=='undefined'&&module.exports){module.exports=cooperativeDistribution;return;}
const previous=root.verifiedRoundAnswer;
root.verifiedRoundAnswer=function(q,ctx){return cooperativeDistribution(q)||previous.call(this,q,ctx);};
})(typeof window!=='undefined'?window:globalThis);
